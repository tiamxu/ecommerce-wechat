<script setup lang="ts">
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useCartStore } from '../store/cart'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  hidden?: boolean
}>()

const tabs = [
  { pagePath: '/pages/index/index', text: '首页', icon: 'home' },
  { pagePath: '/pages/product/list', text: '商品', icon: 'shop' },
  { pagePath: '/pages/cart/index', text: '购物车', icon: 'cart' },
  { pagePath: '/pages/user/index', text: '我的', icon: 'person' }
]

const cartStore = useCartStore()
const { totalCount } = storeToRefs(cartStore)

const currentIndex = ref(0)

// 根据当前页面路径同步 currentIndex
function syncCurrentIndex() {
  const pages = getCurrentPages()
  if (pages.length === 0) return
  const currentPage = pages[pages.length - 1]
  const currentPath = '/' + currentPage.route
  const idx = tabs.findIndex(tab => tab.pagePath === currentPath)
  if (idx !== -1) {
    currentIndex.value = idx
  }
}

onShow(() => {
  syncCurrentIndex()
})

function goTo(tab: typeof tabs[0], index: number) {
  if (currentIndex.value === index) {
    // 已选中，刷新当前页
    uni.reLaunch({ url: tab.pagePath })
    return
  }
  currentIndex.value = index
  uni.switchTab({ url: tab.pagePath })
}
</script>

<template>
  <view v-if="!hidden" class="custom-tabbar">
    <view
      v-for="(tab, index) in tabs"
      :key="tab.pagePath"
      class="tab-item"
      :class="{ active: currentIndex === index }"
      @tap.stop="goTo(tab, index)"
    >
      <view class="icon-wrap">
        <uni-icons
          :type="tab.icon"
          :size="24"
          :color="currentIndex === index ? 'var(--tab-bar-active)' : 'var(--tab-bar-color)'"
        />
        <view v-if="tab.icon === 'cart' && totalCount > 0" class="badge" :class="{ small: totalCount < 10 }">
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
  box-shadow: 0 -2rpx 12rpx var(--shadow);
  z-index: 999;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  padding: 8rpx 0;
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.92);
  }

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
  width: 48rpx;
  height: 48rpx;
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
  top: -4rpx;
  right: -12rpx;
  min-width: 28rpx;
  height: 28rpx;
  padding: 0 6rpx;
  background: var(--accent);
  color: var(--text-inverse);
  font-size: 18rpx;
  font-weight: 600;
  line-height: 28rpx;
  text-align: center;
  border-radius: 14rpx;

  &.small {
    min-width: 24rpx;
    height: 24rpx;
    font-size: 16rpx;
    line-height: 24rpx;
    border-radius: 12rpx;
  }
}
</style>
