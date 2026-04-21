import { BASE_URL } from '../utils/env'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
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

        console.log('API响应:', options.url, res)

        if (res.statusCode === 200) {
          const data = res.data
          // 检查业务状态码
          if (data.code === 200) {
            resolve(data as ApiResponse<T>)
          } else if (data.code === 401) {
            uni.removeStorageSync('token')
            uni.showToast({ title: '请先登录', icon: 'none' })
            reject(new Error(data.message || '未授权'))
          } else {
            uni.showToast({ title: data.message || '请求失败', icon: 'none' })
            reject(new Error(data.message || '请求失败'))
          }
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
        console.error('请求失败:', options.url, error)
        uni.showToast({ title: '网络错误，请检查网络', icon: 'none' })
        reject(error)
      }
    }

    uni.request(requestOptions)
  })
}