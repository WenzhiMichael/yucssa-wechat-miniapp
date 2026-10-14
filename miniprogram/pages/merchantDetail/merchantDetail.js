const { localizedPage, t } = require('../../utils/i18n.js')
const { getLocalizedData } = require('../../data/localizedData.js')

function findMerchantById(merchantId) {
  return getLocalizedData().merchants.find((merchant) => merchant.id === merchantId)
}

Page(localizedPage('merchantDetail', {
  data: {
    merchant: null,
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
        title: t('message.merchantMissing'),
        icon: 'none'
      })
      return
    }

    const { merchants } = getLocalizedData()
    const relatedMerchants = merchants
      .filter((item) => item.categoryId === merchant.categoryId && item.id !== merchant.id)
      .slice(0, 2)

    wx.setNavigationBarTitle({
      title: merchant.name
    })

    this.setData({
      merchant,
      relatedMerchants
    })
  },

  copyOffer() {
    wx.setClipboardData({
      data: this.data.merchant.offerDetails,
      success: () => {
        wx.showToast({
          title: t('message.offerCopied'),
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
          title: t('message.addressCopied'),
          icon: 'none'
        })
      }
    })
  },

  callMerchant() {
    if (!this.data.merchant.phone) {
      wx.showToast({
        title: t('message.phoneMissing'),
        icon: 'none'
      })
      return
    }

    wx.makePhoneCall({
      phoneNumber: this.data.merchant.phone
    })
  },

  openMap() {
    if (
      typeof this.data.merchant.latitude !== 'number' ||
      typeof this.data.merchant.longitude !== 'number'
    ) {
      wx.showToast({
        title: t('message.mapMissing'),
        icon: 'none'
      })
      return
    }

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
}))
