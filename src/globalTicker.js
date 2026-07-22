import { createObsLiveClient, MOCK_LIVE_DATA } from './obsLiveData.js'

const STORAGE_KEY = 'bemahub.obs.globalTicker.v1'
const CHANNEL_NAME = 'bemahub-obs-global-ticker'
const MAX_ITEMS = 40

const DEFAULT_STATE = Object.freeze({
  visible: true,
  paused: false,
  connected: true,
  sequence: 0,
  items: MOCK_LIVE_DATA.activity,
  priority: null,
})

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character])
}

function readState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (!saved || !Array.isArray(saved.items)) return { ...DEFAULT_STATE, items: [...DEFAULT_STATE.items] }
    return { ...DEFAULT_STATE, ...saved, items: saved.items.slice(0, MAX_ITEMS) }
  } catch {
    return { ...DEFAULT_STATE, items: [...DEFAULT_STATE.items] }
  }
}

function writeState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* OBS storage may be disabled. */ }
}

function normalizeItems(items) {
  return (Array.isArray(items) ? items : []).filter((item) => item?.safe_for_public_display === true && item.message)
}

function mergeItems(current, incoming) {
  const seen = new Set()
  return [...normalizeItems(incoming), ...normalizeItems(current)].filter((item) => {
    const id = String(item.id || `${item.event_type || 'activity'}-${item.timestamp || item.message}`)
    if (seen.has(id)) return false
    seen.add(id)
    return true
  }).slice(0, MAX_ITEMS)
}

class GlobalTickerCoordinator {
  constructor(params) {
    this.params = params
    this.state = readState()
    this.listeners = new Set()
    this.client = createObsLiveClient(params)
    this.interval = null
    this.channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel(CHANNEL_NAME) : null
    if (this.channel) {
      this.channel.addEventListener('message', (event) => {
        if (event.data?.type === 'state') this.replaceState(event.data.state, false)
        if (event.data?.type === 'command') this.command(event.data.command, event.data.payload, false)
      })
    }
  }

  subscribe(listener) {
    this.listeners.add(listener)
    listener(this.state)
    return () => this.listeners.delete(listener)
  }

  notify(broadcast = true) {
    writeState(this.state)
    this.listeners.forEach((listener) => listener(this.state))
    if (broadcast) this.channel?.postMessage({ type: 'state', state: this.state })
  }

  replaceState(state, broadcast = true) {
    if (!state || !Array.isArray(state.items)) return
    this.state = { ...DEFAULT_STATE, ...state, items: state.items.slice(0, MAX_ITEMS) }
    this.notify(broadcast)
  }

  applySharedSettings(settings, revision) {
    if (!settings) return
    this.state.visible = settings.visible !== false
    this.state.paused = Boolean(settings.paused)
    const priorityId = Math.max(0, Number(settings.priorityId) || 0)
    const message = String(settings.priorityMessage || '').trim().slice(0, 180)
    this.state.items = this.state.items.filter((item) => !String(item.id || '').startsWith('shared-priority-'))
    if (message) {
      const item = { id: `shared-priority-${priorityId}`, message, event_type: 'operator_announcement', priority: 'critical', safe_for_public_display: true, timestamp: new Date().toISOString() }
      this.state.priority = item
      this.state.items = mergeItems(this.state.items, [item])
    } else {
      this.state.priority = null
    }
    this.state.sequence = Math.max(this.state.sequence + 1, Number(revision) || 0)
    this.notify(false)
  }

  command(command, payload, broadcast = true) {
    if (command === 'toggle-visible') this.state.visible = !this.state.visible
    if (command === 'toggle-paused') this.state.paused = !this.state.paused
    if (command === 'clear') {
      this.state.items = []
      this.state.priority = null
    }
    if (command === 'priority' && String(payload || '').trim()) {
      const message = String(payload).trim().slice(0, 180)
      const item = { id: `priority-${Date.now()}`, message, event_type: 'operator_announcement', priority: 'critical', safe_for_public_display: true, timestamp: new Date().toISOString() }
      this.state.priority = item
      this.state.items = mergeItems(this.state.items, [item])
      this.state.visible = true
    }
    if (command === 'reconnect') {
      this.state.connected = true
      this.poll()
    }
    this.state.sequence += 1
    this.notify(broadcast)
  }

