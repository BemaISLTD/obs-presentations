// Scene 01 owns these design primitives so it can be edited independently.
const ASSET_PATHS = {
  logos: {
    wordmark: "/full-logo.png",
    mark: "/logo.png",
  },
  qr: {
    join: "/assets/qr/main-join-qr.png",
  },
  video: {
    slide01Loop: "/assets/video/slide01-bg-loop.mp4",
  },
  backgrounds: {
    slide01: "/assets/storyboards/backgrounds/slide01-bg.png",
  },
};

const LOWER_THIRD_ROTATION_SECONDS = 5;
const LOWER_THIRD_MESSAGES = [
  "Where are you building from?",
  "What if your network could become your advantage?",
  "Are you building alone when you could be building with support?",
  "What kind of impact do you want your voice to create?",
  "Who already trusts your voice?",
  "How much stronger could a project become with community behind it?",
  "What project would you be proud to help carry?",
  "What could move further because you shared it?",
  "Get ready to see how Bema Hub works.",
  "What would it mean to turn belief into momentum?",
  "Are you maximizing your connections or overlooking them?",
  "What if the people you need are closer than you think?",
  "How many people trust you more than you realize?",
  "What would change if your network became a source of strength?",
  "What if your story could become someone else's proof?",
  "What if support could be relational, not transactional?",
  "Are you ready to fuel a project?",
  "What if your reach could help an artist move further?",
  "Bema Hub turns shared belief into collective momentum.",
  "Are you ready for action?",
  "Are you ready to move from interest to participation?",
  "What if the right question opens the right conversation?",
  "What would happen if you shared naturally with people who trust you?",
  "Are you ready to help a project become a movement?",
  "What if your next step is simpler than you think?",
  "Your voice carries trust. What will you do with it?",
  "How would your future self want you to respond in this moment?",
  "No pressure. No minimums. Grow at your own pace.",
  "Scan when you're ready to begin.",
].map((question, index) => ({
  id: String(index + 1).padStart(2, "0"),
  question,
}));

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

