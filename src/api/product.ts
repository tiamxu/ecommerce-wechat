import { request, type ApiResponse } from './request'

export interface Product {
  id: number
  name: string
  nameEn?: string
  price: number
  coverImage?: string
  images?: string[]
  stock: number
  description?: string
  categoryId?: number
  tags?: string[]
}

export interface Category {
  id: number
  name: string
  nameEn?: string
  icon?: string
}

interface ProductListResponse {
  list: Product[]
  total: number
  pageNo: number
  pageSize: number
}

export const productApi = {
  // 获取商品列表
  getList(params: {
    pageNo?: number
    pageSize?: number
    categoryId?: number
    keyword?: string
    lang?: string
  }): Promise<ApiResponse<ProductListResponse>> {
    return request({
      url: '/products',
      method: 'GET',
      data: params,
      showLoading: true
    })
  },

  // 获取商品详情
  getDetail(id: number): Promise<ApiResponse<Product>> {
    return request({
      url: `/products/${id}`,
      method: 'GET',
      showLoading: true
    })
  },

  // 获取分类列表
  getCategories(): Promise<ApiResponse<Category[]>> {
    return request({
      url: '/categories',
      method: 'GET',
      showLoading: true
    })
  },

  // 获取热门商品
  getHotProducts(params?: { pageSize?: number }): Promise<ApiResponse<Product[]>> {
    return request({
      url: '/products/hot',
      method: 'GET',
      data: params
    })
  }
}
