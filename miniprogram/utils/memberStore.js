const PROFILE_KEY = 'yucssa.profile'
const FAVORITES_KEY = 'yucssa.favorites'

function createMemberCode() {
  return `YU-${String(Date.now()).slice(-6)}`
}

function normalizeProfile(profile) {
  const source = profile || {}
  return {
    nickName: source.nickName || 'YUCSSA Member',
    avatarUrl: source.avatarUrl || '',
    faculty: source.faculty || 'York University',
    membershipLevel: source.membershipLevel || 'Active Member',
    memberCode: source.memberCode || createMemberCode(),
    joinedLabel: source.joinedLabel || 'Spring 2026',
    bio: source.bio || 'Student events, verified offers, and practical support in one hub.'
  }
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

function loginWithProfile(userInfo) {
  const existing = getStoredProfile() || {}
  const mergedProfile = normalizeProfile({
    ...existing,
    nickName: userInfo && userInfo.nickName ? userInfo.nickName : existing.nickName,
    avatarUrl: userInfo && userInfo.avatarUrl ? userInfo.avatarUrl : existing.avatarUrl,
    membershipLevel: 'Verified Member'
  })

  wx.setStorageSync(PROFILE_KEY, mergedProfile)
  return mergedProfile
}

function clearProfile() {
  wx.removeStorageSync(PROFILE_KEY)
}

function getFavoriteIds() {
  const favoriteIds = wx.getStorageSync(FAVORITES_KEY)
  return Array.isArray(favoriteIds) ? favoriteIds : []
}

function saveFavoriteIds(favoriteIds) {
  wx.setStorageSync(FAVORITES_KEY, favoriteIds)
  return favoriteIds
}

function toggleFavorite(merchantId) {
  const favoriteIds = getFavoriteIds()
  const exists = favoriteIds.indexOf(merchantId) !== -1

  const nextFavoriteIds = exists
    ? favoriteIds.filter((id) => id !== merchantId)
    : favoriteIds.concat(merchantId)

  saveFavoriteIds(nextFavoriteIds)

  return {
    favoriteIds: nextFavoriteIds,
    isFavorite: !exists
  }
}

function isFavorite(merchantId) {
  return getFavoriteIds().indexOf(merchantId) !== -1
}

module.exports = {
  clearProfile,
  getFavoriteIds,
  getStoredProfile,
  isFavorite,
  loginWithProfile,
  saveProfile,
  toggleFavorite
}
