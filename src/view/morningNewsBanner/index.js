import React, { Component } from 'react'
import { Button, Table, message, Switch, Radio, Icon, Alert, Input, Modal, Avatar } from 'antd'
import './index.less'
import axios from '@src/utils/axios'
import urls from '@src/config'
import { connect } from 'react-redux'
import DragSortingTable from './dragSortingTable'

const columns = [
  {
    title: 'banner名称',
    dataIndex: 'bannerName'
  },
  {
    title: '跳转',
    dataIndex: 'relationTitle'
  },
  {
    title: 'banner图片',
    render: (text, record) => (
      <img src={record.bannerImgURL} width={'350'} alt=""/>
    )
  }
]
class MorningNews extends Component {
  constructor (props) {
    super(props)
    this.state = {
      tableData: null,
      isLoading: true,
      isShowBanner: false,
      showComment: true,
      bannerPosition: 'top',
      modalVisible: false,
      contentAlertVisiable: false,
      isEditing: false,
      selectedRowKeys: [],
      titleValue: '',
      preModal: false,
      userName: '',
      userAvatar: '',
      date: ''
    }
    this.currentelectedRowKeys = []
  }

  componentDidMount () {
    const userInfo = this.props.userInfo
    let date = new Date()
    let mon = date.getMonth() + 1
    let day = date.getDate()
    if (day < 10) { day = '0' + day }
    this.setState({
      userName: userInfo.userName,
      userAvatar: userInfo.avatarUrl,
      date: `${mon}月${day}日`
    })
    this.getAllList()
  }

  getAllList = () => {
    return axios.all([this.getTableData(), this.getBannerConfig()])
      .then(axios.spread((tableData, bannerConfig) => {
        // retdata 该字段可能不存在
        const { bannerIdList = [], bannerPlace = 'top', showBanner = false, showComment = true, defaultTitle = '' } = bannerConfig.retdata || {}
        const { list = [] } = tableData.retdata || {}
        // 已设置过的banner
        let newTableDataHeader = bannerIdList.map(i => {
          const item = list.filter(v => i === v.bannerId)[0]
          return item
        }).filter(i => i)
        // 未设置过的banner
        const newTableDataRest = list.filter(i => {
          const inList = !bannerIdList.includes(i.bannerId)
          return inList
        })
        const currentTableData = [...newTableDataHeader, ...newTableDataRest]
        this.setState({
          tableData: currentTableData || [],
          selectedRowKeys: bannerIdList || [],
          bannerPosition: bannerPlace,
          isShowBanner: showBanner,
          isLoading: false,
          showComment,
          titleValue: defaultTitle
        })
        this.currentelectedRowKeys = bannerIdList
      })).catch(() => {
        this.setState({
          isLoading: false
        })
      })
  }
  // 加载列表全部数据
  getTableData = () => {
    return axios.post(urls.bannerList, { pageNum: 1, pageSize: 100 })
  }
  // 加载已配置的banner列表
  getBannerConfig = () => {
    return axios.get(urls.bannerConfig, {})
  }

  handleEdit = () => {
    this.setState({isEditing: true})
  }

  onChangeIsShowBanner = () => {
    this.setState({
      isShowBanner: !this.state.isShowBanner
    }, this.saveEdit)
  }

  onChangeIsShowRate = () => {
    this.setState({
      showComment: !this.state.showComment
    }, this.saveEdit)
  }

  radioOnChange = (e) => {
    this.setState({bannerPosition: e.target.value}, this.saveEdit)
  }

  readGuid = () => {
    this.setState({ modalVisible: true })
  }

  readContentAlert = () => {
    this.setState({ contentAlertVisiable: true })
  }

  handleClose = () => {
    setTimeout(() => {
      this.setState({ modalVisible: false })
    }, 1000)
  }

  handleContenAlertClose = () => {
    setTimeout(() => {
      this.setState({ contentAlertVisiable: false })
    }, 1000)
  }

  preSave = () => {
    const { isShowBanner, bannerPosition, showComment, titleValue } = this.state
    const pramse = {
      showBanner: isShowBanner,
      bannerPlace: bannerPosition,
      bannerIdList: this.currentelectedRowKeys,
      showComment: showComment,
      defaultTitle: titleValue
    }
    axios.post(urls.bannerConfigReset, pramse, {headers: {'Content-Type': 'application/json'}}).then(res => {
      if (res.ret === 0) {
        message.success('保存成功!')
      }
    }).catch(() => {
    })
  }

  saveEdit = () => {
    const { isShowBanner, bannerPosition, showComment } = this.state
    const pramse = {
      showBanner: isShowBanner,
      bannerPlace: bannerPosition,
      bannerIdList: this.currentelectedRowKeys,
      showComment
    }
    axios.post(urls.bannerConfigReset, pramse, {headers: {'Content-Type': 'application/json'}}).then(res => {
      this.getAllList()
      message.success('保存成功!')
      this.setState({ isEditing: false })
    }).catch(() => {
      this.setState({ isEditing: false })
    })
  }

  resetEdtit = () => {
    this.setState({ isEditing: false })
  }

  reportTableSort = (data) => {
    this.reportTableSortData = data
  }

  updateSelectedRowKeys = data => {
    this.currentelectedRowKeys = data
  }

  getBannerList = () => {
    const {tableData, selectedRowKeys} = this.state
    if (!tableData) return []
    const news = selectedRowKeys.map(i => {
      const item = tableData.filter(v => i === v.bannerId)[0]
      return item
    }).filter(i => i)
    return news
  }

  handlePreOk = () => {
    this.setState({
      preModal: false
    })
  }

  handlePreCancel =() => {
    this.setState({
      preModal: false
    })
  }

