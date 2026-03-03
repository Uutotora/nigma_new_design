<template>
  <div class="activity-layout">
    <div class="activity-summary">
      <div class="summary-controls">
        <q-input
          v-model="activityPeriod.startDate"
          type="date"
          dense
          filled
          label="Дата начала"
          class="summary-input"
        />
        <q-input
          v-model="activityPeriod.endDate"
          type="date"
          dense
          filled
          label="Дата окончания"
          class="summary-input"
        />
        <q-btn
          color="primary"
          label="Применить период"
          class="summary-apply"
          @click="applyActivityPeriod"
        />
      </div>

      <div class="summary-cards">
        <button
          v-for="item in activitySummaryItems"
          :key="item.label"
          type="button"
          class="activity-summary-card"
          :class="{ 'activity-summary-card--active': item.active }"
          @click="setQuickProject(item.label)"
        >
          <div class="activity-summary-card__icon">
            <img
              v-if="item.iconType === 'img'"
              :src="item.iconSrc"
              :alt="item.label"
              class="activity-summary-card__img"
            />
            <q-icon v-else :name="item.icon" color="white" size="18px" />
          </div>
          <div class="activity-summary-card__body">
            <div class="activity-summary-card__label">{{ item.label }}</div>
            <div class="activity-summary-card__value">{{ item.count }}</div>
          </div>
        </button>
      </div>
    </div>

    <div class="activity-card activity-card--filters">
      <div class="activity-card__header">
        <p class="section-title q-mb-none">Лента активности пользователя</p>
      </div>

      <div class="activity-filters">
        <div class="filters-row">
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
                <div class="filter-dropdown__value">{{ activityProjectsDisplay }}</div>
              </div>
            </template>
            <div class="filters-menu__content">
              <q-tree
                :nodes="activityProjectTree"
                node-key="id"
                v-model:expanded="activityProjectsExpanded"
                dense
              >
                <template #default-header="prop">
                  <div class="tree-item" @click="toggleTreeNode(activityProjectsTicked, updateActivityProjectsTicked, prop.key)">
                    <q-checkbox
                      :model-value="activityProjectsTicked.includes(prop.key)"
                      dense
                      @update:model-value="() => toggleTreeNode(activityProjectsTicked, updateActivityProjectsTicked, prop.key)"
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
                <div class="filter-dropdown__value">{{ activityActionsDisplay }}</div>
              </div>
            </template>
            <div class="filters-menu__content filters-menu__content--tall">
              <q-tree
                :nodes="activityActionTree"
                node-key="id"
                v-model:expanded="activityActionsExpanded"
                dense
              >
                <template #default-header="prop">
                  <div class="tree-item" @click="toggleActivityActionNode(prop.key)">
                    <q-checkbox
                      :model-value="activityActionsTicked.includes(prop.key)"
                      dense
                      @update:model-value="() => toggleActivityActionNode(prop.key)"
                      @click.stop
                    />
                    <div class="tree-item__label">{{ prop.node.label }}</div>
                  </div>
                </template>
              </q-tree>
            </div>
          </q-btn-dropdown>
        </div>

        <div class="filters-actions">
          <div
            class="logic-toggle"
            :class="{ 'logic-toggle--or': activityView === 'chart' }"
            role="radiogroup"
            aria-label="Переключение вида"
          >
            <span class="logic-toggle__thumb" />
            <button
              type="button"
              class="logic-toggle__btn"
              :class="{ 'logic-toggle__btn--active': activityView === 'table' }"
              role="radio"
              :aria-checked="activityView === 'table'"
              @click="activityView = 'table'"
            >
              Таблица
            </button>
            <button
              type="button"
              class="logic-toggle__btn"
              :class="{ 'logic-toggle__btn--active': activityView === 'chart' }"
              role="radio"
              :aria-checked="activityView === 'chart'"
              @click="activityView = 'chart'"
            >
              График
            </button>
          </div>

          <div class="filters-actions__right">
            <q-btn
              color="primary"
              label="Применить"
              class="apply-btn"
              @click="applyActivityFilters"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="activity-card activity-card--content">
      <div v-if="activityView === 'table'" class="activity-table">
        <div class="table-header">
          <div>
            <div class="table-title">Лента активности пользователя</div>
            <div class="table-subtitle">Записей: {{ filteredActivityRows.length }}</div>
          </div>
          <div class="table-actions">
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
        </div>
        <q-table
          :rows="filteredActivityRows"
          :columns="activityColumns"
          row-key="id"
          flat
          dense
          separator="horizontal"
          :rows-per-page-options="[10, 25, 50]"
          v-model:pagination="activityPagination"
          rows-per-page-label="строк на странице"
          class="activity-table__inner"
          :no-data-label="activityNoDataLabel"
        />
      </div>

      <div v-else class="activity-chart">
        <div class="chart-header">
          <div class="block-title">График активности пользователя</div>
          <div class="chart-controls">
            <q-btn
              :outline="activityTimeScale !== 'days'"
              :color="activityTimeScale === 'days' ? 'primary' : 'grey-5'"
              label="Дни"
              class="chart-btn"
              @click="activityTimeScale = 'days'"
            />
            <q-btn
              :outline="activityTimeScale !== 'months'"
              :color="activityTimeScale === 'months' ? 'primary' : 'grey-5'"
              label="Месяцы"
              class="chart-btn"
              @click="activityTimeScale = 'months'"
            />
            <q-btn
              :outline="activityTimeScale !== 'years'"
              :color="activityTimeScale === 'years' ? 'primary' : 'grey-5'"
              label="Годы"
              class="chart-btn"
              @click="activityTimeScale = 'years'"
            />
            <q-btn flat dense icon="mdi-menu" class="icon-btn chart-menu-btn">
              <q-menu
                class="chart-menu"
                anchor="bottom right"
                self="top right"
                :offset="[0, 6]"
              >
                <q-list dense>
                  <q-item clickable v-close-popup>
                    <q-item-section>Открыть на весь экран</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup>
                    <q-item-section>Распечатать график</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup>
                    <q-item-section>Скачать в формате PNG</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup>
                    <q-item-section>Скачать в формате JPEG</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup>
                    <q-item-section>Скачать в формате PDF</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup>
                    <q-item-section>Скачать в формате SVG</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>
        </div>
        <div class="chart-placeholder">{{ activityChartPlaceholder }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ALL_PROJECTS } from 'src/data/users';
