import type { MathLabModuleId, QuizAttempt, QuizItem } from '../types/mathLab'

export interface QuizEvaluation {
  correct: boolean
  misconceptionTags: string[]
}

function normalizeText(value: unknown) {
  return String(value).trim().toLowerCase()
}

export function evaluateQuizAnswer(quiz: QuizItem, selected: string | string[] | number): QuizEvaluation {
  if (quiz.type === 'multi-choice') {
    const expected = Array.isArray(quiz.answer) ? quiz.answer.map(normalizeText).sort() : []
    const actual = Array.isArray(selected) ? selected.map(normalizeText).sort() : []
    const correct =
      expected.length === actual.length && expected.every((answer, index) => answer === actual[index])
    return {
      correct,
      misconceptionTags: correct ? [] : quiz.misconceptionTags,
    }
  }

  if (quiz.type === 'numeric') {
    const expected = Number(quiz.answer)
    const actual = Number(selected)
    const tolerance = quiz.tolerance ?? 1e-6
    const correct = Number.isFinite(actual) && Math.abs(expected - actual) <= tolerance
    return {
      correct,
      misconceptionTags: correct ? [] : quiz.misconceptionTags,
    }
  }

  const correct = normalizeText(selected) === normalizeText(quiz.answer)
  return {
    correct,
    misconceptionTags: correct ? [] : quiz.misconceptionTags,
  }
}

export function buildQuizAttempt(
  moduleId: MathLabModuleId,
  quiz: QuizItem,
  selected: string | string[] | number,
  attemptedAt = new Date().toISOString(),
): QuizAttempt {
  const evaluation = evaluateQuizAnswer(quiz, selected)
  return {
    quizId: quiz.id,
    moduleId,
    selected,
    correct: evaluation.correct,
    misconceptionTags: evaluation.misconceptionTags,
    attemptedAt,
  }
}

export function scoreQuiz(
  quizzes: QuizItem[],
  answers: Record<string, string | string[] | number>,
) {
  const attempts = quizzes.map((quiz) => ({
    quiz,
    evaluation: evaluateQuizAnswer(quiz, answers[quiz.id] ?? ''),
  }))
  const correct = attempts.filter((attempt) => attempt.evaluation.correct).length
  const misconceptionTags = Array.from(
    new Set(attempts.flatMap((attempt) => attempt.evaluation.misconceptionTags)),
  )

  return {
    correct,
    total: quizzes.length,
    score: quizzes.length ? correct / quizzes.length : 0,
    misconceptionTags,
  }
}
