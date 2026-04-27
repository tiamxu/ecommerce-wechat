<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { orderApi } from '../../api'
import { useUserStore } from '../../store/user'
import { THEME_CLASS } from '../../theme/config'

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
        coverImage: quickBuy.coverImage || ''
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

async function submitOrder() {
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
    productName: item.productName,
    coverImage: item.coverImage
  }))

  try {
    // 1. 创建订单
    const createRes = await orderApi.create({
      email: userStore.userInfo?.phone ? `${userStore.userInfo.phone}@example.com` : 'guest@example.com',
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
    <view class="address-section" @click="goToAddressList">
      <view v-if="selectedAddress" class="address-content">
        <view class="address-icon">📍</view>
        <view class="address-info">
          <view class="address-header">
            <text class="name">{{ selectedAddress.receiverName }}</text>
            <text class="phone">{{ selectedAddress.phone }}</text>
          </view>
          <text class="detail">{{ selectedAddress.province }} {{ selectedAddress.city }} {{ selectedAddress.address }}</text>
        </view>
      </view>
      <view v-else class="address-empty">
        <text class="add-icon">+</text>
        <text class="add-text">添加收货地址</text>
      </view>
      <text class="arrow">></text>
    </view>

    <!-- 商品信息 -->
    <view class="goods-section">
      <view class="section-title">商品信息</view>
      <view v-for="item in checkoutItems" :key="item.id" class="goods-item">
        <image v-if="item.coverImage" :src="item.coverImage" class="goods-img" mode="aspectFill" />
        <view v-else class="goods-img">
          <text class="placeholder-text">{{ item.productName?.charAt(0) || 'P' }}</text>
        </view>
        <view class="goods-info">
          <text class="goods-name">{{ item.productName }}</text>
          <text class="goods-price">¥{{ item.productPrice || item.price }} × {{ item.quantity }}</text>
        </view>
      </view>
    </view>

    <!-- 金额汇总 -->
    <view class="summary-section">
      <view class="summary-row">
        <text class="label">商品金额</text>
        <text class="value">¥{{ totalAmount.toFixed(2) }}</text>
      </view>
      <view class="summary-row">
        <text class="label">运费</text>
        <text class="value" :class="{ discount: freight === 0 }">
          {{ freight === 0 ? '免运费' : '¥' + freight.toFixed(2) }}
        </text>
      </view>
      <view class="summary-row total">
        <text class="label">合计</text>
        <text class="value price">¥{{ orderTotal.toFixed(2) }}</text>
      </view>
    </view>

    <!-- 去支付按钮 -->
    <view class="pay-section">
      <text
        class="pay-btn"
        :class="{ loading: loading, disabled: loading || !selectedAddress }"
        @click="loading || !selectedAddress ? null : submitOrder()"
      >
        {{ loading ? '支付中...' : (!selectedAddress ? '请选择收货地址' : '去支付 ¥' + orderTotal) }}
      </text>
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

.address-empty {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.add-icon {
  width: 64rpx;
  height: 64rpx;
  border: 2rpx dashed var(--text-placeholder);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: var(--text-placeholder);
}

.add-text {
  font-size: 28rpx;
  color: var(--text-sub);
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
  color: var(--text-inverse);
  text-align: center;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;

  &.disabled {
    background: var(--text-placeholder);
    opacity: 0.6;
  }
}
</style>