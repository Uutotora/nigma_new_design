<template>
  <q-layout view="hHh lpR fFf">
    <AppHeader />
    <AppSidebar />
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import AppHeader from 'src/components/AppHeader.vue';
import AppSidebar from 'src/components/AppSidebar.vue';
</script>
