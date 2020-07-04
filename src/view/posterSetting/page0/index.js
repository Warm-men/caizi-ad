import React, { Component, Fragment } from 'react'
import { message, Button, Table, Popconfirm } from 'antd'
import { Link, withRouter } from 'react-router-dom'
import axios from '@src/utils/axios'
import urls from '@src/config'
import utils from '@src/utils'
import './index.less'
@withRouter
class PosterSetting extends Component {
  constructor (props) {
    super(props)
    this.state = {
      dataSource: [],
      isLoading: false,
      pageNum: 1,
      pageSize: 10,
      total: 0,
      visible: false
    }
  }

  componentDidMount = () => {
    this.getPosterList()
  }

  // 获取列表数据
  getPosterList = () => {
    this.setState({ isLoading: true })
    const { pageNum, pageSize } = this.state
    axios
      .post(urls.getPosterList, { pageNo: pageNum, pageSize }, { headers: { 'Content-Type': 'application/json' } })
      .then((res) => {
        if (res.ret === 0) {
          this.setState({
            dataSource: res.retdata.list,
            total: res.retdata.total
          })
        }
      })
      .finally(() => {
        this.setState({ isLoading: false })
      })
  }

  // 删除
  hanldDelete = (data) => {
    const isRight = utils.checkButtonRight(this.props.location.pathname, 'posterDelete')
    if (!isRight) return
    if (!data.owner) {
      utils.openRightMessage()
      return
    }
    axios.get(urls.deletePoster + `?id=${data.id}`).then((res) => {
      if (res.ret === 0) {
        message.success('删除成功')
        this.getPosterList()
      }
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
      onChange: (pageNum) => {
        this.setState({ pageNum }, this.getPosterList)
      },
      onShowSizeChange: (pageNum, pageSize) => {
        this.setState({ pageNum: 1, pageSize }, this.getPosterList)
      }
    }
  }

  columns = [
    {
      title: '海报',
      dataIndex: 'url',
      width: 180,
      render: (text) => <img className="table-img" src={text} />
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 200,
      ellipsis: true
    },
    {
      title: '所选机构',
      dataIndex: 'deptName',
      width: 200,
      ellipsis: true
    },
    {
      title: '操作时间',
      dataIndex: 'operateTime'
    },
    {
      title: '操作人',
      dataIndex: 'operator'
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (text, record) => (
        <Fragment>
          <Button type="primary" onClick={() => { this.handleEdit(record) }}>编辑</Button>
          <Popconfirm title="确定删除此条数据吗?" onConfirm={() => this.hanldDelete(record)} okText="删除" cancelText="取消">
            <Button type="danger">删除</Button>
          </Popconfirm>
        </Fragment>
      )
    }
  ]

  handleEdit = (record) => {
    const isRight = utils.checkButtonRight(this.props.location.pathname, 'posterEdit')
    if (!isRight) return
    if (!record.owner) {
      utils.openRightMessage()
      return
    }
    this.props.history.push({
      pathname: '/showPosterEdit',
      query: { data: record, type: 'edit' }
    })
  }

  handleAdd = () => {
    const isRight = utils.checkButtonRight(this.props.location.pathname, 'posterAdd')
    if (!isRight) return
    this.props.history.push({ pathname: '/showPosterEdit', query: { type: 'add' } })
  }
  render = () => {
    const { isLoading, dataSource } = this.state
    return (
      <div className="showPosterContainer">
        <div className="header">
          通过上传展业海报，客户经理可在企业微信分享客户或添加个人名片进行推广
          <Button type="primary" onClick={this.handleAdd}>新增</Button>
        </div>
        <Table loading={isLoading} rowKey="id" dataSource={dataSource} columns={this.columns} pagination={this.pagination()} />
      </div>
    )
  }
}

export default PosterSetting
