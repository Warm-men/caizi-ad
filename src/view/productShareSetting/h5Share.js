import React, { Component } from 'react'
import { Form, Row, Col, Icon, Input, Button, message } from 'antd'
import styles from './index.less'
import urls from '@src/config'
import axios from '@src/utils/axios'
import UploadDragger from '@src/view/newsAddInternal/uploadDragger'
const { TextArea } = Input
const defaultImg = require('@src/assets/product-h5.png')
export default class H5Share extends Component {
  constructor (props) {
    super(props)
    this.state = {
      productTitle: '',
      productName: '产品的名称',
      productDescription: '我觉得这个产品挺适合您的，快来了解一下~',
      iconUrl: null,
      name: null,
      isFinishedUploadImg: false,
      loading: false,
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
    const params = { appType: 'H5' }
    axios.post(urls.shareGetConfig, params, {headers: {'Content-Type': 'application/json'}}).then(res => {
      const { title = '', desc = '', imgUrl = '', dateCreated = '', id = '' } = res.retdata
      this.isCreate = !dateCreated
      this.id = id
      this.setState({
        loading: false,
        productTitle: title,
        productDescription: desc,
        iconUrl: imgUrl,
        initFileList: !!imgUrl,
        previewDescFileListFromService: [imgUrl]
      })
    })
  }

  onSubmit = () => {
    const { productTitle, productDescription, iconUrl } = this.state
    let params = {
      appType: 'H5',
      title: productTitle,
      desc: productDescription,
      imgUrl: iconUrl
    }
    if (this.id) {
      params.id = this.id
    }
    const action = this.isCreate ? urls.shareAddConfig : urls.shareUpdateConfig
    axios.post(action, params, {headers: {'Content-Type': 'application/json'}}).then(res => {
      message.success('保存成功')
    })
  }

  onNameChange = (e) => {
    this.setState({
      productTitle: e.target.value
    })
  }

  onDescChange = (e) => {
    this.setState({
      productDescription: e.target.value
    })
  }

  updateImgFileList = fileList => {
    this.setState({
      isFinishedUploadImg: false,
      iconUrl: fileList[0] || '',
      initFileList: false
    })
  }

  render () {
    const {
      productName,
      productDescription,
      iconUrl,
      isFinishedUploadImg,
      productTitle,
      previewDescFileListFromService,
      initFileList
    } = this.state
    const itemCol = {
      labelCol: {span: 3},
      wrapperCol: {span: 12}
    }
    const extraData = {
      bizKey: 'productTypeLogo',
      file: 'MultipartFile'
    }
    const shareImg = iconUrl || defaultImg
    return (
      <div className={styles.h5_share_content}>
        <div className={styles.left_view}>
          <Form >
            <Row>
              <Col span={24}>
                <Form.Item label={'标题配置：'} {...itemCol}>
                  <TextArea
                    style={{width: '80%'}}
                    maxLength={15}
                    value={productTitle}
                    onChange={this.onNameChange}
                    placeholder={'可在产品名称之前输入相应的文案，例如企业名'}
                    autoSize={{ minRows: 3, maxRows: 5 }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label={'摘要描述：'} {...itemCol}>
                  <TextArea
                    style={{width: '80%'}}
                    maxLength={30}
                    value={productDescription}
                    onChange={this.onDescChange}
                    placeholder={'我觉得这个产品挺适合您的，快来了解一下~'}
                    autoSize={{ minRows: 3, maxRows: 5 }}
                  />
                  <span style={{display: 'block'}}>
                  *摘要描述会优先取“产品特点”字段，若“产品特点”为空，则会取此处的摘要描述
                  </span>
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
                    placeholder={'若不上传，则系统会默认“热门产品”的icon，建议200*200'}
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
          <Button style={{marginTop: 20, marginLeft: 140}} type="primary" onClick={this.onSubmit}>保存</Button>
        </div>

        <div className={styles.right_view}>
          <div className={styles.dome_title}>样例展示</div>
          <div className={styles.demo_view}>
            <div className={styles.demo_view_left}>
              <div className={styles.demo_view_left_title}>
                {productTitle + productName}
              </div>
              <div className={styles.demo_view_left_des}>
                {productDescription || '请添加描述'}
              </div>
            </div>
            <div className={styles.demo_view_right}>
              <img src={shareImg} alt={''} className={styles.iconUrl} style={{width: 80, maxHeight: 80}} />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
