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
        <div
          v-for="item in activitySummaryItems"
          :key="item.label"
          class="activity-summary-card"
        >
          <div class="activity-summary-card__name">{{ item.label }}</div>
          <div class="activity-summary-card__row">
            <div class="activity-summary-card__icon">
              <img
                v-if="item.iconType === 'img'"
                :src="item.iconSrc"
                :alt="item.label"
                class="activity-summary-card__img"
              />
              <q-icon v-else :name="item.icon" color="white" size="22px" />
            </div>
            <div class="activity-summary-card__values">
              <button
                type="button"
                class="activity-summary-card__value activity-summary-card__value--base"
                :class="{ 'activity-summary-card__value--active-base': item.activeBase }"
                @click="setQuickProject(item.label, 'base')"
              >
                <span class="activity-summary-card__value-number">{{ item.baseCount }}</span>
                <span class="activity-summary-card__value-label">Проект</span>
              </button>
              <button
                type="button"
                class="activity-summary-card__value activity-summary-card__value--loyalty"
                :class="{ 'activity-summary-card__value--active-loyalty': item.activeLoyalty }"
                @click="setQuickProject(item.label, 'loyalty')"
              >
                <span class="activity-summary-card__value-number">{{ item.loyaltyCount }}</span>
                <span class="activity-summary-card__value-label">ПЛ</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="activity-card activity-card--filters">
      <div class="activity-card__header">
        <p class="section-title q-mb-none">Лента активности пользователя</p>
      </div>

      <div class="activity-filters">
        <div class="project-chips-row">
          <span class="project-chips-label">Проекты</span>
          <div class="project-chips">
            <button
              v-for="(leafId, idx) in activityProjectLeafIds"
              :key="leafId"
              type="button"
              class="project-chip"
              :class="{ 'project-chip--on': activityProjectsTicked.includes(leafId) }"
              @click="toggleProjectChip(leafId)"
            >
              {{ ACTIVITY_PROJECTS[idx] }}
            </button>
          </div>
          <button type="button" class="project-chip project-chip--all" @click="toggleAllProjects">
            {{ allProjectsChipsSelected ? 'Снять все' : 'Все' }}
          </button>
        </div>

        <div class="filters-row">
          <q-btn-dropdown
            ref="actionsDropdownRef"
            class="filter-dropdown filter-dropdown--actions"
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

          <div class="filters-apply-group">
            <q-btn
              color="primary"
              label="Применить"
              class="apply-btn apply-btn--inline"
              @click="applyActivityFilters"
            />
            <q-btn
              flat
              round
              icon="mdi-trash-can-outline"
              color="grey-6"
              class="reset-activity-btn"
              @click="resetActivityFilters"
            >
              <q-tooltip>Сбросить фильтры</q-tooltip>
            </q-btn>
          </div>
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

          <div class="filters-actions__right" />
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
import { computed, nextTick, ref } from 'vue';
import { ACTIVITY_ACTION_GROUPS } from 'src/data/activity';

const iconActiveg = new URL('../../css/activeg.74063d19.svg', import.meta.url).href;
const iconOur = new URL('../../css/our.e8350a8e.svg', import.meta.url).href;
const iconHome = new URL('../../css/home.55681fec.svg', import.meta.url).href;
const iconTask = new URL('../../css/task.35b75734.svg', import.meta.url).href;
const iconPrize = new URL('../../css/prize.fa0e6560.svg', import.meta.url).href;
const iconCityideas = new URL('../../css/cityideas.svg', import.meta.url).href;

const actionsDropdownRef = ref<{ show: () => void } | null>(null);

type ActionKind = 'base' | 'loyalty';

type ProjectDef = {
  id: string;
  label: string;
};

const PROJECT_DEFS: ProjectDef[] = [
  { id: 'eldom', label: 'Электронный дом' },
  { id: 'kids', label: 'Активный гражданин - детям' },
  { id: 'activeg', label: 'Активный гражданин' },
  { id: 'milp', label: 'Миллион призов' },
  { id: 'cityideas', label: 'Город идей' },
  { id: 'citytasks', label: 'Город заданий' },
  { id: 'ourcity', label: 'Наш город' },
];

const ACTIVITY_PROJECTS = PROJECT_DEFS.map((project) => project.label);

const BASE_ACTION_GROUPS = ACTIVITY_ACTION_GROUPS.filter((group) => group.id !== 'loyalty');

