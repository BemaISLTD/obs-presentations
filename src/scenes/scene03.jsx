// Scene 03 is an art-directed camera composition. The approved plate includes
// the presenter, studio dressing, monitor artwork, and broadcast chrome, so
// rebuilding those pieces independently causes visible geometry drift.
const REFERENCE_PLATE =
  "/assets/references/1920x1080/03_host_standby_camera_1920x1080.png";

function SceneMarkup({ html }) {
  return html ? (
    <div
      data-react-scene-markup="true"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ) : null;
}

function sceneMarkup(html) {
  return <SceneMarkup html={html} />;
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character],
  );
}

export const scene03 = {
  presenterZone: "center-left",
  renderUnderlay(context) {
    const presenterName = escapeHtml(
      context.scene03PresenterName || "Joyce Root",
    );
    return sceneMarkup(
      `<section class="scene proof-scene scene03 proof-enter absolute inset-0 overflow-hidden" aria-label="Host standby camera">
        <img class="absolute inset-0 size-full object-fill" src="${REFERENCE_PLATE}" alt="Joyce Root in the Bema Hub host studio" width="1920" height="1080" />
        <div class="scene03-brand-replacement scene03-brand-replacement-corner"><img src="/full-logo.png" alt="Bema Hub" /></div>
        <div class="scene03-brand-replacement scene03-brand-replacement-screen"><img src="/full-logo.png" alt="" /></div>
        <article class="scene03-live-presenter-card" aria-label="Current presenter">
          <span>Host</span>
          <strong data-scene03-presenter-name>${presenterName}</strong>
          <p>Community Manager, Bema Hub</p>
        </article>
      </section>`,
    );
  },
  renderForeground() {
    return sceneMarkup(
      '<section class="scene-foreground scene03-foreground pointer-events-none absolute inset-0" aria-hidden="true"><span class="absolute opacity-0" data-control-cue="reveal-lower-third"></span></section>',
    );
  },
  render(context) {
    return (
      <>
        {this.renderUnderlay(context)}
        {this.renderForeground(context)}
      </>
    );
  },
};
