# YUCSSA 微信小程序

面向 York University 中国学生学者联谊会的校园信息与会员入口，使用原生微信小程序开发，包含商家优惠、活动、学生服务、联系方式和 York 邮箱登录。

**第一次使用建议先运行「开发者工具体验模式」：不需要邮件密钥、不发送验证码，也不用启动后端。** 如果只想看设计，可以直接打开浏览器预览。真实微信身份与邮箱绑定需要单独配置后端。

## 目录

- [当前功能与边界](#当前功能与边界)
- [方式一：只看浏览器设计预览](#方式一只看浏览器设计预览)
- [方式二：在开发者工具里体验小程序](#方式二在开发者工具里体验小程序)
- [方式三：配置真实邮箱登录](#方式三配置真实邮箱登录)
- [手机、Windows 与远程开发](#手机windows-与远程开发)
- [日常使用与数据维护](#日常使用与数据维护)
- [项目结构](#项目结构)
- [测试与检查](#测试与检查)
- [常见问题](#常见问题)
- [部署与交接](#部署与交接)
- [Apple Wallet 计划](#apple-wallet-计划)

## 当前功能与边界

| 模块 | 当前可以做什么 |
| --- | --- |
| 登录 | 验证 York 邮箱并绑定微信身份；开发者工具内可直接体验 |
| 首页 | 展示会员信息、会员码、分类入口与活动内容 |
| 合作商家 | 查看餐饮、汽车服务、生活服务三个分类的商家 |
| 商家详情 | 查看和复制优惠、复制地址、拨打电话、打开地图 |
| 学生服务 | 查看公告、活动及服务介绍 |
| 联系我们 | 查看联系方式、招新内容与公众号占位区域 |
| 个人页 | 查看邮箱验证状态、会员资料并退出登录 |
| 中英文 | 七个页面支持切换，语言选择保存在本机 |
| Apple Wallet | 首页入口仍为占位，尚不能生成或领取真实 Wallet 卡片 |

商家、活动和服务使用本地内容文件；页面上的活动报名状态不代表已经实现报名后台。目前没有商家核销、支付或运营管理后台。会员码的展示也不代表已经具备身份核验服务。

正常登录后才能进入首页。体验身份仅在开发者工具的开发环境有效，不能作为真机或发布版登录凭据。当前页面登录检查使用本地资料；以后增加受保护的后台功能时，需要在服务器验证身份，不能只信任页面状态。

## 方式一：只看浏览器设计预览

适合产品、设计或运营人员快速查看页面，不需要微信开发者账号或后端。

1. 下载项目 ZIP 并解压，或通过 Git 克隆项目。
2. 用浏览器打开 `design/preview.html`。
3. 查看各页面和中英文效果。设计说明在 [design/README.md](design/README.md)。

这是视觉预览，不会进行真实微信登录、发送邮件或调用真实手机号、地图功能。实际运行效果以微信开发者工具和手机为准。

修改小程序页面后，安装 Node.js，并在项目根目录重新生成预览：

```sh
node tools/build-design-preview.js
```

`design/preview.jpg` 和 `design/preview-en.jpg` 是静态截图，不会随以上命令自动重新截图。

## 方式二：在开发者工具里体验小程序

### 1. 准备工具

- Windows 或 macOS。
- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)。
- Node.js 与 npm：建议使用仍受支持的 Node.js LTS；当前服务代码需要 Node.js 18 或以上提供的内置 `fetch`。
- Git（如果使用 ZIP 下载，可以不装 Git）。

在终端确认安装成功：

```sh
node -v
npm -v
```

Windows 可使用 PowerShell；macOS 可使用终端。以下命令都在**项目根目录**执行，即包含 `package.json` 和 `project.config.json` 的目录。

### 2. 获取项目并安装依赖

```sh
git clone https://github.com/WenzhiMichael/yucssa-wechat-miniapp.git
cd yucssa-wechat-miniapp
npm ci
```

也可以在 GitHub 点击 Code → Download ZIP，解压后在该文件夹打开终端，执行 `npm ci`。不要只复制 `miniprogram/`，配置、后端和测试都在项目根目录。

### 3. 导入微信开发者工具

1. 打开开发者工具，使用微信扫码登录。
2. 选择导入项目，目录选择本项目根目录。
3. 确认项目类型是小程序；`project.config.json` 已指定代码目录为 `miniprogram/`。
4. 使用项目 AppID 的人员需要相应开发者权限；仓库中包含 AppID 不代表自动获得权限。其他团队请使用自己的小程序 AppID，并修改 `project.config.json` 的 `appid`。
5. 编译项目，进入登录页。
6. 点击 **「先体验一下」**，进入首页。

成功标志：显示体验身份和 `PREVIEW` 会员码，可以浏览商家、服务、联系方式及切换语言。

**这条体验路径不需要 `.env`，也不需要启动验证服务。** 体验按钮只在 `envVersion=develop` 且 `platform=devtools` 时显示；微信真机、体验版和正式版不提供此入口。

开发者工具的「服务端口」仅用于命令行自动打开或控制工具。手动导入项目时不需要开启，也与下面的 `8787` 验证 API 端口不是同一个服务。

## 方式三：配置真实邮箱登录

### 1. 准备账号与凭据

- 自己有权限使用的微信小程序 AppID 和对应 AppSecret。
- Resend 邮件服务账号、API Key，以及可向目标收件人发信的发件地址。正式发信请在 Resend 完成发件域名验证；测试发件人可能限制收件范围。
- 一个可接收邮件的 `@yorku.ca` 或 `@my.yorku.ca` 邮箱。

不能用其他小程序的 AppSecret 搭配当前 AppID。AppSecret 和 Resend API Key 都只放在后端，不放入小程序代码。

### 2. 创建本地配置文件

仅在 `.env` 不存在时，从模板复制；不要覆盖已有凭据。

macOS / Linux：

```sh
cp -n .env.example .env
```

Windows PowerShell：

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

编辑 `.env`，填写自己的值：

```dotenv
PORT=8787
RESEND_API_KEY=你的Resend密钥
EMAIL_FROM=YUCSSA <noreply@你的已验证域名>
WECHAT_APP_ID=你的小程序AppID
WECHAT_APP_SECRET=对应的小程序AppSecret
```

| 配置 | 用途 |
| --- | --- |
| `PORT` | API 监听端口，默认 `8787` |
| `RESEND_API_KEY` | 调用 Resend 发验证码 |
| `EMAIL_FROM` | 邮件发件地址，必须符合 Resend 账号的发件要求 |
| `WECHAT_APP_ID` | 留空时读取 `project.config.json` 的 AppID；必须和前端一致 |
| `WECHAT_APP_SECRET` | 后端把微信登录 code 换成 `openid`，用于邮箱绑定 |

`.env` 已被 Git 忽略，不要上传 GitHub、粘贴到聊天或打包给其他人。配置修改后需要重启后端。系统已经设置的同名环境变量会优先于 `.env`。

### 3. 启动后端并检查

```sh
npm run start:verify-server
```

保持该终端运行。停止服务按 `Ctrl+C`。这是普通前台进程，关闭终端不会自动变成长期运行的服务器。

在**运行后端的同一台电脑**打开：

```text
http://127.0.0.1:8787/health
```

配置齐全时应返回：

```json
{
  "ok": true,
  "resendConfigured": true,
  "wechatConfigured": true
}
```

这些标志仅检查配置是否有值，不代表密钥有效、发件域名验证成功或微信权限正常。完整验证仍需要实际发送并完成一次验证码登录。

### 4. 连接小程序

检查 `miniprogram/config/verification.js`：

```js
module.exports = {
  verificationApiBaseUrl: 'http://127.0.0.1:8787'
}
```

在同机模拟器调试时，打开开发者工具的「详情 → 本地设置」，勾选不校验合法域名等本地调试选项（名称可能随工具版本变化）。`project.private.config.json` 是每台电脑自己的设置，不在 Git 中，新电脑要重新配置。

如果修改后端端口，也要同步修改这里的地址，然后重新编译。API 地址末尾不要加 `/`，请求工具会追加接口路径。

### 5. 完成一次真实登录

1. 如果当前是体验身份，先在个人页退出登录。
2. 填写 York 学校邮箱，点击发送验证码。
3. 检查收件箱及垃圾邮件，填入收到的六位数字验证码。
4. 点击登录并进入首页。
5. 在个人页检查验证状态和邮箱。

当前规则：验证码有效期 10 分钟、重发间隔 60 秒、错误尝试上限 5 次。失败后按页面提示重新申请验证码。

发送和确认验证码分别使用新的 `wx.login` code。不要复制旧 code 反复调用，也不能把发送账号的验证码拿到另一个微信账号确认。

### 邮箱与微信绑定规则

- 每个已验证邮箱只能绑定一个微信 `openid`，邮箱大小写会统一处理。
- 一个微信账号只保留一个有效的学校邮箱绑定。
- 同一个微信账号验证新邮箱后，会替换旧绑定；旧邮箱不再保留该有效绑定。
- 退出登录只清除本机登录资料，**不会解除服务器上的邮箱绑定**。
- 当前没有面向用户的解绑或账号申诉界面。

### 后端接口概览

| 方法与路径 | 请求内容 | 用途 |
| --- | --- | --- |
| `GET /health` | 无 | 服务存活与配置检查 |
| `POST /api/verification/email/send` | `email`、`wechatLoginCode` | 验证微信身份并发送验证码 |
| `POST /api/verification/email/verify` | `email`、`code`、新的 `wechatLoginCode` | 验证验证码、保存绑定、返回 `verificationTicket` |

`verificationTicket` 属于登录相关数据，不要写入公开日志。以上接口不是 Apple Wallet 发卡接口。

## 手机、Windows 与远程开发

**`127.0.0.1` 永远表示当前访问设备自己，不是远程 Mac。**

| 使用场景 | 正确做法 |
| --- | --- |
| Mac 同时运行模拟器和后端 | 模拟器可连接 Mac 的 `127.0.0.1:8787` |
| Windows 同时运行模拟器和后端 | 在 Windows 获取项目、安装依赖并启动后端，使用 Windows 的本机地址 |
| Windows 远程连接 Mac 上的 Codex | Windows 浏览器访问 `127.0.0.1` 不会到达 Mac；可把设计预览文件复制到 Windows 看，或部署可访问的服务 |
| 手机测试、体验版或正式版 | 使用手机可访问的 HTTPS API，并配置小程序的 request 合法域名 |

复制到新电脑时不要复制 `node_modules/`，在新电脑重新执行 `npm ci`；本地 `.env` 和开发者工具设置也要单独配置。开发者工具中关闭域名检查不等于线上可以使用 HTTP 或 localhost。

真机建议流程：部署后端 → 配置 HTTPS → 在微信小程序后台添加 request 合法域名 → 修改前端 API 地址 → 重新编译并预览 → 用有权限的微信账号扫码测试。

## 日常使用与数据维护

### 用户如何使用

登录后在首页选择商家分类，进入详情查看优惠与联系方式；从导航进入服务和联系页面；在个人页查看验证状态或退出。每页右上角可以切换中英文，用户昵称、邮箱、商家标识和邮寄地址保持原始内容。

### 维护者如何修改内容

| 内容 | 文件 |
| --- | --- |
| 商家、分类、活动、联系方式等基础内容 | `miniprogram/data/mockData.js` |
| 商家及活动等中英文内容 | `miniprogram/data/localizedData.js` |
| 按钮、导航、提示等界面翻译 | `miniprogram/utils/i18n.js` |
| 商家 Logo | `miniprogram/assets/merchant-logos/` |
| 页面布局与交互 | `miniprogram/pages/` 下各页的 WXML、WXSS、JS |
| 全局样式 | `miniprogram/app.wxss` |
| API 地址 | `miniprogram/config/verification.js` |

新增商家时按已有数据结构补齐字段，使用唯一 ID，并同步维护翻译和 Logo 路径；具体资源约定见 [Logo 说明](miniprogram/assets/merchant-logos/README.md)。修改后重新编译，检查中文和英文，再按需生成设计预览。

内容目前随小程序代码发布，修改本地文件不会自动更新用户已经打开的正式小程序。

## 项目结构

```text
miniprogram/
  pages/
    login/                 # 登录与模拟器体验入口
    home/                  # 首页、会员资料与 Wallet 占位
    merchantList/          # 商家列表
    merchantDetail/        # 商家详情
    services/              # 学生服务
    contact/               # 联系与招新
    profile/               # 个人页与退出
  data/
    mockData.js            # 基础内容
    localizedData.js       # 内容翻译
  utils/
    i18n.js                # 界面翻译、语言持久化
    memberStore.js         # 本地身份与体验状态
    verificationApi.js     # 后端请求封装
  config/verification.js   # 后端地址
  assets/merchant-logos/   # 商家图片
  app.js / app.json / app.wxss
server/index.js            # Node HTTP API、验证码和绑定存储
server/.verification-store.json  # 运行时私人数据，不提交
tests/                   # 登录与邮箱绑定测试
design/                  # 浏览器设计预览、截图和说明
tools/                   # 设计预览生成工具
.env.example              # 可分享的环境变量模板
.env                      # 个人密钥，不提交
project.config.json       # 共享小程序配置与 AppID
project.private.config.json # 本机开发工具设置，不提交
package.json / package-lock.json
```

## 测试与检查

安装依赖后执行：

```sh
npm test
```

测试使用模拟微信与邮件服务，覆盖登录、退出、首页访问限制、体验模式、邮箱与微信绑定、并发及持久化。不会发送真实邮件，不需要真实密钥，也不要求预先启动后端。测试会临时监听本机端口，需要运行环境允许。

自动测试通过后，页面改动仍需在开发者工具检查编译和交互。建议手动检查：体验登录 → 首页 → 商家详情 → 中英文切换 → 退出 → 再次进入登录页。正式登录另用真实账号完成一次完整验证。

## 常见问题

| 问题 | 排查方法 |
| --- | --- |
| 找不到「先体验一下」 | 确认在微信开发者工具开发环境，而非手机或体验版；检查是否已登录 |
| AppID 无权限或导入失败 | 请项目管理员添加开发者权限，或改用自己的小程序 AppID |
| 无法连接验证服务 | 确认服务终端仍运行、地址和端口一致，先在同机访问 `/health` |
| Windows 打不开 Mac 的 localhost | localhost 只指 Windows 自己；参考远程开发章节 |
| 提示 request 域名不合法 | 本地模拟器检查调试设置；真机或发布版配置 HTTPS 与合法域名 |
| `resendConfigured` 为 false | 检查 API Key 和发件人是否都有值，重启后端 |
| `wechatConfigured` 为 false | 检查 AppID 和 AppSecret，重启后端 |
| 健康检查全为 true 但发信失败 | 检查密钥有效性、Resend 发件域名及收件限制、微信 AppID/Secret 配对；需要时按微信错误提示检查服务器 IP 白名单 |
| 收不到邮件 | 检查邮箱拼写、垃圾邮件和邮件服务投递记录；等待重发间隔后再试 |
| 邮箱已经绑定其他微信 | 使用原绑定微信；退出登录不会解除绑定，不要通过删除全部数据解决 |
| `EADDRINUSE` | 端口已被占用；停止旧的验证服务，或更换 `PORT` 并同步前端地址 |
| 修改 `.env` 后没有变化 | 重启后端；检查是否有同名系统环境变量覆盖它 |
| 手机不能使用体验身份 | 这是预期行为，手机需要完成真实邮箱登录 |
| Wallet 点击后只有提示 | 目前入口是占位，尚未实现正式发卡 |

后端终端中的错误可用于定位问题，但分享日志前请隐藏密钥、邮箱、验证码和身份凭据。

## 部署与交接

当前后端适合本地开发或单实例验证，不能直接当作已经完成生产部署的服务。

- 后端持久化文件是 `server/.verification-store.json`，保存验证码状态、验证记录和微信邮箱绑定。需要限制访问并备份；不要上传仓库或放进公开下载目录。
- 文件写入只在**一个 Node 进程内**串行协调，使用原子替换保存。不要让多个进程或实例共享这个文件。多实例部署前应迁移数据库，并为邮箱与 `openid` 建立唯一约束。
- 部署环境必须支持持久化写入。临时文件系统重启后丢失会导致绑定记录消失。
- 使用进程管理、HTTPS 和正确的环境变量；不把开发电脑当作长期在线服务器。
- 发布前确认邮件配额、接口防滥用措施、用户信息处理说明、真实内容与联系方式，以及微信审核要求。现有邮箱冷却机制不等于完整的生产防滥用系统。
- 后续需要保护的后台接口应独立校验服务端身份，并补齐会话失效等机制。
- 上传小程序前再次检查 API 地址，不能仍是 `127.0.0.1`。

给其他维护者交接时，提供代码、自己的账号权限配置方法和数据备份方案。不要通过仓库交接个人密钥。仓库中的 AppID、示例内容和品牌资源，也不代表对外授予账号访问或品牌使用权限。

## Apple Wallet 计划

**当前代码只保留入口，尚未实现卡片页、签名、下载或一键添加。**

已讨论的目标是：用户登录后，使用已验证的学校邮箱，首次补充姓名与手机号，生成显示这三项信息及 YUCSSA 标识的个人卡片，再由用户确认添加到 Apple Wallet。该目标不包含商家扫码或核销。

当前登录资料不等于已经采集了真实姓名与手机号，手机号采集及保存仍需实现。Wallet 的正式签发还需要 Apple 签名证书或支持自动发卡的第三方服务；前端设计预览不能替代真实签名卡片。微信内的领取流程需要真机测试，必要时通过 Safari 完成。

Apple 开发者账号、第三方服务和后台的费用按实际方案确认，不承诺免费正式发卡。可参考 [Apple Wallet 开发说明](https://developer.apple.com/wallet/get-started/) 与 [Apple 开发者会费减免](https://developer.apple.com/help/account/membership/fee-waivers/)。

## 使用许可

Copyright 2026 YUCSSA. All rights reserved.

本仓库目前未提供开源许可证。公开可见不代表允许任意商用、转载品牌素材或对外再分发；需要复用或发布时，请先联系项目维护者取得授权。
