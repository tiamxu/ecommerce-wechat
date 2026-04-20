"use strict";
const common_vendor = require("../common/vendor.js");
const theme_tokens = require("../theme/tokens.js");
const theme_config = require("../theme/config.js");
const useThemeStore = common_vendor.defineStore("theme", {
  state: () => ({
    // 强制使用配置文件中的主题，不读取用户本地存储
    currentTheme: theme_config.CURRENT_THEME
  }),
  actions: {
    initTheme() {
      this.currentTheme = theme_config.CURRENT_THEME;
      this.applyTheme();
    },
    applyTheme() {
      const colors = theme_tokens.themes[this.currentTheme].colors;
      const root = document.documentElement;
      root.style.setProperty("--primary", colors.primary);
      root.style.setProperty("--primary-hover", colors.primaryHover);
      root.style.setProperty("--accent", colors.accent);
      root.style.setProperty("--accent-hover", colors.accentHover);
      root.style.setProperty("--price", colors.price);
      root.style.setProperty("--bg-page", colors.bgPage);
      root.style.setProperty("--bg-card", colors.bgCard);
      root.style.setProperty("--bg-header", colors.bgHeader);
      root.style.setProperty("--text-main", colors.textMain);
      root.style.setProperty("--text-sub", colors.textSub);
      root.style.setProperty("--text-placeholder", colors.textPlaceholder);
      root.style.setProperty("--border", colors.border);
      root.style.setProperty("--shadow", colors.shadow);
    }
  },
  getters: {
    themeConfig: (state) => theme_tokens.themes[state.currentTheme],
    // 不再暴露主题列表给用户选择
    availableThemes: () => Object.entries(theme_tokens.themes).map(([key, value]) => ({
      key,
      name: value.name
    }))
  }
});
exports.useThemeStore = useThemeStore;
