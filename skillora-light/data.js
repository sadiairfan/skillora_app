/* ============================================================
   Skillora - sample data, plan configuration and storage
   Prototype only. Everything is fictional and stored locally.
   ============================================================ */

const PLAN_ORDER = ["starter", "standard", "enterprise"];

const PLAN_CONFIG = {
  starter: {
    id: "starter",
    name: "Starter",
    price: 5000,
    tagline: "For teams validating a first idea",
    accent: "starter",
    limits: {
      active: 1,
      solutionsVisible: 5,
      ai: "basic",
      support: "Email support",
      response: "1-2 days",
      private: false
    },
    features: [
      { label: "Active challenges", value: "1 at a time", ok: true },
      { label: "Solutions visible", value: "First 5 per challenge", ok: true },
      { label: "AI shortlist", value: "Basic - score only", ok: true },
      { label: "Support", value: "Email support", ok: true },
      { label: "Response time", value: "1-2 days", ok: true },
      { label: "Private challenges (NDA)", value: "Not included", ok: false }
    ],
    whatYouCanDo: [
      "Run one active challenge without pressure",
      "Review the first five solutions per challenge",
      "Get a basic AI relevance score on every solution",
      "Keep unlimited evergreen challenges open forever"
    ],
    evergreen: true
  },
  standard: {
    id: "standard",
    name: "Standard",
    price: 15000,
    tagline: "For teams hiring through real work",
    accent: "standard",
    limits: {
      active: 3,
      solutionsVisible: "all",
      ai: "full",
      support: "Priority support",
      response: "Same-day",
      private: false
    },
    features: [
      { label: "Active challenges", value: "3 at a time", ok: true },
      { label: "Solutions visible", value: "All solutions", ok: true },
      { label: "AI shortlist", value: "Full - ranked with strengths & gaps", ok: true },
      { label: "Support", value: "Priority support", ok: true },
      { label: "Response time", value: "Same-day", ok: true },
      { label: "Private challenges (NDA)", value: "Not included", ok: false }
    ],
    whatYouCanDo: [
      "Run three active challenges in parallel",
      "See every solution with no locked rows",
      "Use ranked AI shortlists with strengths and gaps",
      "Keep unlimited evergreen challenges open forever"
    ],
    evergreen: true
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: 20000,
    tagline: "For organisations building talent pipelines",
    accent: "enterprise",
    limits: {
      active: Infinity,
      solutionsVisible: "all",
      ai: "custom",
      support: "Dedicated manager",
      response: "Dedicated",
      private: true
    },
    features: [
      { label: "Active challenges", value: "Unlimited", ok: true },
      { label: "Solutions visible", value: "All solutions", ok: true },
      { label: "AI shortlist", value: "Full + custom weights", ok: true },
      { label: "Support", value: "Dedicated manager", ok: true },
      { label: "Response time", value: "Dedicated", ok: true },
      { label: "Private challenges (NDA)", value: "Included", ok: true }
    ],
    whatYouCanDo: [
      "Run unlimited active challenges",
      "Tune AI criteria weights and re-rank instantly",
      "Publish private NDA challenges for invited students",
      "Work with a dedicated account manager",
      "Keep unlimited evergreen challenges open forever"
    ],
    evergreen: true
  }
};

const COMPANIES = [
  { id: "c1", name: "Nova Tech Solutions", category: "Fintech" },
  { id: "c2", name: "SwiftLogix", category: "Logistics" },
  { id: "c3", name: "Shopora", category: "E-commerce" },
  { id: "c4", name: "AgriPulse", category: "Agri-tech" },
  { id: "c5", name: "EduForge", category: "Edtech" },
  { id: "c6", name: "MediSync", category: "Healthcare" }
];

const SKILLS_LIST = [
  "Python", "Machine Learning", "React", "Node.js", "UI/UX",
  "Data Analysis", "SQL", "Flutter", "NLP", "Digital Marketing"
];

const UNIVERSITIES = [
  "NUST Islamabad", "LUMS Lahore", "FAST NUCES", "COMSATS Islamabad",
  "UET Lahore", "IBA Karachi", "Air University", "NED University",
  "GIKI", "Punjab University", "SZABIST", "Habib University"
];

