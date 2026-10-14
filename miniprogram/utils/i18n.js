const LANGUAGE_KEY = 'yucssa.language'
const messages = {
  zh: {
    common: { switchLanguage: '切换到英语', language: '语言', copy: '复制', home: '首页', benefits: '福利', events: '活动', profile: '我的', all: '全部', cancel: '取消', confirm: '确定', pending: '待补充' },
    nav: { home: '首页', login: '登录', merchantList: '商家福利', merchantDetail: '优惠详情', services: '校园活动', contact: '联系学联', profile: '我的' },
    home: { eyebrow: '约克大学 · 中国学联', greeting: '你好，', openProfile: '打开个人页', association: '约克大学中国学生学者联谊会', previewCard: '体验卡', verifiedMember: '已验证会员', caption: '你的校园，你的伙伴', title: '你的校园，更多可能。', previewCode: '预览示例 · 不可核销优惠', memberCode: '会员码 · 消费时向商家出示', copyCode: '复制会员码', wallet: '添加至 Apple Wallet', comingSoon: '即将支持', benefits: '学生福利', allMerchants: '全部商家', events: '校园活动', schedule: '查看日程', eventCopy: '一起见面，让校园生活更有意思。', community: '在约克，我们一起。', communityCopy: '联系学联 · 加入团队 · 商家合作', footer: 'YUCSSA · 连接校园生活' },
    login: { brand: 'YUCSSA 校园生活', titleLine1: '你的校园生活，', titleLine2: '从这里开始。', intro: '登录后查看会员身份、学生福利和校园活动。', identity: '会员身份', benefits: '商户福利', events: '校园活动', title: '登录 YUCSSA', copy: '使用约克大学邮箱验证身份后进入首页。', email: '约克大学邮箱', emailPlaceholder: '你的邮箱 @yorku.ca', emailHelp: '支持 @yorku.ca 和 @my.yorku.ca', code: '邮箱验证码', codePlaceholder: '6 位验证码', resend: '重新发送', send: '获取验证码', signingIn: '正在登录', signIn: '登录并进入首页', profileSelected: '已使用微信昵称：', useProfile: '使用微信昵称（可选）', profileNote: '微信昵称用于会员展示，仍需完成邮箱验证。', preview: '先体验一下', previewNote: '体验模式不会发送邮件，也不会验证或绑定学生身份。', footer: '约克大学中国学生学者联谊会', initialHint: '登录后即可查看首页、会员身份和学生福利。', pendingHint: '验证码已发送到 {email}，请检查邮箱并输入 6 位验证码。', successHint: '验证成功，正在进入首页。' },
    merchants: { eyebrow: '会员专属福利', title: '校园之外，也有福利。', copy: '发现合作商家，带上你的 YUCSSA 会员卡。', count: '家合作商户', viewOffer: '查看福利', emptyTitle: '暂时没有合作商户', emptyCopy: '新的合作福利即将到来，先看看其他分类吧。' },
    detail: { copyOffer: '复制优惠', map: '打开地图', offer: 'YUCSSA · 会员专属福利', address: '地址', phone: '电话', actions: '操作', copyAddress: '复制地址', steps: '领取方式', features: '商家特色', related: '同类推荐' },
    services: { kicker: '校园与伙伴', title: '校园生活，一起参与。', copy: '认识新朋友，参加感兴趣的活动，找到需要的学生支持。', schedule: '活动排期', notices: '重点公告', support: '学生支持', benefits: '去看福利', contact: '联系学生会' },
    contact: { kicker: '联系 YUCSSA', title: '在约克，找到你的伙伴。', copy: '无论是校园生活的疑问、合作想法，还是加入团队的热情，我们都期待听到你的声音。', contact: '联系我们', join: '加入我们', joinCopy: '让你的创意与热情，成为校园生活的一部分。联系学生会了解招新。', updates: '关注学联动态', updatesCopy: '活动消息、招新资讯和学生福利，在这里与你保持联系。', official: 'YUCSSA 公众号', officialCopy: '关注入口准备中，可通过上方联系方式找到我们。' },
    profile: { organization: '组织', code: '会员码', copyCode: '复制会员码', verification: '约克大学邮箱验证', contact: '联系学生会', logout: '退出登录', previewBadge: '体验中', previewTitle: '尚未验证约克大学邮箱', previewCopy: '当前只用于查看页面，不会发送邮件或建立微信绑定。', verifiedBadge: '已验证', verifiedTitle: '约克大学邮箱已通过验证', verifiedCopy: '已验证邮箱：{email}', unverified: '未验证', logoutTitle: '退出登录？', logoutPreview: '退出后返回登录页，可以重新进入体验模式。', logoutVerified: '退出后需要重新验证约克大学邮箱才能查看首页。', memberName: '学联成员', guestName: '校园访客', previewName: '体验同学', membership: '已验证会员', previewMembership: '体验预览', previewJoined: '界面体验', joined: '2026 年春季', faculty: '约克大学', bio: '校园活动、学生福利和实用支持，都在这里。', previewBio: '当前为体验模式，可查看页面与操作，尚未验证约克大学邮箱。' },
    message: { copied: '已复制', memberCopied: '会员码已复制', contactCopied: '联系方式已复制', offerCopied: '优惠说明已复制', addressCopied: '地址已复制', wallet: 'Apple Wallet 即将支持', merchantMissing: '商家不存在', phoneMissing: '电话待补充', mapMissing: '地图坐标待补充', loginCodeMissing: '未获取到微信登录凭证', wechatFailed: '微信登录校验失败', profileUnsupported: '当前环境不支持头像昵称授权', profilePurpose: '用于展示会员昵称和头像', profileSuccess: '已获取头像昵称', profileFailed: '未获取到头像昵称', yorkEmail: '请输入约克大学邮箱', codeSent: '验证码已发送', sendFailed: '验证码发送失败', sendFirst: '请先获取邮箱验证码', codeLength: '请输入 6 位验证码', incomplete: '登录验证未完成，请重新获取验证码', verifyFailed: '验证失败', verifyFirst: '请先完成约克大学邮箱验证', previewOnly: '体验登录仅供开发者工具预览', apiMissing: '未配置邮箱验证服务地址', apiFailed: '邮箱验证服务请求失败', connectionFailed: '无法连接邮箱验证服务', emailBound: '该邮箱已绑定其他微信账号', tooFrequent: '发送过于频繁，请稍后再试', wechatRetry: '请重新发起微信登录', accountMismatch: '请使用获取验证码时的微信账号完成验证', expired: '验证码已过期，请重新发送', tooMany: '尝试次数过多，请重新发送验证码', wrongCode: '验证码不正确', unavailable: '验证服务暂不可用，请稍后再试' }
  },
  en: {
    common: { switchLanguage: 'Switch to Chinese', language: 'Language', copy: 'Copy', home: 'Home', benefits: 'Benefits', events: 'Events', profile: 'Me', all: 'All', cancel: 'Cancel', confirm: 'Confirm', pending: 'Not provided' },
    nav: { home: 'Home', login: 'Sign in', merchantList: 'Partner benefits', merchantDetail: 'Offer details', services: 'Campus events', contact: 'Contact YUCSSA', profile: 'My membership' },
    home: { eyebrow: 'YORK UNIVERSITY · CSSA', greeting: 'Hello, ', openProfile: 'Open your profile', association: 'York Chinese Students & Scholars', previewCard: 'Preview', verifiedMember: 'Verified', caption: 'YOUR CAMPUS, YOUR COMMUNITY', title: 'Your campus. More possibilities.', previewCode: 'Sample only · Not valid for offers', memberCode: 'Member code · Show at checkout', copyCode: 'Copy code', wallet: 'Add to Apple Wallet', comingSoon: 'Coming soon', benefits: 'Student benefits', allMerchants: 'All partners', events: 'Campus events', schedule: 'View schedule', eventCopy: 'Meet new people. Make campus life your own.', community: 'At York, we belong together.', communityCopy: 'Contact us · Join the team · Partner with us', footer: 'YUCSSA · CONNECTED ON CAMPUS' },
    login: { brand: 'YUCSSA CAMPUS HUB', titleLine1: 'Your campus life', titleLine2: 'starts here.', intro: 'Sign in for your membership, student benefits and campus events.', identity: 'Membership', benefits: 'Partner benefits', events: 'Campus events', title: 'Sign in to YUCSSA', copy: 'Verify your York University email to continue.', email: 'York University email', emailPlaceholder: 'Your email @yorku.ca', emailHelp: 'Use @yorku.ca or @my.yorku.ca', code: 'Email verification code', codePlaceholder: '6-digit code', resend: 'Resend', send: 'Send code', signingIn: 'Signing in', signIn: 'Sign in and continue', profileSelected: 'WeChat name: ', useProfile: 'Use WeChat name (optional)', profileNote: 'Your WeChat name appears on your profile. Email verification is still required.', preview: 'Explore the preview', previewNote: 'Preview mode does not send email, verify your identity or bind an account.', footer: 'York University Chinese Students and Scholars Association', initialHint: 'Sign in to access your membership and student benefits.', pendingHint: 'A code was sent to {email}. Check your inbox and enter the 6-digit code.', successHint: 'Email verified. Opening Home.' },
    merchants: { eyebrow: 'MEMBER BENEFITS', title: 'Benefits beyond campus.', copy: 'Discover our partners. Bring your YUCSSA member card.', count: 'partners', viewOffer: 'View offer', emptyTitle: 'No partners here yet', emptyCopy: 'More benefits are on the way. Explore another category.' },
    detail: { copyOffer: 'Copy offer', map: 'Open map', offer: 'YUCSSA · MEMBER BENEFIT', address: 'Address', phone: 'Phone', actions: 'Actions', copyAddress: 'Copy address', steps: 'How to redeem', features: 'Highlights', related: 'Similar partners' },
    services: { kicker: 'CAMPUS & COMMUNITY', title: 'Campus life, together.', copy: 'Meet new friends, join an event and find the student support you need.', schedule: 'Event schedule', notices: 'Announcements', support: 'Student support', benefits: 'View benefits', contact: 'Contact the association' },
    contact: { kicker: 'CONTACT YUCSSA', title: 'Find your community at York.', copy: 'Questions about campus life, a partnership idea or a wish to join our team? We would love to hear from you.', contact: 'Get in touch', join: 'Join the team', joinCopy: 'Bring your ideas and energy to campus life. Contact us about recruitment.', updates: 'Stay connected', updatesCopy: 'Keep up with campus events, recruitment and student benefits.', official: 'YUCSSA on WeChat', officialCopy: 'The follow link is coming soon. Reach us through the contacts above.' },
    profile: { organization: 'Organization', code: 'Member code', copyCode: 'Copy member code', verification: 'York email verification', contact: 'Contact the association', logout: 'Sign out', previewBadge: 'Preview', previewTitle: 'York email not verified', previewCopy: 'This preview does not send email or bind your WeChat account.', verifiedBadge: 'Verified', verifiedTitle: 'York email verified', verifiedCopy: 'Verified email: {email}', unverified: 'Unverified', logoutTitle: 'Sign out?', logoutPreview: 'You will return to sign-in and can enter preview mode again.', logoutVerified: 'You will need to verify your York email again to access Home.', memberName: 'YUCSSA Member', guestName: 'Campus Guest', previewName: 'Preview Student', membership: 'Verified member', previewMembership: 'Preview member', previewJoined: 'Design preview', joined: 'Spring 2026', faculty: 'York University', bio: 'Campus events, student benefits and practical support in one place.', previewBio: 'You are exploring a preview. Your York email has not been verified.' },
    message: { copied: 'Copied', memberCopied: 'Member code copied', contactCopied: 'Contact copied', offerCopied: 'Offer copied', addressCopied: 'Address copied', wallet: 'Apple Wallet is coming soon', merchantMissing: 'Partner not found', phoneMissing: 'Phone number not provided', mapMissing: 'Map location not provided', loginCodeMissing: 'No WeChat login code received', wechatFailed: 'WeChat sign-in failed', profileUnsupported: 'WeChat profile access is unavailable', profilePurpose: 'Display your member name and avatar', profileSuccess: 'WeChat profile received', profileFailed: 'WeChat profile not received', yorkEmail: 'Enter your York University email', codeSent: 'Verification code sent', sendFailed: 'Could not send the code', sendFirst: 'Request an email code first', codeLength: 'Enter a 6-digit code', incomplete: 'Verification incomplete. Request a new code.', verifyFailed: 'Verification failed', verifyFirst: 'Verify your York email first', previewOnly: 'Preview is only available in developer tools', apiMissing: 'Verification service is not configured', apiFailed: 'Verification service request failed', connectionFailed: 'Could not connect to verification service', emailBound: 'This email is bound to another WeChat account', tooFrequent: 'Too many requests. Try again later.', wechatRetry: 'Please sign in with WeChat again', accountMismatch: 'Use the WeChat account that requested this code', expired: 'Code expired. Request a new code.', tooMany: 'Too many attempts. Request a new code.', wrongCode: 'Incorrect verification code', unavailable: 'Verification service unavailable. Try again later.' }
  }
}
function getLanguage() {
  return wx.getStorageSync(LANGUAGE_KEY) === 'en' ? 'en' : 'zh'
}
function setLanguage(language) {
  const next = language === 'en' ? 'en' : 'zh'
  wx.setStorageSync(LANGUAGE_KEY, next)
  return next
}
function getMessages(language = getLanguage()) { return messages[language === 'en' ? 'en' : 'zh'] }
function t(key, params = {}, language = getLanguage()) {
  const value = key.split('.').reduce((object, part) => object && object[part], getMessages(language))
  if (typeof value !== 'string') throw new Error(`Missing translation: ${key}`)
  return value.replace(/\{(\w+)\}/g, (_, name) => params[name] === undefined ? `{${name}}` : String(params[name]))
}
const errorKeys = {
  '体验登录仅供开发者工具预览': 'previewOnly', '未获取到微信登录 code': 'loginCodeMissing', '微信登录校验失败': 'wechatFailed',
  '请先完成 York 邮箱验证': 'verifyFirst', '登录验证未完成，请重新获取验证码': 'incomplete',
  '未配置邮箱验证服务地址': 'apiMissing', '邮箱验证服务请求失败': 'apiFailed', '无法连接邮箱验证服务': 'connectionFailed',
  '请输入有效的 York 邮箱': 'yorkEmail', '请输入 6 位验证码': 'codeLength', '请重新发起微信登录': 'wechatRetry',
  '该 York 邮箱已绑定其他微信账号': 'emailBound', '发送过于频繁，请稍后再试': 'tooFrequent', '请先发送验证码': 'sendFirst',
  '请使用获取验证码时的微信账号完成验证': 'accountMismatch', '验证码已过期，请重新发送': 'expired',
  '尝试次数过多，请重新发送验证码': 'tooMany', '验证码不正确': 'wrongCode'
}
function translateError(error, fallback = 'unavailable') {
  const key = error && (errorKeys[error.message] || Object.keys(messages.zh.message).find(k => messages.zh.message[k] === error.message || messages.en.message[k] === error.message))
  return t(`message.${key || fallback}`)
}
function localizeProfile(profile, language = getLanguage()) {
  if (!profile) return null
  const p = getMessages(language).profile
  const defaults = { nickName: { '体验同学': p.previewName, 'Preview Student': p.previewName, 'YUCSSA Member': p.memberName, '学联成员': p.memberName, 'Campus Guest': p.guestName, '校园访客': p.guestName }, faculty: { 'York University': p.faculty }, membershipLevel: { '体验预览': p.previewMembership, '体验成员': p.previewMembership, 'York Verified': p.membership }, joinedLabel: { '界面体验': p.previewJoined, 'Spring 2026': p.joined }, bio: { 'Student events, verified offers, and practical support in one hub.': p.bio, '当前为体验模式，可查看页面与操作，尚未验证 York 邮箱。': p.previewBio } }
  const result = { ...profile }
  Object.keys(defaults).forEach(key => { result[key] = defaults[key][profile[key]] || profile[key] })
  return result
}
function localizedPage(name, definition) {
  function updateLanguage() {
    const language = getLanguage()
    const { getLocalizedData } = require('../data/localizedData.js')
    const content = getLocalizedData(language)
    const pageData = name === 'home' ? { events: content.events.slice(0, 3), featuredMerchants: content.merchants.slice(0, 2), walletStatusText: t('home.comingSoon') }
      : name === 'merchantList' ? { categories: content.categories }
      : name === 'services' ? { announcements: content.announcements, events: content.events, serviceCards: content.serviceCards, supportChannels: content.supportChannels }
      : name === 'contact' ? { joinOpportunities: content.joinOpportunities, supportChannels: content.supportChannels }
      : name === 'profile' ? { supportChannels: content.supportChannels } : {}
    this.setData({ ui: getMessages(language), language, ...pageData })
    if (typeof wx.setNavigationBarTitle === 'function') wx.setNavigationBarTitle({ title: t(`nav.${name}`) })
  }
  const onLoad = definition.onLoad, onShow = definition.onShow
  return { ...definition, data: { ...definition.data, ui: getMessages(), language: getLanguage() },
    onLoad(...args) { updateLanguage.call(this); if (onLoad) onLoad.apply(this, args) },
    onShow(...args) { updateLanguage.call(this); if (onShow) onShow.apply(this, args); if (name === 'login' && this.refreshVerificationHint) this.refreshVerificationHint() },
    toggleLanguage() { setLanguage(getLanguage() === 'zh' ? 'en' : 'zh'); updateLanguage.call(this); if (this.refreshPageData) this.refreshPageData(); if (this.refreshVerificationHint) this.refreshVerificationHint() }
  }
}
module.exports = { LANGUAGE_KEY, getLanguage, setLanguage, getMessages, t, translateError, localizeProfile, localizedPage }
