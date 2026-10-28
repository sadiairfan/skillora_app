/* ============================================================
   Skillora - application shell, router and page renderers
   Plain HTML/CSS/JS. No frameworks, no network requests.
   ============================================================ */

const D = window.SkilloraData;
const app = document.getElementById("app");
const toastC = document.getElementById("toast-container");
const modalRoot = document.getElementById("modal-root");

let STATE = D.getState();
let globalSearch = "";
let challengeTab = "all";
let skillFilter = "All";
let chartRange = "7";
let explorerSelection = null;
let postSkills = [];
let highlightSolutionId = null;

const DAY = 86400000;

/* ---------------- utilities ---------------- */
function esc(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
}
function toast(text) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = text;
  toastC.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 320);
  }, 2600);
}
function initials(name) {
  return String(name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
}
function fmtDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return Math.max(1, mins) + "m ago";
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + "h ago";
  const days = Math.floor(hours / 24);
  if (days < 30) return days + "d ago";
  const months = Math.floor(days / 30);
  if (months < 12) return months + "mo ago";
  return Math.floor(months / 12) + "y ago";
}
function save() { D.saveState(STATE); }

/* ---------------- theme ---------------- */
function currentTheme() { return document.documentElement.dataset.theme === "light" ? "light" : "dark"; }
function logoSrc(theme) {
  const t = theme === "light" || theme === "dark" ? theme : currentTheme();
  return "assets/logo-" + t + ".png";
}
function applyTheme(theme, persist) {
  const t = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = t;
  const link = document.getElementById("theme-css");
  if (link) link.setAttribute("href", "theme-" + t + ".css");
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", t === "light" ? "#F5F8F8" : "#0B0B0F");
  document.querySelectorAll('img[src*="assets/logo-"]').forEach((img) => img.setAttribute("src", logoSrc(t)));
  document.querySelectorAll(".theme-choice").forEach((btn) => {
    const active = btn.getAttribute("data-theme") === t;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
  });
  if (persist) { try { localStorage.setItem("skillora_theme", t); } catch (e) { /* ignore */ } }
}
function setTheme(theme) {
  applyTheme(theme, true);
  toast((theme === "light" ? "Light" : "Dark") + " mode on.");
}
function themeSwitchHTML(extraClass) {
  const t = currentTheme();
  return '<div class="theme-switch' + (extraClass ? " " + extraClass : "") + '" role="group" aria-label="Theme">' +
    '<button class="theme-choice' + (t === "dark" ? " active" : "") + '" data-theme="dark" onclick="setTheme(\'dark\')" aria-pressed="' + (t === "dark") + '" title="Dark mode">' + icon("moon", 16) + '<span>Dark</span></button>' +
    '<button class="theme-choice' + (t === "light" ? " active" : "") + '" data-theme="light" onclick="setTheme(\'light\')" aria-pressed="' + (t === "light") + '" title="Light mode">' + icon("sun", 16) + '<span>Light</span></button>' +
  '</div>';
}

/* ---------------- icons ---------------- */
function icon(name, size) {
  const s = size || 18;
  const open = '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  const paths = {
    home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 13h8M8 17h5"/>',
    msg: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    menu: '<path d="M3 12h18M3 6h18M3 18h18"/>',
    close: '<path d="M18 6L6 18M6 6l12 12"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    grad: '<path d="M22 10l-10-5L2 10l10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/><path d="M22 10v6"/>',
    arrowLeft: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    chevron: '<path d="M6 9l6 6 6-6"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    unlock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 7.4-2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    star: '<path d="M12 3l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.8 6.1 21l1.2-6.5L2.5 9.9 9.1 9z"/>',
    trending: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    spark: '<path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2"/>',
    layers: '<path d="M12 2l9 5-9 5-9-5z"/><path d="M3 12l9 5 9-5M3 17l9 5 9-5"/>',
    award: '<circle cx="12" cy="8" r="6"/><path d="M8.2 13.2L7 22l5-3 5 3-1.2-8.8"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    send: '<path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5-5 5 5M12 5v12"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/>',
    bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>'
  };
  return open + (paths[name] || paths.spark) + "</svg>";
}

/* ---------------- data helpers ---------------- */
function dataset() { return D.getDataset(STATE); }
function planCfg() { return D.getPlanConfig(STATE); }
function solutionsFor(chId) { return dataset().solutions.filter((s) => s.challengeId === chId); }
function hasSolutions(ch) { return solutionsFor(ch.id).length > 0; }
function isEvergreen(ch) {
  return Boolean(ch.seededEvergreen) || hasSolutions(ch) || (Date.now() - ch.createdAt > 30 * DAY);
}
function statusLabel(ch) {
  if (ch.bestSolutionId) return "Best selected";
  return isEvergreen(ch) ? "Evergreen" : "Active";
}
function statusClass(ch) {
  if (ch.bestSolutionId) return "best";
  return isEvergreen(ch) ? "evergreen" : "active";
}
function activeChallenges() { return dataset().challenges.filter((c) => !isEvergreen(c)); }
function evergreenChallenges() { return dataset().challenges.filter((c) => isEvergreen(c)); }
function bestCount() { return dataset().challenges.filter((c) => c.bestSolutionId).length; }
function studentSolutions() { return dataset().solutions.filter((s) => s.isAyesha); }
function monthlyCount() { return D.currentMonthCount(STATE); }
function unread(role) { return dataset().messages.filter((m) => m.to === role && m.unread).length; }
function daysLeft(ch) { return Math.max(0, Math.ceil((ch.deadline - Date.now()) / DAY)); }
function isNew(ch) { return Date.now() - ch.createdAt < 7 * DAY; }
function matchScore(ch) {
  const skills = STATE.student.skills || [];
  const matched = ch.skills.filter((s) => skills.indexOf(s) !== -1);
  const ratio = ch.skills.length ? matched.length / ch.skills.length : 0;
  let hash = 0;
  for (let i = 0; i < ch.id.length; i++) hash = (hash * 31 + ch.id.charCodeAt(i)) % 7;
  return Math.min(98, Math.round(41 + ratio * 52 + hash));
}
function matchDetail(ch) {
  const skills = STATE.student.skills || [];
  return {
    matched: ch.skills.filter((s) => skills.indexOf(s) !== -1),
    missing: ch.skills.filter((s) => skills.indexOf(s) === -1)
  };
}
function weightedScore(sol) {
  const w = STATE.enterpriseWeights || { skills: 40, impact: 25, clarity: 20, feasibility: 15 };
  const m = sol.metrics || { skills: sol.score, impact: sol.score, clarity: sol.score, feasibility: sol.score };
  const total = (w.skills || 0) + (w.impact || 0) + (w.clarity || 0) + (w.feasibility || 0) || 1;
  return Math.round(
    (m.skills * (w.skills || 0) + m.impact * (w.impact || 0) + m.clarity * (w.clarity || 0) + m.feasibility * (w.feasibility || 0)) / total
  );
}
function sortedSolutions(chId) {
  const list = solutionsFor(chId).slice();
  if (planCfg().limits.ai === "custom") list.sort((a, b) => weightedScore(b) - weightedScore(a));
  else list.sort((a, b) => b.score - a.score);
  return list;
}
function displayScore(s) {
  return planCfg().limits.ai === "custom" ? weightedScore(s) : s.score;
}
function roleLabel(role) { return role === "client" ? "Client" : "Student"; }

/* ---------------- routing ---------------- */
function go(hash) {
  if (location.hash === hash) renderRoute();
  else location.hash = hash;
  closeDrawer();
  closeBell();
  hideSuggestions();
}
function parseRoute() {
  const raw = (location.hash || "#/home").replace(/^#\/?/, "");
  const parts = raw.split("/").filter(Boolean);
  if (!parts.length || parts[0] === "home") return { kind: "home" };
  if (parts[0] === "login") return { kind: "login", role: parts[1] === "client" ? "client" : "student" };
  if (parts[0] === "client" || parts[0] === "student") {
    return { kind: "app", role: parts[0], page: parts[1] || "dashboard", sub: parts[2] || null };
  }
  return { kind: "home" };
}
function renderRoute() {
  const route = parseRoute();
  if (route.kind === "home") { renderHome(); return; }
  if (route.kind === "login") { renderLogin(route.role); return; }
  markRouteRead(route);
  renderShell(route);
}
window.addEventListener("hashchange", () => {
  closeDrawer();
  closeBell();
  hideSuggestions();
  renderRoute();
  window.scrollTo({ top: 0, behavior: "auto" });
});
window.addEventListener("load", renderRoute);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeModal(); closeDrawer(); closeBell(); hideSuggestions();
  }
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".bell-wrap")) closeBell();
  if (!e.target.closest(".search-wrap")) hideSuggestions();
});

/* ---------------- home ---------------- */
function renderHome() {
  app.innerHTML =
    '<div class="home-wrap">' +
      '<div class="home-glow glow1"></div><div class="home-glow glow2"></div><div class="home-glow glow3"></div>' +
      '<div class="home-dots"></div>' +
      '<svg class="home-waves" viewBox="0 0 1200 220" preserveAspectRatio="none" aria-hidden="true">' +
        '<defs><linearGradient id="wavegrad" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#FF2D9B" stop-opacity=".35"/><stop offset="100%" stop-color="#8B5CF6" stop-opacity=".05"/>' +
        '</linearGradient></defs>' +
        '<path d="M0,150 C180,110 360,195 540,150 C720,105 900,185 1080,145 C1140,132 1170,140 1200,132 L1200,220 L0,220 Z" fill="url(#wavegrad)"/>' +
        '<path d="M0,175 C220,145 380,205 600,170 C820,135 980,198 1200,168" fill="none" stroke="#FF2D9B" stroke-opacity=".55" stroke-width="2"/>' +
        '<path d="M0,196 C240,168 400,214 640,186 C860,160 1020,208 1200,190" fill="none" stroke="#8B5CF6" stroke-opacity=".45" stroke-width="1.5"/>' +
      '</svg>' +
      '<svg class="home-mountains" viewBox="0 0 1200 240" preserveAspectRatio="none" aria-hidden="true">' +
        '<path d="M0 240 L0 170 L120 118 L220 166 L340 92 L460 158 L560 118 L680 176 L800 102 L930 166 L1040 124 L1120 158 L1200 116 L1200 240 Z" fill="#A7F3D0" fill-opacity=".55"/>' +
        '<path d="M0 240 L0 198 L150 158 L280 198 L410 146 L540 196 L660 156 L790 200 L910 152 L1040 196 L1140 166 L1200 184 L1200 240 Z" fill="#14B8A6" fill-opacity=".3"/>' +
        '<path d="M0 240 L0 220 L180 192 L330 222 L480 186 L630 224 L780 190 L930 222 L1080 194 L1200 214 L1200 240 Z" fill="#0F7666" fill-opacity=".2"/>' +
        '<path d="M340 92 L340 62" stroke="#0F172A" stroke-width="2.5" stroke-linecap="round"/>' +
        '<path d="M342 62 L372 71 L342 80 Z" fill="#0F7666"/>' +
      '</svg>' +
      '<div class="home-content">' +
        '<img class="home-logo" src="' + logoSrc() + '" alt="Skillora">' +
        '<h1 class="home-wordmark">Skillora</h1>' +
        '<p class="home-tagline">Let Your Skills Speak.</p>' +
      '</div>' +
      '<div class="home-actions">' +
        '<a class="btn btn-ghost" href="#/login/client">' + icon("briefcase", 20) + '<span>Sign in as a Client</span></a>' +
        '<a class="btn btn-primary" href="#/login/student">' + icon("grad", 20) + '<span>Sign in as a Student / Employee</span></a>' +
      '</div>' +
    '</div>';
  document.title = "Skillora - Let Your Skills Speak.";
}

