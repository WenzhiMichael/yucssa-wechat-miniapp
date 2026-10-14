# YUCSSA WeChat Mini Program

York University Chinese Students and Scholars Association (YUCSSA) official mini program project.

This version is no longer the old merchant-only MVP. It has been redesigned into a small campus hub centered on:

- member identity and member code display
- York email verification before access
- one WeChat account can bind only one York email
- Apple Wallet card placeholder entry
- categorized partner merchants and discount details
- events and student services
- contact and recruitment information

## Current Features

- `登录页`:
  - York email verification gate
  - one login action verifies the code and opens Home
  - simulator-only preview login without email credentials
  - optional WeChat profile login for avatar/nickname
- `首页`:
  - member code strip
  - Apple Wallet placeholder strip
  - upcoming events
  - bottom category dock for dining, auto services, and lifestyle services
- `合作商户页`:
  - sectioned category layout
  - 3-column merchant grid
  - tap merchant to open discount detail
- `商户详情页`:
  - discount details
  - copy offer
  - copy address
  - phone call and map jump
- `学生服务页`:
  - announcements, events, support information
- `联系我们页`:
  - contact channels
  - join-us content
  - official account placeholder area
- `个人页`:
  - member profile
  - York email verification status
  - contact shortcuts

Outside the developer preview described below, Home opens only after a complete email verification. Older demo profiles without a verified York email and verification ticket return to the login page. Logging out clears local login data and resets navigation to login.

For interface testing without credentials, the login page shows `先体验一下` only in WeChat Developer Tools with `envVersion=develop` and `platform=devtools`. This creates a local preview profile marked `preview`, with a `PREVIEW` member code and no verified email, verification ticket, or server-side binding. Preview profiles cannot open Home on real devices or in trial/release builds. Formal member login still requires email verification.

Each verified York email is bound to one WeChat `openid`. Both requesting and confirming a code check WeChat identity; another account cannot confirm that code or overwrite an existing email binding. Logging out does not remove the server-side binding. The same WeChat account may verify a replacement York email, which replaces its previous active email binding.

The file-backed verification server serializes store changes within one server process and writes the store atomically. Run one process against this store; a deployment with multiple processes or instances needs a database with unique constraints on email and `openid`.

## Tech Stack

- Platform: WeChat Mini Program (native)
- Languages: WXML, WXSS, JavaScript
- Data: local mock data
- State: local storage
- Verification service: local Node API + Resend email API
- WeChat identity binding: `wx.login` + `code2Session`

## Project Structure

```text
miniprogram/
  data/
    mockData.js              # local categories, merchants, events, contact content
  pages/
    login/                   # entry and demo login
    home/                    # member homepage and bottom category dock
    merchantList/            # categorized merchant grid
    merchantDetail/          # merchant discount detail page
    services/                # student services and events
    contact/                 # contact us / join us / official account placeholder
    profile/                 # member profile and verification status
  utils/
    memberStore.js           # local profile, verification, and simulator preview state
    verificationApi.js       # email verification API requests
  config/
    verification.js          # verification API base URL
  app.js
  app.json
  app.wxss
  sitemap.json
project.config.json
project.private.config.json
server/
  index.js                   # email verification API and WeChat email bindings
tests/
  email-binding.test.js      # binding, concurrency, and persistence checks
  login-flow.test.js         # login, logout, Home access, and preview checks
```

## Getting Started

1. Install [WeChat Developer Tools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html).
2. Clone this repository.
3. Open WeChat Developer Tools and import this folder.
4. Use the configured AppID in `project.config.json`, or replace it with your own mini program AppID.
5. For real email verification, fill in `.env` with `RESEND_API_KEY`, `EMAIL_FROM`, and `WECHAT_APP_SECRET`, then run `npm run start:verify-server`.
6. Update `miniprogram/config/verification.js` with your deployed HTTPS API domain before real-device testing.

### Local development

Run the following from the project root with Node.js 18 or later (the server uses built-in `fetch`):

```sh
npm ci
# Only if .env does not already exist:
cp -n .env.example .env
npm run start:verify-server
```

Fill in the empty credentials in `.env`. `WECHAT_APP_ID` defaults to the AppID in `project.config.json`; `WECHAT_APP_SECRET` must belong to that AppID. Keep credentials in `.env`, which is excluded from Git.

The local API is `http://127.0.0.1:8787`. Open `/health` to check that the server is running and see whether email and WeChat credentials are configured. These flags check only whether values are present, not whether the providers accept them.

For simulator development, disable request domain validation in WeChat Developer Tools under **Details → Local Settings**. The local `project.private.config.json` sets `urlCheck` to `false` for this purpose; this machine-specific file is excluded from Git, so configure the setting when importing the project on another computer. Before testing on a real device, configure a reachable HTTPS API and its request domain as described above.

Run `npm test` for the login and email-binding checks. Tests mock WeChat and email providers and do not send real emails.

## Notes

- Merchant, event, and service content uses local data; verification records and email bindings are stored by the local API.
- The Apple Wallet entry on the homepage is a placeholder, not a live integration.
- The `official-account` area on the contact page is prepared for future公众号 linkage.
- The email verification API needs a real mail provider account and a configured request domain.
- Enforcing one WeChat account to one York email requires `WECHAT_APP_SECRET` so the backend can exchange `wx.login` codes for `openid`.
- For public release, you still need real merchant assets, formal content review, and WeChat mini program review/publish flow.

## License

Copyright 2026 YUCSSA. All rights reserved.
