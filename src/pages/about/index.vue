<script setup lang="ts">
import { THEME_CLASS } from '../../theme/config'

const aboutInfo = {
  name: '跨境电商',
  version: '1.0.0',
  description: '专注为您提供优质的跨境购物体验'
}

function callService() {
  uni.makePhoneCall({
    phoneNumber: '400-888-8888',
    fail: () => {
      uni.showToast({ title: '拨打功能暂不可用', icon: 'none' })
    }
  })
}
</script>

<template>
  <view :class="['about-page', THEME_CLASS]">
    <view class="about-header">
      <view class="app-logo">
        <uni-icons type="shop" size="60" color="var(--primary)" />
      </view>
      <text class="app-name">{{ aboutInfo.name }}</text>
      <text class="app-version">v{{ aboutInfo.version }}</text>
    </view>

    <view class="about-content">
      <view class="info-card">
        <view class="info-item" @click="callService">
          <view class="info-left">
            <uni-icons type="phone" size="20" color="var(--primary)" />
            <text class="info-text">联系客服</text>
          </view>
          <uni-icons type="right" size="14" color="var(--text-placeholder)" />
        </view>
      </view>

      <view class="info-card">
        <view class="info-item">
          <view class="info-left">
            <uni-icons type="info" size="20" color="var(--primary)" />
            <text class="info-text">版本说明</text>
          </view>
          <text class="info-value">最新版本</text>
        </view>
      </view>
    </view>

    <view class="about-desc">
      <text class="desc-text">{{ aboutInfo.description }}</text>
    </view>

    <view class="about-footer">
      <text class="copyright">© 2024 {{ aboutInfo.name }} 版权所有</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.about-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding: 32rpx;
}

.about-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0 60rpx;
}

.logo-icon {
  margin-bottom: 24rpx;
}

.app-name {
  font-size: 36rpx;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 12rpx;
}

.app-version {
  font-size: 24rpx;
  color: var(--text-sub);
}

.about-content {
  margin-bottom: 60rpx;
}

.info-card {
  background: var(--bg-card);
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  overflow: hidden;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
}

.info-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.info-text {
  font-size: 28rpx;
  color: var(--text-main);
}

.info-value {
  font-size: 26rpx;
  color: var(--text-sub);
}

.about-desc {
  text-align: center;
  padding: 40rpx 0;
}

.desc-text {
  font-size: 26rpx;
  color: var(--text-sub);
  line-height: 1.8;
}

.about-footer {
  position: fixed;
  bottom: calc(120rpx + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  text-align: center;
  padding: 32rpx;
}

.copyright {
  font-size: 22rpx;
  color: var(--text-placeholder);
}
</style>
