/**
 * IIC Studio backend — Google Apps Script web app (deploy: Execute as Me, access Anyone).
 *
 * Everything is one POST endpoint: body is JSON (sent as text/plain), {action, ...}.
 * - Programs and users live in Script Properties (PROGRAMS, USERS).
 * - Studio bookings are events on the account's Google Calendar (tag icstudio=1).
 * - Sign-in tokens live in the script cache for 6 hours.
 *
 * Script Properties (Project Settings → Script Properties):
 *   ADMIN_EMAIL, ADMIN_PASSWORD   the first site admin; run setup() once after setting them
 *   OWNER_EMAIL                   where booking notifications go (defaults to this Google account)
 *   CALENDAR_ID                   optional; defaults to the account's main calendar
 *   SITE_URL                      optional; the public site address used in email links (defaults to https://iicstudio.com)
 *   STUDIO_WHATSAPP, STUDIO_MAP, STUDIO_ADDRESS, STUDIO_ADDRESS_EN   optional; override the studio contact constants below
 *   WA_TOKEN, WA_PHONE_ID         WhatsApp Cloud API: the access token and the sender's phone number ID.
 *                                 A Dualhook key (dh_live_...) is sent through api.dualhook.com, a Meta token straight to Meta.
 *                                 With both set, every booking gets a WhatsApp confirmation and a reminder an hour before;
 *                                 run setupReminders() once to start the reminder timer.
 *   WA_360_KEY                    instead of WA_TOKEN + WA_PHONE_ID: the 360dialog API key, for a number that stays on the
 *                                 WhatsApp Business app too (Coexistence)
 *
 * Roles: admin (everything, manages users) · editor (programs, cancels bookings)
 *        crew (updates recorded / edited counts only) · team (sees who booked)
 */

const TZ = "Asia/Dubai";
const DAY_START = 14, DAY_END = 20;          // 2 pm to 8 pm
const BOOK_DAYS = [3, 4, 7];                 // ISO weekday: Wednesday, Thursday, Sunday
const MAX_PER_DAY = 3, DURATIONS = [1, 2];
const AHEAD_DAYS = 90;
const MIN_LEAD_HOURS = 24;                   // a booking must start at least this many hours from now
const REMIND_HOURS = 12;                     // the WhatsApp reminder goes out about this many hours before
const CATEGORIES = {muslim: ["مسلمين بالأصل", "Born Muslims"], newMuslim: ["مسلمين جدد", "New Muslims"], nonMuslim: ["غير مسلمين", "Non-Muslims"]};   // a booking may pick several: "muslim,newMuslim"
const CANCEL_REASONS = {forgot: ["النسيان", "I forgot"], busy: ["الانشغال", "I'm busy"], emergency: ["ظرف طارئ", "An emergency"], other: ["أخرى", "Other"]};
const TOKEN_TTL = 21600;                     // seconds
const ROLES = ["admin", "editor", "crew", "team"];
const TYPES = ["series", "shorts", "course", "single", ""];
const SITE_NAME = "IIC Studio · مركز المعلومات الإسلامي";

/** Studio contact, shown in the booking receipt (email and the site's confirmation). Leave a value empty to hide it. */
const STUDIO_WHATSAPP = "971523339065";      // the studio's WhatsApp number, digits with country code, e.g. "971501234567"
const STUDIO_MAP = "https://maps.app.goo.gl/Mv9mnjbwJZ3UXMAt6";   // Google Maps link to the studio
const STUDIO_ADDRESS = "مسجد عمر بن الخطاب - الحضيبة";   // the address in words, e.g. "مركز المعلومات الإسلامي، دبي"
// WhatsApp template names in Meta, per message and language. The two Arabic templates hold each
// other's text (the confirmation text sits under icstudio_reminder), so they are crossed here on purpose.
const WA_TEMPLATES = {booked: {ar: "icstudio_reminder", en: "iicstudio_booked"}, reminder: {ar: "icstudio_booked", en: "iicstudio_reminder"}};
const STUDIO_ADDRESS_EN = "Omar Bin Al Khattab Mosque - Al Hudaiba";   // the same address for English messages

/** The programs entered so far; written on the first setup(). */
const SEED_PROGRAMS = [
  {id:"prophets", ar:"قصص الأنبياء", en:"Prophet Stories", presenter:"إسماعيل", presenterEn:"Ismail", type:"", lang:"", note:"", total:30, done:2, due:"2026-12-31"},
  {id:"dawah", ar:"سلسلة دعوية", en:"Dawah Series", presenter:"إسماعيل", presenterEn:"Ismail", type:"shorts", lang:"", note:"", total:60, done:null, due:"2026-11-01"},
  {id:"steps30", ar:"30 خطوة", en:"30 Steps", presenter:"إسماعيل", presenterEn:"Ismail", type:"shorts", lang:"", note:"", total:30, done:null, due:"2026-10-31"},
  {id:"nma3", ar:"المستوى الثالث", en:"Level 3", presenter:"إسماعيل", presenterEn:"Ismail", type:"course", lang:"", note:"أكاديمية المسلم الجديد", total:129, done:31, due:"2026-12-31"},
  {id:"hisn", ar:"حصن المسلم", en:"Hisn Al-Muslim", presenter:"الشيخ تيم همبل", presenterEn:"Sheikh Tim Humble", type:"series", lang:"", note:"", total:20, done:12, due:"2026-12-31"},
  {id:"names-tim", ar:"أسماء الله الحسنى", en:"Beautiful Names of Allah", presenter:"الشيخ تيم همبل", presenterEn:"Sheikh Tim Humble", type:"series", lang:"", note:"", total:71, done:null, due:"2027-02-28"},
  {id:"seerah", ar:"السيرة المختصرة", en:"Seerah", presenter:"الشيخ تيم همبل", presenterEn:"Sheikh Tim Humble", type:"series", lang:"", note:"", total:22, done:null, due:"2027-04-30"},
  {id:"manhaj", ar:"المنهج الصحيح", en:"Al-Manhaj", presenter:"الشيخ تيم همبل", presenterEn:"Sheikh Tim Humble", type:"series", lang:"", note:"", total:10, done:null, due:"2027-06-30"},
  {id:"family", ar:"سلسلة الأسرة", en:"Family Series", presenter:"الشيخ عبدالله السويدي", presenterEn:"Sheikh Abdullah Al Suwaidi", type:"series", lang:"", note:"", total:20, done:null, due:"2026-11-30"},
  {id:"tahil-en", ar:"تأهيل الدعاة", en:"Taahil Al-Du'at", presenter:"الشيخ عبدالله السويدي", presenterEn:"Sheikh Abdullah Al Suwaidi", type:"series", lang:"en", note:"", total:null, done:null, due:""},
  {id:"reminders", ar:"التذكيرات", en:"Reminders", presenter:"الشيخ عبدالله السويدي", presenterEn:"Sheikh Abdullah Al Suwaidi", type:"", lang:"", note:"", total:null, done:null, due:"", finished:true},
  {id:"present-islam", ar:"كيف تعرض الإسلام", en:"How to Present Islam", presenter:"الشيخ عبدالله السويدي", presenterEn:"Sheikh Abdullah Al Suwaidi", type:"", lang:"", note:"", total:null, done:null, due:"", finished:true},
  {id:"tahil-ar", ar:"تأهيل الدعاة", en:"Taahil Al-Du'at", presenter:"الشيخ محمد خليفة", presenterEn:"Sheikh Mohammed Khalifa", type:"series", lang:"ar", note:"", total:null, done:null, due:""},
  {id:"shubuhat", ar:"شبهات في العقيدة", en:"Shubuhat", presenter:"فارس الحمادي", presenterEn:"Faris Al Hammadi", type:"series", lang:"", note:"", total:14, done:null, due:""},
  {id:"arabic", ar:"اللغة العربية", en:"Arabic Language", presenter:"علي إبراهيم", presenterEn:"Ali Ibrahim", type:"", lang:"", note:"", total:18, done:2, due:"2026-12-31"}
];

