import { expect, test } from '@playwright/test'
import { LAYER_CUES } from '../src/sceneCueEngine.js'
import { sceneControlById, sceneControls } from '../src/sceneControls.js'

const layerCueIds = Object.values(LAYER_CUES)

const sceneIds = Array.from({ length: 39 }, (_, index) => String(index + 1).padStart(2, '0'))
const outputs = [
  ['storyboard', 'composite'],
  ['obs', 'underlay'],
  ['obs', 'foreground'],
  ['obs', 'composite'],
]

test('every scene declares a positive controller duration', () => {
  expect(sceneControls).toHaveLength(39)
  sceneControls.forEach((scene) => {
    expect(scene.durationSeconds).toBeGreaterThan(0)
  })
})

function collectRuntimeErrors(page) {
  const errors = []
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })
  return errors
}

for (const sceneId of sceneIds) {
  test(`scene ${sceneId} renders its four core outputs`, async ({ page }) => {
    const errors = collectRuntimeErrors(page)
    for (const [output, render] of outputs) {
      await page.goto(`/?scene=${sceneId}&mode=live&output=${output}&render=${render}&clean=true&paused=true&bgVideo=false`)
      const canvas = page.getByTestId('storyboard-canvas')
      const stage = page.getByTestId('visual-stage')
      await expect(canvas).toBeVisible()
      await expect(stage).toBeVisible()
      await expect(canvas).toHaveJSProperty('offsetWidth', 1920)
      await expect(stage).toHaveJSProperty('offsetWidth', 1920)
      await expect(stage).toHaveJSProperty('offsetHeight', 1080)
      if (render === 'underlay') await expect(page.locator('[data-live-layer="underlay"]')).toHaveCount(1)
      if (render === 'foreground') {
        await expect(page.locator('[data-live-layer="foreground"]')).toHaveCount(1)
        await expect(stage).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      }
      if (render === 'composite') {
        await expect(page.locator('[data-live-layer="underlay"]')).toHaveCount(1)
        await expect(page.locator('[data-live-layer="foreground"]')).toHaveCount(1)
      }
    }
    expect(errors).toEqual([])
  })
}

test('legacy presentation controls, debug state, navigation, and cue lifecycle remain interactive', async ({ page }) => {
  await page.goto('/?scene=08&mode=live&output=storyboard&render=composite&paused=true&bgVideo=false&legacyControls=true')
  const controls = page.locator('.presentation-controls')
  await expect(controls).toBeVisible()
  await page.locator('[data-toggle-presentation-controls]').click()
  await expect(controls).toHaveClass(/is-hidden/)
  await page.locator('[data-toggle-presentation-controls]').click()
  await expect(controls).not.toHaveClass(/is-hidden/)

  await page.keyboard.press('g')
  await expect(page.locator('.debug-guides')).toHaveClass(/show-grid/)
  await page.evaluate(() => document.activeElement?.blur())
  await page.keyboard.press('ArrowRight')
  await expect(page).toHaveURL(/scene=09/)

  await page.goto('/?scene=08&mode=live&output=storyboard&render=composite&paused=true&bgVideo=false&legacyControls=true')
  await expect(page.locator('[data-presentation-scene]')).toHaveCount(39)
  await expect(page.locator('[data-scene-cue-panel]')).toHaveAttribute('data-scene', '08')
  await expect(page.locator('[data-trigger-cue]')).toHaveCount(sceneControlById['08'].duringCues.length + layerCueIds.length + 2)

  await page.locator('[data-reset-scene]').click()
  await expect(page.getByTestId('visual-stage')).toHaveAttribute('data-active-cue', 'reset')
  await page.locator('[data-trigger-cue="entry"]').click()
  await expect(page.getByTestId('visual-stage')).toHaveAttribute('data-active-cue', 'entry')
  await expect(page.getByTestId('visual-stage')).toHaveClass(/is-layer-background-visible/)
  await expect(page.getByTestId('visual-stage')).not.toHaveClass(/is-layer-foreground-visible/)
  await expect(page.getByTestId('visual-stage')).not.toHaveClass(/is-layer-footer-visible/)
  await page.locator(`[data-trigger-cue="${LAYER_CUES.foreground}"]`).click()
  await expect(page.getByTestId('visual-stage')).toHaveClass(/is-layer-foreground-visible/)
  await page.locator(`[data-trigger-cue="${LAYER_CUES.footer}"]`).click()
  await expect(page.getByTestId('visual-stage')).toHaveClass(/is-layer-footer-visible/)
  await page.locator(`[data-trigger-cue="${LAYER_CUES.full}"]`).click()
  await expect(page.getByTestId('visual-stage')).toHaveClass(/cue-layer-full/)
  await expect(page.getByTestId('visual-stage')).toHaveClass(/is-layer-background-visible/)
  await expect(page.getByTestId('visual-stage')).toHaveClass(/is-layer-foreground-visible/)
  await expect(page.getByTestId('visual-stage')).toHaveClass(/is-layer-footer-visible/)
  await page.locator('[data-trigger-cue="entry"]').click()
  await expect(page.getByTestId('visual-stage')).toHaveAttribute('data-active-cue', 'entry')
  const duringCue = sceneControlById['08'].duringCues[0].id
  await page.locator(`[data-trigger-cue="${duringCue}"]`).click()
  await expect(page.getByTestId('visual-stage')).toHaveAttribute('data-active-cue', duringCue)
  await expect(page.locator(`[data-control-cue="${duringCue}"]`).first()).toHaveAttribute('data-cue-active', 'true')
  await page.locator('[data-trigger-cue="exit"]').click()
  await expect(page.getByTestId('visual-stage')).toHaveAttribute('data-active-cue', 'exit')

  await page.locator('[data-next-scene]').click()
  await expect(page).toHaveURL(/scene=09/)
  await expect(page.locator('[data-scene-cue-panel]')).toHaveAttribute('data-scene', '09')
  await page.locator('[data-previous-scene]').click()
  await expect(page).toHaveURL(/scene=08/)
})

