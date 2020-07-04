import React, { Component } from 'react'
import styles from './add.less'
import { Input, Tabs, Button, Upload, message, Avatar } from 'antd'
import { Link } from 'react-router-dom'
import axios from '@src/utils/axios'
import urls from '@src/config'
import DeptTreeSelect from '@src/components/DeptTreeSelect'
const { TabPane } = Tabs

class ConfigEntryAdd extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      imageUrl: '',
      combineName: '',
      orgIdList: [],
      editData: null,
      jumpList: [], // 跳转列表
      tempEntry0Name: '',
      tempEntry1Name: '',
      tempEntry2Name: '',
      tempEntry3Name: '',
      tempEntry0Url: '',
      tempEntry1Url: '',
      tempEntry2Url: '',
      tempEntry3Url: '',
      tempImg0: '', // 入口图片
      tempImg1: '',
      tempImg2: '',
      tempImg3: ''
    }
  }
  // 根据新增态或者编辑态判断默认值
  componentDidMount () {
    if (this.props.location.query === undefined) {
      this.props.history.push('/stationJump')
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
      this.setState({
        combineName: resData.busiJump.busiRemark,
        jumpList: resData.busiJump.jumpList
      })
    })
  }
  // 入口名称输入框变更事件
  combineInputChange = (e) => {
    if (e.target.name === 'entry0') {
      this.setState({
        tempEntry0Name: e.target.value
      })
    } else if (e.target.name === 'entry1') {
      this.setState({
        tempEntry1Name: e.target.value
      })
    } else if (e.target.name === 'entry2') {
      this.setState({
        tempEntry2Name: e.target.value
      })
    } else if (e.target.name === 'entry3') {
      this.setState({
        tempEntry3Name: e.target.value
      })
    }
  }

  handleTabsChange = (key) => {}
  // 机构下拉框change事件
  onChangeOrg = (value) => {
    this.setState({
      orgIdList: value,
      treeValue: value
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
   // 保存事件
   handleSave=(data) => {
     if (data.item === 0) {
       const { tempEntry0Name, tempEntry0Url, tempImg0 } = this.state
       if (tempEntry0Name === '') {
         message.warn('入口名称不能为空')
         return
       }
       if (tempImg0 === '') {
         message.warn('入口图片不能为空')
         return
       }
       if (tempEntry0Url === '') {
         message.warn('入口链接不能为空')
         return
       }
       this.setState({
         entry0Name: tempEntry0Name,
         entry0Url: tempEntry0Url,
         banner0Img: tempImg0
       })
     } else if (data.item === 1) {
       const { tempEntry1Name, tempEntry1Url, tempImg1 } = this.state
       if (!this.state.entry0Name) {
         message.warn('请按入口顺序保存')
         return
       }
       if (tempEntry1Name === '') {
         message.warn('入口名称不能为空')
         return
       }
       if (tempImg1 === '') {
         message.warn('入口图片不能为空')
         return
       }
       if (tempEntry1Url === '') {
         message.warn('入口链接不能为空')
         return
       }
       this.setState({
         entry1Name: tempEntry1Name,
         entry1Url: tempEntry1Url,
         banner1Img: tempImg1
       })
     } else if (data.item === 2) {
       const { tempEntry2Name, tempEntry2Url, tempImg2 } = this.state
       if (!this.state.entry1Name) {
         message.warn('请按入口顺序保存')
         return
       }
       if (tempEntry2Name === '') {
         message.warn('入口名称不能为空')
         return
       }
       if (tempImg2 === '') {
         message.warn('入口图片不能为空')
         return
       }
       if (tempEntry2Url === '') {
         message.warn('入口链接不能为空')
         return
       }
       this.setState({
         entry2Name: tempEntry2Name,
         entry2Url: tempEntry2Url,
         banner2Img: tempImg2
       })
     } else if (data.item === 3) {
       const { tempEntry3Name, tempEntry3Url, tempImg3 } = this.state
       if (!this.state.entry2Name) {
         message.warn('请按入口顺序保存')
         return
       }
       if (tempEntry3Name === '') {
         message.warn('入口名称不能为空')
         return
       }
       if (tempImg3 === '') {
         message.warn('入口图片不能为空')
         return
       }
       if (tempEntry3Url === '') {
         message.warn('入口链接不能为空')
         return
       }
       this.setState({
         entry3Name: tempEntry3Name,
         entry3Url: tempEntry3Url,
         banner3Img: tempImg3
       })
     }
     message.success('保存成功')
   }
  // 提交事件
  hanldCommit = () => {
    const {combineName, orgIdList, entry0Name, entry1Name, entry2Name, entry3Name,
      entry0Url, entry1Url, entry2Url, entry3Url, banner0Img, banner1Img, banner2Img, banner3Img
    } = this.state
    if (combineName === '') {
      message.warn('组合名称不能为空')
      return
    }
    if (!orgIdList.length) {
      message.warn('配置机构不能为空')
      return
    }
    const jumpList = [
      {busiName: entry0Name, busiIcon: banner0Img, jumpUrl: entry0Url},
      {busiName: entry1Name, busiIcon: banner1Img, jumpUrl: entry1Url},
      {busiName: entry2Name, busiIcon: banner2Img, jumpUrl: entry2Url},
      {busiName: entry3Name, busiIcon: banner3Img, jumpUrl: entry3Url}
    ]
    if (jumpList[0].busiName === undefined || jumpList[0].busiName === '') {
      message.warn('至少有一个入口')
      return
    }
    axios.post(urls.commitBusinessConfig, {
      busiRemark: combineName,
      jumpList,
      deptIdList: orgIdList
    }, {headers: {'Content-Type': 'application/json'}}).then(res => {
      if (res.ret === 0) {
        message.success('成功')
        setTimeout(() => {
          this.props.history.push('/stationJump')
        }, 1000)
      } else {
        message.error(res.retmsg)
      }
    })
  }
  // 图片上传
  handleChangeImg = (info, type) => {
    if (type === 0) {
      if (info.file.status === 'done') {
        const tempImg0 = info.file['response']['retdata']['filePaths'][0]
        this.setState({ tempImg0 })
        message.success('上传图片成功')
      }
    } else if (type === 1) {
      if (info.file.status === 'done') {
        const tempImg1 = info.file['response']['retdata']['filePaths'][0]
        this.setState({ tempImg1 })
        message.success('上传图片成功')
      }
    } else if (type === 2) {
      if (info.file.status === 'done') {
        const tempImg2 = info.file['response']['retdata']['filePaths'][0]
        this.setState({ tempImg2 })
        message.success('上传图片成功')
      }
    } else if (type === 3) {
      if (info.file.status === 'done') {
        const tempImg3 = info.file['response']['retdata']['filePaths'][0]
        this.setState({ tempImg3 })
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
    return true
  }

  render () {
    const { banner0Img, banner1Img, banner2Img, banner3Img, tempImg0, tempImg1, tempImg2, tempImg3,
      entry0Name, entry1Name, entry2Name, entry3Name, treeValue = []
    } = this.state
    return (
      <div className={styles.entryContainer}>
        <div className={styles.title}>
          <p>业务配置/新增</p>
        </div>
        <div className={styles.header}>
          <p className={styles.intro}>管理人员可为客户经理小站配置不同业务跳转入口</p>
          <div className={styles.headerContainer}>
            <div className={styles.conbineName}>
              <span>&lowast;组合名称</span>
              <Input
                placeholder="请输入组合名称"
                maxLength={12}
                onChange={this.combineNameInputChange}
                style={{width: 300, marginLeft: 10}}
              />
            </div>
            <div className={styles.orgConfig}>
              <span>&lowast;选择配置机构</span>
              <DeptTreeSelect value={treeValue} style={{width: 300, marginLeft: 10}} onChange={this.onChangeOrg}/>
            </div>
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.contentLeft}>
            <Tabs defaultActiveKey="1" onChange={this.handleTabsChange}>
              <TabPane tab="入口一" key="1">
                <div className={styles.enTryName}>
                  <span>&lowast;入口名称</span>
                  <Input
                    name="entry0"
                    placeholder="请输入名称（限制4个字）"
                    maxLength={4}
                    autoComplete="off"
                    onChange={this.combineInputChange}
                    style={{width: 500, marginLeft: 10}}
                  />
                </div>
                <div className={styles.enTryIcon}>
                  <span>&lowast;入口图标</span>
                  {tempImg0 ? <Avatar size={64} className={styles.entryImg} style={{marginLeft: 18}} src={tempImg0}/> : null}
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
                <Input
                  name="entryLink0"
                  autoComplete="off"
                  placeholder="请输入链接"
                  onChange={this.combineLinkInputChange}
                  style={{width: 500, marginLeft: 10}}
                />
                <div className={styles.saveBtnBox}><Button type="primary" onClick={this.handleSave.bind(this, {item: 0})}>保存</Button></div>
              </TabPane>
              <TabPane tab="入口二" key="2">
                <div className={styles.enTryName}>
                  <span>&lowast;入口名称</span>
                  <Input
                    name="entry1"
                    autoComplete="off"
                    placeholder="请输入名称（限制4个字）"
                    maxLength={4}
                    onChange={this.combineInputChange}
                    style={{width: 500, marginLeft: 10}}
                  />
                </div>
                <div className={styles.enTryIcon}>
                  <span>&lowast;入口图标</span>
                  {tempImg1 ? <Avatar size={64} className={styles.entryImg} style={{marginLeft: 18}} src={tempImg1}/> : null}
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
                <Input
                  name="entryLink1"
                  autoComplete="off"
                  placeholder="请输入链接"
                  onChange={this.combineLinkInputChange}
                  style={{width: 500, marginLeft: 10}}
                />
                <div className={styles.saveBtnBox}><Button type="primary" onClick={this.handleSave.bind(this, {item: 1})}>保存</Button></div>
              </TabPane>
              <TabPane tab="入口三" key="3">
                <div className={styles.enTryName}>
                  <span>&lowast;入口名称</span>
                  <Input
                    name="entry2"
                    placeholder="请输入名称（限制4个字）"
                    maxLength={4}
                    autoComplete="off"
                    onChange={this.combineInputChange}
                    style={{width: 500, marginLeft: 10}}
                  />
                </div>
                <div className={styles.enTryIcon}>
                  <span>&lowast;入口图标</span>
                  {tempImg2 ? <Avatar size={64} className={styles.entryImg} style={{marginLeft: 18}} src={tempImg2}/> : null}
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
                <Input
                  name="entryLink2"
                  placeholder="请输入链接"
                  autoComplete="off"
                  onChange={this.combineLinkInputChange}
                  style={{width: 500, marginLeft: 10}}
                />
                <div className={styles.saveBtnBox}><Button type="primary" onClick={this.handleSave.bind(this, {item: 2})}>保存</Button></div>
              </TabPane>
              <TabPane tab="入口四" key="4">
                <div className={styles.enTryName}>
                  <span>&lowast;入口名称</span>
                  <Input
                    name="entry3"
                    placeholder="请输入名称（限制4个字）"
                    maxLength={4}
                    autoComplete="off"
                    onChange={this.combineInputChange}
                    style={{width: 500, marginLeft: 10}}
                  />
                </div>
                <div className={styles.enTryIcon}>
                  <span>&lowast;入口图标</span>
                  {tempImg3 ? <Avatar size={64} className={styles.entryImg} style={{marginLeft: 18}} src={tempImg3}/> : null}
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
                <Input
                  name="entryLink3"
                  placeholder="请输入链接"
                  autoComplete="off"
                  onChange={this.combineLinkInputChange}
                  style={{width: 500, marginLeft: 10}}
                />
                <div className={styles.saveBtnBox}><Button type="primary" onClick={this.handleSave.bind(this, {item: 3})}>保存</Button></div>
              </TabPane>
            </Tabs>
          </div>
          <div className={styles.contentRight}>
            <div className={styles.rHeader}>

            </div>
            <div className={styles.rBusinessNames}>
              <div>
                <Avatar className={styles.entryImg} size={64} src={banner0Img}/>
                <p>&nbsp;{entry0Name}&nbsp;</p>
              </div>
              <div>
                <Avatar className={styles.entryImg} size={64} src={banner1Img}/>
                <p>&nbsp;{entry1Name}&nbsp;</p>
              </div>
              <div>
                <Avatar className={styles.entryImg} size={64} src={banner2Img}/>
                <p>&nbsp;{entry2Name}&nbsp;</p>
              </div>
              <div>
                <Avatar className={styles.entryImg} size={64} src={banner3Img}/>
                <p>&nbsp;{entry3Name}&nbsp;</p>
              </div>
            </div>
            <div className={styles.rTEST1}></div>
            <div className={styles.rTEST2}></div>
            <div className={styles.rTEST3}></div>
          </div>
        </div>
        <div className={styles.bottom}>
          <Button type="primary" onClick={this.hanldCommit.bind(this)}>提交</Button>
          <Link to={{ pathname: '/stationJump' }}><Button type="primary" style={{marginLeft: 10}}>返回</Button></Link>
        </div>
      </div>
    )
  }
}

export default ConfigEntryAdd
