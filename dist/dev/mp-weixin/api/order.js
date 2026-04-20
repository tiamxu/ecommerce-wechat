"use strict";
const api_request = require("./request.js");
const orderApi = {
  // 创建订单
  create(params) {
    return api_request.request({
      url: "/orders",
      method: "POST",
      data: params,
      showLoading: true
    });
  },
  // 获取订单列表
  getList(params) {
    return api_request.request({
      url: "/orders",
      method: "GET",
      data: params,
      showLoading: true
    });
  },
  // 获取订单详情
  getDetail(orderId) {
    return api_request.request({
      url: `/orders/${orderId}`,
      method: "GET",
      showLoading: true
    });
  },
  // 获取收货地址列表
  getAddresses() {
    return api_request.request({
      url: "/addresses",
      method: "GET",
      showLoading: true
    });
  },
  // 添加收货地址
  addAddress(params) {
    return api_request.request({
      url: "/addresses",
      method: "POST",
      data: params,
      showLoading: true
    });
  },
  // 更新收货地址
  updateAddress(id, params) {
    return api_request.request({
      url: `/addresses/${id}`,
      method: "PUT",
      data: params
    });
  },
  // 删除收货地址
  deleteAddress(id) {
    return api_request.request({
      url: `/addresses/${id}`,
      method: "DELETE",
      showLoading: true
    });
  },
  // 取消订单
  cancel(orderId) {
    return api_request.request({
      url: `/orders/${orderId}/cancel`,
      method: "PUT",
      showLoading: true
    });
  }
};
exports.orderApi = orderApi;
