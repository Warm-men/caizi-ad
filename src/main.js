// babel转换es6方法
// import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import App from '@src/view/app'
import '@src/style/base.css'
import { HashRouter as Router, Route } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/lib/locale-provider/zh_CN'
import '../node_modules/cz-react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { Provider } from 'react-redux'
import store from '@src/store'
import '@src/utils/mta.js' // 腾讯埋点

ReactDOM.render(
  <ConfigProvider locale={zhCN}>
    <Provider store={store}>
      <Router>
        <App />
      </Router>
    </Provider>
  </ConfigProvider>,
  document.getElementById('root')
)