test('Scene 04 reveal controls advance the three statements independently', async ({ page }) => {
  await page.goto('/?scene=04&mode=live&output=storyboard&render=composite&paused=true&bgVideo=false&legacyControls=true')
  const reveals = page.locator('.scene04-statement-reveal')

  await page.locator('[data-reset-scene]').click()
  await page.locator('[data-trigger-cue="statement-1"]').click()
  await expect(reveals.nth(0)).toHaveClass(/is-cue-complete/)
  await expect(reveals.nth(1)).not.toHaveClass(/is-cue-complete/)
  await expect(reveals.nth(2)).not.toHaveClass(/is-cue-complete/)

  await page.locator('[data-trigger-cue="statement-2"]').click()
  await expect(reveals.nth(0)).toHaveClass(/is-cue-complete/)
  await expect(reveals.nth(1)).toHaveClass(/is-cue-complete/)
  await expect(reveals.nth(2)).not.toHaveClass(/is-cue-complete/)

  await page.locator('[data-trigger-cue="statement-3"]').click()
  await expect(reveals.nth(0)).toHaveClass(/is-cue-complete/)
  await expect(reveals.nth(1)).toHaveClass(/is-cue-complete/)
  await expect(reveals.nth(2)).toHaveClass(/is-cue-complete/)
})

test('Scene 05 agenda matches the approved reference order', async ({ page }) => {
  await page.goto('/?scene=05&mode=live&output=storyboard&render=composite&paused=true&bgVideo=false')
  await expect(page.locator('.scene05-agenda-title')).toHaveText([
    'Welcome',
    'What is Bema Hub',
    'What is Bema CORE',
    'Impact Statistics',
    'Programs Overview',
    'Participation Journey',
    'EchoLoop',
    'Access Levels',
    'Community Builder Tiers',
    'Live Enrollment',
  ])
})

