"use strict";
const common_vendor = require("../common/vendor.js");
const utils_env = require("../utils/env.js");
function getSessionId() {
  let sessionId = common_vendor.index.getStorageSync("cart_session");
  if (!sessionId) {
    sessionId = "cart_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
    common_vendor.index.setStorageSync("cart_session", sessionId);
  }
  return sessionId;
}
function request(options) {
  const token = common_vendor.index.getStorageSync("token");
  const sessionId = getSessionId();
  return new Promise((resolve, reject) => {
    if (options.showLoading) {
      common_vendor.index.showLoading({ title: "加载中..." });
    }
    const requestOptions = {
      url: utils_env.BASE_URL + options.url,
      method: options.method || "GET",
      data: options.data,
      header: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        "X-Cart-Session": sessionId,
        ...options.header
      },
      timeout: options.timeout || 1e4,
      success: (res) => {
        if (options.showLoading) {
          common_vendor.index.hideLoading();
        }
        console.log("API响应:", options.url, res);
        if (res.statusCode === 200) {
          const data = res.data;
          if (data.code === 200) {
            resolve(data);
          } else if (data.code === 401) {
            common_vendor.index.removeStorageSync("token");
            common_vendor.index.showToast({ title: "请先登录", icon: "none" });
            reject(new Error(data.message || "未授权"));
          } else {
            common_vendor.index.showToast({ title: data.message || "请求失败", icon: "none" });
            reject(new Error(data.message || "请求失败"));
          }
        } else if (res.statusCode === 401) {
          common_vendor.index.removeStorageSync("token");
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          reject(new Error("未授权"));
        } else {
          common_vendor.index.showToast({ title: "请求失败", icon: "none" });
          reject(new Error("请求失败"));
        }
      },
      fail: (error) => {
        if (options.showLoading) {
          common_vendor.index.hideLoading();
        }
        console.error("请求失败:", options.url, error);
        common_vendor.index.showToast({ title: "网络错误，请检查网络", icon: "none" });
        reject(error);
      }
    };
    common_vendor.index.request(requestOptions);
  });
}
exports.getSessionId = getSessionId;
exports.request = request;
