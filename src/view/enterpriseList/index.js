import React, { Component } from 'react'
import { Button, Input, Table, DatePicker, Select, message, Tag, Spin } from 'antd'
import styles from './index.less'
import BatchEdit from './batch_edit'
import axios from '@src/utils/axios'
import urls from '@src/config'
import Tools from '@src/utils'
import DeptTreeSelect from '@src/components/DeptTreeSelect'

class EnterpriseList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      fromDate: null,
      toDate: null,
      corpTag: null,
      corpName: null,
      editSelectedTable: false,
      selectedTable: [],
      tableData: [],
      corpTags: [],
      selectedRowKeys: [],
      isBatchEdit: false,
      branchId: null,
      pagination: {
        current: 1,
        pageSize: 10,
        total: null,
        showTotal: null
      },
      initLoading: true
    }
  }

  componentDidMount () {
    this.getEnterpriseAllTags()
    this.queryList()
  }

  getEnterpriseAllTags = () => {
    axios.post(urls.enterpriseAllTags, {}).then(res => {
      const { retdata } = res
      this.setState({ corpTags: retdata })
    }).catch(() => {
      message.error('获取标签信息失败')
    })
  }

  onChangeCorpTag = (corpTag) => {
    this.setState({
      corpTag
    })
  }

  onChangeBank = (id) => {
    this.setState({
      bankId: id
    })
  }

  checkButton = () => {
    this.setState({initLoading: true}, this.queryList)
  }

  queryList = (pageNum = null) => {
    const { fromDate, toDate, corpName, corpTag, branchId, pagination } = this.state
    if ((fromDate && toDate) && (toDate._d.getTime() < fromDate._d.getTime())) {
      message.error('结束时间要大于开始时间')
      this.setState({ initLoading: false })
      return
    }
    let params = {
      fromDate: fromDate ? fromDate._d.format('yyyy-MM-dd') : null,
      toDate: toDate ? toDate._d.format('yyyy-MM-dd') : null,
      corpName,
      corpTag,
      branchId,
      pageNum: pageNum || 1,
      pageSize: pagination.pageSize
    }
    axios.post(urls.enterpriseListQuery, {...params}, {headers: {'Content-Type': 'application/json'}}).then(res => {
      const { list, total } = res.retdata
      if (list.length === 0) {
        message.success('查询结果为空')
      }
      this.setState({
        tableData: list,
        initLoading: false,
        pagination: {...this.state.pagination, total, showTotal: total => `共${total}条`}
      })
    }).catch(() => {
      this.setState({ initLoading: false })
    })
  }

  // 点击表格行勾选框
  tableSelectChange = (selectedRowKeys, selectedRows) => {
    const preKeys = [...this.state.selectedRowKeys]
    this.setState({ selectedRowKeys, editSelectedTable: selectedRowKeys.length > 0 }, () => {
      if (preKeys.length && selectedRowKeys.length) {
        this.batchEdit()
      }
    })
  }

  // 分页、排序、筛选变化时触发 获取表格数据
  handleTableChange = (pagination, filters, sorter) => {
    const pager = { ...this.state.pagination }
    pager.current = pagination.current
    this.setState({
      pagination: pager
    }, () => {
      this.setState({initLoading: true}, () => {
        this.queryList(pager.current)
      })
    })
  }

  goEnterpriseDetail = (corpId) => {
    this.props.history.push({pathname: '/enterpriseDetail', search: `?corpId=${corpId}`})
  }

  goEnterpriseEdit = (record) => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'cropListEdit')
    if (!isRight) return
    if (record.hasOwnProperty('owner')) {
      if (!record.owner) {
        Tools.openRightMessage()
        return
      }
    }
    this.props.history.push({pathname: '/enterpriseEdit', search: `?corpId=${record.corpId}`})
  }

  batchEdit = () => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'cropListEdit')
    if (!isRight) return
    const { editSelectedTable, selectedRowKeys, tableData } = this.state
    if (!editSelectedTable) {
      message.error('请先选择企业')
      return null
    }
    const selectedTable = tableData.map((item) => {
      const itemName = selectedRowKeys.includes(item.corpId) ? item.corpName : null
      return itemName
    })
    const isBatchEdit = !!selectedTable.length
    this.setState({selectedTable, isBatchEdit})
  }

  selectedBranchId = (branchId) => {
    this.setState({ branchId })
  }

  finishedBatchEdit = (isSubmit = false) => {
    this.setState({isBatchEdit: false, selectedRowKeys: [], editSelectedTable: false}, () => {
      if (isSubmit) {
        message.success('批量修改企业信息成功')
        this.queryList(this.state.pagination.current)
      }
    })
  }

  getColumns = () => {
    const columns = [{
      title: '企业',
      dataIndex: 'corpName',
      ellipsis: true
    },
    {
      title: '添加时间',
      dataIndex: 'createDate',
      render: createDate => (createDate || '暂无')
    }, {
      title: '归属分支行',
      dataIndex: 'branchName',
      ellipsis: true,
      render: branchName => (branchName || '暂无')
    }, {
      title: '可触达员工数',
      dataIndex: 'empNum',
      render: empNum => (empNum || '暂无')
    }, {
      title: '客户经理',
      dataIndex: 'manager',
      render: manager => (manager || '暂无')
    },
    {
      title: '标签',
      dataIndex: 'corpTag',
      render: (text, record) => {
        const { corpTag } = record
        return corpTag && corpTag.length ? corpTag.map(v => <Tag style={{marginBottom: 8}} key={v}>{v}</Tag>) : '暂无'
      }
    }, {
      title: '操作',
      dataIndex: 'sendDetail',
      render: (text, record, index) => {
        const detail = <span>
          <span style={{color: '#1890ff', cursor: 'pointer'}} onClick={() => this.goEnterpriseDetail(record.corpId)}>查看</span>
          <span style={{color: '#1890ff', cursor: 'pointer', marginLeft: 20}} onClick={() => this.goEnterpriseEdit(record)}>编辑</span>
        </span>
        return detail
      }
    }]
    return columns
  }

  getCheckboxProps = (record) => {
    // return ({ disabled: false })
    if (record.hasOwnProperty('owner')) {
      return ({ disabled: !record.owner })
    } else {
      return ({ disabled: false })
    }
  }

  render () {
    const {
      fromDate,
      toDate,
      corpName,
      corpTag,
      selectedRowKeys = [],
      tableData,
      pagination,
      editSelectedTable,
      selectedTable,
      isBatchEdit,
      branchId,
      corpTags,
      initLoading
    } = this.state

    const columns = this.getColumns()

    return (
      <Spin spinning={initLoading} tip='数据获取中...'>
        <div className={styles.enterpriseList}>
          <div className={styles.title}>企业列表</div>
          <div className={styles.descript}>可触达员工：单位企业成功添加应用并且在内部可见范围选择的总员工数。</div>
          <div className={styles.filter_view}>
            <div className={styles.column_view}>
              <span className={styles.filter_item_view}>
                <span className={styles.filter_item}>
                      添加时间
                  <DatePicker style={{marginLeft: 10}} allowClear={true} value={fromDate} onChange={(fromDate) => this.setState({fromDate})} placeholder="请选择" />
                </span>
                <span className={styles.filter_item}>
                      至
                  <DatePicker style={{marginLeft: 10}} allowClear={true} value={toDate} onChange={(toDate) => this.setState({toDate})} placeholder="请选择" />
                </span>
              </span>
              <span className={styles.filter_item_view}>
                  企业名称
                <Input allowClear={true} style={{ width: 200, marginLeft: 20 }} value={corpName} onChange={(v) => this.setState({corpName: v.target.value})} placeholder="请输入企业名称"/>
              </span>
              <span className={styles.filter_item_view}>
                  标签
                <Select allowClear={true} style={{ width: 200, marginLeft: 20 }} value={corpTag} onChange={this.onChangeCorpTag} placeholder='请选择'>
                  {corpTags.map(item => {
                    return <Select.Option key={item} value={item}>{item}</Select.Option>
                  })}
                </Select>
              </span>
            </div>
            <span className={styles.filter_item_view}>
            归属分支行
              <DeptTreeSelect style={{ width: 300, marginLeft: 20 }} onChange={this.selectedBranchId} value={branchId} multiple={false}/>
            </span>
            <span className={styles.filter_item_view}>
              <Button style={{width: 100}} type="primary" onClick={this.checkButton}>查询</Button>
              <Button type={editSelectedTable ? 'primary' : 'default'} style={{ marginLeft: 20 }}
                onClick={this.batchEdit}>批量补充信息</Button>
            </span>
          </div>
          <div style={{ position: 'relative', marginTop: 20 }}>
            <Table
              rowSelection={{
                selectedRowKeys,
                onChange: this.tableSelectChange,
                getCheckboxProps: this.getCheckboxProps
              }}
              columns={columns}
              rowKey={'corpId'}
              dataSource={tableData}
              pagination={pagination}
              onChange={this.handleTableChange}
              locale={{emptyText: '暂无数据'}}
            />
          </div>
          {isBatchEdit && editSelectedTable ? <BatchEdit onCallBack={this.finishedBatchEdit} selectedRowKeys={selectedRowKeys} selectedTable={selectedTable} /> : null}
        </div>
      </Spin>
    )
  }
}

export default EnterpriseList
