<template>
  <q-page class="dashboards-page">
    <div class="content-wrapper">
      <div class="q-mb-md">
        <q-breadcrumbs active-color="grey-6">
          <q-breadcrumbs-el label="Дашборды" icon="mdi-file-document" />
        </q-breadcrumbs>
      </div>

      <div class="row q-col-gutter-md">
        <div
          v-for="dashboard in dashboards"
          :key="dashboard.id"
          class="col-12 col-sm-6 col-md-3"
        >
          <a :href="dashboard.href" class="menu-element">{{ dashboard.title }}</a>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import type { DashboardItem } from 'src/types';

const dashboards: DashboardItem[] = [
  { id: 1, title: 'Активный гражданин', href: '/dashboards/ag' },
  { id: 2, title: 'Миллион призов', href: '/dashboards/milp' },
  { id: 3, title: 'Город заданий', href: '/dashboards/gz' },
  { id: 4, title: 'Активный гражданин - Детям', href: '/dashboards/ag_child' },
  { id: 5, title: 'Наш город', href: '/dashboards/ng' },
  { id: 6, title: 'Электронный дом', href: '/dashboards/ed' },
  { id: 7, title: 'Город идей', href: '/dashboards/gi' },
  { id: 8, title: 'Московский спорт', href: '/dashboards/mos_sport' },
  { id: 9, title: 'Москва на волне', href: '/dashboards/moscow_wave' },
  { id: 10, title: 'Помощник Москвы', href: '/dashboards/moscow_helper' },
];
</script>

<style lang="scss" scoped>
.dashboards-page {
  background-color: #027be3;
  padding: 0;
}

.content-wrapper {
  background-color: #e0e0e0;
  border-top-left-radius: 16px;
  min-height: calc(100vh - 50px);
  padding: 24px 28px;
}

.menu-element {
  height: 25vh;
  width: 100%;
  background: #fff;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow:
    0 6px 12px -2px rgba(50, 50, 93, 0.25),
    0 3px 7px -3px rgba(0, 0, 0, 0.3);
  text-decoration: none;
  color: #00008b;
  font-size: 28px;
  text-align: center;

  &:hover {
    box-shadow:
      0 10px 20px -2px rgba(50, 50, 93, 0.35),
      0 6px 12px -3px rgba(0, 0, 0, 0.4);
    transform: translateY(-3px);
  }

  &:active {
    transform: translateY(-1px);
  }
}
</style>
