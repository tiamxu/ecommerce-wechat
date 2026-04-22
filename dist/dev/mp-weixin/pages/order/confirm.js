"use strict";
const common_vendor = require("../../common/vendor.js");
require("../../utils/env.js");
const api_order = require("../../api/order.js");
const store_user = require("../../store/user.js");
const theme_config = require("../../theme/config.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "confirm",
  setup(__props) {
    const userStore = store_user.useUserStore();
    const addresses = common_vendor.ref([]);
    const selectedAddressId = common_vendor.ref(null);
    const checkoutItems = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    common_vendor.onMounted(async () => {
      const items = common_vendor.index.getStorageSync("checkoutItems");
      if (items && items.length > 0) {
        checkoutItems.value = items;
      } else {
        const quickBuy = common_vendor.index.getStorageSync("quickBuy");
        if (quickBuy) {
          checkoutItems.value = [{
            id: 0,
            productId: quickBuy.productId,
            productName: quickBuy.productName || "商品",
            price: quickBuy.price || 0,
            quantity: quickBuy.quantity,
            selected: true,
            coverImage: quickBuy.coverImage || ""
          }];
        }
      }
      await loadAddresses();
    });
    async function loadAddresses() {
      try {
        const res = await api_order.orderApi.getAddresses();
        if (res.code === 200 && res.data) {
          addresses.value = res.data;
          const defaultAddr = addresses.value.find((a) => a.isDefault) || addresses.value[0];
          if (defaultAddr) {
            selectedAddressId.value = defaultAddr.id;
          }
        }
      } catch (error) {
        console.error("加载地址失败", error);
      }
    }
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
      var _a;
      if (!selectedAddress.value) {
        common_vendor.index.showToast({ title: "请选择收货地址", icon: "none" });
        return;
      }
      loading.value = true;
      const addr = selectedAddress.value;
      const items = checkoutItems.value.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        productName: item.productName,
        coverImage: item.coverImage
      }));
      api_order.orderApi.create({
        email: ((_a = userStore.userInfo) == null ? void 0 : _a.phone) ? `${userStore.userInfo.phone}@example.com` : "guest@example.com",
        receiverName: addr.name,
        phone: addr.phone,
        country: "中国",
        province: addr.province,
        city: addr.city,
        address: addr.detail,
        postalCode: "000000",
        items,
        remark: ""
      }).then((res) => {
        var _a2;
        if (res.code === 200) {
          userStore.setEmail(((_a2 = userStore.userInfo) == null ? void 0 : _a2.phone) ? `${userStore.userInfo.phone}@example.com` : "guest@example.com");
          common_vendor.index.showToast({ title: "订单创建成功", icon: "success" });
          common_vendor.index.removeStorageSync("checkoutItems");
          common_vendor.index.removeStorageSync("quickBuy");
          setTimeout(() => {
            common_vendor.index.redirectTo({ url: "/pages/order/list" });
          }, 1500);
        } else {
          common_vendor.index.showToast({ title: res.message || "创建失败", icon: "none" });
        }
      }).catch((err) => {
        console.error("创建订单失败", err);
        common_vendor.index.showToast({ title: "创建失败，请重试", icon: "none" });
      }).finally(() => {
        loading.value = false;
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
        n: common_vendor.o(submitOrder),
        o: common_vendor.n(common_vendor.unref(theme_config.THEME_CLASS))
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-36cb8dad"]]);
wx.createPage(MiniProgramPage);
