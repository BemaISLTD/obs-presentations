import {
  icon,
  renderBrand,
  renderForegroundBar,
  renderLiveBadge,
  renderQrCard,
} from "../components/broadcastChrome.js";

export function createLayeredScene(config) {
  return {
    presenterZone: "left",

    renderUnderlay(context) {
      const id = config.id ?? context.slide.id;
      return `
        <section class="scene layered-scene reference-built-scene reference-scene-${id} layout-${config.layout} ${config.compact ? "is-compact" : ""} ${config.darkPanel ? "has-dark-panel" : ""}">
          ${renderBrand()}${renderLiveBadge()}
          <div class="layered-presenter-space" aria-label="Presenter camera placement"></div>
          <header class="layered-scene-heading">
            <h2>${config.title}</h2>
            ${["09", "12", "26", "27"].includes(id) ? '<span class="layered-heading-rule">•</span>' : ""}
            <p>${config.subtitle}</p>
            ${!["09", "12", "26", "27"].includes(id) ? '<span class="layered-heading-rule">♥</span>' : ""}
          </header>
          <div class="reference-scene-body">${renderSceneBody(id, config)}</div>
          ${config.qr && !["27", "34", "37", "39"].includes(id) ? `<aside class="layered-qr">${renderQrCard("Scan to Join")}</aside>` : ""}
          ${config.callout && !["06", "11", "15"].includes(id) ? `<div class="layered-callout">${icon("heart")}<strong>${config.callout}</strong></div>` : ""}
        </section>`;
    },

    renderForeground(context) {
      return `
        <section class="scene-foreground layered-scene-foreground layered-scene-foreground-${context.slide.id}">
          <div class="layered-presenter-accent" aria-hidden="true"></div>
          ${renderForegroundBar(
            config.footer.map(([itemIcon, label]) => ({
              icon: itemIcon,
              label,
            })),
            config.footerLead ?? (config.utility
              ? "LIVE NOW"
              : config.title.split(" ").slice(0, 3).join(" ")),
            { audience: config.audience, leadIcon: config.footerLeadIcon },
          )}
        </section>`;
    },
  };
}

function renderSceneBody(id, config) {
  const renderer = SCENE_BODY_RENDERERS[id];
  if (!renderer) throw new Error(`No dedicated card renderer registered for Scene ${id}`);
  return `<div class="scene-card-composition scene-card-composition-${id}" data-scene-card-design="${id}">${renderer(config)}</div>`;
}

// Keep these routes explicit. Each storyboard scene owns its markup entry and
// scene-scoped CSS, even when it reuses a low-level card primitive.
const SCENE_BODY_RENDERERS = {
  "06": (config) => renderScene06(config),
  "07": (config) => renderFeatureCards("07", config),
  "09": (config) => renderFeatureCards("09", config),
  "10": (config) => renderFlow(config, "10"),
  "11": (config) => renderScene11(config),
  "12": (config) => renderLadder("12", config),
  "13": (config) => renderLadder("13", config),
  "15": (config) => renderScene15(config),
  "16": (config) => renderScene16(config),
  "17": (config) => renderScene17(config),
  "18": (config) => renderScene18(config),
  "19": (config) => renderFeatureCards("19", config),
  "20": (config) => renderAssets(config),
  "21": (config) => renderTools(config),
  "22": (config) => renderFlow(config, "22"),
  "23": (config) => renderStatus("23", config),
  "24": (config) => renderImpactExplainer(config),
  "25": (config) => renderScene25(config),
  "26": (config) => renderAppScene("26", config),
  "27": (config) => renderAppScene("27", config),
  "28": (config) => renderProfiles(config),
  "29": (config) => renderScene29(config),
  "30": (config) => renderScene30(config),
  "31": (config) => renderScene31(config),
  "32": (config) => renderLeaderboard(config),
  "33": (config) => renderFaq(config),
  "34": (config) => renderLiveAction("34", config),
  "35": (config) => renderFeatureCards("35", config),
  "36": (config) => renderFaq(config),
  "37": (config) => renderLiveAction("37", config),
  "39": (config) => renderLiveAction("39", config),
};

