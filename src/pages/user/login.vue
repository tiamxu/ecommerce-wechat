<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../../store/user'
import { THEME_CLASS } from '../../theme/config'

const userStore = useUserStore()
const loading = ref(false)

// 登录方式：wechat=微信登录，account=账户密码登录
const loginType = ref<'wechat' | 'account'>('wechat')

// 账户密码登录表单
const accountForm = ref({
  account: '',
  password: ''
})

// 切换登录方式
function switchLoginType(type: 'wechat' | 'account') {
  loginType.value = type
}

// 微信登录
async function handleLogin() {
  loading.value = true
  try {
    const loginRes = await new Promise<WechatMiniprogram.LoginSuccessCallbackResult>((resolve, reject) => {
      uni.login({ provider: 'weixin', success: resolve, fail: reject })
    })

    if (!loginRes.code) {
      throw new Error('获取登录凭证失败')
    }

    const result = await userStore.loginWithWechatCode(loginRes.code)

    if (result.success) {
      if (result.need_bind) {
        uni.showToast({ title: '请先完善账号信息', icon: 'none' })
        setTimeout(() => {
          uni.navigateTo({ url: '/pages/user/bind-account' })
        }, 1500)
        return
      }
      // 登录成功，强制刷新用户信息
      uni.$emit('refreshUserInfo')
      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        const pages = getCurrentPages()
        if (pages.length > 1) {
          uni.navigateBack()
        } else {
          uni.switchTab({ url: '/pages/index/index' })
        }
      }, 1500)
    } else {
      uni.showToast({ title: result.message || '登录失败', icon: 'none' })
    }
  } catch (error: any) {
    console.error('登录失败', error)
    uni.showToast({ title: error.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

// 账户密码登录
async function handleAccountLogin() {
  const { account, password } = accountForm.value

  if (!account) {
    uni.showToast({ title: '请输入账号', icon: 'none' })
    return
  }
  if (!password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const result = await userStore.loginWithAccount(account, password)

    if (result.success) {
      // 登录成功，强制刷新用户信息
      uni.$emit('refreshUserInfo')
      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        const pages = getCurrentPages()
        if (pages.length > 1) {
          uni.navigateBack()
        } else {
          uni.switchTab({ url: '/pages/index/index' })
        }
      }, 1500)
    } else {
      uni.showToast({ title: result.message || '登录失败', icon: 'none' })
    }
  } catch (error: any) {
    console.error('登录失败', error)
    uni.showToast({ title: error.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goShopping() {
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<template>
  <view :class="['login-page', THEME_CLASS]">
    <!-- 顶部背景 -->
    <view class="header-bg">
      <view class="wave"></view>
    </view>

    <!-- 内容区 -->
    <view class="content">
      <!-- Logo 区 -->
      <view class="logo-section">
        <view class="logo-wrapper">
          <view class="logo-circle">
            <text class="logo-text">购</text>
          </view>
        </view>
      </view>

      <!-- 文字区 -->
      <view class="text-section">
        <text class="title">欢迎来到商城</text>
        <text class="subtitle">一键登录，畅享购物</text>
      </view>

      <!-- 登录方式切换 -->
      <view class="login-tabs">
        <view
          :class="['tab-item', loginType === 'wechat' ? 'active' : '']"
          @click="switchLoginType('wechat')"
        >
          <uni-icons type="weixin" size="20" color="inherit" />
          <text class="tab-text">微信登录</text>
        </view>
        <view
          :class="['tab-item', loginType === 'account' ? 'active' : '']"
          @click="switchLoginType('account')"
        >
          <uni-icons type="staff" size="20" color="inherit" />
          <text class="tab-text">账户登录</text>
        </view>
      </view>

      <!-- 微信登录按钮 -->
      <view v-show="loginType === 'wechat'" class="btn-section">
        <button
          class="login-btn wechat-btn"
          :class="{ loading }"
          :disabled="loading"
          @click="handleLogin"
        >
          <uni-icons type="weixin" size="24" color="inherit" />
          <text v-if="loading">登录中...</text>
          <text v-else>微信登录</text>
        </button>
        <text class="btn-tip">登录即表示同意《用户协议》和《隐私政策》</text>
      </view>

      <!-- 账户密码登录表单 -->
      <view v-show="loginType === 'account'" class="account-section">
        <view class="account-form">
          <view class="form-item">
            <uni-icons type="person" size="22" color="var(--text-placeholder)" />
            <input
              v-model="accountForm.account"
              class="form-input"
              type="text"
              placeholder="手机号/邮箱/用户名"
              placeholder-class="input-placeholder"
            />
          </view>
          <view class="form-divider"></view>
          <view class="form-item">
            <uni-icons type="locked" size="22" color="var(--text-placeholder)" />
            <input
              v-model="accountForm.password"
              class="form-input"
              type="password"
              password
              placeholder="请输入密码"
              placeholder-class="input-placeholder"
            />
          </view>
        </view>
        <button
          class="login-btn account-btn"
          :class="{ loading }"
          :disabled="loading"
          @click="handleAccountLogin"
        >
          <text v-if="loading">登录中...</text>
          <text v-else>登录</text>
        </button>
      </view>

      <!-- 底部链接 -->
      <view class="footer">
        <text class="skip-btn" @click="goShopping">暂不登录，先看看</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  background: var(--bg-page);
  position: relative;
}

/* 顶部背景 */
.header-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 380rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  z-index: 0;
  overflow: hidden;
}

.wave {
  position: absolute;
  bottom: -1rpx;
  left: 0;
  right: 0;
  height: 60rpx;
  background: var(--bg-page);
  border-radius: 50% 50% 0 0;
}

.content {
  position: relative;
  z-index: 1;
  padding: 280rpx 48rpx 64rpx;
}

/* Logo 区 */
.logo-section {
  display: flex;
  justify-content: center;
  margin-bottom: 48rpx;
}

.logo-wrapper {
  position: relative;
}

.logo-circle {
  width: 140rpx;
  height: 140rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.15);
}

.logo-text {
  font-size: 72rpx;
  font-weight: 700;
  color: var(--primary);
}

/* 文字区 */
.text-section {
  text-align: center;
  margin-bottom: 56rpx;
}

.title {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 12rpx;
}

.subtitle {
  display: block;
  font-size: 26rpx;
  color: var(--text-sub);
}

/* 登录方式切换 */
.login-tabs {
  display: flex;
  background: var(--bg-card);
  border-radius: 20rpx;
  padding: 8rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  height: 80rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  color: var(--text-placeholder);

  &.active {
    background: var(--primary);
    color: var(--text-inverse);
    box-shadow: 0 4rpx 16rpx var(--primary-light);
  }
}

/* 微信登录按钮 */
.btn-section {
  margin-bottom: 40rpx;
}

.login-btn {
  width: 100%;
  height: 100rpx;
  border-radius: 50rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  font-size: 32rpx;
  font-weight: 600;

  &::after {
    border: none;
  }

  &.loading {
    opacity: 0.7;
  }
}

.wechat-btn {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  color: var(--text-inverse);
  box-shadow: 0 8rpx 32rpx var(--shadow);
}

.account-btn {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  color: var(--text-inverse);
  box-shadow: 0 8rpx 32rpx var(--shadow);
}

.btn-tip {
  display: block;
  text-align: center;
  font-size: 22rpx;
  color: var(--text-placeholder);
  margin-top: 24rpx;
  line-height: 1.5;
}

/* 账户登录表单 */
.account-section {
  margin-bottom: 40rpx;
}

.account-form {
  background: var(--bg-card);
  border-radius: 24rpx;
  padding: 8rpx 24rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.05);
}

.form-item {
  display: flex;
  align-items: center;
  height: 100rpx;
  gap: 20rpx;
}

.form-divider {
  height: 1rpx;
  background: var(--border);
  margin: 0 -24rpx;
}

.form-input {
  flex: 1;
  height: 100%;
  font-size: 28rpx;
  color: var(--text-main);

  &::placeholder {
    color: var(--text-placeholder);
  }
}

.input-placeholder {
  color: var(--text-placeholder);
}

/* 底部链接 */
.footer {
  text-align: center;
  padding-top: 24rpx;
}

.skip-btn {
  font-size: 26rpx;
  color: var(--text-placeholder);
  padding: 16rpx 24rpx;
}
</style>
