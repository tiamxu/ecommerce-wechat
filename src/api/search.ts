import { request, type ApiResponse } from './request'

export interface HotSearchWordsResponse {
  hotSearchWords: string[]
}

export const searchApi = {
  // 获取热门搜索词
  getHotSearchWords(): Promise<ApiResponse<HotSearchWordsResponse>> {
    return request({
      url: '/public/hot-searches',
      method: 'GET',
      showLoading: false
    })
  }
}