function renderScene06(config) {
  return `<div class="scene06-definition-panel">
    ${renderFeatureCards("06", config)}
    <div class="scene06-definition-callout"><strong>Creators</strong> bring real value. <strong>Builders</strong> help it reach more people.</div>
  </div>`;
}

function renderScene11(config) {
  return `<div class="scene11-echoloop-panel">
    ${renderFlow(config, "11")}
    <div class="scene11-notes">
      <p><span>i</span>Sharing alone does not create Recognized Impact.</p>
      <p><span>✓</span>Qualifying LoopLocks may contribute to Recognized Impact according to campaign rules.</p>
    </div>
  </div>`;
}

function renderScene15(config) {
  return `<div class="scene15-status-dashboard">
    ${renderStatus("15", config)}
    <div class="scene15-status-callout">${icon("shield")}<strong>Qualified LoopLocks may contribute to Recognized Impact<br />according to campaign rules.</strong></div>
  </div>`;
}

function renderScene16(config) {
  const metrics = config.items.slice(0, 4);
  return `<div class="scene16-home-layout">
    <aside class="scene16-home-points">
      <p>${icon("people")}<span>See what’s live.<br />Join what matters.</span></p>
      <p>${icon("star")}<span>Discover campaigns.<br />Make an impact.</span></p>
      <p>${icon("chart")}<span>Track activity.<br />Fuel growth together.</span></p>
    </aside>
    <div class="scene16-dashboard">
      <header><span class="scene16-app-brand">${renderBrand()}</span><nav>Home　 Campaigns　 Loop Activity　 My Impact</nav><b>⌕　♧　 JR</b></header>
      <main>
        <div class="scene16-welcome"><div><h3>Welcome back, Joyce! 👋</h3><p>Here’s what’s happening on Bema Hub today.</p></div><button>My Dashboard　→</button></div>
        <strong class="scene16-section-label">TODAY ON BEMA HUB</strong>
        <div class="scene16-metrics">${metrics.map((item) => `<article>${icon(item.icon)}<small>${item.title}</small><strong>${item.value}</strong><span>${item.copy}</span><a>View details　→</a></article>`).join("")}</div>
        <div class="scene16-lower-grid">
          <section><header><strong>UPCOMING EVENTS</strong><a>View calendar →</a></header>${[["22","Open Enrollment Kickoff LIVE","12:00 PM ET"],["24","Creator Community Q&A","3:00 PM ET"],["27","Loop Activity Masterclass","1:00 PM ET"]].map(([day,title,time]) => `<article><time><small>MAY</small><b>${day}</b></time><div><strong>${title}</strong><span>${time}</span></div><em>${day === "22" ? "LIVE" : "RSVP"}</em></article>`).join("")}</section>
          <section><header><strong>FEATURED CAMPAIGNS</strong><a>View all →</a></header>${[["Music for Change","Amplify voices. Inspire change.","72%"],["Creativity for Good","Create. Connect. Contribute.","58%"],["Community Builders","Stronger communities. Together.","64%"]].map(([title,copy,value], index) => `<article><i class="scene16-campaign-art art-${index}"></i><div><strong>${title}</strong><span>${copy}</span><progress value="${value.slice(0,-1)}" max="100"></progress></div><b>${value}</b></article>`).join("")}</section>
        </div>
      </main>
    </div>
  </div>`;
}

