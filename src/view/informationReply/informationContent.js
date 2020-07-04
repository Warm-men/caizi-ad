import React from 'react'
import {
  Input,
  Button,
  message,
  Table,
  Modal,
  DatePicker
} from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import { withRouter } from 'react-router-dom'
import './index.less'
import Tools from '@src/utils'
import ModalView from './modalView'
@withRouter
export default class InformationContent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: false,
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showTotal: null
      },
      filterDateRange: [null, null],
      infoTitle: null,
      showEdit: false,
      sortedInfo: {},
      selectedRowKeys: [],
      onSelectedItem: null,
      showAdd: false
    }
  }

  componentDidMount () {
    this.pullData()
  }

  // 时间范围
  onChangeDate = (date) => {
    this.setState({ filterDateRange: date })
  }

  onChangeInfoTitle = (e) => {
    this.setState({infoTitle: e.target.value})
  }

  // 分页、排序、筛选变化时触发 获取表格数据
  handleTableChange = (pagination, filters, sorter) => {
    const { columnKey: prevColumnKey, order: prevOrder } = this.state.sortedInfo
    const pager = { ...this.state.pagination }
    if ((prevColumnKey === sorter.columnKey) && (prevOrder === sorter.order)) {
      pager.current = pagination.current
    } else {
      pager.current = 1
    }
    this.setState({
      pagination: pager,
      sortedInfo: sorter
    }, this.pullData)
  }
  // 表格排序参数
  getOrderType = (sortedInfo) => {
    let type = ''
    const isDescend = sortedInfo.order === 'descend'
    if (sortedInfo.columnKey === 'sendCount') {
      type = isDescend ? '0' : '1'
    } else if (sortedInfo.columnKey === 'openCount') {
      type = isDescend ? '2' : '3'
    } else if (sortedInfo.columnKey === 'dateCreated') {
      type = isDescend ? '4' : '5'
    }
    return type
  }

  // 重置
  reset = () => {
    this.setState({
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showTotal: null
      },
      filterDateRange: [null, null],
      infoTitle: '',
      sortedInfo: {}
    }, this.pullData)
  }

  handleAdd = () => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'replyAdd')
    if (!isRight) return
    this.setState({showAdd: true})
  }

  isAddedItem = () => {
    this.pullData()
  }

  pullData = () => {
    const { sortedInfo, pagination, filterDateRange, infoTitle } = this.state
    const { current, pageSize } = pagination
    const data = {
      pageNum: current,
      pageSize: pageSize,
      orderType: this.getOrderType(sortedInfo) || '',
      minTime: filterDateRange[0] ? filterDateRange[0].format('YYYY-MM-DD') : '',
      maxTime: filterDateRange[1] ? filterDateRange[1].format('YYYY-MM-DD') : '',
      title: infoTitle
    }
    this.setState({ loading: true })
    axios.post(urls.sidebarNewsInfo, data, {headers: {'Content-Type': 'application/json;charset=UTF-8'}}).then(res => {
      const pagination = { ...this.state.pagination }
      this.setState({
        loading: false,
        tableData: res.retdata.list,
        pagination: { ...pagination, total: res.retdata.total, showTotal: total => `共 ${total}条记录` }
      })
    }).catch(() => {
      this.setState({ loading: false })
    })
  }
  // 点击表格行勾选框
  tableSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys })
  }

  beforDelete = () => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'replyDel')
    if (!isRight) return
    const { selectedRowKeys } = this.state
    if (!selectedRowKeys.length) {
      message.error('请勾选需要删除的数据')
      return
    }
    this.handleBencthDelete()
  }

  handleBencthDelete = () => {
    const { selectedRowKeys } = this.state
    const params = {
      ids: selectedRowKeys
    }
    Modal.confirm({
      title: '确认删除所选数据？',
      onOk: () => {
        axios.post(urls.sidebarNewsDelete, {...params}, {headers: {'Content-Type': 'application/json;charset=UTF-8'}}).then(res => {
          this.reset()
        })
      },
      onCancel: () => {}
    })
  }

  handleDelete = (record) => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'replyDel')
    if (!isRight) return
    if (!record.owner) {
      Tools.openRightMessage()
      return
    }
    const params = {
      ids: [record.id]
    }
    Modal.confirm({
      title: '确认删除所选数据？',
      onOk: () => {
        axios.post(urls.sidebarNewsDelete, {...params}, {headers: {'Content-Type': 'application/json;charset=UTF-8'}}).then(res => {
          this.pullData()
        })
      },
      onCancel: () => {}
    })
  }

  handleEdit = record => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'replyEdit')
    if (!isRight) return
    if (!record.owner) {
      Tools.openRightMessage()
      return
    }
    this.setState({
      onSelectedItem: record,
      showEdit: true
    })
  }

  onSearch = () => {
    this.setState({
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showTotal: null
      }
    }, this.pullData)
  }

  getCheckboxProps = (record) => {
    return ({ disabled: !record.owner })
  }

  render () {
    const {
      tableData,
      pagination,
      loading,
      filterDateRange,
      showEdit,
      infoTitle,
      selectedRowKeys,
      sortedInfo,
      showAdd,
      onSelectedItem
    } = this.state
    const columns = [
      {
        title: '资讯标题',
        dataIndex: 'title',
        width: '30%'
      },
      {
        title: '资讯类型',
        dataIndex: 'newsTypeName'
      },
      {
        title: '创建时间',
        dataIndex: 'dateCreated',
        render: (text, record) => (
          <span>
            <span>{record.dateCreated ? new Date(record.dateCreated).format('yyyy-MM-dd hh:mm') : ''}</span>
          </span>
        ),
        sorter: true,
        sortOrder: sortedInfo.columnKey === 'dateCreated' && sortedInfo.order
      },
      {
        title: '发送次数',
        dataIndex: 'sendCount',
        sorter: true,
        sortOrder: sortedInfo.columnKey === 'sendCount' && sortedInfo.order
      },
      {
        title: '打开次数',
        dataIndex: 'openCount',
        sorter: true,
        sortOrder: sortedInfo.columnKey === 'openCount' && sortedInfo.order
      },
      {
        title: '操作',
        render: (text, record) => (
          <span>
            <Button type={'primary'} onClick={() => this.handleEdit(record)} style={{marginRight: 20}}>编辑</Button>
            <Button type={'danger'} onClick={() => this.handleDelete(record)}>删除</Button>
          </span>
        )
      }
    ]
    return (
      <div>
        <div style={{marginBottom: 20}}>
          <span style={{marginRight: 20}}>
            <span>日期：</span>
            <DatePicker.RangePicker style={{ width: 300 }} value={filterDateRange} onChange={this.onChangeDate} />
          </span>
          <span style={{marginRight: 20}}>
            <span>标题：</span>
            <Input style={{ width: 200 }} placeholder={'输入标题'} value={infoTitle} onChange={(e) => this.onChangeInfoTitle(e)} />
          </span>
          <Button type={'primary'} onClick={this.onSearch} style={{marginRight: 20}}>查询</Button>
          <Button type={'primary'} onClick={this.reset} style={{marginRight: 20}}>重置</Button>
          <Button type={'primary'} onClick={this.handleAdd} style={{marginRight: 20}}>添加</Button>
        </div>
        <div style={{position: 'relative'}}>
          <Table
            rowSelection={{
              selectedRowKeys,
              onChange: this.tableSelectChange,
              getCheckboxProps: this.getCheckboxProps
            }}
            rowKey={'id'}
            columns={columns}
            dataSource={tableData}
            pagination={pagination}
            loading={loading}
            onChange={this.handleTableChange}
            locale={{emptyText: '暂无可用资讯，您可点"添加"进行单条内容的维护。'}}
          />
          <Button type={'danger'} onClick={this.beforDelete} style={{position: 'absolute', bottom: 10, left: 10}}>批量删除</Button>
        </div>
        <ModalView
          visible={showAdd}
          type={'add'}
          isAddedItem={this.isAddedItem}
          closeModal={() => this.setState({showAdd: false})}
        />
        <ModalView
          visible={showEdit}
          type={'adit'}
          isEditedItem={this.pullData}
          onSelectedItem={onSelectedItem}
          closeModal={() => this.setState({showEdit: false})}
        />
      </div>
    )
  }
}
