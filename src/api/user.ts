import { request, type ApiResponse } from './request'

export interface UserInfo {
  id: number
  username: string
  openid?: string
  nickname?: string
  avatar?: string
  email?: string
  phone?: string
  createdAt?: string
}

export interface UpdateProfileParams {
  email?: string
  phone?: string
}

export interface UpdatePasswordParams {
  oldPassword: string
  newPassword: string
}

export interface BindPhoneParams {
  phone: string
  password: string
}

export const userApi = {
  // 获取用户个人信息
  getProfile(): Promise<ApiResponse<UserInfo>> {
    return request({
      url: '/api/users/profile',
      method: 'GET',
      showLoading: true
    })
  },

  // 更新用户个人信息
  updateProfile(params: UpdateProfileParams): Promise<ApiResponse<void>> {
    return request({
      url: '/api/users/profile',
      method: 'PUT',
      data: params,
      showLoading: true
    })
  },

  // 修改密码
  updatePassword(params: UpdatePasswordParams): Promise<ApiResponse<void>> {
    return request({
      url: '/api/users/password',
      method: 'PUT',
      data: params,
      showLoading: true
    })
  },

  // 绑定手机号（微信用户设置密码）
  bindPhone(params: BindPhoneParams): Promise<ApiResponse<void>> {
    return request({
      url: '/api/users/bind-phone',
      method: 'POST',
      data: params,
      showLoading: true
    })
  }
}
