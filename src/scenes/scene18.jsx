import { card, icon, renderLayeredForeground, renderLayeredUnderlay } from './layeredSceneShared.jsx'

const config = {
    title: 'CAMPAIGN DETAIL PAGE', subtitle: 'Real creative value. Clear mutual exchange.', layout: 'dashboard', footerLead: 'LIVE NOW', audience: '128',
    items: [
      card('New Single Launch: Echoes', 'Jaylen Vibes · Music Creator · Atlanta, GA', 'music', 'CREATOR', 'blue', 'detail-purpose'),
      card('Campaign Purpose', 'Support the launch of “Echoes” and amplify real music to real listeners.', 'heart', 'WHY', 'cyan', 'detail-purpose'),
      card('Participation Assets', 'Early preview · Behind the scenes · Artwork · VIP listening session', 'signal', '5 ASSETS', 'purple', 'detail-assets'),
      card('Access Levels', 'Participation Level · VIP Access · Signature VIP', 'lock', '3 LEVELS', 'blue', 'detail-levels'),
      card('Creator Proof & Updates', 'Verified creator · Previous campaigns delivered · Regular updates', 'chart', '100%', 'cyan', 'detail-proof'),
    ],
    footer: [['people', 'Campaign Detail'], ['music', 'Creative Value'], ['gift', 'Participation Assets'], ['crown', 'Access Levels']],
  }
export const scene18 = {
  presenterZone: 'left',
  renderUnderlay() {
    const body = `<div class="scene18-detail-panel h-full rounded-panel border border-sky-200/70 bg-white/95 shadow-card"><section class="scene18-creator"><div class="scene18-creator-photo">JV</div><div><h3>New Single Launch: Echoes</h3><strong>✓ Jaylen Vibes</strong><span>Music Creator</span><p>♫ R&amp;B Artist　│　♙ 128K Community　│　⌖ Atlanta, GA</p></div></section><section class="scene18-purpose">${icon('target')}<div><h3>Campaign Purpose</h3><p>Support the launch of my new single “Echoes” and help me amplify real music to real listeners.</p></div></section><section class="scene18-info assets">${icon('gift')}<div><h3>Participation Assets</h3><ul><li>Early song preview</li><li>Exclusive behind-the-scenes</li><li>Personalized shoutout</li><li>Limited edition artwork</li><li>VIP listening session access</li></ul></div></section><section class="scene18-info proof">${icon('shield')}<div><h3>Creator Proof &amp; Updates</h3><ul><li>Verified creator account</li><li>Previous campaigns delivered</li><li>Regular updates &amp; transparency</li><li>Real engagement, real results</li></ul><strong>✓　100% Delivery Rate</strong></div></section><section class="scene18-info levels">${icon('crown')}<div><h3>Access Levels</h3><p>${icon('people')} Participation Level</p><p>${icon('star')} VIP Access</p><p>${icon('crown')} Signature VIP</p></div></section><footer><b>i</b>Review the purpose, assets, access levels, and creator proof to see the <strong>creative value</strong> before you join.</footer></div>`
    return renderLayeredUnderlay('18', config, body)
  },
  renderForeground() { return renderLayeredForeground('18', config) },
}
