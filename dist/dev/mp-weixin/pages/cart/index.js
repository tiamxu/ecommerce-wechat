"use strict";
const common_vendor = require("../../common/vendor.js");
const api_request = require("../../api/request.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const cartItems = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const MOCK_CART = [
      { id: 1, productId: 1, productName: "示例商品1", price: 299, quantity: 2, selected: true, coverImage: "" },
      { id: 2, productId: 2, productName: "示例商品2", price: 599, quantity: 1, selected: true, coverImage: "" }
    ];
    common_vendor.onMounted(() => {
      loadCart();
    });
    async function loadCart() {
      loading.value = true;
      try {
        const res = await api_request.mockRequest(MOCK_CART);
        cartItems.value = res.data;
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
      return cartItems.value.filter((item) => item.selected).reduce((sum, item) => sum + item.price * item.quantity, 0);
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
      if (newQty < 1) return;
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
      common_vendor.index.setStorageSync("checkoutItems", selectedItems);
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
        b: common_vendor.t(_ctx.$t("cart.empty")),
        c: common_vendor.o(goToShop)
      } : {
        d: common_vendor.f(cartItems.value, (item, k0, i0) => {
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
            g: common_vendor.t(item.price),
            h: common_vendor.o(($event) => updateQuantity(item.productId, -1), item.id),
            i: common_vendor.t(item.quantity),
            j: common_vendor.o(($event) => updateQuantity(item.productId, 1), item.id),
            k: common_vendor.o(($event) => removeItem(item.productId), item.id),
            l: item.id
          });
        }),
        e: allSelected.value ? 1 : "",
        f: common_vendor.o(toggleAll),
        g: common_vendor.t(_ctx.$t("cart.total")),
        h: common_vendor.t(totalPrice.value),
        i: common_vendor.t(_ctx.$t("cart.checkout")),
        j: common_vendor.o(checkout)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-3277fd7b"]]);
wx.createPage(MiniProgramPage);
