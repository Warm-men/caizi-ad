import React, { Component } from 'react'
import { Input, TreeSelect, Spin, Button, Form, Upload, message, Avatar, Radio } from 'antd'
import { withRouter } from 'react-router-dom'
import axios from '@src/utils/axios'
import urls from '@src/config'
import styles from './index.less'
import PageHeaderHoc from '@src/components/PageHeaderHoc'
import { connect } from 'react-redux'

const mapStateToProps = (state) => {
  return {
    deptList: state.base.deptList
  }
}

@connect(mapStateToProps)
@withRouter
class showPosterEdit extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      type: '', // 编辑或新增
      title: '',
      postImg: '', // 上传海报
      inputName: '',
      orgValue: [], // 所选机构id
      configOrgTree: props.deptList,
      btnLoading: false,
      id: '',
      loadingSpin: false,
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      posterCustomizedInfo: '1', // 海报定制信息
      customInfo: '0', // 自定义信息
      moveContainerVisible: 'hidden', // 示例框是否展示 hidden
      moveBoxVisible: 'hidden', // 二维码是否展示
      customRadioVisible: 'none', // 自定义信息是否展示 none
      containerHeight: 0,
      rate: 0
    }
  }

  componentDidMount () {
    const data = this.props.location.query
    if (data === undefined) {
      return this.props.history.push('/posterSetting')
    }
    if (data.type === 'edit') { // 编辑
      let editData = data.data
      this.setState({
        title: '编辑海报',
        type: 'edit',
        id: data.data.id,
        inputName: editData.name,
        postImg: editData.url,
        orgValue: editData.dept,
        posterCustomizedInfo: editData.posterDiyType,
        moveBoxVisible: editData.codeShow ? '' : 'hidden',
        customInfo: editData.codeShow ? '1' : '0',
        width: editData.codeWidth ? Number(editData.codeWidth) : 100,
        height: editData.codeLong ? Number(editData.codeLong) : 100,
        x: Number(editData.codePositionX),
        y: Number(editData.codePositionY),
        customRadioVisible: editData.posterDiyType === '2' ? '' : 'none',
        moveContainerVisible: editData.posterDiyType === '2' ? '' : 'hidden'
      }, () => {
        let img = new window.Image()
        img.src = this.state.postImg
        img.onload = () => {
          this.setState({
            containerHeight: (375 / img.width) * img.height
            // rate: 350 / img.width
          }, () => {
            this.move()
            this.reSize()
          })
        }
      })
    } else { // 新增
      this.setState({
        title: '新增海报',
        type: 'add'
      })
    }
  }
  // 图片移动
  move = () => {
    var _this = this
    var box = document.getElementById('box')
    var fa = document.getElementById('father')
    box.onmousedown = function (ev) {
      var oEvent = ev
      // 浏览器有一些图片的默认事件,这里要阻止
      oEvent.preventDefault()
      var disX = oEvent.clientX - box.offsetLeft
      var disY = oEvent.clientY - box.offsetTop
      fa.onmousemove = function (ev) {
        oEvent = ev
        oEvent.preventDefault()
        var x = oEvent.clientX - disX
        var y = oEvent.clientY - disY
        // 图形移动的边界判断
        x = x <= 0 ? 0 : x
        x = x >= fa.offsetWidth - box.offsetWidth ? fa.offsetWidth - box.offsetWidth : x
        y = y <= 0 ? 0 : y
        y = y >= fa.offsetHeight - box.offsetHeight ? fa.offsetHeight - box.offsetHeight : y
        box.style.left = x + 'px'
        box.style.top = y + 'px'
        _this.setState({
          x,
          y
        }, () => {
          // console.log(_this.state.x, _this.state.y, _this.state.width, _this.state.height)
        })
      }
      // 图形移出父盒子取消移动事件,防止移动过快触发鼠标移出事件,导致鼠标弹起事件失效
      fa.onmouseleave = function () {
        fa.onmousemove = null
        fa.onmouseup = null
      }
      // 鼠标弹起后停止移动
      fa.onmouseup = function () {
        fa.onmousemove = null
        fa.onmouseup = null
      }
    }
  }
  // 改变大小
  reSize = () => {
    const {containerHeight} = this.state
    var _this = this
    var box = document.getElementById('box')
    var fa = document.getElementById('father')
    var scale = document.getElementById('scale')
    scale.onmousedown = function (e) {
      // 阻止冒泡,避免缩放时触发移动事件
      e.stopPropagation()
      e.preventDefault()
      var pos = {
        'w': box.offsetWidth,
        'h': box.offsetHeight,
        'x': e.clientX,
        'y': e.clientY
      }
      fa.onmousemove = function (ev) {
        ev.preventDefault()
        // 设置图片的最小缩放为30*30
        var w = Math.max(30, ev.clientX - pos.x + pos.w)
        // var h = Math.max(30, ev.clientY - pos.y + pos.h)
        var h = 1 * w // 设置高与宽的比例
        // 设置图片的最大宽高
        w = w >= fa.offsetWidth - box.offsetLeft ? fa.offsetWidth - box.offsetLeft : w
        h = h >= fa.offsetHeight - box.offsetTop ? fa.offsetHeight - box.offsetTop : h
        // console.log(500 - h, h, h + _this.state.y, containerHeight)
        if (h + _this.state.y > containerHeight) {
          fa.onmousemove = null
          fa.onmouseup = null
          return
        }
        box.style.width = w + 'px'
        box.style.height = h + 'px'
        _this.setState({
          width: w,
          height: h
        }, () => {
          // console.log(_this.state.x, _this.state.y, _this.state.width, _this.state.height)
        })
      }
      fa.onmouseleave = function () {
        fa.onmousemove = null
        fa.onmouseup = null
      }
      fa.onmouseup = function () {
        fa.onmousemove = null
        fa.onmouseup = null
      }
    }
  }
  // 海报定制信息
  onPosterRadioChange = (e) => {
    if (e.target.value === '2') {
      this.setState({
        moveContainerVisible: '',
        customRadioVisible: ''
      })
    } else {
      this.setState({
        moveContainerVisible: 'hidden',
        customRadioVisible: 'none'
      })
    }
    this.setState({
      posterCustomizedInfo: e.target.value
    }, () => {
      // console.log(this.state.posterCustomizedInfo)
    })
  }

  // 自定义信息
  onCustomRadioChange = (e) => {
    const {postImg} = this.state
    if (e.target.value === '1') {
      if (postImg === '') {
        return message.warning('请先上传图片')
      }
      this.setState({
        moveBoxVisible: ''
      })
    } else {
      this.setState({
        moveBoxVisible: 'hidden'
      })
    }
    this.setState({
      customInfo: e.target.value
    }, () => {
      // console.log(this.state.customInfo)
    })
  }

  // 保存方法
  handleSave = (e, type) => {
    let { inputName, postImg, orgValue, id, posterCustomizedInfo, customInfo, width, height, x, y, rate } = this.state
    if (postImg === '') {
      return message.warn('图片不能为空')
    }
    if (inputName.trim() === '') {
      return message.warn('名称不能为空')
    }
    if (!orgValue.length) {
      return message.warn('机构名称不能为空')
    }
    this.setState({
      btnLoading: true
    })
    let codeshow = false
    if (customInfo === '1') { codeshow = true }
    let url = type === 'add' ? urls.savePosterAdd : urls.savePosterEdit
    let data = {
      name: inputName,
      url: postImg,
      dept: orgValue,
      posterDiyType: posterCustomizedInfo,
      codeShow: codeshow,
      codeLong: height,
      codeWidth: width,
      codePositionX: x,
      codePositionY: y
    }
    if (type === 'edit') {
      data = Object.assign({}, data, { id })
    }
    axios.post(url, data, { headers: { 'Content-Type': 'application/json' } }).then((res) => {
      if (res.ret !== 0) {
        message.error('保存失败：' + res.retmsg)
        this.setState({
          btnLoading: false
        })
      } else {
        this.setState({
          btnLoading: false
        })
        this.props.history.push('/posterSetting')
        setTimeout(() => {
          message.success('成功')
        }, 500)
      }
    }).catch(() => {
      this.setState({
        btnLoading: false
      })
    })
  }

  // 限制图片上传图片类型 阻止发送请求
  beforeUploadImg = (file) => {
    const isPngOrJpeg = file.type === 'image/jpeg' || file.type === 'image/png'
    const isLt2M = file.size / 1024 / 1024 < 8
    if (!isPngOrJpeg) {
      message.error('只能上传jpg、jpeg、png格式的图片')
      return false
    }
    if (!isLt2M) {
      message.error('图片必须8M以内')
      return false
    }
    this.setState({
      loadingSpin: true
    })
    return true
  }

  // 图片上传
  handleChangeImg = (info) => {
    const {width, height} = this.state
    if (info.file.status === 'done') {
      if (info.file['response'].ret === 0) {
        const tempImg = info.file['response']['retdata']['filePaths'][0]
        let img = new window.Image()
        img.src = tempImg
        img.onload = () => {
          this.setState({
            containerHeight: (350 / img.width) * img.height,
            // rate: 350 / img.width,
            y: (350 / img.width) * img.height - height - 10,
            x: 350 - width - 5
          }, () => {
            this.move()
            this.reSize()
          })
        }
        this.setState({ postImg: tempImg }, () => {
          setTimeout(() => {
            this.setState({
              loadingSpin: false
            })
          }, 500)
        })
        message.success('上传图片成功')
      } else {
        message.error(info.file['response'].retmsg)
      }
    }
  }

  render () {
    const { title, postImg, inputName, orgValue, configOrgTree, type, btnLoading, loadingSpin, posterCustomizedInfo, customInfo,
      moveContainerVisible, moveBoxVisible, customRadioVisible, width, height, x, y, containerHeight } = this.state
    const itemCol1 = {
      labelCol: {span: 5},
      wrapperCol: {span: 18}
    }
    return (
      <div className={styles.showPosterEditContainer} style={{minWidth: 1012}}>
        <div style={{width: 600}}>
          <Spin spinning={loadingSpin} tip='图片上传中'>
            <PageHeaderHoc
              onBack={this.props.history.goBack}
              subTitle={title}
            />
            <div className={styles.posterBtnContainer}>
              <div className={styles.content}>
                <Form.Item label={<span><span className={'red'}>*</span>海报</span>} {...itemCol1}>
                  <div style={{marginBottom: 20}}>
                    <Upload
                      action={urls.bannerUpload}
                      onChange={this.handleChangeImg}
                      beforeUpload={this.beforeUploadImg}
                      showUploadList={false}
                    >
                      <Button type="primary">上传</Button>
                    </Upload>
                  </div>
                  <div className={styles.img}>
                    <Avatar shape="square" size={140} src={postImg} />
                  </div>
                  <div className={styles.text}>
                    <p>1.宽度固定为750 高度应该是不小于1100PX</p>
                    <p>2.支持格式JPG，PNG</p>
                  </div>
                </Form.Item>

                <Form.Item label={<span><span className={'red'}>*</span>名称</span>} {...itemCol1}>
                  <Input value={inputName}
                    placeholder='请输入名称'
                    style={{ width: 370 }}
                    maxLength={10}
                    onChange={(e) => { this.setState({ inputName: e.target.value }) }} />
                </Form.Item>

                <Form.Item label={<span><span className={'red'}>*</span>机构名称</span>} {...itemCol1}>
                  <TreeSelect
                    style={{ width: 350 }}
                    value={orgValue}
                    dropdownStyle={{ overflow: 'auto' }}
                    placeholder="请选择机构"
                    treeDefaultExpandedKeys={[configOrgTree[0].id]}
                    allowClear={false}
                    dropdownStyle={{ maxHeight: '40vh', overflow: 'auto' }}
                    multiple={false}
                    onChange={(value) => { this.setState({ orgValue: value }) }}
                    treeData={configOrgTree}
                  >
                  </TreeSelect>
                </Form.Item>

                <Form.Item label={'海报定制信息'} {...itemCol1}>
                  <Radio.Group value={posterCustomizedInfo} onChange={this.onPosterRadioChange} size="small" buttonStyle="solid">
                    <Radio value="1">员工自定义</Radio>
                    <Radio value="2">管理员自定义</Radio>
                  </Radio.Group>
                </Form.Item>

                {customRadioVisible && <Form.Item label={'自定义信息'} {...itemCol1}>
                  <Radio.Group value={customInfo} onChange={this.onCustomRadioChange} size="small" buttonStyle="solid">
                    <Radio value="1">员工二维码（企业微信二维码）</Radio>
                    <Radio value="0">无</Radio>
                  </Radio.Group>
                </Form.Item>}

              </div>
            </div>
            <Form.Item wrapperCol={{offset: 5}}>
              <Button style={{marginRight: 10}} type="default" onClick={this.props.history.goBack}>取消</Button>
              <Button loading={btnLoading} type="primary" onClick={(e) => { this.handleSave(e, type) }}>保存</Button>
            </Form.Item>
          </Spin>
        </div>
        <div id="father" style={{visibility: moveContainerVisible, height: containerHeight, backgroundImage: `url(${postImg})`}} className={styles.dragContainer}>
          <div id="box"
            style={{visibility: customInfo === '0' ? 'hidden' : '', width: width, height: height, left: x, top: y}}
            className={styles.box}>
            <img src={require('@src/assets/erweima.png')} className={styles.img}/>
            <div id="scale" className={styles.scale}></div>
          </div>
          <div style={{visibility: customInfo === '0' ? 'hidden' : ''}} className={styles.tipText}>提示1：可拖动二维码进行调整位置与大小</div>
          <div style={{visibility: customInfo === '0' ? 'hidden' : ''}} className={styles.tipText2}>提示2：鼠标放置二维码右下角可进行改变大小</div>
        </div>
      </div>
    )
  }
}

export default showPosterEdit