function renderScene17() {
  const campaigns = [
    ["Sound of Tomorrow", "NovaWave", "FEATURED", "0"],
    ["Stage to Spotlight", "Echo Collective", "LIVE", "1"],
    ["Move the Culture", "Flow Studio", "", "2"],
    ["Frame the Future", "Visionary Lab", "", "3"],
    ["Beat Builders", "Loop Makers", "", "4"],
    ["Bright Ideas", "Create Forward", "", "5"],
  ];
  return `<div class="scene17-campaign-browser">
    <section class="scene17-campaigns"><header>${icon("star")}<strong>Featured Campaigns</strong><nav><b>All</b><span>Trending</span><span>New</span><span>Ending Soon</span></nav><label>⌕　Search campaigns...</label></header>
      <div class="scene17-card-grid">${campaigns.map(([title, creator, badge, art]) => `<article><div class="scene17-art art-${art}">${badge ? `<b>${badge}</b>` : ""}</div><h3>${title}</h3><p>by ${creator}</p><footer><span>Participation Level</span><i>${icon("people")}${icon("people")}${icon("people")}</i></footer></article>`).join("")}</div>
      <a class="scene17-view-all">View all campaigns　→</a>
    </section>
    <aside class="scene17-activity"><header>${icon("signal")}<div><h3>Loop Activity</h3><p>Real-time updates</p></div></header>
      ${[["people","218 Builders","joined Stage to Spotlight","2m ago"],["play","New Loop Activity","added to Beat Builders","5m ago"],["trophy","Challenge Completed","in Move the Culture","12m ago"],["user","New Builder","joined Bema Hub","18m ago"]].map(([itemIcon,title,copy,time]) => `<article>${icon(itemIcon)}<div><strong>${title}</strong><span>${copy}</span><small>${time}</small></div></article>`).join("")}
      <footer><strong>Ready to participate?</strong><span>Find a campaign that moves you.</span><button>Explore Campaigns</button></footer>
    </aside>
  </div>`;
}

function renderScene18() {
  return `<div class="scene18-detail-panel">
    <section class="scene18-creator"><div class="scene18-creator-photo">JV</div><div><h3>New Single Launch: Echoes</h3><strong>✓ Jaylen Vibes</strong><span>Music Creator</span><p>♫ R&amp;B Artist　│　♙ 128K Community　│　⌖ Atlanta, GA</p></div></section>
    <section class="scene18-purpose">${icon("target")}<div><h3>Campaign Purpose</h3><p>Support the launch of my new single “Echoes” and help me amplify real music to real listeners.</p></div></section>
    <section class="scene18-info assets">${icon("gift")}<div><h3>Participation Assets</h3><ul><li>Early song preview</li><li>Exclusive behind-the-scenes</li><li>Personalized shoutout</li><li>Limited edition artwork</li><li>VIP listening session access</li></ul></div></section>
    <section class="scene18-info proof">${icon("shield")}<div><h3>Creator Proof &amp; Updates</h3><ul><li>Verified creator account</li><li>Previous campaigns delivered</li><li>Regular updates &amp; transparency</li><li>Real engagement, real results</li></ul><strong>✓　100% Delivery Rate</strong></div></section>
    <section class="scene18-info levels">${icon("crown")}<div><h3>Access Levels</h3><p>${icon("people")} Participation Level</p><p>${icon("star")} VIP Access</p><p>${icon("crown")} Signature VIP</p></div></section>
    <footer><b>i</b>Review the purpose, assets, access levels, and creator proof to see the <strong>creative value</strong> before you join.</footer>
  </div>`;
}

function renderScene25(config) {
  return `<div class="scene25-trust-panel">
    <section class="scene25-checklist">${config.items.map((item) => `<article data-control-cue="${item.cue}">${icon(item.icon)}<div><h3>${item.title}</h3><p>${item.copy}</p></div><b>✓</b></article>`).join("")}</section>
    <aside><h3>PROOF &amp; VERIFICATION</h3>
      <article>${icon("shield")}<div><strong>Verified by <em>LoopLock</em></strong><p>Secure and trusted verification.</p></div></article>
      <article>${icon("document")}<div><strong>Audited Activity <em>Logs</em></strong><p>Transparent tracking from start to finish.</p></div></article>
      <article>${icon("people")}<div><strong><em>Community Accountability</em></strong><p>Together we build trust and impact.</p></div></article>
    </aside>
  </div>`;
}

