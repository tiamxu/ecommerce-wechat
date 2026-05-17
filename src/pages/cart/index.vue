<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { useUserStore } from '../../store/user'
import { useCartStore } from '../../store/cart'
import { favoriteApi } from '../../api'
import TabBar from '../../components/TabBar.vue'
import PriceText from '../../components/PriceText.vue'
import { THEME_CLASS } from '../../theme/config'

const userStore = useUserStore()
const cartStore = useCartStore()
const checkoutLoading = ref(false)

// 滑动状态管理
const swipeState = ref<Record<number, 'left' | 'right' | ''>>({})

onMounted(() => {
  loadCart()
})

onShow(() => {
  if (userStore.isLoggedIn) {
    loadCart()
  }
})

async function loadCart() {
  await cartStore.loadCart()
  // 重置展开状态
  expandedId.value = null
}

// 下拉刷新
onPullDownRefresh(() => {
  loadCart().finally(() => {
    uni.stopPullDownRefresh()
  })
})

const allSelected = computed({
  get: () => cartStore.items.length > 0 && cartStore.items.every(item => item.selected !== false),
  set: () => {
    cartStore.toggleSelectAll()
  }
})

const totalPrice = computed(() => {
  return cartStore.selectedPrice
})

const selectedCount = computed(() => {
  return cartStore.selectedCount
})

function toggleAll() {
  cartStore.toggleSelectAll()
}

function toggleItem(productId: number) {
  cartStore.toggleSelect(productId)
}

async function updateQuantity(productId: number, delta: number) {
  const item = cartStore.items.find(i => i.productId === productId)
  if (!item) return

  const newQty = item.quantity + delta
  if (newQty < 1) {
    await removeItem(productId)
    return
  }

  const result = await cartStore.updateQuantity(productId, newQty)
  if (!result.success) {
    uni.showToast({ title: result.message || '更新失败', icon: 'none' })
  }
}

async function removeItem(productId: number) {
  // 关闭滑动
  swipeState.value[productId] = ''

  const result = await cartStore.removeItem(productId)
  if (result.success) {
    uni.showToast({ title: '已删除', icon: 'success' })
  } else {
    uni.showToast({ title: result.message || '删除失败', icon: 'none' })
  }
}

async function moveToFavorite(productId: number) {
  // 关闭滑动
  swipeState.value[productId] = ''

  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/user/login' })
    }, 1500)
    return
  }

  try {
    // 检查是否已收藏
    const checkRes = await favoriteApi.check(productId)
    if (checkRes.code === 200 && checkRes.data?.isFavorite) {
      // 已收藏，直接从购物车删除
      await cartStore.removeItem(productId)
    } else {
      // 未收藏，添加后删除
      await favoriteApi.add(productId)
      await cartStore.removeItem(productId)
    }
  } catch (error) {
    // 静默处理
  }
}

async function checkout() {
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/user/login' })
    }, 1500)
    return
  }

  if (selectedCount.value === 0) {
    uni.showToast({ title: '请选择商品', icon: 'none' })
    return
  }

  if (checkoutLoading.value) return
  checkoutLoading.value = true

  const selectedItems = cartStore.items.filter(item => item.selected !== false)
  uni.setStorageSync('checkoutItems', JSON.stringify(selectedItems))

  uni.navigateTo({
    url: '/pages/order/confirm',
    complete: () => {
      checkoutLoading.value = false
    }
  })
}

function goToShop() {
  uni.switchTab({ url: '/pages/product/list' })
}

function goToDetail(productId: number) {
  // 关闭滑动
  swipeState.value[productId] = ''
  uni.navigateTo({ url: `/pages/product/detail?id=${productId}` })
}

// 滑动相关
let startX = 0
let movingX = 0

// 数量展开状态
const expandedId = ref<number | null>(null)

function toggleExpand(productId: number) {
  if (expandedId.value === productId) {
    expandedId.value = null
  } else {
    expandedId.value = productId
  }
}

function onTouchStart(e: TouchEvent, productId: number) {
  startX = e.touches[0].clientX
  movingX = 0
}

