import React, { Component } from 'react'
import {
  Button,
  Form,
  Input,
  Switch,
  Tooltip,
  Radio,
  Tag,
  message,
  Modal,
  Spin,
  Icon,
  PageHeader
} from 'antd'
import styles from './index.less'
import axios from '@src/utils/axios'
import urls from '@src/config'
import '@src/style/weixin.css'
import BraftEditor from '@src/components/braftEditor'
import NewsContentTag from './newsContentTag'
import { connect } from 'react-redux'
import { Link, withRouter } from 'react-router-dom'
import UploadDragger from './uploadDragger'
import UploadDragger2 from './uploadDragger2'
import utils from '@src/utils'
import PageHeaderHoc from '@src/components/PageHeaderHoc'
@withRouter
class NewsAddInternal extends Component {
  constructor (props, context) {
    super(props)
    this.newId = utils.getUrlQueryString(props.location.search, 'newId')
    this.state = {
      addType: 0,
      // 填写要绑定的公众号 比如 '中国光大银行,光大银行信用卡,深圳生活'
      publicAddressNames: '',
      // 已绑定的公众号
      publicAddress: [],
      newsUrl: '',
      mustSend: false,
      checkedTags: [],
      title: '',
      editorHtml: '',
      isEmptyEditor: false,
      isAdding: false,
      // 内容标签组件
      mode: true,
      type: '',
      tag: [],
      inputTip: '',
      // 描述上传文件预览图
      htmlFromService: '',
      // 文章来源
      articleType: 0,
      // 封面图片文件预览
      previewImgFileList: [],
      // 来自编辑
      isEdit: !!this.newId,
      // 文章内容 /编辑
      content: null,
      txt: null,
      isLoading: !!this.newId,
      isFinishedUploadNoWXArticle: false,
      isFinishedUploadLocalArticle: false,
      cover: null,
      summary: '',
      originalCreator: ''
    }
  }
  componentDidMount () {
    this.getPublicAddress()
    if (this.newId) {
      this.getNewsDetail()
    }
  }

  getNewsDetail = () => {
    // 从编辑进入页面
    this.setState({ addType: 2, mode: true, isEdit: true })
    axios.post(urls.newsDetail, { newsId: this.newId }).then(res => {
      const { title, content, crawl, txt, cover, mustSend, summary, originalCreator, defaultImg } = res.retdata
      this.setState({
        title,
        content,
        crawl,
        txt,
        isLoading: false,
        isEmptyEditor: false,
        editorHtml: !crawl ? txt : content[0].content,
        cover,
        mustSend: mustSend === 1,
        summary: summary || '',
        originalCreator: originalCreator || '',
        previewImgFileList: defaultImg ? [defaultImg] : []
      })
    })
  }
  // 查询已绑定的公众号
  getPublicAddress = () => {
    return axios.post(urls.newsInformationList).then(res => {
      this.setState({
        publicAddress: res.retdata.newsTaskList,
        inputTip: res.retdata.inputTip
      })
    })
  }
  // 改变添加方式
  onChangeAddType = (ev) => {
    this.setState({ addType: ev.target.value, mode: true })
  }
  // 改变文章来源
  onChangeArticleType = (ev) => {
    this.setState({ articleType: ev.target.value })
  }
  // 填写要绑定的公众号
  onChangePublicAddressNames = (ev) => {
    this.setState({ publicAddressNames: ev.target.value })
  }
  // 删除已绑定公众号
  deletePublicAddress = (ev, tagId) => {
    ev.preventDefault()
    const _this = this
    Modal.confirm({
      title: '确认删除',
      content: '你确认删除此公众号？',
      onOk () {
        axios.post(urls.newsInformationDelete, { newsTaskId: tagId }).then(res => {
          _this.getPublicAddress().then(() => {
            message.success('删除成功')
          })
        })
      },
      onCancel () {}
    })
  }
  // 文章链接
  onChangeNewsUrl = (ev) => {
    this.setState({ newsUrl: ev.target.value })
  }

  // 分享摘要
  onChangeSummary = (e) => {
    this.setState({
      summary: e.target.value
    })
  }

