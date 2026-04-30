<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/user'
import { THEME_CLASS } from '../../theme/config'

const userStore = useUserStore()
const loading = ref(false)
const errorMsg = ref('')

// 检查是否已登录（从绑定页返回时可能已经登录了）
onShow(() => {
  if (userStore.isLoggedIn) {
    // 已登录，清除 pendingAction 并返回
    userStore.clearPendingAction()
    uni.navigateBack()
  }
})

// 账号密码登录
const accountForm = ref({
  account: '',
  password: ''
})

// 微信一键登录
async function handleWechatLogin() {
  loading.value = true
  errorMsg.value = ''
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
        // 需要绑定，跳转到绑定页面
        uni.showToast({ title: '请先完善账号信息', icon: 'none' })
        setTimeout(() => {
          uni.navigateTo({ url: '/pages/user/bind-account' })
        }, 1500)
        return
      }
      // 登录成功，返回上一页
      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      errorMsg.value = result.message || '登录失败'
    }
  } catch (error: any) {
    console.error('登录失败', error)
    errorMsg.value = error.message || '登录失败'
  } finally {
    loading.value = false
  }
}

// 账号密码登录
async function handleAccountLogin() {
  if (!accountForm.value.account || !accountForm.value.password) {
    errorMsg.value = '请输入账号和密码'
    return
  }
  loading.value = true
  errorMsg.value = ''
  try {
    const result = await userStore.loginWithAccount(accountForm.value.account, accountForm.value.password)
    if (result.success) {
      uni.showToast({ title: '登录成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      errorMsg.value = result.message || '登录失败'
    }
  } catch (error: any) {
    console.error('登录失败', error)
    errorMsg.value = error.message || '登录失败'
  } finally {
    loading.value = false
  }
}

// 关闭页面
function handleClose() {
  // 清除待执行动作
  userStore.clearPendingAction()
  uni.navigateBack()
}

// 跳转到注册页
function goToRegister() {
  uni.navigateTo({ url: '/pages/user/register' })
}
</script>

<template>
  <view :class="['login-modal-page', THEME_CLASS]">
    <!-- 关闭按钮 -->
    <view class="close-btn" @click="handleClose">
      <uni-icons type="close" size="24" color="var(--text-main)" />
    </view>

    <!-- 标题 -->
    <view class="header">
      <text class="title">请先登录</text>
      <text class="subtitle">登录后即可享受更多服务</text>
    </view>

    <!-- 错误提示 -->
    <view v-if="errorMsg" class="error-tip">
      <text>{{ errorMsg }}</text>
    </view>

    <!-- 微信一键登录 -->
    <view class="wechat-section">
      <button
        class="btn-wechat"
        :class="{ loading }"
        :disabled="loading"
        @click="handleWechatLogin"
      >
        <uni-icons type="weixin" size="24" color="inherit" />
        <text v-if="loading">登录中...</text>
        <text v-else>微信一键登录</text>
      </button>
      <text class="wechat-tip">推荐</text>
    </view>

    <!-- 分割线 -->
    <view class="divider">
      <view class="divider-line"></view>
      <text class="divider-text">或</text>
      <view class="divider-line"></view>
    </view>

    <!-- 账号密码登录 -->
    <view class="account-section">
      <view class="input-group">
        <uni-icons type="person" size="20" color="var(--text-placeholder)" />
        <input
          v-model="accountForm.account"
          class="input"
          type="text"
          placeholder="手机号/邮箱/用户名"
          placeholder-class="input-placeholder"
        />
      </view>
      <view class="input-group">
        <uni-icons type="locked" size="20" color="var(--text-placeholder)" />
        <input
          v-model="accountForm.password"
          class="input"
          type="password"
          password
          placeholder="请输入密码"
          placeholder-class="input-placeholder"
        />
      </view>
      <button
        class="btn-account"
        :class="{ loading }"
        :disabled="loading"
        @click="handleAccountLogin"
      >
        <text v-if="loading">登录中...</text>
        <text v-else>登录</text>
      </button>
    </view>

    <!-- 注册链接 -->
    <view class="register-link">
      <text class="link-text">还没有账号？</text>
      <text class="link-btn" @click="goToRegister">立即注册</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.login-modal-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding: 0 48rpx;
  padding-top: calc(200rpx + env(safe-area-inset-top));
}

.close-btn {
  position: fixed;
  top: calc(32rpx + env(safe-area-inset-top));
  right: 32rpx;
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border-radius: 50%;
  z-index: 100;
}

.header {
  text-align: center;
  margin-bottom: 60rpx;
}

.title {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 16rpx;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: var(--text-sub);
}

.error-tip {
  text-align: center;
  padding: 20rpx 32rpx;
  background: color-mix(in srgb, var(--color-danger) 10%, transparent);
  border-radius: 12rpx;
  margin-bottom: 32rpx;

  text {
    font-size: 26rpx;
    color: var(--color-danger);
  }
}

.wechat-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 48rpx;
}

.btn-wechat {
  width: 100%;
  height: 100rpx;
  border-radius: 50rpx;
  background: linear-gradient(135deg, #07c160 0%, #06ad56 100%);
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 32rpx rgba(7, 193, 96, 0.3);

  &::after {
    border: none;
  }

  &.loading {
    opacity: 0.7;
  }
}

.wechat-tip {
  margin-top: 16rpx;
  font-size: 22rpx;
  color: var(--text-placeholder);
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 48rpx;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background: var(--border);
}

.divider-text {
  padding: 0 24rpx;
  font-size: 24rpx;
  color: var(--text-placeholder);
}

.account-section {
  margin-bottom: 48rpx;
}

.input-group {
  display: flex;
  align-items: center;
  height: 100rpx;
  background: var(--bg-card);
  border: 1rpx solid var(--border);
  border-radius: 16rpx;
  padding: 0 24rpx;
  margin-bottom: 24rpx;

  &:focus-within {
    border-color: var(--primary);
  }
}

.input {
  flex: 1;
  height: 100%;
  margin-left: 16rpx;
  font-size: 28rpx;
  color: var(--text-main);
}

.input-placeholder {
  color: var(--text-placeholder);
}

.btn-account {
  width: 100%;
  height: 100rpx;
  border-radius: 50rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  color: #fff;
  border: none;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 32rpx var(--shadow);

  &::after {
    border: none;
  }

  &.loading {
    opacity: 0.7;
  }
}

.register-link {
  text-align: center;
  display: flex;
  justify-content: center;
  gap: 8rpx;
}

.link-text {
  font-size: 26rpx;
  color: var(--text-sub);
}

.link-btn {
  font-size: 26rpx;
  color: var(--primary);
  font-weight: 600;
}
</style>
