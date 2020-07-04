import React, { Component } from 'react'
import styles from './index.less'
import { Button, Icon, Input, Table, Tree, Radio, message, Modal } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import { connect } from 'react-redux'

// 员工使用情况 员工使用统计 共享组件
// props
// columns 表格字段
// isUsage true(员工使用情况) false(员工使用统计)
// getTimeRange 获取选择的是本周、本月还是本年
class UsageAndStatisticList extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      selectedDeptOrManageKey: '',
      isManageKey: false,
      tableData: [],
      filterName: '',
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showTotal: null
      },
      loading: false,
      treeData: null,
      timeRange: 1
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
  // 切换时间范围
  onChangeTimeRange = (e) => {
    const value = e.target.value
    this.props.getTimeRange && this.props.getTimeRange(value)
    this.setState({ timeRange: value }, () => {
      this.fetch()
    })
  }
  // 输入搜索关键字
  changeFilterName = (e) => {
    this.setState({ filterName: e.target.value })
  }
  // 点击搜索
  searchCustomer = () => {
    const pagination = { ...this.state.pagination }
    const filterName = this.state.filterName
    pagination.current = 1
    this.setState({ filterName, pagination }, () => {
      this.fetch()
    })
  }
  // 导出
  export = () => {
    const { filterName, selectedDeptOrManageKey, isManageKey, timeRange } = this.state
    const { current, pageSize, total } = this.state.pagination
    const staffId = isManageKey ? selectedDeptOrManageKey : ''
    const departmentId = !isManageKey ? selectedDeptOrManageKey : ''
    const exportUrl = this.props.isUsage ? urls.exportUseDetail : urls.exportUseStatistics
    // 大于30条 弹confirm
    if (total > 30) {
      Modal.confirm({
        title: '导出',
        content: '导出大概需要2-3分钟，是否继续？',
        onOk () {
          // 不分页导出 所以pageNum是1 所以pageSize是total
          window.location.href = `${exportUrl}?type=${timeRange}&name=${filterName}&pageNum=${1}&pageSize=${total}&staffId=${staffId}&departmentId=${departmentId}`
        },
        onCancel () {}
      })
    } else {
      window.location.href = `${exportUrl}?type=${timeRange}&name=${filterName}&pageNum=${1}&pageSize=${total}&staffId=${staffId}&departmentId=${departmentId}`
    }
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
    const { filterName, selectedDeptOrManageKey, isManageKey, timeRange } = this.state
    const { current, pageSize } = this.state.pagination
    const data = {
      type: timeRange,
      name: filterName,
      pageNum: current,
      pageSize: pageSize,
      staffId: isManageKey ? selectedDeptOrManageKey : '',
      departmentId: !isManageKey ? selectedDeptOrManageKey : ''
    }
    const url = this.props.isUsage ? urls.useDetail : urls.useStatistics
    this.setState({ loading: true })
    axios.post(url, data).then(res => {
      const pagination = { ...this.state.pagination }
      pagination.total = res.retdata.total
      pagination.showTotal = (total) => `共 ${total} 条记录`
      this.setState({
        loading: false,
        tableData: res.retdata.list,
        pagination
      })
    })
  }

  render () {
    const { selectedDeptOrManageKey, tableData, pagination, loading, treeData, timeRange } = this.state
    const { columns, isUsage, right } = this.props
    const canExportUseDetail = right.staffUsage && right.staffUsage.exportUseDetail
    const canExportUseStatistics = right.staffStatistic && right.staffStatistic.exportUseStatistics
    const canExport = isUsage ? canExportUseDetail : canExportUseStatistics
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
          <div className={styles.header}>
            <span className={styles.leftHeader}>
              <Radio.Group onChange={this.onChangeTimeRange} value={timeRange}>
                <Radio.Button value={1}>本周</Radio.Button>
                <Radio.Button value={2}>本月</Radio.Button>
                <Radio.Button value={isUsage ? 3 : 4}>本年</Radio.Button>
              </Radio.Group>
            </span>
            <div className={styles.rightHeader}>
              <Input
                placeholder={'输入客户经理姓名'}
                onChange={this.changeFilterName}
                style={{ width: 200 }}
                className={styles.rightHeaderItem}
              />
              <Button type="primary" className={styles.rightHeaderItem} onClick={this.searchCustomer}>查询</Button>
              <Button type="primary" className={styles.rightHeaderItem} onClick={this.export} disabled={!canExport}>导出</Button>
            </div>
          </div>
          <div className={styles.table}>
            <Table
              columns={columns}
              dataSource={tableData}
              rowKey={'staffId'}
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

const mapStateToProps = state => {
  return {
    right: state.base.right
  }
}

export default connect(
  mapStateToProps
)(UsageAndStatisticList)
