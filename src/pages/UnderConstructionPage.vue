<template>
  <q-page class="dashboards-page">
    <div class="content-wrapper">
      <div class="q-mb-md">
        <q-breadcrumbs active-color="grey-6">
          <q-breadcrumbs-el label="Раздел" icon="mdi-file-document" />
          <q-breadcrumbs-el :label="title" />
        </q-breadcrumbs>
      </div>

      <div class="stub-card">
        <div class="stub-card__title">{{ title }}</div>
        <div class="stub-card__subtitle">В разработке</div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const title = computed(() => (route.meta.title as string) || 'Раздел');
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

.stub-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-shadow:
    0 6px 12px -2px rgba(50, 50, 93, 0.25),
    0 3px 7px -3px rgba(0, 0, 0, 0.3);
}

.stub-card__title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 6px;
}

.stub-card__subtitle {
  font-size: 14px;
  font-weight: 600;
  color: #6b6b6b;
  letter-spacing: 0.2px;
}
</style>