/** Run once from the editor: grants Calendar and Gmail access, seeds programs, creates the first admin. */
function setup(){
  const props = PropertiesService.getScriptProperties();
  calendar_();
  if (!props.getProperty("PROGRAMS")) saveJson_("PROGRAMS", SEED_PROGRAMS.map((p, i) => Object.assign({order: i + 1}, p)));
  const email = (props.getProperty("ADMIN_EMAIL") || "").trim().toLowerCase();
  const password = props.getProperty("ADMIN_PASSWORD") || "";
  if (email && password){
    const users = loadJson_("USERS", []).filter(u => u.email !== email);
    users.push(Object.assign({email: email, name: "مدير الموقع", role: "admin"}, hashNew_(password)));
    saveJson_("USERS", users);
    props.deleteProperty("ADMIN_PASSWORD");           // stored only as a hash from now on
  }
  Logger.log("Ready. Calendar: " + calendar_().getName() + " · notifications to " + ownerEmail_() + " · users: " + loadJson_("USERS", []).length);
}

function doGet(){ return json_({ok:true, service:"IIC Studio"}); }

function doPost(e){
  try {
    const b = JSON.parse((e.postData && e.postData.contents) || "{}");
    const fn = ACTIONS[b.action];
    return json_(fn ? fn(b) : {ok:false, error:"unknown"});
  } catch (err) { return json_({ok:false, error:"server", message:String(err)}); }
}

const ACTIONS = {
  state: () => ({ok:true, programs: programsOut_(), bookings: bookings_().map(publicBooking_), views: views_()}),
  book: b => book_(b),
  login: b => login_(b),
  me: b => { const u = user_(b.token); return u ? {ok:true, user: safeUser_(u)} : {ok:false, error:"auth"}; },
  logout: b => { CacheService.getScriptCache().remove("t:" + b.token); return {ok:true}; },
  details: b => guard_(b.token, "team", () => ({ok:true, bookings: bookings_()})),
  cancel: b => guard_(b.token, "editor", () => cancel_(b.id)),
  exportBookings: b => guard_(b.token, "editor", () => exportBookings_(b.from, b.to)),
  guestCancel: b => guestCancel_(b.id, b.k, b.confirm === true, b.reason, b.reasonText),
  saveProgram: b => guard_(b.token, "editor", () => saveProgram_(b.program)),
  deleteProgram: b => guard_(b.token, "editor", () => deleteProgram_(b.id)),
  updateCounts: b => guard_(b.token, "crew", () => updateCounts_(b.id, b.recorded, b.done)),
  saveViews: b => guard_(b.token, "editor", () => saveViews_(b.month, b.counts, b.platforms)),
  reportStats: b => guard_(b.token, "editor", () => reportStats_(b.from, b.to)),
  monthStats: b => guard_(b.token, "editor", () => ({ok:true, stats: loadJson_("MONTHLY", {})})),
  saveMonthStats: b => guard_(b.token, "editor", () => saveMonthStats_(b.month, b.values, b.base, b.mode)),
  listUsers: b => guard_(b.token, "admin", () => ({ok:true, users: loadJson_("USERS", []).map(safeUser_)})),
  saveUser: b => guard_(b.token, "admin", u => saveUser_(b.user, u)),
  deleteUser: b => guard_(b.token, "admin", u => deleteUser_(b.email, u)),
  changePassword: b => guard_(b.token, "team", u => changePassword_(u, b.current, b.next))
};

/* ---------- sign-in ---------- */

function login_(b){
  const email = String(b.email || "").trim().toLowerCase();
  const u = loadJson_("USERS", []).find(x => x.email === email);
  if (!u || hash_(u.salt, String(b.password || "")) !== u.hash){ Utilities.sleep(600); return {ok:false, error:"auth"}; }
  const token = Utilities.getUuid() + Utilities.getUuid().replace(/-/g, "");
  CacheService.getScriptCache().put("t:" + token, email, TOKEN_TTL);
  return {ok:true, token: token, user: safeUser_(u)};
}

function user_(token){
  if (!token) return null;
  const email = CacheService.getScriptCache().get("t:" + token);
  return email ? loadJson_("USERS", []).find(x => x.email === email) || null : null;
}

function guard_(token, need, fn){
  const u = user_(token);
  if (!u) return {ok:false, error:"auth"};
  if (ROLES.indexOf(u.role) > ROLES.indexOf(need)) return {ok:false, error:"forbidden"};
  return fn(u);
}

/* ---------- users ---------- */

