import { request, type ApiResponse } from './request'

export interface FavoriteItem {
  id: number
  productId: number
  productName: string
  productPrice: number
  coverImage: string
  stock: number
  createdAt: string
  images: { url: string; isCover?: number }[]
}

export const favoriteApi = {
  // 检查是否已收藏
  check: (productId: number): Promise<ApiResponse<{ isFavorite: boolean; favoriteId: number }>> =>
    request({
      url: '/api/favorites/check?productId=' + productId,
      method: 'GET'
    }),

  // 添加收藏
  add: (productId: number): Promise<ApiResponse<{ count: number }>> =>
    request({
      url: '/api/favorites',
      method: 'POST',
      data: { productId }
    }),

  // 取消收藏（按 favoriteId）
  remove: (favoriteId: number): Promise<ApiResponse<void>> =>
    request({
      url: '/api/favorites/' + favoriteId,
      method: 'DELETE'
    }),

  // 获取收藏列表
  list: (): Promise<ApiResponse<{ items: FavoriteItem[] }>> =>
    request({
      url: '/api/favorites',
      method: 'GET'
    }),

  // 获取收藏数量
  count: (): Promise<ApiResponse<{ count: number }>> =>
    request({
      url: '/api/favorites/count',
      method: 'GET'
    })
}