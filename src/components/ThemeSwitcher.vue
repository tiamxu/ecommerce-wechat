<script setup lang="ts">
import { useThemeStore } from '../store/theme'

const themeStore = useThemeStore()
</script>

<template>
  <view class="theme-info">
    <view class="theme-label">当前主题</view>
    <view class="theme-name">{{ themeStore.themeConfig.name }}</view>
  </view>
</template>

<style scoped lang="scss">
.theme-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  background: var(--bg-card);
  border-radius: 16rpx;
  margin: 24rpx;
}

.theme-label {
  font-size: 24rpx;
  color: var(--text-sub);
}

.theme-name {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--primary);
}
</style>