import React, { Component, Fragment } from 'react'
import { Modal, Upload, message, Button, Spin, Progress, Table } from 'antd'
import urls from '@src/config'
import axios from '@src/utils/axios'
import moment from 'moment'
import './index.less'

export default class UploadModal extends Component {
  constructor(props) {
    super(props)
    this.state = { loading: false, file: {}, pageNum: 1, pageSize: 10, list: [], total: 0 }
  }

  componentDidMount() {
    this.progressResult()
  }

  // 查询结果
  progressResult = () => {
    const { seqId } = this.state
    this.setState({ loading: true })
    axios.post(urls.progressResult, { seqId }).then((res) => {
      const { ret, retdata = {} } = res
      if (ret === 0) {
        const { taskStatus, totalNum, processNum, seqId } = retdata
        this.setState({ loading: false, taskStatus, totalNum, processNum, seqId })
        if (taskStatus === 1 || taskStatus === 2) {
          if (taskStatus === 2) this.organizationErrorList()
          clearTimeout(this.timer)
        } else if (taskStatus === 0) {
          this.timer = setTimeout(this.progressResult, 1000)
        }
      }
    })
  }

  // 错误列表
  organizationErrorList = () => {
    const { seqId, pageNum, pageSize } = this.state
    this.setState({ tableLoading: true })
    axios
      .post(urls.organizationErrorList, { seqId, pageNum, pageSize })
      .then((res) => {
        if (res.ret === 0) {
          const { list, total } = res.retdata
          this.setState({ list, total })
        }
      })
      .finally(() => {
        this.setState({ tableLoading: false })
      })
  }

  // 导入
  organizationUpload = () => {
    const { file } = this.state
    if (!file.name) return
    this.setState({ loading: true })
    const newFormData = new window.FormData()
    newFormData.append('uploadFile', file, file.name)
    axios
      .post(urls.organizationUpload, newFormData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => {
        if (res.ret === 0) {
          this.progressResult()
        }
      })
      .finally(() => {
        this.setState({ loading: false })
      })
  }

  // 变更状态为初始化
  finishProgress = () => {
    const { seqId } = this.state
    this.setState({ modalLoading: true })
    axios
      .post(urls.finishProgress, { seqId })
      .then((res) => {
        if (res.ret === 0) {
          this.setState({ pageNum: 1, total: 0, taskStatus: 3, totalNum: 0, processNum: 0, file: {}, list: [] })
        }
      })
      .finally(() => {
        this.setState({ modalLoading: false })
      })
  }

  // 下载失败列表
  organizationExport = () => {
    const { seqId } = this.state
    axios.post(urls.organizationExport, { seqId }, { responseType: 'blob' }).then((res) => {
      this.exportFile(res, `组织架构-导入失败列表 ${moment().format('YYYY-MM-DD')}`)
    })
  }

  // 导出文件
  exportFile = (res, name) => {
    const blob = new window.Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const href = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = href
    a.download = name
    a.click()
    URL.revokeObjectURL(href)
  }

  // 文件变更
  fileChange = ({ file }) => {
    const { status, originFileObj } = file
    if (status === 'uploading') {
      this.setState({ file: originFileObj })
    }
  }

  // 上传前校验
  beforeUpload = (file) => {
    const { name, size } = file
    const typeArr = name.split('.')
    const type = typeArr[typeArr.length - 1]
    if (!['xls', 'xlsx'].includes(type)) {
      message.error('只能上传xls、xlsx格式的文件！')
      return false
    }
    if (size / 1024 / 1024 > 5) {
      message.error('只能上传5M内的文件！')
      return false
    }
    return true
  }

  // 分页
  pagination = () => {
    const { pageNum, pageSize, total } = this.state
    return {
      current: pageNum,
      pageSize,
      total,
      showQuickJumper: true,
      showTotal: () => {
        return `共${total}条记录`
      },
      onChange: (pageNum) => {
        this.setState({ pageNum }, this.organizationErrorList)
      }
    }
  }

