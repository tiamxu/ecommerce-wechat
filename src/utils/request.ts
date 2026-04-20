const BASE_URL = 'http://localhost:8080/api'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
}

interface ResponseData<T = any> {
  code: number
  message: string
  data: T
}

export function request<T = any>(options: RequestOptions): Promise<ResponseData<T>> {
  const token = uni.getStorageSync('token')

  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data as ResponseData<T>)
        } else if (res.statusCode === 401) {
          uni.removeStorageSync('token')
          uni.showToast({ title: '请先登录', icon: 'none' })
          reject(new Error('未授权'))
        } else {
          reject(new Error('请求失败'))
        }
      },
      fail: (error) => {
        // 开发环境模拟数据
        if (import.meta.env.DEV) {
          const mockData: ResponseData<T> = {
            code: 200,
            message: 'success',
            data: {} as T
          }
          resolve(mockData)
        } else {
          reject(error)
        }
      }
    })
  })
}

export const api = {
  // 商品
  getProducts: (params: any) => request({ url: '/products', data: params }),
  getProductDetail: (id: number) => request({ url: `/products/${id}` }),

  // 分类
  getCategories: () => request({ url: '/categories' }),

  // 购物车
  getCart: () => request({ url: '/cart' }),
  addCart: (data: any) => request({ url: '/cart', method: 'POST', data }),
  updateCart: (id: number, data: any) => request({ url: `/cart/${id}`, method: 'PUT', data }),
  removeCart: (id: number) => request({ url: `/cart/${id}`, method: 'DELETE' }),

  // 订单
  createOrder: (data: any) => request({ url: '/orders', method: 'POST', data }),
  getOrders: (params: any) => request({ url: '/orders', data: params }),

  // 微信登录
  wechatLogin: (code: string) => request({ url: '/wechat/login', method: 'POST', data: { code } })
}
