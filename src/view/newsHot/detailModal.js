import React, { Component } from 'react'
import { Button, Upload, Icon, message, TreeSelect, Spin, Modal, Table } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import '@src/style/weixin.css'
import styles from './index.less'

export default class DetailModal extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      isLoading: false,
      title: '',
      originalCreator: '',
      createTime: '',
      content: []
    }
  }

  componentWillReceiveProps (next) {
    if (next.detailId !== this.props.detailId) {
      this.setState({
        isLoading: true,
        title: '',
        originalCreator: '',
        createTime: '',
        content: []
      })
      axios.post(urls.newsDetail, { newsId: next.detailId }).then(res => {
        this.setState({
          title: res.retdata.title,
          originalCreator: res.retdata.originalCreator,
          createTime: res.retdata.createTime,
          content: res.retdata.content,
          crawl: res.retdata.crawl,
          txt: res.retdata.txt
        })
        this.setState({ isLoading: false })
      })
    }
  }

  hideModal = () => {
    this.props.hideModal()
  }

  render () {
    const { visible } = this.props
    const { isLoading, content, crawl, txt } = this.state
    const getContent = () => {
      if (crawl) {
        // 爬虫抓取的微信文章
        return content.map((obj, index) => {
          return <p key={index} dangerouslySetInnerHTML={{__html: obj.content}}></p>
        })
      } else {
        // 富文本编辑器输入的是后样式都是行内样式 后端直接输出html字符串给我
        return <p dangerouslySetInnerHTML = {{ __html: txt }} ></p>
      }
    }
    const tableTitle = <span>
      <span>文章详情</span>
      <span className={styles.tableTitle}>(实际文章样式以小程序为准)</span>
    </span>
    return (
      <div>
        <Modal
          width={1000}
          wrapClassName={'newsListDetailModal'}
          title={tableTitle}
          visible={visible}
          onCancel={this.hideModal}
          footer={null}
        >
          <Spin spinning={isLoading}>
            <div>
              {/* <div className={styles.detailTitle}>{title}</div>
              <div className={styles.detailCreate}>
                由 {originalCreator} 创建于 {createTime}
              </div> */}
              <div className='detailContent'>
                {getContent()}
              </div>
            </div>
          </Spin>
        </Modal>
      </div>
    )
  }
}
