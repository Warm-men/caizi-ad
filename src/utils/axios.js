import axios from 'axios'
import { message } from 'antd'
import {HashRouter} from 'react-router-dom'
import urls from '@src/config'
const router = new HashRouter()

// 如果前后台非同域部署需要用
axios.defaults.withCredentials = true
// 如果是上传文件及这些url 不做contentType转换 自动Content-Type: multipart/form-data; boundary=----xx 或者json
const notChangeContentType = [urls.importExcel, urls.newsUpload, urls.productFileUpload, urls.speechList, urls.speechCreate, urls.speechDelete, urls.speechUpdate, urls.speechUpdateSeq, urls.speechUpload, urls.speechList, urls.issueCreate, urls.issueDelete, urls.issueUpdate, urls.issueUpdateSeq, urls.issueUpload, urls.issueList]

// 添加请求拦截器
axios.interceptors.request.use(config => {
  // 当前是自定义头部请求的  就不对数据做formdata转换处理了  用json
  if (config.responseType) {
  }
  if (config.headers['Content-Type']) {
  } else if (notChangeContentType.indexOf(config.url) === -1) {
    // contentType json格式转form格式
    config.transformRequest = [data => {
      let ret = ''
      for (let it in data) {
        ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
      }
      return ret.substr(0, ret.length - 1)
    }]
  }
  return config
}, error => {
  return Promise.reject(error)
})

// 添加响应拦截器
// todo
// 1 done 10002处理(调权限接口才触发) 跳到error页 提示 您没有角色 请先去找管理员添加角色 然后进入首页
// 2 done 动态route的生成
// 3 done 改造dispatch getUserInfo为updateMenuAndRightAndUserInfo 不建议里面加isCurrentPageCanView判断(action会报错？)
// 4 修改删除权限后可能触发
// 5 10003没有权限(调所有接口触发) 调updateMenuAndRightAndUserInfo,
// 如果有当前页访问权限就会留在当前页updateMenuAndRightAndUserInfo更新了按钮，
// 没有就在axios里跳到首页（aixos里如何判断是否有当前页访问权限？ 10003附带一个view数组回来？或者后台拆分10003 10004？）
// 6 应该修改后台逻辑 所有接口都可能返回10002 10003(先判断是否10002然后再判断是否10003, 而不是现在的先触发10003再触发10002)
// 然后10003附带一个view数组回来或者后台拆分10003 10004，用于判断是否有当前页访问权限
axios.interceptors.response.use(response => {
  message.destroy()
  if (response.config.responseType === 'blob') {
    return response.data
  }
  if (response.data.ret === 0) {
    // 正常
    return response.data
  } else if (response.data.ret === 1000001) {
    // 没有登录或者登录过期 后端清掉前端cookie 跳到登录页(只在微信测试环境打开有效，本地无效)
    router.history.push('/login')
  } else if (response.data.ret === 1000002) {
    // 没有角色 权限接口返回100002 进error页
    router.history.push('/error/1000002')
  } else if (response.data.ret === 1000004) {
    // 没有安装通讯录应用
    router.history.push('/error/1000004')
  } else if (response.data.ret === 1000005) {
    // 没有安装小程序
    router.history.push('/error/1000005')
  } else if (response.data.ret === 1000003) {
    // 没有权限 100003 调updateMenuAndRightAndUserInfo(如果此时还有此页面访问权限(后台告诉我)就留在当前页，否者在这里route跳到首页）
    // 或者直接刷新页面(已更新了menuRouteList 匹配不到路由自动跳到首页去了)
    // 没有权限暂时改为调首页 逻辑简单点
    message.error('你没有此权限', 3, router.history.push('/'))
  } else {
    // 其他错误 一般是 -1
    message.error('错误：' + response.data.retmsg)
    // throw后就会走到catch
    throw response.data
  }
}, error => {
  message.destroy()
  // 400等错误
  message.error('后台错误：' + error)
  // throw后就会走到catch
  throw error
})

export default axios
