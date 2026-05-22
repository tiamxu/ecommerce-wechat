<script setup lang="ts">
import { computed } from 'vue'

interface PlanItem {
  type: 'spot' | 'food' | 'hotel' | 'transport' | 'shopping' | 'show'
  name: string
  time?: string
  duration?: string
  ticket?: string
  cost?: number
  note?: string
  location?: string
}

interface DailyPlan {
  day: number
  date: string
  weather?: string
  items: PlanItem[]
}

const props = defineProps<{
  plan: DailyPlan
}>()

const typeConfig = {
  spot: { emoji: '📍', color: 'var(--primary)', label: '景点' },
  food: { emoji: '🍜', color: 'var(--accent)', label: '美食' },
  hotel: { emoji: '🏨', color: '#a855f7', label: '住宿' },
  transport: { emoji: '🚄', color: '#3b82f6', label: '交通' },
  shopping: { emoji: '🛍️', color: '#f59e0b', label: '购物' },
  show: { emoji: '🎭', color: '#ec4899', label: '演出' }
}

function getItemConfig(type: string) {
  return typeConfig[type as keyof typeof typeConfig] || typeConfig.spot
}
</script>

<template>
  <view class="day-timeline">
    <!-- 日期头部 -->
    <view class="day-header">
      <view class="day-badge">Day {{ plan.day }}</view>
      <text class="day-date">{{ plan.date }}</text>
      <view v-if="plan.weather" class="weather-tag">
        <text>{{ plan.weather }}</text>
      </view>
    </view>

    <!-- 时间轴内容 -->
    <view class="timeline-content">
      <view
        v-for="(item, index) in plan.items"
        :key="index"
        class="timeline-item"
        :class="item.type"
      >
        <!-- 时间线 -->
        <view class="timeline-left">
          <view class="timeline-dot" :style="{ background: getItemConfig(item.type).color }">
            <text>{{ getItemConfig(item.type).emoji }}</text>
          </view>
          <view v-if="index < plan.items.length - 1" class="timeline-line"></view>
        </view>

        <!-- 内容 -->
        <view class="timeline-right">
          <view class="item-card">
            <view class="item-header">
              <text class="item-name">{{ item.name }}</text>
              <text v-if="item.ticket" class="item-ticket">{{ item.ticket }}</text>
              <text v-if="item.cost" class="item-cost">¥{{ item.cost }}</text>
            </view>
            <view v-if="item.time" class="item-info">
              <uni-icons type="time" size="14" color="var(--text-sub)" />
              <text class="info-text">{{ item.time }}</text>
            </view>
            <view v-if="item.duration" class="item-info">
              <uni-icons type="calendar" size="14" color="var(--text-sub)" />
              <text class="info-text">约{{ item.duration }}</text>
            </view>
            <view v-if="item.location" class="item-info">
              <uni-icons type="location" size="14" color="var(--text-sub)" />
              <text class="info-text">{{ item.location }}</text>
            </view>
            <view v-if="item.note" class="item-note">
              <text>{{ item.note }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.day-timeline {
  margin-bottom: 40rpx;
}

.day-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.day-badge {
  padding: 8rpx 20rpx;
  background: var(--primary);
  color: #fff;
  border-radius: 24rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.day-date {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-main);
}

.weather-tag {
  padding: 4rpx 12rpx;
  background: #fef3c7;
  color: #d97706;
  border-radius: 12rpx;
  font-size: 20rpx;
}

.timeline-content {
  padding-left: 8rpx;
}

.timeline-item {
  display: flex;
  gap: 20rpx;
}

.timeline-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 56rpx;
}

.timeline-dot {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  flex-shrink: 0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.timeline-line {
  width: 4rpx;
  flex: 1;
  min-height: 40rpx;
  background: var(--border);
  margin: 8rpx 0;
}

.timeline-right {
  flex: 1;
  padding-bottom: 24rpx;
}

.item-card {
  background: var(--bg-card);
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 12rpx var(--shadow);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
  flex-wrap: wrap;
}

.item-name {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-main);
}

.item-ticket {
  font-size: 22rpx;
  color: var(--primary);
  background: var(--primary-light);
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
}

.item-cost {
  font-size: 24rpx;
  color: var(--price);
  font-weight: 600;
  margin-left: auto;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 6rpx;
}

.info-text {
  font-size: 22rpx;
  color: var(--text-sub);
}

.item-note {
  margin-top: 8rpx;
  padding: 8rpx 12rpx;
  background: var(--bg-page);
  border-radius: 8rpx;
  font-size: 22rpx;
  color: var(--text-sub);
  line-height: 1.4;
}
</style>