import { ACTIVITY_ACTION_GROUPS } from 'src/data/activity';

const iconActiveg = new URL('../../css/activeg.74063d19.svg', import.meta.url).href;
const iconOur = new URL('../../css/our.e8350a8e.svg', import.meta.url).href;
const iconHome = new URL('../../css/home.55681fec.svg', import.meta.url).href;
const iconTask = new URL('../../css/task.35b75734.svg', import.meta.url).href;
const iconPrize = new URL('../../css/prize.fa0e6560.svg', import.meta.url).href;

const activityView = ref<'table' | 'chart'>('table');
const activityTimeScale = ref<'days' | 'months' | 'years'>('months');
const activityPeriod = ref({
  startDate: '2012-01-01',
  endDate: '2026-03-03',
});
const appliedActivityPeriod = ref({ ...activityPeriod.value });

const applyActivityPeriod = () => {
  appliedActivityPeriod.value = { ...activityPeriod.value };
};

type ActivityRow = {
  id: number;
  project: string;
  action: string;
  date: string;
  description: string;
  source: string;
};

const ACTIVITY_PROJECT_ROOT_ID = 'activity_projects';
const activityProjectLeafIds = ALL_PROJECTS.map((_, index) => `activity_project_${index}`);
const activityProjectLabelById: Record<string, string> = Object.fromEntries(
  activityProjectLeafIds.map((id, index) => [id, ALL_PROJECTS[index]]),
);
const activityProjectIdByLabel: Record<string, string> = Object.fromEntries(
  ALL_PROJECTS.map((label, index) => [label, activityProjectLeafIds[index]]),
);
const activityProjectTree = [
  {
    id: ACTIVITY_PROJECT_ROOT_ID,
    label: 'Выбрать все',
    children: ALL_PROJECTS.map((project, index) => ({
      id: activityProjectLeafIds[index],
      label: project,
    })),
  },
];
const activityProjectsTicked = ref<string[]>([ACTIVITY_PROJECT_ROOT_ID, ...activityProjectLeafIds]);
const activityProjectsExpanded = ref<string[]>([ACTIVITY_PROJECT_ROOT_ID]);
const activityProjectLeafCount = computed(
  () => activityProjectsTicked.value.filter((id) => id !== ACTIVITY_PROJECT_ROOT_ID).length,
);

