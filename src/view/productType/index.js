import React, { Component } from 'react'
import { Radio, Button, Table, Icon, Modal, message } from 'antd'
import { DndProvider } from 'react-dnd'
import styles from './index.less'
import HTML5Backend from 'react-dnd-html5-backend'
import dragableBodyRow from '@src/view/base/dragTable'
import axios from '@src/utils/axios'
import urls from '@src/config'
import AddProductCategory from './addProductCategory'
import Tools from '@src/utils'

// 产品类别管理
class ProductType extends Component {
  constructor (props, context) {
    super(props)
    this.state = {
      businessType: 2,
      tableData: [],
      isLoading: false,
      isShowAddProductModal: false,
      onEditItem: null,
      isShowDeleteModal: false
    }
  }

  componentDidMount () {
    this.getProductTypeList()
  }
  // 切换产品类型
  onChangeBusinessType = e => {
    this.setState({
      businessType: e.target.value
    }, () => {
      this.getProductTypeList()
    })
  };
  // 获取产品类型列表
  getProductTypeList = () => {
    const { businessType } = this.state
    this.setState({ isLoading: true })
    axios.post(urls.getProductTypeList, { businessType }).then(res => {
      this.setState({ tableData: res.retdata.list, isLoading: false })
    })
  }
  // 置顶
  sortTop = (productTypeId) => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'productTypeSort')
    if (!isRight) return
    const data = {
      newSeq: 0,
      productTypeId
    }
    axios.post(urls.updateProductTypeSeq, data).then(res => {
      this.getProductTypeList()
    })
  }
  // newSeq 被拖拽产品放下的位置的前一个产品的productTypeSeq
  getNewSeq = (dragIndex, hoverIndex, tableData) => {
    if (hoverIndex === 0) {
      // 首位 newSeq是0
      return 0
    } else {
      if (dragIndex > hoverIndex) {
        // 往上拖
        return tableData[hoverIndex - 1]['productTypeSeq']
      } else {
        // 往下拖
        return tableData[hoverIndex]['productTypeSeq']
      }
    }
  }
  // 拖拽表格排序
  onMoveTableRow = (dragIndex, hoverIndex) => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'productTypeSort')
    if (!isRight) return
    const { tableData } = this.state
    console.log(dragIndex, hoverIndex)
    const dragRow = tableData[dragIndex]
    const data = {
      newSeq: this.getNewSeq(dragIndex, hoverIndex, tableData),
      productTypeId: dragRow.productTypeId
    }
    axios.post(urls.updateProductTypeSeq, data).then(res => {
      this.getProductTypeList()
    })
  }

  addProductCategory = () => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'productTypeAdd')
    if (!isRight) return
    this.setState({onEditItem: null, isShowAddProductModal: true})
  }

  beforeDeleteItem = (ev, record) => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'productTypeDel')
    if (!isRight) return
    const action = urls.checkDeleteable(record.productTypeId)
    axios.get(action).then(res => {
      if (res.retdata === 1) {
        this.deleteItem(ev, record)
      } else {
        message.info('该类别已有上架和待上架产品，不可删除')
      }
    }
    )
  }

  deleteItem = (ev, record) => {
    ev.preventDefault()
    const _this = this
    Modal.confirm({
      title: '确认删除',
      content: '类别删除后，其下产品也会被删除',
      onOk () {
        axios.post(urls.deleteProduceCatagory, { id: record.productTypeId }).then(res => {
          _this.getProductTypeList().then(() => {
            message.success('删除成功')
          })
        })
      },
      onCancel () {}
    })
  }

  editItem = (item) => {
    const isRight = Tools.checkButtonRight(this.props.location.pathname, 'productTypeEdit')
    if (!isRight) return
    this.setState({ onEditItem: item, isShowAddProductModal: true })
  }

  render () {
    const { businessType, tableData, isLoading, isShowAddProductModal, onEditItem } = this.state
    const columns = [
      {
        title: 'icon',
        dataIndex: 'productTypeIcon',
        render: (text, record) => {
          return <img width={30} height={30} src={record.productTypeIcon} alt=""/>
        }
      },
      {
        title: '名称',
        dataIndex: 'productTypeName'
      },
      {
        title: '编辑排序',
        render: (text, record, index) => {
          return <span className={styles.iconSpan}>
            <span className={'upWrap'}>
              {index === 0 ? null : <Icon type="up" className={'actionUpIcon'} onClick={() => this.sortTop(record.productTypeId)} />}
            </span>
            <span onClick={(ev) => this.beforeDeleteItem(ev, record)} style={{cursor: 'pointer'}}>
              <Icon type="delete" className={'upWrap'}/>
            </span>
          </span>
        }
      }
    ]
    return (
      <div className={'productType'}>
        <div className={'title'}>产品类别管理</div>
        <div style={{marginTop: 20}}>
          产品类别：<Button onClick={this.addProductCategory} type={'default'}><Icon type={'plus'} />新增类别</Button>
        </div>
        <div className={'top'}>
          <div className={'label'}>业务类型：</div>
          <div className={'content'}>
            <Radio.Group onChange={this.onChangeBusinessType} value={businessType}>
              <Radio value={2}>零售业务</Radio>
              <Radio value={1}>对公业务</Radio>
            </Radio.Group>
          </div>
        </div>
        <div className={'bottom'}>
          <div className={'content'}>
            <DndProvider backend={HTML5Backend}>
              <Table
                loading={isLoading}
                columns={columns}
                pagination={false}
                rowKey={'productTypeId'}
                dataSource={tableData}
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
          </div>
        </div>
        {isShowAddProductModal ? <AddProductCategory
          refreshQuery={this.getProductTypeList}
          visible={isShowAddProductModal}
          hideModal={() => this.setState({isShowAddProductModal: false})}
          tableData={tableData}
          onEditItem={onEditItem}
        /> : null }
      </div>
    )
  }
}

export default ProductType
