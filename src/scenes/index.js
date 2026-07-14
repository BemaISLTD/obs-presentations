import { scene01 } from './scene01.js'
import { scene02 } from './scene02.js'
import { scene03 } from './scene03.js'
import { scene04 } from './scene04.js'
import { scene05 } from './scene05.js'
import { scene08 } from './scene08.js'
import { scene14 } from './scene14.js'
import { scene38 } from './scene38.js'
import { createLayeredScene } from './createLayeredScene.js'
import { layeredSceneCatalog } from './layeredSceneCatalog.js'

const codedScenes = {
  '01': scene01,
  '02': scene02,
  '03': scene03,
  '04': scene04,
  '05': scene05,
  '08': scene08,
  '14': scene14,
  '38': scene38,
}

export const scenes = Object.freeze(
  Object.fromEntries(
    Array.from({ length: 39 }, (_, index) => {
      const id = String(index + 1).padStart(2, '0')
      return [id, codedScenes[id] ?? createLayeredScene(layeredSceneCatalog[id])]
    }),
  ),
)
