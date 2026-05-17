<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '../../store/user'
import { userApi } from '../../api'
import { THEME_CLASS } from '../../theme/config'

const userStore = useUserStore()
const submitting = ref(false)
const editType = ref('profile')

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  editType.value = currentPage?.options?.type || 'profile'

  const titles: Record<string, string> = {
    phone: '换绑手机',
    email: '更换邮箱',
    profile: '编辑资料'
  }
  uni.setNavigationBarTitle({ title: titles[editType.value] || '编辑资料' })

  if (userStore.userInfo) {
    form.value.nickname = userStore.userInfo.nickname || ''
    form.value.email = userStore.userInfo.email || ''
    form.value.phone = userStore.userInfo.phone || ''
  }
})

const form = ref({
  nickname: '',
  email: '',
  phone: ''
})

const showNickname = computed(() => editType.value === 'profile')
const showPhone = computed(() => editType.value === 'phone' || editType.value === 'profile')
const showEmail = computed(() => editType.value === 'email' || editType.value === 'profile')

async function saveProfile() {
  // 根据类型验证
  if (editType.value === 'phone' && !form.value.phone) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  if (editType.value === 'email' && !form.value.email) {
    uni.showToast({ title: '请输入邮箱', icon: 'none' })
    return
  }
  if (editType.value === 'profile' && !form.value.nickname.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }

  // 手机号格式校验
  if (form.value.phone && !/^1[3-9]\d{9}$/.test(form.value.phone)) {
    uni.showToast({ title: '手机号格式不正确', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    const res = await userApi.updateProfile({
      nickname: editType.value === 'profile' ? form.value.nickname.trim() : undefined,
      email: editType.value === 'email' ? form.value.email : undefined,
      phone: editType.value === 'phone' ? form.value.phone : undefined
    })
    if (res.code === 200) {
      userStore.updateUserInfo({
        nickname: form.value.nickname || userStore.userInfo?.nickname,
        email: form.value.email || userStore.userInfo?.email,
        phone: form.value.phone || userStore.userInfo?.phone
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
    <!-- 昵称 -->
    <view v-if="showNickname" class="form-section">
      <view class="form-item">
        <text class="form-label">昵称</text>
        <input
          v-model="form.nickname"
          class="form-input"
          type="text"
          placeholder="请输入昵称"
          maxlength="20"
        />
      </view>
    </view>

    <!-- 手机号 -->
    <view v-if="showPhone && editType.value !== 'profile'" class="form-section">
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

    <!-- 邮箱 -->
    <view v-if="showEmail && editType.value !== 'profile'" class="form-section">
      <view class="form-item">
        <text class="form-label">邮箱</text>
        <input
          v-model="form.email"
          class="form-input"
          type="text"
          placeholder="请输入邮箱"
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
.edit-page {
  min-height: 100vh;
  background: var(--bg-page);
}

/* 表单区域 */
.form-section {
  background: var(--bg-card);
  margin-bottom: 24rpx;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid var(--border);

  &:last-child {
    border-bottom: none;
  }
}

.form-label {
  width: 140rpx;
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