<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { favoriteApi, type FavoriteItem } from '../../api'
import { useUserStore } from '../../store/user'
import { useCartStore } from '../../store/cart'
import TabBar from '../../components/TabBar.vue'
import PriceText from '../../components/PriceText.vue'
import { THEME_CLASS } from '../../theme/config'

const userStore = useUserStore()
const cartStore = useCartStore()
const favorites = ref<FavoriteItem[]>([])
const loading = ref(false)

// 滑动状态
const swipeState = ref<Record<number, 'left' | ''>>({})

onMounted(() => {
  if (userStore.isLoggedIn) {
    loadFavorites()
  }
})

async function loadFavorites() {
  if (loading.value) return
  loading.value = true
  try {
    const res = await favoriteApi.list()
    if (res.code === 200 && res.data) {
      favorites.value = res.data.items || []
    }
  } catch (error) {
    console.error('加载收藏失败', error)
  } finally {
    loading.value = false
  }
}

// 下拉刷新
onPullDownRefresh(() => {
  loadFavorites().finally(() => {
    uni.stopPullDownRefresh()
  })
})

function goToDetail(productId: number) {
  uni.navigateTo({
    url: `/pages/product/detail?id=${productId}`
  })
}

function getCoverImage(item: FavoriteItem): string {
  if (item.coverImage) return item.coverImage
  if (item.images && item.images.length > 0) {
    const cover = item.images.find(img => img.isCover === 1)
    if (cover) {
      return cover.urlLarge || cover.urlMedium || cover.url
    }
    return item.images[0].urlLarge || item.images[0].urlMedium || item.images[0].url
  }
  return ''
}

// 滑动删除
let startX = 0
let movingX = 0

function onTouchStart(e: TouchEvent, favoriteId: number) {
  startX = e.touches[0].clientX
  movingX = 0
}

function onTouchMove(e: TouchEvent, favoriteId: number) {
  const currentX = e.touches[0].clientX
  movingX = currentX - startX
  if (Math.abs(movingX) > 10) {
    e.preventDefault()
  }
  if (movingX < -30) {
    swipeState.value[favoriteId] = 'left'
  } else {
    swipeState.value[favoriteId] = ''
  }
}

function onTouchEnd(favoriteId: number) {
  if (swipeState.value[favoriteId] !== 'left') {
    swipeState.value[favoriteId] = ''
  }
}

function closeSwipe(favoriteId: number) {
  swipeState.value[favoriteId] = ''
}

// 移入购物车
async function moveToCart(item: FavoriteItem) {
  try {
    await cartStore.addItem(item.productId, 1)
    uni.showToast({ title: '已加入购物车', icon: 'success' })
  } catch (error) {
    console.error('移入购物车失败', error)
    uni.showToast({ title: '移入失败', icon: 'none' })
  }
}

// 去购买 - 跳转到商品详情
function goBuy(item: FavoriteItem) {
  closeSwipe(item.id)
  goToDetail(item.productId)
}

// 删除
async function removeFavorite(item: FavoriteItem) {
  try {
    await favoriteApi.remove(item.id)
    favorites.value = favorites.value.filter(f => f.id !== item.id)
    closeSwipe(item.id)
    uni.showToast({ title: '已取消收藏', icon: 'success' })
  } catch (error) {
    console.error('取消收藏失败', error)
    uni.showToast({ title: '取消失败', icon: 'none' })
  }
}

function goToShop() {
  uni.switchTab({ url: '/pages/product/list' })
}
</script>

<template>
  <view :class="['favorite-page', THEME_CLASS]">
    <TabBar />
    <!-- 空状态 -->
    <view v-if="!loading && favorites.length === 0" class="empty-favorite">
      <uni-icons type="star" size="64" color="var(--text-placeholder)" />
      <text class="empty-text">暂无收藏</text>
      <text class="empty-desc">快去收藏心仪的商品吧</text>
      <text class="empty-btn" @click="goToShop">去逛逛</text>
    </view>

    <!-- 收藏列表 -->
    <view v-else class="favorite-content">
      <view class="favorite-list">
        <view
          v-for="item in favorites"
          :key="item.id"
          class="favorite-item-wrapper"
        >
          <!-- 删除按钮（滑动后显示） -->
          <view class="delete-action" @click="removeFavorite(item)">
            <text class="delete-text">删除</text>
          </view>

          <!-- 商品内容 -->
          <view
            class="favorite-item"
            :class="{ swiped: swipeState[item.id] === 'left' }"
            @touchstart="onTouchStart($event, item.id)"
            @touchmove="onTouchMove($event, item.id)"
            @touchend="onTouchEnd(item.id)"
            @click="closeSwipe(item.id)"
          >
            <!-- 商品图片 -->
            <view class="item-img" @click="goToDetail(item.productId)">
              <image
                v-if="getCoverImage(item)"
                :src="getCoverImage(item)"
                mode="aspectFill"
                class="cover-img"
              />
              <text v-else class="placeholder-text">{{ (item.productName || 'P').charAt(0) }}</text>
            </view>

            <!-- 商品信息 -->
            <view class="item-info" @click="goToDetail(item.productId)">
              <text class="item-name">{{ item.productName }}</text>
              <view class="item-bottom">
                <PriceText :price="item.productPrice || 0" size="small" />
                <text v-if="item.stock <= 10 && item.stock > 0" class="item-stock">仅剩{{ item.stock }}件</text>
              </view>
              <!-- 操作按钮 -->
              <view class="item-actions">
                <text class="action-btn add-cart" @click="moveToCart(item)">加购</text>
                <text class="action-btn buy" @click="goBuy(item)">去购买</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.favorite-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.empty-favorite {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
}

.empty-text {
  font-size: 30rpx;
  color: var(--text-main);
  margin-top: 24rpx;
  margin-bottom: 8rpx;
  font-weight: 500;
}

.empty-desc {
  font-size: 26rpx;
  color: var(--text-sub);
  margin-bottom: 32rpx;
}

.empty-btn {
  padding: 18rpx 44rpx;
  background: var(--primary);
  color: var(--text-inverse);
  border-radius: 40rpx;
  font-size: 26rpx;
}

.favorite-content {
  padding: 24rpx;
}

.favorite-list {
  background: var(--bg-card);
  border-radius: 16rpx;
  overflow: hidden;
}

.favorite-item-wrapper {
  position: relative;
  overflow: hidden;
}

.delete-action {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 140rpx;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.delete-text {
  color: var(--text-inverse);
  font-size: 28rpx;
  font-weight: 500;
}

.favorite-item {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: var(--bg-card);
  border-bottom: 1rpx solid var(--border);
  transition: transform 0.2s ease;
  position: relative;
  z-index: 2;

  &.swiped {
    transform: translateX(-140rpx);
  }

  &:last-child {
    border-bottom: none;
  }
}

.item-img {
  width: 140rpx;
  height: 140rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  flex-shrink: 0;
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
}

.placeholder-text {
  font-size: 48rpx;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.6);
}

.item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 140rpx;
}

.item-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.item-stock {
  font-size: 22rpx;
  color: var(--accent);
}

.item-actions {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  gap: 12rpx;
}

.action-btn {
  padding: 12rpx 24rpx;
  border-radius: 24rpx;
  font-size: 24rpx;
  font-weight: 500;
  text-align: center;

  &.add-cart {
    background: var(--primary-light);
    color: var(--primary);
  }

  &.buy {
    background: var(--primary);
    color: var(--text-inverse);
  }

  &:active {
    opacity: 0.8;
  }
}
</style>