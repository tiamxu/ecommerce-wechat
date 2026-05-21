<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { orderApi, type OrderItem, type OrderProduct } from '../../api/order'
import { THEME_CLASS } from '../../theme/config'
import PriceText from '../../components/PriceText.vue'

const loading = ref(false)
const order = ref<OrderItem | null>(null)

const statusMap: Record<string, { label: string; color: string }> = {
  '0': { label: '待付款', color: 'var(--accent)' },
  '1': { label: '待发货', color: 'var(--primary)' },
  '2': { label: '待收货', color: 'var(--primary)' },
  '3': { label: '已完成', color: 'var(--text-sub)' },
  '4': { label: '已取消', color: 'var(--text-placeholder)' }
}

const statusInfo = computed(() => {
  if (!order.value) return { label: '', color: '' }
  const key = String(order.value.status)
  return statusMap[key] || { label: order.value.status, color: 'var(--text-sub)' }
})

// 判断是否是待付款状态
function isPending(status: any): boolean {
  return String(status) === '0'
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const id = currentPage?.options?.id

  if (id) {
    loadOrderDetail(Number(id))
  }
})

async function loadOrderDetail(orderId: number) {
  loading.value = true
  try {
    const res = await orderApi.getDetail(orderId)
    if (res.code === 200 && res.data) {
      order.value = res.data
    }
  } catch (error) {
    console.error('加载订单详情失败', error)
  } finally {
    loading.value = false
  }
}

async function payOrder() {
  if (!order.value) return
  try {
    await orderApi.pay(order.value.id, 'wechat')
    uni.showToast({ title: '支付成功', icon: 'success' })
    loadOrderDetail(order.value.id)
  } catch (error) {
    console.error('支付失败', error)
  }
}

async function cancelOrder() {
  if (!order.value) return
  const res = await uni.showModal({
    title: '确认取消',
    content: '确定要取消该订单吗？',
    showCancel: true
  })

  if (res.confirm) {
    try {
      await orderApi.cancel(order.value.id)
      uni.showToast({ title: '订单已取消', icon: 'success' })
      loadOrderDetail(order.value.id)
    } catch (error) {
      console.error('取消订单失败', error)
    }
  }
}

function goBack() {
  uni.navigateBack()
}
</script>

