import React, { PureComponent } from 'react'
import { Col, Input, message, Row, Modal, Form, Button } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'

export default class StaffParamModal extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      staffParam: '',
      key: '',
      id: null
    }
  }

  componentDidMount () {
    this.pullData()
  }

  pullData = () => {
    axios.post(urls.findDetail, {type: 3}, {headers: {'Content-Type': 'application/json'}}).then(res => {
      const { value, key = '', id = null } = res.retdata.detail || {}
      this.setState({
        staffParam: value,
        key,
        id
      })
    })
  }

  onChangeStaffParam = e => {
    this.setState({
      staffParam: e.target.value
    })
  }

  beforeSubmit = () => {
    const { staffParam } = this.state
    if (staffParam === '') return this.handleOk()
    const isEnglish = staffParam.match(/^[A-Za-z]+$/)
    if (!isEnglish) return message.error('请输入英文字符')
    this.handleOk()
  }

  handleOk = () => {
    const { key, staffParam, id } = this.state
    let params = {
      key: key || staffParam,
      value: staffParam
    }
    if (id) params.id = id
    axios.post(urls.saveStaffParam, params, {headers: {'Content-Type': 'application/json'}}).then(res => {
      this.props.hiddenModal()
      message.success('保存成功')
    })
  }

  render () {
    const { visible, hiddenModal } = this.props
    const { staffParam, id } = this.state
    const itemCol = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 }
    }
    return (
      <div>
        <Modal
          width={650}
          title={'参数设置'}
          className
          visible={visible}
          footer={[
            <Button key={'cancel'} type={'default'} onClick={hiddenModal}>
              取消
            </Button>,
            <Button key={'submit'} type="primary" onClick={this.beforeSubmit} disabled={!id && !staffParam}>
              确定
            </Button>
          ]}
          destroyOnClose={true}
          onCancel={hiddenModal}
        >
          <Form>
            <Row>
              <Col span={24}>
                <Form.Item {...itemCol} label={'员工号参数'}>
                  <Input
                    value={staffParam}
                    onChange={e => this.onChangeStaffParam(e)}
                    placeholder="请输入员工号参数，限15个字符，输入英文字符，例如'clientMenage'"
                    maxLength={15}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    )
  }
}
