import React, { Component } from 'react'
import { TreeSelect } from 'antd'
import { connect } from 'react-redux'
import store from '@src/store'

const mapStateToProps = (state) => {
  return {
    deptList: state.base.deptList,
    allDeptList: state.base.allDeptList
  }
}

@connect(mapStateToProps)
export default class DeptTreeSelect extends Component {
  constructor(props) {
    super(props)
    this.state = { deptList: props.deptList, allDeptList: props.allDeptList }
  }

  componentDidMount() {
    this.storeSubscribe()
  }

  // redux监听
  storeSubscribe = () => {
    store.subscribe(() => {
      const state = store.getState()
      const { deptList, allDeptList } = state.base
      const _deptList = this.state.deptList
      const _allDeptList = this.state.allDeptList
      if (deptList.length && !_deptList.length) {
        this.setState({ deptList })
      }
      if (allDeptList.length && !_allDeptList.length) {
        this.setState({ allDeptList })
      }
    })
  }

  // 表单change事件
  deptChange = (value, options) => {
    const { multiple } = this.props
    const realValue = multiple === false ? [value] : (value || []).slice(0)
    Object.keys(this.dictionaries).forEach((id) => {
      const name = this.dictionaries[id]
      const includeIndex = realValue.findIndex((item) => item === name)
      if (includeIndex !== -1) realValue[includeIndex] = id
    })
    this.props.onChange(multiple === false ? realValue[0] : realValue, options)
  }

  // 选中的值是否在权限列表内
  ifInclude = (value, list = this.state.deptList) => {
    return list.some((item) => {
      if (item.id === value) {
        return true
      }
      if (item.children && item.children.length) {
        return this.ifInclude(value, item.children)
      }
      return false
    })
  }

  // 找到id对应的文案
  getText = (value, list = this.state.allDeptList) => {
    return list.some((item) => {
      if (item.id === value) {
        this.dictionaries[value] = item.name
        return true
      }
      if (item.children && item.children.length) {
        return this.getText(value, item.children)
      }
      return false
    })
  }

  // 计算显示的值
  showValue = () => {
    const { value, multiple } = this.props
    const newValue = multiple === false ? [value] : (value || []).slice(0)
    newValue.forEach((item, index) => {
      const has = this.ifInclude(item)
      if (!has) {
        this.getText(item)
        newValue[index] = this.dictionaries[item] || item
      }
    })
    return multiple === false ? newValue[0] : newValue
  }

  render() {
    const { deptList } = this.state
    this.dictionaries = {}
    const value = this.showValue()
    if (deptList.length) {
      return (
        <TreeSelect
          multiple={true}
          showSearch
          treeNodeFilterProp="title"
          allowClear
          treeData={deptList}
          treeDefaultExpandedKeys={[deptList[0].id]}
          placeholder="请选择机构"
          {...this.props}
          value={value}
          onChange={this.deptChange}
        />
      )
    }

    return (
      <TreeSelect
        multiple={true}
        showSearch
        treeNodeFilterProp="title"
        allowClear
        treeData={[]}
        placeholder="请选择机构"
        {...this.props}
        value={null}
        onChange={() => {}}
      />
    )
  }
}
