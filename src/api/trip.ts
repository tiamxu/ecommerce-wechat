import { BASE_URL, PLATFORM } from '../utils/env'
import { request, cleanParams } from './request'

// 生成行程请求参数
export interface GenerateParams {
  destination: string      // 必填：目的地
  days: number            // 必填：天數
  budget: string         // 必填：穷游/舒适/奢侈
  departure_date?: string // 出发日期 YYYY-MM-DD
  scene?: string         // 场景：情侣/亲子/朋友/家庭/商务
  people?: number        // 人数，默认2
  age_groups?: string[]  // 年龄：老人/儿童
  preferences?: string[]  // 偏好：美食/自然/人文/购物/摄影
  style?: string         // 风格：打卡型/度假型/探索型
  required_spots?: string[] // 必去景点
  required_foods?: string[] // 必吃美食
  avoid_spots?: string[]  // 不想去
  health?: HealthInfo    // 健康信息
  extra?: string         // 其他需求
}

// 健康信息
export interface HealthInfo {
  car_sick?: boolean      // 晕车
  fear_height?: boolean   // 恐高
  menstruation?: boolean  // 例假
  pregnant?: boolean      // 孕妇
  heart_disease?: boolean // 心脏病
  hypertension?: boolean // 高血压
  diet_restrict?: string // 饮食禁忌
}

// 用户画像
export interface UserProfile {
  destination: string
  days: number
  budget_level: string
  people: number
  personality: string
  preferences: string[]
  scene: string
  age_groups: string[]
  style: string
  health: HealthInfo
  required_spots: string[]
  required_foods: string[]
  avoid_spots: string[]
  extra: string
}

// 费用明细
export interface CostDetail {
  transport: number
  accommodation: number
  food: number
  tickets: number
}

// 每日行程
export interface DailyPlan {
  day: number
  city: string
  date?: string
  weather?: string
  morning: string
  afternoon: string
  evening: string
  tips?: string
}

// 住宿
export interface Hotel {
  name: string
  location: string
  price: number
  per_night: boolean
  night?: number
  reason?: string
}

// 餐饮
export interface Restaurant {
  name: string
  type: string
  price: number
  per_person: boolean
  reason?: string
}

// 交通
export interface Transportation {
  type: string
  route: string
  duration: string
  cost: number
  per_person: boolean
}

// 行程线路
export interface TripRoute {
  name: string
  theme: string
  estimated_cost: number
  cost_detail: CostDetail
  daily_plans: DailyPlan[]
  hotels: Hotel[]
  restaurants: Restaurant[]
  transportations: Transportation[]
  notes: string[]
}

// 生成响应
export interface GenerateResp {
  profile: UserProfile
  routes: TripRoute[]
}

// 行程历史项
export interface TripHistoryItem {
  id: number
  route_name: string
  route_theme: string
  destination: string
  days: number
  budget_level: string
  estimated_cost: number
  status: number
  created_at: string
}

// 行程详情
export interface TripDetailResp {
  id: number
  destination: string
  days: number
  budget_level: string
  status: number
  created_at: string
  route: TripRoute
}

// 行程API
export const tripApi = {
  // 生成行程（公开，非流式）
  generate: (params: GenerateParams) => {
    return request<GenerateResp>({
      url: '/public/trip/generate',
      method: 'POST',
      data: params,
      showLoading: true
    })
  },

  // 生成并保存行程（需登录，非流式）
  generateAndSave: (params: GenerateParams) => {
    return request<{ trip_id: number; profile: UserProfile; routes: TripRoute[] }>({
      url: '/api/trip/generate',
      method: 'POST',
      data: params,
      showLoading: true
    })
  },

  // 生成行程（流式，公开）
  generateStream: (params: GenerateParams) => {
    return `${BASE_URL}/public/trip/generate/stream`
  },

  // 生成并保存行程（流式，需登录）
  generateStreamAndSave: (params: GenerateParams) => {
    return `${BASE_URL}/api/trip/generate/stream`
  },

  // 获取行程历史
  getHistory: (page = 1, pageSize = 10) => {
    return request<{
      total: number
      page: number
      page_size: number
      list: TripHistoryItem[]
    }>({
      url: '/api/trip/history',
      method: 'GET',
      data: { page, page_size: pageSize }
    })
  },

  // 获取行程详情
  getDetail: (id: number) => {
    return request<TripDetailResp>({
      url: `/api/trip/${id}`,
      method: 'GET'
    })
  },

  // 删除行程
  deleteTrip: (id: number) => {
    return request<{ deleted: number }>({
      url: `/api/trip/${id}`,
      method: 'DELETE'
    })
  },

  // 修改行程
  updateTrip: (id: number, data: { destination?: string; days?: number; budget_level?: string }) => {
    return request({
      url: `/api/trip/${id}`,
      method: 'PUT',
      data
    })
  },

  // 确认行程
  confirmTrip: (id: number) => {
    return request<{ status: number }>({
      url: `/api/trip/${id}/confirm`,
      method: 'POST'
    })
  },

  // 获取收藏列表
  getFavorites: (page = 1, pageSize = 10) => {
    return request<{
      total: number
      page: number
      page_size: number
      list: TripHistoryItem[]
    }>({
      url: '/api/trip/favorites',
      method: 'GET',
      data: { page, page_size: pageSize }
    })
  },

  // 切换收藏状态
  toggleFavorite: (id: number) => {
    return request<{ trip_id: number; is_favorite: boolean }>({
      url: `/api/trip/${id}/favorite`,
      method: 'POST'
    })
  },

  // 获取用户画像
  getProfile: () => {
    return request<{ user_id: number; preferences: string[]; budget_level: string }>({
      url: '/api/profile',
      method: 'GET'
    })
  }
}
