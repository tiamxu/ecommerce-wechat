<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ProductCard from '../../components/ProductCard.vue'

const products = ref<any[]>([])
const categories = ref<any[]>([])
const selectedCategory = ref<number | null>(null)
const loading = ref(false)

// 模拟商品数据
const MOCK_PRODUCTS = [
  { id: 1, name: '示例商品1', price: 299, coverImage: '', tags: ['热销'] },
  { id: 2, name: '示例商品2', price: 599, coverImage: '', tags: ['新品'] },
  { id: 3, name: '示例商品3', price: 899, coverImage: '', tags: [] },
  { id: 4, name: '示例商品4', price: 1299, coverImage: '', tags: ['推荐'] }
]

const MOCK_CATEGORIES = [
  { id: 1, name: '分类一' },
  { id: 2, name: '分类二' },
  { id: 3, name: '分类三' }
]

onMounted(() => {
  loadCategories()
  loadProducts()
})

function loadCategories() {
  categories.value = MOCK_CATEGORIES
}

function loadProducts() {
  loading.value = true
  setTimeout(() => {
    products.value = MOCK_PRODUCTS
    loading.value = false
  }, 300)
}

function selectCategory(id: number | null) {
  selectedCategory.value = id
}

function goToDetail(id: number) {
  uni.navigateTo({
    url: `/pages/product/detail?id=${id}`
  })
}

function onReachBottom() {
  // 模拟加载更多
}
</script>

<template>
  <view class="product-list">
    <!-- 分类筛选 -->
    <scroll-view class="category-scroll" scroll-x>
      <view class="category-list">
        <view
          class="category-item"
          :class="{ active: selectedCategory === null }"
          @click="selectCategory(null)"
        >
          <text class="category-text">全部</text>
        </view>
        <view
          v-for="cat in categories"
          :key="cat.id"
          class="category-item"
          :class="{ active: selectedCategory === cat.id }"
          @click="selectCategory(cat.id)"
        >
          <text class="category-text">{{ cat.name }}</text>
        </view>
      </view>
    </scroll-view>

    <!-- 商品列表 -->
    <view class="product-grid">
      <ProductCard
        v-for="item in products"
        :key="item.id"
        :product="item"
        @click="goToDetail"
      />
    </view>

    <!-- 加载状态 -->
    <view class="loading-tip">
      <text v-if="loading" class="loading-text">加载中...</text>
      <text v-else class="loading-text">没有更多了</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.product-list {
  min-height: 100vh;
  background: var(--bg-page);
}

.category-scroll {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg-card);
  white-space: nowrap;
  padding: 24rpx 0;
}

.category-list {
  display: inline-flex;
  padding: 0 16rpx;
  gap: 16rpx;
}

.category-item {
  display: inline-block;
  padding: 16rpx 32rpx;
  background: var(--bg-page);
  border-radius: 40rpx;
  font-size: 28rpx;
  color: var(--text-sub);
  transition: all 0.3s;

  &.active {
    background: var(--primary);
    color: #ffffff;
  }
}

.category-text {
  font-size: 28rpx;
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
}

.loading-text {
  font-size: 28rpx;
  color: var(--text-sub);
}
</style>