import React, { Component } from 'react'
import { TreeSelect } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'

export default class DepartmentTable extends Component {
  constructor (props) {
    super(props)
    this.state = {
      deptTree: [],
      changeDept: []
    }
  }

  componentDidMount () {
    this.getDepartmentOwnerList()
  }

  // componentWillReceiveProps (nextProps) {
  //   const now = this.props.parentId
  //   const next = nextProps.parentId
  //   if (next && (now !== next)) {
  //     this.getDepartmentOwnerList(nextProps.parentId)
  //   }
  // }

  getDepartmentOwnerList = () => {
    axios.post(urls.departmentOwnerList, {useRole: true}).then(res => {
      const { deptList } = res.retdata
      this.setState({
        deptTree: deptList
      })
    })
  }

  resetState = () => {
    this.setState({changeDept: []})
  }

  filterDept = (dept) => {
    for (let i of dept) {
      if (i.subDept && i.subDept.length) {
        this.filterDept(i.subDept)
      }
      const isLeaf = i.indexOf('___isLeaf') > -1
      if (isLeaf) {
        const item = i.split('___isLeaf')[0]
        this.staffIds.push(item)
      } else {
        this.deptIds.push(i)
      }
    }
  }

  onChangeDept = (value) => {
    this.setState({ changeDept: value }, this.reportData)
  }

  reportData = () => {
    const {changeDept} = this.state
    this.deptIds = []
    this.staffIds = []
    this.filterDept(changeDept)
    this.props.updateData({
      deptIds: this.deptIds,
      staffIds: this.staffIds
    })
  }

  resetStaffList = list => {
    for (let i of list) {
      i.isLeaf = true
      i.id = i.id + '___isLeaf'
    }
    return list
  }

  onLoadData = treeNode => {
    return new Promise(resolve => {
      axios.post(urls.deptStaffList, {departmentId: treeNode.props.node.id}).then(res => {
        const staffList = this.resetStaffList(res.retdata)
        if (treeNode.props.node.subDept && treeNode.props.node.subDept.length) {
          treeNode.props.node.subDept = [...staffList, ...treeNode.props.node.subDept]
        } else {
          treeNode.props.node.subDept = staffList
        }
        this.setState({
          deptTree: this.state.deptTree
        })
        resolve()
      })
    })
  }

  renderTreeNodes = data => data.map((item) => {
    if (item.subDept) {
      return (
        <TreeSelect.TreeNode node={item} isLeaf={item.isLeaf} value={item.id} title={item.name} key={item.id} disabled={item.disabled}>
          {this.renderTreeNodes(item.subDept)}
        </TreeSelect.TreeNode>
      )
    }
    return <TreeSelect.TreeNode node={item} isLeaf={item.isLeaf} value={item.id} title={item.name} key={item.id} disabled={item.disabled} />
  })

  render () {
    const { deptTree, changeDept } = this.state
    return (
      <div style={{height: 200}}>
        {deptTree && deptTree.length ? <TreeSelect
          showSearch
          multiple
          value={changeDept}
          treeNodeFilterProp={'title'}
          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
          placeholder="搜索或选择部门"
          style={{width: 400}}
          allowClear
          treeDefaultExpandedKeys={[deptTree[0].id]}
          treeCheckable
          showCheckedStrategy={'SHOW_PARENT'}
          loadData={this.onLoadData}
          onChange={this.onChangeDept}
        >
          {this.renderTreeNodes(deptTree)}
        </TreeSelect> : null}
      </div>
    )
  }
}
