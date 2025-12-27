const app = getApp()

Page({
    onLoad() {
        if (app.globalData.isLoggedIn) {
            wx.switchTab({
                url: '/pages/home/home',
                fail: () => {
                    // If home is not a tab usage, use redirectTo
                    wx.redirectTo({ url: '/pages/home/home' })
                }
            })
        }
    },

    handleLogin() {
        wx.getUserProfile({
            desc: 'Display user info',
            success: (res) => {
                const userInfo = res.userInfo

                // Mock login process
                wx.login({
                    success: (res) => {
                        // Here you would send res.code to backend to get openId
                        // For MVP, just save userInfo locally
                        wx.setStorageSync('userInfo', userInfo)
                        app.globalData.userInfo = userInfo
                        app.globalData.isLoggedIn = true

                        wx.redirectTo({
                            url: '/pages/home/home'
                        })
                    }
                })
            },
            fail: (err) => {
                wx.showToast({
                    title: 'Login Failed',
                    icon: 'none'
                })
                console.error(err)
            }
        })
    }
})
