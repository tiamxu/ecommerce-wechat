"use strict";
const common_vendor = require("../common/vendor.js");
const utils_env = require("../utils/env.js");
const useUserStore = common_vendor.defineStore("user", {
  state: () => ({
    token: common_vendor.index.getStorageSync("token") || null,
    userInfo: null
  }),
  getters: {
    isLoggedIn: (state) => !!state.token
  },
  actions: {
    async login() {
      try {
        const loginRes = await new Promise((resolve, reject) => {
          common_vendor.index.login({
            provider: "weixin",
            success: resolve,
            fail: reject
          });
        });
        if (!loginRes.code) {
          throw new Error("获取登录凭证失败");
        }
        const res = await common_vendor.index.request({
          url: `${utils_env.BASE_URL}/public/wechat/login`,
          method: "POST",
          data: { code: loginRes.code }
        });
        const data = res.data;
        if (data.code === 200) {
          this.token = data.data.token;
          this.userInfo = data.data.userInfo;
          common_vendor.index.setStorageSync("token", this.token);
          common_vendor.index.showToast({ title: "登录成功", icon: "success" });
        } else {
          throw new Error(data.message || "登录失败");
        }
      } catch (error) {
        {
          common_vendor.index.showToast({ title: error.message || "登录失败", icon: "none" });
        }
      }
    },
    logout() {
      this.token = null;
      this.userInfo = null;
      common_vendor.index.removeStorageSync("token");
      common_vendor.index.showToast({ title: "已退出登录", icon: "success" });
    },
    async fetchUserInfo() {
      if (!this.token) return;
      try {
        const res = await common_vendor.index.request({
          url: `${utils_env.BASE_URL}/user/info`,
          method: "GET",
          header: { Authorization: `Bearer ${this.token}` }
        });
        const data = res.data;
        if (data.code === 200) {
          this.userInfo = data.data;
        }
      } catch (error) {
        console.error("获取用户信息失败", error);
      }
    }
  }
});
exports.useUserStore = useUserStore;
