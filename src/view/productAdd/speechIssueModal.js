import React from 'react'
import { Modal, Tabs, Button, Table, Spin } from 'antd'
import axios from '@src/utils/axios'
import urls from '@src/config'
import { withRouter } from 'react-router-dom'
import QuestionItem from './questionItem'

@withRouter
export default class SpeechIssueModal extends React.Component {
  constructor (props, context) {
    super(props)
    this.state = {
      loading: true,
      tableData1: [],
      tableData2: [],
      selectedRowKeys1: props.selectedRowKeys1 || [],
      selectedRowKeys2: props.selectedRowKeys2 || [],
      pagination1: {
        current: 1,
        pageSize: 10,
        total: 0
      },
      pagination2: {
        current: 1,
        pageSize: 10,
        total: 0
      }
    }
  }

  componentDidMount () {
    this.queryAllCommonList()
    if (!this.props.destroyOnClose) {
      this.getRelatedTalkingSkill()
      this.getRelatedFAQList()
    }
  }

  queryAllCommonList = () => {
    axios
      .all([this.getProductTalkingSkill(), this.getProductFAQList()])
      .then(
        axios.spread((res1, res2) => {
          this.setState({
            tableData1: res1.retdata.list,
            tableData2: res2.retdata.list,
            loading: false,
            pagination1: { ...this.state.pagination1, total: res1.retdata.total, showTotal: total => `共 ${total}条记录` },
            pagination2: { ...this.state.pagination2, total: res2.retdata.total, showTotal: total => `共 ${total}条记录` }
          })
        })
      )
      .catch(() => {
        this.setState({ loading: false })
      })
  }

  // 加载问题列表
  getProductFAQList = () => {
    const { current, pageSize } = this.state.pagination2
    return axios.post(urls.issueList, { productId: 'common', pageNum: current, pageSize })
  }

  // 加载话术列表
  getProductTalkingSkill = () => {
    const { current, pageSize } = this.state.pagination1
    return axios.post(urls.speechList, { productId: 'common', pageNum: current, pageSize })
  }

  // 加载已配置话术列表
  getRelatedTalkingSkill = () => {
    const productId = this.props.location.search.split('=')[1]
    axios.post(urls.speechList, { productId }).then((res) => {
      const selectedRowKeys1 = res.retdata.list.filter(v => v.productId === 'common').map((i) => i.id)
      this.setState({ selectedRowKeys1 })
    })
  }

  // 加载已配置问题列表
  getRelatedFAQList = () => {
    const productId = this.props.location.search.split('=')[1]
    axios.post(urls.issueList, { productId }).then((res) => {
      const selectedRowKeys2 = res.retdata.list.filter(v => v.productId === 'common').map((i) => i.id)
      this.setState({ selectedRowKeys2 })
    })
  }

  // 点击表格行勾选框
  tableSelectChange1 = (selectedRowKeys1) => this.setState({ selectedRowKeys1 })

  // 点击表格行勾选框
  tableSelectChange2 = (selectedRowKeys2) => this.setState({ selectedRowKeys2 })

  // 分页、变化时触发 获取表格数据
  handleTableChange1 = (pagination, filters, sorter) => {
    const pager = {
      ...this.state.pagination1,
      current: pagination.current
    }
    this.setState({ pagination1: pager }, this.queryAllCommonList)
  }

  // 分页、变化时触发 获取表格数据
  handleTableChange2 = (pagination, filters, sorter) => {
    const pager = {
      ...this.state.pagination2,
      current: pagination.current
    }
    this.setState({ pagination2: pager }, this.queryAllCommonList)
  }

  ok = () => {
    const { selectedRowKeys1, selectedRowKeys2 } = this.state
    this.queryAllCommonList()
    this.props.setIssueSpeech(selectedRowKeys1, selectedRowKeys2)
  }

  render () {
    const { visible = false, classNames = '', saveLoading = false, destroyOnClose = false } = this.props
    const {
      pagination1,
      selectedRowKeys1,
      tableData1,
      pagination2,
      selectedRowKeys2,
      tableData2,
      loading
    } = this.state
    const columns1 = [
      {
        title: '营销话术',
        dataIndex: 'speech'
      }
    ]
    const columns2 = [
      {
        title: '问题库',
        dataIndex: 'issue',
        render: (text, record) => {
          return (<QuestionItem questionItem={record}/>)
        }
      }
    ]
    return (
      <Modal
        width={800}
        centered
        destroyOnClose={destroyOnClose}
        maskClosable={false}
        wrapClassName={classNames}
        title={`营销话术与常见问题`}
        visible={visible}
        onCancel={() => this.props.hideModal()}
        footer={
          <div>
            <Button type="" onClick={() => this.props.hideModal()}>
              取消
            </Button>
            <Button type="primary" loading={saveLoading} onClick={this.ok}>
              确认
            </Button>
          </div>
        }>
        <div>
          <Spin spinning={loading}>
            <Tabs defaultActiveKey="1" onChange={this.callback} className={'tabs'}>
              <Tabs.TabPane tab={`营销话术（${selectedRowKeys1.length}）`} key="1">
                <Table
                  rowSelection={{
                    selectedRowKeys: selectedRowKeys1,
                    onChange: this.tableSelectChange1
                  }}
                  pagination={pagination1}
                  onChange={this.handleTableChange1}
                  rowKey={'id'}
                  columns={columns1}
                  dataSource={tableData1}
                  locale={{ emptyText: '暂无数据' }}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={`常见问题库（${selectedRowKeys2.length}）`} key="2">
                <Table
                  rowSelection={{
                    selectedRowKeys: selectedRowKeys2,
                    onChange: this.tableSelectChange2
                  }}
                  pagination={pagination2}
                  onChange={this.handleTableChange2}
                  rowKey={'id'}
                  columns={columns2}
                  dataSource={tableData2}
                  locale={{ emptyText: '暂无数据' }}
                />
              </Tabs.TabPane>
            </Tabs>
          </Spin>
        </div>
      </Modal>
    )
  }
}
