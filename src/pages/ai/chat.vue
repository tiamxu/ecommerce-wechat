<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useUserStore } from '../../store/user'
import { useMessageStore } from '../../store/message'
import { useTripStore, type Trip } from '../../store/trip'
import TabBar from '../../components/TabBar.vue'
import ChatBubble from '../../components/ChatBubble.vue'
import QuickPrompt from '../../components/QuickPrompt.vue'
import TripCard from '../../components/TripCard.vue'
import { THEME_CLASS } from '../../theme/config'
import type { TripRoute } from '../../api/trip'

const userStore = useUserStore()
const messageStore = useMessageStore()
const tripStore = useTripStore()

const inputText = ref('')
const loading = ref(false)
const currentParams = ref<any>(null)
const analysisMsgId = ref<string | null>(null)
const scrollTop = ref(99999)
let lastSendTime = 0

// 快捷指令
const quickPrompts = [
  { text: '端午3天带父母去成都', icon: '🗺️' },
  { text: '周末亲子游推荐', icon: '👨‍👩‍👧' },
  { text: '海岛度假规划', icon: '🏝️' },
  { text: '和闺蜜成都美食3日游', icon: '🍜' },
  { text: '云南7天深度游', icon: '🏔️' },
  { text: '三亚5天家庭游', icon: '🌴' }
]

onMounted(() => {
  // 如果没有消息，初始化欢迎语
  if (messageStore.messages.length === 0) {
    messageStore.resetWithWelcome()
  }
})

function onQuickPrompt(item: typeof quickPrompts[0]) {
  inputText.value = item.text
  sendMessage()
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || loading.value) return

  // 防抖：3秒内不能重复发送
  const now = Date.now()
  if (now - lastSendTime < 3000) {
    uni.showToast({ title: '操作太频繁，请稍后', icon: 'none' })
    return
  }
  lastSendTime = now

  // 添加用户消息
  messageStore.addMessage({
    role: 'user',
    content: text,
    type: 'text'
  })

  inputText.value = ''
  loading.value = true
  scrollToBottom()

  try {
    // 解析用户输入，生成请求参数
    const params = parseUserInput(text)
    currentParams.value = params

    // 检查登录状态
    const token = uni.getStorageSync('token')
    const isLoggedIn = !!token && userStore.isLoggedIn

    // 未登录时提示
    if (!isLoggedIn) {
      uni.showToast({ title: '登录后可保存行程', icon: 'none' })
    }

    // 收集route数据用于展示
    const routes: any[] = []
    let profileData: any = null

    // 显示正在分析
    const analysisMsg = messageStore.addMessage({
      role: 'assistant',
      content: '正在分析您的旅行偏好...',
      type: 'text'
    })
    analysisMsgId.value = analysisMsg.id

    // 流式回调
    const handleStreamMessage = (type: string, data: any) => {
      if (type === 'profile') {
        profileData = data
      } else if (type === 'route') {
        routes.push(data)
      } else if (type === 'error') {
        console.error('[WS] Error:', data)
        messageStore.removeMessage(analysisMsgId.value!)
        messageStore.addMessage({
          role: 'assistant',
          content: '生成失败：' + (data || '未知错误'),
          type: 'text'
        })
      }
    }

    // 调用WebSocket流式接口：登录用保存接口，未登录用公共接口
    if (isLoggedIn) {
      await tripStore.generateAndSaveTripStreamWS(params, handleStreamMessage)
    } else {
      await tripStore.generateTripStreamWS(params, handleStreamMessage)
    }

    // 移除分析提示
    messageStore.removeMessage(analysisMsgId.value)
    analysisMsgId.value = null

    // 流式结束后，统一显示所有线路卡片
    if (routes.length > 0) {
      // 更新currentTrip
      const trip: any = {
        id: Date.now(),
        destination: params.destination,
        days: params.days,
        budget: params.budget || '舒适',
        status: 'planning',
        createdAt: new Date().toISOString(),
        routes: routes,
        favoriteRoutes: []
      }
      tripStore.setCurrentTrip(trip)

      // 一次性显示所有线路卡片
      messageStore.addMessage({
        role: 'assistant',
        content: `为您生成了${routes.length}条差异化行程线路，请选择：`,
        type: 'text'
      })
      messageStore.addMessage({
        role: 'assistant',
        content: '',
        type: 'trip_card',
        tripData: { routes: routes }
      })
    } else {
      messageStore.addMessage({
        role: 'assistant',
        content: '抱歉，生成行程遇到问题，请稍后重试',
        type: 'text'
      })
    }
  } catch (error: any) {
    console.error('生成行程失败', error)
    // 移除分析提示
    if (analysisMsgId.value) {
      messageStore.removeMessage(analysisMsgId.value)
      analysisMsgId.value = null
    }
    let errMsg = '抱歉，生成行程遇到问题，请稍后重试'
    if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
      errMsg = '登录已过期，请重新登录'
    } else if (error?.message?.includes('network') || error?.message?.includes('网络')) {
      errMsg = '网络连接失败，请检查网络后重试'
    } else if (error?.message) {
      errMsg = error.message
    }
    messageStore.addMessage({
      role: 'assistant',
      content: errMsg,
      type: 'text'
    })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

