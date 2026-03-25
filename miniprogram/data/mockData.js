const merchantIntake = require('./merchantIntake.js')

const categories = [
  {
    id: 'food',
    name: '餐饮',
    shortName: '吃喝',
    subtitle: '正餐、饮品和甜点',
    accent: '#8f1d20',
    surface: '#fbe9e5'
  },
  {
    id: 'auto',
    name: '汽车服务',
    shortName: '车',
    subtitle: '租车、维修和保养',
    accent: '#1d6a5d',
    surface: '#e6f5ef'
  },
  {
    id: 'lifestyle',
    name: '生活服务',
    shortName: '生活',
    subtitle: '打印、理发和生活服务',
    accent: '#334a8a',
    surface: '#eaf0ff'
  }
]

const rawMerchants = [
  {
    id: '001',
    categoryId: 'food',
    name: 'Taste of Hong Kong',
    initials: 'TH',
    area: 'North York',
    address: '4789 Yonge St, North York',
    phone: '647-555-0183',
    hours: 'Daily 11:30 - 22:00',
    accent: '#8f1d20',
    surface: '#fbe9e5',
    distance: '距 YorkU 约 23 分钟',
    offerTitle: '学生套餐 $12.90',
    offerDetails: '出示有效 YUCSSA 会员码，可享主食套餐加港式奶茶优惠。',
    description: '通勤友好的港式快餐店，适合课间快速解决午饭或晚饭。',
    tags: ['宵夜', '快餐', 'North York'],
    redemptionSteps: [
      'Open your YUCSSA member card before ordering.',
      'Show the cashier the card or member code.',
      'Offer is valid Monday to Thursday for dine-in or takeout.'
    ],
    perks: ['适合聚餐', '可打包', '工作日优惠'],
    latitude: 43.76157,
    longitude: -79.41112
  },
  {
    id: '002',
    categoryId: 'drink',
    name: 'Snowday Tea Bar',
    initials: 'ST',
    area: 'Finch',
    address: '5460 Yonge St, North York',
    phone: '647-555-0264',
    hours: 'Daily 12:00 - 23:00',
    accent: '#b46a23',
    surface: '#fff1dd',
    distance: '距 YorkU 约 26 分钟',
    offerTitle: '招牌奶茶买一送一',
    offerDetails: '每晚 6 点后，同单两杯中杯招牌饮品可享买一送一。',
    description: '适合自习和聊天的奶茶店，晚间人流稳定，甜品选择也比较多。',
    tags: ['甜品', '自习', '晚间优惠'],
    redemptionSteps: [
      'Mention the YUCSSA evening offer when ordering.',
      'Present your member card at payment.',
      'Offer is limited to one redemption per member each day.'
    ],
    perks: ['安静座位', '营业较晚', '甜品饮品'],
    latitude: 43.77791,
    longitude: -79.41465
  },
  {
    id: '003',
    categoryId: 'wellness',
    name: 'Motion Fit Studio',
    initials: 'MF',
    area: 'Vaughan',
    address: '7700 Jane St, Vaughan',
    phone: '905-555-0198',
    hours: 'Mon - Sat 07:00 - 21:00',
    accent: '#1d6a5d',
    surface: '#e6f5ef',
    distance: '距 YorkU 约 19 分钟',
    offerTitle: '新人首周课程通票 $18',
    offerDetails: '包含瑜伽、拉伸和基础力量课程，适合学生首次体验。',
    description: '小型运动工作室，课程节奏适合学期中安排锻炼和恢复。',
    tags: ['健身', '放松', '首次体验'],
    redemptionSteps: [
      'Book your trial week through the front desk phone number.',
      'Bring your student ID and YUCSSA member card on the first visit.',
      'Trial week must start within 14 days of booking.'
    ],
    perks: ['新手友好', '更衣空间', '周末课程'],
    latitude: 43.79044,
    longitude: -79.52744
  },
  {
    id: '004',
    categoryId: 'lifestyle',
    name: 'Finch Print Lab',
    initials: 'FP',
    area: 'North York',
    address: '5325 Yonge St, North York',
    phone: '416-555-0115',
    hours: 'Mon - Fri 09:00 - 19:00',
    accent: '#334a8a',
    surface: '#eaf0ff',
    distance: '距 YorkU 约 24 分钟',
    offerTitle: '海报、简历和册子打印 85 折',
    offerDetails: '适合社团海报、作品集、面试资料和迎新物料打印。',
    description: '偏实用型的打印店，适合学校作业和社团宣传的日常需求。',
    tags: ['实用', '社团', '当天取'],
    redemptionSteps: [
      'Send files by email or bring them on USB.',
      'Mention the YUCSSA printing discount before payment.',
      'Large format printing may require one extra business day.'
    ],
    perks: ['当天可取', '简历友好', '批量打印'],
    latitude: 43.77257,
    longitude: -79.41433
  },
  {
    id: '005',
    categoryId: 'food',
    name: 'North Star Hotpot',
    initials: 'NH',
    area: 'Markham',
    address: '8360 Kennedy Rd, Markham',
    phone: '905-555-0172',
    hours: 'Daily 12:00 - 23:30',
    accent: '#7a2028',
    surface: '#f8e3e2',
    distance: '距 YorkU 约 38 分钟',
    offerTitle: '4 人及以上免费升级锅底',
    offerDetails: '适合社交聚餐、学生会聚会和社团团建。',
    description: '偏热闹的火锅店，大桌较多，适合多人一起去。',
    tags: ['聚餐', '社交', '周末'],
    redemptionSteps: [
      'Reserve by phone and mention YUCSSA.',
      'All members in the party should arrive before the table is seated.',
      'Offer applies to one table per booking.'
    ],
    perks: ['大桌位', '夜间聚会', '支持预订'],
    latitude: 43.85649,
    longitude: -79.3044
  },
  {
    id: '006',
    categoryId: 'lifestyle',
    name: 'Maple Cuts Studio',
    initials: 'MC',
    area: 'North York',
    address: '4950 Yonge St, North York',
    phone: '416-555-0146',
    hours: 'Tue - Sun 10:00 - 20:00',
    accent: '#4a3c7d',
    surface: '#eeebff',
    distance: '距 YorkU 约 25 分钟',
    offerTitle: '学生剪发 $22',
    offerDetails: '含简单造型，工作日可加优惠洗发服务。',
    description: '预约效率高，适合课间、面试前或活动前快速整理形象。',
    tags: ['理发', '面试准备', '工作日'],
    redemptionSteps: [
      'Book through the phone number and mention the student rate.',
      'Arrive with your member code ready at check-in.',
      'Weekday wash add-on depends on slot availability.'
    ],
    perks: ['预约快', '学生价', '利落造型'],
    latitude: 43.76218,
    longitude: -79.41144
  }
]

