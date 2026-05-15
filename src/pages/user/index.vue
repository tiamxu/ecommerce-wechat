<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'

import { useUserStore } from '../../store/user'
import { useCartStore } from '../../store/cart'
import { userApi, orderApi, type UserInfo } from '../../api'
import TabBar from '../../components/TabBar.vue'
import { THEME_CLASS } from '../../theme/config'

const userStore = useUserStore()
const cartStore = useCartStore()
const userInfo = ref<UserInfo | null>(null)

// 订单数量统计
const orderCounts = ref({
  pending: 0,
  paid: 0,
  shipped: 0,
  completed: 0
})

onMounted(() => {
  if (userStore.isLoggedIn) {
    loadUserInfo()
    loadOrderCounts()
  }

  uni.$on('refreshUserInfo', () => {
    if (userStore.isLoggedIn) {
      loadUserInfo()
      loadOrderCounts()
    }
  })
})

onShow(() => {
  if (userStore.isLoggedIn) {
    loadUserInfo()
    loadOrderCounts()
  }
})

onPullDownRefresh(() => {
  Promise.all([loadUserInfo(), loadOrderCounts()]).finally(() => {
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

async function loadOrderCounts() {
  try {
    const res = await orderApi.getOrderCounts()
    if (res.code === 200 && res.data) {
      orderCounts.value = res.data
    }
  } catch (error) {
    console.error('加载订单数量失败', error)
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
        cartStore.resetCart()
        userInfo.value = null
      }
    }
  })
}

// 订单tab
const orderTabs = computed(() => [
  { id: '0', text: '待付款', icon: 'wallet', count: orderCounts.value.pending, path: '/pages/order/list?status=0' },
  { id: '1', text: '待发货', icon: 'shop', count: orderCounts.value.paid, path: '/pages/order/list?status=1' },
  { id: '2', text: '待收货', icon: 'cart', count: orderCounts.value.shipped, path: '/pages/order/list?status=2' },
  { id: '3', text: '已完成', icon: 'checkbox', count: orderCounts.value.completed, path: '/pages/order/list?status=3' }
])

// 快捷工具入口
const quickTools = computed(() => [
  { id: 1, icon: 'star', text: '我的收藏', path: '/pages/user/favorite', badge: 0 },
  { id: 2, icon: 'location', text: '收货地址', path: '/pages/address/list', badge: 0 },
  { id: 3, icon: 'help', text: '帮助中心', path: '/pages/user/help', badge: 0 },
  { id: 4, icon: 'chat', text: '意见反馈', path: '/pages/user/feedback', badge: 0 }
])

// 功能入口
const funcItems = computed(() => [
  { id: 1, icon: 'info', text: '关于我们', path: '/pages/about/index' }
])

// 会员等级
const memberLevel = computed(() => {
  // 简单逻辑：普通会员
  return '普通会员'
})

const memberColor = computed(() => {
  return 'rgba(255,255,255,0.6)'
})
</script>

<template>
  <view :class="['user-page', THEME_CLASS]">
    <TabBar />

    <!-- 用户信息区 -->
    <view class="user-header">
      <!-- 顶部工具栏 -->
      <view class="header-toolbar">
        <view class="toolbar-left">
          <uni-icons type="gear" size="22" color="var(--text-inverse)" @click="goTo('/pages/user/settings')" aria-label="设置" />
        </view>
        <text class="header-title">会员中心</text>
        <view class="toolbar-right">
          <uni-icons type="chat" size="22" color="var(--text-inverse)" @click="goTo('/pages/notice/list')" aria-label="消息" />
        </view>
      </view>

      <!-- 用户信息 -->
      <view v-if="userStore.isLoggedIn" class="user-info">
        <view class="avatar" @click="goTo('/pages/user/profile')">
          <image v-if="userInfo?.avatar" :src="userInfo.avatar" class="avatar-img" />
          <text v-else class="avatar-text">{{ (userInfo?.nickname || userInfo?.username || 'U').charAt(0).toUpperCase() }}</text>
        </view>
        <view class="user-content">
          <text class="nickname">{{ userInfo?.nickname || userInfo?.username || '微信用户' }}</text>
          <view class="member-row">
            <text class="member-tag" :style="{ background: memberColor }">{{ memberLevel }}</text>
          </view>
        </view>
        <view class="sign-btn" @click="goTo('/pages/user/sign')">
          <text class="sign-text">签到</text>
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

    <!-- 快捷工具栏 -->
    <view class="quick-tools" v-if="userStore.isLoggedIn">
      <view
        v-for="tool in quickTools"
        :key="tool.id"
        class="quick-item"
        @click="goTo(tool.path)"
      >
        <view class="quick-icon-wrap">
          <uni-icons :type="tool.icon" size="24" color="var(--primary)" />
        </view>
        <text class="quick-text">{{ tool.text }}</text>
      </view>
    </view>

    <!-- 订单入口 -->
    <view class="order-section">
      <view class="section-header" @click="goTo('/pages/order/list')">
        <text class="section-title">我的订单</text>
        <view class="section-more">
          <text>查看全部</text>
          <uni-icons type="right" size="12" color="var(--text-placeholder)" />
        </view>
      </view>
      <view class="order-tabs">
        <view
          v-for="tab in orderTabs"
          :key="tab.id"
          class="order-tab"
          @click="goTo(tab.path)"
        >
          <view class="tab-icon-wrap">
            <uni-icons :type="tab.icon" size="26" />
            <view v-if="tab.count > 0" class="tab-badge">{{ tab.count > 99 ? '99+' : tab.count }}</view>
          </view>
          <text class="tab-text">{{ tab.text }}</text>
        </view>
      </view>
    </view>

    <!-- 功能入口网格 -->
    <view class="func-grid">
      <view
        v-for="item in funcItems"
        :key="item.id"
        class="func-item"
        @click="goTo(item.path)"
      >
        <view class="func-icon-wrap">
          <uni-icons :type="item.icon" size="24" color="var(--primary)" />
        </view>
        <text class="func-text">{{ item.text }}</text>
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
  padding: calc(24rpx + env(safe-area-inset-top)) 32rpx 32rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
}

