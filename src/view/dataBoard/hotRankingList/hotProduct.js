import React from 'react'
import { Table, Button, message } from 'antd'
import '../index.less'
import DataPicker from '../dataPicker'
import PopoverHint from '../popover'
import { isEqual } from 'lodash'
import axios from '@src/utils/axios'
import urls from '@src/config'
import { withRouter } from 'react-router-dom'
import Tools from '@src/utils'
import moment from 'moment'

const dataArrO = {
  '1': '1',
  '2': '7',
  '3': '15',
  '4': '30'
}

@withRouter
export default class HotProduct extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      table: [],
      pagination: {
        current: 1,
        pageSize: 5,
        total: 0,
        showTotal: null
      },
      sortedInfo: {},
      totalViewCount: null,
      perViewCount: null
    }
  }

  componentDidMount () {
    this.changeDept = this.props.changeDept
    this.setState({ initLoading: true })
    this.pullData()
    this.pullHotproductUp()
  }

  componentWillReceiveProps (next, pre) {
    if (next.changeDept && next.changeDept !== pre.changeDept) {
      this.changeDept = next.changeDept
      this.setState({ initLoading: true })
      this.pullData()
      this.pullHotproductUp()
    }
  }

  pullHotproductUp = () => {
    const dateType = this.dateType || '1'
    const pramse = {
      // deptId: this.changeDept,
      type: parseInt(dateType)
    }
    axios
      .post(urls.hotproductUp, pramse, {
        headers: { 'Content-Type': 'application/json' }
      })
      .then((res) => {
        const { totalViewCount, perViewCount } = res.retdata
        this.setState({
          initLoading: false,
          totalViewCount,
          perViewCount
        })
      })
      .catch(() => {
        this.setState({ initLoading: false })
      })
  }

  pullData = () => {
    const dateType = this.dateType || '1'
    const { sortedInfo, pagination } = this.state
    const pramse = {
      // deptId: this.changeDept,
      type: parseInt(dateType),
      orderType: this.getOrderType(sortedInfo),
      pageNum: pagination.current,
      pageSize: pagination.pageSize
    }
    axios
      .post(urls.databoardHotproduct, pramse, {
        headers: { 'Content-Type': 'application/json' }
      })
      .then((res) => {
        const { total, list } = res.retdata
        this.setState({
          initLoading: false,
          table: list,
          pagination: {
            ...this.state.pagination,
            total,
            showTotal: (total) => `共${total}条`
          }
        })
      })
      .catch(() => {
        this.setState({ initLoading: false })
      })
  }

  onChangeTime = (dateType) => {
    this.dateType = dateType
    this.pullHotproductUp()
    this.pullData()
  }

  // 分页、排序、筛选变化时触发 获取表格数据
  handleTableChange = (pagination, filters, sorter) => {
    const { columnKey: prevColumnKey, order: prevOrder } = this.state.sortedInfo
    const pager = { ...this.state.pagination }
    if (prevColumnKey === sorter.columnKey && prevOrder === sorter.order) {
      pager.current = pagination.current
    } else {
      // 如果改变了排序 跳到第一页
      pager.current = 1
    }
    this.setState(
      {
        pagination: pager,
        sortedInfo: sorter
      },
      () => {
        this.pullData()
      }
    )
  }
  // 表格排序参数
  getOrderType = (sortedInfo) => {
    let type = 2
    const isDescend = sortedInfo.order === 'descend'
    if (sortedInfo.columnKey === 'viewCount') {
      type = isDescend ? 1 : 2
    } else if (sortedInfo.columnKey === 'buyCount') {
      type = isDescend ? 3 : 4
    }
    return type
  }

  formatNum = (num) => {
    if (!num) return ''
    if (parseInt(num) === 0) return num
    let result = []
    let counter = 0
    let headerNum = '+'
    let floatNum = ''
    num = num + ''
    if (num.indexOf('-') !== -1) {
      num = num.split('-')[1]
      headerNum = '-'
    }
    if (num.indexOf('.') !== -1) {
      floatNum = '.' + num.split('.')[1]
      num = num.split('.')[0]
    }
    num = (num || 0).toString().split('')
    for (let i = num.length - 1; i >= 0; i--) {
      counter++
      result.unshift(num[i])
      if (!(counter % 3) && i !== 0) {
        result.unshift(',')
      }
    }
    return result.join('') + floatNum
  }

  exportExcel = () => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'dataBoardDownload')
    if (!isRight) return
    const dateType = this.dateType || '1'
    const params = {
      // deptId: this.changeDept,
      type: parseInt(dateType),
      orderType: this.getOrderType(this.state.sortedInfo)
    }
    if (isEqual(this.params, params)) {
      message.error('该文件正在导出，请耐心等待...')
      return
    }
    this.params = params
    axios
      .post(urls.hotproductExport, params, {
        headers: { 'Content-Type': 'application/json;charset=utf-8' },
        responseType: 'blob'
      })
      .then((res) => {
        this.params = {}
        this.exportFile(res)
      }).catch((res) => {
        this.params = {}
      })
  }

  getDateText = (start) => {
    let startTime = moment(new Date()).subtract(parseInt(start), 'days').format('YYYYMMDD')
    let now = moment(new Date()).format('YYYYMMDD')
    return { startTime, now }
  }

  exportFile = (res) => {
    const blob = new window.Blob([res], { type: 'application/vnd.ms-excel' })
    const dateType = this.dateType || '1'
    const dataNum = dataArrO[dateType]
    let { startTime, now } = this.getDateText(dataNum)
    const fName = `热门产品排行榜（${startTime}至${now}）`
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

  render () {
    const {
      pagination,
      sortedInfo,
      table,
      totalViewCount,
      perViewCount
    } = this.state
    const isEmpty = !totalViewCount && !perViewCount && !table.length
    const columns = [
      {
        title: <span style={{ fontWeight: 'bold' }}>排名</span>,
        dataIndex: 'seq',
        width: '80px',
        render: (text, record) => record.seq
      },
      {
        title: <span style={{ fontWeight: 'bold' }}>产品名称</span>,
        width: '50%',
        dataIndex: 'productName'
      },
      {
        title: <span style={{ fontWeight: 'bold' }}>浏览客户人数</span>,
        dataIndex: 'viewCount',
        sorter: true,
        render: (_, record) => {
          return (
            <span
              style={{
                textAlign: 'center',
                width: '100%',
                display: 'inline-block'
              }}
            >
              {record.viewCount}
            </span>
          )
        },
        sortOrder: sortedInfo.columnKey === 'viewCount' && sortedInfo.order
      },
      {
        title: <span style={{ fontWeight: 'bold' }}>点击购买人数</span>,
        dataIndex: 'buyCount',
        sorter: true,
        render: (_, record) => {
          return (
            <span
              style={{
                textAlign: 'center',
                width: '100%',
                display: 'inline-block'
              }}
            >
              {record.buyCount}
            </span>
          )
        },
        sortOrder: sortedInfo.columnKey === 'buyCount' && sortedInfo.order
      }
    ]
    return (
      <div className={'hotProduct'}>
        <div className={'headerView'}>
          <div className={'left'}>
            <span className={'title'}>热门产品排行榜</span>
            <PopoverHint hintType={'hotProduct'} />
          </div>
          <span className={'right'}>
            <DataPicker onChangeTime={this.onChangeTime} />
          </span>
        </div>
        <div style={{ padding: '10px' }}>
          <div className={'numberView'}>
            <div className={'numberViewItem'}>
              <div className={'name'}>浏览客户人数</div>
              <div className={'visiCount'}>
                {this.formatNum(totalViewCount) || '0'}
              </div>
            </div>
            <div className={'numberViewItem'}>
              <div className={'name'}>人均浏览次数</div>
              <div className={'visiCount'}>
                {this.formatNum(perViewCount) || '0'}
              </div>
            </div>
          </div>
          <div className={'tableView'}>
            <Table
              rowKey={'seq'}
              columns={columns}
              dataSource={table}
              pagination={pagination}
              onChange={this.handleTableChange}
              locale={{ emptyText: <EmptyView /> }}
            />
            <Button
              type={'danger'}
              style={{
                backgroundColor: '#CFBB9A',
                border: '1px solid #CFBB9A',
                position: 'absolute',
                bottom: 24,
                left: 10
              }}
              onClick={this.exportExcel}
            >
                导出数据
            </Button>
          </div>
        </div>
      </div>
    )
  }
}

class EmptyView extends React.PureComponent {
  render () {
    return (
      <div
        style={{
          height: '100%',
          minHeight: 300,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column'
        }}
      >
        <img src={require('@src/assets/data_board_empty.png')} />
        <div style={{marginTop: 20}}>暂无数据</div>
      </div>
    )
  }
}
