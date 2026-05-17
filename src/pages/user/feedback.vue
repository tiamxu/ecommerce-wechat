<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { feedbackApi, type CreateFeedbackParams } from '../../api'
import { useUserStore } from '../../store/user'
import { THEME_CLASS } from '../../theme/config'

const userStore = useUserStore()
const feedbackType = ref('function')
const feedbackTypes = [
  { value: 'function', label: '功能建议' },
  { value: 'bug', label: '问题反馈' },
  { value: 'experience', label: '体验反馈' },
  { value: 'suggestion', label: '优化建议' },
  { value: 'complaint', label: '投诉建议' },
  { value: 'other', label: '其他' }
]

const form = ref({
  category: 'function',
  subject: '',
  content: '',
  contact: ''
})

const submitting = ref(false)
const typeLabel = ref('')

onMounted(() => {
  // 设置默认标题
  const current = feedbackTypes.find(t => t.value === feedbackType.value)
  typeLabel.value = current?.label || '意见反馈'
})

function selectType(type: string) {
  feedbackType.value = type
  form.value.category = type
  const current = feedbackTypes.find(t => t.value === type)
  typeLabel.value = current?.label || ''
}

async function submitFeedback() {
  if (!form.value.subject.trim()) {
    uni.showToast({ title: '请输入标题', icon: 'none' })
    return
  }
  if (!form.value.content.trim()) {
    uni.showToast({ title: '请输入反馈内容', icon: 'none' })
    return
  }

  // 检查登录状态
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/user/login' })
    }, 1500)
    return
  }

  submitting.value = true
  try {
    const params: CreateFeedbackParams = {
      category: form.value.category,
      subject: form.value.subject.trim(),
      content: form.value.content.trim(),
      images: undefined,
      contact: form.value.contact.trim() || undefined
    }

    const res = await feedbackApi.create(params)
    if (res.code === 200) {
      uni.showToast({ title: '提交成功，感谢您的反馈', icon: 'success' })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    } else {
      uni.showToast({ title: res.message || '提交失败', icon: 'none' })
    }
  } catch (error) {
    console.error('提交反馈失败', error)
    uni.showToast({ title: '提交失败，请重试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <view :class="['feedback-page', THEME_CLASS]">
    <view class="feedback-form">
      <!-- 反馈类型 -->
      <view class="form-section">
        <text class="section-title">反馈类型</text>
        <view class="type-list">
          <view
            v-for="item in feedbackTypes"
            :key="item.value"
            class="type-item"
            :class="{ active: feedbackType === item.value }"
            @click="selectType(item.value)"
          >
            <text>{{ item.label }}</text>
          </view>
        </view>
      </view>

      <!-- 标题 -->
      <view class="form-section">
        <text class="section-title">标题</text>
        <input
          v-model="form.subject"
          class="subject-input"
          type="text"
          placeholder="请输入问题标题"
          maxlength="100"
        />
      </view>

      <!-- 反馈内容 -->
      <view class="form-section">
        <text class="section-title">反馈内容</text>
        <textarea
          v-model="form.content"
          class="feedback-textarea"
          placeholder="请详细描述您的问题或建议..."
          maxlength="2000"
        />
        <text class="word-count">{{ form.content.length }}/2000</text>
      </view>

      <!-- 联系方式 -->
      <view class="form-section">
        <text class="section-title">联系方式（选填）</text>
        <input
          v-model="form.contact"
          class="contact-input"
          type="text"
          placeholder="手机号或邮箱"
          maxlength="50"
        />
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <view class="submit-btn" :class="{ loading: submitting }" @click="submitFeedback">
        <text v-if="submitting">提交中...</text>
        <text v-else>提交反馈</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.feedback-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding: 32rpx;
}

.feedback-form {
  margin-bottom: 40rpx;
}

.form-section {
  background: var(--bg-card);
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 20rpx;
}

.type-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.type-item {
  padding: 16rpx 32rpx;
  background: var(--bg-page);
  border-radius: 40rpx;
  font-size: 26rpx;
  color: var(--text-sub);
  border: 2rpx solid transparent;

  &.active {
    background: var(--primary-light);
    color: var(--primary);
    border-color: var(--primary);
  }

  &:active {
    opacity: 0.7;
  }
}

.subject-input {
  width: 100%;
  height: 80rpx;
  padding: 0 24rpx;
  background: var(--bg-page);
  border-radius: 12rpx;
  font-size: 28rpx;
  color: var(--text-main);
  box-sizing: border-box;

  &::placeholder {
    color: var(--text-placeholder);
  }
}

.feedback-textarea {
  width: 100%;
  height: 280rpx;
  padding: 24rpx;
  background: var(--bg-page);
  border-radius: 12rpx;
  font-size: 28rpx;
  color: var(--text-main);
  box-sizing: border-box;
  line-height: 1.6;

  &::placeholder {
    color: var(--text-placeholder);
  }
}

.word-count {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: var(--text-placeholder);
  margin-top: 12rpx;
}

.contact-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  background: var(--bg-page);
  border-radius: 12rpx;
  font-size: 28rpx;
  color: var(--text-main);
  box-sizing: border-box;

  &::placeholder {
    color: var(--text-placeholder);
  }
}

.submit-section {
  padding: 0 32rpx;
}

.submit-btn {
  width: 100%;
  padding: 28rpx;
  background: var(--primary);
  color: var(--text-inverse);
  text-align: center;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;

  &.loading {
    opacity: 0.7;
  }

  &:active {
    opacity: 0.9;
  }
}
</style>