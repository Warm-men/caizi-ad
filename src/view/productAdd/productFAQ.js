import React, { Component } from 'react'
import { Form, Row, Col, Button, Modal, message, Spin, Table, Input } from 'antd'
import { withRouter } from 'react-router-dom'
import axios from '@src/utils/axios'
import urls from '@src/config'

// 常见问题
class ProductFAQ extends Component {
  constructor (props) {
    super(props)
    this.state = {
      // 进页面初始化中
      isIniting: false,
      isUploading: false,
      uploadVisible: false,
      editVisible: false,
      canSave: false,
      saveLoading: false,
      fileList: [],
      title: '',
      issue: '',
      answer: '',
      tableData: []
    }
  }

  componentDidMount () {
    this.props.onRef(this)
    this.setState({
      // 关联的产品ID  主键
      relatedId: this.props.isAdd ? '' : this.props.location.search.split('=')[1]
    }, () => {
      this.getProductFAQList()
    })
  }

  // 加载列表
  getProductFAQList = () => {
    this.setState({ isIniting: true })
    axios.post(urls.issueList, { productId: this.state.relatedId }).then(res => {
      this.setState({ tableData: res.retdata.list, isIniting: false })
    })
  }

  // 上移下移
  updateSeq = (e, direction, record) => {
    axios.post(urls.issueUpdateSeq, { id: record.id, productId: record.productId, seq: record.seq + direction }).then(res => {
      this.getProductFAQList()
    })
  }

  // 删除
  delete = (e, record) => {
    const _this = this
    const productId = this.state.relatedId
    Modal.confirm({
      title: '确认删除',
      content: '你确认删除此条常见问题吗？',
      onOk () {
        axios.post(urls.issueDelete, { id: record.id, productId }).then(res => {
          if (res.ret === 0) {
            message.success('删除成功')
            _this.getProductFAQList()
          }
        })
      },
      onCancel () {}
    })
  }

  changeModal = (state) => {
    this.setState({ [state]: !this.state[state], record: '' })
  }

  showDialog = (record) => {
    this.setState({ issue: record.issue, answer: record.answer, editVisible: true, canSave: record.issue.trim() && record.answer.trim(), record })
  }

  // 改变常见问题内容
  onChangeCJWT = (ev, name) => {
    this.setState({ [name]: ev.target.value }, () => {
      this.setState({ canSave: this.state.answer.trim() && this.state.issue.trim() })
    })
  }

  // 保存
  submit = () => {
    const { answer, record, issue, relatedId } = this.state
    if (!issue.trim()) {
      return message.warning('请填写问题描述')
    }
    if (issue.length > 1000) {
      return message.warning('问题描述最多1000个字符')
    }
    if (!answer.trim()) {
      return message.warning('请填写答案描述')
    }
    if (answer.length > 1000) {
      return message.warning('答案描述最多1000个字符')
    }
    this.setState({ isAdding: true })
    if (record) {
      axios.post(urls.issueUpdate, { issue, answer, id: record.id, productId: record.productId }).then(res => {
        this.setState({
          record: '',
          editVisible: false,
          isAdding: false
        })
        message.success('保存成功')
        this.getProductFAQList()
      }).catch(() => {
        this.setState({ isAdding: false })
      })
    } else {
      axios.post(urls.issueCreate, { issue, answer, productId: relatedId }).then(res => {
        this.setState({
          record: '',
          editVisible: false,
          isAdding: false
        })
        message.success('保存成功')
        this.getProductFAQList()
      }).catch(() => {
        this.setState({ isAdding: false })
      })
    }
  }

  add = () => {
    this.setState({ editVisible: true, record: '', answer: '', issue: '', canSave: false })
  }

  render () {
    const { isIniting, tableData, uploadVisible, editVisible, isUploading, fileList, title, issue, answer, canSave, saveLoading } = this.state
    const columns = [{
      title: '问题',
      width: '44%',
      ellipses: true,
      dataIndex: 'issue'
    },
    {
      title: '答案',
      width: '44%',
      ellipses: true,
      dataIndex: 'answer'
    },
    {
      title: '操作',
      render: (text, record, index) => (
        <span className={'actionArea'}>
          {
            record.productId !== 'common' && <Button size='small' type="primary" onClick={() => this.showDialog(record)}>
              编辑
            </Button>
          }
          {/* {index === 0 ? null : <Button type="primary" onClick={(e) => this.updateSeq(e, 1, record)}>上移</Button>} */}
          {/* {index === (this.state.tableData.length - 1) ? null : <Button type="primary" onClick={(e) => this.updateSeq(e, -1, record)}>下移</Button>} */}
          <Button size='small' type="danger" onClick={(e) => this.delete(e, record)}>删除</Button>
        </span>
      )
    }]
    const itemCol = {
      labelCol: {span: 3},
      wrapperCol: {span: 21}
    }
    return (
      <div className={'productFAQ'}>
        <Spin spinning={isIniting}>
          <div className="top">
            <Button type="primary" onClick={this.add}>新增</Button>
          </div>
          <Table
            columns={columns}
            rowKey={'id'}
            dataSource={tableData}
            pagination={false}
            locale={{emptyText: '当前未添加常见问题内容。'}}
          />
        </Spin>
        <Modal
          width={600}
          centered
          wrapClassName={'productFAQ'}
          title={`${title} 常见问题内容`}
          visible={editVisible}
          onCancel={() => this.changeModal('editVisible')}
          footer={<div>
            <span>带 * 内容不为空时才能保存。</span>
            <Button type="default" onClick={() => this.changeModal('editVisible')}>取消</Button>
            <Button type="primary" onClick={this.submit} loading={saveLoading} disabled={!canSave}>保存</Button>
          </div>}
        >
          <Form>
            <Row>
              <Col span={24}>
                <Form.Item label={<span><span className={'red'}>*</span>问题</span>} {...itemCol}>
                  <Input.TextArea rows={6} maxLength={ 1000 } onChange={(e) => this.onChangeCJWT(e, 'issue')} value={issue}
                    placeholder={'请输入问题描述（1000字符内）'} />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label={<span><span className={'red'}>*</span>答案</span>} {...itemCol}>
                  <Input.TextArea rows={6} maxLength={ 1000 } onChange={(e) => this.onChangeCJWT(e, 'answer')} value={answer}
                    placeholder={'请输入答案描述（1000字符内）'} />
                </Form.Item>
              </Col>
            </Row>
          </Form>

        </Modal>
      </div>
    )
  }
}

export default withRouter(ProductFAQ)
