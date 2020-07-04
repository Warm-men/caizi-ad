import React, { Component } from 'react'
import { Modal, Button } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import UploadDragger from './uploadDragger'

export default class AddBentchMemberModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      deptTree: [],
      changeDept: [],
      currentDetpId: null,
      currentSelectedNode: null,
      isReadyToUpload: false,
      isLoading: false,
      fileList: [],
      isFinishedUpload: false,
      uploadResponse: null
    }
  }

  updateFileList = (fileList) => {
    if (fileList && fileList.length) {
      this.setState({isReadyToUpload: true, fileList})
    }
  }

  handleCancel = () => this.props.onCancel()

  beforeUpload = () => {
    this.setState({isLoading: true})
    if (this.isLoading) return
    this.isLoading = true

    const { currentRoleId, update } = this.props
    const { fileList } = this.state
    let formData = new window.FormData()
    formData.append('uploadFile', fileList[0])
    formData.append('roleId', currentRoleId)

    axios.post(urls.roleUserUpload, formData, {headers: {'Content-Type': 'multipart/form-data'}}).then(res => {
      this.isLoading = false
      this.setState({
        uploadResponse: res.retdata,
        isLoading: false,
        isFinishedUpload: true
      }, () => {
        update && update()
      })
    }).catch(() => {
      this.isLoading = false
      this.setState({isLoading: false})
    })
  }

  render () {
    const { visible, roleName } = this.props
    const {
      isReadyToUpload,
      isLoading,
      isFinishedUpload,
      uploadResponse
    } = this.state
    const buttonText = isLoading ? '导入中...' : '开始导入'
    return (
      <div className="add-role" >
        <Modal
          title="批量导入成员"
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          footer={''}
        >
          <div style={{display: 'flex', backgroundColor: '#fdf2da', height: 40, justifyContent: 'space-around', alignItems: 'center', marginBottom: 20}}>
            <span>请下载导入模板，按格式填写信息后导入</span>
            <a style={{color: '#fff', padding: '3px 5px', borderRadius: 3, backgroundColor: '#1890ff'}} href={'https://www-tenmoney-1301390158.cos.ap-shanghai.myqcloud.com/templates/file/%E8%A7%92%E8%89%B2%E5%8C%B9%E9%85%8D%E5%AF%BC%E5%85%A5%E6%A8%A1%E6%9D%BF.xlsx'}>下载模板</a>
          </div>
          <UploadDragger
            fileSize={2}
            updateFileList={this.updateFileList}
          />
          <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            {isFinishedUpload ? <div style={{margin: '10px 0'}}>
              <div style={{margin: '10px 0', textAlign: 'center'}}>导入完成</div>
              <div>全部记录：{uploadResponse.total}条</div>
              <div>导入成功：{uploadResponse.uploadSuc}条</div>
              <div>导入失败：{uploadResponse.uploadFail}条</div>
            </div>
              : <Button
                type="primary"
                style={{marginTop: 20}}
                disabled={!isReadyToUpload}
                onClick={this.beforeUpload}
              >{buttonText}</Button>}
          </div>
          <div style={{marginTop: 20}}>文件中的成员将被导入至角色：<span style={{color: '#999'}}>“{roleName}”</span></div>
        </Modal>
      </div>
    )
  }
}
