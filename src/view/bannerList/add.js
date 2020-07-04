import React, { PureComponent } from 'react'
import BannerEdit from './edit'

export default class BannerAdd extends PureComponent {
  render () {
    return (
      <div className="bannerAdd">
        <BannerEdit isAdd={true} />
      </div>
    )
  }
}
