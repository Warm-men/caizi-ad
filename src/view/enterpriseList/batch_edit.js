import React, { Component } from 'react'
import { Input, Upload, message, Icon, Tag, Modal } from 'antd'
import styles from './index.less'
import axios from '@src/utils/axios'
import DeptTreeSelect from '@src/components/DeptTreeSelect'
import urls from '@src/config'

class BatchEdit extends Component {
  constructor (props) {
    super(props)
    this.state = {
      corpType: null,
      managerQRCodeUrl: null,
      tags: [],
      inputVisible: false,
      inputValue: '',
      deptValue: null,
      manager: null,
      visible: true
    }
  }

  getString = data => {
    if (!data.length) return
    let str = data.join('、').slice(0, 30)
    str = str.length < 30 ? str : str + '...'
    return str
  }

  onChangeCorpType = e => {
    this.setState({ corpType: e.target.value })
  }

  onChangeManager = e => {
    this.setState({ manager: e.target.value })
  }

  selectDept = value => {
    this.setState({ deptValue: value })
  }

  handleInputChange = e => {
    this.setState({ inputValue: e.target.value })
  }

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus())
  }

  handleInputConfirm = () => {
    const { inputValue } = this.state
    let { tags } = this.state
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue]
    }
    this.setState({
      tags,
      inputVisible: false,
      inputValue: ''
    })
  }

  saveInputRef = input => (this.input = input)

  handleClose = removedTag => {
    const tags = this.state.tags.filter(tag => tag !== removedTag)
    this.setState({ tags })
  }

  // handleChange = ({file}) => {
  //   const managerQRCodeUrl = file.response && file.response.retdata && file.response.retdata.filePaths[0]
  //   this.setState({ managerQRCodeUrl })
  // }

  beforeUpload = file => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
      message.error('图片格式仅支持JPG/PNG')
    }
    return isJpgOrPng
  }
  customRequest = (option) => {
    const corpId = this.props.selectedRowKeys[0] // 企业传任意一个
    let formData = new window.FormData()
    formData.append('file', option.file, option.file.name)
    formData.append('bizKey', 'pplink/company')
    formData.append('corpId', corpId)
    axios.post(urls.uploadImg, formData, {headers: {'Content-Type': 'multipart/form-data'}}).then(res => {
      if (res.ret === 0) {
        const managerQRCodeUrl = res.retdata.filePath
        this.setState({ info: {...this.state.info, managerQRCodeUrl} })
      }
    }).catch(() => {
      // this.setState({ isUploading: false })
    })
  }
  handleOk = () => {
    const { corpType, deptValue: branchId, manager, managerQRCodeUrl, tags } = this.state
    const params = {
      corpType,
      branchId,
      manager,
      managerQRCodeUrl,
      tags,
      corpIds: this.props.selectedRowKeys
    }
    if (!corpType || !branchId || !manager || !tags.length || !managerQRCodeUrl) {
      message.error('必填参数不能为空')
      return
    }
    axios.post(urls.batchEtpModify, params, {headers: {'Content-Type': 'application/json'}}).then(res => {
      this.props.onCallBack(true)
    })
  }

  handleCancel = () => {
    this.props.onCallBack(false)
  }

  filterArray = (arr) => {
    const nextArr = arr.filter(item => item)
    return nextArr
  }

  render () {
    const selectedTable = this.filterArray(this.props.selectedTable)
    const {
      corpType,
      deptValue,
      managerQRCodeUrl,
      loading,
      tags,
      inputValue,
      inputVisible,
      manager,
      visible
    } = this.state
    const selectedTableNameString = this.getString(selectedTable)

    const uploadButton = (
      <div>
        <Icon type={loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">上传二维码</div>
      </div>
    )

    return (
      <div className={styles.batch_edit_view}>
        <Modal
          title="批量补充信息"
          visible={visible}
          onOk={this.handleOk}
          width={1000}
          onCancel={this.handleCancel}
        >
          <div className={styles.descript_view}>所填写字段信息，将自动补充到所有企业详情</div>
          <div className={styles.selected_count_view}>
            选择企业：{selectedTable.length}个（{selectedTableNameString}）
          </div>
          <div className={styles.title_text}>企业信息</div>
          <div className={styles.input_view}>
            <span className={styles.input_type}>企业类型（必填）</span>
            <Input style={{ width: 200 }} value={corpType} onChange={this.onChangeCorpType} placeholder={'请输入'} />
          </div>
          <div className={styles.title_text}>银行信息</div>
          <div className={styles.input_view}>
            <span className={styles.input_type}>归属分支行（必填）</span>
            <DeptTreeSelect multiple={false} style={{ width: 350 }} onChange={this.selectDept} value={deptValue}/>
            <span className={styles.input_type} style={{marginLeft: 30}}>归属客户经理（必填）</span>
            <Input style={{ width: 200 }} value={manager} onChange={this.onChangeManager} placeholder={'请输入'} />
          </div>
          <div className={styles.upload_img}>
            <span className={styles.upload_img_name}>归属客户经理二维码（必填）</span>
            <Upload
              name="avatar"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              // action={urls.uploadImg}
              beforeUpload={this.beforeUpload}
              // onChange={this.handleChange}
              customRequest={this.customRequest}
            >
              {managerQRCodeUrl ? <img src={managerQRCodeUrl} alt="二维码" style={{ width: '100%' }} /> : uploadButton}
            </Upload>
          </div>
          <div className={styles.tag_view}>
            <div className={styles.title_text_tags}>标签信息（必填）</div>
            {tags.map((tag, index) => {
              const tagElem = (
                <Tag key={tag} closable={true} onClose={() => this.handleClose(tag)}>
                  {tag}
                </Tag>
              )
              return tagElem
            })}
            {inputVisible && (
              <Input
                ref={this.saveInputRef}
                type="text"
                size="small"
                style={{ width: 78 }}
                value={inputValue}
                onChange={this.handleInputChange}
                onBlur={this.handleInputConfirm}
                onPressEnter={this.handleInputConfirm}
              />
            )}
            {!inputVisible && (
              <Tag onClick={this.showInput} style={{ background: '#fff', borderStyle: 'dashed' }}>
                <Icon type="plus" /> 添加标签
              </Tag>
            )}
          </div>
        </Modal>
      </div>
    )
  }
}

export default BatchEdit
