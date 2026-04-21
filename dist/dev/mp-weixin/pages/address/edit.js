"use strict";
const common_vendor = require("../../common/vendor.js");
require("../../utils/env.js");
const api_order = require("../../api/order.js");
const theme_config = require("../../theme/config.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "edit",
  setup(__props) {
    const form = common_vendor.ref({
      name: "",
      phone: "",
      province: "",
      city: "",
      district: "",
      detail: "",
      isDefault: false
    });
    const isEdit = common_vendor.ref(false);
    const addressId = common_vendor.ref(null);
    const loading = common_vendor.ref(false);
    common_vendor.onMounted(() => {
      var _a;
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const id = (_a = currentPage == null ? void 0 : currentPage.options) == null ? void 0 : _a.id;
      if (id) {
        isEdit.value = true;
        addressId.value = Number(id);
        loadAddressDetail(addressId.value);
      }
    });
    async function loadAddressDetail(id) {
      try {
        const res = await api_order.orderApi.getAddresses();
        if (res.code === 200 && res.data) {
          const addr = res.data.find((a) => a.id === id);
          if (addr) {
            form.value = {
              name: addr.name,
              phone: addr.phone,
              province: addr.province,
              city: addr.city,
              district: addr.district,
              detail: addr.detail,
              isDefault: addr.isDefault
            };
          }
        }
      } catch (error) {
        console.error("加载地址详情失败", error);
      }
    }
    async function saveAddress() {
      if (!form.value.name) {
        common_vendor.index.showToast({ title: "请输入收货人姓名", icon: "none" });
        return;
      }
      if (!form.value.phone) {
        common_vendor.index.showToast({ title: "请输入手机号码", icon: "none" });
        return;
      }
      if (!form.value.province || !form.value.city || !form.value.district || !form.value.detail) {
        common_vendor.index.showToast({ title: "请输入完整地址", icon: "none" });
        return;
      }
      loading.value = true;
      try {
        if (isEdit.value && addressId.value) {
          await api_order.orderApi.updateAddress(addressId.value, form.value);
        } else {
          await api_order.orderApi.addAddress(form.value);
        }
        common_vendor.index.showToast({ title: "保存成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (error) {
        console.error("保存地址失败", error);
        common_vendor.index.showToast({ title: "保存失败", icon: "none" });
      } finally {
        loading.value = false;
      }
    }
    return (_ctx, _cache) => {
      return {
        a: form.value.name,
        b: common_vendor.o(($event) => form.value.name = $event.detail.value),
        c: form.value.phone,
        d: common_vendor.o(($event) => form.value.phone = $event.detail.value),
        e: form.value.province,
        f: common_vendor.o(($event) => form.value.province = $event.detail.value),
        g: form.value.city,
        h: common_vendor.o(($event) => form.value.city = $event.detail.value),
        i: form.value.district,
        j: common_vendor.o(($event) => form.value.district = $event.detail.value),
        k: form.value.detail,
        l: common_vendor.o(($event) => form.value.detail = $event.detail.value),
        m: form.value.isDefault,
        n: common_vendor.o((e) => form.value.isDefault = e.detail.value),
        o: common_vendor.o(saveAddress),
        p: common_vendor.n(common_vendor.unref(theme_config.THEME_CLASS))
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-24ed4d92"]]);
wx.createPage(MiniProgramPage);