const baseActionsByProject: Record<string, string[]> = Object.fromEntries(
  PROJECT_DEFS.map((project) => {
    const group = BASE_ACTION_GROUPS.find((item) => item.id === project.id);
    return [project.label, group?.actions ?? []];
  }),
);

const loyaltyActions = ACTIVITY_ACTION_GROUPS.find((group) => group.id === 'loyalty')?.actions ?? [];
const loyaltyActionsByProject: Record<string, string[]> = Object.fromEntries(
  PROJECT_DEFS.map((project) => [project.label, []]),
);

const resolveLoyaltyProject = (action: string): string | null => {
  const normalized = action.toLowerCase();
  const matchers: { project: string; tokens: string[] }[] = [
    { project: 'Активный гражданин - детям', tokens: ['активный гражданин детям', 'активный гражданин - детям'] },
    { project: 'Город заданий', tokens: ['город заданий'] },
    { project: 'Город идей', tokens: ['город идей'] },
    { project: 'Наш город', tokens: ['наш город'] },
    { project: 'Электронный дом', tokens: ['электронный дом'] },
    { project: 'Миллион призов', tokens: ['миллион призов', 'миллион приз'] },
    { project: 'Активный гражданин', tokens: ['активный гражданин'] },
  ];

  for (const matcher of matchers) {
    if (matcher.tokens.some((token) => normalized.includes(token))) {
      return matcher.project;
    }
  }
  return null;
};

const loyaltyFallbackProject = 'Миллион призов';
const unmatchedLoyaltyActions: string[] = [];

loyaltyActions.forEach((action) => {
  const project = resolveLoyaltyProject(action);
  if (project && loyaltyActionsByProject[project]) {
    loyaltyActionsByProject[project].push(action);
  } else {
    unmatchedLoyaltyActions.push(action);
  }
});

if (loyaltyActionsByProject[loyaltyFallbackProject]) {
  unmatchedLoyaltyActions.forEach((action) => {
    loyaltyActionsByProject[loyaltyFallbackProject].push(action);
  });
}

