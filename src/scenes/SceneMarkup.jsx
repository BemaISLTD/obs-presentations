export function SceneMarkup({ html }) {
  return html ? <div data-react-scene-markup="true" dangerouslySetInnerHTML={{ __html: html }} /> : null
}

export function sceneMarkup(html) {
  return <SceneMarkup html={html} />
}
