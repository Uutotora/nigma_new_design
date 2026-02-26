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
  transition:
    box-shadow 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &__title {
    color: #1a237e;
    font-size: 18px;
    font-weight: 600;
    text-align: center;
  }
}
</style>
