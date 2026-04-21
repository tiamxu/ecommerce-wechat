<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { productApi, type Product, type Category } from '../../api'
import TabBar from '../../components/TabBar.vue'
import { THEME_CLASS } from '../../theme/config'

const categories = ref<Category[]>([])
const hotProducts = ref<Product[]>([])
const loading = ref(false)
const searchKeyword = ref('')

// 模拟秒杀数据
const seckillEndTime = ref<Date>(new Date(Date.now() + 4 * 60 * 60 * 1000)) // 4小时后
const countdown = ref({ hours: 0, minutes: 0, seconds: 0 })

onMounted(() => {
  loadData()
  startCountdown()
})

async function loadData() {
  loading.value = true
  try {
    const [catRes, hotRes] = await Promise.all([
      productApi.getCategories(),
      productApi.getHotProducts(8)
    ])

    if (catRes.code === 200) {
      categories.value = catRes.data.pageData || []
    }
    if (hotRes.code === 200) {
      hotProducts.value = hotRes.data.pageData || []
    }
  } catch (error) {
    console.error('加载数据失败', error)
  } finally {
    loading.value = false
  }
}

function startCountdown() {
  setInterval(() => {
    const now = new Date()
    const diff = seckillEndTime.value.getTime() - now.getTime()
    if (diff > 0) {
      countdown.value.hours = Math.floor(diff / (1000 * 60 * 60))
      countdown.value.minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      countdown.value.seconds = Math.floor((diff % (1000 * 60)) / 1000)
    }
  }, 1000)
}

function goToSearch() {
  if (searchKeyword.value.trim()) {
    uni.navigateTo({
      url: `/pages/product/list?keyword=${encodeURIComponent(searchKeyword.value.trim())}`
    })
  } else {
    uni.navigateTo({ url: '/pages/product/list' })
  }
}

function goToCategoryProducts(categoryId: number) {
  uni.navigateTo({
    url: `/pages/product/list?categoryId=${categoryId}`
  })
}

function goToProductDetail(id: number) {
  uni.navigateTo({
    url: `/pages/product/detail?id=${id}`
  })
}

function goToAllProducts() {
  uni.switchTab({ url: '/pages/product/list' })
}

function getProductName(product: Product): string {
  return product.name?.zh || product.name?.en || '商品'
}

function getCoverImage(product: Product): string {
  if (product.metaImage) return product.metaImage
  if (product.images && product.images.length > 0) {
    const cover = product.images.find(img => img.isCover === 1)
    return cover?.url || product.images[0].url
  }
  return ''
}

function padZero(num: number): string {
  return num.toString().padStart(2, '0')
}
</script>

<template>
  <view :class="['home', THEME_CLASS]">
    <!-- 自定义 TabBar -->
    <TabBar />
    <!-- 顶部搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrap" @click="goToSearch">
        <text class="search-icon">🔍</text>
        <input
          v-model="searchKeyword"
          class="search-input"
          placeholder="搜索商品"
          disabled
        />
      </view>
      <view class="search-tip">搜索</view>
    </view>

    <!-- Banner -->
    <view class="banner">
      <swiper class="banner-swiper" indicator-dots autoplay circular>
        <swiper-item>
          <view class="banner-item banner-1">
            <view class="banner-content">
              <text class="banner-title">新品上市</text>
              <text class="banner-subtitle">精选优质好物</text>
            </view>
          </view>
        </swiper-item>
        <swiper-item>
          <view class="banner-item banner-2">
            <view class="banner-content">
              <text class="banner-title">限时特惠</text>
              <text class="banner-subtitle">全场低至5折</text>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <!-- 分类入口 -->
    <view class="section category-section">
      <view class="category-grid">
        <view
          v-for="cat in categories.slice(0, 8)"
          :key="cat.id"
          class="category-item"
          @click="goToCategoryProducts(cat.id)"
        >
          <view class="category-icon" :style="{ background: cat.id % 2 === 0 ? 'var(--primary-light)' : 'var(--accent-light)' }">
            <text>{{ cat.icon || '📦' }}</text>
          </view>
          <text class="category-name">{{ cat.name?.zh || cat.name?.en || '分类' }}</text>
        </view>
      </view>
    </view>

    <!-- 限时秒杀 -->
    <view class="section seckill-section">
      <view class="seckill-header">
        <view class="seckill-title">
          <text class="seckill-icon">⚡</text>
          <text class="seckill-text">限时秒杀</text>
        </view>
        <view class="seckill-countdown">
          <text class="countdown-label">距结束</text>
          <view class="countdown-time">
            <text class="time-block">{{ padZero(countdown.hours) }}</text>
            <text class="time-sep">:</text>
            <text class="time-block">{{ padZero(countdown.minutes) }}</text>
            <text class="time-sep">:</text>
            <text class="time-block">{{ padZero(countdown.seconds) }}</text>
          </view>
        </view>
      </view>
      <scroll-view class="seckill-scroll" scroll-x>
        <view class="seckill-list">
          <view
            v-for="item in hotProducts.slice(0, 4)"
            :key="item.id"
            class="seckill-item"
            @click="goToProductDetail(item.id)"
          >
            <image
              v-if="getCoverImage(item)"
              class="seckill-img"
              :src="getCoverImage(item)"
              mode="aspectFill"
            />
            <view v-else class="seckill-img-placeholder">
              <text>{{ getProductName(item).charAt(0) }}</text>
            </view>
            <text class="seckill-price">¥{{ item.price }}</text>
            <text class="seckill-original">¥{{ Math.round(item.price * 1.5) }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 热门推荐 -->
    <view class="section">
      <view class="section-header">
        <view class="section-title-wrap">
          <text class="section-title">热门推荐</text>
          <text class="section-subtitle">发现更多好物</text>
        </view>
        <view class="section-more" @click="goToAllProducts">
          <text>查看全部</text>
          <text class="more-arrow">›</text>
        </view>
      </view>
      <view class="product-grid">
        <view
          v-for="item in hotProducts"
          :key="item.id"
          class="product-card"
          @click="goToProductDetail(item.id)"
        >
          <view class="card-img-wrap">
            <image
              v-if="getCoverImage(item)"
              class="card-img"
              :src="getCoverImage(item)"
              mode="aspectFill"
            />
            <view v-else class="card-img-placeholder">
              <text class="placeholder-text">{{ getProductName(item).charAt(0) }}</text>
            </view>
            <view v-if="item.primaryTag" class="card-tag">
              {{ item.primaryTag.name }}
            </view>
          </view>
          <view class="card-info">
            <text class="card-name">{{ getProductName(item) }}</text>
            <view class="card-bottom">
              <text class="card-price">¥{{ item.price }}</text>
              <text class="card-sales">已售{{ Math.floor(Math.random() * 500 + 100) }}件</text>
            </view>
          </view>
        </view>
      </view>
      <view v-if="hotProducts.length === 0 && !loading" class="empty-tip">
        <text>暂无推荐商品</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.home {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

/* 搜索栏 */
.search-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 16rpx 24rpx;
  padding-top: calc(16rpx + env(safe-area-inset-top));
  background: var(--primary);
}

.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  height: 72rpx;
  padding: 0 24rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 36rpx;
}

