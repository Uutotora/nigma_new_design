<template>
  <q-page class="analytics-page">
    <div class="content-wrapper">
      <div class="page-header">
        <div class="page-title">Сводная аналитика</div>
      </div>

      <div class="analytics-layout">
        <div class="nav-panel analytics-nav">
          <div class="text-center q-mb-xs">
            <img :src="analyticsLogoUrl" alt="Логотип" class="analytics-logo" />
          </div>
          <div class="analytics-nav__spacer" />
          <q-tabs
            v-model="activeNav"
            vertical
            no-caps
            align="justify"
            active-color="blue"
            indicator-color="transparent"
            class="analytics-tabs"
          >
            <q-tab v-for="item in navItems" :key="item" :name="item" :label="item" />
          </q-tabs>
        </div>

        <div class="analytics-main">
          <q-tab-panels v-model="activeNav" animated class="analytics-panels">
            <q-tab-panel name="Действия" class="q-pa-none">
              <div class="filters-card analytics-block">
                <div class="block-header">
                  <div>
                    <div class="block-title">Параметры выборки</div>
                  </div>
                </div>

                <div class="filters-row">
                  <q-input
                    v-model="filters.startDate"
                    type="date"
                    dense
                    filled
                    label="Дата начала"
                    class="filter-input"
                  />
                  <q-input
                    v-model="filters.endDate"
                    type="date"
                    dense
                    filled
                    label="Дата окончания"
                    class="filter-input"
                  />

                  <q-btn-dropdown
                    class="filter-dropdown full-width"
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
                    class="filter-dropdown full-width"
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
                        <div class="filter-dropdown__value">{{ actionsDisplay }}</div>
                      </div>
                    </template>
                    <div class="filters-menu__content">
                      <q-tree
                        :nodes="actionTree"
                        node-key="id"
                        v-model:expanded="expandedActions"
                        dense
                      >
                        <template #default-header="prop">
                          <div class="tree-item" @click="toggleActionNode(prop.key)">
                            <q-checkbox
                              :model-value="tickedActions.includes(prop.key)"
                              dense
                              @update:model-value="() => toggleActionNode(prop.key)"
                              @click.stop
                            />
                            <div class="tree-item__label">{{ prop.node.label }}</div>
                          </div>
                        </template>
                      </q-tree>
                    </div>
                  </q-btn-dropdown>
                </div>

                <div class="filters-footer">
                  <div class="logic-inline">
                    <div class="logic-label">
                      Логика выбора действий
                      <q-icon name="mdi-information-outline" size="16px" class="logic-info">
                        <q-tooltip max-width="320px">
                          И — пользователь выполнил все выбранные действия. ИЛИ — пользователь
                          выполнил хотя бы одно выбранное действие.
                        </q-tooltip>
                      </q-icon>
                    </div>
                    <div
                      class="logic-toggle logic-toggle--compact"
                      :class="{ 'logic-toggle--or': logicMode === 'or' }"
                      role="radiogroup"
                      aria-label="Логика выбора действий"
                    >
                      <span class="logic-toggle__thumb" />
                      <button
                        type="button"
                        class="logic-toggle__btn"
                        :class="{ 'logic-toggle__btn--active': logicMode === 'and' }"
                        role="radio"
                        :aria-checked="logicMode === 'and'"
                        @click="logicMode = 'and'"
                      >
                        И
                      </button>
                      <button
                        type="button"
                        class="logic-toggle__btn"
                        :class="{ 'logic-toggle__btn--active': logicMode === 'or' }"
                        role="radio"
                        :aria-checked="logicMode === 'or'"
                        @click="logicMode = 'or'"
                      >
                        ИЛИ
                      </button>
                    </div>
                  </div>
                  <q-btn
                    color="primary"
                    label="Применить"
                    class="apply-btn"
                    @click="applyActionFilters"
                  />
                </div>
              </div>

              <div class="analytics-block actions-block">
                <div class="actions-block__header">
                  <div
                    class="logic-toggle"
                    :class="{ 'logic-toggle--or': actionsView === 'chart' }"
                    role="radiogroup"
                    aria-label="Переключение вида"
                  >
                    <span class="logic-toggle__thumb" />
                    <button
                      type="button"
                      class="logic-toggle__btn"
                      :class="{ 'logic-toggle__btn--active': actionsView === 'table' }"
                      role="radio"
                      :aria-checked="actionsView === 'table'"
                      @click="actionsView = 'table'"
                    >
                      Таблица
                    </button>
                    <button
                      type="button"
                      class="logic-toggle__btn"
                      :class="{ 'logic-toggle__btn--active': actionsView === 'chart' }"
                      role="radio"
                      :aria-checked="actionsView === 'chart'"
                      @click="actionsView = 'chart'"
                    >
                      График
                    </button>
                  </div>
                </div>

                <div v-if="actionsView === 'table'" class="actions-view actions-view--table">
                  <div class="table-header">
                    <div>
                      <div class="table-title">Действия</div>
                      <div class="table-subtitle">
                        Выбрано действий: {{ appliedActionIds.length || 0 }}
                      </div>
                    </div>
                    <div class="table-actions">
                      <q-badge
                        class="mode-pill"
                        :class="appliedMode === 'and' ? 'mode-pill--and' : 'mode-pill--or'"
                        transparent
                      >
                        {{ appliedMode === 'and' ? 'Логическое И' : 'Логическое ИЛИ' }}
                      </q-badge>
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
                    :rows="actionRows"
                    :columns="actionColumns"
                    row-key="action"
                    flat
                    dense
                    separator="horizontal"
                    :rows-per-page-options="[5, 10, 25, 50]"
                    rows-per-page-label="строк на странице"
                    class="analytics-table"
                    :row-class="rowClass"
                    :no-data-label="tableNoDataLabel"
                  />
                </div>

                <div v-else class="actions-view actions-view--chart">
                  <div class="block-header chart-header">
                    <div class="block-title">График активности пользователей</div>
                    <div class="chart-controls">
                      <q-btn
                        :outline="timeScale !== 'days'"
                        :color="timeScale === 'days' ? 'primary' : 'grey-5'"
                        label="Дни"
                        class="chart-btn"
                        @click="timeScale = 'days'"
                      />
                      <q-btn
                        :outline="timeScale !== 'months'"
                        :color="timeScale === 'months' ? 'primary' : 'grey-5'"
                        label="Месяцы"
                        class="chart-btn"
                        @click="timeScale = 'months'"
                      />
                      <q-btn
                        :outline="timeScale !== 'years'"
                        :color="timeScale === 'years' ? 'primary' : 'grey-5'"
                        label="Годы"
                        class="chart-btn"
                        @click="timeScale = 'years'"
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
                            <q-separator />
                            <q-item clickable v-close-popup>
                              <q-item-section>Скачать в формате CSV</q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup>
                              <q-item-section>Скачать в формате XLS</q-item-section>
                            </q-item>
                          </q-list>
                        </q-menu>
                      </q-btn>
                    </div>
                  </div>
                  <div class="chart-placeholder">Выберите действия и нажмите «Применить».</div>
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel
              v-for="item in navItems.filter((nav) => nav !== 'Действия')"
              :key="item"
              :name="item"
              class="q-pa-none"
            >
              <div class="dev-stub">
                Раздел «{{ item }}» в разработке
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

