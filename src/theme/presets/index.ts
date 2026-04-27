// 预设主题索引
import { lightTheme } from './light'
import { darkTheme } from './dark'
import { blueTheme } from './blue'
import { luxuryTheme } from './luxury'
import { purpleTheme } from './purple'
import type { ThemePreset } from '../tokens'

// 导出所有预设主题
export const themes: Record<string, ThemePreset> = {
  light: lightTheme,
  dark: darkTheme,
  blue: blueTheme,
  luxury: luxuryTheme,
  purple: purpleTheme
}

// 导出单个主题便于引用
export { lightTheme } from './light'
export { darkTheme } from './dark'
export { blueTheme } from './blue'
export { luxuryTheme } from './luxury'
export { purpleTheme } from './purple'
