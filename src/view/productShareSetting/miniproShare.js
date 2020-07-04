import React, { Component } from 'react'
import { Form, Row, Col, Icon, Input, Button, message } from 'antd'
import styles from './index.less'
import urls from '@src/config'
import axios from '@src/utils/axios'
import UploadDragger from '@src/view/newsAddInternal/uploadDragger'
const { TextArea } = Input
const defaultImg = require('@src/assets/product-1.png')
// 外观配置
export default class MiniproShare extends Component {
  constructor (props) {
    super(props)
    this.state = {
      productTitle: '我觉得这个产品挺适合您的，快来了解一下~',
      titleColor: '#333',
      productDescription: null,
      isFinishedUploadImg: false,
      onChangeColor: '',
      imgUrl: null,
      initFileList: false,
      previewDescFileListFromService: []
    }
    this.isCreate = true
    this.id = null
  }

  componentDidMount () {
    this.pullData()
  }

  pullData = () => {
    this.setState({ loading: true })
    const params = { appType: 'APPLET' }
    axios.post(urls.shareGetConfig, params, {headers: {'Content-Type': 'application/json'}}).then(res => {
      const { title = '', desc = '', imgUrl = '', dateCreated = '', id = '', colorValue = '' } = res.retdata
      this.isCreate = !dateCreated
      this.id = id
      this.setState({
        loading: false,
        productTitle: title,
        productDescription: desc,
        titleColor: colorValue,
        onChangeColor: colorValue,
        imgUrl,
        initFileList: !!imgUrl,
        previewDescFileListFromService: [imgUrl]
      })
    })
  }

  onChangeProductTitleType = (e) => {
    this.setState({ productTitleType: e.target.value })
  }

  onChangeTitleColor = e => {
    const { value } = e.target
    this.setState({
      onChangeColor: value
    })
  }

  updateImgFileList = fileList => {
    this.setState({
      isFinishedUploadImg: false,
      imgUrl: fileList[0] || defaultImg,
      initFileList: false
    })
  }

  previewColor = () => {
    const { onChangeColor } = this.state
    const testColor = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(onChangeColor)
    if (!testColor) {
      return message.warn('色号输入不合法')
    }
    this.setState({
      titleColor: onChangeColor
    })
  }

  onNameChange = (e) => {
    const { value } = e.target
    this.setState({
      productTitle: value
    })
  }

  submitShare = () => {
    const { productTitle, imgUrl } = this.state
    let onChangeColor = this.state.onChangeColor || '#f0f0f0'
    const testColor = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(onChangeColor)
    if (!testColor) {
      return message.warn('色号输入不合法')
    }
    let params = {
      appType: 'APPLET',
      title: productTitle,
      imgUrl,
      colorValue: onChangeColor
    }
    if (this.id) {
      params.id = this.id
    }
    const action = this.isCreate ? urls.shareAddConfig : urls.shareUpdateConfig
    axios.post(action, params, {headers: {'Content-Type': 'application/json'}}).then(res => {
      message.success('保存成功')
      this.pullData()
    })
  }

  render () {
    const itemCol = {
      labelCol: {span: 3},
      wrapperCol: {span: 12}
    }
    const {
      productTitle,
      titleColor,
      onChangeColor,
      isFinishedUploadImg,
      imgUrl,
      previewDescFileListFromService,
      initFileList
    } = this.state
    const shareImg = imgUrl || defaultImg
    const extraData = {
      bizKey: 'productTypeLogo',
      file: 'MultipartFile'
    }
    return (
      <div className={styles.minipro_content}>
        <div className={styles.left_view}>
          <Form >
            <Row>
              <Col span={24}>
                <Form.Item label={'标题配置：'} {...itemCol}>
                  <TextArea
                    style={{width: '80%'}}
                    maxLength={30}
                    value={productTitle}
                    onChange={this.onNameChange}
                    placeholder={'我觉得这个产品挺适合您的，快来了解一下~'}
                    autoSize={{ minRows: 3, maxRows: 5 }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label={'摘要描述：'} {...itemCol}>
                  <div style={{marginRight: 20}}>
                  例如展示产品名称和收益，请选择字体的色号
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', margin: '20px 0'}}>
                    <span>*输入色号</span>
                    <Input onChange={this.onChangeTitleColor} value={onChangeColor}
                      placeholder={'#f0f0f0'} style={{width: 200, marginLeft: 10}}/>
                    <Button style={{marginLeft: 20}} type="primary" onClick={this.previewColor}>预览</Button>
                    <span style={{display: 'inline-block', marginLeft: 20, width: 60, height: 60, backgroundColor: titleColor}}></span>
                  </div>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label={'图标：'} {...itemCol}>
                  <UploadDragger
                    fileType={'image'}
                    fileSize={2}
                    isNewAction={true}
                    wrongRegHint={'只能上传PNG、JPG格式的文件'}
                    wrongSizeHint={'文件必须2M以内'}
                    placeholder={'若不上传，则系统会默认icon，建议尺寸450*360'}
                    uploadAction={urls.fileUpload}
                    updateFileList={this.updateImgFileList}
                    isFinishedUpload={isFinishedUploadImg}
                    extraData={extraData}
                    previewDescFileListFromService={previewDescFileListFromService}
                    initFileList={initFileList}
                    allowedDeleted={true}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <Button style={{marginTop: 20, marginLeft: 140}} type="primary" onClick={this.submitShare}>保存</Button>
        </div>
        <div className={styles.right_view}>
          <div className={styles.dome_title}>样例展示</div>
          <div className={styles.demo_view}>
            <div className={styles.demo_view_top}>
              <div className={styles.demo_view_title}>
                {productTitle}
              </div>
            </div>
            <div className={styles.demo_view_bottom}>
              <div className={styles.rate_view}>
                <div style={{color: titleColor}} className={styles.rate_title}>产品的名称</div>
                <div style={{color: titleColor}} className={styles.rate_number}>3.6%~4.6%</div>
                <div style={{color: titleColor}} className={styles.rate_desc}>收益范围</div>
              </div>
              <img src={shareImg} alt="" className={styles.share_img} style={{maxHeight: 200}}/>
              <div className={styles.bottom_dec}>小程序</div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