const updateActivityProjectsTicked = (next: string[]) => {
  const leafSet = next.filter((id) => id !== ACTIVITY_PROJECT_ROOT_ID);
  const hadRoot = activityProjectsTicked.value.includes(ACTIVITY_PROJECT_ROOT_ID);
  const hasRoot = next.includes(ACTIVITY_PROJECT_ROOT_ID);
  const allLeavesSelected = leafSet.length === activityProjectLeafIds.length;

  if (hasRoot && !hadRoot) {
    activityProjectsTicked.value = [ACTIVITY_PROJECT_ROOT_ID, ...activityProjectLeafIds];
    return;
  }

  if (!hasRoot && hadRoot && allLeavesSelected) {
    activityProjectsTicked.value = [];
    return;
  }

  if (allLeavesSelected) {
    activityProjectsTicked.value = [ACTIVITY_PROJECT_ROOT_ID, ...leafSet];
    return;
  }

  activityProjectsTicked.value = leafSet;
};

const normalizeActivityProjects = (ids: string[]) =>
  ids.includes(ACTIVITY_PROJECT_ROOT_ID)
    ? [...activityProjectLeafIds]
    : activityProjectLeafIds.filter((id) => ids.includes(id));

const activitySelectedProjectLabels = computed(() =>
  normalizeActivityProjects(activityProjectsTicked.value)
    .map((id) => activityProjectLabelById[id])
    .filter(Boolean),
);

const activityProjectsDisplay = computed(() => {
  const count = activityProjectLeafCount.value;
  if (count === 0) return 'Выберите проекты';
  if (count === activityProjectLeafIds.length) return 'Все проекты';
  return `Выбрано: ${count}`;
});

const ACTIVITY_ACTION_ROOT_ID = 'activity_actions';
const activityActionGroups = ACTIVITY_ACTION_GROUPS;
const activityActionGroupIds = activityActionGroups.map((group) => `${group.id}_all`);
const activityActionLeafs = activityActionGroups.flatMap((group) =>
  group.actions.map((action, index) => ({
    id: `${group.id}_${index}`,
    label: action,
    groupId: `${group.id}_all`,
  })),
);
const activityActionLeafIds = activityActionLeafs.map((leaf) => leaf.id);
const activityActionLabelById: Record<string, string> = Object.fromEntries(
  activityActionLeafs.map((leaf) => [leaf.id, leaf.label]),
);
const activityActionLeafToGroupId: Record<string, string> = Object.fromEntries(
  activityActionLeafs.map((leaf) => [leaf.id, leaf.groupId]),
);
const activityActionGroupToLeafIds: Record<string, string[]> = Object.fromEntries(
  activityActionGroups.map((group) => [
    `${group.id}_all`,
    group.actions.map((_, index) => `${group.id}_${index}`),
  ]),
);
const activityActionLeafIdSet = new Set(activityActionLeafIds);
const activityActionGroupIdSet = new Set(activityActionGroupIds);

const activityActionTree = [
  {
    id: ACTIVITY_ACTION_ROOT_ID,
    label: 'Выбрать все',
    children: activityActionGroups.map((group) => ({
      id: `${group.id}_all`,
      label: group.label,
      children: group.actions.map((action, index) => ({
        id: `${group.id}_${index}`,
        label: action,
      })),
    })),
  },
];

const activityActionsTicked = ref<string[]>([]);
const activityActionsExpanded = ref<string[]>([
  ACTIVITY_ACTION_ROOT_ID,
  `${activityActionGroups[0]?.id ?? 'eldom'}_all`,
]);

const normalizeActivityActions = (ids: string[]) => {
  if (ids.includes(ACTIVITY_ACTION_ROOT_ID)) return [...activityActionLeafIds];
  const selected = new Set<string>();
  ids.forEach((id) => {
    if (activityActionLeafIdSet.has(id)) selected.add(id);
    const groupLeaves = activityActionGroupToLeafIds[id];
    if (groupLeaves) groupLeaves.forEach((leafId) => selected.add(leafId));
  });
  return activityActionLeafIds.filter((id) => selected.has(id));
};

