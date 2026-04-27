"use strict";
const common_vendor = require("../../common/vendor.js");
require("../../utils/env.js");
const api_order = require("../../api/order.js");
const theme_config = require("../../theme/config.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "list",
  setup(__props) {
    const addresses = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const selectedId = common_vendor.ref(null);
    common_vendor.onMounted(() => {
      loadAddresses();
    });
    async function loadAddresses() {
      loading.value = true;
      try {
        const res = await api_order.orderApi.getAddresses();
        if (res.code === 200 && res.data) {
          addresses.value = res.data;
          const selected = res.data.find((a) => a.isDefault === 1);
          if (selected) {
            selectedId.value = selected.id;
          }
        }
      } catch (error) {
        console.error("加载地址失败", error);
      } finally {
        loading.value = false;
      }
    }
    function selectAddress(id) {
      selectedId.value = id;
      const pages = getCurrentPages();
      const prevPage = pages[pages.length - 2];
      if (prevPage && prevPage.selectAddress) {
        prevPage.selectAddress(id);
      }
      common_vendor.index.navigateBack();
    }
    function goToAdd() {
      common_vendor.index.navigateTo({ url: "/pages/address/edit" });
    }
    function goToEdit(id) {
      common_vendor.index.navigateTo({ url: `/pages/address/edit?id=${id}` });
    }
    async function deleteAddress(id) {
      const res = await common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除该地址吗？",
        showCancel: true
      });
      if (res.confirm) {
        try {
          await api_order.orderApi.deleteAddress(id);
          addresses.value = addresses.value.filter((a) => a.id !== id);
          common_vendor.index.showToast({ title: "已删除", icon: "success" });
        } catch (error) {
          console.error("删除地址失败", error);
        }
      }
    }
    async function setDefault(id) {
      try {
        await api_order.orderApi.updateAddress(id, { isDefault: true });
        addresses.value.forEach((a) => a.isDefault = a.id === id ? 1 : 0);
        common_vendor.index.showToast({ title: "设置成功", icon: "success" });
      } catch (error) {
        console.error("设置默认地址失败", error);
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: loading.value
      }, loading.value ? {} : addresses.value.length === 0 ? {
        c: common_vendor.o(goToAdd)
      } : {
        d: common_vendor.f(addresses.value, (addr, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(addr.receiverName),
            b: common_vendor.t(addr.phone),
            c: addr.isDefault === 1
          }, addr.isDefault === 1 ? {} : {}, {
            d: common_vendor.t(addr.province),
            e: common_vendor.t(addr.city),
            f: common_vendor.t(addr.address),
            g: common_vendor.o(($event) => selectAddress(addr.id), addr.id),
            h: common_vendor.o(($event) => goToEdit(addr.id), addr.id),
            i: addr.isDefault !== 1
          }, addr.isDefault !== 1 ? {
            j: common_vendor.o(($event) => setDefault(addr.id), addr.id)
          } : {}, {
            k: common_vendor.o(($event) => deleteAddress(addr.id), addr.id),
            l: addr.id
          });
        })
      }, {
        b: addresses.value.length === 0,
        e: common_vendor.o(goToAdd),
        f: common_vendor.n(common_vendor.unref(theme_config.THEME_CLASS))
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b9746c2a"]]);
wx.createPage(MiniProgramPage);
