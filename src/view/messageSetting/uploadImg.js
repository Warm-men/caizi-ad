import React, { Component } from 'react'
import { Upload, Modal, message, Icon } from 'antd'
import Tools from '@src/utils'
import axios from '@src/utils/axios'
import urls from '@src/config'

class UploadImg extends React.Component {
  state = {
    accept: ['image/jpg', 'image/png', 'image/jpeg'],
    acceptSuffix: ['.jpg', '.png', '.jpeg'],
    previewVisible: false,
    previewImage: '',
    fileList: []
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
      message.error('只能上传png，jpeg，jpg格式的文件')
      return false
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('文件必须2M以内')
      return false
    }
    return true
  }

  handlePreview = file => {
    if (!file.url && !file.preview) {
      file.preview = this.getBase64(file.originFileObj)
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true
    })
  }

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
      this.setState({ fileList }, () => {
        this.setPropsList()
      })
    }
  }

  customRequest = (option) => {
    let { fileList } = this.state
    let formData = new window.FormData()
    formData.append('file', option.file, option.file.name)
    formData.append('bizKey', 'sidebar/img')
    axios.post(urls.uploadImg, formData, {headers: {'Content-Type': 'multipart/form-data'}}).then(res => {
      if (res.ret === 0) {
        let url = res.retdata.filePath
        fileList.push({
          uid: url,
          url: url,
          type: 'image/png',
          status: 'done'
        })
        this.setState({ fileList }, () => {
          this.setPropsList()
        })
      }
    }).catch(() => {
      // this.setState({ isUploading: false })
    })
  }

  setPropsList () {
    const { fileList } = this.state
    let imgList = []
    fileList.map((v, k) => {
      imgList.push(Array.isArray(v.url) ? v.url.join('') : v.url)
      return v
    })
    this.props.onChangeEditObj('imgUrlList', imgList)
  }

  componentDidMount () {
    let { imgUrlList } = this.props
    if (imgUrlList.length > 0) {
      let obj = []
      imgUrlList.map((v, k) => {
        let temp = {}
        temp.uid = v + `?${Math.random()}`
        temp.url = v
        temp.type = 'image/png'
        temp.status = 'done'
        obj.push(temp)
        return v
      })
      this.setState({fileList: obj})
    }
  }

  render () {
    const { previewVisible, previewImage, fileList, accept } = this.state
    const { action } = this.props
    const uploadButton = (
      <div>
        <Icon type="plus" />
        <div className="ant-upload-text">点击上传</div>
      </div>
    )
    return (
      <div className="clearfix">
        <Upload
          accept={accept.join(',')}
          // action={action || 'https://www.mocky.io/v2/5cc8019d300000980a055e76'}
          listType="picture-card"
          fileList={fileList}
          beforeUpload={this.beforeUpload}
          onPreview={this.handlePreview}
          onChange={this.handleChange}
          customRequest={this.customRequest}
          showUploadList={{'showDownloadIcon': false, 'showPreviewIcon': false}}
        >
          {fileList.length >= 9 ? null : uploadButton}
        </Upload>
        <Modal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </div>
    )
  }
}

export default UploadImg