function onTouchMove(e: TouchEvent, productId: number) {
  const currentX = e.touches[0].clientX
  movingX = currentX - startX

  // 只响应水平滑动
  if (Math.abs(movingX) > 10) {
    e.preventDefault()
  }

  if (movingX < -30) {
    swipeState.value[productId] = 'left'
  } else if (movingX > 30) {
    swipeState.value[productId] = 'right'
  } else {
    swipeState.value[productId] = ''
  }
}

function onTouchEnd(productId: number) {
  if (swipeState.value[productId] === 'left' || swipeState.value[productId] === 'right') {
    // 保持滑动状态
  } else {
    // 重置
    swipeState.value[productId] = ''
  }
}
</script>

<template>
  <view :class="['cart-page', THEME_CLASS]">
    <TabBar />
    <!-- 空状态 -->
    <view v-if="!cartStore.loading && cartStore.items.length === 0" class="empty-cart">
      <uni-icons type="cart" size="64" color="var(--text-placeholder)" />
      <text class="empty-text">购物车是空的</text>
      <text class="empty-desc">快去挑选心仪的商品吧</text>
      <text class="empty-btn" @click="goToShop">去逛逛</text>
    </view>

    <!-- 购物车列表 -->
    <view v-else class="cart-content">
      <view class="cart-list">
        <view
          v-for="item in cartStore.items"
          :key="item.id"
          class="cart-item-wrapper"
        >
          <!-- 移入收藏按钮（滑动后显示） -->
          <view class="favorite-action" @click="moveToFavorite(item.productId)">
            <uni-icons type="star" size="22" color="var(--text-inverse)" />
            <text class="action-text">移入收藏</text>
          </view>

          <!-- 删除按钮（滑动后显示） -->
          <view class="delete-action" @click="removeItem(item.productId)">
            <uni-icons type="trash" size="22" color="var(--text-inverse)" />
            <text class="delete-text">删除</text>
          </view>

          <!-- 商品内容 -->
          <view
            class="cart-item"
            :class="{ swiped: swipeState[item.productId] === 'left' }"
            @touchstart="onTouchStart($event, item.productId)"
            @touchmove="onTouchMove($event, item.productId)"
            @touchend="onTouchEnd(item.productId)"
            @click="goToDetail(item.productId)"
          >
            <!-- 选择框 -->
            <view
              class="item-checkbox"
              :class="{ selected: item.selected }"
              :aria-label="item.selected ? '取消选择商品' : '选择商品'"
              role="checkbox"
              :aria-checked="item.selected"
              @click="toggleItem(item.productId)"
            >
              <view v-if="item.selected" class="check-icon"></view>
            </view>

            <!-- 商品图片 -->
            <view class="item-img">
              <image
                v-if="item.coverImage"
                :src="item.coverImage"
                mode="aspectFill"
                class="cover-img"
                :alt="item.productName"
                lazy-load
              />
              <text v-else class="placeholder-text">{{ item.productName?.charAt(0) || 'P' }}</text>
            </view>

            <!-- 商品信息 -->
            <view class="item-info">
              <text class="item-name">{{ item.productName }}</text>
              <PriceText :price="item.productPrice || 0" size="small" />
            </view>

            <!-- 数量控制 -->
            <view class="item-control">
              <view v-if="expandedId !== item.productId" class="qty-display" @click="toggleExpand(item.productId)">
                <text class="qty-text">×{{ item.quantity }}</text>
              </view>
              <view v-else class="qty-edit">
                <text class="qty-btn" aria-label="减少数量" @click="updateQuantity(item.productId, -1)">-</text>
                <text class="qty-value">{{ item.quantity }}</text>
                <text class="qty-btn" aria-label="增加数量" @click="updateQuantity(item.productId, 1)">+</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 底部操作栏 -->
      <view class="cart-footer">
        <view class="select-all" @click="toggleAll" role="checkbox" :aria-checked="allSelected" :aria-label="allSelected ? '取消全选' : '全选'">
          <view class="checkbox" :class="{ selected: allSelected }">
            <view v-if="allSelected" class="check-icon"></view>
          </view>
          <text class="select-text">全选</text>
        </view>
        <view class="total-section">
          <text class="total-label">合计</text>
          <text class="total-price">¥{{ totalPrice.toFixed(2) }}</text>
        </view>
        <text class="checkout-btn" :class="{ loading: checkoutLoading }" @click="checkout">
          {{ checkoutLoading ? '结算中...' : '结算' }}
        </text>
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
  font-size: 30rpx;
  color: var(--text-main);
  margin-top: 24rpx;
  margin-bottom: 8rpx;
  font-weight: 500;
}

