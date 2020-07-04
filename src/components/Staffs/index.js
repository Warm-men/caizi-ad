import React, { Component } from 'react'
import { Modal, Tree, Icon, Spin, Input, Button } from 'antd'
import { connect } from 'react-redux'
import axios from '@src/utils/axios'
import urls from '@src/config'
import './index.less'

const mapStateToProps = (state) => {
  return {
    deptList: state.base.deptList
  }
}
@connect(mapStateToProps)
export default class Staffs extends Component {
  constructor(props) {
    super(props)
    this.state = { isLoading: false, deptList: JSON.parse(JSON.stringify(props.deptList)), selectedStaffs: props.selected || [], staffList: [] }
  }

  onOk = () => {
    const { onOk } = this.props
    const { selectedStaffs } = this.state
    onOk(selectedStaffs)
  }

  // 请求员工列表
  onSelect = (departmentId, name) => {
    if (departmentId === undefined) return
    if (departmentId && this[`staffList-${departmentId}`]) {
      this.setState({ staffList: this[`staffList-${departmentId}`] })
      return
    }
    this.setState({ name, isLoading: true })
    const data = {
      pageNum: 1,
      pageSize: 100,
      name,
      departmentId
    }
    axios
      .post(urls.userList, data)
      .then((res) => {
        if (res.ret === 0) {
          this[`staffList-${departmentId}`] = res.retdata.userList
          this.setState({ staffList: res.retdata.userList })
        }
      })
      .finally(() => {
        this.setState({ isLoading: false })
      })
  }

  // 选中与反选
  selectStaff = (item) => {
    const { selectedStaffs } = this.state
    const index = selectedStaffs.findIndex((vv) => vv.userId === item.userId)
    if (index === -1) {
      selectedStaffs.push(item)
    } else {
      selectedStaffs.splice(index, 1)
    }
    this.setState({ selectedStaffs })
  }

  // 取消选中
  del = (userId) => {
    const { selectedStaffs } = this.state
    const index = selectedStaffs.findIndex((vv) => vv.userId === userId)
    selectedStaffs.splice(index, 1)
    this.setState({ selectedStaffs })
  }

  // 全部取消
  clear = () => {
    this.setState({ selectedStaffs: [] })
  }

  // 全选
  selectAll = () => {
    const { staffList, selectedStaffs } = this.state
    const all = [...selectedStaffs, ...staffList]
    const newSelectedStaffs = all.reduce(
      (obj, item) => {
        const { ids, list } = obj
        if (!ids.has(item.userId)) {
          list.push(item)
          ids.add(item.userId)
        }
        return obj
      },
      { ids: new Set(), list: [] }
    ).list
    this.setState({ selectedStaffs: newSelectedStaffs })
  }

  // 全部反选
  unSelectAll = () => {
    const { staffList, selectedStaffs } = this.state
    const ids = staffList.map((item) => item.userId)
    const newSelectedStaffs = selectedStaffs.map((item) => {
      if (ids.includes(item.userId)) {
        return null
      }
      return item
    })
    this.setState({ selectedStaffs: newSelectedStaffs.filter((item) => item !== null) })
  }

  render() {
    const { deptList, selectedStaffs, staffList, isLoading, name = '' } = this.state
    const { Search } = Input
    return (
      <Modal maskClosable={false} width={1080} className="staffs-modal" visible={true} title="选择使用成员" onOk={this.onOk} onCancel={this.props.onCancel}>
        <Spin spinning={isLoading}>
          <div className="titles">
            <div className="title">部门列表</div>
            <div className="title">员工列表</div>
            <div className="title">选中员工列表</div>
          </div>
          <div className="selecter">
            {deptList.length > 0 && (
              <Tree defaultExpandedKeys={[deptList[0].id]} onSelect={([departmentId]) => this.onSelect(departmentId, '')} treeData={deptList}></Tree>
            )}
          </div>
          <div className="selecter">
            <Search
              placeholder="搜索成员"
              value={name}
              maxLength={15}
              onSearch={(value) => this.onSelect('', value)}
              onChange={(e) => this.setState({ name: e.target.value })}
            />
            {staffList.map((item) => (
              <div
                onClick={() => this.selectStaff(item)}
                key={item.userId}
                className={`item ${selectedStaffs.find((vv) => vv.userId === item.userId) ? 'selected' : ''}`}
              >
                {item.name}
              </div>
            ))}
          </div>
          <div className="selecter">
            {selectedStaffs.map((item) => (
              <div key={item.userId} className="item selected">
                {item.name}
                <Icon type="close" onClick={() => this.del(item.userId)} />
              </div>
            ))}
          </div>
          <div className="footers">
            <div className="footer"></div>
            <div className="footer">
              <div className="btn" onClick={this.selectAll}>
                全选
              </div>
              <div className="btn" onClick={this.unSelectAll}>
                全部取消
              </div>
            </div>
            <div className="footer">
              <div className="btn" onClick={this.clear}>
                全部取消
              </div>
            </div>
          </div>
        </Spin>
      </Modal>
    )
  }
}
