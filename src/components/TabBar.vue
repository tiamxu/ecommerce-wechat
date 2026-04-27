<script setup lang="ts">
import { ref } from 'vue'
import { useCartStore } from '../store/cart'
import { storeToRefs } from 'pinia'

const tabs = [
  { pagePath: '/pages/index/index', text: '首页', icon: 'home-filled' },
  { pagePath: '/pages/product/list', text: '商品', icon: 'shop' },
  { pagePath: '/pages/cart/index', text: '购物车', icon: 'cart' },
  { pagePath: '/pages/user/index', text: '我的', icon: 'person' }
]

const cartStore = useCartStore()
const { totalCount } = storeToRefs(cartStore)

// 使用 index 判断当前选中 tab，更简洁
const currentIndex = ref(0)

function goTo(tab: typeof tabs[0], index: number) {
  if (currentIndex.value === index) return
  currentIndex.value = index
  uni.switchTab({ url: tab.pagePath })
}
</script>

<template>
  <view class="custom-tabbar">
    <view
      v-for="(tab, index) in tabs"
      :key="tab.pagePath"
      class="tab-item"
      :class="{ active: currentIndex === index }"
      @click="goTo(tab, index)"
    >
      <view class="icon-wrap">
        <uni-icons
          :type="tab.icon"
          :size="22"
          :color="currentIndex === index ? 'var(--tab-bar-active)' : 'var(--tab-bar-color)'"
        />
        <view v-if="tab.icon === 'cart' && totalCount > 0" class="badge">
          {{ totalCount > 99 ? '99+' : totalCount }}
        </view>
      </view>
      <text class="tab-text" :class="{ active: currentIndex === index }">{{ tab.text }}</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  height: calc(100rpx + env(safe-area-inset-bottom));
  padding-bottom: env(safe-area-inset-bottom);
  background: var(--tab-bar-bg);
  border-top: 1rpx solid var(--border);
  z-index: 999;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  padding: 8rpx 0;

  &.active .tab-text {
    color: var(--tab-bar-active);
    font-weight: 600;
  }
}

.icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44rpx;
  height: 44rpx;
}

.tab-text {
  font-size: 22rpx;
  color: var(--tab-bar-color);
  transition: all 0.2s ease;

  &.active {
    color: var(--tab-bar-active);
    font-weight: 600;
  }
}

.badge {
  position: absolute;
  top: -8rpx;
  right: -16rpx;
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 8rpx;
  background: var(--accent);
  color: var(--text-inverse);
  font-size: 20rpx;
  font-weight: 600;
  line-height: 32rpx;
  text-align: center;
  border-radius: 16rpx;
  transform: scale(0.9);
}
</style>
