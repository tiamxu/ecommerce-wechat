<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { userApi } from '../../api'
import { THEME_CLASS } from '../../theme/config'

const userStore = useUserStore()
const submitting = ref(false)
const nickname = ref('')

onMounted(() => {
  if (userStore.userInfo) {
    nickname.value = userStore.userInfo.nickname || ''
  }
})

const avatarUrl = computed(() => userStore.userInfo?.avatar || '')

async function saveProfile() {
  if (!nickname.value.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    const res = await userApi.updateProfile({
      nickname: nickname.value.trim()
    })
    if (res.code === 200) {
      userStore.updateUserInfo({ nickname: nickname.value.trim() })
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
  <view :class="['profile-page', THEME_CLASS]">
    <!-- 头像区域 -->
    <view class="avatar-section">
      <view class="avatar-wrap">
        <image v-if="avatarUrl" :src="avatarUrl" class="avatar-img" />
        <text v-else class="avatar-placeholder">
          {{ (nickname || 'U').charAt(0).toUpperCase() }}
        </text>
      </view>
      <text class="avatar-hint">点击头像区域可更换头像</text>
    </view>

    <!-- 昵称输入 -->
    <view class="form-section">
      <view class="form-item">
        <text class="form-label">昵称</text>
        <input
          v-model="nickname"
          class="form-input"
          type="text"
          placeholder="请输入昵称"
          maxlength="20"
        />
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="save-section">
      <text class="save-btn" :class="{ loading: submitting }" @click="saveProfile">
        {{ submitting ? '保存中...' : '保存' }}
      </text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.profile-page {
  min-height: 100vh;
  background: var(--bg-page);
}

/* 头像区域 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0;
  background: var(--bg-card);
  margin-bottom: 24rpx;
}

.avatar-wrap {
  width: 160rpx;
  height: 160rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  border-radius: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
  overflow: hidden;
  border: 4rpx solid var(--border);
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.avatar-placeholder {
  font-size: 64rpx;
  font-weight: 600;
  color: var(--text-inverse);
}

.avatar-hint {
  font-size: 24rpx;
  color: var(--text-sub);
}

/* 表单区域 */
.form-section {
  background: var(--bg-card);
}

.form-item {
  display: flex;
  align-items: center;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid var(--border);

  &:last-child {
    border-bottom: none;
  }
}

.form-label {
  width: 120rpx;
  font-size: 28rpx;
  color: var(--text-main);
}

.form-input {
  flex: 1;
  font-size: 28rpx;
  color: var(--text-main);
  text-align: right;

  &::placeholder {
    color: var(--text-placeholder);
  }
}

/* 保存按钮 */
.save-section {
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