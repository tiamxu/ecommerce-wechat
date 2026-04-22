"use strict";
const common_vendor = require("../../common/vendor.js");
require("../../utils/env.js");
const api_cart = require("../../api/cart.js");
const theme_config = require("../../theme/config.js");
if (!Math) {
  TabBar();
}
const TabBar = () => "../../components/TabBar.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const cartItems = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    common_vendor.onMounted(() => {
      loadCart();
    });
    async function loadCart() {
      loading.value = true;
      try {
        const res = await api_cart.cartApi.getList();
        if (res.code === 200 && res.data) {
          cartItems.value = (res.data.items || []).map((item) => ({
            ...item,
            selected: item.selected ?? true
          }));
        }
      } catch (error) {
        console.error("加载购物车失败", error);
      } finally {
        loading.value = false;
      }
    }
    const allSelected = common_vendor.computed({
      get: () => cartItems.value.length > 0 && cartItems.value.every((item) => item.selected),
      set: (val) => {
        cartItems.value.forEach((item) => item.selected = val);
      }
    });
    const totalPrice = common_vendor.computed(() => {
      return cartItems.value.filter((item) => item.selected).reduce((sum, item) => sum + item.productPrice * item.quantity, 0);
    });
    const selectedCount = common_vendor.computed(() => {
      return cartItems.value.filter((item) => item.selected).length;
    });
    function toggleAll() {
      allSelected.value = !allSelected.value;
    }
    function toggleItem(id) {
      const item = cartItems.value.find((i) => i.id === id);
      if (item) {
        item.selected = !item.selected;
      }
    }
    function updateQuantity(productId, delta) {
      const item = cartItems.value.find((i) => i.productId === productId);
      if (!item) return;
      const newQty = item.quantity + delta;
      if (newQty < 1) {
        removeItem(productId);
        return;
      }
      item.quantity = newQty;
    }
    function removeItem(productId) {
      cartItems.value = cartItems.value.filter((item) => item.productId !== productId);
      common_vendor.index.showToast({ title: "已删除", icon: "success" });
    }
    function checkout() {
      if (selectedCount.value === 0) {
        common_vendor.index.showToast({ title: "请选择商品", icon: "none" });
        return;
      }
      const selectedItems = cartItems.value.filter((item) => item.selected);
      common_vendor.index.setStorageSync("checkoutItems", JSON.stringify(selectedItems));
      common_vendor.index.navigateTo({
        url: "/pages/order/confirm"
      });
    }
    function goToShop() {
      common_vendor.index.switchTab({ url: "/pages/product/list" });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !loading.value && cartItems.value.length === 0
      }, !loading.value && cartItems.value.length === 0 ? {
        b: common_vendor.o(goToShop)
      } : {
        c: common_vendor.f(cartItems.value, (item, k0, i0) => {
          var _a;
          return common_vendor.e({
            a: item.selected ? 1 : "",
            b: common_vendor.o(($event) => toggleItem(item.id), item.id),
            c: item.coverImage
          }, item.coverImage ? {
            d: item.coverImage
          } : {
            e: common_vendor.t(((_a = item.productName) == null ? void 0 : _a.charAt(0)) || "P")
          }, {
            f: common_vendor.t(item.productName),
            g: common_vendor.t(item.productPrice),
            h: common_vendor.o(($event) => updateQuantity(item.productId, -1), item.id),
            i: common_vendor.t(item.quantity),
            j: common_vendor.o(($event) => updateQuantity(item.productId, 1), item.id),
            k: common_vendor.o(($event) => removeItem(item.productId), item.id),
            l: item.id
          });
        }),
        d: allSelected.value ? 1 : "",
        e: common_vendor.o(toggleAll),
        f: common_vendor.t(totalPrice.value),
        g: common_vendor.o(checkout)
      }, {
        h: common_vendor.n(common_vendor.unref(theme_config.THEME_CLASS))
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3277fd7b"]]);
wx.createPage(MiniProgramPage);
