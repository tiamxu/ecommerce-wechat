<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  price: number
  size?: 'small' | 'normal' | 'large'
}>(), {
  size: 'normal'
})

const priceDisplay = computed(() => {
  const p = props.price || 0
  if (!p || isNaN(p)) {
    return { integer: '0', decimal: '00' }
  }
  const parts = p.toFixed(2).split('.')
  return {
    integer: parts[0],
    decimal: parts[1]
  }
})
</script>

<template>
  <view :class="['price-text', size]">
    <text class="price-symbol">¥</text>
    <text class="price-integer">{{ priceDisplay.integer }}</text>
    <text class="price-decimal">.{{ priceDisplay.decimal }}</text>
  </view>
</template>

<style scoped lang="scss">
.price-text {
  display: inline-flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 24rpx;
  font-weight: 600;
  color: var(--accent);
}

.price-integer {
  font-weight: 700;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.price-decimal {
  font-weight: 600;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

/* 小号 */
.small {
  .price-symbol {
    font-size: 20rpx;
  }
  .price-integer {
    font-size: 24rpx;
  }
  .price-decimal {
    font-size: 20rpx;
  }
}

/* 默认 */
.normal {
  .price-symbol {
    font-size: 24rpx;
  }
  .price-integer {
    font-size: 32rpx;
  }
  .price-decimal {
    font-size: 24rpx;
  }
}

/* 大号 */
.large {
  .price-symbol {
    font-size: 28rpx;
  }
  .price-integer {
    font-size: 40rpx;
  }
  .price-decimal {
    font-size: 28rpx;
  }
}
</style>