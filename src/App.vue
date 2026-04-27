<script setup lang="ts">
import { useUserStore } from './store/user'
const userStore = useUserStore()
userStore.init()
</script>

<template>
  <view></view>
</template>

<style>
@import './theme/index.scss';
</style>