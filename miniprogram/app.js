const { getStoredProfile, getFavoriteIds } = require('./utils/memberStore.js')

App({
  globalData: {
    isLoggedIn: false,
    profile: null,
    favoriteIds: []
  },

  onLaunch() {
    const profile = getStoredProfile()
    const favoriteIds = getFavoriteIds()

    this.globalData.profile = profile
    this.globalData.isLoggedIn = !!profile
    this.globalData.favoriteIds = favoriteIds
  }
})
