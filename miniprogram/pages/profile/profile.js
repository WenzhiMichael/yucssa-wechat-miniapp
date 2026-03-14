const app = getApp()
const { merchants, supportChannels } = require('../../data/mockData.js')
const { clearProfile, getFavoriteIds, getStoredProfile } = require('../../utils/memberStore.js')

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
    favoriteMerchants: [],
    supportChannels
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
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }

    const favoriteIds = getFavoriteIds()
    const favoriteMerchants = merchants.filter((merchant) => favoriteIds.indexOf(merchant.id) !== -1)

    this.setData({
      profile,
      profileInitial: buildProfileInitial(profile),
      favoriteMerchants
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

  openMerchant(e) {
    const merchantId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/merchantDetail/merchantDetail?id=${merchantId}`
    })
  },

  copyChannel(e) {
    const value = e.currentTarget.dataset.value

    wx.setClipboardData({
      data: value,
      success: () => {
        wx.showToast({
          title: '已复制',
          icon: 'none'
        })
      }
    })
  },

  logout() {
    wx.showModal({
      title: '退出当前体验？',
      content: '会清空本地会员身份信息，但保留项目代码和页面数据。',
      success: (res) => {
        if (!res.confirm) {
          return
        }

        clearProfile()
        app.globalData.profile = null
        app.globalData.isLoggedIn = false

        wx.redirectTo({
          url: '/pages/login/login'
        })
      }
    })
  }
})
