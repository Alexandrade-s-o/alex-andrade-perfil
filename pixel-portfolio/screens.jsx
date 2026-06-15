/* ============================================================
   SCREENS — title, menu, and all content screens.
   Consumes window globals from pixel-engine.jsx.
   ============================================================ */
const { useState: useS, useEffect: useE, useRef: useR } = React;

/* ----------------------- CONTENT (placeholder — Alex edits) ----------------------- */
const DEV = {
  name: "ALEX ANDRADE",
  role: "DISEÑO & DEV WEB",
  level: 27,
  klass: "MULTIMEDIA",
  hp: "∞", mp: "CAFÉ",
  bio: [
    "¡Hola! Soy Alex: diseñador multimedia,",
    "animador y desarrollador web.",
    "Creo experiencias visuales inmersivas —",
    "diseño web, motion graphics, branding y 3D.",
    "Misión actual: shippear cosas bonitas que no se rompan.",
  ],
};

const PROJECTS = [
  { name: "MALEZA RAP",   icon: "star",  year: "2025", tag: "WEB",
    url: "https://malezarap.vercel.app",
    desc: "Sitio web interactivo para el proyecto musical Maleza Rap. Estética urbana, animaciones y mucho ritmo.",
    tech: "WEB · UI/UX · MOTION" },
  { name: "SOLIDHAR",     icon: "chip",  year: "2025", tag: "WEB",
    url: "https://solidhar-beta.vercel.app",
    desc: "Diseño web profesional con identidad sólida y una experiencia de usuario cuidada de principio a fin.",
    tech: "WEB · BRANDING · UI" },
  { name: "LEMON STUDIO", icon: "flag",  year: "2024", tag: "AGENCIA",
    url: "https://l-emon.vercel.app/",
    desc: "Sitio para la agencia creativa Lemon Studio. Portafolio y servicios con un estilo fresco y vibrante.",
    tech: "WEB · BRANDING · UI/UX" },
  { name: "BOSKES",       icon: "sword", year: "2024", tag: "STUDIO",
    url: "https://boskes.vercel.app/",
    desc: "Creative studio enfocado en arquitectura. Web visual y minimalista con foco en los proyectos.",
    tech: "WEB · ARQ · UI" },
];

const SKILLS = [
  { name: "DISEÑO WEB", lvl: 92 },
  { name: "DESARROLLO", lvl: 85 },
  { name: "MOTION GFX", lvl: 90 },
  { name: "ANIMACIÓN",  lvl: 88 },
  { name: "BRANDING",   lvl: 86 },
  { name: "UI / UX",    lvl: 84 },
  { name: "3D",         lvl: 78 },
];

const JOBS = [
  { role: "SENIOR DEV",  place: "NEXUS LABS",  years: "2023 — HOY",
    desc: "Lidero el frontend de la plataforma. Mentor de 3 devs. Bajé el bundle un 40%." },
  { role: "DEVELOPER",   place: "PIXELWORKS",  years: "2021 — 2023",
    desc: "Construí features de pago y dashboards en tiempo real para 50k usuarios." },
  { role: "JR DEVELOPER", place: "STARTUP CO", years: "2019 — 2021",
    desc: "Mi primer boss fight. Aprendí a shippear, romper prod y arreglarlo a las 2am." },
];

const POSTS = [
  { title: "POR QUÉ AMO LOS SHADERS CRT", date: "MAY 2026", tag: "DEVLOG" },
  { title: "UN ROGUELIKE EN 48 HORAS",     date: "FEB 2026", tag: "GAMEDEV" },
  { title: "TYPESCRIPT: 10 TRUCOS",        date: "DEC 2025", tag: "GUÍA" },
  { title: "EL ARTE DE LAS 4 TONALIDADES", date: "OCT 2025", tag: "PIXEL" },
];

const CONTACTS = [
  { label: "EMAIL",    value: "alexanher9@gmail.com", icon: "mail",
    url: "mailto:alexanher9@gmail.com" },
  { label: "LINKEDIN", value: "in/alex-andrade",      icon: "flag",
    url: "https://www.linkedin.com/in/alex-andrade-47b95236b/" },
  { label: "GITHUB",   value: "Alexandrade-s-o",       icon: "chip",
    url: "https://github.com/Alexandrade-s-o" },
];

/* ----------------------- shared layout ----------------------- */
function ScreenFrame({ title, iconName, children, hint, paletteKey }) {
  return (
    <div className="scr">
      <div className="scr-head">
        {iconName && <IconSprite grid={ICONS[iconName]} size={2} paletteKey={paletteKey} />}
        <span>{title}</span>
      </div>
      <div className="scr-body">{children}</div>
      <div className="scr-foot">{hint}</div>
    </div>
  );
}

