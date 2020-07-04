import React, { Component } from 'react'
import { Button, Input, Table, DatePicker, message, Modal, Tag } from 'antd'
import styles from './index.less'
import axios from '@src/utils/axios'
import utils from '@src/utils'
import urls from '@src/config'
import SendDetailModal from './sendDetailModal'
import DetailModal from './detailModal'
import TagModal from './tagModal'
import DeptTreeSelect from '@src/components/DeptTreeSelect'
import { connect } from 'react-redux'
import RoleButton from '@src/components/roleButton'
const mapStateToProps = (state) => {
  return {
    deptList: state.base.deptList
  }
}

@connect(mapStateToProps)
class NewsList extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      selectedRowKeys: [],
      tableData: [],
      pagination: {
        current: 1,
        pageSize: 20,
        total: 0,
        showTotal: null
      },
      loading: true,
      filterDateRange: [null, null],
      filterTitle: '',
      filterType: '',
      visibleSendDetailModal: false,
      sendDetailId: '',
      visibleDetailModal: false,
      visibleTagModal: false,
      detailId: '',
      sortedInfo: {},
      tagRecord: ''
    }
    this.deptListIds = []
  }
  // 进页面获取表格数据
  componentDidMount () {
    this.fetch()
    this.flatDeptIds(this.props.deptList)
    this.getPushSetting()
  }
  // 时间范围
  onChangeDate = (date, dateString) => {
    this.setState({ filterDateRange: date })
  }
  // 标题
  handleChangeTitle = (ev) => {
    this.setState({ filterTitle: ev.target.value })
  }
  // 选择类别
  handleChangeType = (value) => {
    this.setState({ filterType: value })
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
      // 开启排序
      sortedInfo: sorter
    }, () => {
      this.fetch()
    })
  }
  // 表格排序参数
  getOrderType = (sortedInfo) => {
    let type = ''
    if (sortedInfo.columnKey === 'sendCount') {
      type = sortedInfo.order === 'descend' ? '0' : '1'
    } else if (sortedInfo.columnKey === 'openCount') {
      type = sortedInfo.order === 'descend' ? '2' : '3'
    } else if (sortedInfo.columnKey === 'relayCount') {
      type = sortedInfo.order === 'descend' ? '4' : '5'
    } else if (sortedInfo.columnKey === 'createTime') {
      type = sortedInfo.order === 'descend' ? '6' : '7'
    }
    return type
  }
  // 表格数据获取
  fetch () {
    const { filterDateRange, filterTitle, filterType, sortedInfo } = this.state
    const { current, pageSize, total } = this.state.pagination
    const data = {
      minTime: filterDateRange[0] ? filterDateRange[0].format('YYYY-MM-DD') : '',
      maxTime: filterDateRange[1] ? filterDateRange[1].format('YYYY-MM-DD') : '',
      queryType: filterType,
      title: filterTitle,
      // 全行排行默认进页面的排序是2(按打开次数降序)
      orderType: this.getOrderType(sortedInfo) || '6',
      pageNum: current,
      pageSize: pageSize
    }
    this.setState({ loading: true })
    axios.post(urls.newsList, data).then(res => {
      const total = res.retdata.total
      const tableData = res.retdata.newsList.map(obj => {
        obj.key = obj.newsId
        return obj
      })
      // 重新获取表格后勾选全部清空
      this.setState({
        loading: false,
        tableData: tableData,
        pagination: { ...this.state.pagination, total, showTotal: total => `共 ${total}条记录` },
        selectedRowKeys: []
      })
    })
  }
  // 点击查询
  search = () => {
    const { filterTitle } = this.state
    const pagination = { ...this.state.pagination }
    if (filterTitle.length > 30) {
      return message.warning('查询标题最多30个字符')
    }
    pagination.current = 1
    // 默认第一页 关闭排序
    this.setState({ pagination, sortedInfo: {} }, () => {
      this.fetch()
    })
  }
  // 重置
  reset = () => {
    this.setState({
      pagination: {
        current: 1,
        pageSize: 20
      },
      filterDateRange: [null, null],
      filterTitle: '',
      filterType: '',
      // 关闭排序
      sortedInfo: {}
    }, () => {
      this.fetch()
    })
  }
  // 点击表格行勾选框
  tableSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys })
  }
  // 设为必发
  setMustSend = (isMust) => {
    // const isRight = utils.checkButtonRight(this.props.location.pathname, 'betfairSet')
    // if (!isRight) return
    console.log(isMust)

    const { selectedRowKeys } = this.state
    const url = isMust ? urls.mustSend : urls.notMustSend
    const msg = isMust ? '设为必发' : '取消必发'
    if (selectedRowKeys.length) {
      axios.post(url, { newsIds: selectedRowKeys.join(',') }).then(res => {
        this.fetch()
        this.setState({ selectedRowKeys: '' })
        return message.success(msg + '成功')
      })
    } else {
      return message.warning('请选择将哪些' + msg)
    }
  }
  // 推送文章
  pushNews = (record) => {
    const isRight = utils.checkButtonRight(this.props.location.pathname, 'articlePush')
    if (!isRight) return
    if (!record.owner) {
      utils.openRightMessage()
      return
    }
    const _this = this
    Modal.confirm({
      title: '确定？',
      content: '文章推送后，客户经理可前往企业微信-消息-营销助手查看及分享',
      onOk () {
        axios.post(urls.newsSendToCorp, { newsId: record.newsId }).then(res => {
          if (res.ret === 0) {
            _this.fetch()
            return message.success('推送成功')
          }
        })
      },
      onCancel () {}
    })
  }
  // 发送详情modal
  showSendDetailModal = (id) => {
    const isRight = utils.checkButtonRight(this.props.location.pathname, 'aritcleView')
    if (!isRight) return
    this.setState({ sendDetailId: id, visibleSendDetailModal: true })
  }
  // 发送详情modal 取消
  hideSendDetailModal = () => {
    this.setState({ visibleSendDetailModal: false })
  }
  // 文章详情modal
  showDetailModal = (id) => {
    this.setState({ detailId: id, visibleDetailModal: true })
  }
  // 文章详情modal 取消
  hideDetailModal = () => {
    this.setState({ visibleDetailModal: false })
  }
  // 标签修改modal
  showTagModal = (record) => {
    const isRight = utils.checkButtonRight(this.props.location.pathname, 'tagEdit')
    if (!isRight) return
    this.setState({ tagRecord: record, visibleTagModal: true })
  }
  // 标签修改modal 取消
  hideTagModal = () => {
    this.setState({ visibleTagModal: false })
  }

  // 批量删除
  newsHotDelete = () => {
    const { selectedRowKeys } = this.state
    if (!selectedRowKeys.length) {
      return message.warning('请勾选要删除的文章')
    }
    Modal.confirm({
      title: '确定?',
      content: `是否删除选中的${selectedRowKeys.length}个文章`,
      onOk: () => {
        axios.post(urls.newsHotDelete, { newsIds: selectedRowKeys.join(',') }).then(res => {
          if (res.ret === 0) {
            this.setState({ selectedRowKeys: [] })
            message.success('删除文章成功')
            this.fetch()
          }
        })
      },
      onCancel: () => {
      }
    })
  }

  editNewItem = (record) => {
    const isRight = utils.checkButtonRight(this.props.location.pathname, 'aritcleEidt')
    if (!isRight) return
    if (!record.owner) { // FIMME: open it when RIGHT is reqiure
      utils.openRightMessage()
      return
    }
    this.props.history.push({pathname: '/newsAddInternal', search: `?newId=${record.newsId}`})
  }

  flatDeptIds = (data) => {
    if (!data || !data.length) return
    data.map(item => {
      this.deptListIds.push(item.id)
      if (item.subDept) {
        return this.flatDeptIds(item.subDept)
      }
    })
  }

  treeChange = (departmentIds) => {
    this.setState({ departmentIds })
  }

  showPushModal = () => {
    this.setState({ pushVisible: true })
  }

  pushSetting = () => {
    const { departmentIds = [] } = this.state
    axios.post(urls.pushSetting, { departmentIds: departmentIds.join(',') }, { headers: { 'Content-Type': 'application/json' } }).then((res) => {
      if (res.ret === 0) {
        message.success('推送设置成功！')
        this.setState({ pushVisible: false })
      }
    })
  }

  getPushSetting = () => {
    axios.post(urls.getPushSetting, {}, { headers: { 'Content-Type': 'application/json' } }).then((res) => {
      if (res.ret === 0) {
        const { list = [] } = res.retdata
        const departmentIds = this.filterIds(list)
        this.setState({ departmentIds })
      }
    })
  }

  filterIds = ids => {
    return ids.filter((item) => this.deptListIds.includes(item))
  }

  getCheckboxProps = (record) => {
    return ({ disabled: !record.owner })
  }

  render () {
    const { selectedRowKeys, tableData, filterDateRange, filterType, filterTitle, sortedInfo,
      pagination, loading, visibleSendDetailModal, sendDetailId, visibleDetailModal, detailId,
      visibleTagModal, tagRecord, pushVisible, departmentIds = [] } = this.state
    const columns = [{
      title: '标题',
      dataIndex: 'title',
      // className: 'titleColumn',
      render: (operate, record) => (
        <span>
          {record.issend === 1 ? <Tag color="cyan">已推送</Tag> : null}
          {record.send === '1' ? <Tag color="blue">必发</Tag> : null}
          {record.crawl === '1' ? <Tag color="green">公众号</Tag> : null}
          {record.crawl === '2' ? <Tag color="green">第三方网页</Tag> : null}
          {record.externalType === 0 ? <Tag color="brown">华盛早报</Tag> : null}
          {record.externalType === 1 ? <Tag color="#3b5999">美股前瞻</Tag> : null}
          <span style={{cursor: 'pointer'}} onClick={() => this.showDetailModal(record.newsId)}>
            {record.title.length > 15 ? record.title.substring(0, 15) + '...' : record.title}
          </span>
        </span>
      ),
      width: 440
    }, {
      title: '标签',
      dataIndex: 'tags'
    }, {
      title: '发送次数',
      dataIndex: 'sendCount',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'sendCount' && sortedInfo.order
    }, {
      title: '打开次数',
      dataIndex: 'openCount',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'openCount' && sortedInfo.order
    }, {
      title: '转发次数',
      dataIndex: 'relayCount',
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'relayCount' && sortedInfo.order
    }, {
      title: '创建时间',
      dataIndex: 'createTime',
      render: (operate, record) => (
        <span>{record.createTime}</span>
      ),
      sorter: true,
      sortOrder: sortedInfo.columnKey === 'createTime' && sortedInfo.order
    }, {
      title: '操作',
      dataIndex: 'sendDetail',
      width: 220,
      render: (operate, record) => (
        <span>
          <span style={{color: '#1890ff', cursor: 'pointer', marginRight: 10}}
            onClick={() => this.editNewItem(record)}>编辑</span>
          <span style={{color: '#1890ff', cursor: 'pointer'}}
            onClick={() => this.showSendDetailModal(record.newsId)}>查看</span>
          <span style={{color: '#1890ff', cursor: 'pointer', margin: '0 10px'}}
            onClick={() => this.pushNews(record)}>推送</span>
          <span style={{color: '#1890ff', cursor: 'pointer'}}
            onClick={() => this.showTagModal(record)}>标签修改</span>
        </span>
      )
    }]
    const { pathname } = this.props.location
    return (
      <div className="newsHot">
        <div className={styles.header}>
          <div className={styles.rowView}>
            <span className={styles.leftItem}>
              <RoleButton
                type="primary"
                pathname={pathname}
                rolekey={'pushSet'}
                onClick={this.showPushModal}
              >
                 推送设置
              </RoleButton>

            </span>
          </div>
          <div className={styles.rowView}>
            <span className={styles.leftItem}>
              日期：<DatePicker.RangePicker style={{ width: 300 }} value={filterDateRange} onChange={this.onChangeDate} />
            </span>
            <span className={styles.leftItem}>
              标题：<Input style={{ width: 200 }} value={filterTitle} placeholder="输入标题" onChange={this.handleChangeTitle} />
            </span>
            <span className={styles.leftItem}>
              <Button type="primary" onClick={this.search}>查询</Button>
            </span>
            <span className={styles.leftItem}>
              <Button type="default" onClick={this.reset}>重置</Button>
            </span>
          </div>
        </div>
        <div>
          <Table
            rowSelection={{
              selectedRowKeys,
              onChange: this.tableSelectChange,
              getCheckboxProps: this.getCheckboxProps
            }}
            columns={columns}
            dataSource={tableData}
            pagination={pagination}
            loading={loading}
            onChange={this.handleTableChange}
            locale={{emptyText: '暂无数据'}}
          />
          {!loading && tableData.length
            ? <span>
              <RoleButton
                className={styles.mustSendBtn}
                type="danger"
                pathname={pathname}
                rolekey={'aritcleDel'}
                onClick={this.newsHotDelete}
              >
                删除
              </RoleButton>
              <RoleButton
                className={styles.mustSendBtn}
                pathname={pathname}
                rolekey={'betfairSet'}
                type="primary"
                onClick={() => this.setMustSend(true)}
              >
                  设为必发
              </RoleButton>
              <RoleButton
                className={styles.mustSendBtn}
                type="primary"
                pathname={pathname}
                rolekey={'betfairSet'}
                onClick={() => this.setMustSend(false)}
              >
                取消必发
              </RoleButton>
            </span>
            : null }
        </div>
        <SendDetailModal sendDetailId={sendDetailId} visible={visibleSendDetailModal} hideModal={this.hideSendDetailModal} />
        <DetailModal detailId={detailId} visible={visibleDetailModal} hideModal={this.hideDetailModal} />
        <TagModal tagRecord={tagRecord} visible={visibleTagModal} hideModal={this.hideTagModal} fetch={() => this.fetch()} />
        {pushVisible && (
          <Modal visible={true} title="推送设置" className="push-modal" onOk={this.pushSetting} onCancel={() => this.setState({ pushVisible: false })}>
            选择可见部门：
            <DeptTreeSelect style={{ width: '360px' }} onChange={this.treeChange} value={departmentIds}/>
          </Modal>
        )}
      </div>
    )
  }
}

export default NewsList
