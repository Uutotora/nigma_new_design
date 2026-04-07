<template>
  <div class="points-layout">
    <div class="points-summary">
      <div class="points-summary__title">
        Текущий остаток баллов: {{ formatNumber(balanceTotal) }}
        <span class="points-inline">
          (
          <span class="points-inline__city">{{ formatNumber(balanceCity) }}</span>
          /
          <span class="points-inline__prize">{{ formatNumber(balancePrize) }}</span>
          /
          <span class="points-inline__kids">{{ formatNumber(balanceKids) }}</span>
          )
        </span>
      </div>

      <div class="points-filters-card">
        <div class="points-filters__grid">
          <q-input
            v-model="pointsPeriod.startDate"
            type="date"
            dense
            filled
            label="Дата начала"
            class="filter-input"
          />
          <q-input
            v-model="pointsPeriod.endDate"
            type="date"
            dense
            filled
            label="Дата окончания"
            class="filter-input"
          />

          <q-btn-dropdown
            class="filter-dropdown"
            no-caps
            unelevated
            dropdown-icon="mdi-chevron-down"
            menu-anchor="bottom left"
            menu-self="top left"
            :menu-offset="[0, 6]"
            menu-class="filters-menu"
          >
            <template #label>
              <div class="filter-dropdown__content">
                <div class="filter-dropdown__label">Проекты</div>
                <div class="filter-dropdown__value">{{ projectsDisplay }}</div>
              </div>
            </template>
            <div class="filters-menu__content">
              <q-tree
                :nodes="projectTree"
                node-key="id"
                v-model:expanded="expandedProjects"
                dense
              >
                <template #default-header="prop">
                  <div class="tree-item" @click="toggleTreeNode(tickedProjects, updateProjectsTicked, prop.key)">
                    <q-checkbox
                      :model-value="tickedProjects.includes(prop.key)"
                      dense
                      @update:model-value="() => toggleTreeNode(tickedProjects, updateProjectsTicked, prop.key)"
                      @click.stop
                    />
                    <div class="tree-item__label">{{ prop.node.label }}</div>
                  </div>
                </template>
              </q-tree>
            </div>
          </q-btn-dropdown>

          <q-btn-dropdown
            class="filter-dropdown"
            no-caps
            unelevated
            dropdown-icon="mdi-chevron-down"
            menu-anchor="bottom left"
            menu-self="top left"
            :menu-offset="[0, 6]"
            menu-class="filters-menu"
          >
            <template #label>
              <div class="filter-dropdown__content">
                <div class="filter-dropdown__label">Действия</div>
                <div class="filter-dropdown__value">Все действия</div>
              </div>
            </template>
            <div class="filters-menu__content">
              <div class="filters-empty">Нет доступных узлов</div>
            </div>
          </q-btn-dropdown>

          <q-btn-dropdown
            class="filter-dropdown"
            no-caps
            unelevated
            dropdown-icon="mdi-chevron-down"
            menu-anchor="bottom left"
            menu-self="top left"
            :menu-offset="[0, 6]"
            menu-class="filters-menu"
          >
            <template #label>
              <div class="filter-dropdown__content">
                <div class="filter-dropdown__label">Тип баллов</div>
                <div class="filter-dropdown__value">{{ pointsTypeLabel }}</div>
              </div>
            </template>
            <q-list dense class="filters-menu__content">
              <q-item
                v-for="option in pointsTypeOptions"
                :key="option.value"
                clickable
                v-close-popup
                @click="pointsType = option.value"
              >
                <q-item-section>{{ option.label }}</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <q-btn
            color="primary"
            label="Применить"
            class="apply-btn apply-btn--inline"
            @click="applyFilters"
          />
        </div>
      </div>
    </div>

    <div class="points-block">
      <div class="points-block__header">
        <div class="points-block__title">
          Начислено {{ formatNumber(earnedTotal) }}
          <span class="points-inline">
            (
            <span class="points-inline__city">{{ formatNumber(earnedCity) }}</span>
            /
            <span class="points-inline__prize">{{ formatNumber(earnedPrize) }}</span>
            /
            <span class="points-inline__kids">{{ formatNumber(earnedKids) }}</span>
            )
          </span>
          баллов с {{ formatDate(appliedPeriod.startDate) }} по {{ formatDate(appliedPeriod.endDate) }}
        </div>
        <q-btn
          dense
          flat
          icon="mdi-download"
          color="secondary"
          class="icon-btn icon-btn--export"
        >
          <q-tooltip>Экспорт</q-tooltip>
        </q-btn>
      </div>
      <q-table
        :rows="earnedRowsFiltered"
        :columns="earnedColumns"
        row-key="id"
        flat
        dense
        separator="horizontal"
        :rows-per-page-options="[5, 10, 25]"
        v-model:pagination="earnedPagination"
        rows-per-page-label="строк на странице"
        class="points-table"
      />
    </div>

    <div class="points-block">
      <div class="points-block__header">
        <div class="points-block__title">
          Списано {{ formatNumber(spentTotal) }}
          <span class="points-inline">
            (
            <span class="points-inline__city">{{ formatNumber(spentCity) }}</span>
            /
            <span class="points-inline__prize">{{ formatNumber(spentPrize) }}</span>
            /
            <span class="points-inline__kids">{{ formatNumber(spentKids) }}</span>
            )
          </span>
          баллов с {{ formatDate(appliedPeriod.startDate) }} по {{ formatDate(appliedPeriod.endDate) }}
        </div>
        <q-btn
          dense
          flat
          icon="mdi-download"
          color="secondary"
          class="icon-btn icon-btn--export"
        >
          <q-tooltip>Экспорт</q-tooltip>
        </q-btn>
      </div>
      <q-table
        :rows="spentRowsFiltered"
        :columns="spentColumns"
        row-key="id"
        flat
        dense
        separator="horizontal"
        :rows-per-page-options="[5, 10, 25]"
        v-model:pagination="spentPagination"
        rows-per-page-label="строк на странице"
        class="points-table"
      />
    </div>

    <div class="charts-block">
      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title">Динамика операций с баллами {{ formatDate(appliedPeriod.startDate) }} по {{ formatDate(appliedPeriod.endDate) }}</div>
          <div class="chart-controls">
            <q-btn
              :outline="chartScale !== 'days'"
              :color="chartScale === 'days' ? 'primary' : 'grey-5'"
              label="Дни"
              class="chart-btn"
              @click="chartScale = 'days'"
            />
            <q-btn
              :outline="chartScale !== 'months'"
              :color="chartScale === 'months' ? 'primary' : 'grey-5'"
              label="Месяц"
              class="chart-btn"
              @click="chartScale = 'months'"
            />
          </div>
        </div>
        <div class="chart-placeholder">График будет добавлен на следующем этапе.</div>
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <div class="chart-title">Баланс</div>
          <div class="chart-controls">
            <q-btn
              :outline="balanceScale !== 'days'"
              :color="balanceScale === 'days' ? 'primary' : 'grey-5'"
              label="Дни"
              class="chart-btn"
              @click="balanceScale = 'days'"
            />
            <q-btn
              :outline="balanceScale !== 'months'"
              :color="balanceScale === 'months' ? 'primary' : 'grey-5'"
              label="Месяц"
              class="chart-btn"
              @click="balanceScale = 'months'"
            />
          </div>
        </div>
        <div class="chart-placeholder">График будет добавлен на следующем этапе.</div>
      </div>
    </div>

    <div class="projects-block">
      <div class="projects-block__title">Начислено баллов по проектам</div>
      <div class="projects-block__content">
        <div class="projects-table">
          <q-table
            :rows="projectSummaryRows"
            :columns="projectSummaryColumns"
            row-key="project"
            flat
            dense
            separator="horizontal"
            :rows-per-page-options="[5, 10, 25]"
            v-model:pagination="projectPagination"
            rows-per-page-label="строк на странице"
            class="points-table"
          />
        </div>
        <div class="projects-chart">
          <div class="projects-chart__header">
            <div class="projects-chart__title">Количество баллов по проектам</div>
            <q-icon name="mdi-menu" class="projects-chart__menu" />
          </div>
          <div class="chart-placeholder">График будет добавлен на следующем этапе.</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ALL_PROJECTS } from 'src/data/users';

