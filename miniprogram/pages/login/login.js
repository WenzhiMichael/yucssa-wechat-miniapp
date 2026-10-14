const { localizedPage, t, translateError, localizeProfile } = require('../../utils/i18n.js')
const app = getApp()
const {
  canUseDevelopmentPreview,
  getStoredProfile,
  isLoggedInProfile,
  isVerifiedProfile,
  isYorkEmail,
  loginForDevelopment,
  loginWithProfile
} = require('../../utils/memberStore.js')
const { sendVerificationCode, verifyVerificationCode } = require('../../utils/verificationApi.js')

function getWechatLoginCode() {
  return new Promise((resolve, reject) => {
    wx.login({
      success: (res) => {
        if (res && res.code) {
          resolve(res.code)
          return
        }

        reject(new Error(t('message.loginCodeMissing')))
      },
      fail: () => {
        reject(new Error(t('message.wechatFailed')))
      }
    })
  })
}

Page(localizedPage('login', {
  data: {
    canPreview: canUseDevelopmentPreview(),
    canUseProfile: typeof wx.getUserProfile === 'function',
    verificationEmailInput: '',
    verificationCodeInput: '',
    verificationStatus: 'unverified',
    verificationHint: t('login.initialHint'),
    verifiedEmail: '',
    verificationTicket: '',
    profilePreviewName: 'YUCSSA Member',
    hasAuthorizedProfile: false,
    isSendingCode: false,
    isVerifyingCode: false
  },

  refreshVerificationHint() {
    const key = this.data.verificationStatus === 'pending' ? 'pendingHint' : this.data.verificationStatus === 'verified' ? 'successHint' : 'initialHint'
    this.setData({ verificationHint: t(`login.${key}`, { email: this.data.verifiedEmail }), profilePreviewName: localizeProfile({ nickName: this.data.profilePreviewName }).nickName })
  },

  onShow() {
    const profile = getStoredProfile()
    const isLoggedIn = isLoggedInProfile(profile)
    app.globalData.profile = isLoggedIn ? profile : null
    app.globalData.isLoggedIn = isLoggedIn

    if (isLoggedIn) {
      wx.reLaunch({
        url: '/pages/home/home'
      })
    }
  },

  handlePreviewLogin() {
    if (this.data.isSendingCode || this.data.isVerifyingCode) {
      return
    }

    try {
      const profile = loginForDevelopment()
      app.globalData.profile = profile
      app.globalData.isLoggedIn = true
      wx.reLaunch({ url: '/pages/home/home' })
    } catch (error) {
      wx.showToast({ title: translateError(error), icon: 'none' })
    }
  },

  handleVerificationEmailInput(e) {
    if (this.data.isSendingCode || this.data.isVerifyingCode) {
      return
    }

    this.setData({
      verificationEmailInput: e.detail.value,
      verificationCodeInput: '',
      verificationStatus: 'unverified',
      verifiedEmail: '',
      verificationTicket: '',
      verificationHint: t('login.initialHint')
    })
  },

  handleProfileLogin() {
    if (typeof wx.getUserProfile !== 'function') {
      wx.showToast({
        title: t('message.profileUnsupported'),
        icon: 'none'
      })
      return
    }

    wx.getUserProfile({
      desc: t('message.profilePurpose'),
      success: (res) => {
        this.userInfoDraft = res.userInfo || {}
        this.setData({
          hasAuthorizedProfile: true,
          profilePreviewName: (res.userInfo && res.userInfo.nickName) || t('profile.guestName')
        })
        wx.showToast({
          title: t('message.profileSuccess'),
          icon: 'none'
        })
      },
      fail: () => {
        wx.showToast({
          title: t('message.profileFailed'),
          icon: 'none'
        })
      }
    })
  },

  async sendVerificationCode() {
    if (this.data.isSendingCode || this.data.isVerifyingCode) {
      return
    }

    const email = String(this.data.verificationEmailInput || '').trim().toLowerCase()

    if (!isYorkEmail(email)) {
      wx.showToast({
        title: t('message.yorkEmail'),
        icon: 'none'
      })
      return
    }

    this.setData({
      isSendingCode: true
    })

    try {
      const wechatLoginCode = await getWechatLoginCode()
      await sendVerificationCode(email, wechatLoginCode)

      this.setData({
        verificationStatus: 'pending',
        verifiedEmail: email,
        verificationHint: t('login.pendingHint', { email })
      })

      wx.showToast({
        title: t('message.codeSent'),
        icon: 'none'
      })
    } catch (error) {
      wx.showToast({
        title: translateError(error, 'sendFailed'),
        icon: 'none'
      })
    } finally {
      this.setData({
        isSendingCode: false
      })
    }
  },

  handleVerificationCodeInput(e) {
    if (this.data.isVerifyingCode) {
      return
    }

    this.setData({
      verificationCodeInput: String(e.detail.value || '').replace(/\D/g, '').slice(0, 6)
    })
  },

  async submitLogin() {
    if (this.data.isSendingCode || this.data.isVerifyingCode) {
      return
    }

    if (this.data.verificationStatus === 'verified') {
      this.completeLogin()
      return
    }

    if (this.data.verificationStatus !== 'pending') {
      wx.showToast({ title: t('message.sendFirst'), icon: 'none' })
      return
    }

    const code = String(this.data.verificationCodeInput || '').trim()

    if (!/^\d{6}$/.test(code)) {
      wx.showToast({
        title: t('message.codeLength'),
        icon: 'none'
      })
      return
    }

    this.setData({
      isVerifyingCode: true
    })

    try {
      const wechatLoginCode = await getWechatLoginCode()
      const result = await verifyVerificationCode(this.data.verifiedEmail, code, wechatLoginCode)
      const verifiedEmail = String(result.email || '').trim().toLowerCase()

      if (
        verifiedEmail !== this.data.verifiedEmail ||
        !isVerifiedProfile({
          verificationStatus: 'verified',
          verificationEmail: verifiedEmail,
          verificationTicket: result.verificationTicket
        })
      ) {
        throw new Error(t('message.incomplete'))
      }

      this.setData({
        verificationStatus: 'verified',
        verificationCodeInput: '',
        verificationTicket: result.verificationTicket,
        verificationHint: t('login.successHint')
      })

      this.completeLogin()
    } catch (error) {
      wx.showToast({
        title: translateError(error, 'verifyFailed'),
        icon: 'none'
      })
    } finally {
      this.setData({
        isVerifyingCode: false
      })
    }
  },

  completeLogin() {
    if (!isVerifiedProfile({
      verificationStatus: this.data.verificationStatus,
      verificationEmail: this.data.verifiedEmail,
      verificationTicket: this.data.verificationTicket
    })) {
      wx.showToast({
        title: t('message.verifyFirst'),
        icon: 'none'
      })
      return
    }

    const profile = loginWithProfile(this.userInfoDraft || {
      nickName: 'YUCSSA Member'
    }, {
      verificationEmail: this.data.verifiedEmail,
      verificationStatus: 'verified',
      membershipLevel: 'York Verified',
      verificationTicket: this.data.verificationTicket
    })
    app.globalData.profile = profile
    app.globalData.isLoggedIn = true

    wx.reLaunch({
      url: '/pages/home/home'
    })
  }
}))
