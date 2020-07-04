import React, { Component } from 'react'
import { Button, Input, Table, Tooltip, message, Select, Tag, Icon, Spin, Modal, DatePicker } from 'antd'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'
import dragableBodyRow from '@src/view/base/dragTable'
import styles from './index.less'
import { Link } from 'react-router-dom'
import axios from '@src/utils/axios'
import urls from '@src/config'
import Tools from '@src/utils'
import DetailModal from './detailModal'
import StaffParamModal from './staffParamModal'
import DataList from './dataList'
import moment from 'moment'
import DeptTreeSelect from '@src/components/DeptTreeSelect'

const { RangePicker } = DatePicker

// 产品列表非拖拽、拖拽页面
class ProductList extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      tableData: [],
      pagination: {
        current: 1,
        pageSize: 20,
        total: 0
      },
      isLoading: true,
      filterName: '',
      chargeDept: [],
      businessType: '',
      publicProductTypeList: [],
      retailProductTypeList: [],
      allProductTypeList: [],
      currentProductTypeList: [],
      productTypeId: '',
      visibleDetailModal: false,
      detailId: '',
      sortedInfo: {},
      // 是否是拖拽产品列表页面
      isDragFile: false,
      selectedRowKeys: [],
      visibleOperateModal: false,
      operateList: [],
      filterDateRange: ['', ''],
      currentRecord: null,
      setPushModal: false,
      configOrgTree: [],
      orgIdList: [],
      id: '',
      showStaffParamModal: false,
      confirmLoading: false,
      showDataList: false
    }
  }
  // 进页面
  componentDidMount () {
    this.initData()
  }
  // 切换产品列表非拖拽、拖拽页面
  componentWillReceiveProps (next) {
    if (next.location.search !== this.props.location.search) {
      this.initData()
    }
  }
  // 初始化数据
  initData = () => {
    this.getProductTypeList().then(() => {
      const isDragFile = this.props.location.search.split('=')[1]
      const { allProductTypeList, publicProductTypeList } = this.state
      const currentProductTypeList = isDragFile ? publicProductTypeList : allProductTypeList
      const businessType = isDragFile ? 1 : ''
      const productTypeId = isDragFile ? (publicProductTypeList[0] && publicProductTypeList[0]['productTypeId']) : ''
      this.setState({
        isDragFile,
        currentProductTypeList,
        businessType,
        productTypeId,
        // 清空排序
        sortedInfo: {},
        filterName: ''
      }, () => this.fetch())
    })
  }
  // 获取产品类别列表
  getProductTypeList = () => {
    this.setState({ isLoading: true })
    return axios.all([this.getPublicProductTypeList(), this.getRetailProductTypeList()])
      .then(axios.spread((publicRes, retailRes) => {
        const publicProductTypeList = publicRes.retdata.list || []
        const retailProductTypeList = retailRes.retdata.list || []
        this.setState({
          publicProductTypeList,
          retailProductTypeList,
          allProductTypeList: [...publicProductTypeList, ...retailProductTypeList]
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
  // 名称
  handleChangeName = (ev) => {
    this.setState({ filterName: ev.target.value })
  }
  // 切换业务类型
  onChangeBusinessType = (value) => {
    const { publicProductTypeList, retailProductTypeList, allProductTypeList, isDragFile } = this.state
    let currentProductTypeList = []
    if (value === 1) {
      currentProductTypeList = publicProductTypeList
    } else if (value === 2) {
      currentProductTypeList = retailProductTypeList
    } else {
      currentProductTypeList = allProductTypeList
    }
    this.setState({
      businessType: value,
      currentProductTypeList,
      productTypeId: isDragFile ? (currentProductTypeList[0] && currentProductTypeList[0]['productTypeId']) : ''
    }, () => {
      // 如果当前是拖拽页面 切换业务类型或者产品类别后直接请求table数据
      isDragFile && this.fetch()
    })
  }
  // 切换产品类别
  onChangeProductType = (value) => {
    const { isDragFile } = this.state
    this.setState({
      productTypeId: value
    }, () => {
      isDragFile && this.fetch()
    })
  }
  // 分页、排序、筛选变化时触发 获取表格数据
  handleTableChange = (pagination, filters, sorter) => {
    const { columnKey: prevColumnKey, order: prevOrder } = this.state.sortedInfo
    const pager = { ...this.state.pagination }
    if ((prevColumnKey === sorter.columnKey) && (prevOrder === sorter.order)) {
      pager.current = pagination.current
    } else {
      // 如果改变了排序 跳到第一页
      pager.current = 1
    }
    this.setState({
      pagination: pager,
      sortedInfo: sorter
    }, () => {
      this.fetch()
    })
  }
  // 表格排序参数
  getOrderType = (sortedInfo) => {
    let type = ''
    if (sortedInfo.columnKey === 'sendCount') {
      type = sortedInfo.order === 'descend' ? 0 : 1
    } else if (sortedInfo.columnKey === 'openCount') {
      type = sortedInfo.order === 'descend' ? 2 : 3
    } else if (sortedInfo.columnKey === 'customCount') {
      type = sortedInfo.order === 'descend' ? 4 : 5
    } else if (sortedInfo.columnKey === 'dateCreated') {
      type = sortedInfo.order === 'descend' ? 6 : 7
    } else if (sortedInfo.columnKey === 'putOnTime') {
      type = sortedInfo.order === 'descend' ? 10 : 11
    }
    return type
  }
  // 点击查询
  search = () => {
    const pagination = { ...this.state.pagination }
    pagination.current = 1
    // 默认第一页 清空排序
    this.setState({ pagination, sortedInfo: {} }, () => {
      this.fetch()
    })
  }
  // 表格数据获取
  fetch () {
    const { filterName, businessType, productTypeId, sortedInfo, isDragFile, filterDateRange } = this.state
    const { current, pageSize, total } = this.state.pagination
    const data = {
      name: filterName,
      businessType,
      typeId: productTypeId,
      // 拖拽页面fetch列表orderBy 8，其他根据sortedInfo
      orderBy: isDragFile ? 8 : this.getOrderType(sortedInfo),
      pageNum: current,
      // 拖拽页面不分页
      pageSize: isDragFile ? 9999 : pageSize,
      startTime: filterDateRange[0] ? new Date(filterDateRange[0]).format('yyyy-MM-dd') : '',
      endTime: filterDateRange[1] ? new Date(filterDateRange[1]).format('yyyy-MM-dd') : ''
    }
    this.setState({ isLoading: true })
    axios.post(urls.getProductList, data).then(res => {
      const pagination = { ...this.state.pagination }
      pagination.total = res.retdata.total
      this.setState({
        isLoading: false,
        tableData: res.retdata.list,
        pagination
      })
    })
  }
  // 重置
  reset = () => {
    this.setState({
      filterDateRange: ['', ''],
      filterName: '',
      businessType: '',
      productTypeId: ''
    }, () => {
      this.search()
    })
  }
  // 文章详情modal
  showDetailModal = (record) => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'productView')
    if (!isRight) return
    this.setState({ detailId: record.id, currentRecord: record, visibleDetailModal: true })
  }
  // 文章详情modal 取消
  hideDetailModal = () => {
    this.setState({ visibleDetailModal: false })
  }
  // 产品排序置顶
  sortTop = (id) => {
    const data = {
      newSeq: 0,
      productId: id
    }
    axios.post(urls.updateSeq, data).then(res => {
      this.fetch()
    })
  }
  // newSeq 被拖拽产品放下的位置的前一个产品的seq
  getNewSeq = (dragIndex, hoverIndex, tableData) => {
    if (hoverIndex === 0) {
      // 如果是被拖拽到首位 newSeq是0
      return 0
    } else {
      if (dragIndex > hoverIndex) {
        // 往上拖
        return tableData[hoverIndex - 1]['seq']
      } else {
        // 往下拖
        return tableData[hoverIndex]['seq']
      }
    }
  }
  // 拖拽表格排序
  onMoveTableRow = (dragIndex, hoverIndex) => {
    const { tableData } = this.state
    const dragRow = tableData[dragIndex]
    const data = {
      newSeq: this.getNewSeq(dragIndex, hoverIndex, tableData),
      productId: dragRow.id
    }
    axios.post(urls.updateSeq, data).then(res => {
      this.fetch()
    })
  }
  // 点击表格行勾选框
  tableSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys })
  }
  // 批量删除
  productDelete = () => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'productDel')
    if (!isRight) return
    const { selectedRowKeys } = this.state
    if (!selectedRowKeys.length) {
      return message.warning('请勾选要删除的产品')
    }
    Modal.confirm({
      title: '确定?',
      content: `是否删除选中的${selectedRowKeys.length}个产品`,
      onOk: () => {
        axios.post(urls.productDelete, { productId: selectedRowKeys.join(',') }).then(res => {
          if (res.ret === 0) {
            this.setState({ selectedRowKeys: [] })
            message.success('删除产品成功')
            this.fetch()
          }
        })
      },
      onCancel: () => {
      }
    })
  }
  // 操作详情modal 显示
  showOperateModal = (id) => {
    const data = {
      businessId: id,
      pageNum: 0,
      pageSize: 1000
    }
    axios.post(urls.productLogList, data).then(res => {
      this.setState({ operateList: res.retdata.list, visibleOperateModal: true })
    })
  }
  // 上下架
  putOn = (record) => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'productOnOff')
    if (!isRight) return
    // 0 已上架状态, 1 已下架状态
    const data = {
      productId: record.id,
      status: record.status === 0 ? 1 : 0
    }
    if (record.status) {
      const isBefore = moment(record.putOffTime).isBefore(new Date()) // 下架时间已过期
      const textHint = isBefore ? '该产品下架时间已经过期，如需要重新上架，请前往产品编辑页面修改上下架时间' : '上架成功后，上架时间会变为当前时间'
      const _this = this
      Modal.confirm({
        title: '确定？',
        content: textHint,
        onOk () {
          if (isBefore) {
            const path = { pathname: '/productUpdate', search: `?id=${record.id}` }
            _this.props.history.push(path)
          } else {
            axios.post(urls.productOnOff, data).then(res => {
              if (res.ret === 0) {
                message.success('产品上架成功')
                _this.fetch()
              }
            })
          }
        },
        onCancel () {
        }
      })
    } else {
      axios.post(urls.productOnOff, data).then(res => {
        if (res.ret === 0) {
          message.success('产品下架成功')
          this.fetch()
        }
      })
    }
  }
  // 推送
  handlePushSetModal = (record) => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'productPush')
    if (!isRight) return
    if (!record.owner) {
      Tools.openRightMessage()
      return
    }
    axios.post(urls.getProductDetail, { id: record.id }).then(res => {
      if (res.ret === 0) {
        let ids = []
        const result = res.retdata.detail.deptList
        if (result.length) { result.forEach(item => { ids.push(item.deptId) }) }
        this.setState({
          chargeDept: ids,
          setPushModal: true,
          id: record.id
        })
      } else { message.error('获取推送产品可见部门报错：' + res.retmsg) }
    }).catch(() => {})
  }

  // 推送设置确认 后端判断机构是否选择有误
  handleSetPushModalOk = () => {
    const {id, chargeDept} = this.state
    let depts = chargeDept.join(',')
    if (!chargeDept.length) {
      message.info('请选择机构')
      return
    }
    this.setState({
      confirmLoading: true
    })
    axios.post(urls.pushProductCheck, {id, deptIds: depts}, {header: {'Content-Type': 'application/x-www-form-urlencoded'}}).then((res) => {
      const result = res.retdata
      let msg = ''
      let okFlag = true
      if (result.length) {
        result.forEach(item => {
          if (!item.result) {
            okFlag = false
            msg += item.deptName + '，'
          }
        })
      }
      if (res.ret === 0 && okFlag) {
        this.showPushConfirmModal()
      } else {
        message.warning(msg + '不在产品所选择的可见范围内')
      }
      this.setState({
        confirmLoading: false
      })
    })
  }

  showPushConfirmModal = () => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'productPush')
    if (!isRight) return
    const { id, chargeDept } = this.state
    let depts = chargeDept.join(',')
    const _this = this
    Modal.confirm({
      title: '确定？',
      content: '产品推送后，客户经理可前往企业微信-消息-营销助手查看及分享',
      onOk () {
        axios.post(urls.productPush, {id, depts}, {headers: {'Content-Type': 'application/json;charset=UTF-8'}}).then(res => {
          if (res.ret === 0) {
            _this.setState({
              setPushModal: false
            })
            _this.fetch()
            message.success('推送成功')
          } else {
            message.error('推送失败：' + res.retmsg)
          }
        }).catch(() => {
          message.error('推送失败：接口报错')
        })
      },
      onCancel () {
      }
    })
  }

  // 时间范围
  onChangeRangePicker = (date) => { this.setState({ filterDateRange: date }) }

  prettierDate = date => {
    if (!date) return ''
    const thisYear = moment(new Date()).format('YYYY-MM-DD')
    const isSameYear = moment(date).isSame(thisYear, 'year')
    const dateReg = isSameYear ? 'MM-DD' : 'YYYY-MM-DD'
    return moment(date).format(dateReg)
  }

  onChangeOrg = (value) => {
    this.setState({
      orgIdList: value
    })
  }

  getCheckboxProps = (record) => {
    return ({ disabled: !record.owner })
  }

  handleSortList = () => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'productSort')
    if (!isRight) return
    this.props.history.push({ pathname: '/productList', search: `?drag=1` })
  }

  // 选择所属机构
  onChangeDept = value => { this.setState({ chargeDept: value }) }

  showStaffParamModal = () => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'paramSet')
    if (!isRight) return
    this.setState({
      showStaffParamModal: true
    })
  }

  hideStaffParamModal = () => {
    this.setState({
      showStaffParamModal: false
    })
  }

  render () {
    const { tableData, businessType, currentProductTypeList, productTypeId, filterName, sortedInfo, chargeDept,
      pagination, isLoading, visibleDetailModal, detailId, isDragFile, selectedRowKeys, visibleOperateModal, confirmLoading,
      operateList, filterDateRange, setPushModal, currentRecord, showStaffParamModal, showDataList } = this.state
    const columns = [{
      title: '产品名称',
      dataIndex: 'title',
      render: (text, record) => (
        <span>
          {record.isPush === 1 ? <Tag color="blue">主推</Tag> : null}
          {record.pushState === 1 ? <Tag color="green">已推送</Tag> : null}
          <span>{record.name}</span>
        </span>
      )
    },
    {
      title: '业务类型',
      dataIndex: 'businessType'
    }, {
      title: '产品类别',
      dataIndex: 'productTypeName'
    }, {
      title: '发送次数',
      dataIndex: 'sendCount',
      sorter: !isDragFile,
      sortOrder: sortedInfo.columnKey === 'sendCount' && sortedInfo.order
    }, {
      title: '打开次数',
      dataIndex: 'openCount',
      sorter: !isDragFile,
      sortOrder: sortedInfo.columnKey === 'openCount' && sortedInfo.order
    },
    {
      title: '创建时间',
      dataIndex: 'dateCreated',
      render: (text, record) => (
        <span>{record.dateCreated.substring(5)}</span>
      ),
      sorter: !isDragFile,
      sortOrder: sortedInfo.columnKey === 'dateCreated' && sortedInfo.order
    }, {
      title: '上架时间',
      dataIndex: 'putOnTime',
      render: (text, record) => record.putOnTime ? (
        <span>{this.prettierDate(record.putOnTime)}</span>
      ) : '',
      sorter: !isDragFile,
      sortOrder: sortedInfo.columnKey === 'putOnTime' && sortedInfo.order
    }, {
      title: '最近一次修改记录',
      dataIndex: 'customCount',
      render: (text, record) => (
        <span style={{color: '#1890ff', cursor: 'pointer'}} onClick={() => this.showOperateModal(record.id)}>
          {record.lastUpdated} {record.nameUpdateBy}
        </span>
      )
    }, {
      title: isDragFile ? '展示排序' : '操作',
      dataIndex: 'sendDetail',
      width: 160,
      render: (text, record, index) => {
        const detail = <span>
          <span style={{color: '#1890ff', cursor: 'pointer'}}
            onClick={() => this.showDetailModal(record)}>查看</span>
          <span style={{color: record.status ? '#1890ff' : '#999', cursor: 'pointer', margin: '0 10px'}}
            // 0 已上架状态 显示为下架按钮
            onClick={() => this.putOn(record)}>{record.status ? '上架' : '下架'}
          </span>
          <span style={{color: '#1890ff', cursor: 'pointer'}}
            onClick={() => this.handlePushSetModal(record)}>推送</span>
        </span>
        const dragAction = (<span>
          <span className={styles.upWrap}>
            {index === 0 ? null : <Icon type="up" className={styles.actionUpIcon} onClick={() => this.sortTop(record.id)} />}
          </span>
          <span>
            <Icon type="menu-fold" className={styles.actionDragIcon}/>
          </span>
        </span>)
        return isDragFile ? dragAction : detail
      }
    }]
    const operateColumns = [{
      title: '操作人',
      dataIndex: 'nameCreateBy',
      ellipsis: true
    }, {
      title: '操作时间',
      dataIndex: 'dateCreated'
    }, {
      title: '操作',
      dataIndex: 'operate',
      ellipsis: true,
      render: (text, record) => (
        <span>{record.optType + '了产品'}</span>
      )
    }]
    return (
      <div className="productList">
        <Spin spinning={isLoading}>
          {isDragFile ? <div className={styles.titleArea}>
            <Link to={{ pathname: '/productList' }}>
              <Button type="primary">{' < 返回所有产品'}</Button>
            </Link>
            <span className={styles.title}>编辑产品排序</span>
          </div> : null}
          <div className={styles.header}>
            <span className={styles.left}>
              {!isDragFile ? <span className={styles.leftItem}>
              产品名称：<Input style={{ width: 150 }} value={filterName} placeholder="产品名称" onChange={this.handleChangeName} />
              </span> : null}
              <span className={styles.leftItem}>
              业务类型：<Select style={{ width: 150 }} value={businessType} onChange={this.onChangeBusinessType}>
                  {!isDragFile ? <Select.Option value={''}>全部</Select.Option> : null}
                  <Select.Option value={1}>对公业务</Select.Option>
                  <Select.Option value={2}>零售业务</Select.Option>
                </Select>
              </span>
              <span className={styles.leftItem}>
              产品类别：<Select style={{ width: 150 }} value={productTypeId} onChange={this.onChangeProductType}>
                  {!isDragFile ? <Select.Option key={''} value={''}>{'全部'}</Select.Option> : null}
                  {currentProductTypeList.map(obj => {
                    return <Select.Option key={obj.productTypeId} value={obj.productTypeId}>{obj.productTypeName}</Select.Option>
                  })}
                </Select>
              </span>
              <span className={styles.leftItem}>
                  产品上架时间：<RangePicker
                  format="YYYY-MM-DD"
                  value={[
                    filterDateRange[0] ? moment(filterDateRange[0], 'YYYY-MM-DD') : null,
                    filterDateRange[1] ? moment(filterDateRange[1], 'YYYY-MM-DD') : null
                  ]}
                  onChange={this.onChangeRangePicker}
                />
              </span>
              {!isDragFile ? <span className={styles.leftItem}>
                <Button type="primary" onClick={this.search}>查询</Button>
              </span> : null}
              {!isDragFile ? <span className={styles.leftItem}>
                <Button type="primary" onClick={this.reset}>重置</Button>
              </span> : null}
              {!isDragFile ? <span className={styles.leftItem}>
                <Button type="primary" onClick={this.handleSortList}>编辑产品排序</Button>
                <Tooltip placement="bottom" title={'编辑单个产品类别内的产品的排序，小程序内看到单个类别内的产品将按照此顺序排序'}>
                  <Icon type="info-circle" className={styles.sortIcon} />
                </Tooltip>
              </span> : null}
              {!isDragFile ? <span className={styles.leftItem} style={{display: 'inline-block', marginTop: 20}}>
                <Button type="primary" onClick={this.showStaffParamModal}>参数配置</Button>
                <Tooltip placement="bottom" title={'可设置员工参数，用于员工业绩归属追踪'}>
                  <Icon type="info-circle" className={styles.sortIcon} />
                </Tooltip>
              </span> : null}
              {!isDragFile ? <span className={styles.leftItem} style={{display: 'inline-block', marginTop: 20}}>
                <Button type="primary" onClick={() => this.setState({ showDataList: true })}>数据统计</Button>
              </span> : null}
            </span>
          </div>
          <div>
            {isDragFile
              ? <DndProvider backend={HTML5Backend}>
                <Table
                  columns={columns}
                  rowKey={'id'}
                  dataSource={tableData}
                  pagination={false}
                  onChange={this.handleTableChange}
                  locale={{emptyText: '暂无数据'}}
                  components={{
                    body: {
                      row: dragableBodyRow
                    }
                  }}
                  onRow={(record, index) => ({
                    index,
                    moveRow: this.onMoveTableRow
                  })}
                />
              </DndProvider>
              : <div style={{ position: 'relative' }}>
                <Table
                  rowSelection={{
                    selectedRowKeys,
                    onChange: this.tableSelectChange,
                    getCheckboxProps: this.getCheckboxProps
                  }}
                  columns={columns}
                  rowKey={'id'}
                  dataSource={tableData}
                  pagination={pagination}
                  onChange={this.handleTableChange}
                  locale={{emptyText: '暂无数据'}}
                />
                <Button type="danger" style={{ position: 'absolute', bottom: '15px', left: '0px' }}
                  onClick={this.productDelete}>删除</Button>
              </div>
            }
          </div>
          <DetailModal currentRecord={currentRecord} detailId={detailId} visible={visibleDetailModal} hideModal={this.hideDetailModal} />
        </Spin>
        <Modal
          title={`操作记录(${operateList.length}条)`}
          width={800}
          visible={visibleOperateModal}
          onCancel={() => { this.setState({ visibleOperateModal: false }) }}
          footer={null}
        >
          <div style={{maxHeight: '500px', overflow: 'auto'}}>
            <Table
              columns={operateColumns}
              rowKey={'dateCreated'}
              dataSource={operateList}
              locale={{emptyText: '暂无记录'}}
              pagination={false}
            />
          </div>
        </Modal>
        <Modal
          title='推送设置'
          maskClosable={false}
          width={630}
          visible={setPushModal}
          confirmLoading={confirmLoading}
          onCancel={() => { this.setState({ setPushModal: false, confirmLoading: false }) }}
          onOk={this.handleSetPushModalOk}
        >
          <div style={{marginBottom: 22}}><span style={{color: 'red'}}>*</span>温馨提示：请选择产品新增时的可见部门</div>
          <div style={{display: 'flex'}}>
            <div><span style={{color: 'red'}}>*</span>选择可见部门：</div>
            <DeptTreeSelect style={{width: '73%'}} value={chargeDept} onChange={this.onChangeDept}/>
          </div>
        </Modal>
        <StaffParamModal visible={showStaffParamModal} hiddenModal={this.hideStaffParamModal} />
        {showDataList && <DataList visible={showDataList} title={'数据统计'} subTitle={'预约申请'} width={1000} warpClass={'productList'} closeDataList={() => { this.setState({ showDataList: false }) }}/>}
      </div>
    )
  }
}

export default ProductList
