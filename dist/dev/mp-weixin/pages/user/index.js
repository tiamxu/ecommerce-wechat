"use strict";
const common_vendor = require("../../common/vendor.js");
const store_user = require("../../store/user.js");
require("../../utils/env.js");
const api_user = require("../../api/user.js");
const theme_config = require("../../theme/config.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons.js";
if (!Math) {
  (TabBar + _easycom_uni_icons)();
}
const TabBar = () => "../../components/TabBar.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const userStore = store_user.useUserStore();
    const loading = common_vendor.ref(false);
    const userInfo = common_vendor.ref(null);
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
    function goTo(path) {
      if (path) {
        common_vendor.index.navigateTo({ url: path });
      }
    }
    function handleLogin() {
      if (!userStore.isLoggedIn) {
        common_vendor.index.navigateTo({ url: "/pages/user/login" });
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
    const orderTabs = [
      { id: "pending", text: "待付款", icon: "wallet", path: "/pages/order/list?status=pending" },
      { id: "paid", text: "待发货", icon: "box", path: "/pages/order/list?status=paid" },
      { id: "shipped", text: "待收货", icon: "car", path: "/pages/order/list?status=shipped" },
      { id: "completed", text: "已完成", icon: "check", path: "/pages/order/list?status=completed" }
    ];
    const menuItems = [
      { id: 1, icon: "location", text: "收货地址", path: "/pages/address/list" },
      { id: 2, icon: "heart", text: "我的收藏", path: "" },
      { id: 3, icon: "star", text: "关于我们", path: "/pages/about/index" }
    ];
    const accountItems = [
      { id: 4, icon: "locked", text: "修改密码", path: "/pages/user/password" },
      { id: 5, icon: "gear", text: "设置", path: "" }
    ];
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f;
      return common_vendor.e({
        a: common_vendor.unref(userStore).isLoggedIn
      }, common_vendor.unref(userStore).isLoggedIn ? common_vendor.e({
        b: (_a = userInfo.value) == null ? void 0 : _a.avatar
      }, ((_b = userInfo.value) == null ? void 0 : _b.avatar) ? {
        c: userInfo.value.avatar
      } : {
        d: common_vendor.t((((_c = userInfo.value) == null ? void 0 : _c.nickname) || ((_d = userInfo.value) == null ? void 0 : _d.username) || "U").charAt(0).toUpperCase())
      }, {
        e: common_vendor.t(((_e = userInfo.value) == null ? void 0 : _e.nickname) || ((_f = userInfo.value) == null ? void 0 : _f.username) || "微信用户")
      }) : {
        f: common_vendor.p({
          type: "person",
          size: "40",
          color: "var(--text-placeholder)"
        }),
        g: common_vendor.p({
          type: "right",
          size: "16",
          color: "var(--text-placeholder)"
        }),
        h: common_vendor.o(handleLogin)
      }, {
        i: common_vendor.unref(userStore).isLoggedIn
      }, common_vendor.unref(userStore).isLoggedIn ? {
        j: common_vendor.p({
          type: "right",
          size: "12",
          color: "var(--text-placeholder)"
        }),
        k: common_vendor.o(($event) => goTo("/pages/order/list")),
        l: common_vendor.f(orderTabs, (tab, k0, i0) => {
          return {
            a: "642c545b-4-" + i0,
            b: common_vendor.p({
              type: tab.icon,
              size: "28",
              color: "var(--text-main)"
            }),
            c: common_vendor.t(tab.text),
            d: tab.id,
            e: common_vendor.o(($event) => goTo(tab.path), tab.id)
          };
        })
      } : {
        m: common_vendor.f(orderTabs, (tab, k0, i0) => {
          return {
            a: "642c545b-5-" + i0,
            b: common_vendor.p({
              type: tab.icon,
              size: "28",
              color: "var(--text-placeholder)"
            }),
            c: common_vendor.t(tab.text),
            d: tab.id
          };
        })
      }, {
        n: common_vendor.f(menuItems, (item, index, i0) => {
          return {
            a: "642c545b-6-" + i0,
            b: common_vendor.p({
              type: item.icon,
              size: "22",
              color: "var(--primary)"
            }),
            c: common_vendor.t(item.text),
            d: "642c545b-7-" + i0,
            e: item.id,
            f: common_vendor.o(($event) => item.path ? goTo(item.path) : _ctx.uni.showToast({
              title: "功能开发中",
              icon: "none"
            }), item.id)
          };
        }),
        o: common_vendor.p({
          type: "right",
          size: "14",
          color: "var(--text-placeholder)"
        }),
        p: common_vendor.f(accountItems, (item, k0, i0) => {
          return {
            a: "642c545b-8-" + i0,
            b: common_vendor.p({
              type: item.icon,
              size: "22",
              color: "var(--primary)"
            }),
            c: common_vendor.t(item.text),
            d: "642c545b-9-" + i0,
            e: item.id,
            f: common_vendor.o(($event) => item.path ? goTo(item.path) : _ctx.uni.showToast({
              title: "功能开发中",
              icon: "none"
            }), item.id)
          };
        }),
        q: common_vendor.p({
          type: "right",
          size: "14",
          color: "var(--text-placeholder)"
        }),
        r: common_vendor.unref(userStore).isLoggedIn
      }, common_vendor.unref(userStore).isLoggedIn ? {
        s: common_vendor.o(handleLogout)
      } : {}, {
        t: common_vendor.n(common_vendor.unref(theme_config.THEME_CLASS))
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-642c545b"]]);
wx.createPage(MiniProgramPage);
