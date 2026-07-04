const DATA_ENDPOINTS = {
  slides: '/data/slides.json',
  metricsMock: '/data/metrics.mock.json',
  ticker: '/data/ticker.json',
  countdownPromptsCsv: '/data/bemahub_countdown_questions_external_source.csv',
}

const DEPRECATED_TERMS = [
  'supporter',
  'supporters',
  'donor',
  'donation',
  'charity',
  'fundraising',
  'contributor',
  'commission',
  'referral reward',
  'referral revenue',
  'passive income',
  'guaranteed reward',
  'mlm',
  'downline',
]

export async function loadPresentationData() {
  const [slides, metrics, ticker, promptSourceText] = await Promise.all([
    fetchJson(DATA_ENDPOINTS.slides),
    loadMetrics(),
    fetchJson(DATA_ENDPOINTS.ticker),
    fetchText(DATA_ENDPOINTS.countdownPromptsCsv),
  ])

  return {
    slides,
    metrics,
    ticker,
    promptSource: parseExternalPromptSource(promptSourceText),
  }
}

export async function loadMetrics() {
  // Keep mock metrics as the source now; this function is the API swap point later.
  return fetchJson(DATA_ENDPOINTS.metricsMock)
}

async function fetchJson(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to load ${url}.`)
  }

  return response.json()
}

async function fetchText(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to load ${url}.`)
  }

  return response.text()
}

function parseExternalPromptSource(csvText) {
  const rows = parseCsvRows(csvText)
  const deprecatedWarnings = []
  const warningKeys = new Set()

  for (const row of rows) {
    const searchable = Object.values(row).join(' ').toLowerCase()

    for (const term of DEPRECATED_TERMS) {
      if (searchable.includes(term)) {
        const rowId = row.id || 'unknown'
        const key = `${rowId}:${term}`

        if (!warningKeys.has(key)) {
          warningKeys.add(key)
          deprecatedWarnings.push({ id: rowId, term })
        }
      }
    }
  }

  const enabledPrompts = rows
    .filter((row) => String(row.enabled).toLowerCase() === 'true')
    .map((row) => ({
      ...row,
      start_sec: Number(row.start_sec || 0),
      duration_sec: Number(row.duration_sec || 0),
      animation_in_duration_ms: Number(row.animation_in_duration_ms || 500),
      animation_out_duration_ms: Number(row.animation_out_duration_ms || 400),
    }))
    .sort((a, b) => a.start_sec - b.start_sec)

  return {
    enabledPrompts,
    deprecatedWarnings,
  }
}

function parseCsvRows(csvText) {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length)

  if (!lines.length) {
    return []
  }

  const headers = parseCsvLine(lines[0]).map((header, index) => {
    if (index === 0) {
      return header.replace(/^\uFEFF/, '')
    }

    return header
  })

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    return headers.reduce((acc, header, index) => {
      acc[header] = values[index] ?? ''
      return acc
    }, {})
  })
}

function parseCsvLine(line) {
  const values = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    const next = line[index + 1]

    if (char === '"' && inQuotes && next === '"') {
      current += '"'
      index += 1
      continue
    }

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
      continue
    }

    current += char
  }

  values.push(current)
  return values
}
