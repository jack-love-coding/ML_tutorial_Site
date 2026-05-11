<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type {
  AppLocale,
  ExperimentConfig,
  FocusTarget,
  GradientLossFunctionDefinition,
  PlotPoint,
  TrainingSnapshot,
} from '../types/ml'
import { magnitude, round } from '../utils/math'
import {
  clampPointToLossDomain,
  getGradientLossFunctionDefinition,
} from '../simulations/gradientLossFunctions'

const props = defineProps<{
  snapshot?: TrainingSnapshot
  config: ExperimentConfig
  accent: string
  focusTarget?: FocusTarget
  layout?: 'split' | 'stacked'
  compact?: boolean
}>()

const emit = defineEmits<{
  'update-start-point': [point: { startX: number; startY: number }]
}>()

const { t, locale } = useI18n()
const surfaceCanvasRef = ref<HTMLCanvasElement>()
const contourCanvasRef = ref<HTMLCanvasElement>()
const dragging = ref(false)
const surfaceSize = 420
const contourSize = 420

interface LossBounds {
  min: number
  max: number
}

interface ProjectedPoint {
  x: number
  y: number
}

interface SurfaceCell {
  points: ProjectedPoint[]
  depth: number
  hue: number
  lightness: number
}

const currentFunction = computed(() =>
  getGradientLossFunctionDefinition(String(props.config.lossFunction)),
)

const startPoint = computed(() =>
  clampPointToLossDomain(currentFunction.value, {
    x: Number(props.config.startX),
    y: Number(props.config.startY),
  }),
)

const lossBounds = computed(() => sampleLossBounds(currentFunction.value, 38))

const functionTag = computed(() => localizedText(currentFunction.value.label))
const surfaceBadge = computed(() => '3D loss surface')
const contourHint = computed(() =>
  locale.value === 'zh-CN'
    ? '拖拽起点并观察轨迹如何变化'
    : 'Drag the start point to compare trajectories',
)

function localizedText(copy?: { 'zh-CN': string; en: string }) {
  if (!copy) return ''
  return copy[locale.value as AppLocale]
}

function sampleLossBounds(definition: GradientLossFunctionDefinition, cells: number): LossBounds {
  const values: number[] = []
  for (let row = 0; row <= cells; row += 1) {
    for (let column = 0; column <= cells; column += 1) {
      const point = pointFromGrid(definition, column / cells, row / cells)
      values.push(definition.loss(point.x, point.y))
    }
  }
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  }
}

function pointFromGrid(definition: GradientLossFunctionDefinition, ux: number, uy: number) {
  return {
    x: definition.domain.xMin + ux * (definition.domain.xMax - definition.domain.xMin),
    y: definition.domain.yMax - uy * (definition.domain.yMax - definition.domain.yMin),
  }
}

function normalizeLoss(loss: number) {
  const range = lossBounds.value.max - lossBounds.value.min || 1
  return (loss - lossBounds.value.min) / range
}

function surfaceHeight(loss: number) {
  return normalizeLoss(loss) * 3.8
}

function projectSurfacePoint(x: number, y: number, z: number): ProjectedPoint {
  const centerX = surfaceSize * 0.53
  const centerY = surfaceSize * 0.78
  const domainX = currentFunction.value.domain.xMax - currentFunction.value.domain.xMin
  const domainY = currentFunction.value.domain.yMax - currentFunction.value.domain.yMin
  const nx = ((x - currentFunction.value.domain.xMin) / domainX - 0.5) * 2
  const ny = ((y - currentFunction.value.domain.yMin) / domainY - 0.5) * 2
  const isoX = (nx - ny) * 94
  const isoY = (nx + ny) * 45 - z * 42
  return { x: centerX + isoX, y: centerY + isoY }
}

function projectContourPoint(point: PlotPoint) {
  const { xMin, xMax, yMin, yMax } = currentFunction.value.domain
  return {
    x: ((point.x - xMin) / (xMax - xMin)) * contourSize,
    y: ((yMax - point.y) / (yMax - yMin)) * contourSize,
  }
}

