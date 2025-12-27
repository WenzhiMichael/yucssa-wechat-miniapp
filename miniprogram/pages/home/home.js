const app = getApp()
const mockData = require('../../data/mockData.js')

Page({
    data: {
        userInfo: {},
        categories: []
    },

    onLoad() {
        this.setData({
            categories: mockData.categories,
            userInfo: app.globalData.userInfo || {}
        })
    },

    onCategoryTap(e) {
        const categoryId = e.currentTarget.dataset.id
        wx.navigateTo({
            url: `/pages/merchantList/merchantList?categoryId=${categoryId}`
        })
    }
})