/* Master challenge library. Each plan receives its own subset below. */
const MASTER_CHALLENGES = [
  {
    id: "ch-route", title: "Route Clustering for Last-Mile Delivery", company: "SwiftLogix",
    category: "Logistics", skills: ["Python", "Data Analysis"], daysOld: 12, deadlineDays: 18,
    description: "Our riders cover overlapping areas and fuel costs are rising. Build a clustering model that groups delivery stops into efficient routes using one month of anonymised order data. We care about explainability as much as accuracy."
  },
  {
    id: "ch-fraud", title: "Real-Time Fraud Detection Rules Engine", company: "Nova Tech Solutions",
    category: "Fintech", skills: ["Machine Learning", "Python", "SQL"], daysOld: 420, deadlineDays: 24,
    description: "Design an explainable rules engine that flags suspicious wallet transactions in under 300ms. Include how you would evaluate false positives and how the rules would evolve over time."
  },
  {
    id: "ch-reco", title: "Product Recommender Interface Refresh", company: "Shopora",
    category: "E-commerce", skills: ["React", "UI/UX", "Data Analysis"], daysOld: 9, deadlineDays: 21,
    description: "Shoppers ignore our current recommendation rail. Redesign the discovery experience for mobile and propose how to measure whether the new interface actually increases add-to-cart rate."
  },
  {
    id: "ch-cold", title: "Cold-Chain Temperature Alert System", company: "SwiftLogix",
    category: "Logistics", skills: ["Flutter", "Node.js"], daysOld: 14, deadlineDays: 20,
    description: "Vaccine shipments occasionally arrive outside the safe temperature range. Propose a low-cost monitoring and alert flow for drivers, warehouse staff and the control room."
  },
  {
    id: "ch-loan", title: "Loan Risk Scoring for Micro-Finance", company: "Nova Tech Solutions",
    category: "Fintech", skills: ["Machine Learning", "SQL", "Python"], daysOld: 18, deadlineDays: 27,
    description: "Traditional credit scores exclude first-time borrowers. Build a responsible risk model from alternative data and explain how you would avoid unfair bias."
  },
  {
    id: "ch-cart", title: "Cart Abandonment Recovery Engine", company: "Shopora",
    category: "E-commerce", skills: ["Digital Marketing", "Data Analysis"], daysOld: 6, deadlineDays: 16,
    description: "Two out of three carts are abandoned. Design a recovery journey across email, SMS and in-app nudges that feels helpful rather than pushy, with a clear measurement plan."
  },
  {
    id: "ch-crop", title: "Crop Disease Detection from Leaf Photos", company: "AgriPulse",
    category: "Agri-tech", skills: ["Python", "Machine Learning"], daysOld: 365, deadlineDays: 30,
    description: "Smallholder farmers need fast diagnosis using only a phone photo. Propose a lightweight model, an offline-friendly capture flow and a confidence threshold that avoids harmful false advice."
  },
  {
    id: "ch-irrig", title: "Smart Irrigation Dashboard", company: "AgriPulse",
    category: "Agri-tech", skills: ["React", "Data Analysis"], daysOld: 300, deadlineDays: 25,
    description: "Farm managers want one screen that combines soil moisture, weather and pump status. Design the dashboard and define the three alerts that matter most."
  },
  {
    id: "ch-quiz", title: "Adaptive Quiz Engine", company: "EduForge",
    category: "Edtech", skills: ["NLP", "React"], daysOld: 8, deadlineDays: 19,
    description: "Students either get bored or overwhelmed by fixed quizzes. Propose an adaptive difficulty engine and the student-facing experience that keeps them in flow."
  },
  {
    id: "ch-dropout", title: "Student Dropout Prediction", company: "EduForge",
    category: "Edtech", skills: ["Machine Learning", "SQL"], daysOld: 500, deadlineDays: 28,
    description: "Identify learners at risk of dropping out two weeks before it happens. Work with engagement logs and explain how counsellors should act on the predictions."
  },
  {
    id: "ch-triage", title: "Patient Triage Assistant", company: "MediSync",
    category: "Healthcare", skills: ["NLP", "Python"], daysOld: 11, deadlineDays: 23,
    description: "Build a safe, non-diagnostic triage assistant that helps front-desk staff route walk-in patients. Private challenge: access requires an NDA and verified student status.",
    visibility: "Private · NDA"
  },
  {
    id: "ch-booking", title: "Clinic Booking App", company: "MediSync",
    category: "Healthcare", skills: ["Flutter", "UI/UX"], daysOld: 16, deadlineDays: 22,
    description: "Patients abandon clinic bookings when slots are unclear. Design a booking flow for low-literacy users and outline the edge cases for walk-ins.",
    visibility: "Private · NDA"
  },
  {
    id: "ch-supplier", title: "Supplier Sentiment Analysis", company: "SwiftLogix",
    category: "Logistics", skills: ["NLP", "Python"], daysOld: 600, deadlineDays: 26,
    description: "Operations reads hundreds of supplier emails every week. Build a sentiment and urgency classifier, and show how it should route messages to the right team."
  },
  {
    id: "ch-loyalty", title: "Loyalty Personalization Engine", company: "Shopora",
    category: "E-commerce", skills: ["Machine Learning", "Data Analysis"], daysOld: 280, deadlineDays: 29,
    description: "Our loyalty tiers feel generic. Propose a personalisation engine that rewards behaviour we actually want, without creating a discount spiral."
  },
  {
    id: "ch-kyc", title: "KYC Document Parser", company: "Nova Tech Solutions",
    category: "Fintech", skills: ["Python", "NLP"], daysOld: 200, deadlineDays: 27,
    description: "Manual KYC review takes too long. Build a document extraction pipeline for CNIC and utility bills, with a human review step for low-confidence fields."
  },
  {
    id: "ch-farmer", title: "Farmer Advisory Chatbot", company: "AgriPulse",
    category: "Agri-tech", skills: ["NLP", "Flutter"], daysOld: 730, deadlineDays: 30,
    description: "Farmers need advice in Urdu and local dialects. Propose a chatbot grounded in verified agronomy content with a clear escalation path to a human expert."
  },
  {
    id: "ch-lecture", title: "Lecture Summarizer for Students", company: "EduForge",
    category: "Edtech", skills: ["NLP", "Python"], daysOld: 150, deadlineDays: 24,
    description: "Students record lectures but rarely revisit them. Build a summariser that produces structured notes, key terms and a short self-test."
  },
  {
    id: "ch-monitor", title: "Remote Patient Monitoring Alerts", company: "MediSync",
    category: "Healthcare", skills: ["Node.js", "React"], daysOld: 400, deadlineDays: 28,
    description: "Home monitoring devices generate too many alerts. Design a signal-processing and escalation flow that reduces alert fatigue for nurses."
  }
];

