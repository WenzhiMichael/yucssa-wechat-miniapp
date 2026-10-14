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

        reject(new Error('未获取到微信登录 code'))
      },
      fail: () => {
        reject(new Error('微信登录校验失败'))
      }
    })
  })
}

Page({
  data: {
    canPreview: canUseDevelopmentPreview(),
    canUseProfile: typeof wx.getUserProfile === 'function',
    verificationEmailInput: '',
    verificationCodeInput: '',
    verificationStatus: 'unverified',
    verificationHint: '登录后即可查看首页、会员身份和学生福利。',
    verifiedEmail: '',
    verificationTicket: '',
    profilePreviewName: 'YUCSSA Member',
    hasAuthorizedProfile: false,
    isSendingCode: false,
    isVerifyingCode: false
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
      wx.showToast({ title: error.message, icon: 'none' })
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
      verificationHint: '登录后即可查看首页、会员身份和学生福利。'
    })
  },

  handleProfileLogin() {
    if (typeof wx.getUserProfile !== 'function') {
      wx.showToast({
        title: '当前环境不支持头像昵称授权',
        icon: 'none'
      })
      return
    }

    wx.getUserProfile({
      desc: '用于展示会员昵称和头像',
      success: (res) => {
        this.userInfoDraft = res.userInfo || {}
        this.setData({
          hasAuthorizedProfile: true,
          profilePreviewName: (res.userInfo && res.userInfo.nickName) || 'Campus Guest'
        })
        wx.showToast({
          title: '已获取头像昵称',
          icon: 'none'
        })
      },
      fail: () => {
        wx.showToast({
          title: '未获取到头像昵称',
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
        title: '请输入 York 邮箱',
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
        verificationHint: `验证码已发送到 ${email}，请检查邮箱并输入 6 位验证码。`
      })

      wx.showToast({
        title: '验证码已发送',
        icon: 'none'
      })
    } catch (error) {
      wx.showToast({
        title: error.message || '验证码发送失败',
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
      wx.showToast({ title: '请先获取邮箱验证码', icon: 'none' })
      return
    }

    const code = String(this.data.verificationCodeInput || '').trim()

    if (!/^\d{6}$/.test(code)) {
      wx.showToast({
        title: '请输入 6 位验证码',
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
        throw new Error('登录验证未完成，请重新获取验证码')
      }

      this.setData({
        verificationStatus: 'verified',
        verificationCodeInput: '',
        verificationTicket: result.verificationTicket,
        verificationHint: '验证成功，正在进入首页。'
      })

      this.completeLogin()
    } catch (error) {
      wx.showToast({
        title: error.message || '验证失败',
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
        title: '请先完成 York 邮箱验证',
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
})
