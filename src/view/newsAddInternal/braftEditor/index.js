import 'braft-editor/dist/index.css'
import React from 'react'
import BraftEditor from 'braft-editor'
import { message } from 'antd'
import urls from '@src/config'
import { ContentUtils } from 'braft-utils'
import './index.less'

export default class Editor extends React.Component {
  constructor (props, context) {
    super(props)
    this.state = {
      editorState: BraftEditor.createEditorState(null)
    }
  }

  componentDidMount () {
    this.setState({ editorState: BraftEditor.createEditorState(this.props.initHtml) })
  }

  // 是否清空编辑器
  componentWillReceiveProps (next) {
    if (next.initHtml !== this.initHtml) {
      if (this.initHtml) return
      this.initHtml = next.initHtml
      this.setState({ editorState: BraftEditor.createEditorState(next.initHtml) })
    }
  }

  handleChange = (editorState) => {
    this.setState({ editorState }, () => {
      if (this.initHtml) {
        this.props.onChange(editorState.toHTML())
      }
    })
  }

  uploadFuc = (param) => {
    const serverURL = urls.newsUpload
    const xhr = new window.XMLHttpRequest()
    const fd = new window.FormData()

    const successFn = (response) => {
      // 假设服务端直接返回文件上传后的地址
      // 上传成功后调用param.success并传入上传后的文件地址
      param.success({
        url: JSON.parse(xhr.responseText).retdata.filePaths[0],
        meta: {
          // loop: true, // 指定音视频是否循环播放
          // autoPlay: true, // 指定音视频是否自动播放
          // controls: true, // 指定音视频是否显示控制栏
          // poster: 'http://xxx/xx.png', // 指定视频播放器的封面
        }
      })
    }

    const progressFn = (event) => {
      // 上传进度发生变化时调用param.progress
      param.progress(event.loaded / event.total * 100)
    }

    const errorFn = (response) => {
      // 上传发生错误时调用param.error
      param.error({
        msg: 'unable to upload.'
      })
      message.error('上传失败')
    }

    xhr.upload.addEventListener('progress', progressFn, false)
    xhr.addEventListener('load', successFn, false)
    xhr.addEventListener('error', errorFn, false)
    xhr.addEventListener('abort', errorFn, false)

    fd.append('file', param.file)
    fd.append('bizKey', 'product')
    xhr.open('POST', serverURL, true)
    xhr.send(fd)
  }

  validateFuc = (file) => {
    // 不允许添加尺寸大于2M的文件
    // if (file.size > 1024 * 10) {
    //   message.error('上传文件超过2M')
    //   return false
    // }
    return true
  }

  render () {
    const { editorState } = this.state
    const controls = [
      'separator', 'font-size', 'line-height', 'letter-spacing', 'separator', 'text-color', 'bold', 'italic', 'underline', 'strike-through', 'separator',
      'emoji', 'separator', 'text-indent', 'text-align', 'separator', 'list-ul', 'list-ol', 'separator', 'separator', 'hr', 'separator', 'link',
      'media', 'separator', 'clear'
    ]
    const extendControls = [
      {
        key: 'custom-modal',
        type: 'modal',
        text: '预览',
        modal: {
          id: 'my-moda-1',
          title: '预览（实际样式以小程序为准）',
          showFooter: false, // 指定是否显示弹窗组件底栏
          showCancel: false, // 指定是否显示取消按钮
          children: (
            <div style={{width: '80vw', padding: '0 10px'}}>
              <div dangerouslySetInnerHTML={{__html: editorState.toHTML()}} style={{padding: '0 10px', minHeight: '100px', maxHeight: '80vh'}} className='bf-content-box'></div>
            </div>
          )
        }
      }
    ]

    return (
      <div className="editor-wrapper">
        <BraftEditor
          value={editorState}
          imageControls={['align-left', 'align-center', 'align-right', 'link', 'size', 'remove']}
          onChange={this.handleChange}
          controls={controls}
          media={{
            uploadFn: this.uploadFuc,
            validateFn: this.validateFuc,
            accepts: {
              image: 'image/png, image/jpeg, image/gif',
              video: false,
              audio: false
            },
            externals: {
              image: true,
              video: false,
              audio: false,
              embed: false
            },
            pasteImage: true
          }}
          extendControls={extendControls}
          contentStyle={{height: 500}}
        />
      </div>
    )
  }
}
