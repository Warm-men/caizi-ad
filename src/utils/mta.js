/* eslint-disable no-undef */
import React from 'react'
import MtaH5 from 'mta-h5-analysis' // 腾讯埋点

let config = {}
// 根据环境配置
if (SERVER === 'wwwserver') {
  config = {
    sid: '500722075', // 必填，统计用的appid
    cid: '500722078' // 如果开启自定义事件，此项目为必填，否则不填
  }
} else if (SERVER === 'testserver') {
  config = {
    sid: '500722074',
    cid: '500722077'
  }
} else if (SERVER === 'uatserver') {
  config = {
    sid: '500722074',
    cid: '500722077'
  }
} else {
  config = {
    sid: '500722073',
    cid: '500722076'
  }
}

Object.assign(config, {
  autoReport: 1, // 是否开启自动上报(1:init完成则上报一次,0:使用pgv方法才上报)
  senseHash: 1, // hash锚点是否进入url统计
  senseQuery: 1, // url参数是否进入url统计
  performanceMonitor: 1, // 是否开启性能监控
  ignoreParams: [] // 开启url参数上报时，可忽略部分参数拼接上报
})

// 初始化
MtaH5.init(config)
