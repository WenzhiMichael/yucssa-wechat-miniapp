// app.js
App({
    globalData: {
        userInfo: null,
        isLoggedIn: false
    },
    onLaunch() {
        // Check local storage for user info
        const userInfo = wx.getStorageSync('userInfo')
        if (userInfo) {
            this.globalData.userInfo = userInfo
            this.globalData.isLoggedIn = true
        }
    }
})
