const mockData = require('../../data/mockData.js')

Page({
    data: {
        merchants: [],
        categoryName: ''
    },

    onLoad(options) {
        const categoryId = options.categoryId
        const category = mockData.categories.find(c => c.id === categoryId)

        if (category) {
            wx.setNavigationBarTitle({
                title: category.name
            })
            this.setData({ categoryName: category.name })
        }

        const filteredMerchants = mockData.merchants.filter(m => m.categoryId === categoryId)
        this.setData({ merchants: filteredMerchants })
    },

    onMerchantTap(e) {
        const merchantId = e.currentTarget.dataset.id
        wx.navigateTo({
            url: `/pages/merchantDetail/merchantDetail?id=${merchantId}`
        })
    }
})
