<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { orderApi, type Address } from '../../api'
import { THEME_CLASS } from '../../theme/config'

const form = ref({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
})

const isEdit = ref(false)
const addressId = ref<number | null>(null)
const loading = ref(false)

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const id = currentPage?.options?.id

  if (id) {
    isEdit.value = true
    addressId.value = Number(id)
    loadAddressDetail(addressId.value)
  }
})

async function loadAddressDetail(id: number) {
  try {
    const res = await orderApi.getAddresses()
    if (res.code === 200 && res.data) {
      const addr = res.data.find((a: Address) => a.id === id)
      if (addr) {
        form.value = {
          name: addr.name,
          phone: addr.phone,
          province: addr.province,
          city: addr.city,
          district: addr.district,
          detail: addr.detail,
          isDefault: addr.isDefault
        }
      }
    }
  } catch (error) {
    console.error('加载地址详情失败', error)
  }
}

async function saveAddress() {
  if (!form.value.name) {
    uni.showToast({ title: '请输入收货人姓名', icon: 'none' })
    return
  }
  if (!form.value.phone) {
    uni.showToast({ title: '请输入手机号码', icon: 'none' })
    return
  }
  if (!form.value.province || !form.value.city || !form.value.district || !form.value.detail) {
    uni.showToast({ title: '请输入完整地址', icon: 'none' })
    return
  }

  loading.value = true
  try {
    if (isEdit.value && addressId.value) {
      await orderApi.updateAddress(addressId.value, form.value)
    } else {
      await orderApi.addAddress(form.value)
    }
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    console.error('保存地址失败', error)
    uni.showToast({ title: '保存失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <view :class="['address-edit', THEME_CLASS]">
    <view class="form-section">
      <view class="form-item">
        <text class="form-label">收货人</text>
        <input v-model="form.name" class="form-input" placeholder="请输入收货人姓名" />
      </view>

      <view class="form-item">
        <text class="form-label">手机号码</text>
        <input v-model="form.phone" class="form-input" type="number" placeholder="请输入手机号码" maxlength="11" />
      </view>

      <view class="form-item">
        <text class="form-label">所在地区</text>
        <input v-model="form.province" class="form-input" placeholder="省" />
        <input v-model="form.city" class="form-input" placeholder="市" />
        <input v-model="form.district" class="form-input" placeholder="区/县" />
      </view>

      <view class="form-item">
        <text class="form-label">详细地址</text>
        <input v-model="form.detail" class="form-input" placeholder="街道、楼栋、门牌号" />
      </view>

      <view class="form-item switch-item">
        <text class="form-label">设为默认地址</text>
        <switch
          :checked="form.isDefault"
          @change="(e: any) => form.isDefault = e.detail.value"
          color="#07c160"
        />
      </view>
    </view>

    <view class="save-btn-wrap">
      <text class="save-btn" @click="saveAddress">保存</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.address-edit {
  min-height: 100vh;
  background: var(--bg-page);
}

.form-section {
  background: var(--bg-card);
  margin-bottom: 24rpx;
}

.form-item {
  padding: 32rpx;
  border-bottom: 1rpx solid var(--border);

  &:last-child {
    border-bottom: none;
  }
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: var(--text-main);
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  height: 80rpx;
  padding: 0 24rpx;
  background: var(--bg-page);
  border-radius: 12rpx;
  font-size: 28rpx;
  color: var(--text-main);

  &::placeholder {
    color: var(--text-placeholder);
  }
}

.switch-item {
  display: flex;
  justify-content: space-between;
  align-items: center;

  .form-label {
    margin-bottom: 0;
  }
}

.save-btn-wrap {
  padding: 32rpx;
}

.save-btn {
  display: block;
  width: 100%;
  padding: 28rpx;
  background: var(--primary);
  color: var(--text-inverse);
  text-align: center;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 600;

  &:active {
    opacity: 0.9;
  }
}
</style>