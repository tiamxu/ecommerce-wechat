<script setup lang="ts">
import { computed } from 'vue'

interface Product {
  id: number
  price: number
  originalPrice?: number
  stock?: number
  sales?: number
  metaImage?: string
  name?: { zh?: string; en?: string }
  images?: { url: string; isCover?: number }[]
  coverImages?: string[]
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

const productName = computed(() => {
  return props.product.name?.zh || props.product.name?.en || '商品'
})

const coverImage = computed(() => {
  if (props.product.coverImages && props.product.coverImages.length > 0) {
    return props.product.coverImages[0]
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
  emit('addCart', props.product)
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
        :catch:tap="true"
        @tap="handleAddCart"
      >
        <uni-icons type="cart" size="16" color="var(--text-inverse)" />
      </view>
    </view>
    <view class="card-info" :clickable="false">
      <text class="product-name">{{ productName }}</text>
      <view class="price-row">
        <text class="price-symbol">¥</text>
        <text class="price-integer">{{ priceDisplay.integer }}</text>
        <text class="price-decimal">.{{ priceDisplay.decimal }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.product-card {
  display: flex;
  flex-direction: column;
  background: var(--bg-page);
}

.card-img {
  position: relative;
  width: 100%;
  height: 340rpx;
  background: var(--bg-card);
}

.cover-img {
  width: 100%;
  height: 100%;
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
  width: 48rpx;
  height: 48rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx var(--primary-light);
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.9);
  }
}

.card-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 120rpx;
  padding: 16rpx 0;
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
}

.price-row {
  display: flex;
  align-items: baseline;
  margin-top: 12rpx;
}

.price-symbol {
  font-size: 24rpx;
  font-weight: 600;
  color: var(--accent);
}

.price-integer {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.price-decimal {
  font-size: 24rpx;
  font-weight: 600;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}
</style>
