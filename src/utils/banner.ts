export function parseBannerExtra(banner: Record<string, any>): Record<string, any> {
  try {
    return banner.extraJSON ? JSON.parse(banner.extraJSON) : {}
  } catch {
    return {}
  }
}

export function getLocalizedValue(obj: any, locale: string): string {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  if (typeof obj === 'object' && obj !== null) {
    return locale === 'zh' ? (obj.zh || '') : (obj.en || '')
  }
  return ''
}