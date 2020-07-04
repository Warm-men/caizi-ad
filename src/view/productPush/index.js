import React, { Component } from 'react'
import { Button, Modal, message, Spin, Table, Icon } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import Tools from '@src/utils'
import { DndProvider } from 'react-dnd'
import dragableBodyRow from '@src/view/base/dragTable'
import HTML5Backend from 'react-dnd-html5-backend'
import styles from './index.less'

class ProductPush extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pageNum: 1,
      pageSize: 10,
      total: 0,
      selectedRowKeys: [],
      tableData: [],
      btnLoading: false,
      isLoading: true
    }
  }

  componentDidMount () {
    this.fetch()
  }

  // 获取列表数据
  fetch = () => {
    const {pageSize, pageNum, tableData} = this.state
    axios.get(urls.getPushProductList, {params: { pageNum, pageSize }}).then(res => {
      const result = res.retdata
      if (res.ret === 0) {
        this.setState({
          tableData: result.productList,
          total: result.total
        })
      } else {
        message.error(res.retmsg)
      }
      this.setState({isLoading: false})
    }).catch(() => {
      this.setState({isLoading: false})
    })
  }

   // 分页、排序、筛选变化时触发 获取表格数据
   handleTableChange = (pagination, filters, sorter) => {
     this.setState({
       pageNum: pagination.current
     }, () => {
       this.fetch()
     })
   }

   // 点击表格行勾选框
  tableSelectChange = (selectedRowKeys, selectedRows) => { this.setState({ selectedRowKeys }) }

  upTop = (data) => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'changeOrder')
    if (!isRight) return
    const { total } = this.state
    const options = {
      newSeq: total, // 返回的数据已经按照seq进行降序排序
      id: data.productId
    }
    this.setState({
      pageNum: 1,
      isLoading: true
    })
    axios.post(urls.pushProductOrder, options).then(res => {
      this.fetch()
    })
  }

   // 拖拽表格排序
   onMoveTableRow = (dragIndex, hoverIndex) => {
     const isRight = Tools.checkButtonRight(this.props.location.pathname, 'changeOrder')
     if (!isRight) return
     const { tableData } = this.state
     const dragRow = tableData[dragIndex]
     const data = {
       newSeq: tableData[hoverIndex].seq,
       id: tableData[dragIndex].productId
     }
     this.setState({
       isLoading: true
     })
     axios.post(urls.pushProductOrder, data).then(res => {
       this.fetch()
     }).catch(() => {
       this.setState({isLoading: false})
     })
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
      onChange: pageNum => {
        this.setState({ pageNum }, () => {})
      },
      onShowSizeChange: (pageNum, pageSize) => {
        this.setState({ pageNum: 1, pageSize }, () => {})
      }
    }
  }

  // 取消主推
  cancelPush = () => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'cancelPush')
    if (!isRight) return
    const _this = this
    let {selectedRowKeys} = this.state
    if (!selectedRowKeys.length) return message.warning('请勾选要取消的产品！')
    let ids = selectedRowKeys.join(',')
    Modal.confirm({
      title: '确定？',
      content: `取消${selectedRowKeys.length}个产品主推？`,
      onOk () {
        _this.setState({btnLoading: true})
        axios.post(urls.cancelPushProduct, { ids }).then(res => {
          if (res.ret === 0) {
            _this.fetch()
            message.success('取消成功')
          } else {
            message.error(res.retmsg)
          }
          _this.setState({selectedRowKeys: [], btnLoading: false})
        }).catch(() => {
          message.error('取消主推失败！')
          _this.setState({selectedRowKeys: [], btnLoading: false})
        })
      },
      onCancel () {
      }
    })
  }

  formatDate = (data) => {
    var date = new Date(data)
    var YY = date.getFullYear() + '-'
    var MM = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
    var DD = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate())
    var hh = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
    var mm = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':'
    var ss = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds())
    return YY + MM + DD
  }

  render () {
    const {selectedRowKeys, tableData, btnLoading, isLoading} = this.state
    const columns = [
      {
        title: '产品名称',
        dataIndex: 'name',
        key: 'name'
      },
      {
        title: '业务类型',
        dataIndex: 'businessType',
        key: 'businessType',
        render: (text, record) => (
          <span>{text === 1 ? '对公业务' : '零售业务'}</span>
        )
      },
      {
        title: '产品类别',
        dataIndex: 'type',
        key: 'type',
        render: (text, record) => (
          <span>{text === 1 ? '理财产品' : '非理财产品'}</span>
        )
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        render: (text, record) => {
          let time = this.formatDate(text)
          return <span>{time}</span>
        }
      },
      {
        title: '上架时间',
        dataIndex: 'putOnTime',
        key: 'putOnTime',
        render: (text, record) => {
          let time = this.formatDate(text)
          return <span>{time}</span>
        }
      },
      {
        title: '操作',
        dataIndex: 'productId',
        key: 'productId',
        render: (text, record, index) => {
          const {pageNum} = this.state
          return <span style={{cursor: 'pointer'}}>
            {index === 0 && pageNum === 1 ? null : <Icon onClick={() => this.upTop(record)} type="up" />}
          </span>
        }
      }
    ]
    return (
      <div className={styles.productPush}>
        <Spin spinning={isLoading}>
          <DndProvider backend={HTML5Backend}>
            <Table
              columns={columns}
              rowKey={'productId'}
              rowSelection={{
                selectedRowKeys,
                onChange: this.tableSelectChange
              }}
              dataSource={tableData}
              pagination={this.pagination()}
              onChange={this.handleTableChange}
              locale={{emptyText: '暂无数据'}}
              components={{
                body: {
                  row: dragableBodyRow
                }
              }}
              onRow={(record, index) => ({
                index,
                moveRow: this.onMoveTableRow
              })}
            />
          </DndProvider>
          {tableData.length ? <Button type="danger" loading={btnLoading} onClick={this.cancelPush}>取消主推</Button> : null}
        </Spin>
      </div>
    )
  }
}

export default ProductPush
