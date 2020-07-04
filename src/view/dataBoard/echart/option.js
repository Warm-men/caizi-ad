import echarts from 'echarts'
export default (data = [], isRange = false, tooltipExtra) => {
  const name = data.map((item) => item.date.slice(-5))
  return {
    grid: {
      containLabel: true,
      top: 40,
      left: 20,
      right: 20,
      bottom: 20
    },
    xAxis: {
      data: name,
      axisLabel: {
        textStyle: {
          color: '#999'
        }
      },
      axisTick: {
        show: false
      },
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      show: true,
      axisLabel: {
        show: true,
        interval: 'auto',
        color: '#999',
        formatter: isRange ? '{value}%' : '{value}'
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(153,153,153,0.1)'
        }
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'none'
      },
      padding: 0,
      backgroundColor: 'transparent',
      formatter (info) {
        const { data } = info[0]
        const text = isRange ? data.value + '%' : data.value
        const rangeText = tooltipExtra === '产品点击购买率' && data.visitProductClientNum
          ? `(${data.hitBuyProductClientNum}/${data.visitProductClientNum})`
          : ``
        return `<div class="data-plane-tooltip">
                ${data.date}<br/>
                ${tooltipExtra}：<br/> ${text || 0} ${rangeText}
                </div>`
      }
    },
    series: [
      {
        name: '使用人数',
        type: 'line',
        itemStyle: {
          normal: {
            color: '#CFBB9A',
            label: {
              show: true,
              position: 'top',
              formatter: (item) => {
                if (item.value > 0) {
                  const rangeText = tooltipExtra === '产品点击购买率' && item.data.visitProductClientNum
                    ? `${item.value}%\n (${item.data.hitBuyProductClientNum}/${item.data.visitProductClientNum})`
                    : `${item.value}%`
                  return isRange ? rangeText : `${item.value}`
                } else {
                  return ''
                }
              }
            }
          }
        },
        label: { show: true, color: '#CFBB9A' },
        data: data.map((item) => {
          const value = isRange ? item.value.slice(0, -1) : item.value
          return {...item, value}
        }),
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            offset: 0,
            color: '#ebe2d4'
          }, {
            offset: 1,
            color: '#fff'
          }])
        }
      }
    ]
  }
}
