import React from 'react'
import { Popover, Icon } from 'antd'
import getHintContent from './getHintContent'
import PopoverChild from './getHintChildren'
export default class PopoverHint extends React.PureComponent {
  render () {
    return (
      <span style={{marginLeft: 10}}>
        <Popover
          content={
            <PopoverChild data={getHintContent(this.props.hintType)} />
          }
        >
          <span style={{cursor: 'pointer'}}>
            <Icon type={'info-circle'} style={{ marginRight: 5 }} />
            <span className={'infoText'}>指标说明</span>
          </span>
        </Popover>
      </span>
    )
  }
}