function saveUser_(input, me){
  const email = String((input && input.email) || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || ROLES.indexOf(input.role) < 0) return {ok:false, error:"invalid"};
  const users = loadJson_("USERS", []);
  let u = users.find(x => x.email === email);
  if (u && u.email === me.email && input.role !== "admin") return {ok:false, error:"self"};
  if (!u){
    if (!input.password || String(input.password).length < 8) return {ok:false, error:"password"};
    u = {email: email};
    users.push(u);
  }
  u.name = clean_(input.name, 80) || email;
  u.role = input.role;
  if (input.password){
    if (String(input.password).length < 8) return {ok:false, error:"password"};
    Object.assign(u, hashNew_(String(input.password)));
  }
  saveJson_("USERS", users);
  return {ok:true, users: users.map(safeUser_)};
}

function deleteUser_(email, me){
  email = String(email || "").toLowerCase();
  if (email === me.email) return {ok:false, error:"self"};
  const users = loadJson_("USERS", []).filter(x => x.email !== email);
  saveJson_("USERS", users);
  return {ok:true, users: users.map(safeUser_)};
}

function changePassword_(u, current, next){
  if (hash_(u.salt, String(current || "")) !== u.hash) return {ok:false, error:"auth"};
  if (String(next || "").length < 8) return {ok:false, error:"password"};
  const users = loadJson_("USERS", []);
  Object.assign(users.find(x => x.email === u.email), hashNew_(String(next)));
  saveJson_("USERS", users);
  return {ok:true};
}

function safeUser_(u){ return {email: u.email, name: u.name, role: u.role}; }
function hashNew_(password){ const salt = Utilities.getUuid(); return {salt: salt, hash: hash_(salt, password)}; }
function hash_(salt, password){
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + ":" + password, Utilities.Charset.UTF_8);
  return bytes.map(x => ("0" + (x & 255).toString(16)).slice(-2)).join("");
}

/* ---------- programs ---------- */

function programs_(){ return loadJson_("PROGRAMS", []); }

/* Episode links live one property per program (EPS_<id>), so a long list never pushes PROGRAMS past the 9 KB property limit. */
const MAX_EPS = 300;
function programsOut_(list){
  const all = PropertiesService.getScriptProperties().getProperties();
  return (list || programs_()).map(p => {
    let eps = [];
    try { eps = all["EPS_" + p.id] ? JSON.parse(all["EPS_" + p.id]) : []; } catch (e) {}
    return Object.assign({}, p, {eps: eps});
  });
}
function cleanEps_(eps){
  if (!Array.isArray(eps)) return null;
  const out = eps.slice(0, MAX_EPS).map(u => { u = String(u == null ? "" : u).trim(); return /^https?:\/\/\S+$/i.test(u) ? u.slice(0, 300) : ""; });
  while (out.length && !out[out.length - 1]) out.pop();
  return out;
}
function saveEps_(id, eps){
  const props = PropertiesService.getScriptProperties();
  if (!eps || !eps.length) props.deleteProperty("EPS_" + id);
  else props.setProperty("EPS_" + id, JSON.stringify(eps));
}

function saveProgram_(p){
  if (!p) return {ok:false, error:"invalid"};
  const num = v => (v === "" || v == null) ? null : (isFinite(Number(v)) && Number(v) >= 0 ? Math.min(Math.floor(Number(v)), 9999) : null);
  const row = {
    ar: clean_(p.ar, 120), en: clean_(p.en, 120),
    presenter: clean_(p.presenter, 80), presenterEn: clean_(p.presenterEn, 80),
    type: TYPES.indexOf(p.type) >= 0 ? p.type : "", lang: /^[a-z]{2,3}$/.test(String(p.lang || "")) ? String(p.lang) : "",
    note: clean_(p.note, 120), total: num(p.total), recorded: num(p.recorded), done: num(p.done),
    due: /^\d{4}-\d{2}-\d{2}$/.test(String(p.due || "")) ? p.due : "",
    finished: !!p.finished, order: num(p.order),
    link: /^https?:\/\/\S+$/i.test(String(p.link || "").trim()) ? clean_(p.link, 500) : ""
  };
  if (!row.ar || !row.presenter) return {ok:false, error:"invalid"};
  const list = programs_();
  const lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    let cur = p.id ? list.find(x => x.id === p.id) : null;
    if (!cur){
      cur = {id: "p" + Date.now().toString(36)};
      list.push(cur);
    }
    if (row.order == null) row.order = cur.order != null ? cur.order : list.reduce((m, x) => Math.max(m, x.order || 0), 0) + 1;
    Object.assign(cur, row);
    saveJson_("PROGRAMS", list);
    const eps = cleanEps_(p.eps);   // left as is when an older admin page sends no list
    if (eps) saveEps_(cur.id, eps);
  } finally { lock.releaseLock(); }
  return {ok:true, programs: programsOut_(list)};
}

/** Recording and editing counts only — what the production crew may change. */
function updateCounts_(id, recorded, done){
  const num = v => (v === "" || v == null) ? null : (isFinite(Number(v)) && Number(v) >= 0 ? Math.min(Math.floor(Number(v)), 9999) : null);
  const lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    const list = programs_(), p = list.find(x => x.id === id);
    if (!p) return {ok:false, error:"invalid"};
    p.recorded = num(recorded); p.done = num(done);
    saveJson_("PROGRAMS", list);
    return {ok:true, programs: programsOut_(list)};
  } finally { lock.releaseLock(); }
}

/* ---------- views per platform, entered by hand each month ---------- */

const DEFAULT_PLATFORMS = [{id:"yt", name:"YouTube", url:""}, {id:"ig", name:"Instagram", url:""}, {id:"tt", name:"TikTok", url:""}, {id:"fb", name:"Facebook", url:""}];

function views_(){ return loadJson_("VIEWS", null) || {platforms: DEFAULT_PLATFORMS, data: {}}; }

