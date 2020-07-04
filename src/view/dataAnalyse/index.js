import React, { Component } from 'react'
import { Button, DatePicker, Table, message, Spin, Select, TreeSelect, Popover } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import utils from '@src/utils'
import moment from 'moment'
import DeptTreeSelect from '@src/components/DeptTreeSelect'
import './index.less'
import { connect } from 'react-redux'

const mapStateToProps = (state) => {
  return {
    deptList: state.base.deptList
  }
}

@connect(mapStateToProps)
export default class dataAnalyse extends Component {
  constructor (props) {
    super(props)
    this.state = {
      filterDateRange: [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      initLoading: true,
      loading: false,
      tableData: [],
      resultState: {
        status: null,
        fileUrl: ''
      },
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showTotal: null
      },
      sortedInfo: {},
      chargeDeptIds: [],
      chargeStaff: [],
      chargeStaffList: [],
      departmentId: props.deptList.map(item => item.id),
      showType: '',
      beginDate: '',
      endDate: '',
      total: 0
    }
  }

  componentDidMount () {
    this.search(1)
    this.getAnalyseExportStatus()
  }

  componentWillUnmount () {
    clearTimeout(this.time)
  }

  getAnalyseExportStatus () {
    const { filterDateRange } = this.state
    axios.post(urls.analyseExportStatus, { type: 0 }).then(res => {
      let { status, fileUrl, startDate, endDate } = res.retdata
      this.setState({
        initLoading: false,
        beginDate: startDate || (filterDateRange[0] ? filterDateRange[0].format('YYYY-MM-DD') : ''),
        endDate: endDate || (filterDateRange[1] ? filterDateRange[1].format('YYYY-MM-DD') : ''),
        resultState: {
          status,
          fileUrl
        },
        showType: status
      })
      if (status === 1 && fileUrl) {
        // 当前文件已经生成完毕  可以下载
      } else if (status === 0) {
        clearTimeout(this.time)
        this.time = setTimeout(() => {
          this.getAnalyseExportStatus()
        }, 3000)
      }
    }).catch(() => {
      this.setState({ initLoading: false })
      setTimeout(() => {
        this.getAnalyseExportStatus()
      }, 1000)
    })
  }

  // 时间范围
  onChangeDate = (date, dateString) => {
    this.setState({ filterDateRange: date })
  }

  // 点击查询
  search = (num) => {
    message.destroy()
    const { filterDateRange, chargeDeptIds, chargeStaff, sortedInfo, departmentId } = this.state
    const { current, pageSize } = this.state.pagination
    if (!filterDateRange[0] || !filterDateRange[1]) {
      message.error('请选择时间范围（31天内）')
      return false
    }
    let end = moment(filterDateRange[0]).add(30, 'days')
    if (moment(filterDateRange[1].format('YYYY-MM-DD')).isAfter(end.format('YYYY-MM-DD'))) {
      message.error('时间跨度不能超过31天')
      return false
    }
    let pageNum = 1
    if (num) {
      pageNum = num
    } else {
      pageNum = current
    }
    let tempDeptIds = chargeDeptIds.length > 0 ? chargeDeptIds : departmentId
    const data = {
      pageNum: pageNum,
      pageSize: pageSize,
      // orderBy: this.getOrderType(sortedInfo) || '6',
      minDate: filterDateRange[0] ? filterDateRange[0].format('YYYY-MM-DD') : '',
      maxDate: filterDateRange[1] ? filterDateRange[1].format('YYYY-MM-DD') : '',
      deptIds: tempDeptIds,
      staffIds: chargeStaff
    }
    this.setState({ loading: true, tempData: { minDate: data.minDate, maxDate: data.maxDate } })
    axios
      .post(urls.analyseList, data).then(res => { // 获取列表数据
        const { list = [], total = 0 } = res.retdata
        this.setState({
          loading: false,
          tableData: list,
          pagination: { ...this.state.pagination, current: pageNum, total, showTotal: total => `共 ${total}条记录` },
          total
          // resultState: {
          //   ...this.state.resultState,
          //   fileUrl: ''
          // }
        })
      })
      .catch(() => {
        this.setState({ loading: false })
      })
  }

  // 导出数据
  export = () => {
    const isRight = utils.checkButtonRight(this.props.location.pathname, 'dataDownload')
    if (!isRight) return
    const { tempData, chargeDeptIds, chargeStaff, departmentId, exportLoading = false } = this.state
    if (exportLoading) {
      return false
    }
    let tempDeptIds = chargeDeptIds.length > 0 ? chargeDeptIds : departmentId
    this.setState({ exportLoading: true })
    axios.get(`${urls.analyseExport}?minDate=${tempData.minDate}&maxDate=${tempData.maxDate}&deptIds=${tempDeptIds}&staffIds=${chargeStaff}`).then(res => {
      this.setState({ exportLoading: false })
      this.getAnalyseExportStatus()
    }).catch(() => {
      this.setState({ exportLoading: false })
    })
  }

