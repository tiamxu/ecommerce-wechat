// 主题系统类型定义

export type ThemeType = 'light' | 'dark' | 'blue' | 'luxury' | 'purple'

export interface ThemeColors {
  // 主色系
  primary: string
  primaryHover: string
  primaryLight: string

  // 强调色系
  accent: string
  accentHover: string
  accentLight: string

  // 价格色
  price: string

  // 背景色
  bgPage: string
  bgCard: string
  bgHeader: string
  bgInput: string

  // 文字色
  textMain: string
  textSub: string
  textPlaceholder: string
  textInverse: string

  // 边框与阴影
  border: string
  shadow: string

  // TabBar
  tabBarBg: string
  tabBarColor: string
  tabBarActive: string
}

export interface ThemePreset {
  key: string
  name: string
  nameEn: string
  description?: string
  thumbnail?: string
  isDark?: boolean
  colors: ThemeColors
}
