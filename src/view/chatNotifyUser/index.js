import React, { Component } from 'react'
import { Button, Select, message } from 'antd'
import StaffSelectModal from '@src/view/base/staffSelectModal'
import './index.less'
import axios from '@src/utils/axios'
import urls from '@src/config'
import utils from '@src/utils'

export default class ChatNotifyUser extends Component {
  constructor (props) {
    super(props)
    this.state = {
      // isShowStaffSelectModal: false,
      // selectedStaff: [{
      //   title: '一人',
      //   key: 11
      // }, {
      //   title: '二狗',
      //   key: 12
      // }],
      staffIds: [],
      staffList: []
    }
  }

  // // 打开StaffSelectModal
  // showStaffSelectModal = () => {
  //   this.setState({ isShowStaffSelectModal: true })
  // }
  // // StaffSelectModal确定
  // staffSelectOk = (checkedNodes) => {
  //   if (checkedNodes.length < 3) {
  //     return message.error('至少需选择3位通知人员')
  //   } else {
  //     this.setState({
  //       isShowStaffSelectModal: false,
  //       selectedStaff: checkedNodes
  //     })
  //   }
  // }
  // // StaffSelectModal取消
  // staffSelectCancel = () => {
  //   this.setState({ isShowStaffSelectModal: false })
  // }

  // 进入页面
  componentDidMount () {
    axios.get(urls.getListNotifyUser).then(res => {
      const staffList = res.retdata || []
      this.setState({
        staffList,
        staffIds: staffList.map(obj => obj.staffId)
      })
    })
  }
  // 选择成员
  changeStaff = (value) => {
    this.setState({ staffIds: value })
  }
  // 远程搜索成员
  searchStaff = (value) => {
    this.debounce(value)
  }
  // debounce闭包 必须先写好 然后在searchStaff触发
  debounce = utils.debounce((value) => this.getStaffList(value), 300)
  getStaffList = (value) => {
    const key = value.trim()
    if (!key) {
      this.setState({ staffList: [] })
    } else {
      axios.post(urls.userList, { name: key }).then(res => {
        const staffList = res.retdata.userList.map(obj => {
          return { ...obj, staffId: obj.id }
        })
        this.setState({ staffList })
      })
    }
  }
  // 提交
  submit = () => {
    const { staffIds } = this.state
    if (staffIds.length < 3) {
      return message.error('至少需选择3位通知人员')
    }
    axios.post(urls.changeNotifyUser, { staffIds: staffIds.join(',') }).then(res => {
      if (res.ret === 0) {
        message.success('保存成功')
      }
    })
  }

  render () {
    const { isShowStaffSelectModal, selectedStaff, staffIds, staffList } = this.state
    return (
      <div className={'chatNotifyUser'}>
        <div className={'title'}>设置通知人员</div>
        <div className={'content'}>
          <div className={'p1'}>设置员工"查询聊天记录"时需通知的监督人员</div>
          <div className={'p2'}>搜索通知人员输入框，设置后，当有员工查询聊天记录时，会通知到已设置的监督人员，至少需设置3位监督人员</div>
          {/* 弹窗选择员工 暂时不做 用下面的搜索select */}
          {/* <div className={'staffSelectArea'}>
            <span>通知人员：</span>
            <span>
              {selectedStaff.map(obj => {
                return <Tag color="green" key={obj.key}>{obj.title}</Tag>
              })}
            </span>
            <span className={'addIcon'} onClick={this.showStaffSelectModal}>
              <Icon type="plus" /><span>添加人员</span>
            </span>
            <StaffSelectModal
              visible={isShowStaffSelectModal}
              selectedStaff={selectedStaff}
              onOk={this.staffSelectOk}
              onCancel={this.staffSelectCancel}
            ></StaffSelectModal>
          </div> */}
          <div className={'p3'}>
            <div>通知人员： </div>
            <div className={'selectSearchArea'}>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="搜索选择通知人员"
                value={staffIds}
                onChange={this.changeStaff}
                onSearch={this.searchStaff}
                showSearch
                defaultActiveFirstOption={false}
                showArrow={false}
                filterOption={false}
              >
                {staffList.map(obj => {
                  return <Select.Option
                    title={`${obj.name} - ${obj.department}`}
                    name={obj.name} key={obj.staffId} value={obj.staffId}>
                    {obj.name} - {obj.department}
                  </Select.Option>
                })}
              </Select>
              <div className={'info'}>{staffIds.length < 3 ? '*至少需要设置3个通知人员' : ''}</div>
            </div>
          </div>
          <div className={'p4'}>
            <Button type="primary" onClick={this.submit} disabled={staffIds.length < 3}>保存</Button>
          </div>
        </div>
      </div>
    )
  }
}
