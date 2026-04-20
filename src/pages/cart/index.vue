<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { mockRequest, type CartItem } from '../../api'

const cartItems = ref<CartItem[]>([])
const loading = ref(false)

// 模拟购物车数据
const MOCK_CART: CartItem[] = [
  { id: 1, productId: 1, productName: '示例商品1', price: 299, quantity: 2, selected: true, coverImage: '' },
  { id: 2, productId: 2, productName: '示例商品2', price: 599, quantity: 1, selected: true, coverImage: '' }
]

onMounted(() => {
  loadCart()
})

async function loadCart() {
  loading.value = true
  try {
    // 模拟请求
    const res = await mockRequest(MOCK_CART)
    cartItems.value = res.data
  } catch (error) {
    console.error('加载购物车失败', error)
  } finally {
    loading.value = false
  }
}

const allSelected = computed({
  get: () => cartItems.value.length > 0 && cartItems.value.every(item => item.selected),
  set: (val: boolean) => {
    cartItems.value.forEach(item => item.selected = val)
  }
})

const totalPrice = computed(() => {
  return cartItems.value
    .filter(item => item.selected)
    .reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const selectedCount = computed(() => {
  return cartItems.value.filter(item => item.selected).length
})

function toggleAll() {
  allSelected.value = !allSelected.value
}

function toggleItem(id: number) {
  const item = cartItems.value.find(i => i.id === id)
  if (item) {
    item.selected = !item.selected
  }
}

function updateQuantity(id: number, delta: number) {
  const item = cartItems.value.find(i => i.id === id)
  if (!item) return

  const newQty = item.quantity + delta
  if (newQty < 1) return

  item.quantity = newQty
}

function removeItem(id: number) {
  cartItems.value = cartItems.value.filter(item => item.id !== id)
  uni.showToast({ title: '已删除', icon: 'success' })
}

function checkout() {
  if (selectedCount.value === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' })
    return
  }

  const selectedItems = cartItems.value.filter(item => item.selected)
  uni.setStorageSync('checkoutItems', selectedItems)

  uni.navigateTo({
    url: '/pages/order/confirm'
  })
}

function goToShop() {
  uni.switchTab({ url: '/pages/product/list' })
}
</script>

<template>
  <view class="cart-page">
    <!-- 空状态 -->
    <view v-if="!loading && cartItems.length === 0" class="empty-cart">
      <text class="empty-icon">🛒</text>
      <text class="empty-text">{{ $t('cart.empty') }}</text>
      <text class="empty-btn" @click="goToShop">去逛逛</text>
    </view>

    <!-- 购物车列表 -->
    <view v-else class="cart-content">
      <view class="cart-list">
        <view v-for="item in cartItems" :key="item.id" class="cart-item">
          <!-- 选择框 -->
          <view
            class="item-checkbox"
            :class="{ selected: item.selected }"
            @click="toggleItem(item.id)"
          ></view>

          <!-- 商品图片 -->
          <view class="item-img">
            <image v-if="item.coverImage" :src="item.coverImage" mode="aspectFill" class="cover-img" />
            <text v-else class="placeholder-text">{{ item.productName?.charAt(0) || 'P' }}</text>
          </view>

          <!-- 商品信息 -->
          <view class="item-info">
            <text class="item-name">{{ item.productName }}</text>
            <text class="item-price">¥{{ item.price }}</text>
          </view>

          <!-- 数量控制 -->
          <view class="item-control">
            <text class="qty-btn" @click="updateQuantity(item.id, -1)">-</text>
            <text class="qty-value">{{ item.quantity }}</text>
            <text class="qty-btn" @click="updateQuantity(item.id, 1)">+</text>
          </view>

          <!-- 删除按钮 -->
          <text class="delete-btn" @click="removeItem(item.id)">×</text>
        </view>
      </view>

      <!-- 底部操作栏 -->
      <view class="cart-footer">
        <view class="select-all" @click="toggleAll">
          <view class="checkbox" :class="{ selected: allSelected }"></view>
          <text class="select-text">全选</text>
        </view>
        <view class="total-section">
          <text class="total-label">{{ $t('cart.total') }}</text>
          <text class="total-price">¥{{ totalPrice }}</text>
        </view>
        <text class="checkout-btn" @click="checkout">{{ $t('cart.checkout') }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.cart-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 140rpx;
}

.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.empty-text {
  font-size: 32rpx;
  color: var(--text-sub);
  margin-bottom: 32rpx;
}

.empty-btn {
  padding: 20rpx 48rpx;
  background: var(--primary);
  color: #ffffff;
  border-radius: 40rpx;
  font-size: 28rpx;
}

.cart-content {
  padding: 24rpx;
}

.cart-list {
  background: var(--bg-card);
  border-radius: 16rpx;
  overflow: hidden;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid var(--border);

  &:last-child {
    border-bottom: none;
  }
}

.item-checkbox, .checkbox {
  width: 44rpx;
  height: 44rpx;
  border: 2rpx solid var(--border);
  border-radius: 50%;
  margin-right: 20rpx;
  flex-shrink: 0;

  &.selected {
    background: var(--primary);
    border-color: var(--primary);
    &::after {
      content: '✓';
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 24rpx;
    }
  }
}

.item-img {
  width: 140rpx;
  height: 140rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
  flex-shrink: 0;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
}

.placeholder-text {
  font-size: 48rpx;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  display: block;
  font-size: 28rpx;
  color: var(--text-main);
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-price {
  display: block;
  font-size: 28rpx;
  color: var(--price);
  font-weight: 600;
}

.item-control {
  display: flex;
  align-items: center;
  background: var(--bg-page);
  border-radius: 8rpx;
  margin-right: 16rpx;
}

.qty-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main);

  &:active {
    background: var(--border);
  }
}

.qty-value {
  width: 56rpx;
  text-align: center;
  font-size: 28rpx;
  color: var(--text-main);
}

.delete-btn {
  font-size: 40rpx;
  color: var(--text-placeholder);
  padding: 8rpx;
  flex-shrink: 0;
}

.cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: var(--bg-card);
  border-top: 1rpx solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
}

.select-all {
  display: flex;
  align-items: center;
}

.select-text {
  font-size: 28rpx;
  color: var(--text-main);
  margin-left: 12rpx;
}

.total-section {
  flex: 1;
  text-align: right;
  margin-right: 24rpx;
}

.total-label {
  font-size: 24rpx;
  color: var(--text-sub);
}

.total-price {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: var(--price);
}

.checkout-btn {
  padding: 24rpx 48rpx;
  background: var(--primary);
  color: #ffffff;
  border-radius: 44rpx;
  font-size: 28rpx;
  font-weight: 600;
}
</style>