.search-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: var(--text-main);
}

.search-tip {
  margin-left: 20rpx;
  font-size: 28rpx;
  color: var(--text-inverse);
  font-weight: 500;
}

/* Banner */
.banner {
  padding-top: calc(104rpx + env(safe-area-inset-top));
}

.banner-swiper {
  width: 100%;
  height: 320rpx;
}

.banner-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-1 {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
}

.banner-2 {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
}

.banner-content {
  text-align: center;
}

.banner-title {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: var(--text-inverse);
  margin-bottom: 12rpx;
}

.banner-subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

/* 分类 */
.category-section {
  margin-top: -40rpx;
  position: relative;
  z-index: 10;
  border-radius: 24rpx 24rpx 0 0;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.category-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  margin-bottom: 12rpx;
  box-shadow: 0 4rpx 12rpx var(--shadow);
}

.category-name {
  font-size: 24rpx;
  color: var(--text-main);
  text-align: center;
}

/* 秒杀 */
.seckill-section {
  background: linear-gradient(180deg, var(--accent-light) 0%, var(--bg-card) 100%);
}

.seckill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.seckill-title {
  display: flex;
  align-items: center;
}

.seckill-icon {
  font-size: 36rpx;
  margin-right: 8rpx;
}

.seckill-text {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--accent);
}

.seckill-countdown {
  display: flex;
  align-items: center;
}

.countdown-label {
  font-size: 24rpx;
  color: var(--text-sub);
  margin-right: 12rpx;
}

.countdown-time {
  display: flex;
  align-items: center;
}

.time-block {
  min-width: 40rpx;
  height: 40rpx;
  background: var(--accent);
  color: var(--text-inverse);
  font-size: 24rpx;
  font-weight: 600;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.time-sep {
  margin: 0 6rpx;
  color: var(--accent);
  font-weight: 600;
}

.seckill-scroll {
  white-space: nowrap;
}

.seckill-list {
  display: inline-flex;
  gap: 20rpx;
}

.seckill-item {
  width: 200rpx;
  background: var(--bg-card);
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx var(--shadow);
}

.seckill-img {
  width: 100%;
  height: 200rpx;
}

.seckill-img-placeholder {
  width: 100%;
  height: 200rpx;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
}

.seckill-price {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
  color: var(--accent);
  padding: 12rpx 12rpx 4rpx;
}

.seckill-original {
  display: block;
  font-size: 22rpx;
  color: var(--text-placeholder);
  text-decoration: line-through;
  padding: 0 12rpx 12rpx;
}

/* 热门推荐 */
.section {
  padding: 32rpx 24rpx;
  background: var(--bg-card);
  margin: 24rpx;
  border-radius: 16rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24rpx;
}

.section-title-wrap {
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main);
}

.section-subtitle {
  font-size: 24rpx;
  color: var(--text-sub);
  margin-top: 4rpx;
}

.section-more {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: var(--primary);
}

.more-arrow {
  font-size: 28rpx;
  margin-left: 4rpx;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.product-card {
  background: var(--bg-page);
  border-radius: 16rpx;
  overflow: hidden;
}

.card-img-wrap {
  position: relative;
  height: 320rpx;
}

.card-img {
  width: 100%;
  height: 100%;
}

.card-img-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  font-size: 64rpx;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
}

.card-tag {
  position: absolute;
  top: 12rpx;
  left: 12rpx;
  padding: 4rpx 12rpx;
  background: var(--accent);
  color: var(--text-inverse);
  font-size: 20rpx;
  border-radius: 20rpx;
}

.card-info {
  padding: 16rpx;
}

.card-name {
  display: block;
  font-size: 28rpx;
  color: var(--text-main);
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-price {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--price);
}

.card-sales {
  font-size: 22rpx;
  color: var(--text-sub);
}

.empty-tip {
  text-align: center;
  padding: 48rpx;
  color: var(--text-sub);
}
</style>
