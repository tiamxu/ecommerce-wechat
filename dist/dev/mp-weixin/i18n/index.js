"use strict";
const common_vendor = require("../common/vendor.js");
const tabbar$1 = {
  home: "Home",
  product: "Product",
  cart: "Cart",
  user: "My"
};
const theme$1 = {
  title: "Theme",
  light: "Classic Business",
  dark: "Dark",
  green: "Nature",
  luxury: "Luxury"
};
const product$1 = {
  addCart: "Add to Cart",
  buyNow: "Buy Now",
  stock: "Stock",
  price: "Price"
};
const cart$1 = {
  empty: "Cart is empty",
  total: "Total",
  checkout: "Checkout"
};
const user$1 = {
  login: "Login",
  order: "My Orders",
  settings: "Settings",
  my: {
    order: "My Orders",
    favorite: "Favorites",
    address: "Address",
    settings: "Settings"
  }
};
const search$1 = {
  placeholder: "Search products",
  history: "Search History",
  hot: "Hot Search",
  clear: "Clear",
  cancel: "Cancel",
  noResult: "No results found",
  searching: "Searching..."
};
const en = {
  tabbar: tabbar$1,
  theme: theme$1,
  product: product$1,
  cart: cart$1,
  user: user$1,
  search: search$1
};
const tabbar = {
  home: "首页",
  product: "商品",
  cart: "购物车",
  user: "我的"
};
const theme = {
  title: "主题",
  light: "经典商务",
  dark: "深邃暗色",
  green: "清新自然",
  luxury: "高端轻奢"
};
const product = {
  addCart: "加入购物车",
  buyNow: "立即购买",
  stock: "库存",
  price: "价格"
};
const cart = {
  empty: "购物车是空的",
  total: "合计",
  checkout: "结算"
};
const user = {
  login: "登录",
  order: "我的订单",
  settings: "设置",
  my: {
    order: "我的订单",
    favorite: "我的收藏",
    address: "收货地址",
    settings: "设置"
  }
};
const search = {
  placeholder: "搜索商品",
  history: "搜索历史",
  hot: "热门搜索",
  clear: "清除",
  cancel: "取消",
  noResult: "未找到相关商品",
  searching: "搜索中..."
};
const zh = {
  tabbar,
  theme,
  product,
  cart,
  user,
  search
};
const i18n = common_vendor.createI18n({
  legacy: false,
  locale: "zh",
  fallbackLocale: "zh",
  messages: {
    en,
    zh
  }
});
exports.i18n = i18n;
