"use strict";
const common_vendor = require("../../common/vendor.js");
const api_product = require("../../api/product.js");
require("../../utils/env.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "detail",
  setup(__props) {
    const product = common_vendor.ref(null);
    const loading = common_vendor.ref(false);
    const quantity = common_vendor.ref(1);
    common_vendor.ref(0);
    common_vendor.onMounted(() => {
      var _a;
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const id = (_a = currentPage == null ? void 0 : currentPage.options) == null ? void 0 : _a.id;
      if (id) {
        loadProduct(Number(id));
      }
    });
    async function loadProduct(id) {
      loading.value = true;
      try {
        const res = await api_product.productApi.getDetail(id);
        if (res.code === 200 && res.data) {
          product.value = res.data;
        }
      } catch (error) {
      } finally {
        loading.value = false;
      }
    }
    function decreaseQty() {
      if (quantity.value > 1) {
        quantity.value--;
      }
    }
    function increaseQty() {
      if (product.value && quantity.value < product.value.stock) {
        quantity.value++;
      }
    }
    function addToCart() {
      common_vendor.index.showToast({ title: "已加入购物车", icon: "success" });
    }
    function buyNow() {
      common_vendor.index.setStorageSync("quickBuy", {
        productId: product.value.id,
        quantity: quantity.value
      });
      common_vendor.index.navigateTo({
        url: "/pages/order/confirm"
      });
    }
    return (_ctx, _cache) => {
      var _a, _b, _c, _d, _e, _f;
      return common_vendor.e({
        a: common_vendor.t(((_b = (_a = product.value) == null ? void 0 : _a.name) == null ? void 0 : _b.charAt(0)) || "P"),
        b: product.value
      }, product.value ? common_vendor.e({
        c: common_vendor.t(product.value.price),
        d: common_vendor.t(_ctx.$t("product.stock")),
        e: common_vendor.t(product.value.stock),
        f: common_vendor.t(product.value.name),
        g: product.value.description
      }, product.value.description ? {
        h: common_vendor.t(product.value.description)
      } : {}) : {}, {
        i: (_d = (_c = product.value) == null ? void 0 : _c.tags) == null ? void 0 : _d.length
      }, ((_f = (_e = product.value) == null ? void 0 : _e.tags) == null ? void 0 : _f.length) ? {
        j: common_vendor.f(product.value.tags, (tag, k0, i0) => {
          return {
            a: common_vendor.t(tag),
            b: tag
          };
        })
      } : {}, {
        k: common_vendor.o(decreaseQty),
        l: common_vendor.t(quantity.value),
        m: common_vendor.o(increaseQty),
        n: common_vendor.t(_ctx.$t("product.addCart")),
        o: common_vendor.o(addToCart),
        p: common_vendor.t(_ctx.$t("product.buyNow")),
        q: common_vendor.o(buyNow)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8216645a"]]);
wx.createPage(MiniProgramPage);
