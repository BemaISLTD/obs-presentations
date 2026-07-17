import { expect, test } from '@playwright/test'

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

test('presentation controls, debug state, navigation, and cue replay remain interactive', async ({ page }) => {
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
  await page.locator('[data-replay-entry]').click()
  await expect(page.getByTestId('visual-stage')).toHaveAttribute('data-active-cue', 'entry')
  await page.locator('[data-trigger-exit]').click()
  await expect(page.getByTestId('visual-stage')).toHaveAttribute('data-active-cue', 'exit')
})

test('reference, overlay, poster fallback, clean, and controller preview states remain supported', async ({ page }) => {
  await page.goto('/?scene=03&mode=reference&output=obs&render=composite&clean=true&paused=true')
  await expect(page.locator('[data-reference-layer]')).toBeVisible()
  await expect(page.locator('[data-live-layer]')).toHaveCount(0)

  await page.goto('/?scene=03&mode=overlay&output=storyboard&render=composite&paused=true&bgVideo=false')
  await expect(page.locator('[data-reference-layer]')).toBeVisible()
  await expect(page.locator('[data-live-layer="underlay"]')).toBeVisible()
  await expect(page.locator('[data-background-layer]')).toHaveAttribute('data-video-enabled', 'false')

  await page.goto('/?scene=03&mode=live&output=obs&render=composite&clean=true&controllerPreview=true&paused=true')
  await expect(page.locator('[data-toggle-presentation-controls]')).toHaveCount(0)
  await expect(page.locator('.debug-overlay')).toHaveCount(0)
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
