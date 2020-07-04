import React, { PureComponent } from 'react'
import ProductEdit from '@src/view/productAdd/productEdit'

// 添加产品
export default class ProductAdd extends PureComponent {
  render () {
    return (
      <div className={'productAdd'}>
        <ProductEdit isAdd={true} />
      </div>
    )
  }
}
