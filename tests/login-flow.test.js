const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const root = path.join(__dirname, '..', 'miniprogram')
const verifiedProfile = {
  nickName: 'Test Member',
  verificationStatus: 'verified',
  verificationEmail: 'student@yorku.ca',
  verificationTicket: 'test-ticket'
}

function createHarness({ profile, verificationApi = {}, platform = 'ios', envVersion = 'release' } = {}) {
  const storage = new Map(profile ? [['yucssa.profile', profile]] : [])
  const navigation = []
  const messages = []
  const loginCodes = []
  const app = { globalData: { isLoggedIn: false, profile: null } }
  const cache = new Map()
  let lastPage
  const wx = {
    getAccountInfoSync: () => ({miniProgram:{envVersion}}),
    getDeviceInfo: () => ({platform}),
    getStorageSync: key => storage.get(key),
    setStorageSync: (key, value) => storage.set(key, value),
    removeStorageSync: key => storage.delete(key),
    reLaunch: options => navigation.push({ method: 'reLaunch', ...options }),
    redirectTo: options => navigation.push({ method: 'redirectTo', ...options }),
    showToast: options => messages.push(options.title),
    showModal: options => options.success({ confirm: true }),
    login: options => {
      const code = `test-wechat-code-${loginCodes.length + 1}`
      loginCodes.push(code)
      options.success({ code })
    }
  }
  function load(relative) {
    const filename = path.resolve(root, relative)
    if (filename === path.join(root, 'utils', 'verificationApi.js')) return verificationApi
    if (cache.has(filename)) return cache.get(filename).exports
    const module = { exports: {} }
    cache.set(filename, module)
    const context = vm.createContext({
      module,
      exports: module.exports,
      require: request => load(path.relative(root, path.resolve(path.dirname(filename), request))),
      wx,
      getApp: () => app,
      App: definition => Object.assign(app, definition),
      Page: definition => {
        lastPage = definition
        definition.setData = update => Object.assign(definition.data, update)
      }
    })
    new vm.Script(fs.readFileSync(filename, 'utf8'), { filename }).runInContext(context)
    return module.exports
  }
  return {
    app, storage, navigation, messages, loginCodes, load,
    page(name) {
      load(`pages/${name}/${name}.js`)
      return lastPage
    }
  }
}

test('Home clears cached content and opens login for missing or incomplete login data', () => {
  for (const profile of [undefined, { nickName: 'Old Demo' }, {
    ...verifiedProfile, verificationTicket: ''
  }, { ...verifiedProfile, verificationEmail: 'student@example.com' }]) {
    const h = createHarness({ profile })
    const home = h.page('home')
    home.data.profile = verifiedProfile
    home.data.categoryDockItems = [{}]
    home.onShow()
    assert.equal(home.data.profile, null)
    assert.equal(home.data.categoryDockItems.length, 0)
    assert.equal(h.app.globalData.isLoggedIn, false)
    assert.equal(h.navigation[0].method, 'reLaunch')
    assert.equal(h.navigation[0].url, '/pages/login/login')
  }
})

test('App restart and Home restore a complete verified login', () => {
  const h = createHarness({ profile: verifiedProfile })
  h.load('app.js')
  h.app.onLaunch()
  const home = h.page('home')
  home.onShow()
  assert.equal(h.app.globalData.isLoggedIn, true)
  assert.equal(home.data.profile.nickName, 'Test Member')
  assert.equal(home.data.categoryDockItems.length, 3)
  assert.equal(h.navigation.length, 0)
})

test('Login checks stored credentials instead of trusting a stale global flag', () => {
  const h = createHarness()
  h.app.globalData.isLoggedIn = true
  const login = h.page('login')
  login.onShow()
  assert.equal(h.app.globalData.isLoggedIn, false)
  assert.equal(h.navigation.length, 0)
  h.storage.set('yucssa.profile', verifiedProfile)
  login.onShow()
  assert.equal(h.navigation[0].url, '/pages/home/home')
})

test('Incomplete verification cannot save a login or open Home', async () => {
  const h = createHarness()
  const login = h.page('login')
  login.completeLogin()
  await login.submitLogin()
  assert.equal(h.storage.has('yucssa.profile'), false)
  assert.equal(h.navigation.length, 0)
  assert.throws(() => h.load('utils/memberStore.js').loginWithProfile({nickName: 'Guest'}), /York/)
})

test('Sending a code followed by one login action saves the member and opens Home', async () => {
  const calls = []
  const h = createHarness({ verificationApi: {
    sendVerificationCode: async (email, code) => calls.push({ email, code }),
    verifyVerificationCode: async (email, code, wechatCode) => {
      assert.equal(code, '123456')
      assert.equal(wechatCode, 'test-wechat-code-2')
      return { email, verificationTicket: 'test-ticket' }
    }
  } })
  const login = h.page('login')
  login.handleVerificationEmailInput({detail: {value: 'Student@YorkU.ca'}})
  await login.sendVerificationCode()
  assert.equal(calls[0].email, 'student@yorku.ca')
  assert.equal(calls[0].code, 'test-wechat-code-1')
  assert.equal(h.navigation.length, 0)
  login.handleVerificationCodeInput({detail: {value: '123456'}})
  await login.submitLogin()
  assert.equal(h.loginCodes.length, 2)
  assert.equal(h.storage.get('yucssa.profile').verificationEmail, 'student@yorku.ca')
  assert.equal(h.app.globalData.isLoggedIn, true)
  assert.equal(h.navigation.length, 1)
  assert.equal(h.navigation[0].method, 'reLaunch')
  assert.equal(h.navigation[0].url, '/pages/home/home')
})

