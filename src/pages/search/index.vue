<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { THEME_CLASS } from '../../theme/config'

const searchWords = ref('')
const historyWords = ref<string[]>([])
const searchResults = ref<any[]>([])
const loading = ref(false)
const showResults = ref(false)

// 历史记录最多10条
const MAX_HISTORY = 10

onMounted(() => {
  loadHistory()
})

function loadHistory() {
  const history = uni.getStorageSync('search_history')
  if (history) {
    historyWords.value = JSON.parse(history)
  }
}

function saveHistory(word: string) {
  if (!word.trim()) return
  // 删除已存在的
  historyWords.value = historyWords.value.filter(w => w !== word)
  // 添加到最前面
  historyWords.value.unshift(word)
  // 最多保留10条
  if (historyWords.value.length > MAX_HISTORY) {
    historyWords.value = historyWords.value.slice(0, MAX_HISTORY)
  }
  uni.setStorageSync('search_history', JSON.stringify(historyWords.value))
}

function clearHistory() {
  historyWords.value = []
  uni.removeStorageSync('search_history')
}

function handleSearch(word: string) {
  const keyword = word || searchWords.value
  if (!keyword.trim()) return
  saveHistory(keyword)
  showResults.value = true
  loadSearchResults(keyword)
}

async function loadSearchResults(keyword: string) {
  loading.value = true
  try {
    const res = await productApi.getList({ keyword, pageSize: 50 })
    if (res.code === 200) {
      searchResults.value = res.data.pageData || []
    }
  } catch (error) {
    console.error('搜索失败', error)
    uni.showToast({ title: '搜索失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goToDetail(id: number) {
  uni.navigateTo({
    url: `/pages/product/detail?id=${id}`
  })
}

function onCancel() {
  searchWords.value = ''
  showResults.value = false
}
</script>

<template>
  <view :class="['search-page', THEME_CLASS]">
    <!-- 搜索头部 -->
    <view class="search-header">
      <view class="search-input-wrap">
        <uni-icons type="search" size="18" color="var(--text-placeholder)" />
        <input
          v-model="searchWords"
          class="search-input"
          type="text"
          placeholder="搜索商品"
          confirm-type="search"
          @confirm="handleSearch('')"
        />
      </view>
      <text class="cancel-btn" @click="onCancel">取消</text>
    </view>

    <!-- 搜索结果 -->
    <scroll-view v-if="showResults" class="results-scroll" scroll-y>
      <view v-if="loading" class="loading">搜索中...</view>
      <view v-else-if="searchResults.length === 0" class="empty">
        <text>未找到相关商品</text>
      </view>
      <view v-else class="results-list">
        <view
          v-for="item in searchResults"
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
            <text class="result-price">¥{{ item.price }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 搜索内容 -->
    <view v-else class="search-content">
      <!-- 搜索历史 -->
      <view v-if="historyWords.length > 0" class="section">
        <view class="section-header">
          <text class="section-title">搜索历史</text>
          <text class="clear-btn" @click="clearHistory">清除</text>
        </view>
        <view class="tags-wrap">
          <text
            v-for="word in historyWords"
            :key="word"
            class="tag"
            @click="handleSearch(word)"
          >{{ word }}</text>
        </view>
      </view>

      <!-- 热门搜索 -->
      <!-- 暂不显示热门搜索，等待后端接口支持 -->
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
  padding: 0 24rpx;
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

.clear-btn {
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
.empty {
  padding: 100rpx 0;
  text-align: center;
  color: var(--text-sub);
  font-size: 28rpx;
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
