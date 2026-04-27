<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { cartApi, type CartItem } from '../../api'
import TabBar from '../../components/TabBar.vue'
import { THEME_CLASS } from '../../theme/config'

const cartItems = ref<CartItem[]>([])
const loading = ref(false)
const updatingIds = ref<Set<number>>(new Set())

onMounted(() => {
  loadCart()
})

async function loadCart() {
  loading.value = true
  try {
    const res = await cartApi.getList()
    if (res.code === 200 && res.data) {
      // 后端返回 { items: [], totalCount, totalPrice } 结构
      // 为每个item添加默认selected字段
      cartItems.value = (res.data.items || []).map(item => ({
        ...item,
        selected: item.selected ?? true
      }))
    }
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
    .reduce((sum, item) => sum + item.productPrice * item.quantity, 0)
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

async function updateQuantity(productId: number, delta: number) {
  const item = cartItems.value.find(i => i.productId === productId)
  if (!item) return

  // 防止重复点击
  if (updatingIds.value.has(productId)) return
  updatingIds.value.add(productId)

  const newQty = item.quantity + delta
  if (newQty < 1) {
    updatingIds.value.delete(productId)
    await removeItem(productId)
    return
  }

  // 乐观更新 UI
  item.quantity = newQty

  // 同步到服务器
  try {
    await cartApi.update(productId, newQty)
  } catch (error) {
    // 失败则回滚
    item.quantity -= delta
    uni.showToast({ title: '更新失败', icon: 'none' })
  } finally {
    updatingIds.value.delete(productId)
  }
}

async function removeItem(productId: number) {
  try {
    await cartApi.remove(productId)
    cartItems.value = cartItems.value.filter(item => item.productId !== productId)
    uni.showToast({ title: '已删除', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: '删除失败', icon: 'none' })
  }
}

function checkout() {
  if (selectedCount.value === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' })
    return
  }

  const selectedItems = cartItems.value.filter(item => item.selected)
  uni.setStorageSync('checkoutItems', JSON.stringify(selectedItems))

  uni.navigateTo({
    url: '/pages/order/confirm'
  })
}

function goToShop() {
  uni.switchTab({ url: '/pages/product/list' })
}
</script>

<template>
  <view :class="['cart-page', THEME_CLASS]">
    <TabBar />
    <!-- 空状态 -->
    <view v-if="!loading && cartItems.length === 0" class="empty-cart">
      <uni-icons type="cart" size="80" color="var(--text-placeholder)" />
      <text class="empty-text">购物车是空的</text>
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
            <text class="item-price">¥{{ item.productPrice }}</text>
          </view>

          <!-- 数量控制 -->
          <view class="item-control">
            <text class="qty-btn" @click="updateQuantity(item.productId, -1)">-</text>
            <text class="qty-value">{{ item.quantity }}</text>
            <text class="qty-btn" @click="updateQuantity(item.productId, 1)">+</text>
          </view>

          <!-- 删除按钮 -->
          <text class="delete-btn" @click="removeItem(item.productId)">×</text>
        </view>
      </view>

      <!-- 底部操作栏 -->
      <view class="cart-footer">
        <view class="select-all" @click="toggleAll">
          <view class="checkbox" :class="{ selected: allSelected }"></view>
          <text class="select-text">全选</text>
        </view>
        <view class="total-section">
          <text class="total-label">合计</text>
          <text class="total-price">¥{{ totalPrice }}</text>
        </view>
        <text class="checkout-btn" @click="checkout">结算</text>
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

.empty-text {
  font-size: 32rpx;
  color: var(--text-sub);
  margin-top: 32rpx;
  margin-bottom: 32rpx;
}

.empty-btn {
  padding: 20rpx 48rpx;
  background: var(--primary);
  color: var(--text-inverse);
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
  bottom: calc(100rpx + env(safe-area-inset-bottom));
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
  color: var(--text-inverse);
  border-radius: 44rpx;
  font-size: 28rpx;
  font-weight: 600;
}
</style>