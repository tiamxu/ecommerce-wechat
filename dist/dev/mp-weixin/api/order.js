"use strict";
const api_request = require("./request.js");
const orderApi = {
  // 创建订单
  create(params) {
    return api_request.request({
      url: "/order",
      method: "POST",
      data: params,
      showLoading: true
    });
  },
  // 获取我的订单列表（通过 JWT 自动识别用户）
  getMyOrders() {
    return api_request.request({
      url: "/order/my",
      method: "GET",
      showLoading: true
    });
  },
  // 获取订单详情
  getDetail(orderId) {
    return api_request.request({
      url: `/order/${orderId}`,
      method: "GET",
      showLoading: true
    });
  },
  // 取消订单
  cancel(orderId) {
    return api_request.request({
      url: `/order/${orderId}/cancel`,
      method: "PUT",
      showLoading: true
    });
  },
  // 支付订单
  pay(orderId) {
    return api_request.request({
      url: `/order/${orderId}/pay`,
      method: "POST",
      showLoading: true
    });
  },
  // 获取收货地址列表
  getAddresses() {
    return api_request.request({
      url: "/api/addresses",
      method: "GET",
      showLoading: true
    });
  },
  // 添加收货地址
  addAddress(params) {
    return api_request.request({
      url: "/api/addresses",
      method: "POST",
      data: params,
      showLoading: true
    });
  },
  // 更新收货地址
  updateAddress(id, params) {
    return api_request.request({
      url: `/api/addresses/${id}`,
      method: "PUT",
      data: params
    });
  },
  // 删除收货地址
  deleteAddress(id) {
    return api_request.request({
      url: `/api/addresses/${id}`,
      method: "DELETE",
      showLoading: true
    });
  }
};
exports.orderApi = orderApi;
