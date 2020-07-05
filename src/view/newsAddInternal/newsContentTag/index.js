import React, { Component } from 'react'
import { Radio, Tag, message, Button } from 'antd'
import { withRouter } from 'react-router-dom'
import './index.less'
import axios from '@src/utils/axios'
import urls from '@src/config'
import TagViewWithNum from '@src/components/TagViewWithNum'
import utils from '@src/utils'
@withRouter
export default class newsContentTag extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      mode: true,
      typeList: [],
      type: '',
      tagList: [],
      tag: []
    }
    this.categoryArr = []
  }

  componentDidMount () {
    axios.get(urls.newsListCategory).then(res => {
      this.setState({
        typeList: res.retdata.list,
        type: res.retdata.list[0]['category'],
        tagList: res.retdata.list[0]['tags']
      })
    })
  }

  // 新增我行发布等页面提交完成后 重置内容标签方式
  componentWillReceiveProps (nextProps) {
    if (nextProps.mode !== this.state.mode) {
      this.setState({ mode: nextProps.mode })
      this.categoryArr = []
    }
  }

  // 切换标签方式
  onChangeMode = e => {
    const { typeList } = this.state
    const value = e.target.value
    this.setState({
      mode: e.target.value,
      type: value ? '' : typeList[0]['category'],
      tagList: value ? [] : typeList[0]['tags'],
      tag: []
    }, () => {
      const { mode, tag } = this.state
      const categoryArr = ''
      this.props.onChange && this.props.onChange(mode, categoryArr, tag)
    })
  }

  // 切换类别
  onChangeType = type => {
    this.setState({
      type,
      tagList: this.state.typeList.filter(obj => obj.category === type)[0]['tags']
    })
  }

  // 删除当前文章标签
  closeTag = (tag) => {
    const nowTags = [...this.state.tag]
    this.setState({ tag: this.removeItemInArr(tag, nowTags) }, () => {
      const { mode, tag } = this.state
      const { onChange } = this.props
      this.checkCategoty()
      const categoryArr = this.categoryArr.join(',')
      onChange && onChange(mode, categoryArr, tag)
    })
  }

  checkCategoty = () => {
    const { typeList, tag } = this.state
    const currentCategoty = []
    for (let item of typeList) {
      const { category, tags } = item
      for (let tagItem of tags) {
        if (tag.includes(tagItem)) {
          !currentCategoty.includes(category) && currentCategoty.push(category)
        }
      }
    }
    this.categoryArr = currentCategoty
  }

  // 移除数组中的某项
  removeItemInArr = (item, arr) => {
    const index = arr.indexOf(item)
    if (index > -1) {
      arr.splice(index, 1)
    }
    return arr
  }

  // 选择标签
  onChangeTag = (tag) => {
    const currentTags = this.state.tag
    if (currentTags.indexOf(tag) !== -1) {
      message.destroy()
      return message.warning('标签已存在', 3)
    }
    if (currentTags.length >= 3) {
      message.destroy()
      return message.warning('标签最多只能选择3个', 3)
    }
    const { type } = this.state
    this.categoryArr.indexOf(type) === -1 && this.categoryArr.push(type)
    this.setState({
      tag: [...currentTags, tag]
    }, () => {
      const { mode, tag } = this.state
      const { onChange } = this.props
      const categoryArr = this.categoryArr.join(',')
      onChange && onChange(mode, categoryArr, tag)
    })
  }

  // 跳转标签管理
  linkToTagManage = () => {
    const canTagManage = utils.checkButtonRight(this.props.location.pathname, 'articleTagManage')
    if (!canTagManage) {
      message.destroy()
      message.warning('当前机构没有标签管理权限。', 2)
      return false
    }
    this.props.history.push('/tagsManage')
  }

  render () {
    const { typeList, tagList, mode, type, tag } = this.state
    return (
      <div className="newsContentTag" >
        <ul className="newsContentTagUl">
          <li className="newsContentTagLi">
            {/* <span className={'label'}>方式：</span> */}
            <span>
              <Radio.Group onChange={this.onChangeMode} value={mode}>
                <Radio value={true}>自动</Radio>
                <Radio value={false}>手动</Radio>
              </Radio.Group>
            </span>
            <Button type="primary" onClick={this.linkToTagManage}>标签管理</Button>
          </li>
          {!mode && <li className="newsContentTagLi">
            <span className={'label'}>已选类别：</span>
            <span>
              {tag.map(tag => {
                return <Tag color="blue" closable onClose={(ev => this.closeTag(tag))} key={tag}>{tag}</Tag>
              })}
            </span>
          </li>}
          {!mode && <li className="newsContentTagLi">
            <span className={'label'} style={{verticalAlign: 'top'}}>可选类别：</span>
            <span style={{width: 380, display: 'inline-block'}}>
              {typeList.map((item, index) => {
                return (
                  <TagViewWithNum
                    key={index}
                    item={item}
                    type={type}
                    onChange={this.onChangeType}
                    tag={tag}
                  />
                )
              })}
            </span>
          </li>}
          {!mode && <li className="newsContentTagLi">
            <span className={'label'}>可选标签：</span>
            <span>
              {tagList.map(tag => {
                return <Tag onClick={(() => this.onChangeTag(tag))} key={tag}>{tag}</Tag>
              })}
            </span>
          </li>}
        </ul>
      </div>
    )
  }
}
