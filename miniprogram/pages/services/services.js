const {
  announcements,
  events,
  serviceCards,
  supportChannels
} = require('../../data/mockData.js')

Page({
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
          title: '联系方式已复制',
          icon: 'none'
        })
      }
    })
  }
})