const ACTIVE_BY_PLAN = {
  starter: ["ch-reco"],
  standard: ["ch-route", "ch-cold", "ch-loan"],
  enterprise: ["ch-route", "ch-cold", "ch-cart", "ch-quiz", "ch-triage", "ch-booking"]
};

const EVERGREEN_BY_PLAN = {
  starter: ["ch-fraud", "ch-crop"],
  standard: ["ch-fraud", "ch-crop", "ch-cart", "ch-loyalty"],
  enterprise: ["ch-fraud", "ch-reco", "ch-loan", "ch-crop", "ch-irrig", "ch-dropout", "ch-supplier", "ch-kyc"]
};

const SOLUTION_COUNT_BY_PLAN = { starter: 6, standard: 12, enterprise: 24 };

const STUDENT_NAMES = [
  "Ayesha Khan", "Bilal Ahmed", "Fatima Noor", "Hamza Ali", "Zainab Riaz",
  "Usman Tariq", "Mariam Siddiqui", "Ali Raza", "Sana Javed", "Ahmed Hassan",
  "Hira Shah", "Danish Iqbal", "Noor Fatima", "Omar Farooq", "Iqra Aslam",
  "Saad Malik", "Rabia Anwar", "Talha Javed", "Mehwish Khan", "Kashif Ali",
  "Anum Shahid", "Faizan Ahmed", "Mahnoor Baig", "Haris Nadeem"
];

