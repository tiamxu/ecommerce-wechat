<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(defineProps<{
  placeholder?: string
  showCancel?: boolean
}>(), {
  placeholder: '搜索商品',
  showCancel: false
})

const emit = defineEmits<{
  search: [keyword: string]
  cancel: []
}>()

const keyword = ref('')
const focused = ref(false)

// 防抖定时器
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function handleInput() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    if (keyword.value.trim()) {
      emit('search', keyword.value)
    }
  }, 300)
}

function handleConfirm() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  if (keyword.value.trim()) {
    emit('search', keyword.value)
  }
}

function handleClear() {
  keyword.value = ''
}

function handleCancel() {
  keyword.value = ''
  focused.value = false
  emit('cancel')
}

function handleFocus() {
  focused.value = true
}

function handleBlur() {
  focused.value = false
}
</script>

<template>
  <view class="search-bar" :class="{ focused }">
    <view class="search-input-wrap">
      <uni-icons type="search" size="16" color="var(--text-placeholder)" />
      <input
        v-model="keyword"
        class="search-input"
        type="text"
        :placeholder="placeholder"
        confirm-type="search"
        @input="handleInput"
        @confirm="handleConfirm"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      <view v-if="keyword" class="clear-btn" @click="handleClear">
        <uni-icons type="clear" size="14" color="var(--text-placeholder)" />
      </view>
    </view>
    <text v-if="showCancel && focused" class="cancel-btn" @click="handleCancel">取消</text>
  </view>
</template>

<style scoped lang="scss">
.search-bar {
  display: flex;
  align-items: center;
  padding: 12rpx 24rpx;
  background: var(--bg-page);
  gap: 16rpx;
}

.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  height: 64rpx;
  padding: 0 20rpx;
  background: var(--bg-card);
  border-radius: 32rpx;
  border: 2rpx solid transparent;
  transition: border-color 0.2s ease;
}

.search-bar.focused .search-input-wrap {
  border-color: var(--primary);
}

.search-input {
  flex: 1;
  height: 64rpx;
  font-size: 26rpx;
  color: var(--text-main);
  margin-left: 8rpx;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32rpx;
  height: 32rpx;
  margin-left: 8rpx;
}

.cancel-btn {
  font-size: 28rpx;
  color: var(--text-main);
  padding: 0 8rpx;
}
</style>