  // 原创信息
  onChangeOriginalInfo = (e) => {
    this.setState({
      originalCreator: e.target.value
    })
  }
  // 是否必发
  onChangeMustSend = (checked) => {
    this.setState({ mustSend: checked })
  }
  // 选择内容标签 方式 类别 标签
  onChangeContentTags = (mode, type, tag) => {
    this.setState({ mode, type, tag })
  }
  // 文章标题
  onChangeTitle = (ev) => {
    this.setState({ title: ev.target.value })
  }
  // 编辑器输入
  onChangeEditor = (editorHtml) => {
    this.setState({ editorHtml })
  }
  // 点击添加按钮
  submitAdd = () => {
    if (this.isLoadingSubmit) return
    this.isLoadingSubmit = true
    const isRight = utils.checkButtonRight(this.props.location.pathname, 'aritcleAdd')
    if (!isRight) {
      this.isLoadingSubmit = false
      return
    }
    const { addType, articleType } = this.state
    if (addType === 0) {
      this.newsInformationCreate()
    } else if (addType === 1) {
      if (articleType === 1) {
        this.nowxnewsCreate()
      } else {
        this.newsPeerCreate()
      }
    } else {
      this.manualAdd()
    }
  }
  // 添加行内公众号
  newsInformationCreate = () => {
    const { publicAddressNames, mode, type, tag } = this.state
    if (!mode && (tag.length > 3)) {
      this.isLoadingSubmit = false
      return message.warning('标签最多只能选择3个')
    }
    const data = {
      autoTag: mode,
      category: type,
      newsTags: tag.join(','),
      publicAddressNames: publicAddressNames
    }
    this.setState({ isAdding: true })
    axios.post(urls.newsInformationCreate, data).then(res => {
      this.getPublicAddress().then(() => {
        message.success('添加成功')
        this.setState({
          publicAddressNames: '',
          mode: true,
          isAdding: false
        })
        this.isLoadingSubmit = false
      })
    }).catch(() => {
      this.isLoadingSubmit = false
      this.setState({ isAdding: false })
    })
  }
  // 添加公众号文章
  newsPeerCreate = () => {
    const {
      mustSend,
      newsUrl,
      mode,
      type,
      summary,
      originalCreator,
      tag,
      previewImgFileList
    } = this.state
    if (!newsUrl.trim()) {
      this.isLoadingSubmit = false
      return message.warning('请填写文章链接')
    }
    if (!mode && (tag.length > 3)) {
      this.isLoadingSubmit = false
      return message.warning('标签最多只能选择3个')
    }
    const objExp = new RegExp(`^((https|http)?://)`)
    if (!objExp.test(newsUrl)) {
      this.isLoadingSubmit = false
      return message.warning('链接地址不正确。')
    }
    if (newsUrl.trim().indexOf('mp.weixin.qq.com') === -1) { // 第三方链接不能输入微信公众号链接
      this.isLoadingSubmit = false
      return message.warning('公众号链接不能为其他来源的链接！')
    }
    const defaultImg = previewImgFileList.join(',')
    const data = {
      mustSend: mustSend ? 1 : 0,
      autoTag: mode,
      category: type,
      newsTags: tag.join(','),
      newsUrl: encodeURIComponent(newsUrl),
      summary,
      defaultImg,
      originalCreator
    }
    this.setState({ isAdding: true })
    axios.post(urls.newsPeerCreate, data).then(res => {
      this.setState({
        newsUrl: '',
        mustSend: false,
        mode: true,
        isAdding: false,
        isFinishedUploadNoWXArticle: true
      })
      message.success('添加成功')
      this.isLoadingSubmit = false
      this.props.history.push('/newsHot')
    }).catch(() => {
      this.isLoadingSubmit = false
      this.setState({ isAdding: false })
    })
  }

