import React from 'react'
import { DatePicker, Spin, Popover, Button, Icon } from 'antd'
import './index.less'
import moment from 'moment'
import axios from '@src/utils/axios'
import urls from '@src/config'
import PopoverHint from './popover'
const imgArr = [
  require('@src/assets/keyIndicatorsView1.png'),
  require('@src/assets/keyIndicatorsView2.png'),
  require('@src/assets/keyIndicatorsView3.png'),
  require('@src/assets/keyIndicatorsView4.png')
]
export default class KeyIndicatorsView extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      initLoading: false,
      selectedDate: moment().subtract(1, 'days'),
      dataObj: {}
    }
    this.changeDept = props.changeDept
  }

  componentDidMount () {
    this.setState({ initLoading: true })
    this.pullData()
  }

  componentWillReceiveProps (next, pre) {
    if (next.changeDept && next.changeDept !== pre.changeDept) {
      this.changeDept = next.changeDept
      this.setState({ initLoading: true })
      this.pullData()
    }
  }

  reset = () => {
    this.setState({dataObj: {}})
  }

  pullData = () => {
    const deptid = this.changeDept
    const date = this.state.selectedDate.format('YYYY-MM-DD')
    if (!deptid || !date) {
      this.setState({ initLoading: false })
      return
    }
    axios.get(urls.keydata(deptid, date)).then(res => {
      this.setState({
        initLoading: false,
        dataObj: res.retdata
      })
    }).catch(() => {
      this.setState({ initLoading: false })
    })
  }

  disabledDate = (current) => {
    return current && current > moment().subtract(1, 'days')
  }

  onChange = (date) => {
    this.setState({
      selectedDate: date,
      initLoading: true
    }, this.pullData)
  }

  parseNum = num => {
    if (!num) return false
    let newNum = parseFloat(num)
    if (newNum > 0) {
      newNum = '+' + newNum
    } else {
      newNum = newNum + ''
    }
    return newNum
  }

  formatNum = (num, header = false) => {
    if (!num) return false
    if (parseInt(num) === 0) return num
    let result = []
    let counter = 0
    let headerNum = '+'
    let floatNum = ''
    if (num.indexOf('-') !== -1) {
      num = num.split('-')[1]
      headerNum = '-'
    }
    if (num.indexOf('.') !== -1) {
      floatNum = '.' + num.split('.')[1]
      num = num.split('.')[0]
    }
    num = (num || 0).toString().split('')
    for (let i = num.length - 1; i >= 0; i--) {
      counter++
      result.unshift(num[i])
      if (!(counter % 3) && i !== 0) { result.unshift(',') }
    }
    if (header) {
      return headerNum + result.join('') + floatNum
    } else {
      return result.join('') + floatNum
    }
  }

  render () {
    const {
      initLoading,
      selectedDate,
      dataObj } = this.state
    const {
      cilentNum,
      clientNumComp,
      activeClientRatio,
      activeClientRatioComp,
      sendProductStaff,
      sendProductStaffComp,
      productHitBuyRatio,
      productHitBuyRatioComp
    } = dataObj
    let content = <div style={{width: 200}}>如需查看点击购买（点击“前往办理”按钮）的详细客户信息，可进入本平台“数据管理”模块下的“意向客户”子模块进行查看。</div>
    return (
      <Spin spinning={initLoading} tip='数据获取中...'>
        <div className={'keyIndicatorsView'}>
          <div className={'headerView'}>
            <div className={'left'}>
              <span className={'title'}>关键指标</span>
              <PopoverHint hintType={'keyIndicators'} />
            </div>
            <span className={'right'}>
              <DatePicker
                value={selectedDate}
                disabledDate={(date) => this.disabledDate(date)}
                onChange={(date) => this.onChange(date)}
                placeholder="请选择日期"
                allowClear={false}
              />
            </span>
          </div>
          <div style={{overflowX: 'scroll'}}>

            <div className={'contentView'}>

              <div className={'contentItem'}>
                <img src={imgArr[0]} alt="" className={'itemImg'} />
                <div className={'contentItemView'}>
                  <div className={'wrapperView'}>
                    <div className={'title'}>{'客户总人数'}</div>
                    <div className={'count'}>{this.formatNum(cilentNum) || '--'}</div>
                    <div className={'diff'}>较昨日 {this.formatNum(clientNumComp, true) || '--'}</div>
                  </div>
                </div>
              </div>

              <div className={'contentItem'}>
                <img src={imgArr[1]} alt="" className={'itemImg'} />
                <div className={'contentItemView'}>
                  <div className={'wrapperView'}>
                    <div className={'title'}>{'活跃客户占比'}</div>
                    <div className={'count'}>{this.formatNum(activeClientRatio) || '--'}</div>
                    <div className={'diff'}>较昨日 {this.formatNum(activeClientRatioComp, true) || '--'}</div>
                  </div>
                </div>
              </div>

              <div className={'contentItem'}>
                <img src={imgArr[2]} alt="" className={'itemImg'} />
                <div className={'contentItemView'}>
                  <div className={'wrapperView'}>
                    <div className={'title'}>{'发送产品员工人数'}</div>
                    <div className={'count'}>{this.formatNum(sendProductStaff) || '--'}</div>
                    <div className={'diff'}>较昨日 {this.formatNum(sendProductStaffComp, true) || '--'}</div>
                  </div>
                </div>
              </div>

              <div className={'contentItem'}>
                <img src={imgArr[3]} alt="" className={'itemImg'} />
                <div className={'contentItemView'}>
                  <div className={'wrapperView'}>
                    <div className={'title'}>{'产品点击购买率'}&nbsp;
                      <Popover placement='top' content={content}>
                        <Icon type={'info-circle'} style={{color: '#dec9a7'}} />
                      </Popover>
                    </div>
                    <div className={'count'}>{this.formatNum(productHitBuyRatio) || '--'}</div>
                    <div className={'diff'}>较昨日 {this.formatNum(productHitBuyRatioComp, true) || '--'}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </Spin>
    )
  }
}
