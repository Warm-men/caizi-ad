import React, { PureComponent } from 'react'
import styles from './index.less'
import Header from '@src/view/base/header'
import { Icon } from 'antd'

export default class Login extends PureComponent {
  render () {
    const type = this.props.match.params.type
    let text = ''
    switch (type) {
      case '1000002':
        text = '您没有角色 请先去找管理员添加角色 然后进入系统首页'
        break
      case '1000004':
        text = '您没有安装通讯录应用 请先去安装然后进入系统首页'
        break
      case '1000005':
        text = '您没有安装小程序 请先去安装然后进入系统首页'
        break
      case '1000009':
        // https://test.qtrade.com.cn/caizhi_admin/#/error/1000009 提供给后端跳转
        text = '非法用户'
        break
      default:
        text = '错误'
        break
    }
    return (
      <div className={styles.wrap}>
        <Header />
        <div className={styles.content}>
          <Icon type="warning" className={styles.icon} />
          <span className={styles.text}>{text}</span>
        </div>
      </div>
    )
  }
}