  // 添加第三方链接
  nowxnewsCreate = () => {
    const {
      mustSend,
      newsUrl,
      mode,
      type,
      tag,
      title,
      summary,
      originalCreator,
      previewImgFileList
    } = this.state
    if (!previewImgFileList.length) {
      this.isLoadingSubmit = false
      return message.warning('请维护文章封面图片。')
    }
    if (!title) {
      this.isLoadingSubmit = false
      return message.warning('请维护文章标题。')
    }
    if (!newsUrl.trim()) {
      this.isLoadingSubmit = false
      return message.warning('请填写文章链接')
    }
    if (!mode && (tag.length > 3)) {
      this.isLoadingSubmit = false
      return message.warning('标签最多只能选择3个')
    }
    const objExp = new RegExp(`^((https|http)?://)`)
    if (!objExp.test(newsUrl)) {
      this.isLoadingSubmit = false
      return message.warning('链接地址不正确。')
    }
    if (newsUrl.trim().indexOf('mp.weixin.qq.com') !== -1) {
      // 第三方链接不能输入微信公众号链接
      this.isLoadingSubmit = false
      return message.warning('其他来源的链接不能为微信公众号链接！')
    }
    if (!originalCreator) {
      this.isLoadingSubmit = false
      return message.warning('请维护文章原创信息。')
    }
    if (!summary) {
      this.isLoadingSubmit = false
      return message.warning('请维护文章分享摘要。')
    }
    const defaultImg = previewImgFileList.join(',')
    const data = {
      mustSend: mustSend ? 1 : 0,
      category: type,
      newsTags: tag.join(','),
      newsUrl: encodeURIComponent(newsUrl),
      title,
      defaultImg,
      summary,
      originalCreator
    }
    this.setState({ isAdding: true })
    axios.post(urls.nowxnewsCreate, data).then(res => {
      this.setState({
        newsUrl: '',
        mustSend: false,
        mode: true,
        isAdding: false,
        title: '',
        previewImgFileList: [],
        isFinishedUploadNoWXArticle: true
      })
      message.success('添加成功')
      this.isLoadingSubmit = false
      this.props.history.push('/newsHot')
    }).catch(() => {
      this.isLoadingSubmit = false
      this.setState({ isAdding: false })
    })
  }
  // 手动添加
  manualAdd = () => {
    const {
      mustSend,
      mode,
      type,
      tag,
      editorHtml,
      title,
      summary,
      originalCreator,
      previewImgFileList
    } = this.state
    if (!title.trim()) {
      this.isLoadingSubmit = false
      return message.warning('请填写文章标题')
    }
    if (!previewImgFileList.length) {
      this.isLoadingSubmit = false
      return message.warning('请维护文章封面图片。')
    }
    if (!originalCreator) {
      this.isLoadingSubmit = false
      return message.warning('请维护文章原创信息。')
    }
    if (title.length > 30) {
      this.isLoadingSubmit = false
      return message.warning('文章标题最多30个字符')
    }
    if (!editorHtml.trim()) {
      this.isLoadingSubmit = false
      return message.warning('请填写文章')
    }
    if (!mode && (tag.length > 3)) {
      this.isLoadingSubmit = false
      return message.warning('标签最多只能选择3个')
    }
    if (!summary) {
      this.isLoadingSubmit = false
      return message.warning('请维护文章分享摘要。')
    }
    const defaultImg = previewImgFileList.join(',')
    let data = {
      type: 0,
      mustSend: mustSend ? 1 : 0,
      autoTag: mode,
      category: type,
      newsTags: tag.join(','),
      content: editorHtml,
      defaultImg,
      title,
      summary,
      originalCreator
    }
    if (this.newId) {
      data.newsId = this.newId
    }
    this.setState({ isAdding: true })
    axios.post(urls.newsCreate, data).then(() => {
      message.success('添加成功')
      this.isLoadingSubmit = false
      this.props.history.push('/newsHot')
    }).catch(() => {
      this.isLoadingSubmit = false
      this.setState({ isAdding: false })
    })
  }

  updateImgFileList = fileList => {
    this.setState({
      previewImgFileList: fileList,
      isFinishedUploadNoWXArticle: false
    })
  }
  //  本地上传doc/pdt,服务端返回html<string>
  updateDocFileList = htmlFromService => {
    this.setState({
      editorHtml: htmlFromService,
      isFinishedUploadLocalArticle: false
    })
  }

  goback = () => {
    console.log('ssss')
  }

