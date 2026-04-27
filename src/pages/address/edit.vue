<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { orderApi, type Address } from '../../api'
import { THEME_CLASS } from '../../theme/config'
import regionData from '../../static/china_address.json'

// 表单字段
const form = ref({
  receiverName: '',
  phone: '',
  province: '',
  city: '',
  address: '',
  isDefault: false
})

const isEdit = ref(false)
const addressId = ref<number | null>(null)
const loading = ref(false)
const showProvincePicker = ref(false)
const showCityPicker = ref(false)

// 省份列表
const provinces = regionData.map(p => ({ label: p.name, value: p.code }))

// 当前选中的省份对象
const currentProvince = ref<any>(null)

// 城市列表
const cities = ref<Array<{ label: string, value: string }>>([])

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const id = currentPage?.options?.id

  if (id) {
    isEdit.value = true
    addressId.value = Number(id)
    loadAddressDetail(addressId.value)
    uni.setNavigationBarTitle({ title: '编辑地址' })
  } else {
    uni.setNavigationBarTitle({ title: '新增地址' })
  }
})

async function loadAddressDetail(id: number) {
  try {
    const res = await orderApi.getAddresses()
    if (res.code === 200 && res.data) {
      const addr = res.data.find((a: Address) => a.id === id)
      if (addr) {
        form.value = {
          receiverName: addr.receiverName,
          phone: addr.phone,
          province: addr.province,
          city: addr.city,
          address: addr.address,
          isDefault: addr.isDefault === 1
        }
        // 根据省名设置省份对象和城市列表
        const province = regionData.find(p => p.name === addr.province)
        if (province) {
          currentProvince.value = province
          cities.value = province.children.map(c => ({ label: c.name, value: c.code }))
        }
      }
    }
  } catch (error) {
    console.error('加载地址详情失败', error)
  }
}

function updateCities(provinceName: string) {
  const province = regionData.find(p => p.name === provinceName)
  if (province) {
    currentProvince.value = province
    cities.value = province.children.map(c => ({ label: c.name, value: c.code }))
    // 如果当前城市不在新城市列表中，清空选择
    const cityNames = cities.value.map(c => c.label)
    if (!cityNames.includes(form.value.city)) {
      form.value.city = ''
    }
  } else {
    currentProvince.value = null
    cities.value = []
  }
}

function openProvincePicker() {
  showProvincePicker.value = true
}

function openCityPicker() {
  if (!form.value.province) {
    uni.showToast({ title: '请先选择省份', icon: 'none' })
    return
  }
  showCityPicker.value = true
}

function onProvinceConfirm(e: any) {
  const selected = e.value[0]
  form.value.province = selected.label
  updateCities(selected.label)
  showProvincePicker.value = false
}

function onCityConfirm(e: any) {
  const selected = e.value[0]
  form.value.city = selected.label
  showCityPicker.value = false
}

async function saveAddress() {
  if (!form.value.receiverName) {
    uni.showToast({ title: '请输入收货人姓名', icon: 'none' })
    return
  }
  if (!form.value.phone) {
    uni.showToast({ title: '请输入手机号码', icon: 'none' })
    return
  }
  if (!form.value.province || !form.value.city || !form.value.address) {
    uni.showToast({ title: '请选择完整地区', icon: 'none' })
    return
  }

  loading.value = true
  try {
    const params = {
      receiverName: form.value.receiverName,
      phone: form.value.phone,
      province: form.value.province,
      city: form.value.city,
      address: form.value.address,
      isDefault: form.value.isDefault ? 1 : 0
    }

    if (isEdit.value && addressId.value) {
      await orderApi.updateAddress(addressId.value, params as any)
    } else {
      await orderApi.addAddress(params as any)
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
        <input v-model="form.receiverName" class="form-input" placeholder="请输入收货人姓名" />
      </view>

      <view class="form-item">
        <text class="form-label">手机号码</text>
        <input v-model="form.phone" class="form-input" type="text" placeholder="请输入手机号码" maxlength="11" />
      </view>

      <view class="form-item" @click="openProvincePicker">
        <text class="form-label">所在地区</text>
        <view class="region-display">
          <text v-if="form.province" class="region-text">{{ form.province }}</text>
          <text v-else class="region-placeholder">请选择省份</text>
          <text class="arrow">></text>
        </view>
      </view>

      <view class="form-item" @click="openCityPicker">
        <text class="form-label">城市</text>
        <view class="region-display">
          <text v-if="form.city" class="region-text">{{ form.city }}</text>
          <text v-else class="region-placeholder">请选择城市</text>
          <text class="arrow">></text>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">详细地址</text>
        <input v-model="form.address" class="form-input" placeholder="街道、楼栋、门牌号" />
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

    <!-- 省份选择器 -->
    <up-picker
      :show="showProvincePicker"
      :columns="[provinces]"
      keyName="label"
      @confirm="onProvinceConfirm"
      @cancel="showProvincePicker = false"
    ></up-picker>

    <!-- 城市选择器 -->
    <up-picker
      :show="showCityPicker"
      :columns="[cities]"
      keyName="label"
      @confirm="onCityConfirm"
      @cancel="showCityPicker = false"
    ></up-picker>
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

.region-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
  padding: 0 24rpx;
  background: var(--bg-page);
  border-radius: 12rpx;
}

.region-text {
  font-size: 28rpx;
  color: var(--text-main);
}

.region-placeholder {
  font-size: 28rpx;
  color: var(--text-placeholder);
}

.arrow {
  color: var(--text-placeholder);
  font-size: 28rpx;
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