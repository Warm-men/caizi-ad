import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import styles from './preview.less'
import { Modal } from 'antd'

export default class Preview extends PureComponent {
    static propTypes = {
      editorState: PropTypes.object // editorState对象
    };
    constructor (props) {
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
          <button className={styles.button}>预览</button>
          {this.state.visible && <Modal
            title="预览（实际样式以小程序为准）"
            visible={true}
            onOk={this.handlePreview}
            onCancel={this.handlePreview}
            footer={null}
          >
            <div className={styles.desc} dangerouslySetInnerHTML={{__html: this.props.editorState.toHTML()}}></div>
          </Modal>}
        </div>
      )
    }
}