function resolveText() {
  for (let index = 0; index < arguments.length; index += 1) {
    const value = arguments[index]

    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

function resolveList(value) {
  return Array.isArray(value) ? value : []
}

function buildInitials(name) {
  if (!name) {
    return 'YU'
  }

  const words = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  if (words.length) {
    return words.map((word) => word.slice(0, 1).toUpperCase()).join('')
  }

  return name.slice(0, 2).toUpperCase()
}

function normalizeMerchant(merchant) {
  const category = categories.find((item) => item.id === merchant.categoryId)
  const name = resolveText(merchant.name, merchant.title, merchant.merchantName)
  const offerTitle = resolveText(
    merchant.promotionTitle,
    merchant.promotionName,
    merchant.offerTitle,
    merchant.promotion
  )
  const offerDetails = resolveText(
    merchant.promotionDetails,
    merchant.promotionDescription,
    merchant.promotionCopy,
    merchant.offerDetails,
    merchant.promotion
  )
  const address = resolveText(
    merchant.address,
    merchant.merchantAddress,
    merchant.businessAddress,
    merchant.locationAddress
  )

  return Object.assign({}, merchant, {
    name,
    initials: resolveText(merchant.initials) || buildInitials(name),
    logo: resolveText(merchant.logo, merchant.logoUrl, merchant.image, merchant.imageUrl),
    accent: resolveText(merchant.accent) || (category ? category.accent : '#334a8a'),
    surface: resolveText(merchant.surface) || (category ? category.surface : '#eaf0ff'),
    offerTitle: offerTitle || '学生福利',
    offerDetails: offerDetails || '待补充',
    address: address || '待补充',
    tags: resolveList(merchant.tags),
    perks: resolveList(merchant.perks),
    redemptionSteps: resolveList(merchant.redemptionSteps)
  })
}

function mergeMerchants(baseMerchants, intakeMerchants) {
  const merchantMap = {}

  baseMerchants.forEach((merchant) => {
    merchantMap[merchant.id] = merchant
  })

  intakeMerchants.forEach((merchant) => {
    merchantMap[merchant.id] = Object.assign({}, merchantMap[merchant.id], merchant)
  })

  return Object.keys(merchantMap).map((merchantId) => merchantMap[merchantId])
}

function isDisplayableMerchant(merchant) {
  const validCategoryIds = categories.map((category) => category.id)

  return Boolean(merchant.name) && validCategoryIds.indexOf(merchant.categoryId) !== -1
}

const merchants = mergeMerchants(rawMerchants, merchantIntake)
  .map(normalizeMerchant)
  .filter(isDisplayableMerchant)

const announcements = [
  {
    id: 'a001',
    label: 'New',
    title: 'Spring mixer registration is live',
    summary: 'Seats are capped this term, so students who RSVP in-app get first access to the queue.',
    cta: 'See event plan'
  },
  {
    id: 'a002',
    label: 'Guide',
    title: 'Tax clinic sign-up opens next week',
    summary: 'Volunteer slots will cover filing basics, CRA setup, and the documents international students usually need.',
    cta: 'Prepare documents'
  },
  {
    id: 'a003',
    label: 'Partner',
    title: 'Three new North York merchant partners joined',
    summary: 'The latest drop adds quicker weekday food, practical printing, and a new haircut offer close to Line 1.',
    cta: 'Browse deals'
  }
]

const events = [
  {
    id: 'e001',
    month: 'MAR',
    day: '28',
    title: '春季联谊夜',
    time: '6:30 PM',
    location: 'YorkU Student Centre',
    status: '报名中',
    note: '轻社交、破冰和社团交流桌同步进行。'
  },
  {
    id: 'e002',
    month: 'APR',
    day: '03',
    title: '职业 Coffee Chat',
    time: '1:00 PM',
    location: 'Second Student Centre',
    status: '名额有限',
    note: '校友简历修改和实习问答。'
  },
  {
    id: 'e003',
    month: 'APR',
    day: '12',
    title: '夜市社交局',
    time: '7:00 PM',
    location: 'Downtown Markham',
    status: '即将候补',
    note: '合作商家联动打卡和小型外出活动。'
  }
]

const serviceCards = [
  {
    id: 's001',
    name: 'New Student Support',
    blurb: 'Housing, phone plans, banking, SIM setup, and first-month essentials in one checklist.',
    availability: 'Always available',
    owner: 'Community team'
  },
  {
    id: 's002',
    name: 'Club Collaboration Desk',
    blurb: 'Poster review, co-hosted event planning, and sponsor introduction support for campus orgs.',
    availability: 'Weekly office hours',
    owner: 'Executive board'
  },
  {
    id: 's003',
    name: 'Volunteer Pathway',
    blurb: 'Short-term shifts and semester-long roles for events, media, and operations.',
    availability: 'Recruiting now',
    owner: 'Volunteer team'
  }
]

const supportChannels = [
  {
    id: 'c001',
    label: 'General email',
    value: 'yucssa@yorku.ca',
    description: 'For formal questions, sponsor contact, and partnership requests.'
  },
  {
    id: 'c002',
    label: 'Instagram',
    value: '@yucssa',
    description: 'Fastest place to catch posters, event drops, and campaign updates.'
  },
  {
    id: 'c003',
    label: 'WeChat support',
    value: 'YUCSSA-Support',
    description: 'Daily peer help for transit, settling in, and activity questions.'
  },
  {
    id: 'c004',
    label: 'Official account',
    value: 'YUCSSA-Official',
    description: 'Use this for event pushes, recruitment updates, and public announcements.'
  }
]

const quickActions = [
  {
    id: 'q001',
    title: 'Partner Deals',
    subtitle: 'Verified student-only perks',
    route: '/pages/merchantList/merchantList'
  },
  {
    id: 'q002',
    title: 'Events & Services',
    subtitle: 'What the student association is running',
    route: '/pages/services/services'
  },
  {
    id: 'q003',
    title: 'Member Card',
    subtitle: 'Open your profile and code',
    route: '/pages/profile/profile'
  },
  {
    id: 'q005',
    title: '联系我们',
    subtitle: '咨询或加入团队',
    route: '/pages/contact/contact'
  }
]

const joinOpportunities = [
  {
    id: 'j001',
    title: 'Media & Design',
    description: 'Make posters, shoot event content, and shape how the student association looks online.',
    cadence: 'Flexible weekly tasks'
  },
  {
    id: 'j002',
    title: 'Events & Operations',
    description: 'Help run check-in, logistics, and on-site coordination for mixers, socials, and workshops.',
    cadence: 'Best for active event volunteers'
  },
  {
    id: 'j003',
    title: 'Partnership & Outreach',
    description: 'Reach merchants, campus clubs, and alumni contacts to expand the YUCSSA network.',
    cadence: 'Good fit for communicators'
  }
]

const onboardingHighlights = [
  'Campus life, student offers, and support resources in one place',
  'A warmer, more editorial UI built for association updates instead of a plain merchant list',
  'Local-only mock data so the app can be demoed immediately without a backend'
]

module.exports = {
  announcements,
  categories,
  events,
  merchants,
  onboardingHighlights,
  quickActions,
  joinOpportunities,
  serviceCards,
  supportChannels
}
