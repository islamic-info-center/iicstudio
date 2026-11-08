// IIC Studio — the printable report (A4, day or night), built from the site's own numbers.
(function(){
  const MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  const QUARTERS = ["الأول", "الثاني", "الثالث", "الرابع"];
  const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  // every word on the page, in Arabic and English (the page follows the admin's language)
  const T = {
    ar: {months: MONTHS, short: MONTHS,
      month: (m, y) => `تقرير شهر ${m} ${y}`, monthSub: (m, d, y) => `من 1 ${m} إلى ${d} ${m} ${y}`,
      quarter: (n, y) => `تقرير الربع ${QUARTERS[n - 1]} ${y}`, quarterName: n => "الربع " + QUARTERS[n - 1], range: (a, b, y) => `من ${a} إلى ${b} ${y}`,
      year: y => `التقرير السنوي ${y}`,
      kicker: "تقرير أداء استوديو مركز المعلومات الإسلامي", dca: "جمعية دبي الخيرية", sponsor: "بـــرعـــايـــة",
      programs: "عدد البرامج", episodes: "إجمالي الحلقات", recorded: "تم تسجيل", produced: "تم إنتاج",
      views: "إجمالي المشاهدات", vs: "عن", noViews: "لم تُدخل أرقام المشاهدات لهذه الفترة.",
      chart: {month: "المشاهدات آخر 3 أشهر", quarter: "المشاهدات في أشهر الربع", year: "المشاهدات شهراً بشهر"},
      studio: "حجوزات الاستوديو", sessions: "جلسات التصوير", hours: "ساعات التصوير", top: "أبرز البرامج", issued: "صدر في"},
    en: {months: MONTHS_EN, short: MONTHS_EN.map(m => m.slice(0, 3)),
      month: (m, y) => `${m} ${y} Report`, monthSub: (m, d, y) => `1 ${m} to ${d} ${m} ${y}`,
      quarter: (n, y) => `Q${n} ${y} Report`, quarterName: n => "Q" + n, range: (a, b, y) => `${a} to ${b} ${y}`,
      year: y => `Annual Report ${y}`,
      kicker: "Islamic Information Center Studio · Performance Report", dca: "Dubai Charity Association", sponsor: "Sponsored by",
      programs: "Programs", episodes: "Total episodes", recorded: "Recorded", produced: "Produced",
      views: "Total views", vs: "vs", noViews: "No view figures were entered for this period.",
      chart: {month: "Views, last 3 months", quarter: "Views by month of the quarter", year: "Views month by month"},
      studio: "Studio bookings", sessions: "Filming sessions", hours: "Filming hours", top: "Top programs", issued: "Issued"}
  };
  const tr = lang => T[lang] || T.ar;
  const PCOLOR = {yt: "#FF3B30", ig: "#E1306C", fb: "#1877F2"};
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c]));
  const fmt = n => Number(n).toLocaleString("en-US");
  const short = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M" : n >= 1000 ? Math.round(n / 1000) + "K" : String(n);
  const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
  const ym = (y, m) => `${y}-${String(m).padStart(2, "0")}`;
  const lastDay = (y, m) => new Date(y, m, 0).getDate();

  const THEMES = {
    day: {dark: false, bg: "#C7D1E2",
      glows: "radial-gradient(45% 30% at 88% 4%,rgba(38,96,168,.55),transparent 70%),radial-gradient(40% 28% at 6% 30%,rgba(102,189,177,.6),transparent 70%),radial-gradient(48% 30% at 55% 100%,rgba(208,167,90,.5),transparent 70%),radial-gradient(36% 26% at 16% 76%,rgba(58,180,207,.45),transparent 70%),radial-gradient(30% 22% at 60% 50%,rgba(140,120,220,.28),transparent 70%),linear-gradient(180deg,#CBD5E6,#BFCADD)",
      card: "rgba(255,255,255,.52)", line: "rgba(255,255,255,.75)", ink: "#1F1747", muted: "#4E4A6E", acc: ["#2660A8", "#1E9FC0", "#3E9F92", "#B98A2E"], glow: .55, hero: "#2660A8", track: "rgba(31,23,71,.10)"},
    night: {dark: true, bg: "#07060F",
      glows: "radial-gradient(45% 30% at 86% 4%,rgba(38,96,168,.65),transparent 70%),radial-gradient(40% 28% at 6% 30%,rgba(102,189,177,.38),transparent 70%),radial-gradient(48% 30% at 52% 100%,rgba(208,167,90,.32),transparent 70%),radial-gradient(34% 26% at 18% 76%,rgba(58,180,207,.30),transparent 70%),radial-gradient(30% 22% at 62% 48%,rgba(140,120,220,.22),transparent 70%)",
      card: "rgba(255,255,255,.07)", line: "rgba(255,255,255,.18)", ink: "#F2F1FA", muted: "#B9B6D6", acc: ["#7FB2FF", "#5FD6F0", "#7FE0D2", "#F2C56E"], glow: .9, hero: "#F2C56E", track: "rgba(255,255,255,.12)"}
  };

  /** The months a report covers, its title and the period before it (for the change figure). kind: month | quarter | year. */
  function period(kind, year, n, lang){
    const L = tr(lang), M = L.months;
    let months, title, sub, prevMonths, prevName;
    if (kind === "month"){
      months = [ym(year, n)];
      title = L.month(M[n - 1], year);
      sub = L.monthSub(M[n - 1], lastDay(year, n), year);
      const p = n === 1 ? [year - 1, 12] : [year, n - 1];
      prevMonths = [ym(p[0], p[1])]; prevName = M[p[1] - 1] + (p[0] !== year ? " " + p[0] : "");
    } else if (kind === "quarter"){
      const f = (n - 1) * 3 + 1;
      months = [0, 1, 2].map(i => ym(year, f + i));
      title = L.quarter(n, year);
      sub = L.range(M[f - 1], M[f + 1], year);
      const pq = n === 1 ? [year - 1, 4] : [year, n - 1], pf = (pq[1] - 1) * 3 + 1;
      prevMonths = [0, 1, 2].map(i => ym(pq[0], pf + i)); prevName = L.quarterName(pq[1]) + (pq[0] !== year ? " " + pq[0] : "");
    } else {
      months = MONTHS.map((_, i) => ym(year, i + 1));
      title = L.year(year);
      sub = L.range(M[0], M[11], year);
      prevMonths = MONTHS.map((_, i) => ym(year - 1, i + 1)); prevName = String(year - 1);
    }
    const [fy, fm] = months[0].split("-").map(Number), [ly, lm] = months[months.length - 1].split("-").map(Number);
    return {kind, lang: lang === "en" ? "en" : "ar", months, title, sub, prevMonths, prevName, from: `${months[0]}-01`, to: `${months[months.length - 1]}-${lastDay(ly, lm)}`, fy, fm};
  }

  /** The center's own programs that are still running (finished ones are left out): how many, their episodes, and how many are recorded and produced. */
  function centre(programs){
    const live = (programs || []).filter(p => !p.finished), withTotal = live.filter(p => p.total);
    return {programs: live.length, episodes: withTotal.reduce((t, p) => t + p.total, 0),
      recorded: withTotal.reduce((t, p) => t + Math.min(p.recorded || 0, p.total), 0), produced: withTotal.reduce((t, p) => t + Math.min(p.done || 0, p.total), 0)};
  }
  const thisMonth = () => { const d = new Date(); return ym(d.getFullYear(), d.getMonth() + 1); };
  /** The center's figures for a period: today's running programs when the period reaches the current month,
   *  otherwise the figures pinned for its last month that has them (today's programs if none were pinned). */
  function centreFor(months, programs, monthly){
    const now = thisMonth();
    if (months.some(k => k >= now)) return centre(programs);
    const k = months.slice().reverse().find(m => monthly && monthly[m] && monthly[m].base);
    return k ? monthly[k].base : centre(programs);
  }

  /** Everything the page shows, worked out from the programs, the monthly views, the month figures entered by hand and the site's bookings.
   *  The four headline figures are the center's running programs plus any outside programs entered by hand; over a quarter or a year
   *  the hand-entered extras are added up, except the number of programs, which takes the highest month.
   *  A month set to manual shows its four typed figures as they are; when a quarter or a year has a manual month,
   *  only the manual months count (added up the same way).
   *  Filming sessions and hours are the site's bookings plus any filming entered by hand (people who came without booking online). */
  function figures(P, programs, views, monthly, studio){
    const data = (views && views.data) || {}, plats = (views && views.platforms) || [];
    const sumMonth = k => plats.reduce((t, p) => t + ((data[k] || {})[p.id] || 0), 0);
    const has = ks => ks.some(k => data[k]);
    const total = P.months.reduce((t, k) => t + sumMonth(k), 0), prev = P.prevMonths.reduce((t, k) => t + sumMonth(k), 0);
    const byPlat = plats.map(p => ({p, v: P.months.reduce((t, k) => t + ((data[k] || {})[p.id] || 0), 0)})).filter(x => x.v > 0).sort((a, b) => b.v - a.v);
    // the chart: the month and the two before it, or every month of the quarter or the year
    const chartKeys = P.kind === "month" ? [-2, -1, 0].map(i => { const d = new Date(P.fy, P.fm - 1 + i, 1); return ym(d.getFullYear(), d.getMonth() + 1); }) : P.months;
    const L = tr(P.lang), names = chartKeys.length > 3 ? L.short : L.months;
    const chart = chartKeys.map(k => ({name: names[Number(k.slice(5)) - 1], v: sumMonth(k)}));
    const rows = P.months.map(k => (monthly || {})[k]).filter(Boolean);
    const given = f => rows.filter(r => r[f] != null).map(r => r[f]);
    const sum = f => given(f).length ? Math.round(given(f).reduce((t, n) => t + n, 0) * 10) / 10 : null;
    const most = f => given(f).length ? Math.max(...given(f)) : null;
    const booked = f => studio && studio.ok ? studio[f] : null;
    const plus = f => booked(f) == null && sum(f) == null ? null : Math.round(((booked(f) || 0) + (sum(f) || 0)) * 10) / 10;
    const base = centreFor(P.months, programs, monthly), add = (f, extra) => (base[f] || 0) + (extra || 0);
    const manual = rows.filter(r => r.mode === "manual");
    const typed = (f, pick) => { const v = manual.filter(r => r[f] != null).map(r => r[f]); return v.length ? pick(v) : null; };
    const total4 = v => v.reduce((t, n) => t + n, 0), max4 = v => Math.max(...v);
    const top = programs.filter(p => !p.finished && p.total).map(p => ({name: P.lang === "en" && p.en ? p.en : p.ar, pct: Math.round(Math.min(p.done || 0, p.total) / p.total * 100)})).sort((a, b) => b.pct - a.pct).slice(0, 3);
    return {
      ...(manual.length
        ? {programs: typed("programs", max4), episodes: typed("episodes", total4), recorded: typed("recorded", total4), produced: typed("produced", total4)}
        : {programs: add("programs", most("programs")), episodes: add("episodes", sum("episodes")), recorded: add("recorded", sum("recorded")), produced: add("produced", sum("produced"))}),
      views: has(P.months) ? total : null,
      change: has(P.months) && has(P.prevMonths) && prev ? Math.round((total - prev) / prev * 100) : null,
      byPlat, chart, top,
      sessions: plus("sessions"), hours: plus("hours")
    };
  }

  function css(t, rtl){
    const g = t.glow, glow = (c, a, b) => `0 0 ${Math.round(a * g)}px ${rgba(c, Math.min(.85 * g, 1))},0 0 ${Math.round(b * g)}px ${rgba(c, .55 * g)}`;
    return `
.rp{width:794px;height:1123px;position:relative;overflow:hidden;direction:${rtl ? "rtl" : "ltr"};font-family:"TS",sans-serif;color:${t.ink};background-color:${t.bg};background-image:${t.glows};padding:34px 40px;box-sizing:border-box;-webkit-font-smoothing:antialiased;text-align:start}
.rp *{box-sizing:border-box;margin:0;padding:0}
.rp:before{content:"";position:absolute;inset:0;background:linear-gradient(118deg,transparent 0 44%,rgba(255,255,255,${t.dark ? .10 : .28}) 44% 47%,transparent 47%);pointer-events:none}
.rp .num{font-feature-settings:"tnum";direction:ltr;unicode-bidi:isolate}
.rp .card{position:relative;background:${t.card};border:1.5px solid ${t.line};border-radius:22px;box-shadow:0 18px 40px -24px rgba(0,0,0,${t.dark ? .8 : .35}),inset 0 1px 0 rgba(255,255,255,${t.dark ? .25 : .8})}
.rp .logos{display:flex;justify-content:space-between;align-items:center;position:relative}
.rp .logos .dca{height:34px;width:auto;display:block}.rp .logos .spon{display:flex;flex-direction:column;align-items:flex-start;gap:5px}.rp .logos .spon small{font-size:11.5px;font-weight:700;letter-spacing:.3px;color:${t.muted};line-height:1}.rp .logos .iic{height:52px;width:auto}
.rp .title{margin-top:10px;position:relative}
.rp .title small{font-size:13px;color:${t.muted};font-weight:500}
.rp .title h1{font-family:"TSD",serif;font-weight:900;font-size:40px;line-height:1.2;margin-top:4px;text-shadow:0 0 28px rgba(255,255,255,${t.dark ? .25 : .6})}
.rp .title p{display:inline-block;font-size:15px;font-weight:500;color:${t.ink};margin-top:12px;padding:5px 16px;border-radius:999px;background:${t.card};border:1px solid ${t.line}}
.rp .kpis{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}
.rp .kpi{padding:10px 24px 8px;overflow:hidden}
.rp .kpi:after{content:"";position:absolute;width:160px;height:160px;border-radius:50%;left:-40px;top:-60px;background:radial-gradient(circle,var(--c),transparent 70%);opacity:${t.dark ? .35 : .25}}
.rp .kpi span{font-size:14px;color:${t.muted};font-weight:500}
.rp .kpi b{display:block;text-align:start;font-family:"TSD",serif;font-size:86px;font-weight:700;line-height:.95;margin-top:2px;color:var(--c);text-shadow:var(--g)}
.rp .views{margin-top:10px;padding:14px 24px;display:grid;grid-template-columns:250px 1fr;gap:22px;align-items:center}
.rp .vt span{font-size:14px;color:${t.muted};font-weight:500}
.rp .vt b{display:block;text-align:${rtl ? "right" : "left"};font-family:"TSD",serif;font-size:58px;font-weight:700;line-height:1.1;color:${t.hero};text-shadow:${glow(t.hero, 24, 56)}}
.rp .vt b.long{font-size:46px}
.rp .vt em{font-style:normal;display:inline-block;margin-top:6px;font-size:12.5px;font-weight:700;padding:4px 10px;border-radius:999px}
.rp .vt em.up{background:rgba(52,199,123,${t.dark ? .22 : .25});color:${t.dark ? "#8FF0BE" : "#0F6B3A"}}
.rp .vt em.down{background:rgba(229,57,53,${t.dark ? .22 : .18});color:${t.dark ? "#FF9A94" : "#A3201B"}}
.rp .pr{display:grid;grid-template-columns:26px 1fr 70px;gap:12px;align-items:center;font-size:13px;margin:4px 0}
.rp .picon{width:26px;height:26px;border-radius:8px;display:grid;place-items:center;color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.3),0 6px 14px -8px rgba(0,0,0,.5)}
.rp .picon svg{width:15px;height:15px;fill:currentColor}.rp .picon b{font-size:14px;font-weight:700}
.rp .tr{height:10px;border-radius:6px;background:${t.track};display:block}.rp .tr i{display:block;height:100%;border-radius:6px;background:var(--pc);box-shadow:0 0 10px var(--pc)}
.rp .pr b,.rp .pg b{text-align:end;font-weight:700}
.rp .row{display:grid;grid-template-columns:1.25fr 1fr;gap:12px;margin-top:10px}
.rp .box{padding:14px 22px}
.rp h3{display:inline-block;font-family:"TSD",serif;font-weight:700;font-size:16px;line-height:1.3;margin-bottom:10px;padding:5px 14px 6px;border-radius:999px;color:${t.hero};background:${rgba(t.hero, t.dark ? .16 : .12)};border:1px solid ${rgba(t.hero, t.dark ? .45 : .3)}}
.rp .months{display:flex;align-items:flex-end;gap:14px;height:150px}
.rp .months.many{gap:6px}
.rp .months div{flex:1;text-align:center;font-size:12px;color:${t.muted};display:flex;flex-direction:column;justify-content:flex-end;height:100%;min-width:0}
.rp .months.many div{font-size:9.5px}
.rp .months i{display:block;border-radius:10px 10px 4px 4px;background:var(--m);margin:4px 0;box-shadow:0 0 18px var(--mg)}
.rp .months.many i{border-radius:6px 6px 3px 3px}
.rp .months b{color:${t.ink};font-size:12.5px}.rp .months.many b{font-size:9.5px}
.rp .st{display:flex;flex-direction:column;gap:4px}
.rp .st div{display:flex;justify-content:space-between;align-items:baseline}
.rp .st span{font-size:13.5px;color:${t.muted}}
.rp .st b{font-family:"TSD",serif;font-size:42px;line-height:1.15;font-weight:700;color:${t.acc[1]};text-shadow:${glow(t.acc[1], 20, 40)}}
.rp .st hr{border:0;height:1px;background:${t.line}}
.rp .pg{display:grid;grid-template-columns:150px 1fr 44px;gap:12px;align-items:center;font-size:13.5px;margin:6px 0}
.rp .none{font-size:13px;color:${t.muted}}
.rp .foot{position:absolute;bottom:22px;left:40px;right:40px;display:flex;justify-content:space-between;font-size:11px;color:${t.muted}}`;
  }

  /** The report page as HTML, with its own styles. */
  function render(P, F, theme, issued){
    const L = tr(P.lang), t = THEMES[theme] || THEMES.day, a = t.acc, logo = t.dark ? "white" : "clear";
    const g = c => `0 0 ${Math.round(22 * t.glow)}px ${rgba(c, Math.min(.85 * t.glow, 1))},0 0 ${Math.round(48 * t.glow)}px ${rgba(c, .55 * t.glow)}`;
    const kpi = (i, label, v) => `<div class="card kpi" style="--c:${a[i]};--g:${g(a[i])}"><span>${label}</span><b class="num">${v == null ? "—" : fmt(v)}</b></div>`;
    const mx = Math.max(1, ...F.byPlat.map(x => x.v));
    const plats = F.byPlat.length ? F.byPlat.slice(0, 6).map(x => { const c = PCOLOR[x.p.id] || (x.p.id === "tt" ? (t.dark ? "#25F4EE" : "#111111") : a[0]); return `<div class="pr" style="--pc:${c}" title="${esc(x.p.name)}">${window.ICS.platformIcon(x.p)}<span class="tr"><i style="width:${Math.max(x.v / mx * 100, 2)}%"></i></span><b class="num">${fmt(x.v)}</b></div>`; }).join("") : `<p class="none">${L.noViews}</p>`;
    const cmx = Math.max(1, ...F.chart.map(x => x.v)), many = F.chart.length > 3;
    const bars = F.chart.map((x, i) => { const c = i === F.chart.length - 1 ? a[3] : many ? a[1] : [a[2], a[1]][i % 2]; return `<div style="--m:${c};--mg:${rgba(c, .7)}"><b class="num">${x.v ? (many ? short(x.v) : fmt(x.v)) : "—"}</b><i style="height:${Math.max(x.v / cmx * 82, x.v ? 3 : 1)}%"></i>${x.name}</div>`; }).join("");
    const chg = F.change == null ? "" : `<em class="${F.change >= 0 ? "up" : "down"}">${F.change >= 0 ? "▲" : "▼"} <span class="num">${Math.abs(F.change)}%</span> ${L.vs} ${esc(P.prevName)}</em>`;
    const vtext = F.views == null ? "—" : fmt(F.views);
    const chartTitle = L.chart[P.kind];
    const top = F.top.length ? F.top.map(x => `<div class="pg" style="--pc:${a[3]}"><span>${esc(x.name)}</span><span class="tr"><i style="width:${Math.max(x.pct, 2)}%"></i></span><b class="num">${x.pct}%</b></div>`).join("") : `<p class="none">—</p>`;
    return `<style>${css(t, P.lang !== "en")}</style><div class="rp" lang="${P.lang}">
<div class="logos"><span class="spon"><small>${L.sponsor}</small><img class="dca" src="img/dca-logo-${logo}.png" alt="${L.dca}"></span><img class="iic" src="img/iic-studio-${logo}.png" alt="IIC Studio"></div>
<div class="title"><small>${L.kicker}</small><h1>${esc(P.title)}</h1><p>${esc(P.sub)}</p></div>
<div class="kpis">${kpi(0, L.programs, F.programs)}${kpi(1, L.episodes, F.episodes)}${kpi(2, L.recorded, F.recorded)}${kpi(3, L.produced, F.produced)}</div>
<div class="card views"><div class="vt"><h3>${L.views}</h3><b class="num${vtext.length > 7 ? " long" : ""}">${vtext}</b>${chg}</div><div>${plats}</div></div>
<div class="row"><div class="card box"><h3>${chartTitle}</h3><div class="months${many ? " many" : ""}">${bars}</div></div>
<div class="card box"><h3>${L.studio}</h3><div class="st"><div><span>${L.sessions}</span><b class="num">${F.sessions == null ? "—" : fmt(F.sessions)}</b></div><hr><div><span>${L.hours}</span><b class="num">${F.hours == null ? "—" : fmt(F.hours)}</b></div></div></div></div>
<div class="card box" style="margin-top:10px"><h3>${L.top}</h3>${top}</div>
<div class="foot"><span>${L.dca} · IIC Studio</span><span>${L.issued} ${esc(issued)}</span></div>
</div>`;
  }

  const issuedText = (d, lang) => `${d.getDate()} ${tr(lang).months[d.getMonth()]} ${d.getFullYear()}`;
  window.ICSReport = {MONTHS, QUARTERS, period, figures, render, issuedText, centre, thisMonth};
})();
