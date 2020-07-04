import React, { Component } from 'react'
import { Icon, Table, Button, message, Tag, Modal, Select, Tooltip } from 'antd'
import { withRouter } from 'react-router-dom'
import styles from './index.less'
import axios from '@src/utils/axios'
import Tools from '@src/utils'
import urls from '@src/config'
import { connect } from 'react-redux'
import UploadModal from './uploadModal/index.js'

const mapStateToProps = (state) => {
  return {
    right: state.base.right
  }
}
@withRouter
@connect(mapStateToProps)
export default class StaffTable extends Component {
  constructor(props, context) {
    super(props)
    this.state = {
      tableData: [],
      pagination: {
        pageSize: 20,
        current: 1,
        total: 0
      },
      loading: false,
      selectedStaffKey: '',
      visibleBusinessTypeModal: false,
      selectedBusinessType: 3
    }
  }
  // 点击员工树或者全局搜索请求table 页码都还原为第一页
  componentWillReceiveProps(nextProps) {
    if (this.props.selectedDeptKey !== nextProps.selectedDeptKey || this.props.searchKey !== nextProps.searchKey) {
      const pagination = { ...this.state.pagination }
      pagination.current = 1
      this.setState({ pagination }, () => {
        this.fetch()
      })
    }
  }
  // 进页面获取表格数据
  componentDidMount() {
    this.fetch()
    this.getUploadState()
  }
  componentWillUnmount() {
    clearTimeout(this.timer)
  }
  // 翻页或者表格筛选排序的时候触发 获取表格数据
  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination }
    pager.current = pagination.current
    this.setState(
      {
        pagination: pager
      },
      () => {
        this.fetch()
      }
    )
  }
  // 表格数据获取 根据this.state.pagination  this.props.searchKey  this.props.selectedDeptKey
  fetch() {
    const { selectedDeptKey, searchKey } = this.props
    const { current, pageSize } = this.state.pagination
    const data = {
      pageNum: current,
      pageSize: pageSize,
      name: searchKey,
      departmentId: selectedDeptKey
    }
    this.setState({ loading: true, selectedStaffKey: '' })
    axios.post(urls.userList, data).then((res) => {
      const pagination = { ...this.state.pagination }
      pagination.total = res.retdata.total
      const tableData = res.retdata.userList.map((obj) => {
        obj.key = obj.id
        return obj
      })
      this.setState({
        loading: false,
        tableData: tableData,
        pagination
      })
    })
  }
  // 导出
  export() {
    const { searchKey, selectedDeptKey } = this.props
    window.location.href = `${urls.exportUser}?name=${searchKey}&departmentId=${selectedDeptKey}`
  }
  // 批量删除
  batchDeleteStaff() {
    const { selectedStaffKey } = this.state
    if (selectedStaffKey) {
      Modal.confirm({
        title: '删除成员确认',
        content: '删除后，成员的企业微信消息记录将完全被清除',
        onOk: () => {
          this.deleteUser(selectedStaffKey)
        },
        onCancel: () => {}
      })
    } else {
      return message.warning('请选择要删除的员工')
    }
  }
  // 显示批量设置业务类型modal
  batchSetBusinessType = () => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'organizationEdit')
    if (!isRight) return
    const { selectedStaffKey } = this.state
    if (selectedStaffKey) {
      this.setState({ visibleBusinessTypeModal: true })
    } else {
      return message.warning('请选择要批量设置业务类型的员工')
    }
  }
  openImport = () => {
    this.setState({ uploadVisible: true })
  }
  // 设置业务类型modal确定
  handleOkBusinessTypeModal = (e) => {
    const { selectedBusinessType, selectedStaffKey } = this.state
    const data = {
      staffIds: selectedStaffKey.join(','),
      businessType: selectedBusinessType
    }
    axios.post(urls.setBusinessType, data).then((res) => {
      this.fetch()
      this.setState({
        visibleBusinessTypeModal: false,
        selectedStaffKey: ''
      })
    })
  }
  // 设置业务类型modal取消
  handleCancelBusinessTypeModal = (e) => {
    this.setState({ visibleBusinessTypeModal: false })
  }
  // 设置业务类型modal选择业务类型
  handleChangeBusinessType = (value) => {
    this.setState({ selectedBusinessType: value })
  }
  // 业务类型标签
  getBusinessTypeTag = (businessType) => {
    if (businessType === 1) {
      return <Tag color="blue">对公</Tag>
    } else if (businessType === 2) {
      return <Tag color="orange">零售</Tag>
    } else if (businessType === 3) {
      return <Tag color="purple">对公+零售</Tag>
    } else {
      return null
    }
  }
  // 删除员工
  deleteStaff(ev, id) {
    ev.stopPropagation()
    Modal.confirm({
      title: '删除成员确认',
      content: '删除后，成员的企业微信消息记录将完全被清除',
      onOk: () => {
        this.deleteUser(id)
      },
      onCancel: () => {}
    })
  }
  // 删除
  deleteUser = (staffIds) => {
    return axios.post(urls.userDelete, { staffIds }).then((res) => {
      this.fetch()
      this.props.getDeptTree()
      return message.success('删除成功')
    })
  }

  goDetail = (record) => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'organizationDetail')
    if (!isRight) return
    const path = { pathname: '/staffDetail', search: `?id=${record.id}` }
    this.props.history.push(path)
  }

  // 查询导入状态
  getUploadState = () => {
    axios.post(urls.progressResult).then((res) => {
      console.log(res)
      const { ret, retdata = {} } = res
      const { taskStatus } = retdata
      if (ret === 0) {
        clearTimeout(this.timer)
        if (taskStatus === 0) {
          this.setState({ uploading: true })
          this.timer = setTimeout(this.getUploadState, 5000)
        }
        if (taskStatus === 1 || taskStatus === 2) this.setState({ uploading: false })
      }
    })
  }

  render() {
    const { tableData, loading, pagination, selectedBusinessType, uploading, uploadVisible } = this.state
    const { right } = this.props
    const canEdit = right.staffList && right.staffList.edit
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({ selectedStaffKey: selectedRowKeys })
      },
      selectedRowKeys: this.state.selectedStaffKey
    }
    const columns = [
      {
        title: '姓名',
        dataIndex: 'name',
        render: (operate, record) => (
          <div>
            {record.isLeader ? <Tag color="green">上级</Tag> : null}
            {this.getBusinessTypeTag(record.businessType)}
            {record.status === 2 ? <Tag color="green">已禁用</Tag> : null}
            <span
              style={{ marginRight: '7px', cursor: 'pointer' }}
              onClick={() => this.props.history.push({ pathname: '/staffDetail', search: `?id=${record.id}` })}
            >
              {record.name}
            </span>
          </div>
        )
      },
      {
        title: '职务',
        dataIndex: 'position'
      },
      {
        title: '部门',
        dataIndex: 'department'
      },
      {
        title: '手机',
        dataIndex: 'phone'
      },
      {
        title: '邮箱',
        dataIndex: 'email'
      },
      {
        title: '操作',
        dataIndex: 'operate',
        render: (operate, record) => {
          return (
            <Button type="primary" className={styles.tableActionLeftItem} onClick={() => this.goDetail(record)}>
              查看
            </Button>
          )
        }
      }
    ]
    const questionInfo = (
      <ul>
        <li>此项为针对客户经理的设置：</li>
        <li>. "对公业务"，该客户经理的个人小站仅展示对公业务产品。</li>
        <li>. "零售业务"，该客户经理的个人小站仅展示零售业务产品。</li>
        <li>. "对公+零售"，该客户经理的个人小站同时展示对公和零售业务产品。</li>
      </ul>
    )
    return (
      <div>
        <div className={styles.rightTop}>
          <Button type="primary" className={styles.tableActionLeftItem} onClick={this.batchSetBusinessType}>
            设置业务类型
          </Button>
          {Tools.checkButtonRight(this.props.location.pathname, 'orgImpot') && (
            <Button type="primary" className={styles.tableActionLeftItem} onClick={this.openImport}>
              {uploading && <Icon type="loading" />}
              {uploading === true && '正在导入...'}
              {uploading === false && '导入完成'}
              {uploading === undefined && '导入组织架构'}
            </Button>
          )}
        </div>
        <div className={styles.rightBottom}>
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={tableData}
            pagination={pagination}
            loading={loading}
            onChange={this.handleTableChange}
            locale={{ emptyText: '当前部门无任何成员' }}
            rowClassName={(record, index) => (record.status === 2 ? 'staffListRowDisabled' : '')}
          />
        </div>
        <Modal
          title="批量设置员工的业务类型"
          width={600}
          visible={this.state.visibleBusinessTypeModal}
          onOk={this.handleOkBusinessTypeModal}
          onCancel={this.handleCancelBusinessTypeModal}
        >
          <div>
            <span>请选择所选员工的业务类型：</span>
            <span>
              <Select value={selectedBusinessType} style={{ width: 260 }} onChange={this.handleChangeBusinessType}>
                <Select.Option value={1}>对公业务</Select.Option>
                <Select.Option value={2}>零售业务</Select.Option>
                <Select.Option value={3}>对公+零售</Select.Option>
              </Select>
            </span>
            <span className={styles.questionInfo}>
              <Tooltip placement="bottomRight" title={questionInfo}>
                <Icon type="question-circle-o" />
              </Tooltip>
            </span>
          </div>
        </Modal>

        {uploadVisible && <UploadModal onCancel={() => this.setState({ uploadVisible: false })} />}
      </div>
    )
  }
}
