<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'

import { useUserStore } from '../../store/user'
import { userApi, type UserInfo } from '../../api'
import TabBar from '../../components/TabBar.vue'
import { THEME_CLASS } from '../../theme/config'

const userStore = useUserStore()
const userInfo = ref<UserInfo | null>(null)

onMounted(() => {
  if (userStore.isLoggedIn) {
    loadUserInfo()
  }

  uni.$on('refreshUserInfo', () => {
    if (userStore.isLoggedIn) {
      loadUserInfo()
    }
  })
})

onShow(() => {
  if (userStore.isLoggedIn) {
    loadUserInfo()
  }
})

onPullDownRefresh(() => {
  loadUserInfo().finally(() => {
    uni.stopPullDownRefresh()
  })
})

onUnmounted(() => {
  uni.$off('refreshUserInfo')
})

async function loadUserInfo() {
  try {
    const res = await userApi.getProfile()
    if (res.code === 200 && res.data) {
      userInfo.value = res.data
      userStore.updateUserInfo(res.data)
    }
  } catch (error) {
    console.error('加载用户信息失败', error)
  }
}

function goTo(path: string) {
  if (path) {
    uni.navigateTo({ url: path })
  }
}

function handleLogin() {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: '/pages/user/login' })
  }
}

function handleLogout() {
  uni.showModal({
    title: '确认',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        userInfo.value = null
      }
    }
  })
}

// 行程tab
const tripTabs = [
  { id: 'planning', text: '规划中', icon: 'calendar', path: '/pages/plan/list?status=planning' },
  { id: 'ongoing', text: '进行中', icon: 'flag', path: '/pages/plan/list?status=ongoing' },
  { id: 'completed', text: '已出行', icon: 'checkbox', path: '/pages/plan/list?status=completed' },
  { id: 'favorite', text: '收藏', icon: 'star', path: '/pages/user/favorite' }
]

// 快捷工具
const quickTools = [
  { id: 1, icon: 'location', text: '常用地址', path: '/pages/address/list' },
  { id: 2, icon: 'help', text: '帮助', path: '/pages/user/help' }
]
</script>

<template>
  <view :class="['user-page', THEME_CLASS]">
    <TabBar />

    <!-- 用户信息区 -->
    <view class="user-header">
      <!-- 用户信息 -->
      <view v-if="userStore.isLoggedIn" class="user-info" @click="goTo('/pages/user/profile')">
        <view class="avatar">
          <image v-if="userInfo?.avatar" :src="userInfo.avatar" class="avatar-img" />
          <text v-else class="avatar-text">{{ (userInfo?.nickname || userInfo?.username || 'U').charAt(0).toUpperCase() }}</text>
        </view>
        <view class="user-content">
          <text class="nickname">{{ userInfo?.nickname || userInfo?.username || '微信用户' }}</text>
        </view>
        <view class="setting-btn" @click.stop="goTo('/pages/user/settings')">
          <uni-icons type="gear" size="22" color="rgba(255,255,255,0.8)" />
        </view>
      </view>

      <!-- 未登录 -->
      <view v-else class="user-info guest" @click="handleLogin">
        <view class="avatar login-avatar">
          <uni-icons type="person" size="40" color="var(--text-inverse)" />
        </view>
        <view class="user-content">
          <text class="nickname">点击登录</text>
          <text class="guest-hint">登录享受更多服务</text>
        </view>
      </view>
    </view>

    <!-- 行程入口 -->
    <view class="order-section">
      <view class="section-header">
        <text class="section-title">我的行程</text>
        <view class="section-more" @click="goTo('/pages/plan/list')">
          <text>查看全部</text>
          <uni-icons type="right" size="12" color="var(--text-placeholder)" />
        </view>
      </view>
      <view class="order-tabs">
        <view
          v-for="tab in tripTabs"
          :key="tab.id"
          class="order-tab"
          @click="goTo(tab.path)"
        >
          <uni-icons :type="tab.icon" size="22" color="var(--primary)" />
          <text class="tab-text">{{ tab.text }}</text>
        </view>
      </view>
    </view>

    <!-- 快捷工具 -->
    <view class="quick-tools" v-if="userStore.isLoggedIn">
      <view
        v-for="tool in quickTools"
        :key="tool.id"
        class="quick-item"
        @click="goTo(tool.path)"
      >
        <uni-icons :type="tool.icon" size="22" color="var(--text-main)" />
        <text class="quick-text">{{ tool.text }}</text>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="func-list">
      <view class="func-item" @click="goTo('/pages/user/feedback')">
        <uni-icons type="chat" size="20" color="var(--text-main)" />
        <text class="func-text">意见反馈</text>
        <uni-icons type="right" size="14" color="var(--text-placeholder)" />
      </view>
      <view class="func-item" @click="goTo('/pages/user/feedback-list')">
        <uni-icons type="flag" size="20" color="var(--text-main)" />
        <text class="func-text">我的反馈</text>
        <uni-icons type="right" size="14" color="var(--text-placeholder)" />
      </view>
      <view class="func-item" @click="goTo('/pages/about/index')">
        <uni-icons type="info" size="20" color="var(--text-main)" />
        <text class="func-text">关于我们</text>
        <uni-icons type="right" size="14" color="var(--text-placeholder)" />
      </view>
    </view>

    <!-- 退出登录 -->
    <view v-if="userStore.isLoggedIn" class="logout-section">
      <text class="logout-btn" @click="handleLogout">退出登录</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.user-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

/* 用户头部 */
.user-header {
  padding: calc(64rpx + env(safe-area-inset-top)) 32rpx 48rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
}

.user-info {
  display: flex;
  align-items: center;
}

.user-info.guest {
  opacity: 0.9;
}

.avatar {
  width: 96rpx;
  height: 96rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  overflow: hidden;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.avatar-text {
  font-size: 40rpx;
  font-weight: 600;
  color: var(--text-inverse);
}

.login-avatar {
  background: rgba(255, 255, 255, 0.15);
}

.user-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: 36rpx;
  font-weight: 600;
  color: var(--text-inverse);
}

.guest-hint {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 4rpx;
}

.setting-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 订单入口 */
.order-section {
  background: var(--bg-card);
  margin: 24rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 24rpx 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-main);
}

.section-more {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-size: 24rpx;
  color: var(--text-sub);
}

.order-tabs {
  display: flex;
  padding: 16rpx 0 24rpx;
}

.order-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 0;
}

.tab-text {
  font-size: 28rpx;
  color: var(--text-main);
}

/* 快捷工具 */
.quick-tools {
  display: flex;
  background: var(--bg-card);
  margin: 0 24rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.quick-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 0;
  gap: 8rpx;

  &:active {
    background: var(--bg-page);
  }
}

.quick-text {
  font-size: 24rpx;
  color: var(--text-main);
}

/* 功能列表 */
.func-list {
  background: var(--bg-card);
  margin: 24rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.func-item {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid var(--border);

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: var(--bg-page);
  }
}

.func-text {
  flex: 1;
  margin-left: 20rpx;
  font-size: 28rpx;
  color: var(--text-main);
}

/* 退出登录 */
.logout-section {
  padding: 0 24rpx;
}

.logout-btn {
  display: block;
  width: 100%;
  padding: 28rpx;
  background: var(--bg-card);
  color: var(--text-sub);
  text-align: center;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 500;

  &:active {
    opacity: 0.7;
  }
}
</style>