const SOLUTION_SUMMARIES = [
  "Proposed a two-stage approach: a fast heuristic first, then a model only for uncertain cases. Included an evaluation plan and a fallback for low-confidence inputs.",
  "Built a prototype with explainable features and a lightweight review dashboard. The write-up covers data cleaning, validation and the trade-off between precision and recall.",
  "Mapped the current journey, interviewed five users, and redesigned the flow around the most common failure point. Included accessibility notes and success metrics.",
  "Delivered a working proof of concept with a clear architecture diagram, sample outputs and a cost estimate for a six-week pilot.",
  "Focused on a human-in-the-loop design so staff can correct the system. Added confidence thresholds, audit logging and an escalation path.",
  "Compared three modelling strategies on a public dataset, documented the results honestly, and recommended the simplest option that met the target.",
  "Created a mobile-first prototype with offline support and Urdu microcopy. Tested it with eight users and summarised the findings.",
  "Proposed a phased rollout: manual review first, assisted mode second, automation only after measurable accuracy. Includes a risk register.",
  "Designed the data pipeline end to end and highlighted where personal data should be minimised or masked.",
  "Built a small demo and a monitoring plan. The solution explains how to detect drift and when to retrain.",
  "Turned the brief into three user personas and a prioritised backlog. The interactive prototype covers the highest-impact path.",
  "Used a rule-based baseline to make the system transparent, then layered a model for ranking. Includes a clear explanation of every rule.",
  "Delivered a concise technical brief with an ERD, API contract and test plan. Also included a costed 30-day implementation roadmap.",
  "Focused on fairness: tested the approach across segments, documented limitations and proposed a monthly bias review.",
  "Built a clickable prototype and a short video walkthrough. The solution keeps the interface simple and surfaces one clear next action.",
  "Proposed an event-driven design with a queue, retries and idempotency. Includes failure scenarios and a graceful degradation path.",
  "Created a no-code first version to validate demand, with a clear plan for replacing each component later.",
  "Combined quantitative analysis with five stakeholder interviews. The recommendation is pragmatic and includes what not to build.",
  "Delivered a notebook, a short report and a dashboard mock. Every assumption is labelled and every metric has a definition.",
  "Designed for low-bandwidth conditions: compressed assets, cached responses and a clear offline state.",
  "Proposed a small pilot with two teams, success criteria and a stop condition. The solution avoids over-engineering.",
  "Built an evaluation harness before building the model, so quality claims are reproducible and honest.",
  "Focused on trust: plain-language explanations, a visible confidence score and an easy way to request a human.",
  "Presented a phased plan, a working prototype and a measurement framework. The demo covers the core happy path and two edge cases."
];

const STRENGTHS = [
  "Clear problem framing", "Strong evaluation plan", "Practical scope",
  "Good user empathy", "Solid technical depth", "Thoughtful risk handling"
];
const GAPS = [
  "Could add cost estimates", "Needs more user testing", "Edge cases thin",
  "Measurement plan light", "Unclear rollout", "Data privacy needs detail"
];

const MONTH_KEY = () => {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
};

const DAY_MS = 86400000;

function makeDate(daysAgo) {
  return new Date(Date.now() - daysAgo * DAY_MS).toISOString();
}

function metricsFor(i) {
  return {
    skills: 58 + ((i * 11) % 40),
    impact: 55 + ((i * 13) % 42),
    clarity: 60 + ((i * 7) % 37),
    feasibility: 52 + ((i * 17) % 45)
  };
}

