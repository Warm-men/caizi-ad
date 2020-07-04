import React, { Component, PureComponent } from 'react'
import {
  Button,
  Switch,
  Popover,
  Input,
  Icon,
  message,
  Row,
  Col,
  Checkbox
} from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import './index.less'
export default class BusinessCard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showCompanyName: false,
      checkedCompanyName: false,
      showSuperDept: false,
      checkedSuperDept: false,
      showSelfDept: false,
      checkedSelfDept: false,
      showDuty: false,
      checkedDuty: false,
      showPhoneNumber: false,
      checkedPhoneNumber: false,
      checkedAddress: false,
      checkedQRCode: false,
      checkedDescription: false,
      descriptionValue: '',
      allowedUpload: false,
      isChange: false
    }
    this.inLimitedButton = ['showCompanyName', 'showSuperDept', 'showSelfDept', 'showDuty']
    this.basicButtonsView = [
      {
        leftButton: {
          name: '企业简称',
          type: 'checkedCompanyName'
        },
        rightButton: {
          type: 'showCompanyName'
        }
      },
      {
        leftButton: {
          name: '上级部门',
          type: 'checkedSuperDept'
        },
        rightButton: {
          type: 'showSuperDept'
        }
      },
      {
        leftButton: {
          name: '所在部门',
          type: 'checkedSelfDept'
        },
        rightButton: {
          type: 'showSelfDept'
        }
      },
      {
        leftButton: {
          name: '职务',
          type: 'checkedDuty'
        },
        rightButton: {
          type: 'showDuty'
        }
      }
    ]
    this.restButtonsView = [
      {
        leftButton: {
          name: '手机',
          type: 'checkedPhoneNumber'
        },
        rightButton: {
          type: 'showPhoneNumber'
        }
      },
      {
        leftButton: {
          name: '地址',
          type: 'checkedAddress'
        }
      }
    ]
    this.buttonsRelation = {
      checkedCompanyName: 'showCompanyName',
      checkedSuperDept: 'showSuperDept',
      checkedSelfDept: 'showSelfDept',
      checkedDuty: 'showDuty',
      checkedPhoneNumber: 'showPhoneNumber'
    }
  }

  componentDidMount = () => {
    this.pullData()
  }

  pullData = () => {
    axios
      .get(urls.getCardSettings, {})
      .then((res) => {
        const { retdata } = res
        this.setState({
          showCompanyName: !!retdata.corpNameInHead,
          checkedCompanyName: !!retdata.corpNameInCard,
          showSuperDept: !!retdata.parentDeptInHead,
          checkedSuperDept: !!retdata.parentDeptInCard,
          showSelfDept: !!retdata.deptInHead,
          checkedSelfDept: !!retdata.deptInCard,
          showDuty: !!retdata.positionInHead,
          checkedDuty: !!retdata.positionInCard,
          showPhoneNumber: !!retdata.mobileInHead,
          checkedPhoneNumber: !!retdata.mobileInCard,
          checkedAddress: !!retdata.addressInCard,
          checkedQRCode: !!retdata.qrCodeInCard,
          checkedDescription: !!retdata.descInCard,
          descriptionValue: retdata.desc,
          allowedUpload: !!retdata.editQrCodeAndDesc
        }, this.markState)
      })
  }

  isLimited = (type) => {
    if (!this.inLimitedButton.includes(type)) return false
    const { state } = this
    let limitNum = 0
    for (let item in state) {
      const includeItem = this.inLimitedButton.includes(item)
      if (includeItem && state[item]) {
        limitNum++
      }
    }
    return limitNum >= 2
  }

  markState = () => {
    this.currentState = {...this.state}
  }

  handleCancel = () => {
    this.setState({
      ...this.currentState,
      isChange: false
    })
  }

  onChangeState = (type, value) => {
    const isLimited = value && this.isLimited(type)
    if (value && isLimited) {
      message.destroy()
      return message.warning('只能展示两个')
    }
    let { state } = this
    state[type] = value
    if (!value) {
      for (let item in this.buttonsRelation) {
        if (item === type) {
          const showButton = this.buttonsRelation[item]
          state[showButton] = value
        }
      }
    }
    if (!state.checkedQRCode && !state.checkedDescription) {
      state.allowedUpload = false
    }
    this.setState({
      ...state,
      isChange: true
    })
  }

  handleSubmit = () => {
    const { state } = this
    const params = {
      corpNameInHead: state.showCompanyName ? 1 : 0,
      corpNameInCard: state.checkedCompanyName ? 1 : 0,
      parentDeptInHead: state.showSuperDept ? 1 : 0,
      parentDeptInCard: state.checkedSuperDept ? 1 : 0,
      deptInHead: state.showSelfDept ? 1 : 0,
      deptInCard: state.checkedSelfDept ? 1 : 0,
      positionInHead: state.showDuty ? 1 : 0,
      positionInCard: state.checkedDuty ? 1 : 0,
      mobileInHead: state.showPhoneNumber ? 1 : 0,
      mobileInCard: state.checkedPhoneNumber ? 1 : 0,
      addressInCard: state.checkedAddress ? 1 : 0,
      qrCodeInCard: state.checkedQRCode ? 1 : 0,
      descInCard: state.checkedDescription ? 1 : 0,
      desc: state.descriptionValue,
      editQrCodeAndDesc: state.allowedUpload ? 1 : 0
    }
    this.setState({ loading: true })
    axios
      .post(
        urls.saveCardSettings,
        params,
        { headers: { 'Content-Type': 'application/json' } }
      )
      .then((res) => {
        message.success('保存成功！')
        this.setState({ isChange: false })
      })
  }

  renderButtons = (data) => {
    const { state } = this
    return data.map((item, index) => {
      return (
        <Row style={{marginTop: 20}} key={index + ''}>
          <Col span={12} style={{paddingLeft: 50}}>
            <Checkbox
              checked={state[item.leftButton.type]}
              onChange={(e) => this.onChangeState(item.leftButton.type, e.target.checked)}
            >
              {item.leftButton.name}
            </Checkbox>
          </Col>
          {item.rightButton
            ? <Col span={12} style={{textAlign: 'center'}}>
              <Switch
                checked={state[item.rightButton.type]}
                disabled={!state[item.leftButton.type]}
                onChange={value => this.onChangeState(item.rightButton.type, value)}
              />
            </Col> : null }
        </Row>
      )
    })
  }

  render = () => {
    const { state } = this
    const BasicButtonsView = this.renderButtons(this.basicButtonsView)
    const RestButtonsView = this.renderButtons(this.restButtonsView)
    return (
      <div className="businessCardContainer">
        <div className={'cardView'}>
          <div className={'headerView'}>
            <span>名片信息</span>
            <Popover
              content={<HintView1 />}
            >
              <Icon type={'info-circle'} style={{marginLeft: 10}}/>
            </Popover>
          </div>
          <div style={{display: 'flex'}}>
            <div className={'leftView'}>
              <div className={'settingViewWrapper'}>
                <Row style={{marginTop: 20}}>
                  <Col span={12}><span style={{marginLeft: 20, fontWeight: 550}}>基础信息：</span></Col>
                </Row>
                <Row>
                  <Col span={12}></Col>
                  <Col span={12} style={{textAlign: 'center'}}>在页首个人信息栏目展示</Col>
                </Row>
                {BasicButtonsView}
                <Row style={{marginTop: 40}}>
                  <Col span={12}><span style={{marginLeft: 20, fontWeight: 550}}>附加信息：</span></Col>
                </Row>
                {RestButtonsView}
              </div>
            </div>
            <div className={'rightView'}>
              <div className={'rightViewMianTitle'}>
                预览效果：
              </div>
              <div className="subTitle">
                页首个人信息栏目：
              </div>
              <img src={require('@src/assets/cardInfoImg1.png')} />
              <div className="subTitle">
                早报及小站名片：
              </div>
              <img src={require('@src/assets/cardInfoImg2.png')} />
              <div className="subTitle">
              上述效果为勾选全部信息项，且打开“企业简称”、“部门”和“手机”3个信息项“在页首个人信息栏目展示”开关后，早报及工作室名片的展示效果。
              </div>
            </div>
          </div>

        </div>

        <div className={'bannerView'}>
          <div className={'headerView'}>
            <span>海报名片信息</span>
            <Popover
              content={<HintView2 />}
            >
              <Icon type={'info-circle'} style={{marginLeft: 10}}/>
            </Popover>
          </div>

          <div style={{display: 'flex'}}>
            <div className={'bannerViewLeft'}>
              <Row style={{marginTop: 20}}>
                <Checkbox
                  checked={state.checkedQRCode}
                  onChange={(e) => this.onChangeState('checkedQRCode', e.target.checked)}
                >
                  二维码
                </Checkbox>
                <Checkbox
                  checked={state.checkedDescription}
                  onChange={(e) => this.onChangeState('checkedDescription', e.target.checked)}
                >
                  描述说明
                </Checkbox>
              </Row>
              {state.checkedDescription
                ? <Row style={{marginTop: 20}}>
                  <Input.TextArea
                    maxLength={60}
                    style={{height: 150, width: 800}}
                    placeholder={'请输入描述说明的内容，控制在60个字符以内，员工将可使用此默认内容展示在海报名片中。'}
                    onChange={(e) => this.onChangeState('descriptionValue', e.target.value)}
                    value={state.descriptionValue}
                  />
                </Row> : null }
              <Row style={{marginTop: 20}}>
            允许员工上传二维码及编辑描述说明的内容：<Switch
                  checked={state.allowedUpload}
                  disabled={!state.checkedQRCode && !state.checkedDescription}
                  onChange={value => this.onChangeState('allowedUpload', value)}
                />
              </Row>
            </div>
            <div className={'bannerViewRight'}>
              <div className={'rightViewMianTitle'}>
                预览效果：
              </div>
              <div className="subTitle">
                海报名片：
              </div>
              <img src={require('@src/assets/cardInfoImg3.png')} />
              <div className="subTitle">
              上述效果为勾选“二维码”和“描述说明”2个信息项后，海报名片的展示效果。
              </div>
            </div>
          </div>

        </div>
        <div className={'footerView'}>
          {state.isChange
            ? <Row style={{marginTop: 20}} style={{display: 'flex', justifyContent: 'flex-end'}} >
              <Button type={'default'} onClick={this.handleCancel} style={{marginRight: 20}}>取消</Button>
              <Button type={'primary'} onClick={this.handleSubmit}>确认</Button>
            </Row>
            : null }
        </div>
      </div>
    )
  }
}

class HintView1 extends PureComponent {
  render () {
    return (
      <div>
        <div>
          1、基础信息和附加信息的信息项，勾选后，员工的早报及小站名片将展示相应的信息。
        </div>
        <div>
        2、4项基础信息以及附加信息的”手机“支持设置”在页首个人信息栏目展示“，打开开关，对应的信息或按钮将同时展示于页首个人信息栏目，最多支持同时展示2项基础信息+”电话联系“按钮。
        </div>
      </div>
    )
  }
}

class HintView2 extends PureComponent {
  render () {
    return (
      <div>
        <div>
          1、海报名片信息，勾选的信息项，将在海报名片中展示。
        </div>
        <div>
          2、若打开“允许员工上传二维码及编辑描述说明的内容 ”的开关，员工将可上传二维码和编辑描述说明的内容；若关闭， 员工只能使用企业微信二维码和管理员指定的描述说明内容。
        </div>
      </div>
    )
  }
}
