import { DragSource, DropTarget } from 'react-dnd'
import React, { PureComponent } from 'react'

// 拖拽表格 用法参考productType/index.js
let dragingIndex = -1
class BodyRow extends PureComponent {
  render () {
    const { isOver, connectDragSource, connectDropTarget, moveRow, ...restProps } = this.props
    const style = { ...restProps.style, cursor: 'move' }
    let { className } = restProps
    if (isOver) {
      if (restProps.index > dragingIndex) {
        className += ' drop-over-downward'
      }
      if (restProps.index < dragingIndex) {
        className += ' drop-over-upward'
      }
    }
    return connectDragSource(
      connectDropTarget(<tr {...restProps} className={className} style={style} />)
    )
  }
}
const rowSource = {
  beginDrag (props) {
    dragingIndex = props.index
    return {
      index: props.index
    }
  }
}
const rowTarget = {
  drop (props, monitor) {
    const dragIndex = monitor.getItem().index
    const hoverIndex = props.index
    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return
    }
    // Time to actually perform the action
    props.moveRow(dragIndex, hoverIndex)
    // Note: we're mutating the monitor item here!
    // Generally it's better to avoid mutations,
    // but it's good here for the sake of performance
    // to avoid expensive index searches.
    monitor.getItem().index = hoverIndex
  }
}
const dragableBodyRow = DropTarget('row', rowTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver()
}))(
  DragSource('row', rowSource, connect => ({
    connectDragSource: connect.dragSource()
  }))(BodyRow)
)

export default dragableBodyRow
