import React from 'react'
import { Tabs } from 'antd'
import Page0 from './page0'
import Page1 from './page1'
import Page2 from './page2'
import utils from '@src/utils'

export default class extends React.PureComponent {
  constructor (props) {
    super(props)
    this.tabs = []
    this.pages = []
    const channelExpansionView = utils.checkButtonRight(this.props.location.pathname, 'channelExpansionView', false)
    const posterView = utils.checkButtonRight(this.props.location.pathname, 'posterView', false)
    const businessCardSetting = utils.checkButtonRight(this.props.location.pathname, 'businessCardSetting', false)
    posterView && this.pages.push(<Page0 />)
    posterView && this.tabs.push('展业海报')
    channelExpansionView && this.pages.push(<Page1 />)
    channelExpansionView && this.tabs.push('渠道拓展')
    businessCardSetting && this.pages.push(<Page2 />)
    businessCardSetting && this.tabs.push('名片设置')
  }

  render () {
    const defaultActiveKey = utils.searchToJson().active || '0'
    const { TabPane } = Tabs
    return (
      <Tabs defaultActiveKey={defaultActiveKey}>
        {this.tabs.map((item, index) => (
          <TabPane tab={item} key={index}>
            {this.pages[index]}
          </TabPane>
        ))}
      </Tabs>
    )
  }
}
