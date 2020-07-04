import React, { Component } from 'react'
import { Form, Select, Input, Row, Button, Col, DatePicker, Radio, TimePicker, message, Upload, Spin, Icon } from 'antd'
import {withRouter} from 'react-router-dom'
import './index.less'
import axios from '@src/utils/axios'
import urls from '@src/config'
import moment from 'moment'
import utils from '@src/utils'
import DeptTreeSelect from '@src/components/DeptTreeSelect'
import 'antd/dist/antd.css'
import { connect } from 'react-redux'

const mapStateToProps = (state) => {
  return {
    deptList: state.base.deptList
  }
}

@connect(mapStateToProps)
@withRouter
export default class BannerEdit extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      name: '',
      bannerImg: '',
      // 0文章 1产品 2网页链接
      locationType: 2,
      wxUrl: '',
      filterNewsType: 4,
      newsList: [],
      selectLocationNewsId: undefined,
      businessType: 2,
      currentProductTypeList: [],
      productTypeId: '',
      productList: [],
      selectLocationProductId: undefined,
      startDate: undefined,
      endDate: undefined,
      startHM: moment('00:00', 'HH:mm'),
      endHM: moment('23:59', 'HH:mm'),
      isLoading: true,
      chargeDept: []
    }
    this.deptListIds = []
  }

  // 进页面
  // 1 获取产品类别列表
  // 2 默认获取 文章 - 我的文章 全部文章列表
  // 3 默认获取 产品 - 零售 - 第一个业务 全部产品列表
  getInitData = () => {
    return axios.all([this.getPublicProductTypeList(), this.getRetailProductTypeList(), this.flatDeptIds(this.props.deptList)])
      .then(axios.spread((publicRes, retailRes) => {
        const publicProductTypeList = publicRes.retdata.list || []
        const retailProductTypeList = retailRes.retdata.list || []
        const currentProductTypeList = retailProductTypeList
        this.setState({
          publicProductTypeList,
          retailProductTypeList,
          currentProductTypeList,
          productTypeId: (currentProductTypeList[0] && currentProductTypeList[0]['productTypeId'])
        })
      }))
  }
  // 对公业务列表
  getPublicProductTypeList = () => {
    return axios.post(urls.getProductTypeList, { businessType: 1 })
  }
  // 零售业务列表
  getRetailProductTypeList = () => {
    return axios.post(urls.getProductTypeList, { businessType: 2 })
  }

  filterIds = ids => {
    return ids.filter((item) => this.deptListIds.includes(item))
  }

  componentDidMount () {
    this.getInitData().then(() => {
      if (!this.props.isAdd) {
        // 编辑 详情赋值各个字段
        const id = this.props.location.search.split('=')[1]
        axios.post(urls.bannerDetail, { bannerId: id }).then(res => {
          const { bannerName, bannerImgURL, type, bannerNewsURL, newsType, relationTitle, objId,
            businessType, productTypeId, startTime, endTime, deptList } = res.retdata.detail
          const startDate = startTime.split(' ')[0]
          const startHM = startTime.split(' ')[1]
          const endDate = endTime.split(' ')[0]
          const endHM = endTime.split(' ')[1]
          const { publicProductTypeList, retailProductTypeList } = this.state
          const deptIds = deptList.map(obj => obj.deptId)
          const chargeDept = deptIds ? this.filterIds(deptIds) : []
          this.setState({
            isLoading: false,
            name: bannerName,
            bannerImg: bannerImgURL,
            locationType: type,
            // 2网页链接
            wxUrl: bannerNewsURL,
            // 0文章
            filterNewsType: (type === 0) ? newsType : 4,
            newsList: (type === 0) ? [{ title: relationTitle, newsId: objId }] : [],
            selectLocationNewsId: (type === 0) ? objId : undefined,
            // 1产品
            businessType: (type === 1) ? businessType : 2,
            currentProductTypeList: (type === 1)
              ? (businessType === 1 ? publicProductTypeList : retailProductTypeList) : retailProductTypeList,
            productList: (type === 1) ? [{ name: relationTitle, id: objId }] : [],
            selectLocationProductId: (type === 1) ? objId : undefined,
            // 时间
            startDate: moment(startDate, 'YYYY-MM-DD'),
            startHM: moment(startHM, 'HH:mm'),
            endDate: moment(endDate, 'YYYY-MM-DD'),
            endHM: moment(endHM, 'HH:mm'),
            chargeDept
          }, () => {
            this.setState({
              productTypeId: productTypeId || (retailProductTypeList[0] && retailProductTypeList[0]['productTypeId'])
            })
          })
        })
      } else {
        this.setState({ isLoading: false })
      }
    })
  }
  // 产品名称 输入超过位数 切掉
  sliceStr = (str, length) => {
    return (str.length > length) ? str.substring(0, length) : str
  }
  // 横幅图片 限制图片上传图片类型 阻止发送请求
  beforeUploadImg = (file) => {
    const isPngOrJpeg = file.type === 'image/jpeg' || file.type === 'image/png'
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isPngOrJpeg) {
      message.error('只能上传jpg、jpeg、png格式的图片')
      return false
    }
    if (!isLt2M) {
      message.error('图片必须2M以内')
      return false
    }
    this.setState({ isLoading: true })
    return true
  }
  // 横幅图片 图片上传
  handleChangeImg = (info) => {
    // 上传请求成功
    if (info.file.status === 'done') {
      const bannerImg = info.file['response']['retdata']['filePaths'][0]
      this.setState({ bannerImg, isLoading: false })
      /* eslint-disable no-undef */
      var image = new Image()
      /* eslint-disable no-undef */
      image.src = bannerImg
      // 获取上传的图片尺寸
      image.onload = function () {
      }
      message.success('上传图片成功')
    }
  }
  // 切换点击跳转的三种类型
  onChangeLocationType = (e) => {
    const locationType = e.target.value
    this.setState({ locationType })
    const { selectLocationNewsId, selectLocationProductId } = this.state
    if (locationType === 0) {
      // 0文章
      !selectLocationNewsId && this.setNewsList('')
    } else if (locationType === 1) {
      // 1产品
      !selectLocationProductId && this.setProductList('')
    } else if (locationType === 2) {
      // 2网页链接
      this.setState({ wxUrl: '' })
    }
  }
  // 点击跳转 切换文章类别 重新获取文章列表
  onChangeFilterNewsType = (filterNewsType) => {
    this.setState({ filterNewsType }, () => {
      this.setNewsList('')
    })
  }
  // 点击跳转 搜索文章
  onSearchNewsList = (value) => {
    this.debounceNewsList(value)
  }
  // debounce闭包 必须先写好 然后在searchRoleMember触发
  debounceNewsList = utils.debounce((value) => this.setNewsList(value), 300)
  // 3种情况触发重新获取产品列表
  // 1 切换点击跳转类型 2 切换文章类别 3 搜索文章
  setNewsList = (value) => {
    axios.post(urls.newsList, { title: value.trim(), queryType: this.state.filterNewsType }).then(res => {
      const newsList = res.retdata.newsList
      this.setState({ newsList, selectLocationNewsId: undefined })
    })
  }
  // 点击跳转 选择文章
  onChangeNewsList = (value) => {
    this.setState({ selectLocationNewsId: value })
  }
  // 切换产品业务类型 变换产品类别列表 重新获取产品列表
  onChangeBusinessType = (value) => {
    const { publicProductTypeList, retailProductTypeList } = this.state
    const currentProductTypeList = (value === 1 ? publicProductTypeList : retailProductTypeList)
    this.setState({
      businessType: value,
      currentProductTypeList,
      productTypeId: (currentProductTypeList[0] && currentProductTypeList[0]['productTypeId'])
    }, () => {
      this.setProductList('')
    })
  }
  // 切换产品类别 重新获取产品列表
  onChangeProductType = (value) => {
    this.setState({ productTypeId: value }, () => {
      this.setProductList('')
    })
  }
  // 点击跳转 搜索产品
  onSearchProductList = (value) => {
    this.debounceProductList(value)
  }
  debounceProductList = utils.debounce((value) => this.setProductList(value), 300)
  // 4种情况触发重新获取产品列表
  // 1 切换点击跳转类型 2 切换产品业务类型 3 切换产品类别列表 4 搜索产品
  setProductList = (value) => {
    const { businessType, productTypeId } = this.state
    axios.post(urls.getProductList, { name: value.trim(), businessType, typeId: productTypeId }).then(res => {
      const productList = res.retdata.list
      this.setState({ productList, selectLocationProductId: undefined })
    })
  }
  // 点击跳转 选择产品
  onChangeProductList = (value) => {
    this.setState({ selectLocationProductId: value })
  }
  // 必填字段是否都填写
  haveInputRequired = () => {
    const { name, bannerImg, startDate, endDate, locationType, wxUrl,
      selectLocationNewsId, selectLocationProductId, chargeDept } = this.state
    const haveInputLocation = ((locationType === 0) && selectLocationNewsId) ||
    ((locationType === 1) && selectLocationProductId) ||
    ((locationType === 2) && wxUrl)
    return name && bannerImg && startDate && endDate && haveInputLocation && chargeDept.length
  }
  // 获取ObjIdOrbannerNewsURL
  getObjIdOrbannerNewsURL = () => {
    const { locationType, wxUrl, selectLocationNewsId, selectLocationProductId } = this.state
    if (locationType === 0) {
      // 0文章 objId是文章id
      return {
        objId: selectLocationNewsId,
        bannerNewsURL: ''
      }
    } else if (locationType === 1) {
      // 1产品 objId是产品id
      return {
        objId: selectLocationProductId,
        bannerNewsURL: ''
      }
    } else if (locationType === 2) {
      // 2网页链接
      return {
        objId: '',
        bannerNewsURL: wxUrl
      }
    }
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

  // 选择所属机构
  onChangeDept = value => {
    this.setState({ chargeDept: value })
  }
  // 提交
  submit = () => {
    if (!this.haveInputRequired()) {
      return message.warning('*星号内容都不为空时，才可提交')
    }
    if (this.isLoading) return
    this.isLoading = true
    // if (wxUrl.indexOf('https://mp.weixin.qq.com') !== 0) {
    //   return message.warning('请粘贴网页链接，仅支持微信公众号链接')
    // }
    // 开始时间小于结束时间 todo
    const { name, bannerImg, locationType, startDate, endDate, startHM, endHM, chargeDept } = this.state
    const { objId, bannerNewsURL } = this.getObjIdOrbannerNewsURL()
    const { isAdd } = this.props
    const id = this.props.location.search.split('=')[1]
    const data = {
      bannerName: name,
      bannerImgURL: bannerImg,
      type: locationType,
      objId,
      bannerNewsURL,
      startTime: moment(startDate).format('YYYY-MM-DD') + ' ' + moment(startHM).format('HH:mm:ss'),
      endTime: moment(endDate).format('YYYY-MM-DD') + ' ' + moment(endHM).format('HH:mm:ss'),
      deptIds: chargeDept.join(',')
    }
    if (isAdd) {
      // 新增
      axios.post(urls.bannerCreate, data).then(res => {
        if (res.ret === 0) {
          message.success('添加成功')
          this.props.history.push('/bannerList')
        }
        this.isLoading = false
      }).catch(() => {
        this.isLoading = false
      })
    } else {
      // 编辑
      axios.post(urls.bannerUpdate, { ...data, bannerId: id }).then(res => {
        if (res.ret === 0) {
          message.success('编辑成功')
          this.props.history.push('/bannerList')
        }
        this.isLoading = false
      }).catch(() => {
        this.isLoading = false
      })
    }
  }

  render () {
    const { isAdd } = this.props
    const { name, startDate, endDate, bannerImg, locationType, wxUrl, startHM, endHM,
      filterNewsType, selectLocationNewsId, newsList, businessType, chargeDept,
      productTypeId, currentProductTypeList, selectLocationProductId, productList, isLoading } = this.state
    const itemCol1 = {
      labelCol: {span: 3},
      wrapperCol: {span: 12}
    }
    const itemCol2 = {
      labelCol: {span: 3},
      wrapperCol: {span: 21}
    }
    return (
      <div className={'bannerEdit'}>
        <div className={'title'}>
          <span onClick={() => this.props.history.goBack()} style={{cursor: 'pointer'}} >
            <Icon type="left"/>
            <span style={{marginLeft: '10px'}}>banner列表</span>
          </span>
        </div>
        <Spin spinning={isLoading}>
          <div className={'content'}>
            <div className={'contentTitle'}>
              {isAdd ? '新增banner' : '修改banner'}
            </div>
            <div className={'formArea'}>
              <Form>
                <Row>
                  <Col span={24}>
                    <Form.Item label={<span><span className={'red'}>*</span>选择所属机构</span>} {...itemCol1}
                      extra="设置完所属机构后，此活动将仅在所属机构的客户经理小程序及客户小程序中出现。" >
                      <DeptTreeSelect value={chargeDept} onChange={this.onChangeDept}/>
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Form.Item label={<span><span className={'red'}>*</span>banner名称</span>} {...itemCol1}>
                      <Input value={name} onChange={(e) => this.setState({ name: this.sliceStr(e.target.value, 20) })} placeholder="请输入banner名称(20个字符内)" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Form.Item label={<span><span className={'red'}>*</span>banner图片</span>} {...itemCol2}>
                      <div className={'previewImgArea'}>
                        {bannerImg ? <img className={'previewImg'} src={bannerImg} /> : null}
                        <ul className={'previewImgText'}>
                          <li style={{marginBottom: '10px'}}>
                            <Upload
                              action={urls.bannerUpload}
                              onChange={this.handleChangeImg}
                              beforeUpload={this.beforeUploadImg}
                            >
                              <Button type="primary">{bannerImg ? '重新上传' : '上传图片'}</Button>
                            </Upload>
                          </li>
                          <li>上传提示：</li>
                          <li>1、图片大小不超过2M</li>
                          <li>2、建议尺寸710*200，其他尺寸会压缩变形</li>
                        </ul>
                      </div>
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Form.Item label={<span><span className={'red'}>*</span>点击跳转</span>} {...itemCol1}>
                      <Radio.Group onChange={this.onChangeLocationType} value={locationType}>
                        <Radio value={2}>网页链接</Radio>
                        <Radio value={0}>文章</Radio>
                        <Radio value={1}>产品</Radio>
                      </Radio.Group>
                    </Form.Item>
                  </Col>
                </Row>
                {locationType === 2 ? <Row>
                  <Col span={24}>
                    <Form.Item wrapperCol={{offset: 3, span: 15}}>
                      <div className={'locationArea'}>
                        <Input value={wxUrl} onChange={(e) => this.setState({ wxUrl: e.target.value })} placeholder="请粘贴网页链接，非微信公众号链接无法在小程序中跳转，请注意。" />
                      </div>
                    </Form.Item>
                  </Col>
                </Row> : null}
                {locationType === 0 ? <Row>
                  <Col span={24}>
                    <Form.Item wrapperCol={{offset: 3, span: 21}}>
                      <div className={'locationArea'}>
                        <Select value={filterNewsType} className={'selectNoEnd'}
                          placeholder="请选择文章类别" onChange={this.onChangeFilterNewsType}>
                          {/* <Select.Option value={''}>所有类别</Select.Option> */}
                          <Select.Option value={4}>我的文章</Select.Option>
                          <Select.Option value={0}>我行发布</Select.Option>
                          <Select.Option value={2}>热门文章</Select.Option>
                        </Select>
                        <Select
                          className={'selectEnd'}
                          placeholder="请搜索文章"
                          value={selectLocationNewsId}
                          onChange={this.onChangeNewsList}
                          onSearch={this.onSearchNewsList}
                          showSearch
                          defaultActiveFirstOption={false}
                          showArrow={false}
                          filterOption={false}
                        >
                          {newsList.map(obj => {
                            return <Select.Option title={obj.title} key={obj.newsId} value={obj.newsId}>
                              {obj.title}
                            </Select.Option>
                          })}
                          {newsList.length >= 10 ? <Select.Option key={-1} value={-1} disabled>{'更多文章请在输入框输入关键字搜索'}</Select.Option> : null}
                        </Select>
                      </div>
                    </Form.Item>
                  </Col>
                </Row> : null}
                {locationType === 1 ? <Row>
                  <Col span={24}>
                    <Form.Item wrapperCol={{offset: 3, span: 21}}>
                      <div className={'locationArea'}>
                        <Select value={businessType} onChange={this.onChangeBusinessType} className={'selectNoEnd'}>
                          <Select.Option value={2}>零售业务</Select.Option>
                          <Select.Option value={1}>对公业务</Select.Option>
                        </Select>
                        <Select value={productTypeId} onChange={this.onChangeProductType} className={'selectNoEnd'}>
                          {currentProductTypeList.map(obj => {
                            return <Select.Option key={obj.productTypeId} value={obj.productTypeId}>{obj.productTypeName}</Select.Option>
                          })}
                        </Select>
                        <Select
                          className={'selectEnd'}
                          placeholder="请搜索产品"
                          value={selectLocationProductId}
                          onChange={this.onChangeProductList}
                          onSearch={this.onSearchProductList}
                          showSearch
                          defaultActiveFirstOption={false}
                          showArrow={false}
                          filterOption={false}
                        >
                          {productList.map(obj => {
                            return <Select.Option title={obj.name} key={obj.id} value={obj.id}>
                              {obj.name}
                            </Select.Option>
                          })}
                        </Select>
                      </div>
                    </Form.Item>
                  </Col>
                </Row> : null}
                <Row>
                  <Col span={24}>
                    <Form.Item label={<span><span className={'red'}>*</span>推广开始时间</span>} {...itemCol1}>
                      <span className={'timeWrap'}>
                        <DatePicker
                          allowClear={false}
                          disabledDate={(current) => current && current < moment().startOf('day')}
                          value={startDate} onChange={(date) => this.setState({startDate: date})}
                          style={{width: '100%'}} placeholder="请选择日期" />
                        <TimePicker
                          allowClear={false}
                          value={startHM}
                          onChange={(time) => this.setState({startHM: time})}
                          format={'HH:mm'} />
                      </span>
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Form.Item label={<span><span className={'red'}>*</span>推广结束时间</span>} {...itemCol1}>
                      <span className={'timeWrap'}>
                        <DatePicker
                          allowClear={false}
                          disabledDate={(current) => current && current < moment().startOf('day')}
                          value={endDate} onChange={(date) => this.setState({endDate: date})}
                          style={{width: '100%'}} placeholder="请选择日期" />
                        <TimePicker
                          allowClear={false}
                          value={endHM}
                          onChange={(time) => this.setState({endHM: time})}
                          format={'HH:mm'} />
                      </span>
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Form.Item wrapperCol={{offset: 3, span: 9}}>
                      <Button type="primary" disabled={!this.haveInputRequired()} onClick={this.submit}>提交</Button>
                      <span style={{color: '#888', marginLeft: '15px'}}>*星号内容都不为空时，才可提交</span>
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>
        </Spin>
      </div>
    )
  }
}
