import React, { Component } from 'react'
import { message, Button, Spin, Input, Switch, Icon, Tag } from 'antd'
import { Link } from 'react-router-dom'
import axios from '@src/utils/axios'
import urls from '@src/config'
import Tags from '@src/components/Tags'
import Staffs from '@src/components/Staffs'
import utils from '@src/utils'
import './index.less'

export default class extends Component {
  constructor(props) {
    super(props)
    this.params = JSON.parse(decodeURIComponent(props.match.params.params))
    const { channelName = '', qrSkipVerify = true, qrCorpQywxCustomerTags = [], qrStaffs = [] } = this.params
    this.state = {
      channelName,
      loading: false,
      qrSkipVerify,
      qrCorpQywxCustomerTags,
      qrStaffs
    }
  }

  submit = () => {
    const { channelName, qrSkipVerify, qrCorpQywxCustomerTags = [], qrStaffs = [] } = this.state
    const { id } = this.params
    const api = id ? 'qrodeUpdate' : 'qrodeCreate'
    if (!channelName || !qrCorpQywxCustomerTags.length || !qrStaffs.length) {
      message.error('请填写必填项')
      return
    }
    if (channelName.length > 15) {
      message.warn('请输入15字内的渠道名称')
      return
    }
    const params = {
      channelName,
      qrSkipVerify,
      qrCorpQywxCustomerTags: qrCorpQywxCustomerTags.map((item) => ({ tagWxid: item.tagWxid })),
      qrStaffs: qrStaffs.map((item) => ({ userId: item.userId }))
      // qrStaffs: [{ userId: 'BaoZi' }]
    }
    if (id) params.id = id
    this.setState({ loading: true })
    axios
      .post(urls[api], params, { headers: { 'Content-Type': 'application/json' } })
      .then((res) => {
        if (res.ret === 0) {
          message.success(`数据${id ? '修改' : '添加'}成功`)
          this.props.history.push('/posterSetting?active=1')
        }
      })
      .catch(() => {
        this.setState({ loading: false })
      })
  }

  // 表单change事件
  fieldChange = (field, value) => {
    this.setState({ [field]: value })
  }

  // 显示使用人员
  showStaffs = () => {
    this.setState({ visibleStaff: true })
  }

  // 显示渠道标签
  showTags = () => {
    this.setState({ visibleTag: true })
  }

  // 设置使用人员
  setStaffs = (qrStaffs) => {
    this.setState({ visibleStaff: false, qrStaffs })
  }

  // 设置渠道标签
  setTags = (qrCorpQywxCustomerTags) => {
    this.setState({ visibleTag: false, qrCorpQywxCustomerTags })
  }

  // 删除使用人员
  delStaff = (index) => {
    const { qrStaffs } = this.state
    qrStaffs.splice(index, 1)
    this.setState({ qrStaffs })
  }

  // 删除标签
  delTag = (index) => {
    const { qrCorpQywxCustomerTags } = this.state
    qrCorpQywxCustomerTags.splice(index, 1)
    this.setState({ qrCorpQywxCustomerTags })
  }

  render = () => {
    const { loading, channelName, qrSkipVerify, visibleStaff, visibleTag, qrCorpQywxCustomerTags, qrStaffs } = this.state
    const { id, qrCodeUrl } = this.params
    return (
      <div id="qrodeEdit">
        <Spin spinning={loading}>
          <div className="title">渠道拓展 / {id ? '编辑' : '新增'}</div>
          <div className="qrodeEdit-content">
            <div className="form-items">
              <div className="item">
                <div className="label">
                  <span className="required">*</span>渠道名称：
                </div>
                <div className="value">
                  <Input value={channelName} onChange={(e) => this.fieldChange('channelName', e.target.value)} placeholder="请输入15字以内的名称" />
                </div>
              </div>
              <div className="item">
                <div className="label">
                  <span className="required">*</span>使用人员：
                </div>
                <div className="value">
                  {qrStaffs.length > 0 && (
                    <div className="selected-items">
                      {qrStaffs.slice(0, 10).map((item, index) => (
                        <Tag key={index} closable onClose={() => this.delStaff(index)}>
                          {item.name}
                        </Tag>
                      ))}
                      {qrStaffs.length > 10 && '...'}
                    </div>
                  )}
                  <Button type="dashed" onClick={this.showStaffs}>
                    <Icon type="plus" />
                    添加
                  </Button>
                </div>
              </div>
              <div className="item">
                <div className="label">
                  <span className="required">*</span>添加设置：
                </div>
                <div className="value">
                  <Switch checked={qrSkipVerify} onChange={(value) => this.fieldChange('qrSkipVerify', value)} />
                  客户添加时<span className="blue">{qrSkipVerify ? '无需' : '需要'}</span>经过确认自动成为好友
                </div>
              </div>
              <div className="item">
                <div className="label">
                  <span className="required">*</span>渠道标签：
                </div>
                <div className="value">
                  {qrCorpQywxCustomerTags.length > 0 && (
                    <div className="selected-items">
                      {qrCorpQywxCustomerTags.map((item, index) => (
                        <Tag key={index} closable onClose={() => this.delTag(index)}>
                          {item.tagName}
                        </Tag>
                      ))}
                    </div>
                  )}
                  <Button type="dashed" onClick={this.showTags}>
                    <Icon type="plus" />
                    添加
                  </Button>
                </div>
              </div>
            </div>
            <div className="qrCode">
              <a target="_blank" href={qrCodeUrl}>
                <img src={qrCodeUrl || require('@src/assets/qr.png')} />
              </a>
              {qrCodeUrl && <a onClick={() => utils.downImg(qrCodeUrl, channelName)}>点击下载</a>}
            </div>
          </div>
          <Link to="/posterSetting?active=1" replace>
            <Button style={{ marginRight: '8px' }}>返回</Button>
          </Link>

          <Button type="primary" onClick={this.submit}>
            {id ? '修改' : '创建'}
          </Button>
        </Spin>

        {visibleTag && <Tags limit={10} selected={qrCorpQywxCustomerTags} onOk={this.setTags} onCancel={() => this.setState({ visibleTag: false })} />}
        {visibleStaff && <Staffs selected={qrStaffs} onOk={this.setStaffs} onCancel={() => this.setState({ visibleStaff: false })} />}
      </div>
    )
  }
}
