<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { productApi, type Product, type ContentBlock } from '../../api'
import TabBar from '../../components/TabBar.vue'
import Skeleton from '../../components/Skeleton.vue'
import { THEME_CLASS } from '../../theme/config'

const { locale } = useI18n()

const hotProducts = ref<Product[]>([])
const banners = ref<ContentBlock[]>([])
const loading = ref(false)
const hasLoaded = ref(false)

onMounted(() => {
  loadData()
})

onShow(() => {
  if (hasLoaded.value) {
    loadData()
  }
})

async function loadData() {
  loading.value = true
  try {
    const [hotRes, bannerRes] = await Promise.all([
      productApi.getHotProducts(8),
      productApi.getContents('banner')
    ])

    if (hotRes.code === 200) {
      hotProducts.value = hotRes.data.pageData || []
    }
    if (bannerRes.code === 200 && bannerRes.data) {
      banners.value = bannerRes.data.filter((b: ContentBlock) => b.status === 1)
    }
  } catch (error) {
    console.error('加载数据失败', error)
  } finally {
    loading.value = false
    hasLoaded.value = true
  }
}

function getBannerBg(banner: ContentBlock): string {
  try {
    const extra = banner.extraJSON ? JSON.parse(banner.extraJSON) : {}
    return extra.image || ''
  } catch {
    return ''
  }
}

function getBannerTitle(banner: ContentBlock): string {
  return locale.value === 'zh' ? (banner.zhValue || '') : (banner.enValue || '')
}

function getBannerSubtitle(banner: ContentBlock): string {
  try {
    const extra = banner.extraJSON ? JSON.parse(banner.extraJSON) : {}
    const val = extra.subtitle
    if (!val) return ''
    if (typeof val === 'object' && val !== null) {
      return locale.value === 'zh' ? (val.zh || '') : (val.en || '')
    }
    return val
  } catch {
    return ''
  }
}

function getBannerDesc(banner: ContentBlock): string {
  try {
    const extra = banner.extraJSON ? JSON.parse(banner.extraJSON) : {}
    const val = extra.desc
    if (!val) return ''
    if (typeof val === 'object' && val !== null) {
      return locale.value === 'zh' ? (val.zh || '') : (val.en || '')
    }
    return val
  } catch {
    return ''
  }
}

function goToSearch() {
  uni.navigateTo({
    url: '/pages/search/index'
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
  if (product.coverImages && product.coverImages.length > 0) {
    return product.coverImages[0]
  }
  return ''
}

function handleBannerClick(banner: ContentBlock) {
  try {
    const extra = banner.extraJSON ? JSON.parse(banner.extraJSON) : {}
    if (extra.productId) {
      uni.navigateTo({
        url: `/pages/product/detail?id=${extra.productId}`
      })
    }
  } catch (e) {
    console.error('解析banner数据失败', e)
  }
}
</script>

<template>
  <view :class="['home', THEME_CLASS]">
    <!-- 自定义 TabBar -->
    <TabBar />
    <!-- 顶部搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrap" @click="goToSearch">
        <uni-icons type="search" size="16" color="var(--text-placeholder)" />
        <text class="search-placeholder">搜索商品</text>
      </view>
    </view>

    <!-- Banner -->
    <view class="banner">
      <swiper v-if="banners.length > 0" class="banner-swiper" indicator-dots :autoplay="true" :circular="true">
        <swiper-item v-for="banner in banners" :key="banner.id" @click="handleBannerClick(banner)">
          <view class="banner-item" :style="{ backgroundImage: `url('${getBannerBg(banner)}')` }">
            <view class="banner-overlay"></view>
            <view class="banner-content">
              <text class="banner-title">{{ getBannerTitle(banner) }}</text>
              <text v-if="getBannerDesc(banner)" class="banner-desc">{{ getBannerDesc(banner) }}</text>
            </view>
          </view>
        </swiper-item>
      </swiper>
      <swiper v-else class="banner-swiper" indicator-dots :autoplay="true" :circular="true">
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
        <!-- 骨架屏 -->
        <template v-if="loading && hotProducts.length === 0">
          <view v-for="i in 4" :key="i" class="product-card">
            <view class="card-img-wrap">
              <Skeleton width="100%" height="320rpx" borderRadius="0" />
            </view>
            <view class="card-info">
              <Skeleton width="80%" height="32rpx" />
              <Skeleton width="50%" height="28rpx" />
            </view>
          </view>
        </template>
        <!-- 商品列表 -->
        <template v-else>
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
                <text class="card-sales">已售{{ item.sales || 0 }}件</text>
              </view>
            </view>
          </view>
        </template>
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
  padding: 12rpx 32rpx;
  padding-top: calc(12rpx + env(safe-area-inset-top));
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
}

.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  height: 64rpx;
  padding: 0 24rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 32rpx;
}

.search-placeholder {
  font-size: 28rpx;
  color: var(--text-placeholder);
  margin-left: 8rpx;
}

/* Banner */
.banner {
  padding-top: calc(88rpx + env(safe-area-inset-top));
}

.banner-swiper {
  width: 100%;
  height: 380rpx;
}

.banner-item {
  width: 100%;
  height: 380rpx;
  background-size: cover;
  background-position: center;
  position: relative;
}

.banner-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 200rpx;
  background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%);
}

.banner-1 {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
}

.banner-2 {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
}

.banner-content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 32rpx;
  padding: 0 32rpx;
  z-index: 1;
}

.banner-title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: var(--text-inverse);
  margin-bottom: 8rpx;
  text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.3);
}

.banner-desc {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2rpx 6rpx rgba(0,0,0,0.25);
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
  display: flex;
  flex-direction: column;
  height: 500rpx;
  background: var(--bg-card);
  border-radius: 16rpx;
  overflow: hidden;
}

.card-img-wrap {
  position: relative;
  flex-shrink: 0;
  width: 100%;
  height: 340rpx;
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
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16rpx;
  min-height: 0;

  :deep(.skeleton) {
    margin-bottom: 12rpx;
  }
}

.card-name {
  display: block;
  font-size: 28rpx;
  color: var(--text-main);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  height: 72rpx;
}

.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.card-price {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--price);
  font-variant-numeric: tabular-nums;
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
