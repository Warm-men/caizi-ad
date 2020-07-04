import React from 'react'
import { Form, Row, Col, Button, message, DatePicker, Icon, Input, Upload, Modal, Spin } from 'antd'
import PropTypes from 'prop-types'
import PushPage from './pushPage'
import Tools from '@src/utils'
import axios from '@src/utils/axios'
import urls from '@src/config'
import { Validator } from '@src/utils/validate'
import moment from 'moment'
import DeptTreeSelect from '@src/components/DeptTreeSelect'
import './newPage.less'

export default class NewPage extends React.Component {
  static childContextTypes = {
    onChangeImageText: PropTypes.func
  }

  getChildContext () {
    return { onChangeImageText: this.onChangeImageText }
  }

  constructor (props) {
    super(props)
    this.search = this.props.location.search
    this.state = {
      loading: false,
      isLoading: false,
      operaIdx: 0,
      timingModal: false,
      filterDateRange: null,
      hasChangeLeave: false, // 当前页面改变跳转别的页面提醒弹窗
      accept: ['image/jpg', 'image/png', 'image/jpeg'],
      acceptSuffix: ['.jpg', '.png', '.jpeg'],
      previewVisible: false,
      previewImage: '',
      activeKey: '1',
      words: '', // 文字
      fileList: [],
      uploadImgUrl: '', // 图片
      imageTextObj: [{
        url: '',
        title: '',
        coverPicture: '',
        summary: ''
      }], // 图文数据
      departmentType: 1, // 服务商部门类型：0 全部，1部分
      chargeDept: [],
      id: Tools.getUrlQueryString(this.search, 'id') || null,
      type: Tools.getUrlQueryString(this.search, 'type') || '3'
    }
    this.defaultImageTextObj = {
      url: '',
      title: '',
      coverPicture: '',
      summary: ''
    }
  }

  componentDidMount () {
    if (this.state.type === '3') { // 默认配置进入的
      if (this.state.id) { // 编辑数据
        this.getQueryDetail()
      }
    }
  }

  // 获取详情数据，回显
  getQueryDetail () {
    this.setState({ isLoading: true })
    axios.post(urls.queryDetail, { messageId: this.state.id }, {headers: {'Content-Type': 'application/json;charset=UTF-8'}}).then(res => {
      let { pictureTextMessage = {}, textMessage = '', pictureMessage = '', messageType } = res.retdata
      let {
        mainMessage = {
          url: '',
          title: '',
          coverPicture: '',
          summary: ''
        },
        deputyMessages = []
      } = pictureTextMessage
      let obj = []
      obj.push(mainMessage)
      obj = obj.concat(deputyMessages)
      let fileList
      if (messageType === 3) {
        fileList = [{
          uid: pictureMessage,
          url: pictureMessage,
          // type: 'image/png',
          status: 'done'
        }]
      }
      this.setState({
        isLoading: false,
        activeKey: messageType + '',
        imageTextObj: messageType === 1 ? obj : this.state.imageTextObj,
        words: textMessage,
        uploadImgUrl: pictureMessage,
        fileList: messageType === 3 ? fileList : []
      })
    }).catch(() => {
      this.setState({ isLoading: false })
    })
  }

  // 选择所属机构
  onChangeDept = value => {
    this.setState({ chargeDept: value, hasChangeLeave: true })
  }

  handleCancel = () => this.setState({ previewVisible: false })

