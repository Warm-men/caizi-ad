import React from 'react'
import { PageHeader, Icon } from 'antd'

export default class PageHeaderHoc extends React.PureComponent {
  render () {
    const { backText, onBack, subTitle, hasGoback = true } = this.props
    return (
      <PageHeader
        {...this.props}
        style={{
          borderBottom: '1px solid #ddd',
          height: 56,
          padding: '10px 24px',
          margin: '-20px -20px 0 -20px',
          cursor: 'pointer'
        }}
        subTitle={''}
        backIcon={''}
        title={
          <span
            style={{
              fontSize: 14,
              color: '#3078DB',
              fontWeight: '500',
              lineHeight: '32px'
            }}
          >
            {hasGoback
              ? <span onClick={onBack}>
                <Icon
                  type="left"
                  style={{color: '#3078DB'}}
                />
                {backText || '返回'}
              </span>
              : null }
            <span style={{color: '#000', fontWeight: '550', marginLeft: 10}}>{subTitle}</span>
          </span>}
      >
        {this.props.children}
      </PageHeader>
    )
  }
}
