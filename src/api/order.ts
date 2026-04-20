import { request, type ApiResponse } from './request'

export interface Address {
  id: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: boolean
}

export interface OrderItem {
  id: number
  orderNo: string
  status: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled'
  totalAmount: number
  freight: number
  items: OrderProduct[]
  address: Address
  createTime: string
}

export interface OrderProduct {
  productId: number
  productName: string
  coverImage?: string
  price: number
  quantity: number
}

export interface CreateOrderParams {
  addressId: number
  items: { productId: number; quantity: number }[]
  remark?: string
}

export const orderApi = {
  // 创建订单
  create(params: CreateOrderParams): Promise<ApiResponse<{ orderId: number; orderNo: string }>> {
    return request({
      url: '/orders',
      method: 'POST',
      data: params,
      showLoading: true
    })
  },

  // 获取订单列表
  getList(params?: {
    status?: string
    pageNo?: number
    pageSize?: number
  }): Promise<ApiResponse<{ list: OrderItem[]; total: number }>> {
    return request({
      url: '/orders',
      method: 'GET',
      data: params,
      showLoading: true
    })
  },

  // 获取订单详情
  getDetail(orderId: number): Promise<ApiResponse<OrderItem>> {
    return request({
      url: `/orders/${orderId}`,
      method: 'GET',
      showLoading: true
    })
  },

  // 获取收货地址列表
  getAddresses(): Promise<ApiResponse<Address[]>> {
    return request({
      url: '/addresses',
      method: 'GET',
      showLoading: true
    })
  },

  // 添加收货地址
  addAddress(params: Omit<Address, 'id'>): Promise<ApiResponse<void>> {
    return request({
      url: '/addresses',
      method: 'POST',
      data: params,
      showLoading: true
    })
  },

  // 更新收货地址
  updateAddress(id: number, params: Partial<Address>): Promise<ApiResponse<void>> {
    return request({
      url: `/addresses/${id}`,
      method: 'PUT',
      data: params
    })
  },

  // 删除收货地址
  deleteAddress(id: number): Promise<ApiResponse<void>> {
    return request({
      url: `/addresses/${id}`,
      method: 'DELETE',
      showLoading: true
    })
  },

  // 取消订单
  cancel(orderId: number): Promise<ApiResponse<void>> {
    return request({
      url: `/orders/${orderId}/cancel`,
      method: 'PUT',
      showLoading: true
    })
  }
}
