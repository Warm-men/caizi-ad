import React, { Component } from 'react'
import styles from './index.less'
import { Tag, Spin, Button } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import utils from '@src/utils'

class EnterpriseDetail extends Component {
  constructor (props) {
    super(props)
    this.state = {
      info: null,
      initLoading: true
    }
  }
  // 进页面获取表格数据
  componentDidMount () {
    this.getEnterpriseInfo()
  }

  getEnterpriseInfo = () => {
    const corpId = utils.getUrlQueryString(this.props.location.search, 'corpId')
    const params = { corpId }
    axios.post(urls.enterpriseInfo, {...params}, {headers: {'Content-Type': 'application/json'}}).then(res => {
      this.setState({ info: res.retdata, initLoading: false })
    }).catch(() => {
      this.setState({ initLoading: false })
    })
  }

  goBack = () => {
    this.props.history.goBack()
  }

  render () {
    const { info, initLoading } = this.state
    if (!info) {
      return <Spin spinning={initLoading} tip='数据获取中...'><div>暂无数据</div></Spin>
    }
    const {
      corpLocation,
      corpName,
      corpTag,
      corpType,
      empNum,
      manager,
      branchName,
      managerQRCodeUrl,
      payNum
    } = info
    return (
      <div className={styles.enterpriseDetail}>
        <div className={styles.title_view}>企业员工列表/详情</div>
        <div className={styles.info_view}>
          <div className={styles.title}>企业信息</div>
          <div className={styles.content_view}>

            <span className={styles.info_item}>
              <span className={styles.name}>企业名称</span>
              <Tag color={'blue'}>{corpName || '暂无'}</Tag>
            </span>

            <span className={styles.info_item}>
              <span className={styles.name}>企业类型</span>
              <Tag color={'blue'}>{corpType || '暂无'}</Tag>
            </span>

            <span className={styles.info_item}>
              <span className={styles.name}>企业地址</span>
              <Tag color={'blue'}>{corpLocation || '暂无'}</Tag>
            </span>

            <span className={styles.info_item}>
              <span className={styles.name}>可触达员工数</span>
              <Tag color={'blue'}>{empNum || '暂无'}</Tag>
            </span>

          </div>
        </div>

        <div className={styles.info_view}>
          <div className={styles.title}>银行信息</div>
          <div className={styles.content_view}>

            <span className={styles.info_item}>
              <span className={styles.name}>归属分支行</span>
              <Tag color={'blue'}>{branchName || '暂无'}</Tag>
            </span>

            <span className={styles.info_item}>
              <span className={styles.name}>总发薪员工</span>
              <Tag color={'blue'}>{payNum || '暂无'}</Tag>
            </span>

            <span className={styles.info_item}>
              <span className={styles.name}>归属客户经理</span>
              <Tag color={'blue'}>{manager || '暂无'}</Tag>
            </span>

            <div>
              <span className={styles.info_item}>
                <span className={styles.name}>客户经理企业微信二维码</span>
                {managerQRCodeUrl ? <img src={managerQRCodeUrl} alt={'二维码'} className={styles.img_view} /> : <Tag color={'blue'}>{'暂无'}</Tag>}
              </span>
            </div>

          </div>
        </div>

        <div className={styles.info_view}>
          <div className={styles.title}>标签信息</div>
          <div className={styles.label_item}>
            <span className={styles.label_title}>标签</span>
            {corpTag && !!corpTag.length ? corpTag.map(v => <Tag color={'blue'} key={v}>{v}</Tag>) : <Tag color={'blue'}>{'暂无'}</Tag>}
          </div>
        </div>

        <div style={{textAlign: 'center'}}>
          <Button type={'primary'} onClick={this.goBack}>返回</Button>
        </div>
      </div>
    )
  }
}

export default EnterpriseDetail
