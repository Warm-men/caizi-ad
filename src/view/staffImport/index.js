import React, { Component } from 'react'
import { Button, Upload, Icon, message, Modal, Table } from 'antd'
import styles from './index.less'
import axios from '@src/utils/axios'
import urls from '@src/config'
import { connect } from 'react-redux'
import DeptTreeSelect from '@src/components/DeptTreeSelect'

const mapStateToProps = (state) => {
  return {
    right: state.base.right
  }
}

@connect(mapStateToProps)
class ImportStaff extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      fileList: [],
      uploading: false,
      deptValue: '',
      importFailData: [],
      failList: [],
      countObj: {},
      visibleFailModal: false,
      timer: null
    }
  }
  // 获取部门树和导入失败table
  componentDidMount () {
    this.getFailTable()
    // 定时拉取导入失败table
    this.interval = setInterval(() => {
      this.getFailTable()
    }, 3000)
  }
  // 移除定时器
  componentWillUnmount () {
    clearInterval(this.interval)
  }
  // 导入失败table
  getFailTable = () => {
    axios.post(urls.exportResult).then(res => {
      const { status, failList, addCount, coverCount, failCount } = res.retdata.detail
      this.setState({
        uploading: status === 2,
        failList,
        countObj: {
          addCount,
          coverCount,
          failCount
        }
      })
    })
  }
  // 是否是excel文件
  isXlsFile (fileName) {
    const reg = /^.*\.(?:xls|xlsx)$/i
    return reg.test(fileName)
  }
  // 上传前 是否是excel文件
  beforeUpload (file, fileList) {
    const isXls = this.isXlsFile(file.name)
    if (isXls) {
      this.setState({ fileList: fileList })
    } else {
      this.setState({ fileList: [] })
      message.error('只能上传xls或者xlsx格式的文件')
    }
    // return false 手动上传，后续点击导入员工再上传
    return false
  }
  // 导入员工
  importStaff () {
    const { fileList, deptValue } = this.state
    if (!fileList.length) {
      return message.error('请上传文件')
    }
    this.setState({ uploading: true })
    const formData = new window.FormData()
    fileList.forEach((file) => {
      formData.append('upfile', file)
    })
    // 上传文件进入axios请求拦截器后 不做contentType转换
    // 自动Content-Type: multipart/form-data; boundary=----xx
    formData.append('defaultDepartment', deptValue)
    axios.post(urls.importExcel, formData, { timeout: 300000 }).then(res => {
      // this.afterImport(res.retdata)
      // 不再通过modal弹出导入失败table 而是定时请求拉取
      this.setState({ fileList: [], deptValue: '' })
    }).catch(() => {
      this.setState({ fileList: [], deptValue: '' })
    })
  }
  // 导入后的成功失败
  afterImport (data) {
    if (data.failList.length) {
      // 部分导入失败
      this.setState({
        visibleFailModal: true,
        importFailData: data
      })
    } else {
      // 导入成功
      Modal.success({
        title: '导入成功',
        content: `本次共导入${data.addCount + data.updateCount}人，新增导入${data.addCount}人，覆盖导入${data.updateCount}人`
      })
    }
  }
  // 隐藏部分导入失败modal
  hideModal () {
    this.setState({
      visibleFailModal: false
    })
  }
  // 选择导入的部门
  selectDept (value) {
    this.setState({ deptValue: value })
  }

  render () {
    const { fileList, uploading, deptValue, countObj, failList } = this.state
    const { right } = this.props
    const canEdit = right.staffList && right.staffList.edit
    const columns = [{
      title: '姓名',
      dataIndex: 'name'
    }, {
      title: '职务',
      dataIndex: 'position'
    }, {
      title: '部门',
      dataIndex: 'department'
    }, {
      title: '手机',
      dataIndex: 'phone'
    }, {
      title: '邮箱',
      dataIndex: 'email'
    }, {
      title: '失败原因',
      dataIndex: 'reason',
      render: (operate, record) => (
        <span style={{color: 'red'}}>{record.reason}</span>
      )
    }]
    return (
      <div className="import-staff">
        <div className={styles.title}>
          批量导入
        </div>
        <ul className={styles.content}>
          <li>
            <Upload.Dragger
              beforeUpload={this.beforeUpload.bind(this)}
              fileList={fileList}
              showUploadList={{ showPreviewIcon: true, showRemoveIcon: false }}
            >
              <p className="ant-upload-drag-icon">
                <Icon type="inbox" />
              </p>
              <p className="ant-upload-text">仅支持xls, xlsx格式的文件</p>
              <p className="ant-upload-hint">点击或者拖拽上传</p>
            </Upload.Dragger>
          </li>
          <li>
            <span style={{marginRight: '20px'}}>
              <div style={{marginBottom: '10px'}}>文件中的成员若未填写部门，将被导入至：</div>
              <DeptTreeSelect multiple={false} style={{ width: 350 }} value={deptValue} disabled={!canEdit} onChange={this.selectDept.bind(this)}/>
            </span>
          </li>
          <li>
            <span style={{marginRight: '10px'}}>请下载通讯录模板，按格式修改后导入</span>
            <a href={'http://test.qtrade.com.cn/caizhi/templates/上传模板.xlsx'}>下载模板</a>
          </li>
          <li>
            <Button
              type="primary"
              onClick={this.importStaff.bind(this)}
              disabled={fileList.length === 0 || !deptValue}
              loading={uploading}
            >{uploading ? '导入中' : '导入员工' }</Button>
            {uploading ? <span style={{color: '#999', marginLeft: '20px'}}>您可以继续浏览其他页面</span> : null }
          </li>
          <li>
            <h2 className={styles.resTitle}>上次导入详情</h2>
            <div>本次共导入{countObj.addCount + countObj.coverCount}人，新增{countObj.addCount}人，覆盖{countObj.coverCount}人，失败{countObj.failCount}人</div>
          </li>
          {failList && failList.length ? <li>
            <h2 className={styles.resTitle}>上次导入失败列表</h2>
            <Table dataSource={failList} columns={columns} pagination={false} />
          </li> : null}
        </ul>
        {/* <ImportFailTabel importFailData={importFailData} visible={visibleFailModal} hideModal={this.hideModal.bind(this)} /> */}
      </div>
    )
  }
}

export default ImportStaff
