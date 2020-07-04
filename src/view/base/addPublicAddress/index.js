import React, { PureComponent } from 'react'
import styles from './index.less'
import Header from '@src/view/base/header'

// 如何绑定公众号操作手册
export default class AddPublicAddress extends PureComponent {
  render () {
    return (
      <div className={styles.wrap}>
        <Header />
        <div className={styles.content}>
          <h2>如何添加公众号？</h2>
          <p>1、公众号是微信公众号的名称，必须取全称。下面以“中国光大银行”作为实例。</p>
          <p><img src={require('@src/assets/publicAddress1.png')} alt=""/></p>
          <p>2、在财智管理后台->互动管理->新增热门文章中输入公众号，多个公众号用逗号分隔。</p>
          <p><img src={require('@src/assets/publicAddress2.png')} alt=""/></p>
          <p>3、在财智管理后台->互动管理->文章库中查看公众号爬取的内容，这部分内容会在财智互动小程序中，方便理财经理展业使用。如果爬取失败，请联系客服。</p>
        </div>
      </div>
    )
  }
}
