<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useI18n } from 'vue-i18n'
import { productApi, type Product, type ContentBlock } from '../../api'
import { useSearchStore } from '../../store/search'
import { useCartStore } from '../../store/cart'
import { useUserStore } from '../../store/user'
import ProductCard from '../../components/ProductCard.vue'
import SearchBar from '../../components/SearchBar.vue'
import TabBar from '../../components/TabBar.vue'
import { THEME_CLASS } from '../../theme/config'

const { locale } = useI18n()
const searchStore = useSearchStore()
const cartStore = useCartStore()
const userStore = useUserStore()

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

function goToProductDetail(id: number) {
  uni.navigateTo({
    url: `/pages/product/detail?id=${id}`
  })
}

function goToSearch(keyword: string) {
  if (keyword?.trim()) {
    searchStore.addHistory(keyword)
  }
  uni.navigateTo({
    url: '/pages/search/index'
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

async function addToCart(product: Product) {
  if (!userStore.isLoggedIn) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/user/login' })
    }, 1500)
    return
  }
  try {
    await cartStore.addItem(product.id, 1)
    uni.showToast({ title: '已加入购物车', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: '添加失败', icon: 'none' })
  }
}
</script>

<template>
  <view :class="['home', THEME_CLASS]">
    <!-- 自定义 TabBar -->
    <TabBar />
    <!-- 顶部搜索栏 -->
    <view class="search-bar">
      <SearchBar @search="goToSearch" />
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
          :show-cart-btn="true"
          @click="goToProductDetail(item.id)"
          @add-cart="addToCart"
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
  padding: 12rpx 24rpx;
  padding-top: calc(12rpx + env(safe-area-inset-top));
  background: var(--bg-page);
  box-shadow: 0 2rpx 12rpx var(--shadow);
}

/* Banner */
.banner {
  padding-top: calc(88rpx + env(safe-area-inset-top));
}

.banner-swiper {
  width: 100%;
  height: 360rpx;
  border-radius: 0;
}

.banner-item {
  width: 100%;
  height: 360rpx;
  background-size: cover;
  background-position: center;
  position: relative;
}

.banner-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 180rpx;
  background: linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%);
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
  color: #fff;
  text-shadow: 0 2rpx 8rpx rgba(0,0,0,0.25);
}

.banner-subtitle {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 8rpx;
}

.banner-desc {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 4rpx;
}

/* 热门推荐 */
.section {
  padding: 40rpx 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title-wrap {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.section-title {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--text-main);
}

.section-subtitle {
  font-size: 22rpx;
  color: var(--text-sub);
}

.section-more {
  display: flex;
  align-items: center;
  padding: 12rpx 20rpx;
  background: var(--primary-light);
  border-radius: 32rpx;
  font-size: 24rpx;
  color: var(--primary);
  font-weight: 500;
}

.more-arrow {
  font-size: 24rpx;
  margin-left: 4rpx;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.empty-tip {
  text-align: center;
  padding: 80rpx 0;
  color: var(--text-sub);
  font-size: 28rpx;
}
</style>
