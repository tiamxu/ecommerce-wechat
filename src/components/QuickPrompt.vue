<script setup lang="ts">
defineProps<{
  icon: string
  text: string
}>()

const emit = defineEmits<{
  click: [text: string]
}>()

function handleClick() {
  emit('click', '')
}
</script>

<template>
  <view class="quick-prompt" @click="handleClick">
    <text class="prompt-icon">{{ icon }}</text>
    <text class="prompt-text">{{ text }}</text>
  </view>
</template>

<style scoped lang="scss">
.quick-prompt {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx;
  background: var(--bg-card);
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx var(--shadow);
  transition: transform 0.2s ease;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;

  &:active {
    transform: scale(0.96);
  }
}

.prompt-icon {
  font-size: 32rpx;
  flex-shrink: 0;
}

.prompt-text {
  font-size: 24rpx;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
