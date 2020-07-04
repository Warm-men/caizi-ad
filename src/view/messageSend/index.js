import React from 'react'
import { Tabs, Button, message, Table, Spin, Modal } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import Tools from '@src/utils'
import './index.less'

export default class MessgeSend extends React.Component {
  constructor (props) {
    super(props)
    this.search = this.props.location.search
    this.state = {
      loading: false,
      showExample: false,
      defaultMessageObj: {
        pictureTextMessage: {
          mainMessage: {
            url: '',
            title: '',
            coverPicture: '',
            summary: ''
          }
        }
      }, // 默认消息对象
      waitPushList: [], // 待推送数组对象
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showTotal: null
      },
      type: Tools.getUrlQueryString(this.search, 'type') || '1'
    }
    this.defaultMessageObj = {
      pictureTextMessage: {
        mainMessage: {
          url: '',
          title: '',
          coverPicture: '',
          summary: ''
        }
      }
    }
  }

  componentDidMount () {
    let { type } = this.state
    this.callback(type)
  }

  // 添加推送
  addPush = (type) => {
    // type = 1, 图文推送  type = 3, 默认推送
    let key = null
    if (type === 1) key = 'messageAdd'
    if (type === 3) key = 'defaultMessageAdd'
    if (key) {
      const isRight = Tools.checkButtonRight(this.props.location.pathname, key)
      if (!isRight) return
    }
    this.props.history.replace(`/newPage?type=${type}`)
  }

  // 编辑推送
  editPush = (type, id) => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'defaultMessageEdit')
    if (!isRight) return
    this.props.history.replace(`/newPage?type=${type}&id=${id}`)
  }

  // 删除推送
  delPush = (messageId) => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'defaultMessageDel')
    if (!isRight) return
    Modal.confirm({
      title: '确定?',
      content: `确认删除吗？`,
      onOk: () => {
        this.setState({ loading: true })
        axios.post(urls.defaultMessageDelete, {messageId}, {headers: {'Content-Type': 'application/json;charset=UTF-8'}}).then(res => {
          if (res.ret === 0) {
            message.success('删除成功')
            this.getDefalutFetch()
          }
        })
      },
      onCancel: () => {}
    })
  }

  // 取消发布图文推送
  cancelPush = (messageId) => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'messageCancel')
    if (!isRight) return
    Modal.confirm({
      title: '确定?',
      content: `确认取消推送吗？`,
      onOk: () => {
        this.setState({ loading: true })
        axios.post(urls.handMessagecCancel, {messageId}, {headers: {'Content-Type': 'application/json;charset=UTF-8'}}).then(res => {
          if (res.ret === 0) {
            message.success('取消成功')
            this.getImageTextFetch()
          }
        })
      },
      onCancel: () => {}
    })
  }

  // 分页 获取表格数据
  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      pagination: { ...this.state.pagination, current: pagination.current }
    }, () => {
      this.fetch()
    })
  }

  callback = (type) => {
    if (type === '1') {
      // 获取图文数据
      this.getImageTextFetch()
    } else if (type === '2') {
      // 获取表格数据
      this.fetch()
    } else if (type === '3') {
      // 获取默认推送数据
      this.getDefalutFetch()
    }
  }

  getImageTextFetch () {
    this.setState({ loading: true })
    axios.post(urls.messageQuery, { messageQueryType: 2 }, {headers: {'Content-Type': 'application/json;charset=UTF-8'}}).then(res => {
      this.setState({
        loading: false,
        waitPushList: res.retdata
      })
    }).catch(() => {
      this.setState({ loading: false })
    })
  }

  getDefalutFetch (init) {
    this.setState({ loading: true })
    axios.post(urls.messageQuery, { messageQueryType: 1 }, {headers: {'Content-Type': 'application/json;charset=UTF-8'}}).then(res => {
      this.setState({
        loading: false,
        defaultMessageObj: res.retdata[0] || this.defaultMessageObj
      })
    }).catch(() => {
      this.setState({ loading: false })
    })
  }

  // 获取数据
  fetch () {
    const { current, pageSize } = this.state.pagination
    const data = {
      pageNum: current,
      pageSize: pageSize
    }
    this.setState({ loading: true })
    axios.post(urls.pushRecordQuery, data, {headers: {'Content-Type': 'application/json;charset=UTF-8'}}).then(res => {
      const pagination = { ...this.state.pagination }
      this.setState({
        loading: false,
        tableData: res.retdata.list,
        pagination: { ...this.state.pagination, total: res.retdata.total, showTotal: total => `共 ${total}条记录` }
      })
    }).catch(() => {
      this.setState({ loading: false })
    })
  }

  render () {
    const {
      type,
      tableData,
      pagination,
      loading,
      showExample,
      defaultMessageObj,
      waitPushList
    } = this.state
    const columns = [
      {
        title: '标题',
        dataIndex: 'title',
        width: '40%'
      },
      {
        title: '推送人',
        dataIndex: 'pushPerson',
        width: '15%'
      },
      {
        title: '推送时间',
        dataIndex: 'pushTime',
        width: '15%',
        render: (text, record) => (
          <span>
            <span>{record.pushTime ? new Date(record.pushTime).format('yyyy-MM-dd hh:mm') : ''}</span>
          </span>
        )
      },
      {
        title: '推送人数',
        dataIndex: 'pushNum',
        width: '15%'
      },
      {
        title: '推送状态',
        dataIndex: 'pushStatus',
        width: '15%',
        render: (text, record) => (
          <span>
            {record.pushStatus === 1 ? '推送成功' : '推送失败'}
          </span>
        )
      }
    ]
    let defaultMessageListLength = defaultMessageObj.textMessage || defaultMessageObj.pictureMessage || defaultMessageObj.pictureTextMessage.mainMessage.coverPicture
    const { TabPane } = Tabs
    return (<div id='messagePush' className='messagePush'>
      <div className='title'>消息推送</div>
      <div className='sub-title'>定期挑选银行精选优质的内容/活动推送至企业员工，既能体现银行对企业员工的优质服务，也能增加员工与银行的互动。</div>
      <Tabs defaultActiveKey={type} className='tabs' onChange={this.callback}>
        <TabPane tab="图文推送" key="1">
          <Spin spinning={loading}>
            <div className='sub-title'>通过企业微信给员工推送专属福利内容，在推送前建议准备好相关资料。<Button type="link" onClick={() => this.setState({ showExample: true })}>推送示例</Button></div>
            <Button type="primary" onClick={() => this.addPush(1)}>新建推送</Button>
            {
              waitPushList.map((ele, idx) => {
                return (<div className='opera-list' key={ele.messageId}>
                  <div>
                    {
                      ele.messageType === 1 && <img src={ele.pictureTextMessage.mainMessage.coverPicture} />
                    }
                    {
                      ele.messageType === 3 && <img src={ele.pictureMessage} />
                    }
                    {
                      ele.messageType === 3 && <div className='content-text'></div>
                    }
                    {
                      ele.messageType === 1 && <div className='content-text'>
                        <p>{ele.pictureTextMessage.mainMessage.title}</p>
                        <p>{ele.pictureTextMessage.mainMessage.summary}</p>
                      </div>
                    }
                    {
                      ele.messageType === 2 && <div className='content-text'>
                        <p>{ele.textMessage}</p>
                      </div>
                    }
                    {
                      ele.sendType === 2 && <p className='qunfa'>定时群发：{new Date(ele.sendTime).format('MM-dd hh:mm')}</p>
                    }
                    <div className='opera-btn'>
                      <Button type="danger" onClick={() => this.cancelPush(ele.messageId)}>取消</Button>
                    </div>
                  </div>
                  <div className='opera-list-total'>共&nbsp;<span className='number'>
                    {
                      ele.messageType === 1 && (ele.pictureTextMessage.deputyMessages ? ele.pictureTextMessage.deputyMessages.length : 0) + 1
                    }
                    {
                      (ele.messageType === 2 || ele.messageType === 3) ? 1 : null
                    }
                  </span>&nbsp;篇群发信息</div>
                </div>)
              })
            }
          </Spin>
        </TabPane>
        <TabPane tab="推送记录" key="2" >
          <Table
            rowKey={'id'}
            columns={columns}
            dataSource={tableData}
            pagination={pagination}
            loading={loading}
            onChange={this.handleTableChange}
            locale={{emptyText: '暂无数据'}}
          />
        </TabPane>
        <TabPane tab="默认推送配置" key="3">
          <Spin spinning={loading}>
            <div className='sub-title'>用户首次关注应用，系统将自动发送默认消息推送。</div>
            {
              defaultMessageListLength ? <Button type="dashed" disabled={true}>已配置默认推送</Button> : <Button type="primary" onClick={() => this.addPush(3)}>新建默认推送</Button>
            }
            {
              defaultMessageListLength && <div className='opera-list'>
                <div>
                  {
                    defaultMessageObj.messageType === 1 && <img src={defaultMessageObj.pictureTextMessage.mainMessage.coverPicture} />
                  }
                  {
                    defaultMessageObj.messageType === 3 && <img src={defaultMessageObj.pictureMessage} />
                  }
                  {
                    defaultMessageObj.messageType === 3 && <div className='content-text'></div>
                  }
                  {
                    defaultMessageObj.messageType === 1 && <div className='content-text'>
                      <p>{defaultMessageObj.pictureTextMessage.mainMessage.title}</p>
                      <p>{defaultMessageObj.pictureTextMessage.mainMessage.summary}</p>
                    </div>
                  }
                  {
                    defaultMessageObj.messageType === 2 && <div className='content-text'>
                      <p>{defaultMessageObj.textMessage}</p>
                    </div>
                  }
                  <div className='opera-btn'>
                    <Button style={{marginRight: 20}} type="primary" onClick={() => this.editPush(3, defaultMessageObj.messageId)}>编辑</Button>
                    <Button type="danger" onClick={() => this.delPush(defaultMessageObj.messageId)}>删除</Button>
                  </div>
                </div>
                <div className='opera-list-total'>共&nbsp;<span className='number'>
                  {
                    defaultMessageObj.messageType === 1 && defaultMessageObj.pictureTextMessage.deputyMessages.length + 1
                  }
                  {
                    (defaultMessageObj.messageType === 2 || defaultMessageObj.messageType === 3) ? 1 : null
                  }
                </span>&nbsp;篇群发信息</div>
              </div>
            }
          </Spin>
        </TabPane>
      </Tabs>
      <Modal
        wrapClassName={'messagePush'}
        title={'图文消息示例'}
        width={700}
        maskClosable={false}
        visible={showExample}
        footer={null}
        onCancel={() => this.setState({ showExample: false })}
      >
        <div className='demo-box'>
          <img src={require('@src/assets/messagePush3.png')} />
          <img src={require('@src/assets/messagePush.png')} />
          <img src={require('@src/assets/messagePush2.png')} />
        </div>
      </Modal>
    </div>)
  }
}
