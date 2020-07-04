import React from 'react'
import { Button, DatePicker, Table, message, Spin, TreeSelect, Select, Popover } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import Tools from '@src/utils'
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
export default class dataRecord extends React.Component {
  constructor (props) {
    super(props)
    let { deptList } = props
    let departmentId = deptList.map((v, k) => {
      return v.id
    })
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
      optType: '', // ０发送新闻 １发送产品 ２发送早报 ３发送小站 ４发送横幅活动 ７发送午报
      chargeDeptIds: [],
      departmentId,
      showType: '',
      beginDate: '',
      endDate: '',
      total: 0
    }
  }

  componentDidMount () {
    this.search(1)
    this.getRecordExportStatus()
  }

  componentWillUnmount () {
    clearTimeout(this.time)
  }

  getRecordExportStatus () {
    const { filterDateRange } = this.state
    axios.post(urls.analyseExportStatus, { type: 1 }).then(res => {
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
          this.getRecordExportStatus()
        }, 3000)
      }
    }).catch(() => {
      this.setState({ initLoading: false })
      setTimeout(() => {
        this.getRecordExportStatus()
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
    const { filterDateRange, chargeDeptIds, departmentId, optType } = this.state
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
      // pageSize: 9999999,
      optType: optType,
      // orderBy: this.getOrderType(sortedInfo) || '6',
      minDate: filterDateRange[0] ? filterDateRange[0].format('YYYY-MM-DD') : '',
      maxDate: filterDateRange[1] ? filterDateRange[1].format('YYYY-MM-DD') : '',
      deptIds: tempDeptIds
    }
    this.setState({ loading: true, tempData: { minDate: data.minDate, maxDate: data.maxDate } })
    axios
      .post(urls.recordList, data).then(res => {
        const { list = [], total = 0 } = res.retdata
        this.setState({
          loading: false,
          tableData: list,
          pagination: { ...this.state.pagination, current: pageNum, total, showTotal: total => `共 ${total}条记录` },
          total
        })
      })
      .catch(() => {
        this.setState({ loading: false })
      })
  }

  // 导出数据
  export = () => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'dataDownload')
    if (!isRight) return
    const { tempData, chargeDeptIds, departmentId, exportLoading = false, optType } = this.state
    if (exportLoading) {
      return false
    }
    let tempDeptIds = chargeDeptIds.length > 0 ? chargeDeptIds : departmentId
    this.setState({ exportLoading: true })
    axios.get(`${urls.recordExport}?minDate=${tempData.minDate}&maxDate=${tempData.maxDate}&deptIds=${tempDeptIds}&optType=${optType}`).then(res => {
      this.setState({ exportLoading: false })
      this.getRecordExportStatus()
    }).catch(() => {
      this.setState({ exportLoading: false })
    })
  }

  // 选择部门节点
  onChangeDept = (value, label, extra) => {
    this.setState({ chargeDeptIds: value })
  }

  // 选择类型
  optTypeChange = (value) => {
    this.setState({ optType: value })
  }

  // 分页 获取表格数据
  handleTableChange = (pagination, filters, sorter) => {
    let pager = { ...this.state.pagination }
    pager.current = pagination.current
    this.setState({
      pagination: pager,
      loading: true
    }, () => {
      this.search()
    })
  }

  render () {
    const { filterDateRange, loading, initLoading, showType, resultState, pagination, tableData, chargeDeptIds, beginDate, endDate, optType } = this.state
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
        fixed: 'left',
        width: 120
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
            <span>
              <span>{(record.staffDeptNames.split('/'))[record.staffDeptNames.split('/').length - 1].length > 10 ? (record.staffDeptNames.split('/'))[record.staffDeptNames.split('/').length - 1].slice(0, 10) + '...' : (record.staffDeptNames.split('/'))[record.staffDeptNames.split('/').length - 1]}</span>
            </span>
          </Popover>
        ),
        width: !!window.ActiveXObject || 'ActiveXObject' in window ? 300 : ''
      },
      {
        title: '操作类型',
        dataIndex: 'optType',
        width: 120,
        render: (text, record) => (
          <span>
            {record.optType === 0 ? '发送文章' : ''}
            {record.optType === 1 ? '发送产品' : ''}
            {record.optType === 2 ? '发送早报' : ''}
            {record.optType === 3 ? '发送小站' : ''}
            {record.optType === 4 ? '发送活动' : ''}
          </span>
        )
      },
      {
        title: '发送次数',
        dataIndex: 'staffSendCount',
        width: 120
      },
      {
        title: '浏览客户人数',
        dataIndex: 'clientOpenNum',
        width: 120
      },
      {
        title: '相关数据',
        dataIndex: 'relationDesc',
        width: !!window.ActiveXObject || 'ActiveXObject' in window ? 600 : 400
      }
    ]
    const exportText = `使用记录数据(${beginDate}至${endDate})`
    return (
      <div className='dataRecord'>
        <Spin spinning={initLoading} tip='数据获取中...'>
          <div className='header'>
            <span className='left'>
              <span className='leftItem'>
                部门：<DeptTreeSelect value={chargeDeptIds} style={{ width: 200 }} onChange={this.onChangeDept}/>
              </span>
              <span className='leftItem'>
                操作类型：<Select
                  style={{ width: 200 }}
                  placeholder="全部"
                  value={optType}
                  onChange={this.optTypeChange}
                >
                  <Select.Option value={''}>全部</Select.Option>
                  <Select.Option value={2}>发送早报</Select.Option>
                  <Select.Option value={0}>发送文章</Select.Option>
                  <Select.Option value={3}>发送小站</Select.Option>
                  <Select.Option value={1}>发送产品</Select.Option>
                  <Select.Option value={4}>发送活动</Select.Option>
                </Select>
              </span>
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
