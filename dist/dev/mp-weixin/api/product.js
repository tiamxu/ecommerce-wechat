"use strict";
const api_request = require("./request.js");
const productApi = {
  // 获取商品列表
  getList(params) {
    return api_request.request({
      url: "/products",
      method: "GET",
      data: params,
      showLoading: true
    });
  },
  // 获取商品详情
  getDetail(id) {
    return api_request.request({
      url: `/products/${id}`,
      method: "GET",
      showLoading: true
    });
  },
  // 获取分类列表
  getCategories() {
    return api_request.request({
      url: "/categories",
      method: "GET",
      showLoading: true
    });
  }
};
exports.productApi = productApi;
