import React, { PureComponent } from 'react'
import BannerEdit from './edit'

export default class BannerUpdate extends PureComponent {
  render () {
    return (
      <div className="bannerUpdate">
        <BannerEdit isAdd={false} />
      </div>
    )
  }
}
