const panelOrder = ["home", "index", "profile", "timeline", "skills", "projects", "gallery", "contact"];
const panels = new Map([...document.querySelectorAll("[data-panel]")].map((panel) => [panel.dataset.panel, panel]));
const navButtons = [...document.querySelectorAll(".nav-shell [data-target]")];
const targetButtons = [...document.querySelectorAll("[data-target]")];
const particleField = document.querySelector(".particle-field");
const modal = document.querySelector("#detailModal");
const modalTitle = document.querySelector("#modalTitle");
const modalText = document.querySelector("#modalText");
const modalGallery = document.querySelector("#modalGallery");
const modalClose = document.querySelector(".modal-close");
const debugTimeline = document.querySelector("#debugTimeline");
const query = new URLSearchParams(window.location.search);
const showreelMode = query.get("showreel") === "1";
const debugMode = query.get("debugTimeline") === "1";
let transitionLocked = false;
let showreelStart = 0;
let showreelFrame = 0;
let touchStartY = 0;

const image = (src, caption) => ({ src, caption });

const gallerySets = {
  core: [
    image("./assets/cg/feature-profile.jpg", "Red CG character profile data card"),
    image("./assets/brand-board.png", "Original IP information board"),
    image("./assets/hero-cutout.png", "Transparent main character asset"),
  ],
  symbols: [
    image("./assets/cg/work-card-09.jpg", "Culture symbol library in red CG presentation"),
    image("./assets/elements-board.png", "Original visual element library board"),
    image("./assets/colors-board.png", "Proportion and standard color board"),
  ],
  personality: [
    image("./assets/cg/sticker-card-happy.jpg", "Happy expression stage card"),
    image("./assets/cg/sticker-card-heart.jpg", "Heart gesture expression stage card"),
    image("./assets/cg/sticker-card-welcome.jpg", "Welcome expression stage card"),
  ],
  journey: [
    image("./assets/cg/work-card-01.jpg", "IP information board"),
    image("./assets/cg/work-card-06.jpg", "Standard expression pack board"),
    image("./assets/cg/work-card-07.jpg", "Standard action guide board"),
  ],
  emotes: [
    image("./assets/cg/sticker-card-happy.jpg", "Happy"),
    image("./assets/cg/sticker-card-surprise.jpg", "Surprise"),
    image("./assets/cg/sticker-card-curious.jpg", "Curious"),
    image("./assets/cg/sticker-card-heart.jpg", "Heart"),
    image("./assets/cg/sticker-card-think.jpg", "Thinking"),
    image("./assets/cg/sticker-card-welcome.jpg", "Welcome"),
  ],
  motion: [
    image("./assets/cg/motion-happy.gif", "Happy motion GIF"),
    image("./assets/cg/motion-surprise.gif", "Surprise motion GIF"),
    image("./assets/cg/motion-heart.gif", "Heart motion GIF"),
    image("./assets/cg/motion-think.gif", "Thinking motion GIF"),
    image("./assets/cg/motion-welcome.gif", "Welcome motion GIF"),
    image("./assets/cg/motion-recommend.gif", "Recommendation motion GIF"),
  ],
  applications: [
    image("./assets/application-01.png", "Creative product application one"),
    image("./assets/application-02.png", "Creative product application two"),
    image("./assets/application-03.png", "Creative product application three"),
    image("./assets/application-04.png", "Creative product application four"),
  ],
  boards: [
    image("./assets/brand-board.png", "IP information board"),
    image("./assets/expressions-board.png", "Standard expression pack board"),
    image("./assets/actions-board.png", "Standard action guide board"),
    image("./assets/colors-board.png", "Proportion and color standard board"),
    image("./assets/elements-board.png", "Basic element library"),
    image("./assets/poster-qr.png", "Original poster and scannable work information code"),
  ],
};

