import React, { Component } from 'react'
import UsageAndStatisticList from '@src/view/usageAndStatisticList'

// 员工使用情况
export default class staffUsage extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      columns: []
    }
  }

  columns1 = [{
    title: '姓名',
    dataIndex: 'name',
    render: (operate, record) => (
      <span style={{ cursor: 'pointer' }}
        onClick={() => this.props.history.push({ pathname: '/staffDetail', search: `?id=${record.staffId}` })}>
        {record.name}
      </span>
    )
  }, {
    title: '新增客户数',
    dataIndex: 'newClientCount'
  }, {
    title: '联系客户数',
    dataIndex: 'touchClientCount'
  }, {
    title: '总客户数',
    dataIndex: 'totalClientCount'
  }, {
    title: '未添加标签数',
    dataIndex: 'notAddTagClientCount'
  }, {
    title: '发送消息条数',
    dataIndex: 'messageCount'
  }]
  columns2 = [
    {
      title: '聊天总数',
      dataIndex: 'messageCnt'
    }, {
      title: '已回复聊天占比',
      dataIndex: 'replyPercentage'
    }, {
      title: '平均首次回复时长',
      dataIndex: 'avgReplyTime'
    }
  ]
  componentDidMount () {
    this.setState({ columns: this.columns1.concat(this.columns2) })
  }
  // 切换到年的时候不显示columns2
  getTimeRange = (timeRange) => {
    const columns = (timeRange === 3) ? this.columns1 : this.columns1.concat(this.columns2)
    this.setState({ columns })
  }

  render () {
    return (
      <UsageAndStatisticList columns={this.state.columns} isUsage={true} getTimeRange={this.getTimeRange} />
    )
  }
}
