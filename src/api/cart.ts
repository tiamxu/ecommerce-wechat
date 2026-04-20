import { request, type ApiResponse } from './request'

export interface CartItem {
  id: number
  productId: number
  productName: string
  coverImage?: string
  price: number
  quantity: number
  selected: boolean
}

export const cartApi = {
  // 获取购物车列表
  getList(): Promise<ApiResponse<CartItem[]>> {
    return request({
      url: '/cart',
      method: 'GET',
      showLoading: true
    })
  },

  // 添加到购物车
  add(params: { productId: number; quantity: number }): Promise<ApiResponse<void>> {
    return request({
      url: '/cart',
      method: 'POST',
      data: params,
      showLoading: true
    })
  },

  // 更新购物车数量
  update(id: number, quantity: number): Promise<ApiResponse<void>> {
    return request({
      url: `/cart/${id}`,
      method: 'PUT',
      data: { quantity }
    })
  },

  // 删除购物车商品
  remove(id: number): Promise<ApiResponse<void>> {
    return request({
      url: `/cart/${id}`,
      method: 'DELETE',
      showLoading: true
    })
  },

  // 清空购物车
  clear(): Promise<ApiResponse<void>> {
    return request({
      url: '/cart/clear',
      method: 'DELETE',
      showLoading: true
    })
  }
}
