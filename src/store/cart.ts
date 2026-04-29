import { defineStore } from 'pinia'
import { cartApi, type CartItem, type CartResponse } from '../api/cart'

interface CartState {
  items: CartItem[]
  totalCount: number
  totalPrice: number
  loading: boolean
  initialized: boolean
  fetching: boolean // 防止重复请求
}

export const useCartStore = defineStore('cart', {
  state: (): CartState => ({
    items: [],
    totalCount: 0,
    totalPrice: 0,
    loading: false,
    initialized: false,
    fetching: false
  }),

  getters: {
    isEmpty: (state) => state.items.length === 0,
    selectedItems: (state) => state.items.filter(item => item.selected !== false),
    selectedCount: (state) => state.items.reduce((sum, item) => {
      if (item.selected !== false) {
        return sum + item.quantity
      }
      return sum
    }, 0),
    selectedPrice: (state) => state.items.reduce((sum, item) => {
      if (item.selected !== false) {
        return sum + (item.productPrice * item.quantity)
      }
      return sum
    }, 0)
  },

  actions: {
    // 加载购物车
    async loadCart() {
      // 防止重复请求
      if (this.fetching) return
      this.fetching = true
      this.loading = true
      try {
        const res = await cartApi.getList()
        if (res.code === 200 && res.data) {
          this.items = (res.data.items || []).map(item => ({
            ...item,
            selected: item.selected !== false
          }))
          this.totalCount = res.data.totalCount || 0
          this.totalPrice = res.data.totalPrice || 0
          this.initialized = true
        }
      } catch (error) {
        console.error('加载购物车失败', error)
      } finally {
        this.loading = false
        this.fetching = false
      }
    },

    // 添加商品到购物车
    async addItem(productId: number, quantity: number = 1) {
      try {
        const res = await cartApi.add({ productId, quantity })
        if (res.code === 200) {
          await this.loadCart()
          return { success: true }
        }
        return { success: false, message: res.message }
      } catch (error: any) {
        console.error('添加购物车失败', error)
        return { success: false, message: error.message || '添加失败' }
      }
    },

    // 更新商品数量
    async updateQuantity(productId: number, quantity: number) {
      // 乐观更新
      const item = this.items.find(i => i.productId === productId)
      if (!item) return { success: false }

      const oldQuantity = item.quantity
      item.quantity = quantity

      try {
        const res = await cartApi.update(productId, quantity)
        if (res.code === 200) {
          this.recalculateTotal()
          return { success: true }
        }
        // 回滚
        item.quantity = oldQuantity
        return { success: false, message: res.message }
      } catch (error: any) {
        // 回滚
        item.quantity = oldQuantity
        console.error('更新数量失败', error)
        return { success: false, message: error.message || '更新失败' }
      }
    },

    // 删除商品
    async removeItem(productId: number) {
      const idx = this.items.findIndex(i => i.productId === productId)
      if (idx === -1) return { success: false }

      // 乐观删除
      const removedItem = this.items[idx]
      this.items.splice(idx, 1)
      this.recalculateTotal()

      try {
        const res = await cartApi.remove(productId)
        if (res.code === 200) {
          return { success: true }
        }
        // 回滚
        this.items.splice(idx, 0, removedItem)
        this.recalculateTotal()
        return { success: false, message: res.message }
      } catch (error: any) {
        // 回滚
        this.items.splice(idx, 0, removedItem)
        this.recalculateTotal()
        console.error('删除商品失败', error)
        return { success: false, message: error.message || '删除失败' }
      }
    },

    // 清空购物车
    async clearCart() {
      try {
        const res = await cartApi.clear()
        if (res.code === 200) {
          this.items = []
          this.totalCount = 0
          this.totalPrice = 0
          return { success: true }
        }
        return { success: false, message: res.message }
      } catch (error: any) {
        console.error('清空购物车失败', error)
        return { success: false, message: error.message || '清空失败' }
      }
    },

    // 切换商品选中状态
    toggleSelect(productId: number) {
      const item = this.items.find(i => i.productId === productId)
      if (item) {
        item.selected = !item.selected
      }
    },

    // 全选/取消全选
    toggleSelectAll() {
      const allSelected = this.items.every(i => i.selected !== false)
      this.items.forEach(item => {
        item.selected = !allSelected
      })
    },

    // 重新计算总计
    recalculateTotal() {
      this.totalCount = this.items.reduce((sum, item) => sum + item.quantity, 0)
      this.totalPrice = this.items.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0)
    },

    // 减少数量
    async decreaseQty(productId: number) {
      const item = this.items.find(i => i.productId === productId)
      if (item && item.quantity > 1) {
        return await this.updateQuantity(productId, item.quantity - 1)
      }
      return { success: false, message: '数量不能小于1' }
    },

    // 增加数量
    async increaseQty(productId: number) {
      const item = this.items.find(i => i.productId === productId)
      if (item && item.stock && item.quantity >= item.stock) {
        return { success: false, message: '库存不足' }
      }
      if (item) {
        return await this.updateQuantity(productId, item.quantity + 1)
      }
      return { success: false }
    }
  }
})
