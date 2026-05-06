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
  height: 500rpx;
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
  flex-shrink: 0;
  width: 100%;
  height: 340rpx;
  background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
}

.cover-img {
  width: 100%;
  height: 100%;
  transition: opacity 0.3s;
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
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16rpx;
  min-height: 0;
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
  height: 72rpx;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  margin-top: auto;
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
</style>