for (const scene of ['06', '07', '09', '10', '11', '12', '13', '15', '16', '17', '19', '20', '22', '25']) {
  test(`Scene ${scene} brand lockup remains fully transparent`, async ({ page }) => {
    await page.goto(`/?scene=${scene}&mode=live&output=storyboard&render=composite&paused=true&bgVideo=false`)
    await expect(page.locator(`.reference-scene-${scene} > .broadcast-brand`)).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(page.locator(`.reference-scene-${scene} > .broadcast-brand .brand-wordmark`)).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
    await expect(page.locator(`.reference-scene-${scene} > .broadcast-brand .broadcast-wordmark`)).toHaveCSS('width', '320px')
    await expect(page.locator(`.reference-scene-${scene} > .broadcast-brand .broadcast-wordmark`)).toHaveCSS('height', '92px')
    expect(await page.locator(`.reference-scene-${scene}`).evaluate((element) => getComputedStyle(element, '::before').display)).toBe('none')
  })
}

test('global ticker controls persist across scene changes without resetting the queue', async ({ page }) => {
  await page.goto('/?scene=07&mode=live&output=storyboard&render=composite&paused=true&bgVideo=false&legacyControls=true')
  const ticker = page.locator('[data-global-live-ticker]')
  const stage = page.getByTestId('visual-stage')
  const footer = page.locator('.foreground-bar')
  await expect(ticker).toBeVisible()
  await expect(ticker).toHaveCSS('height', '86px')
  await expect(stage).toHaveClass(/is-global-ticker-active/)
  await expect(footer).toHaveCSS('visibility', 'hidden')

  await page.locator('[data-ticker-command="clear"]').click()
  await expect(ticker.locator('[data-ticker-item-id="empty"]').first()).toContainText('Waiting for live activity')
  await page.locator('[data-ticker-priority-input]').fill('Enrollment closes in fifteen minutes')
  await page.locator('[data-ticker-command="priority"]').click()
  await expect(ticker).toContainText('Enrollment closes in fifteen minutes')

  await page.locator('[data-ticker-command="toggle-paused"]').click()
  await expect(ticker).toHaveClass(/is-paused/)
  const sequence = await ticker.getAttribute('data-ticker-sequence')
  await page.locator('[data-next-scene]').click()
  await expect(page).toHaveURL(/scene=08/)
  await expect(page.locator('[data-global-live-ticker]')).toContainText('Enrollment closes in fifteen minutes')
  await expect(page.locator('[data-global-live-ticker]')).toHaveClass(/is-paused/)
  expect(Number(await page.locator('[data-global-live-ticker]').getAttribute('data-ticker-sequence'))).toBeGreaterThanOrEqual(Number(sequence))

  await page.locator('[data-ticker-command="toggle-visible"]').click()
  await expect(page.locator('[data-global-live-ticker]')).toHaveClass(/is-hidden/)
  await expect(stage).not.toHaveClass(/is-global-ticker-active/)
  await expect(footer).toHaveCSS('visibility', 'visible')
  await page.locator('[data-ticker-command="toggle-visible"]').click()
  await expect(page.locator('[data-global-live-ticker]')).not.toHaveClass(/is-hidden/)
  await expect(stage).toHaveClass(/is-global-ticker-active/)
  await expect(footer).toHaveCSS('visibility', 'hidden')
  await page.locator('[data-ticker-command="reconnect"]').click()
  await expect(page.locator('[data-global-ticker-status]')).toHaveText(/SIM|LIVE/)
})

