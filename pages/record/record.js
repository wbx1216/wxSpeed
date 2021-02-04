 
Page({
  data: {
    array: [],
    key:"-1"
  },
  onHide:function(){
    let that = this
    setTimeout(function(){
      that.setData({
        key: "-1"
      })
    },1000)
    
  },
  onShow: function () { 
    let that = this
    wx.getSystemInfo({
      success(res) { 
        that.setData({
          height: res.windowHeight - 40, 
        })
      }
    }) 
    wx.getStorage({
      key: 'data',
      complete: function(res) { 
        if(res.data){
          let array=res.data
          // array.forEach(item=>{ 
          //   console.log(item)
          //   item.date = item.date.replace("-", "/").replace("-", "/").substr(2) 
          //   item.time = item.time.substr(0,5) 
          //   if (item.time.substr(0,2)<12){
          //     item.mode="AM"
          //   }else{
          //     item.mode = "PM"
          //   }
          // })
          that.setData({
            array:array
          })
        }
      },
    }) 
  }, 
  bindTouchStart: function (e) {
    this.startTime = e.timeStamp;
  },
  bindTouchEnd: function (e) {
    this.endTime = e.timeStamp;
  },
  bindTap: function (e) {
    if (this.endTime - this.startTime < 350) {
      let index = e.currentTarget.dataset.index
      this.setData({
        key: index
      })
      wx.navigateTo({
        url: '../detail/detail?index=' + index
      })
    }
  },
  bingLongTap: function (e) {
    let index = e.currentTarget.dataset.index
    this.setData({
      key: index
    })
    wx.navigateTo({
      url: '../detail/detail?index=' + index
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
