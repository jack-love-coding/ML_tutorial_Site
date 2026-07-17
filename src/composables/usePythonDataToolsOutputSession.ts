import { onBeforeUnmount, onMounted, readonly, ref, shallowRef } from 'vue'
import {
  pythonDataToolsOutputIds,
  type PythonDataToolsOutputId,
} from '../data/pythonNotebookContract.ts'
import {
  loadPythonDataToolsCellOutputs,
  loadPythonDataToolsManifest,
  loadPythonDataToolsOutput,
  type PythonDataToolsCellOutputPreview,
  type PythonDataToolsLoadState,
  type PythonDataToolsManifest,
  type PythonDataToolsOutputViewModel,
} from '../utils/pythonDataToolsOutputs.ts'

type OutputState = PythonDataToolsLoadState<PythonDataToolsOutputViewModel>
type OutputStateMap = Record<PythonDataToolsOutputId, OutputState>

interface PythonDataToolsOutputSessionOptions {
  fetch?: typeof fetch
  baseUrl?: string
  outputIds?: readonly PythonDataToolsOutputId[]
}

function outputStateMap(state: OutputState): OutputStateMap {
  return Object.fromEntries(
    pythonDataToolsOutputIds.map((id) => [id, state]),
  ) as OutputStateMap
}

export function createPythonDataToolsOutputSession(
  options: PythonDataToolsOutputSessionOptions = {},
) {
  const manifest = shallowRef<PythonDataToolsManifest>()
  const cellOutputs = shallowRef<readonly PythonDataToolsCellOutputPreview[]>([])
  const outputStates = ref<OutputStateMap>(outputStateMap({ status: 'idle' }))
  const manualReloadAvailable = ref(false)
  const primaryOutputIds = [...new Set(options.outputIds ?? pythonDataToolsOutputIds)]

  let automaticLoadStarted = false
  let manualReloadConsumed = false
  let disposed = false
  let requestToken = 0
  let activeController: AbortController | undefined

  function isCurrentRequest(token: number, controller: AbortController) {
    return !disposed && token === requestToken && !controller.signal.aborted
  }

  async function loadOutputs(outputIds: readonly PythonDataToolsOutputId[]) {
    const currentManifest = manifest.value
    const controller = activeController
    if (!currentManifest || !controller || controller.signal.aborted || disposed) return

    const ids = [...new Set(outputIds)].filter((outputId) => (
      outputStates.value[outputId]?.status === 'idle'
    ))
    if (!ids.length) return

    const token = requestToken
    outputStates.value = {
      ...outputStates.value,
      ...Object.fromEntries(ids.map((outputId) => [outputId, { status: 'loading' } as const])),
    }
    const entries = await Promise.all(ids.map(async (outputId) => [
      outputId,
      await loadPythonDataToolsOutput(currentManifest, outputId, {
        fetch: options.fetch,
        baseUrl: options.baseUrl,
        signal: controller.signal,
      }),
    ] as const))
    if (!isCurrentRequest(token, controller)) return

    outputStates.value = {
      ...outputStates.value,
      ...Object.fromEntries(entries),
    }
  }

  async function runLoad(kind: 'automatic' | 'manual') {
    if (disposed) return
    if (kind === 'automatic') {
      if (automaticLoadStarted) return
      automaticLoadStarted = true
    } else {
      if (!manualReloadAvailable.value || manualReloadConsumed) return
      manualReloadConsumed = true
      manualReloadAvailable.value = false
    }

    activeController?.abort()
    const controller = new AbortController()
    activeController = controller
    const token = ++requestToken
    manifest.value = undefined
    cellOutputs.value = []
    outputStates.value = {
      ...outputStateMap({ status: 'idle' }),
      ...Object.fromEntries(primaryOutputIds.map((outputId) => [outputId, { status: 'loading' } as const])),
    }

    const manifestState = await loadPythonDataToolsManifest({
      fetch: options.fetch,
      baseUrl: options.baseUrl,
      signal: controller.signal,
    })
    if (!isCurrentRequest(token, controller)) return

    if (manifestState.status !== 'ready') {
      outputStates.value = {
        ...outputStateMap({ status: 'idle' }),
        ...Object.fromEntries(primaryOutputIds.map((outputId) => [outputId, manifestState])),
      }
      if (
        kind === 'automatic'
        && manifestState.status === 'error'
        && manifestState.code !== 'aborted'
      ) {
        manualReloadAvailable.value = true
      }
      activeController = undefined
      return
    }

    manifest.value = manifestState.data
    outputStates.value = outputStateMap({ status: 'idle' })
    const [cellOutputState] = await Promise.all([
      loadPythonDataToolsCellOutputs(manifestState.data, {
        fetch: options.fetch,
        baseUrl: options.baseUrl,
        signal: controller.signal,
      }),
      loadOutputs(primaryOutputIds),
    ])
    if (!isCurrentRequest(token, controller)) return
    if (cellOutputState.status === 'ready') {
      cellOutputs.value = cellOutputState.data
    } else if (
      cellOutputState.status === 'error'
      && cellOutputState.code !== 'aborted'
      && kind === 'automatic'
    ) {
      manualReloadAvailable.value = true
    }
  }

  function start() {
    return runLoad('automatic')
  }

  function reloadRuntimeResults() {
    return runLoad('manual')
  }

  function stateFor(outputId: PythonDataToolsOutputId): OutputState {
    return outputStates.value[outputId] ?? { status: 'idle' }
  }

  function cellOutputFor(sourceCellId: string) {
    return cellOutputs.value.find((preview) => preview.sourceCellId === sourceCellId)
  }

  function dispose() {
    if (disposed) return
    disposed = true
    requestToken += 1
    manualReloadAvailable.value = false
    activeController?.abort()
    activeController = undefined
  }

  return {
    manifest: readonly(manifest),
    cellOutputs: readonly(cellOutputs),
    outputStates: readonly(outputStates),
    manualReloadAvailable: readonly(manualReloadAvailable),
    start,
    reloadRuntimeResults,
    loadOutputs,
    stateFor,
    cellOutputFor,
    dispose,
  }
}

export function usePythonDataToolsOutputSession(
  options: PythonDataToolsOutputSessionOptions = {},
) {
  const session = createPythonDataToolsOutputSession(options)

  onMounted(() => {
    void session.start()
  })
  onBeforeUnmount(() => {
    session.dispose()
  })

  return session
}
