const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const os = require('node:os')
const path = require('node:path')
const { once } = require('node:events')
const { createVerificationServer } = require('../server/index.js')

async function startService(t, options = {}) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'yucssa-binding-test-'))
  const storePath = path.join(directory, 'store.json')
  const sent = []
  const serverOptions = {
    storePath,
    exchangeWechatCode: async code => `openid-${code.split(':')[0]}`,
    sendEmail: async (email, code) => {
      await options.sendEmail?.(email, code)
      sent.push({ email, code })
    }
  }
  let server
  let baseUrl
  async function start() {
    server = createVerificationServer(serverOptions)
    server.listen(0, '127.0.0.1')
    await once(server, 'listening')
    baseUrl = `http://127.0.0.1:${server.address().port}`
  }
  async function stop() {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  }
  await start()
  t.after(async () => {
    await stop()
    await fs.rm(directory, { recursive: true, force: true })
  })
  async function request(action, data) {
    const response = await fetch(`${baseUrl}/api/verification/email/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return { status: response.status, body: await response.json() }
  }
  return {
    sent,
    request,
    send: (email, account) => request('send', { email, wechatLoginCode: `${account}:send` }),
    verify: (email, account, code = sent.findLast(item => item.email === email.toLowerCase())?.code) =>
      request('verify', { email, code, wechatLoginCode: `${account}:verify` }),
    readStore: async () => JSON.parse(await fs.readFile(storePath, 'utf8')),
    writeStore: store => fs.writeFile(storePath, JSON.stringify(store)),
    restart: async () => { await stop(); await start() }
  }
}

test('A verified email cannot be claimed by a second WeChat account, including case variants', async t => {
  const h = await startService(t)
  assert.equal((await h.send('Student@YorkU.ca', 'a')).status, 200)
  const code = h.sent[0].code
  assert.equal((await h.verify('student@yorku.ca', 'a', code)).status, 200)
  const rejected = await h.send('STUDENT@YORKU.CA', 'b')
  assert.equal(rejected.status, 409)
  assert.match(rejected.body.message, /已绑定其他微信/)
  assert.equal((await h.verify('student@yorku.ca', 'b', code)).status, 409)
  assert.equal(h.sent.length, 1)
  const store = await h.readStore()
  assert.equal(store.bindingsByEmail['student@yorku.ca'].openid, 'openid-a')
  assert.equal(store.bindingsByOpenId['openid-b'], undefined)
})

test('Knowing the email code does not let a different WeChat account finish verification', async t => {
  const h = await startService(t)
  await h.send('student@yorku.ca', 'a')
  assert.equal((await h.verify('student@yorku.ca', 'b')).status, 403)
  assert.equal((await h.readStore()).emails['student@yorku.ca'].attempts, 0)
  assert.equal((await h.verify('student@yorku.ca', 'a')).status, 200)
})

test('Both API steps require WeChat identity and never accept only an email and code', async t => {
  const h = await startService(t)
  assert.equal((await h.request('send', { email: 'student@yorku.ca' })).status, 400)
  assert.equal((await h.request('verify', { email: 'student@yorku.ca', code: '123456' })).status, 400)
  assert.equal(h.sent.length, 0)
})

test('Verification rechecks an email binding created after its code was sent', async t => {
  const h = await startService(t)
  await h.send('student@yorku.ca', 'a')
  const store = await h.readStore()
  store.bindingsByEmail['student@yorku.ca'] = { openid: 'openid-b', verifiedAt: Date.now() }
  store.bindingsByOpenId['openid-b'] = { email: 'student@yorku.ca', verifiedAt: Date.now() }
  await h.writeStore(store)
  assert.equal((await h.verify('student@yorku.ca', 'a')).status, 409)
  assert.equal((await h.readStore()).bindingsByEmail['student@yorku.ca'].openid, 'openid-b')
})

test('Simultaneous requests for one email cannot send two codes or overwrite a completed binding', async t => {
  const h = await startService(t)
  const sends = await Promise.all([h.send('student@yorku.ca', 'a'), h.send('student@yorku.ca', 'b')])
  assert.equal(sends.filter(result => result.status === 200).length, 1)
  assert.equal(sends.filter(result => result.status === 429).length, 1)
  assert.equal(h.sent.length, 1)
  const pending = await h.readStore()
  const owner = pending.emails['student@yorku.ca'].openid.slice('openid-'.length)
  const other = owner === 'a' ? 'b' : 'a'
  const verifications = await Promise.all([h.verify('student@yorku.ca', owner), h.verify('student@yorku.ca', other)])
  assert.equal(verifications[0].status, 200)
  assert.ok([403, 409].includes(verifications[1].status))
  const store = await h.readStore()
  assert.equal(store.bindingsByEmail['student@yorku.ca'].openid, `openid-${owner}`)
  assert.equal(Object.keys(store.bindingsByOpenId).length, 1)
})

test('Concurrent verification of different emails keeps both accounts in the store', async t => {
  const h = await startService(t)
  await Promise.all([h.send('first@yorku.ca', 'a'), h.send('second@yorku.ca', 'b')])
  const results = await Promise.all([h.verify('first@yorku.ca', 'a'), h.verify('second@yorku.ca', 'b')])
  assert.ok(results.every(result => result.status === 200))
  const store = await h.readStore()
  assert.equal(store.bindingsByEmail['first@yorku.ca'].openid, 'openid-a')
  assert.equal(store.bindingsByEmail['second@yorku.ca'].openid, 'openid-b')
})

test('Bindings survive a server restart and the original account can log in again', async t => {
  const h = await startService(t)
  await h.send('student@yorku.ca', 'a')
  await h.verify('student@yorku.ca', 'a')
  await h.restart()
  assert.equal((await h.send('student@yorku.ca', 'b')).status, 409)
  assert.equal((await h.send('student@yorku.ca', 'a')).status, 200)
  assert.equal((await h.verify('student@yorku.ca', 'a')).status, 200)
})

test('An account may change its verified email without keeping two active email bindings', async t => {
  const h = await startService(t)
  await h.send('first@yorku.ca', 'a')
  await h.verify('first@yorku.ca', 'a')
  await h.send('second@yorku.ca', 'a')
  const verified = await h.verify('second@yorku.ca', 'a')
  assert.equal(verified.status, 200)
  assert.equal(verified.body.rebindFromEmail, 'first@yorku.ca')
  const store = await h.readStore()
  assert.equal(store.bindingsByEmail['first@yorku.ca'], undefined)
  assert.equal(store.bindingsByEmail['second@yorku.ca'].openid, 'openid-a')
  assert.equal(store.bindingsByOpenId['openid-a'].email, 'second@yorku.ca')
})

test('A failed email send releases the store queue for subsequent requests', async t => {
  let attempts = 0
  const h = await startService(t, {sendEmail: async () => {
    attempts += 1
    if (attempts === 1) throw new Error('Simulated mail failure')
  }})
  assert.equal((await h.send('student@yorku.ca', 'a')).status, 500)
  assert.equal((await h.send('student@yorku.ca', 'a')).status, 200)
  assert.equal((await h.verify('student@yorku.ca', 'a')).status, 200)
})
