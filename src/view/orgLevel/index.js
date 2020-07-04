import React, { Component } from 'react'
import { Button, Table, Modal, Form, Row, Col, message } from 'antd'
import './index.less'
import DeptTreeSelect from '@src/components/DeptTreeSelect'
import axios from '@src/utils/axios'
import urls from '@src/config'
import utils from '@src/utils'

export default class OrgLevel extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      visible: false,
      levelNumber: 1,
      chargeDeptIds: [],
      isTableLoading: false,
      tableData: []
    }
  }

  componentDidMount () {
    this.getOrgLevelList()
  }
  // 获取虚机构层级列表
  getOrgLevelList = () => {
    this.setState({ isTableLoading: true })
    return axios.post(urls.msgListDept).then(res => {
      const tableData = res.retdata.list
      this.setState({ isTableLoading: false, tableData })
    })
  }

  // 移除数组中的某项
  removeItemInArr = (item, arr) => {
    var index = arr.indexOf(item)
    if (index > -1) {
      arr.splice(index, 1)
    }
  }
  // 选择机构节点
  onChangeDept = (value, label, extra) => {
    this.setState({ chargeDeptIds: value })
  }
  // 此层级是否能编辑
  isShouldDisabled = (record) => {
    // 第一层永远可以编辑
    if (record.deptLevel === 1) return false
    const { tableData } = this.state
    // 第N层 必须N-1层有设置包含机构才能编辑
    const prevItem = tableData.filter(obj => obj.deptLevel === (record.deptLevel - 1))[0]
    return !prevItem['deptList']['length']
  }
  // 编辑modal 打开
  edit = (e, record) => {
    const isRight = utils.checkButtonRight(this.props.location.pathname, 'deptLevelEdit')
    if (!isRight) return
    this.setState({
      levelNumber: record.deptLevel,
      chargeDeptIds: record.deptList.map(obj => obj.deptId),
      visible: true
    })
  }
  // 编辑modal 确定
  handleOk = e => {
    const { levelNumber, chargeDeptIds } = this.state
    // if (!chargeDeptIds.length) {
    //   return message.warning('包含机构不能为空')
    // }
    const data = {
      level: levelNumber,
      deptIds: chargeDeptIds
    }
    axios.post(urls.msgUpdateDept, data).then(res => {
      if (res.ret === 0) {
        message.success('保存成功')
        this.getOrgLevelList()
        this.setState({ visible: false })
      } else {
        // 3：后端判断 2层级的部门不能是1层级的同级或者父节点
        message.error(res.retmsg)
      }
    })
  }
  // modal取消
  handleCancel = e => {
    this.setState({ visible: false })
  }

  render () {
    const columns = [
      {
        title: '机构层级',
        dataIndex: 'deptLevel'
      },
      {
        title: '包含机构',
        dataIndex: 'deptList',
        render: (text, record, index) => (
          record.deptList.length
            ? <span>{record.deptList.map(obj => obj.deptName).join(',')}</span>
            : <span>尚未设置机构</span>
        )
      },
      {
        title: '操作',
        width: 220,
        render: (text, record, index) => (
          <span className={'actionArea'}>
            <Button type="primary"
              style={{ marginRight: '10px' }} onClick={(e) => this.edit(e, record)}>
              编辑
            </Button>
          </span>
        )
      }
    ]
    const { tableData, isTableLoading, levelNumber, chargeDeptIds } = this.state
    return (
      <div className={'orgLevel'}>
        <div className="content">
          <Table
            loading={isTableLoading}
            className={'bannerTable'}
            columns={columns}
            dataSource={tableData}
            rowKey={'deptLevel'}
            pagination={false}
          />
        </div>
        <Modal
          title={'编辑包含机构'}
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
                <Form.Item label={<span>
                  {/* <span style={{ color: 'red' }}>* </span> */}
                  <span>包含机构</span>
                  <span style={{ color: '#999' }}>(移除机构后，机构上级及其机构下的子机构和上级也将被移除)</span>
                </span>}>
                  <DeptTreeSelect value={chargeDeptIds} onChange={this.onChangeDept}/>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    )
  }
}
