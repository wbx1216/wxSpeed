//logs.js 
const app = getApp()
Page({
  data: { 
    index:0,
    num:"",
    icon:""
  },
  onLoad:function(){
    let height=""
    let that=this
    wx.getSystemInfo({
      success(res) {
        height=res.windowHeight
        that.setData({
          height: height - 130
        })
      }
    }) 
  },
  onShow: function () {
    let that =this
    wx.request({
      url: 'https://www.speedtesting.cn/speed/api/speedRanking.htm?openId=' + app.globalData.openId,
      // url: 'http://192.168.20.2:48001/appadvplat-server/speed/api/speedRanking.htm?openId=' + app.globalData.openId,
      success:function(res){
        console.log(res)
        that.setData({
          list:res.data.ranking,
          index:res.data.userRanking,
          num: res.data.ranking.length
        })
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