const updateActivityActionsTicked = (next: string[]) => {
  const hadRoot = activityActionsTicked.value.includes(ACTIVITY_ACTION_ROOT_ID);
  const hasRoot = next.includes(ACTIVITY_ACTION_ROOT_ID);

  if (hasRoot && !hadRoot) {
    activityActionsTicked.value = [ACTIVITY_ACTION_ROOT_ID, ...activityActionGroupIds, ...activityActionLeafIds];
    return;
  }

  const leafSet = new Set<string>();
  next.forEach((id) => {
    if (activityActionLeafIdSet.has(id)) leafSet.add(id);
    if (activityActionGroupIdSet.has(id)) {
      const groupLeaves = activityActionGroupToLeafIds[id] ?? [];
      groupLeaves.forEach((leafId) => leafSet.add(leafId));
    }
  });

  const allLeavesSelected = leafSet.size === activityActionLeafIds.length && activityActionLeafIds.length > 0;

  if (!hasRoot && hadRoot && allLeavesSelected) {
    activityActionsTicked.value = [];
    return;
  }

  const resolvedGroups = activityActionGroupIds.filter((groupId) =>
    (activityActionGroupToLeafIds[groupId] ?? []).every((leafId) => leafSet.has(leafId)),
  );

  activityActionsTicked.value = [
    ...(allLeavesSelected ? [ACTIVITY_ACTION_ROOT_ID] : []),
    ...resolvedGroups,
    ...leafSet,
  ];
};

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

const toggleActivityActionNode = (nodeId: string) => {
  const next = new Set(activityActionsTicked.value);

  if (nodeId === ACTIVITY_ACTION_ROOT_ID) {
    if (next.has(nodeId)) {
      next.delete(nodeId);
    } else {
      next.add(nodeId);
    }
    updateActivityActionsTicked([...next]);
    return;
  }

  const groupLeaves = activityActionGroupToLeafIds[nodeId];
  if (groupLeaves) {
    const isSelected = next.has(nodeId);
    if (isSelected) {
      next.delete(nodeId);
      groupLeaves.forEach((leafId) => next.delete(leafId));
    } else {
      next.add(nodeId);
      groupLeaves.forEach((leafId) => next.add(leafId));
    }
    updateActivityActionsTicked([...next]);
    return;
  }

  if (next.has(nodeId)) {
    next.delete(nodeId);
    const groupId = activityActionLeafToGroupId[nodeId];
    if (groupId) next.delete(groupId);
  } else {
    next.add(nodeId);
  }
  updateActivityActionsTicked([...next]);
};

const activitySelectedActionIds = computed(() => normalizeActivityActions(activityActionsTicked.value));
const activityActionsDisplay = computed(() => {
  const count = activitySelectedActionIds.value.length;
  if (count === 0) return 'Выберите действия';
  if (count === activityActionLeafIds.length) return 'Все действия';
  return `Выбрано: ${count}`;
});

const appliedActivityProjects = ref<string[]>([]);
const appliedActivityActions = ref<string[]>([]);

const applyActivityFilters = () => {
  appliedActivityProjects.value = [...activitySelectedProjectLabels.value];
  appliedActivityActions.value = activitySelectedActionIds.value
    .map((id) => activityActionLabelById[id])
    .filter(Boolean);
};

const setQuickProject = (label: string) => {
  const id = activityProjectIdByLabel[label];
  if (!id) return;
  activityProjectsTicked.value = [id];
  if (activitySelectedActionIds.value.length === 0) {
    updateActivityActionsTicked([ACTIVITY_ACTION_ROOT_ID]);
  }
  applyActivityFilters();
};

