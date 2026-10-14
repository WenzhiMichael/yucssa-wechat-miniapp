const { localizedPage, t, localizeProfile } = require('../../utils/i18n.js')
const app = getApp()
const { getLocalizedData } = require('../../data/localizedData.js')
const { categories, events, merchants } = getLocalizedData()
const { getStoredProfile, isLoggedInProfile } = require('../../utils/memberStore.js')

function buildProfileInitial(profile) {
  if (!profile || !profile.nickName) {
    return 'Y'
  }

  return profile.nickName.slice(0, 1).toUpperCase()
}

Page(localizedPage('home', {
  data: {
    profile: null,
    profileInitial: 'Y',
    walletStatusText: t('home.comingSoon'),
    featuredMerchants: merchants.slice(0, 2),
    events: events.slice(0, 3),
    categoryDockItems: []
  },

  onLoad() {
    this.refreshPageData()
  },

  onShow() {
    this.refreshPageData()
  },

  refreshPageData() {
    const profile = getStoredProfile()

    if (!isLoggedInProfile(profile)) {
      app.globalData.profile = null
      app.globalData.isLoggedIn = false
      this.setData({ profile: null, categoryDockItems: [] })
      wx.reLaunch({
        url: '/pages/login/login'
      })
      return
    }

    app.globalData.profile = profile
    app.globalData.isLoggedIn = true

    const displayProfile = localizeProfile(profile)
    const { categories } = getLocalizedData()
    this.setData({
      profile: displayProfile,
      profileInitial: buildProfileInitial(displayProfile),
      categoryDockItems: categories.map((category) => ({
        id: category.id,
        name: category.shortName || category.name,
        label: category.name,
        accent: category.accent,
        surface: category.surface
      }))
    })
  },

  openCategoryDock(e) {
    const categoryId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/merchantList/merchantList?categoryId=${categoryId}`
    })
  },

  openServices() {
    wx.navigateTo({
      url: '/pages/services/services'
    })
  },

  openMerchants() {
    wx.navigateTo({ url: '/pages/merchantList/merchantList' })
  },

  openMerchant(e) {
    wx.navigateTo({ url: `/pages/merchantDetail/merchantDetail?id=${e.currentTarget.dataset.id}` })
  },

  openContact() {
    wx.navigateTo({ url: '/pages/contact/contact' })
  },

  openProfile() {
    wx.navigateTo({
      url: '/pages/profile/profile'
    })
  },

  copyMemberCode() {
    wx.setClipboardData({
      data: this.data.profile.memberCode,
      success: () => {
        wx.showToast({
          title: t('message.memberCopied'),
          icon: 'none'
        })
      }
    })
  },

  handleWalletPlaceholder() {
    wx.showToast({
      title: t('message.wallet'),
      icon: 'none'
    })
  }
}))
