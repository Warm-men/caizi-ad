import React, { Component } from 'react'
import { Button, Icon, message, Spin, Modal, Form, Tag, Input, Popconfirm } from 'antd'
import { TweenOneGroup } from 'rc-tween-one'
import { PlusOutlined } from '@ant-design/icons'
import axios from '@src/utils/axios'
import urls from '@src/config'

export default class EditModal extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      hasChange: false,
      tags: [],
      inputVisible: false,
      inputValue: '',
      editObj: {},
      delTagIds: []
    }
  }

  componentDidMount () {
    console.log(this.props)
    this.setState({ editObj: this.props.obj, isLoading: false, tags: this.props.obj.tagList || [] })
  }

  showConfirm = () => {
    const self = this
    if (this.state.hasChange) {
      Modal.confirm({
        title: '提示',
        content: '若关闭当前操作页面，所有操作将不会保存，是否仍然退出？',
        onOk() {
          self.hideModal()
        },
        onCancel() {
          console.log('Cancel')
        }
      })
    } else {
      self.hideModal()
    }
  }

  hideModal = () => {
    this.setState({ hasChange: false })
    this.props.hideModal()
  }

  submit = () => {
    const { editObj, tags, delTagIds } = this.state
    const { id = '', categoryName } = editObj
    let data = {}
    let nameList = []
    if (editObj.id) {
      // 编辑
      tags.filter(tag => {
        if (!tag.id) {
          return nameList.push(tag.tagName)
        }
      })
      data = {
        categoryId: id,
        categoryName: categoryName,
        delTagIds: delTagIds,
        addTagNames: nameList,
        isEnable: true
      }
    } else {
      // 新增
      tags.filter(tag => nameList.push(tag.tagName))
      data = {
        categoryName: categoryName,
        tagNames: nameList
      }
    }
    console.log(data, tags)
    if (!data.categoryName.trim()) {
      message.error('类别不能为空')
      return
    }
    if (!tags.length) {
      message.error('标签不能为空')
      return
    }
    this.setState({ saveloading: true })
    axios.post(urls[id ? 'tagsUpdate' : 'tagsCreate'], data, { headers: { 'Content-Type': 'application/json' } }).then(res => {
      this.setState({ saveloading: false })
      this.props.hideModal(true)
    }).catch(() => {
      this.setState({ saveloading: false })
    })
  }

  handleClose = id => {
    let { delTagIds = [], tags } = this.state
    const newTags = tags.filter(tag => {
      if (tag.id === id) {
        delTagIds.push(tag.id)
      } else {
        return tag
      }
    })
    this.setState({ tags: newTags, delTagIds, hasChange: true })
  }

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus())
  }

  handleInputChange = e => {
    this.setState({ inputValue: e.target.value, hasChange: true })
  }

  handleInputConfirm = () => {
    const { inputValue } = this.state
    let { tags } = this.state
    const hasInTags = tags.filter(tag => {
      return tag.tagName === inputValue
    })
    if (inputValue && hasInTags.length === 0) {
      tags = [...tags, {
        tagName: inputValue
      }]
    }
    this.setState({
      tags,
      inputVisible: false,
      inputValue: ''
    })
  }

  saveInputRef = input => {
    this.input = input
  }

  forMap = tag => {
    return (
      <span style={{ display: 'inline-block' }} key={tag.tagName}>
        <Tag
          closable
          onClose={e => {
            e.preventDefault()
            this.handleClose(tag.id)
          }}
        >
          {tag.tagName}
        </Tag>
      </span>
    )
  }

  render () {
    const { visible, title } = this.props
    const { editObj, tags, isLoading, inputVisible, inputValue, saveloading } = this.state
    const tagChild = tags.map(this.forMap)
    return (
      <div>
        <Modal
          width={520}
          wrapClassName={'TagsManage'}
          title={title}
          visible={visible}
          onCancel={this.hideModal}
          maskClosable={false}
          destroyOnClose={true}
          footer={
            <div>
              <Button type="" onClick={this.hideModal}>
                取消
              </Button>
              <Button type="primary" onClick={this.submit} loading={saveloading}>
                {saveloading ? '保存中' : '确定'}
              </Button>
            </div>
          }
        >
          <Spin spinning={isLoading}>
            <div>
              <Form>
                <Form.Item label={<span><span style={{ color: 'red' }}>*</span>类别名称</span>} labelCol={{span: 4}} wrapperCol={{span: 17}}>
                  <Input placeholder="请输入类别名称，长度控制在8个字符以内" onChange={(e) => this.setState({ editObj: { ...editObj, categoryName: e.target.value }, hasChange: true })} value={editObj.categoryName} maxLength={8}/>
                </Form.Item>
                <Form.Item label={<span><span style={{ color: 'red' }}>*</span>标签</span>} labelCol={{span: 4}} wrapperCol={{span: 17}}>
                  <div>
                    <div>
                      <TweenOneGroup
                        enter={{
                          scale: 0.8,
                          opacity: 0,
                          type: 'from',
                          duration: 100,
                          onComplete: e => {
                            e.target.style = ''
                          }
                        }}
                        leave={{ opacity: 0, width: 0, scale: 0, duration: 200 }}
                        appear={false}
                      >
                        {tagChild}
                      </TweenOneGroup>
                    </div>
                    {inputVisible && (
                      <Input
                        ref={this.saveInputRef}
                        type="text"
                        size="small"
                        style={{ width: 78 }}
                        value={inputValue}
                        maxLength={8}
                        onChange={this.handleInputChange}
                        onBlur={this.handleInputConfirm}
                        onPressEnter={this.handleInputConfirm}
                      />
                    )}
                    {!inputVisible && tags.length < 15 && (
                      <Tag onClick={this.showInput} className="site-tag-plus" style={{ marginTop: 16 }}>
                        <PlusOutlined />添加标签
                      </Tag>
                    )}
                  </div>
                </Form.Item>
              </Form>
            </div>
          </Spin>
        </Modal>
      </div>
    )
  }
}
