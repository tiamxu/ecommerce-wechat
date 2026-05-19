<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { orderApi } from '../../api'
import { useUserStore } from '../../store/user'
import { THEME_CLASS } from '../../theme/config'
import PriceText from '../../components/PriceText.vue'

// 获取用户信息
const userStore = useUserStore()
const addresses = ref<Array<{ id: number; receiverName: string; phone: string; province: string; city: string; country: string; address: string; postalCode: string; isDefault: number }>>([])
const selectedAddressId = ref<number | null>(null)
const checkoutItems = ref<any[]>([])
const loading = ref(false)

// 从真实接口获取地址
onMounted(async () => {
  // 获取订单确认商品
  const itemsStr = uni.getStorageSync('checkoutItems')
  if (itemsStr) {
    try {
      const items = typeof itemsStr === 'string' ? JSON.parse(itemsStr) : itemsStr
      if (Array.isArray(items) && items.length > 0) {
        checkoutItems.value = items
      }
    } catch (e) {
      console.error('解析checkoutItems失败', e)
    }
  }

  // 如果没有商品，尝试 quickBuy
  if (checkoutItems.value.length === 0) {
    const quickBuy = uni.getStorageSync('quickBuy')
    if (quickBuy) {
      checkoutItems.value = [{
        id: 0,
        productId: quickBuy.productId,
        productName: quickBuy.productName || '商品',
        price: quickBuy.price || 0,
        quantity: quickBuy.quantity,
        selected: true,
        images: quickBuy.images || []
      }]
    }
  }

  // 加载地址列表
  await loadAddresses()
})

async function loadAddresses() {
  try {
    const res = await orderApi.getAddresses()
    if (res.code === 200 && res.data) {
      addresses.value = res.data
      // 设置默认地址 (isDefault 是 number 类型，1 表示默认)
      const defaultAddr = addresses.value.find(a => a.isDefault === 1) || addresses.value[0]
      if (defaultAddr) {
        selectedAddressId.value = defaultAddr.id
      }
    }
  } catch (error) {
    console.error('加载地址失败', error)
  }
}

const selectedAddress = computed(() => {
  return addresses.value.find(a => a.id === selectedAddressId.value) || addresses.value[0]
})

const totalAmount = computed(() => {
  return checkoutItems.value.reduce((sum, item) => sum + (item.productPrice || item.price || 0) * item.quantity, 0)
})

const FREIGHT_THRESHOLD = 99
const FREIGHT_AMOUNT = 10

