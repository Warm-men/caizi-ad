import React, { Component } from 'react'
import { Checkbox } from 'antd'
import styles from '../index.less'

class RightTable extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
    }
  }

  getH = (obj) => {
    // 计算第一列高度，根据第三列
    let total = 0
    for (let k of obj.resources) {
      total += k.resources.length
    }
    return total
  }

  render () {
    const { rightTableData, onChangeRightCheck, right, disabled } = this.props
    const renderTreeRightNodes = (data, superParent, parent) => {
      const rights = data || []
      return <div className={styles.treeSpanRight} style={{height: '40px', lineHeight: '40px'}}>
        {rights.map(obj => {
          return <Checkbox checked={obj.owner} key={obj.resId}
            disabled={disabled} onChange={(ev) => onChangeRightCheck(ev, obj, superParent, parent)}>
            {obj.resName}
          </Checkbox>
        })}
      </div>
    }
    const renderTreeNodes = (data, superParent) => {
      const treeData = data || []
      return treeData.map(obj => {
        // 第二列行高永远是40 第一列有几个第二列子节点就是几倍的40行高
        let tdHeight = obj.level < 3 ? (obj.resources ? obj.resources.length : 1) * 40 + 'px' : 40 + 'px'
        if (obj.level === 1) {
          tdHeight = this.getH(obj) * 40 + 'px'
        }
        if (obj.level === 2) {
          superParent = obj
        }
        return <ul key={obj.resId} className={styles.treeUl}>
          <div className={obj.level === 3 ? styles.treeSpanOperation : styles.treeSpan} style={{height: tdHeight, lineHeight: tdHeight}}>
            {obj.resName}
          </div>
          {/* 第四列(也就是第四层) 渲染成renderTreeRightNodes */}
          {obj.level < 3 ? <li>{renderTreeNodes(obj.resources, superParent)}</li> : renderTreeRightNodes(obj.resources, superParent, obj)}
        </ul>
      })
    }
    if (!rightTableData.length) return <div>暂无数据</div>
    return (
      <div className={styles.treeTable}>
        {/* <ul className={styles.treeTableHeader}>
          <li className={styles.treeSpan}>模块名称</li>
          <li className={styles.treeSpan}>功能名称</li>
          <li className={styles.treeSpanOperation}>操作类别</li>
          <li className={styles.treeSpanRight}>权限</li>
        </ul> */}
        {renderTreeNodes(rightTableData)}
      </div>
    )
  }
}

export default RightTable
