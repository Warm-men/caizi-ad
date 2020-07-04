import React, { Component } from 'react'
import { Button, Table, DatePicker, Tag, message, Spin } from 'antd'
import styles from './index.less'
import EditTagModal from './editTagModal'
import axios from '@src/utils/axios'
import urls from '@src/config'
import DeptTreeSelect from '@src/components/DeptTreeSelect'

class StaffData extends Component {
  constructor (props) {
    super(props)
    this.state = {
      fromDate: null,
      toDate: null,
      bankBranch: null,
      visiableModal: false,
      tableData: [],
      initLoading: true,
      pagination: {
        current: 1,
        pageSize: 10,
        total: null,
        showTotal: null
      }
    }
    this.selectedTags = []
  }
  // 进页面获取表格数据
  componentDidMount () {
    this.getPpLinkUserList()
  }

  getPpLinkUserList = (pageNum = null) => {
    const { fromDate, toDate, bankBranch, pagination } = this.state
    if ((fromDate && toDate) && (toDate._d.getTime() < fromDate._d.getTime())) {
      message.error('结束时间要大于开始时间')
      this.setState({ initLoading: false })
      return
    }
    let params = {
      fromDate: fromDate ? fromDate._d.format('yyyy-MM-dd') : null,
      toDate: toDate ? toDate._d.format('yyyy-MM-dd') : null,
      bankBranch,
      pageNum: pageNum || 1,
      pageSize: pagination.pageSize
    }
    axios.post(urls.ppLinkUserList, {...params}, {headers: {'Content-Type': 'application/json'}}).then(res => {
      const { list, total } = res.retdata
      if (res.retdata.length === 0) {
        message.success('查询结果为空')
      }
      this.setState({
        tableData: [...list],
        initLoading: false,
        pagination: {...this.state.pagination, total, showTotal: total => `共${total}条`}
      })
    }).catch(() => {
      this.setState({ initLoading: false })
    })
  }

  checkButton = () => {
    this.setState({initLoading: true}, this.getPpLinkUserList)
  }

  // 分页、排序、筛选变化时触发 获取表格数据
  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination }
    pager.current = pagination.current
    this.setState({
      pagination: pager
    }, () => {
      this.setState({initLoading: true}, () => {
        this.getPpLinkUserList(pager.current)
      })
    })
  }

  openEditTag = (item) => {
    const { tags, userId, corpId } = item
    this.selectedTags = tags
    this.rowId = item.userId
    this.ids = {corpId, userId}
    this.setState({visiableModal: true})
  }

  closeEditModal = () => {
    this.setState({ visiableModal: false })
  }

  selectDept = value => {
    this.setState({ bankBranch: value })
  }

  editTagCallBack = (tags) => {
    const index = this.state.tableData.findIndex(item => item.userId === this.rowId)
    let nextData = [...this.state.tableData]
    nextData[index].tags = tags
    this.setState({
      tableData: nextData
    })
  }

  render () {
    const {
      fromDate,
      toDate,
      tableData,
      bankBranch,
      visiableModal,
      initLoading,
      pagination
    } = this.state

    const columns = [{
      title: '员工id',
      ellipsis: true,
      dataIndex: 'userId'
    },
    {
      title: '归属企业',
      ellipsis: true,
      dataIndex: 'corpName'
    }, {
      title: '归属分支行',
      ellipsis: true,
      dataIndex: 'branch',
      render: branch => (branch || '暂无')
    }, {
      title: '应用停留总时长',
      dataIndex: 'browseTime'
    }, {
      title: '浏览银行活动总数量',
      dataIndex: 'activityCount'
    },
    {
      title: '标签',
      dataIndex: 'tags',
      ellipsis: true,
      render: tags => tags.length ? tags.map(tag => <Tag color={'green'} key={tag}>{tag}</Tag>) : '暂无'
    }, {
      title: '操作',
      dataIndex: 'sendDetail',
      render: (text, record, index) => <span style={{color: '#1890ff', cursor: 'pointer'}} onClick={() => this.openEditTag(record)}>编辑标签</span>
    }]
    return (
      <Spin spinning={initLoading} tip='数据获取中...'>
        <div className={styles.staffData}>
          <div className={styles.title}>员工数据</div>
          <div className={styles.descript}>企业员工在应用上的行为及活跃数据</div>
          <div className={styles.filter_view}>
            <div className={styles.column_view}>
              <span className={styles.filter_item_view}>
                <span className={styles.filter_item}>
                      添加时间
                  <DatePicker value={fromDate} onChange={(date) => this.setState({fromDate: date})} placeholder="请选择" />
                </span>
                <span className={styles.filter_item}>
                      至
                  <DatePicker value={toDate} onChange={(date) => this.setState({toDate: date})} placeholder="请选择" />
                </span>
              </span>
              <span className={styles.filter_item_view} >
                  归属分支行
                <DeptTreeSelect style={{ width: 250, marginLeft: 20 }} value={bankBranch} onChange={this.selectDept} multiple={false}/>
              </span>
              <Button style={{width: 100}} type="primary" onClick={this.checkButton}>查询</Button>
            </div>
          </div>
          <div className={styles.table}>
            <div style={{ position: 'relative' }}>
              <Table
                columns={columns}
                rowKey={'userId'}
                dataSource={tableData}
                pagination={pagination}
                onChange={this.handleTableChange}
                locale={{emptyText: '暂无数据'}}
              />
            </div>
          </div>
          {visiableModal ? <EditTagModal
            tags={this.selectedTags}
            ids={this.ids}
            closeEditModal={this.closeEditModal}
            callback={this.editTagCallBack}
            visiableModal={visiableModal}
          />
            : null
          }
        </div>
      </Spin>
    )
  }
}

export default StaffData
