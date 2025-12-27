const mockData = require('../../data/mockData.js')

Page({
    data: {
        merchant: {}
    },

    onLoad(options) {
        const merchantId = options.id
        const merchant = mockData.merchants.find(m => m.id === merchantId)

        if (merchant) {
            this.setData({ merchant })
            wx.setNavigationBarTitle({
                title: merchant.name
            })
        }
    }
})
