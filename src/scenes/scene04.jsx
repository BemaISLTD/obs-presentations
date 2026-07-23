// Scene 04 is an art-directed stinger. Its approved plate already contains
// the final background, lockup, icons, typography, and stage geometry.
const REFERENCE_PLATE = '/assets/references/1920x1080/04_grand_opening_stinger_1920x1080.png'

function SceneMarkup({ html }) {
  return html ? <div data-react-scene-markup="true" dangerouslySetInnerHTML={{ __html: html }} /> : null
}

function sceneMarkup(html) {
  return <SceneMarkup html={html} />
}

export const scene04 = {
  presenterZone: 'none',
  renderUnderlay() {
    return sceneMarkup(`
      <section class="scene scene04 absolute inset-0 overflow-hidden" aria-label="Grand opening stinger">
        <img class="absolute inset-0 size-full object-fill" src="${REFERENCE_PLATE}" alt="Bema Hub grand opening stinger" width="1920" height="1080" />
        <span class="scene04-statement-reveal statement-1" data-control-cue="reveal-creator" aria-hidden="true"></span>
        <span class="scene04-statement-reveal statement-2" data-control-cue="reveal-builder" aria-hidden="true"></span>
        <span class="scene04-statement-reveal statement-3" data-control-cue="reveal-community" aria-hidden="true"></span>
      </section>
    `)
  },
  render(context) { return this.renderUnderlay(context) },
}
