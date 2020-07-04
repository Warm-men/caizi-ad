
const webpack = require('webpack')
const path = require('path')
const merge = require('webpack-merge')
const webpackConfigBase = require('./webpack.base.config')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const webpackConfig = webpackConfigBase
const ENV = process.env.ENV // 开发、测试、正式服
const NODE_CDN = process.env.NODE_CDN // 是否开启cos上传
if (NODE_CDN === 'enable') {
  // 桶的名称
  const nameObj = {
    devserver: 'fe-dev-tenmoney-1301390158',
    testserver: 'fe-test-tenmoney-1301390158',
    uatserver: 'fe-test-tenmoney-1301390158',
    wwwserver: 'fe-www-tenmoney-1301390158'
  }
  const WebpackCOSPlugin = require('webpack-cos-plugin') // 打包时上传cos
  const cosPlugin = new WebpackCOSPlugin({
    bucket: {
      Bucket: nameObj[ENV], // COS 服务节点, 示例: oss-cn-hangzhou
      Region: 'ap-shanghai'// COS 存储空间, 在腾讯 COS 控制台获取
    },
    cosBaseDir: '', // COS 中存放上传文件的一级目录名，为空不需要
    project: 'caizhi_manage', // 项目名(用于存放文件的直接目录)
    // useVersion: true, // 自动读取 package.json 中的 version
    // exclude: /(.*\.html$)|(\.map$)|(asset-manifest\.json$)/, // 选填, 默认: /.*/
    options: { // 使用缓存
      CacheControl: 'max-age=31536000',
      Expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toGMTString()
    }
  })
  // 桶的域名
  const urlObj = {
    devserver: 'https://devcdn.tengmoney.com',
    testserver: 'https://testcdn.tengmoney.com',
    uatserver: 'https://testcdn.tengmoney.com',
    wwwserver: 'https://webcdn.tengmoney.com'
  }
  webpackConfig.output.publicPath = `${urlObj[ENV] + cosPlugin.finalPrefix}/` // 使用cos的地址
  webpackConfig.plugins.push(cosPlugin) // 添加WebpackCOSPlugin插件
}

function resolve (relatedPath) {
  return path.join(__dirname, relatedPath)
}

const webpackConfigProd = {
  output: {
    // 必须用chunkhash 否则manifest每次打包后hash都会变化就无法缓存了
    filename: '[name].[chunkhash].js',
    // 部署到测试及生产 path不能是根目录 都是打包出的index.html的同级目录
    publicPath: './'
  },
  plugins: [
    // 压缩优化代码开始
    new webpack.optimize.UglifyJsPlugin({ minimize: true })
    // 分析代码
    // new BundleAnalyzerPlugin({ analyzerPort: 3011 })
  ],
  devtool: 'source-map'
}

module.exports = (env) => {
  webpackConfigProd.plugins.push(new webpack.DefinePlugin({
    // react源码判断process.env.NODE_ENV是development还是production做相应的优化
    // 'process.env.NODE_ENV': JSON.stringify('production'),
    // npm run dev 进入webpack.dev.config, SERVER是localhost
    // npm run build-www，通过--env=prodserver传参 SERVER是wwwserver
    // 在业务代码中通过 SERVER 判断是本地开发还是测试服环境还是生产服环境
    SERVER: JSON.stringify(env)
  }))
  return merge(webpackConfigProd, webpackConfig)
}
