import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { BASE_URL, PLATFORM } from '../utils/env'
import { wsTripGenerate } from '../utils/websocket'
import type { GenerateParams, TripRoute, UserProfile } from '../api/trip'

export interface DailyPlan {
  day: number
  date?: string
  weather?: string
  items: {
    type: 'spot' | 'food' | 'hotel' | 'transport' | 'shopping' | 'show'
    name: string
    time?: string
    duration?: string
    ticket?: string
    cost?: number
    note?: string
    location?: string
  }[]
}

export interface Trip {
  id: number
  destination: string
  days: number
  budget: '穷游' | '舒适' | '奢侈'
  status: 'planning' | 'ongoing' | 'completed'
  createdAt: string
  routes: TripRoute[]
  favoriteRoutes: string[]
}

export const useTripStore = defineStore('trip', () => {
  const currentTrip = ref<Trip | null>(null)
  const tripHistory = ref<Trip[]>([])
  const tripHistoryTotal = ref(0)
  const favorites = ref<Trip[]>([])
  const favoritesTotal = ref(0)
  const loading = ref(false)
  const streaming = ref(false)
  const currentProfile = ref<UserProfile | null>(null)

  const hasCurrentTrip = computed(() => currentTrip.value !== null)
  const currentRoutes = computed(() => currentTrip.value?.routes || [])

  function setCurrentTrip(trip: Trip) {
    currentTrip.value = trip
  }

  function clearCurrentTrip() {
    currentTrip.value = null
    currentProfile.value = null
  }

  // 流式生成行程（未登录）
  async function generateTripStream(params: GenerateParams, onMessage: (type: string, data: any) => void) {
    streaming.value = true
    const token = uni.getStorageSync('token')
    const url = `${BASE_URL}/public/trip/generate/stream`

    try {
      const res: any = await new Promise((resolve, reject) => {
        uni.request({
          url,
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            'X-Platform': PLATFORM
          },
          data: params,
          timeout: 300000,  // 5分钟超时
          success: resolve,
          fail: reject
        })
      })

      // 解析SSE响应
      if (res.data) {
        const lines = (res.data as string).split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              break
            }
            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'profile') {
                currentProfile.value = parsed.data
                onMessage('profile', parsed.data)
              } else if (parsed.type === 'route') {
                try {
                  const routeData = JSON.parse(parsed.data)
                  onMessage('route', routeData)
                } catch {
                  onMessage('route_text', parsed.data)
                }
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } finally {
      streaming.value = false
    }
  }

  // 流式生成行程（WebSocket方式）
  async function generateTripStreamWS(params: GenerateParams, onMessage: (type: string, data: any) => void) {
    streaming.value = true
    const token = uni.getStorageSync('token')
    try {
      const result = await wsTripGenerate({ ...params, token }, {
        onMessage: (type, data) => {
          if (type === 'profile') {
            currentProfile.value = data
          }
          onMessage(type, data)
        },
        onError: (err) => {
          console.error('[WS] Error:', err)
        }
      })
      // 等待流式完成
      await result.waitForDone()
    } finally {
      streaming.value = false
    }
  }

  // 流式生成行程（登录后保存，WebSocket方式）
  async function generateAndSaveTripStreamWS(params: GenerateParams, onMessage: (type: string, data: any) => void) {
    streaming.value = true
    const token = uni.getStorageSync('token')
    if (!token) {
      streaming.value = false
      throw new Error('请先登录')
    }
    try {
      const result = await wsTripGenerate({ ...params, save: true, token }, {
        onMessage: (type, data) => {
          if (type === 'profile') {
            currentProfile.value = data
          }
          onMessage(type, data)
        },
        onError: (err) => {
          console.error('[WS] Error:', err)
        }
      })
      // 等待流式完成
      await result.waitForDone()
    } finally {
      streaming.value = false
    }
  }

  // 流式生成行程（登录后保存）
  async function generateAndSaveTripStream(params: GenerateParams, onMessage: (type: string, data: any) => void) {
    streaming.value = true
    const token = uni.getStorageSync('token')

    if (!token) {
      throw new Error('请先登录')
    }

    const url = `${BASE_URL}/api/trip/generate/stream`

    try {
      const res = await uni.request({
        url,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Platform': PLATFORM
        },
        data: params,
        timeout: 300000  // 5分钟超时
      })

      // 解析SSE响应
      if (res.data) {
        const lines = (res.data as string).split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              break
            }
            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'profile') {
                currentProfile.value = parsed.data
                onMessage('profile', parsed.data)
              } else if (parsed.type === 'route') {
                try {
                  const routeData = JSON.parse(parsed.data)
                  onMessage('route', routeData)
                } catch {
                  onMessage('route_text', parsed.data)
                }
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } finally {
      streaming.value = false
    }
  }

  // 生成行程（模拟流式效果）
  async function generateTrip(params: GenerateParams, onMessage?: (type: string, data: any) => void) {
    loading.value = true
    try {
      const url = `${BASE_URL}/public/trip/generate`

      const res: any = await new Promise((resolve, reject) => {
        uni.request({
          url,
          method: 'POST',
          header: {
            'Content-Type': 'application/json',
            'X-Platform': PLATFORM
          },
          data: params,
          timeout: 120000,  // 2分钟超时
          success: resolve,
          fail: reject
        })
      })

      if (res.data && res.data.code === 0) {
        const data = res.data.data
        currentProfile.value = data.profile

        const trip: Trip = {
          id: Date.now(),
          destination: params.destination,
          days: params.days,
          budget: params.budget as '穷游' | '舒适' | '奢侈',
          status: 'planning',
          createdAt: new Date().toISOString(),
          routes: data.routes || [],
          favoriteRoutes: []
        }
        currentTrip.value = trip

        if (onMessage) {
          onMessage('profile', data.profile)
          for (const route of data.routes || []) {
            onMessage('route', route)
          }
        }

        return data
      } else {
        throw new Error(res.data?.message || '生成失败')
      }
    } finally {
      loading.value = false
    }
  }

  // 生成并保存行程
  async function generateAndSaveTrip(params: GenerateParams, onMessage?: (type: string, data: any) => void) {
    loading.value = true
    const token = uni.getStorageSync('token')

    try {
      let url: string
      let header: any = {
        'Content-Type': 'application/json',
        'X-Platform': PLATFORM
      }

      if (token) {
        url = `${BASE_URL}/api/trip/generate`
        header['Authorization'] = `Bearer ${token}`
      } else {
        url = `${BASE_URL}/public/trip/generate`
      }

      const res: any = await new Promise((resolve, reject) => {
        uni.request({
          url,
          method: 'POST',
          header,
          data: params,
          timeout: 120000,  // 2分钟超时
          success: resolve,
          fail: reject
        })
      })

      if (res.data && res.data.code === 0) {
        const data = res.data.data
        currentProfile.value = data.profile

        const trip: Trip = {
          id: data.trip_id || Date.now(),
          destination: params.destination,
          days: params.days,
          budget: params.budget as '穷游' | '舒适' | '奢侈',
          status: 'planning',
          createdAt: new Date().toISOString(),
          routes: data.routes || [],
          favoriteRoutes: []
        }
        currentTrip.value = trip

        if (onMessage) {
          onMessage('profile', data.profile)
          for (const route of data.routes || []) {
            onMessage('route', route)
          }
        }

        return data
      } else {
        throw new Error(res.data?.message || '生成失败')
      }
    } finally {
      loading.value = false
    }
  }

  function toggleFavoriteRoute(routeId: string) {
    if (!currentTrip.value) return
    const index = currentTrip.value.favoriteRoutes.indexOf(routeId)
    if (index === -1) {
      currentTrip.value.favoriteRoutes.push(routeId)
    } else {
      currentTrip.value.favoriteRoutes.splice(index, 1)
    }
  }

  function isRouteFavorite(routeId: string): boolean {
    return currentTrip.value?.favoriteRoutes.includes(routeId) || false
  }

  return {
    currentTrip,
    tripHistory,
    tripHistoryTotal,
    favorites,
    favoritesTotal,
    loading,
    streaming,
    currentProfile,
    hasCurrentTrip,
    currentRoutes,
    setCurrentTrip,
    clearCurrentTrip,
    generateTripStream,
    generateAndSaveTripStream,
    generateTripStreamWS,
    generateAndSaveTripStreamWS,
    generateTrip,
    generateAndSaveTrip,
    toggleFavoriteRoute,
    isRouteFavorite
  }
})
