"use strict";
const common_vendor = require("../../common/vendor.js");
const store_user = require("../../store/user.js");
require("../../utils/env.js");
const api_user = require("../../api/user.js");
const theme_config = require("../../theme/config.js");
if (!Math) {
  TabBar();
}
const TabBar = () => "../../components/TabBar.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const userStore = store_user.useUserStore();
    const loading = common_vendor.ref(false);
    const userInfo = common_vendor.ref(null);
    const hasPhone = common_vendor.computed(() => {
      var _a;
      return !!((_a = userInfo.value) == null ? void 0 : _a.phone);
    });
    const menuItems = common_vendor.computed(() => {
      const items = [
        { id: 1, icon: "📋", text: "我的订单", path: "/pages/order/list" },
        { id: 2, icon: "❤️", text: "我的收藏", path: "" },
        { id: 3, icon: "📍", text: "收货地址", path: "/pages/address/list" },
        { id: 4, icon: "✏️", text: "编辑资料", path: "/pages/user/edit" }
      ];
      if (!hasPhone.value) {
        items.push({ id: 5, icon: "📱", text: "绑定手机号", path: "/pages/user/bind-phone" });
      } else {
        items.push({ id: 5, icon: "🔑", text: "修改密码", path: "/pages/user/password" });
      }
      items.push({ id: 6, icon: "⚙️", text: "设置", path: "" });
      return items;
    });
    common_vendor.onMounted(() => {
      if (userStore.isLoggedIn) {
        loadUserInfo();
      }
    });
    async function loadUserInfo() {
      loading.value = true;
      try {
        const res = await api_user.userApi.getProfile();
        if (res.code === 200 && res.data) {
          userInfo.value = res.data;
          userStore.updateUserInfo(res.data);
        }
      } catch (error) {
        console.error("加载用户信息失败", error);
      } finally {
        loading.value = false;
      }
    }
    function handleMenuClick(item) {
      if (item.path) {
        common_vendor.index.navigateTo({ url: item.path });
      } else if (item.text === "我的收藏" || item.text === "设置") {
        common_vendor.index.showToast({ title: "功能开发中", icon: "none" });
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
            userInfo.value = null;
          }
        }
      });
    }
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      return common_vendor.e({
        a: common_vendor.unref(userStore).isLoggedIn
      }, common_vendor.unref(userStore).isLoggedIn ? common_vendor.e({
        b: (_a = userInfo.value) == null ? void 0 : _a.avatar
      }, ((_b = userInfo.value) == null ? void 0 : _b.avatar) ? {
        c: userInfo.value.avatar
      } : {
        d: common_vendor.t((((_c = userInfo.value) == null ? void 0 : _c.nickname) || ((_d = userInfo.value) == null ? void 0 : _d.username) || "U").charAt(0).toUpperCase())
      }, {
        e: common_vendor.t(((_e = userInfo.value) == null ? void 0 : _e.nickname) || ((_f = userInfo.value) == null ? void 0 : _f.username) || "微信用户"),
        f: (_g = userInfo.value) == null ? void 0 : _g.phone
      }, ((_h = userInfo.value) == null ? void 0 : _h.phone) ? {
        g: common_vendor.t(userInfo.value.phone)
      } : {}) : {
        h: common_vendor.o(handleLogin)
      }, {
        i: common_vendor.unref(userStore).isLoggedIn && userInfo.value
      }, common_vendor.unref(userStore).isLoggedIn && userInfo.value ? common_vendor.e({
        j: common_vendor.t(userInfo.value.id),
        k: userInfo.value.createdAt
      }, userInfo.value.createdAt ? {
        l: common_vendor.t(userInfo.value.createdAt)
      } : {}) : {}, {
        m: common_vendor.f(menuItems.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.icon),
            b: common_vendor.t(item.text),
            c: item.id,
            d: common_vendor.o(($event) => handleMenuClick(item), item.id)
          };
        }),
        n: common_vendor.unref(userStore).isLoggedIn
      }, common_vendor.unref(userStore).isLoggedIn ? {
        o: common_vendor.o(handleLogout)
      } : {}, {
        p: common_vendor.n(common_vendor.unref(theme_config.THEME_CLASS))
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-642c545b"]]);
wx.createPage(MiniProgramPage);
