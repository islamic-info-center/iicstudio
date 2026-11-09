// IIC Studio — public page: programs, production plan, studio bookings and the team screen.
(function(){
  const {platformIcon, platformColor, langName, langOptions, CATEGORIES, catList, CANCEL_REASONS, RULES, DAY, isoOf, midnight, endOf, todayMid, slotPast, esc, store, call, session, bookingsOn, hourTaken, startsFor, bookableDay} = window.ICS;

  const T = {
    ar: {
      navOverview:"نظرة عامة", navPrograms:"البرامج", navStudio:"الحجوزات", navProduction:"الإنتاج", sections:"أقسام الصفحة",
      modeLabel:"الوضع الليلي", adminLabel:"لوحة الإدارة", bookBtn:"حجز الاستوديو", close:"إغلاق", toTop:"العودة إلى الأعلى",
      eyebrow:"من الفكرة إلى الشاشة", h1:"خطــة استــوديو\nمركز المعلومات الإسلامي",
      heroSub:(n, p) => `${n} برنامجاً قيد المونتاج لدى ${p} مقدّمين.`,
      sLeft:"الحلقات المتبقية", sLeftSub:pace => `نحو ${pace} أسبوعياً`, monthLabel:m => `المطلوب في ${m}`, sMonthSub:"من اليوم حتى نهاية الشهر",
      sNear:"أقرب موعد", nearSub:(nm, d) => `${nm} · بعد ${d} يوماً`, sWeek:"حجوزات هذا الأسبوع", sWeekSub:"الأربعاء والخميس والأحد",
      navViews:"المشاهدات", viewsTitle:"المشاهدات", viewsTotal:m => `إجمالي المشاهدات · ${m}`, vsPrev:"عن الشهر السابق", last5:"آخر 3 أشهر", noViews:"لم تُدخل أرقام هذا الشهر بعد.", prevMonth:"الشهر السابق", nextMonth:"الشهر التالي",
      sPrograms:"عدد البرامج", sTotal:"إجمالي الحلقات", sRecorded:"تم تسجيل", sProduced:"تم إنتاج", otherType:"أخرى",
      biggest:(n, v) => `أكبرها ${n} · ${v} حلقة`, recLeft:n => `باقي ${n} حلقة للتسجيل`, prodLeft:n => `باقي ${n} حلقة للإنتاج`,
      of:(v, n) => `${v} من ${n}`, deliveryLabel:"موعد التسليم", dueDefaultShort:"31 ديسمبر (افتراضي)",
      recLabel:"التسجيل", prodLabel:"المونتاج والإخراج", dueOn:d => `الموعد ${d}`, epCount:n => `${n} حلقة`,
      programsTitle:"البرامج", programsCount:(a, f) => `${a} قيد المونتاج · ${f} منتهية`, all:"الكل",
      showAll:n => `عرض كل البرامج (${n})`, showLess:"عرض أقل",
      type:{series:"سلسلة", shorts:"مقاطع قصيرة", course:"دورة", single:"حلقة واحدة"}, langTag:{ar:"بالعربية", en:"بالإنجليزية"},
      progress:(d, t) => `${d} من ${t} حلقة`, noCount:"لم يُحدَّد عدد الحلقات", watch:"عرض", watchTip:"مشاهدة حلقات البرنامج", chooseEp:"اختر الحلقة", epNow:(n, t) => `الحلقة ${n} من ${t}`, prevEp:"السابقة", nextEp:"التالية", openIn:h => `فتح في ${h}`, allEps:"كل الحلقات", epsInfo:(n, m) => `${n} حلقة · متاح منها ${m}`, noEmbed:"هذا الرابط لا يُعرض داخل النافذة، افتحه في صفحة جديدة.", lgCur:"الحلقة المعروضة", lgOn:"حلقة متاحة", lgOff:"لم تُنشر بعد", epLabel:"الحلقة", finished:"منتهٍ", complete:"مكتمل",
      perWeek:p => `${p} أسبوعياً`, late:"تجاوز الموعد", soon:n => n <= 1 ? "التسليم اليوم" : n === 2 ? "التسليم غداً" : "باقي يومان على التسليم", dueDefault:"31 ديسمبر (افتراضي)",
      weekCount:(n, m) => `${n} من ${m} حجوزات`, noBookings:"لا توجد حجوزات في هذا الأسبوع.", avail:p => `متاح للحجز: ${p}`, noneLeft:"لا أوقات متاحة في هذا الأسبوع.",
      studioTitle:"حجوزات الاستوديو", prevW:"الأسبوع السابق", nextW:"الأسبوع التالي",
      cap:(n, m) => `${n} من ${m}`, booked:"محجوز", details:"التفاصيل", free:"متاح", closed:"اكتمل اليوم",
      screenOn:"عرض على شاشة الفريق", screenOff:"الخروج من وضع الشاشة",
      vWeek:"الأسبوع", vMonth:"الشهر", vUp:"الحجوزات القادمة", today:"اليوم", sbViews:"طريقة العرض", sbPrev:"السابق", sbNext:"التالي",
      sbCount:n => `عدد الحجوزات: ${n}`, noMonth:"لا توجد حجوزات في هذا الشهر.", noUp:"لا توجد حجوزات قادمة.", todayTag:"اليوم",
      monthTitle:"الحلقات المطلوبة كل شهر", monthNote:"موزّعة بالتساوي من اليوم حتى موعد كل برنامج",
      ganttTitle:"الجدول الزمني حتى موعد كل برنامج", ganttNote:"طول الشريط = المدة من اليوم حتى موعد التسليم، فيقصر يوماً بعد يوم كلما اقترب الموعد. الرقم = الحلقات الباقية للإنتاج.", eps:(r, n, d) => `باقي ${r} من ${n} · التسليم ${d}`,
      monthLead:"عدد الحلقات التي يجب إنتاجها (مونتاج وإخراج) في كل شهر حتى تُسلَّم كل البرامج في مواعيدها. اضغط على أي شهر لترى توزيعه على البرامج.", thisMonth:"هذا الشهر", epUnit:"حلقة", perWeek:n => `نحو ${n} حلقة أسبوعياً`, leftAll:(n, m) => `الباقي كله: ${n} حلقة حتى ${m}`, monthOf:m => `توزيع ${m}`,
      footerName:"استوديو مركز المعلومات الإسلامي", sponsor:"الراعي الرسمي",
      bookNote:"الحجز أيام الأحد والأربعاء والخميس من 2 ظهراً إلى 8 مساءً، ثلاثة حجوزات في اليوم كحد أقصى، ومدة الحجز ساعة أو ساعتان. يكون الحجز قبل الموعد بـ24 ساعة على الأقل، ويصلك إيميل تأكيد بعد الحجز.",
      pickDay:"اختر اليوم", pickDur:"مدة الحجز", dur:d => d === 1 ? "ساعة" : "ساعتان", pickTime:"اختر الوقت",
      left:n => `باقي ${n}`, noTimes:"لا توجد أوقات متاحة في هذا اليوم.", dayFull:"اكتملت حجوزات هذا اليوم (3 حجوزات).",
      prevM:"الشهر السابق", nextM:"الشهر التالي",
      fTitle:"العنوان", titleHint:"اكتب عنوان الحلقة أو الموضوع", fLang:"اللغة", pickLang:"اختر اللغة", fCat:"الفئة", catHint:"(يمكنك اختيار أكثر من فئة)", cats:{muslim:"مسلمين بالأصل", newMuslim:"مسلمين جدد", nonMuslim:"غير مسلمين"}, catBad:"اختر فئة واحدة على الأقل.", soon:"الحجز يكون قبل الموعد بـ24 ساعة على الأقل، اختر وقتاً آخر.",
      fName:"الاسم", fEmail:"البريد الإلكتروني", fPhone:"رقم الهاتف", fCountry:"مفتاح الدولة", fProgram:"البرنامج", fNotes:"ملاحظات", optional:"(اختياري)", other:"أخرى",
      fContent:"المحتوى (السكريبت)", contentHint:"الصق نص السكريبت أو رابطه، أو اكتب محتوى الحلقة", phoneBad:"اكتب رقم هاتف صحيحاً.",
      back:"رجوع", confirm:"تأكيد الحجز", sending:"جارٍ الحجز…",
      doneTitle:"تم تأكيد حجزك", doneBody:(w, e) => `موعدك ${w}. أرسلنا إيصال الحجز إلى ${e}.`, again:"حجز موعد آخر",
      mapBtn:"موقع الاستوديو", waNote:"وصلتك رسالة تأكيد على واتساب، وسنذكّرك قبل الموعد بـ12 ساعة تقريباً.",
      taken:"سبقك أحد إلى هذا الوقت، اختر وقتاً آخر.", invalid:"تأكد من الاسم والبريد الإلكتروني، ثم حاول مرة أخرى.", offline:"تعذّر الاتصال بالخادم. حاول بعد قليل.", err:"تعذّر الحجز، حاول مرة أخرى.",
      detailTitle:"تفاصيل الحجز", cxTitle:"إلغاء الحجز", cxAsk:"هل تريد إلغاء هذا الحجز؟ سيُتاح الموعد لغيرك.", cxYes:"نعم، ألغِ الحجز", cxSending:"جارٍ الإلغاء…", cxNo:"لا، أبقِ الحجز", cxWhy:"ما سبب الإلغاء؟", reasons:{forgot:"النسيان", busy:"الانشغال", emergency:"ظرف طارئ", other:"أخرى"}, cxOtherHint:"اكتب سبب الإلغاء", cxNeedReason:"اختر سبب الإلغاء أولاً.", cxNeedText:"اكتب سبب الإلغاء في الخانة.", cxDone:"تم إلغاء حجزك، وأرسلنا لك إيميلاً بذلك.", cxMissing:"هذا الحجز غير موجود أو أُلغي من قبل.", cxPast:"هذا الموعد مضى ولا يمكن إلغاؤه.", teamOnly:"بيانات صاحب الحجز تظهر لفريق الاستوديو فقط. سجّل الدخول بحسابك.",
      login:"دخول", email:"البريد الإلكتروني", password:"كلمة المرور", wrongLogin:"البريد أو كلمة المرور غير صحيحة.", loading:"جارٍ التحميل…", logout:"تسجيل الخروج",
      range:(a, b) => `${a - 12}:00 – ${b - 12}:00 م`,
      demo:"وضع التجربة: الخادم غير مربوط بعد، والبيانات محفوظة في هذا المتصفح فقط. للدخول جرّب admin@demo وكلمة المرور demo1234."
    },
    en: {
      navOverview:"Overview", navPrograms:"Programs", navStudio:"Bookings", navProduction:"Production", sections:"Page sections",
      modeLabel:"Dark mode", adminLabel:"Admin panel", bookBtn:"Book the studio", close:"Close", toTop:"Back to top",
      eyebrow:"From idea to screen", h1:"Islamic Information Center Studio Plan",
      heroSub:(n, p) => `${n} programs in editing across ${p} presenters.`,
      sLeft:"Episodes left", sLeftSub:pace => `About ${pace} a week`, monthLabel:m => `Needed in ${m}`, sMonthSub:"from today to month end",
      sNear:"Next deadline", nearSub:(nm, d) => `${nm} · in ${d} days`, sWeek:"Bookings this week", sWeekSub:"Wednesday, Thursday and Sunday",
      navViews:"Views", viewsTitle:"Views", viewsTotal:m => `Total views · ${m}`, vsPrev:"vs last month", last5:"Last 3 months", noViews:"No figures for this month yet.", prevMonth:"Previous month", nextMonth:"Next month",
      sPrograms:"Programs", sTotal:"Total episodes", sRecorded:"Recorded", sProduced:"Produced", otherType:"Other",
      biggest:(n, v) => `Largest: ${n} · ${v} episodes`, recLeft:n => `${n} left to record`, prodLeft:n => `${n} left to produce`,
      of:(v, n) => `${v} of ${n}`, deliveryLabel:"Delivery date", dueDefaultShort:"31 December (default)",
      recLabel:"Recording", prodLabel:"Editing & production", dueOn:d => `Due ${d}`, epCount:n => `${n} episodes`,
      programsTitle:"Programs", programsCount:(a, f) => `${a} in editing · ${f} finished`, all:"All",
      showAll:n => `Show all programs (${n})`, showLess:"Show less",
      type:{series:"Series", shorts:"Shorts", course:"Course", single:"Single episode"}, langTag:{ar:"In Arabic", en:"In English"},
      progress:(d, t) => `${d} of ${t} episodes`, noCount:"Episode count not set", watch:"View", watchTip:"Watch the program's episodes", chooseEp:"Choose an episode", epNow:(n, t) => `Episode ${n} of ${t}`, prevEp:"Previous", nextEp:"Next", openIn:h => `Open in ${h}`, allEps:"All episodes", epsInfo:(n, m) => `${n} episodes · ${m} available`, noEmbed:"This link can't play inside the window; open it in a new tab.", lgCur:"Now showing", lgOn:"Available", lgOff:"Not published yet", epLabel:"Episode", finished:"Finished", complete:"Complete",
      perWeek:p => `${p} a week`, late:"Past due", soon:n => n <= 1 ? "Due today" : n === 2 ? "Due tomorrow" : "2 days left to delivery", dueDefault:"31 December (default)",
      weekCount:(n, m) => `${n} of ${m} bookings`, noBookings:"No bookings this week.", avail:p => `Open: ${p}`, noneLeft:"No times left this week.",
      studioTitle:"Studio bookings", prevW:"Previous week", nextW:"Next week",
      cap:(n, m) => `${n} of ${m}`, booked:"Booked", details:"Details", free:"Free", closed:"Day full",
      screenOn:"Show on the team screen", screenOff:"Exit screen view",
      vWeek:"Week", vMonth:"Month", vUp:"Upcoming bookings", today:"Today", sbViews:"View", sbPrev:"Previous", sbNext:"Next",
      sbCount:n => `Bookings: ${n}`, noMonth:"No bookings this month.", noUp:"No upcoming bookings.", todayTag:"Today",
      monthTitle:"Episodes needed each month", monthNote:"spread evenly from today to each program's date",
      ganttTitle:"Timeline to each finish-by date", ganttNote:"Bar length = time from today to the due date, so it shortens day by day as the date nears. The number = episodes still to produce.", eps:(r, n, d) => `${r} of ${n} left · due ${d}`,
      monthLead:"Episodes to produce (editing and production) each month so every program is delivered on time. Tap a month to see its split by program.", thisMonth:"This month", epUnit:"eps", perWeek:n => `about ${n} a week`, leftAll:(n, m) => `All remaining: ${n} episodes until ${m}`, monthOf:m => `${m} split`,
      footerName:"Islamic Information Center studio", sponsor:"Official sponsor",
      bookNote:"Sundays, Wednesdays and Thursdays, 2 pm to 8 pm. Up to 3 bookings a day, each 1 or 2 hours. Book at least 24 hours ahead. You'll get a confirmation email.",
      pickDay:"Choose a day", pickDur:"Length", dur:d => d === 1 ? "1 hour" : "2 hours", pickTime:"Choose a time",
      left:n => `${n} left`, noTimes:"No times left on this day.", dayFull:"This day is fully booked (3 bookings).",
      prevM:"Previous month", nextM:"Next month",
      fTitle:"Title", titleHint:"Type the episode title or topic", fLang:"Language", pickLang:"Choose a language", fCat:"Audience", catHint:"(you can pick more than one)", cats:{muslim:"Born Muslims", newMuslim:"New Muslims", nonMuslim:"Non-Muslims"}, catBad:"Choose at least one audience.", soon:"Bookings must be at least 24 hours ahead. Pick another time.",
      fName:"Name", fEmail:"Email", fPhone:"Phone", fCountry:"Country code", fProgram:"Program", fNotes:"Notes", optional:"(optional)", other:"Other",
      fContent:"Content (script)", contentHint:"Paste the script text or a link, or describe the episode", phoneBad:"Enter a valid phone number.",
      back:"Back", confirm:"Confirm booking", sending:"Booking…",
      doneTitle:"Your booking is confirmed", doneBody:(w, e) => `Your slot: ${w}. Your booking receipt is on its way to ${e}.`, again:"Book another time",
      mapBtn:"Studio location", waNote:"We've sent you a WhatsApp confirmation and will remind you about 12 hours before.",
      taken:"Someone just took that time. Pick another.", invalid:"Check your name and email, then try again.", offline:"Can't reach the server. Try again shortly.", err:"Couldn't book. Try again.",
      detailTitle:"Booking details", cxTitle:"Cancel booking", cxAsk:"Cancel this booking? The slot will be freed for someone else.", cxYes:"Yes, cancel it", cxSending:"Cancelling…", cxNo:"No, keep it", cxWhy:"Why are you cancelling?", reasons:{forgot:"I forgot", busy:"I'm busy", emergency:"An emergency", other:"Other"}, cxOtherHint:"Type the reason", cxNeedReason:"Choose a reason first.", cxNeedText:"Type the reason in the box.", cxDone:"Your booking is cancelled. We've emailed you a confirmation.", cxMissing:"This booking doesn't exist or was already cancelled.", cxPast:"This booking has already passed, so it can't be cancelled.", teamOnly:"Booker details are for the studio team. Sign in with your account.",
      login:"Sign in", email:"Email", password:"Password", wrongLogin:"Wrong email or password.", loading:"Loading…", logout:"Sign out",
      range:(a, b) => `${a - 12}:00–${b - 12}:00 pm`,
      demo:"Demo mode: no server connected yet; data is kept in this browser only. To sign in, try admin@demo with password demo1234."
    }
  };

  const YEAR_END = "2026-12-31";
  const PCOLORS = ["#2660A8", "#3AB4CF", "#66BDB1", "#D0A75A", "#6E4FA3", "#B04A2A", "#251B57", "#237E8F"];
  let lang = store.get("ics-lang") === "en" ? "en" : "ar";
  let programs = [], bookings = [], filter = "", showAll = false, weekOffset = 0, details = null, user = session.user();
  const t = () => T[lang];
  const locale = () => lang === "ar" ? "ar-u-nu-latn" : "en-GB";
  const fmt = n => n.toLocaleString("en-US", {maximumFractionDigits: 1});
  const $ = id => document.getElementById(id);

  // ---------- program maths ----------
  const nameOf = p => (lang === "en" && p.en) || p.ar;
  const altName = p => lang === "en" ? p.ar : p.en;
  const presenterOf = p => (lang === "en" && p.presenterEn) || p.presenter;
  const active = () => programs.filter(p => !p.finished).sort((a, b) => (a.order || 0) - (b.order || 0));
  const dueOf = p => p.due || YEAR_END;
  const remaining = p => p.total ? Math.max(p.total - (p.done || 0), 0) : null;
  const weeksTo = iso => Math.max((endOf(iso) - Date.now()) / (7 * DAY), 0);
  const daysTo = iso => Math.ceil((endOf(iso) - Date.now()) / DAY);
  const paceOf = p => { const r = remaining(p); if (!r) return 0; const w = weeksTo(dueOf(p)); return w > 0 ? r / w : r; };
  const fmtDate = (iso, opts) => midnight(iso).toLocaleDateString(locale(), opts || {day: "numeric", month: "long"});
  const mKey = d => d.getFullYear() * 12 + d.getMonth();
  const mStart = k => new Date(Math.floor(k / 12), k % 12, 1);
  const mEnd = k => new Date(Math.floor(k / 12), k % 12 + 1, 0);
  const mName = (k, year) => mStart(k).toLocaleDateString(locale(), year ? {month: "long", year: "numeric"} : {month: "long"});
  const presenters = () => [...new Set(active().map(p => p.presenter))];
  // a finished program whose presenter has nothing in editing still gets a colour (otherwise its name pill turns transparent)
  const colorOf = p => {
    const ps = presenters(), i = ps.indexOf(p.presenter);
    const extra = [...new Set(programs.filter(x => !ps.includes(x.presenter)).map(x => x.presenter))];
    return PCOLORS[(i >= 0 ? i : ps.length + Math.max(extra.indexOf(p.presenter), 0)) % PCOLORS.length];
  };

  function allocate(r, today, last, months){
    const span = Math.round((last - today) / DAY) + 1;
    const raw = months.map(k => { const a = Math.max(mStart(k), today), b = Math.min(mEnd(k), last); return b >= a ? r * (Math.round((b - a) / DAY) + 1) / span : 0; });
    const out = raw.map(Math.floor);
    let rest = r - out.reduce((s, v) => s + v, 0);
    raw.map((v, i) => [v - Math.floor(v), i]).sort((x, y) => y[0] - x[0]).forEach(([, i]) => { if (rest > 0 && raw[i] > 0){ out[i]++; rest--; } });
    return out;
  }
  function plan(){
    const today = todayMid(), nowK = mKey(today);
    const items = active().filter(p => remaining(p) > 0).map(p => ({p, r: remaining(p), last: midnight(dueOf(p))}));
    let lastK = mKey(midnight(YEAR_END));
    items.forEach(x => { x.late = x.last < today; lastK = Math.max(lastK, mKey(x.last)); });
    const months = []; for (let k = nowK; k <= lastK; k++) months.push(k);
    items.forEach(x => { x.alloc = x.late ? months.map((k, i) => i ? 0 : x.r) : allocate(x.r, today, x.last, months); });
    return {items, months, sum: i => items.reduce((s, x) => s + x.alloc[i], 0)};
  }

  // ---------- page text ----------
  // a two-line title: each line its own span, the first (with kashida) scaled to the width of the second
  // "بالعربية" / "In Arabic" for the two usual ones; any other language by its own name
  function langTag(c){
    if (t().langTag[c]) return t().langTag[c];
    const n = langName(c, lang);
    return lang === "ar" ? (n.startsWith("ال") ? "ب" + n : "بلغة " + n) : "In " + n;
  }

  // a booking stores the program name in the booker's language; show it in the reader's
  function progName(s){
    const p = programs.find(x => x.ar === s || x.en === s);
    if (p) return nameOf(p);
    return s === T.ar.other || s === T.en.other ? t().other : s;
  }

  function fitTitle(){
    const h = document.querySelector(".hero h1"), v = t().h1;
    if (!h || !v.includes("\n")){ if (h) h.classList.remove("two"); return; }
    h.classList.add("two");
    h.innerHTML = v.split("\n").map(x => `<span>${esc(x)}</span>`).join("");
    const [a, b] = h.children;
    a.style.fontSize = b.style.fontSize = "";
    const base = parseFloat(getComputedStyle(h).fontSize), room = h.clientWidth;
    const fb = Math.min(base, base * room / b.scrollWidth);
    b.style.fontSize = fb + "px";
    let fa = fb * b.scrollWidth / a.scrollWidth;
    for (let i = 0; i < 3; i++){ a.style.fontSize = fa + "px"; fa *= b.getBoundingClientRect().width / a.getBoundingClientRect().width; }   // glyph widths are not quite linear in size
    a.style.fontSize = Math.min(fa, fb * 1.85) + "px";
  }
  window.addEventListener("resize", () => fitTitle());
  if (document.fonts) document.fonts.ready.then(() => fitTitle());

  function applyText(){
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-t]").forEach(el => { const v = t()[el.dataset.t]; if (typeof v === "string") el.textContent = v; });
    document.querySelectorAll("[data-ta]").forEach(el => el.setAttribute("aria-label", t()[el.dataset.ta]));
    fitTitle();
    $("lang-btn").textContent = lang === "ar" ? "English" : "عربي";
    $("lang-btn").lang = lang === "ar" ? "en" : "ar";
    $("demo-note").hidden = !window.ICS.DEMO;
    $("demo-note").textContent = t().demo;
  }

  // ---------- overview ----------
  let loaded = false;   // until the first answer from the server, a first-time visitor sees dashes, not zeros
  function renderStats(){
    if (!loaded && !programs.length){ ["s-programs", "s-total", "s-rec", "s-prod"].forEach(id => { $(id).textContent = "—"; }); ["s-rec-pct", "s-prod-pct", "s-rec-sub", "s-prod-sub", "s-types"].forEach(id => { $(id).textContent = ""; }); return; }
    const act = active(), withTotal = act.filter(p => p.total);
    $("s-programs").textContent = String(act.length);
    const types = {};
    act.forEach(p => { const k = p.type || "other"; types[k] = (types[k] || 0) + 1; });
    $("s-types").innerHTML = Object.entries(types).sort((x, y) => y[1] - x[1]).map(([k, n]) => `<span>${esc(k === "other" ? t().otherType : t().type[k])}: ${n}</span>`).join("");
    const total = withTotal.reduce((s, p) => s + p.total, 0);
    const rec = withTotal.reduce((s, p) => s + Math.min(p.recorded || 0, p.total), 0);
    const prod = withTotal.reduce((s, p) => s + Math.min(p.done || 0, p.total), 0);
    const pc = v => total ? Math.round(v / total * 100) : 0;
    $("s-total").textContent = total ? String(total) : "—";
    $("s-rec").textContent = String(rec); $("s-rec-pct").textContent = pc(rec) + "%"; $("s-rec-bar").style.width = pc(rec) + "%"; $("s-rec-sub").textContent = t().recLeft(total - rec);
    $("s-prod").textContent = String(prod); $("s-prod-pct").textContent = pc(prod) + "%"; $("s-prod-bar").style.width = pc(prod) + "%"; $("s-prod-sub").textContent = t().prodLeft(total - prod);
  }

  // ---------- programs ----------
  // Card at rest: name and the two completion rates. Hover, keyboard focus or a tap opens the details below.
  // the program's own link (its published videos, or the folder it is being made in), set in admin
  function watchHTML(p){
    const url = /^https?:\/\//i.test(String(p.link || "")) ? p.link : "";
    const icon = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11"/><path d="M10 8.2v7.6l6-3.8z"/></svg>`;
    if ((p.eps || []).some(Boolean)) return `<button type="button" class="watch" data-play="${esc(p.id)}" title="${esc(t().watchTip)}">${icon}<span>${esc(t().watch)}</span></button>`;
    return url ? `<a class="watch" href="${esc(url)}" target="_blank" rel="noopener" title="${esc(t().watchTip)}"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11"/><path d="M10 8.2v7.6l6-3.8z"/></svg><span>${esc(t().watch)}</span></a>` : "";
  }
  // ---------- episode player: a window that plays each episode's link, with a button per episode ----------
  let player = null;   // {id, ep}
  function embedOf(u){
    u = String(u || "").trim();
    let m;
    if (/player\.vimeo\.com\/video\/\d+/i.test(u)) return {src: u, host: "Vimeo"};
    if (/vimeo\.com\//i.test(u)){
      // Each episode needs its own video number. Look for it where Vimeo puts it, so a link to a showcase, a review page
      // or a user's page never falls back to a number that is the same for every episode (the user's or the showcase's).
      const path = u.replace(/^https?:\/\/[^\/]+/i, "").split(/[?#]/)[0], q = u.split("#")[0];
      const hashOf = id => { const a = path.match(new RegExp("\\/" + id + "\\/([0-9a-f]{6,})(?=\\/|$)", "i")); return a ? a[1] : (q.match(/[?&]h=([0-9a-f]+)/i) || [])[1]; };
      const vimeo = id => { const h = hashOf(id); return {src: `https://player.vimeo.com/video/${id}${h ? "?h=" + h : ""}`, host: "Vimeo"}; };
      if ((m = path.match(/\/review\/(\d{5,})/i))) return {src: `https://player.vimeo.com/video/${m[1]}`, host: "Vimeo"};   // the hash after it is the review page's, not the video's
      if ((m = path.match(/\/videos?\/(\d{5,})/i)) || (m = q.match(/[?&]video=(\d{5,})/i))) return vimeo(m[1]);
      if ((m = path.match(/\/(?:showcase|album)\/(\d+)/i))) return {src: `https://vimeo.com/showcase/${m[1]}/embed`, host: "Vimeo"};
      if (/\/(?:user|users|folder|folders|event|events|groups)\/|\/manage\/(?!videos)/i.test(path)) return {src: "", host: "Vimeo"};
      // vimeo.com/<id>, vimeo.com/<id>/<private hash>, vimeo.com/channels/<name>/<id>: the first number in the path is the video
      if ((m = path.match(/\/(\d{5,})(?=\/|$)/))) return vimeo(m[1]);
      return {src: "", host: "Vimeo"};
    }
    if ((m = u.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/))) return {src: `https://www.youtube-nocookie.com/embed/${m[1]}?rel=0`, host: "YouTube"};
    if ((m = u.match(/youtube\.com\/.*[?&]list=([\w-]+)/))) return {src: `https://www.youtube-nocookie.com/embed/videoseries?list=${m[1]}&rel=0`, host: "YouTube"};
    if ((m = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:[^#]*&)?id=)([\w-]{10,})/))) return {src: `https://drive.google.com/file/d/${m[1]}/preview`, host: "Google Drive"};
    let host = ""; try { host = new URL(u).hostname.replace(/^www\./, ""); } catch (e) {}
    return {src: "", host: host};
  }
  function openPlayer(id){
    const p = programs.find(x => x.id === id); if (!p) return;
    const eps = p.eps || [];
    player = {id: id, ep: Math.max(eps.findIndex(Boolean), 0)};
    renderPlayer();
    if (!$("player").open) $("player").showModal();
  }
  function renderPlayer(){
    const p = programs.find(x => x.id === player.id); if (!p) return;
    const eps = p.eps || [], n = Math.max(Number(p.total) || 0, eps.length), have = eps.filter(Boolean).length;
    const u = eps[player.ep] || "", e = embedOf(u);
    const dlg = $("player"); dlg.style.setProperty("--c", colorOf(p));
    $("pl-title").textContent = nameOf(p);
    $("pl-who").textContent = [presenterOf(p), t().epsInfo(n, have)].join(" · ");
    const prev = eps.slice(0, player.ep).map(Boolean).lastIndexOf(true), next = eps.findIndex((x, i) => i > player.ep && x);
    $("pl-body").innerHTML = `
      <div class="screen">${e.src ? `<iframe src="${esc(e.src)}" title="${esc(t().epNow(player.ep + 1, n))}" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`
        : `<div class="no-embed"><p>${esc(t().noEmbed)}</p><a class="ext" href="${esc(u)}" target="_blank" rel="noopener">${esc(t().openIn(e.host || "…"))} ↗</a></div>`}</div>
      <div class="bar-row"><h3>${esc(t().epNow(player.ep + 1, n))}</h3><div class="navs">
        <button type="button" data-ep="${prev}"${prev < 0 ? " disabled" : ""}>${lang === "en" ? "← " : "→ "}${esc(t().prevEp)}</button>
        <button type="button" data-ep="${next}"${next < 0 ? " disabled" : ""}>${esc(t().nextEp)}${lang === "en" ? " →" : " ←"}</button>
        <a class="ext" href="${esc(u)}" target="_blank" rel="noopener">${esc(t().openIn(e.host || "…"))} ↗</a>
        ${/^https?:\/\//i.test(p.link || "") ? `<a class="ext" href="${esc(p.link)}" target="_blank" rel="noopener">${esc(t().allEps)} ↗</a>` : ""}</div></div>
      <div class="eps" role="group" aria-label="${esc(t().chooseEp)}">${Array.from({length: n}, (_, i) => `<button type="button" data-ep="${i}"${i === player.ep ? ' class="cur" aria-current="true"' : ""}${eps[i] ? "" : " disabled"} aria-label="${esc(t().epLabel + " " + (i + 1))}">${i + 1}</button>`).join("")}</div>
      <div class="legend"><span><i class="c"></i>${esc(t().lgCur)}</span><span><i></i>${esc(t().lgOn)}</span>${have < n ? `<span><i class="d"></i>${esc(t().lgOff)}</span>` : ""}</div>`;
  }

  function cardHTML(p){
    const r = remaining(p), left = daysTo(dueOf(p)), late = r > 0 && left <= 0, soon = isSoon(p);
    const tags = [p.type && `<span class="tag ${p.type}">${esc(t().type[p.type])}</span>`, p.lang && `<span class="tag">${esc(langTag(p.lang))}</span>`, p.note && `<span class="tag">${esc(p.note)}</span>`].filter(Boolean).join(" ");
    // each part isolated, so a Latin name next to Arabic text can't pull the episode count out of place
    const sub = [altName(p), p.total ? t().epCount(p.total) : ""].filter(Boolean).map(x => `<bdi>${esc(x)}</bdi>`).join(" · ");
    let rest, detail;
    if (p.finished){ rest = `<p class="state">${esc(t().finished)}</p>`; detail = ""; }
    else if (!p.total){ rest = `<p class="state">${esc(t().noCount)}</p>`; detail = ""; }
    else {
      const rec = Math.min(p.recorded || 0, p.total), done = Math.min(p.done || 0, p.total);
      const pc = v => Math.round(v / p.total * 100);
      const mini = (label, v, bar, num) => `<div class="mini"><span>${esc(label)}</span><b class="${num}">${pc(v)}%</b><div class="bar ${bar}"><i style="width:${v ? Math.max(pc(v), 3) : 0}%"></i></div></div>`;
      rest = `<div class="minis">${mini(t().recLabel, rec, "teal", "t")}${mini(t().prodLabel, done, "gold", "g")}</div>`;
      detail = `<dl class="facts"><div><dt>${esc(t().recLabel)}</dt><dd>${esc(t().of(rec, p.total))}</dd></div><div><dt>${esc(t().prodLabel)}</dt><dd>${esc(t().of(done, p.total))}</dd></div></dl>
        <div class="due-pill${late ? " late" : r === 0 ? " ok" : ""}"><span>${esc(t().deliveryLabel)}</span><b>${esc(r === 0 ? t().complete : late ? t().late : p.due ? fmtDate(p.due) : t().dueDefaultShort)}</b></div>`;
    }
    return `<article class="pcard${late ? " late" : ""}${soon ? " soon" : ""}${r === 0 ? " done" : ""}${p.finished ? " fin" : ""}" tabindex="0" aria-expanded="false" style="--c:${colorOf(p)}">
      <h3>${esc(nameOf(p))}</h3>
      ${soon ? `<p class="soon-tag">⏰ ${esc(t().soon(left))}</p>` : ""}
      ${rest}
      ${watchHTML(p)}
      <div class="more-info"><div class="mi-inner">
        <div class="top-line"><span class="who">${esc(presenterOf(p))}</span><span>${tags}</span></div>
        ${sub ? `<div class="sub">${sub}</div>` : ""}
        ${detail}
      </div></div></article>`;
  }
  // three days or less to delivery: the card pulses red until it is finished or delivered
  function isSoon(p){ const left = daysTo(dueOf(p)); return !p.finished && remaining(p) > 0 && left >= 1 && left <= 3; }
  function renderPrograms(){
    // nearest delivery date first; completed programs after those still in work, finished ones last
    const group = p => p.finished ? 2 : remaining(p) === 0 ? 1 : 0;
    const all = programs.slice().sort((a, b) => (group(a) - group(b)) || dueOf(a).localeCompare(dueOf(b)) || (a.order || 0) - (b.order || 0));
    const list = filter ? all.filter(p => p.presenter === filter) : all;
    const ps = [...new Set(all.map(p => p.presenter))];
    $("programs-count").textContent = t().programsCount(active().length, programs.length - active().length);
    $("filters").innerHTML = [`<button type="button" data-f="" aria-pressed="${!filter}">${esc(t().all)}</button>`]
      .concat(ps.map(x => { const p = all.find(y => y.presenter === x); return `<button type="button" data-f="${esc(x)}" aria-pressed="${filter === x}" style="--c:${colorOf(p)}"><i></i>${esc(presenterOf(p))}</button>`; })).join("");
    const shown = showAll || filter ? list : list.slice(0, 6);
    $("pgrid").innerHTML = shown.map(cardHTML).join("");
    const btn = $("more-btn");
    btn.hidden = !!filter || list.length <= 6;
    btn.textContent = showAll ? t().showLess : t().showAll(list.length);
  }

  // ---------- studio week (tile and team screen) ----------
  function weekStart(off){ const d = todayMid(); d.setDate(d.getDate() - (d.getDay() + 6) % 7 + off * 7); return d; }
  const range = (s, dur) => t().range(s, s + dur);
  function weekHTML(off){
    const mon = weekStart(off);
    return RULES.BOOK_DAYS.map(wd => {
      const iso = isoOf(new Date(mon.getTime() + (wd + 6) % 7 * DAY)), list = bookingsOn(bookings, iso), full = list.length >= RULES.MAX_PER_DAY;
      let rows = "";
      for (let h = RULES.DAY_START; h < RULES.DAY_END;){
        const b = hourTaken(bookings, iso, h);
        if (b){
          rows += busySlot(b);
          h = Math.max(h + 1, b.start + b.dur);
        } else {
          rows += `<div class="slot ${full ? "closed" : "free"}${slotPast(iso, h) ? " past" : ""}"><span>${esc(range(h, 1))}</span><span>${esc(full ? t().closed : t().free)}</span></div>`;
          h++;
        }
      }
      return `<div class="day"><h3><span>${esc(fmtDate(iso, {weekday: "long", day: "numeric", month: "long"}))}</span><span class="cap${full ? " full" : ""}">${esc(t().cap(list.length, RULES.MAX_PER_DAY))}</span></h3><div class="slots-list">${rows}</div></div>`;
    }).join("");
  }
  const busySlot = b => `<button type="button" class="slot busy${slotPast(b.date, b.start + b.dur - 1) ? " past" : ""}" data-bid="${esc(b.id)}"><span>${esc(range(b.start, b.dur))}</span><span><b>${esc(t().booked)}</b>${b.program ? " · " + esc(progName(b.program)) : ""}</span><span class="more">${esc(t().details)}</span></button>`;

  // team screen: a week (every hour), a whole month (each booking day: its bookings and what is still open), or every upcoming booking
  let scrView = "week", scrOff = 0;
  function dayCard(iso, showOpen){
    const list = bookingsOn(bookings, iso), past = slotPast(iso, RULES.DAY_END - 1), isToday = iso === isoOf(todayMid());
    const free = showOpen && !past && dayOpen(iso) ? `<div class="slot free"><span>${esc(t().free)}</span><span>${esc(t().left(RULES.MAX_PER_DAY - list.length))}</span></div>` : "";
    return `<div class="tile day mday${past ? " past" : ""}${isToday ? " today" : ""}"><h3><span>${esc(fmtDate(iso, {weekday: "long", day: "numeric", month: "long"}))}${isToday ? ` <em>${esc(t().todayTag)}</em>` : ""}</span><span class="cap${list.length >= RULES.MAX_PER_DAY ? " full" : ""}">${esc(t().cap(list.length, RULES.MAX_PER_DAY))}</span></h3><div class="slots-list">${list.map(busySlot).join("")}${free}</div></div>`;
  }
  function renderScreen(){
    document.querySelectorAll("[data-sv]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.sv === scrView)));
    document.querySelector('[data-sn="-1"]').textContent = lang === "ar" ? "›" : "‹";
    document.querySelector('[data-sn="1"]').textContent = lang === "ar" ? "‹" : "›";
    $("sb-nav").hidden = scrView === "up";
    let html = "", n = 0;
    if (scrView === "week"){
      const mon = weekStart(scrOff), sun = new Date(mon.getTime() + 6 * DAY), short = d => d.toLocaleDateString(locale(), {day: "numeric", month: "short"});
      $("sb-label").textContent = `${short(mon)} – ${short(sun)}`;
      html = weekHTML(scrOff);
      n = RULES.BOOK_DAYS.reduce((s, wd) => s + bookingsOn(bookings, isoOf(new Date(mon.getTime() + (wd + 6) % 7 * DAY))).length, 0);
    } else if (scrView === "month"){
      const k = mKey(todayMid()) + scrOff, days = [];
      for (let d = mStart(k); d <= mEnd(k); d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) if (RULES.BOOK_DAYS.includes(d.getDay())) days.push(isoOf(d));
      $("sb-label").textContent = mName(k, true);
      n = days.reduce((s, iso) => s + bookingsOn(bookings, iso).length, 0);
      html = days.map(iso => dayCard(iso, true)).join("") + (n ? "" : `<p class="wk-none">${esc(t().noMonth)}</p>`);
    } else {
      const list = bookings.filter(b => !slotPast(b.date, b.start + b.dur - 1));
      n = list.length;
      html = n ? [...new Set(list.map(b => b.date))].sort().map(iso => dayCard(iso, false)).join("") : `<p class="wk-none">${esc(t().noUp)}</p>`;
    }
    $("sb-count").textContent = t().sbCount(n);
    $("screen-days").className = "days sv-" + scrView;
    $("screen-days").innerHTML = html;
  }

  // The tile lists only the week's bookings, with what is still open in one line
  function compactWeekHTML(off){
    const mon = weekStart(off), days = RULES.BOOK_DAYS.map(wd => isoOf(new Date(mon.getTime() + (wd + 6) % 7 * DAY)));
    const list = bookings.filter(b => days.includes(b.date)).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
    const max = RULES.MAX_PER_DAY * days.length;
    $("week-count").textContent = t().weekCount(list.length, max);
    let h = list.length ? `<div class="wk-list">` + list.map(b => `<button type="button" class="wk-item${slotPast(b.date, b.start + b.dur - 1) ? " past" : ""}" data-bid="${esc(b.id)}"><span class="cal-badge"><small>${esc(fmtDate(b.date, {weekday: "long"}))}</small><b>${esc(fmtDate(b.date, {day: "numeric"}))}</b><small>${esc(fmtDate(b.date, {month: "short"}))}</small></span><span class="w"><b>${esc(range(b.start, b.dur))}</b><small>${esc(b.program ? progName(b.program) : t().booked)}</small><span class="more">${esc(t().details)}</span></span></button>`).join("") + `</div>`
      : `<p class="wk-none">${esc(t().noBookings)}</p>`;
    const open = days.filter(iso => !slotPast(iso, RULES.DAY_END - 1)).map(iso => [iso, RULES.DURATIONS.some(d => startsFor(bookings, iso, d).length) ? RULES.MAX_PER_DAY - bookingsOn(bookings, iso).length : 0]).filter(x => x[1] > 0);
    h += `<p class="wk-open">${esc(open.length ? t().avail(open.map(([iso, n]) => `${fmtDate(iso, {weekday: "long"})} (${n})`).join(" · ")) : t().noneLeft)}</p>`;
    return h;
  }
  function renderWeek(){
    const mon = weekStart(weekOffset), sun = new Date(mon.getTime() + 6 * DAY);
    const short = d => d.toLocaleDateString(locale(), {day: "numeric", month: "short"});
    $("week-label").textContent = `${short(mon)} – ${short(sun)}`;
    document.querySelector('[data-week="-1"]').textContent = lang === "ar" ? "›" : "‹";
    document.querySelector('[data-week="1"]').textContent = lang === "ar" ? "‹" : "›";
    $("week-days").innerHTML = compactWeekHTML(weekOffset);
    renderScreen();
  }

  // ---------- production ----------
  // monthly chart: a summary line, bars with the month's count, and the selected month's split by program
  let barSel = 0;
  function renderBars(){
    const pl = plan();
    if (!pl.items.length){ $("bars").innerHTML = $("bars-sum").innerHTML = $("bars-split").innerHTML = ""; return; }
    if (barSel >= pl.months.length) barSel = 0;
    const max = Math.max(...pl.months.map((k, i) => pl.sum(i)), 1);
    const today = todayMid(), daysLeft = Math.round((mEnd(pl.months[0]) - today) / DAY) + 1;
    const total = pl.items.reduce((s, x) => s + x.r, 0), now = pl.sum(0);
    $("bars-sum").innerHTML = `<span class="hl"><b>${esc(t().thisMonth)}: ${now} ${esc(t().epUnit)}</b> · ${esc(t().perWeek(Math.ceil(now / Math.max(daysLeft / 7, 1))))}</span><span>${esc(t().leftAll(total, mName(pl.months[pl.months.length - 1])))}</span>`;
    $("bars").innerHTML = pl.months.map((k, i) => { const v = pl.sum(i); return `<button type="button" class="col${i === 0 ? " now" : i > 2 ? " later" : ""}" data-bar="${i}" aria-pressed="${i === barSel}" style="--v:${(v / max).toFixed(3)}"><b>${v}</b><i style="height:${Math.round(v / max * 160)}px"></i><span>${esc(i === 0 ? t().thisMonth : mName(k))}</span></button>`; }).join("");
    const rows = pl.items.filter(x => x.alloc[barSel] > 0).sort((a, b) => b.alloc[barSel] - a.alloc[barSel]);
    $("bars-split").innerHTML = `<p class="split-title">${esc(t().monthOf(mName(pl.months[barSel])))} · ${pl.sum(barSel)} ${esc(t().epUnit)}</p><div class="split-list">` + rows.map(x => `<span style="--c:${colorOf(x.p)}"><i></i>${esc(nameOf(x.p))}<b>${x.alloc[barSel]}</b></span>`).join("") + `</div>`;
  }
  document.addEventListener("click", e => { const b = e.target.closest("[data-bar]"); if (b){ barSel = Number(b.dataset.bar); renderBars(); } });
  function renderGantt(){
    const pl = plan(), today = todayMid();
    if (!pl.items.length){ $("gantt").innerHTML = $("legend").innerHTML = ""; return; }
    const end = mEnd(pl.months[pl.months.length - 1]).getTime() + DAY, span = end - today.getTime();
    const pct = d => Math.min(Math.max((d - today) / span * 100, 0), 100);
    $("legend").innerHTML = presenters().map(x => { const p = active().find(y => y.presenter === x); return `<span style="--c:${colorOf(p)}"><i></i>${esc(presenterOf(p))}</span>`; }).join("");
    let html = `<div class="grow gaxis"><span class="glabel"></span><div class="gtrack">` + pl.months.map((k, i) => {
      const a = i === 0 ? today : mStart(k), b = new Date(mEnd(k).getTime() + DAY);
      return `<span class="gmonth" style="inset-inline-start:${(pct(a) + pct(b)) / 2 - 3}%">${esc(mName(k))}</span>`;
    }).join("") + `</div></div>`;
    html += pl.items.slice().sort((a, b) => a.last - b.last).map(x => {
      const w = x.late ? 3 : Math.max(pct(new Date(x.last.getTime() + DAY)), 3);
      const label = esc(t().eps(x.r, x.p.total, fmtDate(dueOf(x.p), {day: "numeric", month: "short"})));
      const inside = w > 62;   // a long bar carries its label; a short one has it beside the bar
      return `<div class="grow"><span class="glabel">${esc(nameOf(x.p))}</span><span class="gmeta">${label}</span><div class="gtrack"><span class="gbar${inside ? " in" : ""}" style="--c:${x.late ? "var(--warn)" : colorOf(x.p)};width:${w}%">${inside ? label : ""}</span>${inside ? "" : `<span class="gout" style="inset-inline-start:${w}%">${label}</span>`}</div></div>`;
    }).join("");
    $("gantt").innerHTML = html;
  }

  // ---------- views per platform (entered monthly in the admin) ----------
  let views = null, vSel = null;
  const ym = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const ymShift = (k, n) => { const [y, m] = k.split("-").map(Number); return ym(new Date(y, m - 1 + n, 1)); };
  const ymName = (k, long) => { const [y, m] = k.split("-").map(Number); return new Date(y, m - 1, 1).toLocaleDateString(lang === "ar" ? "ar-u-nu-latn" : "en-GB", long ? {month: "long", year: "numeric"} : {month: "long"}); };
  const fmtN = n => Number(n).toLocaleString("en-US");
  function renderViews(){
    const sec = $("views"), nav = document.querySelector('[data-jump="views"]');
    const data = (views && views.data) || {}, months = Object.keys(data).sort();
    sec.hidden = nav.hidden = !months.length;
    if (!months.length) return;
    const now = ym(new Date()), first = months[0], last = months[months.length - 1] > now ? months[months.length - 1] : now;
    if (!vSel || vSel < first || vSel > last) vSel = data[now] ? now : months[months.length - 1];
    const plats = views.platforms || [];
    const sumOf = k => plats.reduce((t, p) => t + ((data[k] || {})[p.id] || 0), 0);
    const pct = (a, b) => b ? Math.round((a - b) / b * 100) : null;
    const chip = c => c == null ? "" : `<span class="${c >= 0 ? "up" : "down"}" dir="ltr">${c >= 0 ? "+" : ""}${c}%</span>`;
    const cur = data[vSel] || {}, prev = data[ymShift(vSel, -1)] || null, total = sumOf(vSel);
    $("v-month").textContent = ymName(vSel, true);
    document.querySelector('[data-vm="-1"]').textContent = lang === "ar" ? "›" : "‹";
    document.querySelector('[data-vm="1"]').textContent = lang === "ar" ? "‹" : "›";
    document.querySelector('[data-vm="-1"]').disabled = vSel <= first;
    document.querySelector('[data-vm="1"]').disabled = vSel >= last;
    $("v-total-label").textContent = t().viewsTotal(ymName(vSel, true));
    $("v-total").textContent = data[vSel] ? fmtN(total) : "—";
    const c = prev && data[vSel] ? pct(total, sumOf(ymShift(vSel, -1))) : null;
    $("v-change").innerHTML = c == null ? "" : `<span class="${c >= 0 ? "up" : "down"}">${c >= 0 ? "▲" : "▼"} <span dir="ltr">${c >= 0 ? "+" : ""}${c}%</span> ${esc(t().vsPrev)}</span>`;
    // the last three months, each column its own brand colour, the shown month in gold
    const three = [2, 1, 0].map(i => ymShift(vSel, -i)), fmax = Math.max(...three.map(sumOf), 1), cols = ["#66BDB1", "#3AB4CF", "#F2C56E"];
    $("v-spark").innerHTML = three.map((k, i) => { const v = sumOf(k); return `<div class="sc${k === vSel ? " sel" : ""}" style="--sc:${cols[i]}"><b>${v ? fmtN(v) : "—"}</b><i style="height:${Math.max(v / fmax * 100, 3)}%"></i><span>${esc(ymName(k))}</span></div>`; }).join("");
    if (!data[vSel]){ $("v-rows").innerHTML = `<p class="muted">${esc(t().noViews)}</p>`; return; }
    const max = Math.max(...plats.map(p => cur[p.id] || 0), 1);
    $("v-rows").innerHTML = plats.slice().sort((a, b) => (cur[b.id] || 0) - (cur[a.id] || 0)).map(p => {
      const v = cur[p.id];
      const name = p.url ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.name)}</a>` : esc(p.name);
      return `<div class="vrow" style="--pc:${platformColor(p)}">${platformIcon(p)}<span class="name">${name}</span><span class="track"><i style="width:${v ? Math.max(v / max * 100, 2) : 0}%"></i></span><b>${v == null ? "—" : fmtN(v)}</b>${prev && v != null ? chip(pct(v, prev[p.id])) : "<span></span>"}</div>`;
    }).join("");
  }
  document.addEventListener("click", e => { const b = e.target.closest("[data-vm]"); if (b && vSel){ vSel = ymShift(vSel, Number(b.dataset.vm)); renderViews(); } });

  function renderAll(){ applyText(); renderViews(); renderStats(); renderPrograms(); renderWeek(); renderBars(); renderGantt(); renderBook(); renderCancel(); }

  // ---------- phone country codes: the UAE first, then the Gulf and Arab states, then every other country ----------
  const DIAL = "AE971 SA966 KW965 QA974 BH973 OM968 EG20 JO962 LB961 SY963 IQ964 YE967 PS970 SD249 MA212 DZ213 TN216 LY218 MR222 SO252 DJ253 KM269 AF93 AL355 AD376 AO244 AG1268 AR54 AM374 AU61 AT43 AZ994 BS1242 BD880 BB1246 BY375 BE32 BZ501 BJ229 BT975 BO591 BA387 BW267 BR55 BN673 BG359 BF226 BI257 KH855 CM237 CA1 CV238 CF236 TD235 CL56 CN86 CO57 CG242 CD243 CR506 CI225 HR385 CU53 CY357 CZ420 DK45 DM1767 DO1809 EC593 SV503 GQ240 ER291 EE372 SZ268 ET251 FJ679 FI358 FR33 GA241 GM220 GE995 DE49 GH233 GR30 GD1473 GT502 GN224 GW245 GY592 HT509 HN504 HK852 HU36 IS354 IN91 ID62 IR98 IE353 IT39 JM1876 JP81 KZ7 KE254 KI686 KG996 LA856 LV371 LS266 LR231 LI423 LT370 LU352 MO853 MG261 MW265 MY60 MV960 ML223 MT356 MU230 MX52 MD373 MC377 MN976 ME382 MZ258 MM95 NA264 NP977 NL31 NZ64 NI505 NE227 NG234 MK389 NO47 PK92 PA507 PG675 PY595 PE51 PH63 PL48 PT351 PR1787 RO40 RU7 RW250 KN1869 LC1758 VC1784 WS685 SM378 ST239 SN221 RS381 SC248 SL232 SG65 SK421 SI386 SB677 ZA27 KR82 SS211 ES34 LK94 SR597 SE46 CH41 TW886 TJ992 TZ255 TH66 TL670 TG228 TO676 TT1868 TR90 TM993 UG256 UA380 GB44 US1 UY598 UZ998 VU678 VE58 VN84 ZM260 ZW263 XK383".split(" ").map(x => [x.slice(0, 2), x.slice(2)]);
  const FIRST = 22;   // the UAE, the Gulf and the Arab League keep their place at the top
  function countryOptions(){
    let names = null;
    try { names = new Intl.DisplayNames([lang === "ar" ? "ar" : "en"], {type: "region"}); } catch (e) {}
    const nm = c => (names && names.of(c)) || c;
    const top = DIAL.slice(0, FIRST), rest = DIAL.slice(FIRST).sort((a, b) => nm(a[0]).localeCompare(nm(b[0]), lang));
    const opt = ([c, d]) => `<option value="${d}"${c === "AE" ? " selected" : ""}>${esc(nm(c))} +${d}</option>`;
    return top.map(opt).join("") + `<option disabled>──────</option>` + rest.map(opt).join("");
  }

  // ---------- booking ----------
  const bk = {month: null, date: null, dur: 1, start: null, step: "pick", msg: "", kind: "", sending: false, email: ""};
  const dayOpen = iso => RULES.DURATIONS.some(d => startsFor(bookings, iso, d).length);
  const whenLabel = (iso, s, dur) => `${fmtDate(iso, {weekday: "long", day: "numeric", month: "long"})} · ${range(s, dur)}`;
  function calHTML(){
    const k = bk.month, first = mStart(k), n = mEnd(k).getDate(), lead = (first.getDay() + 6) % 7, ref = new Date(2026, 0, 5);
    const maxK = mKey(new Date(todayMid().getTime() + RULES.AHEAD_DAYS * DAY));
    let h = `<div class="cal"><div class="cal-nav"><button type="button" data-act="prev" aria-label="${esc(t().prevM)}"${k <= mKey(todayMid()) ? " disabled" : ""}>${lang === "ar" ? "›" : "‹"}</button><b>${esc(mName(k, true))}</b><button type="button" data-act="next" aria-label="${esc(t().nextM)}"${k >= maxK ? " disabled" : ""}>${lang === "ar" ? "‹" : "›"}</button></div><div class="cal-grid">`;
    for (let i = 0; i < 7; i++) h += `<span class="wd">${esc(new Date(ref.getTime() + i * DAY).toLocaleDateString(locale(), {weekday: "short"}))}</span>`;
    for (let i = 0; i < lead; i++) h += `<span></span>`;
    for (let d = 1; d <= n; d++){
      const date = new Date(first.getFullYear(), first.getMonth(), d), iso = isoOf(date);
      h += bookableDay(date) && dayOpen(iso)
        ? `<button type="button" class="d" data-act="day" data-date="${iso}" aria-pressed="${bk.date === iso}">${d}<small>${esc(t().left(RULES.MAX_PER_DAY - bookingsOn(bookings, iso).length))}</small></button>`
        : `<span class="d">${d}</span>`;
    }
    return h + `</div></div>`;
  }
  function renderBook(){
    const body = $("book-body");
    if (!$("book").open) return;
    let h = `<p class="msg">${esc(t().bookNote)}</p>` + (bk.msg && bk.msg !== "catBad" ? `<p class="msg ${bk.kind}">${esc(t()[bk.msg])}</p>` : "");
    if (bk.step === "pick"){
      h += `<h3>${esc(t().pickDay)}</h3>${calHTML()}`;
      if (bk.date){
        h += `<h3>${esc(t().pickDur)}</h3><div class="seg">${RULES.DURATIONS.map(d => `<button type="button" data-act="dur" data-dur="${d}" aria-pressed="${bk.dur === d}"${startsFor(bookings, bk.date, d).length ? "" : " disabled"}>${esc(t().dur(d))}</button>`).join("")}</div>`;
        const starts = startsFor(bookings, bk.date, bk.dur);
        h += `<h3>${esc(t().pickTime)}</h3>` + (starts.length ? `<div class="times">${starts.map(x => `<button type="button" data-act="start" data-start="${x}">${esc(range(x, bk.dur))}</button>`).join("")}</div>` : `<p class="msg">${esc(bookingsOn(bookings, bk.date).length >= RULES.MAX_PER_DAY ? t().dayFull : t().noTimes)}</p>`);
      }
    } else if (bk.step === "form"){
      const langs = `<option value="" disabled selected>${esc(t().pickLang)}</option>` + langOptions(lang).map(([c, n]) => `<option value="${c}">${esc(n)}</option>`).join("");
      h += `<p class="when">${esc(whenLabel(bk.date, bk.start, bk.dur))}</p>
        <form class="form" id="book-form">
          <label>${esc(t().fName)}<input name="name" required maxlength="80" autocomplete="name"></label>
          <label>${esc(t().fEmail)}<input name="email" type="email" required maxlength="120" autocomplete="email" dir="ltr"></label>
          <div class="phone-row"><label>${esc(t().fPhone)}<input name="phone" type="tel" required inputmode="tel" maxlength="20" autocomplete="tel-national" dir="ltr" placeholder="50 123 4567"></label><label>${esc(t().fCountry)}<select name="dial" autocomplete="tel-country-code">${countryOptions()}</select></label></div>
          <label>${esc(t().fTitle)}<input name="title" required maxlength="120" placeholder="${esc(t().titleHint)}"></label>
          <label>${esc(t().fLang)}<select name="blang" required>${langs}</select></label>
          <fieldset class="pick cats"><legend>${esc(t().fCat)} <small>${esc(t().catHint)}</small></legend>${CATEGORIES.map(c => `<label class="cat-${c}"><input type="checkbox" name="cat" value="${c}"><span>${esc(t().cats[c])}</span></label>`).join("")}${bk.msg === "catBad" ? `<p class="msg warn">${esc(t().catBad)}</p>` : ""}</fieldset>
          <label>${esc(t().fContent)}<textarea name="content" required maxlength="4000" rows="5" placeholder="${esc(t().contentHint)}"></textarea></label>
          <label>${esc(t().fNotes)} ${esc(t().optional)}<textarea name="notes" maxlength="500"></textarea></label>
          <div class="actions"><button type="button" class="btn" data-act="back">${esc(t().back)}</button><button type="submit" class="btn primary"${bk.sending ? " disabled" : ""}>${esc(bk.sending ? t().sending : t().confirm)}</button></div>
        </form>`;
    } else {
      const c = bk.contact || {};
      const mapHref = /^https:\/\//.test(c.map || "") ? c.map : "";
      h += `<p class="msg ok"><b>${esc(t().doneTitle)}</b><br>${esc(t().doneBody(whenLabel(bk.date, bk.start, bk.dur), bk.email))}</p>`
        + (bk.wa ? `<p class="wa-note">${esc(t().waNote)}</p>` : "")
        + `<div class="actions">${mapHref ? `<a class="btn" href="${esc(mapHref)}" target="_blank" rel="noopener">${esc(t().mapBtn)}</a>` : ""}<button type="button" class="btn primary" data-act="again">${esc(t().again)}</button></div>`;
    }
    const keep = {};
    body.querySelectorAll("#book-form [name]").forEach(el => { if (el.type === "checkbox"){ if (el.checked) keep[el.name + ":" + el.value] = true; } else keep[el.name] = el.value; });
    body.innerHTML = h;
    body.querySelectorAll("#book-form [name]").forEach(el => { if (el.type === "checkbox") el.checked = !!keep[el.name + ":" + el.value]; else if (keep[el.name] != null) el.value = keep[el.name]; });
  }
  async function submitBooking(form){
    if (bk.sending) return;
    const local = form.phone.value.replace(/[^\d]/g, "").replace(/^0+/, "");
    if (local.length < 6 || local.length > 14){ bk.msg = "phoneBad"; bk.kind = "warn"; renderBook(); return; }
    const cats = [...form.querySelectorAll("[name=cat]:checked")].map(el => el.value);
    if (!cats.length){ bk.msg = "catBad"; bk.kind = "warn"; renderBook(); $("book-body").querySelector(".pick.cats").scrollIntoView({block: "center"}); return; }
    bk.sending = true; bk.msg = ""; renderBook();
    const data = {name: form.name.value.trim(), email: form.email.value.trim(), phone: `+${form.dial.value} ${local}`, title: form.title.value.trim(), blang: form.blang.value, blangAr: langName(form.blang.value, "ar"), blangEn: langName(form.blang.value, "en"), cat: cats.join(","), content: form.content.value.trim(), notes: form.notes.value.trim(), date: bk.date, start: bk.start, dur: bk.dur, lang};
    const r = await call("book", data);
    bk.sending = false;
    if (r.ok){ bk.step = "done"; bk.email = data.email; bk.name = data.name; bk.program = data.title; bk.id = r.id; bk.contact = r.contact || null; bk.wa = !!r.wa; bk.msg = ""; }
    else {
      bk.kind = "warn";
      bk.msg = {taken: "taken", dayFull: "dayFull", invalid: "invalid", offline: "offline", soon: "soon"}[r.error] || "err";
      if (r.error === "taken" || r.error === "dayFull" || r.error === "soon"){ bk.step = "pick"; bk.start = null; }
    }
    await refresh();
    renderAll();
  }

  // ---------- booking details (team) ----------
  async function showDetail(id){
    const dlg = $("detail"), body = $("detail-body"), b = bookings.find(x => x.id === id);
    if (!b) return;
    const head = `<p class="when">${esc(whenLabel(b.date, b.start, b.dur))}</p>`;
    if (!dlg.open) dlg.showModal();
    if (!session.can(user, "team")){
      body.innerHTML = head + `<p class="msg">${esc(t().teamOnly)}</p><form class="form" id="team-login" data-id="${esc(id)}"><label>${esc(t().email)}<input name="email" type="email" required autocomplete="username" dir="ltr"></label><label>${esc(t().password)}<input name="password" type="password" required autocomplete="current-password"></label><p class="msg err" id="team-err" hidden>${esc(t().wrongLogin)}</p><div class="actions"><button type="submit" class="btn primary">${esc(t().login)}</button></div></form>`;
      return;
    }
    body.innerHTML = head + `<p class="msg">${esc(t().loading)}</p>`;
    if (!details || !details.find(x => x.id === id)){
      const r = await session.authed("details");
      if (!r.ok){ if (r.error === "auth"){ await session.logout(); user = null; return showDetail(id); } body.innerHTML = head + `<p class="msg err">${esc(t().offline)}</p>`; return; }
      details = r.bookings;
    }
    const d = details.find(x => x.id === id) || {};
    const row = (k, v, ltr) => v ? `<div><dt>${esc(t()[k])}</dt><dd${ltr ? ' dir="ltr"' : ""}>${esc(v)}</dd></div>` : "";
    body.innerHTML = head + `<dl class="kv">${row("fName", d.name)}${row("fPhone", d.phone, true)}${row("fEmail", d.email, true)}${row("fTitle", d.program && progName(d.program))}${row("fLang", d.blang && langName(d.blang, lang))}${row("fCat", catList(d.cat).map(c => t().cats[c]).join("، "))}${row("fContent", d.content)}${row("fNotes", d.notes)}</dl><div class="actions"><button type="button" class="btn small" data-logout>${esc(t().logout)}</button></div>`;
  }

  // ---------- the guest's cancel link (?cancel=<id>&k=<key> from the confirmation email) ----------
  let cx = null;
  function renderCancel(){
    if (!cx) return;
    const body = $("detail-body");
    $("detail-title").textContent = t().cxTitle;
    const head = cx.booking ? `<p class="when">${esc(whenLabel(cx.booking.date, cx.booking.start, cx.booking.dur))}</p>${cx.booking.program ? `<p class="hint">${esc(cx.booking.program)}</p>` : ""}` : "";
    if (cx.state === "loading") body.innerHTML = `<p class="msg">${esc(t().loading)}</p>`;
    else if (cx.state === "ask"){
      const keep = cx.text != null ? cx.text : "";
      body.innerHTML = head + `<p class="msg warn">${esc(t().cxAsk)}</p>`
        + `<form class="form" id="cx-form" onsubmit="return false"><fieldset class="pick col"><legend>${esc(t().cxWhy)}</legend>${CANCEL_REASONS.map(r => `<label><input type="radio" name="reason" value="${r}"${cx.reason === r ? " checked" : ""}><span>${esc(t().reasons[r])}</span></label>`).join("")}</fieldset>`
        + `<label class="cx-other"${cx.reason === "other" ? "" : " hidden"}><textarea name="reasonText" maxlength="300" rows="3" placeholder="${esc(t().cxOtherHint)}"></textarea></label></form>`
        + (cx.warn ? `<p class="msg err">${esc(t()[cx.warn])}</p>` : "")
        + `<div class="actions"><button type="button" class="btn" data-cx="keep">${esc(t().cxNo)}</button><button type="button" class="btn primary danger" data-cx="yes"${cx.busy ? " disabled" : ""}>${esc(cx.busy ? t().cxSending : t().cxYes)}</button></div>`;
      const ta = body.querySelector("[name=reasonText]"); if (ta) ta.value = keep;
    }
    else if (cx.state === "done") body.innerHTML = head + `<p class="msg ok">${esc(t().cxDone)}</p>`;
    else body.innerHTML = `<p class="msg err">${esc(t()[cx.state] || t().offline)}</p>`;
  }
  async function startCancel(id, k){
    cx = {id, k, state: "loading"};
    $("detail").showModal(); renderCancel();
    const r = await call("guestCancel", {id, k});
    cx.state = r.ok ? "ask" : (r.error === "past" ? "cxPast" : r.error === "missing" ? "cxMissing" : "offline");
    cx.booking = r.booking; renderCancel();
  }
  function readReason(){
    const f = $("cx-form"); if (!f) return;
    const r = f.querySelector("[name=reason]:checked"); cx.reason = r ? r.value : null;
    cx.text = f.reasonText.value;
  }
  async function confirmCancel(){
    readReason();
    if (!cx.reason){ cx.warn = "cxNeedReason"; renderCancel(); return; }
    if (cx.reason === "other" && !cx.text.trim()){ cx.warn = "cxNeedText"; renderCancel(); body_focus(); return; }
    cx.warn = ""; cx.busy = true; renderCancel();
    const r = await call("guestCancel", {id: cx.id, k: cx.k, confirm: true, reason: cx.reason, reasonText: cx.reason === "other" ? cx.text.trim() : ""});
    cx.busy = false;
    if (!r.ok && r.error === "reason"){ cx.warn = "cxNeedReason"; renderCancel(); return; }
    cx.state = r.ok ? "done" : (r.error === "past" ? "cxPast" : r.error === "missing" ? "cxMissing" : "offline");
    renderCancel();
    if (r.ok) refresh().then(renderAll);
  }
  const body_focus = () => { const ta = document.querySelector("#cx-form [name=reasonText]"); if (ta) ta.focus(); };
  document.addEventListener("change", e => {
    if (e.target.name === "cat" && bk.msg === "catBad"){ bk.msg = ""; const w = document.querySelector(".pick.cats .msg"); if (w) w.remove(); }
    if (!cx || e.target.name !== "reason") return;
    readReason(); cx.warn = ""; renderCancel();
    if (cx.reason === "other") body_focus();
  });
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-cx]");
    if (!b) return;
    if (b.dataset.cx === "yes") confirmCancel(); else $("detail").close();
  });
  $("player").addEventListener("close", () => { $("pl-body").innerHTML = ""; player = null; });   // stops the video
  $("detail").addEventListener("close", () => { if (cx){ cx = null; $("detail-title").textContent = t().detailTitle; } });

  // ---------- data ----------
  async function refresh(){
    const r = await call("state");
    if (r.ok){ loaded = true; programs = r.programs || []; bookings = r.bookings || []; views = r.views || null; store.set("ics-cache", JSON.stringify({programs, bookings, views})); details = null; }
  }

  // ---------- events ----------
  function setScreen(on){
    document.body.classList.toggle("screen", on);
    if (on){ tick(); try { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen().catch(() => {}); } catch (e) {} }
    else if (document.fullscreenElement){ document.exitFullscreen().catch(() => {}); }
  }
  function tick(){ $("clock").textContent = new Date().toLocaleTimeString(locale(), {hour: "numeric", minute: "2-digit"}); }

  document.addEventListener("click", e => {
    const close = e.target.closest("[data-close]"); if (close){ close.closest("dialog").close(); return; }
    if (e.target.tagName === "DIALOG"){ e.target.close(); return; }
    const jump = e.target.closest("[data-jump]");
    if (jump){ document.querySelectorAll("[data-jump]").forEach(b => b.setAttribute("aria-pressed", String(b === jump))); $(jump.dataset.jump).scrollIntoView({behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start"}); return; }
    const f = e.target.closest("[data-f]"); if (f){ filter = f.dataset.f; renderPrograms(); return; }
    if (e.target.closest(".pcard a.watch")) return;
    const play = e.target.closest("[data-play]"); if (play){ openPlayer(play.dataset.play); return; }
    const epb = e.target.closest("#player [data-ep]"); if (epb){ if (!epb.disabled && player){ player.ep = Number(epb.dataset.ep); renderPlayer(); } return; }   // the view link opens in a new tab; the card stays as it is
    const card = e.target.closest(".pcard"); if (card){ const open = !card.classList.contains("open"); document.querySelectorAll(".pcard.open").forEach(c => { c.classList.remove("open"); c.setAttribute("aria-expanded", "false"); }); card.classList.toggle("open", open); card.setAttribute("aria-expanded", String(open)); return; }
    const sv = e.target.closest("[data-sv]"); if (sv){ scrView = sv.dataset.sv; scrOff = 0; renderScreen(); return; }
    const sn = e.target.closest("[data-sn]"); if (sn){ scrOff = Number(sn.dataset.sn) && scrOff + Number(sn.dataset.sn); renderScreen(); return; }
    const wk = e.target.closest("[data-week]"); if (wk){ weekOffset += Number(wk.dataset.week); renderWeek(); return; }
    const busy = e.target.closest("[data-bid]"); if (busy){ showDetail(busy.dataset.bid); return; }
    if (e.target.closest("[data-logout]")){ session.logout(); user = null; details = null; $("detail").close(); return; }
    const a = e.target.closest("#book-body [data-act]");
    if (a && !a.disabled){
      const act = a.dataset.act;
      if (act === "prev") bk.month--;
      else if (act === "next") bk.month++;
      else if (act === "day"){ bk.date = a.dataset.date; bk.msg = ""; if (!startsFor(bookings, bk.date, bk.dur).length) bk.dur = RULES.DURATIONS.find(d => startsFor(bookings, bk.date, d).length) || 1; }
      else if (act === "dur") bk.dur = Number(a.dataset.dur);
      else if (act === "start"){ bk.start = Number(a.dataset.start); bk.step = "form"; bk.msg = ""; }
      else if (act === "back"){ bk.step = "pick"; bk.msg = ""; }
      else if (act === "again"){ bk.step = "pick"; bk.date = null; bk.start = null; bk.msg = ""; }
      renderBook();
    }
  });
  document.addEventListener("submit", async e => {
    if (e.target.id === "book-form"){ e.preventDefault(); submitBooking(e.target); }
    if (e.target.id === "team-login"){
      e.preventDefault();
      const f = e.target, r = await session.login(f.email.value.trim(), f.password.value);
      if (r.ok){ user = r.user; showDetail(f.dataset.id); } else { $("team-err").hidden = false; }
    }
  });
  const openBook = () => { if (bk.month == null) bk.month = mKey(todayMid()); bk.msg = ""; $("book").showModal(); renderBook(); };
  $("book-open").addEventListener("click", openBook);
  document.querySelector("[data-open-book]").addEventListener("click", openBook);
  $("more-btn").addEventListener("click", () => { showAll = !showAll; renderPrograms(); });
  $("lang-btn").addEventListener("click", () => { lang = lang === "ar" ? "en" : "ar"; store.set("ics-lang", lang); renderAll(); });
  $("mode-btn").addEventListener("click", () => {
    const dark = document.documentElement.dataset.mode !== "dark";
    if (dark) document.documentElement.dataset.mode = "dark"; else delete document.documentElement.dataset.mode;
    store.set("ics-mode", dark ? "dark" : null);
  });
  $("screen-on").addEventListener("click", () => setScreen(true));
  $("screen-off").addEventListener("click", () => setScreen(false));

  // the header is pinned, so section jumps stop just below it
  const top = document.querySelector("header.top");
  new ResizeObserver(() => document.documentElement.style.setProperty("--top-h", top.offsetHeight + "px")).observe(top);

  // back-to-top arrow: appears once the page is scrolled down
  const toTop = $("to-top");
  const showTop = () => {
    toTop.classList.toggle("show", scrollY > 500);
    // slim phone header: on past 300px, off again only near the top, so the height change can't make it flicker
    if (scrollY > 300) document.body.classList.add("scrolled"); else if (scrollY < 60) document.body.classList.remove("scrolled");
  };
  addEventListener("scroll", showTop, {passive: true}); showTop();
  toTop.addEventListener("click", () => scrollTo({top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"}));

  // ---------- start ----------
  try { const c = JSON.parse(store.get("ics-cache") || "null"); if (c){ programs = c.programs || []; bookings = c.bookings || []; views = c.views || null; } } catch (e) {}
  renderAll();
  if (location.hash === "#screen") setScreen(true);
  const qs = new URLSearchParams(location.search);
  if (qs.get("cancel") && qs.get("k")){ history.replaceState(null, "", location.pathname + location.hash); startCancel(qs.get("cancel"), qs.get("k")); }
  refresh().then(renderAll);
  session.check().then(u => { user = u; });
  setInterval(() => { refresh().then(() => { renderAll(); }); }, 60000);
  setInterval(() => { if (document.body.classList.contains("screen")) tick(); }, 15000);
})();