function renderScene29() {
  return `<div class="scene29-proof-board">
    <section class="scene29-stories"><h3>RECENT CREATOR STORIES</h3><div>${[["MJ","Maya J.","Wrapped up the brand anthem! On to motion graphics next.","24"],["TL","Tariq L.","Finalizing the campaign edits. Excited to share the final cut!","31"],["AR","Aisha R.","Delivering social assets today! Stay tuned for live results.","27"]].map(([initials,name,copy,likes],i)=>`<article><header><b>${initials}</b><strong>${name}</strong><small>${i*3+2}h ago</small></header><p>${copy}</p><i class="proof-thumb art-${i}"></i><span>♥ ${likes}</span></article>`).join("")}</div></section>
    <section class="scene29-updates"><h3>RECENT PROOF UPDATES</h3>${["Campaign video draft delivered","Social post set v2 complete","Motion graphics preview","Influencer clips batch 1"].map((x,i)=>`<article><i class="proof-thumb art-${i}"></i><div><strong>${x}</strong><small>${i*2+2}h ago</small></div><b>✓</b></article>`).join("")}</section>
    <section class="scene29-status"><h3>DELIVERY STATUS</h3>${[["Campaign Video",100,"Delivered"],["Social Assets",85,"In Review"],["Influencer Clips",60,"In Progress"]].map(([name,value,status])=>`<article><header><span>${name}</span><b>${value}%</b><em>${status}</em></header><progress value="${value}" max="100"></progress></article>`).join("")}</section>
    <section class="scene29-spotlight"><h3>CREATOR SPOTLIGHT</h3><div><b>JK</b><strong>Jamal K.<small>Video Producer</small></strong></div><p>“Bema Hub makes it easy to collaborate, share updates, and deliver real impact.”</p><span>★★★★★</span></section>
    <section class="scene29-highlights"><h3>PROGRESS HIGHLIGHTS</h3><p>${icon("chart")}<strong>14<small>Projects Active</small></strong></p><p>${icon("people")}<strong>38<small>Creators Engaged</small></strong></p><p>${icon("check")}<strong>92%<small>Deliverables On Track</small></strong></p></section>
  </div>`;
}

function renderScene30(config) {
  const metrics=config.items.slice(0,3);
  return `<div class="scene30-impact-board">
    <section class="scene30-metrics">${metrics.map(item=>`<article>${icon(item.icon)}<div><small>${item.title}</small><strong>${item.value}</strong><span>${item.copy}</span></div></article>`).join("")}</section>
    <section class="scene30-impact-status">${icon("award")}<div><small>RECOGNIZED IMPACT STATUS</small><h3>On Track!</h3><p>You’re building meaningful impact.<br />Keep going!</p></div></section>
    <section class="scene30-tier"><div><small>BUILDER TIER PROGRESS</small><h3>Silver Builder</h3><strong>2,460 / 5,000 pts</strong><progress value="49" max="100"></progress></div>${icon("shield")}<b>49%</b></section>
    <section class="scene30-activity"><header><strong>RECENT ACTIVITY</strong><a>View all</a></header><div><p>${icon("link")}<span>LoopLink shared<small>10m ago</small></span></p><p>${icon("lock")}<span>LoopLock qualified<small>1h ago</small></span></p><p>${icon("star")}<span>Impact recognized<small>3h ago</small></span></p></div></section>
  </div>`;
}

function renderScene31(config) {
  return `<div class="scene31-progress-board">
    <section class="scene31-tiers">${config.items.map((item,i)=>`<article class="${i===2?"current":""}">${icon(item.icon)}<strong>${item.title}</strong></article>`).join("")}</section>
    <section class="scene31-progress"><header><strong>YOUR PROGRESS</strong><b>CURRENT POSITION</b></header><div><span></span></div><footer><i>0%</i><i>25%</i><i>50%</i><i>75%</i><i>100%</i></footer></section>
    <section class="scene31-milestones"><h3>LOOPLOCK MILESTONES</h3><div>${[["1","Completed"],["3","Completed"],["7","Completed"],["15","In Progress"],["30","Next Target"]].map(([value,status],i)=>`<article>${icon(i<3?"link":"lock")}<strong>${value} LoopLock${value==="1"?"":"s"}</strong><span>${status}</span></article>`).join("")}<aside><small>NEXT TARGET</small><strong>15</strong><span>LoopLocks<br />to reach Partner</span></aside></div></section>
  </div>`;
}

