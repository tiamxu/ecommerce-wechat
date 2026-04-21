"use strict";
const common_vendor = require("../../common/vendor.js");
const api_product = require("../../api/product.js");
require("../../utils/env.js");
const theme_config = require("../../theme/config.js");
if (!Math) {
  (TabBar + ProductCard)();
}
const ProductCard = () => "../../components/ProductCard.js";
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
      loadProducts();
    });
    async function loadCategories() {
      try {
        const res = await api_product.productApi.getCategories();
        if (res.code === 200) {
          categories.value = res.data.pageData || [];
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
        a: common_vendor.o(goToSearch),
        b: selectedCategoryId.value === null ? 1 : "",
        c: common_vendor.o(($event) => selectCategory(null)),
        d: common_vendor.f(categories.value, (cat, k0, i0) => {
          var _a, _b;
          return {
            a: common_vendor.t(((_a = cat.name) == null ? void 0 : _a.zh) || ((_b = cat.name) == null ? void 0 : _b.en) || "分类"),
            b: cat.id,
            c: selectedCategoryId.value === cat.id ? 1 : "",
            d: common_vendor.o(($event) => selectCategory(cat.id), cat.id)
          };
        }),
        e: common_vendor.f(products.value, (item, k0, i0) => {
          return {
            a: item.id,
            b: common_vendor.o(goToDetail, item.id),
            c: "c68fff60-1-" + i0,
            d: common_vendor.p({
              product: item
            })
          };
        }),
        f: loading.value
      }, loading.value ? {} : !hasMore.value ? {} : products.value.length === 0 ? {} : {}, {
        g: !hasMore.value,
        h: products.value.length === 0,
        i: common_vendor.o(onReachBottom),
        j: common_vendor.n(common_vendor.unref(theme_config.THEME_CLASS))
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c68fff60"]]);
wx.createPage(MiniProgramPage);
