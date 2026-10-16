import { onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'

// One SVG unit per CSS pixel keeps labels readable without scaling the data.
export function useSceneWidth() {
  const chart = useTemplateRef<SVGSVGElement>('housingChart')
  const width = ref(740)
  let observer: ResizeObserver | undefined
  onMounted(() => {
    if (!chart.value) return
    observer = new ResizeObserver(([entry]) => {
      if (entry && entry.contentRect.width > 0) width.value = entry.contentRect.width
    })
    observer.observe(chart.value)
  })
  onBeforeUnmount(() => observer?.disconnect())
  return { width }
}
