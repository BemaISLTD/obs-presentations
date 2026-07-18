import { expect, test } from '@playwright/test'
import { sceneControlById } from '../src/sceneControls.js'

const sceneIds = Array.from({ length: 39 }, (_, index) => String(index + 1).padStart(2, '0'))
const outputs = [
  ['storyboard', 'composite'],
  ['obs', 'underlay'],
  ['obs', 'foreground'],
  ['obs', 'composite'],
]

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

test('presentation controls, debug state, navigation, and cue lifecycle remain interactive', async ({ page }) => {
  await page.goto('/?scene=08&mode=live&output=storyboard&render=composite&paused=true&bgVideo=false')
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

  await page.goto('/?scene=08&mode=live&output=storyboard&render=composite&paused=true&bgVideo=false')
  await expect(page.locator('[data-presentation-scene]')).toHaveCount(39)
  await expect(page.locator('[data-scene-cue-panel]')).toHaveAttribute('data-scene', '08')
  await expect(page.locator('[data-trigger-cue]')).toHaveCount(sceneControlById['08'].duringCues.length + 2)

  await page.locator('[data-reset-scene]').click()
  await expect(page.getByTestId('visual-stage')).toHaveAttribute('data-active-cue', 'reset')
  await page.locator('[data-trigger-cue="entry"]').click()
  await expect(page.getByTestId('visual-stage')).toHaveAttribute('data-active-cue', 'entry')
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

test('full reference, clean composition crop, and overlay comparison states are correct', async ({ page }) => {
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

  await page.goto('/?scene=32&mode=overlay&output=storyboard&render=composite&paused=true&bgVideo=false')
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

test('every selected scene renders exactly its catalogued operator cues', async ({ page }) => {
  const missingTargets = []
  for (const sceneId of sceneIds) {
    await page.goto(`/?scene=${sceneId}&mode=live&output=storyboard&render=composite&paused=true&bgVideo=false`)
    const expectedCues = [
      sceneControlById[sceneId].entryCue.id,
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
  await page.goto('/?scene=32&mode=live&output=storyboard&render=composite&paused=true&bgVideo=false')
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
    await page.goto(`/?scene=${sceneId}&mode=live&output=obs&render=composite&clean=true&paused=true&bgVideo=false`)
    await expect(page.getByTestId('visual-stage')).toBeVisible()
    await expect(page).toHaveScreenshot(`scene-${sceneId}-live-composite.png`)
  })
}

for (const sceneId of ['01', '03', '08', '14', '38']) {
  test(`@visual scene ${sceneId} storyboard shell`, async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1200 })
    await page.goto(`/?scene=${sceneId}&mode=overlay&output=storyboard&render=composite&paused=true&bgVideo=false`)
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
  await page.goto('/?scene=32&mode=overlay&output=storyboard&render=composite&paused=true&bgVideo=false')
  await expect(page.locator('[data-comparison-controls]')).toBeVisible()
  await expect(page).toHaveScreenshot('scene-32-overlay-comparison.png')
})