/** month "YYYY-MM"; counts {platformId: number|null}; platforms optional [{id, name, url}] */
function saveViews_(month, counts, platforms){
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(String(month || ""))) return {ok:false, error:"invalid"};
  const lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    const v = views_();
    if (Array.isArray(platforms)){
      const seen = {};
      v.platforms = platforms.slice(0, 12).map(x => ({id: String(x.id || "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12), name: clean_(x.name, 40), url: /^https?:\/\//.test(String(x.url || "")) ? clean_(x.url, 200) : ""}))
        .filter(x => x.id && x.name && !seen[x.id] && (seen[x.id] = true));
    }
    const row = {};
    v.platforms.forEach(x => { const n = counts ? counts[x.id] : null; if (n !== "" && n != null && isFinite(Number(n)) && Number(n) >= 0) row[x.id] = Math.min(Math.floor(Number(n)), 1e10); });
    if (Object.keys(row).length) v.data[month] = row; else delete v.data[month];
    saveJson_("VIEWS", v);
    return {ok:true, views: v};
  } finally { lock.releaseLock(); }
}

/* ---------- the report's monthly figures, entered by hand ---------- */

const MONTH_FIELDS = ["programs", "episodes", "recorded", "produced", "sessions", "hours"];

/** month "YYYY-MM"; values {field: number|null} are the extras entered by hand (hours keep one decimal, the rest are whole numbers);
 *  base {programs, episodes, recorded, produced} pins the center's own running programs for that month (kept when not sent);
 *  mode "manual" means the four program figures are typed in full and shown as they are. An empty month is removed. */
function saveMonthStats_(month, values, base, mode){
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(String(month || ""))) return {ok:false, error:"invalid"};
  const lock = LockService.getScriptLock(); lock.waitLock(15000);
  try {
    const all = loadJson_("MONTHLY", {}), row = {};
    MONTH_FIELDS.forEach(k => {
      const n = values ? values[k] : null;
      if (n !== "" && n != null && isFinite(Number(n)) && Number(n) >= 0) row[k] = Math.min(k === "hours" ? Math.round(Number(n) * 10) / 10 : Math.floor(Number(n)), 1e7);
    });
    if (base && typeof base === "object"){
      const pin = {};
      ["programs", "episodes", "recorded", "produced"].forEach(k => { const n = Number(base[k]); if (base[k] != null && isFinite(n) && n >= 0) pin[k] = Math.min(Math.floor(n), 1e7); });
      if (Object.keys(pin).length) row.base = pin;
    } else if (all[month] && all[month].base) row.base = all[month].base;
    if (mode === "manual") row.mode = "manual";
    if (Object.keys(row).length) all[month] = row; else delete all[month];
    saveJson_("MONTHLY", all);
    return {ok:true, stats: all};
  } finally { lock.releaseLock(); }
}

function deleteProgram_(id){
  const list = programs_().filter(x => x.id !== id);
  saveJson_("PROGRAMS", list);
  saveEps_(id, null);
  return {ok:true, programs: programsOut_(list)};
}

/* ---------- bookings ---------- */

function publicBooking_(b){ return {id: b.id, date: b.date, start: b.start, dur: b.dur, program: b.program}; }

/** The booking's language by name: the names the browser gave at booking time, else a short built-in list, else the code. */
function langLabel_(bk, en){
  const code = bk.blang, given = en ? bk.blangEn : bk.blangAr;
  if (given) return given;
  const names = {ar: ["العربية", "Arabic"], en: ["الإنجليزية", "English"], ur: ["الأردية", "Urdu"], fr: ["الفرنسية", "French"], es: ["الإسبانية", "Spanish"], id: ["الإندونيسية", "Indonesian"], tl: ["الفلبينية", "Filipino"], hi: ["الهندية", "Hindi"], bn: ["البنغالية", "Bengali"], ru: ["الروسية", "Russian"], zh: ["الصينية", "Chinese"], de: ["الألمانية", "German"], tr: ["التركية", "Turkish"], fa: ["الفارسية", "Persian"], ml: ["المالايالامية", "Malayalam"], ta: ["التاميلية", "Tamil"], sw: ["السواحيلية", "Swahili"], am: ["الأمهرية", "Amharic"], so: ["الصومالية", "Somali"], pt: ["البرتغالية", "Portuguese"], it: ["الإيطالية", "Italian"], ja: ["اليابانية", "Japanese"], ko: ["الكورية", "Korean"]};
  const n = names[code]; return n ? n[en ? 1 : 0] : code || "";
}
function catList_(v){ return String(v || "").split(",").filter((c, i, all) => CATEGORIES[c] && all.indexOf(c) === i); }
function catLabel_(codes, en){ return catList_(codes).map(c => CATEGORIES[c][en ? 1 : 0]).join(en ? ", " : "، "); }
function reasonLabel_(code, text, en){ const n = CANCEL_REASONS[code]; if (!n) return ""; return code === "other" && text ? n[en ? 1 : 0] + ": " + text : n[en ? 1 : 0]; }

function book_(b){
  const name = clean_(b.name, 80), email = clean_(b.email, 120), phone = clean_(b.phone, 30);
  const program = clean_(b.title != null ? b.title : b.program, 120), notes = clean_(b.notes, 500);   // the title the booker typed
  const blang = clean_(b.blang, 12).toLowerCase(), blangAr = clean_(b.blangAr, 40), blangEn = clean_(b.blangEn, 40), cat = catList_(b.cat).join(",");
  const content = String(b.content == null ? "" : b.content).replace(/[\u0000-\u0008\u000b-\u001f]/g, " ").trim().slice(0, 4000);   // the content is the script; line breaks kept
  const date = String(b.date || ""), start = Number(b.start), dur = Number(b.dur);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\+\d{1,4} \d{6,14}$/.test(phone) || !content || !program || !/^[a-z]{2,3}$/.test(blang) || !cat) return {ok:false, error:"invalid"};
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || DURATIONS.indexOf(dur) < 0 || !(start >= DAY_START && start + dur <= DAY_END)) return {ok:false, error:"invalid"};
  const begin = at_(date, start), end = at_(date, start + dur);
  if (BOOK_DAYS.indexOf(Number(Utilities.formatDate(begin, TZ, "u"))) < 0) return {ok:false, error:"invalid"};
  if (begin <= new Date() || begin > new Date(Date.now() + AHEAD_DAYS * 864e5)) return {ok:false, error:"invalid"};
  if (begin.getTime() < Date.now() + MIN_LEAD_HOURS * 36e5) return {ok:false, error:"soon"};

  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sameDay = bookings_().filter(x => x.date === date);
    if (sameDay.length >= MAX_PER_DAY) return {ok:false, error:"dayFull"};
    if (sameDay.some(x => start < x.start + x.dur && x.start < start + dur)) return {ok:false, error:"taken"};
    const id = date + "_" + start;
    const ev = calendar_().createEvent("حجز الاستوديو · " + name, begin, end, {
      description: ["الاسم: " + name, "الإيميل: " + email, "الهاتف: " + phone, "العنوان: " + program, "اللغة: " + langLabel_({blang: blang, blangAr: blangAr}), "الفئة: " + catLabel_(cat), "المحتوى (السكريبت):\n" + content, notes && "ملاحظات: " + notes].filter(Boolean).join("\n")
    });
    const key = Utilities.getUuid().replace(/-/g, "");   // only the guest's email carries it
    const lang = b.lang === "en" ? "en" : "ar";
    [["icstudio", "1"], ["bid", id], ["ckey", key], ["lang", lang], ["name", name], ["email", email], ["phone", phone], ["program", program], ["blang", blang], ["blangAr", blangAr], ["blangEn", blangEn], ["cat", cat], ["content", content.slice(0, 900)], ["notes", notes]].forEach(t => ev.setTag(t[0], t[1]));
    const bk = {id: id, name: name, email: email, phone: phone, program: program, blang: blang, blangAr: blangAr, blangEn: blangEn, cat: cat, content: content, notes: notes, dur: dur, begin: begin, end: end, lang: lang};
    const cancelUrl = siteUrl_() + "/?cancel=" + encodeURIComponent(id) + "&k=" + key;
    guestMail_(bk, "booked", cancelUrl);
    ownerMail_(bk, "booked");
    const wa = whatsapp_(bk, "booked", cancelUrl);
    if (wa) ev.setTag("wa", "1");
    return {ok:true, id: id, contact: studio_(), wa: wa};
  } finally { lock.releaseLock(); }
}

