<script setup lang="ts">
import { ref, computed } from 'vue'

const selectedAddressId = ref<number>(1)
const checkoutItems = ref<any[]>([])
const loading = ref(false)

// 模拟收货地址
const addresses = ref([
  { id: 1, name: '张三', phone: '13812345678', province: '北京市', city: '北京市', district: '朝阳区', detail: '某某街道某某小区1号楼101', isDefault: true },
  { id: 2, name: '李四', phone: '13987654321', province: '上海市', city: '上海市', district: '浦东新区', detail: '某某路某某号', isDefault: false }
])

// 模拟商品数据（从本地存储获取）
onMounted(() => {
  const items = uni.getStorageSync('checkoutItems')
  if (items && items.length > 0) {
    checkoutItems.value = items
  } else {
    const quickBuy = uni.getStorageSync('quickBuy')
    if (quickBuy) {
      checkoutItems.value = [{
        id: 0,
        productId: quickBuy.productId,
        productName: '示例商品',
        price: 299,
        quantity: quickBuy.quantity,
        selected: true,
        coverImage: ''
      }]
    }
  }
})

const selectedAddress = computed(() => {
  return addresses.value.find(a => a.id === selectedAddressId.value) || addresses.value[0]
})

const totalAmount = computed(() => {
  return checkoutItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const freight = computed(() => {
  return totalAmount.value >= 99 ? 0 : 10
})

const orderTotal = computed(() => {
  return totalAmount.value + freight.value
})

function selectAddress(id: number) {
  selectedAddressId.value = id
}

function goToAddressList() {
  uni.navigateTo({ url: '/pages/address/list' })
}

function submitOrder() {
  uni.showModal({
    title: '提示',
    content: '模拟创建订单成功',
    showCancel: false,
    success: () => {
      uni.removeStorageSync('checkoutItems')
      uni.removeStorageSync('quickBuy')
      uni.redirectTo({ url: '/pages/order/list' })
    }
  })
}
</script>

<template>
  <view class="order-confirm">
    <!-- 收货地址 -->
    <view class="address-section" @click="goToAddressList">
      <view v-if="selectedAddress" class="address-content">
        <view class="address-icon">📍</view>
        <view class="address-info">
          <view class="address-header">
            <text class="name">{{ selectedAddress.name }}</text>
            <text class="phone">{{ selectedAddress.phone }}</text>
          </view>
          <text class="detail">{{ selectedAddress.province }} {{ selectedAddress.city }} {{ selectedAddress.district }} {{ selectedAddress.detail }}</text>
        </view>
      </view>
      <text class="arrow">></text>
    </view>

    <!-- 商品信息 -->
    <view class="goods-section">
      <view class="section-title">商品信息</view>
      <view v-for="item in checkoutItems" :key="item.id" class="goods-item">
        <view class="goods-img">
          <text class="placeholder-text">{{ item.productName?.charAt(0) || 'P' }}</text>
        </view>
        <view class="goods-info">
          <text class="goods-name">{{ item.productName }}</text>
          <text class="goods-price">¥{{ item.price }} × {{ item.quantity }}</text>
        </view>
      </view>
    </view>

    <!-- 金额汇总 -->
    <view class="summary-section">
      <view class="summary-row">
        <text class="label">商品金额</text>
        <text class="value">¥{{ totalAmount }}</text>
      </view>
      <view class="summary-row">
        <text class="label">运费</text>
        <text class="value" :class="{ discount: freight === 0 }">
          {{ freight === 0 ? '免运费' : '¥' + freight }}
        </text>
      </view>
      <view class="summary-row total">
        <text class="label">合计</text>
        <text class="value price">¥{{ orderTotal }}</text>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="pay-section">
      <text class="pay-btn" @click="submitOrder">提交订单</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.order-confirm {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 140rpx;
}

.address-section {
  display: flex;
  align-items: center;
  padding: 32rpx;
  background: var(--bg-card);
  margin-bottom: 24rpx;
}

.address-content {
  flex: 1;
  display: flex;
  align-items: center;
}

.address-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.address-info {
  flex: 1;
}

.address-header {
  display: flex;
  gap: 24rpx;
  margin-bottom: 12rpx;
}

.name {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main);
}

.phone {
  font-size: 28rpx;
  color: var(--text-sub);
}

.detail {
  font-size: 28rpx;
  color: var(--text-sub);
  line-height: 1.5;
}

.arrow {
  font-size: 32rpx;
  color: var(--text-placeholder);
}

.goods-section {
  background: var(--bg-card);
  padding: 24rpx 32rpx;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 24rpx;
}

.goods-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
}

.goods-img {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  overflow: hidden;
}

.placeholder-text {
  font-size: 40rpx;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
}

.goods-info {
  flex: 1;
}

.goods-name {
  display: block;
  font-size: 28rpx;
  color: var(--text-main);
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-price {
  display: block;
  font-size: 28rpx;
  color: var(--text-sub);
}

.summary-section {
  background: var(--bg-card);
  padding: 24rpx 32rpx;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;

  &.total {
    border-top: 1rpx solid var(--border);
    padding-top: 24rpx;
    margin-top: 8rpx;
  }
}

.label {
  font-size: 28rpx;
  color: var(--text-sub);
}

.value {
  font-size: 28rpx;
  color: var(--text-main);

  &.discount {
    color: var(--primary);
  }

  &.price {
    font-size: 36rpx;
    font-weight: 700;
    color: var(--price);
  }
}

.pay-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: var(--bg-card);
  border-top: 1rpx solid var(--border);
  z-index: 100;
}

.pay-btn {
  display: block;
  width: 100%;
  padding: 28rpx;
  background: var(--primary);
  color: #ffffff;
  text-align: center;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;
}
</style>