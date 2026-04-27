<script setup lang="ts">
defineProps<{
  width?: string
  height?: string
  borderRadius?: string
}>()
</script>

<template>
  <view class="skeleton" :style="{
    width: width || '100%',
    height: height || '40rpx',
    borderRadius: borderRadius || '8rpx'
  }"></view>
</template>

<style scoped lang="scss">
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-page) 25%,
    var(--bg-card) 50%,
    var(--bg-page) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
