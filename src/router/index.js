import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */
import experimentRouter from './modules/experiment'
// import componentsRouter from './modules/components'
// import chartsRouter from './modules/charts'
// import tableRouter from './modules/table'
// import nestedRouter from './modules/nested'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','active']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: 'Dashboard', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/documentation',
    component: Layout,
    children: [
      {
        path: 'index',
        component: () => import('@/views/documentation/index'),
        name: 'Documentation',
        meta: { title: 'Documentation', icon: 'documentation', affix: false }
      }
    ]
  },
  {
    path: '/guide',
    component: Layout,
    redirect: '/guide/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/guide/index'),
        name: 'Guide',
        meta: { title: 'Guide', icon: 'guide', affix: false }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: 'Profile', icon: 'user', noCache: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/equipment',
    component: Layout,
    redirect: '/equipment/list',
    name: 'Equipment',
    meta: {
      title: 'Equipment',
      icon: 'component',
      roles: ['admin', 'active']
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/equipment/list'),
        name: 'ListEquipment',
        meta: { title: 'Equipment List', icon: 'equipment', activeMenu: '/equipment/list' }
      },
      {
        path: 'create',
        component: () => import('@/views/equipment/create'),
        name: 'CreateEquipment',
        meta: { title: 'Create Equipment', icon: 'edit', activeMenu: '/equipment/create', roles: ['admin'] }
      },
      {
        path: 'edit/:equipmentId',
        component: () => import('@/views/equipment/edit'),
        name: 'EditEquipment',
        meta: { title: 'Equipment Edit' },
        hidden: true
      },
      {
        path: 'detail/:equipmentId',
        component: () => import('@/views/equipment/detail'),
        name: 'DetailEquipment',
        meta: { title: 'Equipment Detail' },
        hidden: true
      },
      {
        path: 'chart/:equipmentId',
        component: () => import('@/views/equipment/chart'),
        name: 'ChartEquipment',
        meta: { title: 'Equipment Chart' },
        hidden: true
      }
    ]
  },
  {
    path: '/sensor',
    component: Layout,
    redirect: '/sensor/list',
    name: 'Sensor',
    meta: {
      title: 'Sensor',
      icon: 'sensor',
      roles: ['admin']
    },
    children: [
      {
        path: 'list',
        component: () => import('@/views/sensor/list'),
        name: 'ListSensor',
        meta: { title: 'Sensor List', icon: 'list', activeMenu: '/sensor/list' }
      },
      {
        path: 'create',
        component: () => import('@/views/sensor/create'),
        name: 'CreateSensor',
        meta: { title: 'Create Sensor', icon: 'edit', activeMenu: '/sensor/create' }
      },
      {
        path: 'edit/:sensorId',
        component: () => import('@/views/sensor/edit'),
        name: 'EditSensor',
        meta: { title: 'Sensor Edit' },
        hidden: true
      },
      {
        path: 'detail/:sensorId',
        component: () => import('@/views/sensor/detail'),
        name: 'DetailSensor',
        meta: { title: 'Sensor Detail' },
        hidden: true
      },
      {
        path: 'chart/:sensorId',
        component: () => import('@/views/sensor/chart'),
        name: 'ChartSensor',
        meta: { title: 'Sensor Chart' },
        hidden: true
      }
    ]
  },
  experimentRouter,
  {
    path: 'external-link',
    component: Layout,
    children: [
      {
        path: 'https://github.com/zzZ5/vue-element-admin',
        meta: { title: 'External Link', icon: 'link' }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
