<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../../store/user'
import { getSessionId } from '../../api/request'
import { THEME_CLASS } from '../../theme/config'

const userStore = useUserStore()
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  try {
    const loginRes = await new Promise<WechatMiniprogram.LoginSuccessCallbackResult>((resolve, reject) => {
      uni.login({ provider: 'weixin', success: resolve, fail: reject })
    })

    if (!loginRes.code) {
      throw new Error('获取登录凭证失败')
    }

    const sessionId = getSessionId()
    const result = await userStore.loginWithWechatCode(loginRes.code, sessionId)

    if (result.success) {
      if (result.need_bind) {
        uni.showToast({ title: '请先完善账号信息', icon: 'none' })
        setTimeout(() => {
          uni.navigateTo({ url: '/pages/user/bind-account' })
        }, 1500)
        return
      }
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
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="circle circle-1"></view>
      <view class="circle circle-2"></view>
    </view>

    <!-- 内容区 -->
    <view class="content">
      <!-- Logo 区 -->
      <view class="logo-section">
        <view class="logo-circle">
          <text class="logo-text">购</text>
        </view>
      </view>

      <!-- 文字区 -->
      <view class="text-section">
        <text class="title">欢迎来到商城</text>
        <text class="subtitle">一键登录，畅享购物</text>
      </view>

      <!-- 登录按钮 -->
      <view class="btn-section">
        <button
          class="login-btn"
          :class="{ loading }"
          :disabled="loading"
          @click="handleLogin"
        >
          <text v-if="loading">登录中...</text>
          <text v-else>微信登录</text>
        </button>
        <text class="btn-tip">点击上述按钮即表示同意《用户协议》和《隐私政策》</text>
      </view>

      <!-- 底部链接 -->
      <view class="footer">
        <text class="skip-btn" @click="goShopping">暂不登录</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  background: var(--bg-page);
  position: relative;
  overflow: hidden;
}

.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50vh;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  border-radius: 0 0 50% 50%;
  z-index: 0;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  pointer-events: none;
}

.circle-1 {
  width: 300rpx;
  height: 300rpx;
  top: -100rpx;
  right: -50rpx;
}

.circle-2 {
  width: 200rpx;
  height: 200rpx;
  top: 50rpx;
  left: -80rpx;
}

.content {
  position: relative;
  z-index: 1;
  padding: 200rpx 64rpx 64rpx;
}

.logo-section {
  display: flex;
  justify-content: center;
  margin-bottom: 80rpx;
}

.logo-circle {
  width: 160rpx;
  height: 160rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20rpx 60rpx var(--shadow);
}

.logo-text {
  font-size: 80rpx;
  font-weight: 700;
  color: var(--text-inverse);
}

.text-section {
  text-align: center;
  margin-bottom: 80rpx;
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

.btn-section {
  margin-bottom: 60rpx;
  position: relative;
  z-index: 1;
}

.login-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  color: var(--text-inverse);
  font-size: 34rpx;
  font-weight: 600;
  border-radius: 50rpx;
  border: none;
  box-shadow: 0 10rpx 40rpx var(--shadow);
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    border: none;
  }

  &.loading {
    opacity: 0.7;
  }
}

.btn-tip {
  display: block;
  text-align: center;
  font-size: 22rpx;
  color: var(--text-placeholder);
  margin-top: 24rpx;
}

.footer {
  text-align: center;
}

.skip-btn {
  font-size: 28rpx;
  color: var(--text-placeholder);
  padding: 20rpx;
}
</style>
