<script setup lang="ts">
import { ref } from 'vue'
import { userApi } from '../../api'
import { THEME_CLASS } from '../../theme/config'

const submitting = ref(false)

const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

function validatePassword(password: string): boolean {
  if (password.length < 6) {
    return false
  }
  return true
}

async function handleSubmit() {
  // 前端校验
  if (!form.value.oldPassword) {
    uni.showToast({ title: '请输入旧密码', icon: 'none' })
    return
  }
  if (!form.value.newPassword) {
    uni.showToast({ title: '请输入新密码', icon: 'none' })
    return
  }
  if (!validatePassword(form.value.newPassword)) {
    uni.showToast({ title: '新密码至少6位', icon: 'none' })
    return
  }
  if (form.value.newPassword !== form.value.confirmPassword) {
    uni.showToast({ title: '两次输入的密码不一致', icon: 'none' })
    return
  }
  if (form.value.oldPassword === form.value.newPassword) {
    uni.showToast({ title: '新密码不能与旧密码相同', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    const res = await userApi.updatePassword({
      oldPassword: form.value.oldPassword,
      newPassword: form.value.newPassword
    })
    if (res.code === 200) {
      uni.showToast({ title: '密码修改成功', icon: 'success' })
      // 清空表单
      form.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({ title: res.message || '修改失败', icon: 'none' })
    }
  } catch (error: any) {
    console.error('修改密码失败', error)
    uni.showToast({ title: error.message || '修改失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <view :class="['password-page', THEME_CLASS]">
    <view class="form-section">
      <view class="form-item">
        <text class="form-label">旧密码</text>
        <input
          v-model="form.oldPassword"
          class="form-input"
          type="password"
          placeholder="请输入旧密码"
          password
        />
      </view>

      <view class="form-item">
        <text class="form-label">新密码</text>
        <input
          v-model="form.newPassword"
          class="form-input"
          type="password"
          placeholder="请输入新密码（至少6位）"
          password
        />
      </view>

      <view class="form-item">
        <text class="form-label">确认密码</text>
        <input
          v-model="form.confirmPassword"
          class="form-input"
          type="password"
          placeholder="请再次输入新密码"
          password
        />
      </view>
    </view>

    <view class="tip-section">
      <text class="tip-text">密码规则：至少6位</text>
    </view>

    <view class="save-btn-wrap">
      <text class="save-btn" :class="{ loading: submitting }" @click="handleSubmit">
        {{ submitting ? '提交中...' : '确认修改' }}
      </text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.password-page {
  min-height: 100vh;
  background: var(--bg-page);
}

.form-section {
  background: var(--bg-card);
  margin-bottom: 24rpx;
}

.form-item {
  padding: 32rpx;
  border-bottom: 1rpx solid var(--border);

  &:last-child {
    border-bottom: none;
  }
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: var(--text-main);
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  padding: 0 24rpx;
  background: var(--bg-page);
  border-radius: 12rpx;
  font-size: 28rpx;
  color: var(--text-main);

  &::placeholder {
    color: var(--text-placeholder);
  }
}

.tip-section {
  padding: 16rpx 32rpx;
}

.tip-text {
  font-size: 24rpx;
  color: var(--text-sub);
}

.save-btn-wrap {
  padding: 32rpx;
}

.save-btn {
  display: block;
  width: 100%;
  padding: 28rpx;
  background: var(--primary);
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