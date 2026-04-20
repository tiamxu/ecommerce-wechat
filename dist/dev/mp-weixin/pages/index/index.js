"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  ThemeSwitcher();
}
const ThemeSwitcher = () => "../../components/ThemeSwitcher.js";
function navigateTo(url) {
  common_vendor.index.navigateTo({ url });
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(($event) => navigateTo("/pages/product/list")),
        b: common_vendor.o(($event) => navigateTo("/pages/cart/index")),
        c: common_vendor.o(($event) => navigateTo("/pages/user/index"))
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-83a5a03c"]]);
wx.createPage(MiniProgramPage);
