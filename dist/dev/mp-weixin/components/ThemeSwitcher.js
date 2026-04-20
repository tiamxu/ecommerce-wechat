"use strict";
const common_vendor = require("../common/vendor.js");
const store_theme = require("../store/theme.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "ThemeSwitcher",
  setup(__props) {
    const themeStore = store_theme.useThemeStore();
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(common_vendor.unref(themeStore).themeConfig.name)
      };
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8a827b0d"]]);
wx.createComponent(Component);