  getBase64 (file) {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  // 过滤上传条件
  beforeUpload = (file) => {
    const { accept, acceptSuffix } = this.state
    if (!accept.includes(file.type)) {
      message.error('只能上传png，jpeg，jpg格式的图片')
      return false
    }
    return true
  }

  // tab点击切换
  callback = (activeKey) => {
    let { hasChangeLeave } = this.state
    if (hasChangeLeave) {
      Modal.confirm({
        title: '确定?',
        content: `当前页面存在未保存操作，是否丢弃`,
        onOk: () => {
          this.setState({
            activeKey,
            hasChangeLeave: false,
            words: '',
            fileList: [],
            uploadImgUrl: '',
            imageTextObj: [{
              url: '',
              title: '',
              coverPicture: '',
              summary: ''
            }],
            chargeDept: []
          })
        },
        onCancel: () => {}
      })
    } else {
      this.setState({ activeKey })
    }
  }

  // 纯图片预览
  handlePreview = file => {
    if (!file.url && !file.preview) {
      file.preview = this.getBase64(file.originFileObj)
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true
    })
  }

  // 纯图片上传
  handleChange = ({ fileList }) => {
    const { accept } = this.state
    if (fileList.length > 0 && !accept.includes(fileList[fileList.length - 1].type)) {
      return false
    } else {
      let hasErrorList = []
      fileList.map((v, k) => {
        if (v.status === 'error') {
          message.destroy()
          message.error('上传有失败项，请检查重新上传')
        }
        if (!(v.status === 'uploading' || v.status === 'done')) {
          hasErrorList.push(k)
        }
        return v
      })
      hasErrorList.map((v, k) => {
        fileList.splice(v, 1)
        return v
      })
      this.setState({ fileList, uploadImgUrl: fileList[0] ? fileList[0].url[0] : '', hasChangeLeave: true })
    }
  }

  // 纯图片上传接口
  customRequest = (option) => {
    let { fileList } = this.state
    let formData = new window.FormData()
    formData.append('file', option.file, option.file.name)
    axios.post(urls.uploadImg, formData, {headers: {'Content-Type': 'multipart/form-data'}}).then(res => {
      if (res.ret === 0) {
        let url = res.retdata.filePaths
        fileList.push({
          uid: url,
          url: url,
          type: 'image/png',
          status: 'done'
        })
        this.setState({ fileList, uploadImgUrl: fileList[0] ? fileList[0].url[0] : '' })
      }
    }).catch(() => {
      this.setState({ fileList: [] })
    })
  }

  // 改变文字
  changeWords = (name, e) => {
    this.setState({ [name]: e.target.value, hasChangeLeave: true })
  }

  // 纯文字、图片提交保存按钮
  submit = (tabKey, dingshi) => {
    let { uploadImgUrl, words, type, imageTextObj, id, chargeDept, filterDateRange, departmentType } = this.state
    message.destroy()
    let data = {
      messageType: tabKey - 0
    }
    if (id) { // 当前是编辑   默认推送配置   默认推送配置不存在  sendType  字段
      data.messageId = id
    } else { // 当前是新增
      if (type === '1') { // 由图文推送进入的新增
        data.sendType = dingshi ? 2 : 1 // 发送类型：1、立即发送   2、定时发送  3、默认推送
        // 定时推送 推送时间校验
        let inside = moment(filterDateRange).valueOf() > moment().valueOf() && new Date(moment().add(1, 'days').endOf('day')).getTime() > moment(filterDateRange).valueOf()
        if ((dingshi && !filterDateRange) || (dingshi && filterDateRange && !inside)) {
          message.error('请设置正确的推送时间（当前时间点至次日23点59分）')
          return false
        }

        // 定时推送添加推送时间字段
        if (dingshi) {
          data.sendTime = filterDateRange
        }

        // 服务商部门类型为部分 校验部门选择
        if (departmentType === 1 && !chargeDept.length) {
          message.error('请选择部门')
          return false
        }

        data.departmentType = departmentType
        data.departments = chargeDept
      } else { // 默认推送的新增
        data.sendType = 3
      }
    }
    switch (tabKey) {
      case '3':
        if (!uploadImgUrl) {
          message.error('图片不能为空')
          return false
        }
        data.pictureMessage = uploadImgUrl
        // 请求接口
        this.submitAjax(data)
        break
      case '2':
        if (!words.trim()) {
          message.error('内容不能为空')
          return false
        }
        if (words.length > 500) {
          message.error('内容不能超过500个字符')
          return false
        }
        data.textMessage = words
        // 请求接口
        this.submitAjax(data)
        break
      case '1':
        let validator = new Validator()
        imageTextObj.map((v, k) => {
          validator.add(v.url, 'isUrl', `第${k + 1}篇图文处请输入正确的链接`)
          validator.add(v.title, 'isNotEmpty', `第${k + 1}篇图文处请输入标题`)
          validator.add(v.coverPicture, 'isNotEmpty', `第${k + 1}篇图文处请上传封面图`)
          if (k === 0) {
            validator.add(v.summary, 'maxLength: 50', `第${k + 1}篇图文处摘要不能超过50个字符`)
          }
          return v
        })
        var errorMsg = validator.start()
        if (errorMsg) { // 获得效验结果
          message.error(errorMsg, 2)
          return false
        }
        data.pictureTextMessage = {
          mainMessage: {},
          deputyMessages: []
        }
        let deputyMessages = imageTextObj.slice(1, imageTextObj.length)
        deputyMessages = deputyMessages.map((v, k) => {
          delete v.summary
          return v
        })
        data.pictureTextMessage.mainMessage = imageTextObj[0]
        data.pictureTextMessage.deputyMessages = deputyMessages
        this.submitAjax(data)
        break
      default:
        break
    }
  }

