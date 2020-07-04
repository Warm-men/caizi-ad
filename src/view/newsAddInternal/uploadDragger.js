import React, { Component } from 'react'
import {
  message,
  Spin,
  Upload,
  Icon,
  Modal
} from 'antd'

export default class UploadDragger extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isUploading: false,
      fileList: [],
      previewDescFileList: [],
      htmlFromService: null
    }
  }
  componentWillReceiveProps (next) {
    if (next.isFinishedUpload) {
      this.setState({
        isUploading: false,
        fileList: [],
        previewDescFileList: [],
        htmlFromService: null
      })
    }
    if (next.initFileList) {
      this.setState({
        previewDescFileList: next.previewDescFileListFromService
      })
    }
  }
  // 是否pdf|doc|docx文件
  checkFile = (fileName) => {
    const { fileType } = this.props
    const reg = fileType === 'image' ? /^.*\.(?:png|jpg|jpeg)$/i : /^.*\.(?:txt|doc|docx)$/i
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
    if (file.status === 'uploading') {
      this.setState({ isUploading: true })
      return
    }
    if (file.status === 'done') {
      if (file.response.ret === -1) {
        this.setState({
          fileList: [],
          isUploading: false
        })
        message.warning('上传失败')
      } else {
        this.reportResponse(file)
      }
    }
  }

  reportResponse = file => {
    const { fileType, updateFileList, isNewAction = false } = this.props
    if (fileType === 'image') {
      const previewDescFileList = isNewAction ? [file.response.retdata.filePath] : file.response.retdata.filePaths
      this.setState({
        fileList: [],
        previewDescFileList,
        isUploading: false
      })
      updateFileList(previewDescFileList)
    } else {
      this.setState({
        fileList: [],
        htmlFromService: file.response.retdata.html,
        isUploading: false
      })
      updateFileList(file.response.retdata.html)
    }
  }

  beforeDelete = (ev, record) => {
    ev.preventDefault()
    const _this = this
    Modal.confirm({
      title: '确认删除图片吗？',
      content: '删除图片后将使用默认图片',
      onOk () {
        _this.onRemoveUpload()
      },
      onCancel () {}
    })
  }

  onRemoveUpload = (file) => {
    this.setState({ fileList: [], previewDescFileList: [] })
    this.props.updateFileList([])
  }

  render () {
    const {
      placeholder = '支持上传doc、docx、txt格式的文件，大小须在2M内',
      uploadAction,
      extraData = {},
      isHidePreview = false,
      fileType,
      allowedDeleted = false
    } = this.props
    const { isUploading, fileList, previewDescFileList, htmlFromService } = this.state
    return (
      <Spin spinning={isUploading}>
        <Upload.Dragger
          action={uploadAction}
          onChange={this.onChangeUpload}
          beforeUpload={this.beforeUpload}
          fileList={fileList}
          data={extraData}
        >
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <span>{(previewDescFileList.length || htmlFromService) ? null : placeholder }</span>
          <p className="ant-upload-hint">
            {(previewDescFileList.length || htmlFromService) ? <span>文件已上传，可再次点击或者拖拽重新上传</span> : <span>点击或者拖拽上传</span>}
          </p>
        </Upload.Dragger>
        {!isHidePreview && previewDescFileList.length ? <div>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fafafa', marginTop: 20, padding: '0 10px', border: '1px dashed #d9d9d9', borderRadius: 4}}>
            <div className={'previewArea'}>
              <div>文件预览</div>
              {previewDescFileList.map(item => {
                return <img src={item} key={item} alt="" style={{width: 100}}/>
              })}
            </div>
            {fileType === 'image' && allowedDeleted ? <Icon type="delete" onClick={this.beforeDelete} style={{fontSize: 30, cursor: 'pointer'}} /> : null}
          </div>
        </div> : null}
      </Spin>
    )
  }
}
