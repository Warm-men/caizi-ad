import React, { Component } from 'react'
import { Select } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import utils from '@src/utils'

export default class StaffTable extends Component {
  constructor (props) {
    super(props)
    this.state = {
      deptTree: [],
      changeDept: []
    }
  }

  // 选择成员
  changeStaff = (value) => {
    this.setState({ changeDept: value }, this.reportData)
  }

  reportData = () => {
    const {changeDept} = this.state
    this.props.updateData({
      deptIds: [],
      staffIds: changeDept
    })
  }
  // 远程搜索成员
  searchStaff = (value) => {
    this.debounce(value)
  }
  // debounce闭包 必须先写好 然后在searchStaff触发
  debounce = utils.debounce((value) => this.getStaffList(value), 300)
  getStaffList = (value) => {
    const key = value.trim()
    if (!key) {
      this.setState({ deptTree: [] })
    } else {
      axios.post(urls.userList, { name: key }).then(res => {
        const deptTree = res.retdata.userList.map(obj => {
          return { ...obj, staffId: obj.id }
        })
        this.setState({ deptTree })
      })
    }
  }

  render () {
    const { deptTree, changeDept } = this.state
    return (
      <div style={{height: 200}}>
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          placeholder="搜索成员"
          value={changeDept}
          onChange={this.changeStaff}
          onSearch={this.searchStaff}
          showSearch
          defaultActiveFirstOption={false}
          showArrow={false}
          filterOption={false}
        >
          {deptTree.map(obj => {
            return <Select.Option
              title={`${obj.name} - ${obj.department}`}
              name={obj.name} key={obj.staffId} value={obj.staffId}>
              {obj.name} - {obj.department}
            </Select.Option>
          })}
        </Select>
      </div>
    )
  }
}
