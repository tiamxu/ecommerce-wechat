// 环境配置
// 根据编译平台自动切换 API 地址

// 默认值：H5 和开发环境使用相对路径
let BASE_URL = '/api'

// 平台标识 - 根据小程序类型配置
// 可选值：mini_clothing / mini_food / mini_baby /mini_electronics
let PLATFORM = 'web'

// #ifdef MP-WEIXIN
// 微信小程序：使用域名（需要配置好域名和 SSL）
// ⚠️ 重要：部署前必须替换为真实域名
BASE_URL = 'https://ai.aukeno.com'
PLATFORM = 'zhilo'
// #endif

// #ifdef H5
// H5：使用相对路径（需要 nginx 代理 /api 到后端）
BASE_URL = '/api'
// #endif

export { BASE_URL, PLATFORM }
