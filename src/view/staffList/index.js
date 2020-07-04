import React, { Component } from 'react'
import styles from './index.less'
import { Input, message } from 'antd'
import StaffTable from './staffTable'
import DeptTree from './deptTree'
import axios from '@src/utils/axios'
import urls from '@src/config'

export default class StaffList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      treeData: [],
      firstLevelId: [],
      selectedDeptKey: '',
      searchValue: '',
      searchKey: ''
    }
  }
  componentDidMount () {
    this.getDeptTree()
  }
  // 获取员工树
  getDeptTree = (id, callback) => {
    const { treeData, firstLevelId } = this.state
    const obj = {}
    if (id) {
      obj.departmentId = id
    }
    axios.post(urls.departmentCorpTree, {...obj, useRole: true}).then(res => {
      let newData = res.retdata.deptList
      if (id) {
        newData = this.findIdInTreeData(treeData, id, res.retdata.deptList)
      } else {
        // 获取所有一级的目录，因为默认会返回两层打开的，所以过滤一层点击的时候，避免触发异步请求树
        res.retdata.deptList.map(v => {
          firstLevelId.push(v.id)
          return v
        })
      }
      this.setState({ treeData: newData, self: res.retdata.self, firstLevelId }, () => {
        callback && callback()
      })
    })
  }

  findIdInTreeData = (data, id, pushData) => {
    return data.map(item => {
      if (item.id === id) {
        item.subDept = pushData
      }
      if (item.subDept) {
        this.findIdInTreeData(item.subDept, id, pushData)
      }
      return item
    })
  }
  // 点击树的某个节点
  onClickNode = (key) => {
    // 点击部门后 搜索栏searchValue清空 传入StaffTable的searchKey清空
    this.setState({ selectedDeptKey: key, searchValue: '', searchKey: '' })
  }
  // 输入搜索关键字
  changeSearchValue (e) {
    this.setState({ searchValue: e.target.value })
  }
  // 点击搜索 搜索后选中部门清空
  search (value) {
    this.setState({ searchKey: value.trim(), selectedDeptKey: '' })
  }
  // 删除部门
  departmentDelete = (deptId) => {
    return axios.post(urls.departmentDelete, { deptId }).then(res => {
      this.setState({ selectedDeptKey: '' })
      this.getDeptTree()
      return message.success('删除成功')
    })
  }

  loadData = (treeNode) => {
    // eslint-disable-next-line
    return new Promise(resolve => {
      const { firstLevelId } = this.state
      const { eventKey } = treeNode.props
      if (!firstLevelId.includes(eventKey)) {
        this.getDeptTree(eventKey, () => {
          resolve()
        })
      } else {
        resolve()
      }
    })
  }

  render () {
    const { selectedDeptKey, searchValue, searchKey, treeData, self } = this.state
    return (
      <div className={styles.wrap}>
        <div className={styles.left}>
          <div className={styles.leftTop}>
            <Input.Search
              className={styles.leftItem}
              placeholder={'员工姓名'}
              style={{ width: 200 }}
              value={searchValue}
              onChange={this.changeSearchValue.bind(this)}
              onSearch={this.search.bind(this)}
            />
          </div>
          <div className={styles.leftBottom}>
            <DeptTree
              onClickNode={this.onClickNode}
              selectedDeptKey={selectedDeptKey}
              treeData={treeData}
              getDeptTree={this.getDeptTree}
              NoSeeMore={self}
              loadData={this.loadData}
              departmentDelete={this.departmentDelete}
            />
          </div>
        </div>
        <div className={styles.right}>
          <StaffTable
            selectedDeptKey={selectedDeptKey}
            searchKey={searchKey}
            getDeptTree={this.getDeptTree}
          />
        </div>
      </div>
    )
  }
}
