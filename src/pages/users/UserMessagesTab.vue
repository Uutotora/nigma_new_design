<template>
  <div class="messages-layout">
    <div class="messages-card">
      <div class="messages-filters">
        <q-input
          v-model="searchQuery"
          dense
          filled
          placeholder="Поиск по сообщению"
          class="search-input"
          @keyup.enter="applyFilters"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

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

        <q-btn
          color="primary"
          label="Применить"
          class="apply-btn"
          @click="applyFilters"
        />
      </div>

      <q-separator />

      <div class="messages-table">
        <q-table
          :rows="filteredRows"
          :columns="columns"
          row-key="id"
          flat
          dense
          separator="horizontal"
          :rows-per-page-options="[10, 25, 50]"
          v-model:pagination="pagination"
          rows-per-page-label="строк на странице"
          class="messages-table__inner"
          no-data-label="Нет данных"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

type MessageRow = {
  id: number;
  text: string;
  date: string;
  project: string;
  description: string;
};

const projectOptions = [
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

const PROJECT_ROOT_ID = 'messages_projects';
const projectLeafIds = projectOptions.map((_, index) => `messages_project_${index}`);
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
const tickedProjects = ref<string[]>([PROJECT_ROOT_ID, ...projectLeafIds]);
const expandedProjects = ref<string[]>([PROJECT_ROOT_ID]);
const projectLeafCount = computed(
  () => tickedProjects.value.filter((id) => id !== PROJECT_ROOT_ID).length,
);
const projectLabelById: Record<string, string> = Object.fromEntries(
  projectLeafIds.map((id, index) => [id, projectOptions[index]]),
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

const projectsDisplay = computed(() => {
  const count = projectLeafCount.value;
  if (count === 0) return 'Выберите проекты';
  if (count === projectLeafIds.length) return 'Все проекты';
  return `Выбрано: ${count}`;
});

const normalizeProjects = (ids: string[]) =>
  ids.includes(PROJECT_ROOT_ID)
    ? [...projectOptions]
    : projectLeafIds
      .filter((id) => ids.includes(id))
      .map((id) => projectLabelById[id])
      .filter(Boolean);

const searchQuery = ref('');
const appliedSearch = ref('');
const appliedProjects = ref<string[]>([...projectOptions]);

const rows: MessageRow[] = [];

const applyFilters = () => {
  appliedSearch.value = searchQuery.value.trim();
  appliedProjects.value = normalizeProjects(tickedProjects.value);
};

const filteredRows = computed(() => {
  const q = appliedSearch.value.toLowerCase();
  return rows.filter((row) => {
    if (appliedProjects.value.length === 0) return false;
    if (!appliedProjects.value.includes(row.project)) return false;
    if (!q) return true;
    return (
      row.text.toLowerCase().includes(q) ||
      row.description.toLowerCase().includes(q) ||
      row.project.toLowerCase().includes(q)
    );
  });
});

const columns = [
  { name: 'text', label: 'Текст ответа', field: 'text', align: 'left' as const },
  { name: 'date', label: 'Дата ответа', field: 'date', align: 'left' as const },
  { name: 'project', label: 'Проект', field: 'project', align: 'left' as const },
  { name: 'description', label: 'Описание', field: 'description', align: 'left' as const },
];

const pagination = ref({ page: 1, rowsPerPage: 10 });
</script>

<style lang="scss" scoped>
.messages-layout {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 12px 20px 20px;
}

.messages-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,.08), 0 12px 28px rgba(0,0,0,.05);
  overflow: hidden;
}

.messages-filters {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  flex-wrap: wrap;
}

.search-input {
  flex: 1 1 360px;
  max-width: 520px;
}

.search-input :deep(.q-field__control) {
  border-radius: 10px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

.search-input :deep(.q-field__control):before {
  border: none;
}

.filter-dropdown {
  min-width: 220px;
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
  max-width: 360px;
}

.filters-menu__content {
  padding: 6px 8px;
  max-height: 280px;
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
  height: 40px;
  border-radius: 10px;
  text-transform: none;
  font-weight: 600;
}

.messages-table {
  padding: 10px 14px 14px;
}

.messages-table__inner :deep(th) {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  background: #f9fafb;
}

.messages-table__inner :deep(td) {
  font-size: 12px;
  color: #374151;
}

.messages-table__inner :deep(tbody tr:hover) {
  background: #f9fafb;
}

.messages-table__inner :deep(.q-tr--no-data td) {
  font-size: 22px;
  font-weight: 600;
  color: #111827;
  text-align: center;
  height: 260px;
}

@media (max-width: 900px) {
  .messages-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input,
  .filter-dropdown {
    max-width: 100%;
  }

  .apply-btn {
    width: 100%;
  }
}
</style>
