"use strict";
const common_vendor = require("../common/vendor.js");
const utils_env = require("../utils/env.js");
const useUserStore = common_vendor.defineStore("user", {
  state: () => ({
    token: common_vendor.index.getStorageSync("token") || null,
    userInfo: null
  }),
  getters: {
    isLoggedIn: (state) => !!state.token && !!state.userInfo
  },
  actions: {
    // 验证 token 有效性
    async verifyToken() {
      if (!this.token) {
        return false;
      }
      try {
        const res = await common_vendor.index.request({
          url: `${utils_env.BASE_URL}/api/users/profile`,
          method: "GET",
          header: { Authorization: `Bearer ${this.token}` }
        });
        const data = res.data;
        if (data.code === 200) {
          this.userInfo = data.data;
          return true;
        }
      } catch (error) {
        console.error("Token验证失败", error);
      }
      this.clearAuth();
      return false;
    },
    // 微信一键登录（获取手机号）
    async loginWithWechat(code, encryptedData, iv, sessionId) {
      var _a;
      try {
        const res = await common_vendor.index.request({
          url: `${utils_env.BASE_URL}/public/wechat/login`,
          method: "POST",
          data: { code, encryptedData, iv, sessionId }
        });
        const data = res.data;
        if (data.code === 200 && data.data.token) {
          this.token = data.data.token;
          this.userInfo = data.data.userInfo;
          common_vendor.index.setStorageSync("token", this.token);
          if ((_a = data.data.userInfo) == null ? void 0 : _a.openid) {
            common_vendor.index.setStorageSync("wechat_openid", data.data.userInfo.openid);
          }
          return { success: true };
        } else {
          return { success: false, message: data.message || "登录失败" };
        }
      } catch (error) {
        console.error("微信登录失败", error);
        return { success: false, message: error.message || "网络错误" };
      }
    },
    // 登出
    logout() {
      this.clearAuth();
      common_vendor.index.showToast({ title: "已退出登录", icon: "success" });
    },
    clearAuth() {
      this.token = null;
      this.userInfo = null;
      common_vendor.index.removeStorageSync("token");
      common_vendor.index.removeStorageSync("cart_session");
    },
    updateUserInfo(info) {
      if (this.userInfo) {
        this.userInfo = { ...this.userInfo, ...info };
      }
    },
    // 初始化：验证已有 token
    async init() {
      if (this.token) {
        await this.verifyToken();
      }
    }
  }
});
exports.useUserStore = useUserStore;
