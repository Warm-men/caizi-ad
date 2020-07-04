import React, { Component, Fragment } from 'react'
import { Modal, Spin, Checkbox, message, Icon, Input } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import './index.less'

export default class Tags extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tagList: [],
      selectedTags: props.selected || []
    }
  }

  componentDidMount() {
    this.getTagList()
  }

  onOk = () => {
    const { onOk } = this.props
    const { selectedTags } = this.state
    onOk(selectedTags)
  }

  // 获取标签列表
  getTagList = () => {
    this.setState({ isLoading: true })
    axios
      .get(urls.tagList, {})
      .then((res) => {
        if (res.ret === 0) {
          this.setState({ tagList: res.retdata })
        }
      })
      .finally(() => {
        this.setState({ isLoading: false })
      })
  }

  // 选中与反选
  selectTag = (e, item) => {
    const { checked } = e.target
    const { selectedTags } = this.state
    const { limit } = this.props
    if (checked && limit && selectedTags.length >= limit) {
      message.warn(`最多选择${limit}个标签`)
      return
    }
    if (checked) {
      selectedTags.push(item)
    } else {
      const index = selectedTags.findIndex((vv) => vv.tagWxid === item.tagWxid)
      selectedTags.splice(index, 1)
    }
    this.setState({ selectedTags })
  }

  // 弹出弹窗
  showModal = (tagModalType, item = {}, subItem = {}) => {
    console.log(subItem)
    const state = { visible: true, tagModalType }
    if (tagModalType === 'editGroupName') {
      state.edittingTag = { groupName: item.groupName, groupWxid: item.groupWxid }
    }
    if (tagModalType === 'editTagName') {
      state.edittingTag = {
        groupName: item.groupName,
        groupWxid: item.groupWxid,
        disabled: true,
        tags: [{ tagName: subItem.tagName, tagWxid: subItem.tagWxid }]
      }
    }
    if (tagModalType === 'addGroup') {
      state.edittingTag = { groupName: '', groupWxid: '', canAdd: true, tags: [{ tagName: '', tagWxid: '' }] }
    }
    if (tagModalType === 'addTag') {
      state.edittingTag = { groupName: item.groupName, groupWxid: item.groupWxid, disabled: true, canAdd: true, tags: [{ tagName: '', tagWxid: '' }] }
    }
    this.setState(state)
  }

  // 修改标签组名
  groupNameChange = (groupName, groupWxid = '') => {
    const { edittingTag } = this.state
    edittingTag.groupName = groupName
    edittingTag.groupWxid = groupWxid
    this.setState({ edittingTag })
  }

  // 修改标签名
  tagNameChange = (tagName, index, tagWxid = '') => {
    const { edittingTag } = this.state
    const { tags } = edittingTag
    tags[index].tagName = tagName
    tags[index].tagWxid = tagWxid
    this.setState({ edittingTag })
  }

  // 修改标签名
  addNewTag = () => {
    const { edittingTag } = this.state
    const { tags } = edittingTag
    tags.push({ tagName: '', tagWxid: '' })
    this.setState({ edittingTag })
  }

  // 提交标签修改
  submitTag = () => {
    const { edittingTag, tagModalType, tagList } = this.state
    let api = ''
    let params = {}
    if (tagModalType === 'editGroupName') {
      params = { tagName: edittingTag.groupName, tagWxid: edittingTag.groupWxid }
      api = 'tagUpdate'
    }
    if (tagModalType === 'editTagName') {
      params = { tagName: edittingTag.tags[0].tagName, tagWxid: edittingTag.tags[0].tagWxid }
      api = 'tagUpdate'
    }
    if (tagModalType === 'addTag' || tagModalType === 'addGroup') {
      params = { groupName: edittingTag.groupName, tagNames: edittingTag.tags.map((item) => item.tagName) }
      api = 'tagCreate'
    }
    this.setState({ isLoading2: true })
    axios
      .post(urls[api], params, { headers: { 'Content-Type': 'application/json' } })
      .then((res) => {
        if (res.ret === 0) {
          message.success(`标签${api === 'tagUpdate' ? '修改' : '添加'}成功`)
          tagList.forEach((item) => {
            item.canEdit = false
          })
          this.setState({ visible: false, tagList }, this.getTagList)
        }
      })
      .finally(() => {
        this.setState({ isLoading2: false })
      })
  }

  // 修改标签是否可编辑状态
  changeEditState = (index) => {
    const { tagList } = this.state
    tagList[index].canEdit = !tagList[index].canEdit
    this.setState({ tagList })
  }

  render() {
    const { isLoading = false, isLoading2 = false, tagList, selectedTags, visible, edittingTag = {} } = this.state
    const { groupName = '', disabled = false, canAdd = false, tags = [], groupWxid = '' } = edittingTag
    return (
      <Fragment>
        <Modal maskClosable={false} width={880} className="tags-modal" visible={true} title="选择标签" onOk={this.onOk} onCancel={this.props.onCancel}>
          <Spin spinning={isLoading}>
            {tagList.map((item, index) => (
              <div className="items" key={index}>
                <div className="title">
                  <div className="text">
                    {item.groupName}
                    {item.canEdit && (
                      <div className="btn" onClick={() => this.showModal('editGroupName', item)}>
                        修改标签组名字
                      </div>
                    )}
                  </div>
                  <div className="btns">
                    <div className="btn" onClick={() => this.showModal('addTag', item)}>
                      添加
                    </div>
                    <div className="btn" onClick={() => this.changeEditState(index)}>
                      {item.canEdit ? '取消' : '编辑'}
                    </div>
                  </div>
                </div>
                {item.tagList &&
                  item.tagList.map((subItem, subIndex) => (
                    <div key={subIndex} className="item">
                      <Checkbox
                        disabled={item.canEdit}
                        onChange={(e) => this.selectTag(e, subItem)}
                        checked={!!selectedTags.find((vv) => vv.tagWxid === subItem.tagWxid)}
                      >
                        {subItem.tagName}
                      </Checkbox>
                      {item.canEdit && (
                        <div className="btn" onClick={() => this.showModal('editTagName', item, subItem)}>
                          修改
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ))}
            <div className="add-tags" onClick={() => this.showModal('addGroup')}>
              <Icon type="plus" />
              添加标签组
            </div>
          </Spin>
        </Modal>

        <Modal
          maskClosable={false}
          className="tags-edit-modal"
          visible={visible}
          title="编辑标签"
          onOk={this.submitTag}
          onCancel={() => this.setState({ visible: false })}
        >
          <Spin spinning={isLoading2}>
            <div className="item">
              <div className="label">标签组：</div>
              <div className="value">
                <Input
                  placeholder="请输入15字内标签组名"
                  disabled={disabled}
                  value={groupName}
                  maxLength={15}
                  onChange={(e) => this.groupNameChange(e.target.value, groupWxid)}
                />
              </div>
            </div>
            {tags.length > 0 && (
              <div className="item">
                <div className="label">
                  标签：
                  {canAdd && (
                    <div className="btn" onClick={this.addNewTag}>
                      添加
                    </div>
                  )}
                </div>
                <div className="value">
                  {tags.map((item, index) => (
                    <Input
                      key={index}
                      placeholder="请输入15字内标签名"
                      value={item.tagName}
                      maxLength={15}
                      onChange={(e) => this.tagNameChange(e.target.value, index, item.tagWxid)}
                    />
                  ))}
                </div>
              </div>
            )}
          </Spin>
        </Modal>
      </Fragment>
    )
  }
}
