<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { orderApi, type OrderItem, type OrderProduct } from '../../api/order'
import { THEME_CLASS } from '../../theme/config'

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
    <view v-if="loading" class="loading-tip">
      <text>加载中...</text>
    </view>

    <!-- 订单不存在 -->
    <view v-else-if="!order" class="empty-tip">
      <text class="empty-text">订单不存在</text>
      <text class="back-btn" @click="goBack">返回</text>
    </view>

    <!-- 订单详情 -->
    <view v-else class="detail-content">
      <!-- 订单状态 -->
      <view class="status-section">
        <view class="status-icon" :style="{ background: statusInfo.color }">
          <text>{{ statusInfo.label.charAt(0) }}</text>
        </view>
        <view class="status-info">
          <text class="status-text" :style="{ color: statusInfo.color }">{{ statusInfo.label }}</text>
          <text class="order-time">下单时间: {{ order.createTime }}</text>
        </view>
      </view>

      <!-- 收货地址 -->
      <view v-if="order.address" class="address-section">
        <view class="address-icon">📍</view>
        <view class="address-content">
          <view class="address-header">
            <text class="name">{{ order.address.name }}</text>
            <text class="phone">{{ order.address.phone }}</text>
          </view>
          <text class="detail">
            {{ order.address.province }} {{ order.address.city }}
            {{ order.address.district }} {{ order.address.detail }}
          </text>
        </view>
      </view>

      <!-- 商品列表 -->
      <view class="goods-section">
        <view class="section-title">商品信息</view>
        <view v-for="(item, index) in order.items" :key="index" class="goods-item">
          <view class="goods-img">
            <text class="placeholder-text">{{ item.productName?.charAt(0) || 'P' }}</text>
          </view>
          <view class="goods-info">
            <text class="goods-name">{{ item.productName }}</text>
            <text class="goods-price">¥{{ item.price }} × {{ item.quantity }}</text>
          </view>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="info-section">
        <view class="section-title">订单信息</view>
        <view class="info-row">
          <text class="label">订单编号</text>
          <text class="value">{{ order.orderNo }}</text>
        </view>
        <view class="info-row">
          <text class="label">下单时间</text>
          <text class="value">{{ order.createTime }}</text>
        </view>
      </view>

      <!-- 金额汇总 -->
      <view class="summary-section">
        <view class="summary-row">
          <text class="label">商品金额</text>
          <text class="value">¥{{ order.totalAmount }}</text>
        </view>
        <view class="summary-row">
          <text class="label">运费</text>
          <text class="value">{{ order.freight === 0 ? '免运费' : '¥' + order.freight }}</text>
        </view>
        <view class="summary-row total">
          <text class="label">合计</text>
          <text class="value price">¥{{ order.totalAmount + order.freight }}</text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-section">
        <text
          v-if="isPending(order.status)"
          class="action-btn pay"
          @click="payOrder"
        >去付款</text>
        <text
          v-if="isPending(order.status)"
          class="action-btn cancel"
          @click="cancelOrder"
        >取消订单</text>
        <text class="action-btn back" @click="goBack">返回</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.order-detail {
  min-height: 100vh;
  background: var(--bg-page);
}

.loading-tip {
  padding: 120rpx 0;
  text-align: center;
  color: var(--text-sub);
}

.empty-tip {
  padding: 120rpx 0;
  text-align: center;
}

.empty-text {
  display: block;
  font-size: 28rpx;
  color: var(--text-sub);
  margin-bottom: 24rpx;
}

.back-btn {
  color: var(--primary);
  font-size: 28rpx;
}

.detail-content {
  padding: 24rpx;
}

.status-section {
  display: flex;
  align-items: center;
  padding: 32rpx;
  background: var(--bg-card);
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}

.status-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;

  text {
    font-size: 40rpx;
    font-weight: 700;
    color: #fff;
  }
}

.status-info {
  display: flex;
  flex-direction: column;
}

.status-text {
  font-size: 36rpx;
  font-weight: 700;
  margin-bottom: 8rpx;
}

.order-time {
  font-size: 24rpx;
  color: var(--text-sub);
}

.address-section {
  display: flex;
  align-items: flex-start;
  padding: 32rpx;
  background: var(--bg-card);
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}

.address-icon {
  font-size: 48rpx;
  margin-right: 20rpx;
}

.address-content {
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

.goods-section,
.info-section,
.summary-section {
  background: var(--bg-card);
  border-radius: 16rpx;
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
  border-bottom: 1rpx solid var(--border);

  &:last-child {
    border-bottom: none;
  }
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

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid var(--border);

  &:last-child {
    border-bottom: none;
  }
}

.label {
  font-size: 28rpx;
  color: var(--text-sub);
}

.value {
  font-size: 28rpx;
  color: var(--text-main);
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

  &.price {
    font-size: 36rpx;
    font-weight: 700;
    color: var(--price);
  }
}

.action-section {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  padding: 24rpx 0;
}

.action-btn {
  padding: 20rpx 40rpx;
  border-radius: 44rpx;
  font-size: 28rpx;

  &.pay {
    background: var(--primary);
    color: var(--text-inverse);
  }

  &.cancel {
    background: var(--bg-page);
    color: var(--text-sub);
    border: 1rpx solid var(--border);
  }

  &.back {
    background: var(--accent);
    color: var(--text-inverse);
  }
}
</style>
