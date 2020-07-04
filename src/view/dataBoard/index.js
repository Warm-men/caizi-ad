import React from 'react'
import './index.less'
import { Spin } from 'antd'
import KeyIndicatorsView from './keyIndicatorsView'
import IndicatorTrend from './indicatorTrend'
import HotRankingList from './hotRankingList/index.js'
import { connect } from 'react-redux'

const mapStateToProps = (state) => {
  return {
    deptList: state.base.deptList
  }
}

@connect(mapStateToProps)
export default class DataModule extends React.Component {
  constructor(props) {
    super(props)
    const deptTree = props.deptList
    const deptName = deptTree[0].name
    this.state = {
      initLoading: false,
      deptTree,
      changeDept: deptTree.length ? deptTree[0].id : null,
      deptName
    }
  }

  render() {
    const { initLoading, changeDept, deptName } = this.state
    return (
      <div className={'dataModule'}>
        <Spin spinning={initLoading} tip="数据获取中...">
          <div className={'dataModuleHeaderView'}>
            <img
              src={require('@src/assets/data_module_header.png')}
              alt={''}
              className={'headerImg'}
            />
            <div className={'headerContentRight'}>
            </div>
          </div>
          <KeyIndicatorsView changeDept={changeDept} />
          <IndicatorTrend changeDept={changeDept} />
          <HotRankingList changeDept={changeDept} deptName={deptName} />
        </Spin>
      </div>
    )
  }
}