/* ---------------- login ---------------- */
function renderLogin(role) {
  const isClient = role === "client";
  app.innerHTML =
    '<div class="login-wrap">' +
      '<div class="home-glow glow1"></div><div class="home-glow glow2"></div><div class="home-dots"></div>' +
      '<a class="login-back" href="#/home">' + icon("arrowLeft", 16) + ' Back to home</a>' +
      '<div class="login-card">' +
        '<img class="login-logo" src="' + logoSrc() + '" alt="Skillora">' +
        '<div class="login-title">' + (isClient ? "Client Sign In" : "Student / Employee Sign In") + '</div>' +
        '<p class="muted">' + (isClient ? "Post problems. Meet the people who can solve them." : "Find real problems. Earn recognition for real skills.") + '</p>' +
        '<form onsubmit="fakeSignIn(event, \'' + role + '\')" class="stack">' +
          '<label class="field"><span>Email</span><input class="input" id="login-email" type="email" value="' + (isClient ? "hr@novatech.pk" : "ayesha.khan@example.pk") + '" required></label>' +
          '<label class="field"><span>Password</span><input class="input" id="login-password" type="password" value="demo123" required></label>' +
          '<div id="login-error" class="form-error" role="alert"></div>' +
          '<button class="btn btn-primary btn-block" type="submit">Sign in ' + icon("arrowLeft", 18) + '</button>' +
        '</form>' +
        '<div class="login-demo">Demo credentials are prefilled. No real account is created.</div>' +
        '<a class="login-switch" href="#/login/' + (isClient ? "student" : "client") + '">Sign in as a ' + (isClient ? "Student / Employee" : "Client") + ' instead</a>' +
      '</div>' +
    '</div>';
  document.title = (isClient ? "Client" : "Student") + " Sign In - Skillora";
}
function fakeSignIn(event, role) {
  event.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const pass = document.getElementById("login-password").value;
  const err = document.getElementById("login-error");
  if (!email || !email.includes("@")) { err.textContent = "Please enter a valid email address."; return; }
  if (pass.length < 4) { err.textContent = "Password must be at least 4 characters."; return; }
  try { localStorage.setItem("skillora_session", role); } catch (e) { /* ignore */ }
  go("#/" + role + "/dashboard");
  toast(role === "client" ? "Welcome back, Nova Tech Solutions." : "Welcome back, Ayesha.");
}
function signOut() {
  try { localStorage.removeItem("skillora_session"); } catch (e) { /* ignore */ }
  go("#/home");
  toast("Signed out.");
}

/* ---------------- shell ---------------- */
const NAV = {
  student: [
    { key: "dashboard", label: "Dashboard", icon: "home", href: "#/student/dashboard" },
    { key: "challenges", label: "Challenges", icon: "target", href: "#/student/challenges" },
    { key: "submissions", label: "My Submissions", icon: "file", href: "#/student/submissions" },
    { key: "messages", label: "Messages", icon: "msg", href: "#/student/messages" },
    { key: "settings", label: "Settings", icon: "gear", href: "#/student/settings" }
  ],
  client: [
    { key: "dashboard", label: "Dashboard", icon: "home", href: "#/client/dashboard" },
    { key: "challenges", label: "Challenges", icon: "target", href: "#/client/challenges" },
    { key: "post", label: "Post Challenge", icon: "plus", href: "#/client/post" },
    { key: "messages", label: "Messages", icon: "msg", href: "#/client/messages" },
    { key: "settings", label: "Settings", icon: "gear", href: "#/client/settings" }
  ]
};
function navFor(role) { return NAV[role] || NAV.student; }
function activeKey(page) {
  if (page === "challenges") return "challenges";
  if (page === "submissions") return "submissions";
  if (page === "messages") return "messages";
  if (page === "settings") return "settings";
  if (page === "post") return "post";
  return "dashboard";
}
function markRouteRead(route) {
  if (route.page !== "messages" || !route.sub) return;
  const m = dataset().messages.find((x) => x.id === route.sub);
  if (m && m.unread) { m.unread = false; save(); }
}
function renderShell(route) {
  const role = route.role;
  const cfg = planCfg();
  const planBadge = role === "client"
    ? '<span class="plan-pill accent-' + cfg.accent + '">' + icon("layers", 13) + esc(cfg.name) + '</span>'
    : '<span class="plan-pill ' + (STATE.student.premium ? "accent-enterprise" : "") + '">' + icon("spark", 13) + (STATE.student.premium ? "Premium" : "Free") + '</span>';
  const unreadCount = unread(role);
  const nav = navFor(role).map((item) => {
    const active = activeKey(route.page) === item.key;
    const count = item.key === "messages" ? unreadCount : 0;
    return '<a class="nav-item' + (active ? " active" : "") + '" href="' + item.href + '"' + (active ? ' aria-current="page"' : "") + '>' +
      '<span class="nav-ico">' + icon(item.icon, 19) + '</span><span class="nav-label">' + item.label + '</span>' +
      (count ? '<span class="nav-badge">' + count + '</span>' : '') + '</a>';
  }).join("");

  const sidebar =
    '<aside class="sidebar" id="sidebar" aria-label="Main navigation">' +
      '<a class="brand" href="#/' + role + '/dashboard">' +
        '<img class="sidebar-logo" src="' + logoSrc() + '" alt="Skillora">' +
        '<span class="brand-text"><strong>Skillora</strong><small>Let Your Skills Speak.</small></span></a>' +
      '<div class="sidebar-plan">' + planBadge + '</div>' +
      '<nav class="nav">' + nav + '</nav>' +
      '<div class="sidebar-bottom">' +
        '<div class="user-card"><span class="avatar">' + (role === "client" ? STATE.client.avatar : STATE.student.avatar) + '</span>' +
          '<span class="user-meta"><strong>' + esc(role === "client" ? STATE.client.name : STATE.student.name) + '</strong><small>' + roleLabel(role) + (role === "student" && STATE.student.premium ? " · Premium" : "") + '</small></span>' +
          '<button class="icon-btn" onclick="signOut()" aria-label="Sign out" title="Sign out">' + icon("logout", 18) + '</button></div>' +
        '<div class="prototype-note">Prototype with sample data</div>' +
      '</div>' +
    '</aside><div class="scrim" id="scrim" onclick="closeDrawer()"></div>';

  const topbar =
    '<header class="topbar">' +
      '<button class="icon-btn menu-btn" onclick="openDrawer()" aria-label="Open menu">' + icon("menu", 22) + '</button>' +
      '<a class="topbar-brand" href="#/' + role + '/dashboard"><img src="' + logoSrc() + '" alt=""><span>Skillora</span></a>' +
      '<div class="search-wrap"><div class="search-box">' + icon("search", 18) +
        '<input id="global-search" type="search" placeholder="Search challenges, companies, or people..." aria-label="Search" value="' + esc(globalSearch) + '" oninput="onSearch(this.value)" onfocus="onSearch(this.value)" onkeydown="searchKeydown(event)">' +
      '</div><div class="suggestions" id="suggestions" hidden></div></div>' +
      '<div class="topbar-right">' + planBadge.replace("plan-pill", "plan-pill topbar-pill") +
        themeSwitchHTML("topbar-theme") +
        '<div class="bell-wrap"><button class="icon-btn bell-btn" id="bell-btn" onclick="toggleBell(event)" aria-label="Notifications" aria-expanded="false">' + icon("bell", 20) +
          (unreadCount ? '<span class="bell-count">' + unreadCount + '</span>' : '') + '</button>' +
          '<div class="dropdown bell-dropdown" id="bell-dropdown"><div class="dropdown-head"><strong>Notifications</strong><button class="link-btn" onclick="markAllRead(\'' + role + '\')">Mark all read</button></div>' + bellList(role) + '</div>' +
        '</div>' +
        '<button class="icon-btn quick-btn" onclick="quickAction()" aria-label="Quick action" title="Quick action">' + icon("plus", 20) + '</button>' +
      '</div>' +
    '</header>';

  const bottomNav = navFor(role).map((item) => {
    const active = activeKey(route.page) === item.key;
    const count = item.key === "messages" ? unreadCount : 0;
    return '<a class="bottom-item' + (active ? " active" : "") + '" href="' + item.href + '"><span class="bottom-ico">' + icon(item.icon, 20) + (count ? '<span class="bottom-badge">' + count + '</span>' : '') + '</span><span>' + item.label + '</span></a>';
  }).join("");

  app.innerHTML =
    '<div class="app-shell role-' + role + '">' + sidebar +
      '<div class="main-wrap">' + topbar + '<main class="page" id="page"></main></div>' +
      '<nav class="bottom-nav" aria-label="Mobile navigation">' + bottomNav + '</nav>' +
    '</div>';
  renderPage(role, route.page, route.sub);
}

function bellList(role) {
  const list = dataset().messages.filter((m) => m.to === role).sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);
  if (!list.length) return '<div class="dropdown-empty">You are all caught up.</div>';
  return list.map((m) =>
    '<button class="bell-row" onclick="openMessage(\'' + role + '\',\'' + m.id + '\')">' +
      '<span class="dot ' + (m.unread ? "unread" : "") + '"></span>' +
      '<span class="bell-copy"><strong>' + esc(m.title) + '</strong><small>' + esc(m.from) + ' · ' + esc(m.time) + '</small></span></button>'
  ).join("");
}
function openDrawer() {
  const shell = document.querySelector(".app-shell");
  if (shell) shell.classList.add("drawer-open");
  const el = document.getElementById("scrim");
  if (el) el.classList.add("show");
}
function closeDrawer() {
  const shell = document.querySelector(".app-shell");
  if (shell) shell.classList.remove("drawer-open");
  const el = document.getElementById("scrim");
  if (el) el.classList.remove("show");
}
function toggleBell(e) {
  e.stopPropagation();
  const dd = document.getElementById("bell-dropdown");
  const btn = document.getElementById("bell-btn");
  if (!dd) return;
  const open = dd.classList.toggle("open");
  if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
}
function closeBell() {
  const dd = document.getElementById("bell-dropdown");
  if (dd) dd.classList.remove("open");
  const btn = document.getElementById("bell-btn");
  if (btn) btn.setAttribute("aria-expanded", "false");
}
function markAllRead(role) {
  dataset().messages.forEach((m) => { if (m.to === role) m.unread = false; });
  save(); renderRoute(); toast("All notifications marked as read.");
}
function openMessage(role, id) { go("#/" + role + "/messages/" + id); }
function quickAction() {
  if (parseRoute().role === "client") go("#/client/post");
  else go("#/student/challenges");
}
function pulseBell() {
  setTimeout(() => {
    const b = document.getElementById("bell-btn");
    if (b) { b.classList.add("pulse"); setTimeout(() => b.classList.remove("pulse"), 1200); }
  }, 60);
}

