"use strict";
const common_vendor = require("../../common/vendor.js");
const api_product = require("../../api/product.js");
require("../../utils/env.js");
const theme_config = require("../../theme/config.js");
if (!Math) {
  TabBar();
}
const TabBar = () => "../../components/TabBar.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const categories = common_vendor.ref([]);
    const hotProducts = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const searchKeyword = common_vendor.ref("");
    common_vendor.onMounted(() => {
      loadData();
    });
    async function loadData() {
      loading.value = true;
      try {
        const [catRes, hotRes] = await Promise.all([
          api_product.productApi.getCategories(),
          api_product.productApi.getHotProducts(8)
        ]);
        if (catRes.code === 200) {
          categories.value = catRes.data.pageData || [];
        }
        if (hotRes.code === 200) {
          hotProducts.value = hotRes.data.pageData || [];
        }
      } catch (error) {
        console.error("加载数据失败", error);
      } finally {
        loading.value = false;
      }
    }
    function goToSearch() {
      if (searchKeyword.value.trim()) {
        common_vendor.index.navigateTo({
          url: `/pages/product/list?keyword=${encodeURIComponent(searchKeyword.value.trim())}`
        });
      } else {
        common_vendor.index.navigateTo({ url: "/pages/product/list" });
      }
    }
    function goToCategoryProducts(categoryId) {
      common_vendor.index.navigateTo({
        url: `/pages/product/list?categoryId=${categoryId}`
      });
    }
    function goToProductDetail(id) {
      common_vendor.index.navigateTo({
        url: `/pages/product/detail?id=${id}`
      });
    }
    function goToAllProducts() {
      common_vendor.index.switchTab({ url: "/pages/product/list" });
    }
    function getProductName(product) {
      var _a, _b;
      return ((_a = product.name) == null ? void 0 : _a.zh) || ((_b = product.name) == null ? void 0 : _b.en) || "商品";
    }
    function getCoverImage(product) {
      if (product.metaImage) return product.metaImage;
      if (product.images && product.images.length > 0) {
        const cover = product.images.find((img) => img.isCover === 1);
        return (cover == null ? void 0 : cover.url) || product.images[0].url;
      }
      return "";
    }
    function getOriginalPrice(product) {
      return product.originalPrice || Math.round(product.price * 1.3);
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: searchKeyword.value,
        b: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        c: common_vendor.o(goToSearch),
        d: common_vendor.f(categories.value.slice(0, 8), (cat, k0, i0) => {
          var _a, _b;
          return {
            a: common_vendor.t(cat.icon || "📦"),
            b: cat.id % 2 === 0 ? "var(--primary-light)" : "var(--accent-light)",
            c: common_vendor.t(((_a = cat.name) == null ? void 0 : _a.zh) || ((_b = cat.name) == null ? void 0 : _b.en) || "分类"),
            d: cat.id,
            e: common_vendor.o(($event) => goToCategoryProducts(cat.id), cat.id)
          };
        }),
        e: common_vendor.f(hotProducts.value.slice(0, 4), (item, k0, i0) => {
          return common_vendor.e({
            a: getCoverImage(item)
          }, getCoverImage(item) ? {
            b: getCoverImage(item)
          } : {
            c: common_vendor.t(getProductName(item).charAt(0))
          }, {
            d: common_vendor.t(item.price),
            e: getOriginalPrice(item) > item.price
          }, getOriginalPrice(item) > item.price ? {
            f: common_vendor.t(getOriginalPrice(item))
          } : {}, {
            g: item.id,
            h: common_vendor.o(($event) => goToProductDetail(item.id), item.id)
          });
        }),
        f: common_vendor.o(goToAllProducts),
        g: common_vendor.f(hotProducts.value, (item, k0, i0) => {
          return common_vendor.e({
            a: getCoverImage(item)
          }, getCoverImage(item) ? {
            b: getCoverImage(item)
          } : {
            c: common_vendor.t(getProductName(item).charAt(0))
          }, {
            d: item.primaryTag
          }, item.primaryTag ? {
            e: common_vendor.t(item.primaryTag.name)
          } : {}, {
            f: common_vendor.t(getProductName(item)),
            g: common_vendor.t(item.price),
            h: common_vendor.t(item.sales || 0),
            i: item.id,
            j: common_vendor.o(($event) => goToProductDetail(item.id), item.id)
          });
        }),
        h: hotProducts.value.length === 0 && !loading.value
      }, hotProducts.value.length === 0 && !loading.value ? {} : {}, {
        i: common_vendor.n(common_vendor.unref(theme_config.THEME_CLASS))
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-83a5a03c"]]);
wx.createPage(MiniProgramPage);
