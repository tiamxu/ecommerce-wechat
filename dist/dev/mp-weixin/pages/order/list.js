"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "list",
  setup(__props) {
    const orders = common_vendor.ref([]);
    common_vendor.ref(false);
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
    const MOCK_ORDERS = [
      {
        id: 1,
        orderNo: "ORDER202404190001",
        status: "pending",
        totalAmount: 898,
        freight: 10,
        items: [
          { productId: 1, productName: "示例商品1", price: 299, quantity: 2, coverImage: "" },
          { productId: 2, productName: "示例商品2", price: 599, quantity: 1, coverImage: "" }
        ],
        address: { id: 1, name: "张三", phone: "13812345678", province: "北京市", city: "北京市", district: "朝阳区", detail: "某某街道", isDefault: true },
        createTime: "2024-04-19 10:30:00"
      },
      {
        id: 2,
        orderNo: "ORDER202404180002",
        status: "completed",
        totalAmount: 599,
        freight: 0,
        items: [
          { productId: 2, productName: "示例商品2", price: 599, quantity: 1, coverImage: "" }
        ],
        address: { id: 1, name: "张三", phone: "13812345678", province: "北京市", city: "北京市", district: "朝阳区", detail: "某某街道", isDefault: true },
        createTime: "2024-04-18 15:20:00"
      }
    ];
    function changeTab(tab) {
      activeTab.value = tab;
    }
    const filteredOrders = common_vendor.computed(() => {
      if (activeTab.value === "all") {
        return orders.value;
      }
      return orders.value.filter((o) => o.status === activeTab.value);
    });
    function goToDetail(orderId) {
      common_vendor.index.navigateTo({ url: `/pages/order/detail?id=${orderId}` });
    }
    function payOrder(orderId) {
      common_vendor.index.showToast({ title: "模拟支付成功", icon: "success" });
    }
    function cancelOrder(orderId) {
      common_vendor.index.showModal({
        title: "确认取消",
        content: "确定要取消该订单吗？",
        success: (res) => {
          if (res.confirm) {
            const order = orders.value.find((o) => o.id === orderId);
            if (order) {
              order.status = "cancelled";
            }
            common_vendor.index.showToast({ title: "订单已取消", icon: "success" });
          }
        }
      });
    }
    common_vendor.onMounted(() => {
      orders.value = MOCK_ORDERS;
    });
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
        b: filteredOrders.value.length === 0
      }, filteredOrders.value.length === 0 ? {} : {
        c: common_vendor.f(filteredOrders.value, (order, k0, i0) => {
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
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-80f8e5f8"]]);
wx.createPage(MiniProgramPage);
