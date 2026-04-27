import { defineStore } from 'pinia'
import { BASE_URL } from '../utils/env'

interface UserInfo {
  id: number
  openid: string
  nickname: string
  avatar: string
  phone?: string
  email?: string
}

interface UserState {
  token: string | null
  userInfo: UserInfo | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: uni.getStorageSync('token') || null,
    userInfo: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token && !!state.userInfo,
  },

  actions: {
    // 验证 token 有效性
    async verifyToken() {
      if (!this.token) {
        return false
      }

      try {
        const res = await uni.request({
          url: `${BASE_URL}/api/users/profile`,
          method: 'GET',
          header: { Authorization: `Bearer ${this.token}` }
        })

        const data = res.data as any
        if (data.code === 200) {
          this.userInfo = data.data
          return true
        }
      } catch (error) {
        console.error('Token验证失败', error)
      }

      // token 无效，清除
      this.clearAuth()
      return false
    },

    // 微信一键登录（获取手机号）
    async loginWithWechat(code: string, encryptedData: string, iv: string, sessionId: string) {
      try {
        const res = await uni.request({
          url: `${BASE_URL}/public/wechat/login`,
          method: 'POST',
          data: { code, encryptedData, iv, sessionId }
        })

        const data = res.data as any
        if (data.code === 200 && data.data.token) {
          // 保存 token 和用户信息
          this.token = data.data.token
          this.userInfo = data.data.userInfo
          uni.setStorageSync('token', this.token)
          // 缓存 openid（仅用于用户识别，不用于登录判断）
          if (data.data.userInfo?.openid) {
            uni.setStorageSync('wechat_openid', data.data.userInfo.openid)
          }
          return { success: true }
        } else {
          return { success: false, message: data.message || '登录失败' }
        }
      } catch (error: any) {
        console.error('微信登录失败', error)
        return { success: false, message: error.message || '网络错误' }
      }
    },

    // 登出
    logout() {
      this.clearAuth()
      uni.showToast({ title: '已退出登录', icon: 'success' })
    },

    clearAuth() {
      this.token = null
      this.userInfo = null
      uni.removeStorageSync('token')
      uni.removeStorageSync('cart_session')
    },

    updateUserInfo(info: Partial<UserInfo>) {
      if (this.userInfo) {
        this.userInfo = { ...this.userInfo, ...info }
      }
    },

    // 初始化：验证已有 token
    async init() {
      if (this.token) {
        await this.verifyToken()
      }
    }
  }
})
