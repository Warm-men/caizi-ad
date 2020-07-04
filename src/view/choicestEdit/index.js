import React, { Component } from 'react'
import { message, Button, Spin } from 'antd'
import axios from '@src/utils/axios'
import utils from '@src/utils'
import urls from '@src/config'
import Form from '@src/components/Form'
import './index.less'
import moment from 'moment'
import { connect } from 'react-redux'

class ChoicestEdit extends Component {
  state = { formData: {}, loading: false }

  componentDidMount = () => {
    const id = utils.searchToJson().id
    if (id) this.getData()
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

  formList = [
    { type: 'Input', field: 'bannerName', required: true, label: '活动名称', placeholder: '请输入15字内的活动名称', role: { maxLength: 15 } },
    {
      type: 'Upload',
      field: 'bannerImgUrl',
      required: true,
      label: '活动banner',
      beforeUpload: this.beforeUpload,
      action: urls.choicestUpload,
      cropper: { aspectRatio: 3.56 }
    },
    { type: 'Input', field: 'bannerLink', required: true, label: '活动链接' },
    {
      type: 'DeptTreeSelect',
      field: 'deptIdList',
      required: true,
      label: '所选机构'
    },
    { type: 'DatePicker', field: 'startTime', required: true, label: '开始时间' },
    { type: 'DatePicker', field: 'endTime', required: true, label: '结束时间' }
  ]

  getData = () => {
    this.setState({ loading: true })
    const id = utils.searchToJson().id
    axios
      .post(
        urls.choicestDetail,
        { id },
        {
          headers: { 'Content-Type': 'application/json' }
        }
      )
      .then((res) => {
        const { choicestBanner = {} } = res.retdata
        const { formData } = this.state
        const { bannerImgUrl, startTime, endTime, id, bannerName, bannerLink, deptIdList } = choicestBanner
        Object.assign(formData, {
          bannerImgUrl: [{ uid: '00', status: 'done', thumbUrl: bannerImgUrl, url: bannerImgUrl }],
          startTime: moment(startTime),
          endTime: moment(endTime),
          id,
          bannerName,
          bannerLink,
          deptIdList
        })
        this.setState({ formData })
      })
      .finally(() => {
        this.setState({ loading: false })
      })
  }

  submit = () => {
    const { formData } = this.state
    const id = utils.searchToJson().id
    const api = id ? 'choicestUpdate' : 'choicestCreate'
    const { bannerName = '', bannerImgUrl, bannerLink, deptIdList = [], startTime, endTime } = formData
    let url = ''
    try {
      url = bannerImgUrl[0].url || bannerImgUrl[0].response.retdata.filePaths[0]
    } catch (err) {}
    if (!bannerName || !url || !bannerLink || !startTime || !endTime || !deptIdList.length) {
      message.warn('请填写必填项')
      return
    }
    if (bannerName.length > 15) {
      message.warn('请输入15字内的活动名称')
      return
    }
    if (bannerLink.length > 128) {
      message.warn('请输入128字内的活动链接')
      return
    }
    this.setState({ loading: true })
    const params = {
      bannerName,
      bannerImgUrl: url,
      bannerLink,
      deptIdList,
      startTime: startTime ? startTime.format('YYYY-MM-DD') + ' 00:00:00' : '',
      endTime: endTime ? endTime.format('YYYY-MM-DD') + ' 23:59:59' : ''
    }
    if (id) params.id = id
    axios
      .post(urls[api], params, {
        headers: { 'Content-Type': 'application/json' }
      })
      .then((res) => {
        if (res.ret === 0) {
          message.success(`数据${id ? '修改' : '添加'}成功`)
          this.props.history.push('/choicestBanner')
        }
      })
      .finally(() => {
        this.setState({ loading: false })
      })
  }

  render = () => {
    const id = utils.searchToJson().id
    const { formData, loading } = this.state
    return (
      <div id="choicestEdit">
        <Spin spinning={loading}>
          <div className="title">精选内容 / {id ? '编辑' : '新增'}</div>
          <div className="info">最多同时生效6个活动，超过数量将默认进入待生效状态</div>
          <Form ref={(FormRef) => (this.FormRef = FormRef)} type="modalFilter" formList={this.formList} formData={formData} />
          <Button className="btn" type="primary" onClick={this.submit}>
            确认发布
          </Button>
        </Spin>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    deptList: state.base.deptList
  }
}

export default connect(mapStateToProps)(ChoicestEdit)
