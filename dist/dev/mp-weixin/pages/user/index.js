"use strict";
const common_vendor = require("../../common/vendor.js");
const store_user = require("../../store/user.js");
const theme_config = require("../../theme/config.js");
if (!Math) {
  TabBar();
}
const TabBar = () => "../../components/TabBar.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const userStore = store_user.useUserStore();
    const menuItems = [
      { id: 1, icon: "📋", text: "我的订单", path: "/pages/order/list" },
      { id: 2, icon: "❤️", text: "我的收藏", path: "" },
      { id: 3, icon: "📍", text: "收货地址", path: "/pages/address/list" },
      { id: 5, icon: "⚙️", text: "设置", path: "" }
    ];
    function handleMenuClick(item) {
      if (item.path) {
        common_vendor.index.navigateTo({ url: item.path });
      }
    }
    function handleLogin() {
      if (!userStore.isLoggedIn) {
        userStore.login();
      }
    }
    function handleLogout() {
      common_vendor.index.showModal({
        title: "确认",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            userStore.logout();
          }
        }
      });
    }
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f, _g;
      return common_vendor.e({
        a: common_vendor.unref(userStore).isLoggedIn
      }, common_vendor.unref(userStore).isLoggedIn ? common_vendor.e({
        b: (_a = common_vendor.unref(userStore).userInfo) == null ? void 0 : _a.avatar
      }, ((_b = common_vendor.unref(userStore).userInfo) == null ? void 0 : _b.avatar) ? {
        c: common_vendor.unref(userStore).userInfo.avatar
      } : {
        d: common_vendor.t(((_d = (_c = common_vendor.unref(userStore).userInfo) == null ? void 0 : _c.nickname) == null ? void 0 : _d.charAt(0)) || "U")
      }, {
        e: common_vendor.t(((_e = common_vendor.unref(userStore).userInfo) == null ? void 0 : _e.nickname) || "用户"),
        f: (_f = common_vendor.unref(userStore).userInfo) == null ? void 0 : _f.phone
      }, ((_g = common_vendor.unref(userStore).userInfo) == null ? void 0 : _g.phone) ? {
        g: common_vendor.t(common_vendor.unref(userStore).userInfo.phone)
      } : {}) : {
        h: common_vendor.o(handleLogin)
      }, {
        i: common_vendor.f(menuItems, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.icon),
            b: common_vendor.t(item.text),
            c: item.id,
            d: common_vendor.o(($event) => handleMenuClick(item), item.id)
          };
        }),
        j: common_vendor.unref(userStore).isLoggedIn
      }, common_vendor.unref(userStore).isLoggedIn ? {
        k: common_vendor.o(handleLogout)
      } : {}, {
        l: common_vendor.n(common_vendor.unref(theme_config.THEME_CLASS))
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-642c545b"]]);
wx.createPage(MiniProgramPage);
