<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { orderApi } from '../../api'
import { useUserStore } from '../../store/user'
import { THEME_CLASS } from '../../theme/config'

const userStore = useUserStore()
const orders = ref<any[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const activeTab = ref('all')
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)

const tabs = [
  { key: 'all', label: '全部', icon: 'bars' },
  { key: '0', label: '待付款', icon: 'wallet' },
  { key: '1', label: '待发货', icon: 'box' },
  { key: '2', label: '待收货', icon: 'car' },
  { key: '3', label: '已完成', icon: 'check' }
]

const statusMap: Record<string, string> = {
  '0': '待付款',
  '1': '待发货',
  '2': '待收货',
  '3': '已完成',
  '4': '已取消'
}

// 状态颜色映射
const statusColorMap: Record<string, string> = {
  '0': 'var(--accent)',   // 待付款
  '1': 'var(--primary)',  // 已支付
  '2': 'var(--primary)',   // 已发货
  '3': 'var(--text-sub)',  // 已完成
  '4': 'var(--text-placeholder)' // 已取消
}

// 判断是否是待付款状态
function isPending(status: any): boolean {
  return String(status) === '0'
}

// 获取状态颜色
function getStatusColor(status: any): string {
  return statusColorMap[String(status)] || 'var(--text-sub)'
}

// 获取商品汇总文字
function getGoodsSummary(order: any): string {
  const items = order.items || []
  if (items.length === 0) return ''
  const firstItem = items[0]
  const name = firstItem.productName || '商品'
  const totalQty = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0)
  if (items.length === 1) {
    return `${name} ${totalQty > 1 ? 'x' + totalQty : ''}`
  }
  return `${name}${totalQty > 1 ? ' x' + totalQty : ''} 等${items.length}件商品`
}

function changeTab(tab: string) {
  activeTab.value = tab
  page.value = 1
  hasMore.value = true
  orders.value = []
  loadOrders(true)
}

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return orders.value
  }
  const statusNum = Number(activeTab.value)
  return orders.value.filter(o => Number(o.status) === statusNum)
})

onMounted(() => {
  // 从 URL 参数读取状态筛选
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const status = currentPage?.options?.status
  if (status) {
    activeTab.value = status
  }
  loadOrders()
})

// 下拉刷新
onPullDownRefresh(() => {
  page.value = 1
  hasMore.value = true
  loadOrders(true).finally(() => {
    uni.stopPullDownRefresh()
  })
})

// 触底加载
onReachBottom(() => {
  if (!hasMore.value || loadingMore.value) return
  loadOrders(false, ++page.value)
})

