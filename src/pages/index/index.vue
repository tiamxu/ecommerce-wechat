<script setup lang="ts">
import ThemeSwitcher from '../../components/ThemeSwitcher.vue'
</script>

<template>
  <view class="home">
    <view class="banner">
      <swiper class="banner-swiper" indicator-dots autoplay circular>
        <swiper-item>
          <view class="banner-item" style="background: linear-gradient(135deg, var(--primary), var(--accent));">
            <text class="banner-text">电商小程序</text>
          </view>
        </swiper-item>
        <swiper-item>
          <view class="banner-item" style="background: linear-gradient(135deg, var(--primary), var(--accent));">
            <text class="banner-text">新品上市</text>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 当前主题信息 -->
    <ThemeSwitcher />

    <view class="demo-section">
      <view class="demo-title">主题色展示</view>
      <view class="color-list">
        <view class="color-item">
          <view class="color-preview" style="background: var(--primary);"></view>
          <text class="color-name">Primary</text>
        </view>
        <view class="color-item">
          <view class="color-preview" style="background: var(--accent);"></view>
          <text class="color-name">Accent</text>
        </view>
        <view class="color-item">
          <view class="color-preview" style="background: var(--price);"></view>
          <text class="color-name">Price</text>
        </view>
      </view>
    </view>

    <view class="demo-section">
      <view class="demo-title">功能入口</view>
      <view class="nav-grid">
        <view class="nav-item" @click="navigateTo('/pages/product/list')">
          <text class="nav-icon">📦</text>
          <text class="nav-text">商品列表</text>
        </view>
        <view class="nav-item" @click="navigateTo('/pages/cart/index')">
          <text class="nav-icon">🛒</text>
          <text class="nav-text">购物车</text>
        </view>
        <view class="nav-item" @click="navigateTo('/pages/user/index')">
          <text class="nav-icon">👤</text>
          <text class="nav-text">个人中心</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts">
function navigateTo(url: string) {
  uni.navigateTo({ url })
}
</script>

<style scoped lang="scss">
.home {
  min-height: 100vh;
  background: var(--bg-page);
}

.banner {
  width: 100%;
  height: 300rpx;
}

.banner-swiper {
  width: 100%;
  height: 100%;
}

.banner-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-text {
  color: #ffffff;
  font-size: 36rpx;
  font-weight: 600;
}

.demo-section {
  padding: 24rpx;
  background: var(--bg-card);
  margin: 24rpx;
  border-radius: 16rpx;
}

.demo-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 24rpx;
}

.color-list {
  display: flex;
  gap: 32rpx;
}

.color-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.color-preview {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  margin-bottom: 12rpx;
  box-shadow: 0 4rpx 12rpx var(--shadow);
}

.color-name {
  font-size: 24rpx;
  color: var(--text-sub);
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx;
  background: var(--bg-page);
  border-radius: 16rpx;
  transition: all 0.3s;

  &:active {
    opacity: 0.7;
  }
}

.nav-icon {
  font-size: 48rpx;
  margin-bottom: 12rpx;
}

.nav-text {
  font-size: 24rpx;
  color: var(--text-main);
}
</style>