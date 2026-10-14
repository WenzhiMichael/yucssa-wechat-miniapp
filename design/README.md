# YUCSSA 界面设计

风格：学联酒红 `#821E3C`、暖白 `#F7F5F2`、香槟金 `#F3DFBE`。

- Monash：借鉴学联品牌感，将酒红用于会员卡、主要按钮和页面介绍。
- UCL Ucircle：借鉴清楚的会员与身份入口，首页展示会员码，邮箱验证集中在登录和个人页。
- Sheffield CSSA：借鉴商家福利的信息优先级，在商家列表直接显示优惠，详情页用票券式卡片呈现权益。

首页结构：问候 → 会员卡 → Wallet 状态 → 分类与商家福利 → 校园活动 → 联系学联。

七个页面统一使用无衬线字体、轻边框、24rpx 卡片圆角，正文背景保持暖白。分类使用浅色辅助色，身份验证状态仍使用绿色。

`preview.html` 是由现有 WXML、WXSS 和示例数据生成的可点击视觉预览，包含七个页面，无登录、支付或核销能力。实际效果以微信开发者工具和真机为准。`preview.jpg` 为主要页面预览图。

更新预览：从项目根目录运行 `node tools/build-design-preview.js`。图片需要重新截图。

参考：

- https://weboost.com.au/zh-hans/projects/app-msca
- https://www.uclcssa.com/%E5%89%AF%E6%9C%AC-%E5%AD%A6%E8%81%94%E5%8D%A1
- https://www.cssasheffield.com/newsinfo/872845.html

中英文：每个页面右上角提供语言切换，预览和小程序均记住选择。界面文案在 `miniprogram/utils/i18n.js`，内容翻译在 `miniprogram/data/localizedData.js`，新增商户可提供 `translations.zh` 和 `translations.en`。
