import React, { PureComponent } from 'react'
import H5Share from './h5Share'
import MiniproShare from './miniproShare'
import { Tabs } from 'antd'
// 外观配置
export default class ProductShareSetting extends PureComponent {
  render () {
    return (
      <div>
        <div>
          <h1>产品分享设置</h1>
          <h5 style={{lineHeight: 3, fontSize: 13}}>*管理员可设置产品H5和小程序分享的相关配置</h5>
        </div>
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="h5分享" key="1">
            <H5Share />
          </Tabs.TabPane>
          <Tabs.TabPane tab="小程序分享" key="2">
            <MiniproShare />
          </Tabs.TabPane>
        </Tabs>
      </div>
    )
  }
}
