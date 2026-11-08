// IIC Studio — shared by the public page and the admin panel: server calls, sign-in, dates, and a demo server.
(function(){
  const API = (window.ICSTUDIO_API || "").trim();
  const DEMO = !API;

  const RULES = {DAY_START: 14, DAY_END: 20, HOURS: [14, 15, 16, 17, 18, 19], BOOK_DAYS: [3, 4, 0], MAX_PER_DAY: 3, DURATIONS: [1, 2], AHEAD_DAYS: 90, MIN_LEAD_H: 24};
  const CATEGORIES = ["muslim", "newMuslim", "nonMuslim"];   // who the episode is for; a booking may pick several (stored "muslim,newMuslim")
  const catList = v => String(v || "").split(",").filter(c => CATEGORIES.includes(c));
  const CANCEL_REASONS = ["forgot", "busy", "emergency", "other"];
  const ROLES = ["admin", "editor", "crew", "team"];
  const PLATFORMS = [{id: "yt", name: "YouTube", url: ""}, {id: "ig", name: "Instagram", url: ""}, {id: "tt", name: "TikTok", url: ""}, {id: "fb", name: "Facebook", url: ""}];
  // program languages (ISO 639 codes); names come from the browser in the reader's language
  const LANGS = "ar en ur fr es id ms tr fa bn hi sw ha so ps tl zh ru de pt it nl sv no da fi pl cs sk hu ro bg el uk sr hr bs sq mk sl lt lv et ka hy az kk uz ky tg tk mn ja ko vi th km lo my ne si ta te kn ml mr gu pa or as sd ug ku ckb am om ti yo ig zu xh af rw rn mg ln wo ff ber ny sn st tn ts ve he yi ga cy gd eu ca gl is mt lb fo haw mi sm to fj dv bo".split(" ");
  function langName(code, ui){
    let n = null;
    try { n = new Intl.DisplayNames([ui || "ar"], {type: "language"}).of(code); } catch (e) {}
    return n && n !== code ? n : code;
  }
  function langOptions(ui){   // Arabic and English first, then the rest by name
    const nm = c => langName(c, ui), rest = LANGS.slice(2).sort((a, b) => nm(a).localeCompare(nm(b), ui || "ar"));
    return ["ar", "en"].concat(rest).map(c => [c, nm(c)]);
  }
  const DAY = 864e5;

  // ---------- dates ----------
  const pad = n => String(n).padStart(2, "0");
  const isoOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const midnight = iso => { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); };
  const endOf = iso => { const d = midnight(iso); d.setHours(23, 59, 59); return d; };
  const todayMid = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const slotPast = (iso, h) => { const d = midnight(iso); d.setHours(h); return d <= new Date(); };
  // a slot can be booked only when it starts at least MIN_LEAD_H hours from now
  const slotSoon = (iso, h) => { const d = midnight(iso); d.setHours(h); return d.getTime() < Date.now() + RULES.MIN_LEAD_H * 36e5; };

  // ---------- small helpers ----------
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const store = {
    get(k){ try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v){ try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} }
  };

  // ---------- server ----------
  async function call(action, payload){
    if (DEMO) return demo(action, Object.assign({}, payload || {}));
    try {
      const res = await fetch(API, {method: "POST", headers: {"Content-Type": "text/plain;charset=utf-8"}, body: JSON.stringify(Object.assign({action}, payload || {}))});
      return await res.json();
    } catch (e) { return {ok: false, error: "offline"}; }
  }

  // ---------- sign-in (token kept in this browser) ----------
  const session = {
    token: () => store.get("ics-token"),
    user: () => { try { return JSON.parse(store.get("ics-user") || "null"); } catch (e) { return null; } },
    async login(email, password){
      const r = await call("login", {email, password});
      if (r.ok){ store.set("ics-token", r.token); store.set("ics-user", JSON.stringify(r.user)); }
      return r;
    },
    async check(){
      const token = store.get("ics-token");
      if (!token) return null;
      const r = await call("me", {token});
      if (r.ok){ store.set("ics-user", JSON.stringify(r.user)); return r.user; }
      if (r.error === "auth"){ store.set("ics-token", null); store.set("ics-user", null); }
      return r.error === "offline" ? session.user() : null;
    },
    async logout(){ const token = store.get("ics-token"); store.set("ics-token", null); store.set("ics-user", null); if (token) await call("logout", {token}); },
    can(user, need){ return !!user && ROLES.indexOf(user.role) <= ROLES.indexOf(need); },
    authed(action, payload){ return call(action, Object.assign({token: store.get("ics-token")}, payload || {})); }
  };

  // ---------- booking rules (the server checks them again) ----------
  function bookingsOn(list, iso){ return list.filter(b => b.date === iso).sort((a, b) => a.start - b.start); }
  function hourTaken(list, iso, h){ return list.find(b => b.date === iso && h >= b.start && h < b.start + b.dur); }
  function startsFor(list, iso, dur){
    if (bookingsOn(list, iso).length >= RULES.MAX_PER_DAY) return [];
    return RULES.HOURS.filter(h => h + dur <= RULES.DAY_END && !slotSoon(iso, h) && [...Array(dur)].every((_, i) => !hourTaken(list, iso, h + i)));
  }
  function bookableDay(d){
    return RULES.BOOK_DAYS.includes(d.getDay()) && d >= todayMid() && d <= new Date(todayMid().getTime() + RULES.AHEAD_DAYS * DAY);
  }

  // ---------- demo server: the same actions, kept in this browser ----------
  const SEED = [
    {id:"prophets", ar:"قصص الأنبياء", en:"Prophet Stories", presenter:"إسماعيل", presenterEn:"Ismail", type:"", lang:"", note:"", total:30, done:2, due:"2026-12-31", order:1},
    {id:"dawah", ar:"سلسلة دعوية", en:"Dawah Series", presenter:"إسماعيل", presenterEn:"Ismail", type:"shorts", lang:"", note:"", total:60, done:null, due:"2026-11-01", order:2},
    {id:"steps30", ar:"30 خطوة", en:"30 Steps", presenter:"إسماعيل", presenterEn:"Ismail", type:"shorts", lang:"", note:"", total:30, done:null, due:"2026-10-31", order:3},
    {id:"nma3", ar:"المستوى الثالث", en:"Level 3", presenter:"إسماعيل", presenterEn:"Ismail", type:"course", lang:"", note:"أكاديمية المسلم الجديد", total:129, done:31, due:"2026-12-31", order:4},
    {id:"hisn", ar:"حصن المسلم", en:"Hisn Al-Muslim", presenter:"الشيخ تيم همبل", presenterEn:"Sheikh Tim Humble", type:"series", lang:"", note:"", total:20, done:12, due:"2026-12-31", order:5},
    {id:"names-tim", ar:"أسماء الله الحسنى", en:"Beautiful Names of Allah", presenter:"الشيخ تيم همبل", presenterEn:"Sheikh Tim Humble", type:"series", lang:"", note:"", total:71, done:null, due:"2027-02-28", order:6},
    {id:"seerah", ar:"السيرة المختصرة", en:"Seerah", presenter:"الشيخ تيم همبل", presenterEn:"Sheikh Tim Humble", type:"series", lang:"", note:"", total:22, done:null, due:"2027-04-30", order:7},
    {id:"manhaj", ar:"المنهج الصحيح", en:"Al-Manhaj", presenter:"الشيخ تيم همبل", presenterEn:"Sheikh Tim Humble", type:"series", lang:"", note:"", total:10, done:null, due:"2027-06-30", order:8},
    {id:"family", ar:"سلسلة الأسرة", en:"Family Series", presenter:"الشيخ عبدالله السويدي", presenterEn:"Sheikh Abdullah Al Suwaidi", type:"series", lang:"", note:"", total:20, done:null, due:"2026-11-30", order:9},
    {id:"tahil-en", ar:"تأهيل الدعاة", en:"Taahil Al-Du'at", presenter:"الشيخ عبدالله السويدي", presenterEn:"Sheikh Abdullah Al Suwaidi", type:"series", lang:"en", note:"", total:null, done:null, due:"", order:10},
    {id:"reminders", ar:"التذكيرات", en:"Reminders", presenter:"الشيخ عبدالله السويدي", presenterEn:"Sheikh Abdullah Al Suwaidi", type:"", lang:"", note:"", total:null, done:null, due:"", finished:true, order:11},
    {id:"present-islam", ar:"كيف تعرض الإسلام", en:"How to Present Islam", presenter:"الشيخ عبدالله السويدي", presenterEn:"Sheikh Abdullah Al Suwaidi", type:"", lang:"", note:"", total:null, done:null, due:"", finished:true, order:12},
    {id:"tahil-ar", ar:"تأهيل الدعاة", en:"Taahil Al-Du'at", presenter:"الشيخ محمد خليفة", presenterEn:"Sheikh Mohammed Khalifa", type:"series", lang:"ar", note:"", total:null, done:null, due:"", order:13},
    {id:"shubuhat", ar:"شبهات في العقيدة", en:"Shubuhat", presenter:"فارس الحمادي", presenterEn:"Faris Al Hammadi", type:"series", lang:"", note:"", total:14, done:null, due:"", order:14},
    {id:"arabic", ar:"اللغة العربية", en:"Arabic Language", presenter:"علي إبراهيم", presenterEn:"Ali Ibrahim", type:"", lang:"", note:"", total:18, done:2, due:"2026-12-31", order:15}
  ];
  function demoDb(){
    let db = null;
    try { db = JSON.parse(store.get("ics-demo") || "null"); } catch (e) {}
    if (!db) db = {programs: SEED, users: [{email: "admin@demo", name: "مدير الموقع", role: "admin", password: "demo1234"}], bookings: [], tokens: {}};
    return db;
  }
  async function demo(action, b){
    await new Promise(r => setTimeout(r, 150));
    const db = demoDb(), save = () => store.set("ics-demo", JSON.stringify(db));
    const me = () => { const e = db.tokens[b.token]; return e ? db.users.find(u => u.email === e) : null; };
    const guard = (need, fn) => { const u = me(); if (!u) return {ok:false, error:"auth"}; if (ROLES.indexOf(u.role) > ROLES.indexOf(need)) return {ok:false, error:"forbidden"}; return fn(u); };
    const safe = u => ({email: u.email, name: u.name, role: u.role});
    const pub = x => ({id: x.id, date: x.date, start: x.start, dur: x.dur, program: x.program});
    switch (action){
      case "state": return {ok:true, programs: db.programs, bookings: db.bookings.map(pub), views: db.views || {platforms: PLATFORMS, data: {}}};
      case "saveViews": return guard("editor", () => {
        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(String(b.month || ""))) return {ok:false, error:"invalid"};
        const v = db.views || {platforms: PLATFORMS, data: {}};
        if (Array.isArray(b.platforms)) v.platforms = b.platforms.filter(x => x.id && x.name).slice(0, 12);
        const row = {};
        v.platforms.forEach(x => { const n = b.counts ? b.counts[x.id] : null; if (n !== "" && n != null && Number(n) >= 0) row[x.id] = Math.floor(Number(n)); });
        if (Object.keys(row).length) v.data[b.month] = row; else delete v.data[b.month];
        db.views = v; save(); return {ok:true, views: v};
      });
      case "monthStats": return guard("editor", () => ({ok:true, stats: db.monthly || {}}));
      case "saveMonthStats": return guard("editor", () => {
        if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(String(b.month || ""))) return {ok:false, error:"invalid"};
        const all = db.monthly || {}, row = {};
        ["programs", "episodes", "recorded", "produced", "sessions", "hours"].forEach(k => { const n = b.values ? b.values[k] : null; if (n !== "" && n != null && Number(n) >= 0) row[k] = k === "hours" ? Math.round(Number(n) * 10) / 10 : Math.floor(Number(n)); });
        if (b.base) row.base = b.base; else if (all[b.month] && all[b.month].base) row.base = all[b.month].base;
        if (b.mode === "manual") row.mode = "manual";
        if (Object.keys(row).length) all[b.month] = row; else delete all[b.month];
        db.monthly = all; save(); return {ok:true, stats: all};
      });
      case "reportStats": return guard("editor", () => {
        const bs = db.bookings.filter(x => x.date >= b.from && x.date <= b.to);
        return {ok:true, sessions: bs.length, hours: bs.reduce((t, x) => t + (x.dur || 1), 0)};
      });
      case "login": {
        const u = db.users.find(x => x.email === String(b.email || "").trim().toLowerCase() && x.password === b.password);
        if (!u) return {ok:false, error:"auth"};
        const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
        db.tokens[token] = u.email; save();
        return {ok:true, token, user: safe(u)};
      }
      case "me": { const u = me(); return u ? {ok:true, user: safe(u)} : {ok:false, error:"auth"}; }
      case "logout": delete db.tokens[b.token]; save(); return {ok:true};
      case "book": {
        const start = Number(b.start), dur = Number(b.dur);
        if (!b.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email || "") || !/^\+\d{1,4} \d{6,14}$/.test(b.phone || "") || !String(b.content || "").trim() || !String(b.title || "").trim() || !b.blang || !catList(b.cat).length) return {ok:false, error:"invalid"};
        if (!bookableDay(midnight(b.date)) || !RULES.DURATIONS.includes(dur)) return {ok:false, error:"invalid"};
        if (bookingsOn(db.bookings, b.date).length >= RULES.MAX_PER_DAY) return {ok:false, error:"dayFull"};
        if (slotSoon(b.date, start)) return {ok:false, error:"soon"};
        if (!startsFor(db.bookings, b.date, dur).includes(start)) return {ok:false, error:"taken"};
        const id = `${b.date}_${start}`;
        const ckey = Math.random().toString(36).slice(2);
        db.bookings.push({id, ckey, date: b.date, start, dur, name: b.name, email: b.email, phone: b.phone, program: b.title || "", blang: b.blang, blangAr: b.blangAr || "", cat: catList(b.cat).join(","), content: b.content, notes: b.notes || ""});
        save(); return {ok:true, id, demoCancel: `?cancel=${encodeURIComponent(id)}&k=${ckey}`};
      }
      case "guestCancel": {
        const x = db.bookings.find(y => y.id === b.id && y.ckey === b.k);
        if (!x) return {ok:false, error:"missing"};
        const info = {date: x.date, start: x.start, dur: x.dur, program: x.program, name: x.name};
        if (b.confirm !== true) return {ok:true, booking: info};
        if (!CANCEL_REASONS.includes(b.reason) || (b.reason === "other" && !String(b.reasonText || "").trim())) return {ok:false, error:"reason"};
        db.bookings = db.bookings.filter(y => y !== x);
        (db.cancels = db.cancels || []).push(Object.assign({}, x, {reason: b.reason, reasonText: b.reasonText || "", by: "guest", at: new Date().toISOString()}));
        save(); return {ok:true, cancelled:true, booking: info};
      }
      case "details": return guard("team", () => ({ok:true, bookings: db.bookings}));
      case "cancel": return guard("editor", () => {
        const x = db.bookings.find(y => y.id === b.id);
        if (x) (db.cancels = db.cancels || []).push(Object.assign({}, x, {reason: "studio", by: "studio", at: new Date().toISOString()}));
        db.bookings = db.bookings.filter(y => y.id !== b.id); save(); return {ok:true};
      });
      case "exportBookings": return guard("editor", () => {
        const inR = x => x.date >= b.from && x.date <= b.to;
        return {ok:true, bookings: db.bookings.filter(inR), cancels: (db.cancels || []).filter(inR)};
      });
      case "saveProgram": return guard("editor", () => {
        const p = b.program || {};
        if (!p.ar || !p.presenter) return {ok:false, error:"invalid"};
        let cur = p.id && db.programs.find(x => x.id === p.id);
        if (!cur){ cur = {id: "p" + Date.now().toString(36), order: db.programs.reduce((m, x) => Math.max(m, x.order || 0), 0) + 1}; db.programs.push(cur); }
        const row = Object.assign({}, p, {id: cur.id}); if (row.order == null) delete row.order;
        Object.assign(cur, row);
        save(); return {ok:true, programs: db.programs};
      });
      case "updateCounts": return guard("crew", () => {
        const p = db.programs.find(x => x.id === b.id);
        if (!p) return {ok:false, error:"invalid"};
        const n = v => v === "" || v == null ? null : Math.max(0, Math.floor(Number(v)));
        p.recorded = n(b.recorded); p.done = n(b.done);
        save(); return {ok:true, programs: db.programs};
      });
      case "deleteProgram": return guard("editor", () => { db.programs = db.programs.filter(x => x.id !== b.id); save(); return {ok:true, programs: db.programs}; });
      case "listUsers": return guard("admin", () => ({ok:true, users: db.users.map(safe)}));
      case "saveUser": return guard("admin", u0 => {
        const u = b.user || {}, email = String(u.email || "").trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !ROLES.includes(u.role)) return {ok:false, error:"invalid"};
        let cur = db.users.find(x => x.email === email);
        if (cur && cur.email === u0.email && u.role !== "admin") return {ok:false, error:"self"};
        if (!cur){ if (!u.password || u.password.length < 8) return {ok:false, error:"password"}; cur = {email}; db.users.push(cur); }
        if (u.password){ if (u.password.length < 8) return {ok:false, error:"password"}; cur.password = u.password; }
        cur.name = u.name || email; cur.role = u.role;
        save(); return {ok:true, users: db.users.map(safe)};
      });
      case "deleteUser": return guard("admin", u0 => { if (b.email === u0.email) return {ok:false, error:"self"}; db.users = db.users.filter(x => x.email !== b.email); save(); return {ok:true, users: db.users.map(safe)}; });
      case "changePassword": return guard("team", u0 => { if (u0.password !== b.current) return {ok:false, error:"auth"}; if (String(b.next || "").length < 8) return {ok:false, error:"password"}; u0.password = b.next; save(); return {ok:true}; });
    }
    return {ok:false, error:"unknown"};
  }

  // platform badge: brand colour and a small glyph; any other platform gets its first letter
  const PICON = {
    yt: ["linear-gradient(180deg,#FF3B3B,#E00000)", '<path d="M9.2 7.4v9.2l7.6-4.6z"/>'],
    ig: ["radial-gradient(circle at 30% 107%,#FDF497 0%,#FDF497 6%,#FD5949 45%,#D6249F 62%,#285AEB 95%)", '<rect x="4.2" y="4.2" width="15.6" height="15.6" rx="4.6" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3.7" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="16.9" cy="7.1" r="1.2"/>'],
    tt: ["#111", '<path d="M15.5 4c.3 1.8 1.5 3.1 3.3 3.3v2.5a6 6 0 0 1-3.3-1v5.6A4.8 4.8 0 1 1 10.7 9.6v2.6a2.3 2.3 0 1 0 2.3 2.3V4z"/>'],
    fb: ["#1877F2", '<path d="M13.5 20v-6.5h2.2l.4-2.6h-2.6V9.3c0-.8.3-1.3 1.4-1.3h1.3V5.7a17 17 0 0 0-2-.1c-2 0-3.3 1.2-3.3 3.4v2H8.7v2.6h2.2V20z"/>']
  };
  const PCOLOR = {yt: "#FF0033", ig: "#E1306C", tt: "#25C9D0", fb: "#1877F2"};
  function platformIcon(p){
    const k = PICON[p.id];
    if (k) return `<span class="picon" style="background:${k[0]}"><svg viewBox="0 0 24 24" aria-hidden="true">${k[1]}</svg></span>`;
    return `<span class="picon" style="background:#251B57"><b>${esc((p.name || "?").slice(0, 1).toUpperCase())}</b></span>`;
  }
  const platformColor = p => PCOLOR[p.id] || "#2660A8";

  window.ICS = {platformIcon, platformColor, PLATFORMS, LANGS, langName, langOptions, CATEGORIES, catList, CANCEL_REASONS, slotSoon, API, DEMO, RULES, ROLES, DAY, pad, isoOf, midnight, endOf, todayMid, slotPast, esc, store, call, session, bookingsOn, hourTaken, startsFor, bookableDay};
})();
