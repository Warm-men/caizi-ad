import React, { Component, Fragment } from 'react'
import { Menu, Icon, message } from 'antd'
import { Route, Link, Switch } from 'react-router-dom'
import HomeHeader from './homeHeader'
import './index.less'
import StaffUpdate from '@src/view/staffUpdate'
import StaffDetail from '@src/view/staffDetail'
import EnterpriseDetail from '@src/view/enterpriseDetail'
import EnterpriseEdit from '@src/view/enterpriseEdit'
import ProductPush from '@src/view/productPush'
import ProductUpdate from '@src/view/productUpdate'
import NewsAddInternal from '@src/view/newsAddInternal'
import ChoicestEdit from '@src/view/choicestEdit'
import ConfigEntryAdd from '@src/view/stationJump/add.js'
import ConfigEntryEdit from '@src/view/stationJump/edit.js'
import GreetingEdit from '@src/view/greetingEdit'
import ShowPosterEdit from '@src/view/posterSetting/page0/edit'
import ChannelExpandEdit from '@src/view/posterSetting/page1/edit'
import Welcome from '@src/view/welcome'
import BannerAdd from '@src/view/bannerList/add'
import BannerUpdate from '@src/view/bannerList/update'
import { connect } from 'react-redux'
import { actions } from '@src/store/modules/base'
import utils from '@src/utils'
import NewPage from '@src/view/messageSend/newPage.js'
import TagsManage from '@src/view/tagsManage'

