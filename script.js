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
    image("./assets/cg/feature-profile.jpg", "桐帆仔角色档案 CG 数据卡"),
    image("./assets/brand-board.png", "IP 信息档案原始作品板"),
    image("./assets/hero-cutout.png", "桐帆仔主形象透明素材"),
  ],
  symbols: [
    image("./assets/cg/work-card-09.jpg", "基础元素库红色 CG 包装"),
    image("./assets/elements-board.png", "基础元素库完整作品板"),
    image("./assets/colors-board.png", "比例规范与标准色值作品板"),
  ],
  personality: [
    image("./assets/cg/sticker-card-happy.jpg", "开心表情红色舞台卡"),
    image("./assets/cg/sticker-card-heart.jpg", "比心表情红色舞台卡"),
    image("./assets/cg/sticker-card-welcome.jpg", "欢迎表情红色舞台卡"),
  ],
  journey: [
    image("./assets/cg/work-card-01.jpg", "IP 信息档案"),
    image("./assets/cg/work-card-06.jpg", "标准表情包设计"),
    image("./assets/cg/work-card-07.jpg", "标准动作规范"),
  ],
  emotes: [
    image("./assets/cg/sticker-card-happy.jpg", "开心"),
    image("./assets/cg/sticker-card-surprise.jpg", "惊喜"),
    image("./assets/cg/sticker-card-curious.jpg", "好奇"),
    image("./assets/cg/sticker-card-heart.jpg", "比心"),
    image("./assets/cg/sticker-card-think.jpg", "思考"),
    image("./assets/cg/sticker-card-welcome.jpg", "欢迎"),
  ],
  motion: [
    image("./assets/cg/motion-happy.gif", "开心 GIF"),
    image("./assets/cg/motion-surprise.gif", "惊喜 GIF"),
    image("./assets/cg/motion-heart.gif", "比心 GIF"),
    image("./assets/cg/motion-think.gif", "思考 GIF"),
    image("./assets/cg/motion-welcome.gif", "欢迎 GIF"),
    image("./assets/cg/motion-recommend.gif", "推荐 GIF"),
  ],
  applications: [
    image("./assets/application-01.png", "文创应用作品一"),
    image("./assets/application-02.png", "文创应用作品二"),
    image("./assets/application-03.png", "文创应用作品三"),
    image("./assets/application-04.png", "文创应用作品四"),
  ],
  boards: [
    image("./assets/brand-board.png", "IP 信息档案"),
    image("./assets/expressions-board.png", "标准表情包设计"),
    image("./assets/actions-board.png", "标准动作规范"),
    image("./assets/colors-board.png", "比例规范与标准色值"),
    image("./assets/elements-board.png", "基础元素库"),
    image("./assets/poster-qr.png", "海报与作品信息码"),
  ],
};