  handlePre = () => {
    this.setState({
      preModal: true
    })
  }

  render () {
    const {
      tableData,
      isLoading,
      isShowBanner,
      showComment,
      bannerPosition,
      modalVisible,
      contentAlertVisiable,
      isEditing,
      selectedRowKeys,
      titleValue,
      preModal,
      userName,
      userAvatar,
      date
    } = this.state
    const currentTableData = isShowBanner ? tableData : []
    const currentBannerList = isShowBanner ? this.getBannerList() : []
    const emptyText = !isShowBanner ? '暂无数据' : !currentBannerList.length ? '暂未设置早报banner内容，请点“添加”进行新增维护。' : '暂无数据'
    return (
      <div className={'bannerList'}>
        <div style={{fontSize: 18, fontWeight: '550', color: '#333', marginBottom: 20}}>
          分享到朋友圈时的综述标题
        </div>
        <div className={'content'}>
          <Input
            value={titleValue}
            onChange={(e) => { this.setState({titleValue: e.target.value}) }}
            maxLength={12}
            placeholder='财经新闻一早知'
            style={{width: 256}}
          />
          <Button size='small' style={{marginLeft: 6}} onClick={this.handlePre}>预览</Button>
          <Button type='primary' size='small' style={{marginLeft: 6}} onClick={this.preSave}>保存</Button>
        </div>
        <div style={{fontSize: 18, fontWeight: '550', color: '#333', marginBottom: 20}}>
          点评设置
        </div>
        <div className={'content'}>
          <div style={{marginBottom: 20}}>
            <span>是否展示点评：</span>
            <Switch checked={showComment} size="small" onChange={this.onChangeIsShowRate} />
            {showComment ? ' 是' : ' 否'}
          </div>
        </div>
        <div style={{fontSize: 18, fontWeight: '550', color: '#333', marginBottom: 20}}>
          早报banner配置
        </div>
        <div className={'content'}>
          <div style={{marginBottom: 30}}>
            <span>是否在早报中显示活动banner：</span>
            <Switch checked={isShowBanner} size="small" onChange={this.onChangeIsShowBanner} />
            {isShowBanner ? ' 是' : ' 否'}
          </div>
          <div style={{marginBottom: 30, position: 'relative'}}>
            <span>banner显示位置 <Icon type="info-circle" onClick={this.readGuid} /> ：</span>
            <Radio.Group name="radiogroup" value={bannerPosition} onChange={this.radioOnChange} >
              <Radio value={'top'}>顶部位置</Radio>
              <Radio value={'mid'}>中部位置</Radio>
            </Radio.Group>
            {modalVisible ? <Alert
              message="顶部位置指在早报的所有文章内容之前；中部位置指在第一个文章内容模块之后的位置"
              type="info"
              closable
              style={{position: 'absolute', width: 400, top: 30, zIndex: 100}}
              onClose={this.handleClose}
            /> : null }
          </div>
          <div style={{marginBottom: 50, position: 'relative'}}>
            <span>banner展示内容设置 <Icon type="info-circle" onClick={this.readContentAlert} /> ：</span>
            {contentAlertVisiable ? <Alert
              message="早报banner内容的来源为banner配置中的内容，如需新增，请在对应菜单操作"
              type="info"
              closable
              style={{position: 'absolute', width: 400, top: 30, zIndex: 100}}
              onClose={this.handleContenAlertClose}
            /> : null }
            {isShowBanner && !isEditing ? <Button
              style={{float: 'right', marginRight: 200, width: 100}}
              type="primary"
              onClick={this.handleEdit}>
              {currentBannerList.length ? '编辑' : '添加'}</Button>
              : null
            }
            { isEditing && isShowBanner ? <span style={{float: 'right', textAlign: 'right'}}>
              <Button
                type="primary"
                style={{ marginRight: 20 }}
                onClick={this.saveEdit}>保存</Button>
              <Button
                type="danger"
                style={{marginRight: 100}}
                onClick={this.resetEdtit}>取消</Button>
              <span style={{display: 'block', marginTop: 10}}>（前端页面将根据勾选数据的顺序展示，点击单条数据拖动可对数据进行排序。）</span>
            </span> : null}
          </div>
          {isEditing ? <DragSortingTable
            isShowBanner={isShowBanner}
            selectedRowKeys={selectedRowKeys}
            dataSource={currentTableData}
            updateTableSort={this.reportTableSort}
            updateSelectedRowKeys={this.updateSelectedRowKeys}
          /> : <Table
            loading={isLoading}
            className={'bannerTable'}
            columns={columns}
            dataSource={currentBannerList}
            rowKey={'bannerId'}
            pagination={false}
            locale={{emptyText}}
          />}
        </div>
        <Modal
          title=""
          visible={preModal}
          onOk={this.handlePreOk}
          onCancel={this.handlePreCancel}
          width={400}
          footer={null}
        >
          <div style={{overflow: 'auto', display: 'flex', height: 128}}>
            <div>
              <Avatar size={48} shape="square" src={userAvatar} />
            </div>
            <div style={{marginLeft: 6}}>
              <div style={{color: '#009dd9', fontWeight: 'bold'}}>{userName}</div>
              <div>{titleValue}<span style={{marginLeft: 4, marginRight: 4}}>|</span>{date}</div>
              <div>①钟南山：疫苗最早这个时候能用到！</div>
              <div>②各地保费哪家强？这里的人最爱买保险…</div>
              <div>③学位房又出大事，买房千万要确认这件事。…</div>
            </div>
          </div>
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    userInfo: state.base.userInfo
  }
}

export default (connect(
  mapStateToProps
)(MorningNews))