const details = {
  hero: {
    title: "TONG FAN ZAI IP FILE",
    text: "Tong Fan Zai is a Quanzhou city IP built around Maritime Silk Road culture. The character combines Erythrina flowers, sail forms, Minnan red brick color and wave patterns for city promotion, cultural products, expressions and web exhibition.",
    images: gallerySets.core,
  },
  identity: {
    title: "IDENTITY / HAISI CULTURE MESSENGER",
    text: "The character connects tradition and future through the image of a gold thread and a sail. A friendly chibi proportion lowers the threshold for cultural communication.",
    images: gallerySets.core,
  },
  symbol: {
    title: "SYMBOL SYSTEM",
    text: "The Erythrina headpiece, sail hair crown, red-gold Minnan costume, wave pattern and Nanyin-inspired details form the recognizable Tong Fan Zai visual system.",
    images: gallerySets.symbols,
  },
  persona: {
    title: "PERSONA",
    text: "Warm, clever, friendly and open. The expression pack and action guide extend those keywords into social media, exhibition guidance and digital interactions.",
    images: gallerySets.personality,
  },
  step1: {
    title: "01 CULTURE EXTRACTION",
    text: "Visual symbols are extracted from Quanzhou Maritime Silk Road culture, Erythrina flowers, lucky ships, Minnan architecture and Nanyin elements.",
    images: [
      image("./assets/elements-board.png", "Basic element library"),
      image("./assets/cg/work-card-09.jpg", "CG packaged element library"),
      image("./assets/colors-board.png", "Color and proportion standard"),
    ],
  },
  step2: {
    title: "02 CHARACTER DESIGN",
    text: "The 2.5-head chibi proportion, sail crown, Erythrina ornament and red-gold costume build a clear and expandable main IP figure.",
    images: [
      image("./assets/brand-board.png", "IP information board"),
      image("./assets/cg/work-card-01.jpg", "CG packaged information board"),
      image("./assets/hero-cutout.png", "Transparent main character asset"),
    ],
  },
  step3: {
    title: "03 EXPRESSION & ACTION",
    text: "Static stickers, motion GIFs and action standards give the character a communication system that can move across social media, guides and web UI moments.",
    images: [
      image("./assets/expressions-board.png", "Standard expression pack board"),
      image("./assets/actions-board.png", "Standard action guide board"),
      image("./assets/cg/motion-happy.gif", "Motion expression example"),
    ],
  },
  step4: {
    title: "04 WEB INTEGRATION",
    text: "The IP file, design standards, expression system and application scenarios are rebuilt as a red game-CG immersive website portfolio.",
    images: [
      image("./assets/cg/feature-projects.jpg", "Project module cover"),
      image("./assets/cg/feature-skills.jpg", "Skill module cover"),
      image("./assets/cg/feature-journey.jpg", "Journey module cover"),
    ],
  },
  "skill-expression": {
    title: "EXPRESSION COMMUNICATION",
    text: "Static stickers and motion GIFs cover greetings, joy, surprise, thinking, heart gestures and thanks, making the IP usable in everyday digital communication.",
    images: gallerySets.emotes,
  },
  "skill-brand": {
    title: "BRAND RECOGNITION",
    text: "Red-gold color, sail silhouette, rounded proportions and repeatable facial language create a stable visual identity for the character.",
    images: [
      image("./assets/colors-board.png", "Standard color values"),
      image("./assets/brand-board.png", "IP information board"),
      image("./assets/cg/work-card-08.jpg", "CG color standard card"),
    ],
  },
  "skill-guide": {
    title: "GUIDE & EXHIBITION",
    text: "Action poses can be used in exhibition panels, maps, venue signage and event guidance so the IP becomes a visual guide inside the audience path.",
    images: [
      image("./assets/pose-guide-cutout.png", "Transparent guide pose"),
      image("./assets/actions-board.png", "Original action standard board"),
      image("./assets/cg/work-card-07.jpg", "CG action standard card"),
    ],
  },
  "skill-city": {
    title: "CITY PROMOTION",
    text: "Tong Fan Zai carries Quanzhou's Maritime Silk Road story for city event pages, posters, short-video covers and tourism materials.",
    images: [
      image("./assets/hero-wide.jpg", "Quanzhou IP hero visual"),
      image("./assets/poster-qr.png", "Original poster and work information code"),
      image("./assets/cg/feature-profile.jpg", "Character profile CG card"),
    ],
  },
  "skill-product": {
    title: "CREATIVE PRODUCT",
    text: "The cultural creative system extends into canvas bags, stickers, tickets, badges, packaging, digital peripherals and exhibition merchandise.",
    images: gallerySets.applications,
  },
  "skill-motion": {
    title: "MOTION SYSTEM",
    text: "Motion GIF expressions support web transitions, video stickers, modal feedback and character interaction prompts.",
    images: gallerySets.motion,
  },
  "skill-poster": {
    title: "POSTER & INFO CODE",
    text: "The original poster and work information code connect offline exhibition materials with the online portfolio. The QR area is kept from the provided asset instead of being redrawn.",
    images: [
      image("./assets/poster-qr.png", "Original poster and information code"),
      image("./assets/poster-qr-thumb.jpg", "Poster thumbnail"),
      image("./assets/cg/work-card-05.jpg", "CG packaged application card"),
    ],
  },
  "skill-story": {
    title: "CULTURE STORY",
    text: "The narrative follows one thread connecting past and present and one sail facing the Maritime Silk Road, emphasizing city memory and future-facing communication.",
    images: [
      image("./assets/cg/feature-journey.jpg", "Design journey cover"),
      image("./assets/elements-board.png", "Culture element library"),
      image("./assets/hero-wide.jpg", "Maritime Silk Road hero visual"),
    ],
  },
  emotes: {
    title: "EXPRESSION PACK",
    text: "The expression pack is presented with transparent cutouts and red CG stage cards, avoiding plain white-background sticker dumps.",
    images: gallerySets.emotes,
  },
  motion: {
    title: "MOTION GIF PACK",
    text: "The motion GIF expressions add interaction energy and character liveliness to the web portfolio.",
    images: gallerySets.motion,
  },
  actions: {
    title: "ACTION GUIDE",
    text: "Standing, waving and guiding poses create a reusable action standard for posters, signage and short-form visual expansion.",
    images: [
      image("./assets/actions-board.png", "Complete action standard board"),
      image("./assets/pose-standing-cutout.png", "Standing pose"),
      image("./assets/pose-waving-cutout.png", "Welcome pose"),
      image("./assets/pose-guide-cutout.png", "Guide pose"),
    ],
  },
  colors: {
    title: "RED COLOR SYSTEM",
    text: "The main palette follows the Erythrina red of Tong Fan Zai, supported by Maritime Silk Road gold, deep sea teal and rice white for a red-black CG atmosphere.",
    images: [
      image("./assets/colors-board.png", "Proportion and standard color board"),
      image("./assets/cg/work-card-08.jpg", "CG packaged color card"),
      image("./assets/hero-cutout.png", "Main character color reference"),
    ],
  },
  applications: {
    title: "APPLICATION MODULES",
    text: "The application module shows how the character can expand into city promotion, event materials and cultural creative products.",
    images: gallerySets.applications,
  },
  finalWeb: {
    title: "WEB PORTFOLIO",
    text: "The final website combines screen-based navigation, red HUD layers, electronic flicker, scan lines, particles, stage galleries and image-rich modal windows.",
    images: [
      image("./assets/cg/feature-projects.jpg", "Project module"),
      image("./assets/cg/feature-profile.jpg", "Character module"),
      image("./assets/cg/feature-skills.jpg", "Skill module"),
    ],
  },
  finalIp: {
    title: "FINAL IP SYSTEM",
    text: "The Tong Fan Zai system includes character profile, base views, expression packs, action standards, proportions, color values, element library, original poster information code and web portfolio.",
    images: gallerySets.boards,
  },
};

