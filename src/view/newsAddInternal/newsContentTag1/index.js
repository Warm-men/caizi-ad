import React, { Component } from 'react'
import { Button, Form, Input, Switch, Icon, Tooltip, Radio, Tag, message, Select, Row, Col } from 'antd'
import styles from './index.less'
import axios from '@src/utils/axios'
import urls from '@src/config'

export default class newsContentTag extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      tagList: [],
      tagInputVisible: false,
      tagInputValue: ''
    }
  }

  componentDidMount () {
    this.getTagList()
  }
  // 获取标签
  getTagList () {
    axios.post(urls.newsTagList).then(res => {
      this.setState({ tagList: res.retdata.tagList })
    })
  }
  // 标签
  onChangeCheckedTags = (checked, tagName) => {
    this.props.onChange(checked, tagName)
  }
  showTagInput= () => {
    this.setState({ tagInputVisible: true }, () => this.tagInput.focus())
  }
  hideTagInput= () => {
    this.setState({ tagInputVisible: false, tagInputValue: '' })
  }
  tagInputChange = (e) => {
    this.setState({ tagInputValue: e.target.value })
  }
  tagInputConfirm = () => {
    const tagInputValue = this.state.tagInputValue.trim()
    if (!tagInputValue) {
      return message.warning('请输入标签名称')
    }
    if (tagInputValue.length > 8) {
      return message.warning('标签最多8个字符')
    }
    axios.post(urls.newsTagCreate, { tagName: tagInputValue }).then(res => {
      this.setState({
        tagList: [...this.state.tagList, res.retdata.tag],
        tagInputVisible: false,
        tagInputValue: ''
      })
    })
  }

  render () {
    const { tagList, tagInputVisible, tagInputValue } = this.state
    const { checkedTags } = this.props
    return (
      <div className="newsContentTag" >
        {tagList.map(obj => {
          return <Tag.CheckableTag key={obj.tagName} checked={checkedTags.indexOf(obj.tagName) !== -1}
            onChange={(checked) => this.onChangeCheckedTags(checked, obj.tagName)}>{obj.tagName}</Tag.CheckableTag>
        })}
        {/* {tagInputVisible && (
          <Input
            ref={node => (this.tagInput = node)}
            type="text"
            placeholder={'按Enter保存标签'}
            style={{ width: 150 }}
            value={tagInputValue}
            onChange={this.tagInputChange}
            onBlur={this.hideTagInput}
            onPressEnter={this.tagInputConfirm}
          />
        )}
        {!tagInputVisible && (
          <Tag
            onClick={this.showTagInput}
            style={{ background: '#fff', borderStyle: 'dashed' }}
          >
            <Icon type="plus" /> 增加标签
          </Tag>
        )} */}
      </div>
    )
  }
}