test('shared control room synchronizes scenes, cues, animation state, and ticker across displays', async ({ browser, request }) => {
  await request.patch('/api/control/state', {
    data: {
      sceneId: '01',
      mode: 'live',
      animationsPaused: false,
      backgroundVideo: false,
      ticker: { visible: true, paused: false, priorityMessage: '', priorityId: 100 },
    },
  })
  await request.post('/api/control/command', { data: { type: 'reset', cue: 'reset', sceneId: '01' } })

  const control = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const firstDisplay = await browser.newPage()
  const secondDisplay = await browser.newPage()
  let announcementPayload
  control.on('request', (outgoing) => {
    if (outgoing.method() === 'PATCH' && outgoing.url().endsWith('/api/control/state') && outgoing.postData()?.includes('priorityMessage')) {
      announcementPayload = outgoing.postDataJSON()
    }
  })
  try {
    await firstDisplay.goto('/?sync=true&output=obs&render=composite&clean=true&bgVideo=false')
    await control.goto('/control')
    await expect(control.getByRole('heading', { name: 'OBS Control Room' })).toBeVisible()
    await expect(control.locator('[data-scene-countdown]')).toHaveText(/^\d{2}:\d{2}$/)
    await expect(control.locator('.connection-card')).not.toContainText('Revision')

    await test.step('change the active scene', async () => {
      await control.locator('[data-action="scene"][data-value="08"]').click()
      await expect(firstDisplay.locator('html')).toHaveAttribute('data-scene', '08')
      await expect(control.locator('[data-scene-countdown]')).toHaveText(/^01:[2-3]\d$/)
      await expect(firstDisplay.getByTestId('visual-stage')).toHaveAttribute('data-active-cue', LAYER_CUES.background)
      await expect(firstDisplay.getByTestId('visual-stage')).toHaveClass(/is-layer-background-visible/)
      await expect(firstDisplay.getByTestId('visual-stage')).not.toHaveClass(/is-layer-foreground-visible/)
    })
    await test.step('play and restore scene cues', async () => {
      await control.locator('[data-action="cue"][data-value="entry"]').click()
      await expect(firstDisplay.getByTestId('visual-stage')).toHaveAttribute('data-active-cue', 'entry')
      await secondDisplay.goto('/?sync=true&output=obs&render=composite&clean=true&bgVideo=false')
      await expect(secondDisplay.getByTestId('visual-stage')).toHaveAttribute('data-active-cue', 'entry')
      await control.locator('[data-action="cue"][data-value="foreground-in"]').click()
      await expect(firstDisplay.getByTestId('visual-stage')).toHaveClass(/is-layer-foreground-visible/)
      await expect(secondDisplay.getByTestId('visual-stage')).toHaveClass(/is-layer-foreground-visible/)
    })
    await test.step('apply global animation and ticker settings', async () => {
      await control.locator('[data-action="toggle-animations"]').click()
      await expect(firstDisplay.locator('html')).toHaveClass(/shared-animations-paused/)
      await expect(secondDisplay.locator('html')).toHaveClass(/shared-animations-paused/)
      await control.locator('[data-action="toggle-ticker"]').click()
      await expect(firstDisplay.locator('[data-global-live-ticker]')).toHaveClass(/is-hidden/)
      await expect(secondDisplay.locator('[data-global-live-ticker]')).toHaveClass(/is-hidden/)
    })
    await test.step('send a shared priority announcement', async () => {
      await control.locator('#priority-message').fill('Enrollment closes in ten minutes')
      await expect(control.locator('#priority-message')).toHaveValue('Enrollment closes in ten minutes')
      await control.getByRole('button', { name: 'Send announcement' }).click()
      await expect.poll(() => announcementPayload?.ticker?.priorityMessage).toBe('Enrollment closes in ten minutes')
      await expect.poll(async () => (await (await request.get('/api/control/state')).json()).state.ticker.priorityMessage).toBe('Enrollment closes in ten minutes')
      await expect(firstDisplay.locator('[data-global-live-ticker]')).toContainText('Enrollment closes in ten minutes')
      await expect(firstDisplay.locator('[data-global-live-ticker]')).not.toHaveClass(/is-hidden/)
      await expect(secondDisplay.locator('[data-global-live-ticker]')).toContainText('Enrollment closes in ten minutes')
    })
  } finally {
    await request.patch('/api/control/state', {
      data: { sceneId: '01', mode: 'live', animationsPaused: false, backgroundVideo: true, ticker: { visible: true, paused: false, priorityMessage: '' } },
    })
    await request.post('/api/control/command', { data: { type: 'reset', cue: 'reset', sceneId: '01' } })
    await Promise.all([control.close(), firstDisplay.close(), secondDisplay.close()])
  }
})

