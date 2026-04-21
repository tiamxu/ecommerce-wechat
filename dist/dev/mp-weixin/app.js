"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const i18n_index = require("./i18n/index.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/product/list.js";
  "./pages/product/detail.js";
  "./pages/cart/index.js";
  "./pages/order/confirm.js";
  "./pages/order/list.js";
  "./pages/user/index.js";
  "./pages/address/list.js";
  "./pages/address/edit.js";
  "./pages/search/index.js";
}
const _sfc_main = {};
function _sfc_render(_ctx, _cache) {
  return {};
}
const App = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
function createApp() {
  const app = common_vendor.createSSRApp(App);
  const pinia = common_vendor.createPinia();
  app.use(pinia);
  app.use(i18n_index.i18n);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