function contourPointFromPointer(event: PointerEvent) {
  const canvas = contourCanvasRef.value
  if (!canvas) return startPoint.value
  const bounds = canvas.getBoundingClientRect()
  const px = ((event.clientX - bounds.left) / bounds.width) * contourSize
  const py = ((event.clientY - bounds.top) / bounds.height) * contourSize
  const point = {
    x:
      currentFunction.value.domain.xMin +
      (px / contourSize) * (currentFunction.value.domain.xMax - currentFunction.value.domain.xMin),
    y:
      currentFunction.value.domain.yMax -
      (py / contourSize) * (currentFunction.value.domain.yMax - currentFunction.value.domain.yMin),
  }
  return clampPointToLossDomain(currentFunction.value, point)
}

function buildSurface(definition: GradientLossFunctionDefinition) {
  const cells = 28
  const quads: SurfaceCell[] = []

  for (let row = 0; row < cells; row += 1) {
    for (let column = 0; column < cells; column += 1) {
      const corners = [
        pointFromGrid(definition, column / cells, row / cells),
        pointFromGrid(definition, (column + 1) / cells, row / cells),
        pointFromGrid(definition, (column + 1) / cells, (row + 1) / cells),
        pointFromGrid(definition, column / cells, (row + 1) / cells),
      ].map((point) => ({ ...point, loss: definition.loss(point.x, point.y) }))

      const meanLoss = corners.reduce((sum, corner) => sum + corner.loss, 0) / corners.length
      const normalized = normalizeLoss(meanLoss)
      const points = corners.map((corner) =>
        projectSurfacePoint(corner.x, corner.y, surfaceHeight(corner.loss)),
      )

      quads.push({
        points,
        depth: points.reduce((sum, point) => sum + point.y, 0) / points.length,
        hue: 24 + normalized * 18,
        lightness: 88 - normalized * 46,
      })
    }
  }

  return quads.sort((left, right) => left.depth - right.depth)
}

function drawArrow(
  context: CanvasRenderingContext2D,
  start: ProjectedPoint,
  end: ProjectedPoint,
  emphasis: boolean,
) {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.max(1, Math.sqrt(dx * dx + dy * dy))
  const ux = dx / length
  const uy = dy / length
  const head = emphasis ? 12 : 10

  context.beginPath()
  context.moveTo(start.x, start.y)
  context.lineTo(end.x, end.y)
  context.stroke()

  context.beginPath()
  context.moveTo(end.x, end.y)
  context.lineTo(end.x - ux * head - uy * 6, end.y - uy * head + ux * 6)
  context.lineTo(end.x - ux * head + uy * 6, end.y - uy * head - ux * 6)
  context.closePath()
  context.fill()
}

function surfacePathFromTrajectory(points: PlotPoint[]) {
  return points.map((point) =>
    projectSurfacePoint(
      point.x,
      point.y,
      surfaceHeight(currentFunction.value.loss(point.x, point.y)) + 0.08,
    ),
  )
}

