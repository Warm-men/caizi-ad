import React, { Component, Fragment } from 'react'
import { Table, message, Button, Popconfirm, Modal } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import Tools from '@src/utils'
import './index.less'

export default class extends Component {
  state = { loading: false, list: [], pageNum: 1, pageSize: 10, total: 0 }

  componentDidMount = () => {
    this.getTableData()
  }

  columns = () => {
    return [
      {
        title: '活动图片',
        dataIndex: 'bannerImgUrl',
        render: (text) => {
          return (
            <a href={text} target="_blank">
              <img className="table-img" src={text} />
            </a>
          )
        }
      },
      {
        title: '活动标题',
        dataIndex: 'bannerName',
        render: (text = '') => {
          if (text.length <= 10) {
            return text
          } else {
            return <div title={text}>{text.slice(0, 10)}...</div>
          }
        }
      },
      { title: '活动链接', dataIndex: 'bannerLink' },
      {
        title: '所选机构',
        dataIndex: 'deptNameList',
        render: (text = []) => {
          const str = text.join('、')
          if (str.length <= 20) {
            return str
          } else {
            return <div title={str}>{str.slice(0, 20)}...</div>
          }
        }
      },
      { title: '开始时间', dataIndex: 'startTime' },
      { title: '结束时间', dataIndex: 'endTime' },
      {
        title: '操作',
        dataIndex: 'xxx',
        render: (text, record) => {
          return (
            <Fragment>
              <Button onClick={() => this.linkToEdit(record)} type="primary">
                编辑
              </Button>
              <Popconfirm title="确定删除此条数据吗?" onConfirm={() => this.beforDelete(record)} okText="删除" cancelText="取消">
                <Button type="danger">删除</Button>
              </Popconfirm>
            </Fragment>
          )
        }
      }
    ]
  }

  beforDelete = (record) => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'choicestBannerDel')
    if (!isRight) return
    if (!record.owner) {
      Tools.openRightMessage()
      return
    }
    this.del(record.id)
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

  // 查询表格数据
  getTableData = () => {
    const { pageNum, pageSize } = this.state
    this.setState({ loading: true })
    const params = { pageNum, pageSize }
    axios
      .post(urls.choicestList, params, {
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

  // 编辑 / 新增
  linkToEdit = (record) => {
    if (record) {
      const isRight = Tools.checkButtonRight(this.props.location.pathname, 'choicestBannerEdit')
      if (!isRight) return
      if (!record.owner) {
        Tools.openRightMessage()
        return
      }
    } else {
      const isRight = Tools.checkButtonRight(this.props.location.pathname, 'choicestBannerAdd')
      if (!isRight) return
    }
    this.props.history.push(`/choicestEdit${record ? `?id=${record.id}` : ''}`)
  }

  // 删除
  del = (id) => {
    axios
      .post(
        urls.choicestDelete,
        { id },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      )
      .then((res) => {
        if (res.ret === 0) {
          message.success('数据删除成功')
          this.getTableData()
        }
      })
  }

  render = () => {
    const { loading, list } = this.state
    return (
      <div id="choicestBanner">
        <div className="title">
          银行精选
          <Button type="primary" onClick={() => this.linkToEdit()}>
            新增
          </Button>
        </div>
        <div className="info" style={{margin: '20px 0'}}>通过发布银行活动，客户点击打开需进行实名（授权手机号）才能查看</div>
        <Table loading={loading} dataSource={list} columns={this.columns()} pagination={this.pagination()} />
      </div>
    )
  }
}
