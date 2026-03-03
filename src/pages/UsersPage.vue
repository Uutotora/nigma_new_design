<template>
  <q-page class="users-page">
    <div class="content-wrapper">
      <div class="breadcrumb-row q-mb-sm">
        <router-link class="breadcrumb-link text-blue-6" to="/users">
          <q-icon name="mdi-account-multiple" size="18px" class="q-mr-xs" />Пользователи
        </router-link>
        <q-icon name="chevron_right" class="text-grey-5" style="font-size:1.5em;" />
        <span class="text-grey-6" style="font-size:14px;">Пользователь</span>
      </div>

      <div class="profile-layout">
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

        <div class="main-block">
          <q-tab-panels v-model="activeSection" animated class="tp">
            <q-tab-panel name="profile" class="q-pa-none">
              <UserProfileTab @navigate="activeSection = $event" />
            </q-tab-panel>

            <q-tab-panel name="recosys" class="q-pa-none q-pt-sm">
              <UserRecosysTab />
            </q-tab-panel>

            <q-tab-panel name="activity" class="q-pa-none q-pt-sm">
              <UserActivityTab />
            </q-tab-panel>

            <q-tab-panel name="points" class="q-pa-none q-pt-sm">
              <UserPointsTab />
            </q-tab-panel>

            <q-tab-panel name="messages" class="q-pa-none q-pt-sm">
              <UserMessagesTab />
            </q-tab-panel>

            <q-tab-panel name="metrics" class="q-pa-none q-pt-sm">
              <UserMetricsTab />
            </q-tab-panel>

            <q-tab-panel name="loyalty" class="q-pa-none q-pt-sm">
              <UserLoyaltyTab />
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
import UserActivityTab from 'src/pages/users/UserActivityTab.vue';
import UserProfileTab from 'src/pages/users/UserProfileTab.vue';
import UserRecosysTab from 'src/pages/users/UserRecosysTab.vue';
import UserPointsTab from 'src/pages/users/UserPointsTab.vue';
import UserMessagesTab from 'src/pages/users/UserMessagesTab.vue';
import UserMetricsTab from 'src/pages/users/UserMetricsTab.vue';
import UserLoyaltyTab from 'src/pages/users/UserLoyaltyTab.vue';

const activeSection  = ref('profile');
const route = useRoute();
const currentSsoId = computed(() => (route.params.ssoId as string) || '—');

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
</script>

<style lang="scss" scoped>
.users-page { background-color: #027be3; padding: 0; }

.content-wrapper {
  background-color: #e0e0e0;
  border-top-left-radius: 16px;
  min-height: calc(100vh - 50px);
  padding: 18px 22px;
}

.breadcrumb-row { display: flex; align-items: center; gap: 4px; }
.breadcrumb-link {
  display: inline-flex; align-items: center;
  font-size: 14px; text-decoration: none; font-weight: 500;
  &:hover { text-decoration: underline; }
}

.profile-layout { display: flex; gap: 14px; align-items: flex-start; }

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

.main-block {
  flex: 1; min-width: 0;
  background: #fff; border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,.08), 0 12px 28px rgba(0,0,0,.05);
  padding: 0;
  overflow: hidden;
}
.tp { background: transparent !important; }
</style>
