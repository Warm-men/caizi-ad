import React, { Component } from 'react'
import styles from './index.less'
import { Input, TreeSelect, Tree, Upload, Icon, message, Tag, Spin, Button } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import utils from '@src/utils'
import DeptTreeSelect from '@src/components/DeptTreeSelect'
import { connect } from 'react-redux'

const mapStateToProps = (state) => {
  return {
    deptList: state.base.deptList
  }
}

@connect(mapStateToProps)
class EnterpriseEdit extends Component {
  constructor (props) {
    super(props)
    this.state = {
      info: null,
      initLoading: true,
      inputVisible: false,
      inputValue: null
    }
    this.deptListIds = []
  }

  componentDidMount () {
    this.flatDeptIds(this.props.deptList)
    this.getEnterpriseInfo()
  }

  componentWillUnmount () {
    this.timer = null
  }

  getEnterpriseInfo = () => {
    const corpId = utils.getUrlQueryString(this.props.location.search, 'corpId')
    const params = { corpId }
    axios.post(urls.enterpriseInfo, {...params}, {headers: {'Content-Type': 'application/json'}}).then(res => {
      let newInfo = {...res.retdata}
      newInfo.branchId = this.filterIds(newInfo.branchId)
      this.setState({
        info: newInfo,
        initLoading: false
      })
    }).catch(() => {
      this.setState({ initLoading: false })
    })
  }

  flatDeptIds = (data) => {
    if (!data || !data.length) return
    data.map(item => {
      this.deptListIds.push(item.id)
      if (item.subDept) {
        return this.flatDeptIds(item.subDept)
      }
    })
  }

  filterIds = id => {
    return this.deptListIds.includes(id) ? id : null
  }

  onChangeName = e => {
    this.setState({ info: {...this.state.info, corpName: e.target.value} })
  }

  onChangeType = e => {
    this.setState({ info: {...this.state.info, corpType: e.target.value} })
  }

  onChangeLocation = e => {
    this.setState({ info: {...this.state.info, corpLocation: e.target.value} })
  }

  onChangeStaffCount = e => {
    this.setState({ info: {...this.state.info, payNum: e.target.value} })
  }

  onChangeOwnerManager = e => {
    this.setState({ info: {...this.state.info, manager: e.target.value} })
  }

  selectDept = value => {
    this.setState({ info: {...this.state.info, branchId: value} })
  }

  // handleChange = ({file}) => {
  //   const managerQRCodeUrl = file.response && file.response.retdata && file.response.retdata.filePaths[0]
  //   this.setState({ info: {...this.state.info, managerQRCodeUrl} })
  // }

