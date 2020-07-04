import React from 'react'
import './index.less'
const dataArr = [
  {
    time: '昨日',
    type: '1'
  },
  {
    time: '近7日',
    type: '2'
  },
  {
    time: '近15日',
    type: '3'
  },
  {
    time: '近30日',
    type: '4'
  }
]
export default class DataPicker extends React.PureComponent {
  constructor (props) {
    super(props)
    const newData = props.deleteYesterday ? dataArr.slice(1) : dataArr
    this.state = {
      type: newData[0].type
    }
  }
  selectedTime = (item) => {
    if (item.type === this.state.type) return
    this.setState({ type: item.type })
    this.props.onChangeTime(item.type)
  }
  render () {
    const { type } = this.state
    const { deleteYesterday } = this.props
    const newData = deleteYesterday ? dataArr.slice(1) : dataArr
    return (
      <span className={'dataPicker'}>
        {newData.map((item, index) => {
          return (
            <span
              style={{color: item.type === type ? '#CFBB9A' : '#999'}}
              onClick={() => this.selectedTime(item)}
              className={'dataItem'} key={index}
            >
              {item.time}
            </span>
          )
        })}
      </span>
    )
  }
}
