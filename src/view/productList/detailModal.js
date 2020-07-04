import React, { Component } from 'react'
import { Tabs, Button, Upload, Icon, message, TreeSelect, Spin, Modal } from 'antd'
import { Link, withRouter } from 'react-router-dom'
import axios from '@src/utils/axios'
import Tools from '@src/utils'
import urls from '@src/config'
import styles from './index.less'

class DetailModal extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      id: '',
      isLoading: false,
      // 业务类型: '',1-对公业务 2-零售业务
      businessType: '',
      // 产品名称
      name: '',
      // 风险评级
      risk: '',
      // 产品代码
      code: '',
      // 产品收益
      income: '',
      // 收益率
      incomeRate: '',
      // 起购金额
      leatAmount: '',
      // 投资期限
      dueTime: '',
      // 特点
      feature: '',
      // 是否主推产品 0否 1是
      isPush: '',
      // 0理财产品 1非理财产品
      type: '',
      // 0 手动编写的描述 1导入的文件描述
      descType: '',
      // 描述
      desc: '',
      // 开始时间 2019-07-01
      startDate: '',
      // 结束时间
      endDate: '',
      // 产品类别ID
      productTypeId: '',
      saleStartDate: '',
      saleEndDate: '',
      interestStartDate: '',
      interestEndDate: '',
      list2: [],
      list3: [],
      raiseStartTime: null,
      raiseEndTime: null,
      currency: '',
      raiseType: '',
      increaseAmount: '',
      danger: '',
      price: '', // 价格
      specification: '' // 规格
    }
  }

  componentWillReceiveProps (next) {
    if (next.detailId !== this.props.detailId) {
      this.setState({ isLoading: true })
      axios.post(urls.getProductDetail, { id: next.detailId }).then(res => {
        const { detail } = res.retdata
        this.setState({
          ...detail,
          isLoading: false
        })
      })
    }
  }

  hideModal = () => {
    this.props.hideModal()
  }

  callback = (key) => {
    if ((key - 0) !== 1) {
      this.setState({ isLoading: true })
      axios.post(urls[(key - 0) === 2 ? 'speechList' : 'issueList'], { productId: this.props.detailId }).then(res => {
        const { list = [] } = res.retdata
        this.setState({
          [`list${key}`]: list,
          isLoading: false
        })
      })
    }
  }

  goEdit = () => {
    const { id } = this.state
    const { currentRecord } = this.props
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'productEdit')
    if (!isRight) return
    if (!currentRecord.owner) {
      Tools.openRightMessage()
      return
    }
    const path = { pathname: '/productUpdate', search: `?id=${id}` }
    this.props.history.push(path)
  }

  render () {
    const { visible } = this.props
    const { id, isLoading, name, code, risk, income, incomeRate, leatAmount, danger, incomeRateIsCustomize,
      dueTime, saleStartDate, saleEndDate, interestStartDate, interestEndDate, feature, descType, desc, isPush, startDate, endDate, type,
      list2, list3, raiseStartTime, raiseEndTime, currency, raiseType, increaseAmount, price, specification } = this.state
    const tableTitle = <span>
      <span>产品详情</span>
      <span className={styles.tableTitle}>(实际样式以小程序为准)</span>
      <Button onClick={this.goEdit} type="primary" style={{float: 'right', margin: '0 50px 0 0'}}>编辑产品</Button>
    </span>
    const { TabPane } = Tabs
    let tag = '%'
    let duetime = dueTime.substr(0, dueTime.length - 1)
    let unit = dueTime.substr(dueTime.length - 1)
    let duetimeunit = ''
    if (unit === '无') {
      duetimeunit = duetime
    } else {
      duetimeunit = duetime + unit
    }
    if (incomeRateIsCustomize === 1) { tag = '' }
    return (
      <div>
        <Modal
          width={1000}
          wrapClassName={'productListDetailModal'}
          title={tableTitle}
          className
          visible={visible}
          destroyOnClose={true}
          onCancel={this.hideModal}
          footer={null}
        >
          <Spin spinning={isLoading}>
            <Tabs defaultActiveKey="1" onChange={this.callback} className={styles.detailContent}>
              <TabPane tab="产品详情" key="1">
                <div className={styles.detailContent}>
                  <div className={styles.name}>{name}</div>
                  <ul className={styles.filed}>
                    <li><span>产品代码：</span>{code}</li>
                    {type === 1 ? <li><span>风险等级：</span>{risk}</li> : null}
                    {type === 1 ? <li><span>产品收益：</span>{income}</li> : null}
                    {type === 1 ? <li><span>预期收益率：</span>{incomeRate ? `${incomeRate}${tag} ` : null}</li> : null}
                    <li><span>币种：</span>{currency === 'RMB' ? '人民币' : currency === 'USD' ? '美元' : currency === 'OTHER' ? '其他' : '无'}</li>
                    {type === 1 ? <li><span>起购金额：</span>{leatAmount}</li> : null}
                    {type === 1 ? <li><span>投资期限：</span>{duetimeunit}</li> : null}
                    {type === 1 ? <li><span>募集方式：</span>{raiseType === 'PUBLIC' ? '公开募集' : raiseType === 'SPECIAL' ? '面向特定人群募集' : '无'}</li> : null}
                    {type === 1 ? <li><span>递增金额：</span>{increaseAmount}</li> : null}
                    {type === 1 ? <li><span>募集开始日期：</span>{raiseStartTime}</li> : null}
                    {type === 1 ? <li><span>募集截止日期：</span>{raiseEndTime}</li> : null}
                    {type === 1 ? <li><span>起息日期：</span>{interestStartDate}</li> : null}
                    {type === 1 ? <li><span>到期日期：</span>{interestEndDate}</li> : null}
                    {type === 3 ? <li><span>价格：</span>{price}</li> : null}
                    {type === 3 ? <li><span>规格：</span>{specification}</li> : null}
                  </ul>
                  <div className={styles.subTitle}>产品介绍</div>
                  <div className={styles.desc}>
                    {(descType === 0 || descType === 2 || descType === 3)
                      ? <p dangerouslySetInnerHTML={{ __html: desc }} ></p>
                      : desc.split(',').map(url => {
                        return <img width={600} src={url} key={url}/>
                      })}
                  </div>
                  <div className={styles.subTitle}>产品特点</div>
                  <div className={styles.feature}>{feature}</div>
                  <div className={styles.subTitle}>风险揭示</div>
                  <div className={styles.feature}>{danger}</div>
                </div>
              </TabPane>
              <TabPane tab="营销话术" key="2">
                {list2.map((v, k) => {
                  return (<div key={v.id} className="yxhs-box">
                    <img src={require('@src/assets/related-icon.png')} />
                    <div>
                      <div className="yxhs-title">营销小助手</div>
                      <div style={{ width: 555 }}>{v.speech}</div>
                      <div className="copy">复制话术</div>
                    </div>
                  </div>)
                })}
                {(!list2 || list2.length === 0) ? <div className="nothing">
                  <img src={require('@src/assets/none.png')} className="none" alt=""/>
                  <p className="none-tips">暂未填写关于此产品的营销话术</p>
                </div> : null}
              </TabPane>
              <TabPane tab="常见问题" key="3">
                {list3.map((v, k) => {
                  return (<div key={v.id} className="question-box">
                    <div className="ques">
                      <img src={require('@src/assets/question.png')} alt=""/>
                      <div className="ques-title-question">{v.issue}</div>
                    </div>
                    <div className="answer">
                      <img src={require('@src/assets/related-icon2.png')} alt=""/>
                      <div className="ques-title-answer">{v.answer}</div>
                    </div>
                    <div className="copy">复制话术</div>
                  </div>)
                })}
                {(!list3 || list3.length === 0) ? <div className="nothing">
                  <img src={require('@src/assets/none.png')} className="none" alt=""/>
                  <p className="none-tips">暂未填写关于此产品的常见问题</p>
                </div> : null}
              </TabPane>
            </Tabs>
          </Spin>
        </Modal>
      </div>
    )
  }
}

export default withRouter(DetailModal)
