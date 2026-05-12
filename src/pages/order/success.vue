<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { orderApi } from '../../api'
import { THEME_CLASS } from '../../theme/config'

const orderId = ref<number>(0)
const orderNo = ref<string>('')
const orderStatus = ref<string>('pending')
const loading = ref<boolean>(true)

// 状态映射
const statusMap: Record<string, { text: string; color: string }> = {
  '0': { text: '待支付', color: 'var(--accent)' },
  '1': { text: '已支付', color: 'var(--primary)' },
  '2': { text: '已发货', color: 'var(--primary)' },
  '3': { text: '已完成', color: 'var(--primary)' },
  '4': { text: '已取消', color: 'var(--text-placeholder)' }
}

onMounted(async () => {
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const options = currentPage.options || {}

  orderId.value = Number(options.orderId) || 0
  orderNo.value = options.orderNo || ''
  orderStatus.value = options.status || 'pending'

  // 如果有 orderId，获取最新订单状态
  if (orderId.value) {
    try {
      const res = await orderApi.getDetail(orderId.value)
      if (res.code === 200 && res.data) {
        orderStatus.value = String(res.data.status)
      }
    } catch (e) {
      console.error('获取订单详情失败', e)
    }
  }

  loading.value = false
})

function goToOrderList() {
  uni.redirectTo({ url: '/pages/order/list' })
}

function goHome() {
  uni.switchTab({ url: '/pages/index/index' })
}

async function payNow() {
  if (!orderId.value) return

  try {
    const res = await orderApi.pay(orderId.value, 'wechat')
    if (res.code === 200 && res.data) {
      if (res.data.approval_url) {
        // H5 支付页面
        uni.showToast({ title: '正在跳转到支付...', icon: 'none' })
      } else if (res.data.qrcode_url) {
        // 二维码支付 - 后续可展示二维码
        uni.showToast({ title: '支付参数获取成功', icon: 'success' })
      }
    } else {
      uni.showToast({ title: res.message || '发起支付失败', icon: 'none' })
    }
  } catch (e) {
    console.error('支付失败', e)
    uni.showToast({ title: '支付失败，请重试', icon: 'none' })
  }
}
</script>

<template>
  <view :class="['order-success', THEME_CLASS]">
    <view v-if="loading" class="loading-state">
      <text>加载中...</text>
    </view>

    <view v-else class="success-content">
      <!-- 待支付状态 -->
      <view v-if="orderStatus === '0' || orderStatus === 'pending'" class="status-card pending">
        <view class="status-icon">
          <uni-icons type="clock" size="48" color="var(--accent)" />
        </view>
        <view class="status-title">订单已创建</view>
        <view class="status-desc">请完成支付，支付成功后订单会自动生效</view>

        <view class="order-info">
          <view class="info-row">
            <text class="label">订单号</text>
            <text class="value">{{ orderNo }}</text>
          </view>
        </view>

        <view class="action-btns">
          <view class="btn-primary" @click="payNow">立即支付</view>
          <view class="btn-secondary" @click="goToOrderList">查看订单</view>
        </view>
      </view>

      <!-- 已支付状态 -->
      <view v-else-if="orderStatus === '1'" class="status-card success">
        <view class="status-icon">
          <uni-icons type="check" size="48" color="var(--primary)" />
        </view>
        <view class="status-title">支付成功</view>
        <view class="status-desc">感谢您的购买，订单已生效</view>

        <view class="order-info">
          <view class="info-row">
            <text class="label">订单号</text>
            <text class="value">{{ orderNo }}</text>
          </view>
        </view>

        <view class="action-btns">
          <view class="btn-primary" @click="goToOrderList">查看订单</view>
          <view class="btn-secondary" @click="goHome">继续购物</view>
        </view>
      </view>

      <!-- 其他状态 -->
      <view v-else class="status-card">
        <view class="status-icon">
          <uni-icons type="paperclip" size="48" color="var(--text-sub)" />
        </view>
        <view class="status-title">订单{{ statusMap[orderStatus]?.text || orderStatus }}</view>

        <view class="order-info">
          <view class="info-row">
            <text class="label">订单号</text>
            <text class="value">{{ orderNo }}</text>
          </view>
        </view>

        <view class="action-btns">
          <view class="btn-secondary" @click="goToOrderList">查看订单</view>
          <view class="btn-secondary" @click="goHome">继续购物</view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.order-success {
  min-height: 100vh;
  background: var(--bg-page);
  padding: 24rpx;
}

.loading-state {
  padding: 120rpx 0;
  text-align: center;
  color: var(--text-sub);
}

.success-content {
  padding-top: 60rpx;
}

.status-card {
  background: var(--bg-card);
  border-radius: 24rpx;
  padding: 48rpx 32rpx;
  text-align: center;
}

.status-icon {
  margin-bottom: 24rpx;
}

.status-title {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 16rpx;
}

.status-desc {
  font-size: 28rpx;
  color: var(--text-sub);
  margin-bottom: 32rpx;
}

.order-info {
  background: var(--bg-page);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8rpx 0;
}

.label {
  font-size: 28rpx;
  color: var(--text-sub);
}

.value {
  font-size: 28rpx;
  color: var(--text-main);
}

.action-btns {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.btn-primary {
  width: 100%;
  padding: 28rpx;
  background: var(--primary);
  color: var(--text-inverse);
  text-align: center;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;
}

.btn-secondary {
  width: 100%;
  padding: 28rpx;
  background: var(--bg-page);
  color: var(--text-main);
  text-align: center;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;
  border: 1rpx solid var(--border);
}
</style>
