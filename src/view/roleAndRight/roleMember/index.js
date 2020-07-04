import React, { Component } from 'react'
import { Button, Modal, TreeSelect, Table, message, Select } from 'antd'
import styles from '../index.less'
import utils from '@src/utils'
import axios from '@src/utils/axios'
import urls from '@src/config'
import AddMemberModal from './addMemberModal/index.js'
import AddBentchMemberModal from './addBentchMemberModal'
import { connect } from 'react-redux'
function getColumns () {
  return [{
    title: '姓名',
    dataIndex: 'name',
    ellipsis: true,
    width: 100
  },
  {
    title: '职务',
    dataIndex: 'position',
    ellipsis: true,
    width: 100,
    render: (text, record) => {
      return record.position || '未设置'
    }
  }, {
    title: '部门',
    dataIndex: 'department',
    width: '60%',
    ellipsis: true,
    render: (text, record, index) => {
      const textArr = record.department.split(';')
      const textExtra = textArr[1] ? '...' : ''
      const textContent = textArr[0] + textExtra
      const content = <span>
        {text}
      </span>
      return content
    }
  }, {
    title: '操作',
    dataIndex: 'sendDetail',
    width: 100,
    render: (text, record, index) => {
      const detail = <span>
        <span style={{color: 'red', cursor: 'pointer'}} onClick={() => this.deleteItem(record.id)}>删除</span>
      </span>
      return detail
    }
  }]
}
class RoleMember extends Component {
  constructor (props) {
    super(props)
    this.state = {
      memberList: [],
      selectedRowKeys: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: null,
        showTotal: null
      },
      userName: null,
      isShowAddMemberModal: false,
      isShowAddBentchMemberModal: false,
      parentId: props.parentId || null,
      deptTree: [],
      changeDept: null,
      onSearch: null,
      deptUserList: [],
      onChangeDeptUser: []
    }
    this.columns = getColumns.call(this)
  }

  componentDidMount () {
    this.getRoleUserList()
    this.getDepartmentOwnerList()
  }

  componentWillReceiveProps (nextProps) {
    const now = this.props.currentRoleId
    const next = nextProps.currentRoleId
    if (next && (now !== next)) {
      const pagination = {
        current: 1,
        pageSize: 10,
        total: null,
        showTotal: null
      }
      this.setState({
        pagination,
        onSearch: null
      }, () => {
        this.getRoleUserList(nextProps.currentRoleId)
      })
      this.getDepartmentOwnerList(nextProps.parentId)
      this.setState({parentId: nextProps.parentId})
    }
  }

  getRoleUserList = (currentRoleId, isSearch = false) => {
    let { pagination, userName, changeDept } = this.state
    const roleId = currentRoleId || this.props.currentRoleId
    let newDepartId = ''
    let newUserName = ''
    if (isSearch) {
      newDepartId = changeDept
      newUserName = userName
    }
    const paramse = {
      roleId,
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      userName: newUserName,
      departId: newDepartId
    }
    axios.post(urls.roleUserList, paramse, {headers: { 'Content-Type': 'application/json' }}).then(res => {
      const { total, list } = res.retdata
      if (paramse.pageNum > 1 && list.length === 0) {
        this.resetPageNum()
        return
      }
      this.props.updateTotal(total)
      const pagination = { ...this.state.pagination }
      pagination.total = res.retdata.total
      pagination.showTotal = (total) => `共 ${total} 条记录`
      this.setState({memberList: list, pagination, selectedRowKeys: []})
    })
  }

  resetPageNum = () => {
    this.setState({
      pagination: {
        ...this.state.pagination,
        current: this.state.pagination.current - 1
      }
    }, this.getRoleUserList)
  }

  getDepartmentOwnerList = (parentId) => {
    let parentRoleId = parentId || this.props.parentId
    axios.post(urls.departmentOwnerList, {parentRoleId, useRole: true}).then(res => {
      const { deptList } = res.retdata
      this.setState({
        deptTree: deptList
      })
    })
  }

  deleteItem = (id, isBatch = false) => {
    Modal.confirm({
      title: '删除成员',
      content: <span>
        <div>确认从该角色中移除选中成员？</div>
        <div style={{color: '#999'}}>此操作不会删除该成员的其他角色。</div>
      </span>,
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const { currentRoleId } = this.props
        const ids = isBatch ? this.state.selectedRowKeys : [id]
        axios.post(urls.roleUserDel, { roleId: currentRoleId, ids }, {headers: {'Content-Type': 'application/json'}}).then(res => {
          message.success('删除成员成功')
          this.getRoleUserList()
        })
      }
    })
  }

  // 选择所属机构
  onChangeDept = value => {
    this.setState({ changeDept: value })
  }

  tableSelectChange = (selectedRowKeys) => {
    this.setState({selectedRowKeys})
  }

  renderTreeNodes = data => data.map((item) => {
    if (item.subDept) {
      return (
        <TreeSelect.TreeNode value={item.id} title={item.name} key={item.id} disabled={item.disabled}>
          {this.renderTreeNodes(item.subDept)}
        </TreeSelect.TreeNode>
      )
    }
    return <TreeSelect.TreeNode value={item.id} title={item.name} key={item.id} disabled={item.disabled} />
  })

  // 分页、排序、筛选变化时触发 获取表格数据
  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination }
    pager.current = pagination.current
    this.setState({
      pagination: pager
    }, this.getRoleUserList)
  }

  showAddMemberModal = () => {
    const { hasRangeAndRight } = this.props
    if (!hasRangeAndRight) {
      message.destroy()
      return message.warning('请先在“角色权限设置”中设置管理范围和功能权限')
    }
    this.setState({
      isShowAddMemberModal: true
    })
  }

  showAddBentchMemberModal = () => {
    const { hasRangeAndRight } = this.props
    if (!hasRangeAndRight) {
      message.destroy()
      return message.warning('请先在“角色权限设置”中设置管理范围和功能权限')
    }
    this.setState({
      isShowAddBentchMemberModal: true
    })
  }

  hideAddMemberModal = () => {
    this.setState({
      isShowAddMemberModal: false
    })
  }

  hideAddBentchMemberModal = () => {
    this.setState({
      isShowAddBentchMemberModal: false
    })
  }

  deleteMembers = () => {
    this.deleteItem('', true)
  }

  searchMemberList = () => {
    const pagination = {
      current: 1,
      pageSize: 10,
      total: null,
      showTotal: null
    }
    this.setState({pagination}, () => this.getRoleUserList(this.props.currentRoleId, true))
  }

  onSearch = v => {
    if (v.length >= 20) {
      message.destroy()
      message.error('不能超过20个字符')
      return
    }
    this.setState({searchValue: v})
  }

  // 选择成员
  changeStaff = (value, nodeValue) => {
    this.setState({
      onChangeDeptUser: value,
      userName: nodeValue ? nodeValue.props.name : null
    })
  }

  // 远程搜索成员
  searchStaff = (value) => {
    if (value.length > 10) {
      message.destroy()
      message.error('不能超过10个字符')
      return
    }
    this.debounce(value)
  }
  // debounce闭包 必须先写好 然后在searchStaff触发
  debounce = utils.debounce((value) => this.getStaffList(value), 300)
  getStaffList = (value) => {
    const key = value.trim()
    if (!key) {
      this.setState({ deptUserList: [] })
    } else {
      const params = {
        roleId: this.props.currentRoleId,
        name: key,
        deptIds: this.state.changeDept || []
      }
      axios.post(urls.deptUser, params).then(res => {
        const deptUserList = res.retdata.userList
        this.setState({ deptUserList })
      })
    }
  }

  render () {
    const {
      memberList,
      selectedRowKeys,
      pagination,
      deptTree,
      changeDept,
      isShowAddMemberModal,
      isShowAddBentchMemberModal,
      searchValue,
      deptUserList,
      onChangeDeptUser
    } = this.state
    const { currentRoleId, roleName, visible, parentId } = this.props
    if (!visible) return null
    return (
      <div className={styles.roleMember}>
        <div className={styles.memberListSearchView} style={{position: 'relative'}}>
          <div>
            {deptTree && deptTree.length ? <span className={styles.search_sub}>
              部门：
              <TreeSelect
                showSearch
                onSearch={this.onSearch}
                value={changeDept}
                searchValue={searchValue}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                placeholder="搜索或选择部门"
                treeNodeFilterProp={'title'}
                style={{width: 200}}
                allowClear
                showCheckedStrategy={'SHOW_PARENT'}
                treeDefaultExpandedKeys={[deptTree[0].id]}
                onChange={this.onChangeDept}
              >
                {this.renderTreeNodes(deptTree)}
              </TreeSelect>
            </span> : null}
            <span style={{marginLeft: 20, marginRight: 20}}>
              成员：
              <Select
                style={{ width: '200px' }}
                placeholder="输入成员姓名"
                value={onChangeDeptUser}
                onChange={this.changeStaff}
                onSearch={this.searchStaff}
                showSearch
                allowClear
                defaultActiveFirstOption={false}
                showArrow={false}
                filterOption={false}
              >
                {deptUserList.map(obj => {
                  return <Select.Option
                    title={`${obj.name} - ${obj.department}`}
                    name={obj.name} key={obj.id} value={obj.id}>
                    {obj.name} - {obj.department}
                  </Select.Option>
                })}
              </Select>
            </span>
            <Button type="primary" onClick={this.searchMemberList}>查询</Button>
          </div>
          <div className={styles.right_view_btn} style={{position: 'absolute', right: 0}}>
            <Button type="primary" style={{marginRight: 20}} onClick={this.showAddMemberModal}>添加成员</Button>
            <Button type="primary" onClick={this.showAddBentchMemberModal}>批量导入</Button>
          </div>
        </div>
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: this.tableSelectChange
          }}
          columns={this.columns}
          rowKey={'id'}
          footer={() => (selectedRowKeys.length ? <span>已选择{selectedRowKeys.length}名成员 <Button type="Danger" onClick={this.deleteMembers}>删除</Button></span> : null)}
          dataSource={memberList}
          pagination={pagination}
          onChange={this.handleTableChange}
          locale={{emptyText: <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}><img src={require('@src/assets/member-empty.png')} alt={''} style={{width: 100}} />当前角色无成员</div>}}
        />
        {isShowAddMemberModal ? <AddMemberModal
          destroyOnClose={true}
          onCancel={this.hideAddMemberModal}
          parentId={parentId}
          update={this.getRoleUserList}
          currentRoleId={currentRoleId}
          visible={isShowAddMemberModal}
        /> : null}
        {isShowAddBentchMemberModal ? <AddBentchMemberModal
          destroyOnClose={true}
          onCancel={this.hideAddBentchMemberModal}
          roleName={roleName}
          update={this.getRoleUserList}
          currentRoleId={currentRoleId}
          visible={isShowAddBentchMemberModal}
        /> : null}
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    hasRangeAndRight: state.base.hasRangeAndRight
  }
}

export default connect(
  mapStateToProps
)(RoleMember)
