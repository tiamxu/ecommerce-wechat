<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { productApi, type Product } from '../../api'
import { useUserStore } from '../../store/user'
import { useCartStore } from '../../store/cart'
import { THEME_CLASS } from '../../theme/config'
import TabBar from '../../components/TabBar.vue'
import ServiceBadge from '../../components/ServiceBadge.vue'

const product = ref<Product | null>(null)
const loading = ref(false)
const quantity = ref(1)
const activeTab = ref('detail')
const servicesExpanded = ref(false)
const cartLoading = ref(false)
const buyLoading = ref(false)
const userStore = useUserStore()
const cartStore = useCartStore()

const originalPrice = computed(() => {
  if (!product.value) return 0
  if (product.value.originalPrice) return product.value.originalPrice
  return Math.round(product.value.price * 1.3)
})

const salesDisplay = computed(() => {
  if (!product.value?.sales) return ''
  if (product.value.sales >= 10000) {
    return (product.value.sales / 10000).toFixed(1) + '万'
  }
  return product.value.sales + '件'
})

const displayServices = computed(() => {
  return product.value?.services?.slice(0, 4) || []
})

// 处理商品详情HTML，限制图片宽度（兼容小程序rich-text）
const processedDescription = computed(() => {
  if (!product.value?.description?.zh) return ''
  let html = product.value.description.zh
  // 给 img 标签添加行内样式（rich-text中%单位更稳定）
  html = html.replace(/<img/gi, '<img style="max-width:100%!important;height:auto;display:block;"')
  // 给 table 标签添加 max-width:100%
  html = html.replace(/<table/gi, '<table style="max-width:100%!important;border-collapse:collapse;"')
  // 给 td/th 添加边框和内边距
  html = html.replace(/<td/gi, '<td style="padding:8px;border:1px solid #ddd;"')
  html = html.replace(/<th/gi, '<th style="padding:8px;border:1px solid #ddd;background:#f5f5f5;"')
  return html
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const id = currentPage?.options?.id

  if (id) {
    loadProduct(Number(id))
  }
})

// 登录后返回时检查是否有待执行动作
onShow(() => {
  const pendingAction = userStore.getAndClearPendingAction()
  if (pendingAction && pendingAction.type === 'addToCart' && pendingAction.productId) {
    // 延迟一点执行，确保页面已完全返回
    setTimeout(async () => {
      const result = await cartStore.addItem(pendingAction.productId!, pendingAction.quantity || 1)
      if (result.success) {
        uni.showToast({ title: '已加入购物车', icon: 'success' })
      } else {
        uni.showToast({ title: result.message || '添加失败', icon: 'none' })
      }
    }, 100)
  }
})

async function loadProduct(id: number) {
  loading.value = true
  try {
    const res = await productApi.getDetail(id)
    if (res.code === 200 && res.data) {
      product.value = res.data
      loadProductServices(id)
    }
  } catch (error) {
    console.error('加载商品详情失败', error)
  } finally {
    loading.value = false
  }
}

async function loadProductServices(productId: number) {
  try {
    const res = await productApi.getProductServices(productId)
    if (res.code === 200 && res.data) {
      const services = res.data[String(productId)] || []
      if (product.value) {
        product.value.services = services
      }
    }
  } catch (error) {
    console.warn('加载服务政策失败', error)
  }
}

function decreaseQty() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function increaseQty() {
  if (product.value && product.value.stock > 0 && quantity.value < product.value.stock) {
    quantity.value++
  }
}

async function addToCart() {
  if (!product.value) return
  if (cartLoading.value) return

  if (product.value.stock === 0) {
    uni.showToast({ title: '商品已缺货', icon: 'none' })
    return
  }

  if (!userStore.isLoggedIn) {
    // 设置待执行动作，登录成功后自动加购
    userStore.setPendingAction({
      type: 'addToCart',
      productId: product.value.id,
      quantity: quantity.value
    })
    uni.navigateTo({ url: '/pages/user/login-modal' })
    return
  }

  cartLoading.value = true
  try {
    const result = await cartStore.addItem(product.value.id, quantity.value)
    if (result.success) {
      uni.showToast({ title: '已加入购物车', icon: 'success' })
    } else {
      uni.showToast({ title: result.message || '添加失败', icon: 'none' })
    }
  } catch (error) {
    console.error('添加购物车失败', error)
    uni.showToast({ title: '添加失败，请重试', icon: 'none' })
  } finally {
    cartLoading.value = false
  }
}