test('Rejected codes, missing tickets and mismatched emails leave the user on login', async () => {
  for (const verify of [
    async () => { throw new Error('验证码不正确') },
    async () => ({ email: 'student@yorku.ca' }),
    async () => ({ email: 'other@yorku.ca', verificationTicket: 'test-ticket' })
  ]) {
    const h = createHarness({verificationApi: {verifyVerificationCode: verify}})
    const login = h.page('login')
    Object.assign(login.data, {verificationStatus:'pending', verifiedEmail:'student@yorku.ca',verificationCodeInput:'123456'})
    await login.submitLogin()
    assert.equal(h.storage.has('yucssa.profile'), false)
    assert.equal(h.navigation.length, 0)
    assert.equal(login.data.isVerifyingCode, false)
  }
})

test('Concurrent send requests and email edits cannot replace the pending verification', async () => {
  let finishSend
  let count = 0
  const h = createHarness({verificationApi: {
    sendVerificationCode: () => {count += 1; return new Promise(resolve => {finishSend=resolve})}
  }})
  const login = h.page('login')
  login.handleVerificationEmailInput({detail:{value:'student@yorku.ca'}})
  const sending = login.sendVerificationCode()
  await Promise.resolve()
  await login.sendVerificationCode()
  login.handleVerificationEmailInput({detail:{value:'other@yorku.ca'}})
  assert.equal(count, 1)
  assert.equal(login.data.verificationEmailInput, 'student@yorku.ca')
  finishSend()
  await sending
  assert.equal(login.data.verifiedEmail, 'student@yorku.ca')
})

test('Logout clears login and resets navigation to login; Home remains inaccessible', () => {
  const h = createHarness({profile:verifiedProfile})
  h.app.globalData.isLoggedIn = true
  const profile = h.page('profile')
  profile.onShow()
  profile.logout()
  assert.equal(h.storage.has('yucssa.profile'), false)
  assert.equal(profile.data.profile, null)
  assert.equal(h.navigation[0].method, 'reLaunch')
  assert.equal(h.navigation[0].url, '/pages/login/login')
  const home = h.page('home')
  home.onShow()
  assert.equal(home.data.profile, null)
  assert.equal(h.navigation.at(-1).url, '/pages/login/login')
})

test('Developer preview opens Home without contacting WeChat or email and remains unverified', () => {
  const h = createHarness({platform:'devtools',envVersion:'develop'})
  const login = h.page('login')
  assert.equal(login.data.canPreview, true)
  login.handlePreviewLogin()
  const profile = h.storage.get('yucssa.profile')
  assert.equal(profile.verificationStatus, 'preview')
  assert.equal(profile.verificationEmail, '')
  assert.equal(profile.verificationTicket, '')
  assert.equal(profile.memberCode, 'PREVIEW')
  assert.equal(h.load('utils/memberStore.js').isVerifiedProfile(profile), false)
  assert.equal(h.loginCodes.length, 0)
  assert.equal(h.navigation[0].url, '/pages/home/home')
  const home = h.page('home')
  home.onShow()
  assert.equal(home.data.profile.verificationStatus, 'preview')
  const member = h.page('profile')
  member.onShow()
  assert.equal(member.data.verificationBadgeText, '体验中')
  assert.equal(member.data.verificationTitle, '尚未验证 York 邮箱')
})

test('Preview entry and stored preview profiles cannot bypass login on devices, trial or release', () => {
  for(const [platform,envVersion] of [['ios','develop'],['android','develop'],['devtools','trial'],['devtools','release']]) {
    const h = createHarness({platform,envVersion,profile:{verificationStatus:'preview',memberCode:'PREVIEW'}})
    const login = h.page('login')
    assert.equal(login.data.canPreview, false)
    assert.throws(() => h.load('utils/memberStore.js').loginForDevelopment(), /开发者工具/)
    const home = h.page('home')
    home.onShow()
    assert.equal(home.data.profile, null)
    assert.equal(h.navigation.at(-1).url, '/pages/login/login')
  }
})

test('Preview login can be restored in the simulator and logout returns to login', () => {
  const h = createHarness({platform:'devtools',envVersion:'develop'})
  h.page('login').handlePreviewLogin()
  h.load('app.js')
  h.app.onLaunch()
  assert.equal(h.app.globalData.isLoggedIn, true)
  const member = h.page('profile')
  member.onShow()
  member.logout()
  assert.equal(h.storage.has('yucssa.profile'), false)
  assert.equal(h.navigation.at(-1).url, '/pages/login/login')
})

test('Completing real email verification replaces the preview member code and credentials', () => {
  const h = createHarness({platform:'devtools',envVersion:'develop'})
  const store = h.load('utils/memberStore.js')
  store.loginForDevelopment()
  const profile = store.loginWithProfile({nickName:'Test Member'}, verifiedProfile)
  assert.equal(profile.verificationStatus, 'verified')
  assert.match(profile.memberCode, /^YU-/)
  assert.equal(profile.verificationEmail, 'student@yorku.ca')
  assert.equal(profile.verificationTicket, 'test-ticket')
})
