// 旅游主题 - 适合AI旅游规划助手
import { ThemePreset } from '../tokens'

export const travelTheme: ThemePreset = {
  key: 'travel',
  name: '旅行',
  nameEn: 'Travel',
  description: '清新治愈，适合AI旅游规划助手',
  isDark: false,
  colors: {
    primary: '#0ea5e9',      // 天空蓝
    primaryHover: '#38bdf8',  // 亮天蓝
    primaryLight: '#e0f2fe',  // 淡蓝背景
    accent: '#f97316',        // 暖橙色
    accentHover: '#fb923c',   // 亮橙色
    accentLight: '#fff7ed',   // 淡橙背景
    price: '#f97316',        // 橙色价格
    bgPage: '#f0fdfa',        // 淡青绿背景
    bgCard: '#ffffff',        // 白色卡片
    bgHeader: '#ffffff',       // 白色头部
    bgInput: '#f0fdfa',       // 淡青输入框
    textMain: '#0f172a',      // 深色文字
    textSub: '#64748b',       // 中灰次要文字
    textPlaceholder: '#94a3b8', // 浅灰占位符
    textInverse: '#ffffff',   // 白色反色
    border: '#e2e8f0',        // 浅灰边框
    shadow: 'rgba(14, 165, 233, 0.08)', // 蓝色阴影
    tabBarBg: '#ffffff',
    tabBarColor: '#94a3b8',
    tabBarActive: '#0ea5e9'
  }
}