/* ---------------- search ---------------- */
function onSearch(value) {
  globalSearch = value;
  const box = document.getElementById("suggestions");
  if (!box) return;
  const q = value.trim().toLowerCase();
  if (!q) { box.hidden = true; box.innerHTML = ""; return; }
  const ds = dataset();
  const chs = ds.challenges.filter((c) =>
    (c.title + " " + c.company + " " + c.category + " " + c.skills.join(" ")).toLowerCase().includes(q)
  ).slice(0, 4);
  const people = ds.solutions.filter((s) => s.student.toLowerCase().includes(q)).slice(0, 2);
  const companies = (D.COMPANIES || []).filter((c) => c.name.toLowerCase().includes(q)).slice(0, 2);
  let html = "";
  if (chs.length) {
    html += '<div class="suggest-head">Challenges</div>';
    chs.forEach((c) => {
      html += '<button class="suggest-row" onclick="suggestChallenge(\'' + c.id + '\')">' + icon("target", 16) +
        '<span><strong>' + esc(c.title) + '</strong><small>' + esc(c.company) + '</small></span></button>';
    });
  }
  if (companies.length) {
    html += '<div class="suggest-head">Companies</div>';
    companies.forEach((c) => {
      html += '<button class="suggest-row" onclick="suggestCompany(\'' + esc(c.name) + '\')">' + icon("building", 16) +
        '<span><strong>' + esc(c.name) + '</strong><small>' + esc(c.category) + '</small></span></button>';
    });
  }
  if (people.length) {
    html += '<div class="suggest-head">People</div>';
    people.forEach((s) => {
      html += '<button class="suggest-row" onclick="suggestPerson(\'' + esc(s.student) + '\')">' + icon("user", 16) +
        '<span><strong>' + esc(s.student) + '</strong><small>' + esc(s.university) + '</small></span></button>';
    });
  }
  if (!html) html = '<div class="dropdown-empty">No matches for "' + esc(value) + '".</div>';
  box.innerHTML = html;
  box.hidden = false;
}
function hideSuggestions() {
  const box = document.getElementById("suggestions");
  if (box) box.hidden = true;
}
function suggestChallenge(id) {
  const role = parseRoute().role || "student";
  hideSuggestions();
  go("#/" + role + "/challenges/" + id);
}
function suggestCompany(name) {
  globalSearch = name;
  const role = parseRoute().role || "student";
  hideSuggestions();
  go("#/" + role + "/challenges");
  setTimeout(renderRoute, 0);
}
function suggestPerson(name) {
  const role = parseRoute().role || "student";
  hideSuggestions();
  go("#/" + role + "/messages");
  toast("Showing messages related to " + name + ".");
}
function searchKeydown(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    hideSuggestions();
    const role = parseRoute().role || "student";
    go("#/" + role + "/challenges");
    setTimeout(renderRoute, 0);
  }
}

/* ---------------- page dispatcher ---------------- */
function renderPage(role, page, sub) {
  const el = document.getElementById("page");
  if (!el) return;
  if (page === "dashboard") el.innerHTML = dashboardPage(role);
  else if (page === "challenges") {
    el.innerHTML = sub ? challengeDetailPage(role, sub) : challengesPage(role);
  }
  else if (page === "post" && role === "client") el.innerHTML = postChallengePage();
  else if (page === "submissions" && role === "student") el.innerHTML = submissionsPage();
  else if (page === "messages") el.innerHTML = messagesPage(role, sub);
  else if (page === "settings") el.innerHTML = settingsPage(role);
  else el.innerHTML = dashboardPage(role);
  el.classList.remove("page-enter");
  void el.offsetWidth;
  el.classList.add("page-enter");
  if (highlightSolutionId) {
    const node = document.getElementById("sol-" + highlightSolutionId);
    if (node) {
      node.classList.add("row-highlight");
      setTimeout(() => node.classList.remove("row-highlight"), 3000);
    }
    highlightSolutionId = null;
  }
  document.title = "Skillora - " + roleLabel(role);
}

/* ---------------- charts ---------------- */
function progressChart(role) {
  const data7 = role === "client" ? [38, 52, 44, 68, 61, 80, 92] : [25, 40, 34, 58, 63, 76, 88];
  const data30 = role === "client" ? [30, 46, 38, 55, 62, 58, 71, 68, 80, 76, 86, 94] : [20, 32, 28, 46, 41, 60, 55, 68, 74, 70, 82, 90];
  const values = chartRange === "7" ? data7 : data30;
  const labels = chartRange === "7"
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"];
  const w = 560, h = 180, padX = 18, padY = 18;
  const step = (w - padX * 2) / (values.length - 1);
  const points = values.map((v, i) => [padX + i * step, h - padY - (v / 100) * (h - padY * 2)]);
  const line = points.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  const area = line + " L" + (w - padX) + "," + (h - padY) + " L" + padX + "," + (h - padY) + " Z";
  const dots = points.map((p) => '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.5"/>').join("");
  const bars = values.map((v, i) =>
    '<div class="bar-col" title="' + v + '"><div class="bar-track"><div class="bar-fill" style="height:' + v + '%"></div></div><span class="bar-label">' + esc(labels[i] || "") + '</span></div>'
  ).join("");
  return '<div class="chart-wrap">' +
    '<div class="chart chart-line"><svg viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" role="img" aria-label="Progress chart">' +
      '<defs><linearGradient id="chartfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#FF2D9B" stop-opacity=".45"/><stop offset="100%" stop-color="#FF2D9B" stop-opacity="0"/></linearGradient></defs>' +
      '<path d="' + area + '" fill="url(#chartfill)"/>' +
      '<path d="' + line + '" fill="none" stroke="#FF2D9B" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' + dots +
    '</svg></div>' +
    '<div class="chart chart-bars">' + bars + '</div>' +
  '</div>';
}
function setChartRange(value) {
  chartRange = value;
  const role = parseRoute().role || "student";
  const shell = document.getElementById("chart-shell");
  if (shell) shell.innerHTML = progressChart(role);
}

/* ---------------- dashboard ---------------- */
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 18) return "Good Afternoon";
  return "Good Evening";
}
function statCard(iconName, label, value, link) {
  return '<article class="card stat-card"><div class="stat-top"><span class="stat-ico">' + icon(iconName, 20) + '</span>' +
    '<a class="view-all" href="' + link + '">View all ' + icon("chevron", 12) + '</a></div>' +
    '<div class="stat-value">' + value + '</div><div class="stat-label">' + label + '</div></article>';
}
function dashboardPage(role) {
  const ds = dataset();
  const cfg = planCfg();
  if (role === "student") {
    const subs = studentSolutions();
    const shortlisted = subs.filter((s) => s.status === "Shortlisted" || s.status === "Best solution").length;
    const best = subs.filter((s) => s.status === "Best solution").length;
    return '<div class="page-head"><div><h1>' + greeting() + ', ' + esc(STATE.student.name.split(" ")[0]) + '!</h1>' +
        '<p class="muted">Your next opportunity could be one solution away.</p></div>' + quoteCard() + '</div>' +
      '<div class="stats-grid">' +
        statCard("target", "Active Challenges", activeChallenges().length, "#/student/challenges") +
        statCard("file", "My Submissions", subs.length, "#/student/submissions") +
        statCard("star", "Shortlisted", shortlisted, "#/student/submissions") +
        statCard("award", "Offers", best, "#/student/submissions") +
      '</div>' +
      '<div class="dash-grid">' +
        '<section class="card panel progress-panel"><div class="panel-head"><div><h2>Your Progress</h2><p class="muted small">Momentum across submissions and shortlists</p></div>' +
          '<select class="select compact" onchange="setChartRange(this.value)" aria-label="Chart range">' +
            '<option value="7"' + (chartRange === "7" ? " selected" : "") + '>Last 7 days</option><option value="30"' + (chartRange === "30" ? " selected" : "") + '>Last 30 days</option></select></div>' +
          '<div id="chart-shell">' + progressChart(role) + '</div></section>' +
        '<div class="stack">' + latestChallengesCard(role) + recommendedCard(role) + '</div>' +
      '</div>';
  }
  const stats = {
    active: activeChallenges().length,
    solutions: ds.solutions.length,
    evergreen: evergreenChallenges().length,
    best: bestCount()
  };
  return '<div class="page-head"><div><h1>' + greeting() + ', ' + esc(STATE.client.name.split(" ")[0]) + '!</h1>' +
      '<p class="muted">Real skills. Real opportunities. Your next great hire may already be here.</p></div>' + quoteCard() + '</div>' +
    '<div class="stats-grid">' +
      statCard("target", "Active Challenges", stats.active, "#/client/challenges") +
      statCard("file", "Solutions Received", stats.solutions, "#/client/messages") +
      statCard("layers", "Evergreen Challenges", stats.evergreen, "#/client/challenges") +
      statCard("award", "Best Selected", stats.best, "#/client/challenges") +
    '</div>' +
    '<div class="dash-grid">' +
      '<section class="card panel progress-panel"><div class="panel-head"><div><h2>Your Progress</h2><p class="muted small">Solutions received and shortlist activity</p></div>' +
        '<select class="select compact" onchange="setChartRange(this.value)" aria-label="Chart range">' +
          '<option value="7"' + (chartRange === "7" ? " selected" : "") + '>Last 7 days</option><option value="30"' + (chartRange === "30" ? " selected" : "") + '>Last 30 days</option></select></div>' +
        '<div id="chart-shell">' + progressChart(role) + '</div></section>' +
      '<div class="stack">' + planCard() + demoCard() + '</div>' +
    '</div>' +
    '<div class="dash-grid two">' + latestChallengesCard(role) + recommendedCard(role) + '</div>';
}
function quoteCard() {
  return '<aside class="quote-card" aria-label="Quote">' +
    '<div class="quote-text"><strong>Real skills.</strong><span>Real opportunities.</span></div>' +
    '<svg class="decor decor-wave" viewBox="0 0 220 100" preserveAspectRatio="none" aria-hidden="true">' +
      '<path d="M0 70 C30 45 55 85 85 62 C115 39 140 78 170 58 C190 45 205 52 220 42 L220 100 L0 100 Z" fill="rgba(255,45,155,.25)"/>' +
      '<path d="M0 78 C35 55 60 92 95 70 C130 48 155 86 185 66 C200 56 212 60 220 54" fill="none" stroke="#FF2D9B" stroke-opacity=".6" stroke-width="2"/></svg>' +
    '<svg class="decor decor-mountain" viewBox="0 0 220 100" preserveAspectRatio="none" aria-hidden="true">' +
      '<path d="M0 100 L55 45 L90 78 L130 32 L175 72 L205 52 L220 66 L220 100 Z" fill="#14B8A6" fill-opacity=".35"/>' +
      '<path d="M130 32 L118 44 L124 40 L130 46 L137 39 L142 44 Z" fill="#0F172A" fill-opacity=".55"/>' +
      '<path d="M130 32 L130 20 L140 20 L140 27 L130 27" fill="#0F7666"/></svg>' +
  '</aside>';
}
function latestChallengesCard(role) {
  const list = dataset().challenges.slice().sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);
  const rows = list.length ? list.map((c) => {
    const evergreen = isEvergreen(c);
    return '<a class="list-row" href="#/' + role + '/challenges/' + c.id + '">' +
      '<span class="cat-ico">' + icon("building", 18) + '</span>' +
      '<span class="list-copy"><strong>' + esc(c.title) + '</strong><small>' + esc(c.company) + ' · ' + esc(c.category) + '</small></span>' +
      '<span class="list-meta">' + (isNew(c) ? '<span class="badge badge-new">New</span>' : '') +
        '<span class="badge ' + (evergreen ? "badge-evergreen" : "badge-soft") + '">' + (evergreen ? "Evergreen" : daysLeft(c) + "d left") + '</span></span></a>';
  }).join("") : emptyState("No challenges yet", "New challenges will appear here.");
  return '<section class="card panel"><div class="panel-head"><h2>Latest Challenges</h2><a class="view-all" href="#/' + role + '/challenges">View all</a></div><div class="list">' + rows + '</div></section>';
}
function recommendedCard(role) {
  if (role === "student") {
    const list = dataset().challenges.slice().sort((a, b) => matchScore(b) - matchScore(a)).slice(0, 3);
    const rows = list.length ? list.map((c) => {
      const s = matchScore(c);
      const badge = s >= 90 ? "Hot" : s >= 80 ? "Trending" : "New";
      return '<a class="list-row" href="#/student/challenges/' + c.id + '">' + matchRing(s, 46) +
        '<span class="list-copy"><strong>' + esc(c.title) + '</strong><small>' + esc(c.company) + '</small></span>' +
        '<span class="list-meta"><span class="badge badge-' + badge.toLowerCase() + '">' + badge + '</span><span class="match-num">' + s + '%</span></span></a>';
    }).join("") : emptyState("No recommendations yet", "Add skills in Settings to get matched.");
    return '<section class="card panel"><div class="panel-head"><h2>Recommended For You</h2><a class="view-all" href="#/student/challenges">Browse</a></div><div class="list">' + rows + '</div></section>';
  }
  const top = dataset().solutions.slice().sort((a, b) => b.score - a.score).slice(0, 3);
  const rows = top.length ? top.map((s) => {
    const ch = dataset().challenges.find((c) => c.id === s.challengeId);
    return '<a class="list-row" id="sol-' + s.id + '" href="#/client/challenges/' + s.challengeId + '"><span class="avatar sm">' + initials(s.student) + '</span>' +
      '<span class="list-copy"><strong>' + esc(s.student) + '</strong><small>' + esc(ch ? ch.title : "Solution") + '</small></span>' +
      '<span class="list-meta"><span class="score-mini">' + s.score + '</span><span class="muted small">AI score</span></span></a>';
  }).join("") : emptyState("No solutions yet", "Use the demo buttons to simulate one.");
  return '<section class="card panel"><div class="panel-head"><h2>Top solutions to review</h2><a class="view-all" href="#/client/messages">Inbox</a></div><div class="list">' + rows + '</div></section>';
}
function planCard() {
  const cfg = planCfg();
  const used = activeChallenges().length;
  const limit = cfg.limits.active;
  const pct = limit === Infinity ? 18 : Math.min(100, Math.round((used / limit) * 100));
  return '<section class="card panel plan-card accent-' + cfg.accent + '"><div class="panel-head"><div><h2>Your plan</h2><p class="muted small">' + esc(cfg.tagline) + '</p></div>' +
    '<span class="plan-pill accent-' + cfg.accent + '">' + esc(cfg.name) + '</span></div>' +
    '<div class="plan-price">' + D.formatPKR(cfg.price) + '<span>/month</span></div>' +
    '<div class="evergreen-chip">' + icon("bolt", 14) + ' Evergreen: unlimited</div>' +
    '<div class="plan-usage"><div class="usage-head"><span>Active challenge slots</span><strong>' + used + ' / ' + (limit === Infinity ? "∞" : limit) + '</strong></div>' +
    '<div class="meter"><span style="width:' + pct + '%"></span></div></div>' +
    '<div class="plan-actions"><a class="btn btn-ghost btn-sm" href="#/client/settings">Manage plan</a><a class="link-btn" href="#/client/post">Post a challenge ' + icon("chevron", 12) + '</a></div></section>';
}
function demoCard() {
  return '<section class="card panel demo-card"><div class="panel-head"><div><h2>Demo controls</h2><p class="muted small">Use these live in the investor demo.</p></div>' + icon("spark", 18) + '</div>' +
    '<div class="demo-actions"><button class="btn btn-primary btn-sm" onclick="simulateNewSolution()">' + icon("plus", 16) + ' Simulate new solution</button>' +
    '<button class="btn btn-ghost btn-sm" onclick="simulateBetterSolution()">' + icon("trending", 16) + ' Simulate better solution 1 year later</button></div>' +
    '<p class="demo-note">' + icon("bolt", 14) + ' A first solution frees an active slot. Better solutions keep notifying you forever.</p></section>';
}
function matchRing(score, size) {
  const s = size || 54;
  const r = (s - 8) / 2;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  return '<span class="match-ring" style="width:' + s + 'px;height:' + s + 'px">' +
    '<svg width="' + s + '" height="' + s + '" viewBox="0 0 ' + s + ' ' + s + '" aria-hidden="true">' +
      '<circle cx="' + s / 2 + '" cy="' + s / 2 + '" r="' + r + '" class="ring-bg"/>' +
      '<circle cx="' + s / 2 + '" cy="' + s / 2 + '" r="' + r + '" class="ring-fg" stroke-dasharray="' + dash + ' ' + c + '"/></svg>' +
    '<span class="ring-label">' + score + '</span></span>';
}
function emptyState(title, text) {
  return '<div class="empty"><span class="empty-ico">' + icon("spark", 22) + '</span><strong>' + esc(title) + '</strong><p class="muted small">' + esc(text) + '</p></div>';
}