function renderFeatureCards(id, config) {
  return `<div class="reference-feature-grid columns-${config.columns ?? config.items.length}">
    ${config.items
      .map(
        (item, index) => `
      <article class="reference-feature-card tone-${item.tone}" data-control-cue="${item.cue}" style="--item-index:${index}">
        <div class="reference-card-icon">${icon(item.icon)}</div>
        <h3>${item.title}</h3><p>${item.copy}</p>
        ${item.value ? `<strong class="reference-pill">${item.value}</strong>` : ""}
        <span class="reference-card-link">${id === "09" ? "Explore program" : id === "19" ? "View what is included" : "Learn more"} <b>→</b></span>
      </article>`,
      )
      .join("")}
  </div>`;
}

function renderFlow(config, id) {
  return `<div class="reference-flow reference-flow-${id}">
    <div class="reference-flow-line"></div>
    ${config.items
      .map(
        (item, index) => `
      <article class="reference-flow-step tone-${item.tone}" data-control-cue="${item.cue}" style="--item-index:${index}">
        <strong class="reference-flow-index">${item.value}</strong>
        <div class="reference-flow-icon">${icon(item.icon)}</div>
        <h3>${item.title}</h3><p>${item.copy}</p>
        ${index < config.items.length - 1 ? '<span class="reference-flow-arrow">→</span>' : ""}
      </article>`,
      )
      .join("")}
  </div>`;
}

function renderLadder(id, config) {
  const horizontal = id !== "12";
  if (horizontal)
    return `<div class="reference-tier-track">
    <div class="reference-tier-line"><span></span></div>
    ${config.items
      .map(
        (item, index) => `
      <article class="reference-tier tone-${item.tone}" data-control-cue="${item.cue}" style="--item-index:${index}">
        <div class="reference-tier-medal">${icon(item.icon)}</div><strong>${item.title}</strong><span>${item.copy}</span>
        <small>${item.value}${id === "31" ? " MILESTONE" : ""}</small>
      </article>`,
      )
      .join("")}
  </div>`;

  return `<div class="reference-access-layout">
    <div class="reference-access-intro"><strong>ACCESS<br />LEVELS</strong><p>The vertical climb within the campaign.</p><span>Choose the experience that fits you.</span></div>
    <div class="reference-access-ladder">
      ${config.items
        .map(
          (
            item,
            index,
          ) => `<article class="reference-access-row tone-${item.tone}" data-control-cue="${item.cue}" style="--item-index:${index}">
        <strong class="reference-access-rank">${item.value}</strong><div>${icon(item.icon)}</div><section><h3>${item.title}</h3><p>${item.copy}</p><small>${index === 0 ? "CORE ACCESS" : index === 1 ? "DEEPER EXPERIENCE" : "DEEPEST ACCESS"}</small></section>
      </article>`,
        )
        .join("")}
    </div>
  </div>`;
}

function renderStatus(id, config) {
  return `<div class="reference-status-panel">
    <div class="reference-status-rail"></div>
    ${config.items
      .map(
        (item, index) => `
      <article class="reference-status-row tone-${item.tone}" data-control-cue="${item.cue}" style="--item-index:${index}">
        <span class="reference-status-dot">${icon(item.icon)}</span>
        <div><h3>${item.title}</h3><p>${item.copy}</p></div>
        <strong>${item.value}</strong>
        <span class="reference-status-check">${id === "23" && index === 3 ? "×" : "✓"}</span>
      </article>`,
      )
      .join("")}
  </div>`;
}

function renderAppScene(id, config) {
  return `<div class="reference-app-shell app-scene-${id}">
    <div class="reference-app-topbar"><span class="reference-app-logo">bema<span>Hub</span></span><label>Search Bema Hub</label><i></i><i></i><b>JR</b></div>
    <nav class="reference-app-sidebar"><strong>Overview</strong><span>Home</span><span>Campaigns</span><span>Events</span><span>Changemakers</span><span>My Impact</span><small>ACCOUNT</small><span>Messages</span><span>Settings</span></nav>
    <main class="reference-app-content">${renderAppContent(id, config)}</main>
  </div>`;
}

