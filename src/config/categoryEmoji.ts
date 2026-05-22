// 分类emoji配置（旅游相关）
// 使用说明：修改此文件的映射关系即可自定义分类图标

export const categoryEmojiMap: Record<string, string> = {
  // 目的地类型
  '热门': '🔥',
  '海滨': '🏖️',
  '古镇': '🏘️',
  '山水': '🏔️',
  '人文': '🏛️',
  '美食': '🍜',
  '亲子': '👨‍👩‍👧',
  '度假': '🏝️',

  // 景点类型
  '景点': '📍',
  '公园': '🌳',
  '博物馆': '🏛️',
  '寺庙': '⛩️',
  '海滩': '🏖️',
  '雪山': '🏔️',
  '森林': '🌲',
  '湖泊': '🏞️',
  '峡谷': '🗺️',
  '溶洞': '🕳️',
  '主题公园': '🎢',

  // 活动类型
  '观光': '👁️',
  '徒步': '🥾',
  '骑行': '🚴',
  '潜水': '🤿',
  '滑雪': '⛷️',
  '漂流': '🛶',
  '蹦极': '🎯',
  '热气球': '🎈',

  // 住宿类型
  '酒店': '🏨',
  '民宿': '🏠',
  '客栈': '🏡',
  '度假村': '🏖️',
  '露营': '⛺',

  // 交通类型
  '飞机': '✈️',
  '高铁': '🚄',
  '火车': '🚃',
  '自驾': '🚗',
  '大巴': '🚌',
  '游轮': '🚢'
}

// 背景色配置（按品类分组）
export const emojiBgColors: string[] = [
  'var(--primary-light)',   // 0: 主色系
  'var(--accent-light)',    // 1: 强调色系
  '#d1fae5',               // 2: 绿色系
  '#fef3c7',               // 3: 黄色系
  '#e9d5ff',               // 4: 紫色系
  '#fed7aa',               // 5: 橙色系
  '#e0e7ff',               // 6: 蓝灰色系
  '#f3f4f6'                // 7: 灰色系
]

// 兜底emoji列表（未匹配时使用）
export const fallbackEmojis: string[] = ['✈️', '🏖️', '🏔️', '🏛️', '🎯']

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
