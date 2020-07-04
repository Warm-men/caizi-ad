import React, { Component } from 'react'
import styles from './index.less'
import { Switch, Icon, message, Form, Popover, Button } from 'antd'
import axios from '@src/utils/axios'
import DeptTreeSelect from '@src/components/DeptTreeSelect'
import urls from '@src/config'
class SwitchPage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      uploadArticle: false,
      switchList: {},
      branchId: []
    }
  }

  componentDidMount () {
    this.queryData()
  }

  queryData = () => {
    axios.post(urls.switchList, {}).then(res => {
      const { switchList } = res.retdata
      this.setState({
        switchList,
        branchId: switchList.deptIds.length ? switchList.deptIds : []
      })
    })
  }

  onChangeUploadArticle = () => {
    const { switchList } = this.state
    this.setState({
      switchList: { ...switchList, STAFF_UPLOAD_NEWS: !switchList.STAFF_UPLOAD_NEWS }
    }, () => {
      if (!this.state.switchList.STAFF_UPLOAD_NEWS) {
        this.updateSwitch()
      }
    })
  }

  updateSwitch = () => {
    const { branchId, switchList } = this.state
    const params = {
      switchName: 'STAFF_UPLOAD_NEWS',
      switchValue: switchList.STAFF_UPLOAD_NEWS,
      deptIdList: branchId
    }
    axios.post(urls.switchCreate, params, {headers: {'Content-Type': 'application/json'}}).then(res => {
      message.success('更新成功')
    })
  }

  selectDept = value => {
    this.setState({ branchId: value })
  }

  handleSave = () => {
    const { branchId } = this.state
    if (!branchId.length) return message.info('请选择部门')
    this.updateSwitch()
  }

  render () {
    const { switchList, branchId } = this.state
    const { STAFF_UPLOAD_NEWS } = switchList
    return (
      <div className={styles.switch_page}>
        <Form.Item
          label={<span>是否允许员工上传文章 <Popover
            content={'若打开该功能，则员工可在小程序端使用文章获客助手功能，可帮助员工收集客户兴趣'}
          >
            <Icon type={'info-circle'} />
          </Popover></span>}
          labelCol={{ span: 3 }}
          wrapperCol={{ span: 20 }}
        >
          <Switch checked={STAFF_UPLOAD_NEWS} onChange={this.onChangeUploadArticle} />
        </Form.Item>
        {STAFF_UPLOAD_NEWS
          ? <Form.Item
            label={<span>选择可见部门<span style={{color: 'red'}}>*</span></span>}
            labelCol={{ span: 3 }}
            wrapperCol={{ span: 20 }}
          >
            <DeptTreeSelect
              multiple={true}
              style={{ width: 400 }}
              value={branchId}
              treeCheckable
              onChange={this.selectDept}/>
            <p>设置完成可见部门，此功能（小程序-文章获客助手）仅限可见部门员工使用</p>
          </Form.Item> : null }
        {STAFF_UPLOAD_NEWS && <Button type={'primary'} style={{marginLeft: 204}} onClick={this.handleSave}>保存</Button>}

      </div>
    )
  }
}

export default SwitchPage