  submitAjax = (data) => {
    this.setState({ loading: true })
    axios.post(this.state.id ? urls.defaultMessageUpdate : urls.saveOrPush, data, {headers: {'Content-Type': 'application/json;charset=UTF-8'}}).then(res => {
      if (res.ret === 0) {
        message.success('保存成功', 2)
        this.setState({ loading: false })
        this.props.history.push(`/messageSend?type=${this.state.type}`)
      }
    }).catch(() => {
      this.setState({ loading: false })
    })
  }

  // 图文数据改变
  onChangeImageText = (name, e, idx) => {
    let { imageTextObj } = this.state
    imageTextObj[idx][name] = name === 'coverPicture' ? e : e.target.value
    this.setState({ imageTextObj })
  }

  // 添加
  addImageTextList = () => {
    let { imageTextObj } = this.state
    imageTextObj.push(Tools.deepCopyObj(this.defaultImageTextObj))
    this.setState({ imageTextObj })
  }

  // 删除
  delImageTextList = (idx) => {
    let { imageTextObj } = this.state
    Modal.confirm({
      title: '确定?',
      content: `是否删除该条图文信息`,
      onOk: () => {
        imageTextObj.splice(idx, 1)
        this.setState({ imageTextObj, operaIdx: null })
      },
      onCancel: () => {}
    })
  }

  // 时间范围
  onChangeDate = (date, dateString) => {
    this.setState({ filterDateRange: dateString })
  }

  onChangeDepartmentType = value => {
    this.setState({ departmentType: value })
  }