type PointsType = 'all' | 'prize' | 'city' | 'kids';

const pointsPeriod = ref({
  startDate: '2012-01-01',
  endDate: '2026-03-03',
});
const appliedPeriod = ref({ ...pointsPeriod.value });

const pointsType = ref<PointsType>('all');
const appliedType = ref<PointsType>('all');

const pointsTypeOptions = [
  { value: 'all' as const, label: 'Все баллы' },
  { value: 'prize' as const, label: 'Призовые' },
  { value: 'city' as const, label: 'Городские' },
  { value: 'kids' as const, label: 'Детские' },
];

const pointsTypeLabel = computed(() =>
  pointsTypeOptions.find((option) => option.value === pointsType.value)?.label || 'Все баллы',
);

const applyFilters = () => {
  appliedPeriod.value = { ...pointsPeriod.value };
  appliedType.value = pointsType.value;
};

const PROJECT_ROOT_ID = 'points_projects';
const projectLeafIds = ALL_PROJECTS.map((_, index) => `points_project_${index}`);
const projectTree = [
  {
    id: PROJECT_ROOT_ID,
    label: 'Выбрать все',
    children: ALL_PROJECTS.map((project, index) => ({
      id: projectLeafIds[index],
      label: project,
    })),
  },
];

const tickedProjects = ref<string[]>([PROJECT_ROOT_ID, ...projectLeafIds]);
const expandedProjects = ref<string[]>([PROJECT_ROOT_ID]);

