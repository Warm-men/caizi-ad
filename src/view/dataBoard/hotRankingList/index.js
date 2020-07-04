import React from 'react'
import '../index.less'
import HotContent from './hotContent'
import HotProduct from './hotProduct'

export default class HotRankingList extends React.PureComponent {
  render () {
    return (
      <div style={{overflowX: 'scroll'}}>
        <div className={'rankingListView'} style={{minWidth: 1220}}>
          <HotProduct changeDept={this.props.changeDept} deptName={this.props.deptName}/>
          <HotContent changeDept={this.props.changeDept} deptName={this.props.deptName}/>
        </div>
      </div>
    )
  }
}
