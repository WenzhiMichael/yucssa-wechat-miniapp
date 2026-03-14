# YUCSSA WeChat Mini Program

York University Chinese Students and Scholars Association (YUCSSA) official mini program project.

This version is no longer the old merchant-only MVP. It has been redesigned into a small campus hub centered on:

- member identity and member code display
- Apple Wallet card placeholder entry
- categorized partner merchants and discount details
- events and student services
- contact and recruitment information

## Current Features

- `登录页`:
  - quick demo entry
  - optional WeChat profile login
- `首页`:
  - member code strip
  - Apple Wallet placeholder strip
  - upcoming events
  - bottom category dock for `吃 / 喝 / 玩 / 用`
- `合作商户页`:
  - sectioned category layout
  - 3-column merchant grid
  - tap merchant to open discount detail
- `商户详情页`:
  - discount details
  - favorite toggle
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
  - favorite merchants
  - contact shortcuts

## Tech Stack

- Platform: WeChat Mini Program (native)
- Languages: WXML, WXSS, JavaScript
- Data: local mock data
- State: local storage only, no backend required for demo

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
    profile/                 # member profile and favorites
  utils/
    memberStore.js           # local profile and favorites state
  app.js
  app.json
  app.wxss
  sitemap.json
project.config.json
project.private.config.json
```

## Getting Started

1. Install [WeChat Developer Tools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html).
2. Clone this repository.
3. Open WeChat Developer Tools and import this folder.
4. Use the configured AppID in `project.config.json`, or replace it with your own mini program AppID.

## Notes

- The project currently uses mock data only.
- The Apple Wallet entry on the homepage is a placeholder, not a live integration.
- The `official-account` area on the contact page is prepared for future公众号 linkage.
- For public release, you still need real merchant assets, formal content review, and WeChat mini program review/publish flow.

## License

Copyright 2026 YUCSSA. All rights reserved.
