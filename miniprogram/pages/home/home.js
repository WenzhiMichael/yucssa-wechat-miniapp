const app = getApp()
const { categories, events } = require('../../data/mockData.js')
const { getStoredProfile } = require('../../utils/memberStore.js')

function buildProfileInitial(profile) {
  if (!profile || !profile.nickName) {
    return 'Y'
  }

  return profile.nickName.slice(0, 1).toUpperCase()
}

Page({
  data: {
    profile: null,
    profileInitial: 'Y',
    walletStatusText: '预留接口',
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

    if (!profile) {
      app.globalData.profile = null
      app.globalData.isLoggedIn = false
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }

    app.globalData.profile = profile
    app.globalData.isLoggedIn = true

    this.setData({
      profile,
      profileInitial: buildProfileInitial(profile),
      categoryDockItems: categories.map((category) => ({
        id: category.id,
        name: category.shortName || category.name,
        label: category.name,
        accent: category.accent
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
          title: '会员码已复制',
          icon: 'none'
        })
      }
    })
  },

  handleWalletPlaceholder() {
    wx.showToast({
      title: 'Apple Wallet 入口预留中',
      icon: 'none'
    })
  }
})
