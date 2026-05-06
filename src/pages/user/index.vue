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

// uni-app 页面生命周期
let refreshTimer: number | null = null

onMounted(() => {
  if (userStore.isLoggedIn) {
    loadUserInfo()
    loadOrderCounts()
  }

  // 监听刷新事件
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

// 下拉刷新
onPullDownRefresh(() => {
  Promise.all([loadUserInfo(), loadOrderCounts()]).finally(() => {
    uni.stopPullDownRefresh()
  })
})

onUnmounted(() => {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
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
    // 跳转到登录页面，而不是直接调用 login()
    // 因为 login() 会用缓存的 openid，跳过获取手机号
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

const orderTabs = computed(() => [
  { id: '0', text: '待付款', icon: 'wallet', path: '/pages/order/list?status=0', count: orderCounts.value.pending },
  { id: '1', text: '待发货', icon: 'box', path: '/pages/order/list?status=1', count: orderCounts.value.paid },
  { id: '2', text: '待收货', icon: 'car', path: '/pages/order/list?status=2', count: orderCounts.value.shipped },
  { id: '3', text: '已完成', icon: 'check', path: '/pages/order/list?status=3', count: orderCounts.value.completed }
])

const menuItems = [
  { id: 1, icon: 'location', text: '收货地址', path: '/pages/address/list' },
  { id: 2, icon: 'help', text: '帮助中心', path: '/pages/user/help' },
  { id: 3, icon: 'chat', text: '意见反馈', path: '/pages/user/feedback' },
  { id: 4, icon: 'star', text: '关于我们', path: '/pages/about/index' }
]

const accountItems = [
  { id: 5, icon: 'locked', text: '修改密码', path: '/pages/user/password' }
]

// 检查是否需要完善资料（没有手机号）
const needBind = computed(() => {
  return !userInfo.value?.phone && !userInfo.value?.email
})
</script>

<template>
  <view :class="['user-page', THEME_CLASS]">
    <TabBar />

    <!-- 用户头部 -->
    <view class="user-header">
      <view v-if="userStore.isLoggedIn" class="user-info">
        <view class="avatar" @click="needBind && goTo('/pages/user/bind-account')">
          <image v-if="userInfo?.avatar" :src="userInfo.avatar" class="avatar-img" />
          <text v-else class="avatar-text">{{ (userInfo?.nickname || userInfo?.username || 'U').charAt(0).toUpperCase() }}</text>
        </view>
        <view class="user-detail">
          <text class="nickname">{{ userInfo?.nickname || userInfo?.username || '微信用户' }}</text>
          <view v-if="needBind" class="bind-tip" @click="goTo('/pages/user/bind-account')">
            <text>点击绑定手机号</text>
          </view>
        </view>
      </view>
      <view v-else class="login-prompt" @click="handleLogin">
        <view class="avatar login-avatar">
          <uni-icons type="person" size="40" color="var(--text-placeholder)" />
        </view>
        <view class="login-content">
          <text class="login-title">登录后可享受更多服务</text>
          <view class="login-btn">
            <text>登录/注册</text>
          </view>
        </view>
        <uni-icons type="right" size="16" color="var(--text-placeholder)" />
      </view>
    </view>

    <!-- 订单入口 -->
    <view class="order-section" v-if="userStore.isLoggedIn">
      <view class="section-header" @click="goTo('/pages/order/list')">
        <text class="section-title">我的订单</text>
        <view class="section-more">
          <text>全部订单</text>
          <uni-icons type="right" size="12" color="var(--text-placeholder)" />
        </view>
      </view>
      <view class="order-tabs">
        <view
          v-for="tab in orderTabs"
          :key="tab.id"
          class="order-tab active"
          @click="goTo(tab.path)"
        >
          <view class="tab-icon-wrap">
            <uni-icons :type="tab.icon" size="28" />
            <view v-if="tab.count > 0" class="tab-badge">{{ tab.count > 99 ? '99+' : tab.count }}</view>
          </view>
          <text class="tab-text">{{ tab.text }}</text>
        </view>
      </view>
    </view>

    <!-- 登录提示订单入口 -->
    <view class="order-section" v-else>
      <view class="section-header">
        <text class="section-title">我的订单</text>
      </view>
      <view class="order-tabs">
        <view v-for="tab in orderTabs" :key="tab.id" class="order-tab disabled">
          <view class="tab-icon-wrap">
            <uni-icons :type="tab.icon" size="28" />
          </view>
          <text class="tab-text">{{ tab.text }}</text>
        </view>
      </view>
    </view>

    <!-- 常用功能 -->
    <view class="menu-section">
      <view class="section-header">
        <text class="section-title">常用服务</text>
      </view>
      <view
        v-for="(item, index) in menuItems"
        :key="item.id"
        class="menu-item"
        @click="item.path ? goTo(item.path) : uni.showToast({ title: '功能开发中', icon: 'none' })"
      >
        <view class="menu-left">
          <view class="menu-icon-wrap">
            <uni-icons :type="item.icon" size="22" color="var(--primary)" />
          </view>
          <text class="menu-text">{{ item.text }}</text>
        </view>
        <uni-icons type="right" size="14" color="var(--text-placeholder)" />
      </view>
    </view>

    <!-- 账户安全 -->
    <view class="menu-section">
      <view class="section-header">
        <text class="section-title">账户安全</text>
      </view>
      <view
        v-for="item in accountItems"
        :key="item.id"
        class="menu-item"
        @click="item.path ? goTo(item.path) : uni.showToast({ title: '功能开发中', icon: 'none' })"
      >
        <view class="menu-left">
          <view class="menu-icon-wrap">
            <uni-icons :type="item.icon" size="22" color="var(--primary)" />
          </view>
          <text class="menu-text">{{ item.text }}</text>
        </view>
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
  padding: 48rpx 32rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 60rpx;
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
  font-size: 48rpx;
  font-weight: 600;
  color: #ffffff;
}

.user-detail {
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: 36rpx;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.bind-tip {
  color: rgba(255, 255, 255, 0.6);
  font-size: 24rpx;
  margin-top: 8rpx;
}

.login-prompt {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
}

.login-avatar {
  background: rgba(255, 255, 255, 0.2);
  margin-right: 20rpx;
}

.login-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.login-title {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.login-btn {
  display: inline-block;
  padding: 12rpx 32rpx;
  background: #ffffff;
  color: var(--primary);
  font-size: 26rpx;
  font-weight: 600;
  border-radius: 40rpx;
  width: fit-content;
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

  &.disabled {
    opacity: 0.5;
  }
}

.tab-icon-wrap {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-page);
  border-radius: 16rpx;
  position: relative;
}

.tab-icon-wrap .uni-icons {
  color: var(--text-placeholder) !important;
}

.order-tab:not(.disabled) .tab-icon-wrap .uni-icons {
  color: var(--text-main) !important;
}

.tab-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 8rpx;
  background: var(--accent);
  color: #fff;
  font-size: 20rpx;
  font-weight: 600;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-text {
  font-size: 24rpx;
  color: var(--text-main);
}

/* 菜单区块 */
.menu-section {
  background: var(--bg-card);
  margin: 0 24rpx 24rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid var(--border);

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: var(--bg-page);
  }
}

.menu-left {
  display: flex;
  align-items: center;
}

.menu-icon-wrap {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  border-radius: 12rpx;
  margin-right: 20rpx;
}

.menu-text {
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
  color: var(--accent);
  text-align: center;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 500;

  &:active {
    opacity: 0.8;
  }
}
</style>