/** Admin cancel: the guest is told by email. */
function cancel_(id){
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const hit = events_().filter(ev => ev.getTag("bid") === String(id));
    hit.forEach(ev => { const bk = fromEvent_(ev); ev.deleteEvent(); logCancel_(bk, "studio", "studio", ""); if (bk.begin > new Date()) guestMail_(bk, "studioCancelled"); });
    return {ok: hit.length > 0, error: hit.length ? undefined : "missing"};
  } finally { lock.releaseLock(); }
}

/** The guest's cancel link: without confirm it only shows the booking; with confirm it cancels and tells both sides. */
function guestCancel_(id, key, confirm, reason, reasonText){
  if (!id || !key) return {ok:false, error:"missing"};
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const ev = events_().filter(x => x.getTag("bid") === String(id) && x.getTag("ckey") === String(key))[0];
    if (!ev) return {ok:false, error:"missing"};
    const bk = fromEvent_(ev);
    if (bk.begin <= new Date()) return {ok:false, error:"past"};
    const info = {date: Utilities.formatDate(bk.begin, TZ, "yyyy-MM-dd"), start: Number(Utilities.formatDate(bk.begin, TZ, "H")), dur: bk.dur, program: bk.program, name: bk.name};
    if (!confirm) return {ok:true, booking: info};
    reason = String(reason || ""); reasonText = clean_(reasonText, 300);
    if (!CANCEL_REASONS[reason] || (reason === "other" && !reasonText)) return {ok:false, error:"reason"};
    bk.reason = reason; bk.reasonText = reasonText;
    ev.deleteEvent();
    logCancel_(bk, "guest", reason, reasonText);
    guestMail_(bk, "guestCancelled");
    ownerMail_(bk, "guestCancelled");
    return {ok:true, cancelled:true, booking: info};
  } finally { lock.releaseLock(); }
}

/* ---------- WhatsApp (Meta Cloud API): confirmation on booking, reminder an hour before ---------- */

/**
 * Sends one approved template message to the guest's phone. Templates (category Utility), five variables each:
 *   {{1}} name · {{2}} date and time · {{3}} studio address · {{4}} map link · {{5}} cancel link
 * Returns true when WhatsApp accepted it. Never throws: a WhatsApp problem must not stop a booking.
 */
function whatsapp_(bk, kind, cancelUrl){
  const to = String(bk.phone || "").replace(/[^\d]/g, "");
  if (!waReady_() || !to) return false;
  const st = studio_(), lang = bk.lang === "en" ? "en" : "ar";
  const place = (lang === "en" ? st.addressEn : st.address) || "IIC Studio", map = st.map || siteUrl_();
  const name = WA_TEMPLATES[kind === "reminder" ? "reminder" : "booked"][lang];
  const params = [bk.name, whenText_(bk.begin, bk.end, bk.lang), place, map, cancelUrl].map(v => ({type: "text", text: String(v).replace(/\s+/g, " ").trim().slice(0, 900)}));
  try {
    const d360 = prop_("WA_360_KEY");
    const token = prop_("WA_TOKEN"), graph = /^dh_/.test(token) ? "https://api.dualhook.com/v25.0/" : "https://graph.facebook.com/v25.0/";
    const res = UrlFetchApp.fetch(d360 ? "https://waba-v2.360dialog.io/messages" : graph + encodeURIComponent(prop_("WA_PHONE_ID")) + "/messages", {
      method: "post", contentType: "application/json", muteHttpExceptions: true,
      headers: d360 ? {"D360-API-KEY": d360} : {Authorization: "Bearer " + token},
      payload: JSON.stringify({messaging_product: "whatsapp", to: to, type: "template",
        template: {name: name, language: {code: lang}, components: [{type: "body", parameters: params}]}})
    });
    if (res.getResponseCode() === 200) return true;
    // No English version of the template yet: fall back to the Arabic one rather than send nothing.
    if (lang === "en" && /132001|does not exist/.test(res.getContentText())) return whatsapp_(Object.assign({}, bk, {lang: "ar"}), kind, cancelUrl);
    Logger.log("WhatsApp " + kind + " to " + to + " failed: " + res.getResponseCode() + " " + res.getContentText().slice(0, 500));
  } catch (err) { Logger.log("WhatsApp " + kind + " error: " + err); }
  return false;
}

function waReady_(){ return !!(prop_("WA_360_KEY") || (prop_("WA_TOKEN") && prop_("WA_PHONE_ID"))); }

/** Run by the timer every 10 minutes: WhatsApp reminder for each booking that starts within the next REMIND_HOURS hours. */
function sendReminders(){
  if (!waReady_()) return;
  const now = Date.now();
  events_().forEach(ev => {
    const left = ev.getStartTime().getTime() - now;
    if (left <= 0 || left > (REMIND_HOURS * 60 + 5) * 6e4 || ev.getTag("reminded") === "1") return;
    const bk = fromEvent_(ev), key = ev.getTag("ckey");
    const cancelUrl = siteUrl_() + "/?cancel=" + encodeURIComponent(bk.id) + "&k=" + key;
    ev.setTag("reminded", "1");                       // once only, even if WhatsApp refuses it
    whatsapp_(bk, "reminder", cancelUrl);
  });
}

