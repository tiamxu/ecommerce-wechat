<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const orders = ref<any[]>([])
const loading = ref(false)
const activeTab = ref('all')

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待付款' },
  { key: 'paid', label: '待发货' },
  { key: 'shipped', label: '待收货' },
  { key: 'completed', label: '已完成' }
]

const statusMap: Record<string, string> = {
  pending: '待付款',
  paid: '待发货',
  shipped: '待收货',
  completed: '已完成',
  cancelled: '已取消'
}

// 模拟订单数据
const MOCK_ORDERS = [
  {
    id: 1,
    orderNo: 'ORDER202404190001',
    status: 'pending',
    totalAmount: 898,
    freight: 10,
    items: [
      { productId: 1, productName: '示例商品1', price: 299, quantity: 2, coverImage: '' },
      { productId: 2, productName: '示例商品2', price: 599, quantity: 1, coverImage: '' }
    ],
    address: { id: 1, name: '张三', phone: '13812345678', province: '北京市', city: '北京市', district: '朝阳区', detail: '某某街道', isDefault: true },
    createTime: '2024-04-19 10:30:00'
  },
  {
    id: 2,
    orderNo: 'ORDER202404180002',
    status: 'completed',
    totalAmount: 599,
    freight: 0,
    items: [
      { productId: 2, productName: '示例商品2', price: 599, quantity: 1, coverImage: '' }
    ],
    address: { id: 1, name: '张三', phone: '13812345678', province: '北京市', city: '北京市', district: '朝阳区', detail: '某某街道', isDefault: true },
    createTime: '2024-04-18 15:20:00'
  }
]

function changeTab(tab: string) {
  activeTab.value = tab
}

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return orders.value
  }
  return orders.value.filter(o => o.status === activeTab.value)
})

function goToDetail(orderId: number) {
  uni.navigateTo({ url: `/pages/order/detail?id=${orderId}` })
}

function payOrder(orderId: number) {
  uni.showToast({ title: '模拟支付成功', icon: 'success' })
}

function cancelOrder(orderId: number) {
  uni.showModal({
    title: '确认取消',
    content: '确定要取消该订单吗？',
    success: (res) => {
      if (res.confirm) {
        const order = orders.value.find(o => o.id === orderId)
        if (order) {
          order.status = 'cancelled'
        }
        uni.showToast({ title: '订单已取消', icon: 'success' })
      }
    }
  })
}

// 初始化时加载模拟数据
onMounted(() => {
  orders.value = MOCK_ORDERS
})
</script>

<template>
  <view class="order-list">
    <!-- 状态切换 -->
    <scroll-view class="tab-scroll" scroll-x>
      <view class="tab-list">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ active: activeTab === tab.key }"
          @click="changeTab(tab.key)"
        >
          <text class="tab-text">{{ tab.label }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 订单列表 -->
    <view class="order-content">
      <view v-if="filteredOrders.length === 0" class="empty-tip">
        <text class="empty-text">暂无订单</text>
      </view>

      <view v-else class="order-cards">
        <view v-for="order in filteredOrders" :key="order.id" class="order-card" @click="goToDetail(order.id)">
          <view class="order-header">
            <text class="order-no">订单号: {{ order.orderNo }}</text>
            <text class="order-status" :class="order.status">{{ statusMap[order.status] || order.status }}</text>
          </view>

          <view class="order-goods">
            <view v-for="(item, index) in order.items.slice(0, 3)" :key="index" class="goods-item">
              <view class="goods-img">
                <text class="placeholder-text">{{ item.productName?.charAt(0) || 'P' }}</text>
              </view>
            </view>
            <view v-if="order.items.length > 3" class="goods-more">
              <text>+{{ order.items.length - 3 }}</text>
            </view>
          </view>

          <view class="order-footer">
            <text class="order-time">{{ order.createTime }}</text>
            <view class="order-amount">
              <text class="amount-label">合计:</text>
              <text class="amount-value">¥{{ order.totalAmount + order.freight }}</text>
            </view>
          </view>

          <view class="order-actions" @click.stop>
            <text
              v-if="order.status === 'pending'"
              class="action-btn pay"
              @click="payOrder(order.id)"
            >去付款</text>
            <text
              v-if="order.status === 'pending'"
              class="action-btn cancel"
              @click="cancelOrder(order.id)"
            >取消订单</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.order-list {
  min-height: 100vh;
  background: var(--bg-page);
}

.tab-scroll {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg-card);
}

.tab-list {
  display: flex;
  padding: 0 16rpx;
}

.tab-item {
  padding: 24rpx 32rpx;
  position: relative;

  &.active {
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 48rpx;
      height: 4rpx;
      background: var(--primary);
      border-radius: 2rpx;
    }

    .tab-text {
      color: var(--primary);
      font-weight: 600;
    }
  }
}

.tab-text {
  font-size: 28rpx;
  color: var(--text-sub);
}

.order-content {
  padding: 24rpx;
}

.empty-tip {
  padding: 120rpx 0;
  text-align: center;
}

.empty-text {
  font-size: 28rpx;
  color: var(--text-sub);
}

.order-cards {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.order-card {
  background: var(--bg-card);
  border-radius: 16rpx;
  padding: 24rpx;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.order-no {
  font-size: 24rpx;
  color: var(--text-sub);
}

.order-status {
  font-size: 26rpx;
  font-weight: 600;

  &.pending { color: var(--accent); }
  &.paid { color: var(--primary); }
  &.shipped { color: #22c55e; }
  &.completed { color: var(--text-sub); }
  &.cancelled { color: var(--text-placeholder); }
}

.order-goods {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.goods-item {
  width: 140rpx;
  height: 140rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  border-radius: 12rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  font-size: 48rpx;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
}

.goods-more {
  width: 140rpx;
  height: 140rpx;
  background: var(--bg-page);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 28rpx;
    color: var(--text-sub);
  }
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid var(--border);
}

.order-time {
  font-size: 24rpx;
  color: var(--text-sub);
}

.order-amount {
  display: flex;
  align-items: center;
}

.amount-label {
  font-size: 24rpx;
  color: var(--text-sub);
}

.amount-value {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--price);
  margin-left: 8rpx;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  margin-top: 20rpx;
}

.action-btn {
  padding: 12rpx 32rpx;
  border-radius: 36rpx;
  font-size: 26rpx;

  &.pay {
    background: var(--primary);
    color: #ffffff;
  }

  &.cancel {
    background: var(--bg-page);
    color: var(--text-sub);
    border: 1rpx solid var(--border);
  }
}
</style>