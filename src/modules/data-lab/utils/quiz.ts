import type { DataLabModuleId, DataQuizAttempt, DataQuizItem } from '../types/dataLab'

export interface DataQuizEvaluation {
  correct: boolean
  reviewNeeded: boolean
  expectedAnswer: string
}

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase()
}

export function evaluateDataQuizAnswer(
  quiz: DataQuizItem,
  selected: string,
): DataQuizEvaluation {
  const correct = normalizeAnswer(selected) === normalizeAnswer(quiz.answer)

  return {
    correct,
    reviewNeeded: !correct,
    expectedAnswer: quiz.answer,
  }
}

export function buildDataQuizAttempt(
  moduleId: DataLabModuleId,
  quiz: DataQuizItem,
  selected: string,
  attemptedAt = new Date().toISOString(),
): DataQuizAttempt {
  const evaluation = evaluateDataQuizAnswer(quiz, selected)

  return {
    quizId: quiz.id,
    moduleId,
    selected,
    correct: evaluation.correct,
    attemptedAt,
  }
}

