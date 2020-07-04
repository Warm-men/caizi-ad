import React, { Component, Fragment } from 'react'
import { DatePicker, Table, Button, message, TreeSelect, Spin, Popover } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import moment from 'moment'
import { connect } from 'react-redux'

const mapStateToProps = (state) => {
  return {
    deptList: state.base.deptList
  }
}
@connect(mapStateToProps)
export default class IntendedCustomersInfo extends Component {
  constructor (props) {
    super(props)
    this.state = {
      filterDateRange: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      resultState: null,
      resultUrl: '',
      id: '',
      initSpinning: false,
      chargeDeptTree: props.deptList,
      chargeStaff: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showTotal: null
      },
      chargeDeptIds: [],
      tableData: [],
      total: 0,
      loading: false,
      pageNum: 1,
      btnDisable: false,
      pending: false
    }
  }

  componentDidMount() {
    this.fetch()
  }

  fetch = () => {
    const {pageNum, pagination, chargeDeptIds, filterDateRange} = this.state
    if (!filterDateRange[0] || !filterDateRange[1]) {
      message.error('请选择时间范围（31天内）')
      return false
    }
    let end = moment(filterDateRange[0]).add(30, 'days')
    if (moment(filterDateRange[1].format('YYYY-MM-DD')).isAfter(end.format('YYYY-MM-DD'))) {
      message.error('时间跨度不能超过31天')
      return false
    }
    let deptids = ''
    if (chargeDeptIds.length) {
      deptids = chargeDeptIds.join(',')
    }
    const data = {
      pageNum: pageNum,
      pageSize: pagination.pageSize,
      minDate: filterDateRange[0] ? filterDateRange[0].format('YYYY-MM-DD') : '',
      maxDate: filterDateRange[1] ? filterDateRange[1].format('YYYY-MM-DD') : '',
      deptIds: deptids
    }
    axios.post(urls.intendedClient, data, {headers: {'Content-Type': 'application/json'}}).then(res => {
      const result = res.retdata.list
      if (result.length) {
        for (let i = 0; i < result.length; i++) {
          result[i].key = i
        }
      }
      this.setState({
        tableData: result,
        pagination: { ...this.state.pagination, current: pageNum, total: res.retdata.total, showTotal: total => `共 ${total}条记录` },
        loading: false
      })
    })
  }

  // 重置
  reset = () => {
    this.setState({
      filterDateRange: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      chargeDeptIds: [],
      pageNum: 1
    }, () => {
      this.fetch()
    })
  }

  // 查询
  search = () => {
    this.setState({
      pageNum: 1
    }, () => {
      this.fetch()
    })
  }

  // 选择部门节点
  onChangeDept = (value, label, extra) => {
    this.setState({ chargeDeptIds: value })
  }

  // 时间范围
  onChangeDate = (date, dateString) => {
    this.setState({ filterDateRange: date })
  }

  // 分页 获取表格数据
  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      loading: true
    })
    this.setState({
      pageNum: pagination.current
    }, () => {
      this.fetch()
    })
  }

  getExportStatus () {
    const { id } = this.state
    axios.get(urls.intendedExportStatus(id)).then(res => {
      if (res.ret === 0 && res.retdata !== '') { // -2未完成 -1失败  0成功
        this.setState({
          btnDisable: false,
          resultUrl: res.retdata,
          pending: false
        })
      } else {
        this.setState({ initLoading: false })
        setTimeout(() => {
          this.getExportStatus()
        }, 1000)
      }
    }).catch(() => {
      // this.setState({ initLoading: false })
      // setTimeout(() => {
      //   this.getExportStatus()
      // }, 1000)
    })
  }

  // 数据导出
  export = () => {
    const {pageNum, pagination, chargeDeptIds, filterDateRange} = this.state
    this.setState({
      btnDisable: true,
      pending: true
    })
    let deptids = ''
    if (chargeDeptIds.length) {
      deptids = chargeDeptIds.join(',')
    }
    const data = {
      minDate: filterDateRange[0] ? filterDateRange[0].format('YYYY-MM-DD') : '',
      maxDate: filterDateRange[1] ? filterDateRange[1].format('YYYY-MM-DD') : '',
      deptIds: deptids
    }
    axios.post(urls.exportIntendedClient, data, {headers: {'Content-Type': 'application/json'}}).then(res => {
      const id = res.retdata
      this.setState({id}, () => {
        this.getExportStatus()
      })
    })
  }

  render () {
    const {chargeDeptTree, chargeDeptIds, filterDateRange, pagination, loading, tableData, initSpinning, resultUrl, btnDisable, pending} = this.state
    let mindate = filterDateRange[0] ? filterDateRange[0].format('YYYY-MM-DD') : ''
    let maxdate = filterDateRange[1] ? filterDateRange[1].format('YYYY-MM-DD') : ''
    const columns = [
      {
        title: '点击“前往办理”按钮的时间',
        dataIndex: 'time',
        width: 160,
        render: (text, record) => (
          <span>
            <span>{(new Date(record.time)).format('yyyy-MM-dd hh:mm:ss')}</span>
          </span>
        )
      },
      {
        title: '产品名称',
        dataIndex: 'productName',
        width: 120
      },
      {
        title: '客户openId',
        dataIndex: 'openId',
        width: 120
      },
      {
        title: '客户unionId',
        dataIndex: 'unionId',
        width: 120
      },
      {
        title: '员工姓名',
        dataIndex: 'staffName',
        width: 120
      },
      {
        title: '员工企业微信账号',
        dataIndex: 'staffuserId',
        width: 120
      },
      {
        title: '部门',
        dataIndex: 'staffDeptNames',
        width: 120,
        render: (text, record) => (
          <Popover placement="top" content={record.staffDeptNames}>
            {
              record.staffDeptNames ? <span>
                <span>{(record.staffDeptNames.split('/'))[record.staffDeptNames.split('/').length - 1].length > 10 ? (record.staffDeptNames.split('/'))[record.staffDeptNames.split('/').length - 1].slice(0, 10) + '...' : (record.staffDeptNames.split('/'))[record.staffDeptNames.split('/').length - 1]}</span>
              </span> : ''
            }
          </Popover>
        )
      }
    ]
    return (
      <div>
        <Spin spinning={initSpinning} tip='数据获取中...'>
          部门：{chargeDeptTree && chargeDeptTree.length ? <TreeSelect
            showSearch
            value={chargeDeptIds}
            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            placeholder="搜索或选择部门"
            treeNodeFilterProp={'title'}
            allowClear
            multiple
            treeDefaultExpandedKeys={[chargeDeptTree[0].id]}
            onChange={this.onChangeDept}
            style={{ width: 200 }}
            treeData={chargeDeptTree}
          >
          </TreeSelect> : null}
          <span style={{marginLeft: 15}}>时间：</span><DatePicker.RangePicker style={{ width: 220 }} value={filterDateRange} onChange={this.onChangeDate} disabledDate={current => { return current && current > moment().subtract(1, 'days') }}/>
          <Button type='primary' disabled={btnDisable} style={{marginLeft: 18}} onClick={this.search}>查询</Button>
          <Button type='primary' disabled={btnDisable} style={{marginLeft: 15}} onClick={this.export}>导出数据</Button>
          <Button style={{marginLeft: 15}} onClick={this.reset}>重置</Button>
          {pending ? <div>数据导出中...</div> : null}
          {resultUrl === '' ? null : <div style={{marginTop: 15}}>
            <span>意向客户数据({mindate}至{maxdate})<span style={{color: '#ababab'}}>(数据导出完成，如需更新请重新导出)</span></span>
            <a href={resultUrl} target="_blank" style={{ color: '#1890ff' }}>点击下载数据</a>
          </div>}
          <Table
            rowKey={'key'}
            style={{marginTop: 15}}
            columns={columns}
            dataSource={tableData}
            pagination={pagination}
            loading={loading}
            onChange={this.handleTableChange}
            locale={{emptyText: '暂无数据'}}
          />
        </Spin>
      </div>
    )
  }
}
