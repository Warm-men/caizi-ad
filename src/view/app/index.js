import React, { Component } from 'react'
import { Route, Switch } from 'react-router-dom'
import AutoAuth from '@src/view/getOauth/autoAuth'
import Login from '@src/view/getOauth/login'
import RoleSelete from '@src/view/roleSelete'
import Home from '@src/view/home'
import ErrorPage from '@src/view/base/errorPage'
import AddPublicAddress from '@src/view/base/addPublicAddress'

class App extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      menuAndRight: {}
    }
  }

  render () {
    return (
      <div className="app">
        <Switch>
          <Route path="/autoAuth" component={AutoAuth} />
          <Route path="/login" component={Login} />
          <Route path="/roleSelete" component={RoleSelete} />
          <Route path="/error/:type" component={ErrorPage} />
          <Route path="/error" component={ErrorPage} />
          <Route path="/addPublicAddress" component={AddPublicAddress} />
          <Route path="/" component={Home} />
        </Switch>
      </div>
    )
  }
}

export default App
