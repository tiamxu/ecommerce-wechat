<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../../store/user'
import { useCartStore } from '../../store/cart'
import { THEME_CLASS } from '../../theme/config'

const userStore = useUserStore()
const cartStore = useCartStore()

const userInfo = computed(() => userStore.userInfo)

function maskPhone(phone: string | undefined): string {
  if (!phone) return '未绑定'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

function maskEmail(email: string | undefined): string {
  if (!email) return '未绑定'
  return email.replace(/(.{2}).+(@.+)/, '$1***$2')
}

function goTo(path: string) {
  if (path) {
    uni.navigateTo({ url: path })
  }
}

function handleLogin() {
  uni.navigateTo({ url: '/pages/user/login' })
}

function handleLogout() {
  uni.showModal({
    title: '确认',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        userStore.logout()
        cartStore.resetCart()
        setTimeout(() => {
          uni.navigateBack()
        }, 500)
      }
    }
  })
}
</script>

<template>
  <view :class="['settings-page', THEME_CLASS]">
    <!-- 用户信息卡片 -->
    <view class="user-card" @click="userStore.isLoggedIn ? goTo('/pages/user/profile') : handleLogin()">
      <view class="user-info-row">
        <view class="avatar">
          <image v-if="userInfo?.avatar" :src="userInfo.avatar" class="avatar-img" />
          <text v-else class="avatar-text">{{ (userInfo?.nickname || userInfo?.username || 'U').charAt(0).toUpperCase() }}</text>
        </view>
        <view class="user-detail">
          <text class="nickname">{{ userStore.isLoggedIn ? (userInfo?.nickname || userInfo?.username || '微信用户') : '点击登录' }}</text>
          <text v-if="userStore.isLoggedIn" class="user-id">ID: {{ userInfo?.id || '-' }}</text>
          <text v-else class="login-hint">登录后享受更多服务</text>
        </view>
        <uni-icons v-if="userStore.isLoggedIn" type="right" size="16" color="var(--text-placeholder)" />
      </view>
    </view>

    <!-- 账号安全（仅登录用户显示） -->
    <view v-if="userStore.isLoggedIn" class="section">
      <text class="section-title">账号安全</text>
      <view class="section-list">
        <view class="list-item" @click="goTo('/pages/user/edit?type=phone')">
          <text class="item-label">手机号</text>
          <view class="item-value">
            <text class="value-text">{{ maskPhone(userInfo?.phone) }}</text>
            <uni-icons type="right" size="14" color="var(--text-placeholder)" />
          </view>
        </view>
        <view class="list-item" @click="goTo('/pages/user/edit?type=email')">
          <text class="item-label">邮箱</text>
          <view class="item-value">
            <text class="value-text">{{ maskEmail(userInfo?.email) }}</text>
            <uni-icons type="right" size="14" color="var(--text-placeholder)" />
          </view>
        </view>
        <view class="list-item" @click="goTo('/pages/user/password')">
          <text class="item-label">密码</text>
          <view class="item-value">
            <text class="value-text">点击设置</text>
            <uni-icons type="right" size="14" color="var(--text-placeholder)" />
          </view>
        </view>
      </view>
    </view>

    <!-- 退出登录（仅登录用户显示） -->
    <view v-if="userStore.isLoggedIn" class="logout-section">
      <text class="logout-btn" @click="handleLogout">退出登录</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.settings-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

/* 用户信息卡片 */
.user-card {
  background: var(--bg-card);
  margin: 24rpx;
  border-radius: 16rpx;
  padding: 32rpx;
}

.user-info-row {
  display: flex;
  align-items: center;

  &:active {
    opacity: 0.7;
  }
}

.avatar {
  width: 96rpx;
  height: 96rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  border-radius: 48rpx;
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

.avatar-text {
  font-size: 40rpx;
  font-weight: 600;
  color: var(--text-inverse);
}

.user-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 8rpx;
}

.user-id {
  font-size: 24rpx;
  color: var(--text-sub);
}

.login-hint {
  font-size: 24rpx;
  color: var(--text-sub);
}

/* 分组区块 */
.section {
  background: var(--bg-card);
  margin: 0 24rpx 24rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.section-title {
  display: block;
  padding: 24rpx 32rpx 16rpx;
  font-size: 26rpx;
  color: var(--text-sub);
}

.section-list {
  border-top: 1rpx solid var(--border);
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid var(--border);

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background: var(--bg-page);
  }
}

.item-label {
  font-size: 28rpx;
  color: var(--text-main);
}

.item-value {
  display: flex;
  align-items: center;
}

.value-text {
  font-size: 26rpx;
  color: var(--text-sub);
  margin-right: 8rpx;
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
    opacity: 0.7;
  }
}
</style>