<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { productApi, type Product } from '../../api'
import { useSearchStore } from '../../store/search'
import { useCartStore } from '../../store/cart'
import { useUserStore } from '../../store/user'
import ProductCard from '../../components/ProductCard.vue'
import SearchBar from '../../components/SearchBar.vue'
import TabBar from '../../components/TabBar.vue'
import { THEME_CLASS } from '../../theme/config'
import { getCategoryEmoji, getCategoryBgColor } from '../../config/categoryEmoji'

const searchStore = useSearchStore()
const cartStore = useCartStore()
const userStore = useUserStore()

const products = ref<Product[]>([])
const categories = ref<any[]>([])
const selectedCategoryId = ref<number | null>(null)
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
    const params: any = { pageNo: 1, pageSize: 50 }
    if (selectedCategoryId.value) {
      params.categoryId = selectedCategoryId.value
    }
    const [productRes, categoryRes] = await Promise.all([
      productApi.getList(params),
      productApi.getCategories()
    ])

    if (productRes.code === 200) {
      products.value = productRes.data.pageData || []
    }
    if (categoryRes.code === 200 && categoryRes.data) {
      categories.value = categoryRes.data || []
    }
  } catch (error) {
    console.error('加载数据失败', error)
  } finally {
    loading.value = false
    hasLoaded.value = true
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

function scrollToTop() {
  uni.pageScrollTo({ scrollTop: 0, duration: 300 })
}

function selectCategory(categoryId: number | null) {
  selectedCategoryId.value = categoryId
  loadData()
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
      <view class="brand-logo" @click="scrollToTop">E-Shop</view>
      <view class="search-wrap">
        <SearchBar @search="goToSearch" />
      </view>
    </view>

    <!-- 分类入口（金刚位） -->
    <view class="category-grid">
      <view
        class="category-item"
        v-for="(category, index) in categories.slice(0, 8)"
        :key="category.id"
        :class="{ active: selectedCategoryId === category.id }"
        @click="selectCategory(category.id)"
      >
        <view class="category-icon" :style="{ background: getCategoryBgColor(index) }">
          <text class="emoji-text">{{ getCategoryEmoji(category.name) }}</text>
        </view>
        <text class="category-name">{{ category.name?.zh || category.name?.en || '分类' }}</text>
      </view>
      <view
        class="category-item"
        :class="{ active: selectedCategoryId === null }"
        @click="selectCategory(null)"
      >
        <view class="category-icon more">
          <text class="emoji-text">🔥</text>
        </view>
        <text class="category-name">全部</text>
      </view>
    </view>

    <!-- 商品列表 -->
    <view class="product-wrapper">
      <view class="product-grid">
        <ProductCard
          v-for="item in products"
          :key="item.id"
          :product="item"
          @click="goToProductDetail(item.id)"
        />
      </view>
    </view>
    <view v-if="products.length === 0 && !loading" class="empty-tip">
      <text>暂无商品</text>
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
  gap: 16rpx;
  padding: 12rpx 24rpx;
  padding-top: calc(12rpx + env(safe-area-inset-top));
  background: var(--bg-page);
  box-shadow: 0 2rpx 12rpx var(--shadow);
}

.brand-logo {
  width: 140rpx;
  font-size: 36rpx;
  font-weight: 800;
  color: var(--primary);
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: -1rpx;
  text-shadow: 0 2rpx 8rpx var(--primary-light);
  transition: opacity 0.2s ease;

  &:active {
    opacity: 0.6;
  }
}

.search-wrap {
  flex: 1;
}

/* 金刚位分类导航 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16rpx;
  padding: 24rpx 20rpx;
  margin-top: calc(104rpx + env(safe-area-inset-top));
  background: var(--bg-card);
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 20rpx 8rpx;
  border-radius: 16rpx;
  background: var(--bg-page);
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.95);
  }

  &.active {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
    box-shadow: 0 4rpx 16rpx var(--primary-light);
  }

  &.active .category-name {
    color: #fff;
    font-weight: 600;
  }
}

.category-icon {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  border-radius: 16rpx;
  transition: all 0.2s ease;
}

.emoji-text {
  font-size: 40rpx;
  line-height: 1;
}

.category-item.active .emoji-text {
  filter: brightness(0) invert(1);
}

.category-icon.more {
  background: var(--bg-page);
  border: 2rpx dashed var(--border);
}

.category-name {
  font-size: 22rpx;
  color: var(--text-main);
  transition: color 0.2s ease;
}

/* 商品列表 */
.product-wrapper {
  padding: 24rpx 20rpx;
  padding-bottom: calc(24rpx + 120rpx + env(safe-area-inset-bottom));
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