export const scene01 = {
  presenterZone: "none",

  renderUnderlay(context) {
    const waveBars = createWaveBars(56);
    const eqBars = createEqBars(32);
    const particles = createParticles(24);
    const statIcons = ["AC", "BE", "EL", "GQ"];

    const metricCards = context.metrics.countdown.stats
      .map(
        (item, index) => `
          <article class="bema-card glass-card stat-card scene01-stat-card soft-glow rounded-card border border-sky-200/60 bg-white/85 shadow-card backdrop-blur-xl" style="--delay:${index * 0.35}s">
            <div class="scene01-stat-icon" aria-hidden="true">${statIcons[index] ?? "BH"}</div>
            <div class="scene01-stat-copy">
              <span class="eyebrow">${item.label}</span>
              <strong>${item.value}</strong>
              <p class="muted">${item.detail}</p>
            </div>
          </article>
        `,
      )
      .join("");

    const firstPrompt = LOWER_THIRD_MESSAGES[0] ?? {
      id: "01",
      question: "Where are you building from today?",
      subtext: "Drop your city or country in chat.",
      placement: "lower_right",
      animation_in: "fadeUp",
      animation_out: "fadeDown",
      hold_effect: "floatSlow",
      easing: "easeOutCubic",
      animation_in_duration_ms: 650,
      animation_out_duration_ms: 500,
      background_cue: "soft_cyan_pulse",
      qr_visibility: "visible",
      ticker_override: "",
      api_trigger: "",
    };

    return sceneMarkup(`
      <section class="scene scene01 absolute inset-0 overflow-hidden font-sans text-bema-navy">
        <div class="scene01-atmosphere" aria-hidden="true">
          <div class="scene01-stage-aura"></div>
          <div class="scene01-light-streak"></div>
          <div class="scene01-wave-track">${waveBars}</div>
          <div class="scene01-equalizer">${eqBars}</div>
          <div class="particle-layer scene01-particles">${particles}</div>
        </div>

        <header class="scene01-top">
          <div class="scene01-brand scene-brand-lockup">
            <img class="scene-brand-mark" src="/logo.png" alt="" data-asset-image />
            <div class="scene01-wordmark" data-asset-wrapper aria-label="bemaHub">
              <img src="${ASSET_PATHS.logos.wordmark}" alt="bemaHub wordmark" data-asset-image />
              <strong class="scene01-wordmark-fallback"><span class="scene01-wordmark-bema">bema</span><span class="scene01-wordmark-hub">Hub</span></strong>
            </div>
          </div>
          <div class="live-badge scene01-live-badge">LIVE</div>
        </header>

        <div class="scene01-layout">
          <div class="scene01-left-column">
            <section class="scene01-stats-grid">
              ${metricCards}
            </section>
          </div>

          <section class="scene01-center-column">
            <div class="scene01-heading">
              <h2 class="stage-title">
                <span>BEMA HUB</span>
                <span>OPEN ENROLLMENT</span>
                <span>2026</span>
              </h2>
              <p class="stage-subtitle">Stronger benefits. Built together.</p>
            </div>

            <section class="scene01-countdown-hero" aria-label="Countdown hero">
              <p class="scene01-countdown-label">We start in</p>
              <div class="countdown-clock" data-countdown-duration="${context.metrics.countdown.durationSeconds ?? 600}" data-time="10:00">
                <span class="clock-segment" data-clock-minutes>10</span>
                <span class="clock-divider">:</span>
                <span class="clock-segment" data-clock-seconds>00</span>
              </div>
            </section>
          </section>

          <aside class="scene01-right-column">
            <section class="bema-card glass-card qr-card soft-glow scene01-qr-card">
              <div class="scene01-qr-brand" data-asset-wrapper>
                <img src="${ASSET_PATHS.logos.mark}" alt="bemaHub compact mark" class="scene01-qr-mark" data-asset-image />
                <span class="scene01-qr-mark-fallback" aria-hidden="true">BH</span>
              </div>
              <h3 class="scene01-qr-title">Scan to join the conversation</h3>
              <div class="qr-row">
                <div class="qr-visual">
                  <img src="${ASSET_PATHS.qr.join}" alt="Scan this QR to join" data-asset-image />
                  <span class="scene01-qr-code-logo" aria-hidden="true">
                    <img src="${ASSET_PATHS.logos.mark}" alt="" />
                  </span>
                </div>
              </div>
              <div class="pill-row scene01-qr-pills">
                <span class="pill-label tag">${context.metrics.countdown.qr.codeLabel}</span>
                <span class="pill-label tag" data-live-builders-count>Builders Live</span>
              </div>
            </section>
          </aside>
        </div>

        <section
          class="bema-card glass-card question-card scene01-question-wrap placement-${normalizeToken(firstPrompt.placement)} anim-in-${normalizeToken(firstPrompt.animation_in)} anim-out-${normalizeToken(firstPrompt.animation_out)} hold-${normalizeToken(firstPrompt.hold_effect)} ease-${normalizeToken(firstPrompt.easing)}"
          data-countdown-question
          style="--in-duration:${firstPrompt.animation_in_duration_ms}ms;--out-duration:${firstPrompt.animation_out_duration_ms}ms"
        >
          <article class="countdown-question is-visible">
            <svg class="scene01-question-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-5.25 4.2A.75.75 0 0 1 3.5 18.6V5.5H4Z" />
              <path d="M8 8h8M8 11h5" />
            </svg>
            <p data-question-text class="text-3xl">${firstPrompt.question}</p>
          </article>
        </section>
      </section>
    `);
  },

  renderForeground(context) {
    const items = context.ticker?.scene01?.length
      ? context.ticker.scene01
      : (context.ticker?.items ?? []);
    return sceneMarkup(
      `<section class="scene-foreground scene01-foreground">${renderBroadcastTicker(items)}</section>`,
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

  setup(root, context) {
    const countdownRoot = root.querySelector("[data-countdown-duration]");
    const minuteNode = countdownRoot?.querySelector("[data-clock-minutes]");
    const secondNode = countdownRoot?.querySelector("[data-clock-seconds]");
    const questionWrap = root.querySelector("[data-countdown-question]");
    const questionPanel = questionWrap?.querySelector(".countdown-question");
    const questionTextNode = root.querySelector("[data-question-text]");
    const questionIndexNode = root.querySelector("[data-question-index]");
    const questionSubtextNode = root.querySelector("[data-question-subtext]");
    const questionWindowNode = root.querySelector("[data-question-window]");
    const qrCard = root.querySelector(".scene01-qr-card");
    const sceneRoot = root.querySelector(".scene01");
    const tickerTrack = root.querySelector(".scene01-ticker .ticker-track");
    const assetImages = root.querySelectorAll("[data-asset-image]");

    if (!countdownRoot || !minuteNode || !secondNode) {
      return;
    }

    assetImages.forEach((image) => {
      image.addEventListener(
        "error",
        () => {
          const wrapper = image.closest("[data-asset-wrapper]");
          wrapper?.classList.add("is-missing");
        },
        { once: true },
      );
    });

    const totalDuration = Number(
      countdownRoot.dataset.countdownDuration || 600,
    );
    const prompts = LOWER_THIRD_MESSAGES;
    // The deadline is anchored once and kept on window, so replaying a cue or
    // re-running setup resumes the same countdown instead of restarting it —
    // which is what made the scene look like it was reloading itself.
    if (!window.__bemahubCountdownEndsAt) {
      window.__bemahubCountdownEndsAt = Date.now() + totalDuration * 1000;
    }
    const deadline = window.__bemahubCountdownEndsAt;
    let remainingSeconds = Math.max(
      0,
      Math.round((deadline - Date.now()) / 1000),
    );
    let activePromptId = null;
    const defaultTickerMarkup = tickerTrack?.innerHTML ?? "";

    const applyPrompt = (prompt) => {
      if (
        !questionWrap ||
        !questionTextNode ||
        !prompt ||
        prompt.id === activePromptId
      ) {
        return;
      }

      const placementClass = "placement-lower_right";
      const inClass = `anim-in-${normalizeToken(prompt.animation_in || "fadeUp")}`;
      const outClass = `anim-out-${normalizeToken(prompt.animation_out || "fadeDown")}`;
      const holdClass = `hold-${normalizeToken(prompt.hold_effect || "floatSlow")}`;
      const easeClass = `ease-${normalizeToken(prompt.easing || "easeOutCubic")}`;
      const classesToRemove = [...questionWrap.classList].filter(
        (name) =>
          name.startsWith("placement-") ||
          name.startsWith("anim-in-") ||
          name.startsWith("anim-out-") ||
          name.startsWith("hold-") ||
          name.startsWith("ease-"),
      );

      questionWrap.classList.remove(...classesToRemove);
      questionWrap.classList.add(
        placementClass,
        inClass,
        outClass,
        holdClass,
        easeClass,
      );
      questionWrap.style.setProperty(
        "--in-duration",
        `${prompt.animation_in_duration_ms || 600}ms`,
      );
      questionWrap.style.setProperty(
        "--out-duration",
        `${prompt.animation_out_duration_ms || 450}ms`,
      );

      questionPanel?.classList.remove("is-visible");
      window.clearTimeout(window.__bemahubQuestionFade);
      window.__bemahubQuestionFade = window.setTimeout(() => {
        if (questionIndexNode) {
          questionIndexNode.textContent = `Prompt ${prompt.id}`;
        }
        questionTextNode.textContent = prompt.question;
        if (questionSubtextNode) {
          questionSubtextNode.textContent = prompt.subtext || "";
        }
        if (questionWindowNode) {
          questionWindowNode.textContent = `${prompt.start_time || "--:--"}-${prompt.end_time || "--:--"}`;
        }
        questionPanel?.classList.add("is-visible");
      }, 220);

      const cueClassPrefix = "bg-cue-";
      const cueClasses = [...sceneRoot.classList].filter((name) =>
        name.startsWith(cueClassPrefix),
      );
      sceneRoot.classList.remove(...cueClasses);
      sceneRoot.classList.add(
        `${cueClassPrefix}${normalizeToken(prompt.background_cue || "soft_cyan_pulse")}`,
      );

      if (qrCard) {
        qrCard.classList.remove("qr-visible", "qr-pulse", "qr-hidden");
        const qrMode = normalizeToken(prompt.qr_visibility || "visible");
        qrCard.classList.add(`qr-${qrMode}`);
      }

      if (tickerTrack) {
        if (prompt.ticker_override) {
          tickerTrack.innerHTML = `${defaultTickerMarkup}<span class="ticker-item ticker-override-item"><span class="ticker-dot">•</span>${prompt.ticker_override}</span>`;
        } else {
          tickerTrack.innerHTML = defaultTickerMarkup;
        }
      }

      if (prompt.api_trigger) {
        console.info("[Scene01 api_trigger]", prompt.api_trigger, {
          promptId: prompt.id,
        });
      }

      activePromptId = prompt.id;
    };

    const findActivePrompt = (elapsedSeconds) => {
      const promptIndex =
        Math.floor(elapsedSeconds / LOWER_THIRD_ROTATION_SECONDS) %
        prompts.length;
      return prompts[promptIndex];
    };

    const updateCountdown = () => {
      // Recomputing from the deadline keeps the clock honest even if a tick is
      // dropped while the tab is backgrounded.
      remainingSeconds = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      minuteNode.textContent = String(minutes).padStart(2, "0");
      secondNode.textContent = String(seconds).padStart(2, "0");
      countdownRoot.dataset.time = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

      const isComplete = remainingSeconds <= 0;
      countdownRoot.classList.toggle("is-complete", isComplete);

      if (isComplete) {
        // At zero the clock holds 00:00 and blinks red. Stopping the timer here
        // means nothing further re-renders or navigates on its own; moving on
        // is the operator's call.
        countdownRoot.classList.remove("pulse");
        window.clearInterval(window.__bemahubCountdown);
        return;
      }

      countdownRoot.classList.remove("pulse");
      requestAnimationFrame(() => countdownRoot.classList.add("pulse"));

      const elapsed = totalDuration - remainingSeconds;
      const activePrompt = findActivePrompt(elapsed);
      applyPrompt(activePrompt);
    };

    window.clearInterval(window.__bemahubCountdown);
    const countdownTimer = window.setInterval(updateCountdown, 1000);
    window.__bemahubCountdown = countdownTimer;
    updateCountdown();

    return () => {
      window.clearInterval(countdownTimer);
      window.clearTimeout(window.__bemahubQuestionFade);
      if (window.__bemahubCountdown === countdownTimer)
        window.__bemahubCountdown = undefined;
      window.__bemahubQuestionFade = undefined;
    };
  },
};

function createWaveBars(total) {
  return Array.from({ length: total }, (_, index) => {
    const height = 30 + ((index * 11) % 80);
    const delay = (index % 9) * 0.28;
    return `<span class="scene01-wave-bar" style="height:${height}px;animation-delay:${delay}s"></span>`;
  }).join("");
}

function createEqBars(total) {
  return Array.from({ length: total }, (_, index) => {
    const height = 32 + ((index * 7) % 110);
    const delay = (index % 12) * 0.18;
    return `<span class="scene01-eq-bar" style="height:${height}px;animation-delay:${delay}s"></span>`;
  }).join("");
}

function createParticles(total) {
  return Array.from({ length: total }, (_, index) => {
    const left = 4 + ((index * 4.1) % 92);
    const delay = (index % 7) * 0.9;
    const duration = 8 + (index % 5);
    const size = 5 + (index % 4) * 2;
    return `<span class="particle" style="left:${left}%;bottom:-20px;width:${size}px;height:${size}px;animation-delay:${delay}s;animation-duration:${duration}s"></span>`;
  }).join("");
}

function normalizeToken(value) {
  return String(value || "default")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_");
}

function renderBroadcastTicker(items) {
  const repeatedItems = [...items, ...items];
  const itemMarkup = repeatedItems
    .map(
      (item) =>
        `<span class="ticker-item"><span class="ticker-dot">•</span>${item}</span>`,
    )
    .join("");

  return `
    <div class="ticker scene01-ticker" aria-label="BemaHub live ticker">
      <span class="ticker-label">BEMA HUB LIVE</span>
      <div class="ticker-scroll-window">
        <div class="ticker-track">${itemMarkup}</div>
      </div>
    </div>
  `;
}