<template>
  <view :class="['order-detail', THEME_CLASS]">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-section">
      <view class="loading-icon"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 订单不存在 -->
    <view v-else-if="!order" class="empty-section">
      <view class="empty-icon">
        <uni-icons type="paperclip" size="40" color="var(--text-placeholder)" />
      </view>
      <text class="empty-title">订单不存在</text>
      <view class="back-btn" @click="goBack">
        <text>返回</text>
      </view>
    </view>

    <!-- 订单详情 -->
    <view v-else class="detail-content">
      <!-- 订单状态 -->
      <view class="status-card">
        <view class="status-header">
          <view class="status-dot" :style="{ background: statusInfo.color }"></view>
          <text class="status-text" :style="{ color: statusInfo.color }">{{ statusInfo.label }}</text>
        </view>
        <text class="order-time">下单时间: {{ order.createTime }}</text>
      </view>

      <!-- 收货地址 -->
      <view v-if="order.address" class="address-card">
        <view class="address-icon">
          <uni-icons type="location" size="20" color="var(--primary)" />
        </view>
        <view class="address-content">
          <view class="address-header">
            <text class="name">{{ order.address.receiverName }}</text>
            <text class="phone">{{ order.address.phone }}</text>
          </view>
          <text class="detail">
            <text v-if="order.address.province" class="region-tag">{{ order.address.province }}</text>
            {{ order.address.city }} {{ order.address.address }}
          </text>
        </view>
      </view>

      <!-- 商品列表 -->
      <view class="card goods-card">
        <view class="card-header">
          <text class="card-title">商品信息</text>
          <text class="goods-count">{{ order.items?.length || 0 }}件</text>
        </view>
        <view v-for="(item, index) in order.items" :key="index" class="goods-item">
          <view class="goods-img-wrap">
            <image v-if="item.image" :src="item.image?.urlMedium || item.image?.url || item.image" class="goods-img" mode="aspectFill" />
            <view v-else class="goods-placeholder">
              <text class="placeholder-text">{{ item.productName?.charAt(0) || 'P' }}</text>
            </view>
          </view>
          <view class="goods-detail">
            <text class="goods-name">{{ item.productName }}</text>
            <view class="goods-price-row">
              <PriceText :price="item.productPrice || item.price || 0" size="small" />
              <text class="quantity">x{{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="card info-card">
        <view class="card-header">
          <text class="card-title">订单信息</text>
        </view>
        <view class="info-grid">
          <view class="info-row">
            <text class="label">订单编号</text>
            <text class="value">{{ order.orderNo }}</text>
          </view>
          <view class="info-row">
            <text class="label">下单时间</text>
            <text class="value">{{ order.createTime }}</text>
          </view>
        </view>
      </view>

      <!-- 金额汇总 -->
      <view class="card summary-card">
        <view class="summary-row">
          <text class="label">商品金额</text>
          <PriceText :price="order.totalAmount" />
        </view>
        <view class="summary-row">
          <text class="label">运费</text>
          <text v-if="order.freight === 0" class="value highlight">免运费</text>
          <PriceText v-else :price="order.freight" />
        </view>
        <view class="summary-row total-row">
          <text class="total-label">实付款</text>
          <PriceText :price="order.totalAmount + order.freight" size="large" />
        </view>
      </view>

      <!-- 底部操作栏 -->
      <view class="action-bar">
        <view class="action-left">
          <PriceText :price="order.totalAmount + order.freight" size="large" />
          <text class="pay-label">实付款</text>
        </view>
        <view class="action-btns">
          <text
            v-if="isPending(order.status)"
            class="action-btn cancel"
            @click="cancelOrder"
          >取消订单</text>
          <text
            v-if="isPending(order.status)"
            class="action-btn pay"
            @click="payOrder"
          >去付款</text>
          <text class="action-btn back" @click="goBack">返回</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.order-detail {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: calc(160rpx + env(safe-area-inset-bottom));
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 0;
  gap: 24rpx;
}

.loading-icon {
  width: 64rpx;
  height: 64rpx;
  border: 4rpx solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 28rpx;
  color: var(--text-sub);
}

.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 0 80rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 32rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 48rpx;
}

.back-btn {
  padding: 20rpx 64rpx;
  background: var(--primary);
  color: var(--text-inverse);
  border-radius: 44rpx;
  font-size: 28rpx;
}

.detail-content {
  padding: 24rpx;
}

/* 订单状态卡片 */
.status-card {
  background: var(--bg-card);
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 20rpx;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.status-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
}

.status-text {
  font-size: 36rpx;
  font-weight: 700;
}

.order-time {
  font-size: 24rpx;
  color: var(--text-sub);
}

/* 收货地址卡片 */
.address-card {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  background: var(--bg-card);
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
}

.address-icon {
  width: 64rpx;
  height: 64rpx;
  background: var(--primary-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.address-content {
  flex: 1;
}

.address-header {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
  margin-bottom: 10rpx;
}

.name {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main);
}

.phone {
  font-size: 26rpx;
  color: var(--text-sub);
}

.detail {
  font-size: 26rpx;
  color: var(--text-sub);
  line-height: 1.5;
}

.region-tag {
  background: var(--primary-light);
  color: var(--primary);
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  margin-right: 8rpx;
}

/* 通用卡片 */
.card {
  background: var(--bg-card);
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.card-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-main);
}

.goods-count {
  font-size: 24rpx;
  color: var(--text-sub);
}

/* 商品列表 */
.goods-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid var(--border);

  &:last-child {
    border-bottom: none;
  }
}

.goods-img-wrap {
  width: 140rpx;
  height: 140rpx;
  border-radius: 16rpx;
  overflow: hidden;
  margin-right: 24rpx;
}

.goods-img {
  width: 100%;
  height: 100%;
}

.goods-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  font-size: 48rpx;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
}

.goods-detail {
  flex: 1;
}

.goods-name {
  display: block;
  font-size: 28rpx;
  color: var(--text-main);
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quantity {
  font-size: 26rpx;
  color: var(--text-sub);
}

/* 订单信息 */
.info-grid {
  display: flex;
  flex-direction: column;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 14rpx 0;
  border-bottom: 1rpx solid var(--border);

  &:last-child {
    border-bottom: none;
  }
}

.label {
  font-size: 26rpx;
  color: var(--text-sub);
}

.value {
  font-size: 26rpx;
  color: var(--text-main);
}

/* 金额汇总 */
.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14rpx 0;
}

.total-row {
  margin-top: 12rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid var(--border);
}

.highlight {
  color: var(--primary);
}

.total-label {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-main);
}

.total-value {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--price);
}

/* 底部操作栏 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: var(--bg-card);
  border-top: 1rpx solid var(--border);
  z-index: 100;
}

.action-left {
  display: flex;
  flex-direction: column;
}

.pay-amount {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--price);
}

.pay-label {
  font-size: 22rpx;
  color: var(--text-sub);
  margin-top: 4rpx;
}

.action-btns {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  padding: 18rpx 40rpx;
  border-radius: 44rpx;
  font-size: 28rpx;
  font-weight: 500;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:active {
    transform: scale(0.96);
  }

  &.pay {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
    color: var(--text-inverse);
    box-shadow: 0 4rpx 16rpx var(--primary-light);
  }

  &.cancel {
    background: var(--bg-page);
    color: var(--text-sub);
    border: 1rpx solid var(--border);
  }

  &.back {
    background: var(--accent);
    color: var(--text-inverse);
    box-shadow: 0 4rpx 16rpx var(--accent-light);
  }
}
</style>
