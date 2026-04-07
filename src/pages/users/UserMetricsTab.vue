<template>
  <div class="metrics-layout">
    <div class="metrics-card">
      <div class="metrics-toolbar">
        <q-select
          v-model="selectedMetric"
          :options="metricOptions"
          label="Метрика"
          dense
          filled
          class="metric-select"
          popup-content-class="metric-menu"
        />
      </div>
      <div class="metrics-empty">Нет данных</div>
    </div>

    <div class="summary-card">
      <p class="section-title">Общая информация</p>
      <div class="info-groups">
        <div v-for="g in groups" :key="g.label" class="gentry">
          <span class="gentry__label">{{ g.label }}</span>
          <span class="gbadge text-white" :class="g.bgClass">
            {{ g.value }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const metricOptions = ['Активность', 'Лояльность', 'Полезность', 'Заинтересованность'];
const selectedMetric = ref(metricOptions[0]);

const groups = [
  { label: 'Группа активности', value: 'Высокая', bgClass: 'bg-positive' },
  { label: 'Группа лояльности', value: 'Умеренная', bgClass: 'bg-cyan-group' },
  { label: 'Группа полезности', value: 'Высокая', bgClass: 'bg-positive' },
  { label: 'Группа заинтересованности', value: 'Низкая', bgClass: 'bg-unloyal' },
];
</script>

<style lang="scss" scoped>
.metrics-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 16px;
  padding: 12px 20px 20px;
  align-items: start;
}

.metrics-card {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,.08), 0 12px 28px rgba(0,0,0,.05);
  padding: 14px 16px 18px;
  min-height: 420px;
}

.metrics-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
}

.metric-select {
  min-width: 220px;
  max-width: 320px;
}

.metric-select :deep(.q-field__control) {
  border-radius: 10px;
  background: #e5e7eb;
  border: 1px solid #d1d5db;
}

.metric-select :deep(.q-field__control):before,
.metric-select :deep(.q-field__control):after {
  border-bottom: none;
}

.metric-menu :deep(.q-item) {
  font-size: 14px;
  color: #111827;
}

.metrics-empty {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
  text-align: center;
}

.summary-card {
  background: #ffffff;
  border: 1px solid #f2f2f2;
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,.08), 0 12px 28px rgba(0,0,0,.05);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  text-transform: none;
  letter-spacing: 0.2px;
  margin: 0 0 12px;
}

.info-groups {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.gentry {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.gentry__label {
  font-size: 12px;
  color: #9e9e9e;
}

.gbadge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 600;
  width: fit-content;
}

.bg-unloyal {
  background-color: #c10015;
}

.bg-cyan-group {
  background-color: #26a69a;
}

@media (max-width: 1200px) {
  .metrics-layout {
    grid-template-columns: 1fr;
  }

  .summary-card {
    max-width: 420px;
  }
}

@media (max-width: 900px) {
  .metric-select {
    width: 100%;
    max-width: 100%;
  }
}
</style>
