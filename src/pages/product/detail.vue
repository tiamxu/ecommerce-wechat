<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { onShow, onPageScroll } from '@dcloudio/uni-app'
import { productApi, type Product } from '../../api'
import { useUserStore } from '../../store/user'
import { useCartStore } from '../../store/cart'
import { THEME_CLASS } from '../../theme/config'
import TabBar from '../../components/TabBar.vue'

const product = ref<Product | null>(null)
const quantity = ref(1)
const activeTab = ref('product')
const cartLoading = ref(false)
const buyLoading = ref(false)
const recommendProducts = ref<Product[]>([])
const userStore = useUserStore()
const cartStore = useCartStore()

const priceDisplay = computed(() => {
  if (!product.value) return { integer: '0', decimal: '00' }
  const parts = product.value.price.toFixed(2).split('.')
  return {
    integer: parts[0],
    decimal: parts[1]
  }
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
    loadRecommendProducts()
  }
  // 立即更新位置，300ms后再更新一次确保准确
  updateSectionPositions()
  setTimeout(updateSectionPositions, 300)
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

// 点击tab跳转到对应区块
const sectionPositions = ref({
  product: 0,
  comment: 0,
  detail: 0,
  recommend: 0
})

function scrollToTab(tab: string) {
  activeTab.value = tab
  uni.pageScrollTo({
    scrollTop: sectionPositions.value[tab as keyof typeof sectionPositions.value] - 88,
    duration: 200
  })
}

// 监听滚动，更新当前tab和Tab栏显示
const showStickyTabs = ref(false)

// 更新各区块滚动位置
function updateSectionPositions() {
  uni.createSelectorQuery()
    .select('#product').boundingClientRect()
    .select('#comment').boundingClientRect()
    .select('#detail').boundingClientRect()
    .select('#recommend').boundingClientRect()
    .exec((res: any) => {
    if (res[0] && res[0].top !== undefined) sectionPositions.value.product = res[0].top
    if (res[1] && res[1].top !== undefined) sectionPositions.value.comment = res[1].top
    if (res[2] && res[2].top !== undefined) sectionPositions.value.detail = res[2].top
    if (res[3] && res[3].top !== undefined) sectionPositions.value.recommend = res[3].top
    console.log('sectionPositions:', sectionPositions.value)
  })
}

// 页面滚动监听
onPageScroll((e: any) => {
  const scrollTop = e.scrollTop

  // 滚动超过100px时显示吸顶Tab
  showStickyTabs.value = scrollTop > 100

  // 根据滚动位置判断当前tab（使用固定阈值）
  if (scrollTop < 400) {
    activeTab.value = 'product'
  } else if (scrollTop < 800) {
    activeTab.value = 'comment'
  } else if (scrollTop < 1200) {
    activeTab.value = 'detail'
  } else {
    activeTab.value = 'recommend'
  }
})

async function loadProduct(id: number) {
  try {
    const res = await productApi.getDetail(id)
    if (res.code === 200 && res.data) {
      product.value = res.data
      loadProductServices(id)
    }
  } catch (error) {
    console.error('加载商品详情失败', error)
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

function getRecommendCoverImages(p: Product): string {
  if (p.coverImages && p.coverImages.length > 0) return p.coverImages[0]
  if (p.metaImage) return p.metaImage
  if (p.images && p.images.length > 0) {
    const cover = p.images.find(img => img.isCover === 1)
    return cover?.url || p.images[0].url
  }
  return ''
}

function getRecommendName(p: Product): string {
  return p.name?.zh || p.name?.en || '商品'
}

function getRecommendPrice(p: Product): { integer: string; decimal: string } {
  const parts = p.price.toFixed(2).split('.')
  return { integer: parts[0], decimal: parts[1] }
}

function goToRecommendDetail(id: number) {
  uni.navigateTo({
    url: `/pages/product/detail?id=${id}`
  })
}

async function loadRecommendProducts() {
  try {
    const res = await productApi.getHotProducts(10)
    if (res.code === 200 && res.data) {
      recommendProducts.value = res.data.pageData || []
    }
  } catch (error) {
    console.warn('加载推荐商品失败', error)
  }
}
</script>

<template>
  <view :class="['product-detail', THEME_CLASS]">
    <!-- <TabBar :hidden="true" /> -->

    <!-- 吸顶Tab -->
    <view class="sticky-tabs" :class="{ 'sticky-show': showStickyTabs }">
      <view class="tabs-inner">
        <text :class="['tab-item', { active: activeTab === 'product' }]" @click="scrollToTab('product')">商品</text>
        <text :class="['tab-item', { active: activeTab === 'comment' }]" @click="scrollToTab('comment')">评价</text>
        <text :class="['tab-item', { active: activeTab === 'detail' }]" @click="scrollToTab('detail')">详情</text>
        <text :class="['tab-item', { active: activeTab === 'recommend' }]" @click="scrollToTab('recommend')">推荐</text>
      </view>
    </view>

    <!-- 页面内容（自然滚动） -->
    <view class="page-content">
      <!-- 商品图片轮播 -->
      <view id="product" class="detail-swiper">
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

      <!-- 商品信息卡片 -->
      <view class="product-info-section">
        <view class="price-row">
          <text class="price-symbol">¥</text>
          <text class="price-integer">{{ priceDisplay.integer }}</text>
          <text class="price-decimal">.{{ priceDisplay.decimal }}</text>
        </view>
        <text class="product-title">{{ getProductName() }}</text>

        <!-- 售后服务 -->
        <view v-if="displayServices.length" class="service-row">
          <view v-for="service in displayServices" :key="service.id" class="service-tag">
            <uni-icons :type="getServiceIcon(service.icon)" size="12" color="var(--primary)" />
            <text class="service-text">{{ service.name }}</text>
          </view>
        </view>

        <!-- 数量选择 -->
        <view class="quantity-row">
          <text class="qty-label">购买数量</text>
          <view class="qty-control">
            <text class="qty-btn" @click="decreaseQty">-</text>
            <text class="qty-value">{{ quantity }}</text>
            <text class="qty-btn" @click="increaseQty">+</text>
          </view>
          <text class="stock-text">库存 {{ product?.stock || 0 }}</text>
        </view>
      </view>

      <!-- 评价区块 -->
      <view id="comment" class="section-block">
        <view class="section-header">
          <text class="section-title">商品评价</text>
        </view>
        <view class="empty-comment">
          <text class="empty-comment-text">暂无评价</text>
        </view>
      </view>

      <!-- 详情区块 -->
      <view id="detail" class="section-block">
        <view class="section-header">
          <text class="section-title">商品详情</text>
        </view>
        <view class="detail-content">
          <rich-text v-if="processedDescription" :nodes="processedDescription"></rich-text>
          <view v-else class="content-empty">
            <text>暂无商品详情</text>
          </view>
        </view>
      </view>

      <!-- 推荐区块 -->
      <view id="recommend" class="section-block">
        <view class="section-header">
          <text class="section-title">推荐商品</text>
        </view>
        <scroll-view class="recommend-scroll" scroll-x>
          <view class="recommend-list">
            <view
              v-for="item in recommendProducts"
              :key="item.id"
              class="recommend-item"
              @click="goToRecommendDetail(item.id)"
            >
              <image
                :src="getRecommendCoverImages(item)"
                mode="aspectFill"
                class="recommend-img"
              />
              <view class="recommend-info">
                <text class="recommend-name">{{ getRecommendName(item) }}</text>
                <view class="recommend-price">
                  <text class="rec-price-symbol">¥</text>
                  <text class="rec-price-integer">{{ getRecommendPrice(item).integer }}</text>
                  <text class="rec-price-decimal">.{{ getRecommendPrice(item).decimal }}</text>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-placeholder"></view>
    </view>

    <!-- 操作栏 -->
    <view class="action-bar">
      <view class="action-icons">
        <view class="icon-btn" @click="addToCart">
          <uni-icons type="cart" size="24" color="var(--text-main)" />
          <text class="icon-label">购物车</text>
        </view>
        <view class="icon-btn">
          <uni-icons type="star" size="24" color="var(--text-main)" />
          <text class="icon-label">收藏</text>
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
  position: relative;
}

/* 吸顶Tab */
.sticky-tabs {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  background: var(--bg-card);
  border-bottom: 1rpx solid var(--border);
  padding-top: calc(env(safe-area-inset-top));
  transform: translateY(-100%);
  transition: transform 0.3s ease;
}

.sticky-tabs.sticky-show {
  transform: translateY(0);
}

.tabs-inner {
  display: flex;
  height: 88rpx;
}

.tabs-inner .tab-item {
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  color: var(--text-sub);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tabs-inner .tab-item.active {
  color: var(--primary);
  font-weight: 600;
}

.tabs-inner .tab-item.active::after {
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

/* 页面内容区 */
.page-content {
  padding-top: 0;
}

.detail-swiper {
  width: 100%;
  height: 420rpx;
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

/* 商品信息区块 */
.product-info-section {
  padding: 32rpx;
  background: var(--bg-card);
  margin-bottom: 16rpx;
}

.price-row {
  display: flex;
  align-items: baseline;
  margin-bottom: 16rpx;
}

.product-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.4;
  margin-bottom: 20rpx;
}

.service-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 24rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid var(--border);
}

.service-tag {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 6rpx 16rpx;
  background: var(--bg-page);
  border-radius: 20rpx;
  font-size: 22rpx;
  color: var(--text-main);
}

.service-text {
  font-size: 22rpx;
  color: var(--text-main);
}

.quantity-row {
  display: flex;
  align-items: center;
}

.qty-label {
  font-size: 26rpx;
  color: var(--text-sub);
  margin-right: 24rpx;
}

.qty-control {
  display: flex;
  align-items: center;
  background: var(--bg-page);
  border-radius: 8rpx;
  overflow: hidden;
}

.qty-btn {
  width: 64rpx;
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
  min-width: 64rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-main);
  padding: 0 8rpx;
}

.stock-text {
  font-size: 24rpx;
  color: var(--text-placeholder);
  margin-left: auto;
}

/* 通用区块 */
.section-block {
  background: var(--bg-card);
  margin-bottom: 16rpx;
}

.section-header {
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid var(--border);
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--text-main);
}

/* 详情内容 */
.detail-content {
  padding: 32rpx;

  :deep(img) {
    max-width: 100%;
    height: auto;
    display: block;
  }

  :deep(table) {
    max-width: 100%;
  }

  :deep(p) {
    word-wrap: break-word;
    overflow: hidden;
  }
}

.content-empty {
  text-align: center;
  color: var(--text-placeholder);
  font-size: 28rpx;
  padding: 60rpx 0;
}

/* 评价 */
.empty-comment {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
}

.empty-comment-text {
  font-size: 28rpx;
  color: var(--text-placeholder);
}

/* 推荐 */
.recommend-scroll {
  width: 100%;
  white-space: nowrap;
  padding: 24rpx 0;
}

.recommend-list {
  display: inline-flex;
  gap: 16rpx;
  padding: 0 16rpx;
}

.recommend-item {
  width: 200rpx;
  flex-shrink: 0;
  background: var(--bg-page);
  border-radius: 12rpx;
  overflow: hidden;
}

.recommend-img {
  width: 200rpx;
  height: 200rpx;
}

.recommend-info {
  padding: 12rpx;
}

.recommend-name {
  display: block;
  font-size: 24rpx;
  color: var(--text-main);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 8rpx;
}

.recommend-price {
  display: flex;
  align-items: baseline;
}

.rec-price-symbol {
  font-size: 22rpx;
  font-weight: 600;
  color: var(--price);
}

.rec-price-integer {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--price);
}

.rec-price-decimal {
  font-size: 22rpx;
  font-weight: 600;
  color: var(--price);
}

/* 底部占位 */
.bottom-placeholder {
  height: calc(140rpx + env(safe-area-inset-bottom));
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

.action-icons {
  display: flex;
  gap: 32rpx;
}

.icon-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.icon-label {
  font-size: 20rpx;
  color: var(--text-sub);
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
  background: var(--primary-light);
  color: var(--primary);
  border: 2rpx solid var(--primary);
}

.btn-buy {
  width: 200rpx;
  padding: 20rpx 0;
  background: var(--primary);
  color: var(--text-inverse);
  border: 2rpx solid var(--primary);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