function renderAppContent(id, config) {
  if (id === "17")
    return `<div class="app-title-row"><div><small>DISCOVER</small><h3>Campaigns</h3></div><button>Explore all</button></div><div class="app-filter-row"><span>All campaigns</span><span>Music</span><span>Community</span><span>Creative</span></div><div class="campaign-card-grid">${config.items
      .slice(0, 3)
      .map(
        (item, i) =>
          `<article class="campaign-mini tone-${item.tone}"><div class="campaign-art art-${i}">${icon(item.icon)}<b>${item.value}</b></div><small>CREATOR CAMPAIGN</small><h4>${item.title}</h4><p>${item.copy}</p><div class="mini-progress"><span style="width:${62 + i * 12}%"></span></div><footer><span>${42 + i * 18}% joined</span><button>View campaign</button></footer></article>`,
      )
      .join("")}</div>`;
  if (id === "18")
    return `<div class="campaign-detail-hero"><div class="campaign-cover">${icon("music")}<span>NEW SINGLE</span></div><section><small>FEATURED CAMPAIGN</small><h3>${config.items[0].title}</h3><p>${config.items[0].copy}</p><div class="creator-line"><b>JV</b><span>Jaylen Vibes<br /><small>Verified creator</small></span></div><button>Choose access level</button></section></div><div class="detail-tabs"><b>Overview</b><span>Participation assets</span><span>Updates</span><span>Community</span></div><div class="detail-panel-grid">${config.items
      .slice(1)
      .map(
        (item) =>
          `<article><div>${icon(item.icon)}<h4>${item.title}</h4></div><p>${item.copy}</p><strong>${item.value}</strong></article>`,
      )
      .join("")}</div>`;
  if (id === "26")
    return `<div class="app-title-row"><div><small>UPCOMING</small><h3>Events</h3></div><button>View calendar</button></div><div class="event-feature"><div><small>FEATURED EVENT</small><h3>${config.items[0].title}</h3><p>${config.items[0].copy}</p><button>Register now</button></div><time><b>28</b>MAY</time></div><div class="event-list">${config.items
      .slice(1)
      .map(
        (item, i) =>
          `<article><time><b>${30 + i}</b>MAY</time><div><small>${item.value}</small><h4>${item.title}</h4><p>${item.copy}</p></div><button>View details</button></article>`,
      )
      .join("")}</div>`;
  if (id === "27")
    return `<div class="event-detail-banner"><section><small>VIRTUAL EVENT · MAY 28</small><h3>${config.items[0].title}</h3><p>${config.items[0].copy}</p><div><span>10:00 AM – 3:30 PM</span><span>Bema Hub Virtual Stage</span></div></section>${renderQrCard("Register for free")}</div><div class="event-detail-grid">${config.items
      .slice(1)
      .map(
        (item) =>
          `<article><header>${icon(item.icon)}<h4>${item.title}</h4><strong>${item.value}</strong></header><p>${item.copy}</p><button>${item.title === "Register or Join" ? "Join the event" : "View full details"}</button></article>`,
      )
      .join("")}</div>`;
  if (id === "29")
    return `<div class="app-title-row"><div><small>COMMUNITY DELIVERY</small><h3>Creator stories & proof</h3></div><button>View all updates</button></div><div class="story-layout"><section class="story-feed">${config.items
      .slice(0, 3)
      .map(
        (item, i) =>
          `<article><b class="story-avatar">${["MA", "TK", "AS"][i]}</b><div><h4>${item.title}</h4><p>${item.copy}</p><div class="proof-thumbs"><i></i><i></i><i></i></div></div><strong>${item.value}</strong></article>`,
      )
      .join(
        "",
      )}</section><aside><small>CREATOR SPOTLIGHT</small><div class="spotlight-avatar">JK</div><h4>Jamal K.</h4><p>Video Producer</p><div class="progress-ring">92%</div><span>Deliverables on track</span></aside></div>`;
  if (id === "30")
    return `<div class="app-title-row"><div><small>WELCOME BACK, JOYCE</small><h3>My Impact</h3></div><button>Download report</button></div><div class="impact-metric-row">${config.items
      .slice(0, 3)
      .map(
        (item) =>
          `<article>${icon(item.icon)}<div><small>${item.title}</small><strong>${item.value}</strong><span>${item.copy}</span></div></article>`,
      )
      .join(
        "",
      )}</div><div class="impact-dashboard-grid"><article class="impact-chart"><header><div><small>LOOP ACTIVITY</small><h4>Activity growth</h4></div><strong>+18.4%</strong></header><div class="bar-chart">${[38, 54, 44, 70, 58, 86, 76, 94].map((v) => `<i style="height:${v}%"></i>`).join("")}</div><footer><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span></footer></article><article class="tier-progress-card"><small>BUILDER TIER</small><h4>Silver Builder</h4><div class="progress-ring">49%</div><p>2,460 / 5,000 points</p><button>View progress</button></article></div>`;
  return `<div class="app-title-row"><div><small>WELCOME BACK, JOYCE</small><h3>Home Dashboard</h3></div><button>View profile</button></div><div class="home-metrics">${config.items
    .slice(0, 3)
    .map(
      (item) =>
        `<article>${icon(item.icon)}<div><strong>${item.value}</strong><span>${item.title}</span><small>${item.copy}</small></div></article>`,
    )
    .join(
      "",
    )}</div><div class="home-dashboard-grid"><section><header><h4>Featured campaigns</h4><button>View all</button></header><div class="featured-campaigns">${["Music for Change", "Creativity for Good", "Community Builders"].map((name, i) => `<article><div class="campaign-thumb art-${i}">${icon(["music", "heart", "people"][i])}</div><div><small>FEATURED</small><h5>${name}</h5><span>${64 + i * 8}% joined</span></div></article>`).join("")}</div></section><aside><header><h4>Upcoming events</h4></header><article><time><b>28</b>MAY</time><div><strong>Open Enrollment Kickoff</strong><span>10:00 AM · Virtual</span></div></article><article><time><b>30</b>MAY</time><div><strong>Creator Community Q&A</strong><span>2:00 PM · Live</span></div></article></aside></div>`;
}

