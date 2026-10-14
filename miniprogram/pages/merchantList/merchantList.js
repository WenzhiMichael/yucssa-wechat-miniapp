const { localizedPage, t } = require('../../utils/i18n.js')
const { getLocalizedData } = require('../../data/localizedData.js')
const { categories } = getLocalizedData()

function buildSections(selectedCategoryId) {
  const { categories, merchants } = getLocalizedData()
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

Page(localizedPage('merchantList', {
  data: {
    pageTitle: t('nav.merchantList'),
    categories,
    selectedCategoryId: 'all',
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
    const { categories } = getLocalizedData()
    const currentCategory = categories.find((category) => category.id === this.selectedCategoryId)
    const pageTitle = currentCategory ? currentCategory.name : t('nav.merchantList')

    wx.setNavigationBarTitle({
      title: pageTitle
    })

    this.setData({
      pageTitle,
      selectedCategoryId: this.selectedCategoryId,
      sections
    })
  },

  selectCategory(e) {
    this.selectedCategoryId = e.currentTarget.dataset.id
    this.refreshPageData()
  },

  openMerchant(e) {
    const merchantId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/merchantDetail/merchantDetail?id=${merchantId}`
    })
  }
}))
