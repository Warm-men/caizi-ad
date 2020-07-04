import React, { PureComponent } from 'react'
import StaffEdit from '../staffAdd/staffEdit.js'

class StaffUpdate extends PureComponent {
  render () {
    return (
      <div>
        <StaffEdit isAdd={false} />
      </div>
    )
  }
}

export default StaffUpdate
