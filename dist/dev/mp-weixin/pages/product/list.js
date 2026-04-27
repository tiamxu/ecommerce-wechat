"use strict";
const common_vendor = require("../../common/vendor.js");
const api_product = require("../../api/product.js");
require("../../utils/env.js");
const theme_config = require("../../theme/config.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../node-modules/@dcloudio/uni-ui/lib/uni-icons/uni-icons.js";
if (!Math) {
  (TabBar + _easycom_uni_icons + Skeleton + ProductCard)();
}
const ProductCard = () => "../../components/ProductCard.js";
const Skeleton = () => "../../components/Skeleton.js";
const TabBar = () => "../../components/TabBar.js";
const pageSize = 12;
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "list",
  setup(__props) {
    const categories = common_vendor.ref([]);
    const products = common_vendor.ref([]);
    const selectedCategoryId = common_vendor.ref(null);
    const loading = common_vendor.ref(false);
    const pageNo = common_vendor.ref(1);
    const hasMore = common_vendor.ref(true);
    common_vendor.onMounted(() => {
      loadCategories();
      const savedCategoryId = common_vendor.index.getStorageSync("selectedCategoryId");
      if (savedCategoryId) {
        selectedCategoryId.value = Number(savedCategoryId);
      }
      loadProducts();
    });
    async function loadCategories() {
      try {
        const res = await api_product.productApi.getCategories();
        if (res.code === 200) {
          categories.value = Array.isArray(res.data) ? res.data : res.data.pageData || [];
        }
      } catch (error) {
        console.error("加载分类失败", error);
      }
    }
    async function loadProducts(reset = false) {
      if (loading.value) return;
      if (!reset && !hasMore.value) return;
      if (reset) {
        pageNo.value = 1;
        hasMore.value = true;
      }
      loading.value = true;
      try {
        const res = await api_product.productApi.getList({
          pageNo: pageNo.value,
          pageSize,
          categoryId: selectedCategoryId.value || void 0
        });
        if (res.code === 200) {
          const list = res.data.pageData || [];
          if (reset) {
            products.value = list;
          } else {
            products.value = [...products.value, ...list];
          }
          hasMore.value = list.length >= pageSize;
          pageNo.value++;
        }
      } catch (error) {
        console.error("加载商品失败", error);
      } finally {
        loading.value = false;
      }
    }
    function selectCategory(id) {
      selectedCategoryId.value = id;
      common_vendor.index.setStorageSync("selectedCategoryId", id);
      loadProducts(true);
    }
    function goToDetail(id) {
      common_vendor.index.navigateTo({
        url: `/pages/product/detail?id=${id}`
      });
    }
    function goToSearch() {
      common_vendor.index.navigateTo({
        url: "/pages/search/index"
      });
    }
    function onReachBottom() {
      if (hasMore.value && !loading.value) {
        loadProducts(false);
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "search",
          size: "16",
          color: "var(--text-placeholder)"
        }),
        b: common_vendor.o(goToSearch),
        c: selectedCategoryId.value === null ? 1 : "",
        d: common_vendor.o(($event) => selectCategory(null)),
        e: common_vendor.f(categories.value, (cat, k0, i0) => {
          var _a, _b;
          return {
            a: common_vendor.t(((_a = cat.name) == null ? void 0 : _a.zh) || ((_b = cat.name) == null ? void 0 : _b.en) || "分类"),
            b: cat.id,
            c: selectedCategoryId.value === cat.id ? 1 : "",
            d: common_vendor.o(($event) => selectCategory(cat.id), cat.id)
          };
        }),
        f: loading.value && products.value.length === 0
      }, loading.value && products.value.length === 0 ? {
        g: common_vendor.f(6, (i, k0, i0) => {
          return {
            a: "c68fff60-2-" + i0,
            b: "c68fff60-3-" + i0,
            c: "c68fff60-4-" + i0,
            d: i
          };
        }),
        h: common_vendor.p({
          width: "100%",
          height: "340rpx",
          borderRadius: "16rpx 16rpx 0 0"
        }),
        i: common_vendor.p({
          width: "80%",
          height: "32rpx"
        }),
        j: common_vendor.p({
          width: "50%",
          height: "28rpx"
        })
      } : {
        k: common_vendor.f(products.value, (item, k0, i0) => {
          return {
            a: item.id,
            b: common_vendor.o(($event) => goToDetail(item.id), item.id),
            c: "c68fff60-5-" + i0,
            d: common_vendor.p({
              product: item
            })
          };
        })
      }, {
        l: loading.value && products.value.length > 0
      }, loading.value && products.value.length > 0 ? {} : !hasMore.value && products.value.length > 0 ? {} : products.value.length === 0 && !loading.value ? {} : {}, {
        m: !hasMore.value && products.value.length > 0,
        n: products.value.length === 0 && !loading.value,
        o: common_vendor.o(onReachBottom),
        p: common_vendor.n(common_vendor.unref(theme_config.THEME_CLASS))
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c68fff60"]]);
wx.createPage(MiniProgramPage);