  render () {
    const { type, id, loading, isLoading, timingModal, departmentType, filterDateRange, chargeDept, activeKey, words, previewVisible, previewImage, fileList, accept, imageTextObj, operaIdx } = this.state
    const itemCol = {
      labelCol: {span: 4},
      wrapperCol: {span: 18}
    }
    return (<div id='NewPage' className='newPage'>
      <Spin spinning={isLoading}>
        <div className='title'>{type === '3' ? `${id ? '编辑' : '新建'}默认配置消息` : `${id ? '编辑' : '新建'}图文推送`}</div>
        <div className='sub-title'>{type === '3' ? `默认信息配置` : `图文推送配置`}</div>
        <div className='tabs'>
          <Button type={ activeKey === '1' ? 'primary' : 'default' } icon="message" onClick={() => this.callback('1')} className='btn'>图文信息</Button>
          <Button type={ activeKey === '2' ? 'primary' : 'default' } icon="file-word" onClick={() => this.callback('2')} className='btn'>文字</Button>
          {/* <Button type={ activeKey === '3' ? 'primary' : 'default' } icon="picture" onClick={() => this.callback('3')} className='btn'>图片</Button> */}
        </div>
        <div>
          {
            activeKey === '1' && <div>
              <div className='image-text-box'>
                <div className='left'>
                  <div className='left-box'>
                    <div className={operaIdx === 0 ? 'big-title-box active-box pointer pointer0' : 'big-title-box pointer pointer0'}>
                      {
                        imageTextObj[0].coverPicture ? <img src={imageTextObj[0].coverPicture} alt='' className='big-image' onClick={() => this.setState({ operaIdx: 0 })}/> : <div className='big-image' onClick={() => this.setState({ operaIdx: 0 })}></div>
                      }
                      {
                        (imageTextObj[0].title || imageTextObj[0].summary) && <div className='big-title'>
                          <p>{imageTextObj[0].title || ''}</p>
                          <p className='big-sub-title'>{imageTextObj[0].summary || ''}</p>
                        </div>
                      }
                      {/* <div className='btn-box btn-box0'>
                        <div className='edit-btn-box' onClick={() => this.setState({ operaIdx: 0 })}>编辑</div>
                      </div> */}
                    </div>
                    {
                      imageTextObj.map((ele, idx) => {
                        if (idx > 0) {
                          return (<div className={idx === operaIdx ? `sub-title-box active-box pointer pointer${idx}` : `sub-title-box pointer pointer${idx}`} key={ele + idx}>
                            <div className='white-bg' onClick={() => this.setState({ operaIdx: idx })}>
                              <div className='sub-title-content text-ellipsis'>{ele.title}</div>
                              {
                                ele.coverPicture ? <img className='small-image' src={ele.coverPicture}/> : <div className='small-image'></div>
                              }
                            </div>
                            <div className={`btn-box btn-box${idx}`}>
                              {/* <div className='edit-btn-box' onClick={() => this.setState({ operaIdx: idx })}>编辑</div> */}
                              <div className='del-btn-box' onClick={() => this.delImageTextList(idx)}>删除</div>
                            </div>
                          </div>)
                        }
                      })
                    }
                    {
                      imageTextObj.length < 4 && <div className='add-btn-box' onClick={this.addImageTextList}>
                        <Icon type="plus" className='add-plus'/>
                      </div>
                    }
                  </div>
                </div>
                <div className='right'>
                  <Form>
                    {
                      imageTextObj.map((v, k) => {
                        if (k === operaIdx) {
                          return (<div key={v + k}>
                            <Row>
                              <Col span={24}>
                                <Form.Item label={<span><span className={'red'}>*</span>链接</span>} {...itemCol}>
                                  <Input value={v.url} onChange={e => this.onChangeImageText('url', e, k)} placeholder="请输入链接" maxLength={200} />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Row>
                              <Col span={24}>
                                <Form.Item label={<span><span className={'red'}>*</span>标题</span>} {...itemCol}>
                                  <Input value={v.title} onChange={e => this.onChangeImageText('title', e, k)} placeholder="请输入标题" maxLength={30} />
                                </Form.Item>
                              </Col>
                            </Row>
                            <Row>
                              <Col span={24}>
                                <Form.Item label={<span><span className={'red'}>*</span>封面图</span>} {...itemCol}>
                                  <div className='tips'>
                                    {
                                      k === 0 ? '推荐尺寸：1068px*455px，不超过2MB，支持JPG、PNG格式' : '推荐尺寸：200px*200px，不超过2MB，支持JPG、PNG格式'
                                    }
                                  </div>
                                  <PushPage size={2} index={k} aspectRatio={k === 0 ? 2.347252747 : 1} imageTextObj={imageTextObj}></PushPage>
                                </Form.Item>
                              </Col>
                            </Row>
                            {
                              k === 0 && <Row>
                                <Col span={24}>
                                  <Form.Item label={<span>摘要</span>} {...itemCol}>
                                    <Input.TextArea autoSize={{ minRows: 5, maxRows: 5 }} placeholder="请输入摘要" value={v.summary} onChange={(e) => this.onChangeImageText('summary', e, k)}/>
                                  </Form.Item>
                                </Col>
                              </Row>
                            }
                          </div>)
                        }
                      })
                    }
                  </Form>
                </div>
              </div>
            </div>
          }
          <Modal
            wrapClassName={'newPage'}
            title={'定时推送'}
            width={640}
            maskClosable={false}
            destroyOnClose={true}
            visible={timingModal}
            onCancel={() => this.setState({ timingModal: false })}
            footer={<div>
              <Button
                type="primary"
                loading={loading}
                onClick={() => this.submit(activeKey, 'dingshi')}
                style={{ marginTop: 16 }}
              >
                定时发送
              </Button>
              <Button
                type=""
                onClick={() => this.setState({ timingModal: false })}
                style={{ marginTop: 16 }}
              >
                取消
              </Button>
            </div>}
          >
            <Form>
              <Row>
                <Col span={24}>
                  <p>你可以选择今、明两天内任意时刻定时群发，成功设置后不支持修改，但在设定的时间之前可取消。</p>
                  <Form.Item label={<span><span className='red'>*</span>发送时间</span>} labelCol={{ span: 4 }}
                    wrapperCol={{ span: 20 }}
                    extra={``}>
                    <DatePicker
                      showTime={{ format: 'HH:mm' }}
                      format="YYYY-MM-DD HH:mm"
                      value={filterDateRange ? moment(filterDateRange, 'YYYY-MM-DD HH:mm') : null}
                      onChange={this.onChangeDate}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>
          {
            activeKey === '2' && <div>
              <div className='words-box'>
                <Input.TextArea autoSize={{ minRows: 15, maxRows: 15 }} placeholder="请输入文字" value={words} onChange={(e) => this.changeWords('words', e)}/>
                <span className={words.length > 500 ? 'error' : ''}>{words.length || 0}/500</span>
              </div>
            </div>
          }
          {
            activeKey === '3' && <div>
              <div className='upload-box'>
                <Upload
                  accept={accept.join(',')}
                  // action={action || 'https://www.mocky.io/v2/5cc8019d300000980a055e76'}
                  listType="picture-card"
                  fileList={fileList}
                  beforeUpload={this.beforeUpload}
                  onPreview={this.handlePreview}
                  onChange={this.handleChange}
                  customRequest={this.customRequest}
                  showUploadList={{'showDownloadIcon': false}}
                >
                  {fileList.length >= 1 ? null : <div>
                    <Icon type="plus" className='add-plus'/>
                    <div className="ant-upload-text">点击上传</div>
                  </div>}
                </Upload>
                <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
                  <img alt="example" style={{ width: '100%', marginTop: '20px' }} src={previewImage} />
                </Modal>
              </div>
            </div>
          }
          {
            type === '3' ? <div className='btn-box'>
              <Button type="primary" onClick={() => this.submit(activeKey)} loading={loading}>保存</Button>
            </div> : <div className='btn-box'>
              <Form>
                <Row>
                  <Col span={24}>
                    <Form.Item
                      wrapperCol={{ span: departmentType ? 10 : 6 }}>
                      <span className='label'>群发对象：</span>
                      <DeptTreeSelect value={chargeDept} onChange={this.onChangeDept}/>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
              <div>
                <Button type="primary" onClick={() => this.submit(activeKey)} loading={loading}>群发</Button>
                <Button type="primary" onClick={() => this.setState({ timingModal: true })} disabled={loading}>定时推送</Button>
              </div>
            </div>
          }
        </div>
      </Spin>
    </div>)
  }
}
