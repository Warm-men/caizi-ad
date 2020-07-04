import React from 'react'
import {
  Input,
  Modal,
  Form,
  Row,
  Col,
  Button,
  Select,
  message
} from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import DeptTreeSelect from '@src/components/DeptTreeSelect'

export default class ModalView extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      changeDept: [],
      editInfoTitle: null,
      infoLink: null,
      abstract: null,
      selectedType: null,
      speech: null,
      categoryArr: [],
      loading: false,
      onSelectedItem: props.onSelectedItem || {}
    }
  }

  componentDidMount () {
    this.getCategory()
  }

  componentWillReceiveProps (next, pre) {
    if (next.onSelectedItem && next.onSelectedItem.id) {
      const {
        title,
        summary,
        sentenceContent,
        newsType,
        deptIds
      } = next.onSelectedItem
      this.setState({
        editInfoTitle: title,
        abstract: summary,
        speech: sentenceContent,
        selectedType: newsType,
        changeDept: deptIds.length ? deptIds.split(',') : [],
        onSelectedItem: next.onSelectedItem
      })
      this.id = next.onSelectedItem.id
    }
  }

  onChangeEditInfoLink = (e) => {
    this.setState({infoLink: e.target.value})
  }

  getCategory = () => {
    axios.get(urls.newsTypes).then(res => {
      this.setState({ categoryArr: res.retdata })
    })
  }

  // 选择所属机构
  onChangeDept = value => {
    this.setState({ changeDept: value })
  }

  onChangeEditInfoTitle = (e) => {
    this.setState({editInfoTitle: e.target.value})
  }

  onChangeAbstract = (e) => {
    this.setState({abstract: e.target.value})
  }

  onChangeSpeech = (e) => {
    this.setState({speech: e.target.value})
  }

  onChangeSelectedType = e => {
    this.setState({
      selectedType: e
    })
  }

  handleOk = () => {
    if (this.isLoading) return
    this.isLoading = true
    this.setState({loading: true})
    const {
      selectedType,
      speech,
      infoLink,
      abstract,
      editInfoTitle,
      changeDept
    } = this.state
    const {
      type,
      closeModal,
      isAddedItem,
      isEditedItem
    } = this.props
    let action = null
    let xhrMethod = null
    let callback = null
    let params = {
      deptIds: changeDept.length ? changeDept.join(',') : '',
      newsType: selectedType,
      sentenceContent: speech,
      summary: abstract,
      title: editInfoTitle
    }
    if (!infoLink && type === 'add') {
      message.error('请输入资讯链接')
      this.isLoading = false
      return
    }
    if (!changeDept.length) {
      message.error('请选择机构')
      this.isLoading = false
      return
    }
    if (type === 'add') {
      params = {
        ...params,
        sourceNewsUrl: infoLink
      }
      action = urls.sidebarNewsCreate
      callback = isAddedItem
      xhrMethod = axios.post
    } else {
      params = {
        ...params,
        id: this.id
      }
      action = urls.sidebarNewsUpdate
      callback = isEditedItem
      xhrMethod = axios.post
    }
    xhrMethod(action, {...params}, {headers: {'Content-Type': 'application/json;charset=UTF-8'}}).then(res => {
      closeModal()
      callback()
      this.resetState()
      this.setState({loading: false})
      this.isLoading = false
    }).catch(() => {
      this.isLoading = false
      this.setState({loading: false})
    })
  }

  resetState = () => {
    this.setState({
      changeDept: [],
      editInfoTitle: null,
      infoLink: null,
      abstract: null,
      selectedType: null,
      speech: null,
      onSelectedItem: {}
    })
  }

  render () {
    const {
      changeDept,
      editInfoTitle,
      infoLink,
      abstract,
      speech,
      categoryArr,
      selectedType,
      loading
    } = this.state
    const modalTitle = this.props.type === 'add' ? '添加资讯' : '编辑资讯'
    return (
      <Modal
        title={modalTitle}
        width={700}
        destroyOnClose={true}
        maskClosable={false}
        visible={this.props.visible}
        onOk={this.handleOk}
        onCancel={this.props.closeModal}
        footer={[
          <Button key="back" onClick={this.props.closeModal}>
            取消
          </Button>,
          <Button key="submit" type="primary" loading={loading} onClick={this.handleOk}>
            确定
          </Button>
        ]}
      >
        <div>
          <Form>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={<span>选择所属机构<span style={{color: 'red'}}>*</span></span>}
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 20 }}
                  extra="设置完所属机构后，此资讯仅在所属机构的客户经理企业微信侧边栏中可见。"
                >
                  <DeptTreeSelect value={changeDept} onChange={this.onChangeDept}/>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={'资讯标题'}
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 20 }}
                >
                  <Input
                    maxLength={30}
                    placeholder={'请输入资讯的标题，若不输入，则默认为链接对应的文章标题。'}
                    onChange={(e) => this.onChangeEditInfoTitle(e)} value={editInfoTitle}
                  />
                </Form.Item>
              </Col>
            </Row>
            {this.props.type === 'add'
              ? <Row>
                <Col span={24}>
                  <Form.Item
                    label={<span>资讯链接<span style={{color: 'red'}}>*</span></span>}
                    labelCol={{ span: 4 }}
                    wrapperCol={{ span: 20 }}
                  >
                    <Input
                      placeholder={'请复制资讯的链接，粘贴到此处，仅支持微信公众号链接。'}
                      onChange={(e) => this.onChangeEditInfoLink(e)} value={infoLink}
                    />
                  </Form.Item>
                </Col>
              </Row> : null }
            <Row>
              <Col span={24}>
                <Form.Item
                  label={'资讯类型'}
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 20 }}
                >
                  <Select
                    showSearch
                    value={selectedType || undefined}
                    style={{ width: 300 }}
                    placeholder={'请选择'}
                    optionFilterProp="children"
                    onChange={this.onChangeSelectedType}
                    filterOption={(input, option) =>
                      option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {categoryArr.map((item, index) => {
                      return (
                        <Select.Option key={index} value={item.key}>{item.value}</Select.Option>
                      )
                    })}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={'分享摘要'}
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 20 }}
                >
                  <Input
                    maxLength={15}
                    placeholder={'请输入分享摘要，限15字以内，若不输入，则默认为链接对应文章的自带摘要。'}
                    onChange={(e) => this.onChangeAbstract(e)} value={abstract}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Form.Item
                  label={'关联话术'}
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 20 }}
                >
                  <Input.TextArea
                    maxLength={200}
                    style={{height: 100}}
                    placeholder={'请输入与当前资讯相关的话术，可在聊天侧边栏中呈现，帮助客户经理与客户打开话匣子。限200字以内。'}
                    onChange={(e) => this.onChangeSpeech(e)} value={speech}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>
    )
  }
}
