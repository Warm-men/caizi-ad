import React, { Component } from 'react'
import { Button, Table, Modal, Form, Row, Col, Select, message } from 'antd'
import './index.less'
import { Link } from 'react-router-dom'
import axios from '@src/utils/axios'
import urls from '@src/config'
import utils from '@src/utils'

export default class OrgLeader extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      visible: false,
      orgLevelList: [],
      levelNumber: undefined,
      levelNumberList: [],
      orgId: '',
      orgList: [],
      isTableLoading: true,
      tableData: undefined,
      currentOrg: '',
      currentOrgId: '',
      chargeStaff: [],
      chargeStaffList: []
    }
  }

  componentDidMount () {
    this.getOrgLevelList().then(() => {
      this.getMsgListLeader()
    })
  }
  // 获取机构层级列表
  getOrgLevelList = () => {
    return axios.post(urls.msgListDept).then(res => {
      const orgLevelList = res.retdata.list
      this.setState({
        orgLevelList,
        levelNumberList: orgLevelList.map(obj => obj.deptLevel),
        levelNumber: 1,
        // 根据当前选中的机构层级筛选项得到机构筛选列表
        orgList: orgLevelList.filter(obj => obj.deptLevel === 1)[0]['deptList'],
        orgId: ''
      })
    })
  }
  // 获取机构上级列表
  getMsgListLeader = () => {
    const { levelNumber, orgId } = this.state
    this.setState({ isTableLoading: true })
    axios.post(urls.msgListLeader, { level: levelNumber, deptId: orgId }).then(res => {
      const tableData = res.retdata.list
      this.setState({ isTableLoading: false, tableData })
    })
  }
  // 选择筛选机构层级
  onChangeLevelNumber = (value) => {
    this.setState({
      levelNumber: value,
      orgList: this.state.orgLevelList.filter(obj => obj.deptLevel === value)[0]['deptList'],
      orgId: ''
    })
  }
  // 选择筛选机构
  onChangeOrg = (value) => {
    this.setState({ orgId: value })
  }
  // 编辑modal 打开
  edit = (e, record) => {
    const isRight = utils.checkButtonRight(this.props.location.pathname, 'deptTopLevelEdit')
    if (!isRight) return
    this.setState({
      visible: true,
      levelNumber: record.deptLevel,
      currentOrg: record.deptName,
      currentOrgId: record.deptId,
      chargeStaffList: record.leaderList,
      chargeStaff: record.leaderList.map(obj => obj.leaderId)
    })
  }
  // 选择设置机构上级
  changeRoleMember = (value) => {
    this.setState({ chargeStaff: value })
  }
  // 远程搜索设置机构上级
  searchRoleMember = (value) => {
    this.debounce(value)
  }
  // debounce闭包 必须先写好 然后在searchRoleMember触发
  debounce = utils.debounce((value) => this.getRoleMember(value), 300)
  getRoleMember = (value) => {
    const key = value.trim()
    if (!key) {
      this.setState({ chargeStaffList: [] })
    } else {
      axios.post(urls.msgSelectLeader, { searchName: key }).then(res => {
        const chargeStaffList = res.retdata.list.map(obj => {
          return { ...obj, leaderDeptName: obj.deptName }
        })
        this.setState({ chargeStaffList })
      })
    }
  }
  // 编辑modal 确定
  handleOk = e => {
    const { levelNumber, currentOrgId, chargeStaff } = this.state
    // if (!chargeStaff.length) {
    //   return message.warning('请设置机构上级')
    // }
    if (chargeStaff.length > 20) {
      return message.warning('单个机构最多设置20个上级')
    }
    const data = {
      level: levelNumber,
      deptId: currentOrgId,
      leaders: chargeStaff.join(',')
    }
    axios.post(urls.msgUpdateLeader, data).then(res => {
      if (res.ret === 0) {
        message.success('保存成功')
        this.getMsgListLeader()
        this.setState({ visible: false })
      } else {
        message.error(res.retmsg)
      }
    })
  }
  // modal取消
  handleCancel = e => {
    this.setState({ visible: false })
  }
  // 重置
  reset = () => {
    this.setState({
      levelNumber: 1,
      orgList: this.state.orgLevelList.filter(obj => obj.deptLevel === 1)[0]['deptList'],
      orgId: ''
    }, () => {
      this.getMsgListLeader()
    })
  }

  render () {
    const columns = [
      {
        title: '机构层级',
        dataIndex: 'deptLevel'
      },
      {
        title: '机构',
        dataIndex: 'deptName'
      },
      {
        title: '机构上级',
        dataIndex: 'leaderList',
        render: (text, record, index) => (
          record.leaderList.length
            ? <span>{record.leaderList.map(obj => obj.leaderName).join(',')}</span>
            : <span>尚未设置机构上级</span>
        )
      },
      {
        title: '操作',
        width: 220,
        render: (text, record, index) => (
          <span className={'actionArea'}>
            <Button type="primary" style={{ marginRight: '10px' }} onClick={(e) => this.edit(e, record)}>
              编辑
            </Button>
          </span>
        )
      }
    ]
    const { tableData, isTableLoading, levelNumber, levelNumberList, orgId, orgList, currentOrg, chargeStaff, chargeStaffList } = this.state
    return (
      <div className={'orgLeader'}>
        <div className={'header'}>
          <span className={'left'}>
            <span className={'leftItem'}>
              机构层级：<Select style={{ width: 150 }} value={levelNumber} onChange={this.onChangeLevelNumber}>
                {levelNumberList.map(obj => {
                  return <Select.Option value={obj} key={obj}>{obj}</Select.Option>
                })}
              </Select>
            </span>
            <span className={'leftItem'}>
              机构：<Select style={{ width: 150 }} value={orgId} onChange={this.onChangeOrg}>
                <Select.Option value={''} key={''}>{'全部'}</Select.Option>
                {orgList.map(obj => {
                  return <Select.Option value={obj.deptId} key={obj.deptId}>{obj.deptName}</Select.Option>
                })}
              </Select>
            </span>
            <span className={'leftItem'}>
              <Button type="primary" onClick={this.getMsgListLeader}>查询</Button>
            </span>
            <span className={'leftItem'}>
              <Button type="primary" onClick={this.reset}>重置</Button>
            </span>
          </span>
        </div>
        <div className="content">
          {tableData && (tableData.length ? <Table
            loading={isTableLoading}
            className={'bannerTable'}
            columns={columns}
            dataSource={tableData}
            rowKey={'deptId'}
            pagination={false}
          /> : <div style={{textAlign: 'center', margin: '100px 0 0 0'}}>
            需要先在机构层级下设置机构。<Link to={{ pathname: '/orgLevel' }}>前往设置</Link>
          </div>)}
        </div>
        <Modal
          title={'编辑机构上级'}
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          width={800}
        >
          <Form layout={'vertical'}>
            <Row>
              <Col span={24}>
                <Form.Item label={<span>机构层级：{levelNumber}</span>}>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label={<span>机构：{currentOrg}</span>}>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label={<span>
                  {/* <span style={{ color: 'red' }}>* </span> */}
                  <span>设置机构上级</span>
                  <span style={{ color: '#999' }}>(如果该成员已设置为其他机构上级，将不会出现在可选列表中)</span>
                </span>}>
                  <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="请搜索成员"
                    value={chargeStaff}
                    onChange={this.changeRoleMember}
                    onSearch={this.searchRoleMember}
                    filterOption={false}
                  >
                    {chargeStaffList.map(obj => {
                      return <Select.Option
                        title={`${obj.leaderName} - ${obj.leaderDeptName}`}
                        name={obj.leaderName} key={obj.leaderId} value={obj.leaderId} disabled={obj.disable}>
                        {obj.leaderName} - {obj.leaderDeptName}
                      </Select.Option>
                    })}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    )
  }
}