function drawSurface() {
  const canvas = surfaceCanvasRef.value
  if (!canvas) return
  const context = canvas.getContext('2d')
  if (!context) return

  context.clearRect(0, 0, surfaceSize, surfaceSize)
  context.fillStyle = 'rgba(14, 20, 35, 0.05)'
  context.beginPath()
  context.ellipse(surfaceSize * 0.53, surfaceSize * 0.84, 160, 48, 0, 0, Math.PI * 2)
  context.fill()

  for (const cell of buildSurface(currentFunction.value)) {
    context.beginPath()
    context.moveTo(cell.points[0].x, cell.points[0].y)
    for (let index = 1; index < cell.points.length; index += 1) {
      context.lineTo(cell.points[index].x, cell.points[index].y)
    }
    context.closePath()
    context.fillStyle = `hsla(${cell.hue} 86% ${cell.lightness}% / ${props.focusTarget === 'surface' ? 0.96 : 0.88})`
    context.fill()
    context.strokeStyle = 'rgba(95, 74, 30, 0.09)'
    context.lineWidth = 0.9
    context.stroke()
  }

  const axisOrigin = projectSurfacePoint(
    currentFunction.value.domain.xMin,
    currentFunction.value.domain.yMin,
    0,
  )
  const axisX = projectSurfacePoint(
    currentFunction.value.domain.xMax,
    currentFunction.value.domain.yMin,
    0,
  )
  const axisY = projectSurfacePoint(
    currentFunction.value.domain.xMin,
    currentFunction.value.domain.yMax,
    0,
  )
  const axisZ = projectSurfacePoint(
    currentFunction.value.domain.xMin,
    currentFunction.value.domain.yMin,
    4.2,
  )

  context.strokeStyle = 'rgba(15, 23, 40, 0.24)'
  context.lineWidth = 1.2
  context.beginPath()
  context.moveTo(axisOrigin.x, axisOrigin.y)
  context.lineTo(axisX.x, axisX.y)
  context.moveTo(axisOrigin.x, axisOrigin.y)
  context.lineTo(axisY.x, axisY.y)
  context.moveTo(axisOrigin.x, axisOrigin.y)
  context.lineTo(axisZ.x, axisZ.y)
  context.stroke()

  if (props.snapshot?.trajectory?.length) {
    const path = surfacePathFromTrajectory(props.snapshot.trajectory)
    context.beginPath()
    path.forEach((point, index) => {
      if (index === 0) context.moveTo(point.x, point.y)
      else context.lineTo(point.x, point.y)
    })
    context.strokeStyle = props.accent
    context.lineWidth =
      props.focusTarget === 'trajectory' || props.focusTarget === 'surface' ? 4.4 : 3.2
    context.globalAlpha = props.focusTarget === 'gradient' || props.focusTarget === 'reference' ? 0.58 : 1
    context.stroke()
    context.globalAlpha = 1
  }

  if (props.snapshot?.point) {
    const currentPoint = projectSurfacePoint(
      props.snapshot.point.x,
      props.snapshot.point.y,
      surfaceHeight(currentFunction.value.loss(props.snapshot.point.x, props.snapshot.point.y)) + 0.12,
    )

    context.fillStyle = '#0f1728'
    context.strokeStyle = 'rgba(255,255,255,0.95)'
    context.lineWidth = 3
    context.beginPath()
    context.arc(currentPoint.x, currentPoint.y, props.focusTarget === 'surface' ? 8.5 : 7, 0, Math.PI * 2)
    context.fill()
    context.stroke()

    if (props.snapshot.gradient) {
      const gradientLength = magnitude(props.snapshot.gradient.x, props.snapshot.gradient.y)
      const scale = gradientLength > 0 ? Math.min(0.65, 0.28 + gradientLength * 0.08) / gradientLength : 0
      const targetX = props.snapshot.point.x - props.snapshot.gradient.x * scale
      const targetY = props.snapshot.point.y - props.snapshot.gradient.y * scale
      const arrowEnd = projectSurfacePoint(
        targetX,
        targetY,
        surfaceHeight(currentFunction.value.loss(targetX, targetY)) + 0.12,
      )

      context.strokeStyle = 'rgba(12, 24, 44, 0.92)'
      context.fillStyle = 'rgba(12, 24, 44, 0.92)'
      context.lineWidth = props.focusTarget === 'gradient' ? 4.2 : 3
      context.globalAlpha = props.focusTarget === 'trajectory' ? 0.65 : 1
      drawArrow(context, currentPoint, arrowEnd, props.focusTarget === 'gradient')
      context.globalAlpha = 1
    }
  }
}

function interpolateEdge(
  threshold: number,
  pointA: PlotPoint,
  pointB: PlotPoint,
  valueA: number,
  valueB: number,
) {
  const ratio = valueA === valueB ? 0.5 : (threshold - valueA) / (valueB - valueA)
  return {
    x: pointA.x + (pointB.x - pointA.x) * ratio,
    y: pointA.y + (pointB.y - pointA.y) * ratio,
  }
}

function contourSegments(threshold: number, points: PlotPoint[], values: number[]) {
  const edges: PlotPoint[] = []
  const pairs = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
  ] as const

  for (const [a, b] of pairs) {
    const valueA = values[a]
    const valueB = values[b]
    if ((valueA <= threshold && valueB >= threshold) || (valueA >= threshold && valueB <= threshold)) {
      edges.push(interpolateEdge(threshold, points[a], points[b], valueA, valueB))
    }
  }

  if (edges.length === 2) return [[edges[0], edges[1]]]
  if (edges.length === 4) return [[edges[0], edges[1]], [edges[2], edges[3]]]
  return []
}