for (let index = 1; index <= 7; index += 1) {
  details[`work${index}`] = {
    title: `WORK FILE ${String(index).padStart(2, "0")}`,
    text: "Open this file to view the original Tong Fan Zai board together with its red CG website presentation layer.",
    images: [
      image(`./assets/cg/work-card-${String(index).padStart(2, "0")}.jpg`, "Red CG packaged card"),
      gallerySets.boards[(index - 1) % gallerySets.boards.length],
      image("./assets/hero-cutout.png", "Tong Fan Zai main character"),
    ],
  };
}

details["final-web"] = details.finalWeb;
details["final-ip"] = details.finalIp;

function setActivePanel(id) {
  if (transitionLocked) return;
  const next = panels.has(id) ? id : "home";
  transitionLocked = true;
  document.body.dataset.transitioning = "1";
  panels.forEach((panel, panelId) => {
    panel.classList.toggle("active", panelId === next);
  });
  navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.target === next);
  });
  document.body.dataset.activePanel = next;
  window.setTimeout(() => {
    transitionLocked = false;
    document.body.dataset.transitioning = "0";
  }, showreelMode ? 320 : 780);
}

function openDetail(id) {
  const detail = details[id] || details.hero;
  modalTitle.textContent = detail.title;
  modalText.textContent = detail.text;
  modalGallery.replaceChildren(
    ...detail.images.map((item) => {
      const figure = document.createElement("figure");
      const img = document.createElement("img");
      img.src = item.src;
      img.alt = item.caption;
      img.loading = "lazy";
      const caption = document.createElement("figcaption");
      caption.textContent = item.caption;
      figure.append(img, caption);
      return figure;
    }),
  );
  if (typeof modal.showModal === "function") {
    modal.showModal();
  } else {
    modal.setAttribute("open", "");
  }
}

