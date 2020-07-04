import React, { Component } from 'react'
import { Button, Input, message, TreeSelect, Tree } from 'antd'
import styles from './index.less'
import AddRoleModal from './addRoleModal'
import RoleSetting from './roleSetting/index.js'
import axios from '@src/utils/axios'
import urls from '@src/config'
import RoleMember from './roleMember/index.js'
import Tools from '@src/utils'
import { connect } from 'react-redux'

class RoleAndRight extends Component {
  constructor (props) {
    super(props)
    const {roleUserAssign, rolePermissionSet} = this.props.right.roleAndRight
    let tab = 0
    if (!roleUserAssign && rolePermissionSet) {
      tab = 1
    }
    this.state = {
      addRoleModalVisible: false,
      currentRoleId: '',
      roleList: [],
      roleInput: null,
      selectedRoleKey: [''],
      expandedKeys: [],
      searchValue: '',
      autoExpandParent: true,
      parentId: null,
      onSelectNodeSibling: [],
      isLoading: true,
      total: null,
      currentRoleName: '',
      tab
    }
    this.dataList = []
  }
  // 进页面获取数据
  componentDidMount () {
    this.showListRole()
  }
  // 展现角色列表
  showListRole = (isAdd) => {
    return axios.post(urls.getListRole, {isContainSelf: false}).then(res => {
      const { roleTree } = res.retdata
      if (roleTree.length) {
        let {
          currentRoleId,
          parentId,
          currentRoleName,
          expandedKeys,
          tab
        } = this.state
        if (!isAdd) {
          // 初始化选中根节点角色
          const firstRole = roleTree[0].rootRole
          currentRoleId = firstRole.id
          parentId = firstRole.parentId
          currentRoleName = firstRole.roleName
          expandedKeys = [firstRole.id + '']
        } else {
          // 新增角色要被选中
          this.getSelectedRoleKey(roleTree)
          currentRoleId = this.newRoleId
          parentId = this.parentId
          currentRoleName = this.newRoleName
          expandedKeys = [this.newRoleId + '']
          tab = 1
        }
        this.setState({
          roleList: roleTree,
          currentRoleId,
          selectedRoleKey: [currentRoleId + ''],
          parentId,
          currentRoleName,
          isLoading: false,
          autoExpandParent: true,
          expandedKeys,
          tab
        }, () => {
          this.generateList(roleTree)
        }) // 初始化搜索列表key
      } else {
        this.setState({
          roleList: [],
          currentRoleId: null,
          selectedRoleKey: [],
          parentId: null,
          currentRoleName: null,
          isLoading: false,
          autoExpandParent: true,
          expandedKeys: [],
          tab: 0
        })
      }
    }).catch(() => {
      this.setState({isLoading: false})
    })
  }
  // 添加角色
  addRole = (data) => {
    this.newRoleName = data.roleName
    this.onSelectNodeId = data.parentRoleId
    this.isTopRole = data.isTopRole
    axios.post(urls.addRole, data).then(res => {
      // 刷新角色列表
      this.showListRole(true)
      message.success('添加角色成功')
      this.hideAddRoleModal()
    }).catch(() => {
      this.hideAddRoleModal()
    })
  }

  getSelectedRoleKey = (roleTree) => {
    const isSurperRole = roleTree.length === 1 // 超级管理员角色返回的树结构第一层只有一个item
    if (!isSurperRole && this.isTopRole) {
      const newRole = roleTree.slice(-1)[0] // 获取新增的角色
      const isAddRole = newRole.rootRole
      this.newRoleId = isAddRole.id
      this.parentId = isAddRole.parentId
      return
    }
    for (let item of roleTree) {
      if (item.rootRole.id === parseInt(this.onSelectNodeId)) {
        for (let sub of item.subRoleList) {
          if (sub.rootRole.roleName === this.newRoleName) {
            // 根据新增角色名称获取角色id
            const isAddRole = sub.rootRole
            this.newRoleId = isAddRole.id
            this.parentId = isAddRole.parentId
          }
        }
      } else if (!this.state.currentRoleId) {
        // 新增第一个角色
        const isAddRole = roleTree[0].rootRole
        this.newRoleId = isAddRole.id
        this.parentId = isAddRole.parentId
      } else {
        this.getSelectedRoleKey(item.subRoleList)
      }
    }
  }

