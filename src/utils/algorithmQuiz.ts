import type { AlgorithmCheckpointItem, AlgorithmQuizAttempt, ModuleSlug } from '../types/ml'

export interface AlgorithmCheckpointEvaluation {
  correct: boolean
  misconceptionTags: string[]
  expectedAnswer: string
}

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase()
}

export function evaluateAlgorithmCheckpointAnswer(
  checkpoint: AlgorithmCheckpointItem,
  selected: string,
): AlgorithmCheckpointEvaluation {
  const correct = normalizeAnswer(selected) === normalizeAnswer(checkpoint.answer)

  return {
    correct,
    misconceptionTags: correct ? [] : checkpoint.misconceptionTags,
    expectedAnswer: checkpoint.answer,
  }
}

export function buildAlgorithmQuizAttempt(
  moduleSlug: ModuleSlug,
  checkpoint: AlgorithmCheckpointItem,
  selected: string,
  attemptedAt = new Date().toISOString(),
): AlgorithmQuizAttempt {
  const evaluation = evaluateAlgorithmCheckpointAnswer(checkpoint, selected)

  return {
    quizId: checkpoint.id,
    moduleSlug,
    selected,
    correct: evaluation.correct,
    misconceptionTags: evaluation.misconceptionTags,
    attemptedAt,
  }
}

export function scoreAlgorithmCheckpoints(
  checkpoints: AlgorithmCheckpointItem[],
  answers: Record<string, string>,
) {
  const evaluations = checkpoints.map((checkpoint) => ({
    checkpoint,
    evaluation: evaluateAlgorithmCheckpointAnswer(checkpoint, answers[checkpoint.id] ?? ''),
  }))
  const correct = evaluations.filter((item) => item.evaluation.correct).length
  const misconceptionTags = Array.from(
    new Set(evaluations.flatMap((item) => item.evaluation.misconceptionTags)),
  )

  return {
    correct,
    total: checkpoints.length,
    score: checkpoints.length ? correct / checkpoints.length : 0,
    misconceptionTags,
  }
}
