const { localizedPage, t, localizeProfile } = require('../../utils/i18n.js')
const app = getApp()
const { supportChannels } = require('../../data/localizedData.js').getLocalizedData()
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
      badgeText: t('profile.previewBadge'),
      title: t('profile.previewTitle'),
      copy: t('profile.previewCopy')
    }
  }

  return {
    badgeText: t('profile.verifiedBadge'),
    title: t('profile.verifiedTitle'),
    copy: t('profile.verifiedCopy', { email: profile.verificationEmail })
  }
}

Page(localizedPage('profile', {
  data: {
    profile: null,
    profileInitial: 'Y',
    supportChannels,
    verificationBadgeText: t('profile.unverified'),
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

    const displayProfile = localizeProfile(profile)
    this.setData({
      profile: displayProfile,
      profileInitial: buildProfileInitial(displayProfile),
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
          title: t('message.memberCopied'),
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
          title: t('message.copied'),
          icon: 'none'
        })
      }
    })
  },

  logout() {
    wx.showModal({
      confirmText: t('common.confirm'),
      cancelText: t('common.cancel'),
      title: t('profile.logoutTitle'),
      content: this.data.profile && this.data.profile.verificationStatus === 'preview'
        ? t('profile.logoutPreview')
        : t('profile.logoutVerified'),
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
}))
