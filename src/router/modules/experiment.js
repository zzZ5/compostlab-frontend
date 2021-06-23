import Layout from '@/layout'

const experimentRouter = {
  path: '/experiment',
  component: Layout,
  redirect: '/experiment/list',
  name: 'Experiment',
  meta: {
    title: 'Experiment',
    icon: 'experiment',
    roles: ['admin', 'active']
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/experiment/list'),
      name: 'ListExperiment',
      meta: { title: 'Experiment List', icon: 'list', activeMenu: '/experiment/list' }
    },
    {
      path: 'create',
      component: () => import('@/views/experiment/create'),
      name: 'CreateExperiment',
      meta: { title: 'Create Experiment', icon: 'edit', activeMenu: '/experiment/create', roles: ['admin', 'active'] }
    },
    {
      path: 'review',
      component: () => import('@/views/experiment/review'),
      name: 'ReviewExperiment',
      meta: { title: 'Experiment Review', icon: 'review', activeMenu: '/experiment/review' }
    },
    {
      path: 'mine',
      component: () => import('@/views/experiment/mine/index'),
      name: 'MyExperiment',
      meta: { title: 'My Experiment', icon: 'my-experiment', activeMenu: '/experiment/mine', roles: ['admin', 'active'] },
      children: [
        {
          path: 'created',
          component: () => import('@/views/experiment/mine/created'),
          name: 'CreatedExperiment',
          meta: { title: 'Created', icon: 'created', activeMenu: '/experiment/mine/created' }
        },
        {
          path: 'involved',
          component: () => import('@/views/experiment/mine/involved'),
          name: 'InvolvedExperiment',
          meta: { title: 'Involved', icon: 'involved', activeMenu: '/experiment/mine/involved' }
        }
      ]
    },
    {
      path: 'edit/:experimentId',
      component: () => import('@/views/experiment/edit'),
      name: 'EditExperiment',
      meta: { title: 'Experiment Edit' },
      hidden: true
    },
    {
      path: 'detail/:experimentId',
      component: () => import('@/views/experiment/detail'),
      name: 'DetailExperiment',
      meta: { title: 'Experiment Detail' },
      hidden: true
    },
    {
      path: 'config/:experimentId',
      component: () => import('@/views/experiment/config'),
      name: 'ConfigChart',
      meta: { title: 'Chart Config' },
      hidden: true
    },
    {
      path: 'chart/:experimentId',
      component: () => import('@/views/experiment/chart'),
      name: 'ChartExperiment',
      meta: { title: 'Experiment Chart' },
      hidden: true
    }
  ]
}

export default experimentRouter
