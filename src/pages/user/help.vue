<script setup lang="ts">
import { ref } from 'vue'
import { THEME_CLASS } from '../../theme/config'

const helpList = ref([
  {
    id: 1,
    question: '如何修改收货地址？',
    answer: '进入"个人中心" → "收货地址"，可以添加、编辑或删除收货地址。',
    expanded: false
  },
  {
    id: 2,
    question: '如何取消订单？',
    answer: '进入"我的订单" → 点击待付款订单 → "取消订单"。注意：已支付的订单无法直接取消，需联系客服处理。',
    expanded: false
  },
  {
    id: 3,
    question: '订单如何申请退款？',
    answer: '进入"订单详情" → "申请退款"，填写退款原因后提交。退款将在1-7个工作日内原路返回。',
    expanded: false
  },
  {
    id: 4,
    question: '支付方式有哪些？',
    answer: '目前支持微信支付、支付宝支付。更多支付方式陆续开放中。',
    expanded: false
  },
  {
    id: 5,
    question: '如何联系客服？',
    answer: '您可以通过以下方式联系我们：1. 在"关于我们"页面点击"联系客服"；2. 拨打客服热线：400-888-8888',
    expanded: false
  },
  {
    id: 6,
    question: '发货时间是多长？',
    answer: '一般情况下，订单支付后48小时内发货。偏远地区或节假日期间可能需要3-5个工作日。',
    expanded: false
  },
  {
    id: 7,
    question: '如何查看物流信息？',
    answer: '进入"我的订单" → 点击"查看物流"，可实时跟踪您的包裹配送进度。',
    expanded: false
  },
  {
    id: 8,
    question: '会员有什么权益？',
    answer: '注册用户可享受：1. 购物积分；2. 会员专享价；3. 优先发货；4. 专属客服。更多权益陆续推出。',
    expanded: false
  }
])

function toggleItem(id: number) {
  const item = helpList.value.find(h => h.id === id)
  if (item) {
    item.expanded = !item.expanded
  }
}

function callService() {
  uni.makePhoneCall({
    phoneNumber: '400-888-8888',
    fail: () => {
      uni.showToast({ title: '拨打功能暂不可用', icon: 'none' })
    }
  })
}
</script>

<template>
  <view :class="['help-page', THEME_CLASS]">
    <!-- 常见问题 -->
    <view class="help-section">
      <view class="section-header">
        <text class="section-title">常见问题</text>
      </view>
      <view class="help-list">
        <view
          v-for="item in helpList"
          :key="item.id"
          class="help-item"
        >
          <view class="help-question" @click="toggleItem(item.id)">
            <text class="question-text">{{ item.question }}</text>
            <uni-icons
              :type="item.expanded ? 'up' : 'down'"
              size="16"
              color="var(--text-placeholder)"
            />
          </view>
          <view v-if="item.expanded" class="help-answer">
            <text>{{ item.answer }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 联系客服 -->
    <view class="service-section">
      <view class="service-card">
        <view class="service-info">
          <text class="service-title">遇到问题未解决？</text>
          <text class="service-desc">联系客服获取更多帮助</text>
        </view>
        <view class="service-btn" @click="callService">
          <uni-icons type="phone" size="18" color="var(--text-inverse)" />
          <text>拨打电话</text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.help-page {
  min-height: 100vh;
  background: var(--bg-page);
  padding: 32rpx;
  padding-bottom: calc(200rpx + env(safe-area-inset-bottom));
}

.help-section {
  margin-bottom: 40rpx;
}

.section-header {
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main);
}

.help-list {
  background: var(--bg-card);
  border-radius: 16rpx;
  overflow: hidden;
}

.help-item {
  border-bottom: 1rpx solid var(--border);

  &:last-child {
    border-bottom: none;
  }
}

.help-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
}

.question-text {
  flex: 1;
  font-size: 28rpx;
  color: var(--text-main);
  padding-right: 16rpx;
}

.help-answer {
  padding: 0 32rpx 32rpx;
  font-size: 26rpx;
  color: var(--text-sub);
  line-height: 1.8;
  background: var(--bg-page);
}

.service-section {
  position: fixed;
  bottom: calc(120rpx + env(safe-area-inset-bottom));
  left: 32rpx;
  right: 32rpx;
}

.service-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  background: var(--bg-card);
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.service-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.service-title {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-main);
}

.service-desc {
  font-size: 24rpx;
  color: var(--text-sub);
}

.service-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 20rpx 32rpx;
  background: var(--primary);
  color: var(--text-inverse);
  border-radius: 40rpx;
  font-size: 26rpx;
  font-weight: 500;

  &:active {
    opacity: 0.9;
  }
}
</style>