/** Run once from the editor: starts the 10-minute reminder timer (safe to run again). */
function setupReminders(){
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === "sendReminders").forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("sendReminders").timeBased().everyMinutes(10).create();
  Logger.log("Reminder timer on: every 10 minutes. WhatsApp " + (waReady_() ? "ready." : "not set yet (WA_360_KEY, or WA_TOKEN + WA_PHONE_ID)."));
}

/** Run from the editor to test: sends the confirmation template to TEST_PHONE (digits with country code). */
function testWhatsApp(){ testWhatsApp_("ar"); }

/** The same test with the English templates. */
function testWhatsAppEn(){ testWhatsApp_("en"); }

function testWhatsApp_(lang){
  const phone = prop_("TEST_PHONE");
  if (!phone) { Logger.log("Add TEST_PHONE to Script Properties first."); return; }
  const begin = new Date(Date.now() + 864e5), end = new Date(begin.getTime() + 36e5);
  const ok = whatsapp_({name: lang === "en" ? "Test" : "تجربة", phone: phone, lang: lang, begin: begin, end: end}, "booked", siteUrl_());
  Logger.log(ok ? "Sent. Check WhatsApp on " + phone : "Not sent: see the log line above.");
}

function fromEvent_(ev){
  const s = ev.getStartTime(), e = ev.getEndTime();
  return {id: ev.getTag("bid"), name: ev.getTag("name") || "", email: ev.getTag("email") || "", phone: ev.getTag("phone") || "", program: ev.getTag("program") || "", blang: ev.getTag("blang") || "", blangAr: ev.getTag("blangAr") || "", blangEn: ev.getTag("blangEn") || "", cat: ev.getTag("cat") || "",
    content: ev.getTag("content") || "", notes: ev.getTag("notes") || "", lang: ev.getTag("lang") === "en" ? "en" : "ar",
    begin: s, end: e, dur: Math.max(1, Math.round((e - s) / 36e5))};
}

function bookings_(){
  return events_().map(ev => {
    const s = ev.getStartTime(), e = ev.getEndTime(), start = Number(Utilities.formatDate(s, TZ, "H"));
    return {
      id: ev.getTag("bid") || Utilities.formatDate(s, TZ, "yyyy-MM-dd") + "_" + start,
      date: Utilities.formatDate(s, TZ, "yyyy-MM-dd"), start: start, dur: Math.max(1, Math.round((e - s) / 36e5)),
      name: ev.getTag("name") || "", email: ev.getTag("email") || "", phone: ev.getTag("phone") || "",
      program: ev.getTag("program") || "", blang: ev.getTag("blang") || "", blangAr: ev.getTag("blangAr") || "", cat: ev.getTag("cat") || "", content: ev.getTag("content") || "", notes: ev.getTag("notes") || ""
    };
  }).sort((a, b) => (a.date + pad_(a.start)).localeCompare(b.date + pad_(b.start)));
}

/* ---------- cancellations log and the Excel export ---------- */

/** A cancelled booking leaves the calendar, so a short record of it is kept per month (CXL_yyyy-MM) for the Excel export. */
function logCancel_(bk, by, reason, text){
  try {
    const date = Utilities.formatDate(bk.begin, TZ, "yyyy-MM-dd"), key = "CXL_" + date.slice(0, 7);
    const row = {id: bk.id, date: date, start: Number(Utilities.formatDate(bk.begin, TZ, "H")), dur: bk.dur, name: bk.name, email: bk.email, phone: bk.phone,
      program: bk.program, blang: bk.blang || "", blangAr: bk.blangAr || "", cat: bk.cat || "", notes: (bk.notes || "").slice(0, 120),
      reason: reason, reasonText: String(text || "").slice(0, 200), by: by, at: Utilities.formatDate(new Date(), TZ, "yyyy-MM-dd")};
    const list = loadJson_(key, []); list.push(row);
    while (JSON.stringify(list).length > 8800 && list.some(x => x.notes || x.email)) { const x = list.find(y => y.notes || y.email); x.notes = ""; x.email = ""; }   // stay under the 9 KB property limit
    saveJson_(key, list);
  } catch (err) { Logger.log("Cancel log error: " + err); }
}

/** Every booking (with full details) and every cancellation between two dates (inclusive, yyyy-MM-dd). */
function exportBookings_(from, to){
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(from)) || !/^\d{4}-\d{2}-\d{2}$/.test(String(to))) return {ok:false, error:"invalid"};
  const start = new Date(from + "T00:00:00"), end = new Date(new Date(to + "T00:00:00").getTime() + 864e5);
  const evs = calendar_().getEvents(start, end).filter(ev => ev.getTag("icstudio") === "1" && ev.getStartTime() >= start);
  const bookings = evs.map(ev => {
    const s = ev.getStartTime(), e = ev.getEndTime(), h = Number(Utilities.formatDate(s, TZ, "H"));
    return {id: ev.getTag("bid") || "", date: Utilities.formatDate(s, TZ, "yyyy-MM-dd"), start: h, dur: Math.max(1, Math.round((e - s) / 36e5)),
      name: ev.getTag("name") || "", email: ev.getTag("email") || "", phone: ev.getTag("phone") || "", program: ev.getTag("program") || "",
      blang: ev.getTag("blang") || "", blangAr: ev.getTag("blangAr") || "", cat: ev.getTag("cat") || "", content: ev.getTag("content") || "", notes: ev.getTag("notes") || ""};
  });
  const cancels = [];
  for (let d = new Date(start.getFullYear(), start.getMonth(), 1); d < end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1))
    loadJson_("CXL_" + Utilities.formatDate(d, TZ, "yyyy-MM"), []).forEach(x => { if (x.date >= from && x.date <= to) cancels.push(x); });
  return {ok:true, bookings: bookings, cancels: cancels};
}