const projectLeafCount = computed(
  () => tickedProjects.value.filter((id) => id !== PROJECT_ROOT_ID).length,
);

const updateProjectsTicked = (next: string[]) => {
  const leafSet = next.filter((id) => id !== PROJECT_ROOT_ID);
  const hadRoot = tickedProjects.value.includes(PROJECT_ROOT_ID);
  const hasRoot = next.includes(PROJECT_ROOT_ID);
  const allLeavesSelected = leafSet.length === projectLeafIds.length;

  if (hasRoot && !hadRoot) {
    tickedProjects.value = [PROJECT_ROOT_ID, ...projectLeafIds];
    return;
  }

  if (!hasRoot && hadRoot && allLeavesSelected) {
    tickedProjects.value = [];
    return;
  }

  if (allLeavesSelected) {
    tickedProjects.value = [PROJECT_ROOT_ID, ...leafSet];
    return;
  }

  tickedProjects.value = leafSet;
};

const projectsDisplay = computed(() => {
  const count = projectLeafCount.value;
  if (count === 0) return 'Выберите проекты';
  if (count === projectLeafIds.length) return 'Все проекты';
  return `Выбрано: ${count}`;
});

const toggleTreeNode = (
  currentTicked: string[],
  updateFn: (next: string[]) => void,
  nodeId: string,
) => {
  const next = new Set(currentTicked);
  if (next.has(nodeId)) {
    next.delete(nodeId);
  } else {
    next.add(nodeId);
  }
  updateFn([...next]);
};

const chartScale = ref<'days' | 'months'>('days');
const balanceScale = ref<'days' | 'months'>('days');

const earnedRows = [
  {
    id: 1,
    project: 'Миллион призов',
    action: 'Баллы за участие в акции',
    description: 'Активированы призовые баллы акции «ВыбираемВместе2024»',
    date: '17.03.2024',
    earned: 1000,
    type: 'prize' as const,
    source: 'Источник не указан',
  },
  {
    id: 2,
    project: 'Миллион призов',
    action: 'Баллы за участие в акции',
    description: 'Активированы призовые баллы акции «ВыбираемВместе2023»',
    date: '21.09.2023',
    earned: 1000,
    type: 'prize' as const,
    source: 'Источник не указан',
  },
  {
    id: 3,
    project: 'Активный гражданин',
    action: 'Перенос баллов проекта «Активный гражданин»',
    description: 'Перенос баллов проекта «Активный гражданин» с ag.mos.ru',
    date: '30.01.2022',
    earned: 19,
    type: 'city' as const,
    source: 'Источник не указан',
  },
];

const spentRows = [
  {
    id: 1,
    action: 'Заказ',
    description: '1000 рублей в благотворительный фонд «Новая жизнь»',
    date: '17.03.2024',
    spent: 1000,
    type: 'prize' as const,
  },
  {
    id: 2,
    action: 'Аннулирование неиспользованных баллов',
    description: 'Аннулирование неиспользованных баллов по условиям акции',
    date: '15.12.2023',
    spent: 1000,
    type: 'prize' as const,
  },
  {
    id: 3,
    action: 'Аннулирование баллов',
    description: 'Аннулирование баллов',
    date: '28.02.2023',
    spent: 19,
    type: 'city' as const,
  },
];

