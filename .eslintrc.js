module.exports = {
  // eslint找当前配置文件不再往父级查找
  root: true,
  extends: 'standard',
  parser: 'babel-eslint',
  plugins: ['react'],
  rules: {
    // 关闭统一换行符，"\n" unix(for LF) and "\r\n" for windows(CRLF)，默认unix
    'linebreak-style': 'off',
    // 某些变量未引用不报错
    'no-unused-vars': 'off',
    // 函数前空格不报错
    'space-before-function-paren': 0,
  },
}