const details = {
  hero: {
    title: "TONGFANZI IP FILE",
    text: "桐帆仔是以泉州海丝文化为核心的城市 IP。主形象融合刺桐花、福船风帆、闽南红砖与海浪纹样，适合城市宣传、文创产品、表情传播和网页展示。",
    images: gallerySets.core,
  },
  identity: {
    title: "IDENTITY / 海丝文化牵线小使者",
    text: "角色用牵线和扬帆两个动作意象连接古今，以亲和 Q 版造型降低文化传播门槛。",
    images: gallerySets.core,
  },
  symbol: {
    title: "SYMBOL SYSTEM / 视觉符号",
    text: "刺桐花头饰、风帆发冠、红砖服饰、海浪纹样和南音乐器共同构成桐帆仔的识别系统。",
    images: gallerySets.symbols,
  },
  persona: {
    title: "PERSONA / 性格设定",
    text: "热情、机灵、亲和、开放。表情包与动作规范围绕这些关键词展开，让角色能在社交和导视场景里自然出现。",
    images: gallerySets.personality,
  },
  step1: {
    title: "01 CULTURE EXTRACTION",
    text: "从泉州海丝、刺桐花、福船、闽南建筑和南音元素中提取可转译的视觉符号。",
    images: [image("./assets/elements-board.png", "基础元素库"), image("./assets/cg/work-card-09.jpg", "元素库 CG 包装"), image("./assets/colors-board.png", "色彩与比例规范")],
  },
  step2: {
    title: "02 CHARACTER DESIGN",
    text: "通过 2.5 头身比例、风帆发冠、刺桐花头饰和红金服饰建立可识别的主形象。",
    images: [image("./assets/brand-board.png", "IP 信息档案"), image("./assets/cg/work-card-01.jpg", "信息档案 CG 包装"), image("./assets/hero-cutout.png", "主形象透明素材")],
  },
  step3: {
    title: "03 EXPRESSION & ACTION",
    text: "表情包、动态 GIF 和动作规范让角色拥有可传播、可扩展、可动效化的内容系统。",
    images: [image("./assets/expressions-board.png", "标准表情包设计"), image("./assets/actions-board.png", "标准动作规范"), image("./assets/cg/motion-happy.gif", "动态表情示例")],
  },
  step4: {
    title: "04 WEB INTEGRATION",
    text: "将 IP 档案、作品规范、表情动作和应用场景整合为红色游戏 CG 风格网页作品集。",
    images: [image("./assets/cg/feature-projects.jpg", "项目模块封面"), image("./assets/cg/feature-skills.jpg", "技能模块封面"), image("./assets/cg/feature-journey.jpg", "流程模块封面")],
  },
  "skill-expression": {
    title: "EXPRESSION COMMUNICATION",
    text: "12 款静态表情和 12 款 GIF 动效覆盖欢迎、开心、惊喜、思考、比心、谢谢等常用传播场景。",
    images: gallerySets.emotes,
  },
  "skill-brand": {
    title: "BRAND RECOGNITION",
    text: "通过红金主色、风帆剪影、圆润头身比例和固定表情语言建立统一品牌识别。",
    images: [image("./assets/colors-board.png", "标准色值"), image("./assets/brand-board.png", "IP 信息档案"), image("./assets/cg/work-card-08.jpg", "色彩规范 CG 卡")],
  },
  "skill-guide": {
    title: "GUIDE & EXHIBITION",
    text: "动作姿态可用于展板、地图、场馆指引和活动现场导视，让角色成为观众路径中的视觉导游。",
    images: [image("./assets/pose-guide-cutout.png", "导视动作透明素材"), image("./assets/actions-board.png", "动作规范作品板"), image("./assets/cg/work-card-07.jpg", "动作规范 CG 卡")],
  },
  "skill-city": {
    title: "CITY PROMOTION",
    text: "角色承载泉州海丝叙事，可用于城市活动页面、宣传海报、短视频封面和文旅物料。",
    images: [image("./assets/hero-wide.jpg", "泉州 IP 主视觉"), image("./assets/poster-qr.png", "海报与作品信息码"), image("./assets/cg/feature-profile.jpg", "角色档案 CG 卡")],
  },
  "skill-product": {
    title: "CREATIVE PRODUCT",
    text: "文创方向可延展到帆布袋、贴纸、票券、徽章、包装和数字周边。",
    images: gallerySets.applications,
  },
  "skill-motion": {
    title: "MOTION SYSTEM",
    text: "动态 GIF 表情可服务网页转场、视频贴片、弹窗反馈和角色互动提示。",
    images: gallerySets.motion,
  },
  "skill-poster": {
    title: "POSTER & INFO CODE",
    text: "海报与作品信息码用于线下展示入口，将网页作品集与提交材料连接起来。",
    images: [image("./assets/poster-qr.png", "海报与作品信息码"), image("./assets/poster-qr-thumb.jpg", "海报缩略图"), image("./assets/cg/work-card-05.jpg", "应用展示 CG 卡")],
  },
  "skill-story": {
    title: "CULTURE STORY",
    text: "叙事围绕一线牵古今、一帆向海丝展开，强调城市记忆、开放包容和年轻化传播。",
    images: [image("./assets/cg/feature-journey.jpg", "设计旅程封面"), image("./assets/elements-board.png", "文化元素库"), image("./assets/hero-wide.jpg", "主视觉海丝场景")],
  },
  emotes: {
    title: "EXPRESSION PACK",
    text: "表情包已经做去白底和红色 CG 舞台包装，不再直接贴白底原图，适合在网页中作为独立作品展示。",
    images: gallerySets.emotes,
  },
  motion: {
    title: "MOTION GIF PACK",
    text: "动态 GIF 表情用于强化网页的互动感和角色生命力。",
    images: gallerySets.motion,
  },
  actions: {
    title: "ACTION GUIDE",
    text: "标准动作规范提供站立、欢迎、引导等姿态，方便后续海报、导视和短视频延展。",
    images: [image("./assets/actions-board.png", "动作规范完整作品板"), image("./assets/pose-standing-cutout.png", "站立动作"), image("./assets/pose-waving-cutout.png", "欢迎动作"), image("./assets/pose-guide-cutout.png", "引导动作")],
  },
  colors: {
    title: "RED COLOR SYSTEM",
    text: "主色调跟随桐帆仔本身的刺桐红，辅以海丝金、深海青和米白，形成红黑 CG 网站氛围。",
    images: [image("./assets/colors-board.png", "比例规范与标准色值"), image("./assets/cg/work-card-08.jpg", "色彩规范 CG 包装"), image("./assets/hero-cutout.png", "主形象色彩参考")],
  },
  applications: {
    title: "APPLICATION MODULES",
    text: "文创应用展示角色在城市传播、活动物料和周边设计中的延展能力。",
    images: gallerySets.applications,
  },
  finalWeb: {
    title: "WEB PORTFOLIO",
    text: "最终网页采用分屏导航、红色 HUD、电子闪烁、扫描线、粒子、舞台画廊和图文弹窗构成。",
    images: [image("./assets/cg/feature-projects.jpg", "项目模块"), image("./assets/cg/feature-profile.jpg", "角色模块"), image("./assets/cg/feature-skills.jpg", "能力模块")],
  },
  finalIp: {
    title: "FINAL IP SYSTEM",
    text: "桐帆仔作品系统包含角色档案、基础视图、表情包、动作规范、比例色值、元素库、海报信息码与网页作品集。",
    images: gallerySets.boards,
  },
};

for (let index = 1; index <= 7; index += 1) {
  details[`work${index}`] = {
    title: `WORK FILE ${String(index).padStart(2, "0")}`,
    text: "点击查看桐帆仔作品板的完整图像与红色 CG 包装效果。",
    images: [
      image(`./assets/cg/work-card-${String(index).padStart(2, "0")}.jpg`, "红色 CG 包装卡"),
      gallerySets.boards[(index - 1) % gallerySets.boards.length],
      image("./assets/hero-cutout.png", "桐帆仔主形象"),
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
  const current = document.body.dataset.activePanel || "home";
  const index = Math.max(0, panelOrder.indexOf(current));
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
