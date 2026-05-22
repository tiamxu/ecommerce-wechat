<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/user'
import { useTripStore } from '../../store/trip'
import TabBar from '../../components/TabBar.vue'
import TripCard from '../../components/TripCard.vue'
import { THEME_CLASS } from '../../theme/config'

const userStore = useUserStore()
const tripStore = useTripStore()

const activeTab = ref('all')
const loading = ref(false)

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'planning', label: '规划中' },
  { key: 'ongoing', label: '进行中' },
  { key: 'completed', label: '已出行' }
]

const filteredTrips = computed(() => {
  if (activeTab.value === 'all') {
    return tripStore.tripHistory
  }
  return tripStore.tripHistory.filter(t => t.status === activeTab.value)
})

function changeTab(tab: string) {
  activeTab.value = tab
}

function goToDetail(trip: any) {
  tripStore.setCurrentTrip(trip)
  uni.navigateTo({ url: `/pages/plan/detail?id=${trip.id}` })
}

function goToAIChat() {
  uni.switchTab({ url: '/pages/ai/chat' })
}

async function handleFavorite(trip: any) {
  try {
    const isFav = await tripStore.toggleFavoriteApi(trip.id)
    uni.showToast({
      title: isFav ? '已收藏' : '取消收藏',
      icon: 'success'
    })
  } catch (error) {
    uni.showToast({ title: '操作失败', icon: 'none' })
  }
}

async function loadData() {
  if (!userStore.isLoggedIn) return

  loading.value = true
  try {
    await tripStore.fetchTripHistory()
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    loadData()
  }
})

onShow(() => {
  if (userStore.isLoggedIn) {
    loadData()
  }
})

onPullDownRefresh(() => {
  loadData().finally(() => {
    uni.stopPullDownRefresh()
  })
})
</script>

<template>
  <view :class="['plan-list', THEME_CLASS]">
    <TabBar />

    <!-- 顶部标题 -->
    <view class="list-header">
      <text class="header-title">我的行程</text>
      <text class="header-count">{{ tripStore.tripHistoryTotal }}个行程</text>
    </view>

    <!-- 状态Tab -->
    <view class="status-tabs">
      <view
        v-for="tab in tabs"
        :key="tab.key"
        :class="['status-tab', { active: activeTab === tab.key }]"
        @click="changeTab(tab.key)"
      >
        <text>{{ tab.label }}</text>
      </view>
    </view>

    <!-- 未登录 -->
    <view v-if="!userStore.isLoggedIn" class="empty-plan">
      <view class="empty-icon">✈️</view>
      <text class="empty-text">请先登录</text>
      <text class="empty-desc">登录后查看您的行程规划</text>
      <view class="empty-btn" @click="goToAIChat">
        <text>去规划</text>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else-if="filteredTrips.length === 0 && !loading" class="empty-plan">
      <view class="empty-icon">✈️</view>
      <text class="empty-text">暂无行程规划</text>
      <text class="empty-desc">告诉AI助手想去哪里，我来帮您规划</text>
      <view class="empty-btn" @click="goToAIChat">
        <text>开始规划</text>
      </view>
    </view>

    <!-- 行程列表 -->
    <view v-else class="plan-content">
      <view
        v-for="trip in filteredTrips"
        :key="trip.id"
        class="trip-item"
      >
        <view class="trip-header">
          <view class="trip-info">
            <text class="trip-destination">{{ trip.destination }}</text>
            <text class="trip-dates">{{ trip.days }}天 · {{ trip.budget }}</text>
          </view>
          <view class="trip-status" :class="trip.status">
            {{ trip.status === 'planning' ? '规划中' : trip.status === 'ongoing' ? '进行中' : '已出行' }}
          </view>
        </view>

        <view class="routes-section">
          <TripCard
            v-for="route in trip.routes"
            :key="route.name"
            :route="{
              id: route.name,
              title: route.name,
              theme: route.theme,
              totalCost: route.estimated_cost,
              suitableFor: route.theme,
              days: trip.days
            }"
            :isFavorite="trip.favoriteRoutes.includes(route.name)"
            @click="goToDetail(trip)"
            @favorite="handleFavorite(trip)"
          />
          <view v-if="trip.routes.length === 0" class="no-route" @click="goToDetail(trip)">
            <text>点击查看详情</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.plan-list {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
}

/* 头部 */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 24rpx;
  padding-top: calc(32rpx + env(safe-area-inset-top));
  background: var(--bg-card);
}

.header-title {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--text-main);
}

.header-count {
  font-size: 24rpx;
  color: var(--text-sub);
}

/* 状态Tab */
.status-tabs {
  display: flex;
  gap: 8rpx;
  padding: 20rpx 24rpx;
  background: var(--bg-card);
  border-bottom: 1rpx solid var(--border);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  flex-shrink: 0;
}

.status-tab {
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: var(--text-sub);
  background: var(--bg-page);
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &.active {
    background: var(--primary);
    color: #fff;
    font-weight: 600;
  }
}

/* 空状态 */
.empty-plan {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 160rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: var(--text-sub);
  margin-bottom: 48rpx;
  text-align: center;
}

.empty-btn {
  padding: 24rpx 64rpx;
  background: var(--primary);
  color: var(--text-inverse);
  border-radius: 44rpx;
  font-size: 28rpx;
  font-weight: 500;

  &:active {
    opacity: 0.8;
  }
}

/* 行程列表 */
.plan-content {
  padding: 24rpx;
}

.trip-item {
  margin-bottom: 32rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.trip-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.trip-destination {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--text-main);
}

.trip-dates {
  font-size: 24rpx;
  color: var(--text-sub);
}

.trip-status {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;

  &.planning {
    background: var(--primary-light);
    color: var(--primary);
  }

  &.ongoing {
    background: #d1fae5;
    color: #059669;
  }

  &.completed {
    background: var(--bg-page);
    color: var(--text-sub);
  }
}

.routes-section {
  margin-top: 12rpx;
}

.no-route {
  padding: 32rpx;
  background: var(--bg-card);
  border-radius: 16rpx;
  text-align: center;
  color: var(--text-sub);
  font-size: 26rpx;

  &:active {
    opacity: 0.7;
  }
}
</style>
