import React, { Component, Fragment } from 'react'
import { Modal, Select, Input, Spin, message } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import DeptTreeSelect from '@src/components/DeptTreeSelect'
import './fileModal.less'

class FileModal extends Component {
  state = {
    departmentIds: [],
    sceneCode: '',
    fileName: '',
    sceneTypeCode: '',
    sceneTypeList: [],
    loading: false,
    fileList: []
  }
  accept = [
    'application/msword',
    'application/vnd.ms-excel',
    'application/pdf',
    'video/mp4',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]

  deptListIds = []

  componentDidMount = () => {
    this.getIcons()
    if (this.props.fileModalType === 'update') this.getFileInfo()
  }
  // 获取图标
  getIcons = () => {
    axios.post(urls.getIcons).then((res) => {
      if (res.ret === 0) {
        this.setState({ icons: res.retdata.list || [] })
      }
    })
  }
  // 获取文件信息
  getFileInfo = () => {
    this.setState({ loading: true })
    const { senceList, fileRecord } = this.props
    axios.post(urls.fileInfo, { id: fileRecord.id }).then((res) => {
      if (res.ret === 0) {
        const { retdata = {} } = res
        let {
          sceneCode,
          sceneTypeCode,
          fileType,
          fileName,
          fileSize,
          fileUrl,
          departmentIds
        } = retdata
        const splitIndex = fileName.lastIndexOf('.')
        this.fileNameType = fileName.slice(splitIndex)
        const sceneTypeList = (senceList.find((item) => item.code === sceneCode) || {}).typeList || []
        this.setState({
          sceneCode,
          sceneTypeList,
          sceneTypeCode,
          fileType,
          fileName: fileName.slice(0, splitIndex),
          fileSize,
          departmentIds,
          loading: false,
          fileList: [{ name: fileName, type: fileType, size: fileSize, fileUrl }]
        })
      } else {
        this.setState({ loading: false })
      }
    })
  }
  // 确定按钮事件
  onOk = () => {
    if (this.isAddLoading) return
    this.isAddLoading = true
    const { departmentIds, sceneCode, sceneTypeCode, fileName, fileList, fileSize, sceneTypeList } = this.state
    const { fileModalType, close, fileRecord, senceList } = this.props

    const size =
      typeof fileSize === 'number' ? (fileSize < 512 * 1024 ? `${(fileSize / 1024).toFixed(2)}Kb` : `${(fileSize / 1024 / 1024).toFixed(2)}Mb`) : fileSize

    const { id: sceneId, desc: sceneDesc } = senceList.find((item) => item.code === sceneCode) || {}

    const { id: sceneTypeId, desc: sceneTypeDesc } = sceneTypeList.find((item) => item.code === sceneTypeCode) || {}

    const params = {
      departmentIds,
      sceneId,
      sceneCode,
      sceneDesc,
      sceneTypeId: sceneTypeId || '',
      sceneTypeCode,
      sceneTypeDesc: sceneTypeDesc || '',
      fileName: fileName + this.fileNameType,
      fileSize: size
    }
    if (!departmentIds.length) {
      message.error('请选择机构')
      this.isAddLoading = false
      return
    }
    if (!sceneCode || !fileName) {
      message.error(!sceneCode ? '请选择文件场景' : '请输入文件名')
      this.isAddLoading = false
      return
    }
    if (((fileModalType === 'update' && this.fileRequired) || fileModalType === 'add') && !fileList.length) {
      message.error('请选择文件')
      this.isAddLoading = false
      return
    }
    if (fileModalType === 'update') {
      params.id = fileRecord.id
    }
    this.setState({ loading: true })

    const formData = new window.FormData()
    const file = fileList[0]

    Object.keys(params).forEach((key) => {
      formData.append(key, params[key])
    })

    if ((fileModalType === 'update' && this.fileRequired) || fileModalType === 'add') {
      formData.append('uploadFile', file, file.name)
    } else {
      formData.append('fileId', fileRecord.fileId)
    }

    axios
      .post(urls.fileAdd, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => {
        if (res.ret === 0) close(true)
        this.isAddLoading = false
      })
      .catch(() => {
        this.isAddLoading = false
        this.setState({ loading: false })
      })
  }
  onCancel = () => {
    this.props.close()
  }
  // 变更部门
  deptChange = (departmentIds) => {
    this.setState({ departmentIds })
  }
  // select change
  formChange = (value, field) => {
    const state = { [field]: value }
    if (field === 'sceneCode') {
      const { senceList } = this.props
      const sceneTypeList = (senceList.find((item) => item.code === value) || {}).typeList || []
      state.sceneTypeList = sceneTypeList
      state.sceneTypeCode = ''
    }
    if (field === 'fileName' && value.length >= 20) return
    this.setState(state)
  }
  // 过滤上传条件
  beforeUpload = (file) => {
    // const { type } = file
    // if (!this.accept.includes(type)) {
    //   message.error('只能上传pdf、word、excel、mp4文件')
    //   return false
    // }
    const fileTypeArr = file.name.split('.')
    const fileType = fileTypeArr[fileTypeArr.length - 1].toLowerCase()
    if (!['docx', 'doc', 'xlsx', 'xls', 'pdf', 'mp4'].includes(fileType)) {
      message.error('只能上传pdf、word、excel、mp4文件')
      return false
    }
    const size = file.size / 1024 / 1024
    const limitSize = file.name.slice(-4) === '.mp4' ? 10 : 2
    if (size > limitSize) {
      message.error(`${file.name.slice(-4) === '.mp4' ? '视频' : ''}文件必须${limitSize}M以内`)
      return false
    }
    return true
  }
  // 文件change
  fileChange = (e) => {
    const file = e.target.files[0]
    const canUpload = this.beforeUpload(file)
    console.log(file)
    if (canUpload) {
      this.fileRequired = true
      const { type, name, size } = file
      const splitIndex = name.lastIndexOf('.')
      this.fileNameType = name.slice(splitIndex)
      this.setState({ fileType: type, fileSize: size, fileName: name.slice(0, splitIndex), fileList: [file] })
    }
  }
  // 删除文件
  fileRemove = () => {
    this.refs.fileInput.value = ''
    this.fileRequired = true
    this.fileNameType = ''
    this.setState({ fileList: [], fileName: '', fileSize: 0, fileType: '' })
  }
  // 下载文件
  fileDownLoad = (file) => {
    if (file.fileUrl) {
      let a = document.createElement('a')
      a.setAttribute('href', file.fileUrl)
      a.setAttribute('target', '_blank')
      a.setAttribute('download', file.name)
      a.click()
      a = null
    }
  }

