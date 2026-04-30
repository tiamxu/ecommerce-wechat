// 环境配置
// 根据编译平台自动切换 API 地址

// 默认值：H5 和开发环境使用相对路径
let BASE_URL = '/api'

// #ifdef MP-WEIXIN
// 微信小程序：使用域名（需要配置好域名和 SSL）
BASE_URL = 'https://sdapi.k-think.com'
// #endif

// #ifdef H5
// H5：使用相对路径（需要 nginx 代理 /api 到后端）
BASE_URL = '/api'
// #endif

export { BASE_URL }
