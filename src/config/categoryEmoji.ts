// 分类emoji配置
// 使用说明：修改此文件的映射关系即可自定义分类图标

export const categoryEmojiMap: Record<string, string> = {
  // 耳机类
  '耳机': '🎧',
  '蓝牙耳机': '🎧',
  '无线耳机': '🎧',
  '降噪耳机': '🎧',
  '头戴式耳机': '🎧',
  '有线耳机': '🔌',
  '耳塞': '🎧',

  // 音箱类
  '音箱': '🔊',
  '蓝牙音箱': '📻',
  '智能音箱': '📻',
  'HIFI音箱': '🎵',
  '音响': '🔊',
  'soundbar': '🔊',

  // 功放/解码类
  '功放': '⚙️',
  '耳放': '⚙️',
  '解码器': '⚙️',
  'DAC': '⚙️',

  // 线材类
  '线材': '〰️',
  '音频线': '〰️',
  '电源线': '〰️',

  // 配件类
  '配件': '🛠️',
  '保护套': '🛡️',
  '充电盒': '🔋',

  // 手表类
  '手表': '⌚',
  '智能手表': '⌚',
  '机械表': '🕰️',
  '表带': '🔗',
  '表盒': '📦'
}

// 背景色配置（按品类分组）
export const emojiBgColors: string[] = [
  'var(--primary-light)',   // 0: 主色系-耳机
  'var(--accent-light)',    // 1: 强调色系-有线
  '#d1fae5',               // 2: 绿色系-音箱
  '#fef3c7',               // 3: 黄色系-智能
  '#e9d5ff',               // 4: 紫色系-HIFI
  '#fed7aa',               // 5: 橙色系-功放
  '#e0e7ff',               // 6: 蓝灰色系-线材
  '#f3f4f6'                // 7: 灰色系-配件
]

// 兜底emoji列表（未匹配时使用）
export const fallbackEmojis: string[] = ['🎧', '🔊', '⚙️', '〰️', '🛠️']

// 获取分类emoji
export function getCategoryEmoji(name: string): string {
  const zhName = name?.zh || name?.en || ''
  for (const key of Object.keys(categoryEmojiMap)) {
    if (zhName.includes(key)) {
      return categoryEmojiMap[key]
    }
  }
  return fallbackEmojis[Math.abs(zhName.charCodeAt(0)) % fallbackEmojis.length]
}

// 获取背景色
export function getCategoryBgColor(index: number): string {
  return emojiBgColors[index % emojiBgColors.length]
}
