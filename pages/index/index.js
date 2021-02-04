//index.js
//获取应用实例
import * as echarts from '../../ec-canvas/echarts';
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
const app = getApp()
let downChart = null
let upChart = null
let array = [0]
let downArray = []
let xData = new Array(60).fill("")
let l = null;
let once = false;
let title = "网速大PK，看看你排第几？"
let downGif, upGif
let max = 10
Page({
  onShareAppMessage: function(res) {
    return {
      title: title,
      imageUrl: "/img/share.jpg",
      path: "/pages/index/index"
    }
  },
  data: {
    ec: {
      onInit: initChart
    },
    ec2: {
      onInit: initChart2
    },
    userInfo: "",
    userId: "",
    ip: "",
    toast: false,
    rank: "",
    downStatus: false,
    upStatus: false,
    status: "0",
    down: "0",
    up: "0",
    speed: "0",
    speed2:"00",
    ping: 0,
    doudong: 0,
    lost: 0,
    deg: "50",
    ready: "0",
    type: "",
    downSum: "",
    downSrc: "",
    upSrc: "",
    jd: "暂无授权",
    wd: "暂无授权",
    tips: false,
    speedtest_time: "",
    file: "https://img.ttdailynews.com/static/temp/test5g",
    animi:false
  },
  //事件处理函数 
  navBack() {
    this.setData({
      status: "0"
    })
  },
  closeTips() {
    this.setData({
      tips: false
    })
  },
  bindGetUserInfo(e) {
    let that = this
    wx.getUserInfo({
      success(res) { 
        console.log(res)
        if (res.rawData) {
          let userInfo = JSON.parse(res.rawData)
          that.setData({
            userInfo: userInfo
          })
          wx.request({
            url: 'https://www.speedtesting.cn/speed/user/api/wechatLogin.htm',
            // url: "http://192.168.20.2:48001/appadvplat-server/speed/user/api/wechatLogin.htm",
            data: {
              openId: app.globalData.openId,
              icon: userInfo.avatarUrl,
              nickname: userInfo.nickName
            },
            success: function(res) {
              console.log(res)
              that.setData({
                createTime: res.data.createTime,
                userId: res.data.userId,
                animi:true
              })
            }
          })
        }
      }
    })
    setTimeout(function(){
      that.startTest()
    },600)
     
  },
  onLoad: function() {
    let that = this
    let bottom, height
    if (app.globalData.platform == "ios") {
      bottom = "-30%"
      height = "190%"
    } else {
      bottom = "-60%"
      height = "220%"
    }
    qqmapsdk = new QQMapWX({
      key: 'O32BZ-6F7WP-W2XDQ-VB4JK-SB67J-DIFIO' //自己的key秘钥 http://lbs.qq.com/console/mykey.html 在这个网址申请
    });
    wx.getSystemInfo({
      success: res => {  
        //导航高度
        console.log(res) 
        that.setData({
          navH: res.statusBarHeight + 44,
          statusBarHeight:  res.statusBarHeight,
          bottom: bottom,
          gifHeight: height,
          platform:res.platform
        })
      }, fail(err) {
        console.log(err);
      }
    })
  
    wx.getUserInfo({
      success(res) {
        if (res.rawData) {
          let userInfo = JSON.parse(res.rawData)
          that.setData({
            userInfo: userInfo
          })
        }
      }
    })
    wx.request({
      url: 'https://api.ip138.com/query/',
      data: { //默认自动添加callback参数
        'ip': '', //为空即为当前iP地址
        'oid': '28624',
        'mid': '90952',
        'token': '53237a5c33dc8f71d60a229331bc9760' //不安全，请定期刷新token，建议进行文件压缩
      },
      dataType: "json",
      success: function(json) {
        console.log(json)
        json = json.data
        that.setData({
          ip: json.ip.split(".")[0] + ".*.*." + json.ip.split(".")[3],
          realIp: json.ip,
          operator: json.data[2] + json.data[3],
          location: json.data[2]
        })
      }
    })


  },
  again: function() {
    array = [0]
    downArray = []
    this.setData({
      status: 0,
      animi:false
    })
    downChart.clear();
    upChart.clear();
  },
  startTest:function(){
    this.setData({
      status: 1,
    })
    this.startTest2()
  },
  startTest2: function() {
    clearInterval(downGif)
    clearInterval(upGif)
    array = [0]
    once = true
    let that = this
    wx.getStorage({ //获取本地缓存
      key: "times",
      complete: function(res) {
        console.log(res)
        if (res.data) {
          that.setData({
            times: res.data
          })
        } else {
          that.setData({
            times: 0
          })
        }
      }
    })
    wx.request({
      url: 'https://api.ip138.com/query/',
      data: { //默认自动添加callback参数
        'ip': '', //为空即为当前iP地址
        'oid': '28624',
        'mid': '90952',
        'token': '53237a5c33dc8f71d60a229331bc9760' //不安全，请定期刷新token，建议进行文件压缩
      },
      dataType: "json",
      success: function(json) {
        json = json.data
        that.setData({
          ip: json.ip.split(".")[0] + "..." + json.ip.split(".")[3],
          realIp: json.ip,
          operator: json.data[2] + json.data[3]
        })
      }
    })
    wx.getNetworkType({
      success(res) {
        let type
        if (res.networkType == "none") {
          type = "none"
          wx.showToast({
            title: '网络未连接请检查',
            icon: 'none',
            image: "/img/error.png",
            duration: 2000,
            mask: true,
          })
          return false;
        } else {
          if (res.networkType == "wifi") {
            type = "Wi-Fi"
          } else {
            type = "4G"
          }
          that.setData({
            type: type
          })

          let nowTime = Math.random()
          let lost = that.randomNum(0, 30)
          that.setData({
            downSrc: "https://img.ttdailynews.com/static/temp/down.gif?" + nowTime,
            upSrc: "https://img.ttdailynews.com/static/temp/up.gif?" + nowTime,
            status: 1,
            ready: 1,
            down: "0",
            up: "0",
            speed: "0",
            speed2:"00",
            ping: 0,
            doudong: 0,
            rank: "",
            lost: lost,
            deg: "50",
            downSum: "",
            upSum: "",
            downGif: false,
            upGif: false
          })

          let start = new Date().getTime()
          wx.getLocation({
            success(res) {
              that.setData({
                wd: (res.latitude).toFixed(3),
                jd: (res.longitude).toFixed(3)
              })
              qqmapsdk.reverseGeocoder({
                location: {
                  latitude: res.latitude,
                  longitude: res.longitude
                },
                success: function(res) {
                  let location = res.result.address_component.city
                  location = location.substring(0, location.length - 1);
                  that.setData({
                    location: location
                  })
                }
              })


            }
          })

          wx.request({
            url: 'https://www.speedtesting.cn/speed5g/index.html#/',
            timeout: "500",
            success: function(res) {
              that.setData({
                ping: new Date().getTime() - start,
                doudong: (new Date().getTime() - start + Math.random() * 30).toFixed(0)
              })
              setTimeout(function() {
                that.setData({
                  ready: 0,
                  realNow: new Date().getTime()
                })
                that.down();
              }, 2000)
            },
            fail: function(res) {
              that.setData({
                toast: true
              })
              setTimeout(function() {
                wx.reLaunch({
                  url: '/pages/index/index'
                })
              }, 3000)
            }
          })
        }
      }
    })
  },
  offset(i) {
    let len
    if (i > 0 && i < 10) {
      len = i * 6
    } else if (i >= 10 && i < 20) {
      len = (i - 10) * 3 + 60
    } else if (i >= 20 && i < 50) {
      len = (i - 20) * 1.17 + 95
    } else if (i >= 50 && i < 100) {
      len = (i - 50) * 0.6 + 130
    } else if (i >= 100 && i < 200) {
      len = (i - 100) * 0.4 + 160
    } else if (i >= 200 && i < 500) {
      len = (i - 200) * 0.1 + 200
    } else if (i >= 500 && i < 1000) {
      len = (i - 500) * 0.04 + 230
    }
    return len + 50
  },
  randomNum(minNum, maxNum) {
    switch (arguments.length) {
      case 1:
        return parseInt(Math.random() * minNum + 1, 10);
        break;
      case 2:
        return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
        break;
      default:
        return 0;
        break;
    }
  },
  down() {
    l = setTimeout(function() {
      that.setData({
        toast: true
      })
      array = [0]
      downChart.clear();
      downChart.setOption(downOption(), true)
      upChart.clear();
      upChart.setOption(upOption(), true)
      clearInterval(downGif)
      setTimeout(function() {
        wx.reLaunch({
          url: '/pages/index/index'
        })
      }, 3000)
    }, 9000)
    let that = this
    this.setData({
      downStatus: true
    })
    setTimeout(function() {
      that.setData({
        downStatus: false
      })
    }, 7800)
    let down = wx.downloadFile({
      url: that.data.file
    })
    let start = new Date().getTime() 
    let intertime = 8000 / xData.length
    let randomDown
    downGif = setInterval(function() {
      let data = downArray[downArray.length - 1]
      if (!data) {
        array.push(0)
        max = 10
      } else {
        if (data > Math.max(...array)) {
          max = data * 1.4
        }
        array.push(data)
      } 
      downChart.setOption(downOption(), true)
    }, intertime)
    down.onProgressUpdate(res => {
      let now = (new Date().getTime() - start) / 1000
      let realNow = (new Date().getTime() - that.data.realNow) / 1000
      let speed = ((res.totalBytesWritten / 1048576) / now * 8).toFixed(2)
      let deg = that.offset(speed).toFixed(3)
      let speed2=speed.substring(speed.length-2)
      speed=speed.slice(0, -3)
      that.setData({
        // down: speed,
        speed: speed,
        speed2: speed2,
        deg: deg
      })
      downArray.push(speed+"."+speed2)
      if (realNow < 8 && res.progress > 90) {
        let time = new Date().getTime() - that.data.realNow
        randomDown = setInterval(function() {
          let number = Math.random().toFixed(2)
          let number2 = that.randomNum(0, 10)
          let data = downArray[downArray.length - 1]
          let speed = (data - number - number2).toFixed(2)
          let deg = that.offset(speed).toFixed(3)
          let speed2=speed.substring(speed.length-2)
          speed=speed.slice(0, -3)
          that.setData({
            speed: speed,
            speed2:speed2,
            deg: deg
          })
        }, 250)
        down.offProgressUpdate()
        down.abort()
        setTimeout(function() {
          clearInterval(downGif)
          clearInterval(randomDown)
          clearTimeout(l)
          array = [0]
          downArray = []
          that.setData({
            down: speed+"."+speed2,
            speed: "0",
            speed2:"00",
            deg: 50,
            downSum: (res.totalBytesWritten / 1048576).toFixed(1)
          })
        }, 8000 - time + 500)
        setTimeout(function() {
          that.up()
        }, 8000 - time + 1000)
      } else {
        if (realNow > 8 || res.progress > 90) {
          if (array.length < 60) {
            let len = 60 - array.length
            let newArray = new Array(len).fill(array[array.length - 1])
            array.push(...newArray)
            downChart.setOption(downOption(), true)
          }
          down.offProgressUpdate()
          down.abort()
          clearTimeout(l)
          array = [0]
          clearInterval(downGif)
          downArray = []
          that.setData({
            down: speed+"."+speed2,
            speed: "0",
            speed2:"00",
            deg: 50,
            downSum: (res.totalBytesWritten / 1048576).toFixed(1)
          })
          setTimeout(function() {
            that.up()
          }, 1000)
        }
      }
    })

  },
  up() {
    l = setTimeout(function() {
      that.setData({
        toast: true
      })
      array = [0]
      downChart.clear();
      downChart.setOption(downOption(), true)
      upChart.clear();
      upChart.setOption(upOption(), true)
      clearInterval(upGif)
      setTimeout(function() {
        wx.reLaunch({
          url: '/pages/index/index'
        })
      }, 3000)
    }, 9000)
    this.setData({
      upStatus: true
    })
    let that = this
    setTimeout(function() {
      that.setData({
        upStatus: false
      })
    }, 7800)
    let down = wx.downloadFile({
      url: that.data.file
    })
    let start = new Date().getTime() 
    let intertime = 8000 / xData.length
    let randomDown
    upGif = setInterval(function() {
      let data = downArray[downArray.length - 1] 
      if (!data) {
        array.push(0)
        max = 10
      } else {
        if (data > Math.max(...array)) {
          max = data * 1.4
        }
        array.push(data)
      } 
      upChart.setOption(upOption(), true)
    }, intertime)
    down.onProgressUpdate(res => {
      let now = (new Date().getTime() - start) / 1000
      let speed = ((res.totalBytesWritten / 1048576) / now * 8 / 1.5).toFixed(2)
      let deg = that.offset(speed).toFixed(3)
      let speed2=speed.substring(speed.length-2)
      speed=speed.slice(0, -3)
      that.setData({
        // down: speed, 
        speed: speed,
        speed2:speed2,
        deg: deg
      })
      downArray.push(speed+"."+speed2)
      if (now < 8 && res.progress > 90) {
        let time = new Date().getTime() - start
        randomDown = setInterval(function () {
          let number = Math.random().toFixed(2)
          let number2 = that.randomNum(0, 10)
          let data = downArray[downArray.length - 1]
          let speed = (data - number - number2).toFixed(2)
          let deg = that.offset(speed).toFixed(3)
          let speed2=speed.substring(speed.length-2)
          speed=speed.slice(0, -3)
          that.setData({
            speed: speed,
            speed2:speed2,
            deg: deg
          })
        }, 250)  
        down.offProgressUpdate()
        down.abort()
        setTimeout(function() {
          clearInterval(upGif)
          clearInterval(randomDown)
          clearTimeout(l)
          array = [0]
          downArray = []
          that.setData({
            up: speed+"."+speed2,
            speed: "0",
            speed2:"00",
            deg: 50,
            upStatus: false,
            upSum: (res.totalBytesWritten / 1048576 / 1.5).toFixed(1)
          })
        }, 8000 - time + 500)
        setTimeout(function() {
          that.over()
        }, 8000 - time + 1000)
      } else {
        if (now > 8 || res.progress == 100) {
          if (array.length < 60) {
            let len = 60 - array.length
            let newArray = new Array(len).fill(array[array.length - 1])
            array.push(...newArray)
            upChart.setOption(upOption(), true)
          }
          down.offProgressUpdate()
          down.abort()
          clearTimeout(l)
          clearInterval(upGif)
          that.setData({
            up: speed+"."+speed2,
            speed: "0",
            speed2:"00",
            deg: 50,
            upStatus: false,
            upSum: (res.totalBytesWritten / 1048576 / 1.5).toFixed(1)
          })
          setTimeout(function() {
            that.over()
          }, 1000)
        }
      }
    })

  },
  over() {
    let down = this.data.down
    let level = ""
    let pet = Number(down).toFixed(0)
    let that = this
    title = "我的网速相当于" + pet + "M宽带,你敢来PK吗？"
    level = pet + "M"
    if (down < 5) {
      pet = 5 + Number(pet)
    } else if (down >= 5 && down < 10) {
      pet = 11 + Number(pet)
    } else if (down >= 10 && down < 20) {
      pet = 15 + Number(pet)
    } else if (down >= 20 && down < 50) {
      pet = 17 + Number(pet)
    } else if (down >= 50 && down < 70) {
      pet = 19 + Number(pet)
    } else if (down >= 70 && down < 100) {
      pet = 92
    } else if (down >= 100) {
      pet = 98
    }
    down = toDecimal(down)
    this.setData({
      rank: ""
    })
    wx.request({
      url: 'https://www.speedtesting.cn/speed/api/reportSpeed.htm',
      // url: "http://192.168.20.2:48001/appadvplat-server/speed/api/reportSpeed.htm",
      data: {
        openId: app.globalData.openId,
        speed: that.data.down,
        location: that.data.location
      },
      complete: function(res) {
        console.log(app.globalData.openId, that.data.down, that.data.location)
        console.log(res)
        if (res.data.rank) {
          that.setData({
            rank: res.data.rank
          })
        }
        that.setData({
          status: 2,
          pet: pet,
          level: level,
          down: down
        })
      }
    })

    if (once == true) {
      this.save()
      once = false;
    }
  },
  detail() {
    wx.navigateTo({
      url: '../detail/detail?index=0'
    })
  },
  rank() {
    wx.switchTab({
      url: '../rank/rank',
    })
  },
  showTips() {
    let that = this
    setTimeout(function() {
      that.setData({
        tips: true
      })
    }, 1000)
    setTimeout(function() {
      that.setData({
        tips: false
      })
    }, 6000)
  },
  save() {
    if (!this.data.down || this.data.down == 0 || !this.data.up || this.data.up == 0) {
      return false;
    }
    let data = null
    let now = new Date();
    let hour = now.getHours()
    let min = now.getMinutes()
    let day = now.getDate()
    if (day < 10) {
      day = "0" + day
    }
    if (hour < 10) {
      hour = "0" + hour
    }
    if (min < 10) {
      min = "0" + min
    }
    let mouth = now.getMonth() + 1
    if (mouth < 10) {
      mouth = "0" + mouth
    }
    let seconds = now.getSeconds()
    if (seconds < 10) {
      seconds = "0" + seconds
    }
    let date = now.getFullYear() + "-" + mouth + "-" + day
    let time = hour + ":" + min + ":" + seconds
    let sum = Number(this.data.downSum) + Number(this.data.upSum)
    let json = {
      down: this.data.down,
      up: this.data.up,
      date: date,
      time: time,
      jd: this.data.jd,
      wd: this.data.wd,
      ip: this.data.realIp,
      downSum: sum.toFixed(2),
      ping: this.data.ping,
      doudong: this.data.doudong,
      lost: this.data.lost,
      type: this.data.type,
      location: this.data.location
    }
    let that = this
    wx.getStorage({ //获取本地缓存
      key: "data",
      complete: function(res) {
        let date = now.getFullYear() + "-" + mouth + "-" + day
        if (date == that.data.createTime) {
          if (that.data.times == 0) {
            that.showTips()
            wx.setStorage({
              key: 'times',
              data: 1,
            })
          }
        } else {
          if (res.data && that.data.times < 3) {
            if (res.data[0].date == date) {
              if (res.data.length == 1) {
                that.showTips()
                wx.setStorage({
                  key: 'times',
                  data: 1,
                })
              } else {
                if (res.data[1].date != date) {
                  that.showTips()
                  let times = that.data.times
                  times++
                  wx.setStorage({
                    key: 'times',
                    data: times,
                  })
                }
              }
            }
          }
        }
        if (res.data) {
          let data = res.data
          data.unshift(json)
          wx.setStorage({
            key: 'data',
            data: data,
          })
        } else {
          let data = []
          data.push(json)
          wx.setStorage({
            key: 'data',
            data: data,
          })
        }
      }
    })
  }
})

