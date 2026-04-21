<script setup lang="ts">
import { ref, onMounted } from 'vue'

const tabs = [
  { pagePath: '/pages/index/index', text: '首页', icon: '🏠' },
  { pagePath: '/pages/product/list', text: '商品', icon: '🛍️' },
  { pagePath: '/pages/cart/index', text: '购物车', icon: '🛒' },
  { pagePath: '/pages/user/index', text: '我的', icon: '👤' }
]

const currentPath = ref('')

onMounted(() => {
  updatePath()
})

function updatePath() {
  const pages = getCurrentPages()
  if (pages.length > 0) {
    currentPath.value = '/' + pages[pages.length - 1].route
  }
}

function goTo(tab: typeof tabs[0]) {
  if (currentPath.value === tab.pagePath) return
  uni.switchTab({ url: tab.pagePath })
}
</script>

<template>
  <view class="custom-tabbar" :style="{ background: 'var(--bg-card)', borderColor: 'var(--border)' }">
    <view
      v-for="tab in tabs"
      :key="tab.pagePath"
      class="tab-item"
      :class="{ active: currentPath === tab.pagePath }"
      @click.stop="goTo(tab)"
    >
      <text class="tab-icon" :style="{ color: currentPath === tab.pagePath ? 'var(--tab-bar-active)' : 'var(--tab-bar-color)' }">
        {{ tab.icon }}
      </text>
      <text class="tab-text" :style="{ color: currentPath === tab.pagePath ? 'var(--tab-bar-active)' : 'var(--tab-bar-color)' }">
        {{ tab.text }}
      </text>
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
  border-top: 1rpx solid;
  z-index: 999;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;

  &:active {
    opacity: 0.6;
    transform: scale(0.95);
  }
}

.tab-icon {
  font-size: 44rpx;
  line-height: 1;
}

.tab-text {
  font-size: 22rpx;
  transition: color 0.2s;
}
</style>