function seededRandom(seed) {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6D2B79F5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedParticles() {
  const random = seededRandom(25280630);
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 96; i += 1) {
    const dot = document.createElement("i");
    dot.style.left = `${(random() * 100).toFixed(2)}%`;
    dot.style.top = `${(random() * 100).toFixed(2)}%`;
    dot.style.animationDelay = `${(random() * 5).toFixed(2)}s`;
    dot.style.animationDuration = `${(3.2 + random() * 5.8).toFixed(2)}s`;
    fragment.appendChild(dot);
  }
  particleField.appendChild(fragment);
}

function goRelative(direction) {
  const current = document.body.dataset.activePanel || "home";
  const index = Math.max(0, panelOrder.indexOf(current));
  setActivePanel(panelOrder[(index + direction + panelOrder.length) % panelOrder.length]);
}

const showreelTimeline = [
  { time: 0, panel: "home", phase: "load", label: "00 LOAD / scan" },
  { time: 1, panel: "home", phase: "hero", label: "01 HOME / reveal" },
  { time: 4.5, panel: "home", phase: "push", label: "02 HOME / camera push" },
  { time: 7.5, panel: "home", phase: "closeup", label: "03 CLOSEUP / controller" },
  { time: 10.5, panel: "home", phase: "pullback", label: "04 HOME / pullback" },
  { time: 13, panel: "profile", phase: "profile", label: "05 PROFILE / card stack" },
  { time: 16.5, panel: "gallery", phase: "gallery", label: "06 GALLERY / film strip" },
  { time: 19.5, panel: "timeline", phase: "journey", label: "07 JOURNEY / depth scene" },
  { time: 22.5, panel: "projects", phase: "applications", label: "08 APPLICATION / playbook" },
  { time: 25.5, panel: "contact", phase: "finale", label: "09 FINALE / close" },
  { time: 27.5, panel: "home", phase: "return", label: "10 HOME / loop" },
  { time: 30, panel: "home", phase: "hero", label: "11 HOME / hold" },
];

