// The controller's OBS runtime.
//
// Owns the single OBS connection, mirrors shared presentation state onto OBS
// scene items, and exposes the scene/source lists the settings UI needs. OBS
// being unavailable is a normal condition here: every method reports failure
// through status instead of throwing into the control room render loop.

import { createObsClient } from './obsWebSocketClient.js'
import { applyPresenterState, fetchSceneSources, fetchScenes } from './obsPresenterDirector.js'

export function createObsController({ onChange = () => {} } = {}) {
  let connectionStatus = 'disconnected'
  let connectionError = ''
  let availableScenes = []
  let availableSources = []
  let lastAppliedSignature = ''
  let discovering = false

  const client = createObsClient({
    onStatus: ({ status, error }) => {
      connectionStatus = status
      connectionError = error || ''
      // A dropped connection invalidates the discovered lists but must never
      // disturb the presentation controls.
      if (status !== 'connected') {
        availableSources = []
        lastAppliedSignature = ''
      }
      onChange()
    },
  })

  function getState() {
    return {
      status: connectionStatus,
      error: connectionError,
      scenes: availableScenes,
      sources: availableSources,
      discovering,
      connected: connectionStatus === 'connected',
    }
  }

  async function connect(obsConfig) {
    try {
      await client.connect(obsConfig)
      await discover(obsConfig.sceneName)
      return true
    } catch (error) {
      connectionError = error.message
      onChange()
      return false
    }
  }

  function disconnect() {
    client.disconnect()
    availableScenes = []
    availableSources = []
    onChange()
  }

  /** Queries OBS for its scenes, and the sources inside the selected scene. */
  async function discover(sceneName) {
    if (!client.isConnected()) return
    discovering = true
    onChange()
    try {
      availableScenes = await fetchScenes(client)
      availableSources = sceneName && availableScenes.includes(sceneName)
        ? await fetchSceneSources(client, sceneName)
        : []
      connectionError = ''
    } catch (error) {
      connectionError = error.message
    } finally {
      discovering = false
      onChange()
    }
  }

  /**
   * Pushes the desired state of every configured source to OBS.
   *
   * Called on each shared-state revision, so it is a no-op unless something
   * that OBS cares about actually changed.
   */
  async function applyPresenter(target, { force = false } = {}) {
    if (!client.isConnected() || !target?.sceneName || !target?.sourceName) return
    const signature = JSON.stringify(target)
    if (!force && signature === lastAppliedSignature) return
    lastAppliedSignature = signature

    try {
      await applyPresenterState(client, target)
      connectionError = ''
    } catch (error) {
      connectionError = error.message
      // A failed apply should be retried on the next revision.
      lastAppliedSignature = ''
    }
    onChange()
  }

  return { getState, connect, disconnect, discover, applyPresenter, isConnected: () => client.isConnected() }
}
