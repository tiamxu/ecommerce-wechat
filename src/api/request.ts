import { BASE_URL, MOCK_MODE } from '../utils/env'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | DELETE
  data?: any
  header?: Record<string, string>
  showLoading?: boolean
  timeout?: number
}

type DELETE = 'DELETE'

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export function request<T = any>(options: RequestOptions): Promise<ApiResponse<T>> {
  const token = uni.getStorageSync('token')

  return new Promise((resolve, reject) => {
    if (options.showLoading) {
      uni.showLoading({ title: '加载中...' })
    }

    const requestOptions: any = {
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...options.header
      },
      timeout: options.timeout || 10000,
      success: (res: any) => {
        if (options.showLoading) {
          uni.hideLoading()
        }

        if (res.statusCode === 200) {
          resolve(res.data as ApiResponse<T>)
        } else if (res.statusCode === 401) {
          uni.removeStorageSync('token')
          uni.showToast({ title: '请先登录', icon: 'none' })
          reject(new Error('未授权'))
        } else {
          uni.showToast({ title: '请求失败', icon: 'none' })
          reject(new Error('请求失败'))
        }
      },
      fail: (error: any) => {
        if (options.showLoading) {
          uni.hideLoading()
        }

        // 模拟模式：请求失败时返回模拟数据
        if (MOCK_MODE) {
          console.log('请求失败，返回模拟数据:', options.url)
          resolve({
            code: 200,
            message: 'success',
            data: {} as T
          })
        } else {
          console.error('请求失败:', error)
          uni.showToast({ title: '网络错误', icon: 'none' })
          reject(error)
        }
      }
    }

    uni.request(requestOptions)
  })
}

// 模拟请求（直接返回指定数据）
export function mockRequest<T = any>(mockData: T): Promise<ApiResponse<T>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: 'success',
        data: mockData
      })
    }, 300)
  })
}