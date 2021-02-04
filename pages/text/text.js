Page({
  data: {
    index:0,
    title:""
      },
  onLoad: function (options){ 
    this.setData({
      index:options.index,
      title: options.text
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