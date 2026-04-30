<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { productApi, type Product } from '../../api'
import { useUserStore } from '../../store/user'
import { useCartStore } from '../../store/cart'
import { THEME_CLASS } from '../../theme/config'
import TabBar from '../../components/TabBar.vue'

const product = ref<Product | null>(null)
const loading = ref(false)
const quantity = ref(1)
const userStore = useUserStore()
const cartStore = useCartStore()

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
    }
  } catch (error) {
    console.error('加载商品详情失败', error)
  } finally {
    loading.value = false
  }
}

function decreaseQty() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function increaseQty() {
  if (product.value && quantity.value < product.value.stock) {
    quantity.value++
  }
}

async function addToCart() {
  if (!product.value) return

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
  }
}

function buyNow() {
  if (!product.value) return

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

function getCoverImages(): string[] {
  if (!product.value) return []
  const images: string[] = []
  if (product.value.metaImage) {
    images.push(product.value.metaImage)
  }
  if (product.value.images && product.value.images.length > 0) {
    product.value.images.forEach(img => {
      if (img.url && !images.includes(img.url)) {
        images.push(img.url)
      }
    })
  }
  return images
}
</script>

<template>
  <view :class="['product-detail', THEME_CLASS]">
    <TabBar />
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
        indicator-active-color="#fff"
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
        <text class="product-price">¥{{ product.price }}</text>
      </view>
      <text class="product-name">{{ getProductName() }}</text>
      <text v-if="getProductDesc()" class="product-desc">{{ getProductDesc() }}</text>
    </view>

    <!-- 商品标签 -->
    <view v-if="product?.primaryTag" class="detail-tags">
      <text class="tag">{{ product.primaryTag.name }}</text>
    </view>

    <!-- 操作栏 -->
    <view class="action-bar">
      <view class="quantity">
        <text class="qty-label">数量</text>
        <view class="qty-control">
          <text class="qty-btn" @click="decreaseQty">-</text>
          <text class="qty-value">{{ quantity }}</text>
          <text class="qty-btn" @click="increaseQty">+</text>
        </view>
      </view>
      <view class="action-buttons">
        <text class="btn-add" @click="addToCart">加入购物车</text>
        <text class="btn-buy" @click="buyNow">立即购买</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.product-detail {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: 180rpx;
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
  align-items: center;
  margin-bottom: 16rpx;
}

.product-price {
  font-size: 56rpx;
  font-weight: 700;
  color: var(--price);
}

.product-name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 16rpx;
}

.product-desc {
  display: block;
  font-size: 28rpx;
  color: var(--text-sub);
  line-height: 1.6;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  padding: 24rpx 32rpx;
  background: var(--bg-card);
  margin-bottom: 24rpx;
}

.tag {
  padding: 8rpx 24rpx;
  background: var(--bg-page);
  border: 1rpx solid var(--border);
  border-radius: 40rpx;
  font-size: 24rpx;
  color: var(--text-sub);
}

.action-bar {
  position: fixed;
  bottom: calc(100rpx + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  padding: 16rpx 32rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background: var(--bg-card);
  border-top: 1rpx solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 998;
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
}

.qty-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  font-weight: 600;
  color: var(--text-main);

  &:active {
    background: var(--border);
  }
}

.qty-value {
  width: 72rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main);
}

.action-buttons {
  display: flex;
  gap: 20rpx;
}

.btn-add, .btn-buy {
  padding: 20rpx 36rpx;
  border-radius: 44rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.btn-add {
  background: var(--accent);
  color: var(--text-inverse);
}

.btn-buy {
  background: var(--primary);
  color: var(--text-inverse);
}
</style>
