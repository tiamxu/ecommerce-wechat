"use strict";
const common_vendor = require("../../common/vendor.js");
require("../../utils/env.js");
const api_order = require("../../api/order.js");
const theme_config = require("../../theme/config.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "list",
  setup(__props) {
    const orders = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const activeTab = common_vendor.ref("all");
    const tabs = [
      { key: "all", label: "全部" },
      { key: "pending", label: "待付款" },
      { key: "paid", label: "待发货" },
      { key: "shipped", label: "待收货" },
      { key: "completed", label: "已完成" }
    ];
    const statusMap = {
      pending: "待付款",
      paid: "待发货",
      shipped: "待收货",
      completed: "已完成",
      cancelled: "已取消"
    };
    function changeTab(tab) {
      activeTab.value = tab;
    }
    const filteredOrders = common_vendor.computed(() => {
      if (activeTab.value === "all") {
        return orders.value;
      }
      return orders.value.filter((o) => o.status === activeTab.value);
    });
    common_vendor.onMounted(() => {
      loadOrders();
    });
    async function loadOrders() {
      loading.value = true;
      try {
        const res = await api_order.orderApi.getList();
        if (res.code === 200 && res.data) {
          orders.value = res.data.list || [];
        }
      } catch (error) {
        console.error("加载订单失败", error);
      } finally {
        loading.value = false;
      }
    }
    function goToDetail(orderId) {
      common_vendor.index.navigateTo({ url: `/pages/order/detail?id=${orderId}` });
    }
    async function payOrder(orderId) {
      try {
        await api_order.orderApi.pay(orderId);
        common_vendor.index.showToast({ title: "支付成功", icon: "success" });
        loadOrders();
      } catch (error) {
        console.error("支付失败", error);
      }
    }
    async function cancelOrder(orderId) {
      const res = await common_vendor.index.showModal({
        title: "确认取消",
        content: "确定要取消该订单吗？",
        showCancel: true
      });
      if (res.confirm) {
        try {
          await api_order.orderApi.cancel(orderId);
          common_vendor.index.showToast({ title: "订单已取消", icon: "success" });
          loadOrders();
        } catch (error) {
          console.error("取消订单失败", error);
        }
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(tabs, (tab, k0, i0) => {
          return {
            a: common_vendor.t(tab.label),
            b: tab.key,
            c: activeTab.value === tab.key ? 1 : "",
            d: common_vendor.o(($event) => changeTab(tab.key), tab.key)
          };
        }),
        b: loading.value
      }, loading.value ? {} : filteredOrders.value.length === 0 ? {} : {
        d: common_vendor.f(filteredOrders.value, (order, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(order.orderNo),
            b: common_vendor.t(statusMap[order.status] || order.status),
            c: common_vendor.n(order.status),
            d: common_vendor.f(order.items.slice(0, 3), (item, index, i1) => {
              var _a;
              return {
                a: common_vendor.t(((_a = item.productName) == null ? void 0 : _a.charAt(0)) || "P"),
                b: index
              };
            }),
            e: order.items.length > 3
          }, order.items.length > 3 ? {
            f: common_vendor.t(order.items.length - 3)
          } : {}, {
            g: common_vendor.t(order.createTime),
            h: common_vendor.t(order.totalAmount + order.freight),
            i: order.status === "pending"
          }, order.status === "pending" ? {
            j: common_vendor.o(($event) => payOrder(order.id), order.id)
          } : {}, {
            k: order.status === "pending"
          }, order.status === "pending" ? {
            l: common_vendor.o(($event) => cancelOrder(order.id), order.id)
          } : {}, {
            m: common_vendor.o(() => {
            }, order.id),
            n: order.id,
            o: common_vendor.o(($event) => goToDetail(order.id), order.id)
          });
        })
      }, {
        c: filteredOrders.value.length === 0,
        e: common_vendor.n(common_vendor.unref(theme_config.THEME_CLASS))
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-80f8e5f8"]]);
wx.createPage(MiniProgramPage);
