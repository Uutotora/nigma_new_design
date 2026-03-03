<template>
  <div class="recosys-layout">
    <div class="recosys-card recosys-card--segments">
      <div class="recosys-card__header">
        <p class="section-title q-mb-none">Сегменты</p>
      </div>
      <q-separator class="q-my-sm" />
      <q-table
        :rows="segments"
        :columns="segmentColumns"
        row-key="id"
        flat dense separator="horizontal"
        :rows-per-page-options="[5,10,25]"
        rows-per-page-label="строк на странице"
        style="box-shadow:none;"
      >
        <template #body-cell-params="props">
          <q-td :props="props">
            <span style="text-decoration:underline;color:blue;cursor:pointer">{{ props.value }}</span>
          </q-td>
        </template>
      </q-table>
    </div>

    <div class="recosys-card recosys-card--tags">
      <div class="recosys-card__header recosys-card__header--between">
        <p class="section-title q-mb-none">Теги</p>
        <q-btn
          flat
          dense
          size="sm"
          icon="mdi-pencil-outline"
          label="Изменить теги"
          class="recosys-edit-btn"
        />
      </div>
      <q-separator class="q-my-sm" />
      <q-table
        :rows="tags"
        :columns="tagColumns"
        row-key="name"
        flat dense separator="horizontal"
        v-model:pagination="tagPagination"
        :rows-per-page-options="[10,25]"
        rows-per-page-label="строк на странице"
        style="box-shadow:none;"
      >
        <template #body-cell-weight="props">
          <q-td :props="props" class="text-primary">
            {{ props.value }}
          </q-td>
        </template>
      </q-table>
    </div>

    <div class="recosys-card recosys-card--sdv">
      <div class="recosys-card__header">
        <p class="section-title q-mb-none">Блок рекомендованных поощрений</p>
      </div>
      <q-tabs
        v-model="sdvTab"
        no-caps
        align="left"
        active-color="blue"
        indicator-color="blue"
        class="sdv-tabs"
        dense
      >
        <q-tab name="rs" label="Ответ от РС" />
        <q-tab name="milp" label="Входящий запрос от МИЛП" />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="sdvTab" animated class="sdv-panels">
        <q-tab-panel name="rs" class="q-pa-none q-pt-sm">
          <div class="sdv-table sdv-table--rs">
            <q-markup-table flat class="sdv-table__inner">
              <thead class="text-left">
                <tr class="sdv-table__row">
                  <th>№</th>
                  <th>ID</th>
                  <th>Название поощрения</th>
                  <th>Изображение поощрения</th>
                  <th>Принудительное<br>поощрение</th>
                  <th>Под бейджем</th>
                  <th>Валюта</th>
                  <th>Ранг</th>
                  <th>Категории</th>
                  <th>Топ категории</th>
                  <th>Теги<br>поощрения</th>
                  <th>Количество<br>тегов</th>
                  <th>Количество<br>совпавших тегов</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="100" class="sdv-table__empty">Нет данных для отображения</td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
        </q-tab-panel>

        <q-tab-panel name="milp" class="q-pa-none q-pt-sm">
          <div class="sdv-table sdv-table--milp">
            <q-markup-table flat class="sdv-table__inner">
              <thead class="text-left">
                <tr class="sdv-table__row">
                  <th>ID</th>
                  <th>Изображение</th>
                  <th>Наименование поощрения</th>
                  <th>Валюта</th>
                  <th>Список доступных бейджей</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="100" class="sdv-table__empty">Нет данных для отображения</td>
                </tr>
              </tbody>
            </q-markup-table>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const sdvTab = ref('rs');
const tagPagination = ref({ page: 1, rowsPerPage: 10 });

const segmentColumns = [
  { name: 'id',       label: 'ID',                  field: 'id',       align: 'left' as const, sortable: true },
  { name: 'name',     label: 'Название',             field: 'name',     align: 'left' as const, sortable: true },
  { name: 'priority', label: 'Приоритет',            field: 'priority', align: 'left' as const, sortable: true },
  { name: 'params',   label: 'Кол-во параметров',   field: 'params',   align: 'left' as const, sortable: true },
];
const segments = [{ id: 5, name: 'Общая группа', priority: 99, params: 0 }];

const tagColumns = [
  { name: 'name', label: 'Наименование', field: 'name', align: 'left' as const, sortable: true },
  { name: 'weight', label: 'Сумма весов', field: 'weight', align: 'left' as const, sortable: true },
];
const tags = [
  { name: 'сувениры', weight: 1 },
  { name: 'магазины', weight: 2 },
  { name: 'Продукты', weight: 2 },
  { name: 'впрок', weight: 1 },
  { name: 'ВВ24-Март', weight: 0 },
  { name: 'магазин', weight: 1 },
  { name: 'продукты', weight: 1 },
  { name: 'Магазины', weight: 1 },
  { name: 'Пятёрочка', weight: 3 },
  { name: 'Недвижимость', weight: 1 },
];
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

.recosys-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  grid-template-areas:
    "segments tags"
    "sdv sdv";
  grid-auto-rows: min-content;
  gap: 14px;
  padding: 0 20px 20px;
  min-height: calc(100vh - 50px - 18px * 2 - 120px);
}

.recosys-card {
  background: #ffffff;
  border: 1px solid #f2f2f2;
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,.08), 0 12px 28px rgba(0,0,0,.05);
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.recosys-card--segments {
  grid-area: segments;
  padding: 10px 12px;
}

.recosys-card--tags {
  grid-area: tags;
}

.recosys-card--sdv {
  grid-area: sdv;
  min-height: 360px;
}

.recosys-card__header {
  display: flex;
  align-items: center;
}

.recosys-card__header--between {
  justify-content: space-between;
  gap: 10px;
}

.recosys-edit-btn {
  color: #475569;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 0 10px;
  text-transform: none;
  font-weight: 600;
}

.recosys-edit-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #1e293b;
}

.sdv-tabs {
  padding: 0 6px;
  background: transparent;
}

.sdv-panels { background: transparent !important; }
.sdv-panels {
  flex: 1 1 auto;
  min-height: 0;
}

.sdv-panels :deep(.q-tab-panel) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.sdv-table {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
}

.sdv-table__inner {
  width: 100%;
  min-width: 900px;
  margin: 0;
  overflow: visible;
  flex: 1 1 auto;
}

.sdv-table__row th {
  font-size: 12px;
  font-weight: 600;
  color: #1a1a1a;
  white-space: nowrap;
}

.sdv-table__empty {
  text-align: center;
  font-weight: 600;
  padding: 28px 8px;
  vertical-align: middle;
  color: #444;
}

@media (max-width: 1200px) {
  .recosys-layout {
    grid-template-columns: 1fr;
    grid-template-areas:
      "segments"
      "tags"
      "sdv";
    min-height: unset;
  }
}
</style>
