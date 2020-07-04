import React, { Component } from 'react'
import { message } from 'antd'
import { EditorState, convertToRaw, ContentState } from 'draft-js'
import { Editor } from 'cz-react-draft-wysiwyg'
import draftToHtml from 'cz-draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import './index.less'
import axios from '@src/utils/axios'
import urls from '@src/config'
import Preview from './preview'

// props
// initHtml 初始Html
// this.props.onChange(editorHtml)
// empty true false 清空编辑器
// this.props.resizeEmpty() 清空编辑器后的回调
export default class newsEditor extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      editorState: EditorState.createEmpty(),
      lastEditorState: EditorState.createEmpty(),
      editorHtml: ''
    }
    this.initHtml = null
  }

  // 初始化编辑器
  componentDidMount () {
    this.resetEditorState()
  }

  resetEditorState = () => {
    const contentBlock = htmlToDraft(this.props.initHtml || '')
    if (contentBlock) {
      this.setState({
        editorState: EditorState.createWithContent(ContentState.createFromBlockArray(contentBlock.contentBlocks))
      })
    }
  }
  // 是否清空编辑器
  componentWillReceiveProps (next) {
    if (next.empty) {
      this.setState({ editorState: EditorState.createEmpty() })
      this.props.resizeEmpty()
    } else {
      if (this.initHtml && !next.isUpdateDescFromService) return
      this.initHtml = next.initHtml || ''
      this.initHtml = this.initHtml.replace(/<\/figure>/g, '')
      this.initHtml = this.initHtml.replace(/<figure.*>/g, '')
      const contentBlock = htmlToDraft(this.initHtml || '')
      if (contentBlock) {
        this.setState({
          editorState: EditorState.createWithContent(ContentState.createFromBlockArray(contentBlock.contentBlocks))
        })
      }
    }
  }
  // 复制文章出错
  componentDidCatch (error, errorInfo) {
    console.log(error, errorInfo)
    message.warning('复制的文章格式错误')
    this.setState({ editorState: this.state.lastEditorState })
  }
  // 输入
  onEditorStateChange = (editorState) => {
    const editorHtml = draftToHtml(convertToRaw(editorState.getCurrentContent()))
    this.setState({ lastEditorState: this.state.editorState }, () => {
      this.setState({
        editorState,
        editorHtml
      })
    })
    this.props.onChange(editorHtml)
  }
  // 上传图片
  uploadImageCallBack = (file) => {
    const data = new window.FormData()
    data.append('image', file)
    // 上传文件进入axios请求拦截器后 不做contentType转换
    // 自动Content-Type: multipart/form-data; boundary=----xx
    return axios.post(urls.newsUpload, data).then(res => {
      return {
        data: { link: res.retdata.filePaths[0] }
      }
    })
  }
  // 上传图片2
  uploadImageCallBack2 = (file) => {
    const data = new window.FormData()
    data.append('file', file)
    data.append('bizKey', 'product')
    // 上传文件进入axios请求拦截器后 不做contentType转换
    // 自动Content-Type: multipart/form-data; boundary=----xx
    return axios.post(urls.uploadImg, data, {headers: {'Content-Type': 'multipart/form-data'}}).then(res => {
      return {
        data: { link: res.retdata.filePath }
      }
    })
  }

  render () {
    const { editorState, editorHtml } = this.state
    return (
      <div>
        <Editor
          editorState={editorState}
          wrapperClassName="newsEditWrapper"
          editorClassName="newsEditor"
          onEditorStateChange={this.onEditorStateChange}
          localization={{ locale: 'zh' }}
          toolbar={{
            options: ['inline', 'colorPicker', 'link', 'emoji', 'image', 'blockType', 'fontSize', 'list', 'textAlign', 'remove', 'history'],
            image: {
              uploadCallback: this.props.isProduct ? this.uploadImageCallBack2 : this.uploadImageCallBack,
              previewImage: true,
              urlEnabled: true,
              alignmentEnabled: true,
              alt: { present: true },
              defaultSize: {
                height: '100%',
                width: '100%'
              }
            }
          }}
          toolbarCustomButtons={[<Preview editorHtml={editorHtml || this.props.initHtml}/>]}
        />
        {/* 显示html */}
        {/* <textarea
          className="newsEditorTextArea"
          disabled
          value={draftToHtml(convertToRaw(editorState.getCurrentContent()))}
        /> */}
        {/* 显示innerHTML */}
        {/* <div dangerouslySetInnerHTML={{__html: editorHtml}}></div> */}
      </div>
    )
  }
}
