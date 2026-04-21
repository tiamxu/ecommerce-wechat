<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { productApi, cartApi, type Product } from '../../api'
import { useUserStore } from '../../store/user'
import { THEME_CLASS } from '../../theme/config'
import TabBar from '../../components/TabBar.vue'

const product = ref<Product | null>(null)
const loading = ref(false)
const quantity = ref(1)
const userStore = useUserStore()

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const id = currentPage?.options?.id

  if (id) {
    loadProduct(Number(id))
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

  if (!userStore.isLoggedIn) {
    uni.showModal({
      title: '提示',
      content: '请先登录后再添加购物车',
      confirmText: '去登录',
      success: (res) => {
        if (res.confirm) {
          userStore.login()
        }
      }
    })
    return
  }

  try {
    await cartApi.add({
      productId: product.value.id,
      quantity: quantity.value
    })
    uni.showToast({ title: '已加入购物车', icon: 'success' })
  } catch (error) {
    console.error('添加购物车失败', error)
    uni.showToast({ title: '添加失败，请重试', icon: 'none' })
  }
}

function buyNow() {
  if (!product.value) return
  uni.setStorageSync('quickBuy', {
    productId: product.value.id,
    quantity: quantity.value
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

function getCoverImage(): string {
  if (!product.value) return ''
  if (product.value.metaImage) return product.value.metaImage
  if (product.value.images && product.value.images.length > 0) {
    const cover = product.value.images.find(img => img.isCover === 1)
    return cover?.url || product.value.images[0].url
  }
  return ''
}
</script>

<template>
  <view :class="['product-detail', THEME_CLASS]">
    <TabBar />
    <!-- 商品图片 -->
    <view class="detail-swiper">
      <image
        v-if="getCoverImage()"
        :src="getCoverImage()"
        mode="aspectFill"
        class="cover-image"
      />
      <view v-else class="img-placeholder">
        <text class="placeholder-text">{{ getProductName().charAt(0) || 'P' }}</text>
      </view>
    </view>

    <!-- 商品信息 -->
    <view v-if="product" class="detail-info">
      <view class="info-header">
        <text class="product-price">¥{{ product.price }}</text>
        <text class="product-stock">库存: {{ product.stock }}</text>
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
  padding-bottom: 140rpx;
}

.detail-swiper {
  width: 100%;
  height: 750rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
}

.cover-image {
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

.product-stock {
  font-size: 24rpx;
  color: var(--text-sub);
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
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: var(--bg-card);
  border-top: 1rpx solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
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
