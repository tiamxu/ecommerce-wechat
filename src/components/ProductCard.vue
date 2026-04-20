<script setup lang="ts">
import { ref } from 'vue'

interface Product {
  id: number
  name: string
  nameEn?: string
  price: number
  coverImage?: string
  tags?: string[]
}

const props = withDefaults(defineProps<{
  product: Product
  showPrice?: boolean
}>(), {
  showPrice: true
})

const emit = defineEmits<{
  click: [id: number]
}>()

const currentImage = ref(0)

function handleClick() {
  emit('click', props.product.id)
}
</script>

<template>
  <view class="product-card" @click="handleClick">
    <view class="card-img">
      <image
        v-if="product.coverImage"
        :src="product.coverImage"
        mode="aspectFill"
        class="cover-img"
      />
      <view v-else class="img-placeholder">
        <text class="placeholder-text">{{ product.name?.charAt(0) || 'P' }}</text>
      </view>
      <view v-if="product.tags?.length" class="card-tags">
        <text v-for="tag in product.tags" :key="tag" class="tag">{{ tag }}</text>
      </view>
    </view>
    <view class="card-info">
      <text class="product-name">{{ product.name }}</text>
      <text v-if="showPrice" class="product-price">¥{{ product.price }}</text>
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
  height: 320rpx;
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

.card-tags {
  position: absolute;
  top: 16rpx;
  left: 16rpx;
  display: flex;
  gap: 8rpx;
}

.tag {
  padding: 4rpx 12rpx;
  background: var(--accent);
  color: #ffffff;
  font-size: 20rpx;
  border-radius: 20rpx;
}

.card-info {
  padding: 20rpx;
}

.product-name {
  display: block;
  font-size: 28rpx;
  color: var(--text-main);
  margin-bottom: 12rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
  color: var(--price);
}
</style>
