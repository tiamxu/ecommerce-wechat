<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { productApi, type Category } from '../../api'
import ProductCard from '../../components/ProductCard.vue'
import TabBar from '../../components/TabBar.vue'
import { THEME_CLASS } from '../../theme/config'

const categories = ref<Category[]>([])
const products = ref<any[]>([])
const selectedCategoryId = ref<number | null>(null)
const loading = ref(false)
const pageNo = ref(1)
const pageSize = 12
const hasMore = ref(true)

onMounted(() => {
  loadCategories()
  loadProducts()
})

async function loadCategories() {
  try {
    const res = await productApi.getCategories()
    if (res.code === 200) {
      categories.value = res.data.pageData || []
    }
  } catch (error) {
    console.error('加载分类失败', error)
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
  } finally {
    loading.value = false
  }
}

function selectCategory(id: number | null) {
  selectedCategoryId.value = id
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
        <text class="search-icon">🔍</text>
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
      <view class="product-grid">
        <ProductCard
          v-for="item in products"
          :key="item.id"
          :product="item"
          @click="goToDetail"
        />
      </view>
      <view class="loading-tip">
        <text v-if="loading">加载中...</text>
        <text v-else-if="!hasMore">没有更多了</text>
        <text v-else-if="products.length === 0">暂无商品</text>
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
  padding: 16rpx 24rpx;
  background: var(--primary);
  flex-shrink: 0;
}

.search-input-wrap {
  height: 64rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 32rpx;
  display: flex;
  align-items: center;
  padding: 0 24rpx;
}

.search-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.search-placeholder {
  color: var(--text-placeholder);
  font-size: 26rpx;
}

.category-nav {
  height: 88rpx;
  background: var(--bg-card);
  border-bottom: 1rpx solid var(--border);
  white-space: nowrap;
  flex-shrink: 0;
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
</style>