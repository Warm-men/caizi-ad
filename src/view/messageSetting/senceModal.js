import React, { PropTypes } from 'react'
import { Form, Row, Col, Button, Icon, Input, message, Spin, Modal } from 'antd'
import axios from '@src/utils/axios'
import { Validator } from '@src/utils/validate'
import Tools from '@src/utils'
import urls from '@src/config'
import './senceModal.less'
import 'antd/dist/antd.css'

export default class SenceModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      senceList: [],
      visibleAddModal: false,
      addObj: {
        desc: '',
        typeList: []
      },
      editObj: {},
      editId: '',
      isLoading: false
    }
    this.addObj = {
      desc: '',
      typeList: []
    }
  }

  // 关闭  取消
  handleCancel = () => {
    this.props.hideModal()
  }

  componentWillReceiveProps = next => {
    let { senceList } = next
    this.setState({ senceList, isLoading: false, editId: '' })
  }

  // 删除场景
  delSence = id => {
    const { type } = this.props
    Modal.confirm({
      title: '确定?',
      content: `删除后，该场景下的话术也会被删除`,
      onOk: () => {
        this.setState({ isLoading: true })
        axios.get(`${urls.sentenceSenceDel}?id=${id}${type === 'materialView' ? '&senceType=1' : ''}`).then(res => {
          message.success('删除成功')
          this.props.getSenceList(() => {
            this.setState({ isLoading: false })
          })
          this.props.sentenceList()
        })
      },
      onCancel: () => {}
    })
  }

  // 增加场景
  addSence = () => {
    this.setState({ visibleAddModal: true, addObj: Tools.deepCopyObj(this.addObj) })
  }

  onChangeEditObj = (name, e, idx) => {
    let { editObj } = this.state
    if (idx) {
      editObj[name][idx - 1]['desc'] = e.target.value
    } else {
      editObj[name] = e.target.value
    }
    this.setState({ editObj })
  }

  onChangeAddObj = (name, e, idx) => {
    let { addObj } = this.state
    if (idx) {
      addObj[name][idx - 1] = e.target.value
    } else {
      addObj[name] = e.target.value
    }
    this.setState({ addObj })
  }

  add = idx => {
    let { addObj, editId, editObj } = this.state
    if (editId) {
      editObj.typeList.splice(idx + 1, 0, {})
      this.setState({ editObj })
    } else {
      addObj.typeList.splice(idx + 1, 0, '')
      this.setState({ addObj })
    }
  }

  del = idx => {
    let { addObj, editId, editObj } = this.state
    if (editId) {
      editObj.typeList.splice(idx, 1)
      this.setState({ editObj })
    } else {
      addObj.typeList.splice(idx, 1)
      this.setState({ addObj })
    }
  }

  handleAdd = () => {
    let { addObj, isSaveLoading, editId, editObj } = this.state
    message.destroy()
    if (isSaveLoading) {
      message.info('数据保存中，请稍后', 2)
      return
    }
    let tempObj = {}
    if (editId) {
      tempObj = editObj
    } else {
      tempObj = addObj
    }
    let validator = new Validator()
    validator.add(tempObj.desc, 'isNotEmpty', '请输入场景类别')
    if (tempObj.typeList.length) {
      tempObj.typeList.map((v, k) => {
        if (editId) {
          validator.add(v.desc, 'isNotEmpty', '请输入要添加的二级分类')
        } else {
          validator.add(v, 'isNotEmpty', '请输入要添加的二级分类')
        }
        return v
      })
    }
    var errorMsg = validator.start()
    if (errorMsg) {
      // 获得效验结果
      message.error(errorMsg, 2)
      return false
    }
    this.setState({ isSaveLoading: true })

    // 删除后台接口不需要的数据
    tempObj.typeList = tempObj.typeList.map((ele, idx) => {
      if (ele.code) {
        delete ele.code
      }
      return ele
    })

    // 删除后台接口不需要的数据
    if (tempObj.code) {
      delete tempObj.code
    }

    if (this.props.type === 'materialView') {
      tempObj.senceType = 1
    }

    axios
      .post(urls[editId ? 'sentenceSenceEdit' : 'sentenceSenceAdd'], tempObj, { headers: { 'Content-Type': 'application/json;charset=UTF-8' } })
      .then(res => {
        message.destroy()
        message.success('保存成功', 2)
        this.props.getSenceList(() => {
          this.setState({ visibleAddModal: false, isSaveLoading: false })
        })
      })
      .catch(() => {
        this.setState({ isSaveLoading: false })
        // this.props.getSenceList(() => {
        // })
      })
  }

  // 编辑
  editSence = editId => {
    const { type } = this.props
    axios.get(`${urls.sentenceSenceDetail}?id=${editId}${type === 'materialView' ? '&senceType=1' : ''}`).then(res => {
      this.setState({ editId, editObj: { ...res.retdata }, visibleAddModal: true })
    })
  }

  render = () => {
    let { isLoading, senceList, addObj, visibleAddModal, editId, editObj } = this.state
    let { visible } = this.props
    const itemCol = {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 }
    }
    return (
      <div>
        <Modal title={'场景管理'} width={640} maskClosable={false} destroyOnClose={true} visible={visible} footer={null} onCancel={this.handleCancel}>
          <div id="SenceModal">
            <Spin spinning={isLoading}>
              <div className="title">已有场景</div>
              {senceList.map((v, k) => {
                if (v.isOfficial) {
                  return (
                    <span className="sence-tag" key={v.id + k}>
                      {v.desc}
                    </span>
                  )
                } else {
                  return (
                    <span className="sence-tag" key={v.id + k + k}>
                      <span onClick={() => this.editSence(v.id)}>{v.desc}</span> <Icon type="close" className="del" onClick={() => this.delSence(v.id)} />
                    </span>
                  )
                }
              })}
              <span className="sence-tag sence-add" onClick={this.addSence}>
                <Icon type="plus" style={{color: 'red'}} />
              </span>
            </Spin>
          </div>
        </Modal>
        <Modal
          title={editId ? '编辑场景' : '新增场景'}
          width={640}
          maskClosable={false}
          destroyOnClose={true}
          visible={visibleAddModal}
          onOk={this.handleAdd}
          onCancel={() => {
            this.setState({ visibleAddModal: false, isSaveLoading: false, editId: '' })
          }}
        >
          <div id="SenceModal">
            <Form>
              <Row>
                <Col span={24}>
                  <Form.Item
                    label={
                      <span>
                        <span className={'red'}>*</span>场景类别
                      </span>
                    }
                    {...itemCol}
                  >
                    <Input
                      value={editId ? editObj.desc : addObj.desc}
                      onChange={e => this[editId ? 'onChangeEditObj' : 'onChangeAddObj']('desc', e)}
                      placeholder="请输入场景，控制在8个字符以内"
                      maxLength={8}
                    />
                  </Form.Item>
                </Col>
              </Row>
              {editId ? (
                <Row>
                  <Col span={24}>
                    <Form.Item label={<span>二级分类</span>} {...itemCol}>
                      {editObj.typeList.length === 0 && <Icon type="plus-circle" theme="twoTone" className="add" onClick={() => this.add(0)} />}
                      {editObj.typeList.map((v, k) => {
                        return (
                          <div className="box" key={k}>
                            <Input
                              value={v.desc}
                              onChange={e => this.onChangeEditObj('typeList', e, k + 1)}
                              placeholder="请输入分类，控制在8个字符以内"
                              maxLength={8}
                              className="type-list-input"
                            />
                            <div>
                              {editObj.typeList.length < 5 && <Icon type="plus-circle" theme="twoTone" className="add" onClick={() => this.add(k)} /> }
                              {editObj.typeList.length > 0 && <Icon type="minus-circle" className="del-two" onClick={() => this.del(k)} />}
                            </div>
                          </div>
                        )
                      })}
                    </Form.Item>
                  </Col>
                </Row>
              ) : (
                <Row>
                  <Col span={24}>
                    <Form.Item label={<span>二级分类</span>} {...itemCol}>
                      {addObj.typeList.length === 0 && <Icon type="plus-circle" theme="twoTone" className="add" onClick={() => this.add(0)} />}
                      {addObj.typeList.map((v, k) => {
                        return (
                          <div className="box" key={k + k}>
                            <Input
                              value={v}
                              onChange={e => this.onChangeAddObj('typeList', e, k + 1)}
                              placeholder="请输入分类，控制在8个字符以内"
                              maxLength={8}
                              className="type-list-input"
                            />
                            <div>
                              {addObj.typeList.length < 5 && <Icon type="plus-circle" theme="twoTone" className="add" onClick={() => this.add(k)} />}
                              {addObj.typeList.length > 0 && <Icon type="minus-circle" className="del-two" onClick={() => this.del(k)} />}
                            </div>
                          </div>
                        )
                      })}
                    </Form.Item>
                  </Col>
                </Row>
              )}
            </Form>
          </div>
        </Modal>
      </div>
    )
  }
}
