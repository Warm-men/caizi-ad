import React, { Component } from 'react'
import { Modal, Input, Form, TreeSelect, message } from 'antd'
import styles from './index.less'
import axios from '@src/utils/axios'
import urls from '@src/config'

export default class AddRoleModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      rootRoleId: props.currentRoleId ? props.currentRoleId.toString() : null,
      roleList: []
    }
    this.hasSameName = false
    this.onSelectNodeSibling = null
  }

  // 展现角色列表
  showListRole = () => {
    return axios.post(urls.getListRole, {isContainSelf: true}).then(res => {
      const { roleTree } = res.retdata
      if (roleTree.length) {
        this.topRoleId = roleTree[0].rootRole.id
        this.setState({
          roleList: roleTree,
          rootRoleId: roleTree[0].subRoleList === 1 ? roleTree[0].rootRole.id : this.state.rootRoleId
        })
      }
    })
  }

  componentWillReceiveProps (nextProps) {
    // 每次打开弹窗 重置表单
    if (nextProps.visible) {
      this.showListRole()
      this.setState({name: '', rootRoleId: nextProps.currentRoleId})
    }
  }
  // modal确定
  handleOk = (e) => {
    const { name, rootRoleId } = this.state
    if (!rootRoleId) {
      return message.warning('请选择所属角色')
    }
    if (!name) {
      return message.warning('角色名称不能为空')
    }
    if (name.length > 20) {
      return message.warning('角色名称不能超过20个字')
    }
    this.checkoutSameName()
    if (this.hasSameName) {
      return message.warning('角色名称已存在')
    }
    // 添加角色
    const data = { roleName: name, parentRoleId: rootRoleId, isTopRole: this.topRoleId === rootRoleId }
    this.setState({ name: '', rootRoleId: null })
    this.props.addRole(data)
  }

  checkoutSameName = () => {
    this.hasSameName = false
    if (!this.onSelectNodeSibling || !this.onSelectNodeSibling.length) {
      return
    }
    this.onSelectNodeSibling.map(item => {
      if (item.rootRole.roleName === this.state.name) {
        this.hasSameName = true
      }
    })
  }

  // modal取消
  handleCancel = (e) => {
    this.props.onCancel()
  }
  // 输入角色名称
  changeName = (ev) => {
    this.setState({ name: ev.target.value })
  }

  // 递归渲染所属机构
  renderTreeNodes = data => data.map((item) => {
    if (item.subRoleList && item.subRoleList.length) {
      return (
        <TreeSelect.TreeNode data={data} value={item.rootRole.id} title={item.rootRole.roleName} key={item.rootRole.id} disabled={item.rootRole.disabled}>
          {this.renderTreeNodes(item.subRoleList)}
        </TreeSelect.TreeNode>
      )
    }
    return <TreeSelect.TreeNode data={data} value={item.rootRole.id} title={item.rootRole.roleName} key={item.rootRole.id} disabled={item.rootRole.disabled} />
  })

  onChangeRoleList = (value, label, extra) => {
    this.onSelectNodeSibling = extra.triggerNode && extra.triggerNode.props.data
    this.setState({ rootRoleId: value })
  }

  render () {
    const { visible, currentRoleId } = this.props
    const { name, rootRoleId, roleList } = this.state
    const treeDefaultExpandedKeys = currentRoleId ? [currentRoleId.toString()] : []
    return (
      <div className="add-role" >
        <Modal
          title="新建角色"
          visible={visible}
          onOk={this.handleOk}
          okText={'确定'}
          onCancel={this.handleCancel}
          cancelText={'取消'}
        >
          <Form layout={'horizontal'}>
            <Form.Item
              label={<span><span style={{color: 'red'}}>*</span>角色名称</span>}
              labelCol={{span: 6}}
              wrapperCol={{span: 18}}
            >
              <Input allowClear onChange={this.changeName} maxLength={20} placeholder="输入角色名称（20个字以内）" value={name} />
            </Form.Item>
            <Form.Item
              label={<span><span style={{color: 'red'}}>*</span>上级角色</span>}
              labelCol={{span: 6}}
              wrapperCol={{span: 18}}
            >
              {roleList && roleList.length ? <TreeSelect
                value={rootRoleId}
                placeholder="请选择上级角色"
                allowClear
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                treeDefaultExpandedKeys={treeDefaultExpandedKeys}
                onChange={this.onChangeRoleList}
              >
                {this.renderTreeNodes(roleList)}
              </TreeSelect> : null}
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  }
}
