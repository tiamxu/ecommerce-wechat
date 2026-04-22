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
      if (!userStore.isLoggedIn) {
        common_vendor.index.showModal({
          title: "提示",
          content: "请先登录后再添加购物车",
          confirmText: "去登录",
          success: (res) => {
            if (res.confirm) {
              userStore.login();
            }
          }
        });
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
      common_vendor.index.setStorageSync("quickBuy", {
        productId: product.value.id,
        quantity: quantity.value,
        price: product.value.price,
        productName: getProductName(),
        coverImage: getCoverImage()
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
    function getCoverImage() {
      if (!product.value) return "";
      if (product.value.metaImage) return product.value.metaImage;
      if (product.value.images && product.value.images.length > 0) {
        const cover = product.value.images.find((img) => img.isCover === 1);
        return (cover == null ? void 0 : cover.url) || product.value.images[0].url;
      }
      return "";
    }
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: getCoverImage()
      }, getCoverImage() ? {
        b: getCoverImage()
      } : {
        c: common_vendor.t(getProductName().charAt(0) || "P")
      }, {
        d: product.value
      }, product.value ? common_vendor.e({
        e: common_vendor.t(product.value.price),
        f: common_vendor.t(product.value.stock),
        g: common_vendor.t(getProductName()),
        h: getProductDesc()
      }, getProductDesc() ? {
        i: common_vendor.t(getProductDesc())
      } : {}) : {}, {
        j: (_a = product.value) == null ? void 0 : _a.primaryTag
      }, ((_b = product.value) == null ? void 0 : _b.primaryTag) ? {
        k: common_vendor.t(product.value.primaryTag.name)
      } : {}, {
        l: common_vendor.o(decreaseQty),
        m: common_vendor.t(quantity.value),
        n: common_vendor.o(increaseQty),
        o: common_vendor.o(addToCart),
        p: common_vendor.o(buyNow),
        q: common_vendor.n(common_vendor.unref(theme_config.THEME_CLASS))
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-8216645a"]]);
wx.createPage(MiniProgramPage);
