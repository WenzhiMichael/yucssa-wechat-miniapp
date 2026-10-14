const http = require('node:http')
const crypto = require('node:crypto')
const syncFs = require('node:fs')
const fs = require('node:fs/promises')
const path = require('node:path')
const projectConfig = require('../project.config.json')

if (require.main === module) {
  loadEnvFile(path.join(__dirname, '..', '.env'))
}

const PORT = Number(process.env.PORT || 8787)
const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const EMAIL_FROM = process.env.EMAIL_FROM || ''
const WECHAT_APP_ID = process.env.WECHAT_APP_ID || projectConfig.appid || ''
const WECHAT_APP_SECRET = process.env.WECHAT_APP_SECRET || ''
const STORE_PATH = path.join(__dirname, '.verification-store.json')
const CODE_TTL_MS = 10 * 60 * 1000
const RESEND_COOLDOWN_MS = 60 * 1000
const MAX_ATTEMPTS = 5

function loadEnvFile(envPath) {
  try {
    const raw = syncFs.readFileSync(envPath, 'utf8')
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim()

      if (!trimmed || trimmed.startsWith('#')) {
        return
      }

      const separatorIndex = trimmed.indexOf('=')

      if (separatorIndex === -1) {
        return
      }

      const key = trimmed.slice(0, separatorIndex).trim()
      const value = trimmed.slice(separatorIndex + 1).trim()

      if (key && !process.env[key]) {
        process.env[key] = value
      }
    })
  } catch (error) {
    if (!error || error.code !== 'ENOENT') {
      throw error
    }
  }
}

