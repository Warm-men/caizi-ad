import React, { Component } from 'react'
import {
  message,
  Spin,
  Upload,
  Icon
} from 'antd'
import axios from '@src/utils/axios'

export default class UploadDragger2 extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isUploading: false,
      fileList: [],
      previewDescFileList: []
    }
  }
  componentWillReceiveProps (next) {
    if (next.isFinishedUpload) {
      this.setState({
        isUploading: false,
        fileList: [],
        previewDescFileList: []
      })
    }
  }
  // 是否pdf|doc|docx文件
  checkFile = (fileName) => {
    const { fileType } = this.props
    const reg = /^.*\.(?:png|jpg|jpeg)$/i
    return reg.test(fileName)
  }

  // 上传前 校验文件
  beforeUpload = (file, fileList) => {
    const checked = this.checkFile(file.name)
    const {
      fileSize = 1,
      wrongRegHint = '只能上传txt、doc、docx格式的文件',
      wrongSizeHint = '文件必须2M以内'
    } = this.props
    const isLimittedSize = file.size / 1024 / 1024 < fileSize
    if (!checked) {
      message.error(wrongRegHint)
      return false
    }
    if (!isLimittedSize) {
      message.error(wrongSizeHint)
      return false
    }
    this.setState({ fileList: [file] })
  }

  // 上传文件
  onChangeUpload = ({ file, fileList }) => {
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
    this.setState({ fileList }, () => {
      this.setPropsList()
    })
  }

  onRemoveUpload = (file) => {
    this.setState({ fileList: [] })
  }

  customRequest = (option) => {
    this.setState({ isUploading: true })
    let { fileList } = this.state
    let formData = new window.FormData()
    formData.append('file', option.file, option.file.name)
    formData.append('bizKey', 'sidebar/img')
    axios.post(this.props.uploadAction, formData, {headers: {'Content-Type': 'multipart/form-data'}}).then(res => {
      if (res.ret === 0) {
        this.setState({ previewDescFileList: [res.retdata.filePath], isUploading: false }, () => {
          this.setPropsList()
        })
      }
    }).catch(() => {
      this.setState({ isUploading: false })
    })
  }

  setPropsList () {
    const { fileList, previewDescFileList } = this.state
    let imgList = []
    fileList.map((v, k) => {
      if (v.url) {
        imgList.push(v.url)
      }
      return v
    })
    if (!imgList.length && previewDescFileList.length) {
      imgList = [previewDescFileList[0]]
    }
    this.props.updateFileList(imgList)
  }

  render () {
    const {
      placeholder = '支持上传doc、docx、txt格式的文件，大小须在2M内',
      uploadAction
    } = this.props
    const { isUploading, fileList, previewDescFileList } = this.state
    return (
      <Spin spinning={isUploading}>
        <Upload.Dragger
          action={uploadAction}
          onChange={this.onChangeUpload}
          beforeUpload={this.beforeUpload}
          fileList={fileList}
          onRemove={this.onRemoveUpload}
          customRequest={this.customRequest}
          showUploadList={false}
        >
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <span>{placeholder}</span>
          <p className="ant-upload-hint">
            {previewDescFileList.length ? <span>文件已上传，可再次点击或者拖拽重新上传</span> : <span>点击或者拖拽上传</span>}
          </p>
        </Upload.Dragger>
        {previewDescFileList.length ? <div>
          <div>文件预览</div>
          <div className={'previewArea'}>
            {previewDescFileList.map(item => {
              return <img src={item} key={item} alt="" style={{width: 100}}/>
            })}
          </div>
        </div> : null}
      </Spin>
    )
  }
}
