import React, { Component } from 'react'
import { Modal, Tag, Input, Icon } from 'antd'
import styles from './index.less'
import axios from '@src/utils/axios'
import urls from '@src/config'

class EditTagModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      visible: props.visiableModal,
      inputValue: null,
      inputVisible: false,
      tags: props.tags
    }
  }

  handleOk = async e => {
    this.setState({
      visible: false
    })
    const { closeEditModal, callback, ids } = this.props
    const { tags } = this.state
    const params = {
      corpId: ids.corpId,
      userId: ids.userId,
      tags
    }
    await axios.post(urls.updateUserTags, params, {headers: {'Content-Type': 'application/json'}}).then()
    closeEditModal()
    callback(tags)
  }

  handleCancel = e => {
    this.setState({
      visible: false
    })
    this.props.closeEditModal()
  }

  handleClose = tag => {
    const nextTags = this.state.tags.filter(item => tag !== item)
    this.setState({tags: nextTags})
  }

  saveInputRef = input => (this.input = input)

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus())
  }

  handleInputChange = e => {
    this.setState({ inputValue: e.target.value })
  }

  handleInputConfirm = () => {
    const { inputValue } = this.state
    let { tags } = this.state
    if (inputValue && tags.indexOf(inputValue) === -1) {
      tags = [...tags, inputValue]
    }
    this.setState({
      tags,
      inputVisible: false,
      inputValue: ''
    })
  }

  render () {
    const { inputVisible, visible, inputValue, tags } = this.state
    return (
      <Modal
        title="编辑标签"
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.handleCancel}
      >
        <div className={styles.label_item}>
          <span style={{ marginRight: 20 }}>标签</span>
          {tags.length ? tags.map((tag, index) => {
            const tagElem = (
              <Tag key={tag + index} closable={true} onClose={() => this.handleClose(tag)}>
                {tag}
              </Tag>
            )
            return tagElem
          }) : null}
          {inputVisible && (
            <Input
              ref={this.saveInputRef}
              type="text"
              size="small"
              style={{ width: 78 }}
              value={inputValue}
              onChange={this.handleInputChange}
              onBlur={this.handleInputConfirm}
              onPressEnter={this.handleInputConfirm}
            />
          )}
          {!inputVisible && (
            <Tag onClick={this.showInput} style={{ background: '#fff', borderStyle: 'dashed', marginTop: 10 }}>
              <Icon type="plus" /> 添加标签
            </Tag>
          )}
        </div>
      </Modal>
    )
  }
}

export default EditTagModal
