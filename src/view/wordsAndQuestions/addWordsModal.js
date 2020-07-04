import React, { Component } from 'react'
import { Input, message, Button, Modal } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'

class AddWordsModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      visible: true,
      textValue: props.onSelectedSpeech ? props.onSelectedSpeech.speech : null
    }
  }

  handleOk = () => {
    if (this.isLoading) return
    this.isLoading = true
    const { textValue } = this.state
    if (!textValue) {
      this.isLoading = false
      return message.error('请输入内容')
    }
    const { onSelectedSpeech } = this.props
    let paramse, action
    // 新增\编辑
    if (onSelectedSpeech) {
      paramse = {
        id: onSelectedSpeech.id,
        speech: textValue,
        productId: 'common'
      }
      action = urls.speechUpdate
    } else {
      paramse = {
        speech: textValue,
        productId: 'common'
      }
      action = urls.speechCreate
    }
    axios.post(action, { ...paramse }, {headers: {'Content-Type': 'application/json'}}).then(res => {
      if (res.ret === 0) {
        message.success('保存成功')
        this.handleCancel()
        // 刷新父组件数据
        this.props.updateData()
      }
      this.isLoading = false
    }).catch(() => {
      this.handleCancel()
      this.isLoading = false
    })
  }

  handleCancel = () => {
    this.setState({visible: false})
    this.props.onClose()
  }

  renderFooter = () => {
    const { textValue } = this.state
    const footer = (
      <span>
        内容不为空时才能保存
        <Button type="cancel"
          style={{marginRight: 10, marginLeft: 10}}
          onClick={this.handleCancel}
        >取消</Button>
        <Button
          type={ textValue ? 'primary' : 'cancel' }
          onClick={this.handleOk}
        >保存</Button>
      </span>
    )
    return footer
  }

  onChangeText = e => {
    const { value } = e.target
    this.setState({textValue: value})
  }

  render () {
    const {
      visible,
      textValue
    } = this.state
    const footer = this.renderFooter()
    return (
      <Modal
        title="营销话术内容"
        visible={visible}
        onOk={this.handleOk}
        footer={footer}
        onCancel={this.handleCancel}
      >
        <Input.TextArea
          placeholder="请输入话术描述(1000字符内)"
          allowClear
          onChange={this.onChangeText}
          onPressEnter={this.onChangeText}
          maxLength={1000}
          style={{height: 100}}
          value={textValue}
        />
      </Modal>
    )
  }
}

export default AddWordsModal