const loyaltyActionSetByProject: Record<string, Set<string>> = Object.fromEntries(
  Object.entries(loyaltyActionsByProject).map(([project, actions]) => [project, new Set(actions)]),
);

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
const activityProjectLeafIds = ACTIVITY_PROJECTS.map((_, index) => `activity_project_${index}`);
const activityProjectLabelById: Record<string, string> = Object.fromEntries(
  activityProjectLeafIds.map((id, index) => [id, ACTIVITY_PROJECTS[index]]),
);
const activityProjectIdByLabel: Record<string, string> = Object.fromEntries(
  ACTIVITY_PROJECTS.map((label, index) => [label, activityProjectLeafIds[index]]),
);
const activityProjectTree = [
  {
    id: ACTIVITY_PROJECT_ROOT_ID,
    label: 'Выбрать все',
    children: ACTIVITY_PROJECTS.map((project, index) => ({
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
const actionMetaByLeafId: Record<string, { project: string; action: string; type: ActionKind }> = {};
const leafIdsByProjectAndType: Record<string, { base: string[]; loyalty: string[] }> = {};
const projectGroupIdByLabel: Record<string, string> = {};
const subgroupIdByLabelType: Record<string, { base: string; loyalty: string }> = {};
const actionLeafIdByProjectType: Record<string, { base: Record<string, string>; loyalty: Record<string, string> }> = {};
const groupToLeafIds: Record<string, string[]> = {};
const activityActionLeafIds: string[] = [];
const baseActionLeafIds: string[] = [];
const loyaltyActionLeafIds: string[] = [];
const projectGroupIds: string[] = [];
const subgroupIds: string[] = [];

const activityActionTree = [
  {
    id: ACTIVITY_ACTION_ROOT_ID,
    label: 'Выбрать все',
    children: PROJECT_DEFS.map((project) => {
      const projectGroupId = `activity_actions_${project.id}`;
      projectGroupIdByLabel[project.label] = projectGroupId;
      projectGroupIds.push(projectGroupId);
      const baseGroupId = `${projectGroupId}_base`;
      const loyaltyGroupId = `${projectGroupId}_loyalty`;
      subgroupIds.push(baseGroupId, loyaltyGroupId);
      subgroupIdByLabelType[project.label] = { base: baseGroupId, loyalty: loyaltyGroupId };
      actionLeafIdByProjectType[project.label] = { base: {}, loyalty: {} };

      const baseLeafs = (baseActionsByProject[project.label] ?? []).map((action, index) => {
        const leafId = `${baseGroupId}_${index}`;
        activityActionLeafIds.push(leafId);
        baseActionLeafIds.push(leafId);
        actionMetaByLeafId[leafId] = { project: project.label, action, type: 'base' };
        actionLeafIdByProjectType[project.label].base[action] = leafId;
        return { id: leafId, label: action };
      });

      const loyaltyLeafs = (loyaltyActionsByProject[project.label] ?? []).map((action, index) => {
        const leafId = `${loyaltyGroupId}_${index}`;
        activityActionLeafIds.push(leafId);
        loyaltyActionLeafIds.push(leafId);
        actionMetaByLeafId[leafId] = { project: project.label, action, type: 'loyalty' };
        actionLeafIdByProjectType[project.label].loyalty[action] = leafId;
        return { id: leafId, label: action };
      });

      leafIdsByProjectAndType[project.label] = {
        base: baseLeafs.map((leaf) => leaf.id),
        loyalty: loyaltyLeafs.map((leaf) => leaf.id),
      };

      groupToLeafIds[baseGroupId] = baseLeafs.map((leaf) => leaf.id);
      groupToLeafIds[loyaltyGroupId] = loyaltyLeafs.map((leaf) => leaf.id);
      groupToLeafIds[projectGroupId] = [...groupToLeafIds[baseGroupId], ...groupToLeafIds[loyaltyGroupId]];

      return {
        id: projectGroupId,
        label: `Все действия по проекту "${project.label}"`,
        children: [
          {
            id: baseGroupId,
            label: `Действия по проекту "${project.label}"`,
            children: baseLeafs,
          },
          {
            id: loyaltyGroupId,
            label: `Действия по проекту "${project.label}" программа лояльности`,
            children: loyaltyLeafs,
          },
        ],
      };
    }),
  },
];

groupToLeafIds[ACTIVITY_ACTION_ROOT_ID] = [...activityActionLeafIds];

const activityActionLeafIdSet = new Set(activityActionLeafIds);
const baseActionLeafIdSet = new Set(baseActionLeafIds);
const loyaltyActionLeafIdSet = new Set(loyaltyActionLeafIds);
const selectedActionLeafIds = ref<string[]>([...activityActionLeafIds]);

const activityActionsExpanded = ref<string[]>([
  ACTIVITY_ACTION_ROOT_ID,
  `activity_actions_${PROJECT_DEFS[0]?.id ?? 'eldom'}`,
]);

const buildTickedFromLeaves = (leafIds: string[]) => {
  const selected = new Set(leafIds);
  const ticked: string[] = [...selected];

  subgroupIds.forEach((groupId) => {
    const leaves = groupToLeafIds[groupId] ?? [];
    if (leaves.length > 0 && leaves.every((leafId) => selected.has(leafId))) {
      ticked.push(groupId);
    }
  });

  projectGroupIds.forEach((groupId) => {
    const leaves = groupToLeafIds[groupId] ?? [];
    if (leaves.length > 0 && leaves.every((leafId) => selected.has(leafId))) {
      ticked.push(groupId);
    }
  });

  if (activityActionLeafIds.length > 0 && selected.size === activityActionLeafIds.length) {
    ticked.push(ACTIVITY_ACTION_ROOT_ID);
  }

  return ticked;
};

const activityActionsTicked = computed(() => buildTickedFromLeaves(selectedActionLeafIds.value));

const isGroupFullySelected = (groupId: string) => {
  const leaves = groupToLeafIds[groupId] ?? [];
  if (leaves.length === 0) return false;
  return leaves.every((leafId) => selectedActionLeafIds.value.includes(leafId));
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
  if (nodeId === ACTIVITY_ACTION_ROOT_ID) {
    if (selectedActionLeafIds.value.length === activityActionLeafIds.length) {
      selectedActionLeafIds.value = [];
    } else {
      selectedActionLeafIds.value = [...activityActionLeafIds];
    }
    return;
  }

  const groupLeaves = groupToLeafIds[nodeId];
  if (groupLeaves) {
    if (isGroupFullySelected(nodeId)) {
      selectedActionLeafIds.value = selectedActionLeafIds.value.filter((id) => !groupLeaves.includes(id));
    } else {
      const next = new Set(selectedActionLeafIds.value);
      groupLeaves.forEach((id) => next.add(id));
      selectedActionLeafIds.value = [...next];
    }
    return;
  }

  if (!activityActionLeafIdSet.has(nodeId)) return;
  if (selectedActionLeafIds.value.includes(nodeId)) {
    selectedActionLeafIds.value = selectedActionLeafIds.value.filter((id) => id !== nodeId);
  } else {
    selectedActionLeafIds.value = [...selectedActionLeafIds.value, nodeId];
  }
};

const activitySelectedActionIds = computed(() => [...selectedActionLeafIds.value]);
const activityActionsDisplay = computed(() => {
  const count = activitySelectedActionIds.value.length;
  if (count === 0) return 'Выберите действия';
  if (count === activityActionLeafIds.length) return 'Все действия';
  return `Выбрано: ${count}`;
});

const appliedActivityProjects = ref<string[]>([]);
const appliedActivityActionLeafIds = ref<string[]>([]);
const lastQuickSelection = ref<{ label: string; kind: ActionKind } | null>(null);
const userHasMadeSelection = ref(false);

const applyActivityFilters = () => {
  appliedActivityProjects.value = [...activitySelectedProjectLabels.value];
  appliedActivityActionLeafIds.value = [...activitySelectedActionIds.value];
};

const toggleProjectChip = (leafId: string) => {
  const projectLabel = activityProjectLabelById[leafId];
  const isOn = activityProjectsTicked.value.includes(leafId);

  // Обновляем список выбранных проектов
  const leaves = new Set(activityProjectsTicked.value.filter((id) => id !== ACTIVITY_PROJECT_ROOT_ID));
  if (isOn) {
    leaves.delete(leafId);
  } else {
    leaves.add(leafId);
  }
  const leafArr = [...leaves];
  activityProjectsTicked.value = leafArr.length === activityProjectLeafIds.length
    ? [ACTIVITY_PROJECT_ROOT_ID, ...leafArr]
    : leafArr;

  // Обновляем действия: добавляем/убираем все действия этого проекта
  const projectAllIds = [
    ...(leafIdsByProjectAndType[projectLabel]?.base ?? []),
    ...(leafIdsByProjectAndType[projectLabel]?.loyalty ?? []),
  ];
  if (isOn) {
    selectedActionLeafIds.value = selectedActionLeafIds.value.filter(
      (id) => !projectAllIds.includes(id),
    );
  } else {
    const next = new Set(selectedActionLeafIds.value);
    projectAllIds.forEach((id) => next.add(id));
    selectedActionLeafIds.value = [...next];
  }

  // Сбрасываем quick-selection и сразу применяем
  lastQuickSelection.value = null;
  userHasMadeSelection.value = true;
  applyActivityFilters();
};

const allProjectsChipsSelected = computed(
  () => activityProjectLeafIds.every((id) => activityProjectsTicked.value.includes(id)),
);

const toggleAllProjects = () => {
  if (allProjectsChipsSelected.value) {
    // Снять все = сбросить
    lastQuickSelection.value = null;
    userHasMadeSelection.value = false;
    activityProjectsTicked.value = [];
    selectedActionLeafIds.value = [];
    appliedActivityProjects.value = [];
    appliedActivityActionLeafIds.value = [];
  } else {
    // Выбрать все проекты и все действия + применить
    activityProjectsTicked.value = [ACTIVITY_PROJECT_ROOT_ID, ...activityProjectLeafIds];
    selectedActionLeafIds.value = [...activityActionLeafIds];
    lastQuickSelection.value = null;
    userHasMadeSelection.value = true;
    applyActivityFilters();
  }
};

const resetActivityFilters = () => {
  lastQuickSelection.value = null;
  userHasMadeSelection.value = false;
  activityProjectsTicked.value = [ACTIVITY_PROJECT_ROOT_ID, ...activityProjectLeafIds];
  selectedActionLeafIds.value = [...activityActionLeafIds];
  appliedActivityProjects.value = [];
  appliedActivityActionLeafIds.value = [];
};

const stopKeyPropagation = () => {
  // Intentionally empty: used with `.stop` to prevent bubbling.
};

const openActionFilter = (label: string, kind: ActionKind) => {
  const projectGroupId = projectGroupIdByLabel[label];
  const subgroupId = subgroupIdByLabelType[label]?.[kind];
  const expanded = [ACTIVITY_ACTION_ROOT_ID, projectGroupId, subgroupId].filter(Boolean);
  activityActionsExpanded.value = Array.from(new Set(expanded));
  void nextTick(() => {
    actionsDropdownRef.value?.show();
  });
};

const setQuickProject = (label: string, kind: ActionKind = 'base') => {
  const id = activityProjectIdByLabel[label];
  if (!id) return;
  activityProjectsTicked.value = [id];
  selectedActionLeafIds.value = [...(leafIdsByProjectAndType[label]?.[kind] ?? [])];
  lastQuickSelection.value = { label, kind };
  userHasMadeSelection.value = true;
  openActionFilter(label, kind);
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
    project: 'Миллион призов',
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
  {
    id: 11,
    project: 'Электронный дом',
    action: 'За отправку личного сообщения соседу на проекте "Электронный дом"',
    date: '05.02.2025 11:20:00',
    description: '',
    source: 'Нет данных',
  },
  {
    id: 12,
    project: 'Город заданий',
    action: 'Регистрация в проекте',
    date: '02.04.2024 09:10:00',
    description: '',
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
  if (appliedActivityActionLeafIds.value.length === 0) return [];
  if (appliedActivityProjects.value.length === 0) return [];
  const actionPairs = new Set(
    appliedActivityActionLeafIds.value
      .map((id) => actionMetaByLeafId[id])
      .filter(Boolean)
      .map((meta) => `${meta.project}|||${meta.action}`),
  );
  const projects = new Set(appliedActivityProjects.value);
  return activityRows.filter((row) => {
    if (!actionPairs.has(`${row.project}|||${row.action}`)) return false;
    if (!projects.has(row.project)) return false;
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
  appliedActivityActionLeafIds.value.length === 0
    ? 'Выберите действия и нажмите «Применить».'
    : 'Нет данных',
);

const activityChartPlaceholder = computed(() => {
  if (appliedActivityActionLeafIds.value.length === 0) return 'Выберите действия и нажмите «Применить».';
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
  { label: 'Город заданий', iconType: 'img', iconSrc: iconTask },
  { label: 'Город идей', iconType: 'img', iconSrc: iconCityideas },
];

// Всегда показываем тотальные счётчики по периоду, игнорируя выбранные фильтры действий
const totalCountsByProject = computed(() => {
  const counts: Record<string, { base: number; loyalty: number }> = {};
  activityRows.forEach((row) => {
    if (
      !isWithinRange(
        parseActivityDate(row.date),
        appliedActivityPeriod.value.startDate,
        appliedActivityPeriod.value.endDate,
      )
    ) return;
    if (!counts[row.project]) counts[row.project] = { base: 0, loyalty: 0 };
    const isLoyalty = loyaltyActionSetByProject[row.project]?.has(row.action);
    if (isLoyalty) counts[row.project].loyalty += 1;
    else counts[row.project].base += 1;
  });
  return counts;
});

// Динамический счётчик только для активной кнопки (реагирует на изменения в фильтрах действий)
const dynamicCountForActive = computed(() => {
  const active = lastQuickSelection.value;
  if (!active) return null;
  let count = 0;
  activityRows.forEach((row) => {
    if (row.project !== active.label) return;
    if (
      !isWithinRange(
        parseActivityDate(row.date),
        appliedActivityPeriod.value.startDate,
        appliedActivityPeriod.value.endDate,
      )
    ) return;
    const isLoyalty = loyaltyActionSetByProject[row.project]?.has(row.action);
    if (active.kind === 'base' && isLoyalty) return;
    if (active.kind === 'loyalty' && !isLoyalty) return;
    const leafId =
      active.kind === 'loyalty'
        ? actionLeafIdByProjectType[row.project]?.loyalty[row.action]
        : actionLeafIdByProjectType[row.project]?.base[row.action];
    if (!leafId || !selectedActionLeafIds.value.includes(leafId)) return;
    count += 1;
  });
  return count;
});

const activitySummaryItems = computed(() =>
  activitySummaryProjects.map((item) => {
    const totals = totalCountsByProject.value[item.label] ?? { base: 0, loyalty: 0 };
    const baseIds = leafIdsByProjectAndType[item.label]?.base ?? [];
    const loyaltyIds = leafIdsByProjectAndType[item.label]?.loyalty ?? [];

    // Кнопка активна когда пользователь делал выбор И все действия этого проекта+типа выбраны
    const isBaseActive = userHasMadeSelection.value
      && baseIds.length > 0
      && baseIds.every((id) => selectedActionLeafIds.value.includes(id));
    const isLoyaltyActive = userHasMadeSelection.value
      && loyaltyIds.length > 0
      && loyaltyIds.every((id) => selectedActionLeafIds.value.includes(id));

    // Динамический счётчик только для последней нажатой кнопки (quick-select)
    const active = lastQuickSelection.value;
    const isQuickActiveBase = active?.label === item.label && active.kind === 'base';
    const isQuickActiveLoyalty = active?.label === item.label && active.kind === 'loyalty';

    return {
      ...item,
      baseCount: isQuickActiveBase ? (dynamicCountForActive.value ?? totals.base) : totals.base,
      loyaltyCount: isQuickActiveLoyalty ? (dynamicCountForActive.value ?? totals.loyalty) : totals.loyalty,
      activeBase: isBaseActive,
      activeLoyalty: isLoyaltyActive,
    };
  }),
);
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
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,.07), 0 12px 28px rgba(0,0,0,.04);
}

.activity-summary-card__name {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.activity-summary-card__row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.activity-summary-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-summary-card__img {
  width: 44px;
  height: 44px;
  display: block;
  object-fit: contain;
}

.activity-summary-card__values {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
}

.activity-summary-card__value {
  appearance: none;
  font-family: inherit;
  border: 1.5px solid #e2e6ea;
  background: #f2f4f7;
  border-radius: 12px;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, transform 0.15s ease;
}

.activity-summary-card__value:hover {
  background: #e8ecf1;
  border-color: #bfc6d0;
  transform: translateY(-1px);
}

.activity-summary-card__value:active {
  transform: translateY(0);
}

.activity-summary-card__value:focus-visible {
  outline: 2px solid rgba(2, 123, 227, 0.35);
  outline-offset: 2px;
}

.activity-summary-card__value-number {
  font-size: 22px;
  font-weight: 800;
  color: #111827;
  line-height: 1;
}

.activity-summary-card__value-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #8c95a3;
}

.activity-summary-card__value--active-base {
  background: #027be3;
  border-color: #027be3;
}

.activity-summary-card__value--active-base:hover {
  background: #0270d0;
  border-color: #0270d0;
}

.activity-summary-card__value--active-base .activity-summary-card__value-number,
.activity-summary-card__value--active-base .activity-summary-card__value-label {
  color: #ffffff;
}

.activity-summary-card__value--active-loyalty {
  background: #26a69a;
  border-color: #26a69a;
}

.activity-summary-card__value--active-loyalty:hover {
  background: #1f9088;
  border-color: #1f9088;
}

.activity-summary-card__value--active-loyalty .activity-summary-card__value-number,
.activity-summary-card__value--active-loyalty .activity-summary-card__value-label {
  color: #ffffff;
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

.project-chips-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f2f5;
}

.project-chips-label {
  font-size: 11px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.project-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  flex: 1;
}

.project-chip {
  appearance: none;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  border: 1.5px solid #dde1e7;
  background: #f8f9fb;
  color: #4b5563;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.project-chip:hover {
  background: #eef1f5;
  border-color: #b8bec8;
}

.project-chip--on {
  background: #027be3;
  border-color: #027be3;
  color: #ffffff;
}

.project-chip--on:hover {
  background: #0270d0;
  border-color: #0270d0;
}

.project-chip--all {
  flex-shrink: 0;
  border-style: dashed;
  color: #6b7280;
}

.project-chip--all:hover {
  color: #374151;
}

.filters-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-dropdown {
  flex: 1;
  min-width: 200px;
  min-height: 44px;
  padding: 7px 12px;
  border-radius: 12px;
  background: #ffffff;
  border: 1.5px solid #dde1e7;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-transform: none;
  font-weight: 500;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.filter-dropdown:hover {
  border-color: #b8bec8;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.09);
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
  font-weight: 500;
  line-height: 1;
}

.filter-dropdown__value {
  font-size: 13px;
  font-weight: 700;
  color: #1a2332;
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

.apply-btn--inline {
  min-width: 140px;
}

.filters-apply-group {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-self: end;
}

.reset-activity-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  flex-shrink: 0;
  transition: background-color 0.18s ease, border-color 0.18s ease;
}

.reset-activity-btn:hover {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #ef4444 !important;
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

@media (max-width: 900px) {
  .filters-row {
    grid-template-columns: 1fr;
  }

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