// 解析用户输入为请求参数
function parseUserInput(text: string): any {
  const params: any = {
    destination: '',
    days: 3,
    budget: '舒适'
  }

  // 提取目的地
  const destinations = [
    '成都', '云南', '三亚', '杭州', '丽江', '大理', '西安', '重庆', '厦门', '青岛',
    '桂林', '张家界', '九寨沟', '西藏', '新疆', '上海', '北京', '广州', '深圳', '南京',
    '苏州', '扬州', '无锡', '黄山', '泰山', '华山', '峨眉山', '乐山', '桂林', '阳朔',
    '凤凰', '丽江古城', '大理古城', '西塘', '乌镇', '周庄', '同里', '平遥', '敦煌',
    '青海湖', '拉萨', '香格里拉', '腾冲', '西双版纳', '马尔代夫', '普吉岛', '巴厘岛',
    '济州岛', '东京', '大阪', '首尔', '曼谷', '新加坡', '米兰', '巴黎', '伦敦', '纽约'
  ]
  for (const dest of destinations) {
    if (text.includes(dest)) {
      params.destination = dest
      break
    }
  }

  // 提取天数
  const daysMatch = text.match(/(\d+)天/)
  if (daysMatch) {
    params.days = parseInt(daysMatch[1])
  }

  // 提取预算
  if (text.includes('穷游') || text.includes('省钱')) {
    params.budget = '穷游'
  } else if (text.includes('奢侈') || text.includes('豪华')) {
    params.budget = '奢侈'
  } else {
    params.budget = '舒适'
  }

  // 提取场景
  if (text.includes('带父母') || text.includes('爸妈') || text.includes('老人')) {
    params.scene = '家庭'
    params.age_groups = ['老人']
  } else if (text.includes('亲子') || text.includes('小孩') || text.includes('儿童')) {
    params.scene = '亲子'
    params.age_groups = ['儿童']
  } else if (text.includes('情侣') || text.includes('夫妻') || text.includes('蜜月')) {
    params.scene = '情侣'
  } else if (text.includes('闺蜜') || text.includes('朋友')) {
    params.scene = '朋友'
  }

  // 提取偏好
  const preferences: string[] = []
  if (text.includes('美食') || text.includes('吃')) preferences.push('美食')
  if (text.includes('自然') || text.includes('风景')) preferences.push('自然风光')
  if (text.includes('人文') || text.includes('历史')) preferences.push('人文景观')
  if (text.includes('摄影') || text.includes('拍照')) preferences.push('摄影')
  if (text.includes('购物')) preferences.push('购物')
  if (preferences.length > 0) {
    params.preferences = preferences
  }

  // 提取必去景点
  if (params.destination === '成都' && text.includes('熊猫')) {
    params.required_spots = ['熊猫基地']
  }

  return params
}

function scrollToBottom() {
  nextTick(() => {
    scrollTop.value = Date.now()
  })
}

function handleTripCardClick(route: TripRoute) {
  // 构建完整的trip对象
  const trip: Trip = {
    id: tripStore.currentTrip?.id || Date.now(),
    destination: currentParams.value?.destination || tripStore.currentTrip?.destination || '',
    days: currentParams.value?.days || tripStore.currentTrip?.days || 3,
    budget: (currentParams.value?.budget || tripStore.currentTrip?.budget || '舒适') as '穷游' | '舒适' | '奢侈',
    status: 'planning' as const,
    createdAt: new Date().toISOString(),
    routes: [route],
    favoriteRoutes: tripStore.currentTrip?.favoriteRoutes || []
  }
  tripStore.setCurrentTrip(trip)
  uni.navigateTo({ url: '/pages/plan/detail' })
}

function handleFavorite(route: TripRoute) {
  tripStore.toggleFavoriteRoute(route.name)
  uni.showToast({
    title: tripStore.isRouteFavorite(route.name) ? '已收藏' : '取消收藏',
    icon: 'success'
  })
}

function clearChat() {
  uni.showModal({
    title: '确认清空',
    content: '确定要清空当前会话吗？',
    success: (res) => {
      if (res.confirm) {
        messageStore.resetWithWelcome()
      }
    }
  })
}

function clearInput() {
  inputText.value = ''
}
</script>

