import React, { Component } from 'react'
import { Button, Upload, Icon, message, TreeSelect, Tree, Modal, Table } from 'antd'

export default class ImportFailTabel extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
    }
  }

  hideModal = () => {
    this.props.hideModal()
  }

  render () {
    const { importFailData, visible } = this.props
    const columns = [{
      title: '姓名',
      dataIndex: 'name'
    }, {
      title: '职务',
      dataIndex: 'position'
    }, {
      title: '部门',
      dataIndex: 'department'
      // render: (operate, record) => (
      //   <span>gggg/北京12,gggg/北京12,gggg/北京12</span>
      // )
    }, {
      title: '手机',
      dataIndex: 'phone'
    }, {
      title: '邮箱',
      dataIndex: 'email'
    }, {
      title: '失败原因',
      dataIndex: 'reason',
      render: (operate, record) => (
        <span style={{color: 'red'}}>{record.reason}</span>
      )
    }]
    return (
      <div className="importFailTabel">
        <Modal
          width={1000}
          title="部分导入失败列表"
          visible={visible}
          onOk={this.hideModal.bind(this)}
          onCancel={this.hideModal.bind(this)}
          okText="确认"
          cancelText="取消"
        >
          <p style={{padding: '0 0 10px 0'}}>本次共导入{importFailData.addCount + importFailData.updateCount}人，
          新增导入{importFailData.addCount}人，覆盖导入{importFailData.updateCount}人，导入失败{importFailData.failCount}人</p>
          <Table dataSource={importFailData.failList} columns={columns} pagination={false} />
        </Modal>
      </div>
    )
  }
}
