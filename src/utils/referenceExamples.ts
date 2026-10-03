import type { AppLocale, LocalizedCopy } from '../types/ml.ts'

export interface ExplainedQuestion {
  id: string
  prompt: LocalizedCopy
  explanation: LocalizedCopy
  answer: string | string[] | number
  choices?: { id: string; label: LocalizedCopy }[]
}

export function referenceConclusion(question: ExplainedQuestion, locale: AppLocale): string {
  const answers = Array.isArray(question.answer) ? question.answer : [question.answer]
  return answers.map((answer) =>
    question.choices?.find((choice) => choice.id === answer)?.label[locale] ?? String(answer),
  ).join(locale === 'zh-CN' ? '；' : '; ')
}