/** Studio sessions and hours between two dates (inclusive, yyyy-MM-dd), for the admin reports. */
function reportStats_(from, to){
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(from)) || !/^\d{4}-\d{2}-\d{2}$/.test(String(to))) return {ok:false, error:"invalid"};
  const start = new Date(from + "T00:00:00"), end = new Date(new Date(to + "T00:00:00").getTime() + 864e5);
  const evs = calendar_().getEvents(start, end).filter(ev => ev.getTag("icstudio") === "1" && ev.getStartTime() >= start);
  const hours = evs.reduce((t, ev) => t + Math.max(1, Math.round((ev.getEndTime() - ev.getStartTime()) / 36e5)), 0);
  return {ok:true, sessions: evs.length, hours: hours};
}

function events_(){
  const from = new Date(Date.now() - 8 * 864e5), to = new Date(Date.now() + (AHEAD_DAYS + 7) * 864e5);
  return calendar_().getEvents(from, to).filter(ev => ev.getTag("icstudio") === "1");
}

/* ---------- helpers ---------- */

function loadJson_(k, fallback){ try { const v = PropertiesService.getScriptProperties().getProperty(k); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }
function saveJson_(k, v){ PropertiesService.getScriptProperties().setProperty(k, JSON.stringify(v)); }
function prop_(k){ return PropertiesService.getScriptProperties().getProperty(k) || ""; }
function calendar_(){ const id = prop_("CALENDAR_ID"); return id ? CalendarApp.getCalendarById(id) : CalendarApp.getDefaultCalendar(); }
function ownerEmail_(){ return prop_("OWNER_EMAIL") || Session.getEffectiveUser().getEmail(); }
function clean_(v, max){ return String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max); }
function pad_(n){ return ("0" + n).slice(-2); }
function at_(iso, hour){ const p = iso.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2], hour, 0, 0); }
function json_(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function whenText_(a, b, lang){
  const en = lang === "en";
  const days = en ? ["", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] : ["", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"];
  const h = d => { const x = Number(Utilities.formatDate(d, TZ, "H")); return (x > 12 ? x - 12 : x) + ":00"; };
  return days[Number(Utilities.formatDate(a, TZ, "u"))] + " " + Utilities.formatDate(a, TZ, "d/M/yyyy") + " · " + h(a) + " – " + h(b) + (en ? " pm" : " م");
}
function esc_(s){ return String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function studio_(){
  return {whatsapp: (prop_("STUDIO_WHATSAPP") || STUDIO_WHATSAPP).replace(/[^\d]/g, ""), map: prop_("STUDIO_MAP") || STUDIO_MAP, address: prop_("STUDIO_ADDRESS") || STUDIO_ADDRESS, addressEn: prop_("STUDIO_ADDRESS_EN") || STUDIO_ADDRESS_EN};
}
/** wa.me link to the studio with the booking receipt already typed, so the chat opens with the booking in it. */
function waLink_(bk){
  const wa = studio_().whatsapp; if (!wa) return "";
  const en = bk.lang === "en", when = whenText_(bk.begin, bk.end, bk.lang);
  const text = en ? ["Hello, I booked the studio.", "Name: " + bk.name, "When: " + when, bk.program && "Title: " + bk.program, "Booking: " + bk.id].filter(Boolean).join("\n")
                  : ["السلام عليكم، حجزت الاستوديو.", "الاسم: " + bk.name, "الموعد: " + when, bk.program && "العنوان: " + bk.program, "رقم الحجز: " + bk.id].filter(Boolean).join("\n");
  return "https://wa.me/" + wa + "?text=" + encodeURIComponent(text);
}
function siteUrl_(){ return (prop_("SITE_URL") || "https://iicstudio.com").replace(/\/+$/, ""); }

/** Shared email frame: a coloured header band, a details table, an optional button and a footer line. */
function mail_(o){
  const en = o.lang === "en";
  const rows = o.rows.filter(r => r[1]).map(r => `<tr><td style="padding:7px 0;color:#5B5F7A;width:110px;vertical-align:top">${esc_(r[0])}</td><td style="padding:7px 0;font-weight:bold;white-space:pre-line">${r[2] ? r[1] : esc_(r[1])}</td></tr>`).join("");
  const btns = (o.buttons || []).concat(o.button ? [o.button] : []).filter(x => x && x.href);
  const btn = btns.length ? `<p style="margin:22px 0 6px">${btns.map(x => `<a href="${esc_(x.href)}" style="display:inline-block;background:${x.bg};color:${x.fg || "#fff"};text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:999px;margin:0 0 8px 8px">${esc_(x.label)}</a>`).join("")}</p>` : "";
  return `<div dir="${en ? "ltr" : "rtl"}" style="font-family:Tahoma,Arial,sans-serif;color:#251B57;max-width:560px">
    <div style="background:${o.band};color:#fff;padding:18px 22px;border-radius:14px 14px 0 0"><span style="font-size:12px;letter-spacing:.5px;color:${o.chip};font-weight:bold">${esc_(o.kicker)}</span><br><b style="font-size:20px">${esc_(o.title)}</b><br><span style="font-size:12.5px;opacity:.85">${en ? "IIC Studio · Islamic Information Center" : "IIC Studio · مركز المعلومات الإسلامي"}</span></div>
    <div style="padding:18px 22px;background:${o.bg || "#F4F6FA"};border-radius:0 0 14px 14px">${o.greet ? `<p style="margin-top:0">${esc_(o.greet)}</p>` : ""}${o.lead ? `<p>${esc_(o.lead)}</p>` : ""}
    <table style="border-collapse:collapse;font-size:14px">${rows}</table>${btn}
    ${o.foot ? `<p style="font-size:12.5px;color:#5B5F7A;margin-top:16px">${esc_(o.foot)}</p>` : ""}</div></div>`;
}

/** To the person who booked, in their language: confirmation (with a cancel button) or a cancellation notice. */
function guestMail_(bk, kind, cancelUrl){
  const en = bk.lang === "en", when = whenText_(bk.begin, bk.end, bk.lang);
  const L = en ? {when: "When", len: "Length", prog: "Title", lng: "Language", cat: "Audience", content: "Content", notes: "Notes", ref: "Booking no.", place: "Location", map: "Open in Maps", h1: "1 hour", h2: "2 hours", hi: "Hello " + bk.name + ","} :
                 {when: "الموعد", len: "المدة", prog: "العنوان", lng: "اللغة", cat: "الفئة", content: "المحتوى", notes: "ملاحظات", ref: "رقم الحجز", place: "الموقع", map: "افتح الخريطة", h1: "ساعة", h2: "ساعتان", hi: "مرحباً " + bk.name + "،"};
  const st = studio_(), addr = en ? st.addressEn : st.address;
  const place = addr || st.map ? [addr && esc_(addr), st.map && `<a href="${esc_(st.map)}" style="color:#2660A8">${esc_(L.map)}</a>`].filter(Boolean).join("<br>") : "";
  const rows = [[L.when, when], [L.len, bk.dur === 1 ? L.h1 : L.h2], [L.prog, bk.program], [L.lng, langLabel_(bk, en)], [L.cat, catLabel_(bk.cat, en)]];
  let o;
  if (kind === "booked") o = {
    subject: (en ? "Studio booking receipt · " : "إيصال حجز الاستوديو · ") + when,
    band: "#251B57", chip: "#66BDB1", kicker: en ? "BOOKING RECEIPT" : "إيصال الحجز", title: en ? "Your booking is confirmed" : "تم تأكيد حجزك",
    greet: L.hi, rows: rows.concat([[L.ref, `<span dir="ltr">${esc_(bk.id)}</span>`, true], [L.content, bk.content], [L.notes, bk.notes], [L.place, place, true]]),
    buttons: [{href: waLink_(bk), label: en ? "Message us on WhatsApp" : "تواصل معنا على واتساب", bg: "#1E9E5A"}, {href: st.map, label: en ? "Studio location" : "موقع الاستوديو", bg: "#2660A8"}],
    button: {href: cancelUrl, label: en ? "Cancel this booking" : "إلغاء الحجز", bg: "#FFFFFF", fg: "#B04A2A"},
    foot: en ? "Keep this email as your booking receipt. Questions? Message us on WhatsApp or reply to this email. Can't make it? Use «Cancel this booking» to free the slot for someone else." : "احتفظ بهذا الإيميل كإيصال لحجزك. لأي استفسار تواصل معنا على واتساب أو بالرد على هذا الإيميل. إذا لم تستطع الحضور، اضغط «إلغاء الحجز» ليُتاح الموعد لغيرك."
  };
  else if (kind === "guestCancelled") o = {
    subject: (en ? "Booking cancelled · " : "تم إلغاء حجزك · ") + when,
    band: "#5B5F7A", chip: "#F2C56E", kicker: en ? "CANCELLED" : "إلغاء", title: en ? "Your booking is cancelled" : "تم إلغاء حجزك",
    greet: L.hi, lead: en ? "As you asked, this booking is cancelled and the slot is free again." : "تم إلغاء الحجز التالي بناءً على طلبك، وأصبح الموعد متاحاً.", rows: rows.concat([[en ? "Reason" : "سبب الإلغاء", reasonLabel_(bk.reason, bk.reasonText, en)]]),
    button: {href: siteUrl_(), label: en ? "Book another time" : "احجز موعداً آخر", bg: "#2660A8"}
  };
  else o = {
    subject: (en ? "Your studio booking was cancelled · " : "تم إلغاء حجزك في الاستوديو · ") + when,
    band: "#5B5F7A", chip: "#F2C56E", kicker: en ? "CANCELLED BY THE STUDIO" : "إلغاء من الاستوديو", title: en ? "Your booking was cancelled" : "تم إلغاء حجزك",
    greet: L.hi, lead: en ? "The studio team had to cancel this booking. Please choose another time, or reply to this email to arrange one." : "اضطر فريق الاستوديو لإلغاء هذا الحجز. يمكنك اختيار موعد آخر، أو الرد على هذا الإيميل للتنسيق.", rows: rows,
    button: {href: siteUrl_(), label: en ? "Book another time" : "احجز موعداً آخر", bg: "#2660A8"}
  };
  MailApp.sendEmail({to: bk.email, name: SITE_NAME, replyTo: ownerEmail_(), subject: o.subject, htmlBody: mail_(Object.assign({lang: bk.lang}, o))});
}

/** To the studio, always Arabic: a work notice with the contact details and a link to the admin panel. */
function ownerMail_(bk, kind){
  const when = whenText_(bk.begin, bk.end), digits = bk.phone.replace(/[^\d]/g, "");
  const contact = `<a href="mailto:${esc_(bk.email)}" style="color:#2660A8">${esc_(bk.email)}</a><br><a href="tel:+${digits}" style="color:#2660A8" dir="ltr">${esc_(bk.phone)}</a> · <a href="https://wa.me/${digits}" style="color:#1E9E5A">واتساب</a>`;
  const booked = kind === "booked";
  const o = booked ? {
    subject: "📌 حجز جديد · " + bk.name + " · " + when, band: "#C8963A", chip: "#251B57", kicker: "إشعار للفريق", title: "حجز جديد للاستوديو", bg: "#FBF6EC",
    lead: "وصل حجز جديد وأُضيف إلى تقويم الاستوديو.",
    rows: [["الموعد", when], ["المدة", bk.dur === 1 ? "ساعة" : "ساعتان"], ["الاسم", bk.name], ["التواصل", contact, true], ["العنوان", bk.program], ["اللغة", langLabel_(bk)], ["الفئة", catLabel_(bk.cat)], ["المحتوى (السكريبت)", bk.content], ["ملاحظات", bk.notes]],
    button: {href: siteUrl_() + "/admin.html", label: "فتح لوحة الإدارة", bg: "#251B57"},
    foot: "للرد على صاحب الحجز اضغط «رد» مباشرة على هذا الإيميل."
  } : {
    subject: "❌ إلغاء حجز · " + bk.name + " · " + when, band: "#B04A2A", chip: "#FFE3D6", kicker: "إشعار للفريق", title: "ألغى صاحب الحجز موعده", bg: "#FBF1EE",
    lead: "ألغى صاحب الحجز موعده من رابط الإلغاء، وحُذف من التقويم وأصبح الموعد متاحاً للحجز.",
    rows: [["الموعد", when], ["الاسم", bk.name], ["التواصل", contact, true], ["العنوان", bk.program], ["سبب الإلغاء", reasonLabel_(bk.reason, bk.reasonText)]],
    button: {href: siteUrl_() + "/admin.html", label: "فتح لوحة الإدارة", bg: "#251B57"}
  };
  MailApp.sendEmail({to: ownerEmail_(), name: SITE_NAME, replyTo: bk.email, subject: o.subject, htmlBody: mail_(Object.assign({lang: "ar"}, o))});
}
