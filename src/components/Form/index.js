import React, { Component, Fragment } from 'react'
import { Input, Select, DatePicker, Button, TreeSelect, Upload, Modal, Spin, Radio, Cascader } from 'antd'
import urls from '@src/config'
import Cropper from 'react-cropper'
import axios from '@src/utils/axios'
import './index.less'
import 'cropperjs/dist/cropper.css'
import DeptTreeSelect from '@src/components/DeptTreeSelect'
import store from '@src/store'

export default class extends Component {
  constructor(props) {
    super(props)
    this.state = {
      formData: this.props.formData || {},
      formList: this.props.formList || [],
      cropping: false
    }
  }

  componentDidMount = () => {
    this.fileReader = new window.FileReader()
    this.fileReader.onload = (e) => {
      const dataURL = e.target.result
      this.setState({ cropperSrc: dataURL })
    }
  }

  // 表单change事件
  onChange = (value, field, item) => {
    const { formData } = this.state
    formData[field] = value
    this.setState({ formData }, () => {
      if (typeof item.onChange === 'function') item.onChange(value)
    })
  }

  // 自动设置placeholder
  getPlaceholder = (item) => {
    let text = '请设置'
    const { type, label } = item
    if (['RangePicker'].includes(type)) {
      return ['开始时间', '结束时间']
    } else if (['Input'].includes(type)) {
      text = '请输入'
    } else if (['Select', 'DatePicker'].includes(type)) {
      text = '请选择'
    }
    return text + label
  }

  // 递归渲染树
  renderTreeNodes = (list, config) => {
    const { labelField = 'title', valueField = 'value', childrenField = 'children' } = config
    const { TreeNode } = TreeSelect
    return list.map((item) => {
      if (item[childrenField] && item[childrenField].length) {
        return (
          <TreeNode value={item[valueField]} title={item[labelField]} key={item[valueField]}>
            {this.renderTreeNodes(item[childrenField], config)}
          </TreeNode>
        )
      }
      return <TreeNode value={item[valueField]} title={item[labelField]} key={item[valueField]} />
    })
  }

  // 文件change
  fileChange = (file, item) => {
    const { field, cropper } = item
    const { status } = file
    const { formData } = this.state
    if (!status || status === 'error' || status === 'removed') {
      formData[field] = null
    } else {
      if (cropper) {
        formData[field] = null
        this.fileName = file.name
        this.fileReader.readAsDataURL(file.originFileObj)
      } else {
        formData[field] = [file]
      }
    }
    this.setState(formData, () => {
      if (typeof item.onChange === 'function') item.onChange(formData[field])
    })
  }

  // 裁剪ok点击事件
  cropOk = () => {
    this.setState({ cropping: true })
    this.cropper.getCroppedCanvas().toBlob((blob) => {
      const newFormData = new window.FormData()
      const file = new window.File([blob], this.fileName, { type: blob.type })
      newFormData.append('file', file, this.fileName)
      axios
        .post(urls.choicestUpload, newFormData, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then((res) => {
          if (res.ret === 0) {
            const { filePaths = [] } = res.retdata
            const { formData } = this.state
            formData[this.cropperForm.field] = [{ uid: '00', status: 'done', thumbUrl: filePaths[0], url: filePaths[0] }]
            this.setState({ formData, cropperSrc: '', cropping: false })
          }
        })
        .catch(() => {
          this.setState({ cropperSrc: '', cropping: false })
        })
    })
  }

  // 生成表单
  createForm = (item) => {
    const { formData } = this.state
    const { field, type, list, placeholder, cropper } = item

    const value = formData[field]
    const attr = {
      ...item,
      className: 'filter-value',
      value: ['RangePicker', 'DatePicker'].includes(type) ? value || null : value, // 为了正常显示placeholder
      onChange: (value) => this.onChange(value, field, item),
      placeholder: placeholder || this.getPlaceholder(item),
      display: 'xxx' // 防止react报错
    }
    if (cropper) {
      this.cropperForm = item
      attr.customRequest = () => {}
    }
    const { RangePicker } = DatePicker
    switch (type) {
      case 'Input':
        return <Input {...attr} onChange={(e) => this.onChange(e.target.value, field, item)} />

      case 'Upload':
        return (
          <Upload
            action={urls.bannerUpload}
            {...attr}
            value={null}
            listType="picture-card"
            fileList={value || []}
            onChange={({ file }) => this.fileChange(file, item)}
            showUploadList={{ showPreviewIcon: false, showRemoveIcon: true, showDownloadIcon: true }}
          >
            <Button type="primary">{value ? '重选文件' : '选择文件'}</Button>
          </Upload>
        )

      case 'Select':
        return (
          <Select {...attr}>
            {list.map((subItem, subIndex) => (
              <Select.Option value={subItem.value} key={subIndex}>
                {subItem.label}
              </Select.Option>
            ))}
          </Select>
        )

      case 'Cascader':
        return <Cascader {...attr} options={list} />

      case 'TreeSelect':
        const { labelField = 'title', valueField = 'value', childrenField = 'children' } = item
        if (labelField === 'title' && valueField === 'value' && childrenField === 'children') {
          return <TreeSelect showSearch treeNodeFilterProp="title" treeData={list} allowClear {...attr} />
        }
        return (
          <TreeSelect showSearch treeNodeFilterProp="title" allowClear {...attr}>
            {this.renderTreeNodes(list, item)}
          </TreeSelect>
        )

      // 组织架构树
      case 'DeptTreeSelect':
        return <DeptTreeSelect {...attr} />

      case 'DatePicker':
        return <DatePicker {...attr} />

      case 'RangePicker':
        return <RangePicker {...attr} />

      case 'Radio':
        return (
          <Radio.Group {...attr} onChange={(e) => this.onChange(e.target.value, field, item)}>
            {list.map((subItem, subIndex) => (
              <Radio value={subItem.value} key={subIndex}>
                {subItem.label}
              </Radio>
            ))}
          </Radio.Group>
        )

      default:
        return <div className="filter-value"></div>
    }
  }

  render = () => {
    const { formList, cropperSrc, cropping } = this.state
    const { btns, type } = this.props
    return (
      <div id="filter" className={type}>
        {formList.map((item, index) => {
          if (item.display === false) return null
          return (
            <div key={index} className="filter-form">
              <div className="filter-label">
                {item.required && <span className="required">*</span>}
                {item.label}：
              </div>
              {this.createForm(item)}
            </div>
          )
        })}

        {cropperSrc && (
          <Modal maskClosable={false} visible={true} title="裁剪图片" onOk={this.cropOk} onCancel={() => this.setState({ cropperSrc: '' })}>
            <Spin spinning={cropping}>
              <Cropper src={cropperSrc} ref={(cropper) => (this.cropper = cropper)} aspectRatio={this.cropperForm.cropper.aspectRatio || 1} guides={false} />
            </Spin>
          </Modal>
        )}

        {type !== 'modalFilter' && btns.length > 0 && (
          <div className="btns">
            {btns.map((item, index) => (
              <Button key={index} onClick={item.onClick} type={item.type || 'primary'}>
                {item.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    )
  }
}
