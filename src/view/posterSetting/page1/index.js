import React, { Component, Fragment } from 'react'
import { Button, Table } from 'antd'
import { Link, withRouter } from 'react-router-dom'
import axios from '@src/utils/axios'
import urls from '@src/config'
import utils from '@src/utils'
import './index.less'
import moment from 'moment'
@withRouter
export default class PosterSetting extends Component {
  constructor(props) {
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
      .post(urls.qrodeList, { pageNum, pageSize }, { headers: { 'Content-Type': 'application/json' } })
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
      title: '专属二维码',
      dataIndex: 'qrCodeUrl',
      render: (text) => (
        <a target="_blank" href={text}>
          <img className="table-img" src={text} />
        </a>
      )
    },
    {
      title: '渠道名称',
      dataIndex: 'channelName',
      render: (text = '') => {
        if (text.length <= 15) {
          return text
        } else {
          return <div title={text}>{text.slice(0, 15)}...</div>
        }
      }
    },
    {
      title: '配置人员',
      dataIndex: 'qrStaffs',
      render: (text = []) => {
        let p = ''
        text.forEach((item, index) => {
          p += item.name
          if (index !== text.length - 1) {
            p += '，'
          }
        })
        if (p.length <= 10) {
          return p
        } else {
          return <div title={p}>{p.slice(0, 10)}...</div>
        }
      }
    },
    {
      title: '添加标签',
      dataIndex: 'qrCorpQywxCustomerTags',
      render: (text = '') => {
        let p = ''
        text.forEach((item, index) => {
          p += item.tagName
          if (index !== text.length - 1) {
            p += '、'
          }
        })
        if (p.length <= 10) {
          return p
        } else {
          return <div title={p}>{p.slice(0, 10)}...</div>
        }
      }
    },
    {
      title: '操作时间',
      dataIndex: 'lastUpdated',
      render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作人',
      dataIndex: 'updateBy'
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (text, record) => (
        <Fragment>
          <Button type="ghost" onClick={() => utils.downImg(record.qrCodeUrl, record.channelName)}>
            下载
          </Button>
          <Button type="primary" onClick={() => this.handleEdit(record)}>编辑</Button>
        </Fragment>
      )
    }
  ]

  handleEdit = (record) => {
    const isRight = utils.checkButtonRight(this.props.location.pathname, 'channelExpansionEdit')
    if (!isRight) return
    this.props.history.push({
      pathname: `/channelExpandEdit/${encodeURIComponent(utils.URImalformed(JSON.stringify(record)))}`
    })
  }

  handleAdd = () => {
    const isRight = utils.checkButtonRight(this.props.location.pathname, 'channelExpansionAdd')
    if (!isRight) return
    this.props.history.push({ pathname: '/channelExpandEdit/{}', query: { type: 'add' } })
  }

  render = () => {
    const { isLoading, dataSource } = this.state

    return (
      <div className="showPosterContainer">
        <div className="header">
          客户通过扫描渠道二维码，添加客户经理好友，渠道标签将自动标注
          <Button type="primary" onClick={this.handleAdd}>新增</Button>
        </div>
        <Table
          loading={isLoading}
          rowKey="id"
          dataSource={dataSource}
          columns={this.columns}
          pagination={this.pagination()}
        />
      </div>
    )
  }
}
