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
  gap: 12rpx;
  margin-top: 12rpx;
}

.product-price {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.original-price {
  font-size: 24rpx;
  color: var(--text-placeholder);
  text-decoration: line-through;
}
</style>
