"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "detail",
  setup(__props) {
    const product = common_vendor.ref({
      id: 1,
      name: "示例商品",
      price: 299,
      stock: 100,
      description: "这是商品的详细描述信息，包含商品的特点、材质、使用方法等。",
      coverImage: "",
      images: [],
      tags: ["热销", "新品"]
    });
    const quantity = common_vendor.ref(1);
    common_vendor.ref(0);
    function decreaseQty() {
      if (quantity.value > 1) {
        quantity.value--;
      }
    }
    function increaseQty() {
      if (quantity.value < product.value.stock) {
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
      var _a, _b, _c;
      return common_vendor.e({
        a: common_vendor.t(((_a = product.value.name) == null ? void 0 : _a.charAt(0)) || "P"),
        b: common_vendor.t(product.value.price),
        c: common_vendor.t(_ctx.$t("product.stock")),
        d: common_vendor.t(product.value.stock),
        e: common_vendor.t(product.value.name),
        f: product.value.description
      }, product.value.description ? {
        g: common_vendor.t(product.value.description)
      } : {}, {
        h: (_b = product.value.tags) == null ? void 0 : _b.length
      }, ((_c = product.value.tags) == null ? void 0 : _c.length) ? {
        i: common_vendor.f(product.value.tags, (tag, k0, i0) => {
          return {
            a: common_vendor.t(tag),
            b: tag
          };
        })
      } : {}, {
        j: common_vendor.o(decreaseQty),
        k: common_vendor.t(quantity.value),
        l: common_vendor.o(increaseQty),
        m: common_vendor.t(_ctx.$t("product.addCart")),
        n: common_vendor.o(addToCart),
        o: common_vendor.t(_ctx.$t("product.buyNow")),
        p: common_vendor.o(buyNow)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8216645a"]]);
wx.createPage(MiniProgramPage);
