"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const store_user = require("./store/user.js");
const i18n_index = require("./i18n/index.js");
if (!Math) {
  "./pages/index/index.js";
  "./pages/product/list.js";
  "./pages/product/detail.js";
  "./pages/cart/index.js";
  "./pages/order/confirm.js";
  "./pages/order/list.js";
  "./pages/order/detail.js";
  "./pages/order/success.js";
  "./pages/user/index.js";
  "./pages/user/edit.js";
  "./pages/user/password.js";
  "./pages/user/login.js";
  "./pages/address/list.js";
  "./pages/address/edit.js";
  "./pages/search/index.js";
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "App",
  setup(__props) {
    const userStore = store_user.useUserStore();
    userStore.init();
    return (_ctx, _cache) => {
      return {};
    };
  }
});
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  const pinia = common_vendor.createPinia();
  app.use(pinia);
  app.use(i18n_index.i18n);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
