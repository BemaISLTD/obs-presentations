// Which music bed each scene runs under.
//
// Two beds: the full vocal track for scenes that open, welcome, or celebrate,
// and its instrumental for scenes where someone is speaking over the top and
// lyrics would compete with them.
//
// The map is the show's intent; playback continuity is handled separately. A
// scene change only ever restarts audio when the two scenes want *different*
// beds — moving between scenes on the same bed leaves the music untouched.

export const MUSIC_TRACKS = Object.freeze({
  vocal: '/assets/musics/Bema%20Hub.mp3',
  instrumental: '/assets/musics/beat-bema.MP3',
})

// Scenes that carry the vocal track. Everything else uses the instrumental, so
// a scene added later gets the speech-friendly bed by default rather than
// unexpectedly singing over a presenter.
const VOCAL_SCENES = new Set(['01', '02', '04', '05', '14', '23', '34', '35', '37'])

export function normalizeSceneId(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  const number = Number(digits)
  return number >= 1 && number <= 39 ? String(number).padStart(2, '0') : ''
}

/** The bed a scene should run under: 'vocal' or 'instrumental'. */
export function musicRoleForScene(sceneId) {
  return VOCAL_SCENES.has(normalizeSceneId(sceneId)) ? 'vocal' : 'instrumental'
}

/** The track URL a scene should run under. */
export function trackForScene(sceneId) {
  return MUSIC_TRACKS[musicRoleForScene(sceneId)]
}

/**
 * True when moving between these scenes changes the bed.
 *
 * This is the whole point of the mapping: scene changes are frequent, and the
 * music must survive all of them except the handful that genuinely cross
 * between the vocal and instrumental beds.
 */
export function musicChangesBetween(fromSceneId, toSceneId) {
  return musicRoleForScene(fromSceneId) !== musicRoleForScene(toSceneId)
}