  pushActivity(items) {
    const merged = mergeItems(this.state.items, items)
    if (JSON.stringify(merged) === JSON.stringify(this.state.items)) return
    this.state.items = merged
    this.state.sequence += 1
    this.notify()
  }

  async poll() {
    if (!this.state.connected) return
    try {
      this.pushActivity(await this.client.pollActivity())
      if (!this.state.connected) {
        this.state.connected = true
        this.notify()
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        this.state.connected = false
        this.notify()
      }
    }
  }

  connect({ paused = false } = {}) {
    if (paused || this.interval) return
    this.poll()
    this.interval = window.setInterval(() => this.poll(), 3000)
  }

  destroy() {
    if (this.interval) window.clearInterval(this.interval)
    this.client.abort()
    this.channel?.close()
  }
}

let coordinator

export function getGlobalTicker(params = new URLSearchParams()) {
  if (!coordinator) coordinator = new GlobalTickerCoordinator(params)
  return coordinator
}

export function applySharedTickerSettings(settings, revision) {
  getGlobalTicker().applySharedSettings(settings, revision)
}

export function renderGlobalTicker({ slide, url }) {
  const muted = url.get('ticker') === 'hide' || (['38', '39'].includes(slide.id) && url.get('ticker') !== 'show')
  return `<section class="global-live-ticker${muted ? ' is-scene-muted' : ''}" data-global-live-ticker data-scene-muted="${muted}" aria-label="Global live activity ticker">
    <span class="global-live-ticker-label"><i></i>LIVE ACTIVITY</span>
    <div class="global-live-ticker-window"><div class="global-live-ticker-track" data-global-ticker-track></div></div>
    <span class="global-live-ticker-status" data-global-ticker-status>SIM</span>
  </section>`
}

function renderTrack(state) {
  const items = state.items.length ? state.items : [{ id: 'empty', message: 'Waiting for live activity…', priority: 'low' }]
  const markup = items.map((item) => `<span class="global-live-ticker-item priority-${escapeHtml(item.priority || 'medium')}" data-ticker-item-id="${escapeHtml(item.id || '')}"><i>•</i>${escapeHtml(item.message)}</span>`).join('')
  return `${markup}${markup}`
}

export function initGlobalTicker(root, context) {
  const element = root.querySelector('[data-global-live-ticker]')
  const ticker = getGlobalTicker(context.url)
  if (!element) return () => {}
  const sync = (state) => {
    element.classList.toggle('is-hidden', !state.visible)
    element.classList.toggle('is-paused', state.paused || context.paused)
    element.classList.toggle('is-disconnected', !state.connected)
    element.dataset.tickerSequence = String(state.sequence)
    element.querySelector('[data-global-ticker-track]').innerHTML = renderTrack(state)
    element.querySelector('[data-global-ticker-status]').textContent = state.connected ? (ticker.client.useApi ? 'LIVE' : 'SIM') : 'OFFLINE'
  }
  const unsubscribe = ticker.subscribe(sync)
  ticker.connect({ paused: context.paused })
  return unsubscribe
}

export function renderTickerControls() {
  return `<div class="global-ticker-controls pointer-events-auto mb-2 ml-auto flex w-fit max-w-full items-center gap-2 overflow-x-auto rounded-[13px] border border-cyan-300/30 bg-slate-950/95 p-2 shadow-2xl backdrop-blur-xl" data-global-ticker-controls>
    <span class="shrink-0 px-2 text-[10px] font-black uppercase tracking-[.15em] text-cyan-300">Global ticker</span>
    <button type="button" data-ticker-command="toggle-visible">Show / Hide</button>
    <button type="button" data-ticker-command="toggle-paused">Pause / Resume</button>
    <button type="button" data-ticker-command="clear">Clear</button>
    <button type="button" data-ticker-command="reconnect">Reconnect</button>
    <input type="text" maxlength="180" data-ticker-priority-input placeholder="Priority announcement" aria-label="Priority announcement" />
    <button type="button" data-ticker-command="priority" class="is-priority">Announce</button>
  </div>`
}

export function bindTickerControls(root, params) {
  const ticker = getGlobalTicker(params)
  root.querySelectorAll('[data-ticker-command]').forEach((button) => {
    button.addEventListener('click', () => {
      const command = button.dataset.tickerCommand
      const input = root.querySelector('[data-ticker-priority-input]')
      ticker.command(command, command === 'priority' ? input?.value : undefined)
      if (command === 'priority' && input) input.value = ''
    })
  })
}