.empty-desc {
  font-size: 26rpx;
  color: var(--text-sub);
  margin-bottom: 32rpx;
}

.empty-btn {
  padding: 18rpx 44rpx;
  background: var(--primary);
  color: var(--text-inverse);
  border-radius: 40rpx;
  font-size: 26rpx;
}

.cart-content {
  padding: 24rpx;
}

.cart-list {
  background: var(--bg-card);
  border-radius: 16rpx;
  overflow: hidden;
}

.cart-item-wrapper {
  position: relative;
  overflow: hidden;
}

.delete-action {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 160rpx;
  background: var(--text-placeholder);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  z-index: 1;
}

.favorite-action {
  position: absolute;
  right: 160rpx;
  top: 0;
  bottom: 0;
  width: 160rpx;
  background: var(--primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  z-index: 1;
}

.action-text {
  color: var(--text-inverse);
  font-size: 22rpx;
}

.delete-text {
  color: var(--text-inverse);
  font-size: 22rpx;
  font-weight: 500;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: var(--bg-card);
  border-bottom: 1rpx solid var(--border);
  transition: transform 0.2s ease;
  position: relative;
  z-index: 2;

  &.swiped {
    transform: translateX(-320rpx);
  }

  &:last-child {
    border-bottom: none;
  }
}

.item-checkbox, .checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid var(--border);
  border-radius: 50%;
  margin-right: 16rpx;
  flex-shrink: 0;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &.selected {
    background: var(--accent);
    border-color: var(--accent);
  }
}

.check-icon {
  width: 18rpx;
  height: 10rpx;
  border-left: 2.5rpx solid var(--text-inverse);
  border-bottom: 2.5rpx solid var(--text-inverse);
  transform: rotate(-45deg) translateY(-1rpx);
}

.item-img {
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  flex-shrink: 0;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
}

.placeholder-text {
  font-size: 36rpx;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  display: block;
  font-size: 26rpx;
  color: var(--text-main);
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-control {
  display: flex;
  align-items: center;
  min-width: 80rpx;
  justify-content: flex-end;
}

.qty-display {
  padding: 8rpx 12rpx;
  border-radius: 8rpx;
  background: var(--bg-page);
}

.qty-text {
  font-size: 24rpx;
  color: var(--text-sub);
  font-weight: 500;
}

.qty-edit {
  display: flex;
  align-items: center;
  background: var(--bg-page);
  border-radius: 8rpx;
  padding: 0 4rpx;
}

.qty-btn {
  width: 52rpx;
  height: 52rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-main);
  border-radius: 8rpx;
  background: var(--bg-page);
  transition: all 0.15s ease;

  &:active {
    background: var(--primary-light);
    color: var(--primary);
  }
}

.qty-value {
  min-width: 44rpx;
  text-align: center;
  font-size: 26rpx;
  color: var(--text-main);
  padding: 0 6rpx;
}

.cart-footer {
  position: fixed;
  bottom: calc(100rpx + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
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
  font-variant-numeric: tabular-nums;
}

.checkout-btn {
  padding: 20rpx 40rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  color: var(--text-inverse);
  border-radius: 40rpx;
  font-size: 26rpx;
  font-weight: 600;
  box-shadow: 0 6rpx 20rpx var(--primary-light);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:active {
    transform: scale(0.96);
    box-shadow: 0 4rpx 12rpx var(--primary-light);
  }

  &.loading {
    opacity: 0.7;
  }
}
</style>