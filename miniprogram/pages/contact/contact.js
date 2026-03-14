const { joinOpportunities, supportChannels } = require('../../data/mockData.js')

Page({
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
          title: '已复制',
          icon: 'none'
        })
      }
    })
  }
})
