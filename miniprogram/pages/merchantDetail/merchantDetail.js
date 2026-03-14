const app = getApp()
const { merchants } = require('../../data/mockData.js')
const { isFavorite, toggleFavorite } = require('../../utils/memberStore.js')

function findMerchantById(merchantId) {
  return merchants.find((merchant) => merchant.id === merchantId)
}

Page({
  data: {
    merchant: null,
    isFavorite: false,
    relatedMerchants: []
  },

  onLoad(options) {
    this.merchantId = options.id
    this.refreshPageData()
  },

  onShow() {
    this.refreshPageData()
  },

  refreshPageData() {
    const merchant = findMerchantById(this.merchantId)

    if (!merchant) {
      wx.showToast({
        title: '商家不存在',
        icon: 'none'
      })
      return
    }

    const relatedMerchants = merchants
      .filter((item) => item.categoryId === merchant.categoryId && item.id !== merchant.id)
      .slice(0, 2)

    wx.setNavigationBarTitle({
      title: merchant.name
    })

    this.setData({
      merchant,
      isFavorite: isFavorite(this.merchantId),
      relatedMerchants
    })
  },

  handleToggleFavorite() {
    const result = toggleFavorite(this.merchantId)
    app.globalData.favoriteIds = result.favoriteIds

    this.setData({
      isFavorite: result.isFavorite
    })

    wx.showToast({
      title: result.isFavorite ? '已加入收藏' : '已取消收藏',
      icon: 'none'
    })
  },

  copyOffer() {
    wx.setClipboardData({
      data: this.data.merchant.offerDetails,
      success: () => {
        wx.showToast({
          title: '优惠说明已复制',
          icon: 'none'
        })
      }
    })
  },

  copyAddress() {
    wx.setClipboardData({
      data: this.data.merchant.address,
      success: () => {
        wx.showToast({
          title: '地址已复制',
          icon: 'none'
        })
      }
    })
  },

  callMerchant() {
    wx.makePhoneCall({
      phoneNumber: this.data.merchant.phone
    })
  },

  openMap() {
    wx.openLocation({
      latitude: this.data.merchant.latitude,
      longitude: this.data.merchant.longitude,
      name: this.data.merchant.name,
      address: this.data.merchant.address,
      scale: 18
    })
  },

  openMerchant(e) {
    const merchantId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/merchantDetail/merchantDetail?id=${merchantId}`
    })
  },

  onShareAppMessage() {
    const merchant = this.data.merchant

    return {
      title: `${merchant.name} | ${merchant.offerTitle}`,
      path: `/pages/merchantDetail/merchantDetail?id=${merchant.id}`
    }
  }
})
