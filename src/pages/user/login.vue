<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../../store/user'
import { THEME_CLASS } from '../../theme/config'

const userStore = useUserStore()
const loading = ref(false)
const showAccount = ref(false)

// 账户密码登录表单
const accountForm = ref({
  account: '',
  password: ''
})

// 密码显示/隐藏
const showPassword = ref(false)

// 切换账户密码登录显示
function toggleAccount() {
  showAccount.value = !showAccount.value
}

// 微信一键登录（获取手机号）
async function onGetPhoneNumber(e: any) {
  if (e.detail.errMsg !== 'getPhoneNumber:ok') {
    // 用户拒绝授权，提示可使用账户密码登录
    uni.showToast({ title: '可使用账户密码登录', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const loginRes = await new Promise<WechatMiniprogram.LoginSuccessCallbackResult>((resolve, reject) => {
      uni.login({ provider: 'weixin', success: resolve, fail: reject })
    })

    if (!loginRes.code) {
      throw new Error('获取登录凭证失败')
    }

    const result = await userStore.loginWithWechat(loginRes.code, e.detail.encryptedData, e.detail.iv)

    if (result.success) {
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
      uni.showToast({ title: result.message || '一键登录失败', icon: 'none' })
    }
  } catch (error: any) {
    console.error('一键登录失败', error)
    uni.showToast({ title: error.message || '一键登录失败', icon: 'none' })
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

      <!-- 微信一键登录按钮 -->
      <view class="btn-section">
        <button
          class="login-btn wechat-btn"
          :class="{ loading }"
          :disabled="loading"
          open-type="getPhoneNumber"
          @getphonenumber="onGetPhoneNumber"
        >
          <uni-icons type="weixin" size="24" color="inherit" />
          <text v-if="loading">登录中...</text>
          <text v-else>微信一键登录</text>
        </button>
      </view>

      <!-- 其他登录方式折叠 -->
      <view class="fold-section">
        <view class="fold-header" @click="toggleAccount">
          <text class="fold-text">其他登录方式</text>
          <uni-icons :type="showAccount ? 'up' : 'down'" size="14" color="var(--text-placeholder)" />
        </view>

        <view v-show="showAccount" class="fold-content">
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
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                placeholder-class="input-placeholder"
              />
              <view class="password-toggle" @click="showPassword = !showPassword">
                <uni-icons :type="showPassword ? 'eye' : 'eye-slash'" size="20" color="var(--text-placeholder)" />
              </view>
            </view>
          </view>
          <button
            class="login-btn account-btn"
            :class="{ loading }"
            :disabled="loading"
            @click="handleAccountLogin"
          >
            <text v-if="loading">登录中...</text>
            <text v-else>账户密码登录</text>
          </button>
        </view>
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

/* 微信登录按钮 */
.btn-section {
  margin-bottom: 48rpx;
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

  &:active {
    transform: scale(0.98);
  }
}

.wechat-btn {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  color: var(--text-inverse);
  box-shadow: 0 8rpx 32rpx var(--shadow);
}

.account-btn {
  background: var(--bg-card);
  color: var(--text-main);
  border: 1rpx solid var(--border);
}

/* 折叠区域 */
.fold-section {
  margin-bottom: 40rpx;
}

.fold-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 20rpx;
}

.fold-text {
  font-size: 26rpx;
  color: var(--text-placeholder);
}

.fold-content {
  overflow: hidden;
  transition: all 0.3s ease;
}

.account-form {
  background: var(--bg-card);
  border-radius: 24rpx;
  padding: 8rpx 24rpx;
  margin-bottom: 24rpx;
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

.password-toggle {
  padding: 10rpx;
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
