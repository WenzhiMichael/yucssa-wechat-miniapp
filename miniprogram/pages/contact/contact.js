const { localizedPage, t } = require('../../utils/i18n.js')
const { joinOpportunities, supportChannels } = require('../../data/localizedData.js').getLocalizedData()

Page(localizedPage('contact', {
  data: {
    joinOpportunities,
    supportChannels
  },

  copyValue(e) {
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
  }
}))
