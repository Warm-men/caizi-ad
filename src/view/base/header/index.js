import React, { Component } from 'react'
import styles from './index.less'

const Header = () => {
  const imgUrl = require('@src/assets/logo.png')
  return (
    <div className={styles.title}>
      <img src={imgUrl} className={styles.logoSvg}></img>
      <span className={styles.appName}>财智 | 管理后台</span>
    </div>
  )
}

export default Header
