import React, { PureComponent } from 'react'
import { Icon } from 'antd'

// 营销话术
class QuestionItem extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      isOpen: false
    }
  }

  toggleOpen = () => {
    this.setState({
      isOpen: !this.state.isOpen
    })
  }

  render () {
    const { questionItem } = this.props
    const { isOpen } = this.state
    return (
      <div style={{position: 'relative'}}>
        <span style={{paddingRight: 20}}>{questionItem.issue} </span>
        <Icon type={ !isOpen ? 'down' : 'up'} onClick={this.toggleOpen} style={{ position: 'absolute', right: 0 }} />
        {isOpen ? <div>{questionItem.answer}</div> : null}
      </div>
    )
  }
}

export default QuestionItem
