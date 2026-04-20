<script setup lang="ts">
import { useUserStore } from '../../store/user'

const userStore = useUserStore()

const menuItems = [
  { id: 1, icon: '📋', text: 'my.order', path: '/pages/order/list' },
  { id: 2, icon: '❤️', text: 'my.favorite', path: '' },
  { id: 3, icon: '📍', text: 'my.address', path: '/pages/address/list' },
  { id: 4, icon: '⚙️', text: 'my.settings', path: '' }
]

function handleMenuClick(path: string) {
  if (path) {
    uni.navigateTo({ url: path })
  }
}

function handleLogin() {
  if (!userStore.isLoggedIn) {
    userStore.login()
  }
}

function handleLogout() {
  uni.showModal({
    title: '确认',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
      }
    }
  })
}
</script>

<template>
  <view class="user-page">
    <!-- 用户头部 -->
    <view class="user-header">
      <view v-if="userStore.isLoggedIn" class="user-info">
        <view class="avatar">
          <image v-if="userStore.userInfo?.avatar" :src="userStore.userInfo.avatar" class="avatar-img" />
          <text v-else class="avatar-text">{{ userStore.userInfo?.nickname?.charAt(0) || 'U' }}</text>
        </view>
        <view class="user-detail">
          <text class="nickname">{{ userStore.userInfo?.nickname || '用户' }}</text>
          <text v-if="userStore.userInfo?.phone" class="phone">{{ userStore.userInfo.phone }}</text>
        </view>
      </view>
      <view v-else class="login-prompt" @click="handleLogin">
        <view class="avatar login-avatar">
          <text class="avatar-text">?</text>
        </view>
        <text class="login-text">{{ $t('user.login') }}</text>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-section">
      <view
        v-for="item in menuItems"
        :key="item.id"
        class="menu-item"
        @click="handleMenuClick(item.path)"
      >
        <text class="menu-icon">{{ item.icon }}</text>
        <text class="menu-text">{{ $t(item.text) }}</text>
        <text class="menu-arrow">></text>
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
}

.user-header {
  padding: 60rpx 32rpx;
  background: var(--bg-card);
  margin-bottom: 24rpx;
}

.user-info, .login-prompt {
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  border-radius: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.login-avatar {
  background: var(--border);
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
  color: var(--text-main);
  margin-bottom: 8rpx;
}

.phone {
  font-size: 24rpx;
  color: var(--text-sub);
}

.login-text {
  font-size: 32rpx;
  color: var(--primary);
}

.menu-section {
  background: var(--bg-card);
  margin-bottom: 24rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid var(--border);

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: var(--bg-page);
  }
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.menu-text {
  flex: 1;
  font-size: 28rpx;
  color: var(--text-main);
}

.menu-arrow {
  font-size: 28rpx;
  color: var(--text-placeholder);
}

.logout-section {
  padding: 32rpx;
}

.logout-btn {
  display: block;
  width: 100%;
  padding: 24rpx;
  background: var(--bg-card);
  color: var(--text-sub);
  text-align: center;
  border-radius: 16rpx;
  font-size: 28rpx;

  &:active {
    opacity: 0.8;
  }
}
</style>