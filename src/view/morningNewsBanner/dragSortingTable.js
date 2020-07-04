import React from 'react'
import 'antd/dist/antd.css'
import './index.less'
import { Table, message } from 'antd'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import update from 'immutability-helper'

const type = 'DragbleBodyRow'

const DragableBodyRow = ({ index, moveRow, className, style, ...restProps }) => {
  const ref = React.useRef()
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: monitor => {
      const { index: dragIndex } = monitor.getItem() || {}
      if (dragIndex === index) {
        return {}
      }
      return {
        isOver: monitor.isOver(),
        dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward'
      }
    },
    drop: item => {
      moveRow(item.index, index)
    }
  })
  const [, drag] = useDrag({
    item: { type, index },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  })
  drop(drag(ref))
  return (
    <tr
      ref={ref}
      className={`${className}${isOver ? dropClassName : ''}`}
      style={{ cursor: 'move', ...style }}
      {...restProps}
    />
  )
}

const columns = [
  {
    title: 'banner名称',
    dataIndex: 'bannerName'
  },
  {
    title: '跳转',
    dataIndex: 'relationTitle'
  },
  {
    title: 'banner图片',
    render: (text, record) => (
      <img src={record.bannerImgURL} width={'350'} alt=""/>
    )
  },
  {
    title: '操作',
    width: 150,
    render: (text, record, index) => <span className={'actionArea'}>长按上下拖拽排序</span>
  }
]

export default class DragSortingTable extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      data: props.dataSource,
      selectedRowKeys: props.selectedRowKeys
    }
  }

  componentWillReceiveProps (next) {
    if (next.isShowBanner) {
      this.setState({ data: next.dataSource })
    } else {
      this.setState({ data: [] })
    }
  }

  components = {
    body: {
      row: DragableBodyRow
    }
  }

  moveRow = (dragIndex, hoverIndex) => {
    const { data } = this.state
    const dragRow = data[dragIndex]
    this.setState(
      update(this.state, {
        data: {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragRow]
          ]
        }
      }),
      this.reportTableSort
    )
  }

  // 上报列表排序状态
  reportTableSort = () => {
    const { data, selectedRowKeys } = this.state
    let currentRowKeys = data.filter(i => selectedRowKeys.includes(i.bannerId))
    currentRowKeys = currentRowKeys.map(i => i.bannerId)
    this.props.updateSelectedRowKeys(currentRowKeys)
  }

  tableSelectChange = (selectedRowKeys, selectedRows) => {
    const keyLength = selectedRowKeys.length
    if (keyLength > 5) {
      return message.error('banner最多展示5条数据。')
    }
    this.setState({ selectedRowKeys }, this.reportTableSort)
  }

  render () {
    const { selectedRowKeys, data } = this.state
    return (
      <DndProvider backend={HTML5Backend}>
        <Table
          rowSelection={{
            selectedRowKeys,
            onChange: this.tableSelectChange,
            columnTitle: 'banner是否展示',
            columnWidth: 150
          }}
          columns={columns}
          dataSource={data}
          rowKey={'bannerId'}
          components={this.components}
          onRow={(record, index) => ({
            index,
            moveRow: this.moveRow
          })}
        />
      </DndProvider>
    )
  }
}
