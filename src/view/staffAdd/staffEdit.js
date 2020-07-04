import React, { Component } from 'react'
import { Button, Input, Upload, Form, Icon, Modal, Radio, Tooltip, TreeSelect, Checkbox, message, Select, Row, Col } from 'antd'
import styles from './staffEdit.less'
import { withRouter, Link } from 'react-router-dom'
import axios from '@src/utils/axios'
import urls from '@src/config'
import { connect } from 'react-redux'
import DeptTreeSelect from '@src/components/DeptTreeSelect'

const mapStateToProps = (state) => {
  return {
    right: state.base.right
  }
}

@withRouter
@connect(mapStateToProps)
class StaffEdit extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      name: '',
      alias: '',
      userId: '',
      gender: 1,
      mobile: '',
      telephone: '',
      email: '',
      addr: '',
      department: [],
      position: '',
      // 身份 是否是上级
      isLeader: false,
      // 负责部门value
      isLeaderInDept: [],
      // 负责部门select list
      isLeaderInDeptList: [],
      // 身份上级disabled
      disableLeader: true,
      // 业务类型
      businessType: 3,
      corpAlias: '',
      externalPosition: '',
      inputExternalPosition: '',
      toInvite: false,
      // 头像放大预览
      previewVisible: false,
      // 头像放大url
      previewImage: '',
      fileList: [],
      // 头像id
      mediaId: '',
      staffId: ''
    }
  }
  // 如果是编辑就获取员工详情
  componentDidMount () {
    const { isAdd } = this.props
    if (!isAdd) {
      this.setStaffDetail()
    }
  }
  // 获取员工详情
  setStaffDetail = () => {
    const id = this.props.location.search.split('=')[1]
    this.setState({ staffId: id })
    axios.post(urls.userDetail, { staffId: id }).then(res => {
      this.setState({
        ...res.retdata,
        // 通过邮件发送企业邀请
        toInvite: Boolean(res.retdata.toInvite),
        // 图像
        fileList: res.retdata.avatar ? [{ url: res.retdata.avatar, uid: '-1' }] : [],
        // 部门
        department: res.retdata.departments.map(obj => obj.deptId),
        // 身份
        isLeader: res.retdata.leaderDepts.length !== 0,
        // 是否disabled身份上级
        disableLeader: res.retdata.departments.length === 0,
        // 负责部门
        isLeaderInDept: res.retdata.leaderDepts.map(obj => obj.deptId),
        // 负责部门select list
        isLeaderInDeptList: res.retdata.departments.map(obj => {
          return {
            value: obj.deptId,
            label: obj.deptName
          }
        })
      })
      if (res.retdata.externalPosition) {
        // 对外职务 自定义
        this.setState({ externalPosition: 2, inputExternalPosition: res.retdata.externalPosition })
      }
    })
  }

  // 提交
  submit = (e, isAdd, isContinueAdd) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (!values.mobile && !values.email) {
          return message.error('手机和邮箱至少填写一个')
        }
        // 头像
        values.mediaId = this.state.mediaId || ''
        // 负责部门
        if (this.state.isLeader) {
          values.isLeaderInDept = this.state.isLeaderInDept.join(',')
        } else {
          values.isLeaderInDept = ''
        }
        // 对外职务 自定义
        if (values.externalPosition) {
          values.externalPosition = values.inputExternalPosition
        }
        if (isAdd) {
          // 新增员工
          axios.post(urls.userCreate, values).then(res => {
            message.success('新增成功')
            if (isContinueAdd) {
              this.props.form.resetFields()
            } else {
              this.props.history.push({ pathname: '/staffList' })
            }
          })
        } else {
          // 编辑员工
          values.id = this.state.staffId
          axios.post(urls.userUpdate, values).then(res => {
            message.success('修改成功')
            this.props.history.push({ pathname: '/staffList' })
            // this.props.history.push({ pathname: '/staffDetail', search: `?id=${this.state.staffId}` })
          })
        }
      }
    })
  }

  // 部门身份负责部门三者联动 --- 开始
  // 改变部门
  onChangeDepartment = (value, option) => {
    let isLeaderInDept = []
    let isLeaderInDeptList = []
    isLeaderInDept = value
    isLeaderInDeptList = isLeaderInDept.map((value, index) => {
      return { value: value, label: option[index] }
    })
    // 部门变化同步渲染负责部门select
    this.setState({ treeValue: value, isLeaderInDeptList, isLeaderInDept })
    if (value.length) {
      this.setState({ disableLeader: false })
    } else {
      // 如果没有选部门 身份就是普通成员同时disable身份上级
      this.setState({ isLeader: false, disableLeader: true })
    }
  }
  // 改变身份
  onChangeDegree = (ev) => {
    const isLeader = ev.target.value
    this.setState({ isLeader })
    if (isLeader) {
      // 如果身份切换为上级 负责部门选中所有已选部门
      this.setState({ isLeaderInDept: this.state.isLeaderInDeptList.map(obj => obj.value) })
    }
  }
  // 改变负责部门
  onChangeIsLeaderInDept = (value) => {
    this.setState({ isLeaderInDept: value })
    if (!value.length) {
      // 清空负责部门 身份变为普通成员
      this.setState({ isLeader: false })
    }
  }
  // 部门身份负责部门三者联动 --- 结束

  // 账号格式
  validateUserId = (rule, value, callback) => {
    const regExp = /^[\w\-_.]+$/
    if (!regExp.test(value)) {
      callback('账号格式错误，只能是字母数字.-_这些字符') // eslint-disable-line
    }
    callback()
  }
  // 手机格式
  validateMobile = (rule, value, callback) => {
    const regExp = /^(86)?((13\d{9})|(15[0,1,2,3,5,6,7,8,9]\d{8})|(18[0,1,2,3,4,5,6,7,8,9]\d{8}))$/
    if (value && !regExp.test(value)) {
      callback('手机格式错误') // eslint-disable-line
    }
    callback()
  }
  // 电话格式
  validateTelephone = (rule, value, callback) => {
    const regExp = new RegExp(/^(0?\d{2,3}\-)?[1-9]\d{6,7}(\-\d{1,4})?$/) // eslint-disable-line
    if (value && !regExp.test(value)) {
      callback('电话格式错误') // eslint-disable-line
    }
    callback()
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
  // 限制头像上传图片类型 只能阻止发送请求 但还是会进入handleChangeAvatar
  beforeUploadAvatar = (file) => {
    const isPngOrJpeg = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isPngOrJpeg) {
      message.error('只能上传jpg、jpeg、png格式的图片，请删除后再上传')
    }
    return isPngOrJpeg
  }
  // 上传头像 移除头像
  handleChangeAvatar = ({ file, fileList }) => {
    const mediaId = file.response && file.response.retdata && file.response.retdata.mediaId
    this.setState({ fileList, mediaId })
  }

  render () {
    const { getFieldDecorator, getFieldValue } = this.props.form
    const { isAdd, right } = this.props
    const canEdit = right.staffList && right.staffList.edit
    const { treeValue = [], previewVisible, previewImage, fileList,
      name, alias, userId, gender, mobile, telephone, email, addr, department,
      position, isLeader, corpAlias, externalPosition, inputExternalPosition, toInvite,
      isLeaderInDept, isLeaderInDeptList, disableLeader, businessType } = this.state
    const itemCol = {
      labelCol: {span: 6},
      wrapperCol: {span: 18}
    }
    return (
      <div>
        <div className={styles.title}>
          添加成员
        </div>
        <div className={styles.content}>
          <Modal visible={previewVisible} footer={null} onCancel={this.handleCancelPreview}>
            <img style={{ width: '100%' }} src={previewImage} />
          </Modal>
          <Form>
            <Row>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>头像</span>} {...itemCol}>
                  <Upload
                    action={urls.avatarUpload}
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={this.handlePreviewAvatar}
                    onChange={this.handleChangeAvatar}
                    beforeUpload={this.beforeUploadAvatar}
                  >
                    {fileList.length >= 1 ? null : <div>
                      <Icon type="plus" />
                      <div>请上传头像</div>
                    </div>}
                  </Upload>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>姓名</span>} {...itemCol}>
                  {getFieldDecorator('name', {
                    rules: [{ required: true, whitespace: true, max: 16, message: '姓名最多16个字符' }],
                    initialValue: name
                  })(
                    <Input placeholder="请输入姓名，最多16个字符" />
                  )}
                </Form.Item>
              </Col>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>别名</span>} {...itemCol}>
                  {getFieldDecorator('alias', {
                    rules: [{ max: 16, message: '别名最多16个字符' }],
                    initialValue: alias
                  })(
                    <Input placeholder="请输入别名，最多16个字符" />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>账号</span>} {...itemCol}>
                  {getFieldDecorator('userId', {
                    rules: [{ required: true, message: '请输入账号' }, { validator: this.validateUserId }],
                    initialValue: userId
                  })(
                    <Input placeholder="成员唯一标识，设定后不能修改" disabled={!isAdd} />
                  )}
                </Form.Item>
              </Col>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>性别</span>} {...itemCol}>
                  {getFieldDecorator('gender', {
                    initialValue: gender
                  })(
                    <Radio.Group>
                      <Radio value={1}>男</Radio>
                      <Radio value={2}>女</Radio>
                    </Radio.Group>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row><Col span={24} style={{ borderBottom: '1px dashed #ddd', marginBottom: '24px' }}></Col></Row>
            <Row>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>手机</span>} {...itemCol}>
                  {getFieldDecorator('mobile', {
                    rules: [{ required: false, message: '请输入手机号码' }, { validator: this.validateMobile }],
                    initialValue: mobile
                  })(
                    <Input placeholder="成员通过验证该手机可以加入企业" />
                  )}
                </Form.Item>
              </Col>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>座机</span>} {...itemCol}>
                  {getFieldDecorator('telephone', {
                    rules: [{ validator: this.validateTelephone }],
                    initialValue: telephone
                  })(
                    <Input placeholder="" />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>邮箱</span>} {...itemCol}>
                  {getFieldDecorator('email', {
                    rules: [{ type: 'email', message: '邮箱格式错误' }],
                    initialValue: email
                  })(
                    <Input placeholder="手机和邮箱至少填写一个" />
                  )}
                </Form.Item>
              </Col>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>地址</span>} {...itemCol}>
                  {getFieldDecorator('addr', {
                    initialValue: addr
                  })(
                    <Input placeholder="" />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row><Col span={24} style={{ borderBottom: '1px dashed #ddd', marginBottom: '24px' }}></Col></Row>
            <Row>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>部门</span>} {...itemCol}>
                  {getFieldDecorator('department', {
                    rules: [{ required: true, message: '请选择部门' }],
                    initialValue: department
                  })(
                    <DeptTreeSelect value={treeValue} onChange={this.onChangeDepartment}/>
                  )}
                </Form.Item>
              </Col>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>职务</span>} {...itemCol}>
                  {getFieldDecorator('position', {
                    initialValue: position
                  })(
                    <Input placeholder="" />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>身份</span>} {...itemCol}>
                  <Radio.Group onChange={this.onChangeDegree} value={isLeader}>
                    <Radio value={false}>普通成员</Radio>
                    <Radio value={true} disabled={disableLeader}>上级</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={12} className={styles.col}>
                {/* 身份选上级才显示负责部门 */}
                {isLeader ? <Form.Item label={<span>负责部门</span>} {...itemCol}>
                  <Select
                    mode="multiple"
                    style={{ width: '100%' }}
                    value={isLeaderInDept}
                    onChange={this.onChangeIsLeaderInDept}
                    getPopupContainer={triggerNode => triggerNode.parentNode}
                  >
                    {isLeaderInDeptList.map(obj => {
                      return <Select.Option value={obj.value} key={obj.value}>{obj.label}</Select.Option>
                    })}
                  </Select>
                </Form.Item> : null}
              </Col>
            </Row>
            <Row>
              <Col span={24} className={styles.col}>
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
                  </span>} labelCol={{span: 3}} wrapperCol={{span: 21}}>
                  {getFieldDecorator('businessType', {
                    initialValue: businessType
                  })(<Radio.Group>
                    <Radio value={1}>对公业务</Radio>
                    <Radio value={2}>零售业务</Radio>
                    <Radio value={3}>对公+零售</Radio>
                  </Radio.Group>)}
                </Form.Item>
              </Col>
            </Row>
            <Row><Col span={24} style={{ borderBottom: '1px dashed #ddd', marginBottom: '24px' }}></Col></Row>
            <Row>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>对外企业简称</span>} {...itemCol}>
                  {getFieldDecorator('corpAlias', {
                    initialValue: corpAlias
                  })(
                    <Input placeholder="" />
                  )}
                </Form.Item>
              </Col>
              <Col span={12} className={styles.col}>
                <Form.Item label={<span>对外职务</span>} {...itemCol}>
                  {getFieldDecorator('externalPosition', {
                    initialValue: externalPosition
                  })(
                    <Radio.Group>
                      <Radio value={''}>同步公司内职务</Radio>
                      <Radio value={2}>
                    自定义
                        {getFieldValue('externalPosition') === 2
                          ? getFieldDecorator('inputExternalPosition', {
                            initialValue: inputExternalPosition
                          })(<Input style={{width: '150px', margin: '0 0 0 10px'}} />)
                          : null}
                      </Radio>
                    </Radio.Group>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12} className={styles.col}>
                <Form.Item wrapperCol={{offset: 6, span: 18}}>
                  {getFieldDecorator('toInvite', {
                    initialValue: toInvite
                  })(
                    <Checkbox>通过邮件或者短信发送企业邀请</Checkbox>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={12} className={styles.col}>
                <Form.Item wrapperCol={{offset: 6, span: 18}}>
                  {isAdd ? <Button type="primary" disabled={!canEdit} onClick={(e) => this.submit(e, isAdd, true)} className={styles.btn}>保存并继续添加</Button> : null}
                  <Button type="primary" disabled={!canEdit} onClick={(e) => this.submit(e, isAdd, false)} className={styles.btn}>保存</Button>
                  <Link to={{ pathname: '/staffList' }}><Button disabled={!canEdit} className={styles.btn}>取消</Button></Link>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    )
  }
}

export default Form.create({ name: 'StuffEdit' })(StaffEdit)
