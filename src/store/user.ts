import { defineStore } from 'pinia'
import { BASE_URL } from '../utils/env'

interface UserInfo {
  id: number
  openid: string
  nickname: string
  avatar: string
  phone?: string
}

interface UserState {
  token: string | null
  userInfo: UserInfo | null
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: uni.getStorageSync('token') || null,
    userInfo: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token
  },

  actions: {
    async login() {
      try {
        // 获取微信登录凭证
        const loginRes = await new Promise<WechatMiniprogram.LoginSuccessCallbackResult>((resolve, reject) => {
          uni.login({
            provider: 'weixin',
            success: resolve,
            fail: reject
          })
        })

        if (!loginRes.code) {
          throw new Error('获取登录凭证失败')
        }

        // 调用后端微信登录接口
        const res = await uni.request({
          url: `${BASE_URL}/public/wechat/login`,
          method: 'POST',
          data: { code: loginRes.code }
        })

        const data = res.data as any

        if (data.code === 200) {
          this.token = data.data.token
          this.userInfo = data.data.userInfo
          uni.setStorageSync('token', this.token)
          uni.showToast({ title: '登录成功', icon: 'success' })
        } else {
          throw new Error(data.message || '登录失败')
        }
      } catch (error: any) {
        // 开发环境：模拟登录
        if (import.meta.env.DEV) {
          this.token = 'mock_token_' + Date.now()
          this.userInfo = {
            id: 1,
            openid: 'mock_openid',
            nickname: '测试用户',
            avatar: ''
          }
          uni.setStorageSync('token', this.token)
          uni.showToast({ title: '模拟登录成功', icon: 'success' })
        } else {
          uni.showToast({ title: error.message || '登录失败', icon: 'none' })
        }
      }
    },

    logout() {
      this.token = null
      this.userInfo = null
      uni.removeStorageSync('token')
      uni.showToast({ title: '已退出登录', icon: 'success' })
    },

    async fetchUserInfo() {
      if (!this.token) return

      try {
        const res = await uni.request({
          url: `${BASE_URL}/user/info`,
          method: 'GET',
          header: { Authorization: `Bearer ${this.token}` }
        })

        const data = res.data as any
        if (data.code === 200) {
          this.userInfo = data.data
        }
      } catch (error) {
        console.error('获取用户信息失败', error)
      }
    }
  }
})
