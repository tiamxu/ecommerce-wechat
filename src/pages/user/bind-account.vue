<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '../../store/user'
import { BASE_URL } from '../../utils/env'
import { THEME_CLASS } from '../../theme/config'

const userStore = useUserStore()
const loading = ref(false)

const form = ref({
  phone: '',
  password: '',
  confirmPassword: ''
})

const errors = ref({
  phone: '',
  password: '',
  confirmPassword: ''
})

function validateForm() {
  let valid = true
  errors.value.phone = ''
  errors.value.password = ''
  errors.value.confirmPassword = ''

  if (!form.value.phone) {
    errors.value.phone = '请输入手机号'
    valid = false
  } else if (!/^1[3-9]\d{9}$/.test(form.value.phone)) {
    errors.value.phone = '手机号格式不正确'
    valid = false
  }

  if (!form.value.password) {
    errors.value.password = '请输入密码'
    valid = false
  } else if (form.value.password.length < 6) {
    errors.value.password = '密码至少6位'
    valid = false
  }

  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = '请确认密码'
    valid = false
  } else if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = '两次密码不一致'
    valid = false
  }

  return valid
}

async function handleBind() {
  if (!validateForm()) return

  loading.value = true
  try {
    const result = await new Promise<{ success: boolean; message?: string }>((resolve) => {
      uni.request({
        url: `${BASE_URL}/api/users/bind-account`,
        method: 'POST',
        header: { Authorization: `Bearer ${userStore.token}` },
        data: {
          account: form.value.phone,
          password: form.value.password
        }
      }).then((res: any) => {
        if (res.data.code === 200) {
          resolve({ success: true })
        } else {
          resolve({ success: false, message: res.data.message || '绑定失败' })
        }
      }).catch((err: any) => {
        resolve({ success: false, message: err.message || '网络错误' })
      })
    })

    if (result.success) {
      uni.showToast({ title: '绑定成功', icon: 'success' })
      // 通知刷新用户信息
      uni.$emit('refreshUserInfo')
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({ title: result.message || '绑定失败', icon: 'none' })
    }
  } catch (error: any) {
    console.error('绑定失败', error)
    uni.showToast({ title: error.message || '绑定失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goBack() {
  uni.navigateBack()
}
</script>

<template>
  <view :class="['bind-account-page', THEME_CLASS]">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="circle circle-1"></view>
      <view class="circle circle-2"></view>
    </view>

    <!-- 内容区 -->
    <view class="content">
      <!-- 文字区 -->
      <view class="text-section">
        <text class="title">完善账号信息</text>
        <text class="subtitle">绑定手机号后可用账户密码登录</text>
      </view>

      <!-- 表单区 -->
      <view class="form-section">
        <view class="form-item">
          <view class="form-label">手机号</view>
          <input
            v-model="form.phone"
            class="form-input"
            type="number"
            maxlength="11"
            placeholder="请输入手机号"
            placeholder-class="input-placeholder"
          />
          <text v-if="errors.phone" class="form-error">{{ errors.phone }}</text>
        </view>

        <view class="form-item">
          <view class="form-label">设置密码</view>
          <input
            v-model="form.password"
            class="form-input"
            type="password"
            password
            placeholder="请输入密码（至少6位）"
            placeholder-class="input-placeholder"
          />
          <text v-if="errors.password" class="form-error">{{ errors.password }}</text>
        </view>

        <view class="form-item">
          <view class="form-label">确认密码</view>
          <input
            v-model="form.confirmPassword"
            class="form-input"
            type="password"
            password
            placeholder="请再次输入密码"
            placeholder-class="input-placeholder"
          />
          <text v-if="errors.confirmPassword" class="form-error">{{ errors.confirmPassword }}</text>
        </view>
      </view>

      <!-- 绑定按钮 -->
      <view class="btn-section">
        <button
          class="bind-btn"
          :class="{ loading }"
          :disabled="loading"
          @click="handleBind"
        >
          <text v-if="loading">绑定中...</text>
          <text v-else>完成绑定</text>
        </button>
      </view>

      <!-- 底部链接 -->
      <view class="footer">
        <text class="skip-btn" @click="goBack">暂不绑定</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.bind-account-page {
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
  height: 30vh;
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
  padding: 160rpx 64rpx 64rpx;
}

.text-section {
  text-align: center;
  margin-bottom: 60rpx;
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 12rpx;
}

.subtitle {
  display: block;
  font-size: 26rpx;
  color: var(--text-sub);
}

.form-section {
  background: var(--bg-card);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 40rpx;
}

.form-item {
  margin-bottom: 32rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  font-size: 28rpx;
  color: var(--text-main);
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  background: var(--bg-page);
  border-radius: 16rpx;
  font-size: 28rpx;
  color: var(--text-main);

  &::placeholder {
    color: var(--text-placeholder);
  }
}

.form-error {
  display: block;
  font-size: 24rpx;
  color: var(--color-danger);
  margin-top: 12rpx;
}

.input-placeholder {
  color: var(--text-placeholder);
}

.btn-section {
  margin-bottom: 40rpx;
}

.bind-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  color: var(--text-inverse);
  font-size: 32rpx;
  font-weight: 600;
  border-radius: 48rpx;
  border: none;
  box-shadow: 0 8rpx 32rpx var(--shadow);
  display: flex;
  align-items: center;
  justify-content: center;

  &::after {
    border: none;
  }

  &.loading {
    opacity: 0.7;
  }

  &:active {
    opacity: 0.9;
  }
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
