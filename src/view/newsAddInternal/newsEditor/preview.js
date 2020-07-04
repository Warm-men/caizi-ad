import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import styles from './preview.less'
import { Modal } from 'antd'

export default class Preview extends PureComponent {
    static propTypes = {
      editorHtml: PropTypes.string // 生成的html
    };
    constructor (props, context) {
      super(props)
      this.state = {
        visible: false
      }
    }

    handlePreview = () => {
      this.setState({visible: !this.state.visible})
    };

    render () {
      return (
        <div onClick={this.handlePreview}>
          <div className={styles.title}>预览</div>
          <Modal
            title="预览（实际样式以小程序为准）"
            visible={this.state.visible}
            onOk={this.handlePreview}
            onCancel={this.handlePreview}
            footer={null}
          >
            <div className={styles.desc} dangerouslySetInnerHTML={{__html: this.props.editorHtml}}></div>
          </Modal>
        </div>
      )
    }
}
