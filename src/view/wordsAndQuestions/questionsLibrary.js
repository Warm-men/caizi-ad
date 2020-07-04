import React, { Component } from 'react'
import { Button, Spin, message, Modal, Table, Icon, Upload } from 'antd'
import styles from './index.less'
import axios from '@src/utils/axios'
import urls from '@src/config'
import QuestionModal from './questionModal'
import Tools from '@src/utils'
import { withRouter } from 'react-router-dom'
const { Dragger } = Upload
@withRouter
export default class QuestionsLibrary extends Component {
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
      // 新增问题弹窗
      questionModalVisiable: false,
      onSelectedIssue: null,
      accept: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      uploadVisible: false,
      fileList: [],
      isUploading: false
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
        width: '8%',
        ellipsis: true,
        render: (text, record, index) => index + 1
      },
      {
        title: '问题',
        width: '38%',
        ellipsis: true,
        dataIndex: 'issue'
      },
      {
        title: '答案',
        width: '38%',
        ellipsis: true,
        dataIndex: 'answer'
      },
      {
        title: '操作',
        dataIndex: 'id',
        render: (text, record, index) => {
          return (
            <span>
              <Button size="small" type="danger" style={{marginRight: 20}} onClick={(e) => this.handleDelete(e, record)}>删除</Button>
              <Button size="small" type="primary" onClick={(e) => this.handleEdit(e, record)}>编辑</Button>
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
    axios.post(urls.issueList, { ...paramse }).then(res => {
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
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'issueAdd')
    if (!isRight) return
    this.setState({
      questionModalVisiable: true
    })
  }

  // 编辑
  handleEdit = (e, record) => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'issueEdit')
    if (!isRight) return
    this.setState({
      questionModalVisiable: true,
      onSelectedIssue: record
    })
  }

  // 删除
  handleDelete = (e, record) => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'issueDel')
    if (!isRight) return
    const _this = this
    Modal.confirm({
      title: '确认删除',
      content: '你确认删除此条营销问题吗？',
      onOk () {
        axios.post(urls.issueDelete, { id: record.id, productId: 'common' }).then(res => {
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
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'issueAdd')
    if (!isRight) return
    this.setState({uploadVisible: true})
  }

  // 下载话术模板
  getWordsModal = () => {}

  // 分页、排序、筛选变化时触发 获取表格数据
  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      pagination: { ...this.state.pagination, current: pagination.current }
    }, () => {
      this.queryData()
    })
  }

  closeQuestionModal = () => {
    this.setState({
      questionModalVisiable: false,
      onSelectedIssue: null
    })
  }

  customRequest = (option) => {
    let formData = new window.FormData()
    formData.append('multiUploadFile', option.file, option.file.name)
    formData.append('productId', 'common')
    axios.post(urls.issueUpload, formData, {headers: {'Content-Type': 'multipart/form-data'}}).then(res => {
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

  changeModal = () => {
    this.setState({uploadVisible: false})
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
      questionModalVisiable,
      onSelectedIssue,
      uploadVisible,
      isUploading,
      accept,
      fileList
    } = this.state
    return (
      <div className={styles.words_library_view}>
        <div style={{marginTop: 20, marginBottom: 20}}>
          <Button type="primary" style={{width: 100, marginRight: 20}} onClick={this.handleAdd}>新增</Button>
          <Button type="cancel" style={{width: 100, marginRight: 20}} onClick={this.handleUpload}>导入</Button>
          <span>下载<a href={urls.issueTemplate}>常见问题模板文件</a>,批量导入问题及答案,单个问题需控制在1000字符，单个答案需控制在1000字符内.</span>
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
        {questionModalVisiable ? <QuestionModal
          onClose={this.closeQuestionModal}
          onSelectedIssue={onSelectedIssue}
          updateData={this.queryData}
        /> : null}
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
