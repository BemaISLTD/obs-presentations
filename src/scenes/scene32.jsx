import {
  card,
  renderLayeredForeground,
  renderLayeredUnderlay,
} from './layeredSceneShared.jsx'

const config = {
  title: 'TOP REFERRERS & COMMUNITY MOMENTUM', subtitle: 'Visible movement helps value travel farther.', layout: 'leaderboard',
  items: [
    card('Creative_Jay', 'Community Builder', 'people', '128', 'cyan', 'rank-1'),
    card('DesignFlow', 'Visual Storyteller', 'chart', '97', 'blue', 'rank-2'),
    card('MelodyMinds', 'Music Creator', 'music', '86', 'purple', 'rank-3'),
    card('LoopQueen', 'Engagement Leader', 'heart', '72', 'blue', 'activity-update'),
    card('Visionary_Vee', 'Impact Connector', 'signal', '61', 'cyan', 'activity-update'),
    card('Weekly Momentum', '1,248 referrals · 2,976 LoopLinks · 4,532 community actions', 'chart', '+24%', 'purple', 'activity-update'),
  ],
  footer: [['people', 'Top Referrers'], ['signal', 'Loop Activity'], ['chart', 'Weekly Movement']],
}
export const scene32 = {
  presenterZone: "left",
  renderUnderlay() {
    const bars = [35, 48, 42, 67, 58, 81, 94];
    const body = `<div class="leaderboard-layout h-full"><section class="rounded-panel border border-sky-200/70 bg-white/95 shadow-card"><header><div><small>TOP REFERRERS</small><h3>Community leaders</h3></div><strong>LOOPLOCKS</strong></header>${config.items
      .slice(0, 5)
      .map(
        (item, index) =>
          `<article data-control-cue="${item.cue}"><b class="rank">${index + 1}</b><span class="leader-avatar">${item.title.slice(0, 2).toUpperCase()}</span><div><h4>${item.title}</h4><p>${item.copy}</p></div><strong>${item.value}</strong><i>${index < 2 ? "↑" : "—"}</i></article>`,
      )
      .join(
        "",
      )}</section><aside class="rounded-panel border border-sky-200/70 bg-white/95 shadow-card"><small>WEEKLY MOMENTUM</small><strong>+24%</strong><p>Community movement this week</p><div class="momentum-chart">${bars.map((value) => `<i style="height:${value}%"></i>`).join("")}</div><dl><div><dt>1,248</dt><dd>Referrals</dd></div><div><dt>2,976</dt><dd>LoopLinks</dd></div><div><dt>4,532</dt><dd>Actions</dd></div></dl></aside></div>`;
    return renderLayeredUnderlay("32", config, body);
  },
  renderForeground() {
    return renderLayeredForeground("32", config);
  },
};