/* ----------------------- TITLE SCREEN ----------------------- */
/* Walk the hero with the d-pad, then press START / A to enter. */
function TitleScreen({ onStart, paletteKey }) {
  const [x, setX] = useS(0);          // hero x offset within a lane
  const [walking, setWalking] = useS(false);
  const [facing, setFacing] = useS(1);
  const [blinkOn, setBlinkOn] = useS(true);
  const walkTO = useR(null);

  useE(() => {
    const id = setInterval(() => setBlinkOn(b => !b), 540);
    return () => clearInterval(id);
  }, []);

  const stopSoon = () => {
    clearTimeout(walkTO.current);
    walkTO.current = setTimeout(() => setWalking(false), 180);
  };

  useGBInput((a) => {
    if (a === "a" || a === "start") { SFX.start(); onStart(); return; }
    if (a === "left")  { setFacing(-1); setWalking(true); setX(v => Math.max(-150, v - 18)); SFX.blip(); stopSoon(); }
    if (a === "right") { setFacing(1);  setWalking(true); setX(v => Math.min(150, v + 18));  SFX.blip(); stopSoon(); }
  });

  return (
    <div className="scr title-scr">
      <div className="title-stars" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className="tstar" style={{
            left: (i * 37 % 100) + "%", top: (i * 53 % 70) + "%",
            animationDelay: (i % 6) * 0.3 + "s",
          }} />
        ))}
      </div>

      <div className="title-logo">
        <div className="title-name">{DEV.name}</div>
        <div className="title-sub">— A DEVELOPER QUEST —</div>
      </div>

      <div className="title-stage">
        <div className="title-ground" />
        <div className="title-hero" style={{
          transform: `translateX(${x}px) scaleX(${facing})`,
        }}>
          <HeroSprite size={4} walking={walking} paletteKey={paletteKey} />
        </div>
      </div>

      <div className={"press-start" + (blinkOn ? " on" : "")}>
        ▶ PRESS START
      </div>
      <div className="title-tip">◀ ▶ CAMINA · Ⓐ EMPEZAR</div>
      <div className="title-copy">© 2026 ANDRADE SOFT</div>
    </div>
  );
}

/* ----------------------- MAIN MENU ----------------------- */
const MENU_ITEMS = [
  { id: "about",      label: "SOBRE MÍ",    icon: "heart" },
  { id: "projects",   label: "PROYECTOS",   icon: "sword" },
  { id: "skills",     label: "HABILIDADES", icon: "chip" },
  { id: "contact",    label: "CONTACTO",    icon: "mail" },
];

function MenuScreen({ onPick, onBack, paletteKey }) {
  const [sel, setSel] = useS(0);
  useGBInput((a) => {
    if (a === "up")   { setSel(s => (s + MENU_ITEMS.length - 1) % MENU_ITEMS.length); SFX.move(); }
    if (a === "down") { setSel(s => (s + 1) % MENU_ITEMS.length); SFX.move(); }
    if (a === "a" || a === "start") { SFX.confirm(); onPick(MENU_ITEMS[sel].id); }
    if (a === "b") { SFX.back(); onBack && onBack(); }
  });
  return (
    <div className="scr menu-scr">
      <div className="menu-head">
        <div className="menu-title">{DEV.name}</div>
        <div className="menu-role">LVL {DEV.level} · {DEV.role}</div>
      </div>
      <div className="menu-list">
        {MENU_ITEMS.map((m, i) => (
          <div key={m.id} className={"menu-item" + (i === sel ? " sel" : "")}
               onClick={() => { setSel(i); SFX.confirm(); onPick(m.id); }}
               onMouseEnter={() => { if (i !== sel) { setSel(i); SFX.move(); } }}>
            <span className="menu-cursor">{i === sel ? "▶" : "\u00A0"}</span>
            <IconSprite grid={ICONS[m.icon]} size={2} paletteKey={paletteKey} />
            <span className="menu-label">{m.label}</span>
          </div>
        ))}
      </div>
      <div className="scr-foot">▲▼ MOVER · Ⓐ ABRIR</div>
    </div>
  );
}

