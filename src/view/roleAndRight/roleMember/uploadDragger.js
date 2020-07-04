import React, { Component } from 'react'
import {
  message,
  Spin,
  Upload,
  Icon
} from 'antd'

export default class UploadDragger extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isUploading: false,
      fileList: []
    }
  }
  componentWillReceiveProps (next) {}
  // 是否pdf|doc|docx文件
  checkFile = (fileName) => {
    const reg = /^.*\.(?:xls|xlsx)$/i
    return reg.test(fileName)
  }

  // 上传前 校验文件
  beforeUpload = (file, fileList) => {
    const checked = this.checkFile(file.name)
    const {
      fileSize = 1,
      wrongRegHint = '只能上传xls、xlsx格式的文件',
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
    this.setState({ fileList, isUploading: false })
    this.props.updateFileList(fileList)
    return false
  }

  onRemove = file => {
    this.setState(state => {
      const index = state.fileList.indexOf(file)
      const newFileList = state.fileList.slice()
      newFileList.splice(index, 1)
      return {
        fileList: newFileList
      }
    })
  }

  render () {
    const placeholder = '支持xls、xlsx格式的文件，2M以内'
    const { isUploading, fileList } = this.state
    return (
      <Spin spinning={isUploading}>
        <Upload.Dragger
          onChange={this.onChangeUpload}
          beforeUpload={this.beforeUpload}
          fileList={fileList}
          onRemove={this.onRemove}
        >
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <p className="ant-upload-hint">
            {(fileList.length) ? <span>文件已上传，可再次点击或者拖拽重新上传</span> : <span>点击或者拖拽上传</span>}
          </p>
          <span>{(fileList.length) ? null : placeholder }</span>
        </Upload.Dragger>
      </Spin>
    )
  }
}
