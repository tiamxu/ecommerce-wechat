<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { orderApi, type Address } from '../../api'
import { THEME_CLASS } from '../../theme/config'

const addresses = ref<Address[]>([])
const loading = ref(false)
const selectedId = ref<number | null>(null)

onMounted(() => {
  loadAddresses()
})

async function loadAddresses() {
  loading.value = true
  try {
    const res = await orderApi.getAddresses()
    if (res.code === 200 && res.data) {
      addresses.value = res.data
      const selected = res.data.find((a: Address) => a.isDefault)
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
    await orderApi.updateAddress(id, { isDefault: true })
    addresses.value.forEach(a => a.isDefault = a.id === id)
    uni.showToast({ title: '设置成功', icon: 'success' })
  } catch (error) {
    console.error('设置默认地址失败', error)
  }
}
</script>

<template>
  <view :class="['address-list', THEME_CLASS]">
    <view v-if="loading" class="loading-tip">
      <text>加载中...</text>
    </view>
    <view v-else-if="addresses.length === 0" class="empty-tip">
      <text class="empty-text">暂无收货地址</text>
      <text class="add-first" @click="goToAdd">添加地址</text>
    </view>

    <view v-else class="address-cards">
      <view v-for="addr in addresses" :key="addr.id" class="address-card">
        <view class="card-main" @click="selectAddress(addr.id)">
          <view class="address-info">
            <view class="info-header">
              <text class="name">{{ addr.name }}</text>
              <text class="phone">{{ addr.phone }}</text>
              <view v-if="addr.isDefault" class="default-tag">默认</view>
            </view>
            <text class="address-detail">{{ addr.province }} {{ addr.city }} {{ addr.district }} {{ addr.detail }}</text>
          </view>
        </view>

        <view class="card-actions">
          <view class="action-item" @click="goToEdit(addr.id)">
            <text>编辑</text>
          </view>
          <view v-if="!addr.isDefault" class="action-item" @click="setDefault(addr.id)">
            <text>设为默认</text>
          </view>
          <view class="action-item delete" @click="deleteAddress(addr.id)">
            <text>删除</text>
          </view>
        </view>
      </view>
    </view>

    <view class="add-btn-wrap">
      <text class="add-btn" @click="goToAdd">+ 添加新地址</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.address-list {
  min-height: 100vh;
  background: var(--bg-page);
  padding: 24rpx;
}

.loading-tip {
  padding: 120rpx 0;
  text-align: center;
  color: var(--text-sub);
}

.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: var(--text-sub);
  margin-bottom: 32rpx;
}

.add-first {
  padding: 20rpx 48rpx;
  background: var(--primary);
  color: var(--text-inverse);
  border-radius: 40rpx;
  font-size: 28rpx;
}

.address-cards {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.address-card {
  background: var(--bg-card);
  border-radius: 16rpx;
  overflow: hidden;
}

.card-main {
  padding: 32rpx;
}

.address-info {
  flex: 1;
}

.info-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.name {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main);
  margin-right: 16rpx;
}

.phone {
  font-size: 28rpx;
  color: var(--text-sub);
}

.default-tag {
  margin-left: 16rpx;
  padding: 4rpx 16rpx;
  background: var(--primary);
  color: var(--text-inverse);
  font-size: 20rpx;
  border-radius: 20rpx;
}

.address-detail {
  font-size: 28rpx;
  color: var(--text-sub);
  line-height: 1.6;
}

.card-actions {
  display: flex;
  border-top: 1rpx solid var(--border);
}

.action-item {
  flex: 1;
  padding: 24rpx;
  text-align: center;
  font-size: 28rpx;
  color: var(--text-main);

  &:active {
    background: var(--bg-page);
  }

  &.delete {
    color: var(--accent);
  }

  &:not(:last-child) {
    border-right: 1rpx solid var(--border);
  }
}

.add-btn-wrap {
  margin-top: 32rpx;
}

.add-btn {
  display: block;
  width: 100%;
  padding: 28rpx;
  background: var(--bg-card);
  color: var(--primary);
  text-align: center;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: 600;

  &:active {
    opacity: 0.8;
  }
}
</style>