/* Build a completely separate dataset for each plan. */
function buildPlanDataset(planId) {
  const plan = PLAN_CONFIG[planId];
  const activeIds = ACTIVE_BY_PLAN[planId];
  const evergreenIds = EVERGREEN_BY_PLAN[planId];
  const allIds = activeIds.concat(evergreenIds);
  const now = Date.now();

  const challenges = allIds.map((id) => {
    const base = MASTER_CHALLENGES.find((c) => c.id === id);
    const isEvergreenSeed = evergreenIds.indexOf(id) !== -1;
    const createdAt = now - base.daysOld * DAY_MS;
    return {
      id: base.id,
      title: base.title,
      description: base.description,
      company: base.company,
      category: base.category,
      skills: base.skills.slice(),
      visibility: base.visibility || "Public",
      createdAt,
      deadline: now + (base.deadlineDays || 21) * DAY_MS,
      bestSolutionId: null,
      seededEvergreen: isEvergreenSeed
    };
  });

  const solutions = [];
  const total = SOLUTION_COUNT_BY_PLAN[planId];
  for (let i = 0; i < total; i++) {
    const chId = evergreenIds[i % evergreenIds.length];
    const isAyesha = i % 4 === 0;
    const name = isAyesha ? "Ayesha Khan" : STUDENT_NAMES[(i + 1) % STUDENT_NAMES.length];
    const score = 64 + ((i * 7) % 34);
    const ageOptions = [9, 21, 45, 90, 180, 365, 420, 730];
    const daysAgo = ageOptions[(i + evergreenIds.indexOf(chId)) % ageOptions.length];
    const statuses = ["Submitted", "Under review", "Shortlisted", "Shortlisted"];
    solutions.push({
      id: "sol-" + planId + "-" + (i + 1),
      challengeId: chId,
      student: name,
      studentId: isAyesha ? "student" : "s" + i,
      university: UNIVERSITIES[i % UNIVERSITIES.length],
      score,
      summary: SOLUTION_SUMMARIES[i % SOLUTION_SUMMARIES.length],
      strengths: [STRENGTHS[i % STRENGTHS.length], STRENGTHS[(i + 2) % STRENGTHS.length]],
      gaps: [GAPS[i % GAPS.length]],
      metrics: metricsFor(i),
      link: "https://portfolio.example.pk/solution-" + (i + 1),
      fileName: "solution-" + (i + 1) + ".pdf",
      submittedAt: makeDate(daysAgo),
      status: statuses[i % statuses.length],
      isAyesha
    });
  }

  /* Pick a best solution for some evergreen challenges (one per challenge). */
  evergreenIds.forEach((chId, idx) => {
    const ch = challenges.find((c) => c.id === chId);
    const chSolutions = solutions.filter((s) => s.challengeId === chId);
    if (!chSolutions.length) return;
    chSolutions.sort((a, b) => b.score - a.score);
    let best;
    if (idx === 0) {
      const ayesha = chSolutions.find((s) => s.isAyesha);
      best = ayesha || chSolutions[0];
    } else if (idx % 3 === 1) {
      best = chSolutions[0];
    }
    if (best) {
      best.status = "Best solution";
      ch.bestSolutionId = best.id;
    }
  });

  /* Messages */
  const messages = [];
  messages.push({
    id: "msg-" + planId + "-evergreen",
    to: "client",
    type: "evergreen",
    from: "Skillora AI",
    title: "A better solution was submitted 14 months later",
    preview: "Evergreen challenge: " + (challenges.find((c) => c.id === evergreenIds[0]) || challenges[0]).title,
    body: "A new solution scored higher than the current Best. The problem stays open, so you can review the improvement and change the Best at any time.",
    time: "2h ago",
    unread: true,
    challengeId: evergreenIds[0],
    solutionId: (solutions.find((s) => s.challengeId === evergreenIds[0]) || {}).id,
    createdAt: now - 2 * 3600000
  });

  solutions.forEach((s, i) => {
    const ch = challenges.find((c) => c.id === s.challengeId);
    messages.push({
      id: "msg-" + planId + "-sol-" + s.id,
      to: "client",
      type: "solution",
      from: s.student,
      title: "New solution for " + (ch ? ch.title : "challenge"),
      preview: s.summary.slice(0, 90) + "…",
      body: s.summary,
      time: (i + 1) + "h ago",
      unread: i < 2,
      challengeId: s.challengeId,
      solutionId: s.id,
      createdAt: now - (i + 1) * 3600000
    });
  });

  challenges.filter((c) => !c.seededEvergreen).slice(0, 2).forEach((c, i) => {
    messages.push({
      id: "msg-" + planId + "-new-" + c.id,
      to: "student",
      type: "challenge",
      from: c.company,
      title: "New challenge posted: " + c.title,
      preview: "Match " + (78 + i * 7) + "% · " + c.category,
      body: "A new challenge was posted by " + c.company + ". Your skill profile matches this problem.",
      time: (i + 1) + "h ago",
      unread: i === 0,
      challengeId: c.id,
      createdAt: now - (i + 1) * 3600000
    });
  });

  solutions.filter((s) => s.isAyesha).slice(0, 2).forEach((s, i) => {
    const ch = challenges.find((c) => c.id === s.challengeId);
    messages.push({
      id: "msg-" + planId + "-ays-" + s.id,
      to: "student",
      type: s.status === "Best solution" ? "best" : "shortlist",
      from: ch ? ch.company : "Skillora",
      title: s.status === "Best solution" ? "Your solution was marked Best" : "Your solution was shortlisted",
      preview: ch ? ch.title : "",
      body: s.status === "Best solution"
        ? "Congratulations! Your solution was marked as the Best solution. The challenge stays open for future improvements."
        : "Your solution was shortlisted. The client is reviewing it alongside other submissions.",
      time: (i + 3) + "d ago",
      unread: false,
      challengeId: s.challengeId,
      createdAt: now - (i + 3) * DAY_MS
    });
  });

  return { challenges, solutions, messages };
}