  render = () => {
    const { departmentIds, sceneCode, fileName, sceneTypeList, sceneTypeCode, loading, fileList, icons = [] } = this.state
    const file = fileList[0] || {}
    const { size = 0 } = file
    const fileSize = typeof size === 'number' ? (size < 512 * 1024 ? `${(size / 1024).toFixed(2)}Kb` : `${(size / 1024 / 1024).toFixed(2)}Mb`) : size
    const fileSplits = file.name ? file.name.split('.') : []
    const iconUrl = (icons.find((item) => item.iconType === fileSplits[fileSplits.length - 1]) || {}).iconUrl
    const { fileModalType, senceList } = this.props
    const { Option } = Select
    const title = fileModalType === 'add' ? '添加文件' : '编辑文件'
    return (
      <Modal className="file-modal" title={title} visible={true} onOk={this.onOk} onCancel={this.onCancel}>
        <Spin spinning={loading}>
          <div className="form">
            <div className="label"><span>*</span>选择所属机构：</div>
            <div className="value">
              <DeptTreeSelect onChange={this.deptChange} style={{ width: 240 }} value={departmentIds}/>
              <div className="tips">设置完所属机构后，此文件仅在所属机构的客户经理企业微信侧边栏中出现</div>
            </div>
          </div>

          <div className="form">
            <div className="label">
              <span>*</span>文件场景：
            </div>
            <Select className="value" value={sceneCode} onChange={(value) => this.formChange(value, 'sceneCode')}>
              {senceList.map((item, index) => (
                <Option key={item.code} value={item.code}>
                  {item.desc}
                </Option>
              ))}
            </Select>
          </div>

          <div className="form">
            <div className="label">二级分类：</div>
            <Select className="value" value={sceneTypeCode} onChange={(value) => this.formChange(value, 'sceneTypeCode')}>
              {sceneTypeList.map((item, index) => (
                <Option key={item.code} value={item.code}>
                  {item.desc}
                </Option>
              ))}
            </Select>
          </div>

          <div className="form">
            <div className="label">
              <span>*</span>上传文件：
            </div>
            <div className="value">
              <div className={`file-info ${fileList.length ? 'relative' : ''}`}>
                {fileList.length ? (
                  <Fragment>
                    <img className="file-icon" src={iconUrl} />
                    <div onClick={() => this.fileDownLoad(file)} className="file-name">
                      {file.name}
                    </div>
                    <div className="file-size">{fileSize}</div>
                    <img onClick={this.fileRemove} className="file-del" src={require('@src/assets/x.png')} />
                  </Fragment>
                ) : (
                  '点击上传文件'
                )}
              </div>
              <input
                ref="fileInput"
                className="file-input"
                type="file"
                // accept={this.accept.join(',')}
                onChange={this.fileChange}
              />
              <div className="tips">文件支持word、pdf、excel格式，文件大小限制2M。mp4格式，文件大小限制10M</div>
            </div>
          </div>

          <div className="form">
            <div className="label">
              <span>*</span>文件名称：
            </div>
            <Input className="value" value={fileName} onChange={(e) => this.formChange(e.target.value, 'fileName')} placeholder="请输入文件名称，限制20字" />
          </div>
        </Spin>
      </Modal>
    )
  }
}

export default FileModal
