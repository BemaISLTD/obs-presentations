export const scene04 = {
  render() {
    const particles = Array.from({ length: 22 }, (_, index) => {
      const left = 4 + (index * 4.2) % 90
      const delay = (index % 6) * 0.55
      const duration = 6 + (index % 4)
      const size = 5 + (index % 5) * 2
      return `<span class="particle" style="left: ${left}%; bottom: -30px; width: ${size}px; height: ${size}px; animation-delay: ${delay}s; animation-duration: ${duration}s"></span>`
    }).join('')

    return `
      <section class="scene scene04">
        <div class="particle-layer particle-field">${particles}</div>
        <div class="light-streak"></div>
        <div class="glass-card stinger-copy soft-glow wave-layer">
          <p class="eyebrow" style="color: rgba(239, 249, 255, 0.72);">Grand Opening Stinger</p>
          <div class="logo-pulse" style="margin-bottom: 26px; width: 160px; height: 160px;">
            <div class="logo-mark" style="width: 94px; height: 94px; font-size: 1.9rem;">BC</div>
          </div>
          <h2 class="stage-title">Creative Value in motion.</h2>
          <p class="stage-subtitle" style="margin-top: 16px; color: rgba(239, 249, 255, 0.78);">A cinematic entry scene for live transitions without legacy wipe behavior.</p>
          <div class="mission-statements">
            <span>Mutual Exchange</span>
            <span>Recognized Impact</span>
            <span>LoopLock Readiness</span>
            <span>Community of Rewarded Engagement</span>
          </div>
        </div>
      </section>
    `
  },
}