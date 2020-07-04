import React, { Component } from 'react'
import styles from './index.less'
import { Tree, Tooltip, Icon, Modal, Form, Input, TreeSelect, Menu, Dropdown } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import { connect } from 'react-redux'
class DeptTree extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      modalVisible: false,
      isAddModal: true,
      deptName: '',
      parentDeptId: '',
      updateDeptId: '',
      deleteDeptId: '',
      delModalVisible: false
    }
  }

  // 递归渲染树
  renderTreeNodes = data => data.map((item) => {
    const canEdit = this.props.right.staffList && this.props.right.staffList.edit
    const { NoSeeMore } = this.props
    const dropdown = (<Dropdown overlay={
      <Menu>
        <Menu.Item key="0" onClick={(ev) => this.showUpdateModal(ev, item.id, item.name)}>
          <span>修改</span>
        </Menu.Item>
        {item.containsStaff || item.subDept.length ? null : <Menu.Item key="1" onClick={(ev) => this.showDeleteConfirm(ev, item.id)}>
          <span>删除</span>
        </Menu.Item> }
      </Menu>
    } trigger={['hover']} getPopupContainer={() => document.getElementById('staffListDepteTree')}>
      <Icon type="bars" style={{cursor: 'pointer'}} />
    </Dropdown>)
    // 根节点或者没有权限 不要dropdown
    const myTitle = <span>
      <span className="treeItemTitle">{item.name}</span>
      {/* dropdown都不要了 不要修改删除操作 */}
      <span className="treeItemDropdown">{((item.id === this.props.treeData[0].id) || !canEdit) ? null : null}</span>
    </span>
    if (item.subDept) {
      return (
        <Tree.TreeNode title={myTitle} key={item.id} isLeaf={NoSeeMore === '1' || !item.parentDept}>
          {this.renderTreeNodes(item.subDept)}
        </Tree.TreeNode>
      )
    }
    return <Tree.TreeNode title={myTitle} key={item.id} />
  })
  // 点击某个树节点
  onClickTreeNode = (selectedKeys, info) => {
    // 树节点选中后再点击 selectedKeys[0]为空了 这时用info.node.props.value
    // 最终形成树节点选中后再点击这个树节点 还是选中这个树节点
    const key = selectedKeys[0] || this.props.selectedDeptKey
    this.props.onClickNode(key.toString())
  }
  // 新增部门modal
  showAddModal = () => {
    this.setState({ modalVisible: true, isAddModal: true })
  }
  // 修改部门modal
  showUpdateModal = (ev, deptId, deptName) => {
    ev.domEvent.stopPropagation()
    this.setState({ updateDeptId: deptId, deptName })
    this.setState({ modalVisible: true, isAddModal: false })
  }
  // modal确定
  handleOk = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.state.isAddModal ? this.departmentCreate(values) : this.departmentUpdate(values)
      }
    })
  }
  // modal取消
  handleCancel = (e) => {
    this.props.form.resetFields()
    this.setState({ deptName: '', parentDeptId: '', modalVisible: false })
  }
  // 新增部门
  departmentCreate = (values) => {
    axios.post(urls.departmentCreate, values).then(res => {
      this.props.getDeptTree()
      this.handleCancel()
    })
  }
  // 修改部门
  departmentUpdate = (values) => {
    const deptId = this.state.updateDeptId
    const deptName = values.deptName
    axios.post(urls.departmentUpdate, { deptId, deptName }).then(res => {
      this.props.getDeptTree()
      this.handleCancel()
    })
  }
  // 递归渲染员工TreeSelect
  renderTreeSelectNodes = data => data.map((item) => {
    if (item.subDept) {
      return (
        <TreeSelect.TreeNode title={item.name} key={item.id} value={item.id}>
          {this.renderTreeSelectNodes(item.subDept)}
        </TreeSelect.TreeNode>
      )
    }
    return <TreeSelect.TreeNode title={item.name} key={item.id} value={item.id} />
  })
  // 删除部门modalConfirm
  showDeleteConfirm = (ev, id) => {
    ev.domEvent.stopPropagation()
    Modal.confirm({
      title: '删除部门确认',
      content: '确定删除该部门？',
      onOk: () => {
        this.props.departmentDelete(id)
      },
      onCancel: () => {}
    })
  }

  onLoadData = treeNode => {
    return this.props.loadData(treeNode)
  }

  render () {
    const { selectedDeptKey, treeData, right } = this.props
    const { getFieldDecorator } = this.props.form
    const { modalVisible, isAddModal, parentDeptId, deptName, delModalVisible } = this.state
    const treeDefaultExpandedKeys = treeData.length ? [treeData[0].id] : []
    return (
      <div className={styles.treeWrap} id="staffListDepteTree">
        {/* defaultExpandAll defaultExpandedKeys 只有在组件第一次渲染时赋值才有效，所以treeData有值后再渲染Tree组件 */}
        {treeData && treeData.length
          ? <Tree className="staffListDeptTree" defaultExpandedKeys={[treeData[0].id]} onSelect={this.onClickTreeNode} selectedKeys={[selectedDeptKey]} loadData={this.onLoadData}>
            {this.renderTreeNodes(treeData)}
          </Tree> : null}
        {/* {canEdit ? <Tooltip placement="top" title={'新增部门'} className={styles.addIcon}>
          <Icon type="plus" onClick={() => this.showAddModal()} />
        </Tooltip> : null} */}
        <Modal
          title={isAddModal ? '新增部门' : '修改部门'}
          visible={modalVisible}
          onOk={this.handleOk}
          okText={'确定'}
          onCancel={this.handleCancel}
          cancelText={'取消'}
        >
          <Form layout={'horizontal'}>
            <Form.Item label={<span>部门名称</span>} labelCol={{span: 4}} wrapperCol={{span: 20}}>
              {getFieldDecorator('deptName', {
                rules: [{ required: true, whitespace: true, max: 32, message: '请输入部门名称，部门名称最多32个字' }],
                initialValue: deptName
              })(
                <Input placeholder="请输入部门名称" />
              )}
            </Form.Item>
            {isAddModal ? <Form.Item label={<span>所属部门</span>} labelCol={{span: 4}} wrapperCol={{span: 20}}>
              {getFieldDecorator('parentDeptId', {
                rules: [{ required: true, message: '请选择所属部门' }],
                initialValue: parentDeptId
              })(
                <TreeSelect
                  showSearch
                  // 搜索的时候搜titie 默认是搜value
                  treeNodeFilterProp={'title'}
                  dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                  placeholder="请选择所属部门"
                  treeDefaultExpandedKeys={treeDefaultExpandedKeys}
                >
                  {this.renderTreeSelectNodes(treeData)}
                </TreeSelect>
              )}
            </Form.Item> : null}
          </Form>
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    right: state.base.right
  }
}

export default connect(
  mapStateToProps
)(Form.create({ name: 'DeptTree' })(DeptTree))
