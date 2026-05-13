<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { productApi, type Category, type Product } from '../../api'
import ProductCard from '../../components/ProductCard.vue'
import Skeleton from '../../components/Skeleton.vue'
import TabBar from '../../components/TabBar.vue'
import { THEME_CLASS } from '../../theme/config'

const categories = ref<Category[]>([])
const products = ref<Product[]>([])
const selectedCategoryId = ref<number | null>(null)
const loading = ref(false)
const pageNo = ref(1)
const pageSize = 12
const hasMore = ref(true)

onMounted(() => {
  loadCategories()
  // 恢复用户之前选择的分类
  const savedCategoryId = uni.getStorageSync('selectedCategoryId')
  if (savedCategoryId) {
    selectedCategoryId.value = Number(savedCategoryId)
  }
  loadProducts()
})

async function loadCategories() {
  try {
    const res = await productApi.getCategories()
    if (res.code === 200) {
      categories.value = Array.isArray(res.data) ? res.data : (res.data.pageData || [])
    }
  } catch (error) {
    console.error('加载分类失败', error)
    uni.showToast({ title: '加载分类失败', icon: 'none' })
  }
}

async function loadProducts(reset = false) {
  if (loading.value) return
  if (!reset && !hasMore.value) return

  if (reset) {
    pageNo.value = 1
    hasMore.value = true
  }

  loading.value = true
  try {
    const res = await productApi.getList({
      pageNo: pageNo.value,
      pageSize,
      categoryId: selectedCategoryId.value || undefined
    })
    if (res.code === 200) {
      const list = res.data.pageData || []
      if (reset) {
        products.value = list
      } else {
        products.value = [...products.value, ...list]
      }
      hasMore.value = list.length >= pageSize
      pageNo.value++
    }
  } catch (error) {
    console.error('加载商品失败', error)
    uni.showToast({ title: '加载商品失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function selectCategory(id: number | null) {
  if (selectedCategoryId.value === id) return
  selectedCategoryId.value = id
  uni.setStorageSync('selectedCategoryId', id)
  products.value = []
  loadProducts(true)
}

function goToDetail(id: number) {
  uni.navigateTo({
    url: `/pages/product/detail?id=${id}`
  })
}

function goToSearch() {
  uni.navigateTo({
    url: '/pages/search/index'
  })
}

function goToShop() {
  selectCategory(null)
}

// 下拉刷新
function onPullDownRefresh() {
  loadProducts(true).finally(() => {
    uni.stopPullDownRefresh()
  })
}

// 上拉加载更多
function onReachBottom() {
  if (hasMore.value && !loading.value) {
    loadProducts(false)
  }
}
</script>

<template>
  <view :class="['product-list', THEME_CLASS]">
    <TabBar />

    <!-- 顶部搜索栏 -->
    <view class="search-bar" @click="goToSearch">
      <view class="search-input-wrap">
        <uni-icons type="search" size="16" color="var(--text-placeholder)" />
        <text class="search-placeholder">搜索商品</text>
      </view>
    </view>

    <!-- 顶部分类导航 -->
    <scroll-view class="category-nav" scroll-x>
      <view class="category-list">
        <view
          class="category-item"
          :class="{ active: selectedCategoryId === null }"
          @click="selectCategory(null)"
        >
          <text class="category-text">全部</text>
        </view>
        <view
          v-for="cat in categories"
          :key="cat.id"
          class="category-item"
          :class="{ active: selectedCategoryId === cat.id }"
          @click="selectCategory(cat.id)"
        >
          <text class="category-text">{{ cat.name?.zh || cat.name?.en || '分类' }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 商品列表 -->
    <scroll-view class="product-scroll" scroll-y @scrolltolower="onReachBottom">
      <!-- 骨架屏加载态 -->
      <view v-if="loading && products.length === 0" class="product-grid skeleton-grid">
        <view v-for="i in 6" :key="i" class="skeleton-card">
          <Skeleton width="100%" height="340rpx" borderRadius="16rpx 16rpx 0 0" />
          <view class="skeleton-info">
            <Skeleton width="80%" height="32rpx" />
            <Skeleton width="50%" height="28rpx" />
          </view>
        </view>
      </view>

      <!-- 商品列表 -->
      <view v-else class="product-grid">
        <ProductCard
          v-for="item in products"
          :key="item.id"
          :product="item"
          @click="goToDetail(item.id)"
        />
      </view>

      <view class="loading-tip">
        <text v-if="loading && products.length > 0">加载中...</text>
        <text v-else-if="!hasMore && products.length > 0">没有更多了</text>
        <view v-else-if="products.length === 0 && !loading" class="empty-tip">
          <text class="empty-text">暂无商品</text>
          <text class="go-shop-btn" @click="goToShop">去逛逛</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style scoped lang="scss">
.product-list {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-page);
}

.search-bar {
  height: 96rpx;
  padding: 12rpx 24rpx;
  background: var(--bg-page);
  flex-shrink: 0;
}

.search-input-wrap {
  height: 72rpx;
  background: var(--bg-card);
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
}

.search-placeholder {
  color: var(--text-placeholder);
  font-size: 26rpx;
  margin-left: 8rpx;
}

.category-nav {
  height: 88rpx;
  background: var(--bg-card);
  border-bottom: 1rpx solid var(--border);
  white-space: nowrap;
  flex-shrink: 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.category-list {
  display: inline-flex;
  padding: 0 16rpx;
  gap: 16rpx;
  height: 88rpx;
  align-items: center;
}

.category-item {
  display: inline-block;
  padding: 16rpx 32rpx;
  background: var(--bg-page);
  border-radius: 40rpx;
  font-size: 28rpx;
  color: var(--text-sub);
  flex-shrink: 0;

  &.active {
    background: var(--primary);
    color: var(--text-inverse);
    font-weight: 600;
  }
}

.category-text {
  font-size: 28rpx;
}

.product-scroll {
  flex: 1;
  overflow-y: auto;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  padding: 24rpx;
}

.loading-tip {
  padding: 32rpx;
  text-align: center;
  color: var(--text-sub);
  font-size: 26rpx;
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.empty-text {
  color: var(--text-sub);
  font-size: 28rpx;
}

.go-shop-btn {
  padding: 16rpx 48rpx;
  background: var(--primary);
  color: var(--text-inverse);
  border-radius: 40rpx;
  font-size: 28rpx;
}

.skeleton-grid {
  padding: 24rpx;
}

.skeleton-card {
  background: var(--bg-card);
  border-radius: 16rpx;
  overflow: hidden;
}

.skeleton-info {
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
</style>
