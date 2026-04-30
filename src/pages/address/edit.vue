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
  district: '',
  address: '',
  isDefault: false
})

const isEdit = ref(false)
const addressId = ref<number | null>(null)
const loading = ref(false)

// 地区选择器相关
const showRegionPicker = ref(false)
const regionValues = ref([0, 0, 0])
const provinces = regionData.map(p => p.name)
const cities = ref<string[]>([])
const districts = ref<string[]>([])

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

function updateCitiesAndDistricts(provinceIndex: number) {
  // 更新城市列表
  cities.value = regionData[provinceIndex].children.map(c => c.name)

  // 更新区县列表
  if (regionData[provinceIndex].children[0]) {
    districts.value = regionData[provinceIndex].children[0].children.map(d => d.name)
  } else {
    districts.value = []
  }
}

function initRegionSelect(provinceName: string, cityName: string, districtName: string) {
  const provinceIndex = regionData.findIndex(p => p.name === provinceName)
  if (provinceIndex === -1) return

  const province = regionData[provinceIndex]
  const cityIndex = province.children.findIndex(c => c.name === cityName)
  if (cityIndex === -1) return

  const districtIndex = province.children[cityIndex].children.findIndex(d => d.name === districtName)
  if (districtIndex === -1) return

  regionValues.value = [provinceIndex, cityIndex, districtIndex]
  cities.value = province.children.map(c => c.name)
  districts.value = province.children[cityIndex].children.map(d => d.name)
}

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
          district: addr.district || '',
          address: addr.address,
          isDefault: addr.isDefault === 1
        }
        initRegionSelect(addr.province, addr.city, addr.district || '')
      }
    }
  } catch (error) {
    console.error('加载地址详情失败', error)
  }
}

function openRegionPicker() {
  // 初始化选择器数据
  if (form.value.province && form.value.city && form.value.district) {
    initRegionSelect(form.value.province, form.value.city, form.value.district)
  } else {
    // 默认选中第一个
    regionValues.value = [0, 0, 0]
    updateCitiesAndDistricts(0)
  }
  showRegionPicker.value = true
}

function onRegionChange(e: any) {
  const values = e.detail.value
  const oldValues = regionValues.value
  regionValues.value = values

  // 省份变化时，重置城市和区县
  if (values[0] !== oldValues[0]) {
    updateCitiesAndDistricts(values[0])
    // 重置城市和区县索引
    values[1] = 0
    values[2] = 0
    regionValues.value = values
  }
  // 城市变化时，只重置区县
  else if (values[1] !== oldValues[1]) {
    // 更新区县列表
    const province = regionData[values[0]]
    if (province && province.children[values[1]]) {
      districts.value = province.children[values[1]].children.map(d => d.name)
    } else {
      districts.value = []
    }
    // 重置区县索引
    if (values[2] >= districts.value.length) {
      values[2] = 0
    }
    regionValues.value = values
  }
}

function onRegionConfirm() {
  const [pIdx, cIdx, dIdx] = regionValues.value
  form.value.province = provinces[pIdx]
  form.value.city = cities.value[cIdx] || ''
  form.value.district = districts.value[dIdx] || ''
  showRegionPicker.value = false
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
      district: form.value.district,
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

      <view class="form-item" @click="openRegionPicker">
        <text class="form-label">所在地区</text>
        <view class="region-display">
          <text v-if="form.province" class="region-text">
            {{ form.province }} {{ form.city }} {{ form.district }}
          </text>
          <text v-else class="region-placeholder">请选择省市区</text>
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

    <!-- 地区选择器 -->
    <view class="region-mask" v-if="showRegionPicker" @click="showRegionPicker = false">
      <view class="region-picker" @click.stop>
        <view class="picker-header">
          <text class="cancel-btn" @click="showRegionPicker = false">取消</text>
          <text class="title">选择地区</text>
          <text class="confirm-btn" @click="onRegionConfirm">确定</text>
        </view>
        <picker-view
          class="picker-view"
          :value="regionValues"
          @change="onRegionChange"
          indicator-style="height: 80rpx;"
        >
          <picker-view-column>
            <view class="picker-item" v-for="(item, index) in provinces" :key="index">
              {{ item }}
            </view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(item, index) in cities" :key="index">
              {{ item }}
            </view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="(item, index) in districts" :key="index">
              {{ item }}
            </view>
          </picker-view-column>
        </picker-view>
      </view>
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

/* 地区选择器 */
.region-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: flex-end;
}

.region-picker {
  width: 100%;
  background: var(--bg-card);
  border-radius: 24rpx 24rpx 0 0;
  overflow: hidden;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid var(--border);
}

.cancel-btn {
  font-size: 28rpx;
  color: var(--text-placeholder);
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main);
}

.confirm-btn {
  font-size: 28rpx;
  color: var(--primary);
}

.picker-view {
  height: 400rpx;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: var(--text-main);
}
</style>