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
  const titles = []
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
    setNavigationBarTitle: ({ title }) => titles.push(title),
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
    app, storage, navigation, titles, messages, loginCodes, load,
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
  assert.equal(member.data.verificationTitle, '尚未验证约克大学邮箱')
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

test('Language switches persist, refresh returning pages and do not rewrite member identity', () => {
  const h = createHarness({ profile: { ...verifiedProfile, nickName: 'Campus Guest', memberCode: 'YU-123456' } })
  const i18n = h.load('utils/i18n.js')
  const home = h.page('home')
  home.onShow()
  assert.equal(home.data.language, 'zh')
  assert.equal(home.data.ui.common.home, '首页')
  const storedBefore = JSON.stringify(h.storage.get('yucssa.profile'))
  home.toggleLanguage()
  assert.equal(h.storage.get(i18n.LANGUAGE_KEY), 'en')
  assert.equal(home.data.ui.common.home, 'Home')
  assert.equal(h.titles.at(-1), 'Home')
  assert.equal(home.data.categoryDockItems[0].label, 'Dining')
  assert.equal(home.data.events[0].title, 'Spring Mixer')
  assert.equal(home.data.featuredMerchants[1].offerTitle, '15% off')
  assert.equal(home.data.profile.memberCode, 'YU-123456')
  assert.equal(JSON.stringify(h.storage.get('yucssa.profile')), storedBefore)
  const contact = h.page('contact')
  contact.onShow()
  assert.equal(contact.data.language, 'en')
  assert.equal(contact.data.joinOpportunities[0].title, 'Media & Design')
  contact.toggleLanguage()
  home.onShow()
  assert.equal(home.data.language, 'zh')
  assert.equal(home.data.events[0].title, '春季联谊夜')
  assert.equal(home.data.featuredMerchants[1].offerTitle, '85 折')
})

test('Switching during pending email verification retains input and localizes hints and failures', async () => {
  const h = createHarness({ verificationApi: {
    verifyVerificationCode: async () => { throw new Error('验证码不正确') }
  } })
  const login = h.page('login')
  Object.assign(login.data, { verificationEmailInput: 'student@yorku.ca', verifiedEmail: 'student@yorku.ca', verificationCodeInput: '123456', verificationStatus: 'pending' })
  login.toggleLanguage()
  assert.equal(login.data.verificationEmailInput, 'student@yorku.ca')
  assert.equal(login.data.verificationCodeInput, '123456')
  assert.equal(login.data.verificationStatus, 'pending')
  assert.match(login.data.verificationHint, /A code was sent to student@yorku.ca/)
  assert.equal(h.loginCodes.length, 0)
  await login.submitLogin()
  assert.equal(h.messages.at(-1), 'Incorrect verification code')
  assert.equal(h.storage.has('yucssa.profile'), false)
  login.toggleLanguage()
  assert.match(login.data.verificationHint, /验证码已发送到 student@yorku.ca/)
  assert.equal(login.data.verificationCodeInput, '123456')
})

test('Category selection and merchant identity survive language changes', () => {
  const h = createHarness()
  const directory = h.page('merchantList')
  directory.onLoad({ categoryId: 'auto' })
  assert.equal(directory.data.sections[0].id, 'auto')
  directory.toggleLanguage()
  assert.equal(directory.data.selectedCategoryId, 'auto')
  assert.equal(directory.data.pageTitle, 'Auto services')
  assert.equal(h.titles.at(-1), 'Auto services')
  assert.equal(directory.data.sections.length, 1)
  assert.equal(directory.data.sections[0].merchants[0].id, '006')
  const detail = h.page('merchantDetail')
  detail.onLoad({ id: '002' })
  assert.equal(detail.data.merchant.name, 'Goubuli')
  assert.equal(detail.data.merchant.offerTitle, '15% off')
  detail.toggleLanguage()
  assert.equal(detail.data.merchant.id, '002')
  assert.equal(detail.data.merchant.name, '狗不理')
  assert.equal(detail.data.merchant.offerTitle, '85 折')
  assert.equal(h.titles.at(-1), '狗不理')
  directory.onShow()
  assert.equal(directory.data.pageTitle, '汽车服务')
})

test('Both languages cover all interface keys and English content has no Chinese copy', () => {
  const h = createHarness()
  const i18n = h.load('utils/i18n.js')
  function keys(object, prefix = '') {
    return Object.entries(object).flatMap(([key, value]) => typeof value === 'string' ? [prefix + key] : keys(value, prefix + key + '.')).sort()
  }
  assert.deepEqual(keys(i18n.getMessages('zh')), keys(i18n.getMessages('en')))
  for (const key of keys(i18n.getMessages('en'))) {
    const value = i18n.t(key, { email: 'student@yorku.ca' }, 'en')
    assert.ok(value.length > 0, key)
    assert.doesNotMatch(value, /[\u4e00-\u9fff]/, key)
  }
  for (const page of ['home', 'login', 'merchantList', 'merchantDetail', 'services', 'contact', 'profile']) {
    const wxml = fs.readFileSync(path.join(root, `pages/${page}/${page}.wxml`), 'utf8')
    for (const match of wxml.matchAll(/ui\.([a-zA-Z]+\.[a-zA-Z0-9]+)/g)) {
      assert.doesNotThrow(() => i18n.t(match[1], {}, 'zh'))
      assert.doesNotThrow(() => i18n.t(match[1], {}, 'en'))
    }
    assert.match(wxml, /bindtap="toggleLanguage"/)
  }
  const data = h.load('data/localizedData.js').getLocalizedData('en')
  for (const field of ['events', 'announcements', 'serviceCards', 'supportChannels', 'joinOpportunities']) {
    for (const record of data[field]) for (const [key, value] of Object.entries(record)) {
      if (typeof value === 'string') assert.doesNotMatch(value, /[\u4e00-\u9fff]/, `${field}.${record.id}.${key}`)
    }
  }
  for (const merchant of data.merchants) {
    assert.doesNotMatch(merchant.offerTitle + merchant.offerDetails + merchant.name, /[\u4e00-\u9fff]/)
  }
})

test('Default profile copy is translated while custom names and credentials are preserved', () => {
  const h = createHarness()
  const i18n = h.load('utils/i18n.js')
  const profile = { ...verifiedProfile, nickName: '张同学', memberCode: 'YU-123456', faculty: 'York University' }
  const display = i18n.localizeProfile(profile, 'en')
  assert.equal(display.nickName, '张同学')
  assert.equal(display.verificationTicket, profile.verificationTicket)
  assert.equal(display.memberCode, profile.memberCode)
  assert.equal(i18n.localizeProfile({ nickName: '体验同学' }, 'en').nickName, 'Preview Student')
  assert.equal(i18n.localizeProfile({ nickName: '校园访客' }, 'en').nickName, 'Campus Guest')
  i18n.setLanguage('en')
  assert.equal(i18n.translateError(new Error('该 York 邮箱已绑定其他微信账号')), 'This email is bound to another WeChat account')
  assert.equal(i18n.translateError(new Error('未预料到的后台错误')), 'Verification service unavailable. Try again later.')
  i18n.setLanguage('unsupported')
  assert.equal(i18n.getLanguage(), 'zh')
})
