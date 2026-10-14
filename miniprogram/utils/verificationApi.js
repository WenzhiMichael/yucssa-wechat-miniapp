const { verificationApiBaseUrl } = require('../config/verification.js')

function request(path, data) {
  return new Promise((resolve, reject) => {
    if (!verificationApiBaseUrl) {
      reject(new Error('未配置邮箱验证服务地址'))
      return
    }

    wx.request({
      url: `${verificationApiBaseUrl}${path}`,
      method: 'POST',
      data,
      timeout: 10000,
      success: (res) => {
        const payload = res.data || {}

        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(payload)
          return
        }

        reject(new Error(payload.message || '邮箱验证服务请求失败'))
      },
      fail: () => {
        reject(new Error('无法连接邮箱验证服务'))
      }
    })
  })
}

function sendVerificationCode(email, wechatLoginCode) {
  return request('/api/verification/email/send', { email, wechatLoginCode })
}

function verifyVerificationCode(email, code, wechatLoginCode) {
  return request('/api/verification/email/verify', { email, code, wechatLoginCode })
}

module.exports = {
  sendVerificationCode,
  verifyVerificationCode
}
