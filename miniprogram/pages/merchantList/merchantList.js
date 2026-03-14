const { categories, merchants } = require('../../data/mockData.js')
const { getFavoriteIds } = require('../../utils/memberStore.js')

function decorateMerchant(merchant, favoriteIds) {
  return Object.assign({}, merchant, {
    isFavorite: favoriteIds.indexOf(merchant.id) !== -1
  })
}

function buildSections(selectedCategoryId, favoriteIds) {
  const visibleCategories = selectedCategoryId === 'all'
    ? categories
    : categories.filter((category) => category.id === selectedCategoryId)

  return visibleCategories
    .map((category) => {
      const groupedMerchants = merchants
        .filter((merchant) => merchant.categoryId === category.id)
        .map((merchant) => decorateMerchant(merchant, favoriteIds))

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
    const favoriteIds = getFavoriteIds()
    const sections = buildSections(this.selectedCategoryId, favoriteIds)
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