  // 显示新建角色modal
  showAddRoleModal = () => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'roleAdd')
    if (!isRight) return
    this.setState({ addRoleModalVisible: true })
  }
  // 隐藏新建角色modal
  hideAddRoleModal = () => {
    this.setState({ addRoleModalVisible: false })
  }

  // 递归渲染所属机构
  renderTreeNodes = data => data.map((item) => {
    const { searchValue } = this.state
    const { roleName } = item.rootRole
    const name = roleName.length > 10 ? roleName.slice(0, 10) + '...' : roleName
    const index = name.indexOf(searchValue)
    const beforeStr = name.substr(0, index)
    const afterStr = name.substr(index + searchValue.length)
    const title =
      index > -1 ? (
        <span>
          {beforeStr}
          <span style={{ color: '#f50' }}>{searchValue}</span>
          {afterStr}
        </span>
      ) : (
        <span>{name}</span>
      )
    if (item.subRoleList && item.subRoleList.length) {
      return (
        <TreeSelect.TreeNode data={data} value={item.rootRole.id} roleName={roleName} title={title} parentId={item.rootRole.parentId} key={item.rootRole.id} disabled={item.rootRole.disabled}>
          {this.renderTreeNodes(item.subRoleList)}
        </TreeSelect.TreeNode>
      )
    }
    return <TreeSelect.TreeNode data={data} roleName={roleName} value={item.rootRole.id} title={title} parentId={item.rootRole.parentId} key={item.rootRole.id} disabled={item.rootRole.disabled} />
  })

  // 点击某个树节点
  onClickTreeNode = (selectedKeys, e) => {
    const key = selectedKeys[0]
    if (!selectedKeys.length) return
    this.setState({
      selectedRoleKey: selectedKeys,
      currentRoleId: key,
      parentId: e.node.props.parentId,
      onSelectNodeSibling: e.node.props.data,
      currentRoleName: e.node.props.roleName
    })
  }

  getParentKey = (key, tree) => {
    let parentKey
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i]
      if (node.subRoleList) {
        if (node.subRoleList.some(item => item.rootRole.id === key)) {
          parentKey = node.rootRole.id
        } else if (this.getParentKey(key, node.subRoleList)) {
          parentKey = this.getParentKey(key, node.subRoleList)
        }
      }
    }
    return parentKey && parentKey.toString()
  }

  onChangeSearch = e => {
    const { value } = e.target
    const expandedKeys = this.dataList
      .map(item => {
        if (item.roleName.indexOf(value) > -1) {
          return this.getParentKey(item.id, this.state.roleList)
        }
        return null
      })
      .filter((item, i, self) => item && self.indexOf(item) === i)
    this.setState({
      expandedKeys,
      searchValue: value,
      autoExpandParent: true
    })
  }

  generateList = data => {
    for (let i = 0; i < data.length; i++) {
      const node = data[i]
      const { rootRole } = node
      this.dataList.push({ ...rootRole })
      if (node.subRoleList) {
        this.generateList(node.subRoleList)
      }
    }
  }

  onExpand = expandedKeys => {
    this.setState({
      expandedKeys,
      autoExpandParent: false
    })
  }

  updateTotal = (total) => {
    this.setState({total})
  }

  render () {
    const {
      addRoleModalVisible,
      roleList,
      selectedRoleKey,
      expandedKeys,
      searchValue,
      autoExpandParent,
      currentRoleId,
      parentId,
      onSelectNodeSibling,
      isLoading,
      total,
      currentRoleName,
      tab
    } = this.state
    const isSearchEmpty = searchValue.length && !expandedKeys.length
    const {roleUserAssign, rolePermissionSet} = this.props.right.roleAndRight
    const tab1 = <span onClick={() => { this.setState({tab: 0}) }} style={{fontWeight: 500, display: 'inline-block', cursor: 'pointer', fontSize: 15, padding: 15, borderBottom: tab === 0 ? '1px solid #1890ff' : null, color: tab === 0 ? '#1890ff' : '#333'}}>角色成员分配</span>
    const tab2 = <span onClick={() => { this.setState({tab: 1}) }} style={{marginLeft: 30, display: 'inline-block', cursor: 'pointer', padding: 15, fontWeight: 500, fontSize: 15, borderBottom: tab === 1 ? '1px solid #1890ff' : null, color: tab === 1 ? '#1890ff' : '#999 '}} >角色权限设置</span>
    return (
      <div className={styles.roleRightView}>
        <div className={styles.main_title}>角色管理</div>
        <div className={styles.content_view_wrapper}>
          <div className={styles.left_view}>
            <Input.Search style={{ marginBottom: 8 }} maxLength={20} allowClear placeholder="搜索角色" onChange={this.onChangeSearch} />
            <Button className={'ant-input'} type="primary"
              icon="plus-circle" onClick={this.showAddRoleModal}>新建角色</Button>
            {roleList.length && !isSearchEmpty
              ? <div className={styles.scrollViewWrapper} ><Tree
                className="staffListDeptTree"
                defaultExpandedKeys={[roleList[0].rootRole.id.toString()]}
                onSelect={this.onClickTreeNode}
                expandedKeys={expandedKeys}
                onExpand={this.onExpand}
                autoExpandParent={autoExpandParent}
                selectedKeys={selectedRoleKey}
              >
                {this.renderTreeNodes(roleList)}
              </Tree></div> : null}
            {isSearchEmpty ? <div style={{marginTop: 30, color: '#999', fontSize: 12, textAlign: 'center'}}>未搜索到相关角色</div> : null}
          </div>
          { (rolePermissionSet || roleUserAssign) && roleList.length
            ? <div className={styles.right_view}>
              {roleList.length ? <div>
                <span>
                  <div className={styles.right_view_title}>{currentRoleName}{total ? ` (${total}人)` : ''}</div>
                  <div style={{padding: '20px 0 0 20px', borderBottom: '1px solid #eee'}}>
                    {roleUserAssign ? tab1 : null}
                    {rolePermissionSet ? tab2 : null}
                  </div>
                </span>
                {roleUserAssign
                  ? <RoleMember
                    visible={tab === 0}
                    currentRoleId={currentRoleId}
                    parentId={parentId}
                    updateTotal={this.updateTotal}
                    roleName={currentRoleName}
                  /> : null}
                {rolePermissionSet
                  ? <RoleSetting
                    visible={tab === 1}
                    currentRoleId={currentRoleId}
                    onSelectNodeSibling={onSelectNodeSibling}
                    parentId={parentId}
                    updateRole={this.showListRole}
                  /> : null}
              </div> : null }
            </div>
            : null}
          {!roleList.length && !isLoading
            ? <div className={styles.right_view}>
              <div style={{height: '70vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                <img src={require('@src/assets/role-empty.png')} alt={''} style={{width: 120, marginBottom: 10}} />
                <div style={{width: 600}}>
                  <p style={{marginBottom: 15}}>通过建立不同的角色，将文章库、产品库等功能管理权限给到相应的员工进行管理。</p>
                  <p style={{marginBottom: 15}}>如何创建角色？</p>
                  <p style={{marginBottom: 15}}>1.新增角色，并添加相符的员工。</p>
                  <p style={{marginBottom: 15}}>2.为角色设置管理范围和功能权限。</p>
                </div>
                {/* <Button type="primary" style={{marginTop: 20}} onClick={this.showAddRoleModal}>新建角色</Button> */}
              </div>
            </div>
            : null}

        </div>
        <AddRoleModal
          destroyOnClose={true}
          onCancel={this.hideAddRoleModal}
          currentRoleId={currentRoleId}
          visible={addRoleModalVisible}
          addRole={this.addRole}
        />
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
)(RoleAndRight)
