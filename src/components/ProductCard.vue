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
  tags?: { name: string }[]
  primaryTag?: { name: string }
}

const props = withDefaults(defineProps<{
  product: Product
  showPrice?: boolean
  showOriginalPrice?: boolean
}>(), {
  showPrice: true,
  showOriginalPrice: true
})

const emit = defineEmits<{
  click: [id: number]
}>()

const productName = computed(() => {
  return props.product.name?.zh || props.product.name?.en || '商品'
})

const coverImage = computed(() => {
  if (props.product.metaImage) return props.product.metaImage
  if (props.product.images && props.product.images.length > 0) {
    const cover = props.product.images.find(img => img.isCover === 1)
    return cover?.url || props.product.images[0].url
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

const salesCount = computed(() => {
  if (props.product.sales) return props.product.sales
  return Math.floor(Math.random() * 500 + 100)
})

function handleClick() {
  emit('click', props.product.id)
}
</script>

<template>
  <view class="product-card" @click="handleClick">
    <view class="card-img">
      <image
        v-if="coverImage"
        :src="coverImage"
        mode="aspectFill"
        class="cover-img"
      />
      <view v-else class="img-placeholder">
        <text class="placeholder-text">{{ productName.charAt(0) || 'P' }}</text>
      </view>
      <view v-if="displayTag" class="card-tag">
        {{ displayTag }}
      </view>
    </view>
    <view class="card-info">
      <text class="product-name">{{ productName }}</text>
      <view class="price-row">
        <text v-if="showPrice" class="product-price">¥{{ product.price }}</text>
        <text v-if="showOriginalPrice && product.price < originalPrice" class="original-price">
          ¥{{ originalPrice }}
        </text>
      </view>
      <view class="info-bottom">
        <text class="sales-count">已售{{ salesCount }}件</text>
        <view v-if="product.stock !== undefined && product.stock < 10" class="stock-tip">
          仅剩{{ product.stock }}件
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.product-card {
  background: var(--bg-card);
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx var(--shadow);
  transition: all 0.3s;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

.card-img {
  position: relative;
  height: 340rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
}

.cover-img {
  width: 100%;
  height: 100%;
}

.img-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-text {
  font-size: 80rpx;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
}

.card-tag {
  position: absolute;
  top: 12rpx;
  left: 12rpx;
  padding: 6rpx 16rpx;
  background: var(--accent);
  color: var(--text-inverse);
  font-size: 22rpx;
  font-weight: 500;
  border-radius: 24rpx;
}

.card-info {
  padding: 20rpx;
}

.product-name {
  display: block;
  font-size: 28rpx;
  color: var(--text-main);
  line-height: 1.4;
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  min-height: 78rpx;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.product-price {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--price);
}

.original-price {
  font-size: 24rpx;
  color: var(--text-placeholder);
  text-decoration: line-through;
}

.info-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sales-count {
  font-size: 22rpx;
  color: var(--text-sub);
}

.stock-tip {
  font-size: 20rpx;
  color: var(--accent);
  font-weight: 500;
}
</style>
