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
      const itemsStr = common_vendor.index.getStorageSync("checkoutItems");
      if (itemsStr) {
        try {
          const items = typeof itemsStr === "string" ? JSON.parse(itemsStr) : itemsStr;
          if (Array.isArray(items) && items.length > 0) {
            checkoutItems.value = items;
          }
        } catch (e) {
          console.error("解析checkoutItems失败", e);
        }
      }
      if (checkoutItems.value.length === 0) {
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
          const defaultAddr = addresses.value.find((a) => a.isDefault === 1) || addresses.value[0];
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
      return checkoutItems.value.reduce((sum, item) => sum + (item.productPrice || item.price || 0) * item.quantity, 0);
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
    async function submitOrder() {
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
        price: item.productPrice || item.price,
        productName: item.productName,
        coverImage: item.coverImage
      }));
      try {
        const createRes = await api_order.orderApi.create({
          email: ((_a = userStore.userInfo) == null ? void 0 : _a.phone) ? `${userStore.userInfo.phone}@example.com` : "guest@example.com",
          receiverName: addr.receiverName,
          phone: addr.phone,
          country: addr.country || "中国",
          province: addr.province,
          city: addr.city,
          address: addr.address,
          postalCode: addr.postalCode || "000000",
          items,
          remark: ""
        });
        if (createRes.code !== 200) {
          common_vendor.index.showToast({ title: createRes.message || "创建订单失败", icon: "none" });
          return;
        }
        const { id: orderId, orderNo } = createRes.data;
        const payRes = await api_order.orderApi.pay(orderId, "wechat");
        if (payRes.code === 200 && payRes.data) {
          if (payRes.data.approval_url) {
            common_vendor.index.showToast({ title: "正在跳转到支付...", icon: "none" });
            setTimeout(() => {
              common_vendor.index.redirectTo({
                url: `/pages/order/success?orderId=${orderId}&orderNo=${orderNo}&status=pending`
              });
            }, 1500);
          } else if (payRes.data.qrcode_url) {
            common_vendor.index.showToast({ title: "订单创建成功", icon: "success" });
            common_vendor.index.removeStorageSync("checkoutItems");
            common_vendor.index.removeStorageSync("quickBuy");
            common_vendor.index.redirectTo({
              url: `/pages/order/success?orderId=${orderId}&orderNo=${orderNo}&status=pending`
            });
          } else {
            common_vendor.index.showToast({ title: "订单创建成功", icon: "success" });
            common_vendor.index.removeStorageSync("checkoutItems");
            common_vendor.index.removeStorageSync("quickBuy");
            common_vendor.index.redirectTo({
              url: `/pages/order/success?orderId=${orderId}&orderNo=${orderNo}&status=pending`
            });
          }
        } else {
          common_vendor.index.showToast({ title: payRes.message || "发起支付失败", icon: "none" });
          loading.value = false;
        }
      } catch (err) {
        console.error("提交订单失败", err);
        common_vendor.index.showToast({ title: "提交失败，请重试", icon: "none" });
      } finally {
        loading.value = false;
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: selectedAddress.value
      }, selectedAddress.value ? {
        b: common_vendor.t(selectedAddress.value.receiverName),
        c: common_vendor.t(selectedAddress.value.phone),
        d: common_vendor.t(selectedAddress.value.province),
        e: common_vendor.t(selectedAddress.value.city),
        f: common_vendor.t(selectedAddress.value.address)
      } : {}, {
        g: common_vendor.o(goToAddressList),
        h: common_vendor.f(checkoutItems.value, (item, k0, i0) => {
          var _a;
          return common_vendor.e({
            a: item.coverImage
          }, item.coverImage ? {
            b: item.coverImage
          } : {
            c: common_vendor.t(((_a = item.productName) == null ? void 0 : _a.charAt(0)) || "P")
          }, {
            d: common_vendor.t(item.productName),
            e: common_vendor.t(item.productPrice || item.price),
            f: common_vendor.t(item.quantity),
            g: item.id
          });
        }),
        i: common_vendor.t(totalAmount.value.toFixed(2)),
        j: common_vendor.t(freight.value === 0 ? "免运费" : "¥" + freight.value.toFixed(2)),
        k: freight.value === 0 ? 1 : "",
        l: common_vendor.t(orderTotal.value.toFixed(2)),
        m: common_vendor.t(loading.value ? "支付中..." : !selectedAddress.value ? "请选择收货地址" : "去支付 ¥" + orderTotal.value),
        n: loading.value ? 1 : "",
        o: loading.value || !selectedAddress.value ? 1 : "",
        p: common_vendor.o(($event) => loading.value || !selectedAddress.value ? null : submitOrder()),
        q: common_vendor.n(common_vendor.unref(theme_config.THEME_CLASS))
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-36cb8dad"]]);
wx.createPage(MiniProgramPage);