const filters = ref({
  startDate: '2025-02-19',
  endDate: '2026-02-19',
});

const PROJECT_ROOT_ID = 'projects';
const PROJECT_OPTIONS = [
  'Активный гражданин',
  'Город заданий',
  'Город идей',
  'Электронный дом',
  'Наш город',
  'Миллион призов',
  'Программа лояльности',
  'СТП',
  'ЭДО',
  'Активный гражданин - детям',
];

const projectLeafIds = PROJECT_OPTIONS.map((_, index) => `project_${index}`);
const projectTree = [
  {
    id: PROJECT_ROOT_ID,
    label: 'Выбрать все',
    children: PROJECT_OPTIONS.map((project, index) => ({
      id: `project_${index}`,
      label: project,
    })),
  },
];

const tickedProjects = ref<string[]>([PROJECT_ROOT_ID, ...projectLeafIds]);
const expandedProjects = ref<string[]>([PROJECT_ROOT_ID]);
const projectLeafCount = computed(
  () => tickedProjects.value.filter((id) => id !== PROJECT_ROOT_ID).length,
);

const projectsDisplay = computed(() => {
  const leafCount = projectLeafCount.value;
  if (leafCount === 0) return 'Выберите проекты';
  if (leafCount === projectLeafIds.length) return 'Все проекты';
  return `Выбрано: ${leafCount}`;
});

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

