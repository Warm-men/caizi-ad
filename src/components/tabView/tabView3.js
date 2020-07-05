import React from 'react'
import { Form, Icon, Button, Input } from 'antd'
import styles from './index.less'
import BraftEditor from '@src/components/braftEditor'
import UploadDragger2 from '@src/view/newsAddInternal/UploadDragger2'
import UploadDragger from '@src/view/newsAddInternal/UploadDragger'
import urls from '@src/config'

export default class TabView2 extends React.PureComponent {
  render () {
    const {
      ownCreate,
      isEdit,
      isFinishedUploadLocalArticle,
      updateDocFileList,
      originalCreator,
      updateImgFileList,
      isFinishedUploadNoWXArticle,
      title,
      shareImg,
      editorHtml,
      onChangeEditor,
      summary
    } = this.props

    return (
      <div>
        {ownCreate && !isEdit && <Form.Item label={<span>本地上传</span>} labelCol={{span: 3}} wrapperCol={{span: 18}}>
          <UploadDragger
            fileType={'doc'}
            fileSize={2}
            wrongRegHint={'只能上传txt、doc、docx格式的文件'}
            wrongSizeHint={'文件必须2M以内'}
            placeholder={'支持上传doc、docx、txt格式的文件，大小须在2M内'}
            uploadAction={urls.fileToHtml}
            isFinishedUpload={isFinishedUploadLocalArticle}
            updateFileList={updateDocFileList}
          />
        </Form.Item>}
        <Form.Item
          label={<span><span style={{color: 'red'}}>*</span>原创信息</span>}
          labelCol={{span: 3}}
          wrapperCol={{span: 18}}
        >
          <Input
            onChange={this.onChangeOriginalInfo}
            value={originalCreator}
            placeholder={'请输入原创作者名称，限15个字符以内，若不输入，则默认为文章来源的公众号名称。'}
          />
        </Form.Item>
        <Form.Item
          label={
            <span>
              <span style={{color: 'red'}}>*</span>
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
        <Form.Item
          label={
            <span>
              <span style={{color: 'red'}}>*</span>
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
        </Form.Item>
        <Form.Item
          label={
            <span>
              <span style={{color: 'red'}}>*</span>
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
        <Form.Item label={<span>输入内容</span>} labelCol={{span: 3}} wrapperCol={{span: 18}}>
          <BraftEditor initHtml={editorHtml} changEditorHtml={onChangeEditor}/>
        </Form.Item>
        {this.props.children}
      </div>
    )
  }
}