/* ---------------- demo simulations ---------------- */
function simulateNewSolution() {
  const ds = dataset();
  const active = ds.challenges.filter((c) => !isEvergreen(c));
  const target = active[0] || ds.challenges[0];
  if (!target) { toast("Post a challenge first."); return; }
  const namePool = ["Bilal Ahmed", "Fatima Noor", "Hamza Ali", "Zainab Riaz", "Usman Tariq"];
  const name = namePool[ds.solutions.length % namePool.length];
  const score = 72 + (ds.solutions.length * 3) % 22;
  const id = "sol-live-" + Date.now();
  const sol = {
    id, challengeId: target.id, student: name, studentId: "live-" + Date.now(),
    university: D.UNIVERSITIES[ds.solutions.length % D.UNIVERSITIES.length], score,
    summary: "A fresh solution focused on a pragmatic pilot. The approach starts narrow, measures the right signal early and documents a clear fallback.",
    strengths: ["Clear problem framing", "Practical scope"], gaps: ["Could add cost estimates"],
    metrics: { skills: score - 4, impact: score, clarity: score - 2, feasibility: score + 2 },
    link: "https://portfolio.example.pk/live", fileName: "live-solution.pdf",
    submittedAt: new Date().toISOString(), status: "Submitted", isAyesha: false
  };
  ds.solutions.push(sol);
  ds.messages.push({
    id: "msg-live-" + Date.now(), to: "client", type: "solution", from: name,
    title: "New solution for " + target.title, preview: sol.summary.slice(0, 90) + "…", body: sol.summary,
    time: "Just now", unread: true, challengeId: target.id, solutionId: id, createdAt: Date.now()
  });
  highlightSolutionId = id;
  save(); renderRoute(); pulseBell();
  toast("New solution received. The challenge is now Evergreen - a slot is free.");
}
function simulateBetterSolution() {
  const ds = dataset();
  const evergreen = ds.challenges.filter((c) => isEvergreen(c));
  const target = evergreen[0] || ds.challenges[0];
  if (!target) { toast("No evergreen challenge yet."); return; }
  const existing = solutionsFor(target.id);
  const best = existing.reduce((m, s) => Math.max(m, s.score), 70);
  const score = Math.min(99, best + 3);
  const id = "sol-better-" + Date.now();
  const sol = {
    id, challengeId: target.id, student: "Mariam Siddiqui", studentId: "better-" + Date.now(),
    university: "LUMS Lahore", score,
    summary: "An improved solution submitted much later. It reuses the strongest part of the previous approach, fixes the measurement gap and adds a costed rollout plan.",
    strengths: ["Strong evaluation plan", "Practical scope"], gaps: ["Needs more user testing"],
    metrics: { skills: score, impact: score + 1, clarity: score - 3, feasibility: score - 1 },
    link: "https://portfolio.example.pk/better", fileName: "better-solution.pdf",
    submittedAt: new Date().toISOString(), status: "Submitted", isAyesha: false
  };
  ds.solutions.push(sol);
  ds.messages.push({
    id: "msg-better-" + Date.now(), to: "client", type: "evergreen", from: "Skillora AI",
    title: "A better solution was submitted 14 months later",
    preview: "Evergreen challenge: " + target.title,
    body: "A new solution scored " + score + " and beats the current Best. The problem stays open, so you can review it and change the Best at any time.",
    time: "Just now", unread: true, challengeId: target.id, solutionId: id, createdAt: Date.now()
  });
  highlightSolutionId = id;
  save(); renderRoute(); pulseBell();
  toast("Evergreen notification sent. Human review still decides the Best.");
}

