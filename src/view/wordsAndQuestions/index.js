import React, { PureComponent } from 'react'
import { Tabs } from 'antd'
import styles from './index.less'
import Tools from '@src/utils'
import WordsLibrary from './wordsLibrary'
import QuestionsLibrary from './questionsLibrary'

export default class WordsAndQuestions extends PureComponent {
  constructor (props) {
    super(props)
    const issueView = Tools.checkButtonRight(this.props.location.pathname, 'issueView', false)
    const speechView = Tools.checkButtonRight(this.props.location.pathname, 'speechView', false)
    this.state = {
      issueView,
      speechView,
      defaultActiveKey: speechView ? 1 : 2
    }
  }
  render () {
    const { issueView, speechView } = this.state
    return (
      <div className={styles.scripts_problems}>
        <div className={styles.header_title}>问题与话术</div>
        <Tabs defaultActiveKey="1" onChange={this.onChangeTabs}>
          { speechView ? <Tabs.TabPane tab="营销话术库" key="1">
            <WordsLibrary />
          </Tabs.TabPane> : null }
          { issueView ? <Tabs.TabPane tab="常见问题库" key="2">
            <QuestionsLibrary />
          </Tabs.TabPane> : null}
        </Tabs>
      </div>
    )
  }
}