/* ----------------------- ABOUT ----------------------- */
function AboutScreen({ paletteKey, textSpeed, onBack }) {
  const full = DEV.bio.join(" ");
  const [out, done, skip] = useTypewriter(full, textSpeed, true, () => SFX.blip());
  useGBInput((a) => {
    if ((a === "a" || a === "down" || a === "right") && !done) { skip(); SFX.move(); }
    if (a === "b") { SFX.back(); onBack && onBack(); }
  });
  return (
    <ScreenFrame title="SOBRE MÍ" iconName="heart" paletteKey={paletteKey}
      hint={done ? "Ⓑ VOLVER" : "Ⓐ SALTAR TEXTO"}>
      <div className="about-grid">
        <div className="about-card">
          <div className="about-portrait">
            <HeroSprite size={5} paletteKey={paletteKey} />
          </div>
          <div className="stat-rows">
            <div className="stat-row"><span>CLASS</span><b>{DEV.klass}</b></div>
            <div className="stat-row"><span>LVL</span><b>{DEV.level}</b></div>
            <div className="stat-row"><span>HP</span><b>{DEV.hp}</b></div>
            <div className="stat-row"><span>MP</span><b>{DEV.mp}</b></div>
          </div>
        </div>
        <div className="dialog-box">
          <div className="dialog-name">{DEV.name}</div>
          <p className="dialog-text">{out}<span className={"caret" + (done ? " hide" : "")}>▌</span></p>
          {done && <div className="dialog-next">▶</div>}
        </div>
      </div>
    </ScreenFrame>
  );
}

