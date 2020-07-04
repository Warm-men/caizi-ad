import React, { PureComponent } from 'react'
import styles from './index.less'
import urls from '@src/config'
import Header from '@src/view/base/header'

export default class Login extends PureComponent {
  render () {
    return (
      <div className={styles.wrap}>
        <Header />
        <div className={styles.content}>
          <a href={urls.wexinLogin} className={styles.WXicon}>
            <span>微信扫码登录</span>
            {/* <img src="//rescdn.qqmail.com/node/wwopen/wwopenmng/style/images/independent/brand/300x40_white$5ecdf536.png" srcSet="//rescdn.qqmail.com/node/wwopen/wwopenmng/style/images/independent/brand/300x40_white_2x$ce44f9f2.png 2x" alt="企业微信登录" /> */}
          </a>
          <span className={styles.copyright}>Copyright @ 2019 AppleTree All Rights Reserved 粤ICP备17042315号</span>
        </div>
      </div>
    )
  }
}
