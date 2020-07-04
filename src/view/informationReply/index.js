import React from 'react'
import { Tabs } from 'antd'
import './index.less'
import InformationContent from './informationContent'

export default class InformationMaintenance extends React.PureComponent {
  render () {
    return (
      <div>
        <Tabs defaultActiveKey={'1'}>
          <Tabs.TabPane tab="资讯内容" key="1">
            <InformationContent />
          </Tabs.TabPane>
        </Tabs>
      </div>
    )
  }
}
