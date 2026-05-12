<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { orderApi, type Address } from '../../api'
import { THEME_CLASS } from '../../theme/config'

const addresses = ref<Address[]>([])
const loading = ref(false)
const selectedId = ref<number | null>(null)

onMounted(() => {
  loadAddresses()
})

// 每次页面显示时刷新地址列表（从编辑页返回时需要更新）
onShow(() => {
  loadAddresses()
})

async function loadAddresses() {
  loading.value = true
  try {
    const res = await orderApi.getAddresses()
    if (res.code === 200 && res.data) {
      addresses.value = res.data
      const selected = res.data.find((a: Address) => a.isDefault === 1)
      if (selected) {
        selectedId.value = selected.id
      }
    }
  } catch (error) {
    console.error('加载地址失败', error)
  } finally {
    loading.value = false
  }
}

function selectAddress(id: number) {
  selectedId.value = id
  // 通过页面栈传回 selectedId
  const pages = getCurrentPages()
  const prevPage = pages[pages.length - 2]
  if (prevPage && prevPage.selectAddress) {
    prevPage.selectAddress(id)
  }
  uni.navigateBack()
}

function goToAdd() {
  uni.navigateTo({ url: '/pages/address/edit' })
}

function goToEdit(id: number) {
  uni.navigateTo({ url: `/pages/address/edit?id=${id}` })
}

async function deleteAddress(id: number) {
  const res = await uni.showModal({
    title: '确认删除',
    content: '确定要删除该地址吗？',
    showCancel: true
  })

  if (res.confirm) {
    try {
      await orderApi.deleteAddress(id)
      addresses.value = addresses.value.filter(a => a.id !== id)
      uni.showToast({ title: '已删除', icon: 'success' })
    } catch (error) {
      console.error('删除地址失败', error)
    }
  }
}

async function setDefault(id: number) {
  try {
    await orderApi.updateAddress(id, { isDefault: 1 } as any)
    addresses.value.forEach(a => a.isDefault = a.id === id ? 1 : 0)
    uni.showToast({ title: '设置成功', icon: 'success' })
  } catch (error) {
    console.error('设置默认地址失败', error)
  }
}
</script>

<template>
  <view :class="['address-list', THEME_CLASS]">
    <view v-if="loading" class="loading-section">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else-if="addresses.length === 0" class="empty-section">
      <view class="empty-icon">
        <uni-icons type="location" size="40" color="var(--text-placeholder)" />
      </view>
      <text class="empty-title">暂无收货地址</text>
      <text class="empty-desc">添加收货地址以便快速下单</text>
      <view class="empty-btn" @click="goToAdd">
        <text>添加地址</text>
      </view>
    </view>

    <view v-else class="address-cards">
      <view v-for="addr in addresses" :key="addr.id" class="address-card">
        <view class="card-left" @click="selectAddress(addr.id)">
          <view class="address-main">
            <view class="address-header">
              <text class="receiver-name">{{ addr.receiverName }}</text>
              <text class="phone">{{ addr.phone }}</text>
            </view>
            <text class="address-text">
              <text v-if="addr.province" class="region-tag">{{ addr.province }}</text>
              {{ addr.city }} {{ addr.address }}
            </text>
          </view>
          <view class="edit-icon" @click.stop="goToEdit(addr.id)">
            <uni-icons type="compose" size="18" color="var(--text-sub)" />
          </view>
        </view>

        <view class="card-bottom">
          <view v-if="addr.isDefault === 1" class="default-badge">
            <text>默认</text>
          </view>
          <view v-else class="set-default" @click="setDefault(addr.id)">
            <text>设为默认</text>
          </view>
          <view class="delete-btn" @click="deleteAddress(addr.id)">
            <uni-icons type="trash" size="16" color="var(--accent)" />
            <text>删除</text>
          </view>
        </view>
      </view>
    </view>

    <view class="add-btn-wrap">
      <view class="add-btn" @click="goToAdd">
        <uni-icons type="plus" size="20" color="var(--primary)" />
        <text>添加新地址</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.address-list {
  min-height: 100vh;
  background: var(--bg-page);
  padding: 24rpx;
  padding-bottom: calc(180rpx + env(safe-area-inset-bottom));
}

.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 0;
  gap: 24rpx;
}

.loading-spinner {
  width: 64rpx;
  height: 64rpx;
  border: 4rpx solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 28rpx;
  color: var(--text-sub);
}

.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 0 80rpx;
}

.empty-icon {
  width: 160rpx;
  height: 160rpx;
  background: var(--bg-card);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 12rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: var(--text-sub);
  margin-bottom: 48rpx;
}

.empty-btn {
  padding: 20rpx 64rpx;
  background: var(--primary);
  color: var(--text-inverse);
  border-radius: 44rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.address-cards {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.address-card {
  background: var(--bg-card);
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.card-left {
  display: flex;
  padding: 32rpx;
  align-items: flex-start;
}

.address-main {
  flex: 1;
}

.address-header {
  display: flex;
  align-items: baseline;
  gap: 16rpx;
  margin-bottom: 12rpx;
}

.receiver-name {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main);
}

.phone {
  font-size: 26rpx;
  color: var(--text-sub);
}

.address-text {
  font-size: 26rpx;
  color: var(--text-sub);
  line-height: 1.6;
}

.region-tag {
  background: var(--primary-light);
  color: var(--primary);
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
  font-size: 22rpx;
  margin-right: 8rpx;
}

.edit-icon {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -8rpx -8rpx 0 0;
}

.card-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  background: var(--bg-page);
  border-top: 1rpx solid var(--border);
}

.default-badge {
  padding: 8rpx 20rpx;
  background: var(--primary);
  color: var(--text-inverse);
  font-size: 22rpx;
  border-radius: 20rpx;
}

.set-default {
  font-size: 26rpx;
  color: var(--primary);
  padding: 8rpx 0;
}

.delete-btn {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
  color: var(--accent);
  padding: 8rpx 0;
}

.add-btn-wrap {
  position: fixed;
  bottom: calc(120rpx + env(safe-area-inset-bottom));
  left: 24rpx;
  right: 24rpx;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 28rpx;
  background: var(--bg-card);
  border: 2rpx dashed var(--primary);
  border-radius: 20rpx;
  font-size: 30rpx;
  font-weight: 600;
  color: var(--primary);
}
</style>