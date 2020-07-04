import React, { Component } from 'react'
import styles from './index.less'
import { Input, Table, Tree, Icon } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
export default class AssignedCustomer extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      selectedDeptOrManageKey: '',
      isManageKey: false,
      tableData: [],
      filterName: '',
      pagination: {
        current: 1,
        pageSize: 20,
        total: 0,
        showTotal: null
      },
      loading: false,
      treeData: null
    }
  }

  // 进页面获取表格数据
  componentDidMount () {
    this.fetch()
    this.setTreeData()
  }
  // 获取树
  setTreeData () {
    axios.get(urls.contractTree).then(res => {
      this.setState({
        treeData: res.retdata.deptList
      })
    })
  }
  // 递归渲染树
  renderTreeNodes = data => data.map((item) => {
    if (item.children) {
      return (
        <Tree.TreeNode title={item.title} key={item.key} dataRef={item}>
          {this.renderTreeNodes(item.children)}
        </Tree.TreeNode>
      )
    }
    return <Tree.TreeNode title={item.title} key={item.key} dataRef={item}></Tree.TreeNode>
  })
  // 点击某个树节点
  onClickTreeNode = (selectedKeys, {selected, selectedNodes, node, event}) => {
    // 点击当前已选中的节点时 selectedKeys[0]是undefine 此时不变化selectedDeptOrManageKey 从而继续保持此节点选中
    if (selectedKeys[0]) {
      this.setState({
        selectedDeptOrManageKey: selectedKeys[0],
        // isManageKey 部门节点还是员工节点
        isManageKey: selectedNodes[0].props.dataRef.type,
        pagination: { ...this.state.pagination, current: 1 }
      }, () => {
        this.fetch()
      })
    }
  }
  // 输入搜索关键字
  changeFilterName (e) {
    this.setState({ filterName: e.target.value })
  }
  // 点击搜索
  searchCustomer (value) {
    this.setState({
      filterName: value,
      pagination: { ...this.state.pagination, current: 1 },
      selectedDeptOrManageKey: '' }, () => {
      this.fetch()
    })
  }
  // 翻页 获取表格数据
  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination }
    pager.current = pagination.current
    this.setState({
      pagination: pager
    }, () => {
      this.fetch()
    })
  }
  // 表格数据获取
  fetch () {
    const { filterName, selectedDeptOrManageKey, isManageKey } = this.state
    const { current, pageSize } = this.state.pagination
    const data = {
      keyword: filterName,
      offset: pageSize * (current - 1),
      limit: pageSize,
      staffId: isManageKey ? selectedDeptOrManageKey : '',
      deptId: !isManageKey ? selectedDeptOrManageKey : ''
    }
    this.setState({ loading: true })
    axios.post(urls.getPoolAllotList, data).then(res => {
      const pagination = { ...this.state.pagination }
      pagination.total = res.retdata.total
      pagination.showTotal = (total) => `共 ${total} 条记录`
      const tableData = res.retdata.clientList.map(obj => {
        obj.key = obj.clientId
        return obj
      })
      this.setState({
        loading: false,
        tableData: tableData,
        pagination
      })
    })
  }

  render () {
    const columns = [{
      title: '客户姓名',
      dataIndex: 'clientName',
      render: (caizhiRemark, weixinRemark, clientName) => {
        return caizhiRemark || weixinRemark || clientName
      }
    }, {
      title: '客户经理',
      dataIndex: 'staffName'
    }, {
      title: '风险偏好',
      dataIndex: 'fxLevel'
    }, {
      title: '资产偏好',
      dataIndex: 'zclike'
    }, {
      title: '理财年限(年)',
      dataIndex: 'fgage'
    }, {
      title: '资产规模(万)',
      dataIndex: 'asset'
    }]
    const { selectedDeptOrManageKey, tableData, pagination, loading, treeData } = this.state
    return (
      <div className={`${styles.wrap} assignedTree`}>
        <div className={styles.left}>
          <div className={styles.treeWrap}>
            {treeData && (treeData.length
              ? <Tree
                defaultExpandedKeys={[treeData[0].key]}
                onSelect={this.onClickTreeNode}
                selectedKeys={[selectedDeptOrManageKey]}
              >
                {this.renderTreeNodes(treeData)}
              </Tree>
              : <div className={styles.noneInfo}><Icon type="info-circle" /> <span>暂无有外部联系人权限的员工</span></div>) }
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.rightHeader}>
            <Input.Search
              placeholder={'客户姓名/客户经理'}
              onChange={this.changeFilterName.bind(this)}
              onSearch={this.searchCustomer.bind(this)}
              style={{ width: 200 }}
            />
          </div>
          <div className={styles.rightTable}>
            <Table
              columns={columns}
              dataSource={tableData}
              pagination={pagination}
              loading={loading}
              onChange={this.handleTableChange.bind(this)}
              locale={{emptyText: '暂无数据'}}
            />
          </div>
        </div>
      </div>
    )
  }
}
