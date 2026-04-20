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
  // 获取订单列表
  getList(params) {
    return api_request.request({
      url: "/order/query",
      method: "GET",
      data: params,
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
  // 获取收货地址列表（后端暂无接口，TODO）
  getAddresses() {
    return api_request.request({
      url: "/addresses",
      method: "GET",
      showLoading: true
    });
  },
  // 添加收货地址（后端暂无接口，TODO）
  addAddress(params) {
    return api_request.request({
      url: "/addresses",
      method: "POST",
      data: params,
      showLoading: true
    });
  },
  // 更新收货地址（后端暂无接口，TODO）
  updateAddress(id, params) {
    return api_request.request({
      url: `/addresses/${id}`,
      method: "PUT",
      data: params
    });
  },
  // 删除收货地址（后端暂无接口，TODO）
  deleteAddress(id) {
    return api_request.request({
      url: `/addresses/${id}`,
      method: "DELETE",
      showLoading: true
    });
  }
};
exports.orderApi = orderApi;