class Home extends Component {
  constructor(props) {
    super(props)
    this.current = this.props.location.pathname.replace(/\//, '')
    this.state = { openKeys: [] }
  }

  // 刷新进来获取菜单和权限
  componentDidMount() {
    const caizhiKey = utils.getCookie('caizhi_web_key')
    // 1 如果是微信测试环境 点击前往服务商后台跳转后到此项目 后端会自动写cookie到前端,
    // 如果cookie过期 那跳到登录页(只在微信测试环境打开有效，本地无效)
    // 2 如果是本地开发环境 没有cookie就跳到/autoAuth页面获取cookie
    if (caizhiKey) {
      // 请求用户信息及菜单和权限
      this.props.updateMenuAndRightAndUserInfo(() => {
        this.timer = setTimeout(() => {
          this.getDefaultOpenKeys()
        }, 500)
      })
      this.props.getDeptList()
      this.props.getAllDeptList()
    } else {
      // eslint-disable-next-line no-undef
      if (SERVER === 'localhost') {
        this.props.history.push('/autoAuth')
      } else {
        this.props.history.push('/login')
      }
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer)
  }

  componentWillReceiveProps(next) {
    if (next.isShowRoleHint) {
      message.destroy()
      message.info('抱歉，您没有该功能的操作权限。', 3, utils.onCloseMessage())
    }
  }

  // 计算默认展开的菜单
  getDefaultOpenKeys = (list = this.props.menu, path = this.current, parentPath) => {
    list.some((item, index) => {
      if (this.state.openKeys[0]) return true
      if (item.resShortCode === path) {
        this.setState({ openKeys: [String(parentPath)] })
        return true
      }
      if (item.resources && item.resources.length) {
        this.getDefaultOpenKeys(item.resources, path, index)
      }
    })
  }

  render() {
    const { menu, menuRouteList, corpInfo } = this.props
    const { openKeys } = this.state
    return (
      <Fragment>
        <div id="home">
          <div className="left-menu">
            <div className="logo">
              {corpInfo && corpInfo.corpLogo && <img src={corpInfo && corpInfo.corpLogo} className="logoImg"></img>}
              {corpInfo && !corpInfo.corpLogo && <h1 className="logoName">{corpInfo && corpInfo.corpName}</h1>}
            </div>
            {menu.length > 0 && (
              <Menu
                theme="dark"
                mode="inline"
                defaultSelectedKeys={[this.current]}
                openKeys={openKeys}
                onOpenChange={(arr) => this.setState({ openKeys: [arr[arr.length - 1]] })}
              >
                {
                  // 通过state menu动态生成侧边导航栏
                  menu.map((obj, index) => {
                    return (
                      <Menu.SubMenu
                        key={index}
                        title={
                          <span>
                            <Icon type={obj.icon} />
                            <span>{obj.resName}</span>
                          </span>
                        }
                      >
                        {obj.resources &&
                          obj.resources.map((obj) => {
                            return (
                              <Menu.Item key={obj.resShortCode}>
                                <Link to={`/${obj.resShortCode}`} replace>
                                  <span className="nav-text">{obj.resName}</span>
                                </Link>
                              </Menu.Item>
                            )
                          })}
                      </Menu.SubMenu>
                    )
                  })
                }
              </Menu>
            )}
          </div>

          <div className="right-content">
            <HomeHeader />
            <div id="content">
              <div className="content-box">
                <Switch>
                  {
                    // 通过action里的getMenuRouteList动态生成可以匹配的路由 只包括菜单栏部分 不在菜单栏的部分写在下面
                    menuRouteList.map((path, index) => {
                      let comp
                      try {
                        comp = require(`@src/view${path}`).default
                      } catch (error) {
                        console.log(error)
                      }
                      return <Route path={path} key={path} component={comp} exact />
                    })
                  }
                  {/* 如果菜单没有的 在下面添加进去 */}
                  <Route path="/greetingEdit/:params" component={GreetingEdit} />
                  <Route path="/productUpdate" component={ProductUpdate} />
                  <Route path="/choicestEdit" component={ChoicestEdit} />
                  <Route path="/staffUpdate" component={StaffUpdate} />
                  <Route path="/staffDetail" component={StaffDetail} />
                  <Route path="/bannerAdd" component={BannerAdd} />
                  <Route path="/bannerUpdate" component={BannerUpdate} />
                  <Route path="/newPage" component={NewPage} />
                  <Route path="/enterpriseDetail" component={EnterpriseDetail} />
                  <Route path="/enterpriseEdit" component={EnterpriseEdit} />
                  <Route path="/configEntryAdd" component={ConfigEntryAdd} />
                  <Route path="/configEntryEdit" component={ConfigEntryEdit} />
                  <Route path="/newsAddInternal" component={NewsAddInternal} />
                  <Route path="/productPush" component={ProductPush} />
                  {/* <Route path="/posterSetting" component={PosterSetting} /> */}
                  <Route path="/showPosterEdit" component={ShowPosterEdit} />
                  <Route path="/channelExpandEdit/:params" component={ChannelExpandEdit} />
                  <Route path="/tagsManage" component={TagsManage} />
                  <Route path="/" component={Welcome} />
                  {/* 后期需要active的路由改为  前缀添加二级路由  在相应的跳转路由  修改为下面的路由地址 */}
                  {/* <Route path="/productList/productUpdate" exact component={ProductUpdate} /> */}
                </Switch>
              </div>
              <footer>
                本服务由腾银提供。腾银为腾讯集团成员，面向金融领域提供产业应用方案。
                <br />
                Copyright @ 2019 AppleTree All Rights Reserved 粤ICP备17042315号
              </footer>
            </div>
          </div>
        </div>
      </Fragment>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    menu: state.base.menu,
    menuRouteList: state.base.menuRouteList,
    isPageLoaded: state.base.isPageLoaded,
    corpInfo: state.base.corpInfo,
    isShowRoleHint: state.base.isShowRoleHint
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateMenuAndRightAndUserInfo: (callback) => {
      dispatch(actions.updateMenuAndRightAndUserInfo(callback))
    },
    getDeptList: () => {
      dispatch(actions.getDeptList())
    },
    getAllDeptList: () => {
      dispatch(actions.getAllDeptList())
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)
