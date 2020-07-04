import React, { Component } from 'react'
import styles from './index.less'
import { Tree } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'

export default class ManagerTree extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      treeData: []
    }
  }

  componentDidMount () {
    this.getPoolOrgByDepartmentId('').then(data => {
      this.setState({ treeData: [data] })
    })
  }

  getPoolOrgByDepartmentId (departmentId) {
    return axios.post(urls.getPoolOrgList, { departmentId: departmentId }).then(res => {
      return res.retdata.deptList
    })
  }
  // 点击三角节点 请求数据异步加载子节点 onLoadData必须是promise
  onLoadData = treeNode => new Promise((resolve) => {
    const { child, id } = treeNode.props.dataRef
    // 如果treeData此节点有child数据(之前renderTreeNodes通过props dataRef传入的) 不再请求数据
    if (child) {
      resolve()
      return
    }
    // 请求此节点下的子节点数据
    this.getPoolOrgByDepartmentId(id).then(data => {
      treeNode.props.dataRef.child = data.child
      this.setState({
        treeData: [...this.state.treeData]
      })
      resolve()
    })
  })

  // 递归渲染树
  renderTreeNodes = data => data.map((item) => {
    // item.type === 1 说明是人员节点 否者是部门节点
    const isManager = item.type === 1
    if (item.child) {
      return (
        <Tree.TreeNode title={isManager ? `${item.name}(${item.total})` : item.name} key={item.id} isLeaf={isManager} dataRef={item}>
          {this.renderTreeNodes(item.child)}
        </Tree.TreeNode>
      )
    }
    // 当前item通过props dataRef传递
    return <Tree.TreeNode title={isManager ? `${item.name}(${item.total})` : item.name} key={item.id} isLeaf={isManager} dataRef={item} />
  })

  onClickTreeNode = (selectedKeys, info) => {
    // 点击后再点击还是选中这个树节点
    const key = selectedKeys[0] || this.props.selectedDeptOrManageKey
    this.props.onClickNode(key.toString(), info.node.props.isLeaf)
  }

  render () {
    const { selectedDeptOrManageKey } = this.props
    const { treeData } = this.state
    return (
      <div className={styles.treeWrap}>
        {treeData && treeData.length
          ? <Tree
            loadData={this.onLoadData}
            defaultExpandedKeys={[treeData[0].id]}
            onSelect={this.onClickTreeNode}
            selectedKeys={[selectedDeptOrManageKey]}
          >
            {this.renderTreeNodes(treeData)}
          </Tree> : null }
      </div>
    )
  }
}
