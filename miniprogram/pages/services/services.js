const { localizedPage, t } = require('../../utils/i18n.js')
const {
  announcements,
  events,
  serviceCards,
  supportChannels
} = require('../../data/localizedData.js').getLocalizedData()

Page(localizedPage('services', {
  data: {
    announcements,
    events,
    serviceCards,
    supportChannels
  },

  openMerchantDirectory() {
    wx.navigateTo({
      url: '/pages/merchantList/merchantList'
    })
  },

  copyChannel(e) {
    const value = e.currentTarget.dataset.value

    wx.setClipboardData({
      data: value,
      success: () => {
        wx.showToast({
          title: t('message.contactCopied'),
          icon: 'none'
        })
      }
    })
  }
}))
