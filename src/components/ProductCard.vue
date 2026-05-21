<script setup lang="ts">
import { ref, computed } from 'vue'
import PriceText from './PriceText.vue'

interface Product {
  id: number
  price: number
  originalPrice?: number
  stock?: number
  sales?: number
  metaImage?: string
  name?: { zh?: string; en?: string }
  images?: { url: string; isCover?: number }[]
  tags?: { name: string }[]
  primaryTag?: { name: string }
}

const props = withDefaults(defineProps<{
  product: Product
  showPrice?: boolean
  showOriginalPrice?: boolean
  showCartBtn?: boolean
}>(), {
  showPrice: true,
  showOriginalPrice: true,
  showCartBtn: false
})

const emit = defineEmits<{
  click: [id: number]
  addCart: [product: Product]
}>()

const addingToCart = ref(false)

const productName = computed(() => {
  return props.product.name?.zh || props.product.name?.en || '商品'
})

const coverImage = computed(() => {
  if (props.product.images && props.product.images.length > 0) {
    const first = props.product.images[0]
    return typeof first === 'string' ? first : (first.urlMedium || first.url || '')
  }
  return ''
})

const displayTag = computed(() => {
  if (props.product.primaryTag) return props.product.primaryTag.name
  if (props.product.tags && props.product.tags.length > 0) return props.product.tags[0].name
  return ''
})

const originalPrice = computed(() => {
  if (props.product.originalPrice) return props.product.originalPrice
  return Math.round(props.product.price * 1.3)
})

const priceDisplay = computed(() => {
  const price = props.product.price
  const parts = price.toFixed(2).split('.')
  return {
    integer: parts[0],
    decimal: parts[1]
  }
})

function handleClick() {
  emit('click', props.product.id)
}

function handleAddCart(e: any) {
  e.stopPropagation()

  // 添加视觉反馈
  addingToCart.value = true
  setTimeout(() => {
    addingToCart.value = false
  }, 800)

  emit('addCart', props.product)

  // 显示 toast
  uni.showToast({
    title: '已加入购物车',
    icon: 'success',
    duration: 1200
  })
}
</script>

<template>
  <view class="product-card" @click="handleClick">
    <view class="card-img" :clickable="false">
      <image
        v-if="coverImage"
        :src="coverImage"
        mode="aspectFill"
        class="cover-img"
        :clickable="false"
      />
      <view v-else class="img-placeholder" :clickable="false">
        <text class="placeholder-text">{{ productName.charAt(0) || 'P' }}</text>
      </view>
      <view v-if="displayTag" class="card-tag" :clickable="false">
        {{ displayTag }}
      </view>
      <view
        v-if="showCartBtn"
        class="card-cart-btn"
        :class="{ adding: addingToCart }"
        :catch:tap="true"
        @tap="handleAddCart"
      >
        <uni-icons type="cart" size="16" color="var(--text-inverse)" />
      </view>
    </view>
    <view class="card-info" :clickable="false">
      <text class="product-name">{{ productName }}</text>
      <PriceText :price="props.product.price || 0" />
    </view>
  </view>
</template>

<style scoped lang="scss">
.product-card {
  display: flex;
  flex-direction: column;
  background: var(--bg-page);
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx var(--shadow);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2rpx 8rpx var(--shadow);
  }
}

.card-img {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  background: var(--bg-card);
  overflow: hidden;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--bg-card) 0%, var(--border) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  font-size: 48rpx;
  font-weight: 600;
  color: var(--text-placeholder);
}

.card-tag {
  position: absolute;
  top: 12rpx;
  left: 12rpx;
  padding: 4rpx 12rpx;
  background: var(--accent);
  color: #fff;
  font-size: 20rpx;
  border-radius: 4rpx;
}

.card-cart-btn {
  position: absolute;
  bottom: 12rpx;
  right: 12rpx;
  width: 56rpx;
  height: 56rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx var(--primary-light);
  transition: transform 0.15s ease, opacity 0.15s ease;

  &:active {
    transform: scale(0.9);
  }

  &.adding {
    animation: cartPulse 0.6s ease-out forwards;
  }
}

@keyframes cartPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
    background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
  }
  100% {
    transform: scale(1);
  }
}

.card-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100rpx;
  padding: 16rpx;
}

.product-name {
  display: block;
  font-size: 28rpx;
  color: var(--text-main);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 78rpx;
}
</style>
