import React, { Component } from 'react'
import { message, Tag, Modal } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import TagViewWithNum from '@src/components/TagViewWithNum'

export default class SendDetailModal extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      typeList: [],
      type: '',
      tagList: [],
      tag: [],
      currentTags: [],
      newsId: ''
    }
  }

  componentDidMount () {
    axios.get(urls.newsListCategory).then(res => {
      this.setState({
        typeList: res.retdata.list
      })
    })
  }

  componentWillReceiveProps (nextProps) {
    const currentTags = nextProps.tagRecord.tags ? nextProps.tagRecord.tags.split(';') : []
    this.setState({
      type: '',
      tagList: [],
      // 当前文章标签
      currentTags,
      // 当前文章id
      newsId: nextProps.tagRecord.newsId
    })
  }

  // 切换类别
  onChangeType = type => {
    this.setState({
      type,
      // 在typeList中根据type值找到对应的tagList
      tagList: this.state.typeList.filter(obj => obj.category === type)[0]['tags']
    })
  }

  // 点击标签 添加到当前文章标签
  clickTag = (ev, tag) => {
    const nowTags = this.state.currentTags
    if (nowTags.indexOf(tag) !== -1) {
      return message.warning('标签已存在')
    }
    if (nowTags.length >= 3) {
      return message.warning('标签最多只能选择3个')
    }
    this.setState({ currentTags: [...nowTags, tag] })
  }

  // 删除当前文章标签
  closeTag = (ev, tag) => {
    const nowTags = this.state.currentTags
    this.setState({ currentTags: this.removeItemInArr(tag, nowTags) })
  }

  // 移除数组中的某项
  removeItemInArr = (item, arr) => {
    const index = arr.indexOf(item)
    if (index > -1) {
      arr.splice(index, 1)
    }
    return arr
  }

  // 隐藏modal
  hideModal = () => {
    this.props.hideModal()
  }

  // 提交
  handleOk = e => {
    const { currentTags, newsId } = this.state
    const data = {
      newsId,
      newsTags: currentTags.join(',')
    }
    axios.post(urls.newsEditTags, data, {headers: {'Content-Type': 'application/json;charset=UTF-8'}}).then(res => {
      this.props.fetch()
      this.props.hideModal()
    })
  }

  render () {
    const { visible, tagRecord } = this.props
    const { typeList, tagList, type, currentTags } = this.state
    return (
      <div>
        {<Modal
          width={900}
          wrapClassName={'newsListTagModal'}
          title={tagRecord.title}
          visible={visible}
          onCancel={this.hideModal}
          onOk={this.handleOk}
        >
          <div className='line'>当前文章标签</div>
          <div className='tagArea'>
            {currentTags.map(tag => {
              return <Tag color="blue" closable onClose={(ev => this.closeTag(ev, tag))} key={tag}>{tag}</Tag>
            })}
          </div>
          <div className='line'>可选标签</div>
          <div className='line'>
            <span>类别：</span>
            <span>
              {typeList.map((item, index) => {
                return (
                  <TagViewWithNum
                    key={index}
                    item={item}
                    type={type}
                    onChange={this.onChangeType}
                    tag={currentTags}
                  />
                )
              })}
            </span>
          </div>
          <div className='line'>
            <span>标签：</span>
            <span>
              {tagList.map(tag => {
                return <Tag onClick={(ev => this.clickTag(ev, tag))} key={tag}>{tag}</Tag>
              })}
            </span>
          </div>
        </Modal>}
      </div>
    )
  }
}
