const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const webpackConfigBase = require('./webpack.base.config')
var FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const WebpackNotifierPlugin = require('webpack-notifier')

function resolve (relatedPath) {
  return path.join(__dirname, relatedPath)
}
const webpackConfigDev = {
  output: {
    // webpack-dev-server不能用chunkhash 只能用hash
    filename: '[name].[hash].js',
    // 本地开发 path都是根路径
    publicPath: '/'
  },
  plugins: [
    new webpack.DefinePlugin({
      // 'process.env.NODE_ENV': JSON.stringify('development'),
      SERVER: JSON.stringify('localhost')
    }),
    // 控制台打印
    new FriendlyErrorsWebpackPlugin({
      compilationSuccessInfo: {
        messages: [`PROXY_ENV: ${process.env.PROXY_ENV}`],
        notes: ['Some additionnal notes to be displayed unpon successful compilation']
      },
      onErrors: function (severity, errors) {
      }
    })
  ],
  // dev环境用eval-source-map prod环境用source-map
  devtool: 'eval-source-map',
  devServer: {
    host: 'localhost',
    port: 8201,
    // 自动打开网页
    open: true,
    // necessary for FriendlyErrorsPlugin
    quiet: true,
    // 如果改为BrowserRouter history路由 必须有这个 否则刷新404
    // historyApiFallback: true,
    proxy: {
      '/develop/caizhi_manage': {
        target: 'https://dev.tengmoney.com',
        secure: false,
        changeOrigin: true,
        pathRewrite: {
          '/develop': ''
        }
      },
      '/test/caizhi_manage': {
        target: 'https://test.tengmoney.com',
        secure: false,
        changeOrigin: true,
        pathRewrite: {
          '/test': ''
        }
      },
      '/www/caizhi_manage': {
        target: 'https://www.tengmoney.com',
        secure: false,
        changeOrigin: true,
        pathRewrite: {
          '/www': ''
        }
      }
    }
  }
}

module.exports = merge(webpackConfigBase, webpackConfigDev)
