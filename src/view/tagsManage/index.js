import React from 'react'
import { Button, Table, Icon, Modal, message, Tooltip, Popconfirm } from 'antd'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import dragableBodyRow from '@src/view/base/dragTable'
import axios from '@src/utils/axios'
import urls from '@src/config'
import EditModal from './editModal.js'
import './index.less'

export default class TagsManage extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      showModal: false,
      editObj: {},
      tableData: [],
      isLoading: false
    }
  }

  componentDidMount () {
    this.categoryList()
  }

  // 列表数据
  categoryList () {
    this.setState({ isLoading: true })
    axios.post(urls.categoryList, { hasTags: true }, { headers: { 'Content-Type': 'application/json' } }).then((res) => {
      if (res.ret === 0) {
        this.setState({ tableData: res.retdata, isLoading: false })
      }
    })
  }

  // 拖拽表格排序
  onMoveTableRow = (dragIndex, hoverIndex) => {
    const { tableData } = this.state
    if (!tableData[dragIndex].isEnable || !tableData[hoverIndex].isEnable) {
      message.destroy()
      message.warn('移动的排序包含禁用标签组，无法排序')
      return
    }
    console.log(dragIndex, hoverIndex)
    const dragRow = tableData[dragIndex]
    let top = false
    if (hoverIndex === 0) {
      top = true
    }
    const data = {
      isTop: top, // 默认false, 当置顶时为true
      prefixCategoryId: top ? null : tableData[hoverIndex - 1].id, // 前置的记录id,当置顶时为null
      currentCategoryId: dragRow.id // 当前调整的记录id
    }
    axios.post(urls.updateCategoryList, data, { headers: { 'Content-Type': 'application/json' } }).then(res => {
      this.categoryList()
    })
  }
  // 编辑
  editTags = (record) => {
    this.setState({ showModal: true, title: '编辑标签类别', editObj: record })
  }
  // 停用/启用
  onSwitch = (record) => {
    axios.post(urls.tagsUpdate, {
      categoryId: record.id,
      isEnable: !record.isEnable
    }, { headers: { 'Content-Type': 'application/json' } }).then(res => {
      this.categoryList()
    })
  }

  delTags = (id) => {
    axios.post(urls.deleteTags, {
      categoryId: id
    }).then(res => {
      this.categoryList()
    })
  }

  // 关闭弹窗
  hideModal = (getList) => {
    this.setState({ showModal: false, editObj: { categoryName: '', isOfficial: false, tagNames: [] } })
    getList && this.categoryList()
  }

  render () {
    const { tableData, isLoading, showModal, title = '', editObj } = this.state
    const columns = [
      {
        title: '标签类别',
        dataIndex: 'categoryName',
        render: (text, record, index) => {
          return (<span>
            {
              record.isFromOfficial && <Tooltip title="此为行业通用标签类别">
                <Icon type="question-circle" />
              </Tooltip>
            }
            &nbsp;{record.categoryName}
            {record.id}
          </span>)
        }
      },
      {
        title: '操作',
        render: (text, record, index) => {
          return (<span>
            <span style={{color: '#1890ff', cursor: 'pointer', marginRight: 10}}
              onClick={() => this.onSwitch(record)}>{record.isEnable ? '停用' : '启用'}</span>
            {!record.isFromOfficial && <span style={{color: '#1890ff', cursor: 'pointer', marginRight: 10}}
              onClick={() => this.editTags(record)}>编辑</span>}
            {
              !record.isFromOfficial && <Popconfirm title="是否确定删除此标签类型？" onConfirm={() => this.delTags(record.id)} okText="确定" cancelText="取消">
                <span style={{color: '#f81d22', cursor: 'pointer'}}>删除</span>
              </Popconfirm>
            }
          </span>)
        }
      }
    ]
    return (
      <div className="TagsManage">
        <div className='title'>产品类别管理</div>
        <div className='bottom'>
          <Button type="primary" className='btn' disabled={tableData.length >= 22} onClick={() => { this.setState({ showModal: true, title: '新增标签类别', editObj: { categoryName: '', isOfficial: false, tagNames: [] } }) }}>新增标签类别</Button>
          <div className='content'>
            <DndProvider backend={HTML5Backend}>
              <Table
                loading={isLoading}
                columns={columns}
                pagination={false}
                rowKey={'id'}
                dataSource={tableData}
                components={{
                  body: {
                    row: dragableBodyRow
                  }
                }}
                onRow={(record, index) => ({
                  index,
                  moveRow: this.onMoveTableRow
                })}
                rowClassName={(record, index) => {
                  return !record.isEnable ? 'stop-line' : ''
                }}
              />
            </DndProvider>
          </div>
        </div>
        {showModal && <EditModal title={title} visible={showModal} obj={editObj} hideModal={this.hideModal} getList={this.categoryList}/>}
      </div>
    )
  }
}
