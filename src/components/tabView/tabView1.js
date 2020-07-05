import React from 'react'
import { Form, Input, Tag } from 'antd'
import styles from './index.less'
import { Link } from 'react-router-dom'

export default class TabView1 extends React.PureComponent {
  render () {
    const {
      publicAddress,
      inputTip,
      deletePublicAddress,
      publicAddressNames
    } = this.props
    return (
      <div className={'bindAccountView'}>
        <div className={'tabView'}>
          <span className={'titleView'}>
                      已添加公众号：
          </span>
          {publicAddress.map(obj => {
            return <Tag color="blue" key={obj.id} closable className={styles.myTag}
              onClose={(ev) => deletePublicAddress(ev, obj.id)}>{obj.name}</Tag>
          })}
        </div>
        <div className={'contentView'}>
          <div className={'headerView'}>
            <span className={'title'}>添加行内公众号</span>
            <span style={{color: '#aaa'}}>
                  绑定公众号后，公众号的内容将自动同步到后台中方便转发。
              <Link to="/addPublicAddress" target="_blank" replace>如何添加</Link>
            </span>
          </div>
          <Form.Item label={<span>输入公众号名称</span>} labelCol={{span: 3}} wrapperCol={{span: 18}}>
            <Input.TextArea placeholder={'多个微信公众号以逗号隔开，已添加公众号最多30个'} rows={3} onChange={this.onChangePublicAddressNames} value={publicAddressNames}
              placeholder={inputTip} />
          </Form.Item>
          {this.props.children}
        </div>
      </div>
    )
  }
}
