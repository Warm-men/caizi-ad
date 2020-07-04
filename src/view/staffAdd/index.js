import React, { PureComponent } from 'react'
import StaffEdit from './staffEdit'

export default class staffAdd extends PureComponent {
  render () {
    return (
      <div id="staffAdd">
        <StaffEdit isAdd={true} />
      </div>
    )
  }
}