const activityRows: ActivityRow[] = [
  {
    id: 1,
    project: 'Активный гражданин',
    action: 'Регистрация в проекте',
    date: '24.04.2020 00:00:00',
    description: '',
    source: 'Нет данных',
  },
  {
    id: 2,
    project: 'Миллион призов',
    action: 'Регистрация в проекте',
    date: '18.09.2021 14:14:01',
    description: '',
    source: 'Нет данных',
  },
  {
    id: 3,
    project: 'Миллион призов',
    action: 'Перенесено городских баллов',
    date: '30.01.2022 22:57:08',
    description: '19 баллов: Перенос баллов проекта «Активный гражданин» с ag.mos.ru',
    source: 'Нет данных',
  },
  {
    id: 4,
    project: 'Миллион призов',
    action: 'Аннулировано городских баллов',
    date: '28.02.2023 21:00:00',
    description: '19 баллов: Аннулирование баллов',
    source: 'Нет данных',
  },
  {
    id: 5,
    project: 'Миллион призов',
    action: 'Заработал(а) призовые (действие)',
    date: '21.09.2023 15:51:40',
    description: '1000 баллов: Активированы призовые баллы акции «ВыбираемВместе2023»',
    source: 'Нет данных',
  },
  {
    id: 6,
    project: 'Миллион призов',
    action: 'Аннулировано призовых баллов',
    date: '15.12.2023 00:12:52',
    description: '1000 баллов: Аннулирование неиспользованных баллов по условиям акции',
    source: 'Нет данных',
  },
  {
    id: 7,
    project: 'Миллион призов',
    action: 'Потратил(а) призовые (поощрение)',
    date: '17.03.2024 19:46:07',
    description: '1000 баллов: 1000 рублей в благотворительный фонд «Новая жизнь»',
    source: 'Нет данных',
  },
  {
    id: 8,
    project: 'Наш город',
    action: 'Сообщение',
    date: '14.03.2025 15:40:14',
    description: 'Неубранный подъезд',
    source: 'Нет данных',
  },
  {
    id: 9,
    project: 'Программа лояльности',
    action: 'Перенос очков рейтинга',
    date: '31.12.2021 21:00:00',
    description: '100 баллов: Перенос очков рейтинга',
    source: 'Нет данных',
  },
  {
    id: 10,
    project: 'Электронный дом',
    action: 'Сообщение в чат',
    date: '12.11.2024 09:18:22',
    description: 'Обсуждение ремонта подъезда',
    source: 'Нет данных',
  },
];

const parseActivityDate = (value: string): Date | null => {
  if (!value) return null;
  const [datePart] = value.split(' ');
  const [day, month, year] = datePart.split('.').map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
};

const parseIsoDate = (value: string): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isWithinRange = (date: Date | null, start?: string, end?: string) => {
  if (!date) return true;
  const startDate = parseIsoDate(start || '');
  const endDate = parseIsoDate(end || '');
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  return true;
};

const filteredActivityRows = computed(() => {
  if (appliedActivityActions.value.length === 0) return [];
  const actions = new Set(appliedActivityActions.value);
  const projects = appliedActivityProjects.value.length > 0 ? new Set(appliedActivityProjects.value) : null;
  return activityRows.filter((row) => {
    if (!actions.has(row.action)) return false;
    if (projects && !projects.has(row.project)) return false;
    return isWithinRange(
      parseActivityDate(row.date),
      appliedActivityPeriod.value.startDate,
      appliedActivityPeriod.value.endDate,
    );
  });
});

const activityColumns = [
  { name: 'project', label: 'Проект', field: 'project', align: 'left' as const, sortable: true },
  { name: 'action', label: 'Действие', field: 'action', align: 'left' as const, sortable: true },
  { name: 'date', label: 'Дата', field: 'date', align: 'left' as const, sortable: true },
  { name: 'description', label: 'Описание', field: 'description', align: 'left' as const },
  { name: 'source', label: 'Источник голоса', field: 'source', align: 'left' as const },
];

const activityPagination = ref({ page: 1, rowsPerPage: 10 });

const activityNoDataLabel = computed(() =>
  appliedActivityActions.value.length === 0
    ? 'Выберите действия и нажмите «Применить».'
    : 'Нет данных',
);

const activityChartPlaceholder = computed(() => {
  if (appliedActivityActions.value.length === 0) return 'Выберите действия и нажмите «Применить».';
  if (filteredActivityRows.value.length === 0) return 'Нет данных для построения графика.';
  return 'График будет добавлен на следующем этапе.';
});

type SummaryProject = {
  label: string;
  iconType: 'img' | 'mdi';
  iconSrc?: string;
  icon?: string;
};

const activitySummaryProjects: SummaryProject[] = [
  { label: 'Активный гражданин', iconType: 'img', iconSrc: iconActiveg },
  { label: 'Наш город', iconType: 'img', iconSrc: iconOur },
  { label: 'Электронный дом', iconType: 'img', iconSrc: iconHome },
  { label: 'Миллион призов', iconType: 'img', iconSrc: iconPrize },
  { label: 'Программа лояльности', iconType: 'img', iconSrc: iconTask },
];

