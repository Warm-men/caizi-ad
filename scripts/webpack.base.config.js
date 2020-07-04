const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const resolve = (relatedPath) => path.resolve(__dirname, relatedPath)

const webpackConfigBase = {
  entry: {
    // vendor
    vendor: ['react', 'react-dom', 'antd'],
    // 入口文件
    main: resolve('../src/main.js')
  },
  output: {
    path: resolve('../dist')
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@src': resolve('../src')
    }
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [resolve('../src')],
        // 一定要加这个 否则检测不到
        enforce: 'pre',
        use: [{
          loader: 'eslint-loader',
          options: {
            // 不符合Eslint规则时只console warning(默认false 直接error)
            // emitWarning: true
          }
        }]
      },
      {
        test: /\.js[x]?$/,
        exclude: [resolve('../node_modules/_react-dom'), resolve('../node_modules/_lodash')],
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.styl$/,
        use: ['style-loader', 'css-loader', 'stylus-loader']
      },
      // 除了node_modules(因为antd不能用css module)
      // {
      //   test: /\.css$/,
      //   exclude: [resolve('../node_modules')],
      //   use: ['style-loader', {
      //     loader: 'css-loader',
      //     options: {
      //       importLoaders: 1,
      //       // css modules支持
      //       modules: true,
      //       localIdentName: '[name]__[local]__[hash:base64:5]'
      //     }
      //   }]
      // },
      {
        test: /\.less$/,
        exclude: [resolve('../node_modules')],
        use: ['style-loader', {
          loader: 'css-loader',
          options: {
            importLoaders: 1,
            // less modules支持
            modules: true,
            localIdentName: '[name]__[local]__[hash:base64:5]'
          }
        }, 'less-loader']
      },
      {
        test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'images/[hash:8].[name].[ext]'
          }
        }]
      }
    ]
  },
  plugins: [
    // 将打包后的资源注入到html文件内
    new HtmlWebpackPlugin({
      template: resolve('../src/index.html'),
      mapConfig: 'http://56.32.3.21/config/qdkjdsj_map_config.js'
    }),
    // https://www.jb51.net/article/131865.htm
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor']
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      chunks: ['vendor']
    })
  ]
}

module.exports = webpackConfigBase
