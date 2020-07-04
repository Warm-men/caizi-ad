import React, { Component } from 'react'
import styles from './index.less'
import { Table, message, Button, Spin, Modal } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import Tools from '@src/utils'
// 业务配置
class BusinessConfig extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      tableData: [],
      isLoading: false,
      pageNum: 1,
      pageSize: 10,
      total: 0
    }
  }

  componentDidMount () {
    this.getBusinessList()
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

  // 获取业务配置数据列表
  getBusinessList = () => {
    this.setState({ isLoading: true })
    axios.post(urls.getBusinessList, {}, {headers: {'Content-Type': 'application/json'}}).then(res => {
      if (res.ret !== 0) {
        message.error(res.retmsg)
        return
      }
      const tableData = res.retdata.list
      const retData = res.retdata
      let table = []
      if (tableData && tableData.length) {
        for (let i = 0; i < tableData.length; i++) {
          let businessConfigArr = []
          tableData[i].jumpList.forEach((item) => {
            if (JSON.stringify(item) !== '{}' && item.busiName !== '') {
              businessConfigArr.push(<span style={{ padding: '0 2px' }}>{item.busiName}</span>)
            }
          })
          let temp = {
            key: i,
            combineName: tableData[i].busiRemark,
            EffectiveDept: tableData[i].deptNameList,
            businessConfig: businessConfigArr,
            operator: tableData[i].createBy,
            updateBy: tableData[i].updateBy,
            dateCreated: tableData[i].dateCreated,
            operateTime: tableData[i].lastUpdated,
            operateId: tableData[i].id,
            owner: tableData[i].owner
          }
          table.push(temp)
        }
      }
      this.setState({ isLoading: false, tableData: table, total: retData.total })
    })
  }
  // 删除行
  delete = (record) => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'stationJumpDel')
    if (!isRight) return
    if (!record.owner) {
      Tools.openRightMessage()
      return
    }
    Modal.confirm({
      title: '确认删除所选数据？',
      onOk: () => {
        axios.post(urls.BusinessConfigDelete, {id: record.operateId}, {headers: {'Content-Type': 'application/json'}}).then(res => {
          message.success('删除成功')
          this.getBusinessList()
        })
      }
    })
  }

  goConfig = () => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'stationJumpAdd')
    if (!isRight) return
    const path = {
      pathname: '/configEntryAdd',
      query: {type: 'add'}
    }
    this.props.history.push(path)
  }

  editConfig = (record) => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'stationJumpEdit')
    if (!isRight) return
    if (!record.owner) {
      Tools.openRightMessage()
      return
    }
    const path = {
      pathname: '/configEntryEdit',
      query: {data: record}
    }
    this.props.history.push(path)
  }

  render () {
    let { tableData, isLoading } = this.state
    const columns = [
      {
        title: '组合名称',
        dataIndex: 'combineName',
        key: 'combineName'
      },
      {
        title: '生效部门',
        dataIndex: 'EffectiveDept',
        key: 'EffectiveDept',
        width: 280,
        ellipsis: true,
        render: (text, record) => (
          <span>
            {text.join('/')}
          </span>
        )
      },
      {
        title: '业务配置',
        dataIndex: 'businessConfig',
        key: 'businessConfig',
        width: 280,
        render: (text, record) => {
          return text.map((item, i) => <span key={i}>{item}</span>)
        }
      },
      {
        title: '创建人员',
        dataIndex: 'operator',
        key: 'operator'
      },
      {
        title: '修改人员',
        dataIndex: 'updateBy',
        key: 'updateBy'
      },
      {
        title: '创建时间',
        dataIndex: 'dateCreated',
        key: 'dateCreated'
      },
      {
        title: '修改时间',
        dataIndex: 'operateTime',
        key: 'operateTime'
      },
      {
        title: '操作',
        dataIndex: 'id',
        key: 'id',
        render: (text, record, index) => (
          <div>
            <Button size='small' onClick={() => this.editConfig(record)} type="primary" style={{marginRight: 20}}>编辑</Button>
            <Button size='small' onClick={() => this.delete(record)} type="danger">删除</Button>
          </div>
        )
      }
    ]
    return (
      <div className={styles.businessConfigContainer}>
        <Spin spinning={isLoading} tip='数据获取中...'>
          <div className={styles.header}>
            <div className={styles.bConfig}>业务配置</div>
            <div className={styles.configEntry}>
              <Button onClick={this.goConfig} type="primary">配置入口</Button>
            </div>
          </div>
          <div className={styles.title}>
            <span>管理人员可为客户经理小站配置不同业务跳转入口（未配置小站将不展示此模块）</span>
          </div>
          <div className={styles.table}>
            <Table dataSource={tableData} columns={columns} pagination={this.pagination()} />
          </div>
        </Spin>
      </div>
    )
  }
}

export default BusinessConfig
