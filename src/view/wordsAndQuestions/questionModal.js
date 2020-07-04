import React, { Component } from 'react'
import { Input, message, Button, Modal } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'

class QuestionModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      visible: true,
      questionValue: props.onSelectedIssue ? props.onSelectedIssue.issue : null,
      answerValue: props.onSelectedIssue ? props.onSelectedIssue.answer : null
    }
  }

  handleOk = () => {
    const { answerValue, questionValue } = this.state
    if (!questionValue) return message.error('请输入问题')
    if (!answerValue) return message.error('请输入答案')
    if (answerValue.length > 1000) return message.error('输入答案字符超过1000')
    if (questionValue.length > 1000) return message.error('输入答案字符超过1000')
    const { onSelectedIssue } = this.props
    let paramse, action
    // 新增\编辑
    if (onSelectedIssue) {
      paramse = {
        id: onSelectedIssue.id,
        issue: questionValue,
        answer: answerValue,
        productId: 'common'
      }
      action = urls.issueUpdate
    } else {
      paramse = {
        issue: questionValue,
        answer: answerValue,
        productId: 'common'
      }
      action = urls.issueCreate
    }
    axios.post(action, { ...paramse }).then(res => {
      if (res.ret === 0) {
        message.success('保存成功')
        this.handleCancel()
        // 刷新父组件数据
        this.props.updateData()
      }
    }).catch(() => {
      message.error('保存失败')
      this.handleCancel()
    })
  }

  handleCancel = () => {
    this.setState({visible: false})
    this.props.onClose()
  }

  renderFooter = () => {
    const { answerValue, questionValue } = this.state
    const footer = (
      <span>
        内容不为空时才能保存
        <Button type="cancel" style={{marginRight: 10, marginLeft: 10}} onClick={this.handleCancel}>取消</Button>
        <Button type={ (answerValue && questionValue) ? 'primary' : 'cancel' } onClick={this.handleOk}>保存</Button>
      </span>
    )
    return footer
  }

  onChangeQuestion = e => {
    const { value } = e.target
    this.setState({questionValue: value})
  }

  onChangeAnswer = e => {
    const { value } = e.target
    this.setState({answerValue: value})
  }

  render () {
    const {
      visible,
      questionValue,
      answerValue
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
        <div style={{marginBottom: 20}}>
          <span style={{color: 'red'}}>*</span>
          <span>问题: </span>
          <Input.TextArea
            placeholder="请输入问题描述(1000字符内)"
            allowClear
            onChange={this.onChangeQuestion}
            onPressEnter={this.onChangeQuestion}
            maxLength={1000}
            value={questionValue}
            style={{height: 100, marginTop: 10}}
          />
        </div>

        <div style={{marginBottom: 20}}>
          <span style={{color: 'red'}}>*</span>
          <span>答案: </span>
          <Input.TextArea
            placeholder="请输入答案描述(1000字符内)"
            allowClear
            value={answerValue}
            onChange={this.onChangeAnswer}
            onPressEnter={this.onChangeAnswer}
            maxLength={1000}
            style={{height: 100, marginTop: 10}}
          />
        </div>

      </Modal>
    )
  }
}

export default QuestionModal
