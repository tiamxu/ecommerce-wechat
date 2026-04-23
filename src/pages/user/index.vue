<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '../../store/user'
import { userApi, type UserInfo } from '../../api'
import TabBar from '../../components/TabBar.vue'
import { THEME_CLASS } from '../../theme/config'

const userStore = useUserStore()
const loading = ref(false)
const userInfo = ref<UserInfo | null>(null)

// 是否有手机号（决定了是否能修改密码）
const hasPhone = computed(() => !!userInfo.value?.phone)

// 菜单项（根据是否有手机号动态显示）
const menuItems = computed(() => {
  const items = [
    { id: 1, icon: '📋', text: '我的订单', path: '/pages/order/list' },
    { id: 2, icon: '❤️', text: '我的收藏', path: '' },
    { id: 3, icon: '📍', text: '收货地址', path: '/pages/address/list' },
    { id: 4, icon: '✏️', text: '编辑资料', path: '/pages/user/edit' }
  ]
  // 如果没有手机号，显示绑定手机号；否则显示修改密码
  if (!hasPhone.value) {
    items.push({ id: 5, icon: '📱', text: '绑定手机号', path: '/pages/user/bind-phone' })
  } else {
    items.push({ id: 5, icon: '🔑', text: '修改密码', path: '/pages/user/password' })
  }
  items.push({ id: 6, icon: '⚙️', text: '设置', path: '' })
  return items
})

onMounted(() => {
  if (userStore.isLoggedIn) {
    loadUserInfo()
  }
})

async function loadUserInfo() {
  loading.value = true
  try {
    const res = await userApi.getProfile()
    if (res.code === 200 && res.data) {
      userInfo.value = res.data
      userStore.updateUserInfo(res.data)
    }
  } catch (error) {
    console.error('加载用户信息失败', error)
  } finally {
    loading.value = false
  }
}

function handleMenuClick(item: typeof menuItems.value[0]) {
  if (item.path) {
    uni.navigateTo({ url: item.path })
  } else if (item.text === '我的收藏' || item.text === '设置') {
    uni.showToast({ title: '功能开发中', icon: 'none' })
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
        userInfo.value = null
      }
    }
  })
}
</script>

<template>
  <view :class="['user-page', THEME_CLASS]">
    <TabBar />
    <!-- 用户头部 -->
    <view class="user-header">
      <view v-if="userStore.isLoggedIn" class="user-info">
        <view class="avatar">
          <image v-if="userInfo?.avatar" :src="userInfo.avatar" class="avatar-img" />
          <text v-else class="avatar-text">{{ (userInfo?.nickname || userInfo?.username || 'U').charAt(0).toUpperCase() }}</text>
        </view>
        <view class="user-detail">
          <text class="nickname">{{ userInfo?.nickname || userInfo?.username || '微信用户' }}</text>
          <text v-if="userInfo?.phone" class="phone">{{ userInfo.phone }}</text>
          <text v-else class="phone bind-tip">未绑定手机号</text>
        </view>
      </view>
      <view v-else class="login-prompt" @click="handleLogin">
        <view class="avatar login-avatar">
          <text class="avatar-text">?</text>
        </view>
        <text class="login-text">点击登录</text>
      </view>
    </view>

    <!-- 用户信息卡片 -->
    <view v-if="userStore.isLoggedIn && userInfo" class="info-card">
      <view class="info-row">
        <text class="info-label">用户ID</text>
        <text class="info-value">{{ userInfo.id }}</text>
      </view>
      <view v-if="userInfo.createdAt" class="info-row">
        <text class="info-label">注册时间</text>
        <text class="info-value">{{ userInfo.createdAt }}</text>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-section">
      <view
        v-for="item in menuItems"
        :key="item.id"
        class="menu-item"
        @click="handleMenuClick(item)"
      >
        <text class="menu-icon">{{ item.icon }}</text>
        <text class="menu-text">{{ item.text }}</text>
        <text class="menu-arrow">›</text>
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
  color: var(--text-inverse);
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

.phone, .email {
  font-size: 24rpx;
  color: var(--text-sub);
  margin-top: 4rpx;
}

.bind-tip {
  color: var(--accent);
}

.login-text {
  font-size: 32rpx;
  color: var(--primary);
}

.info-card {
  background: var(--bg-card);
  padding: 24rpx 32rpx;
  margin-bottom: 24rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 0;
}

.info-label {
  font-size: 26rpx;
  color: var(--text-sub);
}

.info-value {
  font-size: 26rpx;
  color: var(--text-main);
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
  color: var(--accent);
  text-align: center;
  border-radius: 16rpx;
  font-size: 28rpx;

  &:active {
    opacity: 0.8;
  }
}
</style>