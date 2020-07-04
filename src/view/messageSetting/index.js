import React, { Component, Fragment } from 'react'
import { Form, Row, Col, Button, Icon, Input, Table, message, Select, DatePicker, Upload, Spin, Modal, TreeSelect, Popconfirm } from 'antd'
import DetailModal from './detailModal'
import FileModal from './fileModal'
import SenceModal from './senceModal'
import moment from 'moment'
import UploadImg from './uploadImg'
import Tools from '@src/utils'
import axios from '@src/utils/axios'
import { Validator } from '@src/utils/validate'
import urls from '@src/config'
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'
import { connect } from 'react-redux'
import DeptTreeSelect from '@src/components/DeptTreeSelect'
import './index.less'
@Form.create({ name: 'MessageSetting' })
class MessageSetting extends Component {
  constructor (props) {
    super(props)
    this.tabs = []
    let active = 'wordsView'
    const isWordsView = Tools.checkButtonRight(this.props.location.pathname, 'wordsView', false)
    const isMaterialView = Tools.checkButtonRight(this.props.location.pathname, 'materialView', false)
    if (isWordsView) {
      this.tabs.push({name: '智能回复', key: 'wordsView'})
    }
    if (isMaterialView) {
      this.tabs.push({name: '文件与视频材料', key: 'materialView'})
    }
    if (!isWordsView && isMaterialView) {
      active = 'materialView'
    }
    this.active = active
    this.state = {
      accept: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      fileList: [],
      tableData: [],
      pagination: {
        current: 1,
        pageSize: 20,
        total: 0
      },
      filterDateRange: ['', ''],
      isLoading: true,
      isUploading: false,
      selectedRowKeys: [],
      visibleDetailModal: false,
      visibleSenceModal: false,
      detailId: '',
      sortedInfo: {
        columnKey: 'createTime',
        order: 'descend'
      },
      visibleOperateModal: false,
      sence: '',
      title: '添加话术',
      editObj: {
        sence: 'other',
        type: '',
        remark: '',
        content: '',
        chargeDept: [],
        imgUrlList: []
      },
      chargeDept: [],
      senceList: [],
      typeList: [],
      idx: 0,
      active,
      fileModalVisible: false
    }
    this.defaultEditObj = {
      sence: 'other',
      type: '',
      remark: '',
      content: '',
      chargeDept: [],
      imgUrlList: []
    }
  }
  // 进页面
  componentDidMount = () => {
    if (this.active === 'materialView') {
      this.getFileList()
    } else {
      this.sentenceList()
    }
    this.getSenceList()
    this.setState({ chargeDeptTree: this.props.ownerList })
  }
  // 获取场景列表数据
  getSenceList = callback => {
    const { active } = this.state
    axios.get(`${urls.sentenceSenceList}${active === 'materialView' ? '?senceType=1' : ''}`).then(res => {
      let senceList = res.retdata
      let typeList = []
      senceList.forEach((v, k) => {
        typeList.push(v.typeList)
      })
      this.setState({ senceList, typeList }, () => {
        callback && callback()
      })
    })
  }
  // 时间范围
  onChangeDate = (date, dateString) => {
    this.setState({ filterDateRange: date })
  }
  // 获取话术类别列表
  sentenceList = () => {
    this.setState({ isLoading: true })
    let { sence, filterDateRange, pagination } = this.state
    let data = {
      sence,
      createTimeStart: filterDateRange[0] ? new Date(filterDateRange[0]).format('yyyy-MM-dd') : '',
      createTimeEnd: filterDateRange[1] ? new Date(filterDateRange[1]).format('yyyy-MM-dd') : '',
      orderType: 'createtime_desc',
      pageNo: pagination.current,
      pageSize: pagination.pageSize
    }
    axios.post(urls.sentenceList, Tools.filterParam(data), { headers: { 'Content-Type': 'application/json;charset=UTF-8' } }).then(res => {
      // let list = [...res.retdata.list, {
      //   content: "话术",
      //   corpId: "wwc8b0e2b9d33c6340",
      //   createTime: "2020-04-26 15:23:05",
      //   deptIdList: [],
      //   id: 209,
      //   imgUrlList: [],
      //   remark: "标题",
      //   sence: "other",
      //   source: "非官方",
      //   staffId: "61c9d3af802a4153b05d30fe0bdf845e",
      //   type: ""
      // }]
      this.setState({
        tableData: res.retdata.list || [],
        isLoading: false,
        pagination: { ...pagination, total: res.retdata.total }
      })
    })
  }
  // 切换话术场景
  onChangeSence = value => {
    this.setState({ sence: value })
  }
  // 分页、排序、筛选变化时触发 获取表格数据
  handleTableChange = (pagination, filters, sorter) => {
    const { active } = this.state
    const { columnKey: prevColumnKey, order: prevOrder } = this.state.sortedInfo
    const pager = {
      ...this.state.pagination
    }
    if (prevColumnKey === sorter.columnKey && prevOrder === sorter.order) {
      pager.current = pagination.current
    } else {
      // 如果改变了排序 跳到第一页
      pager.current = 1
    }
    if (!sorter.order) {
      sorter.order = 'ascend'
    }
    this.setState(
      {
        pagination: pager,
        sortedInfo: sorter
      },
      () => {
        if (active === 'materialView') {
          this.getFileList()
        } else {
          this.fetch()
        }
      }
    )
  }
  // 表格排序参数
  getOrderType = sortedInfo => {
    let type = ''
    if (sortedInfo.columnKey === 'sendCount' || sortedInfo.columnKey === 'pushCount') {
      type = sortedInfo.order === 'descend' ? 'sendcount_desc' : 'sendcount_asc'
    } else if (sortedInfo.columnKey === 'createTime' || sortedInfo.columnKey === 'createDate') {
      type = sortedInfo.order === 'descend' ? 'createtime_desc' : 'createtime_asc'
    }
    return type
  }
  // 点击查询
  search = () => {
    const { active } = this.state
    const pagination = {
      ...this.state.pagination
    }
    pagination.current = 1
    // 默认第一页 清空排序
    this.setState(
      {
        pagination,
        sortedInfo: active === 'materialView' ? { columnKey: 'createDate', order: 'descend' } : { columnKey: 'createTime', order: 'descend' }
      },
      () => {
        if (active === 'materialView') {
          this.getFileList()
        } else {
          this.fetch()
        }
      }
    )
  }
  // 表格数据获取
  fetch = () => {
    const { sence, sortedInfo, filterDateRange } = this.state
    const { current, pageSize, total } = this.state.pagination
    const data = {
      sence,
      createTimeStart: filterDateRange[0] ? new Date(filterDateRange[0]).format('yyyy-MM-dd') : '',
      createTimeEnd: filterDateRange[1] ? new Date(filterDateRange[1]).format('yyyy-MM-dd') : '',
      orderType: this.getOrderType(sortedInfo),
      pageNo: current,
      pageSize: pageSize
    }
    this.setState({ isLoading: true })
    axios.post(urls.sentenceList, Tools.filterParam(data), { headers: { 'Content-Type': 'application/json;charset=UTF-8' } }).then(res => {
      const pagination = {
        ...this.state.pagination
      }
      pagination.total = res.retdata.total
      this.setState({ isLoading: false, tableData: res.retdata.list, pagination })
    })
  }
  // 重置
  reset = () => {
    const { active } = this.state
    this.setState(
      {
        pagination: {
          current: 1,
          pageSize: 20
        },
        selectedRowKeys: [],
        filterDateRange: ['', ''],
        // 清空排序
        sortedInfo: active === 'materialView' ? { columnKey: 'createDate', order: 'descend' } : { columnKey: 'createTime', order: 'descend' },
        sence: ''
      },
      () => {
        if (active === 'materialView') {
          this.getFileList()
        } else {
          this.fetch()
        }
      }
    )
  }
  // 文章详情modal
  showDetailModal = id => {
    this.setState({ detailId: id, visibleDetailModal: true })
  }
  // 文章详情modal 取消
  hideDetailModal = () => {
    this.setState({ visibleDetailModal: false, detailId: '' })
  }
  // 场景modal  取消
  hideSenceModal = () => {
    this.setState({ visibleSenceModal: false }, () => {
      if (this.state.active === 'materialView') {
        this.getFileList()
      } else {
        this.fetch()
      }
    })
  }
  // 点击表格行勾选框
  tableSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys })
  }
  // 批量删除
  productDelete = () => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'wordsDel')
    if (!isRight) return
    const { selectedRowKeys } = this.state
    if (!selectedRowKeys.length) {
      return message.warning('请勾选要删除的话术')
    }
    Modal.confirm({
      title: '确定?',
      content: `是否删除选中的${selectedRowKeys.length}个话术`,
      onOk: () => {
        axios.post(urls.sentenceDel, { idList: selectedRowKeys }, { headers: { 'Content-Type': 'application/json;charset=UTF-8' } }).then(res => {
          this.setState({ selectedRowKeys: [] })
          message.success('删除话术成功')
          this.fetch()
        })
      },
      onCancel: () => {}
    })
  }
  // 新增或者编辑详情 显示
  showOperateModal = record => {
    if (record) {
      const isRight = Tools.checkButtonRight(this.props.location.pathname, 'wordsEdit')
      if (!isRight) return
      if (!record.owner) {
        Tools.openRightMessage()
        return
      }
      axios.get(`${urls.sentenceDetail}?id=${record.id}`, { headers: { 'Content-Type': 'application/json;charset=UTF-8' } }).then(res => {
        let { senceList, idx = 0, typeList } = this.state
        let haveSence = false
        let haveType = false
        senceList.map((v, k) => {
          if (v.code === res.retdata.sence) {
            haveSence = true
            idx = k
          }
          return v
        })
        const list = typeList.reduce(function (a, b) { return a.concat(b) })
        list.map((v, k) => {
          if (v.code === res.retdata.type) {
            haveType = true
          }
          return v
        })
        if (!haveSence) {
          res.retdata.sence = ''
        }
        if (!haveType) {
          res.retdata.type = ''
        }
        this.setState({ visibleOperateModal: true, title: '编辑话术', editObj: { ...res.retdata, chargeDept: res.retdata.deptIdList }, id: record.id, idx })
      })
    } else {
      const isRight = Tools.checkButtonRight(this.props.location.pathname, 'wordsAdd')
      if (!isRight) return
      let { senceList, idx = 0 } = this.state
      senceList.map((v, k) => {
        if (v.code === this.defaultEditObj.sence) {
          idx = k
        }
        return v
      })
      this.setState({ title: '添加话术', visibleOperateModal: true, editObj: Tools.deepCopyObj(this.defaultEditObj), idx })
    }
  }

  // 输入超过位数 切掉
  sliceStr = (str, length) => {
    return str.length > length ? str.substring(0, length) : str
  }

  onChangeEditObj = (name, e, idx) => {
    let value = null
    if (name === 'remark' || name === 'content') {
      value = e.target.value
    } else {
      value = e
    }
    this.setState({ editObj: { ...this.state.editObj, [name]: value } }, () => {
      let { senceList, idx = 0 } = this.state
      if (name === 'sence') {
        senceList.map((v, k) => {
          if (v.code === value) {
            idx = k
          }
          return v
        })
        this.setState({ editObj: { ...this.state.editObj, type: '', remark: this.sliceStr(this.state.editObj.remark, e !== 'question' ? 10 : 30) }, idx })
      }
    })
  }

  // 过滤上传条件
  beforeUpload = file => {
    this.setState({ isUploading: true })
    if (!(file.name.slice(-5) === '.xlsx' || file.name.slice(-4) === '.xls')) {
      message.error('只能上传xls、xlsx格式的文件')
      this.setState({ isUploading: false })
      return false
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('文件必须2M以内')
      this.setState({ isUploading: false })
      return false
    }
    this.setState(state => ({
      fileList: [file],
      isUploading: false
    }))
    return true
  }

  customRequest = () => {
    let { fileList, chargeDept } = this.state
    let formData = new window.FormData()
    formData.append('file', fileList[0], fileList[0].name)
    formData.append('dept', chargeDept)
    axios
      .post(urls.sentenceImport, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(res => {
        if (res.ret === 0) {
          const { failCount, successCount, totalCount, resultUrl } = res.retdata
          Modal.success({
            icon: '',
            content: (
              <div className="importSucess">
                <p>导入完成</p>
                <p>导入话术合计：{totalCount}条</p>
                <p>导入成功：{successCount}条</p>
                <p style={{ color: 'red' }}>导入失败：{failCount}条</p>
                {failCount ? <a href={resultUrl} target="_blank" style={{ marginTop: '12px', display: 'block' }}>
                    导入失败详情
                </a> : null}
              </div>
            )
          })
          this.fetch()
          this.handleCancel()
        }
      })
      .catch(() => {
        this.handleCancel()
        // this.setState({ isUploading: false })
      })
  }

  // 新增和编辑
  handleOk = () => {
    let { id, editObj, isUploading } = this.state
    if (isUploading) {
      return
    }
    message.destroy()
    if (!editObj.chargeDept.length) {
      return message.warning('请选择机构')
    }
    let validator = new Validator()
    if (editObj.sence === 'question') {
      // 校验标题 话术要必填
      validator.add(editObj.remark, 'isNotEmpty', '请输入问题描述')
      validator.add(editObj.content, 'isNotEmpty', '请输入话术答案')
    } else {
      // 校验话术必填
      validator.add(editObj.content, 'isNotEmpty', '请输入参考话术')
    }
    validator.add(editObj.content, 'maxLength:500', '话术最多为500字符')
    let data = {
      sence: editObj.sence,
      type: editObj.type,
      remark: editObj.remark,
      content: editObj.content,
      deptIdList: editObj.chargeDept,
      imgUrlList: editObj.imgUrlList
    }
    if (id) {
      data.id = id
    }
    var errorMsg = validator.start()
    if (errorMsg) {
      // 获得效验结果
      message.error(errorMsg, 2)
      return false
    }
    this.setState({ isUploading: true })
    axios
      .post(urls[id ? 'sentenceEdit' : 'sentenceAdd'], data, { headers: { 'Content-Type': 'application/json;charset=UTF-8' } })
      .then(res => {
        message.success('保存成功', 2)
        this.handleCancel()
        this.getSenceList()
        this.fetch()
      })
      .catch(() => {
        this.setState({ isUploading: false })
      })
  }

  // 关闭  取消
  handleCancel = () => {
    this.setState({
      visibleOperateModal: false,
      uploadVisible: false,
      editObj: Tools.deepCopyObj(this.defaultEditObj),
      id: null,
      idx: 0,
      fileList: [],
      isUploading: false,
      chargeDept: []
    })
  }

  remove = file => {
    this.setState(state => {
      const index = state.fileList.indexOf(file)
      const newFileList = state.fileList.slice()
      newFileList.splice(index, 1)
      return {
        fileList: newFileList
      }
    })
  }

  // 选择所属机构
  onChangeDept = value => {
    this.setState({ chargeDept: value })
  }

  // 打开导入
  showUploadModal = () => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'wordsAdd')
    if (!isRight) return
    this.setState({ uploadVisible: true })
  }

  // 过滤列表展示信息
  filterSentenceType = name => {
    let { senceList } = this.state
    let result = ''
    senceList.map((v, k) => {
      if (v.code === name) result = v.desc
      v.typeList.map((ele, idx) => {
        if (ele.code === name) result = ele.desc
        return idx
      })
      return v
    })
    return result
  }

  columns1 = () => {
    const { sortedInfo } = this.state
    return [
      {
        title: '话术场景',
        dataIndex: 'sence',
        width: '10%',
        render: (text, record) => (
          <span>
            <span>{this.filterSentenceType(record.sence)}</span>
          </span>
        )
      },
      {
        title: '二级分类',
        dataIndex: 'type',
        width: '10%',
        render: (text, record) => (
          <span>
            <span>{this.filterSentenceType(record.type)}</span>
          </span>
        )
      },
      {
        title: '话术标题/问题描述',
        dataIndex: 'remark',
        width: '10%',
        render: (text, record) => (
          <span>
            <span>{record.remark}</span>
          </span>
        )
      },
      {
        title: '参考话术',
        dataIndex: 'content',
        width: '30%',
        render: (text, record, index) => {
          const detail = (
            <span
              style={{
                color: '#479EEE',
                cursor: 'pointer',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical'
              }}
              onClick={() => this.showDetailModal(record.id)}
            >
              {record.content}
            </span>
          )
          return detail
        }
      },
      {
        title: '发送次数',
        dataIndex: 'sendCount',
        sorter: true,
        width: '10%',
        sortOrder: sortedInfo.columnKey === 'sendCount' && sortedInfo.order
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        render: (text, record) => <span>{record.createTime.substring(5)}</span>,
        sorter: true,
        width: '10%',
        sortOrder: sortedInfo.columnKey === 'createTime' && sortedInfo.order
      },
      {
        title: '来源',
        dataIndex: 'source',
        width: '10%'
      },
      {
        title: '操作',
        width: '10%',
        dataIndex: 'sendDetail',
        render: (text, record, index) => {
          const detail = (
            <span
              style={{
                color: '#1890ff',
                cursor: 'pointer'
              }}
              onClick={() => this.showOperateModal(record)}
            >
              {record.source === '我行' ? '编辑' : ''}
            </span>
          )
          return detail
        }
      }
    ]
  }

  columns2 = () => {
    const { sortedInfo } = this.state
    return [
      { title: '文件场景', dataIndex: 'sceneDesc' },
      { title: '二级分类', dataIndex: 'sceneTypeDesc' },
      { title: '所属机构', dataIndex: 'depts' },
      { title: '文件类型', dataIndex: 'fileType' },
      { title: '文件名称', dataIndex: 'fileName' },
      { title: '文件大小', dataIndex: 'fileSize' },
      { title: '发送次数', dataIndex: 'pushCount', sorter: true, sortOrder: sortedInfo.columnKey === 'pushCount' && sortedInfo.order },
      { title: '创建时间', dataIndex: 'createDate', sorter: true, sortOrder: sortedInfo.columnKey === 'createDate' && sortedInfo.order },
      { title: '创建人', dataIndex: 'createUser' },
      {
        title: '操作',
        dataIndex: 'xxxx',
        render: (text, record) => {
          return (
            <Fragment>
              <Button type="primary" style={{marginRight: 20}} onClick={() => this.showFileModal('update', record)} >
                编辑
              </Button>
              <Button type="danger" onClick={() => this.beforDeleteFile(record)} >
                删除
              </Button>
            </Fragment>
          )
        }
      }
    ]
  }

  beforDeleteFile = (record) => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'documentsDel')
    if (!isRight) return
    if (!record.owner) {
      Tools.openRightMessage()
      return
    }
    Modal.confirm({
      title: '确定删除此文件吗?',
      okText: '删除',
      cancelText: '取消',
      onOk: () => {
        this.fileDel(record)
      },
      onCancel: () => {}
    })
  }
  // 打开文件弹窗
  showFileModal = (fileModalType, record) => {
    if (fileModalType === 'add') {
      const isRight = Tools.checkButtonRight(this.props.location.pathname, 'documentsAdd')
      if (!isRight) return
    }
    if (fileModalType === 'update') {
      const isRight = Tools.checkButtonRight(this.props.location.pathname, 'documentsEdit')
      if (!isRight) return
      if (!record.owner) {
        Tools.openRightMessage()
        return
      }
    }
    this.setState({ fileRecord: record, fileModalVisible: true, fileModalType })
  }
  // 新增/编辑文件
  fileAdd = () => {}
  // 删除文件
  fileDel = record => {
    axios.post(urls.fileDel, { fileId: record.fileId }).then(res => {
      message.success('文件删除成功')
      this.getFileList()
    })
  }
  // tab切换
  tabChange = key => {
    if (this.state.active === key) return
    this.setState(
      {
        active: key,
        pagination: { current: 1, pageSize: 20, total: 0 },
        filterDateRange: [],
        sence: '',
        sortedInfo: ''
      },
      () => {
        if (key === 'materialView') {
          this.getFileList()
          this.getSenceList()
        } else {
          this.getSenceList()
        }
      }
    )
  }
  // 获取文件列表
  getFileList = () => {
    this.setState({ isLoading: true })
    const { filterDateRange, sence, pagination, sortedInfo } = this.state
    const params = {
      senceCode: sence,
      createTimeStart: filterDateRange[0] ? new Date(filterDateRange[0]).format('yyyy-MM-dd') : '',
      createTimeEnd: filterDateRange[1] ? new Date(filterDateRange[1]).format('yyyy-MM-dd') : '',
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
      orderType: sortedInfo ? this.getOrderType(sortedInfo) : 'createtime_desc'
    }
    axios
      .post(urls.fileList, params, { headers: { 'Content-Type': 'application/json' } })
      .then(res => {
        this.setState({ files: res.retdata.list || [], isLoading: false, pagination: { ...pagination, total: res.retdata.total } })
      })
      .catch(() => {
        this.setState({ isLoading: false, files: [] })
      })
  }
  // 关闭文件弹窗回调
  fileModalClose = refresh => {
    this.setState({ fileModalVisible: false }, () => {
      if (refresh) this.getFileList()
    })
  }

  getCheckboxProps = (record) => {
    return ({ disabled: !record.owner })
  }

  openSenceModal = () => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'scenesManage')
    if (!isRight) return
    this.setState({ visibleSenceModal: true })
  }

  render = () => {
    let {
      accept,
      fileList,
      title,
      isUploading,
      filterDateRange,
      tableData,
      sence,
      sortedInfo,
      pagination,
      isLoading,
      visibleDetailModal,
      visibleSenceModal,
      detailId,
      selectedRowKeys,
      visibleOperateModal,
      operateList = [],
      editObj,
      senceList,
      typeList,
      uploadVisible,
      chargeDept,
      idx,
      active,
      files = [],
      fileModalVisible,
      fileModalType,
      fileRecord
    } = this.state
    const itemCol = {
      labelCol: { span: 3 },
      wrapperCol: { span: 24 }
    }
    return (
      <div className="messageSetting contentCenter">
        <Spin spinning={isLoading}>
          <div className="tabs">
            {this.tabs.map((item, index) => (
              <div onClick={() => this.tabChange(item.key)} className={`tab ${active === item.key ? 'active' : ''}`} key={index}>
                {item.name}
              </div>
            ))}
          </div>
          <div className={'header'}>
            <span className={'left'}>
              <span className={'leftItem'}>
                创建时间：
                <DatePicker.RangePicker
                  style={{ width: 300 }}
                  value={[
                    filterDateRange[0] ? moment(filterDateRange[0], 'YYYY-MM-DD') : null,
                    filterDateRange[1] ? moment(filterDateRange[1], 'YYYY-MM-DD') : null
                  ]}
                  onChange={this.onChangeDate}
                  // showTime={{ format: 'HH:mm' }}
                />
              </span>
              <span className={'leftItem'}>
                话术场景：
                <Select style={{ width: 150 }} value={sence} onChange={this.onChangeSence}>
                  <Select.Option value={''}>全部</Select.Option>
                  {senceList.map((v, k) => {
                    return (
                      <Select.Option value={v.code} key={v.id}>
                        {v.desc}
                      </Select.Option>
                    )
                  })}
                </Select>
              </span>
              <span className={'leftItem'}>
                <Button type="primary" onClick={this.search} loading={isLoading}>
                  查询
                </Button>
              </span>
              <span className={'leftItem'}>
                <Button type="primary" onClick={this.reset}>
                  重置
                </Button>
              </span>
            </span>
            <div className={'right'}>
              <span className="rightItem">
                <Button
                  type="primary"
                  onClick={this.openSenceModal}
                >
                  场景管理
                </Button>
              </span>

              {active === 'wordsView' && (
                <span className="rightItem">
                  <Button type="primary" onClick={() => { this.showOperateModal() }}>
                    添加话术
                  </Button>
                </span>
              )}

              {active === 'wordsView' && (
                <span className="rightItem">
                  <Button type="primary" onClick={this.showUploadModal}>
                    导入
                  </Button>
                </span>
              )}

              {active === 'materialView' && (
                <span className="rightItem">
                  <Button type="primary" onClick={() => this.showFileModal('add')}>
                    添加文件
                  </Button>
                </span>
              )}
            </div>
          </div>
          <div
            style={{
              position: 'relative'
            }}
          >
            {active === 'materialView' ? (
              <Table
                pagination={pagination}
                onChange={this.handleTableChange}
                rowKey={'id'}
                columns={this.columns2()}
                dataSource={files}
                locale={{ emptyText: '暂无数据' }}
              />
            ) : (
              <Table
                rowSelection={{
                  selectedRowKeys,
                  onChange: this.tableSelectChange,
                  getCheckboxProps: this.getCheckboxProps
                }}
                pagination={pagination}
                onChange={this.handleTableChange}
                rowKey={'id'}
                columns={this.columns1()}
                dataSource={tableData}
                locale={{ emptyText: '暂无数据' }}
              />
            )}
            {active === 'wordsView' && (
              <Button
                type="danger"
                style={{
                  position: 'absolute',
                  bottom: '15px',
                  left: '0px'
                }}
                onClick={this.productDelete}
              >
                删除
              </Button>
            )}
          </div>
        </Spin>
        <DetailModal detailId={detailId} visible={visibleDetailModal} hideModal={this.hideDetailModal} senceList={senceList} />
        <Modal
          wrapClassName={'messageSetting'}
          title={'导入话术'}
          width={620}
          maskClosable={false}
          visible={uploadVisible}
          destroyOnClose={true}
          onCancel={this.handleCancel}
          footer={
            <div>
              <Button type="primary" onClick={this.customRequest} disabled={!fileList.length || !chargeDept.length} loading={isUploading} style={{ marginTop: 16 }}>
                {isUploading ? '导入中' : '导入'}
              </Button>
              <Button type="" onClick={this.handleCancel} style={{ marginTop: 16 }}>
                取消
              </Button>
            </div>
          }
        >
          <Spin spinning={isUploading}>
            <div>
              <Form>
                <Row>
                  <Col span={24}>
                    <Form.Item
                      label={<span><span style={{color: 'red'}}>*</span>选择所属机构</span>}
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 20 }}
                      extra="设置所属机构后，相应话术只在所属机构的客户经理企业微信侧边栏中出现。"
                    >
                      <DeptTreeSelect
                        value={chargeDept}
                        onChange={this.onChangeDept}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <p style={{ margin: '10px 0' }}>话术文件上传（*仅支持excel表格形式，大小不超过2M）</p>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <Upload
                      name={'file'}
                      accept={accept.join(',')}
                      multiple={false}
                      fileList={fileList}
                      onRemove={this.remove}
                      // customRequest={this.customRequest}
                      beforeUpload={this.beforeUpload}
                      showUploadList={{ showDownloadIcon: false }}
                    >
                      <Button type="primary">
                        <Icon type="upload" /> 请选择导入文件
                      </Button>
                    </Upload>
                    <p style={{ margin: '10px 0' }}>操作说明：<br/>
                    1、模板文件中既有的话术场景、二级分类，可直接通过模板文件快速导入话术；<br/>
                    2、模板文件中未有的话术场景、二级分类，需先行创建话术场景和二级分类，再通过模板文件导入话术。</p>
                    <a href={urls.sentenceDownload} target="_blank" style={{ marginTop: '12px', display: 'block' }}>
                      点击下载话术导入模板
                    </a>
                  </Col>
                </Row>
              </Form>
            </div>
          </Spin>
        </Modal>
        <Modal
          wrapClassName={'messageSetting'}
          title={title}
          width={640}
          maskClosable={false}
          destroyOnClose={true}
          visible={visibleOperateModal}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <div>
            <Spin spinning={isUploading || senceList.length === 0}>
              <Form>
                <Row>
                  <Col span={24}>
                    <Form.Item
                      label={<span><span className={'red'}>*</span>选择所属机构</span>}
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 20 }}
                      extra="设置完所属机构后，此话术仅在所属机构的客户经理企业微信侧边栏中出现。"
                    >
                      <DeptTreeSelect
                        value={editObj.chargeDept}
                        onChange={e => this.onChangeEditObj('chargeDept', e)}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <span>
                      <span className={'red'}>*</span>话术场景
                    </span>
                    <Form.Item {...itemCol}>
                      <Select value={editObj.sence} onChange={e => this.onChangeEditObj('sence', e)}>
                        {senceList.map((v, k) => {
                          return (
                            <Select.Option value={v.code} key={v.id}>
                              {v.desc}
                            </Select.Option>
                          )
                        })}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={24}>
                    <span>二级分类</span>
                    <Form.Item {...itemCol}>
                      <Select value={editObj.type} onChange={e => this.onChangeEditObj('type', e)}>
                        <Select.Option value={''}>无</Select.Option>
                        {typeList[idx] &&
                          typeList[idx].map((v, k) => {
                            return (
                              <Select.Option value={v.code} key={v.id}>
                                {v.desc}
                              </Select.Option>
                            )
                          })}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                {editObj.sence === 'question' ? (
                  <Row>
                    <Col span={24}>
                      <span>
                        <span className={'red'}>*</span>问题描述
                      </span>
                      <Form.Item {...itemCol}>
                        <Input
                          value={editObj.remark}
                          onChange={e => this.onChangeEditObj('remark', e)}
                          placeholder="请输入问题描述，30个字以内"
                          maxLength={30}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                ) : (
                  <Row>
                    <Col span={24}>
                      <span>话术标题</span>
                      <Form.Item {...itemCol}>
                        <Input
                          value={editObj.remark}
                          onChange={e => this.onChangeEditObj('remark', e)}
                          placeholder="请输入话术标题，10个字以内"
                          maxLength={10}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
                {editObj.sence === 'question' ? (
                  <Row>
                    <Col span={24}>
                      <span>
                        <span className={'red'}>*</span>话术答案
                      </span>
                      <Form.Item {...itemCol}>
                        <Input.TextArea
                          autoSize={{ minRows: 4, maxRows: 4 }}
                          value={editObj.content}
                          onChange={e => this.onChangeEditObj('content', e)}
                          placeholder="请输入...（500个字以内）"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                ) : (
                  <Row>
                    <Col span={24}>
                      <span>
                        <span className={'red'}>*</span>参考话术
                      </span>
                      <Form.Item {...itemCol}>
                        <Input.TextArea
                          autoSize={{ minRows: 4, maxRows: 4 }}
                          value={editObj.content}
                          onChange={e => this.onChangeEditObj('content', e)}
                          placeholder="请输入...（500个字以内）"
                        />
                        <Picker
                          set='facebook'
                          showSkinTones={false}
                          showPreview={false}
                          sheetSize={64}
                          emojiSize={24}
                          emojisToShowFilter={((emoji) => !emoji.unified.includes('-'))}
                          onClick={(emoji, event) => { this.setState({ editObj: {...this.state.editObj, content: `${this.state.editObj.content}${emoji.native}`} }, () => { console.log(this.state.editObj.content.length) }) }}
                          exclude={['search', 'recent', 'flags']}
                          search={''}
                          useButton={true}
                          theme={'auto'}
                          skin={1}
                          categories={{
                            search: ''
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                )}
                <Row>
                  <Col span={24}>
                    <span>上传图片（最多上传9张图，每张图大小不超过2M）</span>
                    <Form.Item {...itemCol}>
                      <UploadImg imgUrlList={editObj.imgUrlList || []} onChangeEditObj={(name, e) => this.onChangeEditObj(name, e)} />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Spin>
          </div>
        </Modal>
        {fileModalVisible && <FileModal fileRecord={fileRecord} senceList={senceList} fileModalType={fileModalType} close={this.fileModalClose} />}
        <SenceModal
          type={active}
          visible={visibleSenceModal}
          hideModal={this.hideSenceModal}
          senceList={senceList}
          getSenceList={this.getSenceList}
          sentenceList={this.sentenceList}
        />
      </div>
    )
  }
}

export default MessageSetting
