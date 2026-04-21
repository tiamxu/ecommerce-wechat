"use strict";
const api_request = require("./request.js");
const cartApi = {
  // 获取购物车列表
  getList() {
    return api_request.request({
      url: "/cart",
      method: "GET",
      showLoading: true
    });
  },
  // 添加到购物车
  add(params) {
    return api_request.request({
      url: "/cart/items",
      method: "POST",
      data: params,
      showLoading: true
    });
  },
  // 更新购物车数量
  update(productId, quantity) {
    return api_request.request({
      url: `/cart/items/${productId}`,
      method: "PUT",
      data: { quantity }
    });
  },
  // 删除购物车商品
  remove(productId) {
    return api_request.request({
      url: `/cart/items/${productId}`,
      method: "DELETE",
      showLoading: true
    });
  },
  // 清空购物车
  clear() {
    return api_request.request({
      url: "/cart",
      method: "DELETE",
      showLoading: true
    });
  }
};
exports.cartApi = cartApi;
