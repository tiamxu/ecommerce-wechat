<script setup lang="ts">
import { ref } from 'vue'
import TabBar from '../../components/TabBar.vue'
import { THEME_CLASS } from '../../theme/config'

const searchText = ref('')

const hotDestinations = [
  { name: '成都', desc: '天府之国', emoji: '🐼' },
  { name: '三亚', desc: '海岛天堂', emoji: '🏝️' },
  { name: '丽江', desc: '古城艳遇', emoji: '🏔️' },
  { name: '杭州', desc: '人间天堂', emoji: '🌸' },
  { name: '大理', desc: '风花雪月', emoji: '🌊' },
  { name: '西安', desc: '古都长安', emoji: '🏯' }
]

const recentDestinations = [
  { name: '重庆', emoji: '🌶️' },
  { name: '厦门', emoji: '🎵' }
]

function onSearch() {
  if (searchText.value.trim()) {
    uni.navigateTo({
      url: `/pages/destination/detail?keyword=${encodeURIComponent(searchText.value)}`
    })
  }
}

function goToDestination(item: any) {
  uni.navigateTo({
    url: `/pages/destination/detail?keyword=${encodeURIComponent(item.name)}`
  })
}
</script>

<template>
  <view :class="['destination-search', THEME_CLASS]">
    <TabBar />

    <!-- 搜索框 -->
    <view class="search-section">
      <view class="search-bar">
        <uni-icons type="search" size="18" color="var(--text-placeholder)" />
        <input
          v-model="searchText"
          class="search-input"
          placeholder="搜索目的地、景点"
          confirm-type="search"
          @confirm="onSearch"
        />
      </view>
    </view>

    <!-- 最近搜索 -->
    <view v-if="recentDestinations.length > 0" class="section">
      <view class="section-header">
        <text class="section-title">最近搜索</text>
      </view>
      <view class="recent-list">
        <view
          v-for="item in recentDestinations"
          :key="item.name"
          class="recent-item"
          @click="goToDestination(item)"
        >
          <text class="recent-emoji">{{ item.emoji }}</text>
          <text class="recent-name">{{ item.name }}</text>
        </view>
      </view>
    </view>

    <!-- 热门目的地 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">热门目的地</text>
      </view>
      <view class="destination-grid">
        <view
          v-for="item in hotDestinations"
          :key="item.name"
          class="destination-card"
          @click="goToDestination(item)"
        >
          <text class="dest-emoji">{{ item.emoji }}</text>
          <view class="dest-info">
            <text class="dest-name">{{ item.name }}</text>
            <text class="dest-desc">{{ item.desc }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.destination-search {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: calc(100rpx + env(safe-area-inset-bottom));
}

.search-section {
  padding: 24rpx;
  padding-top: calc(24rpx + env(safe-area-inset-top));
  background: var(--bg-card);
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 16rpx 24rpx;
  background: var(--bg-input);
  border-radius: 40rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;

  &::placeholder {
    color: var(--text-placeholder);
  }
}

.section {
  padding: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-main);
}

.recent-list {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background: var(--bg-card);
  border-radius: 32rpx;

  &:active {
    opacity: 0.7;
  }
}

.recent-emoji {
  font-size: 24rpx;
}

.recent-name {
  font-size: 24rpx;
  color: var(--text-main);
}

.destination-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.destination-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx;
  background: var(--bg-card);
  border-radius: 20rpx;
  box-shadow: 0 2rpx 12rpx var(--shadow);

  &:active {
    transform: scale(0.98);
  }
}

.dest-emoji {
  font-size: 48rpx;
}

.dest-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.dest-name {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-main);
}

.dest-desc {
  font-size: 22rpx;
  color: var(--text-sub);
}
</style>
