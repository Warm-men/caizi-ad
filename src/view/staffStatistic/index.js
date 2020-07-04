import React, { Component } from 'react'
import UsageAndStatisticList from '@src/view/usageAndStatisticList'
import urls from '@src/config'

// 员工使用统计
export default class staffStatistic extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
    }
  }

  render () {
    const columns = [{
      title: '姓名',
      dataIndex: 'name',
      render: (operate, record) => (
        <span style={{ cursor: 'pointer' }}
          onClick={() => this.props.history.push({ pathname: '/staffDetail', search: `?id=${record.staffId}` })}>
          {record.name}
        </span>
      )
    }, {
      title: '文章发送次数',
      dataIndex: 'staffSendNewsCount'
    }, {
      title: '文章发送篇数',
      dataIndex: 'staffSendNewsNum'
    }, {
      title: '客户查看人数',
      dataIndex: 'clientLookNewsCount'
    }, {
      title: '客户查看文章篇数',
      dataIndex: 'clientLookNewsNum'
    }, {
      title: '客户转发次数',
      dataIndex: 'clientSendNewsCount'
    }, {
      title: '潜在客户数',
      dataIndex: 'latentClientCount'
    }]
    return (
      <UsageAndStatisticList columns={columns} isUsage={false} />
    )
  }
}
