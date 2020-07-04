import React, { Component } from 'react'
import { Button, Tag, Form, Upload, Icon, Modal, message, Row, Col, Tooltip } from 'antd'
import { Link } from 'react-router-dom'
import styles from './index.less'
import axios from '@src/utils/axios'
import urls from '@src/config'
import { connect } from 'react-redux'

class StuffDetail extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      name: '',
      alias: '',
      userId: '',
      gender: '',
      mobile: '',
      telephone: '',
      email: '',
      addr: '',
      departments: [],
      leaderDepts: [],
      position: '',
      isLeaderInDept: '',
      corpAlias: '',
      externalPosition: '',
      inputExternalPosition: '',
      // 头像放大预览
      previewVisible: false,
      // 头像放大url
      previewImage: '',
      // 头像文件
      fileList: [],
      staffId: ''
    }
  }

  // 获取详情
  componentDidMount () {
    const id = this.props.location.search.split('=')[1]
    axios.post(urls.userDetail, { staffId: id }).then(res => {
      this.setState({
        ...res.retdata,
        fileList: [{ url: res.retdata.avatar, uid: '-1' }]
      })
    })
    this.setState({ staffId: id })
  }
  // 删除
  deleteUser = () => {
    axios.post(urls.userDelete, { staffIds: this.state.staffId }).then(res => {
      this.props.history.push({ pathname: '/staffList' })
      return message.success('删除成功')
    })
  }
  // 启用禁用
  updateStatus = (isEnable) => {
    if (isEnable) {
      axios.post(urls.updateStatus, { staffId: this.state.staffId, status: 1 }).then(res => {
        // 启用成功 修改状态为已启用
        this.setState({ status: 1 })
        return message.success('启用成功')
      })
    } else {
      Modal.confirm({
        title: '禁用成员确认',
        content: '禁用后，该成员将无法登录企业微信',
        onOk: () => {
          axios.post(urls.updateStatus, { staffId: this.state.staffId, status: 0 }).then(res => {
            // 禁用成功 修改状态为已禁用
            this.setState({ status: 2 })
            return message.success('禁用成功')
          })
        },
        onCancel: () => {}
      })
    }
  }
  // 退出头像预览
  handleCancelPreview = () => {
    this.setState({ previewVisible: false })
  }
  // 预览头像
  handlePreviewAvatar = (file) => {
    this.setState({
      previewImage: file.url || file.thumbUrl,
      previewVisible: true
    })
  }
  // 业务类型标签
  getBusinessType = (businessType) => {
    if (businessType === 1) {
      return '对公业务'
    } else if (businessType === 2) {
      return '零售业务'
    } else if (businessType === 3) {
      return '对公+零售'
    } else {
      return ''
    }
  }

  render () {
    const { previewVisible, previewImage, fileList, avatar,
      name, alias, userId, gender, mobile, telephone, email, addr, departments, leaderDepts,
      position, isLeaderInDept, corpAlias, externalPosition, staffId, status, businessType } = this.state
    const { right } = this.props
    const canEdit = right.staffList && right.staffList.edit
    const itemCol = {
      labelCol: {span: 6},
      wrapperCol: {span: 18}
    }
    return (
      <div>
        <div className={styles.title}>
          查看成员
        </div>
        <div className={styles.content}>
          <Modal visible={previewVisible} footer={null} onCancel={this.handleCancelPreview}>
            <img style={{ width: '100%' }} src={previewImage} />
          </Modal>
          <Form>
            <Row>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>头像</span>} {...itemCol}>
                  {avatar ? <Upload
                    listType="picture-card"
                    fileList={fileList}
                    showUploadList={{ showPreviewIcon: true, showRemoveIcon: false }}
                    onPreview={this.handlePreviewAvatar}
                  >
                    {fileList.length >= 1 ? null : <div>
                      <Icon type="plus" />
                      <div>请上传头像</div>
                    </div>}
                  </Upload> : null}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>姓名</span>} {...itemCol}>
                  <span>{name}</span>
                  <span></span>
                  <span style={{ color: 'rgb(24, 144, 255)', margin: '0 10px' }}>{gender === 1 ? <Icon type="man" /> : <Icon type="woman" />}</span>
                  <span>{status === 2 ? <Tag color="red">已禁用</Tag> : null}</span>
                </Form.Item>
              </Col>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>别名</span>} {...itemCol}>
                  <span>{alias}</span>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>账号</span>} {...itemCol}>
                  <span>{userId}</span>
                </Form.Item>
              </Col>
            </Row>
            <Row><Col span={24} style={{ borderBottom: '1px dashed #ddd', marginBottom: '24px' }}></Col></Row>
            <Row>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>手机</span>} {...itemCol}>
                  <span>{mobile}</span>
                </Form.Item>
              </Col>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>座机</span>} {...itemCol}>
                  <span>{telephone}</span>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>邮箱</span>} {...itemCol}>
                  <span>{email}</span>
                </Form.Item>
              </Col>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>地址</span>} {...itemCol}>
                  <span>{addr}</span>
                </Form.Item>
              </Col>
            </Row>
            <Row><Col span={24} style={{ borderBottom: '1px dashed #ddd', marginBottom: '24px' }}></Col></Row>
            <Row>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>部门</span>} {...itemCol}>
                  <span>{departments.map(obj => {
                    return <Tag color="green" key={obj.deptId}>{obj.deptName}</Tag>
                  })}</span>
                </Form.Item>
              </Col>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>职务</span>} {...itemCol}>
                  <span>{position}</span>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>身份</span>} {...itemCol}>
                  <span>{leaderDepts.length ? '上级' : '普通成员'}</span>
                </Form.Item>
              </Col>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>负责部门</span>} {...itemCol}>
                  <span>{leaderDepts.map(obj => {
                    return <Tag color="green" key={obj.deptId}>{obj.deptName}</Tag>
                  })}</span>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12} className={styles.col}>
                <Form.Item label={
                  <span>
                    <span style={{marginRight: '5px'}}>
                      <Tooltip placement="bottomLeft" title={
                        <ul>
                          <li>此项为针对客户经理的设置：</li>
                          <li>. "对公业务"，该客户经理的个人小站仅展示对公业务产品。</li>
                          <li>. "零售业务"，该客户经理的个人小站仅展示零售业务产品。</li>
                          <li>. "对公+零售"，该客户经理的个人小站同时展示对公和零售业务产品。</li>
                        </ul>
                      }>
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                    <span>业务类型</span>
                  </span>} {...itemCol}>
                  <span>{this.getBusinessType(businessType)}</span>
                </Form.Item>
              </Col>
            </Row>
            <Row><Col span={24} style={{ borderBottom: '1px dashed #ddd', marginBottom: '24px' }}></Col></Row>
            <Row>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>对外企业简称</span>} {...itemCol}>
                  <span>{corpAlias}</span>
                </Form.Item>
              </Col>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>对外职务</span>} {...itemCol}>
                  <span>{externalPosition}</span>
                </Form.Item>
              </Col>
            </Row>
            {/* <Row>
              <Col span={12} className={styles.col}>
                <Form.Item wrapperCol={{offset: 6, span: 18}}>
                  <Link to={{ pathname: '/staffUpdate', search: `?id=${staffId}` }}>
                    <Button type="primary" disabled={!canEdit} className={styles.btn}>编辑</Button>
                  </Link>
                  {status === 2 ? <Button type="primary" disabled={!canEdit} className={styles.btn} onClick={() => this.updateStatus(true)}>启用</Button>
                    : <Button type="danger" disabled={!canEdit} className={styles.btn} onClick={() => this.updateStatus(false)}>禁用</Button>}
                  <Button type="danger" disabled={!canEdit} className={styles.btn} onClick={this.deleteUser}>删除</Button>
                </Form.Item>
              </Col>
            </Row> */}
          </Form>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    right: state.base.right
  }
}

export default connect(
  mapStateToProps
)(Form.create({ name: 'StuffDetail' })(StuffDetail))
