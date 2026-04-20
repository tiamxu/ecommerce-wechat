import { defineStore } from 'pinia'
import { themes, type ThemeType } from '../theme/tokens'
import { CURRENT_THEME } from '../theme/config'

interface ThemeState {
  currentTheme: ThemeType
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeState => ({
    // 强制使用配置文件中的主题，不读取用户本地存储
    currentTheme: CURRENT_THEME
  }),

  actions: {
    initTheme() {
      // 固定使用配置中的主题，不支持运行时切换
      this.currentTheme = CURRENT_THEME
      this.applyTheme()
    },

    applyTheme() {
      const colors = themes[this.currentTheme].colors
      const root = document.documentElement

      root.style.setProperty('--primary', colors.primary)
      root.style.setProperty('--primary-hover', colors.primaryHover)
      root.style.setProperty('--accent', colors.accent)
      root.style.setProperty('--accent-hover', colors.accentHover)
      root.style.setProperty('--price', colors.price)
      root.style.setProperty('--bg-page', colors.bgPage)
      root.style.setProperty('--bg-card', colors.bgCard)
      root.style.setProperty('--bg-header', colors.bgHeader)
      root.style.setProperty('--text-main', colors.textMain)
      root.style.setProperty('--text-sub', colors.textSub)
      root.style.setProperty('--text-placeholder', colors.textPlaceholder)
      root.style.setProperty('--border', colors.border)
      root.style.setProperty('--shadow', colors.shadow)
    }
  },

  getters: {
    themeConfig: (state) => themes[state.currentTheme],
    // 不再暴露主题列表给用户选择
    availableThemes: () => Object.entries(themes).map(([key, value]) => ({
      key: key as ThemeType,
      name: value.name
    }))
  }
})