const freight = computed(() => {
  return totalAmount.value >= FREIGHT_THRESHOLD ? 0 : FREIGHT_AMOUNT
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

async function submitOrder() {
  // 检查登录状态，游客无法下单
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/user/login' })
    }, 1500)
    return
  }

  if (!selectedAddress.value) {
    uni.showToast({ title: '请选择收货地址', icon: 'none' })
    return
  }

  loading.value = true
  const addr = selectedAddress.value
  const items = checkoutItems.value.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    price: item.productPrice || item.price,
    productName: item.productName
  }))

  try {
    // 1. 创建订单
    const createRes = await orderApi.create({
      email: userStore.userInfo?.email || '',
      receiverName: addr.receiverName,
      phone: addr.phone,
      country: addr.country || '中国',
      province: addr.province,
      city: addr.city,
      address: addr.address,
      postalCode: addr.postalCode || '000000',
      items,
      remark: ''
    })

    if (createRes.code !== 200) {
      uni.showToast({ title: createRes.message || '创建订单失败', icon: 'none' })
      loading.value = false
      return
    }

    if (!createRes.data) {
      uni.showToast({ title: '创建订单失败', icon: 'none' })
      loading.value = false
      return
    }

    const { id: orderId, orderNo } = createRes.data

    // 2. 发起支付
    const payRes = await orderApi.pay(orderId, 'wechat')

    if (payRes.code === 200 && payRes.data) {
      if (payRes.data.approval_url) {
        // 跳转式支付(如PayPal网页版) - 在小程序内打开 web-view
        // #ifdef MP-WEIXIN
        // 小程序可以 web-view 打开H5支付页面
        // #endif
        uni.showToast({ title: '正在跳转到支付...', icon: 'none' })
        setTimeout(() => {
          uni.redirectTo({
            url: `/pages/order/success?orderId=${orderId}&orderNo=${orderNo}&status=pending`
          })
        }, 1500)
      } else if (payRes.data.qrcode_url) {
        // 二维码支付 - 跳转成功页（待实现二维码展示）
        uni.showToast({ title: '订单创建成功', icon: 'success' })
        uni.removeStorageSync('checkoutItems')
        uni.removeStorageSync('quickBuy')
        uni.redirectTo({
          url: `/pages/order/success?orderId=${orderId}&orderNo=${orderNo}&status=pending`
        })
      } else {
        // 支付接口返回成功但无支付链接，跳转到成功页
        uni.showToast({ title: '订单创建成功', icon: 'success' })
        uni.removeStorageSync('checkoutItems')
        uni.removeStorageSync('quickBuy')
        uni.redirectTo({
          url: `/pages/order/success?orderId=${orderId}&orderNo=${orderNo}&status=pending`
        })
      }
    } else {
      uni.showToast({ title: payRes.message || '发起支付失败', icon: 'none' })
      // 支付失败留在当前页，用户可重试
      loading.value = false
    }
  } catch (err) {
    console.error('提交订单失败', err)
    uni.showToast({ title: '提交失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <view :class="['order-confirm', THEME_CLASS]">
    <!-- 收货地址 -->
    <view class="section address-section" @click="goToAddressList">
      <view v-if="selectedAddress" class="address-content">
        <view class="address-icon">
          <uni-icons type="location" size="24" color="var(--primary)" />
        </view>
        <view class="address-info">
          <view class="address-row">
            <text class="name">{{ selectedAddress.receiverName }}</text>
            <text class="phone">{{ selectedAddress.phone }}</text>
          </view>
          <text class="address-detail">
            <text v-if="selectedAddress.province" class="region-tag">{{ selectedAddress.province }}</text>
            {{ selectedAddress.city }} {{ selectedAddress.address }}
          </text>
        </view>
      </view>
      <view v-else class="address-empty">
        <uni-icons type="plus" size="24" color="var(--text-placeholder)" />
        <text class="add-text">添加收货地址</text>
      </view>
      <view class="arrow-wrap">
        <uni-icons type="right" size="16" color="var(--text-placeholder)" />
      </view>
    </view>

    <!-- 商品信息 -->
    <view class="section goods-section">
      <view class="section-header">
        <text class="section-title">商品信息</text>
        <text class="goods-count">{{ checkoutItems.length }}件商品</text>
      </view>
      <view v-for="item in checkoutItems" :key="item.id" class="goods-item">
        <view class="goods-img-wrap">
          <image v-if="item.image" :src="item.image.url || item.image" class="goods-img" mode="aspectFill" />
          <view v-else class="goods-img-placeholder">
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

    <!-- 金额汇总 -->
    <view class="section summary-section">
      <view class="summary-row">
        <text class="label">商品金额</text>
        <text class="value">¥{{ totalAmount.toFixed(2) }}</text>
      </view>
      <view class="summary-row">
        <text class="label">运费</text>
        <text class="value" :class="{ highlight: freight === 0 }">
          {{ freight === 0 ? '免运费' : '¥' + freight.toFixed(2) }}
        </text>
      </view>
      <view class="summary-row total-row">
        <text class="total-label">合计</text>
        <PriceText :price="orderTotal" />
      </view>
    </view>

    <!-- 去支付按钮 -->
    <view class="pay-bar">
      <view class="pay-amount">
        <text class="amount-label">实付款</text>
        <PriceText :price="orderTotal" size="large" />
      </view>
      <view
        class="pay-btn"
        :class="{ loading: loading, disabled: loading || !selectedAddress }"
        @click="loading || !selectedAddress ? null : submitOrder()"
      >
        <text v-if="loading">支付中...</text>
        <text v-else-if="!selectedAddress">请选择收货地址</text>
        <text v-else>去支付</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.order-confirm {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

.section {
  background: var(--bg-card);
  margin-bottom: 20rpx;
}

/* 收货地址 */
.address-section {
  display: flex;
  align-items: center;
  padding: 32rpx;
}

.address-content {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
}

.address-icon {
  width: 80rpx;
  height: 80rpx;
  background: var(--primary-light);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.address-info {
  flex: 1;
}

.address-row {
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

.address-detail {
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

.arrow-wrap {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.address-empty {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx 0;
}

.add-text {
  font-size: 28rpx;
  color: var(--text-sub);
}

/* 商品信息 */
.goods-section {
  padding: 28rpx 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-main);
}

.goods-count {
  font-size: 24rpx;
  color: var(--text-sub);
}

.goods-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
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

.goods-img-placeholder {
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

/* 金额汇总 */
.summary-section {
  padding: 28rpx 32rpx;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14rpx 0;
}

.label {
  font-size: 28rpx;
  color: var(--text-sub);
}

.value {
  font-size: 28rpx;
  color: var(--text-main);

  &.highlight {
    color: var(--primary);
  }
}

.total-row {
  margin-top: 12rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid var(--border);
}

.total-label {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-main);
}

/* 底部支付栏 */
.pay-bar {
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

.pay-amount {
  display: flex;
  flex-direction: column;
}

.amount-label {
  font-size: 24rpx;
  color: var(--text-sub);
  margin-bottom: 4rpx;
}

.amount-value {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--price);
}

.pay-btn {
  padding: 28rpx 72rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  color: var(--text-inverse);
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 32rpx var(--shadow);
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.96);
  }

  &.disabled {
    background: var(--text-placeholder);
    box-shadow: none;
  }

  &.loading {
    opacity: 0.8;
  }
}
</style>