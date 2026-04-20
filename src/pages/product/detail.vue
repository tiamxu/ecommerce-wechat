<script setup lang="ts">
import { ref } from 'vue'

const product = ref<any>({
  id: 1,
  name: '示例商品',
  price: 299,
  stock: 100,
  description: '这是商品的详细描述信息，包含商品的特点、材质、使用方法等。',
  coverImage: '',
  images: [],
  tags: ['热销', '新品']
})

const quantity = ref(1)
const currentImageIndex = ref(0)

function decreaseQty() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function increaseQty() {
  if (quantity.value < product.value.stock) {
    quantity.value++
  }
}

function addToCart() {
  uni.showToast({ title: '已加入购物车', icon: 'success' })
}

function buyNow() {
  uni.setStorageSync('quickBuy', {
    productId: product.value.id,
    quantity: quantity.value
  })
  uni.navigateTo({
    url: '/pages/order/confirm'
  })
}
</script>

<template>
  <view class="product-detail">
    <!-- 商品图片 -->
    <view class="detail-swiper">
      <view class="img-placeholder">
        <text class="placeholder-text">{{ product.name?.charAt(0) || 'P' }}</text>
      </view>
    </view>

    <!-- 商品信息 -->
    <view class="detail-info">
      <view class="info-header">
        <text class="product-price">¥{{ product.price }}</text>
        <text class="product-stock">{{ $t('product.stock') }}: {{ product.stock }}</text>
      </view>
      <text class="product-name">{{ product.name }}</text>
      <text v-if="product.description" class="product-desc">{{ product.description }}</text>
    </view>

    <!-- 商品标签 -->
    <view v-if="product.tags?.length" class="detail-tags">
      <text v-for="tag in product.tags" :key="tag" class="tag">{{ tag }}</text>
    </view>

    <!-- 操作栏 -->
    <view class="action-bar">
      <view class="quantity">
        <text class="qty-label">数量</text>
        <view class="qty-control">
          <text class="qty-btn" @click="decreaseQty">-</text>
          <text class="qty-value">{{ quantity }}</text>
          <text class="qty-btn" @click="increaseQty">+</text>
        </view>
      </view>
      <view class="action-buttons">
        <text class="btn-add" @click="addToCart">{{ $t('product.addCart') }}</text>
        <text class="btn-buy" @click="buyNow">{{ $t('product.buyNow') }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.product-detail {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 140rpx;
}

.detail-swiper {
  width: 100%;
  height: 750rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  font-size: 120rpx;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
}

.detail-info {
  padding: 32rpx;
  background: var(--bg-card);
  margin-bottom: 24rpx;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.product-price {
  font-size: 56rpx;
  font-weight: 700;
  color: var(--price);
}

.product-stock {
  font-size: 24rpx;
  color: var(--text-sub);
}

.product-name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 16rpx;
}

.product-desc {
  display: block;
  font-size: 28rpx;
  color: var(--text-sub);
  line-height: 1.6;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 24rpx 32rpx;
  background: var(--bg-card);
  margin-bottom: 24rpx;
}

.tag {
  padding: 8rpx 24rpx;
  background: var(--bg-page);
  border: 1rpx solid var(--border);
  border-radius: 40rpx;
  font-size: 24rpx;
  color: var(--text-sub);
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: var(--bg-card);
  border-top: 1rpx solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
}

.quantity {
  display: flex;
  align-items: center;
}

.qty-label {
  font-size: 28rpx;
  color: var(--text-sub);
  margin-right: 16rpx;
}

.qty-control {
  display: flex;
  align-items: center;
  background: var(--bg-page);
  border-radius: 8rpx;
}

.qty-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  font-weight: 600;
  color: var(--text-main);

  &:active {
    background: var(--border);
  }
}

.qty-value {
  width: 72rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main);
}

.action-buttons {
  display: flex;
  gap: 20rpx;
}

.btn-add, .btn-buy {
  padding: 20rpx 36rpx;
  border-radius: 44rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.btn-add {
  background: var(--accent);
  color: #ffffff;
}

.btn-buy {
  background: var(--primary);
  color: #ffffff;
}
</style>