function buyNow() {
  if (!product.value) return

  // 检查登录状态，游客无法直接购买
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/user/login' })
    }, 1500)
    return
  }

  if (product.value.stock === 0) {
    uni.showToast({ title: '商品已缺货', icon: 'none' })
    return
  }

  const images = getCoverImages()
  uni.setStorageSync('quickBuy', {
    productId: product.value.id,
    quantity: quantity.value,
    price: product.value.price,
    productName: getProductName(),
    coverImage: images.length > 0 ? images[0] : ''
  })
  uni.navigateTo({
    url: '/pages/order/confirm'
  })
}

function getProductName(): string {
  if (!product.value) return ''
  return product.value.name?.zh || product.value.name?.en || '商品'
}

function getProductDesc(): string {
  if (!product.value?.description) return ''
  return product.value.description?.zh || product.value.description?.en || ''
}

function getServiceIcon(icon: string): string {
  const iconMap: Record<string, string> = {
    'return': 'undo',
    'exchange': 'refresh',
    'warranty': 'star',
    'shield': 'star',
    'truck': 'location',
    'headset': 'phone',
    'credit-card': 'wallet',
    'gift': 'gift',
    'check': 'check',
    'clock': 'clock',
    'phone': 'phone',
    'mail': 'mail',
    'shop': 'shop'
  }
  return iconMap[icon] || 'star'
}

function getCoverImages(): string[] {
  if (!product.value) return []
  const images: string[] = []
  const seenUrls = new Set<string>()

  // 优先添加封面图（is_cover=1）
  if (product.value.images && product.value.images.length > 0) {
    const coverImages = product.value.images.filter(img => img.isCover === 1)
    coverImages.forEach(img => {
      if (img.url) {
        images.push(img.url)
        seenUrls.add(img.url)
      }
    })
  }

  // 添加其他图片（非封面）
  if (product.value.images && product.value.images.length > 0) {
    product.value.images.forEach(img => {
      if (img.url && !seenUrls.has(img.url)) {
        images.push(img.url)
        seenUrls.add(img.url)
      }
    })
  }

  // 兜底用 metaImage
  if (images.length === 0 && product.value.metaImage) {
    images.push(product.value.metaImage)
  }

  return images
}
</script>

