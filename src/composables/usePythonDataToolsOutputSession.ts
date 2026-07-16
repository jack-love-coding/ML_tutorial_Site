import { onBeforeUnmount, onMounted, readonly, ref, shallowRef } from 'vue'
import {
  pythonDataToolsOutputIds,
  type PythonDataToolsOutputId,
} from '../data/pythonNotebookContract.ts'
import {
  loadPythonDataToolsManifest,
  loadPythonDataToolsOutput,
  type PythonDataToolsLoadState,
  type PythonDataToolsManifest,
  type PythonDataToolsOutputViewModel,
} from '../utils/pythonDataToolsOutputs.ts'

type OutputState = PythonDataToolsLoadState<PythonDataToolsOutputViewModel>
type OutputStateMap = Record<PythonDataToolsOutputId, OutputState>

interface PythonDataToolsOutputSessionOptions {
  fetch?: typeof fetch
  baseUrl?: string
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
  const outputStates = ref<OutputStateMap>(outputStateMap({ status: 'idle' }))
  const manualReloadAvailable = ref(false)

  let automaticLoadStarted = false
  let manualReloadConsumed = false
  let disposed = false
  let requestToken = 0
  let activeController: AbortController | undefined

  function isCurrentRequest(token: number, controller: AbortController) {
    return !disposed && token === requestToken && !controller.signal.aborted
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
    outputStates.value = outputStateMap({ status: 'loading' })

    const manifestState = await loadPythonDataToolsManifest({
      fetch: options.fetch,
      baseUrl: options.baseUrl,
      signal: controller.signal,
    })
    if (!isCurrentRequest(token, controller)) return

    if (manifestState.status !== 'ready') {
      outputStates.value = outputStateMap(manifestState)
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
    const entries = await Promise.all(pythonDataToolsOutputIds.map(async (outputId) => [
      outputId,
      await loadPythonDataToolsOutput(manifestState.data, outputId, {
        fetch: options.fetch,
        baseUrl: options.baseUrl,
        signal: controller.signal,
      }),
    ] as const))
    if (!isCurrentRequest(token, controller)) return

    outputStates.value = Object.fromEntries(entries) as OutputStateMap
    activeController = undefined
  }

  function start() {
    return runLoad('automatic')
  }

  function reloadRuntimeResults() {
    return runLoad('manual')
  }

  function stateFor(outputId: PythonDataToolsOutputId): OutputState {
    return outputStates.value[outputId]
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
    outputStates: readonly(outputStates),
    manualReloadAvailable: readonly(manualReloadAvailable),
    start,
    reloadRuntimeResults,
    stateFor,
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
