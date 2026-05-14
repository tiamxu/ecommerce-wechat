<script setup lang="ts">
function goToSearch() {
  uni.navigateTo({
    url: '/pages/search/index'
  })
}
</script>

<template>
  <view class="search-entry" @click="goToSearch">
    <uni-icons type="search" size="16" color="var(--text-placeholder)" />
    <text class="search-hint">搜索商品</text>
  </view>
</template>

<style scoped lang="scss">
.search-entry {
  display: flex;
  align-items: center;
  height: 64rpx;
  padding: 0 24rpx;
  background: var(--bg-card);
  border-radius: 32rpx;
  gap: 8rpx;
}

.search-hint {
  font-size: 26rpx;
  color: var(--text-placeholder);
}
</style>