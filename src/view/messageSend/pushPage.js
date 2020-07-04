import React from 'react'
import { Modal, message } from 'antd'
import PropTypes from 'prop-types'
import CropperModal from './cropperModal'
import './pushPage.less'

const FILE_SIZE = 1 * 1024 * 1024 // 文件最大限制为2M

export default class PushPage extends React.Component {
  static contextTypes = {
    onChangeImageText: PropTypes.func
  }

  constructor (props) {
    super(props)

    this.state = {
      accept: ['image/jpg', 'image/png', 'image/jpeg'],
      imgModalVisible: false,
      previewVisible: false,
      imgModalFile: null,
      resultImgUrl: null
    }
  }

  componentDidMount () {
    let { imageTextObj, index } = this.props
    if (imageTextObj[index] && imageTextObj[index].coverPicture) {
      this.setState({ resultImgUrl: imageTextObj[index].coverPicture })
    }
  }

  componentWillReceiveProps (next) {
    let { imageTextObj, index } = next
    if (imageTextObj[index] && imageTextObj[index].coverPicture) {
      this.setState({ resultImgUrl: imageTextObj[index].coverPicture })
    }
  }

  handleClassFileChange = e => {
    const file = e.target.files[0]
    if (file) {
      const { accept } = this.state
      if (!accept.includes(file.type)) {
        message.error('只能上传png，jpeg，jpg格式的文件')
        return false
      }
      if (file.size <= this.props.size * FILE_SIZE) {
        e.target.value = ''
        this.setState(
          {
            imgModalFile: file // 先把上传的文件暂存在state中
          },
          () => {
            this.setState({
              imgModalVisible: true // 然后弹出modal
            })
          }
        )
      } else {
        message.destroy()
        message.error(`图片大小不能超过${this.props.size}M`)
      }
    }
  }

  handleGetResultImgUrl = key => url => {
    // const str = URL.createObjectURL(url)
    this.setState({
      [key]: url,
      imgModalFile: null
    })
    this.context.onChangeImageText('coverPicture', url, this.props.index)
  }

  render () {
    const {
      imgModalVisible,
      imgModalFile,
      resultImgUrl,
      previewVisible,
      accept
    } = this.state
    return (<div id='PushPage'>
      <div className="half-area">
        <label className="upload-input-label">
          <span>点击上传图片</span>
          <input
            type="file"
            accept={accept.join(',')}
            className="base-upload-input"
            onChange={(e) => this.handleClassFileChange(e)}
          />
        </label>
        <div className="img-container">
          {resultImgUrl && (
            <img
              className="img"
              src={resultImgUrl}
              onClick={() => { this.setState({ previewVisible: true }) }}
              alt="resultImgUrl"
            />
          )}
        </div>
        <Modal visible={previewVisible} footer={null} onCancel={() => this.setState({ previewVisible: false })}>
          <img alt="example" style={{ width: '100%', paddingTop: '20px' }} src={resultImgUrl} />
        </Modal>
      </div>

      {
        imgModalFile && <CropperModal
          uploadedImageFile={imgModalFile}
          visible={imgModalVisible}
          aspectRatio={this.props.aspectRatio}
          onClose={() => {
            this.setState({ imgModalVisible: false, imgModalFile: null })
          }}
          onSubmit={this.handleGetResultImgUrl('resultImgUrl')}
        />
      }
    </div>)
  }
}
