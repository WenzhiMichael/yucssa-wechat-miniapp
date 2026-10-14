const app = getApp()
const { supportChannels } = require('../../data/mockData.js')
const { clearProfile, getStoredProfile, isLoggedInProfile } = require('../../utils/memberStore.js')

function buildProfileInitial(profile) {
  if (!profile || !profile.nickName) {
    return 'Y'
  }

  return profile.nickName.slice(0, 1).toUpperCase()
}

function buildVerificationView(profile) {
  if (profile.verificationStatus === 'preview') {
    return {
      badgeText: '体验中',
      title: '尚未验证 York 邮箱',
      copy: '当前只用于查看页面，不会发送邮件或建立微信绑定。'
    }
  }

  return {
    badgeText: '已验证',
    title: 'York 邮箱已通过验证',
    copy: `已验证邮箱：${profile.verificationEmail}`
  }
}

Page({
  data: {
    profile: null,
    profileInitial: 'Y',
    supportChannels,
    verificationBadgeText: '未验证',
    verificationTitle: '',
    verificationCopy: ''
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
      this.setData({ profile: null })
      wx.reLaunch({
        url: '/pages/login/login'
      })
      return
    }

    this.setData({
      profile,
      profileInitial: buildProfileInitial(profile),
      verificationBadgeText: buildVerificationView(profile).badgeText,
      verificationTitle: buildVerificationView(profile).title,
      verificationCopy: buildVerificationView(profile).copy
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
      title: '退出登录？',
      content: this.data.profile && this.data.profile.verificationStatus === 'preview'
        ? '退出后返回登录页，可以重新进入体验模式。'
        : '退出后需要重新验证 York 邮箱才能查看首页。',
      success: (res) => {
        if (!res.confirm) {
          return
        }

        clearProfile()
        app.globalData.profile = null
        app.globalData.isLoggedIn = false
        this.setData({ profile: null })

        wx.reLaunch({
          url: '/pages/login/login'
        })
      }
    })
  }
})
