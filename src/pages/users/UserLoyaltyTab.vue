<template>
  <div class="loyalty-layout">
    <div class="loyalty-card loyalty-card--info">
      <div class="loyalty-title">Информация о пользователе</div>
      <div class="info-pills">
        <div class="info-pill">
          <span class="info-pill__label">Активность:</span>
          <span class="info-pill__value">{{ totalActivity }}</span>
        </div>
        <div class="info-pill">
          <span class="info-pill__label">Количество транзакций:</span>
          <span class="info-pill__value">{{ totalTransactions }}</span>
        </div>
      </div>
    </div>

    <div class="loyalty-card">
      <div class="transactions-title">Транзакции</div>

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
              <div class="filter-dropdown__label">Тип транзакции</div>
              <div class="filter-dropdown__value">{{ typesDisplay }}</div>
            </div>
          </template>
          <div class="filters-menu__content">
            <q-tree
              :nodes="typeTree"
              node-key="id"
              v-model:expanded="expandedTypes"
              dense
            >
              <template #default-header="prop">
                <div class="tree-item" @click="toggleTreeNode(tickedTypes, updateTypesTicked, prop.key)">
                  <q-checkbox
                    :model-value="tickedTypes.includes(prop.key)"
                    dense
                    @update:model-value="() => toggleTreeNode(tickedTypes, updateTypesTicked, prop.key)"
                    @click.stop
                  />
                  <div class="tree-item__label">{{ prop.node.label }}</div>
                </div>
              </template>
            </q-tree>
          </div>
        </q-btn-dropdown>

        <div class="filters-actions">
          <q-btn
            color="primary"
            label="Применить"
            class="apply-btn"
            @click="applyFilters"
          />
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

      <div class="table-card">
        <q-table
          :rows="filteredRows"
          :columns="columns"
          row-key="id"
          flat
          dense
          separator="horizontal"
          :rows-per-page-options="[5, 10, 25]"
          v-model:pagination="pagination"
          rows-per-page-label="строк на странице"
          class="transactions-table"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

type TransactionRow = {
  id: number;
  type: string;
  project: string;
  activity: number;
  datetime: string;
  description: string;
};

const projectOptions = [
  'ИС "Электронный дом"',
  'ИС "Активный гражданин"',
  'Сайт «Миллион призов»',
];

const typeOptions = [
  'За оформление заявки на проекте "Электронный дом"',
  'За применение кода на сайте "Миллион призов"',
  'За приобретение поощрения из категории Благотворительность',
  'Перенос очков рейтинга',
  'За вход на сайт или в приложение проекта "Электронный дом"',
  'За вход на сайт "Миллион призов"',
];

const PROJECT_ROOT_ID = 'loyalty_projects';
const projectLeafIds = projectOptions.map((_, index) => `loyalty_project_${index}`);
const projectTree = [
  {
    id: PROJECT_ROOT_ID,
    label: 'Выбрать все',
    children: projectOptions.map((project, index) => ({
      id: projectLeafIds[index],
      label: project,
    })),
  },
];

const TYPE_ROOT_ID = 'loyalty_types';
const typeLeafIds = typeOptions.map((_, index) => `loyalty_type_${index}`);
const typeTree = [
  {
    id: TYPE_ROOT_ID,
    label: 'Выбрать все',
    children: typeOptions.map((type, index) => ({
      id: typeLeafIds[index],
      label: type,
    })),
  },
];

const tickedProjects = ref<string[]>([PROJECT_ROOT_ID, ...projectLeafIds]);
const expandedProjects = ref<string[]>([PROJECT_ROOT_ID]);
const tickedTypes = ref<string[]>([TYPE_ROOT_ID, ...typeLeafIds]);
const expandedTypes = ref<string[]>([TYPE_ROOT_ID]);

