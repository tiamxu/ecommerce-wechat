<script setup lang="ts">
defineProps<{
  role: 'user' | 'assistant'
  content: string
  time?: string
}>()
</script>

<template>
  <view :class="['chat-bubble', role]">
    <view class="avatar">
      <text>{{ role === 'user' ? '👤' : '🤖' }}</text>
    </view>
    <view class="bubble-content">
      <text class="bubble-text">{{ content }}</text>
      <text v-if="time" class="bubble-time">{{ time }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.chat-bubble {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;

  &.user {
    flex-direction: row-reverse;
  }
}

.avatar {
  width: 72rpx;
  height: 72rpx;
  background: var(--primary-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  flex-shrink: 0;

  .user & {
    background: var(--accent-light);
  }
}

.bubble-content {
  max-width: 500rpx;
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  background: var(--bg-card);
  box-shadow: 0 2rpx 12rpx var(--shadow);
  overflow: hidden;
  box-sizing: border-box;

  .user & {
    background: var(--primary);
  }
}

.bubble-text {
  font-size: 28rpx;
  line-height: 1.5;
  color: var(--text-main);
  white-space: pre-wrap;
  word-break: break-all;
  overflow-wrap: break-word;
  max-width: 100%;

  .user & {
    color: var(--text-inverse);
  }
}

.bubble-time {
  display: block;
  font-size: 20rpx;
  color: var(--text-placeholder);
  margin-top: 8rpx;
  text-align: right;

  .user & {
    color: rgba(255, 255, 255, 0.7);
  }
}
</style>
