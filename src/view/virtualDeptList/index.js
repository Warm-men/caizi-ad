import React, { Component } from 'react'
import { Button, Table, Modal, Form, Row, Col, Input, Select, message } from 'antd'
import './index.less'
import axios from '@src/utils/axios'
import urls from '@src/config'
import utils from '@src/utils'
import DeptTreeSelect from '@src/components/DeptTreeSelect'

export default class SetVirtualDept extends Component {
  constructor(props, context) {
    super(props)
    this.state = {
      visible: false,
      // 虚拟部门名称
      deptName: '',
      // 虚拟部门上级
      chargeStaff: [],
      // 虚拟部门上级列表
      chargeStaffList: [],
      // 负责部门
      chargeDept: [],
      // 是新增还是编辑Modal
      isAddModal: true,
      // 当前在编辑的modal CorpVirtualDeptId
      currentEditCorpVirtualDeptId: undefined,
      isTableLoading: false,
      tableData: [],
      pageNum: 1,
      pageSize: 10
    }
  }

  componentDidMount() {
    this.getVirtualDeptList()
  }
  // 获取虚拟部门列表
  getVirtualDeptList = () => {
    this.setState({ isTableLoading: true })
    const { name = '', pageNum, pageSize } = this.state
    return axios
      .post(urls.virtualDeptList, { pageNum, pageSize, name })
      .then((res) => {
        if (res.ret === 0) {
          const { total, list } = res.retdata
          this.setState({ tableData: list, total })
        }
      })
      .finally(() => {
        this.setState({ isTableLoading: false })
      })
  }
  // 查询
  search = () => {
    this.setState({ pageNum: 1 }, this.getVirtualDeptList)
  }
  // 表格分页配置
  pagination = () => {
    const { pageNum, pageSize, total = 0 } = this.state
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
        this.setState({ pageNum }, this.getVirtualDeptList)
      },
      onShowSizeChange: (pageNum, pageSize) => {
        this.setState({ pageNum: 1, pageSize }, this.getVirtualDeptList)
      }
    }
  }
  // 输入虚拟部门名称
  onChangeDeptName = (ev) => {
    this.setState({ deptName: ev.target.value })
  }
  // 选择虚拟部门上级
  changeRoleMember = (value) => {
    this.setState({ chargeStaff: value })
  }
  // 远程搜索虚拟部门上级
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
      // filter: true 如果该成员已设置为其他虚拟部门上级，将不会出现在可选列表中
      axios.post(urls.userList, { name: key, filter: true }).then((res) => {
        const chargeStaffList = res.retdata.userList.map((obj) => {
          return { ...obj, staffId: obj.id }
        })
        this.setState({ chargeStaffList })
      })
    }
  }
  // 选择负责部门
  onChangeDept = (value) => {
    this.setState({ chargeDept: value })
  }
  // 新增虚拟部门
  addVirtualDept = () => {
    const isRight = utils.checkButtonRight(this.props.location.pathname, 'virtualDeptAdd')
    if (!isRight) return
    this.setState({
      isAddModal: true,
      currentEditCorpVirtualDeptId: undefined,
      deptName: '',
      chargeStaff: [],
      chargeStaffList: [],
      chargeDept: [],
      visible: true
    })
  }
  // 编辑虚拟部门
  editVirtualDept = (e, record) => {
    const isRight = utils.checkButtonRight(this.props.location.pathname, 'virtualDeptEdit')
    if (!isRight) return
    axios.post(urls.virtualDeptDetail, { corpVirtualDeptId: record.corpVirtualDeptId }).then((res) => {
      const { corpVirtuaDeptName, corpVirtualDeptId, deptList, leaderList } = res.retdata.detail
      this.setState({
        isAddModal: false,
        currentEditCorpVirtualDeptId: corpVirtualDeptId,
        deptName: corpVirtuaDeptName,
        chargeStaff: leaderList.map((obj) => obj.staffId),
        chargeStaffList: leaderList,
        chargeDept: deptList.map((obj) => obj.deptId),
        visible: true
      })
    })
  }
  // 新增、编辑虚拟部门modal确定
  handleOk = (e) => {
    const { deptName, chargeStaff, chargeDept, isAddModal, currentEditCorpVirtualDeptId } = this.state
    if (!deptName || !chargeStaff.length || !chargeDept.length) {
      return message.error('虚拟部门名称、虚拟部门上级、负责部门都需要填写')
    }
    if (deptName.length > 20) {
      return message.error('虚拟部门名称最多20个字符')
    }
    if (chargeStaff.length > 10) {
      return message.error('虚拟部门上级最多10个人')
    }
    const data = {
      corpVirtuaDeptName: deptName,
      leaderIds: chargeStaff,
      deptIds: chargeDept
    }
    if (isAddModal) {
      // 新增
      axios.post(urls.virtualDeptCreate, data).then((res) => {
        if (res.ret === 0) {
          message.success('添加成功')
          this.getVirtualDeptList()
          this.setState({ visible: false })
        } else {
          message.error('添加失败')
        }
      })
    } else {
      // 编辑
      axios.post(urls.virtualDeptUpdate, { ...data, corpVirtualDeptId: currentEditCorpVirtualDeptId }).then((res) => {
        if (res.ret === 0) {
          message.success('编辑成功')
          this.getVirtualDeptList()
          this.setState({ visible: false })
        } else {
          message.error('编辑失败')
        }
      })
    }
  }
  // modal取消
  handleCancel = (e) => {
    this.setState({ visible: false })
  }
  // 删除虚拟部门
  deleteVirtualDept = (e, record) => {
    const isRight = utils.checkButtonRight(this.props.location.pathname, 'virtualDeptDel')
    if (!isRight) return
    const _this = this
    Modal.confirm({
      title: '删除',
      content: '你确定删除此虚拟部门？',
      onOk() {
        axios.post(urls.virtualDeptDelete, { corpVirtualDeptId: record.corpVirtualDeptId }).then((res) => {
          if (res.ret === 0) {
            message.success('删除成功')
            _this.getVirtualDeptList()
          } else {
            message.error('删除失败')
          }
        })
      },
      onCancel() {}
    })
  }

  render() {
    const columns = [
      {
        title: '虚拟部门名称',
        dataIndex: 'corpVirtuaDeptName'
      },
      {
        title: '虚拟部门上级',
        dataIndex: 'leaderNames'
      },
      {
        title: '负责部门',
        dataIndex: 'deptNames'
      },
      {
        title: '操作',
        width: 220,
        render: (text, record, index) => (
          <span className={'actionArea'}>
            <Button type="primary" style={{ marginRight: '10px' }} onClick={(e) => this.editVirtualDept(e, record)}>
              编辑
            </Button>
            <Button type="danger" onClick={(e) => this.deleteVirtualDept(e, record)}>
              删除
            </Button>
          </span>
        )
      }
    ]
    const { tableData, isTableLoading, deptName, chargeStaff, chargeStaffList, chargeDeptTree, chargeDept, isAddModal, name = '' } = this.state
    return (
      <div className={'setVirtualDept'}>
        <div className={'top'}>
          <Input
            className="name-input"
            maxLength={15}
            allowClear
            placeholder="搜索虚拟部门上级"
            value={name}
            onChange={(e) => this.setState({ name: e.target.value })}
          />
          <Button type="primary" style={{ marginRight: 10 }} onClick={this.search}>
            查询
          </Button>
          <Button type="primary" onClick={this.addVirtualDept}>
            新增虚拟部门
          </Button>
          <span style={{ marginLeft: '10px' }}>成员设置成上级后可接收对应负责部门的数据报表</span>
        </div>
        <div className="content">
          <Table
            loading={isTableLoading}
            className={'bannerTable'}
            columns={columns}
            dataSource={tableData}
            rowKey={'corpVirtualDeptId'}
            pagination={this.pagination()}
          />
        </div>
        <Modal title={isAddModal ? '新增虚拟部门' : '编辑虚拟部门'} visible={this.state.visible} onOk={this.handleOk} onCancel={this.handleCancel} width={800}>
          <Form layout={'vertical'}>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={
                    <span>
                      <span style={{ color: 'red' }}>* </span>
                      <span>虚拟部门名称</span>
                      <span style={{ color: '#999' }}>(不能和已有虚拟部门名称重复)</span>
                    </span>
                  }
                >
                  <Input value={deptName} onChange={this.onChangeDeptName} placeholder="请输入虚拟部门名称(20个字符内)" />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={
                    <span>
                      <span style={{ color: 'red' }}>* </span>
                      <span>虚拟部门上级</span>
                      <span style={{ color: '#999' }}>(如果该成员已设置为其他虚拟部门上级，将不会出现在可选列表中)</span>
                    </span>
                  }
                >
                  <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    placeholder="请搜索虚拟部门上级"
                    value={chargeStaff}
                    onChange={this.changeRoleMember}
                    onSearch={this.searchRoleMember}
                    filterOption={false}
                    // notFoundContent={'暂无数据，请继续搜索虚拟部门上级'}
                  >
                    {chargeStaffList.map((obj) => {
                      return (
                        <Select.Option title={`${obj.name} - ${obj.department}`} name={obj.name} key={obj.staffId} value={obj.staffId} disabled={obj.disable}>
                          {obj.name} - {obj.department}
                        </Select.Option>
                      )
                    })}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label={<span>
                  <span style={{ color: 'red' }}>* </span>
                  <span>负责部门</span>
                </span>}>
                  <DeptTreeSelect onChange={this.onChangeDept} value={chargeDept}/>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    )
  }
}
