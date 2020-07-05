import React, { Component, Fragment } from 'react'
import { message, Table, Popconfirm, Icon } from 'antd'
import { withRouter } from 'react-router-dom'
import RoleButton from '@src/components/roleButton'
import axios from '@src/utils/axios'
import urls from '@src/config'
import './index.less'
@withRouter
class PosterSetting extends Component {
  constructor (props) {
    super(props)
    this.state = {
      dataSource: [],
      isLoading: false,
      pageNum: 1,
      pageSize: 10,
      total: 0,
      visible: false
    }
  }

  componentDidMount = () => {
    this.getPosterList()
  }

  // 获取列表数据
  getPosterList = () => {
    this.setState({ isLoading: true })
    const { pageNum, pageSize } = this.state
    axios
      .post(urls.getPosterList, { pageNo: pageNum, pageSize }, { headers: { 'Content-Type': 'application/json' } })
      .then((res) => {
        if (res.ret === 0) {
          this.setState({
            dataSource: res.retdata.list,
            total: res.retdata.total
          })
        }
      })
      .finally(() => {
        this.setState({ isLoading: false })
      })
  }

  // 删除
  hanldDelete = (data) => {
    axios.get(urls.deletePoster + `?id=${data.id}`).then((res) => {
      if (res.ret === 0) {
        message.success('删除成功')
        this.getPosterList()
      }
    })
  }

  // 表格分页配置
  pagination = () => {
    const { pageNum, pageSize, total } = this.state
    return {
      current: pageNum,
      pageSize,
      total,
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal: () => {
        return `共${total}条记录`
      },
      onChange: (pageNum) => {
        this.setState({ pageNum }, this.getPosterList)
      },
      onShowSizeChange: (pageNum, pageSize) => {
        this.setState({ pageNum: 1, pageSize }, this.getPosterList)
      }
    }
  }

  columns = [
    {
      title: '海报',
      dataIndex: 'url',
      width: 180,
      render: (text) => <img className="table-img" src={text} />
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 200,
      ellipsis: true
    },
    {
      title: '所选机构',
      dataIndex: 'deptName',
      width: 200,
      ellipsis: true
    },
    {
      title: '操作时间',
      dataIndex: 'operateTime'
    },
    {
      title: '操作人',
      dataIndex: 'operator'
    },
    {
      title: '操作',
      dataIndex: 'operate',
      render: (text, record) => (
        <Fragment>
          <RoleButton
            isButton={false}
            pathname={this.props.location.pathname}
            styles={{color: '#3078DB'}}
            rolekey={'posterEdit'}
            onClick={() => { this.handleEdit(record) }}
            owner={record.owner}
          >
              编辑
          </RoleButton>
          <Popconfirm title="确定删除此条数据吗?" onConfirm={() => this.hanldDelete(record)} okText="删除" cancelText="取消">
            <RoleButton
              isButton={false}
              pathname={this.props.location.pathname}
              styles={{color: 'red', marginLeft: 10}}
              rolekey={'posterDelete'}
              owner={record.owner}
            >
              删除
            </RoleButton>
          </Popconfirm>
        </Fragment>
      )
    }
  ]

  handleEdit = (record) => {
    this.props.history.push({
      pathname: '/showPosterEdit',
      query: { data: record, type: 'edit' }
    })
  }

  handleAdd = () => {
    this.props.history.push({ pathname: '/showPosterEdit', query: { type: 'add' } })
  }
  render = () => {
    const { isLoading, dataSource } = this.state
    const { pathname } = this.props.location
    return (
      <div className="showPosterContainer">
        <div className="view1Header">
          <RoleButton
            type="primary"
            pathname={pathname}
            className={'addPoster'}
            rolekey={'posterAdd'}
            onClick={this.handleAdd}
          >
            <Icon type="plus-square" /> 新增海报
          </RoleButton>
          通过上传展业海报，客户经理可在企业微信分享客户或添加个人名片进行推广
        </div>
        <Table loading={isLoading} rowKey="id" dataSource={dataSource} columns={this.columns} pagination={this.pagination()} />
      </div>
    )
  }
}

export default PosterSetting
