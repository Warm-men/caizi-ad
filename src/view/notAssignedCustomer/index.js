import React, { Component } from 'react'
import { Button, Input, Table, Radio, message } from 'antd'
import styles from './index.less'
import AssignToModal from './assignToModal.js'
import axios from '@src/utils/axios'
import urls from '@src/config'
import { connect } from 'react-redux'

class NotAssignedCustomer extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      selectedRowKeys: [],
      tableData: [],
      filterName: '',
      pagination: {
        current: 1,
        pageSize: 20,
        total: 0
        // showSizeChanger: true,
        // onShowSizeChange: this.onShowSizeChange.bind(this),
        // pageSizeOptions: ['1', '2', '10', '50', '200', '500']
      },
      loading: false,
      isShowModal: false,
      rowSelectionType: 'checkbox',
      isMultipleCheck: true,
      selectedCustomers: null,
      isCheckCurrent: false,
      isCheckAll: false
    }
  }
  // 进页面获取表格数据
  componentDidMount () {
    this.fetch()
  }
  // 输入搜索关键字
  changeFilterName (e) {
    this.setState({ filterName: e.target.value })
  }
  // 点击搜索
  searchCustomer (value) {
    const pagination = { ...this.state.pagination }
    pagination.current = 1
    this.setState({ filterName: value, pagination }, () => {
      this.fetch()
    })
  }
  // 翻页或者改变每页显示多少条的时候触发 获取表格数据
  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination }
    pager.current = pagination.current
    this.setState({
      pagination: pager
    }, () => {
      this.fetch()
    })
  }
  // 每页显示多少条
  onShowSizeChange (current, pageSize) {
    this.state.pagination.pageSize = pageSize
    this.setState({ pagination: this.state.pagination })
  }
  // 表格数据获取 根据this.state.filterName this.state.pagination条件
  fetch () {
    const { filterName } = this.state
    const { current, pageSize, total } = this.state.pagination
    const data = {
      name: filterName,
      offset: pageSize * (current - 1),
      limit: pageSize,
      all: 0
    }
    this.setState({ loading: true })
    axios.post(urls.getPoolList, data).then(res => {
      const pagination = { ...this.state.pagination }
      pagination.total = res.retdata.total
      const tableData = res.retdata.clientList.map(obj => {
        obj.key = obj.clientId
        return obj
      })
      // 重新获取表格后勾选本页或者勾选全部清空
      this.setState({
        loading: false,
        tableData: tableData,
        pagination,
        isCheckCurrent: false,
        isCheckAll: false,
        selectedRowKeys: []
      })
    })
  }
  // 勾选本页
  checkCurrent (ev) {
    const { isCheckCurrent } = this.state
    this.setState({
      isCheckAll: false,
      isCheckCurrent: !isCheckCurrent,
      selectedRowKeys: !isCheckCurrent ? this.state.tableData.map(obj => obj.clientId) : []
    })
  }
  // 勾选全部
  checkAll (ev) {
    const { isCheckAll, filterName } = this.state
    if (isCheckAll) {
      // 取消勾选全部
      this.setState({
        isCheckCurrent: false,
        isCheckAll: !isCheckAll,
        selectedRowKeys: []
      })
    } else {
      const data = {
        name: filterName,
        all: 1
      }
      // 勾选全部
      axios.post(urls.getPoolList, data).then(res => {
        this.setState({
          isCheckCurrent: false,
          isCheckAll: !isCheckAll,
          selectedRowKeys: res.retdata.clientIds
        })
      })
    }
  }
  // 点击表格行勾选框
  tableSelectChange (selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, isCheckCurrent: false, isCheckAll: false })
  }
  // 平均分配isMultipleCheck true 多选，指定分配isMultipleCheck false 单选
  assgin (isAverageAssgin) {
    if (!this.state.selectedRowKeys.length) {
      return message.warning('请勾选客户')
    }
    this.setState({ isShowModal: true, isMultipleCheck: isAverageAssgin })
  }
  // 关闭分配的modal
  closeModal () {
    this.setState({ isShowModal: false })
  }
  // 分配成功刷新列表
  handleAssginedSuccess () {
    this.fetch()
  }

  render () {
    const columns = [{
      title: '客户姓名',
      dataIndex: 'clientName'
    }, {
      title: '客户类型',
      dataIndex: 'type'
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
    const { selectedRowKeys, tableData, isShowModal, pagination,
      rowSelectionType, selectedCustomers, isMultipleCheck, isCheckCurrent, isCheckAll } = this.state
    const { right } = this.props
    const canEdit = right.notAssignedCustomer && right.notAssignedCustomer.edit
    return (
      <div>
        <div className={styles.header}>
          <span className={styles.left}>
            <span className={styles.leftItem}>
              <Radio.Button value={'current'} checked={isCheckCurrent} onClick={this.checkCurrent.bind(this)}>勾选本页({pagination.pageSize > pagination.total ? pagination.total : pagination.pageSize})</Radio.Button>
              <Radio.Button value={'all'} checked={isCheckAll} onClick={this.checkAll.bind(this)}>勾选全部({pagination.total})</Radio.Button>
            </span>
            <Button type="primary" disabled={!canEdit} className={styles.leftItem} onClick={() => this.assgin(true)}>平均分配</Button>
            <Button type="primary" disabled={!canEdit} className={styles.leftItem} onClick={() => this.assgin(false)}>指定分配</Button>
          </span>
          <span className={styles.right}>
            <Input.Search
              className={styles.rightItem}
              placeholder={'客户姓名'}
              onChange={this.changeFilterName.bind(this)}
              onSearch={this.searchCustomer.bind(this)}
              style={{ width: 200 }}
            />
          </span>
        </div>
        <div className="notAssignedCustomerTable">
          <Table
            rowSelection={{
              selectedRowKeys,
              onChange: this.tableSelectChange.bind(this)
            }}
            columns={columns}
            dataSource={tableData}
            pagination={this.state.pagination}
            loading={this.state.loading}
            onChange={this.handleTableChange}
            locale={{emptyText: '暂无数据'}}
          />
        </div>
        <AssignToModal
          visible={isShowModal}
          onCancel={this.closeModal.bind(this)}
          isMultipleCheck={isMultipleCheck}
          selectedRowKeys={selectedRowKeys}
          handleAssginedSuccess={this.handleAssginedSuccess.bind(this)}
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
)(NotAssignedCustomer)
