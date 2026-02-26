import type { RouteRecordRaw } from 'vue-router';

const stub = (path: string, name: string, title: string): RouteRecordRaw => ({
  path: path.startsWith('/') ? path.slice(1) : path,
  name,
  component: () => import('pages/UnderConstructionPage.vue'),
  meta: { title },
});

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'dashboards',
        component: () => import('pages/DashboardsPage.vue'),
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('pages/UsersListPage.vue'),
      },
      {
        path: 'users/:ssoId',
        name: 'user-detail',
        component: () => import('pages/UsersPage.vue'),
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: () => import('pages/AnalyticsPage.vue'),
        meta: { title: 'Сводная аналитика' },
      },
      stub('/special-report', 'special-report', 'Спецотчет'),
      stub('/recommendations', 'recommendations', 'Рекомендательная система'),
      stub('/segmentation', 'segmentation', 'Сегментация аудитории'),
      stub('/tagging', 'tagging', 'Присвоение тегов'),
      stub('/user-messages', 'user-messages', 'Сообщения пользователей'),
      stub('/query-builder', 'query-builder', 'Конструктор запросов'),
      stub('/file-manager', 'file-manager', 'Файловый менеджер'),
      stub('/system-users', 'system-users', 'Системные пользователи'),
      stub('/anomaly-monitor', 'anomaly-monitor', 'Монитор аномалий'),
      stub('/nsi', 'nsi', 'НСИ'),
      stub('/help', 'help', 'Справка'),
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/DashboardsPage.vue'),
  },
];

export default routes;
