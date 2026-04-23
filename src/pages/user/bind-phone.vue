<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../../store/user'
import { THEME_CLASS } from '../../theme/config'

const userStore = useUserStore()
const submitting = ref(false)
const password = ref('')
const confirmPassword = ref('')

async function handleGetPhoneNumber(e: any) {
  // 用户拒绝授权
  if (e.detail.errMsg !== 'getPhoneNumber:ok') {
    return
  }

  const { code } = await new Promise<WechatMiniprogram.LoginSuccessCallbackResult>((resolve, reject) => {
    uni.login({ provider: 'weixin', success: resolve, fail: reject })
  })

  // 调用后端解密获取手机号
  submitting.value = true
  try {
    const res = await uni.request({
      url: '/api/users/bind-phone-wechat',
      method: 'POST',
      header: { Authorization: `Bearer ${userStore.token}` },
      data: {
        code,
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv
      }
    })

    const data = res.data as any
    if (data.code === 200) {
      uni.showToast({ title: '手机号获取成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({ title: data.message || '获取失败', icon: 'none' })
    }
  } finally {
    submitting.value = false
  }
}

async function handleSetPassword() {
  if (!password.value) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }
  if (password.value.length < 6) {
    uni.showToast({ title: '密码至少6位', icon: 'none' })
    return
  }
  if (password.value !== confirmPassword.value) {
    uni.showToast({ title: '两次输入的密码不一致', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    const res = await uni.request({
      url: '/api/users/bind-phone',
      method: 'POST',
      header: { Authorization: `Bearer ${userStore.token}` },
      data: {
        phone: '', // 后端已通过微信获取手机号，这里传空
        password: password.value
      }
    })

    const data = res.data as any
    if (data.code === 200) {
      uni.showToast({ title: '设置成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({ title: data.message || '设置失败', icon: 'none' })
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <view :class="['bind-phone', THEME_CLASS]">
    <view class="tip-section">
      <text class="tip-text">点击下方按钮，一键获取微信绑定的手机号</text>
    </view>

    <view class="action-section">
      <button class="wechat-btn" open-type="getPhoneNumber" @getphonenumber="handleGetPhoneNumber">
        📱 微信一键获取手机号
      </button>

      <view class="divider">
        <text class="divider-text">或</text>
      </view>

      <view class="password-section">
        <view class="form-item">
          <text class="form-label">设置密码</text>
          <input
            v-model="password"
            class="form-input"
            type="password"
            placeholder="请输入密码（至少6位）"
            password
          />
        </view>
        <view class="form-item">
          <text class="form-label">确认密码</text>
          <input
            v-model="confirmPassword"
            class="form-input"
            type="password"
            placeholder="请再次输入密码"
            password
          />
        </view>
        <text class="hint-text">设置密码后，可使用手机号+密码登录</text>
      </view>

      <text class="save-btn" :class="{ loading: submitting }" @click="handleSetPassword">
        {{ submitting ? '设置中...' : '确认设置' }}
      </text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.bind-phone {
  min-height: 100vh;
  background: var(--bg-page);
}

.tip-section {
  padding: 24rpx 32rpx;
  background: var(--primary-light);
}

.tip-text {
  font-size: 26rpx;
  color: var(--primary);
}

.action-section {
  padding: 32rpx;
}

.wechat-btn {
  width: 100%;
  padding: 28rpx;
  background: var(--primary);
  color: var(--text-inverse);
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;
  text-align: center;

  &::after {
    border: none;
  }
}

.divider {
  display: flex;
  align-items: center;
  padding: 32rpx 0;
}

.divider-text {
  flex: 1;
  text-align: center;
  font-size: 26rpx;
  color: var(--text-placeholder);
}

.password-section {
  background: var(--bg-card);
  border-radius: 16rpx;
  padding: 0 24rpx;
  margin-bottom: 24rpx;
}

.form-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid var(--border);

  &:last-child {
    border-bottom: none;
  }
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: var(--text-main);
  margin-bottom: 12rpx;
}

.form-input {
  width: 100%;
  height: 72rpx;
  padding: 0 16rpx;
  background: var(--bg-page);
  border-radius: 12rpx;
  font-size: 28rpx;
  color: var(--text-main);

  &::placeholder {
    color: var(--text-placeholder);
  }
}

.hint-text {
  display: block;
  padding: 16rpx 0 24rpx;
  font-size: 24rpx;
  color: var(--text-sub);
}

.save-btn {
  display: block;
  width: 100%;
  padding: 28rpx;
  background: var(--accent);
  color: var(--text-inverse);
  text-align: center;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;

  &.loading {
    opacity: 0.6;
  }

  &:active {
    opacity: 0.9;
  }
}
</style>