test('control room remains scrollable and usable on tablet and mobile viewports', async ({ page }) => {
  await page.goto('/control')
  await expect(page.getByRole('heading', { name: 'OBS Control Room' })).toBeVisible()

  for (const viewport of [{ width: 768, height: 900 }, { width: 390, height: 700 }]) {
    await page.setViewportSize(viewport)
    await expect(page.locator('.ticker-panel')).toBeVisible()
    await expect(page.locator('#priority-message')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Send announcement' })).toBeVisible()
    const dimensions = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      documentHeight: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
      rootOverflowY: getComputedStyle(document.documentElement).overflowY,
      bodyOverflowY: getComputedStyle(document.body).overflowY,
    }))
    expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth)
    expect(dimensions.documentHeight).toBeGreaterThan(viewport.height)
    expect(dimensions.rootOverflowY).toBe('auto')
    expect(dimensions.bodyOverflowY).toBe('visible')
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0)
  }
})

test('Scene 36 retains the operator-selected question and supports curated URL questions', async ({ page }) => {
  await page.goto('/?scene=36&mode=live&output=storyboard&render=composite&paused=true&bgVideo=false&legacyControls=true&qa=First+curated+question&qa=Second+curated+question&qa=Third+curated+question&qa=Fourth+curated+question')
  await expect(page.locator('[data-operator-question-index="1"]')).toContainText('First curated question')
  await page.locator('[data-trigger-cue="question-3"]').click()
  await expect(page.locator('[data-operator-question-index="3"]')).toHaveAttribute('aria-current', 'true')
  await page.reload()
  await expect(page.locator('[data-operator-question-index="3"]')).toHaveAttribute('aria-current', 'true')
})

test('production OBS data updates Scenes 01, 08, and 37 while non-live scenes remain restricted to ticker activity', async ({ page }) => {
  const requestedEndpoints = []
  await page.route('**/wp-json/bmh/v1/obs/**', async (route) => {
    const endpoint = new URL(route.request().url()).pathname.split('/').pop()
    requestedEndpoints.push(endpoint)
    const bodies = {
      'live-stats': { totals: { active_participants: 444, total_joined: 15000, joined_this_session: 91, referral_links_created: 137, referral_conversions: 3600, qr_scans: 275, questions_answered: 44, activity_per_minute: 5.2 }, updated_at: '2026-07-22T09:00:00Z' },
      'goal-progress': { current_value: 410, goal_target: 500, progress_percent: 82 },
      'live-activity': { items: [{ id: 'live-proof-1', message: 'A public-safe Builder update arrived', event_type: 'signup_completed', priority: 'high', safe_for_public_display: true, timestamp: '2026-07-22T09:00:00Z' }] },
      'session-stats': { joined_this_session: 91, qr_scans_this_session: 275, actions_this_session: 44 },
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(bodies[endpoint]) })
  })

  await page.goto('/?scene=01&mode=live&output=obs&render=composite&clean=true&bgVideo=false&dataMode=live')
  await expect(page.locator('.scene01-stat-card .scene01-stat-copy > strong').nth(1)).toHaveText('444')
  await expect(page.locator('[data-live-builders-count]')).toHaveText('444 Builders Live')

  await page.goto('/?scene=08&mode=live&output=obs&render=composite&clean=true&bgVideo=false&dataMode=live')
  await expect(page.locator('[data-live-stat="builders"]')).toHaveText('444')
  await expect(page.locator('[data-live-stat="looplocks"]')).toHaveText('3,600')

  await page.goto('/?scene=37&mode=live&output=obs&render=composite&clean=true&bgVideo=false&dataMode=live')
  await expect(page.locator('[data-live-metric="scans"]')).toHaveText('275')
  await expect(page.locator('[data-live-metric="builders"]')).toHaveText('91')
  await expect(page.locator('[data-live-metric="looplinks"]')).toHaveText('137')
  await expect(page.locator('[data-live-metric="questions"]')).toHaveText('44')
  await expect(page.locator('[data-live-progress-value]')).toHaveText('82%')
  await expect(page.locator('[data-live-activity-feed]')).toContainText('A public-safe Builder update arrived')
  await expect(page.locator('[data-global-live-ticker]')).toContainText('A public-safe Builder update arrived')
  expect(requestedEndpoints).toEqual(expect.arrayContaining(['live-stats', 'goal-progress', 'live-activity', 'session-stats']))

  requestedEndpoints.length = 0
  await page.goto('/?scene=02&mode=live&output=obs&render=composite&clean=true&bgVideo=false&dataMode=live')
  await expect.poll(() => requestedEndpoints.length).toBeGreaterThan(0)
  expect(new Set(requestedEndpoints)).toEqual(new Set(['live-activity']))
})

