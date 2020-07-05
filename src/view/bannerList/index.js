import React, { Component } from 'react'
import { Button, Table, message, Modal, Icon } from 'antd'
import './index.less'
import axios from '@src/utils/axios'
import urls from '@src/config'
import RoleButton from '@src/components/roleButton'
import DeptTreeSelect from '@src/components/DeptTreeSelect'

export default class BannerList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tableData: null,
      isLoading: true,
      chargeDept: [],
      showPushModal: false,
      confirmLoading: false
    }
  }

  componentDidMount() {
    this.getBannerList()
  }

  // 加载列表
  getBannerList = () => {
    this.setState({ isLoading: true })
    axios.post(urls.bannerList, { pageNum: 1, pageSize: 100 }).then((res) => {
      this.setState({ tableData: res.retdata.list, isLoading: false })
    })
  }

  // 上移下移
  updateSeq = (direction, record) => {
    axios
      .post(urls.bannerUpdateSeq, { bannerId: record.bannerId, direction })
      .then((res) => {
        this.getBannerList()
      })
  }

  // 删除
  delete = (record) => {
    axios.post(urls.bannerDelete, { bannerId: record.bannerId }).then((res) => {
      message.success('删除成功')
      this.getBannerList()
    })
  }

  beforeDel = (record) => {
    Modal.confirm({
      title: '确定删除？',
      content: '',
      onOk: () => {
        this.delete(record)
      }
    })
  }

  handleAdd = () => {
    this.props.history.push('/bannerAdd')
  }

  handleEdit = (record) => {
    this.props.history.push({
      pathname: '/bannerUpdate',
      search: `?id=${record.bannerId}`
    })
  }

  onChangeDept = (chargeDept) => this.setState({ chargeDept })

  closeCheckPushModal = () => {
    this.setState({
      showPushModal: false,
      confirmLoading: false
    })
  }

  checkPush = () => {
    const { chargeDept } = this.state
    if (!chargeDept.length) return message.info('请选择可见部门')
    axios.post(
      urls.bannerPushCheck,
      {
        activityId: this.currentRecord.bannerId,
        deptIdList: this.state.chargeDept
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }).then((res) => {
      this.pushActivity()
    }).catch(() => {
      this.currentRecord = null
      this.setState({ showPushModal: false, confirmLoading: false })
    })
  }

  beforePush = (record) => {
    this.currentRecord = record
    this.pullBannerDetail(record)
    this.setState({ showPushModal: true, chargeDept: [] })
  }

  pullBannerDetail = record => {
    axios.post(urls.bannerDetail, { bannerId: record.bannerId }).then(res => {
      const { deptList } = res.retdata.detail
      const deptIds = deptList.map(obj => obj.deptId)
      this.setState({
        chargeDept: deptIds
      })
    }).catch(() => {
      message.error('获取banner详情失败')
    })
  }

  pushActivity = () => {
    Modal.confirm({
      title: '确定？',
      content: '活动推送后，客户经理可前往企业微信-消息-营销助手查看及分享',
      onOk: () => {
        axios.post(
          urls.bannerPush,
          {
            activityId: this.currentRecord.bannerId,
            deptIdList: this.state.chargeDept
          },
          {
            headers: { 'Content-Type': 'application/json' }
          }).then((res) => {
          message.success('推送成功')
          this.setState({ showPushModal: false, confirmLoading: false })
        }).catch(() => {
          this.currentRecord = null
          this.setState({ showPushModal: false, confirmLoading: false })
        })
      },
      onCancel: () => {
        this.currentRecord = null
        this.setState({ showPushModal: false, confirmLoading: false })
      }
    })
  }

  render() {
    const columns = [
      {
        title: 'banner名称',
        dataIndex: 'bannerName'
      },
      {
        title: '跳转',
        dataIndex: 'relationTitle'
      },
      {
        title: 'banner图片',
        render: (text, record) => (
          <img src={record.bannerImgURL} width={'350'} />
        )
      },
      {
        title: '操作',
        width: 350,
        render: (text, record, index) => (
          <span className={'actionArea'}>
            <RoleButton
              isButton={false}
              pathname={pathname}
              className={'spanButton'}
              rolekey={'bannerEdit'}
              owner={record.owner}
              onClick={() => this.handleEdit(record)}
            >
              编辑
            </RoleButton>
            {index === 0 ? null
              : <RoleButton
                isButton={false}
                pathname={pathname}
                className={'spanButton'}
                rolekey={'bannerSort'}
                onClick={() => this.updateSeq(0, record)}
              >
              上移
              </RoleButton>
            }
            {index === (this.state.tableData.length - 1) ? null
              : <RoleButton
                isButton={false}
                pathname={pathname}
                className={'spanButton'}
                rolekey={'bannerSort'}
                onClick={() => this.updateSeq(1, record)}
              >
              下移
              </RoleButton>
            }
            <RoleButton
              isButton={false}
              pathname={pathname}
              className={'spanButton'}
              rolekey={'bannerPush'}
              onClick={() => this.beforePush(record)}
            >
              推送
            </RoleButton>
            <RoleButton
              isButton={false}
              pathname={pathname}
              className={'spanButtonDel'}
              rolekey={'bannerDel'}
              onClick={() => this.beforeDel(record)}
            >
              删除
            </RoleButton>
          </span>
        )
      }
    ]
    const {
      tableData,
      isLoading,
      showPushModal,
      confirmLoading,
      chargeDept
    } = this.state
    const { pathname } = this.props.location
    return (
      <div className={'bannerList'}>
        <div className={'title'}>小站banner配置</div>
        <div className={'content'}>
          <div className={'operationButtonView'}>
            <RoleButton
              type="primary"
              pathname={pathname}
              className={'addBtn'}
              rolekey={'bannerAdd'}
              onClick={this.handleAdd}
            >
              <Icon type="plus-square" /> 新增banner
            </RoleButton>
          </div>
          <Table
            loading={isLoading}
            className={'bannerTable'}
            columns={columns}
            dataSource={tableData}
            rowKey={'bannerId'}
            pagination={false}
          />
          <Modal
            title="推送设置"
            maskClosable={false}
            width={630}
            visible={showPushModal}
            confirmLoading={confirmLoading}
            onCancel={this.closeCheckPushModal}
            onOk={this.checkPush}
            footer={
              <div>
                <Button type={'default'} onClick={this.closeCheckPushModal}>取消</Button>
                <Button type={'primary'} disabled={!chargeDept.length} onClick={this.checkPush}>确定</Button>
              </div>
            }
          >
            <div style={{ marginBottom: 22 }}>
              <span style={{ color: 'red' }}>*</span>
              温馨提示：请选择活动新增时的可见部门
            </div>
            <div style={{ display: 'flex' }}>
              <div>
                <span style={{ color: 'red' }}>*</span>选择可见部门：
              </div>
              <DeptTreeSelect
                style={{ width: '73%' }}
                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                value={chargeDept}
                onChange={this.onChangeDept}
              />
            </div>
          </Modal>

        </div>
      </div>
    )
  }
}