function isYorkEmail(email) {
  return /@(my\.)?yorku\.ca$/i.test(String(email || '').trim())
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function createCode() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function hashCode(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex')
}

function createTicket(email) {
  return crypto
    .createHash('sha256')
    .update(`${email}:${Date.now()}:${crypto.randomUUID()}`)
    .digest('hex')
}

function createVerificationServer(options = {}) {
  const storePath = options.storePath || STORE_PATH
  const exchangeWechatCode = options.exchangeWechatCode || exchangeCodeForOpenId
  const sendEmail = options.sendEmail || sendEmailWithResend
  let storeQueue = Promise.resolve()

  function withStoreLock(operation) {
    const result = storeQueue.then(operation)
    storeQueue = result.catch(() => {})
    return result
  }

  async function readStore() {
    try {
      const raw = await fs.readFile(storePath, 'utf8')
      const parsed = JSON.parse(raw)
      return normalizeStore(parsed)
    } catch (error) {
      if (error && error.code === 'ENOENT') {
        return normalizeStore({})
      }

      throw error
    }
  }

  async function writeStore(store) {
    const temporaryPath = `${storePath}.${crypto.randomUUID()}.tmp`
    try {
      await fs.writeFile(temporaryPath, JSON.stringify(store, null, 2), { encoding: 'utf8', mode: 0o600 })
      await fs.rename(temporaryPath, storePath)
    } finally {
      await fs.unlink(temporaryPath).catch((error) => {
        if (error.code !== 'ENOENT') throw error
      })
    }
  }

  function normalizeStore(store) {
    const source = store && typeof store === 'object' ? store : {}

    return {
      emails: source.emails && typeof source.emails === 'object' ? source.emails : {},
      bindingsByOpenId:
        source.bindingsByOpenId && typeof source.bindingsByOpenId === 'object'
          ? source.bindingsByOpenId
          : {},
      bindingsByEmail:
        source.bindingsByEmail && typeof source.bindingsByEmail === 'object'
          ? source.bindingsByEmail
          : {}
    }
  }

  function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS, GET'
    })
    res.end(JSON.stringify(payload))
  }

  function readJsonBody(req) {
    return new Promise((resolve, reject) => {
      const chunks = []

      req.on('data', (chunk) => {
        chunks.push(chunk)
      })

      req.on('end', () => {
        try {
          const raw = Buffer.concat(chunks).toString('utf8')
          resolve(raw ? JSON.parse(raw) : {})
        } catch (error) {
          reject(new Error('请求体不是合法 JSON'))
        }
      })

      req.on('error', reject)
    })
  }

  async function sendEmailWithResend(email, code) {
    if (!RESEND_API_KEY || !EMAIL_FROM) {
      throw new Error('RESEND_API_KEY 或 EMAIL_FROM 未配置')
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [email],
        subject: 'Your YUCSSA verification code',
        html: `<p>Your YUCSSA verification code is <strong>${code}</strong>.</p><p>This code expires in 10 minutes.</p>`,
        text: `Your YUCSSA verification code is ${code}. This code expires in 10 minutes.`
      })
    })

    if (!response.ok) {
      let message = '邮件服务发送失败'

      try {
        const payload = await response.json()
        if (payload && payload.message) {
          message = payload.message
        }
      } catch (error) {
        // ignore parse failure and keep fallback message
      }

      throw new Error(message)
    }

    return response.json()
  }

  async function exchangeCodeForOpenId(wechatLoginCode) {
    if (!WECHAT_APP_ID || !WECHAT_APP_SECRET) {
      throw new Error('WECHAT_APP_ID 或 WECHAT_APP_SECRET 未配置')
    }

    if (!wechatLoginCode) {
      throw new Error('缺少微信登录 code')
    }

    const url = new URL('https://api.weixin.qq.com/sns/jscode2session')
    url.searchParams.set('appid', WECHAT_APP_ID)
    url.searchParams.set('secret', WECHAT_APP_SECRET)
    url.searchParams.set('js_code', String(wechatLoginCode))
    url.searchParams.set('grant_type', 'authorization_code')

    const response = await fetch(url)
    const payload = await response.json()

    if (!response.ok) {
      throw new Error('微信登录服务请求失败')
    }

    if (payload.errcode) {
      throw new Error(payload.errmsg || '微信登录校验失败')
    }

    if (!payload.openid) {
      throw new Error('未获取到微信 OpenID')
    }

    return payload.openid
  }

  async function handleSendCode(req, res) {
    const body = await readJsonBody(req)
    const email = normalizeEmail(body.email)
    const wechatLoginCode = String(body.wechatLoginCode || '').trim()

    if (!isYorkEmail(email)) {
      sendJson(res, 400, {
        ok: false,
        message: '请输入有效的 York 邮箱'
      })
      return
    }

    if (!wechatLoginCode) {
      sendJson(res, 400, { ok: false, message: '请重新发起微信登录' })
      return
    }

    const openid = await exchangeWechatCode(wechatLoginCode)
    return withStoreLock(async () => {
      const store = await readStore()
      const existingOpenIdBinding = store.bindingsByOpenId[openid]
      const existingEmailBinding = store.bindingsByEmail[email]
      const rebindFromEmail =
        existingOpenIdBinding && existingOpenIdBinding.email !== email
          ? existingOpenIdBinding.email
          : ''

      if (existingEmailBinding && existingEmailBinding.openid !== openid) {
        sendJson(res, 409, {
          ok: false,
          message: '该 York 邮箱已绑定其他微信账号'
        })
        return
      }

      const existing = store.emails[email]
      const now = Date.now()

      if (existing && existing.lastSentAt && now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
        sendJson(res, 429, {
          ok: false,
          message: '发送过于频繁，请稍后再试'
        })
        return
      }

      const code = createCode()

      await sendEmail(email, code)

      store.emails[email] = {
        openid,
        rebindFromEmail,
        codeHash: hashCode(code),
        expiresAt: now + CODE_TTL_MS,
        lastSentAt: now,
        attempts: 0
      }
      await writeStore(store)

      sendJson(res, 200, {
        ok: true,
        email,
        rebindFromEmail,
        expiresInSeconds: CODE_TTL_MS / 1000
      })
    })
  }

  async function handleVerifyCode(req, res) {
    const body = await readJsonBody(req)
    const email = normalizeEmail(body.email)
    const code = String(body.code || '').trim()
    const wechatLoginCode = String(body.wechatLoginCode || '').trim()

    if (!isYorkEmail(email)) {
      sendJson(res, 400, {
        ok: false,
        message: '请输入有效的 York 邮箱'
      })
      return
    }

    if (!/^\d{6}$/.test(code)) {
      sendJson(res, 400, {
        ok: false,
        message: '请输入 6 位验证码'
      })
      return
    }

    if (!wechatLoginCode) {
      sendJson(res, 400, { ok: false, message: '请重新发起微信登录' })
      return
    }

    const openid = await exchangeWechatCode(wechatLoginCode)
    return withStoreLock(async () => {
      const store = await readStore()
      const emailBinding = store.bindingsByEmail[email]

      if (emailBinding && emailBinding.openid !== openid) {
        sendJson(res, 409, { ok: false, message: '该 York 邮箱已绑定其他微信账号' })
        return
      }

      const existing = store.emails[email]
      const now = Date.now()

      if (!existing || !existing.codeHash) {
        sendJson(res, 400, {
          ok: false,
          message: '请先发送验证码'
        })
        return
      }

      if (existing.openid !== openid) {
        sendJson(res, 403, { ok: false, message: '请使用获取验证码时的微信账号完成验证' })
        return
      }

      if (existing.expiresAt < now) {
        delete store.emails[email]
        await writeStore(store)
        sendJson(res, 400, {
          ok: false,
          message: '验证码已过期，请重新发送'
        })
        return
      }

      existing.attempts = Number(existing.attempts || 0) + 1

      if (existing.attempts > MAX_ATTEMPTS) {
        delete store.emails[email]
        await writeStore(store)
        sendJson(res, 429, {
          ok: false,
          message: '尝试次数过多，请重新发送验证码'
        })
        return
      }

      if (existing.codeHash !== hashCode(code)) {
        store.emails[email] = existing
        await writeStore(store)
        sendJson(res, 400, {
          ok: false,
          message: '验证码不正确'
        })
        return
      }

      const verificationTicket = createTicket(email)
      const verifiedAt = now
      const previousBinding = store.bindingsByOpenId[openid]
      const rebindFromEmail = previousBinding && previousBinding.email !== email
        ? previousBinding.email
        : ''

      if (previousBinding && previousBinding.email && previousBinding.email !== email) {
        delete store.bindingsByEmail[previousBinding.email]
      }

      store.bindingsByOpenId[openid] = {
        email,
        verifiedAt
      }
      store.bindingsByEmail[email] = {
        openid,
        verifiedAt
      }
      store.emails[email] = {
        openid,
        verifiedAt,
        verificationTicket
      }
      await writeStore(store)

      sendJson(res, 200, {
        ok: true,
        email,
        rebindFromEmail,
        verificationTicket
      })
    })
  }

  const server = http.createServer(async (req, res) => {
    try {
      if (req.method === 'OPTIONS') {
        sendJson(res, 204, {})
        return
      }

      if (req.method === 'GET' && req.url === '/health') {
        sendJson(res, 200, {
          ok: true,
          resendConfigured: Boolean(RESEND_API_KEY && EMAIL_FROM),
          wechatConfigured: Boolean(WECHAT_APP_ID && WECHAT_APP_SECRET)
        })
        return
      }

      if (req.method === 'POST' && req.url === '/api/verification/email/send') {
        await handleSendCode(req, res)
        return
      }

      if (req.method === 'POST' && req.url === '/api/verification/email/verify') {
        await handleVerifyCode(req, res)
        return
      }

      sendJson(res, 404, {
        ok: false,
        message: '接口不存在'
      })
    } catch (error) {
      sendJson(res, 500, {
        ok: false,
        message: error && error.message ? error.message : '服务内部错误'
      })
    }
  })

  return server
}

module.exports = { createVerificationServer }

if (require.main === module) {
  const server = createVerificationServer()
  server.listen(PORT, () => {
    console.log(`Verification server listening on http://127.0.0.1:${PORT}`)
  })
}