const actionGroups = [
  {
    id: 'activeg',
    label: 'Все действия по проекту "Активный гражданин"',
    actions: [
      'Регистрация в проекте',
      'Участие в голосовании',
      'Оценка новинок (оценка объектов)',
      'Оценка пульса столицы',
      'Оценка Пульса столицы от редакции',
      'Добавлено фото на Пульс столицы',
      'Оценка фото пользователей на Пульсе столицы',
      'Оценка новинок (от редакции)',
      'Просмотр историй',
      'Прочтение историй',
      'Оценка историй',
    ],
  },
  {
    id: 'citytasks',
    label: 'Все действия по проекту "Город заданий"',
    actions: [
      'Регистрация в проекте',
      'Обращение в СТП',
      'Успешное выполнение задания',
      'Неуспешное выполнение задания',
    ],
  },
  {
    id: 'cityideas',
    label: 'Все действия по проекту "Город идей"',
    actions: [
      'Регистрация в проекте',
      'Проектная идея',
      'Голос за идею',
      'Идея 24/7',
      'Фото идеи',
      'Комментарий на проекте',
      'Обращение в СТП',
    ],
  },
  {
    id: 'eldom',
    label: 'Все действия по проекту "Электронный дом"',
    actions: [
      'Регистрация в проекте',
      'Инициация ОСС',
      'Участие в ОСС',
      'Заявка в ЕДЦ',
      'Заявка в НГ',
      'Создание объявления',
      'Сообщение в чат',
      'Участие в опросе',
      'Передача показаний счетчиков',
      'Обращение в УО',
      'Инициирован опрос',
      'Оплата электроэнергии',
    ],
  },
  {
    id: 'ourcity',
    label: 'Все действия по проекту "Наш город"',
    actions: [
      'Регистрация в проекте',
      'Сообщение',
    ],
  },
  {
    id: 'milp',
    label: 'Все действия по проекту "Миллион призов"',
    actions: [
      'Регистрация в проекте',
      'Регистрация в программе МИЛП',
      'Заработал(а) городские (действие)',
      'Потратил(а) городские (поощрение)',
      'Заработал(а) призовые (действие)',
      'Потратил(а) призовые (поощрение)',
      'Перенесено городских баллов',
      'Аннулировано городских баллов',
      'Аннулировано призовых баллов',
      'Оценил(а) товар',
      'Оставил(а) отзыв',
    ],
  },
  {
    id: 'kids',
    label: 'Все действия по проекту "Активный гражданин - детям"',
    actions: [
      'За решение примера на проекте "Активный гражданин детям"',
      'За регистрацию на проекте "Активный гражданин детям"',
      'За прохождение викторины на проекте "Активный гражданин детям"',
      'Участие в опросе',
      'Неправильное решение примера',
    ],
  },
];

const actionLeafs = actionGroups.flatMap((group) =>
  group.actions.map((action, index) => ({
    id: `${group.id}_${index}`,
    label: action,
    groupId: `${group.id}_all`,
  })),
);
const actionLeafIds = actionLeafs.map((leaf) => leaf.id);
const actionLabelById: Record<string, string> = Object.fromEntries(
  actionLeafs.map((leaf) => [leaf.id, leaf.label]),
);
const actionLeafToGroupId: Record<string, string> = Object.fromEntries(
  actionLeafs.map((leaf) => [leaf.id, leaf.groupId]),
);
const actionGroupToLeafIds: Record<string, string[]> = Object.fromEntries(
  actionGroups.map((group) => [
    `${group.id}_all`,
    group.actions.map((_, index) => `${group.id}_${index}`),
  ]),
);
const actionLeafIdSet = new Set(actionLeafIds);

