import React, { PureComponent } from 'react'

export default class Welcome extends PureComponent {
  render() {
    return (
      <div
        style={{
          marginTop: '30vh',
          textAlign: 'center',
          fontSize: '18px'
        }}
      >
        欢迎光临!
      </div>
    )
  }
}
