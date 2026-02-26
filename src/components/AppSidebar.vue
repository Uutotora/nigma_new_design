<template>
  <q-drawer
    :model-value="true"
    side="left"
    :width="120"
    :breakpoint="0"
    class="bg-primary sidebar"
  >
    <div class="sidebar-nav">
      <div
        v-for="(item, index) in mainItems"
        :key="item.label"
        class="sidebar-tab"
        :class="{ 'sidebar-tab--active': activeIndex === index }"
        @click="setActive(index)"
      >
        <q-icon :name="item.icon" size="30px" color="white" />
        <div class="sidebar-tab__label">{{ item.label }}</div>
      </div>

      <!-- Кнопка "Ещё" — получаем её позицию через ref -->
      <div
        ref="toggleRef"
        class="sidebar-tab"
        :class="{ 'sidebar-tab--active': showExtra, 'sidebar-tab--extra': true }"
        @click="toggleExtra"
      >
        <q-icon
          class="sidebar-tab__icon sidebar-tab__icon--extra"
          :name="showExtra ? 'mdi-chevron-up' : 'mdi-chevron-down'"
          size="30px"
          color="white"
        />
        <div class="sidebar-tab__label">{{ showExtra ? 'Скрыть' : 'Ещё' }}</div>
      </div>
    </div>
  </q-drawer>

  <!-- Dropdown появляется СНИЗУ от кнопки "Ещё" -->
  <teleport to="body">
    <transition name="extra-fade">
      <!-- Прозрачный оверлей для закрытия по клику вне -->
      <div v-if="showExtra" class="extra-overlay" @click="showExtra = false" />
    </transition>

    <transition name="extra-slide">
      <!-- Панель с иконками, позиционированная под кнопкой -->
      <div v-if="showExtra" class="extra-panel" :style="panelStyle">
        <div
          v-for="(item, index) in extraItems"
          :key="item.label"
          class="extra-tab"
          :class="{ 'extra-tab--active': activeIndex === mainItems.length + index }"
          @click="setActiveExtra(index)"
        >
          <q-icon :name="item.icon" size="30px" color="white" />
          <div class="extra-tab__label">{{ item.label }}</div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { NavItem } from 'src/types';

const router = useRouter();
const route = useRoute();

const activeIndex = ref(0);
const showExtra = ref(false);
const toggleRef = ref<HTMLElement | null>(null);

const mainItems: NavItem[] = [
  { label: 'Дашборды', icon: 'mdi-file-document', route: '/' },
  { label: 'Пользователи', icon: 'mdi-account-multiple', route: '/users' },
  { label: 'Сводная аналитика', icon: 'mdi-chart-bar', route: '/analytics' },
  { label: 'Спецотчет', icon: 'mdi-file-chart', route: '/special-report' },
];

const extraItems: NavItem[] = [
  { label: 'Рекомендательная система', icon: 'mdi-check-decagram', route: '/recommendations' },
  { label: 'Сегментация аудитории', icon: 'mdi-segment', route: '/segmentation' },
  { label: 'Присвоение тегов', icon: 'mdi-pound', route: '/tagging' },
  { label: 'Сообщения пользователей', icon: 'mdi-email-multiple', route: '/user-messages' },
  { label: 'Конструктор запросов', icon: 'mdi-database-search', route: '/query-builder' },
  { label: 'Файловый менеджер', icon: 'folder_copy', route: '/file-manager' },
  { label: 'Системные пользователи', icon: 'mdi-account-key', route: '/system-users' },
  { label: 'Монитор аномалий', icon: 'mdi-monitor', route: '/anomaly-monitor' },
  { label: 'НСИ', icon: 'mdi-information', route: '/nsi' },
  { label: 'Справка', icon: 'mdi-help-circle', route: '/help' },
];

// Вычисляем позицию панели по реальным координатам кнопки
const panelStyle = computed(() => {
  if (!toggleRef.value) return {};
  const rect = toggleRef.value.getBoundingClientRect();
  const top = rect.bottom + 6;
  return {
    top: `${top}px`,
    left: '0px',
    width: '120px',
    bottom: '0px',
  };
});

const allItems = computed(() => [...mainItems, ...extraItems]);

function resolveActiveIndex(path: string) {
  let bestIndex = -1;
  let bestLength = -1;
  allItems.value.forEach((item, index) => {
    if (!item.route) return;
    if (item.route === '/') {
      if (path === '/') {
        bestIndex = index;
        bestLength = 1;
      }
      return;
    }
    if (path === item.route || path.startsWith(`${item.route}/`)) {
      if (item.route.length > bestLength) {
        bestIndex = index;
        bestLength = item.route.length;
      }
    }
  });
  return bestIndex;
}

function syncActive(path: string) {
  const index = resolveActiveIndex(path);
  if (index === -1) return;
  activeIndex.value = index;
  if (index >= mainItems.length) {
    showExtra.value = true;
  }
}

watch(
  () => route.path,
  (path) => syncActive(path),
  { immediate: true },
);

function toggleExtra() {
  showExtra.value = !showExtra.value;
}

function setActive(index: number) {
  activeIndex.value = index;
  const route = mainItems[index]?.route;
  if (route) void router.push(route);
}

function setActiveExtra(index: number) {
  activeIndex.value = mainItems.length + index;
  showExtra.value = true;
  const route = extraItems[index]?.route;
  if (route) void router.push(route);
}
</script>

<style lang="scss" scoped>
.sidebar {
  border: none !important;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 4px 0;
  height: 100%;
  overflow: hidden;
}

.sidebar-tab {
  width: 108px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 4px 4px;
  border-radius: 6px;
  margin: 3px 0;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0;

  &:hover {
    background-color: rgba(255, 255, 255, 0.14);
  }

  &--active {
    background-color: rgba(255, 255, 255, 0.22);
  }

  &__label {
    color: white;
    font-size: 9px;
    line-height: 1.2;
    text-align: center;
    margin-top: 2px;
    white-space: normal;
    word-wrap: break-word;
  }
}

.sidebar-tab__icon--extra {
  margin-top: 0;
}

.extra-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 120px;
  z-index: 1999;
}

.extra-panel {
  position: fixed;
  background: #027be3;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 4px 4px;
  z-index: 2000;
  overflow-y: auto;
  border-radius: 0;
  box-shadow: 4px 4px 12px rgba(0, 0, 0, 0.25);
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

.extra-tab {
  width: 108px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 4px 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  flex-shrink: 0;

  &:hover {
    background-color: rgba(255, 255, 255, 0.15);
  }

  &--active {
    background-color: rgba(255, 255, 255, 0.2);
  }

  &__label {
    color: white;
    font-size: 9px;
    line-height: 1.2;
    text-align: center;
    margin-top: 2px;
    white-space: normal;
    word-wrap: break-word;
  }
}
</style>