const earnedColumns = [
  { name: 'project', label: 'Проект', field: 'project', align: 'left' as const },
  { name: 'action', label: 'Действие', field: 'action', align: 'left' as const },
  { name: 'description', label: 'Описание', field: 'description', align: 'left' as const },
  { name: 'date', label: 'Дата', field: 'date', align: 'left' as const },
  { name: 'earned', label: 'Заработано баллов', field: 'earned', align: 'left' as const },
  { name: 'type', label: 'Тип баллов', field: 'typeLabel', align: 'left' as const },
  { name: 'source', label: 'Источник голоса', field: 'source', align: 'left' as const },
];

const spentColumns = [
  { name: 'action', label: 'Действие', field: 'action', align: 'left' as const },
  { name: 'description', label: 'Описание', field: 'description', align: 'left' as const },
  { name: 'date', label: 'Дата', field: 'date', align: 'left' as const },
  { name: 'spent', label: 'Потрачено баллов', field: 'spent', align: 'left' as const },
  { name: 'type', label: 'Тип баллов', field: 'typeLabel', align: 'left' as const },
];

const earnedPagination = ref({ page: 1, rowsPerPage: 5 });
const spentPagination = ref({ page: 1, rowsPerPage: 5 });
const projectPagination = ref({ page: 1, rowsPerPage: 5 });

const typeLabel = (value: PointsType) => {
  if (value === 'city') return 'Городские';
  if (value === 'prize') return 'Призовые';
  if (value === 'kids') return 'Детские';
  return 'Все';
};

const filterByType = <T extends { type: PointsType }>(rows: T[]) => {
  if (appliedType.value === 'all') return rows;
  return rows.filter((row) => row.type === appliedType.value);
};

const earnedRowsFiltered = computed(() =>
  filterByType(earnedRows).map((row) => ({
    ...row,
    typeLabel: typeLabel(row.type),
  })),
);

const spentRowsFiltered = computed(() =>
  filterByType(spentRows).map((row) => ({
    ...row,
    typeLabel: typeLabel(row.type),
  })),
);

const sumByType = (rows: { type: PointsType; earned?: number; spent?: number }[], field: 'earned' | 'spent') =>
  rows.reduce((sum, row) => sum + (row[field] ?? 0), 0);

const earnedTotal = computed(() => sumByType(earnedRowsFiltered.value, 'earned'));
const earnedCity = computed(() => sumByType(earnedRowsFiltered.value.filter((row) => row.type === 'city'), 'earned'));
const earnedPrize = computed(() => sumByType(earnedRowsFiltered.value.filter((row) => row.type === 'prize'), 'earned'));
const earnedKids = computed(() => sumByType(earnedRowsFiltered.value.filter((row) => row.type === 'kids'), 'earned'));

const spentTotal = computed(() => sumByType(spentRowsFiltered.value, 'spent'));
const spentCity = computed(() => sumByType(spentRowsFiltered.value.filter((row) => row.type === 'city'), 'spent'));
const spentPrize = computed(() => sumByType(spentRowsFiltered.value.filter((row) => row.type === 'prize'), 'spent'));
const spentKids = computed(() => sumByType(spentRowsFiltered.value.filter((row) => row.type === 'kids'), 'spent'));

const balanceCity = computed(() => earnedCity.value - spentCity.value);
const balancePrize = computed(() => earnedPrize.value - spentPrize.value);
const balanceKids = computed(() => earnedKids.value - spentKids.value);
const balanceTotal = computed(() => balanceCity.value + balancePrize.value + balanceKids.value);

const formatNumber = (value: number) => value.toLocaleString('ru-RU');

const formatDate = (value: string) => {
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return value;
  return `${day}.${month}.${year}`;
};

const projectSummaryRows = computed(() => {
  const map = new Map<string, number>();
  earnedRowsFiltered.value.forEach((row) => {
    map.set(row.project, (map.get(row.project) ?? 0) + row.earned);
  });
  return [...map.entries()].map(([project, count]) => ({ project, count }));
});