const actionTree = [
  {
    id: 'all',
    label: 'Выбрать все',
    children: actionGroups.map((group) => ({
      id: `${group.id}_all`,
      label: group.label,
      children: group.actions.map((action, index) => ({
        id: `${group.id}_${index}`,
        label: action,
      })),
    })),
  },
];

const ACTION_ROOT_ID = 'all';
const actionGroupIds = actionGroups.map((group) => `${group.id}_all`);
const actionGroupIdSet = new Set(actionGroupIds);
const tickedActions = ref<string[]>([]);
const expandedActions = ref<string[]>([ACTION_ROOT_ID, 'activeg_all', 'citytasks_all']);

const normalizeActionSelection = (ids: string[]) => {
  if (ids.includes(ACTION_ROOT_ID)) return [...actionLeafIds];
  const selected = new Set<string>();
  ids.forEach((id) => {
    if (actionLeafIdSet.has(id)) selected.add(id);
    const groupLeaves = actionGroupToLeafIds[id];
    if (groupLeaves) groupLeaves.forEach((leafId) => selected.add(leafId));
  });
  return actionLeafIds.filter((id) => selected.has(id));
};

const updateActionsTicked = (next: string[]) => {
  const hadRoot = tickedActions.value.includes(ACTION_ROOT_ID);
  const hasRoot = next.includes(ACTION_ROOT_ID);

  if (hasRoot && !hadRoot) {
    tickedActions.value = [ACTION_ROOT_ID, ...actionGroupIds, ...actionLeafIds];
    return;
  }

  const leafSet = new Set<string>();
  next.forEach((id) => {
    if (actionLeafIdSet.has(id)) leafSet.add(id);
    if (actionGroupIdSet.has(id)) {
      const groupLeaves = actionGroupToLeafIds[id] ?? [];
      groupLeaves.forEach((leafId) => leafSet.add(leafId));
    }
  });

  const allLeavesSelected = leafSet.size === actionLeafIds.length && actionLeafIds.length > 0;

  if (!hasRoot && hadRoot && allLeavesSelected) {
    tickedActions.value = [];
    return;
  }

  const resolvedGroups = actionGroupIds.filter((groupId) =>
    (actionGroupToLeafIds[groupId] ?? []).every((leafId) => leafSet.has(leafId)),
  );

  tickedActions.value = [
    ...(allLeavesSelected ? [ACTION_ROOT_ID] : []),
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

const toggleActionNode = (nodeId: string) => {
  const next = new Set(tickedActions.value);

  if (nodeId === ACTION_ROOT_ID) {
    if (next.has(nodeId)) {
      next.delete(nodeId);
    } else {
      next.add(nodeId);
    }
    updateActionsTicked([...next]);
    return;
  }

  const groupLeaves = actionGroupToLeafIds[nodeId];
  if (groupLeaves) {
    const isSelected = next.has(nodeId);
    if (isSelected) {
      next.delete(nodeId);
      groupLeaves.forEach((leafId) => next.delete(leafId));
    } else {
      next.add(nodeId);
      groupLeaves.forEach((leafId) => next.add(leafId));
    }
    updateActionsTicked([...next]);
    return;
  }

  if (next.has(nodeId)) {
    next.delete(nodeId);
    const groupId = actionLeafToGroupId[nodeId];
    if (groupId) next.delete(groupId);
  } else {
    next.add(nodeId);
  }
  updateActionsTicked([...next]);
};

const selectedActionIds = computed(() => normalizeActionSelection(tickedActions.value));
const actionsDisplay = computed(() => {
  const count = selectedActionIds.value.length;
  if (count === 0) return 'Выберите действия';
  if (count === actionLeafIds.length) return 'Все действия';
  return `Выбрано: ${count}`;
});

const navItems = [
  'Регистрации / пересечение',
  'Действия',
  'Городские баллы',
  'Монитор контроля метрик',
  'Показатели дашборд',
  'Журнал активностей',
];
const activeNav = ref('Действия');
const analyticsLogoUrl = new URL('../css/лого.png', import.meta.url).href;

const timeScale = ref<'days' | 'months' | 'years'>('months');
const logicMode = ref<'and' | 'or'>('or');
const appliedMode = ref<'and' | 'or'>('or');
const appliedActionIds = ref<string[]>([]);
const appliedProjectCount = ref(projectLeafCount.value || projectLeafIds.length);
const appliedRange = ref({ startDate: filters.value.startDate, endDate: filters.value.endDate });
const actionsView = ref<'table' | 'chart'>('table');

const applyActionFilters = () => {
  appliedActionIds.value = [...selectedActionIds.value];
  appliedMode.value = logicMode.value;
  appliedProjectCount.value = projectLeafCount.value || projectLeafIds.length;
  appliedRange.value = { ...filters.value };
};

const formatNumber = (value: number) => value.toLocaleString('ru-RU');

const actionColumns = [
  { name: 'action', label: 'Действие', field: 'action', align: 'left' as const },
  { name: 'count', label: 'Совершено', field: 'count', align: 'right' as const, format: formatNumber },
  { name: 'unique', label: 'Уникальных пользователей', field: 'unique', align: 'right' as const, format: formatNumber },
];

const parseDate = (value: string): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getDateRangeDays = (start: string, end: string) => {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  if (!startDate || !endDate) return 30;
  const diffMs = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1);
};

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const buildActionRow = (label: string, seed: number, projectCount: number, rangeDays: number) => {
  const base = hashString(`${label}_${seed}`);
  const periodFactor = 0.4 + Math.min(rangeDays, 365) / 365;
  const projectFactor = 0.6 + (Math.min(projectCount, projectLeafIds.length) / projectLeafIds.length) * 0.6;
  const count = Math.round((20000 + (base % 900000)) * periodFactor * projectFactor);
  const unique = Math.max(1, Math.round(count * (0.04 + (base % 18) / 100)));
  return { action: label, count, unique };
};

const adjustRowsForAnd = (rows: { action: string; count: number; unique: number }[]) => {
  if (rows.length === 0) return rows;
  const minUnique = Math.min(...rows.map((row) => row.unique));
  return rows.map((row) => ({
    ...row,
    unique: minUnique,
    count: Math.max(minUnique, Math.round(row.count * 0.7)),
  }));
};

const buildTotalRow = (rows: { action: string; count: number; unique: number }[], mode: 'and' | 'or') => {
  const totalCount = rows.reduce((sum, row) => sum + row.count, 0);
  const totalUniqueRaw = rows.reduce((sum, row) => sum + row.unique, 0);
  const minUnique = rows.length > 0 ? Math.min(...rows.map((row) => row.unique)) : 0;
  const totalUnique = mode === 'and'
    ? minUnique
    : Math.min(totalCount, Math.round(totalUniqueRaw * 0.7));
  return { action: 'Итого', count: totalCount, unique: totalUnique, isTotal: true };
};

const actionRows = computed(() => {
  if (appliedActionIds.value.length === 0) return [];
  const labels = appliedActionIds.value.map((id) => actionLabelById[id]).filter(Boolean);
  if (labels.length === 0) return [];
  const rangeDays = getDateRangeDays(appliedRange.value.startDate, appliedRange.value.endDate);
  const projectCount = Math.max(1, appliedProjectCount.value || projectLeafIds.length);
  const seedBase = rangeDays * 31 + projectCount * 17 + (appliedMode.value === 'and' ? 11 : 7);
  const baseRows = labels.map((label) => buildActionRow(label, seedBase, projectCount, rangeDays));
  const adjustedRows = appliedMode.value === 'and' ? adjustRowsForAnd(baseRows) : baseRows;
  return [...adjustedRows, buildTotalRow(adjustedRows, appliedMode.value)];
});

const rowClass = (row: { isTotal?: boolean }) => (row.isTotal ? 'table-row-total' : '');

const tableNoDataLabel = computed(() =>
  appliedActionIds.value.length === 0
    ? 'Выберите действия и нажмите «Применить».'
    : 'Нет данных',
);
</script>

<style lang="scss" scoped>
.analytics-page {
  background-color: #027be3;
  padding: 0;
}

.content-wrapper {
  background-color: #e0e0e0;
  border-top-left-radius: 16px;
  min-height: calc(100vh - 50px);
  padding: 18px 22px 26px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
}

.analytics-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.analytics-nav {
  width: 210px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,.08), 0 12px 28px rgba(0,0,0,.05);
  padding: 14px 8px;
}

