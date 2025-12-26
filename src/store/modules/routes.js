/**
 * @author https://github.com/zxwk1998/vue-admin-better （不想保留author可删除）
 * @description 路由拦截状态管理，目前两种模式：all模式与intelligence模式
 */
import { asyncRoutes, constantRoutes } from '@/router'
import { getRouterList } from '@/api/router'
import { convertRouter, filterAsyncRoutes } from '@/utils/handleRoutes'

const state = () => ({
  routes: [],
  partialRoutes: [],
})
const getters = {
  routes: (state) => state.routes,
  partialRoutes: (state) => state.partialRoutes,
}
const mutations = {
  setRoutes(state, routes) {
    state.routes = constantRoutes.concat(routes)
  },
  setAllRoutes(state, routes) {
    state.routes = constantRoutes.concat(routes)
  },
}
const actions = {
  /**
   * @author https://github.com/zxwk1998/vue-admin-better （不想保留author可删除）
   * @description intelligence模式设置路由
   * @param {*} { commit }
   * @param {*} permissions
   * @returns
   */
  async setRoutes({ commit }, permissions) {
    // 获取当前用户角色 (假设 permissions[0] 是主角色)
    const role = permissions[0];

    // 获取菜单配置
    const roleMenuConfig = JSON.parse(localStorage.getItem("vab-role-menus") || "{}");
    const allowedPaths = roleMenuConfig[role];

    let accessedRoutes = [];

    // 如果没有配置(或者是 admin 且没配置)，默认走原来的逻辑(通常 admin 拥有所有权限)
    if (!allowedPaths && role === 'admin') {
      accessedRoutes = asyncRoutes; // admin 默认看所有
    } else if (allowedPaths) {
      // 根据 allowedPaths 过滤
      const filterByPath = (routes, basePath = '/') => {
        const res = [];
        routes.forEach(route => {
          const tmp = { ...route };
          // 处理路径拼接
          let fullPath = basePath === '/' ? route.path : `${basePath}/${route.path}`;
          if (fullPath.startsWith('//')) fullPath = fullPath.replace('//', '/');

          // 如果是绝对路径 (如 /user)，直接用
          if (route.path.startsWith('/')) fullPath = route.path;

          // 检查权限
          // 规则：如果 路径在 allowedPaths 里，或者 allowedPaths 里有它的子路径(即它是父节点，半选状态)
          // 我们的 halfCheckedKeys 已经保存在 allowedPaths 里了，所以直接 check includes 即可
          if (allowedPaths.includes(fullPath) || allowedPaths.includes(route.path)) {
            if (tmp.children) {
              tmp.children = filterByPath(tmp.children, fullPath);
              // 如果子节点过滤完为空，且父节点本身不在 explicitly checked list (这就复杂了)，
              // 简单起见，如果 children 存在但为空，保留父节点(因为它可能只是一个 folder)
              // 但通常我们希望只显示有内容的 folder. 
              // 不过 Element Menu 可能会隐藏没 children 的 submenu.
            }
            res.push(tmp);
          }
        });
        return res;
      };
      accessedRoutes = filterByPath(asyncRoutes);
    } else {
      // 没有配置且不是 admin -> 无权限 or 默认原来的
      accessedRoutes = filterAsyncRoutes(asyncRoutes, permissions);
    }

    commit('setRoutes', accessedRoutes)
    return accessedRoutes
  },
  /**
   * @author https://github.com/zxwk1998/vue-admin-better （不想保留author可删除）
   * @description all模式设置路由
   * @param {*} { commit }
   * @returns
   */
  async setAllRoutes({ commit }) {
    try {
      let { data } = await getRouterList()
      if (!data || !Array.isArray(data)) {
        console.error('后端返回的路由数据格式不正确', data)
        data = []
      }

      const accessedRoutes = convertRouter(data)
      commit('setAllRoutes', accessedRoutes)
      return accessedRoutes
    } catch (error) {
      console.error('获取路由列表失败', error)
      commit('setAllRoutes', [])
      return []
    }
  },
}
export default { state, getters, mutations, actions }