/* ----------------------- PROJECTS ----------------------- */
function ProjectsScreen({ paletteKey, onBack }) {
  const [sel, setSel] = useS(0);
  const [open, setOpen] = useS(false);
  const openSite = (pr) => {
    if (pr && pr.url) { SFX.coin(); window.open(pr.url, "_blank", "noopener"); }
  };
  useGBInput((a) => {
    if (open) {
      if (a === "a") { openSite(PROJECTS[sel]); }
      if (a === "b") { setOpen(false); SFX.back(); }
      return;
    }
    if (a === "up")   { setSel(s => (s + PROJECTS.length - 1) % PROJECTS.length); SFX.move(); }
    if (a === "down") { setSel(s => (s + 1) % PROJECTS.length); SFX.move(); }
    if (a === "a")    { setOpen(true); SFX.confirm(); }
    if (a === "b")    { SFX.back(); onBack && onBack(); }
  });
  const p = PROJECTS[sel];
  return (
    <ScreenFrame title="PROYECTOS" iconName="sword" paletteKey={paletteKey}
      hint={open ? "Ⓐ ABRIR ↗ · Ⓑ CERRAR" : "▲▼ ELEGIR · Ⓐ VER · Ⓑ MENÚ"}>
      {!open ? (
        <div className="proj-list">
          {PROJECTS.map((pr, i) => (
            <div key={pr.name} className={"proj-row" + (i === sel ? " sel" : "")}
                 onClick={() => { setSel(i); setOpen(true); SFX.confirm(); }}
                 onMouseEnter={() => { if (i !== sel) { setSel(i); SFX.move(); } }}>
              <span className="menu-cursor">{i === sel ? "▶" : "\u00A0"}</span>
              <IconSprite grid={ICONS[pr.icon]} size={2} paletteKey={paletteKey} />
              <span className="proj-name">{pr.name}</span>
              <span className="proj-year">{pr.year}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="proj-detail">
          <div className="proj-detail-head">
            <IconSprite grid={ICONS[p.icon]} size={3} paletteKey={paletteKey} />
            <div>
              <div className="proj-detail-name">{p.name}</div>
              <div className="proj-badge">{p.tag} · {p.year}</div>
            </div>
          </div>
          <p className="proj-desc">{p.desc}</p>
          <div className="proj-tech">‹ {p.tech} ›</div>
          {p.url && (
            <button className="proj-open" onClick={() => openSite(p)}>▶ ABRIR SITIO ↗</button>
          )}
        </div>
      )}
    </ScreenFrame>
  );
}

/* ----------------------- SKILLS ----------------------- */
function SkillsScreen({ paletteKey, onBack }) {
  const [fill, setFill] = useS(false);
  useE(() => { const t = setTimeout(() => setFill(true), 120); return () => clearTimeout(t); }, []);
  useGBInput((a) => { if (a === "b") { SFX.back(); onBack && onBack(); } });
  return (
    <ScreenFrame title="HABILIDADES" iconName="chip" paletteKey={paletteKey} hint="Ⓑ VOLVER">
      <div className="skill-list">
        {SKILLS.map((s) => (
          <div key={s.name} className="skill-row">
            <span className="skill-name">{s.name}</span>
            <div className="skill-bar">
              <div className="skill-fill" style={{ width: fill ? s.lvl + "%" : "0%" }} />
              <div className="skill-ticks">
                {Array.from({ length: 10 }).map((_, i) => <span key={i} />)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScreenFrame>
  );
}

/* ----------------------- EXPERIENCE ----------------------- */
function ExperienceScreen({ paletteKey, onBack }) {
  const [sel, setSel] = useS(0);
  useGBInput((a) => {
    if (a === "up")   { setSel(s => (s + JOBS.length - 1) % JOBS.length); SFX.move(); }
    if (a === "down") { setSel(s => (s + 1) % JOBS.length); SFX.move(); }
    if (a === "b") { SFX.back(); onBack && onBack(); }
  });
  return (
    <ScreenFrame title="EXPERIENCIA" iconName="flag" paletteKey={paletteKey} hint="▲▼ NAVEGAR · Ⓑ VOLVER">
      <div className="quest-log">
        {JOBS.map((j, i) => (
          <div key={j.place} className={"quest" + (i === sel ? " sel" : "")}
               onMouseEnter={() => { if (i !== sel) { setSel(i); SFX.move(); } }}>
            <div className="quest-dot">{i === sel ? "◆" : "◇"}</div>
            <div className="quest-body">
              <div className="quest-top">
                <span className="quest-role">{j.role}</span>
                <span className="quest-years">{j.years}</span>
              </div>
              <div className="quest-place">@ {j.place}</div>
              {i === sel && <p className="quest-desc">{j.desc}</p>}
            </div>
          </div>
        ))}
      </div>
    </ScreenFrame>
  );
}

/* ----------------------- BLOG ----------------------- */
function BlogScreen({ paletteKey, onBack }) {
  const [sel, setSel] = useS(0);
  useGBInput((a) => {
    if (a === "up")   { setSel(s => (s + POSTS.length - 1) % POSTS.length); SFX.move(); }
    if (a === "down") { setSel(s => (s + 1) % POSTS.length); SFX.move(); }
    if (a === "a")    { SFX.coin(); }
    if (a === "b") { SFX.back(); onBack && onBack(); }
  });
  return (
    <ScreenFrame title="BLOG" iconName="book" paletteKey={paletteKey} hint="▲▼ LEER · Ⓑ VOLVER">
      <div className="blog-list">
        {POSTS.map((p, i) => (
          <div key={p.title} className={"blog-row" + (i === sel ? " sel" : "")}
               onMouseEnter={() => { if (i !== sel) { setSel(i); SFX.move(); } }}
               onClick={() => { setSel(i); SFX.coin(); }}>
            <div className="blog-top">
              <span className="menu-cursor">{i === sel ? "▶" : "\u00A0"}</span>
              <span className="blog-tag">[{p.tag}]</span>
              <span className="blog-date">{p.date}</span>
            </div>
            <div className="blog-title">{p.title}</div>
          </div>
        ))}
      </div>
    </ScreenFrame>
  );
}

/* ----------------------- CONTACT ----------------------- */
function ContactScreen({ paletteKey, onBack }) {
  const [sel, setSel] = useS(0);
  const [saved, setSaved] = useS(false);
  const openContact = (c) => {
    if (!c || !c.url) return;
    SFX.coin(); setSaved(true); setTimeout(() => setSaved(false), 1400);
    window.open(c.url, "_blank", "noopener");
  };
  useGBInput((a) => {
    if (a === "up")   { setSel(s => (s + CONTACTS.length - 1) % CONTACTS.length); SFX.move(); }
    if (a === "down") { setSel(s => (s + 1) % CONTACTS.length); SFX.move(); }
    if (a === "a")    { openContact(CONTACTS[sel]); }
    if (a === "b") { SFX.back(); onBack && onBack(); }
  });
  return (
    <ScreenFrame title="CONTACTO" iconName="mail" paletteKey={paletteKey} hint="▲▼ ELEGIR · Ⓐ ABRIR ↗ · Ⓑ VOLVER">
      <div className="contact-intro">¡GAME OVER? NO — APENAS EL PRINCIPIO.<br/>ELIGE UN PORTAL Y SALUDA:</div>
      <div className="contact-list">
        {CONTACTS.map((c, i) => (
          <div key={c.label} className={"contact-row" + (i === sel ? " sel" : "")}
               onMouseEnter={() => { if (i !== sel) { setSel(i); SFX.move(); } }}
               onClick={() => { setSel(i); openContact(c); }}>
            <span className="menu-cursor">{i === sel ? "▶" : "\u00A0"}</span>
            <IconSprite grid={ICONS[c.icon]} size={2} paletteKey={paletteKey} />
            <span className="contact-label">{c.label}</span>
            <span className="contact-value">{c.value}</span>
          </div>
        ))}
      </div>
      <div className={"save-toast" + (saved ? " show" : "")}>★ ¡ABRIENDO! ★</div>
    </ScreenFrame>
  );
}

Object.assign(window, {
  TitleScreen, MenuScreen, AboutScreen, ProjectsScreen,
  SkillsScreen, ExperienceScreen, BlogScreen, ContactScreen,
  MENU_ITEMS, DEV,
});