function freshState() {
  const datasets = {};
  PLAN_ORDER.forEach((p) => { datasets[p] = buildPlanDataset(p); });
  return {
    plan: "starter",
    datasets,
    student: {
      name: "Ayesha Khan",
      email: "ayesha.khan@example.pk",
      avatar: "AK",
      university: "NUST Islamabad",
      verified: true,
      skills: ["Python", "Machine Learning", "React", "UI/UX"],
      premium: false,
      monthly: { key: MONTH_KEY(), count: 1 }
    },
    client: {
      name: "Nova Tech Solutions",
      email: "hr@novatech.pk",
      avatar: "NT",
      contact: "Sara Imran"
    },
    enterpriseWeights: { skills: 40, impact: 25, clarity: 20, feasibility: 15 },
    replies: {}
  };
}

function getState() {
  try {
    const raw = localStorage.getItem("skillora_state_v2");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.datasets && parsed.datasets.starter) return parsed;
    }
  } catch (e) { /* ignore corrupt storage */ }
  const s = freshState();
  saveState(s);
  return s;
}

function saveState(state) {
  try { localStorage.setItem("skillora_state_v2", JSON.stringify(state)); } catch (e) { /* ignore */ }
}

function resetDemo() {
  try {
    localStorage.removeItem("skillora_state_v2");
    localStorage.removeItem("skillora_session");
  } catch (e) { /* ignore */ }
  location.hash = "#/home";
  location.reload();
}

function getDataset(state) {
  const plan = state.plan && state.datasets[state.plan] ? state.plan : "starter";
  return state.datasets[plan];
}

function getPlanConfig(state) {
  return PLAN_CONFIG[state.plan] || PLAN_CONFIG.starter;
}

function formatPKR(n) {
  return "Rs " + Number(n).toLocaleString("en-PK");
}

function currentMonthCount(state) {
  if (!state.student.monthly || state.student.monthly.key !== MONTH_KEY()) {
    state.student.monthly = { key: MONTH_KEY(), count: 0 };
  }
  return state.student.monthly.count;
}

/* Expose for app.js (classic scripts share global scope). */
window.SkilloraData = {
  PLAN_ORDER, PLAN_CONFIG, COMPANIES, SKILLS_LIST, UNIVERSITIES,
  MASTER_CHALLENGES, getState, saveState, resetDemo, getDataset,
  getPlanConfig, formatPKR, currentMonthCount, MONTH_KEY
};
