import type { AppLocale, LocalizedCopy } from '../../../types/ml'

export type SceneCopy = Record<string, LocalizedCopy>
export const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })
export const localizeScene = <T extends SceneCopy>(locale: AppLocale, value: T): { [K in keyof T]: string } =>
  Object.fromEntries(Object.entries(value).map(([key, item]) => [key, item[locale]])) as { [K in keyof T]: string }

export const playbackCopy = {
  play: copy('播放', 'Play'),
  pause: copy('暂停', 'Pause'),
  step: copy('单步', 'Step'),
  reset: copy('重置', 'Reset'),
  keys: copy('空格或右箭头：下一步。R：重置。', 'Space / Right Arrow: next step. R: reset.'),
  reducedMotion: copy('系统已启用减少动态效果；连续播放已关闭，请使用单步和重置。', 'Reduced motion is enabled; continuous playback is off. Use Step and Reset.'),
} as const satisfies SceneCopy
