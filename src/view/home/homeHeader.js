import React, { Component } from 'react'
import { message, Avatar } from 'antd'
import { withRouter } from 'react-router-dom'
import utils from '@src/utils'
import axios from '@src/utils/axios'
import urls from '@src/config'
import { connect } from 'react-redux'

class HomeHeader extends Component {
  constructor(props, context) {
    super(props)
    this.state = {
      roles: []
    }
  }

  componentDidMount() {
    this.pullRoles()
  }

  pullRoles = () => {
    axios.get(urls.listStaffRoles).then((res) => {
      this.setState({
        roles: res.retdata
      })
    })
  }

  // 退出登录
  logout = () => {
    axios.get(urls.logout).then((res) => {
      if (res.ret === 0) {
        utils.clearCookieByKey('caizhi_web_key')
        // 退出登录就跳到登录页(只在微信测试环境打开有效，本地无效)
        this.props.history.push('/login')
      } else {
        message.error('退出登录失败，请刷新重试')
      }
    })
  }

  changeRole = () => {
    this.props.history.push('/roleSelete')
  }

  render() {
    const { roles } = this.state
    const { avatarUrl, userName, roleName } = this.props.userInfo
    return (
      <header>
        <Avatar src={avatarUrl} />
        {userName}[{roleName}]{roles.length > 1 && <a onClick={this.changeRole}>切换角色</a>}
        <a onClick={this.logout}>退出</a>
      </header>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.base.userInfo
  }
}

export default withRouter(connect(mapStateToProps)(HomeHeader))
