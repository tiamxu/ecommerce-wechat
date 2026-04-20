// 环境配置
// 根据编译平台自动切换 API 地址

// #ifdef MP-WEIXIN
const BASE_URL = 'http://172.20.10.8:8800'
// #endif

// #ifdef H5
const BASE_URL = '/api'
// #endif

// #ifndef MP-WEIXIN
#ifndef H5
const BASE_URL = '/api'
#endif
// #endif

// 开发/模拟模式 - 请求失败时返回模拟数据
export const MOCK_MODE = false

export { BASE_URL }