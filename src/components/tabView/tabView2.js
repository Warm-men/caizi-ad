import React from 'react'
import { Form, Input, Radio } from 'antd'
import styles from './index.less'
import UploadDragger2 from '@src/view/newsAddInternal/UploadDragger2'
import urls from '@src/config'

export default class TabView2 extends React.PureComponent {
  render () {
    const {
      isNoWechat,
      articleType,
      newsUrl,
      isWechat,
      originalCreator,
      isFinishedUploadNoWXArticle,
      updateImgFileList,
      ownCreate,
      title,
      summary,
      shareImg,
      onChangeArticleType,
      onChangeNewsUrl,
      onChangeOriginalInfo,
      onChangeTitle,
      onChangeSummary
    } = this.props
    const t1 = <div>
      <p>1.自动：系统会根据文章中高频词出现频率自动打标；例如文章中高频出现“货基、定投、净值”词语，则文章会打上“基金”的标签。</p>
      <p>2.手动：系统会根据所选标签进行打标；若只选择类别，未选择标签，则文章不会被打标签。</p>
      <p>3.每篇文章最多可以打3个标签</p>
    </div>
    return (
      <div>
        <Form.Item label={<span>文章来源</span>} labelCol={{span: 3}} wrapperCol={{span: 18}}>
          <Radio.Group onChange={onChangeArticleType} value={articleType}>
            <Radio value={0}>微信公众号</Radio>
            <Radio value={1}>其他来源</Radio>
          </Radio.Group>
          {isNoWechat && <span style={{color: 'red'}}>（非微信公众号文章，无法在小程序中显示，请注意。）</span>}
        </Form.Item>
        <Form.Item label={<span><span style={{color: 'red'}}>*</span>文章链接</span>} labelCol={{span: 3}} wrapperCol={{span: 18}}>
          <Input.TextArea rows={6} onChange={onChangeNewsUrl} value={newsUrl}
            placeholder={'复制文章链接粘贴到此处。'} />
        </Form.Item>
        <Form.Item
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
            onChange={onChangeOriginalInfo}
            value={originalCreator}
            placeholder={'请输入原创作者名称，限15个字符以内，若不输入，则默认为文章来源的公众号名称。'}
          />
        </Form.Item>

        <Form.Item
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
            updateFileList={updateImgFileList}
            isFinishedUpload={isFinishedUploadNoWXArticle}
          />
        </Form.Item>

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
              onChange={onChangeTitle}
              value={title}
            />
          </Form.Item> : null}

        <Form.Item
          label={
            <span>
              {!isWechat && <span style={{color: 'red'}}>*</span>}
                  分享摘要
            </span>}
          labelCol={{span: 3}}
          wrapperCol={{span: 18}}
        >
          <Input
            onChange={onChangeSummary}
            maxLength={20}
            value={summary}
            placeholder={'请输入分享摘要，限20个字符以内，若不输入，则默认为链接对应文章的自带摘要。'}
          />
        </Form.Item>

        <Form.Item label={<span>分享链接预览</span>} labelCol={{span: 3}} wrapperCol={{span: 18}}>
          <div className={'shareCardView'} >
            <img className={'shareImg'} src={shareImg}/>
            <div className={'shareContent'}>
              <div className={'text-ellipsis shareTitle'}>{title || '文章标题'}</div>
              <div className={'text-ellipsis shareSubTitle'}>{summary || '请添加摘要xxx'}</div>
            </div>
          </div>
        </Form.Item>

        {this.props.children}
      </div>
    )
  }
}
