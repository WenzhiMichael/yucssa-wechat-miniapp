const source = require('./mockData.js')
const { getLanguage } = require('../utils/i18n.js')

// Content translations use stable IDs; logos, contact details and postal addresses
// remain unchanged. Future intake records can supply translations.zh / .en.
const content = {
  zh: {
    categories: {
      food: { name: '餐饮', shortName: '吃喝', subtitle: '正餐、饮品和甜点' },
      auto: { name: '汽车服务', shortName: '车', subtitle: '租车、维修和保养' },
      lifestyle: { name: '生活服务', shortName: '生活', subtitle: '打印、理发和生活服务' }
    },
    merchants: {
      '001': { name: '祥记绿茶 · 广东小炒 · 粥粉面', offerTitle: '免费领取会员卡', offerDetails: '免费领取一张价值 20 加元的会员卡。' },
      '002': { name: '狗不理', offerTitle: '85 折', offerDetails: '不可与其他优惠叠加使用。' },
      '003': { name: '多伦多山里屯铁锅炖', offerTitle: '95 折 + 1 次饮料优惠', offerDetails: '不可与其他优惠叠加使用。' },
      '004': { name: '刘一手火锅北美', offerTitle: '95 折 + 1 次饮料优惠', offerDetails: '适用于畅饮套餐；不可与其他优惠叠加使用。' },
      '005': { name: 'Heart Sushi', offerTitle: '9 折', offerDetails: '不可与其他优惠叠加使用。' },
      '006': { name: 'UnLimit Auto', offerTitle: '9 折', offerDetails: '优惠金额封顶 100 加元。' },
      '007': { name: 'Ai Car Detailing & Design', offerTitle: '9 折', offerDetails: '待补充' },
      '008': { name: 'Magic Beauty Salon', offerTitle: '9 折', offerDetails: '待补充' }
    },
    announcements: {
      a001: { label: '最新', title: '春季联谊夜开放报名', summary: '本学期名额有限，在小程序内报名的同学将优先加入候补队列。', cta: '查看活动安排' },
      a002: { label: '指南', title: '报税咨询下周开放报名', summary: '志愿者将介绍报税基础、税务账户设置，以及留学生通常需要准备的材料。', cta: '准备材料' },
      a003: { label: '合作', title: '三家北约克商户加入合作', summary: '新增工作日餐饮、实用打印和地铁一号线附近的理发福利。', cta: '查看福利' }
    },
    events: {
      e001: { month: '3月', title: '春季联谊夜', time: '下午 6:30', location: '约克大学学生中心', status: '报名中', note: '轻社交、破冰和社团交流桌同步进行。' },
      e002: { month: '4月', title: '职业交流茶话会', time: '下午 1:00', location: '第二学生中心', status: '名额有限', note: '校友简历修改和实习问答。' },
      e003: { month: '4月', title: '夜市社交局', time: '晚上 7:00', location: '万锦市中心', status: '即将候补', note: '合作商家联动打卡和小型外出活动。' }
    },
    serviceCards: {
      s001: { name: '新生支持', blurb: '租房、电话套餐、银行开户与第一个月的生活准备，一张清单轻松了解。', availability: '随时可用', owner: '社区团队' },
      s002: { name: '社团合作', blurb: '为校园组织提供海报建议、联合活动策划和赞助方引荐。', availability: '每周咨询时间', owner: '执行团队' },
      s003: { name: '志愿者计划', blurb: '参与活动、媒体与日常运营，选择短期任务或学期岗位。', availability: '正在招募', owner: '志愿者团队' }
    },
    supportChannels: {
      c001: { label: '联系邮箱', description: '用于正式咨询、赞助联系与合作申请。' },
      c002: { label: 'Instagram', description: '及时查看活动海报、报名消息与学联动态。' },
      c003: { label: '微信咨询', description: '校园出行、安家生活与活动问题的日常互助。' },
      c004: { label: '微信公众号', description: '关注活动推送、招新消息与公开公告。' }
    },
    joinOpportunities: {
      j001: { title: '媒体与设计', description: '设计海报、拍摄活动内容，一起打造学联的线上形象。', cadence: '灵活安排每周任务' },
      j002: { title: '活动与运营', description: '协助签到、后勤与现场协调，参与联谊、社交和主题活动。', cadence: '适合热爱现场活动的志愿者' },
      j003: { title: '合作与外联', description: '联系商家、校园社团与校友，拓展学联合作网络。', cadence: '适合善于沟通的同学' }
    }
  },
  en: {
    categories: {
      food: { name: 'Dining', shortName: 'Food', subtitle: 'Meals, drinks and desserts' },
      auto: { name: 'Auto services', shortName: 'Auto', subtitle: 'Rentals, repairs and maintenance' },
      lifestyle: { name: 'Life services', shortName: 'Life', subtitle: 'Printing, haircuts and daily essentials' }
    },
    merchants: {
      '001': { name: 'CheungKee Greentea Restaurant', offerTitle: 'Free membership card', offerDetails: 'Receive a free membership card worth CAD 20.' },
      '002': { name: 'Goubuli', offerTitle: '15% off', offerDetails: 'Cannot be combined with other offers.' },
      '003': { name: 'Happy Valley Village Restaurant Toronto', offerTitle: '5% off + one drink offer', offerDetails: 'Cannot be combined with other offers.' },
      '004': { name: 'Liuyishou Hot Pot North America', offerTitle: '5% off + one drink offer', offerDetails: 'Applies to the all-you-can-drink package. Cannot be combined with other offers.' },
      '005': { name: 'Heart Sushi', offerTitle: '10% off', offerDetails: 'Cannot be combined with other offers.' },
      '006': { name: 'UnLimit Auto', offerTitle: '10% off', offerDetails: 'Maximum discount: CAD 100.' },
      '007': { name: 'Ai Car Detailing & Design', offerTitle: '10% off', offerDetails: 'Details coming soon' },
      '008': { name: 'Magic Beauty Salon', offerTitle: '10% off', offerDetails: 'Details coming soon' }
    },
    announcements: {},
    events: {
      e001: { month: 'MAR', title: 'Spring Mixer', time: '6:30 PM', location: 'YorkU Student Centre', status: 'Registration open', note: 'Casual conversations, icebreakers and club meetups.' },
      e002: { month: 'APR', title: 'Career Coffee Chat', time: '1:00 PM', location: 'Second Student Centre', status: 'Limited spots', note: 'Resume reviews and internship Q&A with alumni.' },
      e003: { month: 'APR', title: 'Night Market Meetup', time: '7:00 PM', location: 'Downtown Markham', status: 'Waitlist soon', note: 'Partner check-ins and a casual group outing.' }
    },
    serviceCards: {}, supportChannels: {}, joinOpportunities: {}
  }
}
function getLocalizedData(language = getLanguage()) {
  const locale = language === 'en' ? 'en' : 'zh'
  const result = { ...source }
  for (const field of ['categories', 'merchants', 'announcements', 'events', 'serviceCards', 'supportChannels', 'joinOpportunities']) {
    result[field] = source[field].map(item => {
      const next = { ...item, ...content[locale][field][item.id], ...(item.translations && item.translations[locale]) }
      if (field === 'merchants') {
        if (next.address === '待补充') next.address = locale === 'en' ? 'Not provided' : '待补充'
        if (next.offerTitle === '学生福利') next.offerTitle = locale === 'en' ? 'Student benefit' : '学生福利'
      }
      return next
    })
  }
  return result
}
module.exports = { getLocalizedData }
