import React, { Component } from 'react'
import { Button, Modal, message, Spin, Table, Input } from 'antd'
import { withRouter } from 'react-router-dom'
import axios from '@src/utils/axios'
import urls from '@src/config'
import qs from 'qs'
import moment from 'moment'

// 营销话术
class ProductTalkingSkill extends Component {
  constructor (props, context) {
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
      speech: '',
      tableData: []
    }
  }

  componentDidMount () {
    this.props.onRef(this)
    this.setState({
      // 关联的产品ID  主键
      relatedId: this.props.isAdd ? '' : this.props.location.search.split('=')[1]
    }, () => {
      this.getProductTalkingSkill()
    })
  }

  // 加载列表
  getProductTalkingSkill = () => {
    this.setState({ isIniting: true })
    axios.post(urls.speechList, { productId: this.state.relatedId }).then(res => {
      this.setState({ tableData: res.retdata.list, isIniting: false })
    })
  }

  // 上移下移
  updateSeq = (e, direction, record) => {
    axios.post(urls.speechUpdateSeq, { id: record.id, productId: record.productId, seq: record.seq + direction }).then(res => {
      this.getProductTalkingSkill()
    })
  }

  // 删除
  delete = (e, record) => {
    const _this = this
    const productId = this.state.relatedId
    Modal.confirm({
      title: '确认删除',
      content: '你确认删除此条营销话术吗？',
      onOk () {
        axios.post(urls.speechDelete, { id: record.id, productId }).then(res => {
          if (res.ret === 0) {
            message.success('删除成功')
            _this.getProductTalkingSkill()
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
    this.setState({ speech: record.speech, editVisible: true, canSave: record.speech.trim(), record })
  }

  // 改变营销话术内容
  onChangeYXHS = (ev) => {
    this.setState({ speech: ev.target.value, canSave: ev.target.value.trim() })
  }

  // 保存
  submit = () => {
    const { speech, record, relatedId } = this.state
    if (!speech.trim()) {
      return message.warning('请填写营销话术')
    }
    if (speech.length > 1000) {
      return message.warning('营销话术最多1000个字符')
    }
    this.setState({ isAdding: true })
    if (record) {
      axios.post(urls.speechUpdate, { speech, id: record.id, productId: record.productId }).then(res => {
        this.setState({
          record: '',
          editVisible: false,
          isAdding: false
        })
        message.success('保存成功')
        this.getProductTalkingSkill()
      }).catch(() => {
        this.setState({ isAdding: false })
      })
    } else {
      axios.post(urls.speechCreate, { speech, productId: relatedId }).then(res => {
        this.setState({
          record: '',
          editVisible: false,
          isAdding: false
        })
        message.success('保存成功')
        this.getProductTalkingSkill()
      }).catch(() => {
        this.setState({ isAdding: false })
      })
    }
  }

  add = () => {
    this.setState({ editVisible: true, record: '', speech: '', canSave: false })
  }

  render () {
    const { isIniting, tableData, uploadVisible, editVisible, isUploading, fileList, title, speech, canSave, saveLoading } = this.state
    const columns = [{
      title: '营销话术',
      width: '64%',
      ellipsis: true,
      dataIndex: 'speech'
    },
    {
      title: '添加时间',
      width: '20%',
      dataIndex: 'dateCreated',
      render: (text, record) => (
        <span>{moment(record.dateCreated).add('year', 0).format('YYYY-MM-DD HH:mm:ss').substring(5)}</span>
      )
    },
    {
      title: '操作',
      render: (text, record, index) => (
        <span className={'actionArea'}>
          {
            record.productId !== 'common' && <Button size="small" type="primary" onClick={() => this.showDialog(record)}>
              编辑
            </Button>
          }
          {/* {index === 0 ? null : <Button type="primary" onClick={(e) => this.updateSeq(e, 1, record)}>上移</Button>} */}
          {/* {index === (this.state.tableData.length - 1) ? null : <Button type="primary" onClick={(e) => this.updateSeq(e, -1, record)}>下移</Button>} */}
          <Button type="danger" size="small" onClick={(e) => this.delete(e, record)}>删除</Button>
        </span>
      )
    }]
    return (
      <div className={'productTalkingSkill'}>
        <Spin spinning={isIniting}>
          <div className="top">
            <Button type="primary" onClick={this.add}>新增</Button>
          </div>
          <Table
            columns={columns}
            rowKey={'id'}
            dataSource={tableData}
            pagination={false}
            locale={{emptyText: '当前未添加营销话术内容。'}}
          />
        </Spin>
        <Modal
          width={600}
          centered
          wrapClassName={'productTalkingSkill'}
          title={`${title} 营销话术内容`}
          visible={editVisible}
          onCancel={() => this.changeModal('editVisible')}
          footer={<div>
            <span>内容不为空时才能保存。</span>
            <Button type="default" onClick={() => this.changeModal('editVisible')}>取消</Button>
            <Button type="primary" onClick={this.submit} loading={saveLoading} disabled={!canSave}>保存</Button>
          </div>}
        >
          <Input.TextArea rows={6} maxLength={ 1000 } onChange={this.onChangeYXHS} value={speech}
            placeholder={'请输入话术描述（1000字符内）'} />
        </Modal>
      </div>
    )
  }
}

export default withRouter(ProductTalkingSkill)
