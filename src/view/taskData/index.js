import React, { Component, Fragment } from 'react'
import { DatePicker, Table, message } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import Tools from '@src/utils'
import styles from './index.less'

export default class extends Component {
  state = {
    active: 0,
    pageNum: 1,
    pageSize: 10,
    total: 0,
    list: [],
    tipLoading: true,
    tips: '最近一次数据导出中，预计耗时1-5分钟，请稍候'
  }

  componentDidMount = () => {
    this.lastTableData()
  }

  componentWillUnMount = () => {
    clearTimeout(this.timer)
  }

  tabs = ['总览数据', '明细数据']

  // 时间选择
  dateChange = (value, key) => {
    value = value || []
    this.setState({
      [`${key}StartDate`]: value[0],
      [`${key}EndDate`]: value[1]
    })
  }

  // tab切换
  tabChange = (active) => {
    this.setState(
      {
        canDown: undefined,
        tipLoading: true,
        tips: '最近一次数据导出中，预计耗时1-5分钟，请稍候',
        list: [],
        active,
        startStartDate: null,
        startEndDate: null,
        endStartDate: null,
        endEndDate: null,
        pageNum: 1,
        pageSize: 10
      },
      this.lastTableData
    )
  }

  // 表格分页配置
  pagination = () => {
    const { pageNum, pageSize, total } = this.state
    return {
      current: pageNum,
      pageSize,
      total,
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal: () => {
        return `共${total}条记录`
      },
      onChange: (pageNum) => {
        this.setState({ pageNum }, this.getTableData)
      },
      onShowSizeChange: (pageNum, pageSize) => {
        this.setState({ pageNum: 1, pageSize }, this.getTableData)
      }
    }
  }

  // 表格表头
  columns = () => {
    const { active } = this.state
    if (!active) {
      return [
        { title: '任务大类', dataIndex: 'businessType' },
        { title: '任务类型', dataIndex: 'type' },
        {
          title: '任务名称',
          dataIndex: 'title',
          render: (text = '') => {
            if (text.length <= 20) {
              return text
            } else {
              return <div title={text}>{text.slice(0, 20)}...</div>
            }
          }
        },
        { title: '任务目标', dataIndex: 'sourceCount' },
        { title: '整体完成进度', dataIndex: 'finishRate' },
        { title: '接受任务人数', dataIndex: 'receiveCount' },
        { title: '下发人', dataIndex: 'superName' },
        { title: '重复周期', dataIndex: 'cycleType' },
        { title: '任务开始日期', dataIndex: 'startTime' },
        { title: '任务结束日期', dataIndex: 'endTime' }
      ]
    }

    return [
      { title: '任务大类', dataIndex: 'businessType' },
      { title: '任务类型', dataIndex: 'type' },
      {
        title: '任务名称',
        dataIndex: 'title',
        render: (text = '') => {
          if (text.length <= 20) {
            return text
          } else {
            return <div title={text}>{text.slice(0, 20)}...</div>
          }
        }
      },
      { title: '任务目标', dataIndex: 'sourceCount' },
      { title: '目标拆分', dataIndex: 'targetSplit' },
      { title: '接受任务员工姓名', dataIndex: 'staffName' },
      { title: '职务', dataIndex: 'staffPosition' },
      {
        title: '部门',
        dataIndex: 'staffDeptNames',
        render: (text = '') => {
          if (text.length <= 10) {
            return text
          } else {
            return <div title={text}>{text.slice(0, 10)}...</div>
          }
        }
      },
      { title: '员工完成进度', dataIndex: 'staffFinishRate' },
      { title: '下发人', dataIndex: 'superName' },
      { title: '重复周期', dataIndex: 'cycleType' },
      { title: '任务开始日期', dataIndex: 'startTime' },
      { title: '任务结束日期', dataIndex: 'endTime' }
    ]
  }

  // 查询表格数据
  getTableData = () => {
    const { loading, active, pageNum, pageSize, startStartDate, startEndDate, endStartDate, endEndDate, staffDeptIds } = this.state
    if (loading) return
    if (!startStartDate && !endStartDate) {
      message.error('请选择时间')
      return
    }

    this.setState({ loading: true, tipLoading: false })
    clearTimeout(this.timer)
    const params = {
      pageNum,
      pageSize,
      startStartDate: startStartDate ? startStartDate.format('YYYY-MM-DD') : '',
      startEndDate: startEndDate ? startEndDate.format('YYYY-MM-DD') : '',
      endStartDate: endStartDate ? endStartDate.format('YYYY-MM-DD') : '',
      endEndDate: endEndDate ? endEndDate.format('YYYY-MM-DD') : '',
      category: active + 1
    }

    axios
      .post(urls.taskList, params, {
        headers: { 'Content-Type': 'application/json' }
      })
      .then((res) => {
        const { total, list } = res.retdata
        this.setState({
          total,
          list: list.map((item) => ({ ...item, key: 'key' + Math.random() })),
          loading: false
        })
      })
      .catch(() => {
        this.setState({ total: 0, list: [], loading: false })
      })
  }