.analytics-logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

.analytics-nav__spacer {
  height: 4px;
}

.analytics-main {
  flex: 1 1 auto;
  min-width: 0;
}

.analytics-panels {
  background: transparent;
}

.dev-stub {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  box-shadow: 0 2px 8px rgba(0,0,0,.08), 0 12px 28px rgba(0,0,0,.05);
}

.analytics-block {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06);
  padding: 14px 16px;
  margin-bottom: 14px;
}

.actions-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.actions-block__header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
}

.actions-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.actions-view--chart {
  min-height: 220px;
}

.filters-card {
  background: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.block-title {
  font-size: 15px;
  font-weight: 700;
  color: #111827;
}


.filters-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(160px, 1fr)) minmax(220px, 1.3fr) minmax(240px, 1.5fr);
  gap: 10px;
  align-items: center;
}

.filter-input :deep(.q-field__control) {
  border-radius: 10px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

.filter-input :deep(.q-field__control):before,
.filter-input :deep(.q-field__control):after {
  border-bottom: none;
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

.filter-dropdown__icon {
  color: #6b7280;
}

.filters-menu {
  min-width: 360px;
  max-width: 520px;
}

.logic-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.logic-info {
  color: #9ca3af;
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

.logic-toggle--compact {
  min-width: 120px;
  height: 30px;
}

.logic-toggle--compact .logic-toggle__btn {
  height: 24px;
  font-size: 12px;
}

.seg-control {
  display: inline-flex;
  align-items: center;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  overflow: hidden;
  background: #f8fafc;
  width: fit-content;
}

.seg-btn {
  min-height: 28px;
  padding: 0 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #64748b;
}

.seg-btn :deep(.q-btn__content) {
  line-height: 1;
}

.seg-btn--right {
  border-left: 1px solid #cbd5e1;
}

.seg-btn--active {
  background: #027be3;
  color: #ffffff;
}

.seg-btn--active .q-icon {
  color: #ffffff;
}

.filters-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.logic-inline {
  display: flex;
  align-items: center;
  gap: 10px;
}

.apply-btn {
  height: 40px;
  border-radius: 10px;
  text-transform: none;
  font-weight: 600;
}

.table-card {
  padding: 10px 12px 12px;
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
  gap: 10px;
}

.mode-pill {
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--pill-color);
  color: var(--pill-color);
  background: transparent;
}

.mode-pill--and {
  --pill-color: #2563eb;
}

.mode-pill--or {
  --pill-color: #2563eb;
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

.analytics-table :deep(th) {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  background: #f9fafb;
}

.analytics-table :deep(td) {
  font-size: 12px;
  color: #374151;
}

.analytics-table :deep(tbody tr:hover) {
  background: #f9fafb;
}

.table-row-total :deep(td) {
  font-weight: 700;
  background: #1d4ed8;
  color: #ffffff;
}

.analytics-table :deep(tbody tr.table-row-total:hover td) {
  background: #1d4ed8;
}

.chart-header {
  align-items: center;
  margin-bottom: 10px;
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

.chart-menu-btn {
  border-radius: 8px;
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

.chart-card {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chart-placeholder {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-weight: 600;
}

.filters-menu__content {
  padding: 6px 8px;
  max-height: 360px;
  overflow: auto;
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


@media (max-width: 1200px) {
  .filters-row {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
  }
}

@media (max-width: 900px) {
  .analytics-layout {
    flex-direction: column;
  }

  .chart-controls {
    flex-wrap: wrap;
  }

  .seg-control {
    width: 100%;
    justify-content: flex-start;
  }

  .filters-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .logic-inline {
    width: 100%;
    justify-content: space-between;
  }

  .apply-btn {
    width: 100%;
  }
}
</style>
