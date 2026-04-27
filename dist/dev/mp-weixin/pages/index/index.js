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
  (TabBar + _easycom_uni_icons + Skeleton)();
}
const TabBar = () => "../../components/TabBar.js";
const Skeleton = () => "../../components/Skeleton.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const hotProducts = common_vendor.ref([]);
    const banners = common_vendor.ref([]);
    const loading = common_vendor.ref(false);
    const hasLoaded = common_vendor.ref(false);
    common_vendor.onMounted(() => {
      loadData();
    });
    common_vendor.onShow(() => {
      if (hasLoaded.value) {
        loadData();
      }
    });
    async function loadData() {
      loading.value = true;
      try {
        const [hotRes, bannerRes] = await Promise.all([
          api_product.productApi.getHotProducts(8),
          api_product.productApi.getContents("banner")
        ]);
        if (hotRes.code === 200) {
          hotProducts.value = hotRes.data.pageData || [];
        }
        if (bannerRes.code === 200 && bannerRes.data) {
          banners.value = bannerRes.data.filter((b) => b.status === 1);
        }
      } catch (error) {
        console.error("加载数据失败", error);
      } finally {
        loading.value = false;
        hasLoaded.value = true;
      }
    }
    function getBannerBg(banner) {
      try {
        const extra = banner.extraJSON ? JSON.parse(banner.extraJSON) : {};
        return extra.image || "";
      } catch {
        return "";
      }
    }
    function getBannerTitle(banner) {
      return banner.zhValue || banner.enValue || "";
    }
    function getBannerDesc(banner) {
      try {
        const extra = banner.extraJSON ? JSON.parse(banner.extraJSON) : {};
        return extra.desc || "";
      } catch {
        return "";
      }
    }
    function goToSearch() {
      common_vendor.index.navigateTo({
        url: "/pages/search/index"
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
    function handleBannerClick(banner) {
      try {
        const extra = banner.extraJSON ? JSON.parse(banner.extraJSON) : {};
        if (extra.productId) {
          common_vendor.index.navigateTo({
            url: `/pages/product/detail?id=${extra.productId}`
          });
        }
      } catch (e) {
        console.error("解析banner数据失败", e);
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
        c: banners.value.length > 0
      }, banners.value.length > 0 ? {
        d: common_vendor.f(banners.value, (banner, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(getBannerTitle(banner)),
            b: getBannerDesc(banner)
          }, getBannerDesc(banner) ? {
            c: common_vendor.t(getBannerDesc(banner))
          } : {}, {
            d: `url('${getBannerBg(banner)}')`,
            e: banner.id,
            f: common_vendor.o(($event) => handleBannerClick(banner), banner.id)
          });
        })
      } : {}, {
        e: common_vendor.o(goToAllProducts),
        f: loading.value && hotProducts.value.length === 0
      }, loading.value && hotProducts.value.length === 0 ? {
        g: common_vendor.f(4, (i, k0, i0) => {
          return {
            a: "83a5a03c-2-" + i0,
            b: "83a5a03c-3-" + i0,
            c: "83a5a03c-4-" + i0,
            d: i
          };
        }),
        h: common_vendor.p({
          width: "100%",
          height: "320rpx",
          borderRadius: "0"
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
        k: common_vendor.f(hotProducts.value, (item, k0, i0) => {
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
        })
      }, {
        l: hotProducts.value.length === 0 && !loading.value
      }, hotProducts.value.length === 0 && !loading.value ? {} : {}, {
        m: common_vendor.n(common_vendor.unref(theme_config.THEME_CLASS))
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-83a5a03c"]]);
wx.createPage(MiniProgramPage);