const projectLabelById: Record<string, string> = Object.fromEntries(
  projectLeafIds.map((id, index) => [id, projectOptions[index]]),
);
const typeLabelById: Record<string, string> = Object.fromEntries(
  typeLeafIds.map((id, index) => [id, typeOptions[index]]),
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

const updateTypesTicked = (next: string[]) => {
  const leafSet = next.filter((id) => id !== TYPE_ROOT_ID);
  const hadRoot = tickedTypes.value.includes(TYPE_ROOT_ID);
  const hasRoot = next.includes(TYPE_ROOT_ID);
  const allLeavesSelected = leafSet.length === typeLeafIds.length;

  if (hasRoot && !hadRoot) {
    tickedTypes.value = [TYPE_ROOT_ID, ...typeLeafIds];
    return;
  }

  if (!hasRoot && hadRoot && allLeavesSelected) {
    tickedTypes.value = [];
    return;
  }

  if (allLeavesSelected) {
    tickedTypes.value = [TYPE_ROOT_ID, ...leafSet];
    return;
  }

  tickedTypes.value = leafSet;
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

const projectLeafCount = computed(
  () => tickedProjects.value.filter((id) => id !== PROJECT_ROOT_ID).length,
);
const typeLeafCount = computed(
  () => tickedTypes.value.filter((id) => id !== TYPE_ROOT_ID).length,
);

const projectsDisplay = computed(() => {
  const count = projectLeafCount.value;
  if (count === 0) return 'Выберите проекты';
  if (count === projectLeafIds.length) return 'Все проекты';
  return `Выбрано: (${count})`;
});

const typesDisplay = computed(() => {
  const count = typeLeafCount.value;
  if (count === 0) return 'Выберите типы';
  if (count === typeLeafIds.length) return 'Все типы транзакций';
  return `Выбрано: (${count})`;
});

const normalizeProjects = (ids: string[]) =>
  ids.includes(PROJECT_ROOT_ID)
    ? [...projectOptions]
    : projectLeafIds
      .filter((id) => ids.includes(id))
      .map((id) => projectLabelById[id])
      .filter(Boolean);

const normalizeTypes = (ids: string[]) =>
  ids.includes(TYPE_ROOT_ID)
    ? [...typeOptions]
    : typeLeafIds
      .filter((id) => ids.includes(id))
      .map((id) => typeLabelById[id])
      .filter(Boolean);

const appliedProjects = ref<string[]>([...projectOptions]);
const appliedTypes = ref<string[]>([...typeOptions]);

const applyFilters = () => {
  appliedProjects.value = normalizeProjects(tickedProjects.value);
  appliedTypes.value = normalizeTypes(tickedTypes.value);
};

const rows: TransactionRow[] = [
  {
    id: 1,
    type: 'За оформление заявки на проекте "Электронный дом"',
    project: 'ИС "Электронный дом"',
    activity: 0,
    datetime: '14-03-2025 15-40-15',
    description: '',
  },
  {
    id: 2,
    type: 'За участие в опросе на проекте "Электронный дом"',
    project: 'ИС "Электронный дом"',
    activity: 20,
    datetime: '14-03-2025 15-35-44',
    description: '',
  },
  {
    id: 3,
    type: 'За вход на сайт или в приложение проекта "Электронный дом"',
    project: 'ИС "Электронный дом"',
    activity: 5,
    datetime: '14-03-2025 15-33-36',
    description: '',
  },
  {
    id: 4,
    type: 'За вход на сайт или в приложение проекта "Электронный дом"',
    project: 'ИС "Электронный дом"',
    activity: 5,
    datetime: '10-03-2025 14-21-16',
    description: '',
  },
  {
    id: 5,
    type: 'За регистрацию на проекте "Электронный дом"',
    project: 'ИС "Электронный дом"',
    activity: 100,
    datetime: '11-01-2025 13-51-55',
    description: '',
  },
  {
    id: 6,
    type: 'За вход на сайт "Миллион призов"',
    project: 'Сайт «Миллион призов»',
    activity: 5,
    datetime: '01-09-2024 22-32-15',
    description: '',
  },
  {
    id: 7,
    type: 'За приобретение поощрения из категории Благотворительность',
    project: 'Сайт «Миллион призов»',
    activity: 10,
    datetime: '17-03-2024 20-24-23',
    description: '',
  },
  {
    id: 8,
    type: 'За выполненный заказ на сайте "Миллион Призов"',
    project: 'Сайт «Миллион призов»',
    activity: 50,
    datetime: '17-03-2024 20-24-23',
    description: '',
  },
  {
    id: 9,
    type: 'За применение кода на сайте "Миллион призов"',
    project: 'Сайт «Миллион призов»',
    activity: 10,
    datetime: '17-03-2024 19-44-41',
    description: '',
  },
  {
    id: 10,
    type: 'За вход на сайт "Миллион призов"',
    project: 'Сайт «Миллион призов»',
    activity: 5,
    datetime: '17-03-2024 19-44-40',
    description: '',
  },
  {
    id: 11,
    type: 'Перенос очков рейтинга',
    project: 'ИС "Активный гражданин"',
    activity: 60,
    datetime: '12-02-2024 09-12-10',
    description: '',
  },
  {
    id: 12,
    type: 'За применение кода на сайте "Миллион призов"',
    project: 'Сайт «Миллион призов»',
    activity: 45,
    datetime: '08-02-2024 10-10-02',
    description: '',
  },
];

const filteredRows = computed(() =>
  rows.filter((row) =>
    appliedProjects.value.includes(row.project) && appliedTypes.value.includes(row.type),
  ),
);

const totalTransactions = computed(() => rows.length);
const totalActivity = computed(() => rows.reduce((sum, row) => sum + row.activity, 0));

const columns = [
  { name: 'type', label: 'Тип транзакции', field: 'type', align: 'left' as const },
  { name: 'project', label: 'Проект', field: 'project', align: 'left' as const },
  { name: 'activity', label: 'Активность', field: 'activity', align: 'left' as const },
  { name: 'datetime', label: 'Дата и время', field: 'datetime', align: 'left' as const, sortable: true },
  { name: 'description', label: 'Описание', field: 'description', align: 'left' as const },
];

const pagination = ref({ page: 1, rowsPerPage: 10 });
</script>

<style lang="scss" scoped>
.loyalty-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 20px 20px;
}

.loyalty-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,.08), 0 12px 28px rgba(0,0,0,.05);
  padding: 14px 16px 16px;
}

.loyalty-card--info {
  padding: 12px 16px 14px;
}

.loyalty-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 10px;
}

.info-pills {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.info-pill {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 6px rgba(0,0,0,.06);
  font-size: 12px;
  color: #111827;
}

.info-pill__label {
  color: #6b7280;
  font-weight: 600;
}

.info-pill__value {
  font-weight: 700;
}

.transactions-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 10px;
}

.filters-row {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(260px, 1.4fr) auto;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}

.filters-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
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
  min-width: 320px;
  max-width: 520px;
}

.filters-menu__content {
  padding: 6px 8px;
  max-height: 320px;
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

.apply-btn {
  height: 36px;
  border-radius: 8px;
  text-transform: none;
  font-weight: 600;
  padding: 0 14px;
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

.table-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.transactions-table :deep(th) {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  background: #f9fafb;
}

.transactions-table :deep(td) {
  font-size: 12px;
  color: #374151;
}

.transactions-table :deep(tbody tr:hover) {
  background: #f9fafb;
}

@media (max-width: 1200px) {
  .filters-row {
    grid-template-columns: 1fr;
  }

  .filters-actions {
    justify-content: flex-start;
  }
}
</style>
