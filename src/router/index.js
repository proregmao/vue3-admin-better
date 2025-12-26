/**
 * @description router全局配置，如有必要可分文件抽离，其中asyncRoutes只有在intelligence模式下才会用到，vip文档中已提供路由的基础图标与小清新图标的配置方案，请仔细阅读
 */

import { createRouter, createWebHashHistory } from "vue-router";
import Layout from "@/layouts/index.vue";
import EmptyLayout from "@/layouts/EmptyLayout.vue";
import { publicPath } from "@/config";

export const constantRoutes = [
  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    hidden: true,
  },
  {
    path: "/register",
    component: () => import("@/views/register/index.vue"),
    hidden: true,
  },
  {
    path: "/401",
    name: "401",
    component: () => import("@/views/401.vue"),
    hidden: true,
  },
  {
    path: "/404",
    name: "404",
    component: () => import("@/views/404.vue"),
    hidden: true,
  },
  {
    path: "/",
    component: Layout,
    redirect: "/index",
    children: [
      {
        path: "index",
        name: "Index",
        component: () => import("@/views/index/index.vue"),
        meta: {
          title: "首页",
          icon: "home",
          affix: true,
        },
      },
    ],
  },
];

export const asyncRoutes = [

  {
    path: "/permissions",
    component: Layout,
    redirect: "/permissions/index",
    meta: { title: "权限管理", icon: "lock" },
    children: [
      {
        path: "index",
        name: "PermissionManagement",
        component: () => import("@/views/permissions/index.vue"),
        meta: {
          title: "权限管理",
          icon: "lock",
          permissions: ["admin"],
        },
      },
      {
        path: "user",
        name: "UserManagement",
        component: () => import("@/views/user/index.vue"),
        meta: {
          title: "用户管理",
          icon: "user",
          permissions: ["admin"],
        },
      },
    ],
  },
  {
    path: "/settings",
    component: Layout,
    redirect: "/settings/index",
    meta: { title: "系统设置", icon: "setting" },
    children: [
      {
        path: "index",
        name: "SystemSettings",
        component: () => import("@/views/settings/index.vue"),
        meta: {
          title: "系统设置",
          icon: "setting",
          permissions: ["admin"],
        },
      },
    ],
  },
  {
    path: "/personal",
    component: Layout,
    redirect: "/personal/index",
    hidden: true,
    children: [
      {
        path: "index",
        name: "PersonalCenter",
        component: () => import("@/views/personal/index.vue"),
        meta: {
          title: "个人中心",
          icon: "user",
          permissions: ["admin"],
        },
      },
    ],
  },
  {
    path: "/error",
    component: EmptyLayout,
    redirect: "noRedirect",
    name: "Error",
    meta: { title: "错误页", icon: "bug", hidden: true },
    hidden: true,
    children: [
      {
        path: "401",
        name: "Error401",
        component: () => import("@/views/401"),
        meta: { title: "401" },
      },
      {
        path: "404",
        name: "Error404",
        component: () => import("@/views/404"),
        meta: { title: "404" },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/404",
    hidden: true,
  },
];


const router = createRouter({
  history: createWebHashHistory(publicPath),
  routes: constantRoutes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

export function resetRouter() {
  // 注意：所有动态路由路由必须带有name属性，否则可能会不能完全重置干净
  try {
    router.getRoutes().forEach((route) => {
      const { name } = route;
      if (name && name !== "Login") {
        router.hasRoute(name) && router.removeRoute(name);
      }
    });
  } catch (error) {
    // 强制刷新浏览器，不要用这种方式
    window.location.reload();
  }
}

export default router;