  beforeUpload = file => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
      message.error('图片格式仅支持JPG和PNG格式！')
    }
    return isJpgOrPng
  }

  customRequest = (option) => {
    const corpId = utils.getUrlQueryString(this.props.location.search, 'corpId')
    let formData = new window.FormData()
    formData.append('file', option.file, option.file.name)
    formData.append('bizKey', 'pplink/company')
    formData.append('corpId', corpId)
    axios.post(urls.uploadImg, formData, {headers: {'Content-Type': 'multipart/form-data'}}).then(res => {
      if (res.ret === 0) {
        const managerQRCodeUrl = res.retdata.filePath
        this.setState({ info: {...this.state.info, managerQRCodeUrl} })
      }
    }).catch(() => {
      // this.setState({ isUploading: false })
    })
  }

  showInput = () => {
    this.setState({ inputVisible: true }, () => this.input.focus())
  }

  handleInputChange = e => {
    this.setState({ inputValue: e.target.value })
  }

  handleInputConfirm = () => {
    const { inputValue } = this.state
    let { corpTag } = this.state.info
    if (!corpTag) {
      corpTag = []
    }
    if (inputValue && corpTag.indexOf(inputValue) === -1) {
      corpTag = [...corpTag, inputValue]
    }
    this.setState({
      info: { ...this.state.info, corpTag },
      inputVisible: false,
      inputValue: ''
    })
  }

  saveInputRef = input => (this.input = input)

  handleClose = removedTag => {
    const nextCorpTag = this.state.info.corpTag.filter(tag => tag !== removedTag)
    this.setState({ info: { ...this.state.info, corpTag: nextCorpTag } })
  }

  handleSubmit = () => {
    const { info } = this.state
    const params = {...info}
    delete params.providerId
    delete params.branchName
    axios.post(urls.editEnterpriseInfo, params, {headers: {'Content-Type': 'application/json'}}).then(res => {
      message.success('修改成功')
      this.timer = setTimeout(() => {
        this.props.history.goBack()
      }, 1000)
    }).catch(() => {
      message.error('修改失败')
    })
  }

  goBack = () => {
    this.props.history.goBack()
  }

  render () {
    const {
      info,
      initLoading,
      loading,
      inputVisible,
      inputValue
    } = this.state
    if (!info) {
      return <Spin spinning={initLoading} tip='数据获取中...'><div>暂无数据</div></Spin>
    }
    const {
      corpLocation,
      corpName,
      corpTag,
      corpType,
      manager,
      payNum,
      managerQRCodeUrl,
      branchId
    } = info
    const uploadButton = (
      <div>
        <Icon type={loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">上传二维码</div>
      </div>
    )
    return (
      <div className={styles.enterpriseDetail}>
        <div className={styles.title_view}>企业员工列表/编辑</div>
        <div className={styles.info_view}>
          <div className={styles.title}>企业信息</div>
          <div className={styles.content_view}>
            <span className={styles.info_item}>
              <span className={styles.name}>企业名称</span>
              <Input style={{width: 250}} value={corpName} onChange={this.onChangeName} placeholder="请输入企业名称"/>
            </span>
            <span className={styles.info_item}>
              <span className={styles.name}>企业类别</span>
              <Input style={{width: 250}} value={corpType} onChange={this.onChangeType} placeholder="请输入企业类别"/>
            </span>
            <span className={styles.info_item}>
              <span className={styles.name}>企业地址</span>
              <Input style={{width: 250}} value={corpLocation} onChange={this.onChangeLocation} placeholder="请输入企业地址"/>
            </span>
          </div>
        </div>

        <div className={styles.info_view}>
          <div className={styles.title}>银行信息</div>
          <div className={styles.content_view}>
            <span className={styles.info_item}>
              <span className={styles.name}>归属分支行</span>
              <DeptTreeSelect multiple={false} style={{ width: 250 }} value={branchId} onChange={this.selectDept}/>
            </span>
            <span className={styles.info_item}>
              <span className={styles.name}>总发薪员工</span>
              <Input style={{width: 250}} value={payNum} onChange={this.onChangeStaffCount} placeholder="请输入数量"/>
            </span>

            <span className={styles.info_item}>
              <span className={styles.name}>归属客户经理</span>
              <Input style={{width: 200}} value={manager} onChange={this.onChangeOwnerManager} placeholder="请输入"/>
            </span>

            <div className={styles.upload_img}>
              <span className={styles.upload_img_name}>客户经理企业微信二维码</span>
              <Upload
                name="avatar"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                // action={urls.uploadImg}
                beforeUpload={this.beforeUpload}
                // onChange={this.handleChange}
                customRequest={this.customRequest}
              >
                {managerQRCodeUrl ? <img src={managerQRCodeUrl} alt="二维码" style={{ width: '100%' }} /> : uploadButton}
              </Upload>
            </div>

          </div>
        </div>

        <div className={[styles.info_view]}>
          <div className={styles.title}>标签信息</div>
          <div className={[styles.content_view]} style={{padding: 20}}>
            <div className={styles.label_item}>
              <span style={{ marginRight: 20 }}>标签</span>
              {corpTag ? corpTag.map(tag => {
                const tagElem = (
                  <Tag key={tag} color='blue' closable={true} onClose={() => this.handleClose(tag)}>
                    {tag}
                  </Tag>
                )
                return tagElem
              }) : null}
              {inputVisible && (
                <Input
                  ref={this.saveInputRef}
                  type="text"
                  size="small"
                  style={{ width: 78 }}
                  value={inputValue}
                  onChange={this.handleInputChange}
                  onBlur={this.handleInputConfirm}
                  onPressEnter={this.handleInputConfirm}
                />
              )}
              {!inputVisible && (
                <Tag color='green' onClick={this.showInput} style={{ background: '#fff', borderStyle: 'dashed' }}>
                  <Icon type="plus" /> 添加标签
                </Tag>
              )}
            </div>
          </div>
        </div>
        <div className={styles.submit_view}>
          <Button type={'primary'} style={{marginRight: 20}} onClick={this.goBack}>返回</Button>
          <Button type={'primary'} onClick={this.handleSubmit}>提交修改</Button>
        </div>
      </div>
    )
  }
}

export default EnterpriseEdit
