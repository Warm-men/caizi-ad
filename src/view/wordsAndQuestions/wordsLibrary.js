import React, { Component } from 'react'
import { Button, Upload, message, Spin, Table, Icon, Modal } from 'antd'
import styles from './index.less'
import axios from '@src/utils/axios'
import urls from '@src/config'
import Tools from '@src/utils'
import { withRouter } from 'react-router-dom'
import AddWordsModal from './addWordsModal'
const { Dragger } = Upload
@withRouter
export default class WordsLibrary extends Component {
  constructor (props) {
    super(props)
    this.state = {
      isLoading: false,
      tableData: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
        showQuickJumper: true,
        showTotal: null
      },
      // 新增话术弹窗
      addModalVisiable: false,
      isUploading: false,
      accept: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      fileList: [],
      onSelectedSpeech: null
    }
    this.columns = this.getColunms()
  }

  componentDidMount () {
    this.queryData()
  }

  getColunms = () => {
    const columns = [
      {
        title: '编号',
        dataIndex: 'corpId',
        width: '10%',
        render: (text, record, index) => index + 1
      },
      {
        title: '营销内容',
        ellipsis: true,
        width: '74%',
        dataIndex: 'speech'
      },
      {
        title: '操作',
        dataIndex: 'id',
        render: (text, record, index) => {
          return (
            <span>
              <Button type="danger" size="small" style={{marginRight: 20}} onClick={(e) => this.handleDelete(e, record)}>删除</Button>
              <Button type="primary" size="small" onClick={(e) => this.handleEdit(e, record)}>编辑</Button>
            </span>
          )
        }
      }
    ]
    return columns
  }

  // get data
  queryData = () => {
    this.setState({ isLoading: true })
    const { pagination } = this.state
    const paramse = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      productId: 'common'
    }
    axios.post(urls.speechList, { ...paramse }).then(res => {
      const { total, list } = res.retdata
      this.setState({
        tableData: list,
        isLoading: false,
        pagination: { ...this.state.pagination, total, showTotal: total => `共 ${total}条记录` }
      })
    }).catch(() => {
      message.error('获取数据失败')
      this.setState({ isLoading: false })
    })
  }

  // 新增
  handleAdd = key => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'speechAdd')
    if (!isRight) return
    this.setState({
      addModalVisiable: true,
      onSelectedSpeech: null
    })
  }
  // 编辑
  handleEdit = (e, record) => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'speechEdit')
    if (!isRight) return
    this.setState({
      addModalVisiable: true,
      onSelectedSpeech: record
    })
  }

  // 删除
  handleDelete = (e, record) => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'speechDel')
    if (!isRight) return
    const _this = this
    Modal.confirm({
      title: '确认删除',
      content: '你确认删除此条营销话术吗？',
      onOk () {
        axios.post(urls.speechDelete, { id: record.id, productId: 'common' }).then(res => {
          if (res.ret === 0) {
            message.success('删除成功')
            _this.queryData()
          }
        })
      },
      onCancel () {}
    })
  }
  // 导入
  handleUpload = () => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'speechAdd')
    if (!isRight) return
    this.setState({uploadVisible: true})
  }

  // 分页、排序、筛选变化时触发 获取表格数据
  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      pagination: { ...this.state.pagination, current: pagination.current }
    }, () => {
      this.queryData()
    })
  }

  closeAddWordsModal = () => {
    this.setState({
      addModalVisiable: false
    })
  }

  changeModal = () => {
    this.setState({uploadVisible: false})
  }

  customRequest = (option) => {
    let formData = new window.FormData()
    formData.append('multiUploadFile', option.file, option.file.name)
    formData.append('productId', 'common')
    axios.post(urls.speechUpload, formData, {headers: {'Content-Type': 'multipart/form-data'}}).then(res => {
      if (res.ret === 0) {
        this.setState({ isUploading: false, uploadVisible: false })
        message.success('上传成功')
        this.queryData()
      }
    }).catch(() => {
      message.error('上传失败')
      this.setState({ isUploading: false })
    })
  }

  // 过滤上传条件
  beforeUpload = (file) => {
    this.setState({ isUploading: true })
    const { accept } = this.state
    if (!accept.includes(file.type)) {
      message.error('只能上传xls、xlsx格式的文件')
      this.setState({ isUploading: false })
      return false
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('文件必须2M以内')
      this.setState({ isUploading: false })
      return false
    }
    return true
  }

  render () {
    const {
      isLoading,
      tableData,
      pagination,
      addModalVisiable,
      uploadVisible,
      isUploading,
      accept,
      fileList,
      onSelectedSpeech
    } = this.state
    return (
      <div className={styles.words_library_view}>
        <div style={{marginTop: 20, marginBottom: 20}}>
          <Button type="primary" style={{width: 100, marginRight: 20}} onClick={this.handleAdd}>新增</Button>
          <Button type="cancel" style={{width: 100, marginRight: 20}} onClick={this.handleUpload}>导入</Button>
          <span>下载&nbsp;<a href={urls.speechTemplate}>话术模板文件</a>,批量导入营销话术,单篇营销话术字符需在1000字符内.</span>
        </div>
        <Table
          loading={isLoading}
          columns={this.columns}
          dataSource={tableData}
          rowKey={'id'}
          pagination={pagination}
          onChange={this.handleTableChange}
          locale={{emptyText: '暂无数据'}}
        />
        {addModalVisiable ? <AddWordsModal
          onSelectedSpeech={onSelectedSpeech}
          onClose={this.closeAddWordsModal}
          updateData={this.queryData} /> : null}
        <Modal
          width={600}
          centered
          wrapClassName={'productTalkingSkill'}
          title={`导入营销话术`}
          visible={uploadVisible}
          onCancel={this.changeModal}
          footer={null}
        >
          <Spin spinning={isUploading}>
            <div>
              <div style={{marginBottom: 10}}>请选择需要导入的文件</div>
              <Dragger
                name={'file'}
                accept={accept.join(',')}
                multiple={false}
                fileList={fileList}
                showUploadList={false}
                customRequest={this.customRequest}
                beforeUpload={this.beforeUpload}
                action={urls.speechUpload}>
                <p className="ant-upload-drag-icon">
                  <Icon type="inbox" />
                </p>
                <p className="ant-upload-text">仅支持xls、xlsx格式的文件，2M以内</p>
                <p className="ant-upload-hint">
                  点击或者拖拽上传
                </p>
              </Dragger>
            </div>
          </Spin>
        </Modal>
      </div>
    )
  }
}
