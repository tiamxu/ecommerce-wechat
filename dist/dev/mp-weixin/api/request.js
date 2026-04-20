"use strict";
const common_vendor = require("../common/vendor.js");
const utils_env = require("../utils/env.js");
function request(options) {
  const token = common_vendor.index.getStorageSync("token");
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
        ...options.header
      },
      timeout: options.timeout || 1e4,
      success: (res) => {
        if (options.showLoading) {
          common_vendor.index.hideLoading();
        }
        if (res.statusCode === 200) {
          resolve(res.data);
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
        {
          console.error("请求失败:", error);
          common_vendor.index.showToast({ title: "网络错误", icon: "none" });
          reject(error);
        }
      }
    };
    common_vendor.index.request(requestOptions);
  });
}
function mockRequest(mockData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: "success",
        data: mockData
      });
    }, 300);
  });
}
exports.mockRequest = mockRequest;
exports.request = request;
