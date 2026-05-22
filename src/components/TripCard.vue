<script setup lang="ts">
import { computed } from 'vue'

interface Route {
  id: string
  title: string
  theme: string
  totalCost: number
  suitableFor: string
  days: number
}

const props = defineProps<{
  route: Route
  isFavorite?: boolean
}>()

const emit = defineEmits<{
  click: [route: Route]
  favorite: [route: Route]
}>()

const themeEmoji = computed(() => {
  const theme = props.route.theme
  if (theme.includes('经典') || theme.includes('打卡')) return '📸'
  if (theme.includes('小众') || theme.includes('秘境')) return '🏔️'
  if (theme.includes('度假') || theme.includes('慵懒')) return '🏖️'
  if (theme.includes('亲子')) return '👨‍👩‍👧'
  if (theme.includes('情侣')) return '💕'
  return '✈️'
})

function handleClick() {
  emit('click', props.route)
}

function handleFavorite() {
  emit('favorite', props.route)
}
</script>

<template>
  <view class="trip-card" @click="handleClick">
    <view class="card-header">
      <view class="header-left">
        <text class="route-emoji">{{ themeEmoji }}</text>
        <text class="route-title">{{ route.title }}</text>
      </view>
      <view class="favorite-btn" @click.stop="handleFavorite">
        <text>{{ isFavorite ? '❤️' : '🤍' }}</text>
      </view>
    </view>

    <view class="card-body">
      <view class="info-row">
        <text class="info-label">主题</text>
        <text class="info-value">{{ route.theme }}</text>
      </view>
      <view class="info-row">
        <text class="info-label">预算</text>
        <text class="info-value price">¥{{ route.totalCost }}/人</text>
      </view>
      <view class="info-row">
        <text class="info-label">时长</text>
        <text class="info-value">{{ route.days }}天</text>
      </view>
      <view class="info-row">
        <text class="info-label">适合</text>
        <text class="info-value">{{ route.suitableFor }}</text>
      </view>
    </view>

    <view class="card-footer">
      <text class="view-detail">查看详情</text>
      <uni-icons type="right" size="14" color="var(--primary)" />
    </view>
  </view>
</template>

<style scoped lang="scss">
.trip-card {
  background: var(--bg-card);
  border-radius: 20rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 20rpx var(--shadow);
  margin-bottom: 20rpx;
  max-width: 100%;
  overflow: hidden;
  box-sizing: border-box;

  &:active {
    transform: scale(0.99);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.route-emoji {
  font-size: 36rpx;
}

.route-title {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--text-main);
}

.favorite-btn {
  padding: 8rpx;

  &:active {
    opacity: 0.7;
  }
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.info-label {
  font-size: 24rpx;
  color: var(--text-sub);
  min-width: 60rpx;
}

.info-value {
  font-size: 26rpx;
  color: var(--text-main);

  &.price {
    color: var(--price);
    font-weight: 600;
  }
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding-top: 16rpx;
  border-top: 1rpx solid var(--border);
}

.view-detail {
  font-size: 26rpx;
  color: var(--primary);
  font-weight: 500;
}
</style>
