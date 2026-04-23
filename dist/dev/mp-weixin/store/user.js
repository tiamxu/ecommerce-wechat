"use strict";
const common_vendor = require("../common/vendor.js");
const utils_env = require("../utils/env.js");
const api_request = require("../api/request.js");
const useUserStore = common_vendor.defineStore("user", {
  state: () => ({
    token: common_vendor.index.getStorageSync("token") || null,
    userInfo: null,
    email: common_vendor.index.getStorageSync("user_email") || null
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    // 是否可以设置密码（微信用户没有密码）
    canSetPassword: (state) => {
      var _a;
      return !((_a = state.userInfo) == null ? void 0 : _a.phone);
    }
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
        const sessionId = api_request.getSessionId();
        const res = await common_vendor.index.request({
          url: `${utils_env.BASE_URL}/public/wechat/login`,
          method: "POST",
          data: { code: loginRes.code, sessionId }
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
        common_vendor.index.showToast({ title: error.message || "登录失败", icon: "none" });
      }
    },
    logout() {
      this.token = null;
      this.userInfo = null;
      this.email = null;
      common_vendor.index.removeStorageSync("token");
      common_vendor.index.removeStorageSync("user_email");
      common_vendor.index.showToast({ title: "已退出登录", icon: "success" });
    },
    setEmail(email) {
      this.email = email;
      common_vendor.index.setStorageSync("user_email", email);
    },
    updateUserInfo(info) {
      if (this.userInfo) {
        this.userInfo = { ...this.userInfo, ...info };
      }
    },
    async fetchUserInfo() {
      if (!this.token) return;
      try {
        const res = await common_vendor.index.request({
          url: `${utils_env.BASE_URL}/api/users/profile`,
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
    },
    async bindPhone(phone, password) {
      try {
        const res = await common_vendor.index.request({
          url: `${utils_env.BASE_URL}/api/users/bind-phone`,
          method: "POST",
          header: { Authorization: `Bearer ${this.token}` },
          data: { phone, password }
        });
        const data = res.data;
        if (data.code === 200) {
          if (this.userInfo) {
            this.userInfo.phone = phone;
          }
          common_vendor.index.showToast({ title: "绑定成功", icon: "success" });
          return { success: true };
        } else {
          common_vendor.index.showToast({ title: data.message || "绑定失败", icon: "none" });
          return { success: false, message: data.message };
        }
      } catch (error) {
        console.error("绑定手机号失败", error);
        common_vendor.index.showToast({ title: "绑定失败", icon: "none" });
        return { success: false, message: error.message };
      }
    }
  }
});
exports.useUserStore = useUserStore;
