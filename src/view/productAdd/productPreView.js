import React, { Component } from 'react'
import { Button, Modal, message, Spin, Collapse, Carousel } from 'antd'
import { withRouter } from 'react-router-dom'
import styles from './productPreView.less'
const { Panel } = Collapse
class productPreView extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      productType: '', // 产品类别
      currency: '', // 币种
      dateType: 0
    }
  }

  componentDidMount () {
    const {dataOptions} = this.props
    dataOptions.currentProductTypeList.forEach(item => {
      if (item.productTypeId === dataOptions.productTypeId) {
        this.setState({
          productType: item.productTypeName
        })
      }
    })
    // 币种
    dataOptions.currency === 'NONE' ? this.setState({ currency: '无' }) : dataOptions.currency === 'RMB'
      ? this.setState({ currency: '人民币' }) : dataOptions.currency === 'USD' ? this.setState({ currency: '美元' }) : this.setState({ currency: '其他' })
    // 日期
    let interestStartDate = dataOptions.interestStartDate !== '00.00'
    let interestEndDate = dataOptions.interestEndDate !== '00.00'
    let raiseStartTime = dataOptions.raiseStartTime !== '00.00'
    let raiseEndTime = dataOptions.raiseEndTime !== '00.00'
    if (interestStartDate && interestEndDate && raiseStartTime && raiseEndTime) {
      this.setState({dateType: 1})
    } else if (interestStartDate && interestEndDate && (raiseStartTime || !raiseStartTime || raiseEndTime || !raiseEndTime)) {
      this.setState({dateType: 2})
    } else if (raiseStartTime && raiseEndTime && (interestStartDate || !interestStartDate || interestEndDate || !interestEndDate)) {
      this.setState({dateType: 3})
    }
  }

  render () {
    const { dataOptions } = this.props
    const { productType, currency, dateType } = this.state
    return (
      <div>
        <Modal
          width={440}
          bodyStyle={{ overflow: 'auto' }}
          visible={true}
          onCancel={ this.props.preCallback }
          footer={null}
        >
          <div className={styles.head}></div>
          {/* type 1 理财 2非理财 3贵金属 */}
          <div>
            <div className={styles.financialContainer}>
              <div className={styles.title}>{ dataOptions.name }</div>
              <div className={styles.detail}>
                <div><span>类别：</span><span>&nbsp;{productType}</span></div>
                {dataOptions.type === 1 || dataOptions.type === 2 ? <div><span>币种：</span><span>&nbsp;{currency}</span></div> : null}
                {dataOptions.type === 3 ? <div><span>规格：</span><span>&nbsp;{dataOptions.specification}</span></div> : null}
                {dataOptions.type === 1 ? <div><span>风险等级：</span><span>&nbsp;{dataOptions.risk}</span></div> : null }
              </div>
              {dataOptions.type === 1 ? <div style={{ height: 6, background: '#f2f2f2' }}></div> : null}
              {dataOptions.type === 1 ? <div className={styles.profit}>
                <div>
                  <span style={{fontWeight: 'bold', color: '#ff0000'}}>
                    {dataOptions.rateType === 2 ? dataOptions.incomeRateOther : dataOptions.rateType === 1 ? dataOptions.incomeRateMin + '~' + dataOptions.incomeRateMax + '%' : dataOptions.incomeRate + '%'}
                  </span><br />
                  {dataOptions.income}
                </div>
                <div><span style={{fontWeight: 'bold'}}>{dataOptions.dueTime}{dataOptions.dueTimeUnit}</span><br />期限</div>
              </div> : null}
              {dataOptions.type === 3 ? <div className={styles.profit}>
                <div>
                  <span style={{fontWeight: 'bold', color: '#ff0000'}}>{dataOptions.price}</span>
                </div>
              </div> : null}
              <div style={{ height: 6, background: '#f2f2f2', marginTop: 8, marginBottom: 8 }}></div>
              {/* 理财周期========start================= */}
              {dataOptions.type === 1 && dateType === 1
                ? <div>
                  <div className={styles.title}>理财周期</div>
                  <div style={{ height: 1, background: '#f2f2f2', marginTop: 1, marginBottom: 8 }}></div>
                  <div className={styles.financialCycle}>
                    <div>募集开始</div><div>募集结束</div><div>起息日</div><div>到期</div>
                  </div>
                  <div className={styles.financialCycleImg}>
                    <span className={styles.icon} style={{marginLeft: 22}}></span>
                    <span className={styles.row} style={{width: 96}}></span>
                    <span className={styles.icon}></span>
                    <span className={styles.row} style={{width: 88}}></span>
                    <span className={styles.icon}></span>
                    <span className={styles.row} style={{width: 76}}></span>
                    <span className={styles.icon}></span>
                  </div>
                  <div className={styles.financiaDatelCycle}>
                    <div style={{marginLeft: 12}}>{dataOptions.raiseStartTime}</div><div style={{marginLeft: 34}}>{dataOptions.raiseEndTime}</div>
                    <div style={{marginLeft: 24}}>{dataOptions.interestStartDate}</div><div style={{marginLeft: 9}}>{dataOptions.interestEndDate }</div>
                  </div>
                </div> : null}
              {dataOptions.type === 1 && dateType === 3
                ? <div>
                  <div className={styles.title}>理财周期</div>
                  <div style={{ height: 1, background: '#f2f2f2', marginTop: 1, marginBottom: 8 }}></div>
                  <div className={styles.financialCycle}>
                    <div>募集开始</div><div>募集结束</div>
                  </div>
                  <div className={styles.financialCycleImg}>
                    <span className={styles.icon} style={{marginLeft: 22}}></span>
                    <span className={styles.row} style={{width: 286}}></span>
                    <span className={styles.icon}></span>
                  </div>
                  <div className={styles.financiaDatelCycle}>
                    <div style={{marginLeft: 12}}>{dataOptions.raiseStartTime}</div><div style={{marginLeft: 34}}>{dataOptions.raiseEndTime}</div>
                  </div>
                </div> : null}
              {dataOptions.type === 1 && dateType === 2
                ? <div>
                  <div className={styles.title}>理财周期</div>
                  <div style={{ height: 1, background: '#f2f2f2', marginTop: 1, marginBottom: 8 }}></div>
                  <div className={styles.financialCycle}>
                    <div>起息日</div><div>到期</div>
                  </div>
                  <div className={styles.financialCycleImg}>
                    <span className={styles.icon} style={{marginLeft: 14}}></span>
                    <span className={styles.row} style={{width: 299}}></span>
                    <span className={styles.icon}></span>
                  </div>
                  <div className={styles.financiaDatelCycle}>
                    <div style={{marginLeft: 24}}>{dataOptions.interestStartDate}</div><div style={{marginLeft: 9}}>{dataOptions.interestEndDate }</div>
                  </div>
                </div> : null}
              {dataOptions.type === 1 && (dateType === 2 || dateType === 1) ? <p className={styles.introtitle}>起息日是计算收益开始日，现在买入，{dataOptions.interestStartDate}开始计算利息</p> : null}
              {/* 理财周期=======end================== */}

              {/* 产品缩略图========start================= */}
              {
                dataOptions.type === 3 && dataOptions.introductionIconList.length > 0 ? <Carousel autoplay>
                  {
                    dataOptions.introductionIconList.map((item, index) => <img src={item.url} key={index}/>)
                  }
                </Carousel> : null
              }
              {/* 产品缩略图=======end================== */}

              {dataOptions.type === 1 && dateType !== 0 ? <div style={{ height: 6, background: '#f2f2f2', marginTop: 2, marginBottom: 6 }}></div> : null}
              <div className={styles.title}>产品介绍</div>
              <Collapse expandIconPosition={'right'}>
                <Panel header="" key="1">
                  {dataOptions.descType === 0 ? <p dangerouslySetInnerHTML={{ __html: dataOptions.desc }}></p> : dataOptions.descType === 1
                    ? <div><img src={dataOptions.previewDescFileList[0]}/></div>
                    : <div>{dataOptions.desc}</div>}
                </Panel>
              </Collapse>
              {!dataOptions.increaseAmount && !dataOptions.feature && dataOptions.raiseType === 'NONE' && !dataOptions.code && !dataOptions.leatAmount
                ? null
                : <div>
                  <div className={styles.title} style={{marginTop: 6}}>产品信息</div>
                  <div style={{ height: 1, background: '#f2f2f2', marginTop: 1, marginBottom: 8 }}></div>
                  <Collapse expandIconPosition={'right'}>
                    <Panel header="" key="1">
                      <div className={styles.info}>
                        <div className={styles.code}>
                          <div>产品代码</div>
                          <div>{dataOptions.code}</div>
                        </div>
                        {dataOptions.type === 1 ? <div className={styles.item}>
                          <div>起购金额</div>
                          <div>{dataOptions.leatAmount}</div>
                        </div> : null}
                        {dataOptions.type === 1 ? <div className={styles.addByMoney}>
                          <div>递增金额</div>
                          <div>{dataOptions.increaseAmount}</div>
                        </div> : null}
                        {dataOptions.type === 1 ? <div className={styles.collectStyle}>
                          <div>募集方式</div>
                          <div>{dataOptions.raiseType === 'NONE' ? '无' : dataOptions.raiseType === 'PUBLIC' ? '公开募集' : '面向特定人群募集'}</div>
                        </div> : null}
                        <div className={styles.productFeature}>
                          <div>产品特点</div>
                          <div style={{maxWidth: 224}}>{dataOptions.feature}</div>
                        </div>
                      </div>
                    </Panel>
                  </Collapse>
                </div>}
              {dataOptions.danger ? <div>
                <div className={styles.title} style={{marginTop: 6}}>风险揭示</div>
                <Collapse expandIconPosition={'right'}>
                  <Panel header="" key="1">
                    <p>{dataOptions.danger}</p>
                  </Panel>
                </Collapse>
              </div> : null}
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

export default withRouter(productPreView)
