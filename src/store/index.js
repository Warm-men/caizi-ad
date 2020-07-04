import { combineReducers, createStore, applyMiddleware } from 'redux'
import { createLogger } from 'redux-logger'
import thunk from 'redux-thunk'
import base from './modules/base'
import test from './modules/test'

const middleware = [thunk]
// eslint-disable-next-line no-undef
if (SERVER === 'localhost') {
  middleware.push(createLogger())
}

// redux
const store = createStore(
  combineReducers({
    base,
    test
  }),
  applyMiddleware(...middleware)
)

export default store
