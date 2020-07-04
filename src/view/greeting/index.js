import React, { Component, Fragment } from 'react'
import { Table, message, Button, Popconfirm, Modal, Spin } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import moment from 'moment'
import './index.less'
import Tools from '@src/utils'

export default class extends Component {
  state = { loading: false, list: [], pageNum: 1, pageSize: 10, total: 0, articleDetail: null }

  componentDidMount = () => {
    this.getTableData()
  }

  columns = () => {
    return [
      {
        title: '活动名称',
        dataIndex: 'name',
        render: (text = '') => {
          if (text.length <= 15) {
            return text
          } else {
            return <div title={text}>{text.slice(0, 15)}...</div>
          }
        }
      },
      {
        title: '活动城市',
        dataIndex: 'aaaa',
        render: (text, record) => {
          return record.province + ' / ' + record.city
        }
      },
      {
        title: '操作时间',
        dataIndex: 'operateTime',
        render: (text, record) => {
          return moment(text).format('YYYY-MM-DD HH:mm')
        }
      },
      { title: '操作人', dataIndex: 'operater' },
      {
        title: '配置内容',
        dataIndex: 'ooo',
        render: (text, record) => {
          return (
            <div className="table-btn" onClick={() => this.preview(record)}>
              点击预览
            </div>
          )
        }
      },
      {
        title: '操作',
        dataIndex: 'xxx',
        render: (text, record) => {
          return (
            <Fragment>
              <Button onClick={() => this.linkToEdit(record)} type="primary">
                编辑
              </Button>
              <Popconfirm title="确定删除此条数据吗?" onConfirm={() => this.del(record)} okText="删除" cancelText="取消">
                <Button type="danger">删除</Button>
              </Popconfirm>
            </Fragment>
          )
        }
      }
    ]
  }

  // 预览
  preview = (record) => {
    const { selectedItem, articleDetail } = this.state
    const newArticleDetail = record.type !== 0 || selectedItem === record ? articleDetail || null : null
    this.setState({ visible: true, articleDetail: newArticleDetail, selectedItem: record }, () => {
      if (record.type === 0 && (selectedItem !== record || !newArticleDetail)) this.newsParse()
    })
  }

  // 抓取文章内容
  newsParse = () => {
    const { selectedItem } = this.state
    if (this[`articleDetail_${selectedItem.id}`]) {
      this.setState({ articleDetail: this[`articleDetail_${selectedItem.id}`] })
      return
    }
    axios
      .get(urls.newsParse, { params: { url: selectedItem.url } })
      .then((res) => {
        if (res.ret === 0) {
          this[`articleDetail_${selectedItem.id}`] = res.retdata
          this.setState({ articleDetail: res.retdata })
        }
      })
      .catch((err) => {
        console.log(err)
        this.setState({ articleDetail: undefined })
      })
  }

  // 关闭弹窗
  close = () => {
    const { articleDetail, selectedItem } = this.state
    if (selectedItem.type === 0 && articleDetail === null) return
    this.setState({ visible: false })
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
      .get(urls.greetList, { params })
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
  linkToEdit = (item = {}) => {
    if (item.id) {
      const isRight = Tools.checkButtonRight(this.props.location.pathname, 'greetingEdit')
      if (!isRight) return
    } else {
      const isRight = Tools.checkButtonRight(this.props.location.pathname, 'greetingAdd')
      if (!isRight) return
    }
    this.props.history.push(`/greetingEdit/${encodeURIComponent(Tools.URImalformed(JSON.stringify(item)))}`)
  }

  // 删除
  del = (record) => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'greetingDel')
    if (!isRight) return
    axios.post(urls.greetDelete, { id: record.id }).then((res) => {
      if (res.ret === 0) {
        message.success('数据删除成功')
        this.getTableData()
      }
    })
  }

  render = () => {
    const { loading, list, visible, selectedItem = {}, articleDetail } = this.state
    const { type, url, name } = selectedItem
    return (
      <div id="choicestBanner">
        <div className="title">
          添加好友默认推送
          <Button type="primary" onClick={() => this.linkToEdit()}>
            新增
          </Button>
        </div>
        <div className="info">
          自动默认推送，前置条件需要在企业微信进行相关设置，
          <a target="_blabk" href="https://work.weixin.qq.com/wework_admin/frame#csWelcome/list">
            （企业微信/客户联系/配置/欢迎语）
          </a>
          <br />
          小程序配置链接地址为：/pack-client/pages/greeting/index
        </div>
        <Table loading={loading} dataSource={list} columns={this.columns()} pagination={this.pagination()} />
        <Modal title={name} className="iframe-modal" visible={visible} width={520} footer={null} onCancel={this.close}>
          {type ? (
            <img src={url} />
          ) : (
            <Spin spinning={articleDetail === null}>
              <div className="article" dangerouslySetInnerHTML={{ __html: articleDetail }}></div>
            </Spin>
          )}
        </Modal>
      </div>
    )
  }
}
