import React, { Component } from 'react'
import styles from './index.less'
import { Upload, message, Button, Tabs, Avatar, Input } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import Tools from '@src/utils'
const { TabPane } = Tabs
const { TextArea } = Input
// 外观配置
class StyleConfig extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      shareDocValue: '', // 分享文案描述
      shareAbstractValue: '', // 分享摘要
      color: '#1890ff',
      changedColor: '#1890ff',
      defaultImg: '', // 图标
      flag: false,
      tabKey: '1'
    }
  }

  componentDidMount () {
    this.getShareInfo()
    this.getColorInfo()
  }
  // 获取颜色信息
  getColorInfo=() => {
    axios.post(urls.getColorInfo, {}, {headers: {'Content-Type': 'application/json'}}).then((res) => {
      if (res.ret !== 0) {
        message.error(res.retmsg)
        return
      }
      const mColor = (res.retdata && res.retdata.customizeBgcolor && res.retdata.customizeBgcolor.mainBgColor) ? res.retdata.customizeBgcolor.mainBgColor : '#1890ff'
      this.setState({color: mColor, changedColor: mColor})
    })
  }
  // 获取分享信息
  getShareInfo = () => {
    axios.post(urls.getShareData, {}, {headers: {'Content-Type': 'application/json'}}).then((res) => {
      if (res.ret !== 0) {
        message.success(res.retmsg)
        return
      }
      const defaultShareInfo = res.retdata.customizeShare
      this.setState({
        shareDocValue: defaultShareInfo.shareTitle || '',
        shareAbstractValue: defaultShareInfo.shareSummary || '',
        defaultImg: defaultShareInfo.shareIcon || ''
      })
    })
  }

  callback = (key) => {
    this.setState({tabKey: key})
  }
  // 分享文案描述
  onShareDocChange = ({ target: { value } }) => {
    this.setState({
      shareDocValue: value
    })
  }
  // 摘要描述
  onShareAbstractChange = ({ target: { value } }) => {
    this.setState({
      shareAbstractValue: value
    })
  }
  // 更换事件
  changeColor=(e) => {
    this.setState({
      changedColor: e.target.value
    })
  }
  // 预览事件
  colorChange=() => {
    const {changedColor} = this.state
    let colorValue = this.refs.colorInput.state.value
    if (colorValue === undefined || colorValue === '') {
      message.warn('请输入色号')
      return
    }
    var validateColor = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.test(changedColor)
    if (!validateColor) {
      message.warn('色号输入不合法')
      return
    }
    message.success('预览成功')
    this.setState({
      color: changedColor,
      flag: true
    })
  }
