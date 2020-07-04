import React, { Component } from 'react'
import echarts from 'echarts'
import { isEqual } from 'lodash'
import './index.less'

export default class Echart extends Component {
  constructor (props) {
    super(props)
    this.state = {
      options: this.props.options
    }
  }

  componentWillReceiveProps (nextProps) {
    const { options } = nextProps
    if (!isEqual(options, this.props.options)) {
      this.setState({ options }, this.draw)
    }
  }

  shouldComponentUpdate () {
    return false
  }

  componentDidMount () {
    this.Echart = echarts.init(this.refs.echarts)
    this.draw()
  }

  componentWillUnmount () {
    this.Echart.dispose()
    clearTimeout(this.timer)
  }

  // 图表绘制
  draw = () => {
    const { dispatchAction } = this.props
    this.Echart.clear()
    this.Echart.setOption(this.getOptions())
    setTimeout(() => {
      this.Echart.resize()
    }, 200)
    if (dispatchAction) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.Echart.dispatchAction(dispatchAction)
      }, 500)
    }
  }

  // 组装上默认配置
  getOptions = () => {
    const defaultOptions = {
      textStyle: {
        color: '#333',
        fontSize: 12
      },
      grid: {
        containLabel: true,
        top: 20,
        left: 0,
        right: 0,
        bottom: 10
      }
    }
    const { options } = this.props
    return { ...defaultOptions, ...options }
  }

  render () {
    const { className } = this.props
    return <div id="echarts" ref="echarts" style={{height: 320}} className={className} />
  }
}
