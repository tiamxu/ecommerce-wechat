import { request, type ApiResponse } from './request'

// 后端返回的购物车项结构
export interface CartItem {
  id: number
  productId: number
  productName: string
  coverImage?: string
  productPrice: number  // 后端字段是 productPrice
  quantity: number
  stock?: number
  subTotal?: number
  // 前端添加的字段
  selected?: boolean
}

// 后端购物车响应结构
export interface CartResponse {
  items: CartItem[]
  totalCount: number
  totalPrice: number
}

export const cartApi = {
  // 获取购物车列表
  getList(): Promise<ApiResponse<CartResponse>> {
    return request({
      url: '/cart',
      method: 'GET',
      showLoading: true
    })
  },

  // 添加到购物车
  add(params: { productId: number; quantity: number }): Promise<ApiResponse<void>> {
    return request({
      url: '/cart/items',
      method: 'POST',
      data: params,
      showLoading: true
    })
  },

  // 更新购物车数量
  update(productId: number, quantity: number): Promise<ApiResponse<void>> {
    return request({
      url: `/cart/items/${productId}`,
      method: 'PUT',
      data: { quantity }
    })
  },

  // 删除购物车商品
  remove(productId: number): Promise<ApiResponse<void>> {
    return request({
      url: `/cart/items/${productId}`,
      method: 'DELETE',
      showLoading: true
    })
  },

  // 清空购物车
  clear(): Promise<ApiResponse<void>> {
    return request({
      url: '/cart',
      method: 'DELETE',
      showLoading: true
    })
  }
}
