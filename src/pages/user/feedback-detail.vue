<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { feedbackApi, type FeedbackItem } from '../../api'
import { useUserStore } from '../../store/user'
import { THEME_CLASS } from '../../theme/config'

const userStore = useUserStore()
const loading = ref(false)
const feedback = ref<FeedbackItem | null>(null)

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
  loadDetail()
})

async function loadDetail() {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const id = currentPage?.options?.id

  if (!id) {
    uni.showToast({ title: '参数错误', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const res = await feedbackApi.detail(Number(id))
    if (res.code === 200 && res.data) {
      feedback.value = res.data
    } else {
      uni.showToast({ title: res.message || '加载失败', icon: 'none' })
    }
  } catch (error) {
    console.error('加载反馈详情失败', error)
    uni.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function formatTime(timeStr: string): string {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}/${month}/${day} ${hour}:${minute}`
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
  <view :class="['feedback-detail-page', THEME_CLASS]">
    <!-- 加载中 -->
    <view v-if="loading" class="loading-container">
      <text>加载中...</text>
    </view>

    <!-- 内容 -->
    <view v-else-if="feedback" class="detail-content">
      <!-- 头部信息 -->
      <view class="detail-header">
        <view class="header-top">
          <view class="category-tag">{{ categoryMap[feedback.category] || feedback.category }}</view>
          <view class="status-badge" :class="getStatusClass(feedback.status)">
            <text>{{ statusMap[feedback.status] || '待处理' }}</text>
          </view>
        </view>
        <view class="feedback-title">{{ feedback.subject }}</view>
        <view class="feedback-time">{{ formatTime(feedback.createdAt) }}</view>
      </view>

      <!-- 反馈内容 -->
      <view class="section">
        <view class="section-title">反馈内容</view>
        <view class="section-body">{{ feedback.content }}</view>
      </view>

      <!-- 图片 -->
      <view v-if="feedback.images && feedback.images.length > 0" class="section">
        <view class="section-title">图片</view>
        <view class="image-list">
          <image
            v-for="(img, index) in feedback.images"
            :key="index"
            :src="img"
            class="feedback-image"
            mode="aspectFill"
            @click="uni.previewImage({ urls: feedback.images!, current: img })"
          />
        </view>
      </view>

      <!-- 回复 -->
      <view v-if="feedback.reply" class="section reply-section">
        <view class="section-title">官方回复</view>
        <view class="reply-body">{{ feedback.reply }}</view>
        <view v-if="feedback.repliedAt" class="reply-time">{{ formatTime(feedback.repliedAt) }}</view>
      </view>

      <!-- 关闭时间 -->
      <view v-if="feedback.status === 4 && feedback.closedAt" class="section">
        <view class="closed-tip">
          <text>已于 {{ formatTime(feedback.closedAt) }} 关闭此反馈</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-tip">
      <text>内容不存在</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.feedback-detail-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding: 24rpx 32rpx;
}

.loading-container,
.empty-tip {
  text-align: center;
  padding: 120rpx 0;
  color: var(--text-sub);
  font-size: 28rpx;
}

/* 头部信息 */
.detail-header {
  background: var(--bg-card);
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
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

.feedback-title {
  font-size: 34rpx;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.4;
  margin-bottom: 16rpx;
}

.feedback-time {
  font-size: 22rpx;
  color: var(--text-placeholder);
}

/* 通用区块 */
.section {
  background: var(--bg-card);
  border-radius: 16rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 16rpx;
}

.section-body {
  font-size: 28rpx;
  color: var(--text-sub);
  line-height: 1.6;
}

/* 图片 */
.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.feedback-image {
  width: 180rpx;
  height: 180rpx;
  border-radius: 12rpx;
}

/* 回复 */
.reply-section {
  background: var(--primary-light);
}

.reply-body {
  font-size: 28rpx;
  color: var(--text-main);
  line-height: 1.6;
  margin-bottom: 16rpx;
}

.reply-time {
  font-size: 22rpx;
  color: var(--text-sub);
}

/* 关闭提示 */
.closed-tip {
  text-align: center;
  font-size: 26rpx;
  color: var(--text-placeholder);
  padding: 16rpx 0;
}
</style>