// 成功码
export const SUCCESS_CODE = 200

// 业务错误码范围
export const BusinessCodeRange = {
  AUTH:       [10001, 10099],  // 认证相关
  CAPTCHA:    [11001, 11099],  // 验证码
  CATEGORY:   [20001, 20099],  // 分类
  PRODUCT:    [30001, 30099],  // 商品
  CART:       [31001, 31099],  // 购物车
  ORDER:      [32001, 32099],  // 订单
  PAYMENT:    [33001, 33099],  // 支付
  FAVORITE:   [34001, 34099],  // 收藏
  TAG:        [40001, 40099],  // 标签
  ADMIN:      [90001, 90099],  // 管理员
}

// 关键错误码（需要特殊处理）
export const ErrorCodes = {
  // ========== 认证/用户 (10001-10099) ==========
  USERNAME_EXISTS:       10001,
  PHONE_ALREADY_BOUND:   10002,
  EMAIL_ALREADY_BOUND:   10003,
  INVALID_CREDENTIALS:   10004,
  USER_DISABLED:         10005,
  WRONG_OLD_PASSWORD:    10006,
  ACCOUNT_ALREADY_BOUND: 10007,

  // ========== 验证码 (11001-11099) ==========
  NEED_CAPTCHA:          11001,
  CAPTCHA_REQUIRED:       11002,
  CAPTCHA_ERROR:         11003,

  // ========== 分类 (20001-20099) ==========
  CATEGORY_NOT_FOUND:       20001,
  CATEGORY_HAS_PRODUCTS:   20002,
  INVALID_PARENT_CATEGORY:  20003,

  // ========== 商品 (30001-30099) ==========
  PRODUCT_NOT_FOUND:      30001,
  PRODUCT_STATUS_INVALID: 30002,

  // ========== 购物车 (31001-31099) ==========
  CART_PRODUCT_NOT_FOUND:   31001,
  CART_PRODUCT_NOT_ON_SHELF: 31002,
  CART_PRODUCT_OUT_OF_STOCK: 31003,

  // ========== 订单 (32001-32099) ==========
  ORDER_NOT_FOUND:     32001,
  INSUFFICIENT_STOCK:  32002,

  // ========== 支付 (33001-33099) ==========
  PAYMENT_DISABLED:    33001,

  // ========== 收藏 (34001-34099) ==========
  FAVORITE_ALREADY_EXISTS: 34001,
  FAVORITE_NOT_FOUND:      34002,

  // ========== 标签 (40001-40099) ==========
  TAG_NOT_FOUND:       40001,

  // ========== 管理员 (90001-90099) ==========
  INVALID_ADMIN_CREDENTIALS: 90001,
  ADMIN_DISABLED:             90002,
  ADMIN_NOT_FOUND:            90003,
}

// 判断是否成功
export function isSuccess(code: number): boolean {
  return code === SUCCESS_CODE
}

// 判断是否需要登录
export function isAuthError(code: number): boolean {
  const range = BusinessCodeRange.AUTH
  return code >= range[0] && code <= range[1]
}

// 判断是否验证码错误
export function isCaptchaError(code: number): boolean {
  const range = BusinessCodeRange.CAPTCHA
  return code >= range[0] && code <= range[1]
}

// 判断是否资源不存在
export function isNotFoundError(code: number): boolean {
  return code === ErrorCodes.PRODUCT_NOT_FOUND ||
         code === ErrorCodes.CATEGORY_NOT_FOUND ||
         code === ErrorCodes.TAG_NOT_FOUND ||
         code === ErrorCodes.ORDER_NOT_FOUND ||
         code === ErrorCodes.FAVORITE_NOT_FOUND ||
         code === ErrorCodes.CART_PRODUCT_NOT_FOUND
}