const projectSummaryColumns = [
  { name: 'project', label: 'Проект', field: 'project', align: 'left' as const },
  { name: 'count', label: 'Количество баллов', field: 'count', align: 'left' as const, format: formatNumber },
];
</script>

<style lang="scss" scoped>
.points-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 20px 20px;
}

.points-summary__title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.points-inline {
  font-weight: 700;
}

.points-inline__city {
  color: var(--q-positive);
}

.points-inline__prize {
  color: var(--q-negative);
}

.points-inline__kids {
  color: var(--q-warning);
}

.points-filters-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 12px 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
}

.points-filters__grid {
  display: grid;
  grid-template-columns: 160px 160px minmax(180px, 1fr) minmax(180px, 1fr) minmax(160px, 1fr) auto;
  gap: 10px;
  align-items: center;
}

.filter-input :deep(.q-field__control) {
  border-radius: 10px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

.filter-input,
.filter-dropdown {
  min-width: 0;
}

.filter-dropdown {
  width: 100%;
  min-height: 40px;
  padding: 6px 10px;
  border-radius: 10px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-transform: none;
  font-weight: 500;
}

.filter-dropdown :deep(.q-btn__content) {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.filter-dropdown__content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-width: 0;
}

.filter-dropdown__label {
  font-size: 11px;
  color: #9ca3af;
  line-height: 1;
}

.filter-dropdown__value {
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.filters-menu {
  min-width: 260px;
  max-width: 420px;
}

.filters-menu__content {
  padding: 6px 8px;
  max-height: 280px;
  overflow: auto;
}

.filters-empty {
  padding: 8px;
  color: #9ca3af;
  font-size: 12px;
}

.tree-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 6px;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
}

.tree-item:hover {
  background: #f3f4f6;
}

.tree-item__label {
  line-height: 1.2;
}

.apply-btn {
  height: 40px;
  border-radius: 10px;
  text-transform: none;
  font-weight: 600;
}

.apply-btn--inline {
  justify-self: end;
  min-width: 120px;
}

.points-block {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 12px 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
  display: flex;
  flex-direction: column;
  min-height: 320px;
}

.points-block__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.points-block__title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.points-table :deep(th) {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  background: #f9fafb;
}

.points-table {
  flex: 1 1 auto;
  min-height: 240px;
}

.points-table :deep(.q-table__container) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.points-table :deep(.q-table__middle) {
  flex: 1 1 auto;
}

.points-table :deep(.q-table__bottom) {
  margin-top: auto;
}

.points-table :deep(td) {
  font-size: 12px;
  color: #374151;
}

.icon-btn {
  min-width: 34px;
  min-height: 34px;
  background: #fff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #475569;
}

.icon-btn:hover {
  background: #f8fafc;
}

.icon-btn--export {
  color: #26a69a;
  border-color: rgba(38, 166, 154, 0.45);
}

.icon-btn--export:hover {
  background: rgba(38, 166, 154, 0.08);
}

.charts-block {
  display: grid;
  gap: 14px;
}

.projects-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.projects-block__title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.projects-block__content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 16px;
}

.projects-table,
.projects-chart {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 12px 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
}

.projects-table {
  display: flex;
  flex-direction: column;
  min-height: 360px;
}

.projects-chart__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.projects-chart__title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.projects-chart__menu {
  color: #6b7280;
}

.chart-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,.06);
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.chart-title {
  font-size: 14px;
  font-weight: 700;
  color: #111827;
}

.chart-controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chart-btn {
  min-width: 80px;
  border-radius: 8px;
  text-transform: none;
  font-weight: 600;
}

.chart-placeholder {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-weight: 600;
}

@media (max-width: 1280px) {
  .points-filters__grid {
    grid-template-columns: repeat(3, minmax(160px, 1fr));
  }

  .apply-btn--inline {
    width: 100%;
    justify-self: stretch;
    grid-column: 1 / -1;
  }

  .projects-block__content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .points-filters__grid {
    grid-template-columns: repeat(2, minmax(160px, 1fr));
  }
}

@media (max-width: 640px) {
  .points-filters__grid {
    grid-template-columns: 1fr;
  }
}
</style>