function drawContour() {
  const canvas = contourCanvasRef.value
  if (!canvas) return
  const context = canvas.getContext('2d')
  if (!context) return

  context.clearRect(0, 0, contourSize, contourSize)

  const fillCells = 44
  for (let row = 0; row < fillCells; row += 1) {
    for (let column = 0; column < fillCells; column += 1) {
      const point = pointFromGrid(currentFunction.value, column / fillCells, row / fillCells)
      const loss = currentFunction.value.loss(point.x, point.y)
      const normalized = normalizeLoss(loss)
      context.fillStyle = `hsla(${22 + normalized * 18} 88% ${92 - normalized * 34}% / 1)`
      context.fillRect(
        (column / fillCells) * contourSize,
        (row / fillCells) * contourSize,
        contourSize / fillCells + 1,
        contourSize / fillCells + 1,
      )
    }
  }

  const contourLevels = Array.from({ length: 8 }, (_, index) =>
    lossBounds.value.min + ((index + 1) / 9) * (lossBounds.value.max - lossBounds.value.min),
  )
  const marchingCells = 34
  context.strokeStyle = 'rgba(15, 23, 40, 0.18)'
  context.lineWidth = 1.1

  for (const threshold of contourLevels) {
    context.beginPath()
    for (let row = 0; row < marchingCells; row += 1) {
      for (let column = 0; column < marchingCells; column += 1) {
        const corners = [
          pointFromGrid(currentFunction.value, column / marchingCells, row / marchingCells),
          pointFromGrid(currentFunction.value, (column + 1) / marchingCells, row / marchingCells),
          pointFromGrid(currentFunction.value, (column + 1) / marchingCells, (row + 1) / marchingCells),
          pointFromGrid(currentFunction.value, column / marchingCells, (row + 1) / marchingCells),
        ]
        const values = corners.map((corner) => currentFunction.value.loss(corner.x, corner.y))
        const segments = contourSegments(threshold, corners, values)
        for (const [start, end] of segments) {
          const startCanvas = projectContourPoint(start)
          const endCanvas = projectContourPoint(end)
          context.moveTo(startCanvas.x, startCanvas.y)
          context.lineTo(endCanvas.x, endCanvas.y)
        }
      }
    }
    context.stroke()
  }

  context.strokeStyle = 'rgba(15, 23, 40, 0.16)'
  context.lineWidth = 1
  context.strokeRect(0.5, 0.5, contourSize - 1, contourSize - 1)

  if (currentFunction.value.referencePoints?.length) {
    currentFunction.value.referencePoints.forEach((reference) => {
      const point = projectContourPoint(reference.point)
      context.fillStyle = reference.kind === 'saddle' ? '#0f1728' : 'rgba(255,255,255,0.96)'
      context.strokeStyle = reference.kind === 'saddle' ? '#f97352' : '#0f1728'
      context.lineWidth = props.focusTarget === 'reference' ? 3.2 : 2
      context.beginPath()
      context.arc(point.x, point.y, 5.5, 0, Math.PI * 2)
      context.fill()
      context.stroke()

      context.fillStyle = 'rgba(8, 18, 33, 0.78)'
      context.font = '12px IBM Plex Sans'
      context.fillText(localizedText(reference.label), point.x + 10, point.y - 8)
    })
  }

  if (props.snapshot?.trajectory?.length) {
    const points = props.snapshot.trajectory.map(projectContourPoint)
    context.beginPath()
    points.forEach((point, index) => {
      if (index === 0) context.moveTo(point.x, point.y)
      else context.lineTo(point.x, point.y)
    })
    context.strokeStyle = props.accent
    context.lineWidth = props.focusTarget === 'trajectory' || props.focusTarget === 'contour' ? 4 : 3
    context.globalAlpha = props.focusTarget === 'gradient' || props.focusTarget === 'reference' ? 0.58 : 1
    context.stroke()
    context.globalAlpha = 1
  }

  if (props.snapshot?.point && props.snapshot.gradient) {
    const point = projectContourPoint(props.snapshot.point)
    const gradientLength = magnitude(props.snapshot.gradient.x, props.snapshot.gradient.y)
    const scale = gradientLength > 0 ? Math.min(0.7, 0.34 + gradientLength * 0.07) / gradientLength : 0
    const target = projectContourPoint({
      x: props.snapshot.point.x - props.snapshot.gradient.x * scale,
      y: props.snapshot.point.y - props.snapshot.gradient.y * scale,
    })
    context.strokeStyle = 'rgba(12, 24, 44, 0.9)'
    context.fillStyle = 'rgba(12, 24, 44, 0.9)'
    context.lineWidth = props.focusTarget === 'gradient' ? 4 : 2.6
    drawArrow(context, point, target, props.focusTarget === 'gradient')
  }

  const dragPoint = projectContourPoint(startPoint.value)
  context.fillStyle = props.accent
  context.strokeStyle = 'rgba(255,255,255,0.95)'
  context.lineWidth = 3
  context.beginPath()
  context.arc(dragPoint.x, dragPoint.y, dragging.value ? 10 : 8, 0, Math.PI * 2)
  context.fill()
  context.stroke()

  context.fillStyle = 'rgba(8, 18, 33, 0.82)'
  context.font = '12px IBM Plex Sans'
  context.fillText(t('common.dragHint'), 14, contourSize - 16)
}

