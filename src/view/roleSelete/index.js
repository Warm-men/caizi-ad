import React, { Component, PureComponent } from 'react'
import { Spin, Icon } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import styles from './index.less'
import Header from '@src/view/base/header'
class Role extends Component {
  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      roles: [],
      roleId: null,
      seletedItemId: null
    }
  }

  componentDidMount () {
    this.pullRoles()
  }

  pullRoles = () => {
    axios.get(urls.listStaffRoles).then(res => {
      if (res.retdata.length === 1) {
        this.setState({
          roles: res.retdata,
          seletedItemId: res.retdata[0].id,
          loading: false
        }, this.setStaffRole)
      } else {
        this.setState({
          roles: res.retdata,
          loading: false
        })
      }
    })
  }

  onChangeItem = (id) => {
    this.setState({seletedItemId: id}, this.setStaffRole)
  }

  setStaffRole = () => {
    const params = {
      roleId: this.state.seletedItemId
    }
    axios.post(urls.setStaffRole, params).then(res => {
      this.props.history.push('/')
    })
  }

  render () {
    const { roles, loading } = this.state
    if (roles.length === 1) return null
    return (
      <Spin spinning={loading} >
        <Header />
        {roles.length === 0 ? <div className={styles.content_view}>
          <div style={{textAlign: 'center', marginTop: 250}}>
            <Icon type={'warning'} style={{color: '#1890ff'}} /> 您当前暂无任何角色，请联系管理员添加。
          </div>
        </div> : <div className={styles.content_view}>
          <SelectedView roles={roles} onChangeItem={this.onChangeItem}/>
          <div className={styles.copyright}>Copyright @ 2019 AppleTree All Rights Reserved 粤ICP备17042315号</div>
        </div>}
      </Spin>
    )
  }
}

class SelectedView extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      currenId: null
    }
  }

  seletedItem = id => {
    this.setState({ currentId: id })
    this.props.onChangeItem(id)
  }

  render () {
    const { roles } = this.props
    const { currentId } = this.state
    return (
      <div className={styles.seleted_view}>
        <div className={styles.title}>选择角色进入</div>
        <div className={styles.selected_box}>
          {roles.map((v, i) => {
            const isSeletedStyles = currentId === v.id ? styles.role_item_view_seleted : styles.role_item_view
            return (
              <div className={isSeletedStyles} key={i} onClick={() => this.seletedItem(v.id)}>
                <div className={styles.item_title}>{v.roleName}</div>
                <div className={styles.item_range}>{'管理范围: ' + v.roleRange}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
}

export default Role
