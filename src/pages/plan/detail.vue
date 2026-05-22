<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTripStore } from '../../store/trip'
import DayTimeline from '../../components/DayTimeline.vue'
import { THEME_CLASS } from '../../theme/config'
import type { TripRoute, DailyPlan as APIDailyPlan } from '../../api/trip'

const tripStore = useTripStore()

const currentRouteIndex = ref(0)

const currentTrip = computed(() => tripStore.currentTrip)
const currentRoute = computed(() => {
  if (!currentTrip.value || !currentTrip.value.routes.length) return null
  return currentTrip.value.routes[currentRouteIndex.value]
})

// 是否有数据
const hasData = computed(() => currentTrip.value && currentRoute.value)

// 将后端DailyPlan转换为前端格式
function convertDailyPlans(apiPlans: APIDailyPlan[] | undefined) {
  if (!apiPlans || apiPlans.length === 0) return []

  return apiPlans.map((plan: APIDailyPlan) => {
    const items: any[] = []

    // 上午
    if (plan.morning) {
      items.push({
        type: 'spot',
        name: plan.morning,
        note: ''
      })
    }

    // 下午
    if (plan.afternoon) {
      items.push({
        type: 'spot',
        name: plan.afternoon,
        note: ''
      })
    }

    // 晚上
    if (plan.evening) {
      items.push({
        type: 'spot',
        name: plan.evening,
        note: ''
      })
    }

    // 如果有tips
    if (plan.tips && items.length > 0) {
      items[items.length - 1].note = plan.tips
    }

    return {
      day: plan.day,
      date: plan.date || '',
      weather: plan.weather || '',
      items
    }
  })
}

const expenses = computed(() => {
  if (!currentRoute.value?.cost_detail) return []

  const cd = currentRoute.value.cost_detail
  return [
    { category: '交通', amount: cd.transport || 0, detail: '' },
    { category: '住宿', amount: cd.accommodation || 0, detail: '' },
    { category: '餐饮', amount: cd.food || 0, detail: '' },
    { category: '门票', amount: cd.tickets || 0, detail: '' }
  ]
})

const totalCost = computed(() => currentRoute.value?.estimated_cost || 0)

const dailyPlans = computed(() => convertDailyPlans(currentRoute.value?.daily_plans))

// 住宿列表
const hotels = computed(() => currentRoute.value?.hotels || [])

// 餐饮列表
const restaurants = computed(() => currentRoute.value?.restaurants || [])

// 交通列表
const transportations = computed(() => currentRoute.value?.transportations || [])

// 费用分布百分比
const costPercentages = computed(() => {
  if (!currentRoute.value?.cost_detail) return []
  const cd = currentRoute.value.cost_detail
  const total = (cd.transport || 0) + (cd.accommodation || 0) + (cd.food || 0) + (cd.tickets || 0)
  if (total === 0) return []
  return [
    { category: '交通', percent: Math.round((cd.transport || 0) / total * 100) },
    { category: '住宿', percent: Math.round((cd.accommodation || 0) / total * 100) },
    { category: '餐饮', percent: Math.round((cd.food || 0) / total * 100) },
    { category: '门票', percent: Math.round((cd.tickets || 0) / total * 100) }
  ]
})

// 费用分布颜色
const costColors = ['#0ea5e9', '#8b5cf6', '#f97316', '#10b981']

onMounted(async () => {
  if (!currentTrip.value && tripStore.currentTrip) {
    tripStore.setCurrentTrip(tripStore.currentTrip)
  }
})

function goBack() {
  uni.navigateBack()
}

function switchRoute(index: number) {
  currentRouteIndex.value = index
}

function toggleFavorite() {
  if (!currentRoute.value) return
  tripStore.toggleFavoriteRoute(currentRoute.value.name)
  const isFav = tripStore.isRouteFavorite(currentRoute.value.name)
  uni.showToast({
    title: isFav ? '已收藏' : '取消收藏',
    icon: 'success'
  })
}

function shareTrip() {
  uni.showToast({ title: '分享功能开发中', icon: 'none' })
}

function handleConfirm() {
  if (!currentTrip.value) return
  uni.showModal({
    title: '确认行程',
    content: '确定要确认这个行程吗？确认后将无法重新生成。',
    success: (res) => {
      if (res.confirm) {
        // 本地更新状态
        tripStore.currentTrip!.status = 'ongoing'
        uni.showToast({ title: '确认成功', icon: 'success' })
      }
    }
  })
}

function regenerate() {
  uni.showModal({
    title: '重新生成',
    content: '确定要重新生成行程吗？',
    success: (res) => {
      if (res.confirm) {
        uni.navigateBack()
      }
    }
  })
}
</script>

