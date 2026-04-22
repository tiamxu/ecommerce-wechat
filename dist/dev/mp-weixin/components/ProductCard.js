"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "ProductCard",
  props: {
    product: {},
    showPrice: { type: Boolean, default: true },
    showOriginalPrice: { type: Boolean, default: true }
  },
  emits: ["click"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const productName = common_vendor.computed(() => {
      var _a, _b;
      return ((_a = props.product.name) == null ? void 0 : _a.zh) || ((_b = props.product.name) == null ? void 0 : _b.en) || "商品";
    });
    const coverImage = common_vendor.computed(() => {
      if (props.product.metaImage) return props.product.metaImage;
      if (props.product.images && props.product.images.length > 0) {
        const cover = props.product.images.find((img) => img.isCover === 1);
        return (cover == null ? void 0 : cover.url) || props.product.images[0].url;
      }
      return "";
    });
    const displayTag = common_vendor.computed(() => {
      if (props.product.primaryTag) return props.product.primaryTag.name;
      if (props.product.tags && props.product.tags.length > 0) return props.product.tags[0].name;
      return "";
    });
    const originalPrice = common_vendor.computed(() => {
      if (props.product.originalPrice) return props.product.originalPrice;
      return Math.round(props.product.price * 1.3);
    });
    const salesCount = common_vendor.computed(() => {
      return props.product.sales || 0;
    });
    function handleClick() {
      emit("click", props.product.id);
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: coverImage.value
      }, coverImage.value ? {
        b: coverImage.value
      } : {
        c: common_vendor.t(productName.value.charAt(0) || "P")
      }, {
        d: displayTag.value
      }, displayTag.value ? {
        e: common_vendor.t(displayTag.value)
      } : {}, {
        f: common_vendor.t(productName.value),
        g: _ctx.showPrice
      }, _ctx.showPrice ? {
        h: common_vendor.t(_ctx.product.price)
      } : {}, {
        i: _ctx.showOriginalPrice && _ctx.product.price < originalPrice.value
      }, _ctx.showOriginalPrice && _ctx.product.price < originalPrice.value ? {
        j: common_vendor.t(originalPrice.value)
      } : {}, {
        k: common_vendor.t(salesCount.value),
        l: _ctx.product.stock !== void 0 && _ctx.product.stock < 10
      }, _ctx.product.stock !== void 0 && _ctx.product.stock < 10 ? {
        m: common_vendor.t(_ctx.product.stock)
      } : {}, {
        n: common_vendor.o(handleClick)
      });
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a4cce9c2"]]);
wx.createComponent(Component);
