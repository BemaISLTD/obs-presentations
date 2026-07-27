const DEFAULT_API_BASE = 'https://wp.bemahub.com/wp-json/bmh/v1/obs'

export const LIVE_SCENE_IDS = Object.freeze(['01', '08', '37'])

export const MOCK_LIVE_DATA = Object.freeze({
  totals: Object.freeze({
    active_participants: 128,
    total_joined: 12450,
    joined_today: 76,
    joined_this_session: 76,
    referral_links_created: 119,
    referral_conversions: 3420,
    qr_scans: 248,
    actions_this_session: 32,
    questions_answered: 32,
    activity_per_minute: 3.4,
  }),
  goal: Object.freeze({ current_value: 340, goal_target: 500, progress_percent: 68 }),
  activity: Object.freeze([
    Object.freeze({ id: 'mock-1', message: 'A new Builder joined through LoopCode', event_type: 'signup_completed', priority: 'high', safe_for_public_display: true, timestamp: '2026-07-22T08:00:00Z' }),
    Object.freeze({ id: 'mock-2', message: 'A LoopLink was activated', event_type: 'referral_link_created', priority: 'medium', safe_for_public_display: true, timestamp: '2026-07-22T08:00:01Z' }),
    Object.freeze({ id: 'mock-3', message: 'A viewer selected VIP Access', event_type: 'access_selected', priority: 'medium', safe_for_public_display: true, timestamp: '2026-07-22T08:00:02Z' }),
  ]),
})