/* 顶部工具栏 */
.header-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.header-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-inverse);
}

.toolbar-left,
.toolbar-right {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 用户信息 */
.user-info {
  display: flex;
  align-items: center;
}

.user-info.guest {
  opacity: 0.9;
}

.avatar {
  width: 112rpx;
  height: 112rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 56rpx;
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
  font-size: 44rpx;
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
  margin-bottom: 8rpx;
}

.member-row {
  display: flex;
  align-items: center;
}

.member-tag {
  display: inline-block;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: var(--text-inverse);
}

.guest-hint {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

.sign-btn {
  padding: 12rpx 28rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 32rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
}

.sign-text {
  font-size: 26rpx;
  color: var(--text-inverse);
  font-weight: 500;
}

/* 快捷工具栏 */
.quick-tools {
  display: flex;
  padding: 24rpx 16rpx;
  background: var(--bg-card);
  margin: 24rpx;
  border-radius: 16rpx;
  gap: 16rpx;
}

.quick-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.quick-icon-wrap {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  border-radius: 16rpx;

  .uni-icons {
    color: var(--primary);
  }
}

.quick-text {
  font-size: 24rpx;
  color: var(--text-main);
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
  padding: 24rpx 24rpx 16rpx;
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
  gap: 12rpx;
}

.tab-icon-wrap {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  border-radius: 16rpx;
  position: relative;

  .uni-icons {
    color: var(--primary);
  }
}

.tab-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 32rpx;
  height: 32rpx;
  background: var(--accent);
  color: var(--text-inverse);
  font-size: 20rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8rpx;
}

.tab-text {
  font-size: 24rpx;
  color: var(--text-main);
}

/* 功能入口网格 */
.func-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
  background: var(--bg-card);
  margin: 0 24rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.func-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 0;
  border-right: 1rpx solid var(--border);

  &:last-child {
    border-right: none;
  }

  &:active {
    background: var(--bg-page);
  }
}

.func-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  border-radius: 12rpx;
  margin-bottom: 8rpx;
}

.func-text {
  font-size: 24rpx;
  color: var(--text-main);
}

/* 退出登录 */
.logout-section {
  padding: 32rpx 24rpx;
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