import React, { Component } from 'react'
import { Modal, Button, Table, message, Select } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'

export default class assignToModal extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      selectedStaffKeys: [],
      staffList: []
    }
  }
  // 获取下拉的经理列表
  componentDidMount () {
    axios.post(urls.getPoolStaffList).then(res => {
      this.setState({ staffList: res.retdata.staffList })
    })
  }
  // 点击分配
  handleOk = () => {
    const { selectedStaffKeys } = this.state
    const { selectedRowKeys } = this.props
    // 单选是字符串 多选是字符串数组 所以typeof
    const staffIds = typeof selectedStaffKeys === 'object' ? selectedStaffKeys.join(',') : selectedStaffKeys
    const staffClientIds = selectedRowKeys.join(',')
    if (!staffIds) {
      return message.warning('请选择客户经理')
    }
    const data = {
      staffIds: staffIds,
      staffClientIds: staffClientIds
    }
    axios.post(urls.setPoolAllot, data).then(res => {
      this.props.handleAssginedSuccess()
      this.handleCancel()
      return message.success('分配成功')
    })
  }
  // 取消弹窗
  handleCancel = () => {
    this.setState({ selectedStaffKeys: [] }, () => {
      this.props.onCancel()
    })
  }
  // 下拉选择
  changeStaff (value) {
    this.setState({ selectedStaffKeys: value })
  }

  render () {
    const { visible, isMultipleCheck, selectedRowKeys } = this.props
    const { selectedStaffKeys, staffList } = this.state
    const title = isMultipleCheck ? `平均分配(${selectedRowKeys.length}位客户)` : `指定分配(${selectedRowKeys.length}位客户)`
    const info = isMultipleCheck ? '客户将平均分配给选择的客户经理，如无法整除则多余客户随机分配'
      : '所有选择的客户都将分配给指定的客户经理'
    return (
      <div>
        <Modal
          width={700}
          visible={visible}
          title={title}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={[
            <span key="info" style={{float: 'left', color: '#888'}}>{info}</span>,
            <Button key="back" onClick={this.handleCancel}>取消</Button>,
            <Button key="submit" type="primary" onClick={this.handleOk}>确定</Button>
          ]}
        >
          <div style={{padding: '0px 0 70px 0'}}>
            <div style={{height: '40px', lineHeight: '40px'}}>
            分配给客户经理({isMultipleCheck ? '可多选' : '只可单选'})
            </div>
            <Select
              showSearch={true}
              mode={isMultipleCheck ? 'multiple' : ''}
              style={{ width: '100%' }}
              placeholder="请选择客户经理"
              value={selectedStaffKeys}
              onChange={this.changeStaff.bind(this)}
              // 搜索的时候搜name 默认是搜value
              optionFilterProp={'name'}
              // 放到输入框的是name 默认是children(也就是{obj.name} - {obj.deptName})
              optionLabelProp={'name'}
            >
              {staffList.map(obj => {
                return <Select.Option key={obj.staffId} value={obj.staffId} name={obj.staffName}>
                  <span style={{float: 'left'}}>{obj.staffName}</span>
                  <span style={{float: 'right', marginRight: '20px'}}>已有客户 {obj.staffClientCount}</span>
                </Select.Option>
              })}
            </Select>
          </div>
        </Modal>
      </div>
    )
  }
}
