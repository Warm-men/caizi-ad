import React, { Component } from 'react'
import { Button, Input, Form, Row, Col, Modal, Checkbox, message } from 'antd'
import './index.less'
import axios from '@src/utils/axios'
import urls from '@src/config'
import Tools from '@src/utils'

class QaHelper extends Component {
  constructor (props) {
    super(props)
    this.state = {
      checked: false,
      visible: false,
      name: '',
      introductions: ''
    }
  }
  // 进页面获取数据
  componentDidMount () {
    axios.post(urls.assistantInfo, {}, {headers: {'Content-Type': 'application/json;charset=UTF-8'}}).then(res => {
      const { name, enabled, introductions } = res.retdata
      this.setState({
        name,
        checked: enabled === '1',
        introductions
      })
    })
  }

  // 保存
  submit = () => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'qaHelper')
    if (!isRight) return
    const { name, introductions, checked } = this.state
    const data = {
      name,
      introductions,
      enabled: checked ? 1 : 0
    }
    axios.post(urls.qAssistant, data, {headers: {'Content-Type': 'application/json;charset=UTF-8'}}).then(res => {
      if (res.ret === 0) {
        message.success('保存成功')
      }
    })
  }

  render () {
    const itemCol = {
      labelCol: {span: 3},
      wrapperCol: {span: 12}
    }
    const { checked, name, introductions, visible } = this.state
    return (
      <div className="qaHelper">
        <div className={'top'}>
          <Checkbox onChange={(e) => this.setState({ checked: e.target.checked })} checked={checked}>
            开启小助手（开启后，用户进入平台应用界面，将看到悬浮的小助手，根据不同企业归属客户经理的不同，展示对应客户经理企业二维码）
          </Checkbox>
          <span style={{color: '#1890ff', cursor: 'pointer'}} onClick={() => this.setState({ visible: true })}>查看示例</span>
        </div>
        <div style={{ marginTop: '20px' }}>
          <Form>
            <Row>
              <Col span={24}>
                <Form.Item label={<span><span className={'red'}>*</span>小助手名称</span>} {...itemCol}>
                  <Input value={name} maxLength={6}
                    onChange={(e) => this.setState({ name: e.target.value })} placeholder="请输入自定义小助手名称" />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item label={<span>小助手介绍语</span>} {...itemCol}>
                  <Input.TextArea
                    value={introductions} maxLength={50} autoSize={{ minRows: 5 }}
                    onChange={(e) => this.setState({ introductions: e.target.value })} placeholder="请输入介绍语"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item wrapperCol={{offset: 3, span: 9}}>
                  <Button type="primary" onClick={this.submit}>保存</Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
        <div>
          <Modal
            title="示例图片"
            visible={visible}
            onOk={() => this.setState({ visible: false })}
            onCancel={() => this.setState({ visible: false })}
            width={630}
          >
            <div className={'qaHelperPng'}>
              <img src={require('@src/assets/qa1.png')} alt=""/>
              <img src={require('@src/assets/qa2.png')} alt=""/>
            </div>
          </Modal>
        </div>
      </div>
    )
  }
}

export default QaHelper
