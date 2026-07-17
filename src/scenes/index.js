import { scene01 } from './scene01.jsx'
import { scene02 } from './scene02.jsx'
import { scene03 } from './scene03.jsx'
import { scene04 } from './scene04.jsx'
import { scene05 } from './scene05.jsx'
import { scene06 } from './scene06.jsx'
import { scene07 } from './scene07.jsx'
import { scene08 } from './scene08.jsx'
import { scene09 } from './scene09.jsx'
import { scene10 } from './scene10.jsx'
import { scene11 } from './scene11.jsx'
import { scene12 } from './scene12.jsx'
import { scene13 } from './scene13.jsx'
import { scene14 } from './scene14.jsx'
import { scene15 } from './scene15.jsx'
import { scene16 } from './scene16.jsx'
import { scene17 } from './scene17.jsx'
import { scene18 } from './scene18.jsx'
import { scene19 } from './scene19.jsx'
import { scene20 } from './scene20.jsx'
import { scene21 } from './scene21.jsx'
import { scene22 } from './scene22.jsx'
import { scene23 } from './scene23.jsx'
import { scene24 } from './scene24.jsx'
import { scene25 } from './scene25.jsx'
import { scene26 } from './scene26.jsx'
import { scene27 } from './scene27.jsx'
import { scene28 } from './scene28.jsx'
import { scene29 } from './scene29.jsx'
import { scene30 } from './scene30.jsx'
import { scene31 } from './scene31.jsx'
import { scene32 } from './scene32.jsx'
import { scene33 } from './scene33.jsx'
import { scene34 } from './scene34.jsx'
import { scene35 } from './scene35.jsx'
import { scene36 } from './scene36.jsx'
import { scene37 } from './scene37.jsx'
import { scene38 } from './scene38.jsx'
import { scene39 } from './scene39.jsx'

const codedScenes = {
  '01': scene01,
  '02': scene02,
  '03': scene03,
  '04': scene04,
  '05': scene05,
  '06': scene06,
  '07': scene07,
  '08': scene08,
  '09': scene09,
  '10': scene10,
  '11': scene11,
  '12': scene12,
  '13': scene13,
  '14': scene14,
  '15': scene15,
  '16': scene16,
  '17': scene17,
  '18': scene18,
  '19': scene19,
  '20': scene20,
  '21': scene21,
  '22': scene22,
  '23': scene23,
  '24': scene24,
  '25': scene25,
  '26': scene26,
  '27': scene27,
  '28': scene28,
  '29': scene29,
  '30': scene30,
  '31': scene31,
  '32': scene32,
  '33': scene33,
  '34': scene34,
  '35': scene35,
  '36': scene36,
  '37': scene37,
  '38': scene38,
  '39': scene39,
}

export const scenes = Object.freeze(
  Object.fromEntries(
    Array.from({ length: 39 }, (_, index) => {
      const id = String(index + 1).padStart(2, '0')
      return [id, codedScenes[id]]
    }),
  ),
)
