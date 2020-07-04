import React, { Component } from 'react'
import { Tabs, Button, Modal, message } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import { withRouter } from 'react-router-dom'
import ProductDetailEdit from '@src/view/productAdd/productDetailEdit'
import ProductTalkingSkill from '@src/view/productAdd/productTalkingSkill'
import ProductFAQ from '@src/view/productAdd/productFAQ'
import SpeechIssueModal from './speechIssueModal'
import Tools from '@src/utils'
import './index.less'

// 添加或编辑产品
class ProductEdit extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      speechIssueModal: false,
      saveLoading: false,
      issueIdList: [],
      speechIdList: [],
      selectedRowKeys1: [],
      selectedRowKeys2: []
    }
  }

  // 删除
  productDelete = () => {
    const { location, history } = this.props
    const isRight = Tools.checkButtonRight('/productList', 'productDel')
    if (!isRight) return
    Modal.confirm({
      title: '确定?',
      content: `是否删除该产品`,
      onOk: () => {
        axios.post(urls.productDelete, { productId: location.search.split('=')[1] }).then((res) => {
          if (res.ret === 0) {
            message.success('删除产品成功')
            history.push('/productList')
          }
        })
      },
      onCancel: () => {}
    })
  }

  // 展示隐藏话术常见问题的选择弹窗
  speechModal = () => {
    this.setState({
      speechIssueModal: !this.state.speechIssueModal,
      issueIdList: [],
      speechIdList: []
    })
  }

  // 设置话术常见问题
  setIssueSpeech = (speechIdList, issueIdList) => {
    this.setState({ saveLoading: true })
    try {
      const data = {
        id: this.props.location.search.split('=')[1],
        issueIdList: issueIdList.join(','),
        speechIdList: speechIdList.join(',')
      }
      axios
        .post(urls.updateCommonSpeechIssue, data, {
          headers: { 'Content-Type': 'application/json;charset=UTF-8' }
        })
        .then((res) => {
          if (res.ret === 0) {
            message.success('配置成功')
            this.setState({ saveLoading: false, speechIssueModal: false })
            this.productTalkingSkillRef && this.productTalkingSkillRef.getProductTalkingSkill()
            this.productFAQRef && this.productFAQRef.getProductFAQList()
          }
        })
    } catch (e) {
    } finally {
      this.setState({ saveLoading: false })
    }
  }

  render () {
    const { speechIssueModal, saveLoading, selectedRowKeys1, selectedRowKeys2 } = this.state
    const { isAdd } = this.props
    const { TabPane } = Tabs
    return (
      <div className={'productEdit'}>
        <div className={'title'}>
          <div>{isAdd ? '添加产品' : '编辑产品'}</div>
          <div>
            {isAdd ? null : (
              <Button type="primary" onClick={this.speechModal}>
                话术与问题配置
              </Button>
            )}
            {isAdd ? null : (
              <Button type="danger" onClick={this.productDelete}>
                删除
              </Button>
            )}
          </div>
        </div>
        {isAdd ? (
          <ProductDetailEdit isAdd={isAdd} />
        ) : (
          <Tabs defaultActiveKey="1" className={'tabs'}>
            <TabPane tab="产品详情" key="1">
              <ProductDetailEdit isAdd={isAdd} />
            </TabPane>
            <TabPane tab="营销话术" key="2">
              <ProductTalkingSkill
                isAdd={isAdd}
                onRef={(el) => {
                  this.productTalkingSkillRef = el
                }}
              />
            </TabPane>
            <TabPane tab="常见问题" key="3">
              <ProductFAQ
                isAdd={isAdd}
                onRef={(el) => {
                  this.productFAQRef = el
                }}
              />
            </TabPane>
          </Tabs>
        )}
        {speechIssueModal && (
          <SpeechIssueModal
            classNames={'productEdit'}
            visible={speechIssueModal}
            hideModal={this.speechModal}
            setIssueSpeech={this.setIssueSpeech}
            saveLoading={saveLoading}
          />
        )}
      </div>
    )
  }
}

export default withRouter(ProductEdit)
