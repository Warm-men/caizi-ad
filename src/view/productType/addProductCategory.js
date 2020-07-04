import React from 'react'
import { Modal, Select, Button, Radio, Spin, Tooltip, Input, message, Icon, Form } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import styles from './index.less'

export default class AddProductCategory extends React.Component {
  constructor (props) {
    super(props)
    const { productTypeName, businessType, type, productTypeIcon, productTypeId } = props.onEditItem || {}
    this.state = {
      loading: false,
      businessType: businessType || 2,
      type: type || 1,
      productTypeIcon: productTypeIcon || null,
      productName: productTypeName || null,
      onEditItem: props.onEditItem || null,
      productTypeId: productTypeId || null,
      tableData: []
    }
  }

  componentDidMount () {
    this.getProductTypeList()
  }

  handleSubmit = () => {
    this.setState({ loading: true })
    const { businessType, type, productTypeIcon, productName } = this.state
    if (!productName) {
      this.setState({ loading: false })
      return message.error('请填写类别名称！')
    }
    if (!productTypeIcon) {
      this.setState({ loading: false })
      return message.error('请选择类别Icon!')
    }
    const { tableData } = this.state
    const isSameName = !!tableData.filter(v => v.productTypeName === productName).length
    if (isSameName && !this.props.onEditItem) {
      this.setState({ loading: false })
      return message.error('已存在相同类别，请重新填写')
    }
    let paramse = {
      businessType: businessType,
      type,
      icon: productTypeIcon,
      name: productName
    }
    let action = urls.createProduceCatagory
    if (this.props.onEditItem) {
      paramse.id = this.props.onEditItem.productTypeId
      action = urls.updateProduceCatagory
    }
    axios.post(action, { ...paramse }, {headers: {'Content-Type': 'application/json;charset=UTF-8'}}).then(res => {
      this.props.hideModal()
      this.props.refreshQuery()
    }).catch(() => {
      this.props.hideModal()
    })
  }

  onSubmit = (ev, record) => {
    if (this.props.onEditItem) {
      ev.preventDefault()
      const _this = this
      Modal.confirm({
        title: '确认修改',
        content: '类别修改后，该类别下的产品类别也同时修改',
        onOk () {
          _this.handleSubmit()
        },
        onCancel () {}
      })
    } else {
      this.handleSubmit()
    }
  }

  selectedServiceCategory = (v) => {
    this.setState({businessType: v, productTypeIcon: null}, this.getProductTypeList)
  }

  getProductTypeList = () => {
    this.setState({ isLoading: true })
    axios.post(urls.listTypeIcon).then(res => {
      this.setState({ tableData: res.retdata.list, isLoading: false })
    })
  }

  onSelectedTag = (item) => {
    this.setState({ productTypeIcon: item.imgUrl })
  }

  onChangeProductName = (e) => {
    const { value } = e.target
    this.setState({productName: value})
  }

  render () {
    const { visible = false } = this.props
    const {
      productName,
      loading,
      businessType,
      type,
      tableData,
      productTypeIcon
    } = this.state
    return (
      <Modal
        width={1000}
        bodyStyle={{height: 600, overflowY: 'scroll'}}
        centered
        destroyOnClose={true}
        maskClosable={false}
        title={`类别`}
        visible={visible}
        onCancel={() => this.props.hideModal()}
        footer={
          <div>
            <Button type="" onClick={() => this.props.hideModal()}>
              取消
            </Button>
            <Button type="primary" onClick={this.onSubmit}>
              保存
            </Button>
          </div>
        }>
        <Spin spinning={loading}>
          <Form labelCol={{ span: 3 }} wrapperCol={{ span: 20 }}>
            <Form.Item label={<span><span style={{color: 'red'}}>*</span>类别名称</span>}>
              <Input style={{flex: 1}} maxLength={10} value={productName} onChange={this.onChangeProductName} placeholder={'请输入类别名称，字符控制10字符以内'} />
            </Form.Item>
            <Form.Item label={<span><span style={{color: 'red'}}>*</span>业务类型</span>}>
              <Select value={businessType} style={{ width: 120 }} onChange={this.selectedServiceCategory}>
                <Select.Option value={1}>对公业务</Select.Option>
                <Select.Option value={2}>零售业务</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label={<span><span style={{color: 'red'}}>*</span>产品模板</span>}>
              <Tooltip placement="bottom" title={'产品模板作用于“添加产品”栏目，当选择不同的产品类别，则展示不同的产品要素'} >
                <Icon type="info-circle" style={{marginRight: 8}} className={styles.sortIcon} />
              </Tooltip>
              <Radio.Group onChange={(e) => this.setState({type: e.target.value})} value={type}>
                <Radio value={1}>理财</Radio>
                <Radio value={3}>贵金属</Radio>
                <Radio value={2}>其他</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label={<span><span style={{color: 'red'}}>*</span>类别icon</span>}>
              <div style={{padding: '30px 0 0 30px', display: 'inline-flex', width: 732, flexWrap: 'wrap', border: '1px solid #eee'}}>
                {tableData.length ? tableData.map((item, key) => {
                  const isSelected = item.imgUrl === productTypeIcon
                  return (
                    <SelectedTag isSelected={isSelected} key={key} item={item} onChange={this.onSelectedTag} />
                  )
                }) : null}
              </div>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
    )
  }
}

class SelectedTag extends React.PureComponent {
  handleChange = () => {
    const { item, onChange } = this.props
    onChange(item)
  }

  render () {
    const { item, isSelected } = this.props
    let defaultStyle = {}
    if (isSelected) {
      defaultStyle = {
        backgroundColor: '#d6e8fb'
      }
    }
    return (
      <span onClick={this.handleChange} style={{...defaultStyle}} className={styles.selectedTag}>
        <img style={{width: 50, height: 50}} src={item.imgUrl} alt={''} />
      </span>
    )
  }
}