  render () {
    const {
      addType,
      newsUrl,
      mustSend,
      title,
      publicAddress,
      publicAddressNames,
      inputTip,
      mode,
      isEmptyEditor,
      isAdding,
      articleType,
      isEdit,
      isLoading,
      editorHtml,
      isFinishedUploadNoWXArticle,
      isFinishedUploadLocalArticle,
      previewImgFileList,
      summary,
      originalCreator
    } = this.state
    const t1 = <div>
      <p>1.自动：系统会根据文章中高频词出现频率自动打标；例如文章中高频出现“货基、定投、净值”词语，则文章会打上“基金”的标签。</p>
      <p>2.手动：系统会根据所选标签进行打标；若只选择类别，未选择标签，则文章不会被打标签。</p>
      <p>3.每篇文章最多可以打3个标签</p>
    </div>
    const shareImg = previewImgFileList.length
      ? previewImgFileList.join(',')
      : require('@src/assets/h5_share_default.png')
    const isNoWechat = addType === 1 && articleType === 1
    const isWechat = addType === 1 && articleType === 0
    const ownCreate = addType === 2
    const bindAccount = addType === 0
    const createByUrl = addType === 1
    const pageHeaderName = this.newId ? '编辑文章' : '新增文章'
    return (
      <Spin spinning={isLoading}>
        <div className="newsAddInternal">
          {/* <div className={styles.title}>
            新增我行发布
          </div> */}
          <PageHeaderHoc
            onBack={() => this.props.hisitory.goback()}
            subTitle={pageHeaderName}
          />
          <div className={styles.content}>
            <Form>
              <Form.Item label={<span>添加方式</span>} labelCol={{span: 3}} wrapperCol={{span: 18}}>
                <Radio.Group onChange={this.onChangeAddType} value={addType}>
                  <Radio value={0}>绑定行内公众号</Radio>
                  <Radio value={1}>添加第三方链接文章</Radio>
                  <Radio value={2}>手动添加</Radio>
                </Radio.Group>
              </Form.Item>
              {bindAccount && <Form.Item label={<span>已添加公众号</span>} labelCol={{span: 3}} wrapperCol={{span: 18}}>
                {publicAddress.map(obj => {
                  return <Tag color="green" key={obj.id} closable className={styles.myTag}
                    onClose={(ev) => this.deletePublicAddress(ev, obj.id)}>{obj.name}</Tag>
                })}
              </Form.Item>}
              {bindAccount && <Form.Item label={<span>添加行内公众号</span>} labelCol={{span: 3}} wrapperCol={{span: 18}}>
                <Input.TextArea rows={6} onChange={this.onChangePublicAddressNames} value={publicAddressNames}
                  placeholder={inputTip} />
                <p style={{color: '#aaa'}}>
                  绑定公众号后，公众号的内容将自动同步到后台中方便转发。
                  <Link to="/addPublicAddress" target="_blank" replace>如何添加</Link>
                </p>
              </Form.Item>}
              {createByUrl && <Form.Item label={<span>文章来源</span>} labelCol={{span: 3}} wrapperCol={{span: 18}}>
                <Radio.Group onChange={this.onChangeArticleType} value={articleType}>
                  <Radio value={0}>微信公众号</Radio>
                  <Radio value={1}>其他来源</Radio>
                </Radio.Group>
                {isNoWechat && <span style={{color: 'red'}}>（非微信公众号文章，无法在小程序中显示，请注意。）</span>}
              </Form.Item>}

              {createByUrl && <Form.Item label={<span><span style={{color: 'red'}}>*</span>文章链接</span>} labelCol={{span: 3}} wrapperCol={{span: 18}}>
                <Input.TextArea rows={6} onChange={this.onChangeNewsUrl} value={newsUrl}
                  placeholder={'复制文章链接粘贴到此处。'} />
              </Form.Item>}

              {ownCreate && !isEdit && <Form.Item label={<span>本地上传</span>} labelCol={{span: 3}} wrapperCol={{span: 18}}>
                <UploadDragger
                  fileType={'doc'}
                  fileSize={2}
                  wrongRegHint={'只能上传txt、doc、docx格式的文件'}
                  wrongSizeHint={'文件必须2M以内'}
                  placeholder={'支持上传doc、docx、txt格式的文件，大小须在2M内'}
                  uploadAction={urls.fileToHtml}
                  isFinishedUpload={isFinishedUploadLocalArticle}
                  updateFileList={this.updateDocFileList}
                />
              </Form.Item>}

              {!bindAccount
                ? <Form.Item
                  label={
                    <span>
                      {!isWechat && <span style={{color: 'red'}}>*</span>}
                        原创信息
                    </span>
                  }
                  labelCol={{span: 3}}
                  wrapperCol={{span: 18}}
                >
                  <Input
                    onChange={this.onChangeOriginalInfo}
                    value={originalCreator}
                    placeholder={'请输入原创作者名称，限15个字符以内，若不输入，则默认为文章来源的公众号名称。'}
                  />
                </Form.Item> : null}
              {!bindAccount
                ? <Form.Item
                  label={
                    <span>
                      {!isWechat && <span style={{color: 'red'}}>*</span>}
                      文章封面
                    </span>
                  }
                  labelCol={{span: 3}}
                  wrapperCol={{span: 18}}
                >
                  <UploadDragger2
                    fileType={'image'}
                    fileSize={2}
                    wrongRegHint={'只能上传PNG、JPG格式的文件'}
                    wrongSizeHint={'文件必须2M以内'}
                    placeholder={'支持PNG、JPG格式的图片，建议像素为400*400，大小须在2M内。'}
                    uploadAction={urls.uploadImg}
                    updateFileList={this.updateImgFileList}
                    isFinishedUpload={isFinishedUploadNoWXArticle}
                  />
                </Form.Item> : null}

              {(isNoWechat || ownCreate)
                ? <Form.Item
                  label={
                    <span>
                      {!isWechat && <span style={{color: 'red'}}>*</span>}
                      文章标题
                    </span>}
                  labelCol={{span: 3}}
                  wrapperCol={{span: 18}}
                  validateStatus={title.length > 30 ? 'error' : ''}
                  help={title.length > 30 ? '文章标题最多30个字符' : ''}
                >
                  <Input
                    placeholder="请输入文章标题，限30个字符以内。"
                    maxLength={30}
                    onChange={this.onChangeTitle}
                    value={title}
                  />
                </Form.Item> : null}
              {!bindAccount
                ? <Form.Item
                  label={
                    <span>
                      {!isWechat && <span style={{color: 'red'}}>*</span>}
                  分享摘要
                    </span>}
                  labelCol={{span: 3}}
                  wrapperCol={{span: 18}}
                >
                  <Input
                    onChange={this.onChangeSummary}
                    maxLength={20}
                    value={summary}
                    placeholder={'请输入分享摘要，限20个字符以内，若不输入，则默认为链接对应文章的自带摘要。'}
                  />
                </Form.Item> : null}

              {!bindAccount && <Form.Item label={<span>分享链接预览</span>} labelCol={{span: 3}} wrapperCol={{span: 18}}>
                <div className={'shareCardView'} >
                  <img className={'shareImg'} src={shareImg}/>
                  <div className={'shareContent'}>
                    <div className={'text-ellipsis shareTitle'}>{title || '文章标题'}</div>
                    <div className={'text-ellipsis shareSubTitle'}>{summary || '请添加摘要xxx'}</div>
                  </div>
                </div>
              </Form.Item>}

              {ownCreate && <Form.Item label={<span>输入内容</span>} labelCol={{span: 3}} wrapperCol={{span: 18}}>
                <BraftEditor initHtml={editorHtml} changEditorHtml={this.onChangeEditor}/>
              </Form.Item>}
              {bindAccount ? null : <Form.Item label={<span>是否必发 <Tooltip placement="top" title={'可以将一些主要的内容设为必发，让员工重点推荐给客户'}>
                <Icon type="info-circle" className={styles.toolTipsIcon} />
              </Tooltip></span>} labelCol={{span: 3}} wrapperCol={{span: 18}}>
                <Switch checked={mustSend} onChange={this.onChangeMustSend} />
              </Form.Item>}
              <Form.Item label={<span>内容标签 <Tooltip placement="top" title={t1}>
                <Icon type="info-circle" className={styles.toolTipsIcon} />
              </Tooltip></span>} labelCol={{span: 3}} wrapperCol={{span: 18}}>
                <NewsContentTag onChange={this.onChangeContentTags} mode={mode} history={this.props.history}/>
              </Form.Item>
              <Form.Item wrapperCol={{offset: 3}}>
                <Button type="primary" onClick={this.submitAdd} loading={isAdding} >添加</Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Spin>
    )
  }
}

const mapStateToProps = state => {
  return {
    right: state.base.right
  }
}

export default connect(
  mapStateToProps
)(NewsAddInternal)
