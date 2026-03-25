const { categories, merchants } = require('../../data/mockData.js')

function buildSections(selectedCategoryId) {
  const visibleCategories = selectedCategoryId === 'all'
    ? categories
    : categories.filter((category) => category.id === selectedCategoryId)

  return visibleCategories
    .map((category) => {
      const groupedMerchants = merchants
        .filter((merchant) => merchant.categoryId === category.id)

      return Object.assign({}, category, {
        merchants: groupedMerchants
      })
    })
    .filter((section) => section.merchants.length)
}

Page({
  data: {
    pageTitle: '合作商户',
    sections: []
  },

  onLoad(options) {
    this.selectedCategoryId = options.categoryId || 'all'
    this.refreshPageData()
  },

  onShow() {
    this.refreshPageData()
  },

  refreshPageData() {
    const sections = buildSections(this.selectedCategoryId)
    const currentCategory = categories.find((category) => category.id === this.selectedCategoryId)
    const pageTitle = currentCategory ? currentCategory.name : '合作商户'

    wx.setNavigationBarTitle({
      title: pageTitle
    })

    this.setData({
      pageTitle,
      sections
    })
  },

  openMerchant(e) {
    const merchantId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/merchantDetail/merchantDetail?id=${merchantId}`
    })
  }
})