function redraw() {
  drawSurface()
  drawContour()
}

function commitPointerPoint(event: PointerEvent) {
  const point = contourPointFromPointer(event)
  emit('update-start-point', {
    startX: Number(point.x.toFixed(2)),
    startY: Number(point.y.toFixed(2)),
  })
}

function onPointerDown(event: PointerEvent) {
  dragging.value = true
  commitPointerPoint(event)
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) return
  commitPointerPoint(event)
}

function onPointerUp() {
  dragging.value = false
}

onMounted(() => {
  redraw()
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerup', onPointerUp, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
})

watch(
  () => [
    props.snapshot,
    props.focusTarget,
    props.config.lossFunction,
    props.config.startX,
    props.config.startY,
    locale.value,
  ],
  redraw,
  { deep: true },
)
</script>

<template>
  <section
    class="gradient-viz"
    :class="[
      props.focusTarget ? `is-focused-${props.focusTarget}` : '',
      `gradient-viz--${props.layout ?? 'split'}`,
      { 'gradient-viz--compact': props.compact },
    ]"
  >
    <article class="viz-card gradient-viz__panel gradient-viz__panel--surface">
      <header class="gradient-viz__header">
        <span>{{ t('common.surfaceView') }}</span>
        <strong>{{ functionTag }}</strong>
      </header>
      <canvas
        ref="surfaceCanvasRef"
        :width="surfaceSize"
        :height="surfaceSize"
        class="viz-card__canvas"
      />
      <div class="viz-card__hud">
        <span class="viz-card__tag">{{ surfaceBadge }}</span>
        <div class="viz-card__stats">
          <article>
            <span>{{ t('metrics.loss') }}</span>
            <strong>{{ round(props.snapshot?.loss ?? 0) }}</strong>
          </article>
          <article>
            <span>|grad|</span>
            <strong>{{ round(props.snapshot?.extraMetric ?? 0) }}</strong>
          </article>
        </div>
      </div>
    </article>

    <article class="viz-card gradient-viz__panel gradient-viz__panel--contour">
      <header class="gradient-viz__header">
        <span>{{ t('common.contourView') }}</span>
        <strong>{{ localizedText(currentFunction.teachingGoal) }}</strong>
      </header>
      <canvas
        ref="contourCanvasRef"
        :width="contourSize"
        :height="contourSize"
        class="viz-card__canvas gradient-viz__contour-canvas"
        @pointerdown="onPointerDown"
      />
      <div class="gradient-viz__footer">
        <span>{{ contourHint }}</span>
        <strong>({{ round(startPoint.x, 2) }}, {{ round(startPoint.y, 2) }})</strong>
      </div>
    </article>
  </section>
</template>
