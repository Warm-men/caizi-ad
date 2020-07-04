import React, { PureComponent } from 'react'
import ProductEdit from '@src/view/productAdd/productEdit'

// 编辑产品
export default class ProductUpdate extends PureComponent {
  render () {
    return (
      <div className={'productUpdate'}>
        <ProductEdit isAdd={false} />
      </div>
    )
  }
}
