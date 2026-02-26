<template>
  <q-header class="app-header bg-primary">
    <q-toolbar class="q-px-md" style="min-height: 50px">
      <img
        :src="logoUrl"
        alt="Nigma"
        class="header-logo q-mr-sm"
      />

      <div class="text-white">
        <div class="header-data-label">Актуальность данных:</div>
        <div class="header-data-value">
          17.02.2026 16:09:34
          <q-icon name="check_circle" color="positive" size="14px" class="q-ml-xs" />
        </div>
      </div>

      <q-space />
    </q-toolbar>
  </q-header>
</template>

<script setup lang="ts">
const logoUrl = new URL('../css/logo-view-512x512.5dafeae5.png', import.meta.url).href;
</script>

<style lang="scss" scoped>
.app-header {
  height: 50px;
}

.header-logo {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.header-data-label {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
}

.header-data-value {
  font-size: 12px;
  line-height: 1.2;
  opacity: 0.9;
}

.user-avatar {
  background-color: white;
  color: #027be3;
  font-size: 10px;
  font-weight: 700;
  border: 2px solid rgba(255, 255, 255, 0.8);
}
</style>
