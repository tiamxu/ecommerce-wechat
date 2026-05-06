<script setup lang="ts">
import type { ServicePolicy } from '../api/product'

defineProps({
  service: {
    type: Object as () => ServicePolicy,
    required: true
  }
})

function getIcon(icon: string): string {
  const iconMap: Record<string, string> = {
    'return': '↩',
    'exchange': '⇄',
    'warranty': '🛡',
    'shield': '🛡',
    'truck': '🚚',
    'headset': '🎧',
    'credit-card': '💳',
    'gift': '🎁'
  }
  return iconMap[icon] || '✓'
}
</script>

<template>
  <view class="service-badge">
    <text class="badge-icon">{{ getIcon(service.icon) }}</text>
    <text class="badge-name">{{ service.name }}</text>
  </view>
</template>

<style scoped lang="scss">
.service-badge {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  background: var(--bg-page);
  border: 1rpx solid var(--border);
  border-radius: 32rpx;
  font-size: 22rpx;
  color: var(--text-main);
}

.badge-icon {
  font-size: 24rpx;
}

.badge-name {
  white-space: nowrap;
}
</style>