function numberOr(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

export function formatLiveNumber(value) {
  return new Intl.NumberFormat('en-US').format(numberOr(value))
}

function normalizeBase(value) {
  return String(value || DEFAULT_API_BASE).replace(/\/$/, '')
}

function publicActivity(items) {
  return (Array.isArray(items) ? items : [])
    .filter((item) => item?.safe_for_public_display === true && typeof item.message === 'string' && item.message.trim())
    .map((item) => ({
      id: String(item.id || `${item.event_type || 'activity'}-${item.timestamp || item.message}`),
      message: item.message.trim(),
      event_type: String(item.event_type || 'activity'),
      priority: String(item.priority || 'medium'),
      safe_for_public_display: true,
      timestamp: String(item.timestamp || new Date().toISOString()),
    }))
}

function normalizePayload(stats, goal, activity, session) {
  const totals = { ...MOCK_LIVE_DATA.totals, ...(stats?.totals || {}) }
  const sessionData = session || {}
  totals.joined_this_session = numberOr(sessionData.joined_this_session, totals.joined_this_session)
  totals.qr_scans = numberOr(sessionData.qr_scans_this_session, totals.qr_scans)
  totals.actions_this_session = numberOr(sessionData.actions_this_session, totals.actions_this_session)
  totals.questions_answered = numberOr(
    stats?.totals?.questions_answered ?? sessionData.questions_answered ?? sessionData.actions_this_session,
    totals.questions_answered,
  )

  return {
    totals,
    goal: { ...MOCK_LIVE_DATA.goal, ...(goal || {}) },
    activity: publicActivity(activity?.items).slice(0, 25),
    updatedAt: stats?.updated_at || activity?.updated_at || new Date().toISOString(),
    source: 'api',
  }
}

export function getInitialLiveData() {
  return {
    totals: { ...MOCK_LIVE_DATA.totals },
    goal: { ...MOCK_LIVE_DATA.goal },
    activity: MOCK_LIVE_DATA.activity.map((item) => ({ ...item })),
    source: 'mock',
  }
}

function normalizeDateParam(value) {
  if (!value) return ''
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString()
}

export function createObsLiveClient(params = new URLSearchParams()) {
  const dataMode = ['live', 'hybrid', 'simulated'].includes(params.get('dataMode')) ? params.get('dataMode') : 'simulated'
  const apiBase = normalizeBase(params.get('apiBase'))
  const sessionId = params.get('sessionId') || 'open_enrollment_2026'
  const useApi = params.get('dataSource') === 'api' || dataMode === 'live' || dataMode === 'hybrid'
  const rangeSince = normalizeDateParam(params.get('dataSince'))
  const rangeUntil = normalizeDateParam(params.get('dataUntil'))
  let controller = null

  async function request(path, query = {}) {
    const url = new URL(`${apiBase}/${path}`)
    Object.entries({ scope: 'system', data_mode: dataMode, ...query }).forEach(([key, value]) => {
      if (value != null && value !== '') url.searchParams.set(key, String(value))
    })
    const response = await fetch(url, { signal: controller?.signal, cache: 'no-store' })
    if (!response.ok) throw new Error(`OBS ${path} failed: ${response.status}`)
    return response.json()
  }

  async function poll() {
    if (!useApi) return { ...getInitialLiveData(), source: 'mock' }
    controller?.abort()
    controller = new AbortController()
    try {
      const [stats, goal, activity, session] = await Promise.all([
        request('live-stats'),
        request('goal-progress'),
        request('live-activity', { limit: 25, since: rangeSince }),
        request('session-stats', {
          scope: 'session',
          session_id: sessionId,
          started_at: rangeSince || undefined,
        }),
      ])
      return normalizePayload(stats, goal, activity, session)
    } catch (error) {
      if (error.name === 'AbortError') throw error
      return { ...getInitialLiveData(), source: 'mock-fallback', error: error.message }
    }
  }

  async function pollActivity() {
    if (!useApi) return []
    controller?.abort()
    controller = new AbortController()
    try {
      const activity = await request('live-activity', { limit: 25, since: rangeSince })
      return publicActivity(activity?.items)
    } catch (error) {
      if (error.name === 'AbortError') throw error
      return []
    }
  }

  return { poll, pollActivity, abort: () => controller?.abort(), dataMode, apiBase, useApi, rangeSince, rangeUntil }
}

function setText(root, selector, value) {
  root.querySelectorAll(selector).forEach((element) => { element.textContent = String(value) })
}

function updateScene01(root, data) {
  const builderMetric = root.querySelectorAll('.scene01-stat-card .scene01-stat-copy > strong')[1]
  if (builderMetric) builderMetric.textContent = formatLiveNumber(data.totals.active_participants)
  setText(root, '[data-live-builders-count]', `${formatLiveNumber(data.totals.active_participants)} Builders Live`)
}

function updateScene08(root, data) {
  setText(root, '[data-live-stat="builders"]', formatLiveNumber(data.totals.active_participants))
  setText(root, '[data-live-stat="looplocks"]', formatLiveNumber(data.totals.referral_conversions))
  setText(root, '[data-live-footer-stat="builders"]', formatLiveNumber(data.totals.active_participants))
  setText(root, '[data-live-footer-stat="looplocks"]', formatLiveNumber(data.totals.referral_conversions))
}

function updateScene37(root, data) {
  const values = {
    scans: data.totals.qr_scans,
    builders: data.totals.joined_this_session,
    looplinks: data.totals.referral_links_created,
    questions: data.totals.questions_answered,
  }
  Object.entries(values).forEach(([key, value]) => setText(root, `[data-live-metric="${key}"]`, formatLiveNumber(value)))
  const progress = Math.max(0, Math.min(100, numberOr(data.goal.progress_percent)))
  setText(root, '[data-live-progress-value]', `${Math.round(progress)}%`)
  root.querySelectorAll('[data-live-progress-bar]').forEach((element) => { element.style.width = `${progress}%` })
  const feed = root.querySelector('[data-live-activity-feed]')
  if (feed) {
    const items = data.activity.slice(0, 3)
    feed.innerHTML = items.map((item) => `<article class="grid grid-cols-[46px_1fr_auto] items-center gap-3 rounded-xl border border-sky-200 bg-white p-3 shadow-sm"><span class="grid size-11 place-items-center rounded-full bg-blue-500 text-xl font-black text-white">♙</span><p class="text-[14px] font-bold leading-tight">${escapeHtml(item.message)}</p><small class="font-bold text-slate-500">Now</small></article>`).join('')
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character])
}

export function startSceneLiveData(root, context, onActivity = () => {}) {
  if (!LIVE_SCENE_IDS.includes(context.slide.id)) return () => {}
  const client = createObsLiveClient(context.url)
  const update = async () => {
    try {
      const data = await client.poll()
      root.querySelector('.visual-stage')?.setAttribute('data-live-data-source', data.source)
      if (context.slide.id === '01') updateScene01(root, data)
      if (context.slide.id === '08') updateScene08(root, data)
      if (context.slide.id === '37') updateScene37(root, data)
      onActivity(data.source === 'api' ? data.activity : [])
    } catch (error) {
      if (error.name !== 'AbortError') console.warn(error)
    }
  }
  update()
  const interval = window.setInterval(update, context.slide.id === '37' ? 5000 : 8000)
  return () => { window.clearInterval(interval); client.abort() }
}
