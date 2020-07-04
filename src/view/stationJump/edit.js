import React, { Component } from 'react'
import styles from './edit.less'
import { Input, Tabs, Button, Upload, message, Avatar } from 'antd'
import { Link } from 'react-router-dom'
import axios from '@src/utils/axios'
import urls from '@src/config'
import DeptTreeSelect from '@src/components/DeptTreeSelect'
const { TabPane } = Tabs

class ConfigEntryEdit extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      imageUrl: '',
      entry0Icon: '',
      entry1Icon: '',
      entry2Icon: '',
      entry3Icon: '',
      defaultCombineName: '', // 组合名称默认值
      combineName: '',
      orgIdList: [],
      defaultDeptList: [], // 默认机构名
      editData: null,
      jumpList: [] // 跳转列表
    }
  }

  componentDidMount () {
    if (this.props.location.query === undefined) {
      this.props.history.push('/stationJump')
      return
    }
    if (this.props.location.query) {
      const editData = this.props.location.query
      const orgId = editData.data.operateId
      this.getOrgDetail({id: orgId})
      this.setState({
        id: orgId
      })
    }
  }
  // 获取详情
  getOrgDetail=(data) => {
    axios.post(urls.getOrgDetail, {id: data.id}, {headers: {'Content-Type': 'application/json'}}).then((res) => {
      if (res.ret !== 0) {
        message.error(res.retmsg)
        return
      }
      const resData = res.retdata
      const jpl = resData.busiJump.jumpList
      this.setState({
        defaultCombineName: resData.busiJump.busiRemark,
        combineName: resData.busiJump.busiRemark,
        jumpList: jpl,
        entry0Name: jpl[0].busiName || '', // 入口一名称
        entry1Name: jpl[1].busiName || '',
        entry2Name: jpl[2].busiName || '',
        entry3Name: jpl[3].busiName || '',
        entry0Url: jpl[0].jumpUrl || '', // 入口一跳转链接
        entry1Url: jpl[1].jumpUrl || '',
        entry2Url: jpl[2].jumpUrl || '',
        entry3Url: jpl[3].jumpUrl || '',
        entry0Icon: jpl[0].busiIcon || '', // 入口一图标
        entry1Icon: jpl[1].busiIcon || '',
        entry2Icon: jpl[2].busiIcon || '',
        entry3Icon: jpl[3].busiIcon || '',
        entry0Img: jpl[0].busiIcon || '', // 入口一图标
        entry1Img: jpl[1].busiIcon || '',
        entry2Img: jpl[2].busiIcon || '',
        entry3Img: jpl[3].busiIcon || '',
        defaultDeptList: resData.busiJump.deptIdList,
        orgIdList: resData.busiJump.deptIdList

      })
    })
  }
  // 入口名称输入框变更事件
  combineInputChange = (e) => {
    switch (e.target.name) {
      case 'entry0':
        this.setState({
          tempEntry0Name: e.target.value
        })
        break
      case 'entry1':
        this.setState({
          tempEntry1Name: e.target.value
        })
        break
      case 'entry2':
        this.setState({
          tempEntry2Name: e.target.value
        })
        break
      case 'entry3':
        this.setState({
          tempEntry3Name: e.target.value
        })
        break
      default:
        break
    }
  }
  // 跳转链接输入框变更事件
  combineLinkInputChange =(e) => {
    if (e.target.name === 'entryLink0') {
      this.setState({
        tempEntry0Url: e.target.value
      })
    } else if (e.target.name === 'entryLink1') {
      this.setState({
        tempEntry1Url: e.target.value
      })
    } else if (e.target.name === 'entryLink2') {
      this.setState({
        tempEntry2Url: e.target.value
      })
    } else if (e.target.name === 'entryLink3') {
      this.setState({
        tempEntry3Url: e.target.value
      })
    }
  }

  handleTabsChange = (key) => {}

  onChangeOrg = (value) => {
    this.setState({
      orgIdList: value
    })
  }

  beforeUploadImg = (file) => {
    const isPngOrJpeg = file.type === 'image/jpeg' || file.type === 'image/png'
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isPngOrJpeg) {
      message.error('只能上传jpg、jpeg、png格式的图片')
      return false
    }
    if (!isLt2M) {
      message.error('图片必须2M以内')
      return false
    }
    this.setState({ isLoading: true })
    return true
  }

  combineNameInputChange= (e) => {
    this.setState({
      combineName: e.target.value
    })
  }
   // 图片上传
   handleChangeImg = (info, type) => {
     if (type === 0) {
       if (info.file.status === 'done') {
         const tempImg0 = info.file['response']['retdata']['filePaths'][0]
         this.setState({entry0Icon: tempImg0})
         message.success('上传图片成功')
       }
     } else if (type === 1) {
       if (info.file.status === 'done') {
         const tempImg1 = info.file['response']['retdata']['filePaths'][0]
         this.setState({ entry1Icon: tempImg1 })
         message.success('上传图片成功')
       }
     } else if (type === 2) {
       if (info.file.status === 'done') {
         const tempImg2 = info.file['response']['retdata']['filePaths'][0]
         this.setState({ entry2Icon: tempImg2 })
         message.success('上传图片成功')
       }
     } else if (type === 3) {
       if (info.file.status === 'done') {
         const tempImg3 = info.file['response']['retdata']['filePaths'][0]
         this.setState({ entry3Icon: tempImg3 })
         message.success('上传图片成功')
       }
     }
   }

  // 限制图片上传图片类型 阻止发送请求
  beforeUploadImg = (file) => {
    const isPngOrJpeg = file.type === 'image/jpeg' || file.type === 'image/png'
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isPngOrJpeg) {
      message.error('只能上传jpg、jpeg、png格式的图片')
      return false
    }
    if (!isLt2M) {
      message.error('图片必须2M以内')
      return false
    }
    // this.setState({ isLoading: true })
    return true
  }
  // 保存事件
  handleSave = (data) => {
    const {jumpList} = this.state
    if (data.item === 0) {
      let inputEntry0 = this.refs.entryinput0.state.value// 入口名称
      let urlEntry0 = this.refs.entryurl0.state.value// 跳转链接
      const { tempEntry0Name, tempEntry0Url, entry0Icon } = this.state
      if (inputEntry0 === '') {
        message.warn('入口名称不能为空')
        return
      }
      if (entry0Icon === '') {
        message.warn('入口图片不能为空')
        return
      }
      if (urlEntry0 === '') {
        message.warn('入口链接不能为空')
        return
      }
      this.setState({
        entry0Name: tempEntry0Name || jumpList[0].busiName,
        entry0Url: tempEntry0Url || jumpList[0].jumpUrl,
        entry0Img: entry0Icon
      })
    } else if (data.item === 1) {
      let inputEntry1 = this.refs.entryinput1.state.value// 入口名称
      let urlEntry1 = this.refs.entryurl1.state.value// 跳转链接
      const { tempEntry1Name, tempEntry1Url, entry1Icon, entry1Name } = this.state
      if (inputEntry1 === '') {
        message.warn('入口名称不能为空')
        return
      }
      if (entry1Icon === '') {
        message.warn('入口图片不能为空')
        return
      }
      if (urlEntry1 === '') {
        message.warn('入口链接不能为空')
        return
      }
      this.setState({
        entry1Name: tempEntry1Name || jumpList[1].busiName,
        entry1Url: tempEntry1Url || jumpList[1].jumpUrl,
        entry1Img: entry1Icon
      })
    } else if (data.item === 2) {
      let inputEntry2 = this.refs.entryinput2.state.value// 入口名称
      let urlEntry2 = this.refs.entryurl2.state.value// 跳转链接
      const { tempEntry2Name, tempEntry2Url, entry2Icon } = this.state
      if (inputEntry2 === '') {
        message.warn('入口名称不能为空')
        return
      }
      if (entry2Icon === '') {
        message.warn('入口图片不能为空')
        return
      }
      if (urlEntry2 === '') {
        message.warn('入口链接不能为空')
        return
      }
      this.setState({
        entry2Name: tempEntry2Name || jumpList[2].busiName,
        entry2Url: tempEntry2Url || jumpList[2].jumpUrl,
        entry2Img: entry2Icon
      })
    } else if (data.item === 3) {
      let inputEntry3 = this.refs.entryinput3.state.value// 入口名称
      let urlEntry3 = this.refs.entryurl3.state.value// 跳转链接
      const { tempEntry3Name, tempEntry3Url, entry3Icon } = this.state
      if (inputEntry3 === '') {
        message.warn('入口名称不能为空')
        return
      }
      if (entry3Icon === '') {
        message.warn('入口图片不能为空')
        return
      }
      if (urlEntry3 === '') {
        message.warn('入口链接不能为空')
        return
      }
      this.setState({
        entry3Name: tempEntry3Name || jumpList[3].busiName,
        entry3Url: tempEntry3Url || jumpList[3].jumpUrl,
        entry3Img: entry3Icon
      })
    }
    message.success('保存成功')
  }
  // 提交事件
  hanldCommit = () => {
    if (this.isLoading) return
    this.isLoading = true
    const {combineName, orgIdList, id, defaultDeptList,
      entry0Name, entry1Name, entry2Name, entry3Name,
      entry0Url, entry1Url, entry2Url, entry3Url, entry0Img, entry1Img, entry2Img, entry3Img
    } = this.state
    if (!orgIdList.length && !defaultDeptList.length) {
      message.warn('配置机构不能为空')
      this.isLoading = false
      return
    }
    const jumpList = [
      {busiName: entry0Name, busiIcon: entry0Img, jumpUrl: entry0Url},
      {busiName: entry1Name, busiIcon: entry1Img, jumpUrl: entry1Url},
      {busiName: entry2Name, busiIcon: entry2Img, jumpUrl: entry2Url},
      {busiName: entry3Name, busiIcon: entry3Img, jumpUrl: entry3Url}
    ]
    axios.post(urls.commitBusinessConfig, {
      id: id,
      busiRemark: combineName,
      jumpList,
      deptIdList: orgIdList.length > 0 ? orgIdList : defaultDeptList
    }, {headers: {'Content-Type': 'application/json'}}).then(res => {
      message.success('成功')
      setTimeout(() => {
        this.props.history.push('/stationJump')
      }, 1000)
      this.isLoading = false
    }).catch(() => {
      this.isLoading = false
    })
  }

  render () {
    const { defaultCombineName, jumpList,
      entry0Name, entry1Name, entry2Name, entry3Name, orgIdList = [],
      entry0Icon, entry1Icon, entry2Icon, entry3Icon, entry0Img, entry1Img, entry2Img, entry3Img
    } = this.state
    return (
      <div className={styles.entryContainer}>
        <div className={styles.title}>
          <p>业务配置/编辑</p>
        </div>
        <div className={styles.header}>
          <p className={styles.intro}>管理人员可为客户经理小站配置不同业务跳转入口</p>
          <div className={styles.headerContainer}>
            <div className={styles.conbineName}>
              <span>&lowast;组合名称</span>
              {defaultCombineName ? <Input
                placeholder="请输入组合名称"
                maxLength={12}
                defaultValue={defaultCombineName}
                onChange={this.combineNameInputChange}
                style={{width: 300, marginLeft: 10}}
              /> : null}
            </div>
            <div className={styles.orgConfig}>
              <span>&lowast;选择配置机构</span>
              <DeptTreeSelect value={orgIdList} onChange={this.onChangeOrg} style={{width: 300, marginLeft: 10}} />
            </div>
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.contentLeft}>
            <Tabs defaultActiveKey="1" onChange={this.handleTabsChange}>
              <TabPane tab="入口一" key="1">
                <div className={styles.enTryName}>
                  <span>&lowast;入口名称</span>
                  {jumpList.length ? <Input
                    name="entry0"
                    ref="entryinput0"
                    autoComplete="off"
                    placeholder="请输入名称（限制4个字）"
                    defaultValue={jumpList[0].busiName}
                    onChange={this.combineInputChange}
                    maxLength={4}
                    style={{width: 500, marginLeft: 10}}
                  /> : null}

                </div>
                <div className={styles.enTryIcon}>
                  <span>&lowast;入口图标</span>
                  {entry0Icon ? <Avatar size={64} className={styles.entryImg} style={{marginLeft: 18}} src={entry0Icon}/> : null}
                  <Upload
                    action={urls.bannerUpload}
                    onChange={(e) => this.handleChangeImg(e, 0)}
                    beforeUpload={this.beforeUploadImg}
                    showUploadList={false}
                  >
                    <Button type="primary" size="small" style={{marginLeft: 10}}>上传图片</Button>
                  </Upload>
                </div>
                <span>&lowast;跳转链接</span>
                {jumpList.length ? <Input
                  name="entryLink0"
                  ref="entryurl0"
                  placeholder="请输入链接"
                  autoComplete="off"
                  defaultValue={jumpList[0].jumpUrl}
                  onChange={this.combineLinkInputChange}
                  style={{width: 500, marginLeft: 10}}
                /> : null}
                <div className={styles.saveBtnBox}><Button type="primary" onClick={this.handleSave.bind(this, {item: 0})}>保存</Button></div>
              </TabPane>
              <TabPane tab="入口二" key="2">
                <div className={styles.enTryName}>
                  <span>&lowast;入口名称</span>
                  {jumpList.length ? <Input
                    name="entry1"
                    ref="entryinput1"
                    placeholder="请输入名称（限制4个字）"
                    defaultValue={jumpList[1].busiName}
                    autoComplete="off"
                    onChange={this.combineInputChange}
                    maxLength={4}
                    style={{width: 500, marginLeft: 10}}
                  /> : null}
                </div>
                <div className={styles.enTryIcon}>
                  <span>&lowast;入口图标</span>
                  {entry1Icon ? <Avatar size={64} className={styles.entryImg} style={{marginLeft: 18}} src={entry1Icon}/> : null}
                  <Upload
                    action={urls.bannerUpload}
                    onChange={(e) => this.handleChangeImg(e, 1)}
                    beforeUpload={this.beforeUploadImg}
                    showUploadList={false}
                  >
                    <Button type="primary" size="small" style={{marginLeft: 10}}>上传图片</Button>
                  </Upload>
                </div>
                <span>&lowast;跳转链接</span>
                {jumpList.length ? <Input
                  name="entryLink1"
                  ref="entryurl1"
                  placeholder="请输入链接"
                  defaultValue={jumpList[1].jumpUrl}
                  autoComplete="off"
                  onChange={this.combineLinkInputChange}
                  style={{width: 500, marginLeft: 10}}
                /> : null}
                <div className={styles.saveBtnBox}><Button type="primary" onClick={this.handleSave.bind(this, {item: 1})}>保存</Button></div>
              </TabPane>
              <TabPane tab="入口三" key="3">
                <div className={styles.enTryName}>
                  <span>&lowast;入口名称</span>
                  {jumpList.length ? <Input
                    name="entry2"
                    ref="entryinput2"
                    placeholder="请输入名称（限制4个字）"
                    autoComplete="off"
                    defaultValue={jumpList[2].busiName}
                    onChange={this.combineInputChange}
                    maxLength={4}
                    style={{width: 500, marginLeft: 10}}
                  /> : null}
                </div>
                <div className={styles.enTryIcon}>
                  <span>&lowast;入口图标</span>
                  {entry2Icon ? <Avatar size={64} className={styles.entryImg} style={{marginLeft: 18}} src={entry2Icon}/> : null}
                  <Upload
                    action={urls.bannerUpload}
                    onChange={(e) => this.handleChangeImg(e, 2)}
                    beforeUpload={this.beforeUploadImg}
                    showUploadList={false}
                  >
                    <Button type="primary" size="small" style={{marginLeft: 10}}>上传图片</Button>
                  </Upload>
                </div>
                <span>&lowast;跳转链接</span>
                {jumpList.length ? <Input
                  name="entryLink2"
                  ref="entryurl2"
                  placeholder="请输入链接"
                  defaultValue={jumpList[2].jumpUrl}
                  autoComplete="off"
                  onChange={this.combineLinkInputChange}
                  style={{width: 500, marginLeft: 10}}
                /> : null}
                <div className={styles.saveBtnBox}><Button type="primary" onClick={this.handleSave.bind(this, {item: 2})}>保存</Button></div>
              </TabPane>
              <TabPane tab="入口四" key="4">
                <div className={styles.enTryName}>
                  <span>&lowast;入口名称</span>
                  {jumpList.length ? <Input
                    name="entry3"
                    ref="entryinput3"
                    placeholder="请输入名称（限制4个字）"
                    autoComplete="off"
                    defaultValue={jumpList[3].busiName}
                    onChange={this.combineInputChange}
                    maxLength={4}
                    style={{width: 500, marginLeft: 10}}
                  /> : null}
                </div>
                <div className={styles.enTryIcon}>
                  <span>&lowast;入口图标</span>
                  {entry3Icon ? <Avatar size={64} className={styles.entryImg} style={{marginLeft: 18}} src={entry3Icon}/> : null}
                  <Upload
                    action={urls.bannerUpload}
                    onChange={(e) => this.handleChangeImg(e, 3)}
                    beforeUpload={this.beforeUploadImg}
                    showUploadList={false}
                  >
                    <Button type="primary" size="small" style={{marginLeft: 10}}>上传图片</Button>
                  </Upload>
                </div>
                <span>&lowast;跳转链接</span>
                {jumpList.length ? <Input
                  name="entryLink3"
                  ref="entryurl3"
                  placeholder="请输入链接"
                  defaultValue={jumpList[3].jumpUrl}
                  autoComplete="off"
                  onChange={this.combineLinkInputChange}
                  style={{width: 500, marginLeft: 10}}
                /> : null}
                <div className={styles.saveBtnBox}><Button type="primary" onClick={this.handleSave.bind(this, {item: 3})}>保存</Button></div>
              </TabPane>
            </Tabs>
          </div>
          <div className={styles.contentRight}>
            <div className={styles.rHeader}>
            </div>
            <div className={styles.rBusinessNames}>
              <div>
                <Avatar size={64} className={styles.entryImg} src={entry0Img}/>
                {jumpList.length ? <p>&nbsp;{entry0Name}&nbsp;</p> : <p>&nbsp;</p>}
              </div>
              <div>
                <Avatar size={64} className={styles.entryImg} src={entry1Img}/>
                {jumpList.length ? <p>&nbsp;{entry1Name}&nbsp;</p> : <p>&nbsp;</p>}
              </div>
              <div>
                <Avatar size={64} className={styles.entryImg} src={entry2Img}/>
                {jumpList.length ? <p>&nbsp;{entry2Name}&nbsp;</p> : <p>&nbsp;</p>}
              </div>
              <div>
                <Avatar size={64} className={styles.entryImg} src={entry3Img}/>
                {jumpList.length ? <p>&nbsp;{entry3Name}&nbsp;</p> : <p>&nbsp;</p>}
              </div>
            </div>
            <div className={styles.rTEST1}></div><div className={styles.rTEST2}></div><div className={styles.rTEST3}></div>
          </div>
        </div>
        <div className={styles.bottom}>
          <Button type="primary" onClick={this.hanldCommit}>提交</Button>
          <Link to={{ pathname: '/stationJump' }}><Button type="primary" style={{marginLeft: 10}}>返回</Button></Link>
        </div>
      </div>
    )
  }
}

export default ConfigEntryEdit