async function loadOrders(isRefresh = false, targetPage = 1) {
  if (isRefresh) {
    loading.value = true
  } else {
    loadingMore.value = true
  }
  try {
    const params: any = { page: targetPage, pageSize: pageSize.value }
    if (activeTab.value !== 'all') {
      params.status = activeTab.value
    }
    const res = await orderApi.getMyOrders(params)
    if (res.code === 200 && res.data) {
      const list = Array.isArray(res.data) ? res.data : (res.data.list || [])
      if (isRefresh) {
        orders.value = list
      } else {
        orders.value.push(...list)
      }
      // 判断是否还有更多数据
      hasMore.value = list.length >= pageSize.value
    }
  } catch (error) {
    console.error('加载订单失败', error)
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

function goToDetail(orderId: number) {
  uni.navigateTo({ url: `/pages/order/detail?id=${orderId}` })
}

function goToShop() {
  uni.switchTab({ url: '/pages/index/index' })
}

async function payOrder(orderId: number) {
  try {
    await orderApi.pay(orderId)
    uni.showToast({ title: '支付成功', icon: 'success' })
    loadOrders()
  } catch (error) {
    console.error('支付失败', error)
  }
}

async function cancelOrder(orderId: number) {
  const res = await uni.showModal({
    title: '确认取消',
    content: '确定要取消该订单吗？',
    showCancel: true
  })

  if (res.confirm) {
    try {
      await orderApi.cancel(orderId)
      uni.showToast({ title: '订单已取消', icon: 'success' })
      loadOrders()
    } catch (error) {
      console.error('取消订单失败', error)
    }
  }
}
</script>

<template>
  <view :class="['order-list', THEME_CLASS]">
    <!-- 状态切换 -->
    <scroll-view class="tab-scroll" scroll-x>
      <view class="tab-list">
        <view
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-item', { active: activeTab === tab.key }]"
          @click="changeTab(tab.key)"
        >
          <uni-icons :type="tab.icon" size="18" :color="activeTab === tab.key ? 'var(--primary)' : 'var(--text-sub)'" />
          <text class="tab-text">{{ tab.label }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 订单列表 -->
    <view class="order-content">
      <view v-if="loading" class="loading-section">
        <view class="loading-icon"></view>
        <text class="loading-text">加载中...</text>
      </view>
      <view v-else-if="filteredOrders.length === 0" class="empty-section">
        <view class="empty-icon">📦</view>
        <text class="empty-title">暂无订单</text>
        <text class="empty-desc">快去挑选心仪商品吧</text>
        <view class="empty-btn" @click="goToShop">去购物</view>
      </view>

      <view v-else class="order-cards">
        <view v-for="order in filteredOrders" :key="order.id" class="order-card" @click="goToDetail(order.id)">
          <!-- 订单头部 -->
          <view class="order-header">
            <text class="order-no">订单号: {{ order.orderNo }}</text>
            <text class="order-status" :style="{ color: getStatusColor(order.status) }">{{ statusMap[order.status] || order.status }}</text>
          </view>

          <!-- 商品信息 -->
          <view class="order-goods">
            <view v-for="(item, index) in (order.items || []).slice(0, 3)" :key="index" class="goods-item">
              <view class="goods-img-wrap">
                <image v-if="item.coverImage" :src="item.coverImage" class="goods-img" mode="aspectFill" />
                <view v-else class="goods-placeholder">
                  <text class="placeholder-text">{{ item.productName?.charAt(0) || 'P' }}</text>
                </view>
              </view>
            </view>
            <view v-if="(order.items || []).length > 3" class="goods-more">
              <text>+{{ order.items.length - 3 }}</text>
            </view>
          </view>

          <!-- 商品汇总信息 -->
          <view class="goods-summary">
            <text class="summary-text">
              {{ getGoodsSummary(order) }}
            </text>
          </view>

          <!-- 订单底部 -->
          <view class="order-footer">
            <view class="footer-left">
              <text class="order-time">{{ order.createTime }}</text>
            </view>
            <view class="footer-right">
              <text class="amount-label">实付款</text>
              <text class="amount-value">¥{{ order.totalAmount }}</text>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view v-if="isPending(order.status)" class="order-actions" @click.stop>
            <text class="action-btn cancel" @click="cancelOrder(order.id)">取消订单</text>
            <text class="action-btn pay" @click="payOrder(order.id)">去付款</text>
          </view>
        </view>

        <!-- 加载更多 -->
        <view v-if="!hasMore && orders.length > 0" class="no-more">
          <text>没有更多订单了</text>
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
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.tab-list {
  display: flex;
  padding: 0 8rpx;
}

.tab-item {
  flex: 1;
  padding: 28rpx 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  position: relative;

  &.active {
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 40rpx;
      height: 6rpx;
      background: var(--primary);
      border-radius: 3rpx;
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
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
}

.loading-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 160rpx 0;
  gap: 16rpx;
}

.loading-icon {
  width: 40rpx;
  height: 40rpx;
  border: 3rpx solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
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
  width: 160rpx;
  height: 160rpx;
  background: var(--bg-card);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 80rpx;
  margin-bottom: 32rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: var(--text-sub);
  margin-bottom: 48rpx;
}

.empty-btn {
  padding: 20rpx 64rpx;
  background: var(--primary);
  color: var(--text-inverse);
  border-radius: 44rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.order-cards {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.order-card {
  background: var(--bg-card);
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  margin-bottom: 24rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 28rpx;
  border-bottom: 1rpx solid var(--border);
}

.order-no {
  font-size: 24rpx;
  color: var(--text-sub);
}

.order-status {
  font-size: 26rpx;
  font-weight: 600;
}

.order-goods {
  display: flex;
  gap: 16rpx;
  padding: 24rpx 28rpx;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.goods-item {
  flex-shrink: 0;
}

.goods-img-wrap {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
}

.goods-img {
  width: 100%;
  height: 100%;
}

.goods-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  font-size: 56rpx;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
}

.goods-more {
  width: 160rpx;
  height: 160rpx;
  border-radius: 16rpx;
  background: var(--bg-page);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  text {
    font-size: 28rpx;
    color: var(--text-sub);
    font-weight: 500;
  }
}

.goods-summary {
  padding: 0 28rpx 20rpx;
}

.summary-text {
  font-size: 26rpx;
  color: var(--text-sub);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 28rpx;
  border-top: 1rpx solid var(--border);
}

.footer-left {
  display: flex;
  align-items: center;
}

.order-time {
  font-size: 24rpx;
  color: var(--text-sub);
}

.footer-right {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
}

.amount-label {
  font-size: 24rpx;
  color: var(--text-sub);
}

.amount-value {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--price);
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  padding: 20rpx 28rpx;
  border-top: 1rpx solid var(--border);
}

.action-btn {
  padding: 14rpx 36rpx;
  border-radius: 40rpx;
  font-size: 26rpx;
  font-weight: 500;

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
}

.no-more {
  text-align: center;
  padding: 32rpx 0;
  font-size: 24rpx;
  color: var(--text-placeholder);
}
</style>