import React, { Component, Fragment } from 'react'
import { Modal, Table, Button, message, Tabs } from 'antd'
import IntendedCustomersInfo from './intendedCustomersInfo'
import axios from '@src/utils/axios'
import urls from '@src/config'
const { TabPane } = Tabs

export default class IntendedCustomers extends Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }

  callback = (key) => {}

  render () {
    return (
      <Fragment>
        <Tabs defaultActiveKey="1" onChange={this.callback}>
          <TabPane tab="意向客户信息" key="1">
            <IntendedCustomersInfo />
          </TabPane>
        </Tabs>
      </Fragment>
    )
  }
}
