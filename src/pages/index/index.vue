<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { productApi, type Product, type ContentBlock } from '../../api'
import ProductCard from '../../components/ProductCard.vue'
import TabBar from '../../components/TabBar.vue'
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
        <ProductCard
          v-for="item in hotProducts"
          :key="item.id"
          :product="item"
          @click="goToProductDetail(item.id)"
        />
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
  padding: 12rpx 32rpx;
  padding-top: calc(12rpx + env(safe-area-inset-top));
  background: var(--bg-page);
}

.search-input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  height: 72rpx;
  padding: 0 24rpx;
  background: var(--bg-card);
  border-radius: 36rpx;
}

.search-placeholder {
  font-size: 28rpx;
  color: var(--text-placeholder);
  margin-left: 12rpx;
}

/* Banner */
.banner {
  padding-top: calc(96rpx + env(safe-area-inset-top));
}

.banner-swiper {
  width: 100%;
  height: 320rpx;
}

.banner-item {
  width: 100%;
  height: 320rpx;
  background-size: cover;
  background-position: center;
  position: relative;
}

.banner-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 160rpx;
  background: linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%);
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
  bottom: 24rpx;
  padding: 0 32rpx;
  z-index: 1;
}

.banner-title {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.2);
}

.banner-desc {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 4rpx;
}

/* 热门推荐 - 简化 */
.section {
  padding: 40rpx 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main);
}

.section-more {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: var(--text-sub);
}

.more-arrow {
  font-size: 28rpx;
  margin-left: 4rpx;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx 20rpx;
}

.empty-tip {
  text-align: center;
  padding: 80rpx 0;
  color: var(--text-sub);
  font-size: 28rpx;
}
</style>
