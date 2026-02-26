<template>
  <q-page class="users-page">
    <div class="content-wrapper">

      <!-- Breadcrumb -->
      <div class="breadcrumb-row q-mb-sm">
        <router-link class="breadcrumb-link text-blue-6" to="/users">
          <q-icon name="mdi-account-multiple" size="18px" class="q-mr-xs" />Пользователи
        </router-link>
        <q-icon name="chevron_right" class="text-grey-5" style="font-size:1.5em;" />
        <span class="text-grey-6" style="font-size:14px;">Пользователь</span>
      </div>

      <!-- Layout -->
      <div class="profile-layout">

        <!-- LEFT NAV -->
        <div class="nav-panel">
          <div class="text-center q-mb-xs">
            <q-icon name="account_circle" size="64px" color="grey-8" />
          </div>
          <div class="text-center nav-panel__id q-mb-xs">
            {{ currentSsoId }}
          </div>
          <q-separator style="margin: 8px 0" />
          <q-tabs
            v-model="activeSection"
            vertical no-caps align="justify"
            active-color="blue"
            indicator-color="transparent"
            class="user-tabs"
          >
            <q-tab
              v-for="item in mainSections"
              :key="item.name"
              :name="item.name"
              :label="item.label"
            />
          </q-tabs>

          <div
            ref="toggleRef"
            class="nav-extra-toggle"
            :class="{ 'nav-extra-toggle--active': showExtra || isExtraActive }"
            @click="toggleExtra"
          >
            <div class="nav-extra-toggle__label">{{ showExtra ? 'Скрыть' : 'Ещё' }}</div>
            <q-icon class="nav-extra-toggle__icon" :name="showExtra ? 'mdi-chevron-up' : 'mdi-chevron-down'" size="16px" />
          </div>
        </div>

        <teleport to="body">
          <transition name="extra-fade">
            <div v-if="showExtra" class="profile-extra-overlay" :style="overlayStyle" @click="showExtra = false" />
          </transition>

          <transition name="extra-slide">
            <div v-if="showExtra" class="profile-extra-panel" :style="panelStyle">
              <div
                v-for="item in extraSections"
                :key="item.name"
                class="profile-extra-tab"
                :class="{ 'profile-extra-tab--active': activeSection === item.name }"
                @click="setActiveExtra(item.name)"
              >
                {{ item.label }}
              </div>
            </div>
          </transition>
        </teleport>

        <!-- MAIN WHITE BLOCK -->
        <div class="main-block">
          <q-tab-panels v-model="activeSection" animated class="tp">

            <!-- ═══════════════════════════════
                 TAB: ПРОФИЛЬ
            ═══════════════════════════════ -->
            <q-tab-panel name="profile" class="q-pa-none">

              <!-- Переключатель проектов -->
              <div class="profile-switcher">
                <q-btn
                  flat
                  no-caps
                  class="profile-btn"
                  :class="{ 'profile-btn--summary': true, 'profile-btn--active': activePlatform === 'summary' }"
                  :style="summaryButtonStyle"
                  @click="activePlatform = 'summary'"
                >
                  <div class="profile-btn__content">
                    <div class="profile-btn__icon profile-btn__icon--summary">
                      <q-icon name="mdi-account-box-outline" size="24px" />
                    </div>
                    <div class="profile-btn__meta">
                      <span class="profile-btn__name profile-btn__name--summary">
                        <span>Сводный</span>
                        <span>профиль</span>
                      </span>
                    </div>
                  </div>
                </q-btn>

                <q-btn
                  v-for="p in platforms"
                  :key="p.id"
                  flat
                  no-caps
                  class="profile-btn"
                  :class="{ 'profile-btn--project': true, 'profile-btn--active': activePlatform === p.id }"
                  :style="projectButtonStyle"
                  @click="activePlatform = p.id"
                >
                  <div class="profile-btn__content">
                    <div class="profile-btn__icon">
                      <img v-if="p.icon" :src="p.icon" :alt="p.name" class="platform-icon platform-icon--sm" />
                      <q-icon v-else :name="p.mdiIcon" :color="p.color" size="18px" />
                    </div>
                    <div class="profile-btn__meta">
                      <span class="profile-btn__name">{{ p.name }}</span>
                      <span v-if="p.regDate !== '—'" class="profile-btn__date">с {{ p.regDate }}</span>
                      <span v-else class="profile-btn__date profile-btn__date--empty">нет данных</span>
                    </div>
                  </div>
                </q-btn>
              </div>

              <q-separator />

              <div class="summary-layout">

                <!-- Левый: поля профиля -->
                <div class="s-left summary-card">
                  <p class="section-title section-title--with-icon">
                    <span class="section-title__icon">
                      <img
                        v-if="activeProfileMeta.iconType === 'img'"
                        :src="activeProfileMeta.iconSrc"
                        :alt="activeProfileMeta.title"
                      />
                      <q-icon
                        v-else
                        :name="activeProfileMeta.iconName"
                        :color="activeProfileMeta.iconColor"
                        size="18px"
                      />
                    </span>
                    <span>{{ activeProfileMeta.title }}</span>
                  </p>
                  <div class="fields-grid">
                    <div v-for="f in profileFields" :key="f.label" class="field-cell">
                      <span class="field-cell__label">{{ f.label }}</span>
                      <span class="field-cell__value">{{ f.value }}</span>
                    </div>
                  </div>
                </div>

                <!-- Правый: баллы + группы -->
                <div class="s-right">
                  <div v-if="activePlatform !== 'pdp'" class="summary-card">
                    <p class="section-title">Баллы</p>
                    <div class="points-block">
                      <div
                        class="points-matrix__grid"
                        :style="{
                          gridTemplateColumns: `72px repeat(${pointColumns.length}, minmax(66px, 1fr))`,
                        }"
                      >
                        <div class="points-matrix__corner" />
                        <div
                          v-for="col in pointColumns"
                          :key="`head-${col.key}`"
                          class="points-matrix__col"
                          :class="col.headerClass"
                        >
                          {{ col.label }}
                        </div>
                        <template v-for="row in pointRows" :key="row.key">
                          <div class="points-matrix__row-label">{{ row.label }}</div>
                          <div
                            v-for="col in pointColumns"
                            :key="`${row.key}-${col.key}`"
                            class="points-matrix__cell"
                          >
                            <div class="points-chip" :class="col.class">
                              <span class="points-chip__value">
                                {{ formatPoints(currentPointsMatrix[row.key][col.key]) }}
                              </span>
                            </div>
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>

                  <div v-if="isSummary" class="summary-card">
                    <p class="section-title">Общая информация</p>
                    <div class="info-cols">
                      <div class="info-groups">
                        <div v-for="g in groups" :key="g.label" class="gentry">
                          <span class="gentry__label">{{ g.label }}</span>
                          <span class="gbadge text-white" :class="g.bgClass">{{ g.value }}</span>
                        </div>
                      </div>
                      <div class="info-stats">
                        <div>
                          <span class="stat-label">Всего активностей</span>
                          <span class="stat-big">1 412</span>
                        </div>
                        <div class="q-mt-sm">
                          <span class="stat-label">Последняя активность</span>
                          <span class="stat-activity">Активный гражданин<br>2026-02-17 10:44</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </q-tab-panel>

            <!-- ═══════════════════════════════
                 TAB: РЕКОМЕНДАТЕЛЬНАЯ СИСТЕМА
            ═══════════════════════════════ -->
            <q-tab-panel name="recosys" class="q-pa-none q-pt-sm">
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
            </q-tab-panel>

            <!-- ДРУГИЕ РАЗДЕЛЫ -->
            <q-tab-panel
              v-for="tab in ['activity','loyalty','points','messages','metrics']"
              :key="tab" :name="tab"
            >
              <p class="text-grey-6">Раздел в разработке</p>
            </q-tab-panel>

          </q-tab-panels>
        </div>

      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const iconActiveg = new URL('../css/activeg.74063d19.svg', import.meta.url).href;
