import { defineStore } from 'pinia'
import { searchApi, productApi } from '../api'

const MAX_HISTORY = 10
const HOT_WORDS_CACHE_KEY = 'hot_search_cache'
const HOT_WORDS_EXPIRE = 60 * 60 * 1000 // 1小时

interface SearchState {
  historyWords: string[]
  hotWords: string[]
  hotWordsExpire: number
  searchResults: any[]
  loading: boolean
  pageNo: number
  pageSize: number
  hasMore: boolean
  currentKeyword: string
}

export const useSearchStore = defineStore('search', {
  state: (): SearchState => ({
    historyWords: [],
    hotWords: [],
    hotWordsExpire: 0,
    searchResults: [],
    loading: false,
    pageNo: 1,
    pageSize: 12,
    hasMore: true,
    currentKeyword: ''
  }),

  actions: {
    // 加载历史记录
    loadHistory() {
      const history = uni.getStorageSync('search_history')
      if (history) {
        try {
          this.historyWords = JSON.parse(history)
        } catch {
          this.historyWords = []
        }
      }
    },

    // 添加历史记录
    addHistory(word: string) {
      if (!word?.trim()) return
      this.historyWords = this.historyWords.filter(w => w !== word)
      this.historyWords.unshift(word)
      if (this.historyWords.length > MAX_HISTORY) {
        this.historyWords = this.historyWords.slice(0, MAX_HISTORY)
      }
      uni.setStorageSync('search_history', JSON.stringify(this.historyWords))
    },

    // 清除历史记录
    clearHistory() {
      this.historyWords = []
      uni.removeStorageSync('search_history')
    },

    // 获取热门搜索词（带缓存）
    async fetchHotWords() {
      // 检查缓存
      const now = Date.now()
      if (this.hotWords.length > 0 && this.hotWordsExpire > now) {
        return this.hotWords
      }

      // 检查本地缓存
      const cacheStr = uni.getStorageSync(HOT_WORDS_CACHE_KEY)
      if (cacheStr) {
        try {
          const cache = JSON.parse(cacheStr)
          if (cache.words?.length && cache.expire > now) {
            this.hotWords = cache.words
            this.hotWordsExpire = cache.expire
            return this.hotWords
          }
        } catch {
          // ignore
        }
      }

      // 请求接口
      try {
        const res = await searchApi.getHotSearchWords()
        if (res.code === 200) {
          this.hotWords = res.data?.hotSearchWords || res.data || []
          this.hotWordsExpire = now + HOT_WORDS_EXPIRE
          // 写入本地缓存
          uni.setStorageSync(HOT_WORDS_CACHE_KEY, JSON.stringify({
            words: this.hotWords,
            expire: this.hotWordsExpire
          }))
        }
      } catch (error) {
        console.error('获取热门搜索失败', error)
      }

      return this.hotWords
    },

    // 搜索
    async search(keyword: string, reset = true) {
      if (this.loading) return

      if (reset) {
        this.pageNo = 1
        this.hasMore = true
        this.searchResults = []
      }

      this.loading = true
      this.currentKeyword = keyword

      try {
        const res = await productApi.getList({
          keyword,
          pageNo: this.pageNo,
          pageSize: this.pageSize
        })
        if (res.code === 200) {
          const list = res.data.pageData || []
          if (reset) {
            this.searchResults = list
          } else {
            this.searchResults = [...this.searchResults, ...list]
          }
          this.hasMore = list.length === this.pageSize
          this.pageNo++
        }
      } catch (error) {
        console.error('搜索失败', error)
        uni.showToast({ title: '搜索失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    // 加载更多
    async loadMore() {
      if (!this.hasMore || this.loading || !this.currentKeyword) return
      await this.search(this.currentKeyword, false)
    }
  }
})