# YUCSSA WeChat Mini Program

This is the official WeChat Mini Program for the York University Chinese Students & Scholars Association (YUCSSA). It allows students to browse partner merchants and view exclusive discounts.

## features

- **WeChat Login**: Verifies user identity via WeChat OAuth.
- **Merchant Categories**: Browse merchants by category (Food, Entertainment, Services, etc.).
- **Merchant Details**: View address, contact info, and specific student discounts.
- **Student-Friendly UI**: Clean, card-based design tailored for university students.

## Tech Stack

- **Platform**: WeChat Mini Program (Native)
- **Languages**: WXML, WXSS, JavaScript
- **Data**: Local Mock Data (No backend required for MVP)

## Getting Started

1. Download [WeChat Developer Tools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html).
2. Clone this repository.
3. Open WeChat Developer Tools and import the project folder.
4. AppID: `wxb4500e80ff513f01` (Test account or replace with your own).

## Project Structure

```
├── miniprogram/
│   ├── data/           # Mock data source
│   ├── pages/          # Application pages
│   │   ├── login/
│   │   ├── home/
│   │   ├── merchantList/
│   │   └── merchantDetail/
│   ├── app.js          # Global logic
│   ├── app.json        # Global configuration
│   └── app.wxss        # Global styles
└── project.config.json # Tooling configuration
```

## License

© 2025 YUCSSA. All Rights Reserved.
