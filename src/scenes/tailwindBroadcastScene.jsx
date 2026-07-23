function Markup({ html }) {
  return <div data-react-scene-markup="true" dangerouslySetInnerHTML={{ __html: html }} />
}

const logo = `
  <div class="scene-brand-lockup absolute left-12 top-9 z-30 flex items-center gap-3">
    <img class="h-14 w-14" src="/assets/logos/bemahub-reference-mark.svg" alt="" />
    <span class="brand-wordmark" data-asset-wrapper>
      <img class="h-10 w-auto" src="/assets/logos/bemahub-wordmark.svg" alt="BemaHub" data-asset-image />
      <strong class="brand-wordmark-fallback"><span class="brand-wordmark-bema">bema</span><span class="brand-wordmark-hub">Hub</span></strong>
    </span>
  </div>`

const live = `
  <div class="absolute right-12 top-9 z-30 flex items-center gap-3 rounded-xl bg-red-600 px-5 py-3 text-xl font-black tracking-wide text-white shadow-xl">
    <span class="size-3 rounded-full bg-white"></span>LIVE
  </div>`

export function renderTailwindUnderlay({ title, subtitle, body, titleClass = '' }) {
  return <Markup html={`
    <section class="absolute inset-0 overflow-hidden font-sans text-[#06174c]">
      <div class="absolute inset-0 bg-gradient-to-br from-white/90 via-sky-50/75 to-indigo-100/60"></div>
      <div class="absolute inset-y-0 left-0 w-[34%] border-r border-white/25 bg-white/10" aria-label="Presenter camera placement"></div>
      ${logo}${live}
      <header class="major-scene-heading absolute left-[35%] right-14 top-10 z-20 text-center ${titleClass}">
        <h2 class="font-display text-[58px] font-black leading-[.94] tracking-[-.045em] text-[#071b59]">${title}</h2>
        <p class="mt-3 text-[24px] font-semibold text-[#16255c]">${subtitle}</p>
        <div class="mx-auto mt-4 flex w-[430px] items-center gap-4 text-cyan-500"><span class="h-0.5 flex-1 bg-cyan-500"></span><span class="text-2xl">♥</span><span class="h-0.5 flex-1 bg-cyan-500"></span></div>
      </header>
      <main class="absolute bottom-[126px] left-[35%] right-12 top-[220px] z-20">${body}</main>
    </section>`} />
}

export function renderTailwindCanvas(body) {
  return <Markup html={`
    <section class="absolute inset-0 overflow-hidden font-sans text-[#06174c]">
      <div class="absolute inset-0 bg-gradient-to-br from-white/90 via-sky-50/75 to-indigo-100/60"></div>
      <div class="absolute inset-y-0 left-0 w-[34%] border-r border-white/25 bg-white/10" aria-label="Presenter camera placement"></div>
      ${logo}${live}${body}
    </section>`} />
}

export function renderTailwindForeground(items, lead = 'LIVE NOW', audience = '128') {
  return <Markup html={`
    <div class="pointer-events-none absolute inset-x-7 bottom-4 z-40 flex h-[82px] items-center overflow-hidden rounded-[20px] border border-white/25 bg-[#031849]/95 text-white shadow-2xl backdrop-blur-xl">
      <strong class="mx-5 flex h-14 min-w-[210px] items-center justify-center rounded-full bg-red-600 px-7 text-lg font-black">${lead}</strong>
      ${items.map((item) => `<span class="flex h-10 min-w-0 flex-1 items-center justify-center border-l border-white/35 px-4 text-center text-base font-bold">${item}</span>`).join('')}
      <span class="flex h-10 min-w-[220px] items-center justify-center gap-3 border-l border-white/35 px-5"><b class="text-2xl text-cyan-300">${audience}</b><small class="text-sm">Watching Live</small></span>
    </div>`} />
}

const accents = [
  ['text-cyan-600', 'bg-cyan-50', 'border-cyan-300'],
  ['text-blue-600', 'bg-blue-50', 'border-blue-300'],
  ['text-violet-600', 'bg-violet-50', 'border-violet-300'],
  ['text-fuchsia-600', 'bg-fuchsia-50', 'border-fuchsia-300'],
  ['text-amber-600', 'bg-amber-50', 'border-amber-300'],
]

export function statusRows(items) {
  return `<section class="mx-auto flex h-full max-w-[1120px] flex-col gap-4 rounded-[30px] border border-sky-200/70 bg-[#051a4d]/95 p-6 shadow-2xl">${items.map((item, index) => {
    const [text, bg, border] = accents[index % accents.length]
    return `<article class="grid min-h-0 flex-1 grid-cols-[68px_1fr_auto_48px] items-center gap-5 rounded-2xl border ${border} bg-white/95 px-5 py-3" data-control-cue="${item.cue}"><span class="grid size-14 place-items-center rounded-full ${bg} text-2xl font-black ${text}">${String(index + 1).padStart(2, '0')}</span><div><h3 class="text-xl font-black ${text}">${item.title}</h3><p class="mt-1 text-sm font-semibold text-slate-600">${item.copy}</p></div><strong class="rounded-full ${bg} px-4 py-2 text-xs font-black ${text}">${item.value}</strong><b class="grid size-9 place-items-center rounded-full ${item.negative ? 'bg-rose-100 text-rose-600' : 'bg-cyan-100 text-cyan-600'}">${item.negative ? '×' : '✓'}</b></article>`
  }).join('')}</section>`
}

