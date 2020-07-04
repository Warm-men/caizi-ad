import React, { Component } from 'react'
import { Button, Modal, Tree, Select, Table, Input, Icon } from 'antd'
import styles from './index.less'

// 公司人员选择弹窗 树形结构分批加载
// props
// visible 显示关闭modal
// selectedStaff 已选的人员(对象数组)
// onOk modal确定回调 返回checkedNodes
// onCancel modal取消回调

export default class StaffSelectModal extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      treeData: [],
      checkedKeys: [],
      checkedNodes: [],
      searchData: [],
      searchValue: undefined
    }
  }

  componentDidMount () {
    const treeData = [
      {
        title: '深圳分行',
        key: 'zhihan1',
        children: [
          { title: '一人', key: 11, isStaff: true },
          { title: '二狗', key: 12, isStaff: true },
          { title: '科苑支行1', key: 'fenhan1' },
          { title: '科苑支行2', key: 'fenhan2' },
          { title: '科苑支行3', key: 'fenhan3' }
        ]
      },
      {
        title: '广州分行',
        key: 'zhihan11',
        children: [
          { title: '三猪', key: 21, isStaff: true },
          { title: '四猫', key: 22, isStaff: true }
        ]
      },
      { title: '上海分行', key: 'zhihan2' },
      { title: '北京分行', key: 'zhihan3' }
    ]
    this.setState({ treeData })
  }
  // 关闭再打开modal
  componentWillReceiveProps (next) {
    if (this.props.visible !== next.visible) {
      const { selectedStaff } = next
      this.setState({
        checkedNodes: selectedStaff,
        checkedKeys: selectedStaff.map(obj => obj.key)
      })
    }
  }

  // 点击三角节点 请求数据异步加载子节点 onLoadData必须是promise
  onLoadData = treeNode => new Promise((resolve) => {
    // 如果treeData此节点有children数据 不再请求数据
    if (treeNode.props.children) {
      resolve()
      return
    }
    // 请求此节点下的子节点数据
    setTimeout(() => {
      treeNode.props.dataRef.children = [
        { title: 'Child Node', key: `${treeNode.props.eventKey}-0` },
        { title: 'Child Node', key: `${treeNode.props.eventKey}-1` }
      ]
      this.setState({
        treeData: [...this.state.treeData]
      })
      resolve()
    }, 1000)
  })

  // 递归渲染树
  renderTreeNodes = data => data.map((item) => {
    if (item.children) {
      return (
        // isStaff 员工节点 出现checkbox 不出现三角不进行onLoadData
        <Tree.TreeNode title={item.title} key={item.key} selectable={false}
          checkable={Boolean(item.isStaff)} isLeaf={item.isStaff} dataRef={item}>
          {this.renderTreeNodes(item.children)}
        </Tree.TreeNode>
      )
    }
    // 当前item通过props dataRef传递
    return <Tree.TreeNode title={item.title} key={item.key} selectable={false}
      checkable={Boolean(item.isStaff)} isLeaf={item.isStaff} dataRef={item} />
  })
  // 选择树节点
  onCheck = (checkedKeys, info) => {
    const currentCheckedNodes = info.checkedNodes.map(obj => {
      return {
        title: obj.props.dataRef.title,
        key: obj.props.dataRef.key
      }
    })
    this.setState({
      checkedNodes: currentCheckedNodes,
      // 只维护checkedNodes checkedKeys都根据checkedNodes得出
      checkedKeys: currentCheckedNodes.map(obj => obj.key)
    })
  }
  // 数组里的对象去重复
  uniqueArr = (arr) => {
    const obj = {}
    const uniqueArr = arr.reduce((cur, next) => {
      if (!obj[next.key]) {
        obj[next.key] = true
        cur.push(next)
      }
      return cur
    }, [])
    return uniqueArr
  }
  // 删除已选择用户
  deleteMember (ev, nodeKey) {
    const currentCheckedNodes = this.state.checkedNodes.filter(obj => obj.key !== nodeKey)
    this.setState({
      checkedNodes: currentCheckedNodes,
      checkedKeys: currentCheckedNodes.map(obj => obj.key)
    })
  }
  // modal确定
  handleOk (e) {
    this.props.onOk && this.props.onOk(this.state.checkedNodes)
  }
  // modal取消
  handleCancel (e) {
    this.props.onCancel()
  }
  // 搜索人员 请求后台得到下拉列表
  handleSearch = (value) => {
    const data = [{ key: 51, title: value + '搜索人员1' }, { key: 52, title: value + '搜索人员2' }, { key: 53, title: value + '搜索人员3' }]
    this.setState({ searchData: data })
  }
  // 选择搜索出来的下拉列表人员
  handleChange = (value) => {
    const selectObj = this.state.searchData.filter(obj => obj.key === Number(value))[0]
    // todo 这里得到selectObj后 合并到checkedNodes里
    // this.setState({ searchValue: value })
  }

  render () {
    const { visible } = this.props
    const { checkedKeys, checkedNodes, searchData, searchValue } = this.state
    return (
      <div className="add-role-member" >
        <Modal
          title="添加人员"
          visible={visible}
          onOk={this.handleOk.bind(this)}
          okText={'确定'}
          onCancel={this.handleCancel.bind(this)}
          cancelText={'取消'}
          className={styles.memberModal}
          width={700}
        >
          <div className={styles.memberModalBody}>
            <div className={styles.memberLeft}>
              <div className={styles.memberTitle}>可选择</div>
              <div className={styles.memberTreeArea}>
                <div className={styles.selectWrap}>
                  <Select
                    showSearch
                    placeholder="可搜索人员"
                    value={searchValue}
                    style={{ width: '100%' }}
                    defaultActiveFirstOption={false}
                    showArrow={false}
                    filterOption={false}
                    onSearch={this.handleSearch}
                    onChange={this.handleChange}
                    notFoundContent={null}
                  >
                    {searchData.map(d => <Select.Option key={d.key}>{d.title}</Select.Option>)}
                  </Select>
                </div>
                <div className={styles.treeWrap}>
                  <Tree loadData={this.onLoadData} checkable={true}
                    onCheck={this.onCheck} checkedKeys={checkedKeys}>
                    {this.renderTreeNodes(this.state.treeData)}
                  </Tree>
                </div>
              </div>
            </div>
            <div className={styles.memberRight}>
              <div className={styles.memberTitle}>已选择</div>
              <div className={styles.selectMemberArea}>
                <ul>
                  {checkedNodes.map(obj => {
                    return <li key={obj.key} className={styles.selectMemberItem}>
                      <span>{obj.title}</span>
                      <Icon type="close" className={styles.deleteIcon} onClick={(ev) => this.deleteMember(ev, obj.key)} />
                    </li>
                  })}
                </ul>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}
