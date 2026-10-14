const PROFILE_KEY = 'yucssa.profile'

function createMemberCode() {
  return `YU-${String(Date.now()).slice(-6)}`
}

function normalizeProfile(profile) {
  const source = profile || {}
  return {
    nickName: source.nickName || 'YUCSSA Member',
    avatarUrl: source.avatarUrl || '',
    faculty: source.faculty || 'York University',
    membershipLevel: source.membershipLevel || '体验成员',
    memberCode: source.memberCode || createMemberCode(),
    joinedLabel: source.joinedLabel || 'Spring 2026',
    bio: source.bio || 'Student events, verified offers, and practical support in one hub.',
    verificationStatus: source.verificationStatus || 'unverified',
    verificationEmail: source.verificationEmail || '',
    verificationTicket: source.verificationTicket || ''
  }
}

function isVerifiedProfile(profile) {
  return Boolean(
    profile &&
    profile.verificationStatus === 'verified' &&
    isYorkEmail(profile.verificationEmail) &&
    typeof profile.verificationTicket === 'string' &&
    profile.verificationTicket.trim()
  )
}

function canUseDevelopmentPreview() {
  try {
    const account = wx.getAccountInfoSync()
    const device = typeof wx.getDeviceInfo === 'function'
      ? wx.getDeviceInfo()
      : wx.getSystemInfoSync()
    return account.miniProgram.envVersion === 'develop' && device.platform === 'devtools'
  } catch (error) {
    return false
  }
}

function isLoggedInProfile(profile) {
  return isVerifiedProfile(profile) || Boolean(
    profile && profile.verificationStatus === 'preview' && canUseDevelopmentPreview()
  )
}

function loginForDevelopment() {
  if (!canUseDevelopmentPreview()) {
    throw new Error('体验登录仅供开发者工具预览')
  }

  return saveProfile({
    nickName: '体验同学',
    membershipLevel: '体验预览',
    memberCode: 'PREVIEW',
    joinedLabel: '界面体验',
    bio: '当前为体验模式，可查看页面与操作，尚未验证 York 邮箱。',
    verificationStatus: 'preview',
    verificationEmail: '',
    verificationTicket: ''
  })
}

function getStoredProfile() {
  const profile = wx.getStorageSync(PROFILE_KEY)
  if (!profile) {
    return null
  }

  return normalizeProfile(profile)
}

function saveProfile(profile) {
  const nextProfile = normalizeProfile(profile)
  wx.setStorageSync(PROFILE_KEY, nextProfile)
  return nextProfile
}

function clearProfile() {
  wx.removeStorageSync(PROFILE_KEY)
}

function isYorkEmail(email) {
  return /@(my\.)?yorku\.ca$/i.test(String(email || '').trim())
}

function loginWithProfile(userInfo, options) {
  const storedProfile = getStoredProfile()
  const existing = isVerifiedProfile(storedProfile) ? storedProfile : {}
  const overrides = options || {}
  const mergedProfile = normalizeProfile({
    ...existing,
    nickName: userInfo && userInfo.nickName ? userInfo.nickName : existing.nickName,
    avatarUrl: userInfo && userInfo.avatarUrl ? userInfo.avatarUrl : existing.avatarUrl,
    membershipLevel: overrides.membershipLevel || 'York Verified',
    verificationStatus: overrides.verificationStatus || existing.verificationStatus || 'unverified',
    verificationEmail: overrides.verificationEmail || existing.verificationEmail || '',
    verificationTicket: overrides.verificationTicket || existing.verificationTicket || ''
  })

  if (!isVerifiedProfile(mergedProfile)) {
    throw new Error('请先完成 York 邮箱验证')
  }

  wx.setStorageSync(PROFILE_KEY, mergedProfile)
  return mergedProfile
}

module.exports = {
  canUseDevelopmentPreview,
  clearProfile,
  getStoredProfile,
  isYorkEmail,
  isLoggedInProfile,
  isVerifiedProfile,
  loginWithProfile,
  loginForDevelopment,
  saveProfile
}
