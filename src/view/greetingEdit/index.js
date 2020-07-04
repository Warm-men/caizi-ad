import React, { Component } from 'react'
import { message, Button, Spin } from 'antd'
import axios from '@src/utils/axios'
import utils from '@src/utils'
import urls from '@src/config'
import Form from '@src/components/Form'
import provinces from '@src/utils/provinces'
import './index.less'
// import location from './location'

// const fn = (list, parent) => {
//   const newList = list.map((item) => {
//     const result = { id: item.id, label: item.fullname, value: item.fullname }
//     if (item.children && item.children.length) {
//       result.children = fn(item.children, item)
//     }
//     return result
//   })
//   if (parent) newList.unshift({ id: parent.id, label: parent.fullname, value: parent.fullname })
//   return newList
// }
// console.log(JSON.stringify(fn(location)))

// {
//   id: '10000',
//   label: '全国',
//   value: '全国',
//   children: [{ id: '10000', label: '全国', value: '全国' }]
// },

export default class extends Component {
  constructor (props) {
    super(props)
    this.params = JSON.parse(decodeURIComponent(props.match.params.params))
    const { id, type = 0, name, url, province, city } = this.params
    this.formList = [
      { type: 'Input', field: 'name', required: true, label: '活动名称', placeholder: '请输入15字内的活动名称' },
      {
        type: 'Radio',
        field: 'type',
        required: true,
        label: '类型',
        list: [
          { label: '微信公众号链接', value: 0 },
          { label: '图片', value: 1 }
        ],
        onChange: (value) => {
          if (value) {
            this.formList[3].display = true
            this.formList[2].display = false
          } else {
            this.formList[3].display = false
            this.formList[2].display = true
          }
          this.setState({ xxx: Math.random() })
        }
      },
      { type: 'Input', field: 'url0', required: true, label: '微信链接', display: !type },
      {
        type: 'Upload',
        field: 'url1',
        required: true,
        label: '展业海报',
        beforeUpload: this.beforeUpload,
        action: urls.choicestUpload,
        display: !!type
      },
      {
        type: 'Cascader',
        required: true,
        label: '所选城市',
        field: 'location',
        list: provinces
      }
    ]

    this.state = {
      formData: {
        id,
        type,
        name,
        url0: type ? null : url,
        url1: type ? [{ uid: '00', status: 'done', thumbUrl: url, url }] : null,
        location: [province, city]
      },
      loading: false
    }
  }

  // 文件上传前判断
  beforeUpload = (file) => {
    const { name } = file
    const typeArr = name.split('.')
    const type = typeArr[typeArr.length - 1]
    if (!['png', 'jpg', 'jpeg', 'gif'].includes(type)) {
      message.error('只能上传png、jpg、jpeg、gif格式的图片！')
      return false
    }
    return true
  }

  submit = () => {
    const { formData } = this.state
    const { id, name, type, url0, url1, location } = formData
    const [province, city] = location
    const api = id ? 'greetEdit' : 'greetSave'
    let url = ''
    try {
      url = type ? url1[0].url || url1[0].response.retdata.filePaths[0] : url0
    } catch (err) {}
    if (!name || !url || !province || !city) {
      message.warn('请填写必填项')
      return
    }
    if (name.length > 15) {
      message.warn('请输入15字内的活动名称')
      return
    }
    if (url.length > 128) {
      message.warn('请输入128字内的活动链接')
      return
    }
    this.setState({ loading: true })
    const params = {
      name,
      url: url,
      type,
      province,
      city
    }
    if (id) params.id = id
    axios
      .post(urls[api], params, {
        headers: { 'Content-Type': 'application/json' }
      })
      .then((res) => {
        if (res.ret === 0) {
          message.success(`数据${id ? '修改' : '添加'}成功`)
          this.props.history.push('/greeting')
        }
      })
      .catch(() => {
        this.setState({ loading: false })
      })
  }

  render = () => {
    const id = utils.searchToJson().id
    const { formData, loading } = this.state
    return (
      <div id="choicestEdit">
        <Spin spinning={loading}>
          <div className="title">添加好友默认推送 / {id ? '编辑' : '新增'}</div>
          <Form ref={(FormRef) => (this.FormRef = FormRef)} type="modalFilter" formList={this.formList} formData={formData} />
          <Button className="btn" type="primary" onClick={this.submit}>
            确认发布
          </Button>
        </Spin>
      </div>
    )
  }
}
