import _isPlainObject from 'lodash.isplainobject'
import _isEmpty from 'lodash.isempty'
import Store from '@src/store'
import { actions } from '@src/store/modules/base'

export default {
  getCookie(name) {
    var strCookie = document.cookie
    var arrCookie = strCookie.split('; ')
    for (var i = 0; i < arrCookie.length; i++) {
      var arr = arrCookie[i].split('=')
      if (arr[0] === name) {
        return arr[1]
      }
    }
    return ''
  },
  // time秒 默认30天
  setCookie(name, value, time) {
    time = time || 30 * 24 * 3600
    var exp = new Date()
    exp.setTime(exp.getTime() + time * 1000)
    // 注意 这里一定要写path=/ 让cookie写在根路径/下面(也就是域名下)
    // 如果不指定path，由于测试服的访问地址是https://test.qtrade.com.cn/caizhi_admin
    // 在setCookie 'caizhi_user'的时path默认是caizhi_admin
    // 之后clearCookieByKey 'caizhi_key'就只能清除caizhi_admin下的caizhi_key，而cookie caizhi_key是后端写到前端的，path是 /
    document.cookie = name + '=' + value + ';expires=' + exp.toGMTString() + ';path=/'
  },
  // 获取url参数
  getUrlQueryString(search, name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)')
    var r = search.substr(1).match(reg)
    if (r != null) {
      return r[2]
    }
    return ''
  },
  clearCookieByKey(name) {
    this.setCookie(name, '', -1)
  },
  firstUpperCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  },
  isNull(value) {
    return value === null
  },
  isUndefined(value) {
    return value === undefined
  },
  _isNaN(value) {
    return this.isNumber(value) && value !== +value
  },
  isNumber(value) {
    var numberTag = '[object Number]'
    var objectToString = Object.prototype.toString
    return typeof value === 'number' || (this.isObjectLike(value) && objectToString.call(value) === numberTag)
  },
  // 判断值是否为空
  _isEmpty(value) {
    return (this.isString(value) && _isEmpty(value)) || this.isNull(value) || this.isUndefined(value)
  },
  isString(value) {
    var stringTag = '[object String]'
    var objectToString = Object.prototype.toString
    return typeof value === 'string' || (!this.isArray(value) && this.isObjectLike(value) && objectToString.call(value) === stringTag)
  },
  isObjectLike(value) {
    // 不包含函数类型
    return !!value && typeof value === 'object'
  },
  // 判断一个对象是不是数组类型
  isArray(value) {
    var arrTag = '[object Array]'
    var objectToString = Object.prototype.toString
    return (Array.isArray && Array.isArray(value)) || objectToString.call(value) === arrTag
  },
  // 对对象直接量进行过滤（不含空值）
  filterParam(obj) {
    var parameter = {}
    if (_isPlainObject(obj)) {
      for (let key in obj) {
        if (!this._isEmpty(obj[key]) && !this._isNaN(obj[key])) {
          parameter[key] = obj[key]
        }
      }
    }
    return parameter
  },
  deepCopyObj(obj) {
    // 只拷贝对象
    if (typeof obj !== 'object') return
    // 根据obj的类型判断是新建一个数组还是一个对象
    var newObj = obj instanceof Array ? [] : obj !== null ? {} : null
    for (var key in obj) {
      // 遍历obj,并且判断是obj的属性才拷贝
      if (obj.hasOwnProperty(key)) {
        // 判断属性值的类型，如果是对象递归调用深拷贝
        newObj[key] = typeof obj[key] === 'object' ? this.deepCopyObj(obj[key]) : obj[key]
      }
    }
    return newObj
  },
  debounce(fn, delay) {
    let timer = null
    return function () {
      let args = arguments
      let context = this
      if (timer) {
        clearTimeout(timer)
        timer = setTimeout(function () {
          fn.apply(context, args)
        }, delay)
      } else {
        timer = setTimeout(function () {
          fn.apply(context, args)
        }, delay)
      }
    }
  },
  // 将url转换为json
  searchToJson(url = window.location.href, codeURI = false) {
    url = codeURI ? decodeURIComponent(url) : url
    const search = url.split('?')
    let result = {}
    search.forEach((item, index) => {
      if (index !== 0) {
        result = item.split('&').reduce((obj, item) => {
          const arr = item.split('=')
          return { ...obj, [arr[0]]: arr[1] }
        }, result)
      }
    })
    return result
  },
  checkButtonRight(pathname, key, isShow = true) {
    const name = pathname.split('/')[1]
    const state = Store.getState()
    if (state.base.right[name] && !state.base.right[name][key]) {
      isShow && Store.dispatch(actions.openRightMessage())
      return false
    }
    return true
  },
  openRightMessage() {
    Store.dispatch(actions.openRightMessage())
  },
  onCloseMessage() {
    Store.dispatch(actions.onCloseMessage())
  },
  URImalformed(str) {
    return str
      .replace(/%/g, '%25')
      .replace(/#/g, '%23')
      .replace(/&/g, '%26')
      .replace(/=/g, '%3D')
      .replace(/\?/g, '%3F')
      .replace(/\//g, '%2F')
      .replace(/\+/g, '%2B')
  },
  downImg(imgUrl, imgName = '') {
    let image = new window.Image()
    image.setAttribute('crossOrigin', 'anonymous')
    image.onload = function () {
      let canvas = document.createElement('canvas')
      canvas.width = image.width
      canvas.height = image.height
      const context = canvas.getContext('2d')
      context.drawImage(image, 0, 0, image.width, image.height)
      const url = canvas.toDataURL('image/png')
      let a = document.createElement('a')
      let event = new window.MouseEvent('click')
      a.download = imgName
      a.href = url
      a.dispatchEvent(event)
      canvas = null
      event = null
      a = null
      image = null
    }
    image.src = imgUrl
  }
}

/** 拓展 Date 原型方法 */

/**
 * 对 Date 的扩展，将 Date 转化为指定格式的 String
 * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 *
 * e.g : (new Date()).format("yyyy-MM-dd hh:mm:ss.S") => 2006-07-02 08:09:04.423
 *       (new Date()).format("yyyy-M-d h:m:s.S")      => 2006-7-2 8:9:4.18
 *
 *  @param fmt 格式化公式
 */
/*eslint-disable*/
Date.prototype.format = function (fmt) {
  let o = {
    'M+': this.getMonth() + 1,
    'd+': this.getDate(),
    'h+': this.getHours(),
    'm+': this.getMinutes(),
    's+': this.getSeconds(),
    'q+': Math.floor((this.getMonth() + 3) / 3),
    S: this.getMilliseconds()
  }
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length))
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length))
  }
  return fmt
}
