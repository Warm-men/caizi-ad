import React, { Component } from 'react'
import { Form, Select, Input, Row, Button, Col, DatePicker, Radio, Collapse, InputNumber, message, Tooltip, Upload, Icon, Spin, Modal } from 'antd'
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { withRouter } from 'react-router-dom'
import SpeechIssueModal from './speechIssueModal'
import ProductPreView from './productPreView'
import Cropper from 'react-cropper'
import axios from '@src/utils/axios'
import DeptTreeSelect from '@src/components/DeptTreeSelect'
import urls from '@src/config'
import moment from 'moment'
import BraftEditor from '@src/components/braftEditor'
import { connect } from 'react-redux'
import store from '@src/store'
import 'cropperjs/dist/cropper.css'
const { TextArea } = Input
const { Panel } = Collapse
const mapStateToProps = (state) => {
  return {
    isJYBank: state.base.isJYBank
  }
}

// props isAdd 是否是添加产品
@connect(mapStateToProps)
class ProductDetailEdit extends Component {
  constructor(props, context) {
    super(props)
    this.state = {
      publicProductTypeList: [], // 对公产品类型列表
      retailProductTypeList: [], // 零售产品类型列表
      currentProductTypeList: [], // 当前产品类型列表
      businessType: '', // 业务类型 1-对公业务 2-零售业务
      productTypeId: undefined, // 产品类别ID
      type: 1, // 产品是否是理财产品 1理财产品 2非理财产品
      name: '', // 产品名称
      risk: '', // 风险评级
      code: '', // 产品代码
      income: '', // 产品收益
      incomeRate: '', // 收益率
      incomeValue: '',
      leatAmount: '', // 起购金额
      dueTime: '', // 投资期限
      feature: '', // 产品特点
      productLink: '', // 跳转链接
      isPush: 0, // 是否主推产品 0否 1是
      descType: 0, // 0手动编写的描述 1导入的文件描述 3粘贴链接
      desc: '', // 描述
      startDate: undefined, // 推广开始日期
      endDate: undefined, // 推广结束日期
      interestStartDate: undefined, // 起息日期
      interestEndDate: undefined, // 到期日期
      isEmptyEditor: false, // 是否清空编辑器
      fileList: [], // 上传文件列表
      isUploading: false, // 上传文件中
      isIniting: false, // 进页面初始化中
      previewDescFileList: [], // 描述上传文件预览图
      publicUrl: '',
      chargeDept: [],
      secondRepost: 0,
      speechIssueModal: false, // 话术常见问题选择弹窗
      issueIdList: [],
      speechIdList: [],
      rateType: 0,
      putOnTime: null, // 上架时间
      putOffTime: null, // 下架时间
      dueTimeUnit: '无',
      hasProductSync: false, // 产品数据更新
      productSync: 0,
      applicationStatus: false, // 是否预约申请
      isParseHtml: false,
      isLoadingParseHtml: false,
      isUpdateDescFromService: false,
      productOptions: [], // 产品要素
      productViewVisible: false,
      currency: 'NONE',
      danger: '',
      increaseAmount: '',
      raiseType: 'NONE',
      raiseStartTime: null,
      raiseEndTime: null,
      btnLoading: false,
      basicListBtnVisible: false,
      incomeRateIsCustomize: 0,
      isJYBank: props.isJYBank,
      cropping: false,
      price: '', // 价格
      specification: '', // 规格
      introductionIconList: [] // 产品简介图集合
    }
  }

