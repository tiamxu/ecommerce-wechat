"use strict";
const common_vendor = require("../../common/vendor.js");
require("../../utils/env.js");
const api_order = require("../../api/order.js");
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
          const selected = res.data.find((a) => a.isDefault);
          if (selected) {
            selectedId.value = selected.id;
          }
        }
      } catch (error) {
      } finally {
        loading.value = false;
      }
    }
    function selectAddress(id) {
      selectedId.value = id;
      common_vendor.index.navigateBack();
    }
    function goToAdd() {
      common_vendor.index.navigateTo({ url: "/pages/address/edit" });
    }
    function goToEdit(id) {
      common_vendor.index.navigateTo({ url: `/pages/address/edit?id=${id}` });
    }
    async function deleteAddress(id) {
      try {
        const res = await common_vendor.index.showModal({
          title: "确认删除",
          content: "确定要删除该地址吗？",
          showCancel: true
        });
        if (res.confirm) {
          await api_order.orderApi.deleteAddress(id);
          addresses.value = addresses.value.filter((a) => a.id !== id);
          common_vendor.index.showToast({ title: "已删除", icon: "success" });
        }
      } catch (error) {
      }
    }
    async function setDefault(id) {
      try {
        await api_order.orderApi.updateAddress(id, { isDefault: true });
        addresses.value.forEach((a) => a.isDefault = a.id === id);
        common_vendor.index.showToast({ title: "设置成功", icon: "success" });
      } catch (error) {
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: !loading.value && addresses.value.length === 0
      }, !loading.value && addresses.value.length === 0 ? {
        b: common_vendor.o(goToAdd)
      } : {
        c: common_vendor.f(addresses.value, (addr, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(addr.name),
            b: common_vendor.t(addr.phone),
            c: addr.isDefault
          }, addr.isDefault ? {} : {}, {
            d: common_vendor.t(addr.province),
            e: common_vendor.t(addr.city),
            f: common_vendor.t(addr.district),
            g: common_vendor.t(addr.detail),
            h: common_vendor.o(($event) => selectAddress(addr.id), addr.id),
            i: common_vendor.o(($event) => goToEdit(addr.id), addr.id),
            j: !addr.isDefault
          }, !addr.isDefault ? {
            k: common_vendor.o(($event) => setDefault(addr.id), addr.id)
          } : {}, {
            l: common_vendor.o(($event) => deleteAddress(addr.id), addr.id),
            m: addr.id
          });
        })
      }, {
        d: common_vendor.o(goToAdd)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b9746c2a"]]);
wx.createPage(MiniProgramPage);
