import { request, type ApiResponse } from './request'

export interface Product {
  id: number
  price: number
  originalPrice?: number
  stock: number
  status: number
  sales?: number
  categoryId: number
  metaImage?: string
  name: { zh?: string; en?: string }
  description?: { zh?: string; en?: string }
  images?: { url: string; isCover?: number }[]
  coverImages?: string[]
  primaryTag?: { name: string }
  tags?: { name: string }[]
  services?: ServicePolicy[]
}

export interface ServicePolicy {
  id: number
  code: string
  name: string
  icon: string
  description: string
  policyType: number
  sortOrder: number
}

export interface Category {
  id: number
  name: { zh?: string; en?: string }
  icon?: string
  parentId?: number
  sortOrder?: number
  status?: number
}

export interface ContentBlock {
  id: number
  category: string
  blockKey: string
  zhValue: string
  enValue: string
  extraJSON: string
  sortOrder: number
  status: number
}

interface ProductListResponse {
  pageData: Product[]
  total: number
  pageNo: number
  pageSize: number
}

interface CategoryListResponse {
  pageData: Category[]
  total: number
}

// 过滤空值参数
function cleanParams(params: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      cleaned[key] = value
    }
  }
  return cleaned
}

export const productApi = {
  // 获取商品列表
  getList(params: {
    pageNo?: number
    pageSize?: number
    categoryId?: number
    keyword?: string
    lang?: string
    status?: string
  }): Promise<ApiResponse<ProductListResponse>> {
    return request({
      url: '/public/products',
      method: 'GET',
      data: cleanParams({ ...params, lang: 'zh', status: '1' }),
      showLoading: true
    })
  },

  // 获取热门推荐商品
  getHotProducts(pageSize = 6): Promise<ApiResponse<ProductListResponse>> {
    return request({
      url: '/public/products',
      method: 'GET',
      data: { pageNo: 1, pageSize, lang: 'zh', status: '1', tag: 'hot' },
      showLoading: false
    })
  },

  // 获取商品详情
  getDetail(id: number): Promise<ApiResponse<Product>> {
    return request({
      url: `/public/products/${id}`,
      method: 'GET',
      data: { lang: 'zh' },
      showLoading: true
    })
  },

  // 获取分类列表
  getCategories(): Promise<ApiResponse<CategoryListResponse>> {
    return request({
      url: '/public/categories',
      method: 'GET',
      data: { lang: 'zh' },
      showLoading: false
    })
  },

  // 获取内容块（如 Banner）
  getContents(category: string): Promise<ApiResponse<ContentBlock[]>> {
    return request({
      url: '/public/contents',
      method: 'GET',
      data: { category },
      showLoading: false
    })
  },

  // 获取商品服务政策
  getProductServices(ids: string | number, lang = 'zh'): Promise<ApiResponse<Record<string, ServicePolicy[]>>> {
    return request({
      url: '/public/products/services',
      method: 'GET',
      data: { ids, lang },
      showLoading: false
    })
  }
}