function renderAssets(config) {
  return `<div class="reference-assets-panel"><header><span>${icon("lock")}</span><div><small>YOUR PARTICIPATION PACKAGE</small><h3>Participation Assets Delivered</h3></div><strong>5 / 5 UNLOCKED</strong></header><div class="asset-list">${config.items.map((item, index) => `<article data-control-cue="${item.cue}"><span>${icon(item.icon)}</span><div><h4>${item.title}</h4><p>${item.copy}</p></div><small>${index === 0 ? "READY TO PLAY" : index === 3 ? "VIEW SCHEDULE" : "OPEN ASSET"}</small><b>✓</b></article>`).join("")}</div></div>`;
}

function renderTools(config) {
  return `<div class="reference-tools-layout"><section>${config.items
    .slice(0, 2)
    .map(
      (item, index) =>
        `<article class="tool-card tone-${item.tone}" data-control-cue="${item.cue}"><header>${icon(item.icon)}<div><small>PERSONAL TOOL</small><h3>${item.title}</h3></div><strong>ACTIVE</strong></header><div class="tool-value"><code>${item.copy}</code><button>${index ? "Reveal code" : "Copy link"}</button></div><footer><span>${item.value}</span><i></i><span>Ready to share</span></footer></article>`,
    )
    .join(
      "",
    )}</section><aside><header>${icon("people")}<div><small>LIVE</small><h3>Loop Activity</h3></div><strong>12 JOINED</strong></header>${["Alex joined via LoopLink", "Taylor joined via LoopCode", "Jamie joined via LoopLink", "Morgan activated a code"].map((text, i) => `<article><b>${["A", "T", "J", "M"][i]}</b><span>${text}<small>${i + 1} min ago</small></span><i>✓</i></article>`).join("")}</aside></div>`;
}

function renderImpactExplainer(config) {
  return `<div class="impact-explainer"><section><small>RECOGNIZED</small><strong>IMPACT</strong><span>EXPLAINED</span><div class="impact-orbit">${icon("heart")}<i></i><i></i></div><p>Acknowledging real value<br />created through verified movement.</p></section><div class="impact-points">${config.items.map((item) => `<article data-control-cue="${item.cue}"><strong>${item.value}</strong><span>${icon(item.icon)}</span><div><h3>${item.title}</h3><p>${item.copy}</p></div></article>`).join("")}</div></div>`;
}

