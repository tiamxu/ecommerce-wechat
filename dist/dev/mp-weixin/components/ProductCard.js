"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "ProductCard",
  props: {
    product: {},
    showPrice: { type: Boolean, default: true }
  },
  emits: ["click"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    common_vendor.ref(0);
    function handleClick() {
      emit("click", props.product.id);
    }
    return (_ctx, _cache) => {
      var _a, _b, _c;
      return common_vendor.e({
        a: _ctx.product.coverImage
      }, _ctx.product.coverImage ? {
        b: _ctx.product.coverImage
      } : {
        c: common_vendor.t(((_a = _ctx.product.name) == null ? void 0 : _a.charAt(0)) || "P")
      }, {
        d: (_b = _ctx.product.tags) == null ? void 0 : _b.length
      }, ((_c = _ctx.product.tags) == null ? void 0 : _c.length) ? {
        e: common_vendor.f(_ctx.product.tags, (tag, k0, i0) => {
          return {
            a: common_vendor.t(tag),
            b: tag
          };
        })
      } : {}, {
        f: common_vendor.t(_ctx.product.name),
        g: _ctx.showPrice
      }, _ctx.showPrice ? {
        h: common_vendor.t(_ctx.product.price)
      } : {}, {
        i: common_vendor.o(handleClick)
      });
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a4cce9c2"]]);
wx.createComponent(Component);