  componentDidMount () {
    this.storeSubscribe()
    this.cropInit()
    this.getProductTypeList().then(() => {
      if (!this.props.isAdd) {
        // 编辑
        const id = this.props.location.search.split('=')[1]
        axios.post(urls.getProductDetail, { id }).then((res) => {
          const { detail } = res.retdata
          const {startDate, endDate, interestStartDate, interestEndDate, income, incomeRate, desc, descType,
            businessType, secondRepost, hasProductSync, productSync, type, putOnTime, putOffTime, incomeRateIsCustomize,
            raiseStartTime, raiseEndTime, thumbNailPicUrl, applicationStatus = false, introductionIconUrl
          } = detail
          const { publicProductTypeList, retailProductTypeList } = this.state
          let RateMin = ''
          let RateMax = ''
          let incomeRateOther = ''
          let rate = ''
          let rateType = 0
          if (incomeRateIsCustomize === 1) {
            rateType = 2
            incomeRateOther = incomeRate
          } else {
            if (type === 1) { // 如果 incomeRateIsCustomize 为 1 则为自定义收益率
              const arr = incomeRate.split('~') || []
              rateType = arr[1] ? 1 : 0
              if (rateType === 0) { // 收益率
                RateMin = ''
                RateMax = ''
                rate = incomeRate
              } else { // 收益范围
                RateMin = arr[0]
                RateMax = arr[1]
                rate = ''
              }
            }
          }
          let currentDesc = ''
          let currentPublicUrl = ''
          let previewDescFileList
          let isParseHtml = false
          let newDescType = null
          if (descType === 0) {
            // 手动编辑器输入
            currentDesc = desc
            currentPublicUrl = ''
            previewDescFileList = []
            newDescType = descType
          } else if (descType === 2 || descType === 3) {
            // 手动输入公众号
            currentDesc = desc
            currentPublicUrl = ''
            previewDescFileList = []
            isParseHtml = true
            newDescType = 3
          } else {
            // 文件上传
            currentDesc = ''
            currentPublicUrl = ''
            newDescType = descType
            previewDescFileList = desc.split(',')
          }
          let dueTime, dueTimeUnit
          let Unit = ['无', '天', '周', '月', '年']
          if (detail.dueTime.length) {
            let due = detail.dueTime.substr(0, detail.dueTime.length - 1)
            let dueUnit = detail.dueTime.substr(detail.dueTime.length - 1)
            if (Unit.includes(dueUnit)) {
              dueTime = due
              dueTimeUnit = dueUnit
            } else {
              dueTime = detail.dueTime
              dueTimeUnit = '无'
            }
          }
          // 产品简介缩略图
          let introductionIconList = []
          if (introductionIconUrl) {
            let iconList = introductionIconUrl.split(',')
            iconList.forEach((item, index) => {
              introductionIconList.push({
                uid: `-${index + 1}`,
                status: 'done',
                thumbUrl: item,
                url: item
              })
            })
          }
          this.setState({
            ...detail,
            issueIdList: detail.issueIdList ? detail.issueIdList.split(',') : [],
            speechIdList: detail.speechIdList ? detail.speechIdList.split(',') : [],
            chargeDept: detail.deptList.map((obj) => obj.deptId),
            isIniting: false,
            startDate: startDate && moment(startDate),
            endDate: endDate && moment(endDate),
            interestStartDate: interestStartDate && moment(interestStartDate),
            interestEndDate: interestEndDate && moment(interestEndDate),
            raiseStartTime: raiseStartTime && moment(raiseStartTime),
            raiseEndTime: raiseEndTime && moment(raiseEndTime),
            incomeRateMin: RateMin,
            incomeRateMax: RateMax,
            incomeRate: rate,
            incomeRateOther,
            // incomeRate: detail.incomeRate,
            desc: currentDesc,
            isUpdateDescFromService: true,
            publicUrl: currentPublicUrl,
            previewDescFileList: previewDescFileList,
            currentProductTypeList: businessType === 1 ? publicProductTypeList : retailProductTypeList,
            productTypeId: detail.productTypeId,
            secondRepost: secondRepost || 0,
            rateType,
            dueTimeUnit,
            dueTime,
            putOnTime: putOnTime && moment(putOnTime),
            putOffTime: putOffTime && moment(putOffTime),
            hasProductSync,
            productSync,
            applicationStatus: applicationStatus ? 1 : 0,
            isParseHtml,
            descType: newDescType,
            productOptions: detail.basicList || [],
            thumbNailPicUrl: thumbNailPicUrl ? [{ uid: '00', status: 'done', thumbUrl: thumbNailPicUrl, url: thumbNailPicUrl }] : [],
            introductionIconList
          })
        })
      } else {
        // 新增
        var nowdate = new Date()
        var m = nowdate.getMonth() + 1
        nowdate.setMonth(nowdate.getMonth() + 1)
        var y = nowdate.getFullYear()
        var mm = nowdate.getMonth() + 1
        var d = nowdate.getDate()
        var putontime = y + '-' + m + '-' + d
        var putofftime = y + '-' + mm + '-' + d
        const { retailProductTypeList } = this.state
        this.setState({
          putOnTime: moment(putontime),
          putOffTime: moment(putofftime),
          isIniting: false,
          // 设置初始业务类型
          businessType: 2,
          // 设置产品类别列表
          currentProductTypeList: retailProductTypeList,
          // 设置产品类别为列表第一个
          productTypeId: retailProductTypeList[0] && retailProductTypeList[0]['productTypeId'],
          // 是否理财产品 根据产品类别列表第一个
          type: retailProductTypeList[0] && retailProductTypeList[0]['type']
        })
      }
    })
  }
  // redux监听
  storeSubscribe = () => {
    store.subscribe(() => {
      const state = store.getState()
      const { isJYBank } = state.base
      if (isJYBank !== undefined) {
        this.setState({ isJYBank })
      }
    })
  }
  // 裁剪插件
  cropInit = () => {
    this.fileReader = new window.FileReader()
    this.fileReader.onload = (e) => {
      const dataURL = e.target.result
      this.setState({ cropperSrc: dataURL })
    }
  }
  // 通过url获取文件名
  getFileName = (url) => {
    const arr1 = url.split('/')
    const arr2 = arr1[arr1.length - 1].split('.')
    return arr2[0]
  }
  // 获取产品类别列表
  getProductTypeList = () => {
    this.setState({ isIniting: true })
    return axios.all([this.getPublicProductTypeList(), this.getRetailProductTypeList()])
      .then(axios.spread((publicRes, retailRes) => {
        this.setState({
          publicProductTypeList: publicRes.retdata.list || [],
          retailProductTypeList: retailRes.retdata.list || [],
          hasProductSync: !!retailRes.retdata.hasProductSync
        })
      })
      )
  }
  // 对公业务列表
  getPublicProductTypeList = () => {
    return axios.post(urls.getProductTypeList, { businessType: 1 })
  }
  // 零售业务列表
  getRetailProductTypeList = () => {
    return axios.post(urls.getProductTypeList, { businessType: 2 })
  }
  // 切换业务类型
  onChangeBusinessType = (value) => {
    const { publicProductTypeList, retailProductTypeList } = this.state
    const currentProductTypeList = value === 1 ? publicProductTypeList : retailProductTypeList
    this.setState(
      {
        currentProductTypeList,
        productTypeId: currentProductTypeList[0] && currentProductTypeList[0]['productTypeId'],
        businessType: value
      },
      () => this.resetFileds()
    )
  }
  // 切换币种
  onChangeCurrency = (value) => {
    this.setState({ currency: value })
  }
  // 切换产品类别
  onChangeProductType = (value, { props }) => {
    this.setState({ productTypeId: value, type: props.type }, () => this.resetFileds())
  }
  // 切换业务类型或者产品类别后 重新初始化属性 type risk income incomeRate leatAmount dueTime
  resetFileds = () => {
    const type = this.getTypeByProductType(this.state.currentProductTypeList, this.state.productTypeId)
    this.setState({
      type,
      risk: '',
      income: '',
      incomeRate: '',
      incomeValue: '',
      leatAmount: '',
      price: '',
      specification: '',
      dueTime: '',
      dueTimeUnit: '无',
      interestStartDate: undefined,
      interestEndDate: undefined,
      raiseStartTime: undefined,
      raiseEndTime: undefined
    })
  }
  // currentProductTypeList中通过productType获取type
  getTypeByProductType = (currentProductTypeList, productTypeId) => {
    const list = currentProductTypeList.filter((obj) => obj.productTypeId === productTypeId)
    return list[0] && list[0]['type']
  }
  // 编辑器输入
  onChangeEditor = (editorHtml) => {
    this.setState({ desc: editorHtml, isUpdateDescFromService: false })
  }
  // 是否pdf|doc|docx文件
  checkFile = (fileName) => {
    const reg = /^.*\.(?:pdf|doc|docx)$/i
    return reg.test(fileName)
  }
  // 上传前 校验文件
  beforeUpload = (file, fileList) => {
    const checked = this.checkFile(file.name)
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!checked) {
      return message.error('只能上传pdf、doc、docx格式的文件')
    }
    if (!isLt5M) {
      return message.error('文件必须5M以内')
    }
    this.setState({ fileList: [file] })
  }
  // 上传文件
  onChangeUpload = ({ file, fileList }) => {
    if (file.status === 'uploading') {
      this.setState({ isUploading: true })
      return
    }
    if (file.status === 'done') {
      if (file.response.ret === -1) {
        this.setState({ fileList: [], isUploading: false })
        message.warning('上传失败')
      } else {
        this.setState({ fileList: [], isUploading: false, previewDescFileList: file.response.retdata.filePaths })
      }
    }
  }
  // 删除上传的文件
  onRemoveUpload = (file) => {
    this.setState({ fileList: [] })
  }
  // 缩略图上传前判断
  beforeUpload2 = (file) => {
    const { name } = file
    const typeArr = name.split('.')
    const type = typeArr[typeArr.length - 1]
    if (!['png', 'jpg', 'jpeg', 'gif'].includes(type)) {
      message.error('只能上传png、jpg、jpeg、gif格式的图片！')
      return false
    }
    const sizeLimit = file.size / 1024 / 1024 > 2
    if (sizeLimit) {
      message.error('图片大小不能超过2M')
      return false
    }
    return true
  }
  // 缩略图change
  litimgChange = (fileObj) => {
    const { file } = fileObj
    const { status } = file
    if (status === 'done' || status === 'uploading') {
      this.fileName = file.name
      this.fileReader.readAsDataURL(file.originFileObj)
    }
    this.setState({ thumbNailPicUrl: null })
  }
  // 裁剪ok点击事件
  cropOk = () => {
    this.setState({ cropping: true })
    this.cropper.getCroppedCanvas().toBlob((blob) => {
      const newFormData = new window.FormData()
      const file = new window.File([blob], this.fileName, { type: blob.type })
      newFormData.append('file', file, this.fileName)
      axios
        .post(urls.choicestUpload, newFormData, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then((res) => {
          if (res.ret === 0) {
            const { filePaths = [] } = res.retdata
            this.setState({ thumbNailPicUrl: [{ uid: '00', status: 'done', thumbUrl: filePaths[0], url: filePaths[0] }], cropperSrc: '', cropping: false })
          }
        })
        .catch(() => {
          this.setState({ cropperSrc: '', cropping: false })
        })
    })
  }
  // 编辑器中是否全是空格
  haveDescInEditor = (desc) => {
    let str = ''
    str = desc.replace(/&nbsp;|<p>|<\/p>/g, '')
    return str.trim() !== ''
  }
  // 必填字段是否都填写
  haveInputRequired = () => {
    const { name, income, rateType, incomeRate, incomeRateMin, incomeRateMax, incomeRateOther, type, desc, isPush, startDate, endDate, descType, previewDescFileList,
      publicUrl, putOnTime, putOffTime, dueTime, feature, risk, leatAmount, chargeDept } = this.state
    const hasLiftDate = putOnTime && putOffTime
    const haveDesc = descType === 0 || descType === 3 ? this.haveDescInEditor(desc) : previewDescFileList.length || publicUrl.length
    if (type === 1) {
      const haveIncomeRate = income ? rateType === 1 ? (incomeRateMin && incomeRateMax) : rateType === 2 ? incomeRateOther : incomeRate : false
      return (isPush === 1)
        ? name.trim() && feature.trim() && haveDesc && haveIncomeRate && startDate && endDate && hasLiftDate && dueTime && risk.trim() && leatAmount.trim() && chargeDept.length
        : name.trim() && feature.trim() && haveDesc && haveIncomeRate && hasLiftDate && dueTime && risk.trim() && leatAmount.trim() && chargeDept.length
    } else {
      return isPush === 1
        ? name.trim() && feature.trim() && haveDesc && startDate && endDate && hasLiftDate && chargeDept.length
        : name.trim() && feature.trim() && haveDesc && hasLiftDate && chargeDept.length
    }
  }
  // 时间校验
  checkTimeValid = () => {
    const { putOffTime, putOnTime, startDate, endDate, interestStartDate, interestEndDate } = this.state
    if (moment(putOffTime).isBefore(putOnTime)) {
      return message.error('下架时间应该晚于上架时间！')
    }
    // if (moment(interestEndDate).isBefore(interestStartDate)) {
    //   message.error('到期日期应该晚于起息日期！')
    //   return false
    // }
    return true
  }
  submit = () => { // 提交
    if (this.isLoading) return
    this.isLoading = true
    const { isAdd, location, history } = this.props
    const isPassCheckTimeValid = this.checkTimeValid()
    if (!isPassCheckTimeValid) return null
    let {businessType, productTypeId, type, name, risk, code,
      income, incomeRate, leatAmount, dueTime, dueTimeUnit, feature, productLink, desc, isPush, descType,
      startDate, endDate, previewDescFileList, interestStartDate, interestEndDate, chargeDept, secondRepost,
      issueIdList, speechIdList, putOnTime, putOffTime, productSync, productOptions, incomeRateMin, incomeRateMax, incomeRateOther, rateType,
      currency, increaseAmount, raiseType, raiseStartTime, raiseEndTime, danger, incomeRateIsCustomize, thumbNailPicUrl, applicationStatus,
      price, specification, introductionIconList
    } = this.state

    let imgUrl = ''
    try {
      imgUrl = thumbNailPicUrl[0].url || thumbNailPicUrl[0].response.retdata.filePaths[0]
    } catch (err) {}

    for (let item of productOptions) {
      if (!item.key || !item.value) {
        this.isLoading = false
        return message.warn('产品要素不能为空')
      }
    }
    if (productLink.trim().length > 1000) {
      this.isLoading = false
      return message.warn('跳转链接不得超过1000个字符')
    }
    if (!chargeDept.length) {
      this.isLoading = false
      return message.warn('请选择机构')
    }
    if (interestStartDate && raiseEndTime && type === 1 && moment(raiseEndTime).isAfter(interestStartDate)) {
      this.isLoading = false
      return message.error('募集结束日期应该不早于起息日期！')
    }
    let introductionIconUrl = ''
    introductionIconList.length && (introductionIconUrl = introductionIconList.map(item => item.url).join(','))

    const data = {
      businessType,
      name,
      risk,
      code,
      income,
      leatAmount,
      incomeRate: type === 1 ? (rateType === 1 ? `${incomeRateMin}~${incomeRateMax}` : (rateType === 2) ? incomeRateOther : incomeRate) : '',
      incomeRateIsCustomize: rateType === 2 ? 1 : 0,
      dueTime: dueTime + dueTimeUnit,
      feature,
      productLink,
      descType,
      isPush,
      type,
      productSync,
      applicationStatus: !!applicationStatus,
      increaseAmount,
      desc: descType === 0 ? desc : descType === 1 ? previewDescFileList.join(',') : desc,
      productTypeId: productTypeId || '',
      startDate: startDate ? startDate.format('YYYY-MM-DD') : '',
      endDate: endDate ? endDate.format('YYYY-MM-DD') : '',
      interestStartDate: interestStartDate ? interestStartDate.format('YYYY-MM-DD') : '',
      interestEndDate: interestEndDate ? interestEndDate.format('YYYY-MM-DD') : '',
      deptIds: chargeDept.join(','),
      secondRepost: secondRepost,
      issueIdList: issueIdList ? issueIdList.join(',') : '',
      speechIdList: speechIdList ? speechIdList.join(',') : '',
      putOnTime: putOnTime ? putOnTime.format('YYYY-MM-DD') : '',
      putOffTime: putOffTime ? putOffTime.format('YYYY-MM-DD') : '',
      currency: currency === 'NONE' ? '' : currency,
      raiseType: raiseType === 'NONE' ? '' : raiseType,
      raiseStartTime: raiseStartTime ? raiseStartTime.format('YYYY-MM-DD') : '',
      raiseEndTime: raiseEndTime ? raiseEndTime.format('YYYY-MM-DD') : '',
      danger,
      basicList: JSON.stringify(productOptions),
      thumbNailPicUrl: type === 1 ? '' : imgUrl,
      price,
      specification,
      introductionIconUrl
    }
    const action = isAdd ? urls.productCreate : urls.productUpdate
    const hint = isAdd ? '添加产品成功' : '编辑产品成功'
    if (!isAdd) { data.id = location.search.split('=')[1] }
    this.setState({btnLoading: true})
    axios.post(action, data).then(res => {
      if (res.ret === 0) {
        message.success(hint)
        this.setState({btnLoading: false})
        this.isLoading = false
        history.push('/productList')
      } else {
        message.error(res.retmsg)
        this.isLoading = false
        this.setState({btnLoading: false})
      }
    }).catch(() => {
      this.isLoading = false
      this.setState({btnLoading: false})
    })
  }

  // 选择所属机构
  onChangeDept = value => { this.setState({ chargeDept: value }) }
  // 展示隐藏话术常见问题的选择弹窗
  speechModal = () => {
    this.setState({ speechIssueModal: !this.state.speechIssueModal })
  }
  // 设置话术常见问题
  setIssueSpeech = (speechIdList, issueIdList) => {
    this.setState({ issueIdList, speechIdList, speechIssueModal: false })
  }

  onChangeDescType = (e) => {
    this.setState({ descType: e.target.value, isParseHtml: e.target.value === 3 })
  }

  handleParseHtml = () => {
    const { publicUrl } = this.state
    this.setState({ isLoadingParseHtml: true })
    axios
      .get(urls.parseHtml(publicUrl), { headers: { 'Content-Type': 'application/json;charset=UTF-8' } })
      .then((res) => {
        this.setState({ desc: res.retdata, isLoadingParseHtml: false, isUpdateDescFromService: true })
      })
      .catch(() => this.setState({ isLoadingParseHtml: false }))
  }

  addProductOption = (e) => {
    e.stopPropagation()
    let { productOptions } = this.state
    if (productOptions.length >= 20) {
      return message.warn('最多只能添加20个指标')
    }
    this.setState({ productOptions: productOptions.concat({ key: '', value: '' }) })
  }
  // 删除产品要素
  miusProductOption = (key) => {
    let productions = this.state.productOptions
    var newProducttions = []
    productions.forEach((item, k) => {
      if (k !== key) {
        newProducttions.push(item)
      }
    })
    this.setState({ productOptions: newProducttions })
  }
  // 自定义要素 key 变更
  onProductOptionKeyChange = (e, k) => {
    let { productOptions } = this.state
    let value = e.target.value
    for (let i = 0; i < productOptions.length; i++) {
      if (i === k) {
        productOptions[i].key = value
      }
    }
    this.setState({ productOptions })
  }
  // 自定义要素 value 变更
  onProductOptionValueChange = (e, k) => {
    let { productOptions } = this.state
    let value = e.target.value
    for (let i = 0; i < productOptions.length; i++) {
      if (i === k) {
        productOptions[i].value = value
      }
    }
    this.setState({ productOptions })
  }

  precallback = () => { this.setState({productViewVisible: false}) }
  // 预览
  onPreview = () => {
    const { interestStartDate, interestEndDate, raiseStartTime, raiseEndTime } = this.state
    // if (moment(interestEndDate).isBefore(interestStartDate)) {
    //   return message.error('到期日期不能早于起息日期！')
    // }
    // if (moment(raiseEndTime).isBefore(raiseStartTime)) {
    //   return message.error('募集日期应该早于截止日期！')
    // }
    this.setState({ productViewVisible: true })
  }

  collapseChange = (e) => {
    if (e.length) {
      this.setState({basicListBtnVisible: true})
    } else {
      this.setState({basicListBtnVisible: false})
    }
  }

  incomChange = (e) => {
    this.setState({ rateType: e.target.value, rate: null, minRate: null, maxRate: null })
  }

  // 缩略图上传前判断
  beforeUpload2 = (file) => {
    const { name } = file
    const typeArr = name.split('.')
    const type = typeArr[typeArr.length - 1]
    if (!['png', 'jpg', 'jpeg', 'gif'].includes(type)) {
      message.error('只能上传png、jpg、jpeg、gif格式的图片！')
      return false
    }
    const sizeLimit = file.size / 1024 / 1024 > 2
    if (sizeLimit) {
      message.error('文件必须2M以内')
      return false
    }
    return true
  }
  // 缩略图change
  litimgChange = (fileObj) => {
    const { file } = fileObj
    const { status } = file
    if (status === 'done' || status === 'uploading') {
      this.fileName = file.name
      this.fileReader.readAsDataURL(file.originFileObj)
    }
    this.setState({ thumbNailPicUrl: null })
  }
  // 改变产品简介缩略图
  handleIntroductionIcon = (fileObj) => {
    const { file, fileList } = fileObj
    const { status } = file
    if (status === 'done' || status === 'uploading') {
      this.fileName = file.name
      this.fileReader.readAsDataURL(file.originFileObj)
      this.fileList = fileList
    } else if (status === 'removed') {
      this.setState({
        introductionIconList: fileList
      })
    }
  }
  // 裁剪ok点击事件
  cropOk = () => {
    const { isJYBank, type } = this.state
    this.setState({ cropping: true })
    this.cropper.getCroppedCanvas().toBlob((blob) => {
      const newFormData = new window.FormData()
      const file = new window.File([blob], this.fileName, { type: blob.type })
      newFormData.append('file', file, this.fileName)
      axios
        .post(urls.choicestUpload, newFormData, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then((res) => {
          if (res.ret === 0) {
            const { filePaths = [] } = res.retdata
            if (isJYBank && type !== 1) {
              this.setState({ thumbNailPicUrl: [{ uid: '00', status: 'done', thumbUrl: filePaths[0], url: filePaths[0] }], cropperSrc: '', cropping: false })
            } else if (type === 3) {
              this.fileList[this.fileList.length - 1].status = 'done'
              this.fileList[this.fileList.length - 1].thumbUrl = filePaths[0]
              this.fileList[this.fileList.length - 1].url = filePaths[0]
              this.setState({
                introductionIconList: this.fileList,
                cropperSrc: '',
                cropping: false
              })
            }
          }
        })
        .catch(() => {
          this.setState({ cropperSrc: '', cropping: false })
        })
    })
  }

  render () {
    const { isAdd } = this.props
    const {businessType, productTypeId, currentProductTypeList, basicListBtnVisible,
      type, name, risk, code, income, incomeRate, leatAmount, dueTime, feature, productLink,
      fileList, isUploading, desc, isPush, descType, startDate, endDate,
      previewDescFileList, interestStartDate, interestEndDate, isIniting, publicUrl,
      chargeDept, secondRepost, speechIssueModal, issueIdList, speechIdList, isJYBank,
      putOnTime, putOffTime, dueTimeUnit, hasProductSync, productSync, isParseHtml, rateType, cropperSrc, cropping, thumbNailPicUrl,
      isLoadingParseHtml, isUpdateDescFromService, productOptions, productViewVisible, incomeRateMin, incomeRateMax, incomeRateOther,
      currency, danger, increaseAmount, raiseType, raiseStartTime, raiseEndTime, btnLoading, applicationStatus,
      price, specification, introductionIconList
    } = this.state
    const itemCol = {labelCol: { span: 3 }, wrapperCol: { span: 12 }}
    const itemCol1 = {labelCol: { span: 9 }, wrapperCol: { span: 12 }}
    const w0 = '158%'
    const w1 = '128%'
    return (
      <div className={'productDetailEdit'}>
        <Spin spinning={isIniting}>
          <div className={'content'}>
            <Form>
              <Collapse defaultActiveKey={['1']}>
                <Panel header="可见范围" key="1">
                  <Row>
                    <Col span={24} push={1}>
                      <Form.Item label={<span><span className={'red'}>*</span>选择所属机构</span>} {...itemCol}
                        extra="设置完所属机构后，此产品将仅在所属机构的客户经理小程序及客户小程序中出现。" >
                        <DeptTreeSelect style={{width: w1}} value={chargeDept} onChange={this.onChangeDept}/>
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>
              </Collapse>
              <Collapse style={{marginTop: 10}} defaultActiveKey={['1']}>
                <Panel header="主要信息" key="1">
                  <Row>
                    <Col span={24} push={1}>
                      <Form.Item label={<span><span className={'red'}>*</span>产品名称</span>} {...itemCol}>
                        <Input style={{width: w1}} value={name} maxLength={30} onChange={(e) => this.setState({ name: e.target.value })} placeholder="请输入名称（30个字符以内）" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8} push={1}>
                      <Form.Item label={<span><span className={'red'}>*</span>业务类型</span>} {...itemCol1}>
                        <Select style={{width: w0}} value={businessType} onChange={this.onChangeBusinessType}>
                          <Select.Option value={1}>对公业务</Select.Option><Select.Option value={2}>零售业务</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8} push={2}>
                      <Form.Item label={<span><span className={'red'}>*</span>产品类别</span>} {...itemCol1}>
                        <Select style={{width: w0}} value={productTypeId} onChange={this.onChangeProductType}>
                          {currentProductTypeList.map(obj => {
                            return <Select.Option key={obj.productTypeId} type={obj.type} value={obj.productTypeId}>{obj.productTypeName}</Select.Option>
                          })}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row>
                    {
                      type === 1 || type === 2 ? <Col span={8} push={1}>
                        <Form.Item label={<span>产品代码</span>} {...itemCol1}>
                          <Input style={{width: w0}} value={code} maxLength={30} onChange={(e) => this.setState({ code: e.target.value })} placeholder="请输入产品代码(30个字符内)，例如“T03LK00035”" />
                        </Form.Item>
                      </Col> : <Col span={824} push={1}>
                        <Form.Item label={<span>产品代码</span>} {...itemCol}>
                          <Input style={{width: w1}} value={code} maxLength={30} onChange={(e) => this.setState({ code: e.target.value })} placeholder="请输入产品代码(30个字符内)，例如“T03LK00035”" />
                        </Form.Item>
                      </Col>
                    }
                    {
                      type === 1 || type === 2 ? <Col span={8} push={2}>
                        <Form.Item label={<span>币种</span>} {...itemCol1}>
                          <Select style={{width: w0}} value={currency} placeholder="请选择" onChange={this.onChangeCurrency}>
                            <Select.Option value='NONE'>请选择</Select.Option><Select.Option value='RMB'>人民币</Select.Option>
                            <Select.Option value='USD'>美元</Select.Option><Select.Option value='OTHER'>其他</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col> : null
                    }
                  </Row>
                  <Row>
                    <Col span={8} push={1}>
                      <Form.Item label={<span><span style={{ color: 'red' }}>*</span>产品特点</span>} {...itemCol1}>
                        <Input style={{width: w0}} value={feature} maxLength={30} onChange={(e) => this.setState({ feature: e.target.value })} placeholder="请输入产品特点（30个字符以内），例如“T+0到账 | 明日起息”" />
                      </Form.Item>
                    </Col>
                    <Col span={8} push={2}>
                      <Form.Item label={<span>跳转链接</span>} {...itemCol1}>
                        <Input style={{width: w0}} value={productLink} onChange={(e) => this.setState({ productLink: e.target.value })} placeholder="请配置产品办理的链接，形成银行的交易闭环" />
                        <span style={{ position: 'absolute', top: '-10px', right: '-24px' }}>
                          <Tooltip placement="right" title='配置产品跳转链接后，可引导客户前往银行APP或H5页面进行办理'>
                            <span style={{ display: 'inline-block', height: '18px', borderRadius: '20px', marginLeft: '4px', lineHeight: '18px', width: '18px', textAlign: 'center', border: '1px solid #ccc' }}>
                              <Icon type="info" /></span>
                          </Tooltip>
                        </span>
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>
              </Collapse>
              <Collapse style={{marginTop: 10}} onChange={this.collapseChange}>
                <Panel header="基础指标" key="1" extra={basicListBtnVisible ? <Button type='primary' size='small' onClick={ this.addProductOption } ><PlusCircleOutlined />新增基础指标</Button> : null}>
                  {type === 1 ? <Row>
                    <Col span={24} push={1}>
                      <Form.Item label={<span><span style={{ color: 'red' }}>*</span>收益率名称</span>} {...itemCol}>
                        <Input style={{width: w1}} value={income} maxLength={15} onChange={(e) => this.setState({ income: e.target.value })} placeholder={'请输入收益率名称（15个字符以内），例如“七日年化收益率”'} />
                      </Form.Item>
                    </Col>
                  </Row> : null}
                  {type === 1 ? <Row>
                    {/* <Col span={24}>
                      <Form.Item label={<span><span style={{ color: 'red' }}>*</span>收益率</span>} {...itemCol}>
                        <Input style={{width: w1}} value={incomeRate} onChange={(e) => this.setState({ incomeRate: e.target.value })} maxLength={15} placeholder="请输入收益率（15个字符以内），例如“4.65~7.89%" />
                      </Form.Item>
                    </Col> */}
                    <Col span={24} push={1}>
                      <Form.Item label={<span><span style={{ color: 'red' }}>*</span>值</span>} {...itemCol}>
                        <Radio.Group style={{width: w1, marginTop: '-7px'}} onChange={this.incomChange} value={rateType}>
                          <Radio value={0}>
                            {' '}
                            <InputNumber
                              style={{ width: 110 }}
                              value={incomeRate}
                              min={0}
                              max={9999999999}
                              onChange={(v) => this.setState({ incomeRate: v })}
                              placeholder="请输入收益率"
                            />{' '}
                            %
                          </Radio>
                          <Radio value={1} style={{ marginRight: 20 }}>
                            范围
                            <InputNumber
                              style={{ width: 110, margin: 10 }}
                              value={incomeRateMin}
                              min={0}
                              max={9999999999}
                              onChange={(v) => this.setState({ incomeRateMin: v })}
                              placeholder={'最低收益率'}
                            />{' '}
                            % ~
                            <InputNumber
                              style={{ width: 110, margin: 10 }}
                              value={incomeRateMax}
                              min={0}
                              max={9999999999}
                              onChange={(v) => this.setState({ incomeRateMax: v })}
                              placeholder={'最高收益率'}
                            />{' '}
                            %
                          </Radio>
                          <Radio value={2} style={{ marginRight: 20 }}>
                            自定义
                            <Input
                              style={{ width: 230, margin: 10 }}
                              value={incomeRateOther}
                              maxLength={10}
                              onChange={(v) => this.setState({ incomeRateOther: v.target.value })}
                              placeholder={'请输入自定义收益率，例如“3%”'}
                            />
                          </Radio>
                        </Radio.Group>
                      </Form.Item>
                    </Col>
                  </Row> : null}
                  {type === 1 ? <Row>
                    <Col span={8} push={1}>
                      <Form.Item label={<span><span style={{ color: 'red' }}>*</span>风险等级</span>} {...itemCol1}>
                        <Input style={{width: w0}} value={risk} maxLength={10} onChange={(e) => this.setState({ risk: e.target.value })} placeholder="请输入风险等级(10个字符内)，例如“R3或者R3-中低风险”" />
                      </Form.Item>
                    </Col>
                    <Col span={8} push={2}>
                      <Form.Item label={<span><span className={'red'}>*</span>投资期限</span>} {...itemCol1}>
                        <Input style={{width: w0}} maxLength={ 15 } value={dueTime} onChange={(e) => this.setState({ dueTime: e.target.value })} placeholder="请输入投资期限（10个字符以内），例如“180”" />
                        <Select value={dueTimeUnit} onChange={(value) => this.setState({dueTimeUnit: value})} style={{ position: 'absolute', width: '60px', top: '-7px', display: 'inline-block', right: '-68px' }}>
                          <Select.Option value={'无'}>无</Select.Option><Select.Option value={'天'}>天</Select.Option>
                          <Select.Option value={'周'}>周</Select.Option><Select.Option value={'月'}>月</Select.Option>
                          <Select.Option value={'年'}>年</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row> : null}
                  {type === 1 ? <Row>
                    <Col span={8} push={1}>
                      <Form.Item label={<span><span className={'red'}>*</span>起购金额</span>} {...itemCol1}>
                        <Input style={{width: w0}} value={leatAmount} maxLength={10} onChange={(e) => this.setState({ leatAmount: e.target.value })} placeholder="请输入产品的起购金额(10个字符内)，例如“100,000”" />
                      </Form.Item>
                    </Col>
                    <Col span={8} push={2}>
                      <Form.Item label={<span>递增金额</span>} {...itemCol1}>
                        <Input style={{width: w0}} value={increaseAmount} onChange={(e) => this.setState({ increaseAmount: e.target.value }) } maxLength={ 10 } placeholder="请输入递增金额（10个字符以内）例如“100,000”" />
                      </Form.Item>
                    </Col>
                  </Row> : null}
                  {type === 3 ? <Row>
                    <Col span={8} push={1}>
                      <Form.Item label={<span>价格</span>} {...itemCol1}>
                        <Input style={{width: w0}} value={price} maxLength={10} onChange={(e) => this.setState({ price: e.target.value })} placeholder="请输入价格（10个字符以内）" />
                      </Form.Item>
                    </Col>
                    <Col span={8} push={2}>
                      <Form.Item label={<span>规格</span>} {...itemCol1}>
                        <Input style={{width: w0}} value={specification} maxLength={10} onChange={(e) => this.setState({ specification: e.target.value }) } placeholder="请输入规格（10个字符以内）" />
                      </Form.Item>
                    </Col>
                  </Row> : null}
                  { productOptions.length ? productOptions.map((item, key) => {
                    return <Row key={key}>
                      <Col span={8} push={1}>
                        <Form.Item label={<span><span className={'red'}>*</span>指标名称</span>} {...itemCol1}>
                          <Input style={{width: w0}} maxLength={ 10 } value={ productOptions[key].key } onChange={(e) => this.onProductOptionKeyChange(e, key) } placeholder="请输入产品要素名称（10字符以内），例如“起购金额”" />
                        </Form.Item>
                      </Col>
                      <Col span={8} push={2}>
                        <Form.Item label={<span><span className={'red'}>*</span>指标内容</span>} {...itemCol1}>
                          <Input style={{width: w0}} value={ productOptions[key].value } maxLength={ 30 } onChange={(e) => this.onProductOptionValueChange(e, key) } placeholder="请输入产品要素名称对应的值（30个字符以内），例如“1.000元”" />
                          <span style={{ position: 'absolute', top: '-10px', right: '-24px' }}>
                            <span style={{ display: 'inline-block', height: '20px', borderRadius: '20px', marginLeft: '2px', lineHeight: '20px', width: '20px', textAlign: 'center' }}>
                              <MinusCircleOutlined style={{ color: 'red' }} onClick={ () => this.miusProductOption(key) }/>
                            </span>
                          </span>
                        </Form.Item>
                      </Col>
                    </Row>
                  }) : null}
                </Panel>
              </Collapse>
              <Collapse style={{marginTop: 10}}>
                <Panel header="产品周期" key="1">
                  {type === 1 ? <Row>
                    <Col span={24} push={1}>
                      <Form.Item label={<span>募集方式</span>} {...itemCol}>
                        <Select style={{width: w1}} value={raiseType} onChange={(value) => { this.setState({raiseType: value}) }}>
                          <Select.Option value='NONE'>请选择</Select.Option>
                          <Select.Option value='PUBLIC'>公开募集</Select.Option>
                          <Select.Option value='SPECIAL'>面向特定人群募集</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row> : null}
                  {type === 1 ? <Row>
                    <Col span={8} push={1}>
                      <Form.Item label={<span>募集开始日期</span>} {...itemCol1}>
                        <DatePicker value={raiseStartTime} onChange={(date) => this.setState({raiseStartTime: date})}
                          style={{ width: w0 }} placeholder="开始日期"
                          disabledDate={(current) => current && current < moment().startOf('day')}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8} push={2}>
                      <Form.Item label={<span>募集截止日期</span>} {...itemCol1}>
                        <DatePicker value={raiseEndTime} onChange={(date) => this.setState({raiseEndTime: date})}
                          style={{ width: w0 }} placeholder="截止日期"
                          disabledDate={(current) => current && current < moment().startOf('day')}
                        />
                      </Form.Item>
                    </Col>
                  </Row> : null}
                  {type === 1 ? <Row>
                    <Col span={8} push={1}>
                      <Form.Item label={<span>起息日期</span>} {...itemCol1}>
                        <DatePicker value={interestStartDate} onChange={(date) => this.setState({ interestStartDate: date })}
                          style={{ width: w0 }} placeholder="开始日期"
                          disabledDate={(current) => current && current < moment().startOf('day')}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8} push={2}>
                      <Form.Item label={<span>到期日期</span>} {...itemCol1}>
                        <DatePicker value={interestEndDate} onChange={(date) => this.setState({ interestEndDate: date })}
                          style={{ width: w0 }} placeholder="到期日期"
                          disabledDate={(current) => current && current < moment().startOf('day')}
                        />
                      </Form.Item>
                    </Col>
                  </Row> : null}
                  <Row>
                    <Col span={8} push={1}>
                      <Form.Item label={<span><span style={{ color: 'red' }}>*</span>上架时间</span>} {...itemCol1}>
                        <DatePicker value={putOnTime} style={{width: w0}} onChange={(date) => this.setState({ putOnTime: date })} placeholder="请选择日期"
                          disabledDate={(current) => current && current < moment().startOf('day')}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8} push={2}>
                      <Form.Item label={<span><span style={{ color: 'red' }}>*</span>下架时间</span>} {...itemCol1}>
                        <DatePicker value={putOffTime} style={{width: w0}} onChange={(date) => this.setState({ putOffTime: date })} placeholder="请选择日期"
                          disabledDate={(current) => current && current < moment().startOf('day')}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>
              </Collapse>
              {/* 非理财产品2 不显示risk income incomeRate leatAmount dueTime saleStartDate saleEndDate interestStartDate interestEndDate */}
              <Collapse style={{marginTop: 10}}>
                <Panel header="产品详情" key="1">
                  <Row>
                    <Col span={24} push={1}>
                      <Spin spinning={isUploading}>
                        <Form.Item label={<span><span className={'red'}>*</span>输入方式</span>} {...itemCol}>
                          <Radio.Group onChange={this.onChangeDescType} value={descType}>
                            <Radio value={0}>手动输入</Radio><Radio value={1}>导入pdf文件/doc文档</Radio><Radio value={3}>粘贴链接</Radio>
                          </Radio.Group>
                        </Form.Item>
                      </Spin>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={24} push={1}>
                      <Form.Item wrapperCol={{ offset: 3, span: 12 }}>
                        {descType === 0
                          ? <BraftEditor initHtml={desc} changEditorHtml={this.onChangeEditor} reload={isUpdateDescFromService} isProduct={true}/>
                          : descType === 1
                            ? <Spin spinning={isUploading}>
                              <Upload.Dragger
                                action={urls.productFileUpload}
                                onChange={this.onChangeUpload}
                                beforeUpload={this.beforeUpload}
                                fileList={fileList}
                                onRemove={this.onRemoveUpload}
                              >
                                <p className="ant-upload-drag-icon">
                                  <Icon type="inbox" />
                                </p>
                                <p className="ant-upload-text">仅支持pdf, doc, docx格式的文件, 5M以内</p>
                                <p className="ant-upload-hint">
                                  {previewDescFileList.length ? <span>文件已上传，可再次点击或者拖拽重新上传</span> : <span>点击或者拖拽上传</span>}
                                </p>
                              </Upload.Dragger>
                              {previewDescFileList.length ? <div>
                                <span>文件预览</span>
                                <Button style={{ marginLeft: 16 }} onClick={() => { this.setState({previewDescFileList: []}) }}>删除</Button>
                                <div className={'previewArea'}>
                                  {previewDescFileList.map(item => {
                                    return <img src={item} key={item} alt="" />
                                  })}
                                </div>
                              </div> : null}
                            </Spin>
                            : null}
                        {isParseHtml ? <span style={{ marginBottom: 20 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                            <Input style={{ flex: 1 }} value={publicUrl} onChange={(e) => this.setState({ publicUrl: e.target.value })} placeholder='复制微信公众号产品链接粘贴到此处' />
                            <Button loading={isLoadingParseHtml} style={{ marginLeft: 30 }} type="primary" onClick={this.handleParseHtml}>解析链接</Button>
                          </div>
                          <BraftEditor initHtml={desc} changEditorHtml={this.onChangeEditor} reload={isUpdateDescFromService}/>
                        </span> : null}
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>
              </Collapse>
              <Collapse style={{marginTop: 10}}>
                <Panel header="其他信息" key="1">
                  {type === 3 ? <Row>
                    <Col span={24} push={1}>
                      <Form.Item label={<span>产品简介图</span>} {...itemCol}>
                        <Upload
                          listType="picture-card"
                          action={urls.bannerUpload}
                          onChange={this.handleIntroductionIcon}
                          beforeUpload={this.beforeUpload2}
                          fileList={introductionIconList}
                          customRequest={() => {}}
                          showUploadList={{ showPreviewIcon: false, showRemoveIcon: true, showDownloadIcon: true }}
                        >
                          {introductionIconList.length >= 5 ? null : <Button type="primary">上传</Button>}
                        </Upload>
                        <span>(请上传尺寸630*270图片，最多5张，每张大小限制在2M以内)</span>
                      </Form.Item>
                    </Col>
                  </Row> : null}
                  <Row>
                    <Col span={24} push={1}>
                      <Form.Item label={<span>营销话术与常见问题</span>} {...itemCol}>
                        <Button type="primary" onClick={this.speechModal} style={{ marginRight: '4%' }}>选择</Button><span>{`营销话术（${speechIdList.length}）`}</span><span>{`常见问题（${issueIdList.length}）`}</span>
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={24} push={1}>
                      <Form.Item label={<span>风险揭示</span>} {...itemCol}>
                        <TextArea value={danger} onChange={(e) => this.setState({ danger: e.target.value })} maxLength={500} rows={4} placeholder="请输入风险揭示（500个字符以内）"/>
                      </Form.Item>
                    </Col>
                  </Row>
                  {isJYBank && type !== 1 && (
                    <Row>
                      <Col span={24}>
                        <Form.Item label={<span>产品缩略图</span>} {...itemCol}>
                          <Upload
                            listType="picture-card"
                            action={urls.bannerUpload}
                            onChange={this.litimgChange}
                            beforeUpload={this.beforeUpload2}
                            fileList={thumbNailPicUrl || []}
                            customRequest={() => {}}
                            showUploadList={{ showPreviewIcon: false, showRemoveIcon: true, showDownloadIcon: true }}
                          >
                            <Button type="primary">{thumbNailPicUrl ? '重新上传' : '上传图片'}</Button>
                          </Upload>
                          <div className="upload-info-xyz">图片大小限制2M以内（建议尺寸630*270，若不上传，则展示系统默认图片）</div>
                        </Form.Item>
                      </Col>
                    </Row>
                  )}
                  <Row>
                    <Col span={24} push={1}>
                      <Form.Item label={<span><span className={'red'}>*</span>是否主推</span>} {...itemCol}>
                        <Radio.Group onChange={(e) => this.setState({
                          isPush: e.target.value,
                          startDate: undefined,
                          endDate: undefined
                        })} value={isPush}>
                          <Radio value={1}>是</Radio><Radio value={0}>否</Radio>
                        </Radio.Group>
                      </Form.Item>
                    </Col>
                  </Row>
                  {isPush ? <Row>
                    <Col span={24} push={1}>
                      <Form.Item label={<span><span className={'red'}>*</span>推广开始日期</span>} {...itemCol}>
                        <DatePicker value={startDate} onChange={(date) => this.setState({ startDate: date })} style={{ width: w1 }} placeholder="请选择日期" />
                      </Form.Item>
                    </Col>
                  </Row> : null}
                  {isPush ? <Row>
                    <Col span={24} push={1}>
                      <Form.Item label={<span><span className={'red'}>*</span>推广结束日期</span>} {...itemCol}>
                        <DatePicker
                          disabledDate={(current) => current && current < moment().startOf('day')}
                          value={endDate} onChange={(date) => this.setState({ endDate: date })}
                          style={{ width: w1 }} placeholder="请选择日期" />
                      </Form.Item>
                    </Col>
                  </Row> : null}
                  <Row>
                    <Col span={24} push={1}>
                      <Form.Item label={<span>是否支持产品二次分享</span>} {...itemCol} >
                        <Radio.Group onChange={(e) => this.setState({ secondRepost: e.target.value })} value={secondRepost}>
                          <Radio value={0}>是</Radio><Radio value={1}>否</Radio>
                        </Radio.Group>
                      </Form.Item>
                    </Col>
                  </Row>
                  {hasProductSync ? <Row>
                    <Col span={24} push={1}>
                      <Form.Item label={'产品数据更新'} {...itemCol} >
                        <Radio.Group defaultChecked={false} onChange={(e) => this.setState({ productSync: e.target.value })} value={productSync}>
                          <Radio value={1}>行方文件数据为准</Radio><Radio value={2}>手动修改数据为准</Radio>
                        </Radio.Group>
                      </Form.Item>
                    </Col>
                  </Row> : null}
                  <Row>
                    <Col span={24} push={1}>
                      <Form.Item label={<span>是否预约申请</span>} {...itemCol} >
                        <Tooltip placement="top" title='选择了预约申请，则在客户端会展示预约申请的入口'>
                          <span style={{ display: 'inline-block', height: '18px', borderRadius: '20px', marginRight: '4px', lineHeight: '18px', width: '18px', textAlign: 'center', border: '1px solid #ccc' }}>
                            <Icon type="info" /></span>
                        </Tooltip>
                        <Radio.Group onChange={(e) => this.setState({ applicationStatus: e.target.value })} value={applicationStatus}>
                          <Radio value={1}>是</Radio><Radio value={0}>否</Radio>
                        </Radio.Group>
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>
              </Collapse>
              <Row>
                <Col span={24}>
                  <Form.Item wrapperCol={{ offset: 3, span: 9 }}>
                    <Button style={{ marginRight: 16 }} onClick={this.onPreview}>
                      预览
                    </Button>
                    <Button type="primary" loading={btnLoading} disabled={!this.haveInputRequired()} onClick={this.submit}>
                      保存
                    </Button>
                    <span style={{ color: '#888', marginLeft: '15px' }}>(*为必填项，填写后才可以保存)</span>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </div>
        </Spin>
        {cropperSrc && (
          <Modal maskClosable={false} visible={true} title="裁剪图片" onOk={this.cropOk} onCancel={() => this.setState({ cropperSrc: '' })}>
            <Spin spinning={cropping}>
              <Cropper src={cropperSrc} ref={(cropper) => (this.cropper = cropper)} aspectRatio={2.33} guides={false} />
            </Spin>
          </Modal>
        )}
        {
          speechIssueModal && <SpeechIssueModal classNames={'productEdit'} visible={speechIssueModal} hideModal={this.speechModal} setIssueSpeech={this.setIssueSpeech} selectedRowKeys1={speechIdList} selectedRowKeys2={issueIdList} destroyOnClose={true} />
        }
        { productViewVisible ? <ProductPreView
          preCallback={ this.precallback }
          dataOptions={{
            type,
            code,
            name,
            productTypeId,
            currentProductTypeList,
            dueTime,
            dueTimeUnit,
            leatAmount,
            descType,
            desc,
            previewDescFileList,
            interestStartDate: interestStartDate ? interestStartDate.format('MM.DD') : '00.00',
            interestEndDate: interestEndDate ? interestEndDate.format('MM.DD') : '00.00',
            raiseStartTime: raiseStartTime ? raiseStartTime.format('MM.DD') : '00.00',
            raiseEndTime: raiseEndTime ? raiseEndTime.format('MM.DD') : '00.00',
            currency,
            risk,
            income,
            incomeRate,
            danger,
            increaseAmount,
            raiseType,
            feature,
            rateType,
            incomeRateOther,
            incomeRateMax,
            incomeRateMin,
            price,
            specification,
            introductionIconList
          }}
        /> : null }
      </div>
    )
  }
}

export default withRouter(connect(mapStateToProps)(ProductDetailEdit))