<template>
  <view :class="['product-detail', THEME_CLASS]">
    <TabBar :hidden="true" />
    <!-- 商品图片轮播 -->
    <view class="detail-swiper">
      <swiper
        v-if="getCoverImages().length > 0"
        class="image-swiper"
        :indicator-dots="getCoverImages().length > 1"
        :autoplay="getCoverImages().length > 1"
        :interval="3000"
        :circular="true"
        indicator-color="rgba(255,255,255,0.5)"
        indicator-active-color="var(--text-inverse)"
      >
        <swiper-item v-for="(img, index) in getCoverImages()" :key="index">
          <image :src="img" mode="aspectFill" class="swiper-image" />
        </swiper-item>
      </swiper>
      <view v-else class="img-placeholder">
        <text class="placeholder-text">{{ getProductName().charAt(0) || 'P' }}</text>
      </view>
    </view>

    <!-- 商品信息 -->
    <view v-if="product" class="detail-info">
      <view class="info-header">
        <view class="price-section">
          <text class="product-price">¥{{ product.price }}</text>
          <text v-if="product.price < originalPrice" class="original-price">¥{{ originalPrice }}</text>
        </view>
      </view>
      <view class="info-meta">
        <text v-if="salesDisplay" class="sales-count">已售{{ salesDisplay }}</text>
        <text class="product-name">{{ getProductName() }}</text>
      </view>
    </view>

    <!-- 服务政策 -->
    <view v-if="product?.services?.length" class="detail-services">
      <view class="services-header" @click="servicesExpanded = !servicesExpanded">
        <text class="services-title">服务保障</text>
        <view class="services-toggle">
          <text class="toggle-text">{{ servicesExpanded ? '收起' : '展开查看' }}</text>
          <uni-icons :type="servicesExpanded ? 'up' : 'down'" size="14" color="var(--text-sub)" />
        </view>
      </view>
      <view class="services-list" :class="{ expanded: servicesExpanded }">
        <view
          v-for="service in product.services"
          :key="service.id"
          class="service-item"
        >
          <uni-icons :type="getServiceIcon(service.icon)" size="18" color="var(--primary)" />
          <text class="service-name">{{ service.name }}</text>
        </view>
      </view>
    </view>

    <!-- 图文详情 -->
    <view class="detail-content">
      <view class="content-tabs">
        <text :class="['tab-item', { active: activeTab === 'detail' }]" role="tab" :aria-selected="activeTab === 'detail'" @click="activeTab = 'detail'">商品详情</text>
        <text :class="['tab-item', { active: activeTab === 'specs' }]" role="tab" :aria-selected="activeTab === 'specs'" @click="activeTab = 'specs'">规格参数</text>
        <text :class="['tab-item', { active: activeTab === 'afterSale' }]" role="tab" :aria-selected="activeTab === 'afterSale'" @click="activeTab = 'afterSale'">售后条款</text>
      </view>
      <view v-if="activeTab === 'detail'" class="content-panel">
        <rich-text v-if="processedDescription" :nodes="processedDescription"></rich-text>
        <view v-else class="content-empty">
          <text>暂无商品详情</text>
        </view>
      </view>
      <view v-if="activeTab === 'specs'" class="content-panel">
        <view class="specs-list">
          <view class="spec-item">
            <text class="spec-label">商品编号</text>
            <text class="spec-value">{{ product?.id }}</text>
          </view>
          <view class="spec-item">
            <text class="spec-label">库存状态</text>
            <text class="spec-value">{{ product?.stock && product.stock > 0 ? '有货' : '缺货' }}</text>
          </view>
          <view v-if="product?.services?.length" class="spec-item">
            <text class="spec-label">服务政策</text>
            <text class="spec-value">{{ product.services.map(s => s.name).join('、') }}</text>
          </view>
        </view>
      </view>
      <view v-if="activeTab === 'afterSale'" class="content-panel">
        <view class="after-sale-list">
          <view v-for="service in product?.services || []" :key="service.id" class="after-sale-item">
            <uni-icons :type="getServiceIcon(service.icon)" size="28" color="var(--primary)" />
            <view class="after-sale-content">
              <text class="after-sale-name">{{ service.name }}</text>
              <text class="after-sale-desc">{{ service.description }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 操作栏 -->
    <view class="action-bar">
      <view class="quantity">
        <text class="qty-label">数量</text>
        <view class="qty-control">
          <text class="qty-btn" aria-label="减少数量" @click="decreaseQty">-</text>
          <text class="qty-value" aria-label="当前数量">{{ quantity }}</text>
          <text class="qty-btn" aria-label="增加数量" @click="increaseQty">+</text>
        </view>
      </view>
      <view class="action-buttons">
        <text class="btn-add" :class="{ loading: cartLoading }" aria-label="加入购物车" @click="addToCart">{{ cartLoading ? '' : '加入购物车' }}</text>
        <text class="btn-buy" :class="{ loading: buyLoading }" aria-label="立即购买" @click="buyNow">{{ buyLoading ? '' : '立即购买' }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.product-detail {
  min-height: 100vh;
  background: var(--bg-page);
}

.detail-swiper {
  width: 100%;
  height: 500rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
}

.image-swiper {
  width: 100%;
  height: 100%;
}

.swiper-image {
  width: 100%;
  height: 100%;
}

.img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  font-size: 120rpx;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
}

.detail-info {
  padding: 32rpx;
  background: var(--bg-card);
  margin-bottom: 24rpx;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
}

.product-price {
  font-size: 56rpx;
  font-weight: 700;
  color: var(--price);
  font-variant-numeric: tabular-nums;
}

.original-price {
  font-size: 28rpx;
  color: var(--text-placeholder);
  text-decoration: line-through;
}

.info-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.sales-count {
  font-size: 24rpx;
  color: var(--text-sub);
}

.product-name {
  flex: 1;
  font-size: 28rpx;
  color: var(--text-main);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
}

.detail-services {
  padding: 24rpx 32rpx;
  background: var(--bg-card);
  margin-bottom: 24rpx;
}

.services-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.services-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-main);
}