function showreelStateAt(second) {
  let state = showreelTimeline[0];
  for (const item of showreelTimeline) {
    if (second >= item.time) state = item;
  }
  return state;
}

function applyShowreel(second) {
  const looped = second % 30;
  const state = showreelStateAt(looped);
  if (document.body.dataset.activePanel !== state.panel) {
    const wasLocked = transitionLocked;
    transitionLocked = false;
    setActivePanel(state.panel);
    transitionLocked = wasLocked;
  }
  document.body.dataset.showPhase = state.phase;
  document.body.dataset.transitioning = [0, 1, 4.5, 7.5, 10.5, 13, 16.5, 19.5, 22.5, 25.5, 27.5].some((t) => Math.abs(looped - t) < 0.55) ? "1" : "0";
  if (debugTimeline) {
    debugTimeline.querySelector("b").textContent = `${looped.toFixed(2)}s`;
    debugTimeline.querySelector("span").textContent = state.label;
    debugTimeline.querySelector("i").style.width = `${(looped / 30) * 100}%`;
  }
}

function startShowreel() {
  document.body.classList.add("showreel-mode");
  if (debugMode) document.body.classList.add("debug-timeline-on");
  showreelStart = performance.now();
  const tick = (now) => {
    const second = (now - showreelStart) / 1000;
    applyShowreel(second);
    showreelFrame = requestAnimationFrame(tick);
  };
  showreelFrame = requestAnimationFrame(tick);
}

window.__setShowreelTime = (second) => {
  document.body.classList.add("showreel-mode");
  if (debugMode) document.body.classList.add("debug-timeline-on");
  if (showreelFrame) cancelAnimationFrame(showreelFrame);
  transitionLocked = false;
  applyShowreel(second);
};

document.addEventListener("click", (event) => {
  const targetButton = event.target.closest("[data-target]");
  if (targetButton) {
    setActivePanel(targetButton.dataset.target);
    return;
  }
  const detailButton = event.target.closest("[data-detail]");
  if (detailButton) {
    openDetail(detailButton.dataset.detail);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight") {
    goRelative(1);
  }
  if (event.key === "ArrowLeft") {
    goRelative(-1);
  }
  if (event.key === "PageDown" || event.key === " " || event.key === "ArrowDown") {
    goRelative(1);
  }
  if (event.key === "PageUp" || event.key === "ArrowUp") {
    goRelative(-1);
  }
  if (event.key === "Escape" && modal.open) {
    modal.close();
  }
  if ((event.key === "Enter" || event.key === " ") && event.target.classList.contains("remote-orb")) {
    setActivePanel(event.target.dataset.target);
  }
});

document.addEventListener("wheel", (event) => {
  if (modal.open || Math.abs(event.deltaY) < 18) return;
  event.preventDefault();
  goRelative(event.deltaY > 0 ? 1 : -1);
}, { passive: false });

document.addEventListener("touchstart", (event) => {
  touchStartY = event.touches[0]?.clientY || 0;
}, { passive: true });

document.addEventListener("touchend", (event) => {
  const endY = event.changedTouches[0]?.clientY || touchStartY;
  const delta = touchStartY - endY;
  if (Math.abs(delta) > 48) goRelative(delta > 0 ? 1 : -1);
}, { passive: true });

modalClose.addEventListener("click", () => modal.close());
modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    modal.close();
  }
});

targetButtons.forEach((button) => {
  button.addEventListener("pointerenter", () => {
    button.classList.add("is-hot");
  });
  button.addEventListener("pointerleave", () => {
    button.classList.remove("is-hot");
  });
});

seedParticles();
setActivePanel("home");
transitionLocked = false;
document.body.dataset.transitioning = "0";
if (showreelMode) startShowreel();
