//app.js
App({
  onLaunch: function () {  
    // 登录
    let that=this
  
    wx.login({
      success: res => {
        let code = res.code  
        wx.request({
          url: 'https://www.speedtesting.cn/speed/user/api/getWechatOpenId.htm',
          // url: "http://192.168.20.2:48001/appadvplat-server/speed/user/api/getWechatOpenId.htm",
          data: { code: code },
          success: function (res) { 
              that.globalData.openId=res.data.openId 
          }
        })
      }
    })
     wx.showShareMenu() 
  },
  globalData: {
    userInfo: null, 
    platform:""
  },
  
   
})
 