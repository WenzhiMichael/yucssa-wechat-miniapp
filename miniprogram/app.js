const { getStoredProfile, isLoggedInProfile } = require('./utils/memberStore.js')

App({
  globalData: {
    isLoggedIn: false,
    profile: null
  },

  onLaunch() {
    const profile = getStoredProfile()

    this.globalData.profile = isLoggedInProfile(profile) ? profile : null
    this.globalData.isLoggedIn = isLoggedInProfile(profile)
  }
})
