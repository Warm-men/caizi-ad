import React from 'react'
import '../index.less'

export default class PopoverChild extends React.PureComponent {
  render () {
    const { data } = this.props
    if (!data) return ''
    return (
      <div className={'popoverContent'} style={{width: 350}}>
        {data.title
          ? <div className={'popoverContentTitle'}>{data.title}</div> : null }
        {data.descArr.length ? data.descArr.map((item, k) => {
          return (
            <div className={'descItem'} key={k}>
              <div className={'descItemTitle'}>{item.title}</div>
              <div className={'descItemText'}>{item.text}</div>
            </div>
          )
        }) : null}
        {data.tips
          ? <div className={'tips'}>{data.tips}</div> : null }
      </div>
    )
  }
}