export function featureCards(items, columns = 3) {
  return `<div class="grid h-full content-center gap-5 ${columns === 2 ? 'grid-cols-2' : columns === 4 ? 'grid-cols-4' : 'grid-cols-3'}">${items.map((item, index) => {
    const [text, bg, border] = accents[index % accents.length]
    return `<article class="rounded-[24px] border ${border} bg-white/95 p-6 text-center shadow-xl" data-control-cue="${item.cue}"><span class="mx-auto grid size-16 place-items-center rounded-full ${bg} text-2xl font-black ${text}">${String(index + 1).padStart(2, '0')}</span><h3 class="mt-4 text-xl font-black ${text}">${item.title}</h3><p class="mt-3 text-sm font-semibold leading-relaxed text-slate-600">${item.copy}</p><strong class="mt-5 inline-flex rounded-full ${bg} px-4 py-2 text-xs font-black ${text}">${item.value}</strong></article>`
  }).join('')}</div>`
}

export function faqRows(items) {
  return `<div class="grid h-full content-center gap-3">${items.map((item, index) => {
    const [text, bg] = accents[index % accents.length]
    return `<article class="grid grid-cols-[64px_1fr_34px] items-center gap-5 rounded-2xl border border-sky-200/80 bg-white/95 p-4 shadow-lg" data-control-cue="${item.cue}"><span class="grid size-14 place-items-center rounded-full ${bg} text-xl font-black ${text}">${String(index + 1).padStart(2, '0')}</span><div><h3 class="text-xl font-black ${text}">${item.title}</h3><p class="mt-1 text-sm font-semibold text-slate-600">${item.copy}</p></div><b class="text-2xl">⌄</b></article>`
  }).join('')}</div>`
}

export function profileCards(items) {
  const categories = ['Education', 'Social Impact', 'Community', 'Environment', 'Creative Arts', 'Technology']
  const categoryIcons = ['◈', '♡', '♙', '♧', '✎', '▣']
  return `<div class="grid h-full grid-cols-3 content-center gap-5">${items.map((item, index) => {
    const [text, bg, border] = accents[index % accents.length]
    const initials = item.title.split(' ').map((part) => part[0]).join('')
    return `<article class="grid grid-cols-[86px_1fr] rounded-2xl border ${border} bg-white/95 p-5 shadow-xl" data-control-cue="${item.cue}">${item.image ? `<img class="size-[76px] rounded-full border-2 ${border} object-cover shadow-md" src="${item.image}" alt="${item.title}" />` : `<span class="grid size-[68px] place-items-center rounded-full ${bg} text-xl font-black ${text}">${initials}</span>`}<div><h3 class="text-xl font-black">${item.title}</h3><a class="text-sm font-bold text-blue-600">@${item.title.replaceAll(' ', '')}</a><p class="mt-2 text-sm font-semibold text-slate-600">${item.copy}</p></div><footer class="col-span-2 mt-4 flex items-center justify-between border-t pt-3"><span class="rounded-lg ${bg} px-3 py-2 text-xs font-black ${text}">${categoryIcons[index]}　${categories[index]}</span><strong class="text-xl ${text}">${item.value}<small class="ml-2 text-[10px] text-slate-500">Impact Score</small></strong></footer></article>`
  }).join('')}</div>`
}

export function metricBoard(items) {
  return `<div class="grid h-full grid-cols-6 content-center gap-4">${items.map((item, index) => {
    const [text, bg, border] = accents[index % accents.length]
    const span = index < 3 ? 'col-span-2' : index < 5 ? 'col-span-3' : 'col-span-6'
    return `<article class="${span} rounded-2xl border ${border} bg-white/95 p-5 shadow-xl" data-control-cue="${item.cue}"><small class="font-black tracking-wide text-slate-500">${item.title.toUpperCase()}</small><div class="mt-3 flex items-center gap-4"><span class="grid size-14 place-items-center rounded-full ${bg} text-xl font-black ${text}">${String(index + 1).padStart(2, '0')}</span><strong class="text-3xl font-black ${text}">${item.value}</strong></div><p class="mt-3 text-sm font-semibold text-slate-600">${item.copy}</p>${item.value.includes('%') ? `<div class="mt-4 h-3 overflow-hidden rounded-full bg-slate-200"><i class="block h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-400 to-violet-600"></i></div>` : ''}</article>`
  }).join('')}</div>`
}

export function ctaBoard(items, qrTitle = 'SCAN TO JOIN') {
  return `<div class="grid h-full grid-cols-[230px_1fr] content-center gap-6"><aside class="grid place-items-center rounded-[26px] border border-sky-200 bg-white/95 p-5 shadow-xl"><strong class="text-lg font-black">${qrTitle}</strong><img class="mt-3 size-[175px] rounded-xl" src="/assets/qr/main-join-qr.png" alt="Enrollment QR code" /></aside><section class="grid grid-cols-3 gap-4">${items.slice(0, 3).map((item, index) => {
    const [text, bg, border] = accents[index % accents.length]
    return `<article class="rounded-2xl border ${border} bg-white/95 p-5 text-center shadow-xl" data-control-cue="${item.cue}"><span class="mx-auto grid size-16 place-items-center rounded-full ${bg} text-2xl ${text}">✦</span><h3 class="mt-4 text-xl font-black ${text}">${item.title}</h3><p class="mt-3 text-sm font-semibold leading-relaxed text-slate-600">${item.copy}</p><button class="mt-5 rounded-full ${bg} px-5 py-2 text-sm font-black ${text}">${item.value}</button></article>`
  }).join('')}<article class="col-span-3 flex items-center justify-between rounded-2xl border border-sky-200 bg-white/95 px-7 py-4 shadow-xl"><div><strong class="text-lg font-black">${items[3]?.title ?? 'Stay connected'}</strong><p class="text-sm font-semibold text-slate-600">${items[3]?.copy ?? 'Keep moving value forward.'}</p></div><button class="rounded-full bg-violet-600 px-6 py-3 font-black text-white">${items[3]?.value ?? 'JOIN'}</button></article></section></div>`
}