  // 列
  columns = () => {
    return [
      { title: '类型', dataIndex: 'type' },
      { title: 'ID', dataIndex: 'objId' },
      { title: '标签', dataIndex: 'tag' },
      { title: '姓名/部门名', dataIndex: 'name' },
      { title: '职务', dataIndex: 'position' },
      { title: '所在部门', dataIndex: 'deptName' },
      { title: '失败原因', dataIndex: 'failReason' }
    ]
  }

  render() {
    const { Dragger } = Upload
    const { modalLoading = false, file, loading, tableLoading, list, taskStatus = 3, totalNum = 0, processNum = 0 } = this.state
    const percent = Math.floor((processNum / (totalNum || 1)) * 10000) / 100

    return (
      <Modal maskClosable={false} title="导入组织架构" width={1032} visible={true} footer={null} onCancel={this.props.onCancel}>
        <Spin spinning={modalLoading}>
          <div className="upload-staff-modal">
            <div className="tips">
              <Button type="primary">
                <a
                  download="组织架构模板"
                  href="https://www-tenmoney-1301390158.cos.ap-shanghai.myqcloud.com/templates/file/%E7%BB%84%E7%BB%87%E6%9E%B6%E6%9E%84%E6%A8%A1%E6%9D%BF.xlsx"
                >
                  下载模板文件
                </a>
              </Button>
              请参照Excel模版样式导入组织架构
            </div>
            <div className="steps">
              <div className="item active">
                <div className="step">1</div>导入Excel文件
              </div>
              <div className={`item ${taskStatus === 1 || taskStatus === 2 ? 'active' : ''}`}>
                <div className="step">2</div>反馈导入结果
              </div>
            </div>

            {taskStatus === 3 && (
              <Dragger customRequest={() => {}} action={urls.bannerUpload} onChange={this.fileChange} beforeUpload={this.beforeUpload}>
                <Spin spinning={loading}>
                  <img className="img" src={require(file.name ? '@src/assets/file-xls.png' : '@src/assets/file-upload.png')} />
                  <div className="p">{file.name || '文件仅支持xls,xlsx格式，5M以内'}</div>
                  <div className="span">{file.name ? '可再次拖拽或点击此处重新上传' : '点击或者拖拽到此上传'}</div>
                </Spin>
              </Dragger>
            )}

            {taskStatus === 0 && (
              <div className="uploading">
                <div className="imgs">
                  <img src={require('@src/assets/file-xls.png')} className="img" />
                  <div className="loading-animation">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <img src={require('@src/assets/file-finish.png')} className="img" />
                </div>
                <Progress percent={percent} showInfo={false} status="active" />
                <div className="text">正在导入文件，{percent}%</div>
              </div>
            )}

            {(taskStatus === 0 || taskStatus === 3) && (
              <div className="submit">
                <Button type="primary" disabled={!file.name || taskStatus !== 3 || loading} onClick={this.organizationUpload}>
                  导入
                </Button>
              </div>
            )}

            {(taskStatus === 1 || taskStatus === 2) && (
              <Fragment>
                <div className="upload-result">
                  <img className="img" src={require(taskStatus === 1 ? '@src/assets/success.png' : '@src/assets/fail.png')} />
                  <div className="text">
                    {taskStatus === 1 ? (
                      `共导入${processNum}条`
                    ) : (
                      <Fragment>
                        导入完成，失败<span className="red">{totalNum - processNum}条</span>，成功<span className="green">{processNum}条</span>
                      </Fragment>
                    )}
                  </div>
                  <div className="btns">
                    {taskStatus === 1 ? (
                      <Button type="primary" onClick={this.finishProgress}>
                        完成
                      </Button>
                    ) : (
                      <Fragment>
                        <Button onClick={this.organizationExport}>下载失败列表</Button>
                        <Button type="primary" onClick={this.finishProgress}>
                          重新上传
                        </Button>
                      </Fragment>
                    )}
                  </div>
                  {list.length > 0 && <Table rowKey="objId" loading={tableLoading} dataSource={list} columns={this.columns()} pagination={this.pagination()} />}
                </div>
              </Fragment>
            )}
          </div>
        </Spin>
      </Modal>
    )
  }
}
