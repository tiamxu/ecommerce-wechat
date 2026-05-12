<script setup lang="ts">
import type { ServicePolicy } from '../api/product'

defineProps({
  service: {
    type: Object as () => ServicePolicy,
    required: true
  }
})

function getIconType(icon: string): string {
  const iconMap: Record<string, string> = {
    'return': 'undo',
    'exchange': 'refresh',
    'warranty': 'star',
    'shield': 'star',
    'truck': 'location',
    'headset': 'phone',
    'credit-card': 'wallet',
    'gift': 'gift'
  }
  return iconMap[icon] || 'check'
}
</script>

<template>
  <view class="service-badge">
    <uni-icons type="check" size="14" color="var(--primary)" />
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

.badge-name {
  white-space: nowrap;
}
</style>