function initChart(canvas, width, height, dpr) {
  downChart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(downChart);
  downChart.setOption(downOption());
  return downChart;
}

function initChart2(canvas, width, height, dpr) {
  upChart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr // new
  });
  canvas.setChart(upChart);
  upChart.setOption(upOption());
  return upChart;
}

function downOption() {
  let option = {
    xAxis: {
      boundaryGap: false,
      show: false,
      data: xData
    },
    yAxis: {
      max: max,
      min: 0,
      splitNumber: 1,
      show: false
    },
    series: [{
      type: 'line',
      data: array,
      showSymbol: false,
      hoverAnimation: false,
      itemStyle: {
        normal: {
          color: 'rgb(105, 227, 194)', //折点颜色
          lineStyle: {
            color: 'rgb(105, 227, 194)',
            width:1
          },
        }
      }, 
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: 'rgb(105, 227, 194)' // 0% 处的颜色
          }, {
            offset: 1,
            color: 'rgba(255,255,255,0)'
          }],
          global: false // 缺省为 false
        }
      }
    }]
  }
  return option
}

function upOption() {
  let option = {
    xAxis: {
      boundaryGap: false,
      show: false,
      data: xData
    },
    yAxis: {
      max: max,
      min: 0,
      splitNumber: 1,
      show: false
    },
    series: [{
      type: 'line',
      data: array,
      showSymbol: false,
      hoverAnimation: false,
      itemStyle: {
        normal: {
          color: 'rgb(0, 219, 255)', //折点颜色
          lineStyle: {
            color: 'rgb(0, 219, 255)', //折线颜色
            width:1
          }
        }
      }, 
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0,
            color: 'rgb(0, 219, 255)' // 0% 处的颜色
          }, {
            offset: 1,
            color: 'rgba(255,255,255,0)'
          }],
          global: false // 缺省为 false
        }
      }
    }]
  }
  return option
}

function toDecimal(x) {
  var f = parseFloat(x);
  if (isNaN(f)) {
    return false;
  }
  var f = Math.round(x * 100) / 100;
  var s = f.toString();
  var rs = s.indexOf('.');
  if (rs < 0) {
    rs = s.length;
    s += '.';
  }
  while (s.length <= rs + 2) {
    s += '0';
  }
  return s;
}