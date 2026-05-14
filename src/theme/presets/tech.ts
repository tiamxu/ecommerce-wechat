// 科技主题 - 适合音箱/耳机/数码产品
import { ThemePreset } from '../tokens'

export const techTheme: ThemePreset = {
  key: 'tech',
  name: '科技',
  nameEn: 'Tech',
  description: '科技感强，适合音箱耳机等数码产品',
  isDark: false,
  colors: {
    primary: '#6366f1',      // 靛蓝紫，科技感
    primaryHover: '#818cf8',  // 亮紫色
    primaryLight: '#e0e7ff',  // 淡紫色背景
    accent: '#f97316',        // 橙色，音乐/活力
    accentHover: '#fb923c',   // 亮橙色
    accentLight: '#fff7ed',   // 淡橙色背景
    price: '#f97316',        // 橙色价格
    bgPage: '#f8fafc',        // 浅灰白背景
    bgCard: '#ffffff',        // 白色卡片
    bgHeader: '#ffffff',       // 白色头部
    bgInput: '#f1f5f9',       // 浅灰输入框
    textMain: '#1e293b',      // 深灰文字
    textSub: '#64748b',       // 中灰次要文字
    textPlaceholder: '#94a3b8', // 浅灰占位符
    textInverse: '#ffffff',   // 白色反色
    border: '#e2e8f0',        // 浅灰边框
    shadow: 'rgba(99, 102, 241, 0.08)', // 紫色阴影
    tabBarBg: '#ffffff',
    tabBarColor: '#94a3b8',
    tabBarActive: '#6366f1'
  }
}