import React from 'react'
import 'antd/dist/antd.css'
import './index.less'
import axios from '@src/utils/axios'
import urls from '@src/config'
import { Tabs, Spin, Button, message } from 'antd'
import { isEqual } from 'lodash'
import option from './echart/option'
import Echart from './echart'
import DataPicker from './dataPicker'
import { withRouter } from 'react-router-dom'
import Tools from '@src/utils'
import moment from 'moment'

const NO1Img = <img src={require('@src/assets/no1.png')} />
const NO2Img = <img src={require('@src/assets/no2.png')} />
const NO3Img = <img src={require('@src/assets/no3.png')} />
@withRouter
export default class IndicatorTrend extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      initLoading: false,
      tabKey: '1',
      contentData: [],
      echartData1: [],
      echartData2: [],
      echartData3: [],
      echartData4: [],
      deptRank: []
    }
  }

  componentDidMount () {
    this.changeDept = this.props.changeDept
    this.setState({ initLoading: true })
    this.pullData()
  }

  componentWillReceiveProps (next, pre) {
    if (next.changeDept && next.changeDept !== pre.changeDept) {
      this.changeDept = next.changeDept
      this.setState({ initLoading: true })
      this.pullData()
    }
  }

  pullData = () => {
    const dateType = this.dateType || '2'
    axios
      .get(urls.keydatatrend(this.changeDept, this.state.tabKey, dateType))
      .then((res) => {
        const { trendList, deptRank } = res.retdata
        this.resetEchartData(trendList)
        this.setState({
          initLoading: false,
          deptRank: deptRank || []
        })
      })
      .catch(() => {
        this.setState({ initLoading: false })
      })
  }

  resetEchartData = (data) => {
    const dateType = this.dateType || '2'
    let startDate = null
    let dataLenght = data.length
    let dateRange = 0
    const { tabKey } = this.state
    let isRange = tabKey === '2' || tabKey === '4'
    if (dateType === '2') {
      dateRange = 7
      startDate = moment().subtract(7, 'days')
    }
    if (dateType === '3') {
      dateRange = 15
      startDate = moment().subtract(15, 'days')
    }
    if (dateType === '4') {
      dateRange = 30
      startDate = moment().subtract(30, 'days')
    }
    const fillEmptyDateData = []

    if (dataLenght && dataLenght < dateRange) { // 如果有值，且缺漏一些日期的数据，不上坐标，数值为0或 0%
      const endDate = moment().subtract(1, 'days')
      for (let i = startDate.valueOf(); i <= endDate.valueOf();) {
        const createDate = moment(i).format('YYYY-MM-DD')
        const item = data.find((item) => item.date === createDate) || {}
        if (!item.value) {
          item.value = isRange ? '0%' : '0'
        }
        fillEmptyDateData.push({ ...item, date: createDate, value: item.value })
        i += 86400000
      }
    }

    let state = this.state
    state['echartData' + tabKey] = fillEmptyDateData.length ? fillEmptyDateData : data
    this.setState({
      ...state
    })
  }

  onChangeTime = (dateType) => {
    this.dateType = dateType
    this.pullData()
  }

  onChangeTab = (key) => {
    this.setState(
      {
        tabKey: key,
        initLoading: true
      },
      this.pullData
    )
  }

  checkIsEmpty = () => {
    const tabKey = this.state.tabKey
    let data = this.state['echartData' + tabKey]
    return !data.length
  }

  dowloadExcel = () => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'dataBoardDownload')
    if (!isRight) return
    const dateType = this.dateType || '2'
    const params = {
      changeDept: this.changeDept,
      tabKey: this.state.tabKey,
      dateType
    }
    if (isEqual(this.params, params)) {
      message.error('该文件正在导出，请耐心等待...')
      return
    }
    this.params = params
    axios
      .get(urls.exportKeydata(this.changeDept, this.state.tabKey, dateType), {
        headers: { 'Content-Type': 'application/json;charset=utf-8' }
      })
      .then((res) => {
        let a = document.createElement('a')
        a.setAttribute('target', '_blank')
        a.href = res.retdata
        a.click()
        a = null
        this.params = {}
      })
      .catch((e) => {
        this.params = {}
      })
  }

  exportFile = (res) => {
    const blob = new window.Blob([res], { type: 'application/vnd.ms-excel' })
    const href = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = href
    a.click()
    URL.revokeObjectURL(href)
  }

  formatNum = (num) => {
    if (!num) return ''
    if (parseInt(num) === 0) return num
    let result = []
    let counter = 0
    let headerNum = '+'
    let floatNum = ''
    if (num.indexOf('-') !== -1) {
      num = num.split('-')[1]
      headerNum = '-'
    }
    if (num.indexOf('.') !== -1) {
      floatNum = '.' + num.split('.')[1]
      num = num.split('.')[0]
    }
    num = (num || 0).toString().split('')
    for (let i = num.length - 1; i >= 0; i--) {
      counter++
      result.unshift(num[i])
      if (!(counter % 3) && i !== 0) {
        result.unshift(',')
      }
    }
    return result.join('') + floatNum
  }

  render () {
    const {
      initLoading,
      deptRank,
      echartData1,
      echartData2,
      echartData3,
      echartData4
    } = this.state
    const isEmpty = this.checkIsEmpty()
    return (
      <Spin spinning={initLoading} tip="数据获取中...">
        <div className={'keyIndicatorsView'}>
          <div className={'headerView'}>
            <div className={'left'}>
              <span className={'title'}>关键指标趋势</span>
            </div>
            <span className={'right'}>
              <DataPicker
                onChangeTime={this.onChangeTime}
                deleteYesterday={true}
              />
            </span>
          </div>
          <div style={{overflowX: 'scroll'}}>
            <div className={'trendContentView'} style={{minWidth: 1220}}>
              <div className={'leftView'}>
                <Tabs defaultActiveKey="1" onChange={this.onChangeTab}>
                  <Tabs.TabPane tab={'客户总人数'} key="1">
                    {echartData1.length ? (
                      <Echart options={option(echartData1, false, '客户总人数')} />
                    ) : (
                      <EmptyView />
                    )}
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="活跃客户占比" key="2">
                    {echartData2.length ? (
                      <Echart options={option(echartData2, true, '活跃客户占比')} />
                    ) : (
                      <EmptyView />
                    )}
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="发送产品员工人数" key="3">
                    {echartData3.length ? (
                      <Echart options={option(echartData3, false, '发送产品员工人数')} />
                    ) : (
                      <EmptyView />
                    )}
                  </Tabs.TabPane>
                  <Tabs.TabPane tab="产品点击购买率" key="4">
                    {echartData4.length ? (
                      <Echart options={option(echartData4, true, '产品点击购买率')} />
                    ) : (
                      <EmptyView />
                    )}
                  </Tabs.TabPane>
                </Tabs>
                {!isEmpty ? (
                  <Button
                    onClick={this.dowloadExcel}
                    type={'danger'}
                    style={{
                      backgroundColor: '#CFBB9A',
                      border: '1px solid #CFBB9A'
                    }}
                  >
                  导出数据
                  </Button>
                ) : null}
              </div>
              {deptRank.length ? (
                <div className={'rightView'}>
                  <div className={'topView'}>部门排名</div>
                  {deptRank.map((item, index) => {
                    let numView = item.rank
                    if (item.rank === 1) numView = NO1Img
                    if (item.rank === 2) numView = NO2Img
                    if (item.rank === 3) numView = NO3Img
                    return (
                      <div key={index} className={'rangeView'}>
                        <div className={'rangeLeft'}>
                          <span className={'numView'}>{numView}</span>
                          <span className={'nameView'}>{item.deptName}</span>
                        </div>
                        <div className={'countsView'}>
                          {this.formatNum(item.value)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <EmptyView styles={{maxWidth: 450}}/>
              )}
            </div>
          </div>
        </div>
      </Spin>
    )
  }
}

class EmptyView extends React.PureComponent {
  render () {
    return (
      <div
        style={{
          height: 300,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
          ...this.props.styles
        }}
      >
        <img src={require('@src/assets/data_board_empty.png')} />
        <div style={{marginTop: 20}}>暂无数据</div>
      </div>
    )
  }
}
