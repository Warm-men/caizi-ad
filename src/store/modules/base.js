import axios from '@src/utils/axios'
import urls from '@src/config'

let deptList = []
try {
  deptList = JSON.parse(window.localStorage.getItem('deptList'))
} catch (error) {}
let allDeptList = []
try {
  allDeptList = JSON.parse(window.localStorage.getItem('allDeptList'))
} catch (error) {}

const initialState = {
  menu: [],
  menuRouteList: [],
  right: {},
  deptList,
  allDeptList,
  isPageLoaded: false,
  userInfo: {},
  isShowRoleHint: false,
  hasRangeAndRight: false
}

export default (state = initialState, action) => {
  switch (action.type) {
    case 'base/setMenuAndRightAndUserInfo':
      return {
        ...state,
        menu: action.menu,
        menuRouteList: action.menuRouteList,
        right: action.right,
        isPageLoaded: action.isPageLoaded,
        userInfo: {
          avatarUrl: action.avatarUrl,
          userName: action.userName,
          roleName: action.roleName
        },
        corpInfo: {
          corpLogo: action.corpLogo,
          corpName: action.corpName
        },
        isJYBank: action.isJYBank
      }
    case 'base/checkButtonRight':
      return {
        ...state,
        isShowRoleHint: action.isShowRoleHint
      }

    case 'base/hasRangeAndRight':
      return {
        ...state,
        hasRangeAndRight: action.hasRangeAndRight
      }
    // case 'test':
    //   return Object.assign({}, oldObj, {changeProp: newValue})
    case 'base/setDeptList':
      return Object.assign({}, state, { deptList: action.deptList })
    case 'base/setAllDeptList':
      return Object.assign({}, state, { allDeptList: action.allDeptList })
    default:
      return state
  }
}

const getMenuRouteList = (menu) => {
  let menuRouteList = []
  for (let i = 0; i < menu.length; i++) {
    if (menu[i].resources) {
      const resources = menu[i].resources
      for (let j = 0; j < resources.length; j++) {
        menuRouteList.push('/' + resources[j].resShortCode)
      }
    } else {
      continue
    }
  }
  return menuRouteList
}

const getDeptTree = (list = []) => {
  return list.map((item) => {
    return { ...item, title: item.name, key: item.id, value: item.id, children: getDeptTree(item.subDept) }
  })
}

export const actions = {
  updateMenuAndRightAndUserInfo: (callback = () => {}) => {
    // redux-thunk
    return (dispatch, getState) => {
      axios.get(urls.getStaffPrivileges).then((res) => {
        const avatarUrl = res.retdata.avatarUrl
        const userName = res.retdata.userName
        const isJYBank = res.retdata.isJYBank
        const roleName = res.retdata.roleName
        const menu = res.retdata.modules
        const menuRouteList = getMenuRouteList(menu)
        const privileges = res.retdata.privileges
        const corpLogo = res.retdata.corpLogo
        const corpName = res.retdata.corpName
        let right = {}
        privileges.forEach((obj) => {
          right[obj.resShortCode] = obj.privileges
        })
        callback()
        dispatch({
          type: 'base/setMenuAndRightAndUserInfo',
          menu: menu,
          menuRouteList: menuRouteList,
          right: right,
          isPageLoaded: true,
          avatarUrl,
          userName,
          roleName,
          corpLogo,
          corpName,
          isJYBank
        })
      })
    }
  },
  getDeptList: () => {
    return (dispatch, getState) => {
      axios.post(urls.departmentOwnerList, { useRole: true }).then((res) => {
        const deptList = getDeptTree(res.retdata.deptList)
        try {
          window.localStorage.setItem('deptList', JSON.stringify(deptList))
        } catch (error) {}
        dispatch({
          type: 'base/setDeptList',
          deptList
        })
      })
    }
  },
  getAllDeptList: () => {
    return (dispatch, getState) => {
      axios.post(urls.departmentOwnerList).then((res) => {
        const allDeptList = getDeptTree(res.retdata.deptList)
        try {
          window.localStorage.setItem('allDeptList', JSON.stringify(allDeptList))
        } catch (error) {}
        dispatch({
          type: 'base/setAllDeptList',
          allDeptList
        })
      })
    }
  },
  openRightMessage: (isShowRoleHint) => {
    return (dispatch, getState) => {
      dispatch({
        type: 'base/checkButtonRight',
        isShowRoleHint: true
      })
    }
  },
  onCloseMessage: () => {
    return (dispatch, getState) => {
      dispatch({
        type: 'base/checkButtonRight',
        isShowRoleHint: false
      })
    }
  },
  hasRangeAndRight: (hasRangeAndRight) => {
    return (dispatch, getState) => {
      dispatch({
        type: 'base/hasRangeAndRight',
        hasRangeAndRight
      })
    }
  }
}
