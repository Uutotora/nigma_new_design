<template>
  <q-card class="dashboard-card cursor-pointer" flat bordered>
    <q-card-section class="flex flex-center" style="min-height: 170px">
      <div class="dashboard-card__title">{{ title }}</div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<style lang="scss" scoped>
.dashboard-card {
  border: 1px solid #ddd;
  border-radius: 10px;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &__title {
    color: #1a237e;
    font-size: 18px;
    font-weight: 600;
    text-align: center;
  }
}
</style>
