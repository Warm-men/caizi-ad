module.exports = {
  presets: [
    "env",
    "react",
    "stage-0"
  ],
  plugins: [
    // antd
    ["import", { "libraryName": "antd", "libraryDirectory": "es", "style": "css" }],
    // 用babel-polyfill不用babel-plugin-transform-runtime babel-polyfill放入vendor
    // "transform-runtime",
    "transform-decorators-legacy"
  ]
}