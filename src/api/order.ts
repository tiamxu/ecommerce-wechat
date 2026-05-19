import { request, type ApiResponse } from './request'

export interface Address {
  id: number
  receiverName: string
  phone: string
  province: string
  city: string
  country: string
  address: string
  postalCode: string
  isDefault: number
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

export interface OrderImage {
  url: string
  urlThumb?: string
  urlMedium?: string
  urlLarge?: string
  isCover?: number
}

export interface OrderProduct {
  productId: number
  productName: string
  price: number
  quantity: number
  image?: OrderImage
}

export interface CreateOrderParams {
  email: string
  receiverName: string
  phone: string
  country: string
  province: string
  city: string
  address: string
  postalCode: string
  items: { productId: number; quantity: number; price?: number; productName?: string }[]
  remark?: string
}

export const orderApi = {
  // 创建订单
  create(params: CreateOrderParams): Promise<ApiResponse<{ id: number; orderNo: string }>> {
    return request({
      url: '/api/orders',
      method: 'POST',
      data: params,
      showLoading: true
    })
  },

  // 获取我的订单列表（通过 JWT 自动识别用户，可带 ?status=xxx）
  getMyOrders(params?: { status?: string }): Promise<ApiResponse<{ list: OrderItem[]; total: number }>> {
    return request({
      url: '/api/orders',
      method: 'GET',
      data: params,
      showLoading: true
    })
  },

  // 获取订单数量统计
  getOrderCounts(): Promise<ApiResponse<{ pending: number; paid: number; shipped: number; completed: number }>> {
    return request({
      url: '/api/orders/counts',
      method: 'GET'
    })
  },

  // 获取订单详情
  getDetail(orderId: number): Promise<ApiResponse<OrderItem>> {
    return request({
      url: `/api/orders/${orderId}`,
      method: 'GET',
      showLoading: true
    })
  },

  // 取消订单
  cancel(orderId: number): Promise<ApiResponse<void>> {
    return request({
      url: `/api/orders/${orderId}/cancel`,
      method: 'PUT',
      showLoading: true
    })
  },

  // 支付订单
  pay(orderId: number, mode: string = 'wechat'): Promise<ApiResponse<{ approval_url?: string; qrcode_url?: string }>> {
    return request({
      url: `/api/orders/${orderId}/pay?mode=${mode}`,
      method: 'POST',
      showLoading: true
    })
  },

  // 获取收货地址列表
  getAddresses(): Promise<ApiResponse<Address[]>> {
    return request({
      url: '/api/addresses',
      method: 'GET',
      showLoading: true
    })
  },

  // 添加收货地址
  addAddress(params: Omit<Address, 'id'>): Promise<ApiResponse<void>> {
    return request({
      url: '/api/addresses',
      method: 'POST',
      data: params,
      showLoading: true
    })
  },

  // 更新收货地址
  updateAddress(id: number, params: Partial<Address>): Promise<ApiResponse<void>> {
    return request({
      url: `/api/addresses/${id}`,
      method: 'PUT',
      data: params
    })
  },

  // 删除收货地址
  deleteAddress(id: number): Promise<ApiResponse<void>> {
    return request({
      url: `/api/addresses/${id}`,
      method: 'DELETE',
      showLoading: true
    })
  }
}