.services-toggle {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.toggle-text {
  font-size: 24rpx;
  color: var(--text-sub);
}

.services-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx 32rpx;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;

  &.expanded {
    max-height: 500rpx;
  }
}

.service-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.service-name {
  font-size: 24rpx;
  color: var(--text-main);
}

.detail-content {
  background: var(--bg-card);
  margin-bottom: 24rpx;
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}

.content-tabs {
  display: flex;
  border-bottom: 1rpx solid var(--border);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: var(--text-sub);

  &.active {
    color: var(--primary);
    border-bottom: 4rpx solid var(--primary);
    margin-bottom: -1rpx;
  }
}

.content-panel {
  padding: 32rpx;

  /* 限制详情图片大小 */
  :deep(img) {
    max-width: 100%;
    height: auto;
    display: block;
  }

  /* 限制表格宽度 */
  :deep(table) {
    max-width: 100%;
  }

  /* 限制段落宽度 */
  :deep(p) {
    word-wrap: break-word;
    overflow: hidden;
  }
}

.content-empty {
  text-align: center;
  color: var(--text-placeholder);
  font-size: 28rpx;
}

.specs-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.spec-item {
  display: flex;
  justify-content: space-between;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid var(--border);
}

.spec-label {
  font-size: 26rpx;
  color: var(--text-sub);
}

.spec-value {
  font-size: 26rpx;
  color: var(--text-main);
}

.after-sale-list {
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.after-sale-item {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.after-sale-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.after-sale-name {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-main);
}

.after-sale-desc {
  font-size: 24rpx;
  color: var(--text-sub);
  line-height: 1.5;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: var(--bg-card);
  border-top: 1rpx solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
}

.quantity {
  display: flex;
  align-items: center;
}

.qty-label {
  font-size: 28rpx;
  color: var(--text-sub);
  margin-right: 16rpx;
}

.qty-control {
  display: flex;
  align-items: center;
  background: var(--bg-page);
  border-radius: 8rpx;
  overflow: hidden;
}

.qty-btn {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  font-weight: 600;
  color: var(--text-main);
  transition: transform 0.15s ease, background 0.15s ease;

  &:active {
    transform: scale(0.95);
    background: var(--border);
  }
}

.qty-value {
  min-width: 72rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main);
  padding: 0 8rpx;
}

.action-buttons {
  display: flex;
  gap: 16rpx;
}

.btn-add, .btn-buy {
  position: relative;
  border-radius: 44rpx;
  font-size: 28rpx;
  font-weight: 600;
  text-align: center;
  transition: transform 0.15s ease, opacity 0.15s ease;

  &:active {
    transform: scale(0.96);
  }

  &.loading {
    opacity: 0.7;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 32rpx;
    height: 32rpx;
    margin: -16rpx 0 0 -16rpx;
    border: 3rpx solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    opacity: 0;
  }

  &.loading::after {
    opacity: 1;
    animation: spin 0.8s linear infinite;
  }
}

.btn-add {
  width: 200rpx;
  padding: 20rpx 0;
  background: var(--bg-page);
  color: var(--primary);
  border: 2rpx solid var(--primary);
}

.btn-buy {
  width: 200rpx;
  padding: 20rpx 0;
  background: var(--primary);
  color: var(--text-inverse);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
