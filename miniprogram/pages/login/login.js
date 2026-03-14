const app = getApp()
const { onboardingHighlights } = require('../../data/mockData.js')
const { loginWithProfile } = require('../../utils/memberStore.js')

Page({
  data: {
    onboardingHighlights,
    canUseProfile: typeof wx.getUserProfile === 'function'
  },

  onShow() {
    if (app.globalData.isLoggedIn) {
      wx.redirectTo({
        url: '/pages/home/home'
      })
    }
  },

  handleQuickStart() {
    this.completeLogin({
      nickName: 'Campus Guest'
    })
  },

  handleProfileLogin() {
    if (typeof wx.getUserProfile !== 'function') {
      this.handleQuickStart()
      return
    }

    wx.getUserProfile({
      desc: '用于展示会员昵称和头像',
      success: (res) => {
        this.completeLogin(res.userInfo || {})
      },
      fail: () => {
        wx.showToast({
          title: '未获取到头像昵称',
          icon: 'none'
        })
      }
    })
  },

  completeLogin(userInfo) {
    const profile = loginWithProfile(userInfo || {})
    app.globalData.profile = profile
    app.globalData.isLoggedIn = true

    wx.redirectTo({
      url: '/pages/home/home'
    })
  }
})
