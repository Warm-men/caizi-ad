import React from 'react'
import { Button } from 'antd'
import utils from '@src/utils'

/*
// use me like it

<RoleButton
  type="primary"
  pathname={pathname}
  rolekey={'pushSet'}
  record={record}
  onClick={this.showPushModal}
  className={className}
>
    推送设置
</RoleButton>

props: {
  type: 按钮类型，跟Button一致 (选传)
  pathname: 页面的pathname (必传)
  rolekey: 按钮权限的key(必传)
  onClick: 回调函数 (选传)
  isButton: 按钮样式选择(选传，默认true, antd的Button)
  owner: 列表item的owner判断，产品确定需不需要加owner判断操作权限(选传)
  className: 样式
}

*/
export default class RoleButton extends React.PureComponent {
  handleOnClick = () => {
    const { rolekey, pathname, onClick, owner } = this.props
    console.log(rolekey, pathname)
    const isRight = utils.checkButtonRight(pathname, rolekey)
    if (!isRight) return
    if (this.props.hasOwnProperty('owner')) {
      if (!owner) {
        utils.openRightMessage()
        return
      }
    }
    onClick && onClick()
  }
  render() {
    const { isButton = true, className } = this.props
    if (isButton) {
      return (
        <Button
          {...this.props}
          onClick={this.handleOnClick}
        >
          {this.props.children}
        </Button>)
    }
    return (
      <span
        className={className}
        style={{...this.props.styles, cursor: 'pointer'}}
        onClick={this.handleOnClick}
      >
        {this.props.children}
      </span>
    )
  }
}
