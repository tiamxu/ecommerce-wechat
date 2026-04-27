"use strict";
const common_vendor = require("../../common/vendor.js");
const api_product = require("../../api/product.js");
const api_cart = require("../../api/cart.js");
require("../../utils/env.js");
const store_user = require("../../store/user.js");
const theme_config = require("../../theme/config.js");
if (!Math) {
  TabBar();
}
const TabBar = () => "../../components/TabBar.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "detail",
  setup(__props) {
    const product = common_vendor.ref(null);
    const loading = common_vendor.ref(false);
    const quantity = common_vendor.ref(1);
    const userStore = store_user.useUserStore();
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
        console.error("加载商品详情失败", error);
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
    async function addToCart() {
      if (!product.value) return;
      if (product.value.stock === 0) {
        common_vendor.index.showToast({ title: "商品已缺货", icon: "none" });
        return;
      }
      if (!userStore.isLoggedIn) {
        common_vendor.index.navigateTo({ url: "/pages/user/login" });
        return;
      }
      try {
        await api_cart.cartApi.add({
          productId: product.value.id,
          quantity: quantity.value
        });
        common_vendor.index.showToast({ title: "已加入购物车", icon: "success" });
      } catch (error) {
        console.error("添加购物车失败", error);
        common_vendor.index.showToast({ title: "添加失败，请重试", icon: "none" });
      }
    }
    function buyNow() {
      if (!product.value) return;
      if (product.value.stock === 0) {
        common_vendor.index.showToast({ title: "商品已缺货", icon: "none" });
        return;
      }
      const images = getCoverImages();
      common_vendor.index.setStorageSync("quickBuy", {
        productId: product.value.id,
        quantity: quantity.value,
        price: product.value.price,
        productName: getProductName(),
        coverImage: images.length > 0 ? images[0] : ""
      });
      common_vendor.index.navigateTo({
        url: "/pages/order/confirm"
      });
    }
    function getProductName() {
      var _a, _b;
      if (!product.value) return "";
      return ((_a = product.value.name) == null ? void 0 : _a.zh) || ((_b = product.value.name) == null ? void 0 : _b.en) || "商品";
    }
    function getProductDesc() {
      var _a, _b, _c;
      if (!((_a = product.value) == null ? void 0 : _a.description)) return "";
      return ((_b = product.value.description) == null ? void 0 : _b.zh) || ((_c = product.value.description) == null ? void 0 : _c.en) || "";
    }
    function getStockText() {
      var _a;
      if (!((_a = product.value) == null ? void 0 : _a.stock)) return "";
      if (product.value.stock === 0) return "缺货";
      if (product.value.stock <= 10) return `仅剩${product.value.stock}件`;
      return `库存${product.value.stock}件`;
    }
    function getStockClass() {
      var _a;
      if (!((_a = product.value) == null ? void 0 : _a.stock)) return "";
      if (product.value.stock === 0) return "out";
      if (product.value.stock <= 10) return "low";
      return "normal";
    }
    function getCoverImages() {
      if (!product.value) return [];
      const images = [];
      if (product.value.metaImage) {
        images.push(product.value.metaImage);
      }
      if (product.value.images && product.value.images.length > 0) {
        product.value.images.forEach((img) => {
          if (img.url && !images.includes(img.url)) {
            images.push(img.url);
          }
        });
      }
      return images;
    }
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: getCoverImages().length > 0
      }, getCoverImages().length > 0 ? {
        b: common_vendor.f(getCoverImages(), (img, index, i0) => {
          return {
            a: img,
            b: index
          };
        }),
        c: getCoverImages().length > 1,
        d: getCoverImages().length > 1
      } : {
        e: common_vendor.t(getProductName().charAt(0) || "P")
      }, {
        f: product.value
      }, product.value ? common_vendor.e({
        g: common_vendor.t(product.value.price),
        h: common_vendor.t(getStockText()),
        i: common_vendor.n(getStockClass()),
        j: common_vendor.t(getProductName()),
        k: getProductDesc()
      }, getProductDesc() ? {
        l: common_vendor.t(getProductDesc())
      } : {}) : {}, {
        m: (_a = product.value) == null ? void 0 : _a.primaryTag
      }, ((_b = product.value) == null ? void 0 : _b.primaryTag) ? {
        n: common_vendor.t(product.value.primaryTag.name)
      } : {}, {
        o: common_vendor.o(decreaseQty),
        p: common_vendor.t(quantity.value),
        q: common_vendor.o(increaseQty),
        r: common_vendor.o(addToCart),
        s: common_vendor.o(buyNow),
        t: common_vendor.n(common_vendor.unref(theme_config.THEME_CLASS))
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8216645a"]]);
wx.createPage(MiniProgramPage);
