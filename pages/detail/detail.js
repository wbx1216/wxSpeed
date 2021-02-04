//logs.js 
Page({
  data: {
    data: {},
    level: "",
    hongbao: "",
    zhibo: "",
    game: "",
    video: "",
    downLoading: "",
    upLoading: ""
  },
  onLoad: function(options) {
    let that = this
    let index = options.index
    wx.getStorage({
      key: 'data',
      complete: function(res) {
        let data = res.data[index]
        let downLoading, upLoading, zhibo, hongbao, level, game, video
        if (data.down <= 20) {
          downLoading = (data.down * 5).toFixed(0)
        } else {
          downLoading = 100
        }
        if (data.up <= 20) {
          upLoading = (data.up * 5).toFixed(0)
        } else {
          upLoading = 100
        }
        if (data.up < 4) {
          zhibo = "极慢"
          hongbao = "极慢"
        } else if (data.up >= 4 && data.up < 10) {
          zhibo = "较慢"
          hongbao = "较慢"
        } else if (data.up >= 10 && data.up < 20) {
          zhibo = "一般"
          hongbao = "一般"
        } else if (data.up >= 20) {
          zhibo = "极快"
          hongbao = "极快"
        }
        level=Number(data.down).toFixed(0)+"M"
        if (data.down < 5) { 
          game = "较慢"
          video = "标清"
        } else if (data.down >= 5 && data.down < 10) { 
          game = "一般"
          video = "高清"
        } else if (data.down >= 10 && data.down < 20) { 
          game = "良好"
          video = "超清"
        } else if (data.down >= 20 && data.down < 50) { 
          game = "流畅"
          video = "蓝光"
        } else if (data.down >= 50 && data.down < 70) { 
          game = "流畅"
          video = "蓝光"
        } else if (data.down >= 70 && data.down < 100) { 
          game = "流畅"
          video = "蓝光"
        } else if (data.down >= 100) { 
          game = "流畅"
          video = "蓝光"
        }
        that.setData({
          data: data,
          level: level,
          hongbao: hongbao,
          zhibo: zhibo,
          game: game,
          video: video,
          downLoading: downLoading,
          upLoading: upLoading
        })

      },
    })
  },
  setting:function(res){
wx.getSetting({
      success: (res) => {
        console.log(res)
        if (!res.authSetting['scope.userLocation']) {
          wx.showModal({
            content: '检测到您没打开测速大师的定位权限，是否去设置打开？',
            confirmText: "去打开",
            cancelText: "取消",
            success: function (res) {
              console.log(res);
              //点击“确认”时打开设置页面
              if (res.confirm) {
                console.log('用户点击确认')
                wx.openSetting({
                  success: (res) => {
                    console.log(res)
                   }
                })
              } else {
                console.log('用户点击取消')
              }
            }
          }); 
        }else{
          wx.showModal({
            content: '您已授权，是否前往重新测速？',
            confirmText: "确认",
            cancelText: "取消",
            success: function (res) {
              console.log(res);
              //点击“确认”时打开设置页面
              if (res.confirm) {
                console.log('用户点击确认')
                wx.reLaunch({
                  url: '/pages/index/index'
                })
              } else {
                console.log('用户点击取消')
              }
            }
          });
        }
      }
    })
  },
  onShareAppMessage: function (res) {
    return {
      title: "网速大PK，看看你排第几？",
      imageUrl: "/img/share.jpg",
      path: "/pages/index/index"
    }
  }
})