const iconOur = new URL('../css/our.e8350a8e.svg', import.meta.url).href;
const iconHome = new URL('../css/home.55681fec.svg', import.meta.url).href;
const iconTask = new URL('../css/task.35b75734.svg', import.meta.url).href;
const iconPrize = new URL('../css/prize.fa0e6560.svg', import.meta.url).href;
const iconCityIdeas = new URL('../css/cityideas.svg', import.meta.url).href;

const activeSection  = ref('profile');
const activePlatform = ref('summary');
const sdvTab = ref('rs');
const tagPagination = ref({ page: 1, rowsPerPage: 10 });
const route = useRoute();
const currentSsoId = computed(() => (route.params.ssoId as string) || '—');

const summaryColor = '#027be3';
const projectColor = '#26a69a';

const mainSections = [
  { name: 'profile', label: 'Данные пользователя' },
  { name: 'activity', label: 'Активность' },
  { name: 'points', label: 'Баллы' },
  { name: 'messages', label: 'Сообщения пользователя' },
];

const extraSections = [
  { name: 'loyalty', label: 'Программа лояльности' },
  { name: 'metrics', label: 'Метрики пользователя' },
  { name: 'recosys', label: 'Рекомендательная система' },
];

const showExtra = ref(false);
const toggleRef = ref<HTMLElement | null>(null);
const isExtraActive = computed(() =>
  extraSections.some((item) => item.name === activeSection.value),
);

