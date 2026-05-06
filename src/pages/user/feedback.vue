<script setup lang="ts">
import { ref } from 'vue'
import { userApi } from '../../api'
import { THEME_CLASS } from '../../theme/config'

const feedbackType = ref('suggest')
const feedbackTypes = [
  { value: 'suggest', label: '功能建议' },
  { value: 'bug', label: '问题反馈' },
  { value: 'other', label: '其他' }
]

const form = ref({
  type: 'suggest',
  content: '',
  contact: ''
})

const submitting = ref(false)

function selectType(type: string) {
  feedbackType.value = type
  form.value.type = type
}

async function submitFeedback() {
  if (!form.value.content.trim()) {
    uni.showToast({ title: '请输入反馈内容', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    // TODO: 调用反馈接口
    // await userApi.submitFeedback(form.value)
    uni.showToast({ title: '提交成功，感谢您的反馈', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
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

      <!-- 反馈内容 -->
      <view class="form-section">
        <text class="section-title">反馈内容</text>
        <textarea
          v-model="form.content"
          class="feedback-textarea"
          placeholder="请详细描述您的问题或建议..."
          maxlength="500"
        />
        <text class="word-count">{{ form.content.length }}/500</text>
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
      <view class="submit-btn" @click="submitFeedback">
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
  color: #fff;
  text-align: center;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;

  &:active {
    opacity: 0.9;
  }
}
</style>
