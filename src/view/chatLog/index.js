import React, { Component } from 'react'
import { Button, Input, Radio, DatePicker, Icon, Tree, Tag, Tooltip, Modal, Pagination, message, Spin } from 'antd'
import styles from './index.less'
import axios from '@src/utils/axios'
import urls from '@src/config'
import moment from 'moment'

class ChatLog extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      filterDateRange: [null, null],
      filterKey: '',
      filterStaff: '',
      filterChatType: 0,
      filterPersonType: 'staff',
      selectedTargetPersonKey: '',
      isSelectedGroupChat: false,
      pagination: {
        pageNum: 1,
        total: 0,
        pageSize: 10
      },
      // 员工列表
      listMembers: [],
      // 选中的员工
      activeMember: '',
      activeMemberName: '他',
      // 聊天对象树
      treeData: [],
      // 群列表
      listGroups: [],
      // 选中的群
      activeGroup: '',
      activeGroupName: '',
      chatList: undefined,
      isChatListLoading: false,
      visibleModal: false,
      modalTitle: null,
      modalContent: null,
      modalFooter: null
    }
  }

  // 进来页面 弹modal
  componentDidMount () {
    axios.get(urls.notifyUserStatus).then(res => {
      const { notifyStatus, notifyUsers } = res.retdata
      this.showModal(notifyStatus, notifyUsers)
    })
  }
  // 不同情况对应不同的modal
  showModal = (status, notifyUsers) => {
    let modalTitle = null
    let modalContent = null
    let modalFooter = null
    let visibleModal = false
    if (status === 0) {
      // 已设置通知监督人员 未发送通知
      modalTitle = '确定查看聊天记录吗？'
      modalContent = '如果选择确定，将会给以下人员发送通知：' + notifyUsers
      modalFooter = <span>
        <Button key="ok" type="primary" onClick={this.handleOk}>确定</Button>
        <Button key="cancel" onClick={this.handleCancel}>取消</Button>
      </span>
      visibleModal = true
    } else if (status === 2) {
      // 未设置通知监督人员 有权限设置
      modalTitle = '请先设置查询聊天记录时需通知的监督人员。'
      modalContent = '为保证内部聊天记录安全，查询聊天记录时会发送通知给相应的监督人员。'
      modalFooter = <span>
        <Button key="ok" type="primary" onClick={this.toChatNotifyUser}>立即设置</Button>
        <Button key="cancel" onClick={this.handleCancel}>取消</Button>
      </span>
      visibleModal = true
    } else if (status === 3) {
      // 未设置通知监督人员 无权限设置
      modalTitle = '管理员还未设置查询聊天记录时需通知的监督人员。'
      modalContent = '为保证内部聊天记录安全，查询聊天记录时会发送通知给相应的监督人员。请告知贵企的管理员尽快设置。'
      modalFooter = <span>
        <Button key="cancel" onClick={this.handleCancel}>我知道了</Button>
      </span>
      visibleModal = true
    } else {
      // 已设置通知监督人员 已发送通知
      this.getInitData()
      visibleModal = false
    }
    this.setState({
      modalTitle,
      modalContent,
      modalFooter,
      visibleModal
    })
  }
  // modal确定
  handleOk = () => {
    this.notifyUserSendMsg()
    this.getInitData()
    this.setState({ visibleModal: false })
  }
  // modal取消
  handleCancel = () => {
    this.props.history.push('/')
  }
  // 跳转到设置通知人员
  toChatNotifyUser = () => {
    this.props.history.push('/chatNotifyUser')
  }
  // 发送小程序消息提醒
  notifyUserSendMsg = () => {
    axios.post(urls.notifyUserSendMsg)
  }
  // 获取初始页面
  getInitData = () => {
    // 时间范围默认最近30天
    const last = new Date().getTime() - 3600 * 1000 * 24 * 30
    const now = new Date().getTime()
    this.setState({ filterDateRange: [moment(last), moment(now)] }, () => {
      this.getListMembers({first: 1}).then(() => {
        this.getListPartners(this.state.activeMember).then(() => {
          this.fetchChat()
        })
      })
      this.getListGroups({first: 1})
    })
  }
  // 获取员工列表(第一栏)
  getListMembers = (obj) => {
    // first、search参数为了后端记录日志的特殊处理
    // 第一次进页面 first 1
    // 任何时候点查询 search 1
    const first = (obj && obj.first) ? obj.first : ''
    const search = (obj && obj.search) ? obj.search : ''
    const { filterDateRange, filterKey, filterStaff } = this.state
    const data = {
      fromDate: filterDateRange[0] ? filterDateRange[0].format('YYYY-MM-DD') : '',
      toDate: filterDateRange[1] ? filterDateRange[1].format('YYYY-MM-DD') : '',
      key: filterKey,
      staffKey: filterStaff,
      first,
      search
    }
    this.setState({ isChatListLoading: true })
    return axios.post(urls.getListMembers, data).then(res => {
      this.setState({
        listMembers: res.retdata || [],
        activeMember: res.retdata[0] ? res.retdata[0].staffId : '',
        activeMemberName: res.retdata[0] ? res.retdata[0].staffName : '他'
      })
    })
  }
  // 获取群列表(第一栏)
  getListGroups = (obj) => {
    const first = (obj && obj.first) ? obj.first : ''
    const search = (obj && obj.search) ? obj.search : ''
    const { filterDateRange, filterKey, filterStaff } = this.state
    const data = {
      fromDate: filterDateRange[0] ? filterDateRange[0].format('YYYY-MM-DD') : '',
      toDate: filterDateRange[1] ? filterDateRange[1].format('YYYY-MM-DD') : '',
      key: filterKey,
      staffKey: filterStaff,
      first,
      search
    }
    this.setState({ isChatListLoading: true })
    return axios.post(urls.getListGroups, data).then(res => {
      this.setState({
        listGroups: res.retdata || [],
        activeGroup: res.retdata[0] ? res.retdata[0].roomId : '',
        activeGroupName: res.retdata[0] ? `${res.retdata[0].name}等${res.retdata[0].userSize}人的群聊` : ''
      })
    })
  }
  // 切换员工(第一栏)
  onChangeMembers = (obj) => {
    this.setState({ activeMember: obj.staffId, activeMemberName: obj.staffName }, () => {
      this.getListPartners(this.state.activeMember).then(() => {
        this.fetchChat()
      })
    })
  }
  // 切换群聊(第一栏)
  onChangeGroups = (obj) => {
    this.setState({ activeGroup: obj.roomId, activeGroupName: `${obj.name}等${obj.userSize}人的群聊` }, () => {
      this.fetchChat()
    })
  }
  // 切换员工列表或者群聊列表(第一栏)
  onChangeFilterPersonType = e => {
    this.setState({ filterPersonType: e.target.value }, () => {
      const { filterPersonType } = this.state
      if (filterPersonType === 'staff') {
        this.getListMembers().then(() => {
          this.getListPartners(this.state.activeMember).then(() => {
            this.fetchChat()
          })
        })
      } else {
        this.getListGroups().then(() => {
          this.fetchChat()
        })
      }
    })
  };
  // 获取聊天对象树(第二栏)
  getListPartners = (activeMember) => {
    const { filterDateRange, filterKey } = this.state
    if (!activeMember) {
      this.setState({
        treeData: [
          {
            key: '1',
            title: `私聊（0）`,
            children: []
          },
          {
            key: '2',
            title: `群聊（0）`,
            children: []
          }
        ]
      })
      this.setState({ isChatListLoading: false })
      return new Promise((resolve, reject) => {
        resolve()
      })
    }
    const data = {
      fromDate: filterDateRange[0] ? filterDateRange[0].format('YYYY-MM-DD') : '',
      toDate: filterDateRange[1] ? filterDateRange[1].format('YYYY-MM-DD') : '',
      key: filterKey,
      staffId: activeMember
    }
    this.setState({ isChatListLoading: true })
    return axios.post(urls.getListPartners, data).then(res => {
      const { privateMemberList, groupMemberList } = res.retdata
      this.setState({
        treeData: [
          {
            key: '1',
            title: `私聊（${privateMemberList.length}）`,
            children: privateMemberList.map(obj => {
              return {
                key: obj.caizhiUserid || obj.userId,
                title: obj.name || obj.caizhiUserid || obj.userId,
                avatar: obj.avatar,
                agreeAuth: obj.agreeAuth !== 0,
                isGroupChat: false
              }
            })
          },
          {
            key: '2',
            title: `群聊（${groupMemberList.length}）`,
            children: groupMemberList.map(obj => {
              return {
                key: obj.roomId,
                title: `${obj.name}等${obj.userSize}人的群聊`,
                avatar: obj.avatar,
                agreeAuth: true,
                isGroupChat: true
              }
            })
          }
        ],
        // 默认选中私聊树 第一个
        selectedTargetPersonKey: privateMemberList[0]
          ? (privateMemberList[0]['caizhiUserid'] || privateMemberList[0]['userId'])
          : '',
        isSelectedGroupChatPerson: false
      })
    })
  }
  // 递归渲染聊天对象树(第二栏)
  renderTreeNodes = data => data.map((item) => {
    const defaultAvatar = 'https://www.qtrade.com.cn/caizhi_img/default/avatar.png'
    const myTitle = <span className={'myTitle'}>
      <img className={'avatar'} src={item.avatar || defaultAvatar} alt=""/>
      <span className={'title'}>{item.title}</span>
      {/* <span className={'title'}>{item.key}</span> */}
      {item.agreeAuth ? null : <span className={'tag'} ><Tooltip title="如果未授权，他的聊天记录无法获取"><Tag color="magenta">未授权</Tag></Tooltip></span>}
    </span>
    if (item.children) {
      return (
        <Tree.TreeNode title={item.title} key={item.key} dataRef={item} selectable={false}>
          {this.renderTreeNodes(item.children)}
        </Tree.TreeNode>
      )
    }
    return <Tree.TreeNode title={myTitle} key={item.key} dataRef={item}></Tree.TreeNode>
  })
  // 点击聊天对象树(第二栏)的树节点
  onClickTargetPerson = (selectedKeys, {selected, selectedNodes, node, event}) => {
    // 点击当前已选中的节点时 selectedKeys[0]是undefine 此时不setState selectedTargetPersonKey 从而继续保持此节点选中
    const dataRef = selectedNodes[0].props.dataRef || {}
    if (selectedKeys[0]) {
      this.setState({
        selectedTargetPersonKey: selectedKeys[0],
        isSelectedGroupChatPerson: dataRef.isGroupChat,
        activeGroupName: dataRef.isGroupChat ? dataRef.title : ''
      }, () => {
        this.fetchChat()
      })
    }
  }
  // 时间范围
  onChangeDate = (date, dateString) => {
    this.setState({ filterDateRange: date })
  }
  // 限制字符输入位数
  sliceStr = (str, length) => {
    return (str.length > length) ? str.substring(0, length) : str
  }
  // 关键词
  handleChangeKey = (ev) => {
    this.setState({ filterKey: this.sliceStr(ev.target.value, 20) })
  }
  // 员工
  handleChangeStaff = (ev) => {
    this.setState({ filterStaff: this.sliceStr(ev.target.value, 20) })
  }
  // 查询
  search = () => {
    const { filterDateRange, filterPersonType } = this.state
    const day = (filterDateRange[1].format('X') - filterDateRange[0].format('X')) / (3600 * 24)
    if (day > 180) {
      return message.error('时间范围不能超过半年')
    }
    if (filterPersonType === 'staff') {
      this.getListMembers({search: 1}).then(() => {
        this.getListPartners(this.state.activeMember).then(() => {
          this.fetchChat()
        })
      })
    } else {
      this.getListGroups({search: 1}).then(() => {
        this.fetchChat()
      })
    }
  }
  // 重置
  reset = () => {
    window.location.reload()
  }
  // 筛选聊天记录类型
  onChangeFilterChatType = e => {
    this.setState({
      filterChatType: e.target.value
    }, () => {
      this.fetchChat()
    })
  };
  // 聊天记录翻页
  onChangePage = (page, pageSize) => {
    this.setState({
      pagination: { ...this.state.pagination, pageNum: page }
    }, () => {
      this.fetchChat(true)
    })
  }
  // 获取聊天记录
  fetchChat = (isChangePage) => {
    const { filterDateRange, filterKey, filterStaff, filterChatType, filterPersonType, selectedTargetPersonKey,
      pagination, activeMember, activeGroup, isSelectedGroupChatPerson, activeGroupName } = this.state
    const fromDate = filterDateRange[0] ? filterDateRange[0].format('YYYY-MM-DD') : ''
    const toDate = filterDateRange[1] ? filterDateRange[1].format('YYYY-MM-DD') : ''
    // 第一栏选择的群聊或者第二栏聊天对象选择了群聊 都认为是群聊
    const isGroupChat = (filterPersonType === 'group') || isSelectedGroupChatPerson
    const staffId = isGroupChat ? '' : (activeMember || '')
    const chatPartner = isGroupChat ? '' : selectedTargetPersonKey
    // 第一栏选择的群聊那roomId是activeGroup 第二栏聊天对象选择了群聊那roomId是selectedTargetPersonKey
    const roomId = isGroupChat ? ((filterPersonType === 'group') ? (activeGroup || '') : selectedTargetPersonKey) : ''
    const roomName = isGroupChat ? activeGroupName : ''
    const chatRecordsType = isGroupChat ? 'GROUP_CHAT' : 'PRIVATE_CHAT'
    // 群聊没有roomId 私聊没有staffId或者chatPartner 不请求
    if ((isGroupChat && !roomId) || (!isGroupChat && (!staffId || !chatPartner))) {
      this.setState({
        pagination: { ...pagination, total: 0 },
        chatList: [],
        isChatListLoading: false
      })
      return
    }
    // 除了翻页 其他任何动作触发的请求数据都请求第一页
    if (!isChangePage) {
      pagination.pageNum = 1
    }
    const data = {
      // 日期
      fromDate,
      toDate,
      // 关键词
      key: filterKey,
      // 员工
      staffKey: filterStaff,
      // 私聊者
      staffId,
      // 私聊对象
      chatPartner,
      // 群
      roomId,
      // 群名称
      roomName,
      // 群还是私聊
      chatRecordsType,
      // 聊天记录类型
      msgType: filterChatType,
      pageSize: pagination.pageSize,
      pageNum: pagination.pageNum
    }
    this.setState({ isChatListLoading: true })
    axios.post(urls.getListRecords, data).then(res => {
      this.setState({
        pagination: {
          ...pagination,
          total: res.retdata ? res.retdata.total : 0
        },
        chatList: res.retdata ? res.retdata.msgList : [],
        isChatListLoading: false
      })
    })
  }
  // 下载
  download = () => {
    const { filterDateRange, filterKey, filterStaff, filterChatType, filterPersonType, selectedTargetPersonKey,
      activeMember, activeGroup, isSelectedGroupChatPerson } = this.state
    const fromDate = filterDateRange[0] ? filterDateRange[0].format('YYYY-MM-DD') : ''
    const toDate = filterDateRange[1] ? filterDateRange[1].format('YYYY-MM-DD') : ''
    const isGroupChat = (filterPersonType === 'group') || isSelectedGroupChatPerson
    const staffId = isGroupChat ? '' : (activeMember || '')
    const chatPartner = isGroupChat ? '' : selectedTargetPersonKey
    const roomId = isGroupChat ? ((filterPersonType === 'group') ? (activeGroup || '') : selectedTargetPersonKey) : ''
    const chatRecordsType = isGroupChat ? 'GROUP_CHAT' : 'PRIVATE_CHAT'
    window.location.href = `${urls.exportChatmsg}?fromDate=${fromDate}&toDate=${toDate}&key=${encodeURIComponent(filterKey)}&staffKey=${encodeURIComponent(filterStaff)}&staffId=${staffId}&chatPartner=${chatPartner}&roomId=${roomId}&chatRecordsType=${chatRecordsType}&msgType=${filterChatType}`
  }
  // 聊天记录展现
  getChatMsg = (chatObj) => {
    const { type, details } = chatObj
    if (type === 12) {
      // 聊天记录消息
      return <div className={'chatRecords'}>
        {details.map((obj) => {
          return (
            <div className={'chatItem'} key={obj.detailId}>
              <div className={'chatItemTop'}>
                <span className={'name'}>{obj.title}</span>
                <span className={'date'}>{moment(obj.recordTime).format('YYYY-MM-DD HH:mm:ss')}</span>
              </div>
              <div className={'chatItemBottom'} style={{marginLeft: '0px'}}>{this.formatChatMsg(obj.secType, obj, chatObj)}</div>
            </div>
          )
        })}
        <div style={{padding: '20px'}}>聊天记录消息</div>
      </div>
    } else {
      return this.formatChatMsg(type, (details[0] || {}), chatObj)
    }
  }
  // 聊天记录展现
  // 测试数据 私聊staffId: 1a1072a812ea4a769389a46502f4e53d 群聊roomId: 064b2350600e4ceb89fc5d62e95b434b
  formatChatMsg = (type, msgObj, chatObj) => {
    switch (type) {
      case 1:
        // 文字
        return <div>{msgObj['content']}</div>
      case 2:
        // 图片
        return <div>
          {msgObj['fileUrl'] ? <span>
            <img src={msgObj['fileUrl']} className={'chatImg'}></img>
            <a href={msgObj['fileUrl']} target={'_blank'}><Icon type="download" className={'downloadIcon'} /></a>
          </span> : '图片同步中，暂不能查看'}
        </div>
      case 4:
        // 语音
        return <div className={'chatMsgArea'}>
          <span>【音频文件】</span>
          {msgObj['fileUrl'] ? <a href={msgObj['fileUrl']}><Icon type="download" className={'downloadIcon'} /></a> : '同步中，暂不能下载'}
        </div>
      case 5:
        // 视频
        return <div className={'chatMsgArea'}>
          <span>【视频文件 {msgObj['playLength']}秒】</span>
          {msgObj['fileUrl'] ? <a href={msgObj['fileUrl']}><Icon type="download" className={'downloadIcon'} /></a> : '同步中，暂不能下载'}
        </div>
      case 6:
        // 名片 corpName cardUserId
        return <div className={'chatMsgArea'}>
          <div className={'chatMsg'}>
            <div className={'content'}>{msgObj['corpName']}</div>
            <div className={'content f18'}>{msgObj['cardUserId']}</div>
            <div className={'bottom'}>名片消息</div>
          </div>
        </div>
      case 7:
        return <div className={'chatMsgArea'}>
          <div className={'chatMsg'}>
            <div className={'content f18'}>{msgObj['title']}</div>
            <div className={'content'}>位置：{msgObj['address']}</div>
            <div className={'content'}>经度：{msgObj['longitude']}</div>
            <div className={'content'}>纬度：{msgObj['latitude']}</div>
            <div className={'bottom'}>位置消息</div>
          </div>
        </div>
      case 8:
        // 表情
        return <div>
          {msgObj['fileUrl'] ? <img src={msgObj['fileUrl']} width={'100px'}></img> : '表情同步中，暂不能查看'}
        </div>
      case 9:
        return <div className={'chatMsgArea'}>
          <div className={'chatMsg'}>
            <div className={'content f18'}>{msgObj['fileName']}</div>
            <div className={'bottom'}>文件消息</div>
          </div>
          {msgObj['fileUrl'] ? <a href={msgObj['fileUrl']}><Icon type="download" className={'downloadIcon'} /></a> : '同步中，暂不能下载'}
        </div>
      case 10:
        return <div className={'chatMsgArea'}>
          <div className={'chatMsg'}>
            <div className={'content f18'}>{msgObj['title']}</div>
            <div className={'content'}>{msgObj['linkUrl']}</div>
            <div className={'bottom'}>链接消息</div>
          </div>
        </div>
      case 11:
        return <div className={'chatMsgArea'}>
          <div className={'chatMsg'}>
            <div className={'content f18'}>{msgObj['displayName']}</div>
            <div className={'content'}>{msgObj['title']}</div>
            <div className={'bottom'}>小程序消息</div>
          </div>
        </div>
      case 12:
        // 聊天记录消息 getChatMsg中处理
        return <div></div>
      case 13:
        return <div className={'chatMsgArea'}>
          <div className={'chatMsg'}>
            <div className={'content f18'}>{msgObj['title']}</div>
            <div className={'content'}>{msgObj['content']}</div>
            <div className={'bottom'}>代办消息</div>
          </div>
        </div>
      case 14:
        return <div className={'chatMsgArea'}>
          <div className={'chatMsg'}>
            <div className={'content f18'}>{msgObj['title']}</div>
            <div className={'content'}>{msgObj['secType'] === 101 ? '发起投票' : '参与投票'}</div>
            <div className={'content'}>投票选项：{msgObj['voteItem']}</div>
            <div className={'bottom'}>投票消息</div>
          </div>
        </div>
      case 15:
        const redPaperDict = {
          1: '普通红包',
          2: '拼手气群红包',
          3: '激励群红包'
        }
        return <div className={'chatMsgArea'}>
          <div className={'chatMsg'}>
            <div className={'content f18'}>{msgObj['title']}</div>
            <div className={'content'}>{redPaperDict[msgObj['secType']]}</div>
            <div className={'content'}>总个数：{msgObj['totalCnt']}</div>
            <div className={'content'}>总金额：{msgObj['totalAmount']}</div>
            <div className={'bottom'}>红包消息</div>
          </div>
        </div>
      case 16:
        const meetingDict = {
          1: '参加会议',
          2: '拒绝会议',
          3: '待定'
        }
        const meetingStartTime = moment(msgObj['meetingStartTime'] * 1000).format('YYYY-MM-DD HH:mm:ss')
        const meetingEndTime = moment(msgObj['meetingEndTime'] * 1000).format('YYYY-MM-DD HH:mm:ss')
        return <div className={'chatMsgArea'}>
          <div className={'chatMsg'}>
            <div className={'content f18'}>{msgObj['title']}</div>
            <div className={'content'}>{meetingStartTime} - {meetingEndTime}</div>
            <div className={'content'}>会议地址：{msgObj['address']}</div>
            <div className={'content'}>会议备注：{msgObj['remarks']}</div>
            {msgObj['secType'] === 102 ? <div className={'content'}>会议邀请处理状态：{meetingDict[msgObj['meetingStatus']]}</div> : null}
            <div className={'bottom'}>会议邀请消息</div>
          </div>
        </div>
      case 3:
        return <div className={'chatMsgArea'}>
          <div className={'chatMsg'}>
            <div className={'content f18'}>{chatObj['fromName'] || chatObj['from']}同意</div>
            <div className={'content'}>{moment(msgObj['agreeTime']).format('YYYY-MM-DD HH:mm:ss')}</div>
            <div className={'bottom'}>同意存档消息</div>
          </div>
        </div>
      default:
        return <div>[该消息类型暂不能展示]</div>
    }
  }

  render () {
    const { listMembers, activeMember, activeMemberName, listGroups, activeGroup,
      chatList, isChatListLoading, filterDateRange, filterKey, filterStaff, filterChatType, filterPersonType,
      treeData, selectedTargetPersonKey, visibleModal, modalTitle, modalContent, modalFooter } = this.state
    const { pageNum, total, pageSize } = this.state.pagination
    const defaultAvatar = 'https://www.qtrade.com.cn/caizhi_img/default/avatar.png'
    return (
      <div className="chatLog">
        <div className={'header'}>
          <span className={'left'}>
            <span className={'leftItem'}>
              日期：<DatePicker.RangePicker style={{ width: 300 }} allowClear={false}
                value={filterDateRange} onChange={this.onChangeDate} />
            </span>
            <span className={'leftItem'}>
              关键词：<Input style={{ width: 150 }} value={filterKey} onChange={this.handleChangeKey} />
            </span>
            <span className={'leftItem'}>
              员工：<Input style={{ width: 150 }} value={filterStaff} onChange={this.handleChangeStaff} />
            </span>
            <span className={'leftItem'}>
              <Button type="primary" onClick={this.search}>查询</Button>
            </span>
            <span className={'leftItem'}>
              <Button type="primary" onClick={this.reset}>重置</Button>
            </span>
          </span>
        </div>
        <Spin spinning={isChatListLoading}>
          <div className={'content'}>
            <div className={'contentLeft'}>
              <div className={'contentLeftTitle'}>选择员工/群聊</div>
              <div className={'filterPersonType'}>
                <Radio.Group value={filterPersonType} onChange={this.onChangeFilterPersonType} size="small" buttonStyle="solid">
                  <Radio.Button value="staff">员工</Radio.Button>
                  <Radio.Button value="group">群聊</Radio.Button>
                </Radio.Group>
              </div>
              <div className={'personWrap'}>
                <ul className={'person'}>
                  {filterPersonType === 'staff'
                    ? listMembers.map(obj => {
                      return <li className={obj.staffId === activeMember ? 'personActive personItem' : 'personItem'}
                        key={obj.staffId} onClick={() => this.onChangeMembers(obj)}>
                        <img className={'avatar'} src={obj.staffavatar || defaultAvatar} alt=""/>
                        {/* <span className={'personName'}>{obj.staffId}</span> */}
                        <span className={'personName'}>{obj.staffName}</span>
                      </li>
                    })
                    : listGroups.map(obj => {
                      return <li className={obj.roomId === activeGroup ? 'personActive personItem' : 'personItem'}
                        key={obj.roomId} onClick={() => this.onChangeGroups(obj)}>
                        <img className={'avatar'} src={obj.avatar || defaultAvatar} alt=""/>
                        {/* <span className={'personName'}>{`${obj.roomId}等${obj.userSize}人的群聊`}</span> */}
                        <span className={'personName'}>{`${obj.name}等${obj.userSize}人的群聊`}</span>
                      </li>
                    })}
                </ul>
              </div>
            </div>
            {filterPersonType === 'staff' ? <div className={'contentMiddle'}>
              <div className={'contentLeftTitle'}>{activeMemberName}的所有聊天对象</div>
              <div className={'targetPersonWrap'}>
                <div className={'targetPerson'}>
                  {treeData.length ? <Tree
                    defaultExpandedKeys={['1']}
                    onSelect={this.onClickTargetPerson}
                    selectedKeys={[selectedTargetPersonKey]}
                  >
                    {this.renderTreeNodes(treeData)}
                  </Tree> : null}
                </div>
              </div>
            </div> : null}
            <div className={'contentRight'}>
              <div className={'contentRightTitle'}>
                <span style={{lineHeight: '24px'}}>聊天记录</span>
                <span className={'filterChatType'}>
                  <Radio.Group value={filterChatType} onChange={this.onChangeFilterChatType} size="small">
                    <Radio.Button value={0}>全部</Radio.Button>
                    <Radio.Button value={2}>图片</Radio.Button>
                    <Radio.Button value={9}>文件</Radio.Button>
                    <Radio.Button value={4}>语音</Radio.Button>
                  </Radio.Group>
                  {((filterChatType === 0) && chatList && chatList.length) ? <Button className={'download'} size={'small'} icon="download" type="primary" onClick={this.download}>下载</Button> : null}
                </span>
              </div>
              <div className={'chatList'}>
                {chatList ? (chatList.length ? chatList.map(obj => {
                  return <div className={'chatItem'} key={obj.msgId}>
                    <div className={'chatItemTop'}>
                      <img className={'avatar'} src={obj.fromAvatar || defaultAvatar} alt=""/>
                      <span className={'name'}>{obj.fromName || obj.from}</span>
                      <span className={'date'}>{moment(obj.msgtimestamp).format('YYYY-MM-DD HH:mm:ss')}</span>
                    </div>
                    <div className={'chatItemBottom'}>{this.getChatMsg(obj)}</div>
                  </div>
                }) : <div className={'noDataArea'}>
                  <div className={'noDataIcon'}><Icon type="info-circle" /></div>
                  <div className={'noDataInfo'}>暂无聊天记录</div>
                </div>) : null}
              </div>
              <div className={'pagination'}>
                <Pagination
                  size="small"
                  showQuickJumper={Boolean(total)}
                  current={pageNum}
                  total={total}
                  onChange={this.onChangePage}
                  showTotal={total => `共 ${total}条记录`}
                  pageSize={pageSize}
                />
              </div>
            </div>
          </div>
        </Spin>
        <Modal
          visible={visibleModal}
          title="查看聊天记录的通知"
          wrapClassName={'chatLogModalTitle'}
          onCancel={this.handleCancel}
          closable={false}
          footer={modalFooter}
        >
          <p className={'titleArea'}>
            <Icon type="exclamation-circle" className={'icon'} />
            <span className={'title'}>{modalTitle}</span>
          </p>
          <p className={'contentArea'}>{modalContent}</p>
        </Modal>
      </div>
    )
  }
}

export default ChatLog