test('full storyboard, clean composition reference, and overlay comparison states are correct', async ({ page }) => {
  await page.goto('/?scene=32&mode=reference&output=storyboard&render=composite&paused=true')
  await expect(page.locator('[data-reference-variant="sheet"]')).toBeVisible()
  await expect(page.locator('[data-reference-variant="sheet"] img')).toHaveCSS('transform', 'none')
  await expect(page.locator('[data-live-layer]')).toHaveCount(0)
  await expect(page.getByTestId('visual-stage')).toHaveCount(0)
  const pageDimensions = await page.evaluate(() => ({ body: document.body.scrollHeight, viewport: window.innerHeight }))
  expect(pageDimensions.body).toBeGreaterThan(pageDimensions.viewport)

  await page.goto('/?scene=03&mode=reference&output=obs&render=composite&clean=true&paused=true')
  await expect(page.locator('[data-reference-variant="composition"]')).toBeVisible()
  await expect(page.locator('.reference-composition')).toHaveJSProperty('clientWidth', 1920)
  await expect(page.locator('.reference-composition')).toHaveJSProperty('clientHeight', 1080)
  await expect(page.locator('[data-live-layer]')).toHaveCount(0)

  await page.goto('/?scene=32&mode=overlay&output=storyboard&render=composite&paused=true&bgVideo=false&legacyControls=true')
  const reference = page.locator('[data-reference-variant="composition"]')
  const live = page.locator('[data-live-composition]')
  await expect(reference).toBeVisible()
  await expect(live).toBeVisible()
  const boxes = await Promise.all([reference.boundingBox(), live.boundingBox()])
  expect(boxes[0]).toEqual(boxes[1])
  await expect(page.locator('[data-comparison-controls] [data-reference-opacity]')).toHaveValue('0.7')
  await expect(reference).toHaveClass(/reference-on-top/)
  await page.locator('[data-comparison-controls] [data-reference-opacity]').fill('0.35')
  await expect(reference).toHaveCSS('opacity', '0.35')
  await page.locator('[data-overlay-view="reference"]').click()
  await expect(live).toBeHidden()
  await page.locator('[data-overlay-view="both"]').click()
  await expect(live).toBeVisible()
  await page.locator('[data-toggle-reference-order]').click()
  await expect(reference).not.toHaveClass(/reference-on-top/)
  await expect(page.getByTestId('visual-stage').locator('.spec-sheet')).toHaveCount(0)
  await expect(page.locator('[data-background-layer]')).toHaveAttribute('data-video-enabled', 'false')

  await page.goto('/?scene=03&mode=live&output=obs&render=composite&clean=true&controllerPreview=true&paused=true')
  await expect(page.locator('[data-toggle-presentation-controls]')).toHaveCount(0)
  await expect(page.locator('.debug-overlay')).toHaveCount(0)
})

test('all scenes use the new composition references while retaining storyboard sheets', async ({ request }) => {
  const slidesResponse = await request.get('/data/slides.json')
  expect(slidesResponse.ok()).toBeTruthy()
  const slides = await slidesResponse.json()
  expect(slides).toHaveLength(39)

  for (const slide of slides) {
    expect(slide.referenceImage).toMatch(new RegExp(`/assets/references/1920x1080/${slide.id}_.+_1920x1080\\.png$`))
    expect(slide.storyboardImage).toMatch(/^\/assets\/storyboards\/core\/.+\.png$/)
    const [referenceResponse, storyboardResponse] = await Promise.all([
      request.get(slide.referenceImage),
      request.get(slide.storyboardImage),
    ])
    expect(referenceResponse.ok(), `scene ${slide.id} reference failed`).toBeTruthy()
    expect(storyboardResponse.ok(), `scene ${slide.id} storyboard failed`).toBeTruthy()
    const png = Buffer.from(await referenceResponse.body())
    expect({ width: png.readUInt32BE(16), height: png.readUInt32BE(20) }).toEqual({ width: 1672, height: 941 })
  }
})

