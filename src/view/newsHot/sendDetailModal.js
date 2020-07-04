import React, { Component } from 'react'
import { Button, Upload, Icon, message, TreeSelect, Spin, Modal, Table } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'

export default class SendDetailModal extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      sendDetailData: {},
      statisticsList: [],
      isLoading: false
    }
  }

  componentWillReceiveProps (next) {
    if (next.sendDetailId !== this.props.sendDetailId) {
      this.setState({
        isLoading: true
      })
      axios.post(urls.newsStatistics, { newsId: next.sendDetailId }).then(res => {
        const statisticsList = res.retdata.statisticsList.map((obj, index) => {
          return {...obj, key: index}
        })
        this.setState({ sendDetailData: res.retdata, statisticsList, isLoading: false })
      })
    }
  }

  hideModal = () => {
    this.props.hideModal()
  }

  render () {
    const { visible } = this.props
    const { sendDetailData, statisticsList, isLoading } = this.state
    const columns = [{
      title: '发送人',
      dataIndex: 'fromUser'
    }, {
      title: '发送次数',
      dataIndex: 'sendCount'
    }, {
      title: '被打开次数',
      dataIndex: 'openCount'
    }]
    const title = <div>
      <div>{sendDetailData.title}</div>
      <div style={{fontSize: '12px', color: '#999', margin: '10px 0 0 0'}}>创建人：{sendDetailData.creator}</div>
    </div>
    return (
      <div>
        <Modal
          width={600}
          wrapClassName={'newsListSendDetailModal'}
          title={title}
          visible={visible}
          onCancel={this.hideModal}
          footer={null}
        >
          <Spin spinning={isLoading}>
            <Table dataSource={statisticsList} columns={columns} pagination={false} />
          </Spin>
        </Modal>
      </div>
    )
  }
}
