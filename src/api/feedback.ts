import { request, type ApiResponse } from './request'

export interface CreateFeedbackParams {
  category: string
  subject: string
  content: string
  images?: string
  contact?: string
}

export interface FeedbackItem {
  id: number
  userId: number
  category: string
  subject: string
  content: string
  images?: string[]
  contact?: string
  status: number
  priority: number
  platform: string
  reply?: string
  repliedAt?: string
  closedAt?: string
  createdAt: string
}

export interface FeedbackListResponse {
  items: FeedbackItem[]
  total: number
  page: number
}

export const feedbackApi = {
  // 创建反馈
  create(params: CreateFeedbackParams): Promise<ApiResponse<void>> {
    return request({
      url: '/api/feedback',
      method: 'POST',
      data: params,
      showLoading: true
    })
  },

  // 获取反馈列表
  list(page = 1, pageSize = 10, status = -1): Promise<ApiResponse<FeedbackListResponse>> {
    return request({
      url: '/api/feedback',
      method: 'GET',
      data: { page, pageSize, status },
      showLoading: true
    })
  },

  // 获取反馈详情
  detail(id: number): Promise<ApiResponse<FeedbackItem>> {
    return request({
      url: `/api/feedback/${id}`,
      method: 'GET'
    })
  },

  // 获取反馈分类
  categories(): Promise<ApiResponse<{ items: Array<{ value: string; label: string }> }>> {
    return request({
      url: '/api/feedback/categories',
      method: 'GET'
    })
  }
}