// 主题运行时配置
import { themes, type ThemePreset } from './presets'
import type { ThemeType } from './tokens'

// 当前主题: light | dark | blue | luxury | purple
export const CURRENT_THEME: ThemeType = 'blue'

// 主题 CSS 类名（用于页面根视图）
export const THEME_CLASS = `theme-${CURRENT_THEME}`

// 启用的主题列表
export const ENABLED_THEMES: ThemeType[] = ['light', 'dark', 'blue', 'luxury', 'purple']

// 获取当前主题配置
export function getCurrentTheme(): ThemePreset {
  return themes[CURRENT_THEME] || themes.light
}

// 获取可用的主题列表
export function getAvailableThemes(): ThemePreset[] {
  return ENABLED_THEMES.map(key => themes[key]).filter(Boolean)
}