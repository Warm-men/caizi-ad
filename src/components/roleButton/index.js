import React from 'react'
import { Button } from 'antd'
import utils from '@src/utils'

export default class RoleButton extends React.PureComponent {
  handleOnClick = () => {
    const { rolekey, pathname, onClick } = this.props
    console.log(rolekey, pathname)
    const isRight = utils.checkButtonRight(pathname, rolekey)
    if (!isRight) return
    onClick()
  }
  render() {
    const { isButton = 'button' } = this.props
    if (isButton === 'button') {
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
        style={this.props.styles}
        onClick={this.handleOnClick}
      >
        {this.props.children}
      </span>
    )
  }
}
