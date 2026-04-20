"use strict";
const common_vendor = require("../../common/vendor.js");
if (!Math) {
  ProductCard();
}
const ProductCard = () => "../../components/ProductCard.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "list",
  setup(__props) {
    const products = common_vendor.ref([]);
    const categories = common_vendor.ref([]);
    const selectedCategory = common_vendor.ref(null);
    const loading = common_vendor.ref(false);
    const MOCK_PRODUCTS = [
      { id: 1, name: "示例商品1", price: 299, coverImage: "", tags: ["热销"] },
      { id: 2, name: "示例商品2", price: 599, coverImage: "", tags: ["新品"] },
      { id: 3, name: "示例商品3", price: 899, coverImage: "", tags: [] },
      { id: 4, name: "示例商品4", price: 1299, coverImage: "", tags: ["推荐"] }
    ];
    const MOCK_CATEGORIES = [
      { id: 1, name: "分类一" },
      { id: 2, name: "分类二" },
      { id: 3, name: "分类三" }
    ];
    common_vendor.onMounted(() => {
      loadCategories();
      loadProducts();
    });
    function loadCategories() {
      categories.value = MOCK_CATEGORIES;
    }
    function loadProducts() {
      loading.value = true;
      setTimeout(() => {
        products.value = MOCK_PRODUCTS;
        loading.value = false;
      }, 300);
    }
    function selectCategory(id) {
      selectedCategory.value = id;
    }
    function goToDetail(id) {
      common_vendor.index.navigateTo({
        url: `/pages/product/detail?id=${id}`
      });
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: selectedCategory.value === null ? 1 : "",
        b: common_vendor.o(($event) => selectCategory(null)),
        c: common_vendor.f(categories.value, (cat, k0, i0) => {
          return {
            a: common_vendor.t(cat.name),
            b: cat.id,
            c: selectedCategory.value === cat.id ? 1 : "",
            d: common_vendor.o(($event) => selectCategory(cat.id), cat.id)
          };
        }),
        d: common_vendor.f(products.value, (item, k0, i0) => {
          return {
            a: item.id,
            b: common_vendor.o(goToDetail, item.id),
            c: "c68fff60-0-" + i0,
            d: common_vendor.p({
              product: item
            })
          };
        }),
        e: loading.value
      }, loading.value ? {} : {});
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c68fff60"]]);
wx.createPage(MiniProgramPage);
