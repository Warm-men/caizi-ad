import React from 'react'
export default class TagViewWithNum extends React.PureComponent {
  render() {
    const { item, type, onChange, tag } = this.props
    const defaultStyle = {
      display: 'inline-block',
      height: 24,
      lineHeight: '22px',
      borderRadius: 4,
      padding: '0 10px',
      marginRight: 14,
      marginBottom: 14,
      border: '1px solid #ddd',
      textAlign: 'center',
      position: 'relative',
      fontSize: 12,
      cursor: 'pointer'
    }
    const selectedStyle = {
      ...defaultStyle,
      border: '1px solid #91d5ff',
      color: '#1890ff',
      backgroundColor: '#e6f7ff'
    }
    const numStyle = {
      position: 'absolute',
      transform: 'scale(0.8)',
      display: 'inline-block',
      textAlign: 'center',
      color: '#fff',
      lineHeight: '20px',
      width: 20,
      height: 20,
      borderRadius: '50%',
      top: -10,
      right: -10,
      backgroundColor: 'red'
    }
    const itemStyle = type === item.category ? selectedStyle : defaultStyle
    const num = item.tags.filter(item => tag.includes(item)).length
    return (
      <span
        style={itemStyle}
        onClick={() => onChange(item.category)}
      >
        {item.category}
        {num ? <span style={numStyle}>{num}</span> : null}
      </span>
    )
  }
}
