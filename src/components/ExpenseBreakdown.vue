<script setup lang="ts">
import { computed } from 'vue'

interface Expense {
  category: string
  amount: number
  detail: string
}

const props = defineProps<{
  expenses: Expense[]
  totalCost: number
  personCount?: number
}>()

const total = computed(() => {
  if (props.personCount && props.personCount > 1) {
    return props.totalCost * props.personCount
  }
  return props.totalCost
})

const categoryIcons: Record<string, string> = {
  '交通': '🚄',
  '住宿': '🏨',
  '餐饮': '🍜',
  '门票': '🎫',
  '其他': '📦'
}

function getIcon(category: string) {
  return categoryIcons[category] || '📦'
}
</script>

<template>
  <view class="expense-breakdown">
    <view class="section-header">
      <text class="section-title">费用明细</text>
    </view>

    <view class="expense-list">
      <view v-for="expense in expenses" :key="expense.category" class="expense-item">
        <view class="expense-left">
          <text class="expense-icon">{{ getIcon(expense.category) }}</text>
          <text class="expense-category">{{ expense.category }}</text>
        </view>
        <view class="expense-right">
          <text class="expense-amount">¥{{ expense.amount }}</text>
        </view>
      </view>
    </view>

    <view class="expense-total">
      <text class="total-label">合计</text>
      <text class="total-amount">¥{{ total }}</text>
      <text v-if="personCount && personCount > 1" class="person-note">（{{ personCount }}人）</text>
    </view>

    <view class="expense-tips">
      <text class="tips-text">💡 以上费用为预估，实际以当地为准</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.expense-breakdown {
  background: var(--bg-card);
  border-radius: 20rpx;
  padding: 28rpx;
  margin-top: 20rpx;
}

.section-header {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-main);
}

.expense-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.expense-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid var(--border);

  &:last-child {
    border-bottom: none;
  }
}

.expense-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.expense-icon {
  font-size: 28rpx;
}

.expense-category {
  font-size: 26rpx;
  color: var(--text-main);
}

.expense-amount {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-main);
}

.expense-total {
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 8rpx;
  padding-top: 20rpx;
  border-top: 2rpx solid var(--border);
}

.total-label {
  font-size: 26rpx;
  color: var(--text-sub);
}

.total-amount {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--price);
}

.person-note {
  font-size: 22rpx;
  color: var(--text-sub);
}

.expense-tips {
  margin-top: 16rpx;
  padding: 12rpx 16rpx;
  background: #fef3c7;
  border-radius: 12rpx;
}

.tips-text {
  font-size: 22rpx;
  color: #92400e;
}
</style>