test('every selected scene renders exactly its catalogued operator cues', async ({ page }) => {
  const missingTargets = []
  for (const sceneId of sceneIds) {
    await page.goto(`/?scene=${sceneId}&mode=live&output=storyboard&render=composite&paused=true&bgVideo=false&legacyControls=true`)
    const expectedCues = [
      sceneControlById[sceneId].entryCue.id,
      ...layerCueIds,
      ...sceneControlById[sceneId].duringCues.map((cue) => cue.id),
      sceneControlById[sceneId].exitCue.id,
    ]
    await expect(page.locator('[data-scene-cue-panel]')).toHaveAttribute('data-scene', sceneId)
    await expect(page.locator('[data-trigger-cue]')).toHaveCount(expectedCues.length)
    expect(await page.locator('[data-trigger-cue]').evaluateAll((buttons) => buttons.map((button) => button.dataset.triggerCue))).toEqual(expectedCues)
    for (const cue of sceneControlById[sceneId].duringCues) {
      if (await page.locator(`[data-control-cue="${cue.id}"]`).count() === 0) missingTargets.push(`${sceneId}:${cue.id}`)
    }
  }
  expect(missingTargets).toEqual([])
})

test('scene 32 completes the full operator sequence twice without stale cue state', async ({ page }) => {
  await page.goto('/?scene=32&mode=live&output=storyboard&render=composite&paused=true&bgVideo=false&legacyControls=true')
  const sequence = ['entry', ...sceneControlById['32'].duringCues.map((cue) => cue.id), 'exit']
  for (let pass = 0; pass < 2; pass += 1) {
    await page.locator('[data-reset-scene]').click()
    await expect(page.getByTestId('visual-stage')).toHaveAttribute('data-active-cue', 'reset')
    for (const cue of sequence) {
      await page.locator(`[data-trigger-cue="${cue}"]`).click()
      await expect(page.getByTestId('visual-stage')).toHaveAttribute('data-active-cue', cue)
      const activeTargets = page.locator('[data-cue-active="true"]')
      if (cue === 'entry' || cue === 'exit') {
        await expect(activeTargets).toHaveCount(0)
      } else {
        const expectedTargets = await page.locator(`[data-control-cue="${cue}"]`).count()
        await expect(activeTargets).toHaveCount(expectedTargets)
      }
    }
  }
})

for (const sceneId of sceneIds) {
  test(`@visual scene ${sceneId} live composite`, async ({ page }) => {
    await page.goto(`/?scene=${sceneId}&mode=live&output=obs&render=composite&clean=true&paused=true&bgVideo=false&ticker=hide`)
    await expect(page.getByTestId('visual-stage')).toBeVisible()
    await expect(page).toHaveScreenshot(`scene-${sceneId}-live-composite.png`)
  })
}

for (const sceneId of ['01', '03', '08', '14', '38']) {
  test(`@visual scene ${sceneId} storyboard shell`, async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1200 })
    await page.goto(`/?scene=${sceneId}&mode=overlay&output=storyboard&render=composite&paused=true&bgVideo=false&ticker=hide`)
    await expect(page.getByTestId('storyboard-canvas')).toBeVisible()
    await expect(page).toHaveScreenshot(`scene-${sceneId}-storyboard-shell.png`)
  })
}

test('@visual scene 32 clean reference composition', async ({ page }) => {
  await page.goto('/?scene=32&mode=reference&output=obs&render=composite&clean=true&paused=true')
  await expect(page.locator('[data-reference-variant="composition"]')).toBeVisible()
  await expect(page).toHaveScreenshot('scene-32-reference-composition.png')
})

test('@visual scene 32 overlay comparison', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1200 })
  await page.goto('/?scene=32&mode=overlay&output=storyboard&render=composite&paused=true&bgVideo=false&ticker=hide')
  await expect(page.locator('[data-comparison-controls]')).toBeVisible()
  await expect(page).toHaveScreenshot('scene-32-overlay-comparison.png')
})
