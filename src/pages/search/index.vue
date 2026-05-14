<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { THEME_CLASS } from '../../theme/config'
import { useSearchStore } from '../../store/search'

const searchStore = useSearchStore()

const searchWords = ref('')
const showResults = ref(false)
const focused = ref(false)

// 防抖定时器
let debounceTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  searchStore.loadHistory()
  searchStore.fetchHotWords()
})

onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
})

function handleSearch(word: string) {
  const kw = word || searchWords.value
  if (!kw.trim()) return
  searchStore.addHistory(kw)
  showResults.value = true
  searchStore.search(kw, true)
}

function handleInput() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  debounceTimer = setTimeout(() => {
    if (searchWords.value.trim()) {
      handleSearch('')
    }
  }, 300)
}

function goToDetail(id: number) {
  uni.navigateTo({
    url: `/pages/product/detail?id=${id}`
  })
}

function onCancel() {
  searchWords.value = ''
  showResults.value = false
  focused.value = false
}

function handleFocus() {
  focused.value = true
}

function handleBlur() {
  focused.value = false
}

function handleClear() {
  searchWords.value = ''
}

function onLoadMore() {
  if (!showResults.value) return
  searchStore.loadMore()
}
</script>

<template>
  <view :class="['search-page', THEME_CLASS]">
    <!-- 搜索头部 -->
    <view class="search-header">
      <view class="search-input-wrap" :class="{ focused }">
        <uni-icons type="search" size="18" color="var(--text-placeholder)" />
        <input
          v-model="searchWords"
          class="search-input"
          type="text"
          placeholder="搜索商品"
          confirm-type="search"
          @input="handleInput"
          @confirm="handleSearch('')"
          @focus="handleFocus"
          @blur="handleBlur"
        />
        <view v-if="searchWords" class="clear-btn" @click="handleClear">
          <uni-icons type="clear" size="14" color="var(--text-placeholder)" />
        </view>
      </view>
      <text class="cancel-btn" @click="onCancel">取消</text>
    </view>

    <!-- 搜索结果 -->
    <scroll-view
      v-if="showResults"
      class="results-scroll"
      scroll-y
      @scrolltolower="onLoadMore"
    >
      <view v-if="searchStore.loading" class="loading">搜索中...</view>
      <view v-else-if="searchStore.searchResults.length === 0" class="empty">
        <view class="empty-icon">
          <uni-icons type="search" size="48" color="var(--text-placeholder)" />
        </view>
        <text class="empty-text">未找到相关商品</text>
        <text class="empty-hint">试试其他关键词</text>
      </view>
      <view v-else class="results-list">
        <view
          v-for="item in searchStore.searchResults"
          :key="item.id"
          class="result-item"
          @click="goToDetail(item.id)"
        >
          <image
            class="result-image"
            :src="item.coverImage || '/static/placeholder.png'"
            mode="aspectFill"
          />
          <view class="result-info">
            <text class="result-name">{{ item.name?.zh || item.name?.en || '商品' }}</text>
            <text class="result-price">¥{{ item.price ?? '--' }}</text>
          </view>
        </view>
        <view v-if="searchStore.loading && searchStore.searchResults.length > 0" class="loading-more">加载中...</view>
        <view v-if="!searchStore.hasMore && searchStore.searchResults.length > 0" class="no-more">没有更多了</view>
      </view>
    </scroll-view>

    <!-- 搜索内容 -->
    <view v-else class="search-content">
      <!-- 搜索历史 -->
      <view v-if="searchStore.historyWords.length > 0" class="section">
        <view class="section-header">
          <text class="section-title">搜索历史</text>
          <text class="clear-history" @click="searchStore.clearHistory">清除</text>
        </view>
        <view class="tags-wrap">
          <text
            v-for="word in searchStore.historyWords"
            :key="word"
            class="tag"
            @click="handleSearch(word)"
          >{{ word }}</text>
        </view>
      </view>

      <!-- 热门搜索 -->
      <view v-if="searchStore.hotWords.length > 0" class="section">
        <view class="section-header">
          <text class="section-title">热门搜索</text>
        </view>
        <view class="tags-wrap">
          <text
            v-for="word in searchStore.hotWords"
            :key="word"
            class="tag hot"
            @click="handleSearch(word)"
          >{{ word }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.search-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-page);
}

.search-header {
  display: flex;
  align-items: center;
  height: 96rpx;
  padding: 16rpx 24rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  gap: 16rpx;
}

.search-input-wrap {
  flex: 1;
  height: 64rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  border: 2rpx solid transparent;
  transition: border-color 0.2s ease;
}

.search-input-wrap.focused {
  border-color: var(--primary);
}

.search-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.search-input {
  flex: 1;
  height: 64rpx;
  font-size: 26rpx;
}

.cancel-btn {
  color: var(--text-inverse);
  font-size: 28rpx;
  padding: 0 8rpx;
}

.search-content {
  flex: 1;
  overflow-y: auto;
  padding: 24rpx;
}

.section {
  margin-bottom: 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-main);
}

.clear-history {
  font-size: 26rpx;
  color: var(--text-sub);
}

.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.tag {
  padding: 12rpx 28rpx;
  background: var(--bg-card);
  border-radius: 32rpx;
  font-size: 26rpx;
  color: var(--text-main);
  transition: transform 0.15s ease, opacity 0.15s ease;

  &:active {
    transform: scale(0.95);
    opacity: 0.8;
  }

  &.hot {
    background: var(--primary-light);
    color: var(--primary);
  }
}

.results-scroll {
  flex: 1;
  overflow-y: auto;
}

.loading,
.empty,
.loading-more,
.no-more {
  padding: 80rpx 0;
  text-align: center;
  color: var(--text-sub);
  font-size: 26rpx;
}

.empty-icon {
  margin-bottom: 24rpx;
}

.empty-text {
  display: block;
  font-size: 28rpx;
  color: var(--text-main);
  margin-bottom: 8rpx;
}

.empty-hint {
  font-size: 24rpx;
  color: var(--text-sub);
}

.results-list {
  padding: 24rpx;
}

.result-item {
  display: flex;
  padding: 24rpx;
  background: var(--bg-card);
  border-radius: 16rpx;
  margin-bottom: 16rpx;
  transition: transform 0.15s ease, opacity 0.15s ease;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.result-image {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  background: var(--bg-page);
}

.result-info {
  flex: 1;
  margin-left: 20rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.result-name {
  font-size: 28rpx;
  color: var(--text-main);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-price {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--price);
  font-variant-numeric: tabular-nums;
}
</style>