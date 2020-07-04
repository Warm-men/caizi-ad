import React, { Component } from 'react'
import { Button, Table, message, Modal, DatePicker } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import moment from 'moment'
import styles from './index.less'

const { RangePicker } = DatePicker

export default class DataList extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      tableData: [],
      pagination: {
        current: 1,
        pageSize: 20,
        total: 0
      },
      isLoading: true,
      filterDateRange: [moment().subtract(6, 'days'), moment().subtract(0, 'days')]
    }
  }

  componentDidMount () {
    this.search()
  }

  // 时间范围
  onChangeRangePicker = (date) => { this.setState({ filterDateRange: date }) }

  // 点击查询
  search = () => {
    const pagination = { ...this.state.pagination }
    pagination.current = 1
    // 默认第一页 清空排序
    this.setState({ pagination }, () => {
      this.fetch()
    })
  }

  // 表格数据获取
  fetch () {
    const { filterDateRange } = this.state
    const { current, pageSize, total, pageNum } = this.state.pagination
    const data = {
      pageNum: current,
      // 拖拽页面不分页
      pageSize: pageSize,
      startDate: filterDateRange[0] ? new Date(filterDateRange[0]).format('yyyy-MM-dd') : '',
      endDate: filterDateRange[1] ? new Date(filterDateRange[1]).format('yyyy-MM-dd') : ''
    }
    this.setState({ isLoading: true })
    axios
      .post(urls.appliationStatistics, data, {
        headers: { 'Content-Type': 'application/json' }
      }).then(res => { // 获取列表数据
        const { list = [], total = 0 } = res.retdata
        this.setState({
          isLoading: false,
          tableData: list,
          pagination: { ...this.state.pagination, current: pageNum, total, showTotal: total => `共 ${total}条记录` },
          total
        })
      })
      .catch(() => {
        this.setState({ isLoading: false })
      })
  }
  // 导出
  exportExecl = () => {
    const { filterDateRange } = this.state
    this.setState({ exportLoading: true })
    const startDate = filterDateRange[0] ? new Date(filterDateRange[0]).format('yyyy-MM-dd') : ''
    const endDate = filterDateRange[1] ? new Date(filterDateRange[1]).format('yyyy-MM-dd') : ''
    axios
      .post(urls.statisticsExport, { startDate, endDate }, {
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        responseType: 'blob'
      })
      .then((res) => {
        this.setState({ exportLoading: false })
        this.exportFile(res)
      }).catch((res) => {
        this.setState({ exportLoading: false })
      })
  }

  exportFile = (res) => {
    const blob = new window.Blob([res], { type: 'application/vnd.ms-excel' })
    const { filterDateRange } = this.state
    const startDate = filterDateRange[0] ? new Date(filterDateRange[0]).format('yyyyMMdd') : ''
    const endDate = filterDateRange[1] ? new Date(filterDateRange[1]).format('yyyyMMdd') : ''
    const fName = `预约申请（${startDate}至${endDate}）`
    if ('msSaveOrOpenBlob' in navigator) {
      window.navigator.msSaveOrOpenBlob(blob, `${fName}.xls`)
      return
    }
    const href = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = href
    a.download = `${fName}.xls`
    a.click()
    URL.revokeObjectURL(href)
  }

  // 分页、排序、筛选变化时触发 获取表格数据
  handleTableChange = (pagination, filters, sorter) => {
    const { columnKey: prevColumnKey, order: prevOrder } = this.state.sortedInfo
    const pager = { ...this.state.pagination }
    if ((prevColumnKey === sorter.columnKey) && (prevOrder === sorter.order)) {
      pager.current = pagination.current
    } else {
      // 如果改变了排序 跳到第一页
      pager.current = 1
    }
    this.setState({
      pagination: pager,
      sortedInfo: sorter
    }, () => {
      this.fetch()
    })
  }

  render () {
    const { visible = false, title = '', width = 800, subTitle = '', warpClass = '' } = this.props
    const { filterDateRange, tableData, pagination, exportLoading, isLoading } = this.state
    const columns = [{
      title: '客户姓名',
      dataIndex: 'userName'
    },
    {
      title: '性别',
      dataIndex: 'gender'
    },
    {
      title: '手机号',
      dataIndex: 'mobile'
    },
    {
      title: '申请时间',
      dataIndex: 'appDate'
    },
    {
      title: '申请品种',
      dataIndex: 'variety'
    },
    {
      title: '意向金额',
      dataIndex: 'intrestingMoney'
    },
    {
      title: '申请单位',
      dataIndex: 'companyName'
    },
    {
      title: '单位地址',
      dataIndex: 'workAddress'
    },
    {
      title: '家庭地址',
      dataIndex: 'homeAddress'
    },
    {
      title: '员工姓名',
      dataIndex: 'staffName'
    },
    {
      title: '员工部门',
      dataIndex: 'deptName'
    }]
    return (<Modal
      width={width}
      centered
      wrapClassName={warpClass}
      title={title}
      visible={visible}
      onCancel={() => this.props.closeDataList()}
      footer={null}
      maskClosable={false}
    >
      <p className='sub-title'>{subTitle}</p>
      <div className={styles.header}>
        <span className={styles.left}>
          <span className={styles.leftItem}>
              时间：<RangePicker
              format="YYYY-MM-DD"
              value={[
                filterDateRange[0] ? moment(filterDateRange[0], 'YYYY-MM-DD') : null,
                filterDateRange[1] ? moment(filterDateRange[1], 'YYYY-MM-DD') : null
              ]}
              onChange={this.onChangeRangePicker}
              disabledDate={current => { return moment(current) <= moment(new Date()).subtract(3, 'months') || current > moment().subtract(0, 'days') }}
            />
          </span>
          <span className={styles.leftItem}>
            <Button type="primary" onClick={this.search} loading={isLoading}>查询</Button>
          </span>
          <span className={styles.leftItem}>
            <Button type="primary" onClick={this.exportExecl} loading={exportLoading}>导出</Button>
          </span>
        </span>
      </div>
      <Table
        columns={columns}
        rowKey={'id'}
        dataSource={tableData}
        pagination={pagination}
        onChange={this.handleTableChange}
        locale={{emptyText: '暂无数据'}}
      />
    </Modal>)
  }
}
