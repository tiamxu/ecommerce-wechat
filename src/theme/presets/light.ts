// 浅色主题 - 清新自然风
import { ThemePreset } from '../tokens'

export const lightTheme: ThemePreset = {
  key: 'light',
  name: '浅色',
  nameEn: 'Light',
  description: '简约清新的浅色主题',
  isDark: false,
  colors: {
    primary: '#07c160',
    primaryHover: '#10b365',
    primaryLight: '#e8f6ef',
    accent: '#ff6034',
    accentHover: '#ff7d5a',
    accentLight: '#fff0ed',
    price: '#ff4d4f',
    bgPage: '#f8fff9',
    bgCard: '#ffffff',
    bgHeader: '#ffffff',
    bgInput: '#f5f5f5',
    textMain: '#1a1a1a',
    textSub: '#666666',
    textPlaceholder: '#999999',
    textInverse: '#ffffff',
    border: '#e8f5ec',
    shadow: 'rgba(7, 193, 96, 0.08)',
    tabBarBg: '#ffffff',
    tabBarColor: '#999999',
    tabBarActive: '#07c160'
  }
}
