"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "confirm",
  setup(__props) {
    const selectedAddressId = common_vendor.ref(1);
    const checkoutItems = common_vendor.ref([]);
    common_vendor.ref(false);
    const addresses = common_vendor.ref([
      { id: 1, name: "张三", phone: "13812345678", province: "北京市", city: "北京市", district: "朝阳区", detail: "某某街道某某小区1号楼101", isDefault: true },
      { id: 2, name: "李四", phone: "13987654321", province: "上海市", city: "上海市", district: "浦东新区", detail: "某某路某某号", isDefault: false }
    ]);
    onMounted(() => {
      const items = common_vendor.index.getStorageSync("checkoutItems");
      if (items && items.length > 0) {
        checkoutItems.value = items;
      } else {
        const quickBuy = common_vendor.index.getStorageSync("quickBuy");
        if (quickBuy) {
          checkoutItems.value = [{
            id: 0,
            productId: quickBuy.productId,
            productName: "示例商品",
            price: 299,
            quantity: quickBuy.quantity,
            selected: true,
            coverImage: ""
          }];
        }
      }
    });
    const selectedAddress = common_vendor.computed(() => {
      return addresses.value.find((a) => a.id === selectedAddressId.value) || addresses.value[0];
    });
    const totalAmount = common_vendor.computed(() => {
      return checkoutItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0);
    });
    const freight = common_vendor.computed(() => {
      return totalAmount.value >= 99 ? 0 : 10;
    });
    const orderTotal = common_vendor.computed(() => {
      return totalAmount.value + freight.value;
    });
    function goToAddressList() {
      common_vendor.index.navigateTo({ url: "/pages/address/list" });
    }
    function submitOrder() {
      common_vendor.index.showModal({
        title: "提示",
        content: "模拟创建订单成功",
        showCancel: false,
        success: () => {
          common_vendor.index.removeStorageSync("checkoutItems");
          common_vendor.index.removeStorageSync("quickBuy");
          common_vendor.index.redirectTo({ url: "/pages/order/list" });
        }
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: selectedAddress.value
      }, selectedAddress.value ? {
        b: common_vendor.t(selectedAddress.value.name),
        c: common_vendor.t(selectedAddress.value.phone),
        d: common_vendor.t(selectedAddress.value.province),
        e: common_vendor.t(selectedAddress.value.city),
        f: common_vendor.t(selectedAddress.value.district),
        g: common_vendor.t(selectedAddress.value.detail)
      } : {}, {
        h: common_vendor.o(goToAddressList),
        i: common_vendor.f(checkoutItems.value, (item, k0, i0) => {
          var _a;
          return {
            a: common_vendor.t(((_a = item.productName) == null ? void 0 : _a.charAt(0)) || "P"),
            b: common_vendor.t(item.productName),
            c: common_vendor.t(item.price),
            d: common_vendor.t(item.quantity),
            e: item.id
          };
        }),
        j: common_vendor.t(totalAmount.value),
        k: common_vendor.t(freight.value === 0 ? "免运费" : "¥" + freight.value),
        l: freight.value === 0 ? 1 : "",
        m: common_vendor.t(orderTotal.value),
        n: common_vendor.o(submitOrder)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-36cb8dad"]]);
wx.createPage(MiniProgramPage);