/* ---------------- challenges ---------------- */
function challengesPage(role) {
  const isClient = role === "client";
  const tabs = isClient
    ? [["all", "All"], ["active", "Active"], ["evergreen", "Evergreen"], ["best", "Best selected"]]
    : [["all", "All"], ["active", "Active"], ["evergreen", "Evergreen"]];
  return '<div class="page-head compact-head"><div><h1>Challenges</h1><p class="muted">' +
      (isClient ? "Evergreen problems stay open. Better solutions keep arriving." : "Browse real business problems matched to your skills.") + '</p></div>' +
      (isClient ? '<a class="btn btn-primary btn-sm" href="#/client/post">' + icon("plus", 16) + ' Post challenge</a>'
        : '<a class="btn btn-ghost btn-sm" href="#/student/settings">' + icon("gear", 16) + ' Edit skills</a>') +
    '</div>' +
    '<section class="card panel filters-panel"><div class="filters-row">' +
      '<div class="search-box page-search">' + icon("search", 18) +
        '<input type="search" id="challenge-search" placeholder="Search challenges, companies, or skills..." value="' + esc(globalSearch) + '" oninput="onChallengeSearch(this.value)" aria-label="Search challenges"></div>' +
      '<div class="tabs" role="tablist">' + tabs.map((t) =>
        '<button class="tab' + (challengeTab === t[0] ? " active" : "") + '" onclick="setChallengeTab(\'' + t[0] + '\')" role="tab" aria-selected="' + (challengeTab === t[0]) + '">' + t[1] + '</button>'
      ).join("") + '</div></div>' +
      '<div class="skill-chips">' + ["All"].concat(D.SKILLS_LIST).map((s) =>
        '<button class="chip' + (skillFilter === s ? " active" : "") + '" onclick="setSkillFilter(\'' + s + '\')">' + s + '</button>'
      ).join("") + '</div>' +
      '<div class="result-count" id="challenge-count">' + filteredChallenges(role).length + ' challenges</div></section>' +
    '<div class="challenge-grid" id="challenge-grid">' + challengeGrid(role) + '</div>';
}
function filteredChallenges() {
  const q = globalSearch.trim().toLowerCase();
  return dataset().challenges.filter((c) => {
    if (challengeTab === "active" && (isEvergreen(c) || c.bestSolutionId)) return false;
    if (challengeTab === "evergreen" && !isEvergreen(c)) return false;
    if (challengeTab === "best" && !c.bestSolutionId) return false;
    if (skillFilter !== "All" && c.skills.indexOf(skillFilter) === -1) return false;
    if (q) {
      const hay = (c.title + " " + c.company + " " + c.category + " " + c.skills.join(" ")).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }).sort((a, b) => b.createdAt - a.createdAt);
}
function onChallengeSearch(value) {
  globalSearch = value;
  updateChallengeResults();
}
function setChallengeTab(tab) {
  challengeTab = tab;
  document.querySelectorAll(".tabs .tab").forEach((el) => {
    const match = el.textContent.trim().toLowerCase().replace("best selected", "best") === tab;
    el.classList.toggle("active", match);
    el.setAttribute("aria-selected", match ? "true" : "false");
  });
  updateChallengeResults();
}
function setSkillFilter(skill) {
  skillFilter = skill;
  document.querySelectorAll(".skill-chips .chip").forEach((el) => el.classList.toggle("active", el.textContent.trim() === skill));
  updateChallengeResults();
}
function updateChallengeResults() {
  const role = parseRoute().role || "student";
  const grid = document.getElementById("challenge-grid");
  const count = document.getElementById("challenge-count");
  if (grid) grid.innerHTML = challengeGrid(role);
  if (count) count.textContent = filteredChallenges(role).length + " challenges";
}
function challengeGrid(role) {
  const list = filteredChallenges();
  if (!list.length) return '<div class="card panel">' + emptyState("No challenges match", "Try a different keyword or skill filter.") + '</div>';
  return list.map((c) => challengeCard(c, role)).join("");
}
function challengeCard(c, role) {
  const score = matchScore(c);
  const sols = solutionsFor(c.id).length;
  const evergreen = isEvergreen(c);
  const badge = score >= 90 ? "Hot" : score >= 80 ? "Trending" : "New";
  return '<article class="card challenge-card"><div class="challenge-top"><span class="cat-ico">' + icon("building", 18) + '</span>' +
    '<div class="challenge-badges">' + (isNew(c) ? '<span class="badge badge-new">New</span>' : '') +
      (c.visibility !== "Public" ? '<span class="badge badge-private">' + icon("lock", 11) + ' NDA</span>' : '') +
      '<span class="badge badge-' + statusClass(c) + '">' + statusLabel(c) + '</span></div></div>' +
    '<h3><a href="#/' + role + '/challenges/' + c.id + '">' + esc(c.title) + '</a></h3>' +
    '<p class="muted small challenge-company">' + esc(c.company) + ' · ' + esc(c.category) + '</p>' +
    '<p class="challenge-desc">' + esc(c.description.slice(0, 120)) + (c.description.length > 120 ? "…" : "") + '</p>' +
    '<div class="tag-row">' + c.skills.map((s) => '<span class="tag">' + esc(s) + '</span>').join("") + '</div>' +
    '<div class="challenge-foot"><div class="challenge-meta">' +
      (role === "student"
        ? matchRing(score, 46) + '<span class="stack tiny"><strong>' + score + '% match</strong><span class="muted">' + matchDetail(c).matched.length + ' skills overlap</span></span>'
        : '<span class="muted small">' + icon("file", 14) + ' ' + sols + ' solutions</span><span class="muted small">' + icon(evergreen ? "bolt" : "clock", 14) + ' ' + (evergreen ? "Open forever" : daysLeft(c) + " days left") + '</span>') +
    '</div><div class="challenge-cta">' + (role === "student" ? '<span class="badge badge-' + badge.toLowerCase() + '">' + badge + '</span>' : '') +
      '<a class="btn btn-ghost btn-xs" href="#/' + role + '/challenges/' + c.id + '">View challenge</a></div></div></article>';
}

function challengeDetailPage(role, id) {
  const c = dataset().challenges.find((x) => x.id === id);
  if (!c) return '<div class="card panel">' + emptyState("Challenge not found", "It may have been removed. Head back to the challenge list.") + '<a class="btn btn-primary btn-sm" href="#/' + role + '/challenges">Back to challenges</a></div>';
  const sols = sortedSolutions(c.id);
  const cfg = planCfg();
  const isClient = role === "client";
  const mySol = studentSolutions().find((s) => s.challengeId === c.id);
  const match = matchScore(c);
  const detail = matchDetail(c);

  let solutionsHtml = "";
  if (isClient) {
    if (!sols.length) {
      solutionsHtml = emptyState("No solutions yet", "Use the demo controls on the dashboard to simulate one, or wait for a student submission.");
    } else {
      solutionsHtml = sols.map((s, idx) => {
        const locked = cfg.limits.solutionsVisible !== "all" && idx >= cfg.limits.solutionsVisible;
        const isBest = c.bestSolutionId === s.id;
        const score = displayScore(s);
        return '<div class="solution-row' + (locked ? " locked-row" : "") + '" id="sol-' + s.id + '">' +
          '<div class="sol-rank">#' + (idx + 1) + '</div>' +
          '<div class="sol-main"><div class="sol-head"><div class="sol-person"><span class="avatar sm">' + initials(s.student) + '</span>' +
            '<span><strong>' + esc(s.student) + '</strong><small>' + esc(s.university) + ' · ' + fmtDate(s.submittedAt) + '</small></span></div>' +
            '<span class="badge ' + (isBest ? "badge-best" : s.status === "Shortlisted" ? "badge-short" : "badge-soft") + '">' + esc(isBest ? "Best solution" : s.status) + '</span></div>' +
            '<p class="sol-summary">' + esc(s.summary) + '</p>' +
            '<div class="score-line"><span class="muted small">AI score</span><div class="score-bar"><span style="width:' + score + '%"></span></div><strong>' + score + '</strong></div>' +
            (cfg.limits.ai !== "basic" ? '<div class="sol-insights"><span class="insight good">' + icon("check", 12) + esc((s.strengths || []).join(" · ")) + '</span><span class="insight gap">' + icon("trending", 12) + esc((s.gaps || []).join(" · ")) + '</span></div>' : '') +
            (cfg.limits.ai === "custom" ? '<div class="criteria-mini">Weighted score uses your custom criteria.</div>' : '') +
          '</div>' +
          '<div class="sol-actions">' + (isBest
              ? '<span class="best-flag">' + icon("award", 16) + ' Best</span>'
              : '<button class="btn btn-ghost btn-xs" onclick="markBest(\'' + c.id + '\',\'' + s.id + '\')">Mark as Best</button>') +
            (s.status !== "Shortlisted" && !isBest ? '<button class="link-btn" onclick="shortlistSolution(\'' + c.id + '\',\'' + s.id + '\')">Shortlist</button>' : '') +
            '<a class="link-btn" href="#/client/messages/' + (msgForSolution(s.id) || "") + '">Open in inbox</a></div>' +
          (locked ? '<div class="locked-overlay"><span>' + icon("lock", 18) + ' Upgrade to unlock</span><a class="btn btn-primary btn-xs" href="#/client/settings">View plans</a></div>' : '') +
        '</div>';
      }).join("");
    }
  }

  const header = '<div class="detail-head"><a class="back-link" href="#/' + role + '/challenges">' + icon("arrowLeft", 16) + ' All challenges</a>' +
      '<div class="detail-title-row"><div><div class="badge-row"><span class="badge badge-' + statusClass(c) + '">' + statusLabel(c) + '</span>' +
        (c.visibility !== "Public" ? '<span class="badge badge-private">' + icon("lock", 11) + ' ' + esc(c.visibility) + '</span>' : '') +
        '<span class="badge badge-evergreen">' + icon("bolt", 11) + ' Evergreen: unlimited</span></div>' +
        '<h1>' + esc(c.title) + '</h1><p class="muted">' + esc(c.company) + ' · ' + esc(c.category) + ' · Posted ' + timeAgo(new Date(c.createdAt).toISOString()) + '</p></div>' +
        (isClient ? '<div class="detail-side-stat"><span>' + sols.length + '</span><small>solutions</small></div>'
          : '<div class="detail-side-stat">' + matchRing(match, 74) + '<small>' + match + '% match</small></div>') +
      '</div></div>';

  const body = '<div class="detail-grid"><section class="card panel"><h2>About this problem</h2>' +
      '<p class="detail-desc">' + esc(c.description) + '</p>' +
      '<div class="tag-row">' + c.skills.map((s) => '<span class="tag">' + esc(s) + '</span>').join("") + '</div>' +
      '<div class="detail-facts"><div><span class="muted small">' + icon("clock", 14) + ' Timeline</span><strong>' + (isEvergreen(c) ? "Evergreen - open forever" : daysLeft(c) + " days left") + '</strong></div>' +
        '<div><span class="muted small">' + icon("users", 14) + ' Solutions</span><strong>' + sols.length + '</strong></div>' +
        '<div><span class="muted small">' + icon("award", 14) + ' Best</span><strong>' + (c.bestSolutionId ? "Selected" : "Not selected") + '</strong></div></div></section>' +
    '<aside class="stack">' + (isClient
      ? '<section class="card panel"><h2>Problem status</h2><p class="muted small">Problems are evergreen. After a Best is marked, the problem stays open; a better solution even a year later triggers a new notification.</p>' +
        '<div class="evergreen-note">' + icon("bolt", 16) + ' Problem stays open for future improvements</div></section>'
      : studentDetailPanel(c, mySol, match, detail)) +
      (isClient ? '<section class="card panel"><h2>Need more solutions?</h2><p class="muted small">Your ' + esc(cfg.name) + ' plan shows ' + (cfg.limits.solutionsVisible === "all" ? "all solutions" : "the first " + cfg.limits.solutionsVisible + " solutions per challenge") + '.</p><a class="link-btn" href="#/client/settings">Compare plans ' + icon("chevron", 12) + '</a></section>' : '') +
    '</aside></div>';

  const solutionsSection = isClient
    ? '<section class="card panel solutions-panel"><div class="panel-head"><div><h2>Solutions received</h2><p class="muted small">' +
        (cfg.limits.ai === "custom" ? "Ranked by your custom AI weights. Re-rank in Settings." : cfg.limits.ai === "full" ? "Ranked AI shortlist with strengths and gaps." : "Basic AI score per solution.") +
        '</p></div>' + (cfg.limits.ai === "custom" ? '<a class="link-btn" href="#/client/settings">Adjust weights</a>' : '') + '</div>' +
      (cfg.limits.ai === "custom" ? enterpriseCriteriaBar() : '') +
      '<div class="solutions-list">' + solutionsHtml + '</div></section>'
    : '';
  return header + body + solutionsSection;
}
function msgForSolution(solId) {
  const m = dataset().messages.find((x) => x.to === "client" && x.solutionId === solId);
  return m ? m.id : "";
}
function studentDetailPanel(c, mySol, match, detail) {
  return '<section class="card panel"><h2>Why this match</h2>' +
    '<div class="match-big">' + matchRing(match, 66) + '<div><strong>' + match + '% match</strong><p class="muted small">Based on the skills in your profile.</p></div></div>' +
    '<div class="match-chips">' + detail.matched.map((s) => '<span class="chip active static">' + icon("check", 12) + esc(s) + '</span>').join("") +
      detail.missing.map((s) => '<span class="chip static">' + esc(s) + '</span>').join("") + '</div>' +
    (mySol
      ? '<div class="submitted-box"><span class="badge ' + (mySol.status === "Best solution" ? "badge-best" : "badge-short") + '">' + esc(mySol.status) + '</span>' +
        '<strong>You submitted a solution</strong><p class="muted small">' + fmtDate(mySol.submittedAt) + '</p></div>'
      : '<button class="btn btn-primary btn-block" onclick="openSubmitModal(\'' + c.id + '\')">' + icon("upload", 17) + ' Submit solution</button>') +
    '<p class="fine-print">Skill overlap is scored live. Update your skills in Settings to recalculate every match.</p></section>';
}
function enterpriseCriteriaBar() {
  const w = STATE.enterpriseWeights;
  return '<div class="criteria-bar">' + ["skills", "impact", "clarity", "feasibility"].map((k) =>
    '<span class="criteria-pill">' + (k === "skills" ? "Skills fit" : k === "impact" ? "Impact" : k === "clarity" ? "Clarity" : "Feasibility") + ' ' + w[k] + '%</span>'
  ).join("") + '<a class="link-btn" href="#/client/settings">Edit weights</a></div>';
}

/* ---------------- client actions ---------------- */
function markBest(chId, solId) {
  const ds = dataset();
  const ch = ds.challenges.find((c) => c.id === chId);
  if (!ch) return;
  const sol = ds.solutions.find((s) => s.id === solId);
  if (!sol) return;
  const old = ds.solutions.find((s) => s.id === ch.bestSolutionId);
  if (old && old.id !== sol.id) old.status = old.status === "Best solution" ? "Shortlisted" : old.status;
  sol.status = "Best solution";
  ch.bestSolutionId = sol.id;
  ds.messages.push({
    id: "msg-best-" + Date.now(), to: "student", type: "best", from: ch.company,
    title: "Your solution was marked Best", preview: ch.title,
    body: "Congratulations! Your solution was marked as the Best solution for " + ch.title + ". The challenge stays open for future improvements.",
    time: "Just now", unread: true, challengeId: ch.id, createdAt: Date.now()
  });
  save(); renderRoute();
  toast("Best solution updated. The problem stays open.");
}
function shortlistSolution(chId, solId) {
  const ds = dataset();
  const sol = ds.solutions.find((s) => s.id === solId);
  if (!sol) return;
  if (sol.status !== "Best solution") sol.status = "Shortlisted";
  const ch = ds.challenges.find((c) => c.id === chId);
  ds.messages.push({
    id: "msg-short-" + Date.now(), to: "student", type: "shortlist", from: ch ? ch.company : "Skillora",
    title: "Your solution was shortlisted", preview: ch ? ch.title : "",
    body: "Your solution was shortlisted. The client is reviewing it alongside other submissions.",
    time: "Just now", unread: true, challengeId: chId, createdAt: Date.now()
  });
  save(); renderRoute();
  toast("Solution shortlisted. The student was notified.");
}

/* ---------------- submit solution ---------------- */
function openSubmitModal(chId) {
  const c = dataset().challenges.find((x) => x.id === chId);
  if (!c) return;
  modalRoot.innerHTML = '<div class="modal-backdrop" onclick="backdropClose(event)"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="submit-title">' +
    '<div class="modal-head"><div><h2 id="submit-title">Submit a solution</h2><p class="muted small">' + esc(c.title) + '</p></div>' +
      '<button class="icon-btn" onclick="closeModal()" aria-label="Close">' + icon("close", 20) + '</button></div>' +
    '<form onsubmit="submitSolution(event, \'' + c.id + '\')" class="stack">' +
      '<label class="field"><span>Solution title</span><input class="input" id="sol-title" placeholder="e.g. Two-stage clustering with explainable routes" required minlength="6"></label>' +
      '<label class="field"><span>Summary</span><textarea class="input textarea" id="sol-summary" placeholder="Explain your approach, what you built and why it works." required minlength="30"></textarea></label>' +
      '<div class="form-grid"><label class="field"><span>Link (optional)</span><input class="input" id="sol-link" type="url" placeholder="https://portfolio.example.pk/..."></label>' +
        '<label class="field"><span>File name (optional)</span><input class="input" id="sol-file" placeholder="solution.pdf"></label></div>' +
      '<div id="submit-error" class="form-error" role="alert"></div>' +
      '<div class="modal-actions"><button type="button" class="btn btn-ghost btn-sm" onclick="closeModal()">Cancel</button>' +
        '<button type="submit" class="btn btn-primary btn-sm">' + icon("send", 16) + ' Submit solution</button></div></form>' +
  '</div></div>';
  const el = document.getElementById("sol-title");
  if (el) el.focus();
}
function closeModal() { modalRoot.innerHTML = ""; }
function backdropClose(e) { if (e.target && e.target.classList.contains("modal-backdrop")) closeModal(); }
function submitSolution(event, chId) {
  event.preventDefault();
  const title = document.getElementById("sol-title").value.trim();
  const summary = document.getElementById("sol-summary").value.trim();
  const link = document.getElementById("sol-link").value.trim();
  const file = document.getElementById("sol-file").value.trim();
  const err = document.getElementById("submit-error");
  if (title.length < 6) { err.textContent = "Give your solution a clear title (at least 6 characters)."; return; }
  if (summary.length < 30) { err.textContent = "Add a little more detail - at least 30 characters."; return; }
  if (!STATE.student.premium && monthlyCount() >= 3) {
    err.innerHTML = 'You have used 3 of 3 free submissions this month. <a href="#/student/settings">Upgrade to Premium</a> for unlimited submissions.';
    return;
  }
  const ds = dataset();
  const c = ds.challenges.find((x) => x.id === chId);
  const score = matchScore(c);
  const sol = {
    id: "sol-mine-" + Date.now(), challengeId: chId, student: STATE.student.name, studentId: "student",
    university: STATE.student.university, score, summary,
    strengths: ["Clear problem framing"], gaps: ["Needs more user testing"],
    metrics: { skills: score, impact: score - 3, clarity: score + 1, feasibility: score - 2 },
    link: link || "https://portfolio.example.pk/mine", fileName: file || "solution.pdf",
    submittedAt: new Date().toISOString(), status: "Submitted", isAyesha: true
  };
  ds.solutions.push(sol);
  STATE.student.monthly = { key: D.MONTH_KEY(), count: monthlyCount() + 1 };
  ds.messages.push({
    id: "msg-client-" + Date.now(), to: "client", type: "solution", from: STATE.student.name,
    title: "New solution for " + c.title, preview: summary.slice(0, 90) + "…", body: summary,
    time: "Just now", unread: true, challengeId: c.id, solutionId: sol.id, createdAt: Date.now()
  });
  save(); closeModal(); renderRoute(); pulseBell();
  toast("Solution submitted. The problem stays open for better ideas.");
}

/* ---------------- post challenge ---------------- */
function postChallengePage() {
  const cfg = planCfg();
  const used = activeChallenges().length;
  const limit = cfg.limits.active;
  const full = limit !== Infinity && used >= limit;
  const activeText = limit === Infinity ? "unlimited active challenges" : limit + (limit === 1 ? " active challenge" : " active challenges");
  if (full) {
    return '<div class="page-head compact-head"><div><h1>Post Challenge</h1><p class="muted">Turn a real problem into an opportunity.</p></div></div>' +
      '<section class="card panel blocked-card"><span class="blocked-ico">' + icon("lock", 26) + '</span>' +
        '<h2>Your ' + esc(cfg.name) + ' plan has ' + activeText + '.</h2>' +
        '<p class="muted">All ' + limit + ' slots are in use. A slot frees automatically when the first solution arrives or after 30 days, when that challenge becomes Evergreen.</p>' +
        '<div class="blocked-actions"><a class="btn btn-primary btn-sm" href="#/client/settings">' + icon("layers", 16) + ' Compare plans</a>' +
          '<a class="btn btn-ghost btn-sm" href="#/client/challenges">View my challenges</a></div>' +
        '<div class="evergreen-chip">' + icon("bolt", 14) + ' Evergreen challenges never use a slot</div></section>';
  }
  postSkills = [];
  const def = new Date(Date.now() + 14 * DAY).toISOString().slice(0, 10);
  const today = new Date().toISOString().slice(0, 10);
  return '<div class="page-head compact-head"><div><h1>Post Challenge</h1><p class="muted">Describe a real business problem. Students and professionals will bring solutions.</p></div>' +
      '<span class="plan-pill accent-' + cfg.accent + '">' + icon("layers", 13) + esc(cfg.name) + ' · ' + used + '/' + (limit === Infinity ? "∞" : limit) + ' active</span></div>' +
    '<form class="card panel post-form" onsubmit="createChallenge(event)">' +
      '<div class="form-section"><h2>The problem</h2>' +
        '<label class="field"><span>Challenge title</span><input class="input" id="post-title" placeholder="e.g. Reduce delivery delays with smarter route planning" required minlength="8"></label>' +
        '<label class="field"><span>Description</span><textarea class="input textarea" id="post-desc" placeholder="What is the real problem? What data or constraints exist? What would a great outcome look like?" required minlength="40"></textarea></label></div>' +
      '<div class="form-section"><h2>Skills & timeline</h2><div class="field"><span>Skills needed</span>' +
        '<div class="tag-input"><div class="tag-row" id="post-skills"></div>' +
          '<div class="tag-add"><input class="input" id="post-skill-input" placeholder="Type a skill and press Enter" onkeydown="postSkillKey(event)">' +
            '<button class="btn btn-ghost btn-xs" type="button" onclick="addPostSkill()">Add</button></div>' +
          '<div class="skill-suggest">' + D.SKILLS_LIST.slice(0, 8).map((s) => '<button type="button" class="chip" onclick="addPostSkill(\'' + s + '\')">' + s + '</button>').join("") + '</div></div></div>' +
        '<div class="form-grid"><label class="field"><span>Deadline</span><input class="input" id="post-deadline" type="date" required min="' + today + '" value="' + def + '"></label>' +
          '<label class="field"><span>Visibility</span><select class="input" id="post-visibility">' +
            '<option value="Public">Public - all students</option>' +
            '<option value="Private · NDA" ' + (cfg.limits.private ? "" : "disabled") + '>Private · NDA' + (cfg.limits.private ? " - invited & verified" : " - Enterprise only") + '</option></select>' +
            (cfg.limits.private ? '' : '<small class="field-hint">' + icon("lock", 12) + ' Private challenges are available on Enterprise. <a href="#/client/settings">Compare plans</a></small>') + '</label></div></div>' +
      '<div id="post-error" class="form-error" role="alert"></div>' +
      '<div class="post-actions"><a class="btn btn-ghost btn-sm" href="#/client/challenges">Cancel</a>' +
        '<button class="btn btn-primary" type="submit">' + icon("plus", 17) + ' Publish challenge</button></div>' +
      '<p class="fine-print">' + icon("bolt", 13) + ' Every challenge becomes evergreen after the first solution or 30 days - so great ideas can arrive years later.</p></form>';
}
function renderPostSkills() {
  const el = document.getElementById("post-skills");
  if (!el) return;
  el.innerHTML = postSkills.length
    ? postSkills.map((s) => '<span class="chip active static">' + esc(s) + '<button type="button" class="chip-x" onclick="removePostSkill(\'' + esc(s) + '\')" aria-label="Remove ' + esc(s) + '">' + icon("close", 12) + '</button></span>').join("")
    : '<span class="muted small">Add at least one skill.</span>';
}
function addPostSkill(value) {
  const input = document.getElementById("post-skill-input");
  const skill = (value || (input ? input.value : "")).trim();
  if (!skill) return;
  if (postSkills.indexOf(skill) === -1) postSkills.push(skill);
  if (input && !value) input.value = "";
  renderPostSkills();
}
function removePostSkill(skill) {
  postSkills = postSkills.filter((s) => s !== skill);
  renderPostSkills();
}
function postSkillKey(e) {
  if (e.key === "Enter") { e.preventDefault(); addPostSkill(); }
}
function createChallenge(event) {
  event.preventDefault();
  const title = document.getElementById("post-title").value.trim();
  const desc = document.getElementById("post-desc").value.trim();
  const deadline = document.getElementById("post-deadline").value;
  const visibility = document.getElementById("post-visibility").value;
  const err = document.getElementById("post-error");
  if (title.length < 8) { err.textContent = "Add a clear title (at least 8 characters)."; return; }
  if (desc.length < 40) { err.textContent = "Describe the problem in at least 40 characters."; return; }
  if (!postSkills.length) { err.textContent = "Add at least one skill."; return; }
  if (!deadline) { err.textContent = "Choose a deadline."; return; }
  const dl = new Date(deadline + "T23:59:59").getTime();
  if (dl < Date.now()) { err.textContent = "The deadline must be in the future."; return; }
  const cfg = planCfg();
  if (cfg.limits.active !== Infinity && activeChallenges().length >= cfg.limits.active) {
    err.innerHTML = 'Your plan has no free active slots. <a href="#/client/settings">Compare plans</a>.';
    return;
  }
  if (visibility !== "Public" && !cfg.limits.private) { err.textContent = "Private challenges are only available on Enterprise."; return; }
  const ds = dataset();
  const id = "ch-custom-" + Date.now();
  ds.challenges.push({
    id, title, description: desc, company: STATE.client.name, category: "New challenge",
    skills: postSkills.slice(), visibility: visibility === "Public" ? "Public" : "Private · NDA",
    createdAt: Date.now(), deadline: dl, bestSolutionId: null, seededEvergreen: false
  });
  const match = matchScore({ id, skills: postSkills });
  ds.messages.push({
    id: "msg-new-" + Date.now(), to: "student", type: "challenge", from: STATE.client.name,
    title: "New challenge posted: " + title,
    preview: "Match " + match + "% · " + postSkills.join(", "),
    body: "A new challenge was posted by " + STATE.client.name + ". Your skill profile matches this problem.",
    time: "Just now", unread: true, challengeId: id, createdAt: Date.now()
  });
  save();
  toast("Challenge published. Students have been notified.");
  go("#/client/challenges/" + id);
}

/* ---------------- submissions (student) ---------------- */
function submissionsPage() {
  const subs = studentSolutions().slice().sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  const premium = STATE.student.premium;
  const count = monthlyCount();
  const limitText = premium ? "Unlimited submissions" : count + " of 3 free submissions used this month";
  const rows = subs.length ? subs.map((s) => {
    const ch = dataset().challenges.find((c) => c.id === s.challengeId);
    const badgeClass = s.status === "Best solution" ? "badge-best" : s.status === "Shortlisted" ? "badge-short" : s.status === "Under review" ? "badge-review" : "badge-soft";
    return '<div class="sub-row"><div class="sub-main"><strong>' + esc(ch ? ch.title : "Challenge") + '</strong>' +
      '<small class="muted">' + esc(ch ? ch.company : "") + ' · ' + fmtDate(s.submittedAt) + '</small>' +
      '<p class="muted small sub-summary">' + esc(s.summary) + '</p></div>' +
      '<div class="sub-side"><span class="badge ' + badgeClass + '">' + esc(s.status) + '</span>' +
        '<div class="score-mini-wrap"><span class="muted tiny">AI score</span><span class="score-mini">' + s.score + '</span></div>' +
        '<a class="link-btn" href="#/student/challenges/' + (ch ? ch.id : "") + '">View challenge</a></div></div>';
  }).join("") : '<div class="card panel">' + emptyState("No submissions yet", "Find a challenge and submit your first solution.") + '<a class="btn btn-primary btn-sm" href="#/student/challenges">Browse challenges</a></div>';

  return '<div class="page-head compact-head"><div><h1>My Submissions</h1><p class="muted">Track every solution and what the client decided.</p></div>' +
      '<span class="plan-pill ' + (premium ? "accent-enterprise" : "") + '">' + icon("spark", 13) + (premium ? "Premium" : "Free") + '</span></div>' +
    '<section class="card panel submission-counter"><div><h2>' + (premium ? "Premium - unlimited submissions" : "Free plan") + '</h2>' +
      '<p class="muted small">' + (premium ? "You can submit as many solutions as you like." : "Free includes 3 submissions per month. Premium is Rs 500/month.") + '</p>' +
      '<div class="meter"><span style="width:' + (premium ? 100 : Math.min(100, (count / 3) * 100)) + '%"></span></div>' +
      '<div class="usage-head"><span>' + limitText + '</span><strong>' + subs.length + ' total</strong></div></div>' +
      (premium ? '<span class="evergreen-chip">' + icon("check", 14) + ' Premium active</span>'
        : '<button class="btn btn-primary btn-sm" onclick="upgradePremium()">' + icon("spark", 16) + ' Upgrade for Rs 500/month</button>') +
    '</section><div class="sub-list">' + rows + '</div>';
}
function upgradePremium() {
  STATE.student.premium = true;
  save(); renderRoute();
  toast("Premium activated. You now have unlimited submissions.");
}

/* ---------------- messages ---------------- */
function messagesPage(role, selectedId) {
  const isClient = role === "client";
  const list = dataset().messages.filter((m) => m.to === role).sort((a, b) => b.createdAt - a.createdAt);
  if (!list.length) {
    return '<div class="page-head compact-head"><div><h1>' + (isClient ? "Solutions Inbox" : "Messages") + '</h1><p class="muted">' +
        (isClient ? "Every received solution lands here." : "Challenge notifications and decisions.") + '</p></div></div>' +
      '<div class="card panel">' + emptyState("No messages yet", isClient ? "Simulate a solution from the dashboard." : "New challenges will be delivered here.") + '</div>';
  }
  const open = selectedId ? list.find((m) => m.id === selectedId) : null;
  const listHtml = list.map((m) => {
    const isOpen = open && open.id === m.id;
    return '<button class="msg-row' + (isOpen ? " selected" : "") + '" onclick="openMessage(\'' + role + '\',\'' + m.id + '\')">' +
      '<span class="avatar sm">' + initials(m.from) + '</span>' +
      '<span class="msg-copy"><strong>' + esc(m.from) + '</strong><span class="msg-title">' + esc(m.title) + '</span>' +
        '<span class="msg-preview">' + esc(m.preview || m.body || "") + '</span></span>' +
      '<span class="msg-side"><span class="muted tiny">' + esc(m.time) + '</span>' + (m.unread ? '<span class="dot unread"></span>' : '') +
        (m.type === "evergreen" ? '<span class="badge badge-evergreen">Evergreen</span>' : '') + '</span></button>';
  }).join("");
  return '<div class="page-head compact-head"><div><h1>' + (isClient ? "Solutions Inbox" : "Messages") + '</h1><p class="muted">' +
      (isClient ? "Every received solution appears here. Evergreen updates never stop." : "New challenge matches, shortlists and Best decisions.") + '</p></div>' +
      '<span class="badge badge-evergreen">' + icon("bolt", 11) + ' Evergreen notifications on</span></div>' +
    '<div class="inbox-layout' + (open ? ' has-open' : '') + '"><section class="card panel msg-list">' + listHtml + '</section>' +
      '<section class="card panel msg-detail">' + (open ? messageDetail(role, open)
        : '<div class="msg-placeholder">' + icon("msg", 28) + '<strong>Select a message</strong><p class="muted small">Open a solution or notification to see the full detail.</p></div>') + '</section></div>';
}
function messageDetail(role, m) {
  const isClient = role === "client";
  const ch = dataset().challenges.find((c) => c.id === m.challengeId);
  const sol = m.solutionId ? dataset().solutions.find((s) => s.id === m.solutionId) : null;
  const isBest = ch && sol && ch.bestSolutionId === sol.id;
  let extra = "";
  let actions = "";
  if (isClient && sol) {
    extra = '<div class="msg-solution"><div class="sol-head"><div class="sol-person"><span class="avatar sm">' + initials(sol.student) + '</span>' +
        '<span><strong>' + esc(sol.student) + '</strong><small>' + esc(sol.university) + ' · submitted ' + fmtDate(sol.submittedAt) + '</small></span></div>' +
        '<span class="badge ' + (isBest ? "badge-best" : "badge-soft") + '">' + (isBest ? "Best solution" : esc(sol.status)) + '</span></div>' +
      '<p class="sol-summary">' + esc(sol.summary) + '</p>' +
      '<div class="score-line"><span class="muted small">AI score</span><div class="score-bar"><span style="width:' + sol.score + '%"></span></div><strong>' + sol.score + '</strong></div>' +
      '<div class="sol-insights"><span class="insight good">' + icon("check", 12) + esc((sol.strengths || []).join(" · ")) + '</span>' +
        '<span class="insight gap">' + icon("trending", 12) + esc((sol.gaps || []).join(" · ")) + '</span></div></div>';
    actions = '<div class="msg-actions">' +
      (isBest ? '<span class="best-flag">' + icon("award", 16) + ' Best selected</span>'
        : '<button class="btn btn-primary btn-sm" onclick="markBest(\'' + ch.id + '\',\'' + sol.id + '\')">' + icon("award", 16) + ' Mark as Best</button>') +
      (sol.status !== "Best solution" ? '<button class="btn btn-ghost btn-sm" onclick="shortlistSolution(\'' + ch.id + '\',\'' + sol.id + '\')">Shortlist</button>' : '') +
      (ch ? '<a class="btn btn-ghost btn-sm" href="#/client/challenges/' + ch.id + '">View challenge</a>' : '') + '</div>';
  } else if (ch) {
    extra = '<div class="msg-challenge"><span class="cat-ico">' + icon("target", 18) + '</span><div><strong>' + esc(ch.title) + '</strong>' +
      '<p class="muted small">' + esc(ch.company) + ' · ' + esc(ch.category) + ' · ' + (isEvergreen(ch) ? "Evergreen - open forever" : daysLeft(ch) + " days left") + '</p></div></div>' +
      '<div class="tag-row">' + ch.skills.map((s) => '<span class="tag">' + esc(s) + '</span>').join("") + '</div>';
    if (isClient) {
      actions = '<div class="msg-actions"><a class="btn btn-primary btn-sm" href="#/client/challenges/' + ch.id + '">Open challenge</a></div>';
    } else {
      actions = '<div class="msg-actions"><a class="btn btn-primary btn-sm" href="#/student/challenges/' + ch.id + '">' + icon("target", 16) + ' View challenge</a></div>';
    }
  }
  const replies = (STATE.replies && STATE.replies[m.id]) || [];
  const replyHtml = replies.length
    ? '<div class="reply-list">' + replies.map((r) => '<div class="reply-bubble"><strong>You</strong><p>' + esc(r.text) + '</p><small class="muted tiny">' + esc(r.at) + '</small></div>').join("") + '</div>'
    : '';
  return '<div class="msg-detail-head"><div><span class="badge ' + (m.type === "evergreen" ? "badge-evergreen" : m.type === "best" ? "badge-best" : "badge-soft") + '">' +
      esc(m.type === "evergreen" ? "Evergreen update" : m.type === "best" ? "Best decision" : m.type === "shortlist" ? "Shortlist" : "Message") + '</span>' +
      '<h2>' + esc(m.title) + '</h2><p class="muted small">From ' + esc(m.from) + ' · ' + esc(m.time) + '</p></div>' +
      '<a class="icon-btn" href="#/' + role + '/messages" aria-label="Close message">' + icon("close", 18) + '</a></div>' +
    '<p class="msg-body">' + esc(m.body || m.preview || "") + '</p>' + extra + actions +
    (isClient ? '<div class="reply-box"><label class="field"><span>Reply</span><textarea class="input textarea small" id="reply-text-' + m.id + '" placeholder="Write a short reply to this student..."></textarea></label>' +
      '<div class="reply-foot"><button class="btn btn-ghost btn-sm" onclick="sendReply(\'' + m.id + '\')">' + icon("send", 15) + ' Send reply</button></div></div>' : '') +
    replyHtml;
}
function sendReply(msgId) {
  const el = document.getElementById("reply-text-" + msgId);
  if (!el) return;
  const text = el.value.trim();
  if (text.length < 2) { toast("Write a short reply first."); return; }
  if (!STATE.replies) STATE.replies = {};
  if (!STATE.replies[msgId]) STATE.replies[msgId] = [];
  STATE.replies[msgId].push({ text, at: new Date().toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) });
  save(); renderRoute(); toast("Reply sent.");
}

