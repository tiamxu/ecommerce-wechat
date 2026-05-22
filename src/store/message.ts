import { defineStore } from 'pinia'
import { ref } from 'vue'

const STORAGE_KEY = 'chat_messages'

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  time: string
  type?: 'text' | 'trip_card' | 'confirm_question'
  tripData?: any
}

// 从本地存储加载消息
function loadMessages(): Message[] {
  try {
    const data = uni.getStorageSync(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('[MessageStore] Load failed:', e)
  }
  return []
}

// 保存消息到本地存储
function saveMessages(messages: Message[]) {
  try {
    uni.setStorageSync(STORAGE_KEY, JSON.stringify(messages))
  } catch (e) {
    console.error('[MessageStore] Save failed:', e)
  }
}

export const useMessageStore = defineStore('message', () => {
  const messages = ref<Message[]>(loadMessages())
  const conversationId = ref<string | null>(null)

  function addMessage(msg: Omit<Message, 'id' | 'time'>) {
    const message: Message = {
      ...msg,
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    messages.value.push(message)
    saveMessages(messages.value)
    return message
  }

  function updateMessage(id: string, updates: Partial<Message>) {
    const index = messages.value.findIndex(m => m.id === id)
    if (index !== -1) {
      messages.value[index] = { ...messages.value[index], ...updates }
      saveMessages(messages.value)
    }
  }

  // 删除指定消息
  function removeMessage(id: string) {
    const index = messages.value.findIndex(m => m.id === id)
    if (index !== -1) {
      messages.value.splice(index, 1)
      saveMessages(messages.value)
    }
  }

  // 清空消息并添加欢迎语
  function resetWithWelcome() {
    messages.value = []
    messages.value.push({
      id: Date.now().toString(),
      role: 'assistant' as const,
      content: '你好！我是智旅AI助手 ✈️\n\n告诉我你想去哪里旅行，我来帮你规划完美行程~\n\n比如："端午3天带父母去成都"',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    })
    saveMessages(messages.value)
  }

  function clearMessages() {
    messages.value = []
    conversationId.value = null
    saveMessages(messages.value)
  }

  return {
    messages,
    conversationId,
    addMessage,
    updateMessage,
    removeMessage,
    clearMessages,
    resetWithWelcome
  }
})