  // debounce闭包 必须先写好 然后在searchRoleMember触发
  debounce = utils.debounce((value) => this.getRoleMember(value), 300)
  getRoleMember = (value) => {
    const key = value.trim()
    if (!key) {
      this.setState({ chargeStaffList: [] })
    } else {
      // filter: true 如果该成员已设置为其他虚拟部门上级，将不会出现在可选列表中
      axios.post(urls.userList, { name: key, filter: true, departmentId: this.state.departmentId || [] }).then(res => {
        const chargeStaffList = res.retdata.userList.map(obj => {
          return { ...obj, staffId: obj.id }
        })
        this.setState({ chargeStaffList })
      })
    }
  }

  // 选择部门节点
  onChangeDept = (value, label, extra) => {
    this.setState({ chargeDeptIds: value })
  }

  // 选择人员
  changeRoleMember = (value) => {
    this.setState({ chargeStaff: value })
  }
  // 远程搜索人员
  searchRoleMember = (value) => {
    this.debounce(value)
  }

  // 分页 获取表格数据
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
      // 开启排序
      sortedInfo: sorter
    }, () => {
      this.search()
    })
  }

  // 表格排序参数
  getOrderType = (sortedInfo) => {
    let type = ''
    if (sortedInfo.columnKey === 'addClientCount') {
      type = sortedInfo.order === 'descend' ? '1' : '2'
    } else if (sortedInfo.columnKey === 'touchClientCount') {
      type = sortedInfo.order === 'descend' ? '3' : '4'
    } else if (sortedInfo.columnKey === 'sendMsgCount') {
      type = sortedInfo.order === 'descend' ? '5' : '6'
    } else if (sortedInfo.columnKey === 'sendMorningNewsCount') {
      type = sortedInfo.order === 'descend' ? '7' : '8'
    } else if (sortedInfo.columnKey === 'sendProductCount') {
      type = sortedInfo.order === 'descend' ? '9' : '10'
    } else if (sortedInfo.columnKey === 'morningNewsClientCount') {
      type = sortedInfo.order === 'descend' ? '11' : '12'
    } else if (sortedInfo.columnKey === 'productClientCount') {
      type = sortedInfo.order === 'descend' ? '13' : '14'
    } else if (sortedInfo.columnKey === 'newsClientCount') {
      type = sortedInfo.order === 'descend' ? '15' : '16'
    } else if (sortedInfo.columnKey === 'homeClientCount') {
      type = sortedInfo.order === 'descend' ? '17' : '18'
    }
    return type
  }

  render () {
    let { pagination, filterDateRange, chargeDeptIds, loading, tableData, initLoading, showType, resultState, beginDate, endDate } = this.state
    const columns = [
      {
        title: '时间',
        dataIndex: 'startDate',
        fixed: 'left',
        width: 120,
        render: (text, record) => (
          <span>
            <span>{(new Date(record.startDate)).format('yyyy-MM-dd')}</span>
          </span>
        )
      },
      {
        title: '员工姓名',
        dataIndex: 'staffName',
        width: 120,
        fixed: 'left'
      },
      {
        title: '别名',
        dataIndex: 'staffAlias',
        width: 120,
        fixed: 'left'
      },
      {
        title: '企业微信账号',
        dataIndex: 'staffUserId',
        fixed: 'left',
        width: 120
      },
      {
        title: '职务',
        dataIndex: 'staffPosition',
        width: 120
      },
      {
        title: '部门',
        dataIndex: 'staffDeptNames',
        render: (text, record) => (
          <Popover placement="top" content={record.staffDeptNames}>
            {
              record.staffDeptNames ? <span>
                <span>{(record.staffDeptNames.split('/'))[record.staffDeptNames.split('/').length - 1].length > 10 ? (record.staffDeptNames.split('/'))[record.staffDeptNames.split('/').length - 1].slice(0, 10) + '...' : (record.staffDeptNames.split('/'))[record.staffDeptNames.split('/').length - 1]}</span>
              </span> : ''
            }
          </Popover>
        ),
        width: !!window.ActiveXObject || 'ActiveXObject' in window ? 120 : ''
      },
      {
        title: '客户总数',
        dataIndex: 'clientNum',
        width: !!window.ActiveXObject || 'ActiveXObject' in window ? 120 : ''
      },
      {
        title: '新增客户数',
        dataIndex: 'addClientCount',
        width: !!window.ActiveXObject || 'ActiveXObject' in window ? 120 : ''
      },
      {
        title: '联系客户数',
        dataIndex: 'touchClientCount',
        width: !!window.ActiveXObject || 'ActiveXObject' in window ? 120 : ''
      },
      {
        title: '客户联系率',
        dataIndex: 'clientContactRatio',
        width: !!window.ActiveXObject || 'ActiveXObject' in window ? 120 : ''
      },
      {
        title: '发送消息条数',
        dataIndex: 'sendMsgCount',
        width: !!window.ActiveXObject || 'ActiveXObject' in window ? 120 : ''
      },
      {
        title: '户均消息条数',
        dataIndex: 'avgMsg',
        width: !!window.ActiveXObject || 'ActiveXObject' in window ? 120 : ''
      },
      {
        title: '员工回复占比',
        dataIndex: 'replyRatio',
        width: !!window.ActiveXObject || 'ActiveXObject' in window ? 120 : ''
      },
      {
        title: '员工平均回复时长',
        dataIndex: 'replyTime',
        width: !!window.ActiveXObject || 'ActiveXObject' in window ? 120 : ''
      },
      {
        title: '是否发送早报',
        dataIndex: 'sendMorningNewsCount',
        render: (text, record) => (
          <span>
            <span>{record.sendMorningNewsCount ? '是' : '否'}</span>
          </span>
        ),
        width: !!window.ActiveXObject || 'ActiveXObject' in window ? 120 : ''
      },
      {
        title: '是否发送产品',
        dataIndex: 'sendProductCount',
        render: (text, record) => (
          <span>
            <span>{record.sendProductCount ? '是' : '否'}</span>
          </span>
        ),
        width: !!window.ActiveXObject || 'ActiveXObject' in window ? 120 : ''
      },
      {
        title: '访客数',
        dataIndex: 'visitUserNum',
        width: !!window.ActiveXObject || 'ActiveXObject' in window ? 120 : ''
      },
      {
        title: '早报访客',
        dataIndex: 'morningNewsClientCount',
        width: !!window.ActiveXObject || 'ActiveXObject' in window ? 120 : ''
      },
      {
        title: '产品访客',
        dataIndex: 'productClientCount',
        width: !!window.ActiveXObject || 'ActiveXObject' in window ? 120 : ''
      },
      {
        title: '文章访客',
        dataIndex: 'newsClientCount',
        width: !!window.ActiveXObject || 'ActiveXObject' in window ? 120 : ''
      },
      {
        title: '小站访客',
        dataIndex: 'homeClientCount',
        width: !!window.ActiveXObject || 'ActiveXObject' in window ? 120 : ''
      }
    ]
    const exportText = `使用分析数据(${beginDate}至${endDate})`
    return (
      <div className='dataAnalyse'>
        <Spin spinning={initLoading} tip='数据获取中...'>
          <div className='header'>
            <span className='left'>
              <span className='leftItem'>
                部门：<DeptTreeSelect value={chargeDeptIds} style={{ width: 200 }} onChange={this.onChangeDept}/>
              </span>
              {/* <span className='leftItem'>
                成员：<Select
                  mode="multiple"
                  style={{ width: 200 }}
                  placeholder="搜索成员"
                  value={chargeStaff}
                  onChange={this.changeRoleMember}
                  onSearch={this.searchRoleMember}
                  filterOption={false}
                  // notFoundContent={'暂无数据，请继续搜索虚拟部门上级'}
                >
                  {chargeStaffList.map(obj => {
                    return <Select.Option
                      title={`${obj.name} - ${obj.department}`}
                      name={obj.name} key={obj.staffId} value={obj.staffId} disabled={obj.disable}>
                      {obj.name} - {obj.department}
                    </Select.Option>
                  })}
                </Select>
              </span> */}
              <span className='leftItem'>
                时间：<DatePicker.RangePicker style={{ width: 220 }} value={filterDateRange} onChange={this.onChangeDate} disabledDate={current => { return current && current > moment().subtract(1, 'days') }}/>
              </span>
              <span className='leftItem'>
                <Button type="primary" onClick={() => this.search(1)} loading={loading} disabled={showType === 0} style={{marginRight: '20px'}}>查询</Button>
                <Button type="primary" onClick={this.export} disabled={loading || showType === 0}>导出数据</Button>
              </span>
            </span>
          </div>
          {
            (showType === '') ? null : <div className='tips'>
              {
                showType === 0 ? `${exportText}，数据导出中...` : null
              }
              {
                showType === 2 ? `${exportText}，数据导出失败，请重试` : null
              }
              {
                showType === 1 ? <span>
                  <span>{exportText}</span>
                  <span className='sub-text'>(数据导出完成，如需更新请重新导出)</span>
                  <a href={resultState.fileUrl} target="_blank" style={{ color: '#1890ff' }}>点击下载数据</a>
                </span> : null
              }
            </div>
          }
          <div className='sub-tips'>下表仅展示最近3天的数据，如需查看更多数据，可选择“导出数据”后查看</div>
          <div className='content'>
            <Table
              rowKey={'id'}
              columns={columns}
              dataSource={tableData}
              pagination={pagination}
              loading={loading}
              onChange={this.handleTableChange}
              scroll={{x: true}}
              locale={{emptyText: '暂无数据'}}
            />
          </div>
        </Spin>
      </div>
    )
  }
}