/* ---------------- settings ---------------- */
function settingsPage(role) {
  const isClient = role === "client";
  if (!explorerSelection) explorerSelection = STATE.plan;
  const profile = isClient
    ? '<section class="card panel settings-card"><div class="panel-head"><div><h2>Profile</h2><p class="muted small">Your company details.</p></div><span class="avatar">' + STATE.client.avatar + '</span></div>' +
        '<div class="form-grid"><label class="field"><span>Company name</span><input class="input" id="client-name" value="' + esc(STATE.client.name) + '"></label>' +
          '<label class="field"><span>Contact person</span><input class="input" id="client-contact" value="' + esc(STATE.client.contact) + '"></label></div>' +
        '<label class="field"><span>Email</span><input class="input" id="client-email" type="email" value="' + esc(STATE.client.email) + '"></label>' +
        '<button class="btn btn-primary btn-sm" onclick="saveClientProfile()">Save profile</button></section>'
    : '<section class="card panel settings-card"><div class="panel-head"><div><h2>Profile</h2><p class="muted small">Your student details.</p></div><span class="avatar">' + STATE.student.avatar + '</span></div>' +
        '<div class="form-grid"><label class="field"><span>Full name</span><input class="input" id="student-name" value="' + esc(STATE.student.name) + '"></label>' +
          '<label class="field"><span>University</span><input class="input" id="student-university" value="' + esc(STATE.student.university) + '"></label></div>' +
        '<label class="field"><span>Email</span><input class="input" id="student-email" type="email" value="' + esc(STATE.student.email) + '"></label>' +
        '<button class="btn btn-primary btn-sm" onclick="saveStudentProfile()">Save profile</button></section>';

  const skills = isClient ? '' :
    '<section class="card panel settings-card"><div class="panel-head"><div><h2>Your skills</h2><p class="muted small">Match scores recalculate instantly when you change these.</p></div>' +
      '<span class="badge badge-evergreen">' + STATE.student.skills.length + ' skills</span></div>' +
      '<div class="tag-row skill-edit">' + STATE.student.skills.map((s) =>
        '<span class="chip active static">' + esc(s) + '<button class="chip-x" onclick="removeStudentSkill(\'' + esc(s) + '\')" aria-label="Remove ' + esc(s) + '">' + icon("close", 12) + '</button></span>'
      ).join("") + (STATE.student.skills.length ? '' : '<span class="muted small">No skills yet - add one below.</span>') + '</div>' +
      '<div class="tag-add"><input class="input" id="new-skill" placeholder="Add a skill, e.g. Node.js" onkeydown="newSkillKey(event)">' +
        '<button class="btn btn-ghost btn-sm" onclick="addStudentSkill()">Add skill</button></div>' +
      '<div class="skill-suggest">' + D.SKILLS_LIST.filter((s) => STATE.student.skills.indexOf(s) === -1).map((s) =>
        '<button class="chip" onclick="addStudentSkill(\'' + s + '\')">+ ' + s + '</button>').join("") + '</div></section>';

  const planSection = isClient
    ? '<section class="card panel settings-card billing-card"><div class="panel-head"><div><h2>Plans & Billing</h2><p class="muted small">Choose a plan. The whole workspace updates instantly.</p></div>' +
        '<span class="plan-pill accent-' + planCfg().accent + '">Current: ' + esc(planCfg().name) + '</span></div>' +
        '<div id="plan-explorer">' + planExplorerHTML(explorerSelection) + '</div></section>'
    : '<section class="card panel settings-card"><div class="panel-head"><div><h2>Plan</h2><p class="muted small">Free includes 3 submissions per month. Premium is unlimited.</p></div>' +
        '<span class="plan-pill ' + (STATE.student.premium ? "accent-enterprise" : "") + '">' + (STATE.student.premium ? "Premium" : "Free") + '</span></div>' +
        (STATE.student.premium
          ? '<div class="premium-active"><span class="blocked-ico">' + icon("check", 22) + '</span><div><strong>Premium is active</strong><p class="muted small">Rs 500/month · unlimited submissions and priority review.</p></div></div>'
          : '<div class="upgrade-row"><div><strong>Premium - Rs 500/month</strong><p class="muted small">Unlimited submissions, priority review and a profile badge.</p></div>' +
            '<button class="btn btn-primary btn-sm" onclick="upgradePremium()">Upgrade demo</button></div>') + '</section>';

  const appearance = '<section class="card panel settings-card"><div class="panel-head"><div><h2>Appearance</h2><p class="muted small">Choose the theme you prefer. It applies across the whole dashboard.</p></div><span class="stat-ico">' + icon("sun", 18) + '</span></div>' +
    themeSwitchHTML("settings-theme") +
    '<p class="prototype-note inline">Your choice is saved on this device.</p></section>';

  const reset = '<section class="card panel settings-card"><div class="panel-head"><div><h2>Demo data</h2><p class="muted small">Reset all sample data, messages and plans to the default demo state.</p></div></div>' +
    '<button class="btn btn-ghost btn-sm danger" onclick="confirmReset()">' + icon("close", 15) + ' Reset demo</button>' +
    '<p class="prototype-note inline">Prototype with sample data. Nothing is sent to a server.</p></section>';

  return '<div class="page-head compact-head"><div><h1>Settings</h1><p class="muted">Profile, preferences and demo controls.</p></div></div>' +
    '<div class="settings-grid">' + profile + skills + appearance + planSection + reset + '</div>';
}
function saveClientProfile() {
  const name = document.getElementById("client-name").value.trim();
  const contact = document.getElementById("client-contact").value.trim();
  const email = document.getElementById("client-email").value.trim();
  if (name.length < 2 || !email.includes("@")) { toast("Add a company name and a valid email."); return; }
  STATE.client.name = name;
  STATE.client.contact = contact;
  STATE.client.email = email;
  STATE.client.avatar = initials(name);
  save(); renderRoute(); toast("Profile saved.");
}
function saveStudentProfile() {
  const name = document.getElementById("student-name").value.trim();
  const uni = document.getElementById("student-university").value.trim();
  const email = document.getElementById("student-email").value.trim();
  if (name.length < 2 || !email.includes("@")) { toast("Add a name and a valid email."); return; }
  STATE.student.name = name;
  STATE.student.university = uni;
  STATE.student.email = email;
  STATE.student.avatar = initials(name);
  save(); renderRoute(); toast("Profile saved.");
}
function addStudentSkill(value) {
  const input = document.getElementById("new-skill");
  const skill = (value || (input ? input.value : "")).trim();
  if (!skill) return;
  if (STATE.student.skills.indexOf(skill) === -1) STATE.student.skills.push(skill);
  save(); renderRoute(); toast("Skill added. Match scores recalculated.");
}
function removeStudentSkill(skill) {
  STATE.student.skills = STATE.student.skills.filter((s) => s !== skill);
  save(); renderRoute(); toast("Skill removed. Match scores recalculated.");
}
function newSkillKey(e) {
  if (e.key === "Enter") { e.preventDefault(); addStudentSkill(); }
}
function confirmReset() {
  if (confirm("Reset all demo data? This clears challenges, solutions, messages and plan changes.")) D.resetDemo();
}

