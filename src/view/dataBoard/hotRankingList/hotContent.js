import React from 'react'
import { Tabs } from 'antd'
import '../index.less'
import PopoverHint from '../popover'
import DataPicker from '../dataPicker'
import TabItem from './tabItem'
export default class HotContent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      dateType: '1'
    }
  }

  onChangeTime = (dateType) => {
    this.setState({ dateType })
  }

  render () {
    const {dateType} = this.state
    const { changeDept } = this.props
    return (
      <div className={'hotProduct'} style={{marginRight: 0}}>
        <div className={'headerView'}>
          <div className={'left'}>
            <span className={'title'}>热门内容排行榜</span>
            <PopoverHint hintType={'hotContent'} />
          </div>
          <span className={'right'}>
            <DataPicker onChangeTime={this.onChangeTime}/>
          </span>
        </div>
        <div className={'hotContenttabWrapper'}>
          <Tabs defaultActiveKey="1">
            <Tabs.TabPane tab={'早报'} key="1">
              <TabItem contentType={1} changeDept={changeDept} dateType={dateType} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="文章" key="2">
              <TabItem contentType={2} changeDept={changeDept} dateType={dateType} />
            </Tabs.TabPane>
            <Tabs.TabPane tab="活动" key="3">
              <TabItem contentType={3} changeDept={changeDept} dateType={dateType} />
            </Tabs.TabPane>
          </Tabs>
        </div>
      </div>
    )
  }
}