<template>
  <view :class="['plan-detail', THEME_CLASS]">
    <!-- 顶部导航 -->
    <view class="detail-nav" :style="{ paddingTop: 'env(safe-area-inset-top)' }">
      <view class="nav-left" @click="goBack">
        <uni-icons type="left" size="20" color="#fff" />
      </view>
      <text class="nav-title">{{ currentTrip?.destination || '行程详情' }}</text>
      <view class="nav-right" @click="toggleFavorite">
        <text>{{ currentRoute && tripStore.isRouteFavorite(currentRoute.name) ? '❤️' : '🤍' }}</text>
      </view>
    </view>

    <!-- 顶部信息 -->
    <view class="detail-header">
      <view class="header-content">
        <text class="trip-title">{{ currentRoute?.name || '加载中...' }}</text>
        <text class="trip-theme">{{ currentRoute?.theme }}</text>
        <view class="trip-meta">
          <text class="meta-item">{{ currentTrip?.days || 0 }}天行程</text>
          <text class="meta-dot">·</text>
          <text class="meta-item">{{ currentTrip?.budget || '舒适' }}</text>
          <text class="meta-dot">·</text>
          <text class="meta-item price">¥{{ currentRoute?.estimated_cost || 0 }}/人</text>
        </view>
      </view>
    </view>

    <!-- 线路切换 -->
    <view v-if="currentTrip && currentTrip.routes.length > 1" class="route-tabs">
      <view
        v-for="(route, index) in currentTrip.routes"
        :key="route.name"
        :class="['route-tab', { active: currentRouteIndex === index }]"
        @click="switchRoute(index)"
      >
        <text>{{ route.name }}</text>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="!hasData" class="empty-state">
      <text class="empty-icon">✈️</text>
      <text class="empty-text">暂无行程详情</text>
      <text class="empty-desc">请先生成行程</text>
      <view class="empty-btn" @click="goBack">
        <text>去生成</text>
      </view>
    </view>

    <!-- 主要内容 -->
    <scroll-view v-else class="detail-content" scroll-y>
      <!-- 适合人群 -->
      <view class="suitable-section">
        <text class="section-icon">👥</text>
        <text class="section-text">适合：{{ currentRoute?.theme }}</text>
      </view>

      <!-- 每日行程 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">每日行程</text>
        </view>
        <DayTimeline
          v-for="day in dailyPlans"
          :key="day.day"
          :plan="day"
        />
        <view v-if="dailyPlans.length === 0" class="empty-section">
          <text>暂无行程安排</text>
        </view>
      </view>

      <!-- 费用构成 -->
      <view v-if="expenses.length > 0" class="section">
        <view class="section-header">
          <text class="section-title">💰 费用构成</text>
        </view>
        <view class="cost-overview">
          <view class="cost-total">
            <text class="cost-label">总预算</text>
            <text class="cost-value">¥{{ totalCost }}</text>
          </view>
          <view class="cost-breakdown">
            <view
              v-for="(item, index) in expenses"
              :key="item.category"
              class="cost-item"
            >
              <view class="cost-bar" :style="{ width: costPercentages[index]?.percent + '%', background: costColors[index] }"></view>
              <view class="cost-info">
                <text class="cost-category">{{ item.category }}</text>
                <text class="cost-amount">¥{{ item.amount }}</text>
                <text class="cost-percent">{{ costPercentages[index]?.percent }}%</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 住宿推荐 -->
      <view v-if="hotels.length > 0" class="section">
        <view class="section-header">
          <text class="section-title">🏨 住宿推荐</text>
        </view>
        <view
          v-for="(hotel, index) in hotels"
          :key="index"
          class="info-card"
        >
          <view class="card-main">
            <text class="card-title">{{ hotel.name }}</text>
            <text class="card-sub">{{ hotel.per_night ? '每晚' : '总计' }}¥{{ hotel.price }}</text>
          </view>
          <view class="card-tags">
            <text v-if="hotel.night" class="tag">住{{ hotel.night }}晚</text>
            <text v-if="hotel.reason" class="tag reason">{{ hotel.reason }}</text>
          </view>
        </view>
      </view>

      <!-- 美食推荐 -->
      <view v-if="restaurants.length > 0" class="section">
        <view class="section-header">
          <text class="section-title">🍜 美食推荐</text>
        </view>
        <view
          v-for="(restaurant, index) in restaurants"
          :key="index"
          class="info-card"
        >
          <view class="card-main">
            <text class="card-title">{{ restaurant.name }}</text>
            <text class="card-sub">{{ restaurant.type }}</text>
          </view>
          <view class="card-tags">
            <text class="tag">{{ restaurant.per_person ? '人均' : '总计' }}¥{{ restaurant.price }}</text>
          </view>
        </view>
      </view>

      <!-- 交通出行 -->
      <view v-if="transportations.length > 0" class="section">
        <view class="section-header">
          <text class="section-title">🚄 交通出行</text>
        </view>
        <view
          v-for="(transport, index) in transportations"
          :key="index"
          class="info-card"
        >
          <view class="card-main">
            <text class="card-title">{{ transport.type }}</text>
            <text class="card-sub">{{ transport.route }}</text>
          </view>
          <view class="card-tags">
            <text class="tag">¥{{ transport.cost }}</text>
            <text v-if="transport.duration" class="tag">{{ transport.duration }}</text>
          </view>
        </view>
      </view>

      <!-- 温馨提示 -->
      <view v-if="currentRoute?.notes && currentRoute.notes.length > 0" class="tips-section">
        <view class="section-header">
          <text class="section-title">💡 温馨提示</text>
        </view>
        <view
          v-for="(tip, index) in currentRoute.notes"
          :key="index"
          class="tip-item"
        >
          <text>{{ tip }}</text>
        </view>
      </view>

      <view class="bottom-space"></view>
    </scroll-view>

    <!-- 底部操作 -->
    <view v-if="hasData" class="action-bar">
      <view class="action-btn secondary" @click="shareTrip">
        <uni-icons type="redo" size="18" color="var(--text-main)" />
        <text>分享</text>
      </view>
      <view v-if="currentTrip?.status === 'planning'" class="action-btn warning" @click="handleConfirm">
        <text>确认行程</text>
      </view>
      <view class="action-btn primary" @click="regenerate">
        <uni-icons type="refresh" size="18" color="#fff" />
        <text>重新生成</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.plan-detail {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

/* 导航栏 */
.detail-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  color: #fff;
}

