const { getStoredProfile } = require('./utils/memberStore.js')

App({
  globalData: {
    isLoggedIn: false,
    profile: null
  },

  onLaunch() {
    const profile = getStoredProfile()

    this.globalData.profile = profile
    this.globalData.isLoggedIn = !!profile
  }
})