  // 导出数据按钮
  exportTableData = () => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'dataDownload')
    if (!isRight) return
    const { loading, active, startStartDate, startEndDate, endStartDate, endEndDate, staffDeptIds } = this.state
    if (loading) return
    if (!startStartDate && !endStartDate) {
      message.error('请选择时间')
      return
    }

    this.setState({
      loading: true,
      canDown: undefined,
      tipLoading: true,
      tips: '数据导出中，预计耗时1-5分钟，请稍候'
    })
    clearTimeout(this.timer)
    const params = {
      startStartDate: startStartDate ? startStartDate.format('YYYY-MM-DD') : '',
      startEndDate: startEndDate ? startEndDate.format('YYYY-MM-DD') : '',
      endStartDate: endStartDate ? endStartDate.format('YYYY-MM-DD') : '',
      endEndDate: endEndDate ? endEndDate.format('YYYY-MM-DD') : '',
      category: active + 1
    }

    axios
      .post(urls.exportTaskList, params, {
        headers: { 'Content-Type': 'application/json' }
      })
      .then((res) => {
        this.setState({ loading: false })
        if (res.ret === 0) this.lastTableData()
      })
      .catch(() => {
        this.setState({
          loading: false,
          tips: '数据导出失败',
          canDown: false,
          failCallback: 'exportTableData'
        })
      })
  }

  // 导出状态查询
  lastTableData = () => {
    const { active } = this.state
    axios
      .post(urls.stateTaskList, { category: active + 1 }, { headers: { 'Content-Type': 'application/json' } })
      .then((res) => {
        const { ret, retdata = {} } = res
        const { fileUrl, status } = retdata
        if (ret === 0) {
          if (status === 1) {
            this.setState({ tips: '数据导出成功', fileUrl, canDown: true })
          } else if (status === 0) {
            clearTimeout(this.timer)
            this.timer = setTimeout(this.lastTableData, 5000)
          } else if (status === 2) {
            this.setState({
              tips: '数据导出失败',
              canDown: false,
              failCallback: 'lastTableData'
            })
          } else if (status === undefined) {
            this.setState({ tipLoading: false, canDown: undefined })
          }
        } else {
          this.setState({
            tips: '数据导出失败',
            canDown: false,
            failCallback: 'lastTableData'
          })
        }
      })
      .catch(() => {
        this.setState({
          tips: '数据导出失败',
          canDown: false,
          failCallback: 'lastTableData'
        })
      })
  }

  // 下载或重试
  downOrRetry = () => {
    const { canDown, fileUrl, failCallback } = this.state
    if (!canDown) {
      this.setState({ tips: '数据导出中，预计1～5分钟，请稍后', canDown: undefined }, this[failCallback])
    }
    if (canDown) {
      let a = document.createElement('a')
      a.setAttribute('href', fileUrl)
      a.setAttribute('target', '_blank')
      a.click()
      a = null
      this.setState({ canDown: undefined, tipLoading: false })
    }
  }

  render = () => {
    const { canDown, tips, tipLoading, loading, active, startStartDate, startEndDate, endStartDate, endEndDate, list } = this.state
    const { RangePicker } = DatePicker
    return (
      <div id={styles.taskData}>
        <div className={styles.tabs}>
          {this.tabs.map((item, index) => (
            <div onClick={() => this.tabChange(index)} className={`${styles.tab} ${active === index ? styles.active : ''}`} key={index}>
              {item}
            </div>
          ))}
        </div>

        <div className={styles.filter}>
          <div className={styles.item}>
            <div className={styles.label}>任务开始时间：</div>
            <RangePicker className={styles.value} value={[startStartDate, startEndDate]} onChange={(value) => this.dateChange(value, 'start')} />
          </div>

          <div className={styles.item}>
            <div className={styles.label}>任务结束时间：</div>
            <RangePicker className={styles.value} value={[endStartDate, endEndDate]} onChange={(value) => this.dateChange(value, 'end')} />
          </div>

          <div className={`${styles.btn} ${loading ? styles.disabled : ''}`} onClick={this.getTableData}>
            查询
          </div>
          <div className={`${styles.btn} ${loading || list.length === 0 ? styles.disabled : ''}`} onClick={this.exportTableData}>
            导出数据
          </div>
        </div>

        {tipLoading ? (
          <div className={styles.tips}>
            {tips}
            {canDown !== undefined && (
              <Fragment>
                ，<a onClick={this.downOrRetry}>{canDown ? '点击下载' : '请重试'}</a>
              </Fragment>
            )}
          </div>
        ) : (
          <Table loading={loading} dataSource={list} columns={this.columns()} pagination={this.pagination()} />
        )}
      </div>
    )
  }
}