const activitySummaryItems = computed(() => {
  const counts = activityRows.reduce<Record<string, number>>((acc, row) => {
    if (!isWithinRange(
      parseActivityDate(row.date),
      appliedActivityPeriod.value.startDate,
      appliedActivityPeriod.value.endDate,
    )) {
      return acc;
    }
    acc[row.project] = (acc[row.project] || 0) + 1;
    return acc;
  }, {});
  return activitySummaryProjects.map((item) => ({
    ...item,
    count: counts[item.label] ?? 0,
    active: appliedActivityProjects.value.includes(item.label),
  }));
});
</script>

<style lang="scss" scoped>
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  text-transform: none;
  letter-spacing: 0.2px;
  margin: 0 0 12px;
}

.activity-layout {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 0 20px 20px;
}

.activity-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.summary-input {
  width: 180px;
}

.summary-input :deep(.q-field__control) {
  border-radius: 10px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

.summary-apply {
  height: 40px;
  border-radius: 10px;
  text-transform: none;
  font-weight: 600;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.activity-summary-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,.08), 0 12px 28px rgba(0,0,0,.05);
  text-align: left;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.activity-summary-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(0,0,0,.12);
}

.activity-summary-card--active {
  border-color: #027be3;
  box-shadow: 0 8px 18px rgba(2, 123, 227, 0.2);
}

.activity-summary-card__icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-summary-card__img {
  width: 32px;
  height: 32px;
  display: block;
  object-fit: contain;
}

.activity-summary-card__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.activity-summary-card__label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  line-height: 1.2;
}

.activity-summary-card__value {
  font-size: 20px;
  font-weight: 800;
  color: #111827;
  line-height: 1;
}

.activity-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,.08), 0 12px 28px rgba(0,0,0,.05);
}

.activity-card--content {
  padding: 0;
  overflow: hidden;
}

.activity-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.activity-filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filters-row {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(320px, 1.6fr);
  gap: 12px;
  align-items: center;
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
  min-width: 360px;
  max-width: 520px;
}

.filters-menu__content {
  padding: 6px 8px;
  max-height: 320px;
  overflow: auto;
}

.filters-menu__content--tall {
  max-height: 420px;
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

.filters-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.filters-actions__right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.apply-btn {
  height: 40px;
  border-radius: 10px;
  text-transform: none;
  font-weight: 600;
}

.logic-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  padding: 2px;
  background: #f1f5f9;
  border: 1px solid #d7dee8;
  border-radius: 999px;
  min-width: 168px;
  height: 38px;
  overflow: hidden;
}

.logic-toggle__thumb {
  position: absolute;
  top: 2px;
  bottom: 2px;
  left: 2px;
  width: calc(50% - 2px);
  background: #027be3;
  border-radius: 999px;
  box-shadow: 0 4px 10px rgba(2, 123, 227, 0.28);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.logic-toggle--or .logic-toggle__thumb {
  transform: translateX(100%);
}

.logic-toggle__btn {
  position: relative;
  z-index: 1;
  flex: 1;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #64748b;
  cursor: pointer;
  transition: color 0.2s ease;
}

.logic-toggle__btn--active {
  color: #ffffff;
}

.logic-toggle__btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(2, 123, 227, 0.35);
  border-radius: 999px;
}

.activity-table {
  padding: 12px 14px 14px;
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.table-title {
  font-weight: 600;
  color: #111827;
}

.table-subtitle {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.activity-table__inner :deep(th) {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  background: #f9fafb;
}

.activity-table__inner :deep(td) {
  font-size: 12px;
  color: #374151;
}

.activity-table__inner :deep(tbody tr:hover) {
  background: #f9fafb;
}

.block-title {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}

.activity-chart {
  padding: 14px 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.chart-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chart-btn {
  min-width: 90px;
  border-radius: 8px;
  text-transform: none;
  font-weight: 600;
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

.chart-menu :deep(.q-list) {
  padding: 6px 0;
}

.chart-menu :deep(.q-item) {
  font-size: 13px;
  color: #374151;
  min-height: 32px;
}

.chart-menu :deep(.q-item__section) {
  padding: 0 12px;
}

.chart-placeholder {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-weight: 600;
  text-align: center;
  padding: 12px;
}

@media (max-width: 1200px) {
  .filters-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .summary-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .summary-input {
    width: 100%;
  }

  .filters-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .filters-actions__right {
    justify-content: flex-start;
  }
}
</style>
