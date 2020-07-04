import React from 'react'
import BraftEditor from 'braft-editor'
import { message } from 'antd'
import urls from '@src/config' // 上传服务器api
import Preview from './preview'
import 'braft-editor/dist/index.css'
import './index.css'

// props
// initHtml 初始的html
// changEditorHtml 修改html
// reload 需要重载内容，不能一直true
let regScript = /<script.*?>.*?<\/script>/gi // 匹配出去scrip标签
// 禁止浏览器后退
function banBackSpace(e) {
  var ev = e || window.event
  var obj = ev.relatedTarget || ev.srcElement || ev.target || ev.currentTarget
  if (ev.keyCode === 8) {
    var tagName = obj.nodeName
    if (tagName !== 'INPUT' && tagName !== 'TEXTAREA') {
      return stopIt(ev)
    }
    var tagType = obj.type.toUpperCase()
    if (tagName === 'INPUT' && (tagType !== 'TEXT' && tagType !== 'TEXTAREA' && tagType !== 'PASSWORD')) {
      return stopIt(ev)
    }
    if ((tagName === 'INPUT' || tagName === 'TEXTAREA') && (obj.readOnly === true || obj.disabled === true)) {
      return stopIt(ev)
    }
  }
}
// 禁止浏览器后退
function stopIt(ev) {
  if (ev.preventDefault) {
    ev.preventDefault()
  }
  if (ev.returnValue) {
    ev.returnValue = false
  }
  return false
}
export default class Editor extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      editorState: BraftEditor.createEditorState(props.initHtml && props.initHtml.replace(regScript, '')),
      needInitHtml: true // 初始的html渲染
    }
  }

  componentDidMount() {
    // 禁止浏览器后退
    document.onkeydown = banBackSpace
  }

  componentWillUnmount () {
    document.onkeydown = null
    clearTimeout(this.timer)
  }

  handleChange = editorState => {
    this.setState({editorState})
    // 防抖
    clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.props.changEditorHtml(editorState.toHTML())
    }, 100)
  };

  componentWillReceiveProps (next) {
    // 需要重载内容，不能一直true
    if (next.reload) {
      this.state.needInitHtml = true
    }
    // 初始的html渲染
    if (this.state.needInitHtml && next.initHtml) {
      this.state.needInitHtml = false
      this.setState({
        editorState: BraftEditor.createEditorState(next.initHtml && next.initHtml.replace(regScript, ''))
      })
    }
  }

  // 上传函数
 myUploadFn = param => {
   if (param.file.size > 1024 * 1024 * 10) {
     message.error('上传图片不大于10M')
     return
   }
   const xhr = new window.XMLHttpRequest()
   const fd = new window.FormData()
   let {isProduct} = this.props
   let serverURL = ''// 请求地址
   let fileURL = '' // 返回文件地址
   if (isProduct) { // 是否产品
     serverURL = urls.uploadImg
     fd.append('file', param.file)
     fd.append('bizKey', 'product')
   } else {
     serverURL = urls.newsUpload
     fd.append('image', param.file)
   }

   const successFn = response => {
     // 假设服务端直接返回文件上传后的地址
     // 上传成功后调用param.success并传入上传后的文件地址
     if (isProduct) { // 是否产品
       fileURL = JSON.parse(xhr.responseText).retdata.filePath
     } else {
       fileURL = JSON.parse(xhr.responseText).retdata.filePaths[0]
     }
     param.success({
       url: fileURL,
       meta: {
         // id: 'xxx',
         // title: 'xxx',
         // alt: 'xxx',
         // loop: true, // 指定音视频是否循环播放
         // autoPlay: true, // 指定音视频是否自动播放
         // controls: true, // 指定音视频是否显示控制栏
         // poster: 'http://xxx/xx.png' // 指定视频播放器的封面
       }
     })
   }

   const progressFn = event => {
     // 上传进度发生变化时调用param.progress
     param.progress((event.loaded / event.total) * 100)
   }

   const errorFn = response => {
     // 上传发生错误时调用param.error
     param.error({
       msg: 'unable to upload.'
     })
   }

   xhr.upload.addEventListener('progress', progressFn, false)
   xhr.addEventListener('load', successFn, false)
   xhr.addEventListener('error', errorFn, false)
   xhr.addEventListener('abort', errorFn, false)

   xhr.open('POST', serverURL, true)
   xhr.send(fd)
 }

 render () {
   let { editorState } = this.state
   const extendControls = [
     {
       key: 'Preview',
       type: 'component',
       component: <Preview editorState={editorState} />
     }
   ]
   const hooks = {
     'insert-medias': arr => {
       let newArr = arr.map(item => {
         return {...item, width: '100%'}
       })
       return newArr
     }
   }
   return (
     <BraftEditor
       value={editorState}
       onChange={this.handleChange}
       extendControls={extendControls}
       media={{ uploadFn: this.myUploadFn,
         pasteImage: false,
         externals: {
           image: true,
           audio: false,
           video: false,
           embed: false
         }}}
       hooks={hooks}
     />
   )
 }
}
