"use strict";
const api_request = require("./request.js");
function cleanParams(params) {
  const cleaned = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== void 0 && value !== null && value !== "") {
      cleaned[key] = value;
    }
  }
  return cleaned;
}
const productApi = {
  // 获取商品列表
  getList(params) {
    return api_request.request({
      url: "/public/products",
      method: "GET",
      data: cleanParams({ ...params, lang: "zh", status: "1" }),
      showLoading: true
    });
  },
  // 获取热门推荐商品
  getHotProducts(pageSize = 6) {
    return api_request.request({
      url: "/public/products",
      method: "GET",
      data: { pageNo: 1, pageSize, lang: "zh", status: "1", tag: "hot" },
      showLoading: false
    });
  },
  // 获取商品详情
  getDetail(id) {
    return api_request.request({
      url: `/public/products/${id}`,
      method: "GET",
      data: { lang: "zh" },
      showLoading: true
    });
  },
  // 获取分类列表
  getCategories() {
    return api_request.request({
      url: "/public/categories",
      method: "GET",
      data: { lang: "zh" },
      showLoading: false
    });
  },
  // 获取内容块（如 Banner）
  getContents(category) {
    return api_request.request({
      url: "/public/contents",
      method: "GET",
      data: { category },
      showLoading: false
    });
  }
};
exports.productApi = productApi;
