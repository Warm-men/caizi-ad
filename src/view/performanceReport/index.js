import React, { Component } from 'react'
import { Table, Button, DatePicker } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import moment from 'moment'
import './index.less'

export default class extends Component {
  state = { loading: false, list: [], date: moment(moment().valueOf() - 86400000) }

  componentDidMount = () => {
    this.getTableData()
  }

  columns = () => {
    return [
      { title: '分行', dataIndex: 'secondBank' },
      {
        title: '个人资金',
        children: [
          { title: '当日上报情况', children: [{ title: '上报日增量', dataIndex: 'currentPersonalMoney' }] },
          { title: '下一日预测情况', children: [{ title: '预测日增量', dataIndex: 'nextPersonalMoney' }] }
        ]
      },
      {
        title: '个人存款',
        children: [
          { title: '当日上报情况', children: [{ title: '上报日增量', dataIndex: 'currentPersonalSave' }] },
          { title: '下一日预测情况', children: [{ title: '预测日增量', dataIndex: 'nextPersonalSave' }] }
        ]
      }
    ]
  }

  // 查询表格数据
  getTableData = () => {
    const { date } = this.state
    this.setState({ loading: true })
    axios
      .get(urls.performanceReportList, { params: { date: date.format('YYYY-MM-DD') } })
      .then((res) => {
        this.setState({
          list: res.retdata.map((item) => ({ ...item, key: 'key' + Math.random() })),
          loading: false
        })
      })
      .catch(() => {
        this.setState({ list: [], loading: false })
      })
  }

  download = () => {
    const { date } = this.state
    axios.post(urls.performanceReportDownload, { date: date.format('YYYY-MM-DD') }).then((res) => {
      let a = document.createElement('a')
      a.setAttribute('target', '_blank')
      a.href = res.retdata
      a.click()
      a = null
    })
  }

  render = () => {
    const { loading, list, date } = this.state
    return (
      <div id="performanceReport">
        <div className="title">全行个人资金、个人存款预测情况表</div>
        <div className="filter">
          <div className="item">
            <div className="label">时间：</div>
            <DatePicker value={date} onChange={(date) => this.setState({ date })} className="value" />
          </div>
          <div className="btns">
            <Button type="primary" onClick={this.getTableData}>
              查询
            </Button>
            <Button type="primary" onClick={this.download}>
              导出数据
            </Button>
          </div>
        </div>
        <div className="tips">单位：万元</div>
        <Table bordered loading={loading} dataSource={list} columns={this.columns()} pagination={false} />
      </div>
    )
  }
}
