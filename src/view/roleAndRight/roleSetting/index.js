import React, { Component } from 'react'
import { Button, Form, Input, TreeSelect, Alert, Checkbox, message, Modal } from 'antd'
import RightTable from './rightTable'
import DeptTreeSelect from '@src/components/DeptTreeSelect'
import axios from '@src/utils/axios'
import urls from '@src/config'
import Tools from '@src/utils'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { actions } from '@src/store/modules/base'
import styles from '../index.less'
class RoleSetting extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      name: '',
      rightTableData: [],
      isAdmin: false,
      currentRoleId: '',
      changeDept: [],
      deptTree: [],
      selectAll: false,
      hasModified: false,
      isFirst: false
    }
    this.isInit = false
    this.lastRightTableData = []
  }

  componentDidMount () {
    this.isInit = true
    this.getRoleDetail(this.props.currentRoleId)
    this.getDepartmentOwnerList(this.props.parentId)
  }

  componentWillReceiveProps (nextProps) {
    const now = this.props.currentRoleId
    const next = nextProps.currentRoleId
    let isQuery = false
    if (next && now !== next) {
      this.getRoleDetail(nextProps.currentRoleId)
      this.getDepartmentOwnerList(nextProps.parentId)
      this.setState({ selectAll: false })
      isQuery = true
    }
    if (nextProps.visible) {
      if (this.isInit || isQuery) return
      this.isInit = true
      this.getRoleDetail(this.props.currentRoleId)
      this.getDepartmentOwnerList(this.props.parentId)
    }
  }
  // 获取角色详情
  getRoleDetail = (roleId) => {
    axios.post(urls.listRolePermissions, { roleId }).then((res) => {
      const {
        roleName,
        roleRangeList,
        resources,
        isAdmin,
        isFirst
      } = res.retdata
      this.setState({
        name: roleName,
        rightTableData: this.resResources(resources),
        roleId: roleId,
        isAdmin,
        selectAll: !!isAdmin,
        changeDept: roleRangeList,
        isFirst
      }, this.reportState)
    })
  }
  getDepartmentOwnerList = (parentId) => {
    axios
      .post(urls.departmentOwnerList, { parentRoleId: parentId, useRole: true })
      .then((res) => {
        const { deptList } = res.retdata
        this.setState({
          deptTree: deptList
        })
      })
  }

  resResources = (resources) => {
    let newResources = [...resources]
    for (let item of newResources) {
      for (let obj of item.resources) {
        obj.resources = obj.operations
        for (let op of obj.resources) {
          op.level = 3
          op.resId = op.name
          op.resName = op.name
          op.resources = op.buttons
          for (let btns of op.resources) {
            btns.level = 4
          }
        }
      }
    }
    this.lastRightTableData = newResources
    return newResources
  }

  // 修改角色名称
  changeName = (ev) => {
    this.setState({ name: ev.target.value })
  }

  renderTreeNodes = (data) =>
    data.map((item) => {
      if (item.subDept) {
        return (
          <TreeSelect.TreeNode
            value={item.id}
            title={item.name}
            key={item.id}
            disabled={item.disabled}
          >
            {this.renderTreeNodes(item.subDept)}
          </TreeSelect.TreeNode>
        )
      }
      return (
        <TreeSelect.TreeNode
          value={item.id}
          title={item.name}
          key={item.id}
          disabled={item.disabled}
        />
      )
    })

  // 后台管理权限勾选修改
  onChangeRightCheck = (ev, obj, superParent, parent) => {
    obj.owner = !obj.owner
    // 如果勾选了分配等 第一个的查看自动勾选
    if (!obj.owner) {
      if (parent.buttonType === 'view') {
        for (let item of superParent.resources) {
          for (let btn of item.buttons) {
            btn.owner = false
          }
        }
      }
    } else {
      if (parent.buttonType !== 'view') {
        for (let item of superParent.resources) {
          if (item.buttonType === 'view') {
            for (let btn of item.buttons) {
              btn.owner = true
            }
          }
        }
      }
    }
    this.setState({
      rightTableData: this.state.rightTableData,
      hasModified: true,
      selectAll: false
    })
  }

  checkoutSameName = () => {
    let hasSameName = false
    if (this.props.onSelectNodeSibling.length < 2) {
      hasSameName = false
      return hasSameName
    }
    const sameNameLength = this.props.onSelectNodeSibling.filter(
      (item) => item.rootRole.roleName === this.state.name
    )
    return sameNameLength.length > 1
  }

  getResources = (newResources) => {
    const currentResources = JSON.parse(JSON.stringify(newResources))
    let currentRes = []
    for (let m of currentResources) {
      for (let i of m.resources) {
        currentRes = i.resources
        i.resources = []
        delete i.operations
        for (let op of currentRes) {
          for (let btns of op.resources) {
            btns.level = 3
            i.resources.push(btns)
          }
        }
      }
    }
    return currentResources
  }

  reportState = () => {
    const { changeDept } = this.state
    const isValid = this.checkRoleValid()
    const hasRangeAndRight = isValid && !!changeDept.length // 管理范围以及功能权限是否为空
    this.props.dispatch(actions.hasRangeAndRight(hasRangeAndRight))
  }

  checkRoleValid = () => {
    const { rightTableData } = this.state
    let isValid = false
    for (let m of rightTableData) {
      for (let item of m.resources) {
        for (let op of item.resources) {
          for (let btn of op.resources) {
            isValid = isValid || btn.owner
          }
        }
      }
    }
    return isValid
  }

  beforeUpdate = () => {
    const { name, changeDept, hasModified, isFirst } = this.state
    if (!name) {
      return message.warning('角色名称不能为空')
    }
    if (name.length > 20) {
      return message.warning('角色名称不能超过20个字')
    }
    const hasSameName = this.checkoutSameName()
    if (hasSameName) {
      return message.warning('角色名称已存在')
    }
    if (!changeDept.length) {
      return message.warning('管理范围不能为空')
    }
    const isRoleValid = this.checkRoleValid()
    if (!isRoleValid) {
      return message.warning('功能权限不能为空')
    }
    if (!hasModified || isFirst) {
      this.updateRole()
      return null
    }
    Modal.confirm({
      title: '提示',
      content:
        '修改该角色的管理范围和功能权限后，下级角色对应已设置的管理范围和功能权限也将同步发生变动。',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        this.updateRole()
      }
    })
  }

  // 修改角色
  updateRole = () => {
    const { name, changeDept, rightTableData } = this.state
    const { currentRoleId } = this.props
    const data = {
      roleId: currentRoleId,
      roleName: name,
      roleRange: changeDept.join(','),
      resources: this.getResources(rightTableData)
    }
    axios
      .post(urls.updateRolePermissions, data, {
        headers: { 'Content-Type': 'application/json' }
      })
      .then((res) => {
        this.props.dispatch(actions.hasRangeAndRight(true))
        message.success('保存角色成功')
      })
  }
  // 删除角色
  removeRole = () => {
    const isRight = Tools.checkButtonRight(
      this.props.location.pathname,
      'roleDel'
    )
    if (!isRight) return
    Modal.confirm({
      title: '删除角色',
      content: (
        <span>
          <div>确认删除该角色？</div>
          <div style={{ color: '#999' }}>
            删除角色后，该角色下所有成员将被移除该角色。
          </div>
        </span>
      ),
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const { currentRoleId } = this.props
        axios.post(urls.deleteRole, { roleId: currentRoleId }).then((res) => {
          message.success('删除角色成功')
          this.props.updateRole()
        })
      }
    })
  }

  // 选择所属机构
  onChangeDept = (value) => {
    this.setState({ changeDept: value, hasModified: true })
  }

  selectAllRightTableData = (isAll) => {
    for (let item of this.state.rightTableData) {
      for (let buss of item.resources) {
        for (let op of buss.resources) {
          for (let btn of op.resources) {
            btn.owner = isAll
          }
        }
      }
    }
  }

  selectAllOperation = () => {
    const { selectAll } = this.state
    if (selectAll) {
      this.selectAllRightTableData(true)
      this.setState({ rightTableData: this.state.rightTableData })
    } else {
      this.selectAllRightTableData(false)
      this.setState({ rightTableData: this.state.rightTableData })
    }
  }

  selectAll = (e) => {
    if (e.target.checked) {
      this.lastRightTableData = JSON.parse(
        JSON.stringify(this.state.rightTableData)
      )
    }
    this.setState({ selectAll: e.target.checked }, this.selectAllOperation)
  }

  render () {
    const { currentRoleId, visible } = this.props
    const {
      name,
      rightTableData,
      deptTree,
      changeDept,
      selectAll,
      isAdmin
    } = this.state
    const itemCol = {
      labelCol: { span: 2 },
      wrapperCol: { span: 14 }
    }
    // 没有currentRoleId就不展示这个组件
    if (!currentRoleId) return <div style={{padding: 50, textAlign: 'center'}}>暂无选中角色，请选择角色</div>
    if (!visible) return null
    return (
      <div className="role-detail" style={{ padding: '20px 0' }}>
        {isAdmin ? <Alert style={{marginBottom: 20, fontSize: 12}} message="“超级管理员”为默认角色，角色权限无法编辑。" type="info" /> : null}
        <Form.Item label={<span><span style={{color: 'red'}}>*</span>角色名称</span>} {...itemCol}>
          <Input
            disabled={isAdmin}
            style={{ width: 300 }}
            maxLength={20}
            onChange={this.changeName}
            placeholder="输入角色名称（20个字以内）"
            value={name}
          />
        </Form.Item>
        <Form.Item label={<span><span style={{color: 'red'}}>*</span>管理范围</span>} {...itemCol}>
          <div>
            <div>设置对组织架构的管理范围，权限设置均不得超出此管理范围。</div>
            <DeptTreeSelect
              onChange={this.onChangeDept}
              value={changeDept}
              treeCheckable
              style={{ width: '100%' }}
              disabled={isAdmin}
              showCheckedStrategy={'SHOW_PARENT'}
            />
          </div>
        </Form.Item>
        <Form.Item label={<span><span style={{color: 'red'}}>*</span>功能权限</span>} {...itemCol}>
          <div>
            <div
              style={{
                marginBottom: 10,
                display: 'flex',
                justifyContent: 'space-between',
                width: 802
              }}
            >
              <span>将会在管理范围内配置功能权限。</span>
              {rightTableData.length ? (
                <div>
                  <Checkbox
                    disabled={isAdmin}
                    checked={selectAll}
                    onChange={this.selectAll}
                  >
                    全部选择
                  </Checkbox>
                </div>
              ) : null}
            </div>
            {rightTableData.length
              ? <div className={styles.treeTableHeaderWrapper}>
                <ul className={styles.treeTableHeader}>
                  <li className={styles.treeSpan}>模块名称</li>
                  <li className={styles.treeSpan}>功能名称</li>
                  <li className={styles.treeSpanOperation}>操作类别</li>
                  <li className={styles.treeSpanRight}>权限</li>
                </ul>
              </div> : null }
            {rightTableData.length
              ? <div style={{overflowY: 'scroll', position: 'relative', height: '70vh', width: 810, boxShadow: '0 3px 8px #ddd'}}>
                <RightTable
                  rightTableData={rightTableData}
                  disabled={isAdmin}
                  onChangeRightCheck={this.onChangeRightCheck}
                />
              </div>
              : null }
            <Button
              type="primary"
              disabled={isAdmin}
              style={{ marginTop: 20 }}
              onClick={this.beforeUpdate}
            >
              保存
            </Button>
            <Button
              type="danger"
              disabled={isAdmin}
              style={{ marginLeft: 20 }}
              onClick={this.removeRole}
            >
              删除
            </Button>
          </div>
        </Form.Item>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    hasRangeAndRight: state.base.hasRangeAndRight
  }
}

export default withRouter(connect(
  mapStateToProps
)(RoleSetting))
