// 深色主题 - 护眼暗色
import { ThemePreset } from '../tokens'

export const darkTheme: ThemePreset = {
  key: 'dark',
  name: '深色',
  nameEn: 'Dark',
  description: '护眼的深色主题',
  isDark: true,
  colors: {
    primary: '#4d7cff',
    primaryHover: '#6b99ff',
    primaryLight: '#2a3a5c',
    accent: '#ff7d41',
    accentHover: '#ff9d6b',
    accentLight: '#3d2a1a',
    price: '#ff6b6b',
    bgPage: '#1a1a1a',
    bgCard: '#2a2a2a',
    bgHeader: '#2a2a2a',
    bgInput: '#3a3a3a',
    textMain: '#ffffff',
    textSub: '#a0a0a0',
    textPlaceholder: '#666666',
    textInverse: '#1a1a1a',
    border: '#3a3a3a',
    shadow: 'rgba(0, 0, 0, 0.3)',
    tabBarBg: '#2a2a2a',
    tabBarColor: '#666666',
    tabBarActive: '#4d7cff'
  }
}
