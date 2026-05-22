import { BASE_URL } from './env'

// WebSocket 配置
const WS_URL = BASE_URL.replace(/^http/, 'ws')
const RECONNECT_DELAY = 3000  // 重连延迟 3秒
const MAX_RECONNECT_ATTEMPTS = 5  // 最大重连次数
const GENERATE_TIMEOUT = 5 * 60 * 1000  // 生成总超时 5分钟

// WebSocket 连接状态
export type WSConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting'

// WebSocket 回调接口
export interface WSCallbacks {
  onOpen?: () => void
  onMessage?: (type: string, data: any) => void
  onError?: (error: any) => void
  onClose?: () => void
  onStateChange?: (state: WSConnectionState) => void
}

// WebSocket 管理器
class WSManager {
  private socket: UniApp.SocketTask | null = null
  private url: string = ''
  private callbacks: WSCallbacks = {}
  private reconnectAttempts: number = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private isManualClose: boolean = false
  private state: WSConnectionState = 'disconnected'

  // 连接
  connect(url: string, callbacks: WSCallbacks = {}) {
    this.url = url
    this.callbacks = callbacks
    this.isManualClose = false
    this.reconnectAttempts = 0

    this.doConnect()
  }

  private doConnect() {
    if (this.socket) {
      this.close()
    }

    this.updateState('connecting')

    console.log('[WS] Connecting to:', this.url)

    this.socket = uni.connectSocket({
      url: this.url,
      success: () => {
        console.log('[WS] Socket created')
      },
      fail: (err) => {
        console.error('[WS] Socket creation failed:', err)
        this.handleError(err)
        this.tryReconnect()
      }
    })

    // 监听打开
    this.socket.onOpen(() => {
      console.log('[WS] Connected')
      this.updateState('connected')
      this.reconnectAttempts = 0
      this.callbacks.onOpen?.()
    })

    // 监听消息
    this.socket.onMessage((event) => {
      console.log('[WS] Received:', event.data)
      this.handleMessage(event.data)
    })

    // 监听错误
    this.socket.onError((err) => {
      console.error('[WS] Error:', err)
      this.handleError(err)
    })

    // 监听关闭
    this.socket.onClose((event) => {
      console.log('[WS] Closed:', event)
      this.updateState('disconnected')
      this.callbacks.onClose?.()

      if (!this.isManualClose) {
        this.tryReconnect()
      }
    })
  }

  // 处理消息
  private handleMessage(data: string) {
    try {
      const parsed = JSON.parse(data)

      switch (parsed.type) {
        case 'profile':
          this.callbacks.onMessage?.('profile', parsed.data)
          break
        case 'route':
          this.callbacks.onMessage?.('route', parsed.data)
          break
        case 'done':
          this.callbacks.onMessage?.('done', null)
          break
        case 'error':
          this.callbacks.onMessage?.('error', parsed.data)
          break
        default:
          console.warn('[WS] Unknown message type:', parsed.type)
      }
    } catch (e) {
      console.error('[WS] Parse error:', e, 'Raw data:', data)
    }
  }

  // 发送消息
  send(type_: string, data: any) {
    if (!this.socket || this.state !== 'connected') {
      console.warn('[WS] Not connected, cannot send')
      return false
    }

    const message = JSON.stringify({ type: type_, data })
    console.log('[WS] Sending:', message)

    this.socket.send({
      data: message,
      fail: (err) => {
        console.error('[WS] Send failed:', err)
        this.callbacks.onError?.(err)
      }
    })

    return true
  }

  // 发送生成请求
  sendGenerate(params: {
    destination: string
    days: number
    budget: string
    scene?: string
    people?: number
    preferences?: string[]
    style?: string
    extra?: string
  }) {
    return this.send('generate', params)
  }

  // 关闭连接
  close() {
    this.isManualClose = true

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.socket) {
      this.socket.close({
        success: () => {
          console.log('[WS] Closed manually')
        }
      })
      this.socket = null
    }

    this.updateState('disconnected')
  }

  // 尝试重连
  private tryReconnect() {
    if (this.isManualClose) return
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error('[WS] Max reconnect attempts reached')
      this.callbacks.onError?.(new Error('连接失败，请稍后重试'))
      return
    }

    this.reconnectAttempts++
    this.updateState('reconnecting')

    console.log(`[WS] Reconnecting... Attempt ${this.reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}`)

    this.reconnectTimer = setTimeout(() => {
      this.doConnect()
    }, RECONNECT_DELAY)
  }

  // 处理错误
  private handleError(err: any) {
    this.callbacks.onError?.(err)
  }

  // 更新状态
  private updateState(state: WSConnectionState) {
    this.state = state
    this.callbacks.onStateChange?.(state)
  }

  // 获取当前状态
  getState(): WSConnectionState {
    return this.state
  }
}

// 单例
export const wsManager = new WSManager()

// WebSocket 请求封装
export interface WsGenerateResult {
  close: () => void
  waitForDone: () => Promise<void>
}

export async function wsTripGenerate(params: {
  destination: string
  days: number
  budget: string
  scene?: string
  people?: number
  preferences?: string[]
  style?: string
  extra?: string
  save?: boolean
}, callbacks: WSCallbacks = {}, token?: string): Promise<WsGenerateResult> {
  return new Promise((resolve, reject) => {
    // 构建 URL
    let url: string
    if (params.save && token) {
      url = `${WS_URL}/ws/trip/generate/save?token=${token}`
    } else {
      url = `${WS_URL}/ws/trip/generate`
    }

    // 是否已收到done
    let isDone = false
    let doneResolve: (() => void) | null = null
    let timeoutTimer: ReturnType<typeof setTimeout> | null = null

    // 返回等待done的Promise
    const waitForDone = () => new Promise<void>((res) => {
      if (isDone) {
        res()
      } else {
        doneResolve = res
      }
    })

    // 关闭函数
    const close = () => {
      if (timeoutTimer) {
        clearTimeout(timeoutTimer)
        timeoutTimer = null
      }
      wsManager.close()
    }

    // 保险超时 5分钟
    timeoutTimer = setTimeout(() => {
      if (!isDone) {
        console.error('[WS] 生成超时，已自动关闭连接')
        isDone = true
        wsManager.close()
        callbacks.onError?.(new Error('生成超时，请稍后重试'))
        doneResolve?.()
      }
    }, GENERATE_TIMEOUT)

    // 连接并设置回调
    wsManager.connect(url, {
      onOpen: () => {
        // 发送生成请求
        const { save, ...generateParams } = params
        wsManager.sendGenerate(generateParams)
        callbacks.onOpen?.()
      },
      onMessage: (type, data) => {
        if (type === 'done') {
          isDone = true
          if (timeoutTimer) clearTimeout(timeoutTimer)
          doneResolve?.()
        } else if (type === 'error') {
          isDone = true
          if (timeoutTimer) clearTimeout(timeoutTimer)
          doneResolve?.()
        }
        callbacks.onMessage?.(type, data)
      },
      onError: (err) => {
        if (!isDone) {
          isDone = true
          if (timeoutTimer) clearTimeout(timeoutTimer)
          doneResolve?.()
        }
        callbacks.onError?.(err)
      }
    })

    // 返回结果对象
    resolve({ close, waitForDone })
  })
}