const panelStyle = computed(() => {
  if (!toggleRef.value) return {};
  const rect = toggleRef.value.getBoundingClientRect();
  const top = rect.bottom + 6;
  return {
    top: `${top}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
  };
});

const overlayStyle = computed(() => {
  if (!toggleRef.value) return {};
  const rect = toggleRef.value.getBoundingClientRect();
  return { left: `${rect.right}px` };
});

const toggleExtra = () => {
  showExtra.value = !showExtra.value;
};

const setActiveExtra = (name: string) => {
  activeSection.value = name;
  showExtra.value = false;
};

watch(activeSection, () => {
  showExtra.value = false;
});

const hexToRgb = (hex: string): string => {
  const cleaned = hex.replace('#', '').trim();
  if (![3, 6].includes(cleaned.length)) return '2, 123, 227';
  const full = cleaned.length === 3
    ? cleaned.split('').map((c) => c + c).join('')
    : cleaned;
  const num = Number.parseInt(full, 16);
  if (Number.isNaN(num)) return '2, 123, 227';
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `${r}, ${g}, ${b}`;
};

const buttonStyle = (color: string) => ({
  '--btn-color': color,
  '--btn-color-rgb': hexToRgb(color),
});

const summaryButtonStyle = buttonStyle(summaryColor);
const projectButtonStyle = buttonStyle(projectColor);

type ProfileField = { label: string; value: string };

/* ─── Поля сводного профиля ─── */
const baseProfileFields: ProfileField[] = [
  { label: 'Тип учетной записи',       value: 'Полная' },
  { label: 'Пол',                       value: 'Женский' },
  { label: 'Дата рождения',             value: '26.02.1977' },
  { label: 'Открыт ли профиль',         value: 'Нет' },
  { label: 'Количество детей',          value: 'Не указано' },
  { label: 'Семейное положение',        value: 'Не указано' },
  { label: 'Адрес регистрации',         value: 'проезд Каширский 9306' },
  { label: 'Адрес проживания',          value: 'Каширский проезд дом 9, корпус 2306' },
  { label: 'Адрес работы',             value: 'Не указано' },
  { label: 'Адрес собственности',      value: 'Проезд Каширский Дом 9 Корпус 2' },
  { label: 'Род деятельности',         value: 'Не указано' },
  { label: 'ФИО',                      value: 'Не указано' },
  { label: 'СНИЛС',                    value: 'Не указано' },
  { label: 'Признак "является ребёнком"', value: 'Нет' },
];

const applyProfileOverrides = (overrides: Record<string, string>): ProfileField[] =>
  baseProfileFields.map((field) => ({
    ...field,
    value: overrides[field.label] ?? field.value,
  }));

const MISSING_VALUE = 'Не указано';

const profileFieldsByPlatform: Record<string, ProfileField[]> = {
  summary: baseProfileFields,
  activeg: applyProfileOverrides({}),
  cityideas: applyProfileOverrides({}),
  nashgorod: applyProfileOverrides({}),
  eldom: applyProfileOverrides({
    'Пол': MISSING_VALUE,
    'Дата рождения': MISSING_VALUE,
    'Адрес регистрации': MISSING_VALUE,
    'Адрес проживания': MISSING_VALUE,
    'Адрес собственности': MISSING_VALUE,
  }),
  gorod: applyProfileOverrides({}),
  million: applyProfileOverrides({}),
  pdp: applyProfileOverrides({
    'Тип учетной записи': MISSING_VALUE,
    'Пол': MISSING_VALUE,
    'Дата рождения': MISSING_VALUE,
    'Открыт ли профиль': MISSING_VALUE,
    'Количество детей': MISSING_VALUE,
    'Семейное положение': MISSING_VALUE,
    'Адрес регистрации': MISSING_VALUE,
    'Адрес проживания': MISSING_VALUE,
    'Адрес работы': MISSING_VALUE,
    'Адрес собственности': MISSING_VALUE,
    'Род деятельности': MISSING_VALUE,
    'ФИО': MISSING_VALUE,
    'СНИЛС': MISSING_VALUE,
    'Признак "является ребёнком"': MISSING_VALUE,
  }),
};

const profileFields = computed(() =>
  profileFieldsByPlatform[activePlatform.value] ?? baseProfileFields,
);

const isSummary = computed(() => activePlatform.value === 'summary');

/* ─── Баллы ─── */
type PointsRowKey = 'earned' | 'spent' | 'balance';
type PointsColKey = 'city' | 'prize' | 'mosbilet';

type PointsMatrix = Record<PointsRowKey, Record<PointsColKey, number>>;

const SUMMARY_POINTS: PointsMatrix = {
  earned: { city: 1720, prize: 3000, mosbilet: 200 },
  spent: { city: 500, prize: 3000, mosbilet: 200 },
  balance: { city: 1220, prize: 0, mosbilet: 0 },
};

const ACTIVEG_POINTS: PointsMatrix = {
  earned: { city: 1720, prize: 0, mosbilet: 0 },
  spent: { city: 500, prize: 0, mosbilet: 0 },
  balance: { city: 1220, prize: 0, mosbilet: 0 },
};

const MILLION_POINTS: PointsMatrix = {
  earned: { city: 1720, prize: 3000, mosbilet: 0 },
  spent: { city: 500, prize: 3000, mosbilet: 0 },
  balance: { city: 0, prize: 0, mosbilet: 0 },
};

const ZERO_POINTS: PointsMatrix = {
  earned: { city: 0, prize: 0, mosbilet: 0 },
  spent: { city: 0, prize: 0, mosbilet: 0 },
  balance: { city: 0, prize: 0, mosbilet: 0 },
};

const currentPointsMatrix = computed<PointsMatrix>(() => {
  if (isSummary.value) return SUMMARY_POINTS;
  if (activePlatform.value === 'activeg') return ACTIVEG_POINTS;
  if (activePlatform.value === 'million') return MILLION_POINTS;
  return ZERO_POINTS;
});

const pointRows = computed(() => {
  const rows: { key: PointsRowKey; label: string }[] = [
    { key: 'earned', label: 'Начислено' },
    { key: 'spent', label: 'Списано' },
    { key: 'balance', label: 'Остаток' },
  ];
  if (activePlatform.value !== 'summary') {
    if (activePlatform.value === 'pdp') {
      return rows;
    }
    if (activePlatform.value === 'million') {
      return rows.filter((row) => row.key === 'earned');
    }
    return rows.filter((row) => row.key === 'earned');
  }
  return rows;
});

const pointColumns = computed(() => {
  const columns: {
    key: PointsColKey;
    class: string;
    tooltip: string;
    label: string;
    headerClass: string;
  }[] = [
    {
      key: 'city',
      label: 'Городские',
      class: 'points-chip--city',
      headerClass: 'points-matrix__col--city',
      tooltip: 'Городские баллы',
    },
    {
      key: 'prize',
      label: 'Призовые',
      class: 'points-chip--prize',
      headerClass: 'points-matrix__col--prize',
      tooltip: 'Призовые баллы',
    },
    {
      key: 'mosbilet',
      label: 'Мосбилет',
      class: 'points-chip--mosbilet',
      headerClass: 'points-matrix__col--mosbilet',
      tooltip: 'Мосбилет',
    },
  ];

  if (activePlatform.value === 'summary') return columns;
  if (activePlatform.value === 'million') {
    return columns.filter((col) => col.key !== 'mosbilet');
  }
  if (activePlatform.value === 'pdp') {
    return columns;
  }
  return columns.filter((col) => col.key === 'city');
});

const formatPoints = (value: number) => value.toLocaleString('ru-RU');

/* ─── Группы ─── */
const groups = [
  { label: 'Группа активности',        value: 'Высокая',  bgClass: 'bg-positive' },
  { label: 'Группа лояльности',        value: 'Умеренная', bgClass: 'bg-cyan-group' },
  { label: 'Группа полезности',        value: 'Высокая',  bgClass: 'bg-positive' },
  { label: 'Группа заинтересованности',value: 'Низкая',   bgClass: 'bg-unloyal' },
];

interface Platform {
  id: string; name: string;
  color: string; mdiIcon: string;
  icon?: string;
  regDate: string;
}

const platforms: Platform[] = [
  {
    id: 'activeg', name: 'Активный гражданин',
    color: '#01716D', mdiIcon: 'mdi-star', icon: iconActiveg,
    regDate: '24.06.2021',
  },
  {
    id: 'million', name: 'Миллион призов',
    color: '#283593', mdiIcon: 'mdi-gift-outline', icon: iconPrize,
    regDate: '18.09.2021',
  },
  {
    id: 'gorod', name: 'Город заданий',
    color: '#F57F17', mdiIcon: 'mdi-clipboard-list', icon: iconTask,
    regDate: '21.12.2022',
  },
  {
    id: 'cityideas', name: 'Город идей',
    color: '#00897B', mdiIcon: 'mdi-lightbulb-on-outline', icon: iconCityIdeas,
    regDate: '—',
  },
  {
    id: 'eldom', name: 'Электронный дом',
    color: '#E65100', mdiIcon: 'mdi-home-city', icon: iconHome,
    regDate: '29.07.2021',
  },
  {
    id: 'nashgorod', name: 'Наш город',
    color: '#2E7D32', mdiIcon: 'mdi-city-variant', icon: iconOur,
    regDate: '15.02.2021',
  },
  {
    id: 'pdp', name: 'ПДП',
    color: '#546E7A', mdiIcon: 'mdi-file-document',
    regDate: '—',
  },
];

const activeProfileMeta = computed(() => {
  if (activePlatform.value === 'summary') {
    return {
      title: 'Сводный профиль',
      iconType: 'mdi' as const,
      iconName: 'mdi-account-box-outline',
      iconColor: summaryColor,
    };
  }
  const platform = platforms.find((p) => p.id === activePlatform.value);
  if (!platform) {
    return {
      title: 'Сводный профиль',
      iconType: 'mdi' as const,
      iconName: 'mdi-account-box-outline',
      iconColor: summaryColor,
    };
  }
  if (platform.icon) {
    return {
      title: platform.name,
      iconType: 'img' as const,
      iconSrc: platform.icon,
    };
  }
  return {
    title: platform.name,
    iconType: 'mdi' as const,
    iconName: platform.mdiIcon,
    iconColor: platform.color,
  };
});

/* ─── Сегменты ─── */
const segmentColumns = [
  { name: 'id',       label: 'ID',                  field: 'id',       align: 'left' as const, sortable: true },
  { name: 'name',     label: 'Название',             field: 'name',     align: 'left' as const, sortable: true },
  { name: 'priority', label: 'Приоритет',            field: 'priority', align: 'left' as const, sortable: true },
  { name: 'params',   label: 'Кол-во параметров',   field: 'params',   align: 'left' as const, sortable: true },
];
const segments = [{ id: 5, name: 'Общая группа', priority: 99, params: 0 }];

/* ─── Теги ─── */
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

/* ════════════════════════════
   PAGE
════════════════════════════ */
.users-page { background-color: #027be3; padding: 0; }

.content-wrapper {
  background-color: #e0e0e0;
  border-top-left-radius: 16px;
  min-height: calc(100vh - 50px);
  padding: 18px 22px;
}

/* ════════════════════════════
   BREADCRUMB
════════════════════════════ */
.breadcrumb-row { display: flex; align-items: center; gap: 4px; }
.breadcrumb-link {
  display: inline-flex; align-items: center;
  font-size: 14px; text-decoration: none; font-weight: 500;
  &:hover { text-decoration: underline; }
}

/* ════════════════════════════
   LAYOUT
════════════════════════════ */
.profile-layout { display: flex; gap: 14px; align-items: flex-start; }

/* ════════════════════════════
   LEFT NAV
════════════════════════════ */
.nav-panel {
  width: 210px; flex-shrink: 0;
  background: #fff; border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,.08), 0 12px 28px rgba(0,0,0,.05);
  padding: 14px 8px;
}
.nav-panel__id {
  font-size: 9px; color: #1a1a1a;
  word-break: break-all; padding: 0 6px; line-height: 1.4;
}

.user-tabs :deep(.q-tab) {
  font-size: 12px;
  min-height: 30px;
  justify-content: flex-start;
}

.nav-extra-toggle {
  margin-top: 6px;
  padding: 6px 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: #1a1a1a;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.nav-extra-toggle:hover {
  background: rgba(2, 123, 227, 0.08);
}

.nav-extra-toggle--active {
  background: rgba(2, 123, 227, 0.12);
  color: #027be3;
  font-weight: 600;
}

.nav-extra-toggle__label {
  font-size: 12px;
}

.profile-extra-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1900;
}

.profile-extra-panel {
  position: fixed;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 6px;
  z-index: 2000;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 70vh;
  overflow-y: auto;
}

.profile-extra-tab {
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  color: #1a1a1a;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.profile-extra-tab:hover {
  background: rgba(2, 123, 227, 0.08);
}

.profile-extra-tab--active {
  background: rgba(2, 123, 227, 0.12);
  color: #027be3;
  font-weight: 600;
}

.extra-fade-enter-active,
.extra-fade-leave-active {
  transition: opacity 0.2s ease;
}

.extra-fade-enter-from,
.extra-fade-leave-to {
  opacity: 0;
}

.extra-slide-enter-active,
.extra-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.extra-slide-enter-from,
.extra-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ════════════════════════════
   MAIN BLOCK
════════════════════════════ */
.main-block {
  flex: 1; min-width: 0;
  background: #fff; border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,.08), 0 12px 28px rgba(0,0,0,.05);
  padding: 0;
  overflow: hidden;
}
.tp { background: transparent !important; }

/* ════════════════════════════
   PROFILE SWITCHER (buttons)
════════════════════════════ */
.profile-switcher {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  padding: 12px 20px;
  background: #fff;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(2, 123, 227, 0.35) transparent;
}

.profile-switcher::-webkit-scrollbar {
  height: 6px;
}

.profile-switcher::-webkit-scrollbar-track {
  background: transparent;
}

.profile-switcher::-webkit-scrollbar-thumb {
  background: rgba(2, 123, 227, 0.35);
  border-radius: 999px;
}

.profile-btn {
  border: 1px solid transparent;
  border-radius: 10px;
  background: rgba(var(--btn-color-rgb, 2, 123, 227), 0.08);
  min-height: 48px;
  padding: 6px 10px;
  flex: 0 0 auto;
}

.profile-btn:hover {
  background: rgba(var(--btn-color-rgb, 2, 123, 227), 0.16);
}

.profile-btn--active {
  background: rgba(var(--btn-color-rgb, 2, 123, 227), 0.16);
}

.profile-btn :deep(.q-btn__content) {
  align-items: center;
}

.profile-btn__content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-btn__icon {
  width: 28px; height: 28px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  background: transparent;
  border: none;
}

.profile-btn__icon--summary {
  background: rgba(var(--btn-color-rgb, 2, 123, 227), 0.12);
  border: 1px solid rgba(var(--btn-color-rgb, 2, 123, 227), 0.35);
}

.profile-btn__meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-width: 0;
}

.profile-btn__name {
  font-size: 12px;
  font-weight: 600;
  line-height: 1.1;
  white-space: nowrap;
  color: #111827;
}

.profile-btn__name--summary {
  white-space: normal;
}

.profile-btn__name--summary span {
  display: block;
}

.profile-btn__date {
  font-size: 11px;
  color: #64748b;
  line-height: 1.1;
  white-space: nowrap;
}

.profile-btn__date--empty {
  opacity: 0.7;
}

.profile-btn--summary.profile-btn--active {
  background: var(--btn-color, #2563eb);
  border-color: rgba(2, 123, 227, 0.7);
}

.profile-btn--summary.profile-btn--active .profile-btn__name,
.profile-btn--summary.profile-btn--active .profile-btn__date {
  color: #ffffff;
}

.profile-btn--summary.profile-btn--active :deep(.q-icon) {
  color: #ffffff !important;
}

.profile-btn--summary.profile-btn--active .profile-btn__icon--summary {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.4);
}

.profile-btn--project.profile-btn--active {
  border-color: rgba(38, 166, 154, 0.7);
  box-shadow: inset 0 0 0 1px rgba(38, 166, 154, 0.15);
}


.platform-icon {
  width: 26px;
  height: 26px;
  display: block;
  object-fit: contain;
}
.platform-icon--sm {
  width: 24px;
  height: 24px;
}
.platform-icon--lg {
  width: 56px;
  height: 56px;
}

/* ════════════════════════════
   SUMMARY LAYOUT (Сводный профиль)
════════════════════════════ */
.summary-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 16px 20px;
  align-items: start;
  padding: 16px 20px 20px;
}

.s-left {
  min-width: 0;
  align-self: stretch;
  display: flex;
  flex-direction: column;
}
.s-right { display: flex; flex-direction: column; gap: 12px; }

.summary-card {
  background: #ffffff;
  border: 1px solid #f2f2f2;
  border-radius: 12px;
  padding: 12px 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,.08), 0 12px 28px rgba(0,0,0,.05);
}

/* ════════════════════════════
   SECTION TITLE (черный)
════════════════════════════ */
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  text-transform: none;
  letter-spacing: 0.2px;
  margin: 0 0 12px;
}

.section-title--with-icon {
  display: flex;
  align-items: center;
  gap: 6px;
}

.section-title__icon {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.section-title__icon img {
  width: 18px;
  height: 18px;
  object-fit: contain;
  display: block;
}

/* ════════════════════════════
   FIELDS GRID
════════════════════════════ */
.fields-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 2px 16px;
}

.field-cell {
  display: flex; flex-direction: column; gap: 1px;
  padding: 6px 0;
  border-bottom: 1px solid #f3f3f3;
}
.field-cell__label {
  font-size: 11px; color: #9e9e9e; line-height: 1.2;
}
.field-cell__value {
  font-size: 13px; font-weight: 700; color: #1a1a1a; line-height: 1.3;
}

/* ════════════════════════════
   POINTS
════════════════════════════ */
.points-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.points-matrix__grid {
  display: grid;
  gap: 4px 6px;
  align-items: center;
  padding: 8px 10px;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #f0f2f6;
}

.points-matrix__corner {
  height: 18px;
}

.points-matrix__col {
  font-size: 11px;
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  text-align: center;
  color: #475569;
  white-space: nowrap;
  line-height: 1.2;
}

.points-matrix__row-label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.points-matrix__cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.points-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 22px;
  padding: 0 2px;
  border-radius: 0;
  font-size: 14px;
  font-weight: 600;
  cursor: help;
  border: none;
  background: transparent;
  font-variant-numeric: tabular-nums;
}

.points-chip__value {
  line-height: 1;
}

.points-chip--city {
  color: #00796b;
}

.points-chip--prize {
  color: #d32f2f;
}

.points-chip--mosbilet {
  color: #8b1d49;
}

/* ════════════════════════════
   INFO COLS (Общая информация)
════════════════════════════ */
.info-cols {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 12px;
}
.info-groups { display: flex; flex-direction: column; gap: 6px; }
.info-stats { display: flex; flex-direction: column; gap: 0; }

.gentry { display: flex; flex-direction: column; gap: 2px; }
.gentry__label { font-size: 11px; color: #9e9e9e; }

.gbadge {
  display: inline-flex; align-items: center;
  padding: 3px 10px; border-radius: 50px;
  font-size: 11px; font-weight: 600; width: fit-content;
}
.bg-unloyal    { background-color: #c10015; }
.bg-cyan-group { background-color: #26a69a; }

.stat-label { display: block; font-size: 11px; color: #9e9e9e; margin-bottom: 2px; }
.stat-big   { display: block; font-size: 22px; font-weight: 800; color: #1a1a1a; }
.stat-activity { display: block; font-size: 12px; font-weight: 600; color: #1a1a1a; line-height: 1.4; }

/* ════════════════════════════
   PLATFORM TAB CONTENT
════════════════════════════ */
.platform-content {
  display: flex; gap: 16px;
  align-items: flex-start;
  padding: 0 20px 20px;
}

.pf-main { flex: 1; min-width: 0; }
.pf-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 10px 12px;
  margin-bottom: 8px;
}
.pf-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 12px;
  background: #fafafa;
  border: 1px solid #ececec;
  border-radius: 10px;
  min-height: 56px;
}

.pf-logo {
  width: 150px; flex-shrink: 0;
  border: 1px solid #ececec;
  border-radius: 12px;
  padding: 16px 12px;
  display: flex; flex-direction: column;
  align-items: center; gap: 10px;
  text-align: center;
}
.pf-logo__circle {
  width: 64px; height: 64px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: transparent;
  border: none;
}
.pf-logo__text {
  font-size: 13px; color: #444; margin: 0; line-height: 1.4;
  strong { color: #1a1a1a; }
}

/* ════════════════════════════
   RECOMMENDER SYSTEM
════════════════════════════ */
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

.sdv-table--rs { }
.sdv-table--milp { }

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
  .summary-layout {
    grid-template-columns: 1fr;
    grid-template-areas:
      "left"
      "right"
      "bottom";
  }
  .recosys-layout {
    grid-template-columns: 1fr;
    grid-template-areas:
      "segments"
      "tags"
      "sdv";
    min-height: unset;
  }
}

@media (max-width: 900px) {
  .platform-content { flex-direction: column; }
  .pf-logo {
    width: 100%;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    text-align: left;
  }
}
</style>