.nav-left, .nav-right {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
}

.nav-right text {
  font-size: 36rpx;
}

/* 头部信息 */
.detail-header {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  padding: 0 32rpx 40rpx;
  color: #fff;
}

.header-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.trip-title {
  font-size: 40rpx;
  font-weight: 700;
}

.trip-theme {
  font-size: 26rpx;
  opacity: 0.9;
}

.trip-meta {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 8rpx;
  font-size: 24rpx;
  opacity: 0.8;
}

.meta-item.price {
  color: #fef3c7;
  font-weight: 600;
}

.meta-dot {
  opacity: 0.5;
}

/* 线路切换 */
.route-tabs {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 32rpx;
  background: var(--bg-card);
  overflow-x: auto;
}

.route-tab {
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
  font-size: 24rpx;
  color: var(--text-sub);
  background: var(--bg-page);
  white-space: nowrap;
  flex-shrink: 0;

  &.active {
    background: var(--primary);
    color: #fff;
    font-weight: 600;
  }
}

/* 空状态 */
.empty-state {
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
}

.empty-btn {
  padding: 24rpx 64rpx;
  background: var(--primary);
  color: #fff;
  border-radius: 44rpx;
}

.empty-section {
  padding: 32rpx;
  text-align: center;
  color: var(--text-sub);
  font-size: 26rpx;
}

/* 内容区 */
.detail-content {
  padding: 24rpx 32rpx;
  max-height: calc(100vh - 500rpx);
}

/* 费用构成 */
.cost-overview {
  background: var(--bg-card);
  border-radius: 16rpx;
  padding: 24rpx;
}

.cost-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid var(--border);
}

.cost-label {
  font-size: 26rpx;
  color: var(--text-sub);
}

.cost-value {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--primary);
}

.cost-breakdown {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.cost-item {
  position: relative;
}

.cost-bar {
  height: 32rpx;
  border-radius: 16rpx;
  min-width: 32rpx;
  max-width: 100%;
}

.cost-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-top: 8rpx;
}

.cost-category {
  font-size: 24rpx;
  color: var(--text-sub);
  min-width: 60rpx;
}

.cost-amount {
  font-size: 26rpx;
  color: var(--text-main);
  font-weight: 500;
}

.cost-percent {
  font-size: 22rpx;
  color: var(--text-sub);
  margin-left: auto;
}

/* 信息卡片 */
.info-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card);
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 16rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.card-main {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.card-title {
  font-size: 28rpx;
  color: var(--text-main);
  font-weight: 500;
}

.card-sub {
  font-size: 24rpx;
  color: var(--text-sub);
}

.card-price {
  font-size: 28rpx;
  color: var(--price);
  font-weight: 600;
}

.card-tags {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
}

.tag {
  padding: 4rpx 12rpx;
  background: var(--primary-light);
  color: var(--primary);
  border-radius: 16rpx;
  font-size: 22rpx;

  &.reason {
    background: #fef3c7;
    color: #d97706;
  }
}

/* 适合人群 */
.suitable-section {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 24rpx;
  background: var(--primary-light);
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}

.section-icon {
  font-size: 28rpx;
}

.section-text {
  font-size: 26rpx;
  color: var(--primary);
}

/* 区块 */
.section {
  margin-bottom: 24rpx;
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-main);
}

/* 温馨提示 */
.tips-section {
  background: #fef3c7;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-top: 24rpx;
}

.tip-item {
  font-size: 24rpx;
  color: #92400e;
  line-height: 1.6;
  margin-bottom: 8rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.bottom-space {
  height: 40rpx;
}

/* 底部操作 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 20rpx;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: var(--bg-card);
  box-shadow: 0 -2rpx 12rpx var(--shadow);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 24rpx;
  border-radius: 44rpx;
  font-size: 28rpx;
  font-weight: 600;

  &.primary {
    background: var(--primary);
    color: #fff;
    box-shadow: 0 4rpx 16rpx var(--primary-light);
  }

  &.secondary {
    background: var(--bg-page);
    color: var(--text-main);
    border: 2rpx solid var(--border);
  }

  &.warning {
    background: #fef3c7;
    color: #d97706;
  }

  &:active {
    opacity: 0.9;
  }
}
</style>
