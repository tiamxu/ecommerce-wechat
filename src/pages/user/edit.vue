<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userApi } from '../../api'
import { useUserStore } from '../../store/user'
import { THEME_CLASS } from '../../theme/config'

const userStore = useUserStore()
const loading = ref(false)
const submitting = ref(false)

const form = ref({
  email: '',
  phone: ''
})

onMounted(() => {
  // 如果store中有用户信息，先填充
  if (userStore.userInfo) {
    form.value.email = userStore.userInfo.email || ''
    form.value.phone = userStore.userInfo.phone || ''
  }
})

async function loadProfile() {
  loading.value = true
  try {
    const res = await userApi.getProfile()
    if (res.code === 200 && res.data) {
      form.value.email = res.data.email || ''
      form.value.phone = res.data.phone || ''
    }
  } catch (error) {
    console.error('加载用户信息失败', error)
  } finally {
    loading.value = false
  }
}

async function saveProfile() {
  if (!form.value.email && !form.value.phone) {
    uni.showToast({ title: '请至少填写一项', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    const res = await userApi.updateProfile({
      email: form.value.email || undefined,
      phone: form.value.phone || undefined
    })
    if (res.code === 200) {
      // 更新 store 中的用户信息
      userStore.updateUserInfo({
        email: form.value.email || undefined,
        phone: form.value.phone || undefined
      })
      uni.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({ title: res.message || '保存失败', icon: 'none' })
    }
  } catch (error) {
    console.error('保存失败', error)
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <view :class="['edit-page', THEME_CLASS]">
    <view class="form-section">
      <view class="form-item">
        <text class="form-label">邮箱</text>
        <input
          v-model="form.email"
          class="form-input"
          type="text"
          placeholder="请输入邮箱"
        />
      </view>

      <view class="form-item">
        <text class="form-label">手机号</text>
        <input
          v-model="form.phone"
          class="form-input"
          type="number"
          placeholder="请输入手机号"
          maxlength="11"
        />
      </view>
    </view>

    <view class="save-btn-wrap">
      <text class="save-btn" :class="{ loading: submitting }" @click="saveProfile">
        {{ submitting ? '保存中...' : '保存' }}
      </text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.edit-page {
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