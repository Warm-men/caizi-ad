import React, { PureComponent } from 'react'
import { Modal, Tabs, message } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import DepartmentTable from './departmentTable'
import StaffTable from './staffTable'

export default class AddMemberModal extends PureComponent {
  constructor (props) {
    super(props)
    this.idsData = {
      deptIds: [],
      staffIds: []
    }
  }

  handleOk = () => {
    const { currentRoleId } = this.props
    const { deptIds, staffIds } = this.idsData
    if (!deptIds.length && !staffIds.length) {
      return message.error('请选择成员')
    }
    const paramse = {
      deptIds,
      staffIds,
      roleId: currentRoleId
    }
    axios.post(urls.roleUserAdd, paramse, { headers: {'Content-Type': 'application/json'} }).then(res => {
      this.props.update()
      this.props.onCancel()
    })
  }

  updateData = (data) => {
    this.idsData = data
  }

  handleCancel = () => this.props.onCancel()
  // 切换之后清除已选
  onChangeTabs = () => {
    this.idsData = {
      deptIds: [],
      staffIds: []
    }
    this.departmentTable && this.departmentTable.resetState()
    this.staffTable && this.staffTable.resetState()
  }

  render () {
    const { visible, parentId } = this.props
    return (
      <div className="add-role" >
        <Modal
          title="添加成员"
          visible={visible}
          onOk={this.handleOk}
          okText={'确定'}
          onCancel={this.handleCancel}
          cancelText={'取消'}
        >
          <Tabs defaultActiveKey="1" onChange={this.onChangeTabs}>
            <Tabs.TabPane tab="按部门选择" key="1">
              <DepartmentTable
                parentId={parentId}
                ref={ref => (this.departmentTable = ref)}
                updateData={this.updateData}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab="按成员选择" key="2">
              <StaffTable
                ref={ref => (this.staffTable = ref)}
                updateData={this.updateData}
              />
            </Tabs.TabPane>
          </Tabs>
        </Modal>
      </div>
    )
  }
}
