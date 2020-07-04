import React, { Component } from 'react'
import { Spin, message } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import utils from '@src/utils'

class GetOauth extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  componentWillMount(nextProps, nextState) {
    const caizhiKey = utils.getCookie('caizhi_web_key')
    if (caizhiKey) {
      // 直接输入url不能进getOauth页面
      this.props.history.push('/roleSelete')
    } else {
      // 本地开发的时候 没有cookie就去getOauth 微信自动操作静默授权，然后后端写cookie到前端 然后跳到首页
      axios.get(urls.getOauth).then((res) => {
        if (res.ret === 0) {
          this.props.history.push('/roleSelete')
        } else {
          message.error('登录授权失败，请刷新重试')
        }
      })
    }
  }

  render() {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '200px 0 0 0'
        }}
      >
        <Spin tip="自动登录授权中..."></Spin>
      </div>
    )
  }
}

export default GetOauth
