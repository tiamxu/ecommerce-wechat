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
    const seckillEndTime = common_vendor.ref(new Date(Date.now() + 4 * 60 * 60 * 1e3));
    const countdown = common_vendor.ref({ hours: 0, minutes: 0, seconds: 0 });
    common_vendor.onMounted(() => {
      loadData();
      startCountdown();
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
    function startCountdown() {
      setInterval(() => {
        const now = /* @__PURE__ */ new Date();
        const diff = seckillEndTime.value.getTime() - now.getTime();
        if (diff > 0) {
          countdown.value.hours = Math.floor(diff / (1e3 * 60 * 60));
          countdown.value.minutes = Math.floor(diff % (1e3 * 60 * 60) / (1e3 * 60));
          countdown.value.seconds = Math.floor(diff % (1e3 * 60) / 1e3);
        }
      }, 1e3);
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
    function padZero(num) {
      return num.toString().padStart(2, "0");
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
        e: common_vendor.t(padZero(countdown.value.hours)),
        f: common_vendor.t(padZero(countdown.value.minutes)),
        g: common_vendor.t(padZero(countdown.value.seconds)),
        h: common_vendor.f(hotProducts.value.slice(0, 4), (item, k0, i0) => {
          return common_vendor.e({
            a: getCoverImage(item)
          }, getCoverImage(item) ? {
            b: getCoverImage(item)
          } : {
            c: common_vendor.t(getProductName(item).charAt(0))
          }, {
            d: common_vendor.t(item.price),
            e: common_vendor.t(Math.round(item.price * 1.5)),
            f: item.id,
            g: common_vendor.o(($event) => goToProductDetail(item.id), item.id)
          });
        }),
        i: common_vendor.o(goToAllProducts),
        j: common_vendor.f(hotProducts.value, (item, k0, i0) => {
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
            h: item.id,
            i: common_vendor.o(($event) => goToProductDetail(item.id), item.id)
          });
        }),
        k: common_vendor.t(Math.floor(Math.random() * 500 + 100)),
        l: hotProducts.value.length === 0 && !loading.value
      }, hotProducts.value.length === 0 && !loading.value ? {} : {}, {
        m: common_vendor.n(common_vendor.unref(theme_config.THEME_CLASS))
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-83a5a03c"]]);
wx.createPage(MiniProgramPage);