function renderProfiles(config) {
  return `<div class="profile-directory">${config.items
    .map(
      (item, index) =>
        `<article class="profile-card" data-control-cue="${item.cue}"><div class="profile-avatar avatar-${index}">${item.title
          .split(" ")
          .map((word) => word[0])
          .join(
            "",
          )}</div><section><small>CHANGEMAKER</small><h3>${item.title}</h3><p>${item.copy}</p><span>● Verified profile</span></section><footer><strong>${item.value}</strong><small>IMPACT</small><button>View story</button></footer></article>`,
    )
    .join("")}</div>`;
}

function renderLeaderboard(config) {
  return `<div class="leaderboard-layout"><section><header><div><small>TOP REFERRERS</small><h3>Community leaders</h3></div><strong>LOOPLOCKS</strong></header>${config.items
    .slice(0, 5)
    .map(
      (item, index) =>
        `<article data-control-cue="${item.cue}"><b class="rank">${index + 1}</b><span class="leader-avatar">${item.title.slice(0, 2).toUpperCase()}</span><div><h4>${item.title}</h4><p>${item.copy}</p></div><strong>${item.value}</strong><i>${index < 2 ? "↑" : "—"}</i></article>`,
    )
    .join(
      "",
    )}</section><aside><small>WEEKLY MOMENTUM</small><strong>+24%</strong><p>Community movement this week</p><div class="momentum-chart">${[35, 48, 42, 67, 58, 81, 94].map((v) => `<i style="height:${v}%"></i>`).join("")}</div><dl><div><dt>1,248</dt><dd>Referrals</dd></div><div><dt>2,976</dt><dd>LoopLinks</dd></div><div><dt>4,532</dt><dd>Actions</dd></div></dl></aside></div>`;
}

function renderFaq(config) {
  return `<div class="faq-layout"><section><span class="faq-mark">?</span><h3>${config.utility ? "Ask us anything." : "Everything you need to know."}</h3><p>${config.utility ? "Drop your question in the live chat and the team will answer it." : "Clear answers before you choose your next step."}</p><button>${config.utility ? "LIVE CHAT IS OPEN" : "VISIT HELP CENTER"}</button></section><div class="faq-list">${config.items.map((item, index) => `<article data-control-cue="${item.cue}"><span>${String(index + 1).padStart(2, "0")}</span><div><h3>${item.title}</h3><p>${item.copy}</p></div><b>+</b></article>`).join("")}</div></div>`;
}

function renderLiveAction(id, config) {
  if (id === "37")
    return `<div class="enrollment-progress-layout"><section><div class="live-metric-grid">${config.items
      .slice(0, 4)
      .map(
        (item) =>
          `<article>${icon(item.icon)}<strong>${item.value}</strong><span>${item.title}</span><small>${item.copy}</small></article>`,
      )
      .join(
        "",
      )}</div><div class="overall-progress"><header><div><small>OVERALL PROGRESS</small><h3>Enrollment movement</h3></div><strong>68%</strong></header><div><span></span></div><footer><span>0</span><span>Today’s goal: 350</span></footer></div><div class="live-feed"><header><span>● LIVE ACTIVITY</span><strong>JUST NOW</strong></header>${["Amina joined as a Builder", "Samuel activated LoopLink", "Joyce chose VIP Access"].map((x, i) => `<article><b>${["A", "S", "J"][i]}</b><span>${x}<small>${i + 1} min ago</small></span><i>✓</i></article>`).join("")}</div></section>${renderQrCard("Scan to enroll")}</div>`;
  return `<div class="reference-cta-layout"><aside>${renderQrCard(id === "34" ? "Scan to Join Now" : "Stay connected")}</aside><section><small>${id === "34" ? "ENROLLMENT IS OPEN" : "THANK YOU FOR JOINING"}</small><h3>${id === "34" ? "Choose how you want to participate." : "The loop continues."}</h3><div class="cta-option-grid">${config.items.map((item) => `<article data-control-cue="${item.cue}"><span>${icon(item.icon)}</span><div><h4>${item.title}</h4><p>${item.copy}</p></div><button>${item.value}</button></article>`).join("")}</div><footer><span>Secure enrollment</span><span>Instant access</span><span>Community support</span></footer></section></div>`;
}
