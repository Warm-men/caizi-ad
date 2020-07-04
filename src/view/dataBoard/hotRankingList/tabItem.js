import React from 'react'
import { Table, Button, message } from 'antd'
import '../index.less'
import { isEqual } from 'lodash'
import axios from '@src/utils/axios'
import urls from '@src/config'
import { withRouter } from 'react-router-dom'
import Tools from '@src/utils'
@withRouter
export default class TabItem extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      table: [],
      filterDateRange: [],
      pagination: {
        current: 1,
        pageSize: 5,
        total: 0,
        showTotal: null
      },
      sortedInfo: {},
      allVisitors: null,
      averageViews: null,
      initLoading: false
    }
    this.contentType = this.props.contentType
    this.changeDept = this.props.changeDept
    this.dateType = this.props.dateType
  }

  componentDidMount () {
    if (this.props.changeDept) {
      this.setState({initLoading: true})
      this.pullData()
      this.pullLeaderboardTitle()
    }
  }

  componentWillReceiveProps (next, pre) {
    if (next.changeDept && next.contentType && next.dateType) {
      this.contentType = next.contentType
      this.changeDept = next.changeDept
      this.dateType = next.dateType
      this.pullData()
      this.pullLeaderboardTitle()
    }
  }

  pullLeaderboardTitle = () => {
    const dateType = this.dateType || '1'
    const pramse = {
      contentType: this.contentType,
      dateType,
      deptId: this.changeDept
    }
    axios
      .post(urls.leaderboardTitle, pramse, {
        headers: { 'Content-Type': 'application/json' }
      })
      .then((res) => {
        const { allVisitors, averageViews } = res.retdata
        this.setState({
          initLoading: false,
          allVisitors,
          averageViews
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
      deptId: this.changeDept,
      contentType: this.contentType,
      orderType: this.getOrderType(sortedInfo),
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      dateType: parseInt(dateType)
    }
    axios
      .post(urls.contentLeaderboard, pramse, {
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

  exportExcel = () => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'dataBoardDownload')
    if (!isRight) return
    const dateType = this.dateType || '1'
    const pramse = {
      deptId: this.changeDept,
      contentType: this.contentType,
      dateType: parseInt(dateType)
    }
    if (isEqual(this.pramse, pramse)) {
      // 拦截同一请求
      message.error('该文件正在导出，请耐心等待...')
      return
    }
    this.pramse = pramse
    axios
      .post(urls.exportContentLeader, pramse, {
        headers: { 'Content-Type': 'application/json' }
      })
      .then((res) => {
        let a = document.createElement('a')
        a.setAttribute('target', '_blank')
        a.href = res.retdata
        a.click()
        a = null
        this.pramse = {}
      })
      .catch((e) => {
        this.pramse = {}
      })
  }

  // 表格排序参数
  getOrderType = (sortedInfo) => {
    let type = 2
    const isDescend = sortedInfo.order === 'descend'
    if (sortedInfo.columnKey === 'visitors') {
      type = isDescend ? 1 : 2
    }
    return type
  }

  formatNum = (num) => {
    if (!num) return ''
    if (num === 0) return '0'
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

  render () {
    const {
      pagination,
      sortedInfo,
      allVisitors,
      averageViews,
      table,
      initLoading
    } = this.state
    const columns = [
      {
        title: <span style={{fontWeight: 'bold'}}>排名</span>,
        dataIndex: 'num',
        width: '100px',
        render: (text, record, index) => (record.num)
      },
      {
        title: <span style={{fontWeight: 'bold'}}>内容名称</span>,
        // width: '50%',
        dataIndex: 'contentName'
      },
      {
        title: <span style={{fontWeight: 'bold'}}>浏览客户人数</span>,
        dataIndex: 'visitors',
        width: '150px',
        sorter: true,
        render: (_, record) => {
          return (
            <span style={{textAlign: 'center', width: '100%', display: 'inline-block'}}>{record.visitors}</span>
          )
        },
        sortOrder: sortedInfo.columnKey === 'visitors' && sortedInfo.order
      }
    ]
    return (
      <div>
        <div className={'numberView'}>
          <div className={'numberViewItem'} style={{height: 80}}>
            <div className={'name'}>浏览客户人数</div>
            <div className={'visiCount'}>{this.formatNum(allVisitors) || '0'}</div>
          </div>
          <div className={'numberViewItem'} style={{height: 80}}>
            <div className={'name'}>人均浏览次数</div>
            <div className={'visiCount'}>{this.formatNum(averageViews) || '0'}</div>
          </div>
        </div>
        <div className={'tableView'}>
          <Table
            rowKey={'num'}
            columns={columns}
            loading={initLoading}
            dataSource={table}
            pagination={pagination}
            onChange={this.handleTableChange}
            locale={{emptyText: <EmptyView />}}
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
          >导出数据</Button>
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
          width: '100%',
          display: 'flex',
          minHeight: 400,
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
