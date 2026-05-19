<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { feedbackApi, type FeedbackItem } from '../../api'
import { useUserStore } from '../../store/user'
import { THEME_CLASS } from '../../theme/config'

const userStore = useUserStore()
const loading = ref(false)
const refreshing = ref(false)
const feedbackList = ref<FeedbackItem[]>([])
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const statusFilter = ref(-1) // -1=全部, 0=待处理, 1=处理中, 2=已回复, 3=已完成, 4=已关闭

const statusOptions = [
  { value: -1, label: '全部' },
  { value: 0, label: '待处理' },
  { value: 1, label: '处理中' },
  { value: 2, label: '已回复' },
  { value: 3, label: '已完成' },
  { value: 4, label: '已关闭' }
]

const statusMap: Record<number, string> = {
  0: '待处理',
  1: '处理中',
  2: '已回复',
  3: '已完成',
  4: '已关闭'
}

const categoryMap: Record<string, string> = {
  function: '功能建议',
  bug: '问题反馈',
  experience: '体验反馈',
  suggestion: '优化建议',
  complaint: '投诉建议',
  other: '其他'
}

onMounted(() => {
  loadList()
})

function onRefresh() {
  refreshing.value = true
  page.value = 1
  hasMore.value = true
  loadList(true)
}

function onLoadMore() {
  if (!hasMore.value || loading.value) return
  page.value++
  loadList()
}

async function loadList(reset = false) {
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const res = await feedbackApi.list(page.value, pageSize.value, statusFilter.value)
    if (res.code === 200 && res.data) {
      const items = res.data.items || []
      if (reset) {
        feedbackList.value = items
      } else {
        feedbackList.value = [...feedbackList.value, ...items]
      }
      hasMore.value = items.length === pageSize.value
    }
  } catch (error) {
    console.error('加载反馈列表失败', error)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function selectStatus(status: number) {
  statusFilter.value = status
  onRefresh()
}

function goToDetail(id: number) {
  uni.navigateTo({
    url: `/pages/user/feedback-detail?id=${id}`
  })
}

function formatTime(timeStr: string): string {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${month}/${day} ${hour}:${minute}`
}

function getStatusClass(status: number): string {
  switch (status) {
    case 0: return 'pending'
    case 1: return 'processing'
    case 2: return 'replied'
    case 3: return 'completed'
    case 4: return 'closed'
    default: return 'pending'
  }
}
</script>

<template>
  <view :class="['feedback-list-page', THEME_CLASS]">
    <!-- 状态筛选 -->
    <view class="status-tabs">
      <view
        v-for="item in statusOptions"
        :key="item.value"
        class="status-tab"
        :class="{ active: statusFilter === item.value }"
        @click="selectStatus(item.value)"
      >
        <text>{{ item.label }}</text>
      </view>
    </view>

    <!-- 列表 -->
    <scroll-view
      class="list-container"
      scroll-y
      @scrolltolower="onLoadMore"
    >
      <view class="list-content">
        <view
          v-for="item in feedbackList"
          :key="item.id"
          class="feedback-item"
          @click="goToDetail(item.id)"
        >
          <view class="item-header">
            <view class="category-tag">{{ categoryMap[item.category] || item.category }}</view>
            <view class="status-badge" :class="getStatusClass(item.status)">
              <text>{{ statusMap[item.status] || '待处理' }}</text>
            </view>
          </view>
          <view class="item-title">{{ item.subject }}</view>
          <view class="item-content">{{ item.content }}</view>
          <view class="item-footer">
            <text class="item-time">{{ formatTime(item.createdAt) }}</text>
            <text class="item-arrow">›</text>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-if="feedbackList.length === 0 && !loading" class="empty-tip">
          <text>暂无反馈记录</text>
        </view>

        <!-- 加载状态 -->
        <view v-if="loading && feedbackList.length === 0" class="loading-tip">
          <text>加载中...</text>
        </view>
        <view v-if="!hasMore && feedbackList.length > 0" class="loading-tip">
          <text>没有更多了</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style scoped lang="scss">
.feedback-list-page {
  min-height: 100vh;
  background: var(--bg-page);
}

/* 状态筛选 */
.status-tabs {
  display: flex;
  padding: 24rpx 32rpx;
  background: var(--bg-card);
  gap: 16rpx;
}

.status-tab {
  padding: 12rpx 24rpx;
  font-size: 26rpx;
  color: var(--text-sub);
  background: var(--bg-input);
  border-radius: 32rpx;

  &.active {
    color: var(--text-inverse);
    background: var(--primary);
  }
}

/* 列表 */
.list-container {
  height: calc(100vh - 100rpx);
}

.list-content {
  padding: 24rpx 32rpx;
}

.feedback-item {
  background: var(--bg-card);
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.category-tag {
  padding: 8rpx 16rpx;
  font-size: 22rpx;
  color: var(--primary);
  background: var(--primary-light);
  border-radius: 8rpx;
}

.status-badge {
  padding: 8rpx 16rpx;
  font-size: 22rpx;
  border-radius: 8rpx;

  &.pending {
    color: #666;
    background: #f0f0f0;
  }
  &.processing {
    color: #1890ff;
    background: #e6f7ff;
  }
  &.replied {
    color: #52c41a;
    background: #f6ffed;
  }
  &.completed {
    color: #722ed1;
    background: #f9f0ff;
  }
  &.closed {
    color: #999;
    background: #f5f5f5;
  }
}

.item-title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-content {
  font-size: 26rpx;
  color: var(--text-sub);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-bottom: 16rpx;
}

.item-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-time {
  font-size: 22rpx;
  color: var(--text-placeholder);
}

.item-arrow {
  font-size: 28rpx;
  color: var(--text-placeholder);
}

.empty-tip,
.loading-tip {
  text-align: center;
  padding: 80rpx 0;
  color: var(--text-sub);
  font-size: 28rpx;
}
</style>