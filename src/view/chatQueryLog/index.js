import React, { Component } from 'react'
import { Button, Input, Table } from 'antd'
import styles from './index.less'
import axios from '@src/utils/axios'
import urls from '@src/config'

export default class ChatQueryLog extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      filterStaff: '',
      tableData: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showQuickJumper: true,
        showTotal: null
      },
      loading: false
    }
  }

  componentDidMount () {
    this.fetch()
  }
  // 查询员工
  handleChangefilterStaff = (ev) => {
    this.setState({ filterStaff: ev.target.value })
  }
  // 分页、排序、筛选变化时触发 获取表格数据
  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      pagination: { ...this.state.pagination, current: pagination.current }
    }, () => {
      this.fetch()
    })
  }
  // 获取数据
  fetch () {
    const { filterStaff } = this.state
    const { current, pageSize } = this.state.pagination
    const data = {
      staffName: filterStaff.trim(),
      pageNum: current,
      pageSize: pageSize
    }
    this.setState({ loading: true })
    axios.post(urls.getListQueryRecords, data).then(res => {
      const total = res.retdata.total
      this.setState({
        loading: false,
        tableData: res.retdata.queryChatLoglist,
        pagination: { ...this.state.pagination, total, showTotal: total => `共 ${total}条记录` }
      })
    })
  }
  // 点击查询
  search = () => {
    this.setState({
      // 默认第一页
      pagination: { ...this.state.pagination, current: 1 }
    }, () => {
      this.fetch()
    })
  }
  // 重置
  reset = () => {
    window.location.reload()
  }
  // 下载
  download = () => {
    window.location.href = `${urls.chatlogDownload}?staffName=${this.state.filterStaff}`
  }

  render () {
    const { filterStaff, tableData, pagination, loading } = this.state
    const columns = [{
      title: '时间',
      dataIndex: 'dateCreated'
    }, {
      title: '登录IP',
      dataIndex: 'loginIp'
    }, {
      title: '姓名',
      dataIndex: 'staffName'
    }, {
      title: '操作记录',
      dataIndex: 'optContent'
    }]
    return (
      <div className="chatQueryLog">
        <div className={'header'}>
          <span className={'left'}>
            <span className={'leftItem'}>
              员工：<Input style={{ width: 200 }} value={filterStaff} placeholder="" onChange={this.handleChangefilterStaff} />
            </span>
            <span className={'leftItem'}>
              <Button type="primary" onClick={this.search}>查询</Button>
            </span>
            <span className={'leftItem'}>
              <Button type="primary" onClick={this.reset}>重置</Button>
            </span>
          </span>
          <span className={'right'}>
            <span className={'rightItem'}>
              <Button className={'download'} icon="download" type="primary" onClick={this.download}>下载</Button>
            </span>
          </span>
        </div>
        <div>
          <Table
            rowKey={'id'}
            columns={columns}
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
