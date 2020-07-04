import React, { Component } from 'react'
import { Button, Input, Table, DatePicker } from 'antd'
import './index.less'
import axios from '@src/utils/axios'
import urls from '@src/config'

class PushAnalyse extends Component {
  constructor (props) {
    super(props)
    this.state = {
      tableData: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showTotal: null
      },
      loading: true,
      filterDateRange: [null, null],
      filterPusher: ''
    }
  }
  // 进页面获取表格数据
  componentDidMount () {
    this.fetch()
  }
  // 时间范围
  onChangeDate = (date, dateString) => {
    this.setState({ filterDateRange: date })
  }
  // 推送人
  handleChangePusher = (ev) => {
    this.setState({ filterPusher: ev.target.value })
  }
  // 分页、排序、筛选变化时触发 获取表格数据
  handleTableChange = (pagination, filters, sorter) => {
    this.setState({ pagination: { ...this.state.pagination, current: pagination.current } }, () => {
      this.fetch()
    })
  }
  // 表格数据获取
  fetch () {
    const { filterDateRange, filterPusher } = this.state
    const { current, pageSize, total } = this.state.pagination
    const data = {
      fromDate: filterDateRange[0] ? filterDateRange[0].format('YYYY-MM-DD') : '',
      toDate: filterDateRange[1] ? filterDateRange[1].format('YYYY-MM-DD') : '',
      pusher: filterPusher,
      pageNum: current,
      pageSize: pageSize
    }
    this.setState({ loading: true })
    axios.post(urls.pushAnalysis, data, {headers: {'Content-Type': 'application/json;charset=UTF-8'}}).then(res => {
      const total = res.retdata.total
      const tableData = res.retdata.list
      this.setState({
        loading: false,
        tableData: tableData,
        pagination: { ...this.state.pagination, total, showTotal: total => `共 ${total}条记录` }
      })
    })
  }
  // 点击查询
  search = () => {
    this.setState({ pagination: { ...this.state.pagination, current: 1 } }, () => {
      this.fetch()
    })
  }

  render () {
    const { tableData, filterDateRange, filterPusher, pagination, loading } = this.state
    const columns = [{
      title: '推送标题',
      dataIndex: 'pushTitle',
      ellipsis: true
    }, {
      title: '内容类型',
      dataIndex: 'pushType',
      ellipsis: true
    }, {
      title: '推送对象',
      dataIndex: 'pushObject',
      ellipsis: true
    }, {
      title: '接收范围',
      dataIndex: 'pushRange',
      ellipsis: true
    }, {
      title: '推送人数',
      dataIndex: 'pushNums',
      ellipsis: true
    }, {
      title: '已读人数',
      dataIndex: 'pushRead',
      ellipsis: true
    }, {
      title: '打开率',
      dataIndex: 'pushOpen',
      ellipsis: true
    }, {
      title: '推送时间',
      dataIndex: 'pushTime'
    }, {
      title: '推送人',
      dataIndex: 'pushUser',
      ellipsis: true
    }]
    return (
      <div className="pushAnalyse">
        <div className={'top'}>
          推送的消息记录，以及消息的使用分析，包括消息推送时间，推送人数以及打开率。
        </div>
        <div className={'header'}>
          <span className={'left'}>
            <span className={'leftItem'}>
              选择时间：<DatePicker.RangePicker style={{ width: 300 }} value={filterDateRange} onChange={this.onChangeDate} />
            </span>
            <span className={'leftItem'}>
              推送人：<Input style={{ width: 200 }} value={filterPusher} placeholder="请输入" onChange={this.handleChangePusher} />
            </span>
            <span className={'leftItem'}>
              <Button type="primary" onClick={this.search}>查询</Button>
            </span>
          </span>
        </div>
        <div>
          <Table
            columns={columns}
            rowKey={'id'}
            dataSource={tableData}
            pagination={pagination}
            loading={loading}
            onChange={this.handleTableChange}
            locale={{emptyText: '暂无数据'}}
          />
        </div>
      </div>
    )
  }
}

export default PushAnalyse