<template>
  <view :class="['ai-chat', THEME_CLASS]">
    <TabBar />

    <!-- 顶部操作栏 -->
    <view class="chat-header">
      <text class="chat-title">智旅AI助手</text>
      <view class="header-actions">
        <view class="action-btn" @click="clearChat">
          <uni-icons type="trash" size="20" color="var(--text-sub)" />
        </view>
      </view>
    </view>

    <!-- 对话区域 -->
    <scroll-view
      class="chat-area"
      scroll-y
      :scroll-top="scrollTop"
      :show-scrollbar="false"
    >
      <!-- 欢迎语 -->
      <view v-if="messageStore.messages.length <= 1" class="welcome-section">
        <view class="welcome-header">
          <text class="welcome-emoji">✈️</text>
          <text class="welcome-title">智旅AI助手</text>
          <text class="welcome-desc">您的专属旅行规划师</text>
        </view>

        <!-- 快捷指令 -->
        <view class="quick-section">
          <text class="quick-title">热门目的地</text>
          <view class="quick-grid">
            <QuickPrompt
              v-for="item in quickPrompts"
              :key="item.text"
              :icon="item.icon"
              :text="item.text"
              @click="onQuickPrompt(item)"
            />
          </view>
        </view>
      </view>

      <!-- 消息列表 -->
      <view class="message-list">
        <view
          v-for="msg in messageStore.messages"
          :key="msg.id"
        >
          <!-- 普通消息气泡 -->
          <ChatBubble
            v-if="(msg.type === 'text' || !msg.type) && msg.role !== 'system'"
            :role="msg.role as 'user' | 'assistant'"
            :content="msg.content"
            :time="msg.time"
          />

          <!-- 线路卡片 -->
          <view v-else-if="msg.type === 'trip_card' && msg.tripData" class="trip-cards">
            <TripCard
              v-for="route in msg.tripData.routes"
              :key="route.name"
              :route="{
                id: route.name,
                title: route.name,
                theme: route.theme,
                totalCost: route.estimated_cost,
                suitableFor: route.theme,
                days: tripStore.currentTrip?.days || 5
              }"
              :isFavorite="tripStore.isRouteFavorite(route.name)"
              @click="handleTripCardClick(route)"
              @favorite="handleFavorite(route)"
            />
          </view>
        </view>

        <!-- 加载中 -->
        <view v-if="loading" class="typing-indicator">
          <view class="typing-dot"></view>
          <view class="typing-dot"></view>
          <view class="typing-dot"></view>
          <text class="typing-text">AI正在规划中...</text>
        </view>
      </view>
    </scroll-view>

    <!-- 输入区域 -->
    <view class="input-area">
      <view
        v-if="inputText"
        class="clear-btn"
        @click="clearInput"
      >
        <uni-icons type="close" size="16" color="var(--text-placeholder)" />
      </view>
      <input
        v-model="inputText"
        class="chat-input"
        placeholder="描述您的旅行需求..."
        confirm-type="send"
        @confirm="sendMessage"
      />
      <view
        class="send-btn"
        :class="{ disabled: !inputText.trim() || loading }"
        @click="sendMessage"
      >
        <uni-icons type="paperplane" size="20" color="#fff" />
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.ai-chat {
  min-height: 100vh;
  background: var(--bg-page);
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* 顶部操作栏 */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  padding-top: calc(20rpx + env(safe-area-inset-top));
  background: var(--bg-card);
  border-bottom: 1rpx solid var(--border);
  flex-shrink: 0;
}

.chat-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--text-main);
}

.header-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-page);
  border-radius: 32rpx;

  &:active {
    opacity: 0.7;
  }
}

.chat-area {
  flex: 1;
  padding: 24rpx;
  padding-top: calc(24rpx + env(safe-area-inset-top));
  padding-bottom: calc(240rpx + env(safe-area-inset-bottom));
}

/* 欢迎区 */
.welcome-section {
  margin-bottom: 40rpx;
}

.welcome-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx 0;
}

.welcome-emoji {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.welcome-title {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 8rpx;
}

.welcome-desc {
  font-size: 26rpx;
  color: var(--text-sub);
}

/* 快捷指令 */
.quick-section {
  margin-top: 20rpx;
}

.quick-title {
  font-size: 26rpx;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 16rpx;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

/* 消息列表 */
.message-list {
  display: flex;
  flex-direction: column;
}

/* 线路卡片 */
.trip-cards {
  margin-top: 16rpx;
}

/* 加载动画 */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 20rpx 0;
}

.typing-dot {
  width: 12rpx;
  height: 12rpx;
  background: var(--primary);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;

  &:nth-child(1) { animation-delay: 0s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.4s; }
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.typing-text {
  font-size: 24rpx;
  color: var(--text-sub);
  margin-left: 12rpx;
}

/* 输入区域 */
.input-area {
  position: fixed;
  bottom: calc(100rpx + env(safe-area-inset-bottom));
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: var(--bg-card);
  box-shadow: 0 -2rpx 12rpx var(--shadow);
  z-index: 100;
}

.clear-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-input {
  flex: 1;
  height: 80rpx;
  padding: 0 24rpx;
  background: var(--bg-input);
  border-radius: 40rpx;
  font-size: 28rpx;

  &::placeholder {
    color: var(--text-placeholder);
  }
}

.send-btn {
  width: 80rpx;
  height: 80rpx;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease;

  &.disabled {
    opacity: 0.5;
  }

  &:active:not(.disabled) {
    opacity: 0.8;
  }
}
</style>
