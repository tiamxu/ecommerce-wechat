// 环境配置
// 根据编译平台自动切换 API 地址

let BASE_URL = '/api'

// #ifdef MP-WEIXIN
BASE_URL = 'https://sdapi.k-think.com'
// #endif

// #ifdef H5
BASE_URL = '/api'
// #endif

export { BASE_URL }