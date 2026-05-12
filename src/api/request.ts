import { BASE_URL } from '../utils/env'
import { ErrorCodes, isSuccess, isAuthError, isCaptchaError, isNotFoundError } from '../constants/errorCode'

// 登录页面路径常量
const LOGIN_PAGE_PATH = '/pages/user/login'

// 错误消息（支持 i18n）
const errorMessages: Record<number, string> = {
  // 认证
  [ErrorCodes.USERNAME_EXISTS]: '用户名已存在',
  [ErrorCodes.INVALID_CREDENTIALS]: '用户名或密码错误',
  [ErrorCodes.USER_DISABLED]: '账号已被禁用',
  [ErrorCodes.WRONG_OLD_PASSWORD]: '原密码错误',
  [ErrorCodes.ACCOUNT_ALREADY_BOUND]: '账号已被其他用户绑定',

  // 验证码
  [ErrorCodes.NEED_CAPTCHA]: '请先完成验证',
  [ErrorCodes.CAPTCHA_REQUIRED]: '验证码必填',
  [ErrorCodes.CAPTCHA_ERROR]: '验证码错误，请重试',

  // 商品
  [ErrorCodes.PRODUCT_NOT_FOUND]: '商品不存在',

  // 分类
  [ErrorCodes.CATEGORY_NOT_FOUND]: '分类不存在',

  // 标签
  [ErrorCodes.TAG_NOT_FOUND]: '标签不存在',

  // 订单
  [ErrorCodes.ORDER_NOT_FOUND]: '订单不存在',
  [ErrorCodes.INSUFFICIENT_STOCK]: '库存不足',

  // 购物车
  [ErrorCodes.CART_PRODUCT_NOT_FOUND]: '购物车商品不存在',
  [ErrorCodes.CART_PRODUCT_NOT_ON_SHELF]: '商品已下架',
  [ErrorCodes.CART_PRODUCT_OUT_OF_STOCK]: '商品库存不足',

  // 支付
  [ErrorCodes.PAYMENT_DISABLED]: '支付方式已禁用',

  // 管理员
  [ErrorCodes.INVALID_ADMIN_CREDENTIALS]: '管理员用户名或密码错误',
  [ErrorCodes.ADMIN_DISABLED]: '管理员账号已被禁用',
}

// 获取错误消息
function getErrorMessage(code: number, fallback: string): string {
  return errorMessages[code] || fallback
}

// 处理业务错误
function handleBusinessError(code: number, message: string): void {
  // 认证错误 -> 跳转登录
  if (isAuthError(code)) {
    uni.removeStorageSync('token')
    uni.showToast({ title: getErrorMessage(code, message), icon: 'none' })
    setTimeout(() => {
      uni.navigateTo({ url: LOGIN_PAGE_PATH })
    }, 1500)
    return
  }

  // 验证码错误 -> 提示并触发验证
  if (isCaptchaError(code)) {
    uni.showToast({ title: getErrorMessage(code, message), icon: 'none' })
    // 触发验证码弹窗（需要在页面中监听）
    uni.$emit('captchaRequired')
    return
  }

  // 资源不存在 -> 提示并返回
  if (isNotFoundError(code)) {
    uni.showToast({ title: getErrorMessage(code, message), icon: 'none' })
    return
  }

  // 其他业务错误 -> 直接提示
  uni.showToast({ title: getErrorMessage(code, message), icon: 'none' })
}

// 处理 HTTP 错误
function handleHttpError(statusCode: number): void {
  switch (statusCode) {
    case 401:
      uni.removeStorageSync('token')
      uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
      setTimeout(() => {
        uni.navigateTo({ url: LOGIN_PAGE_PATH })
      }, 1500)
      break
    case 403:
      uni.showToast({ title: '无权限访问', icon: 'none' })
      break
    case 404:
      uni.showToast({ title: '接口不存在', icon: 'none' })
      break
    case 500:
      uni.showModal({
        title: '提示',
        content: '服务器异常，请稍后重试',
        showCancel: false
      })
      break
    default:
      uni.showToast({ title: `请求失败 (${statusCode})`, icon: 'none' })
  }
}

// 处理网络错误
function handleNetworkError(): void {
  uni.showToast({ title: '网络异常，请检查网络', icon: 'none' })
}

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  showLoading?: boolean
  timeout?: number
}

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
          const data = res.data
          // 检查业务状态码
          if (isSuccess(data.code)) {
            resolve(data as ApiResponse<T>)
          } else {
            // 业务错误处理
            handleBusinessError(data.code, data.message)
            reject(new Error(data.message || '请求失败'))
          }
        } else {
          // HTTP 错误处理
          handleHttpError(res.statusCode)
          reject(new Error(`HTTP ${res.statusCode}`))
        }
      },
      fail: (error: any) => {
        if (options.showLoading) {
          uni.hideLoading()
        }
        handleNetworkError()
        reject(error)
      }
    }

    uni.request(requestOptions)
  })
}