/* ---------------- Plan Explorer ---------------- */
function planExplorerHTML(selected) {
  const plan = PLAN_CONFIG[selected] || PLAN_CONFIG.starter;
  const isCurrent = STATE.plan === selected;
  return '<div class="plan-explorer plan-' + plan.accent + '">' +
    '<div class="plan-selector" role="tablist" aria-label="Choose a plan">' +
      D.PLAN_ORDER.map((id) => {
        const p = PLAN_CONFIG[id];
        return '<button class="plan-option' + (selected === id ? " selected" : "") + '" role="tab" aria-selected="' + (selected === id) + '" onclick="selectExplorerPlan(\'' + id + '\')">' +
          '<span class="plan-option-top"><strong>' + p.name + '</strong>' + (STATE.plan === id ? '<span class="mini-current">Current</span>' : '') + '</span>' +
          '<span class="plan-option-price">' + D.formatPKR(p.price) + '<small>/month</small></span>' +
          '<span class="plan-option-tag">' + esc(p.tagline) + '</span></button>';
      }).join("") + '</div>' +
    '<div class="explorer-body">' +
      '<div class="explorer-head"><div><h3>' + plan.name + ' plan</h3><p class="muted small">' + esc(plan.tagline) + '</p></div>' +
        '<span class="evergreen-chip">' + icon("bolt", 14) + ' Evergreen: unlimited</span></div>' +
      '<div class="feature-grid">' + plan.features.map((f) =>
        '<div class="feature-box ' + (f.ok ? "on" : "locked") + '"><span class="feature-ico">' + icon(f.ok ? "check" : "lock", 16) + '</span>' +
          '<span><strong>' + esc(f.label) + '</strong><small>' + esc(f.value) + '</small></span></div>').join("") + '</div>' +
      '<div class="explorer-columns"><div class="what-can"><h4>What you can do</h4><ul>' +
        plan.whatYouCanDo.map((t) => '<li>' + icon("check", 14) + '<span>' + esc(t) + '</span></li>').join("") + '</ul></div>' +
        '<div class="plan-preview"><h4>Live preview</h4>' + planPreview(plan) + '</div></div>' +
      '<div class="explorer-foot">' +
        (isCurrent ? '<button class="btn btn-ghost btn-sm" disabled>' + icon("check", 16) + ' Current plan</button>'
          : '<button class="btn btn-primary btn-sm" onclick="usePlan(\'' + selected + '\')">' + icon("layers", 16) + ' Use this plan</button>') +
        '<p class="muted small">' + (selected === "starter" ? "1 active slot · 5 solutions visible" : selected === "standard" ? "3 active slots · all solutions" : "Unlimited active · custom AI weights") + '</p></div>' +
    '</div></div>';
}
function planPreview(plan) {
  if (plan.id === "starter") {
    const names = ["Bilal Ahmed", "Fatima Noor", "Hamza Ali", "Zainab Riaz", "Usman Tariq"];
    const rows = names.map((n, i) =>
      '<div class="preview-row"><span class="avatar sm">' + initials(n) + '</span><span class="preview-copy"><strong>' + n + '</strong><small>' + (64 + i * 5) + ' AI score</small></span><span class="badge badge-soft">Visible</span></div>'
    ).join("");
    return '<div class="preview-box locked-preview">' + rows +
      '<div class="preview-row preview-locked"><span class="avatar sm">??</span><span class="preview-copy"><strong>Locked solution</strong><small>Upgrade to reveal</small></span>' +
        '<span class="lock-tag">' + icon("lock", 14) + ' 6th locked</span></div>' +
      '<div class="locked-cta">' + icon("lock", 15) + ' Upgrade to unlock</div></div>';
  }
  if (plan.id === "standard") {
    const rows = dataset().solutions.slice().sort((a, b) => b.score - a.score).slice(0, 5).map((s, i) =>
      '<div class="preview-row ranked"><span class="rank-num">#' + (i + 1) + '</span><span class="preview-copy"><strong>' + esc(s.student) + '</strong>' +
        '<small>' + esc(s.strengths[0]) + ' · ' + esc(s.gaps[0]) + '</small></span>' +
        '<span class="score-mini">' + s.score + '</span></div>'
    ).join("");
    return '<div class="preview-box"><div class="preview-label">Ranked AI shortlist</div>' + rows + '</div>';
  }
  const w = STATE.enterpriseWeights;
  return '<div class="preview-box">' +
    '<div class="preview-label">Custom criteria weights</div>' +
    [["skills", "Skills fit"], ["impact", "Impact"], ["clarity", "Clarity"], ["feasibility", "Feasibility"]].map(([k, label]) =>
      '<label class="weight-row"><span>' + label + '</span><input type="range" min="0" max="100" value="' + w[k] + '" id="weight-' + k + '" oninput="updateEntWeights()" aria-label="' + label + ' weight"><b id="weight-val-' + k + '">' + w[k] + '%</b></label>'
    ).join("") +
    '<div class="preview-label">Re-ranks live</div><div id="ent-preview-list">' + entPreviewListHTML() + '</div>' +
    '<div class="manager-card"><span class="avatar">MI</span><div><strong>Mahnoor Iqbal</strong><small>Enterprise Success Manager</small><small>' + icon("phone", 12) + ' +92 300 1234567</small></div></div></div>';
}
function entPreviewListHTML() {
  return dataset().solutions.slice().sort((a, b) => weightedScore(b) - weightedScore(a)).slice(0, 4).map((s, i) =>
    '<div class="preview-row ranked"><span class="rank-num">#' + (i + 1) + '</span>' +
      '<span class="preview-copy"><strong>' + esc(s.student) + '</strong><small>' + esc(s.university) + '</small></span>' +
      '<span class="score-mini">' + weightedScore(s) + '</span></div>'
  ).join("");
}
function selectExplorerPlan(plan) {
  explorerSelection = plan;
  const host = document.getElementById("plan-explorer");
  if (host) host.innerHTML = planExplorerHTML(plan);
}
function updateEntWeights() {
  const keys = ["skills", "impact", "clarity", "feasibility"];
  keys.forEach((k) => {
    const input = document.getElementById("weight-" + k);
    if (!input) return;
    STATE.enterpriseWeights[k] = Number(input.value);
    const label = document.getElementById("weight-val-" + k);
    if (label) label.textContent = input.value + "%";
  });
  save();
  const list = document.getElementById("ent-preview-list");
  if (list) list.innerHTML = entPreviewListHTML();
}
function usePlan(plan) {
  if (!PLAN_CONFIG[plan]) return;
  STATE.plan = plan;
  explorerSelection = plan;
  save();
  renderRoute();
  toast("Switched to " + PLAN_CONFIG[plan].name + ". Your workspace has been updated.");
}

/* ---------------- boot ---------------- */
if (!location.hash) location.hash = "#/home";
renderRoute();