// 颜色配置保存
hanldStyleConfigSave = () => {
  const isRight = Tools.checkButtonRight(this.props.location.pathname, 'stationCustomizeEdit')
  if (!isRight) return
  const {color, flag} = this.state
  if (!flag) {
    message.warn('请输入正确的色号并预览成功')
    return
  }
  axios.post(urls.updateColor, {mainBgColor: color}, {headers: {'Content-Type': 'application/json'}}).then((res) => {
    if (res.ret !== 0) {
      message.error(res.retmsg)
      return
    }
    message.success('保存成功')
  })
}
// 分享配置保存
hanldShareConfigSave = () => {
  const isRight = Tools.checkButtonRight(this.props.location.pathname, 'stationCustomizeShare')
  if (!isRight) return
  const {shareDocValue, shareAbstractValue, defaultImg} = this.state
  if (shareDocValue === '') {
    message.warn('文案描述不能为空')
    return
  }
  if (shareAbstractValue === '') {
    message.warn('摘要不能为空')
    return
  }
  axios.post(urls.updateShareConfig, {shareTitle: shareDocValue, shareSummary: shareAbstractValue, shareIcon: defaultImg}, {headers: {'Content-Type': 'application/json'}}).then((res) => {
    if (res.ret !== 0) {
      message.warn(res.retmsg)
      return
    }
    message.success('保存成功')
  })
}
  // 图片上传
  handleChangeImg = (info) => {
    if (info.file.status === 'done') {
      if (info.file['response'].ret === 0) {
        const tempImg = info.file['response']['retdata']['filePaths'][0]
        this.setState({ defaultImg: tempImg })
        message.success('上传图片成功')
      } else {
        message.error(info.file['response'].retmsg)
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
   const {shareDocValue, shareAbstractValue, color, defaultImg, tabKey} = this.state
   const des = tabKey === '1' ? '管理员可自定义配置小程序皮肤' : '管理员可自定义配置小站分享介绍语'
   return (
     <div className={styles.styleConfitContainer}>
       <div className={styles.header}>
         <p>外观配置</p>
         <p className={styles.introduce}>{des}</p>
       </div>
       <div className={styles.content}>
         <Tabs defaultActiveKey="1" onChange={this.callback}>
           <TabPane tab="背景色配置" key="1">
             <div className={styles.bgColorCofig}>
               <div className={styles.colorContent}>
                 <span>&lowast;请输入色号</span>
                 <Input ref="colorInput" placeholder="#F0F0F0" onChange={this.changeColor} maxLength={7} style={{width: 200, marginLeft: 6}}/>
                 <Button onClick={this.colorChange} style={{marginLeft: 6}}>预览</Button>
                 <div className={styles.preViewColor} style={{backgroundColor: color}}></div>
               </div>
               <p>官方标准色号：#3078DB</p>
               <div className={styles.buttonContent}>
                 <div className={styles.buttons}>
                   <Button type="primary" style={{marginLeft: 100}} onClick={this.hanldStyleConfigSave}>保存</Button>
                 </div>
               </div>
             </div>
           </TabPane>
           <TabPane tab="分享配置" key="2">
             <div className={styles.shareConfig}>
               <div className={styles.shareConfigLeft}>
                 <p>客户经理将小站分享至客户展示的默认数据配置</p>
                 <div className={styles.shareDocContainer}>
                   <span>&lowast;分享文案描述</span>
                   <TextArea
                     style={{width: '80%'}}
                     maxLength={30}
                     value={shareDocValue}
                     onChange={this.onShareDocChange}
                     placeholder={shareDocValue}
                     autoSize={{ minRows: 3, maxRows: 5 }}
                   />
                 </div>
                 <div className={styles.summaryContainer}>
                   <span>&lowast;摘要描述</span>
                   <TextArea
                     style={{width: '80%', marginLeft: 32, marginTop: 8}}
                     value={shareAbstractValue}
                     maxLength={30}
                     onChange={this.onShareAbstractChange}
                     placeholder={shareAbstractValue}
                     autoSize={{ minRows: 3, maxRows: 5 }}
                   />
                 </div>
                 <div className={styles.imgContainer}>
                   <span style={{marginLeft: 50, marginRight: 4}}>图标</span>
                   {defaultImg ? <Avatar size={64} src={defaultImg} className={styles.entryImg} style={{marginLeft: 2}}/> : <Avatar size={64} src=""/>}
                   <Upload
                     action={urls.bannerUpload}
                     onChange={this.handleChangeImg}
                     beforeUpload={this.beforeUploadImg}
                     showUploadList={false}
                   >
                     <Button type="primary" size="small" style={{marginLeft: 10}}>上传图片</Button>
                   </Upload>
                 </div>
                 <div className={styles.leftBottom}>
                   <Button type="primary" onClick={this.hanldShareConfigSave}>保存</Button>
                 </div>
               </div>
               <div className={styles.shareConfigRight}>
                 <p className={styles.exampleText}>示例框</p>
                 <div style={{background: '#d0d0d0', overflow: 'hidden', width: '70%', position: 'relative'}}>
                   <div className={styles.exampleLeft}>
                     <p className={styles.introduceDoc}><span></span>{shareDocValue}</p>
                     <p className={styles.abstract}><span></span>{shareAbstractValue}</p>
                   </div>
                   <div className={styles.exampleRight}>
                     {defaultImg ? <Avatar size={64} className={styles.entryImg} src={defaultImg}/> : <Avatar size={64} src=""/>}
                   </div>
                 </div>
               </div>
             </div>
           </TabPane>
         </Tabs>
       </div>
     </div>
   )
 }
}

export default StyleConfig
