import React, { Component } from 'react'
import { Table, Button, Upload, Icon, message, TreeSelect, Spin, Modal } from 'antd'
import { Link, withRouter } from 'react-router-dom'
import styles from './index.less'
import Tools from '@src/utils'
import axios from '@src/utils/axios'
import urls from '@src/config'

class DetailModal extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pagination: {
        current: 1,
        pageSize: 20,
        total: 0
      },
      operateList: [],
      detail: {},
      id: '',
      isLoading: false
    }
  }

  componentWillReceiveProps = next => {
    if (next.detailId) {
      this.setState({ isLoading: true })
      axios.get(`${urls.sentenceDetail}?id=${next.detailId}`).then(res => {
        const { retdata } = res
        let { senceList } = next
        let result = ''
        senceList.map((v, k) => {
          if (v.code === retdata.type) result = v.desc
          v.typeList.map((ele, idx) => {
            if (ele.code === retdata.type) result = ele.desc
            return idx
          })
          return v
        })
        this.setState({
          detail: {...retdata, title: result},
          isLoading: false
        })
        this.fetch()
      })
    }
  }

  hideModal = () => {
    this.props.hideModal()
  }

  // 表格数据获取
  fetch () {
    const { current, pageSize, total } = this.state.pagination
    const data = {
      sentenceId: this.props.detailId,
      pageNo: current,
      pageSize: pageSize
    }
    this.setState({ isLoading: true })
    axios.post(urls.sentenceLogList, data, {headers: {'Content-Type': 'application/json;charset=UTF-8'}}).then(res => {
      const pagination = {
        ...this.state.pagination
      }
      pagination.total = res.retdata.total
      this.setState({ isLoading: false, operateList: res.retdata.list || [], pagination })
    })
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.setState(
      {
        pagination: pagination
      },
      () => {
        this.fetch()
      }
    )
  }

  render () {
    const { visible } = this.props
    const { isLoading, pagination, operateList, detail } = this.state
    const tableTitle = (
      <span>
        <span>话术详情</span>
      </span>
    )
    const operateColumns = [
      {
        title: '操作人',
        dataIndex: 'staffName',
        ellipsis: true
      },
      {
        title: '复制次数',
        dataIndex: 'copyCount',
        render: (text, record) => <span>{(record.copyCount || 0) + '次'}</span>
      }
    ]
    return (
      <div>
        <Modal
          wrapClassName={'messageSetting'}
          width={600}
          title={tableTitle}
          className="className"
          visible={visible}
          destroyOnClose={true}
          onCancel={this.hideModal}
          footer={null}
        >
          <Spin spinning={isLoading}>
            <div className='detailContent'>
              <div className='type'>{detail.title}</div>
              <div className='createTime'>创建时间：{detail.createTime}</div>
              <hr className='hr'/>
              <div className='type'>{detail.remark}</div>
              <div className='content2'>{detail.content}</div>
              <div className='totalCopyCount'>已复制{detail.totalCopyCount || 0}次</div>
              <div>
                {
                  detail.imgUrlList ? detail.imgUrlList.map((v, k) => {
                    return <img src={v} key={v + k} alt='' />
                  }) : null
                }
              </div>
              <hr className='hr'/>
              <Table
                columns={operateColumns}
                dataSource={operateList}
                rowKey={'staffName'}
                locale={{
                  emptyText: '暂无记录'
                }}
                pagination={pagination}
                onChange={this.handleTableChange}
              />
            </div>
          </Spin>
        </Modal>
      </div>
    )
  }
}

export default withRouter(DetailModal)
