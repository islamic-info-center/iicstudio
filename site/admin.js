// IIC Studio — admin panel: sign-in, programs, bookings, views, reports, users and roles.
(function(){
  const {esc, call, session, midnight, store, langName, langOptions, platformIcon, PLATFORMS, CATEGORIES, catList} = window.ICS;
  const $ = id => document.getElementById(id);

  // ---------- text in both languages; the choice is shared with the public site ----------
  const A = {
    ar: {
      title: "لوحة الإدارة · IIC Studio", loginTitle: "دخول لوحة الإدارة", email: "البريد الإلكتروني", password: "كلمة المرور", signIn: "دخول", backSite: "العودة إلى الموقع",
      badLogin: "البريد أو كلمة المرور غير صحيحة.", tabPrograms: "البرامج", tabBookings: "حجوزات الاستوديو", tabUsers: "المستخدمون والصلاحيات", tabAccount: "حسابي",
      viewSite: "عرض الموقع", logout: "تسجيل الخروج", addProgram: "+ برنامج جديد", refresh: "تحديث", addUser: "+ إضافة مستخدم",
      programsHint: "أضف البرامج وعدّل عدد الحلقات المسجّلة والمُنتَجة وموعد الانتهاء. التغييرات تظهر في الموقع مباشرة.",
      crewHint: "حدّث عدد الحلقات المسجّلة والمُنتَجة لكل برنامج. التغييرات تظهر في الموقع مباشرة.",
      rolesTitle: "ماذا تستطيع كل صلاحية؟",
      roleGuide: [
        {role: "admin", sub: "كل الصلاحيات", can: ["كل ما يستطيعه محرر البرامج", "إضافة المستخدمين وتعديلهم وحذفهم", "تحديد صلاحية كل مستخدم وتغيير كلمة مروره"], cannot: []},
        {role: "editor", sub: "البرامج والمحتوى", can: ["إضافة البرامج وتعديلها وحذفها", "عرض حجوزات الاستوديو وإلغاؤها", "إدخال أرقام المشاهدات الشهرية", "إدخال أرقام الشهر للتقرير", "تنزيل التقارير (PNG و PDF)"], cannot: ["لا يدخل إلى المستخدمين والصلاحيات"]},
        {role: "crew", sub: "التسجيل والمونتاج", can: ["تحديث عدد الحلقات المسجّلة والمُنتَجة لكل برنامج", "عرض حجوزات الاستوديو وقراءة المحتوى"], cannot: ["لا يضيف برامج ولا يحذفها", "لا يلغي الحجوزات ولا يرى المشاهدات والتقارير"]},
        {role: "team", sub: "الاطلاع فقط", can: ["عرض حجوزات الاستوديو وقراءة المحتوى (السكريبت)"], cannot: ["لا يعدّل البرامج ولا الأرقام ولا يلغي الحجوزات"]}
      ],
      everyone: "الجميع يستطيع تغيير كلمة مروره من «حسابي».",
      usersHint: "مدير الموقع: كل شيء بما فيه المستخدمون · محرر البرامج: البرامج والحجوزات · فريق الإنتاج: يحدّث أرقام التسجيل والمونتاج فقط · فريق الاستوديو: يرى تفاصيل الحجوزات فقط.",
      thProgram: "البرنامج", thTitle: "العنوان", cats: {muslim: "مسلمين بالأصل", newMuslim: "مسلمين جدد", nonMuslim: "غير مسلمين"}, xlsBtn: "تحميل إكسل", xlsMonth: "شهر التحميل", xlsYear: y => `السنة كاملة ${y}`, xlsEmpty: "لا توجد حجوزات في هذه الفترة.", xlsDone: "تم تحميل ملف الإكسل", xlsBusy: "جارٍ التجهيز…",
      xl: {sheet: "الحجوزات", sum: "ملخص", title: p => `حجوزات استوديو IIC Studio · ${p}`, id: "رقم الحجز", date: "التاريخ", day: "اليوم", time: "الوقت", hours: "المدة (ساعات)", name: "الاسم", email: "البريد الإلكتروني", phone: "الهاتف", ttl: "العنوان", lng: "اللغة", cat: "الفئة", content: "المحتوى (السكريبت)", notes: "ملاحظات", status: "الحالة", ok: "مؤكد", cx: "ملغى", reason: "سبب الإلغاء", by: "ألغاه", byGuest: "صاحب الحجز", byStudio: "فريق الاستوديو", at: "تاريخ الإلغاء", period: "الفترة", made: "تاريخ الإصدار", nOk: "الحجوزات المؤكدة", nHours: "ساعات التصوير", nCx: "الحجوزات الملغاة", byCat: "حسب الفئة", byLang: "حسب اللغة", byReason: "أسباب الإلغاء", count: "العدد", catNote: "الحجز الذي اختار أكثر من فئة يُحسب في كل فئة اختارها.", reasons: {forgot: "النسيان", busy: "الانشغال", emergency: "ظرف طارئ", other: "أخرى", studio: "إلغاء من الاستوديو"}}, thPresenter: "المقدّم", thType: "النوع", thEpisodes: "الحلقات", thRecording: "التسجيل", thEditing: "المونتاج", thDue: "موعد الانتهاء", thStatus: "الحالة",
      thWhen: "الموعد", thContact: "التواصل", thPhone: "الهاتف", thContent: "المحتوى (السكريبت)", thNotes: "ملاحظات",
      changePw: "تغيير كلمة المرور", curPw: "كلمة المرور الحالية", newPw: "كلمة المرور الجديدة (8 أحرف على الأقل)", save: "حفظ", cancel: "إلغاء", close: "إغلاق", toTop: "العودة إلى الأعلى",
      fAr: "اسم البرنامج بالعربي", fEn: "الاسم بالإنجليزي", fPresenter: "المقدّم", fPresenterEn: "اسم المقدّم بالإنجليزي", fType: "نوع البرنامج",
      optSeries: "سلسلة (Series)", optShorts: "مقاطع قصيرة (Shorts)", optCourse: "دورة / مستوى", optSingle: "حلقة واحدة", none: "بدون",
      fLang: "اللغة", fTotal: "عدد الحلقات", fRecorded: "الحلقات المسجّلة", fDone: "الحلقات المُنتَجة (مونتاج وإخراج)", fOrder: "الترتيب في الصفحة",
      fNote: "ملاحظة تظهر كوسم (مثل: أكاديمية المسلم الجديد)", fLink: "رابط العرض (فيديوهات البرنامج أو مجلد العمل عليه)", openLink: "فتح رابط العرض", badLink: "الرابط يجب أن يبدأ بـ https://", fEps: "روابط الحلقات (رابط لكل حلقة، تظهر أرقامها في نافذة العرض)", epsBulk: "لصق عدة روابط دفعة واحدة", epsBulkHint: "كل رابط في سطر، بالترتيب من الحلقة 1", epsApply: "توزيع على الحلقات", epsNone: "اكتب «عدد الحلقات» أولاً لتظهر خانات روابط الحلقات.", epsBad: "رابط الحلقة يجب أن يبدأ بـ https://", ep: "الحلقة", linkNotSaved: "لم يُحفظ الرابط: كود Apps Script المنشور قديم. الصق Code.gs الجديد وانشره كنسخة جديدة (Deploy › Manage deployments › New version).", fFinished: "البرنامج منتهٍ", saveProgram: "حفظ البرنامج",
      fName: "الاسم", fRole: "الصلاحية", roleTeam: "فريق الاستوديو", roleCrewLong: "فريق الإنتاج (التسجيل والمونتاج)", roleEditor: "محرر البرامج", roleAdmin: "مدير الموقع",
      role: {admin: "مدير الموقع", editor: "محرر البرامج", crew: "فريق الإنتاج", team: "فريق الاستوديو"},
      type: {series: "سلسلة", shorts: "مقاطع قصيرة", course: "دورة", single: "حلقة واحدة"},
      err: {auth: "انتهت الجلسة، سجّل الدخول مرة أخرى.", forbidden: "ليست لديك صلاحية لهذا.", invalid: "تأكد من الحقول المطلوبة.", password: "كلمة المرور يجب أن تكون 8 أحرف على الأقل.", self: "لا يمكنك حذف حسابك أو خفض صلاحيتك.", offline: "تعذّر الاتصال بالخادم.", server: "حدث خطأ في الخادم."},
      of: "من", finished: "منتهٍ", inProd: "قيد المونتاج", edit: "تعديل", del: "حذف", confirmDel: "تأكيد الحذف", updateCounts: "تحديث الأرقام",
      noPrograms: "لا توجد برامج بعد. أضف أول برنامج.", editProgram: "تعديل برنامج", newProgram: "برنامج جديد", updateFor: "تحديث أرقام ",
      tooBig: "الرقم أكبر من عدد الحلقات.", savedProgram: "تم حفظ البرنامج", deletedProgram: "تم حذف البرنامج",
      loading: "جارٍ التحميل…", readFull: "قراءة المحتوى", tabViews: "المشاهدات", saveViews: "حفظ أرقام الشهر", viewsHint: "أدخل مشاهدات كل منصة لهذا الشهر كما تظهر في الإحصائيات (Insights). تظهر في الموقع مباشرة. اترك الخانة فارغة إذا لم يتوفر الرقم.", thPlatform: "المنصة", thMonthViews: "مشاهدات الشهر", thPrevMonth: "الشهر السابق", thLink: "رابط الحساب", addPlatform: "+ إضافة منصة", platformName: "اسم المنصة", viewsTotal: (n, c) => `الإجمالي: ${n} مشاهدة${c == null ? "" : ` · ${c >= 0 ? "+" : ""}${c}% عن الشهر السابق`}`, savedViews: "تم حفظ أرقام الشهر", remove: "حذف", cancelBooking: "إلغاء الحجز", confirmCancel: "تأكيد الإلغاء", noBookings: "لا توجد حجوزات قادمة.", cancelled: "تم إلغاء الحجز",
      you: "أنت", editUser: "تعديل مستخدم", newUser: "مستخدم جديد", pw8: "كلمة المرور (8 أحرف على الأقل)", pwKeep: "كلمة مرور جديدة (اتركها فارغة للإبقاء على الحالية)",
      savedUser: "تم حفظ المستخدم", deletedUser: "تم حذف المستخدم", pwChanged: "تم تغيير كلمة المرور", pwWrong: "كلمة المرور الحالية غير صحيحة.",
      tabReports: "التقارير", reportsHint: "اختر نوع التقرير والفترة والشكل، ثم نزّله صورة أو PDF. الأرقام من «أرقام الشهر» في صفحة البرامج، ومن المشاهدات.",
      monthTitle: "أرقام الشهر للتقرير", monthHint: "برامج المركز غير المنتهية وحجوزات الموقع تُحسب تلقائياً. اكتب هنا فقط ما كان من خارجها، ويُضاف عليها في التقرير.",
      msPrograms: "برامج خارجية (ليست من برامج المركز)", msProgramsManual: "أرقام البرامج (يدوي): تظهر في التقرير كما تكتبها", msAuto: "تلقائي + إضافات", msManual: "يدوي",
      msCentreRef: v => `للمقارنة فقط، الأرقام التلقائية من برامج المركز غير المنتهية: ${v.programs} برنامج · ${v.episodes} حلقة · ${v.recorded} مسجّلة · ${v.produced} منتَجة. لا تُضاف على ما تكتبه.`,
      msNPrograms: "عدد البرامج", msEpisodes: "إجمالي الحلقات", msRecorded: "تم التسجيل", msProduced: "تم الإنتاج",
      msStudio: "الاستوديو: تصوير خارج حجوزات الموقع", msSessions: "جلسات إضافية", msHours: "ساعات إضافية",
      msBooked: (s, h) => `من حجوزات الموقع في هذا الشهر: ${s} جلسة · ${h} ساعة. تُحسب تلقائياً، وأي رقم تكتبه هنا يُضاف عليها.`, msBookedNone: "لم نستطع قراءة حجوزات الموقع لهذا الشهر. أي رقم تكتبه هنا يُضاف عليها في التقرير.", savedMonth: "تم حفظ أرقام الشهر",
      msCentre: (v, pinned) => `من برامج المركز غير المنتهية${pinned ? " (مثبّتة لهذا الشهر)" : ""}: ${v.programs} برنامج · ${v.episodes} حلقة · ${v.recorded} مسجّلة · ${v.produced} منتَجة. تُحسب تلقائياً، وأي رقم تكتبه هنا يُضاف عليها.`,
      repMonth: "شهري", repQuarter: "ربع سنوي", repYear: "سنوي", repDay: "نهاري", repNight: "ليلي", repPeriod: "الفترة", repYearSel: "السنة",
      dlPng: "تنزيل صورة PNG", dlPdf: "تنزيل PDF", preparing: "جارٍ تجهيز الملف…", dlFail: "تعذّر تجهيز الملف، حاول مرة أخرى.", quarter: n => "الربع " + ["الأول", "الثاني", "الثالث", "الرابع"][n - 1],
      demo: "وضع التجربة: الخادم غير مربوط بعد. ادخل بـ admin@demo وكلمة المرور demo1234.", pm: "م", toggle: "English"
    },
    en: {
      title: "Admin · IIC Studio", loginTitle: "Sign in to admin", email: "Email", password: "Password", signIn: "Sign in", backSite: "Back to the site",
      badLogin: "Wrong email or password.", tabPrograms: "Programs", tabBookings: "Studio bookings", tabUsers: "Users and roles", tabAccount: "My account",
      viewSite: "View site", logout: "Sign out", addProgram: "+ New program", refresh: "Refresh", addUser: "+ Add user",
      programsHint: "Add programs and update the recorded and produced episode counts and due dates. Changes show on the site straight away.",
      crewHint: "Update the recorded and produced episode counts for each program. Changes show on the site straight away.",
      rolesTitle: "What each role can do",
      roleGuide: [
        {role: "admin", sub: "Full access", can: ["Everything a program editor can do", "Add, edit and delete users", "Set each user's role and reset their password"], cannot: []},
        {role: "editor", sub: "Programs and content", can: ["Add, edit and delete programs", "See studio bookings and cancel them", "Enter the monthly view counts", "Enter the monthly report figures", "Download reports (PNG and PDF)"], cannot: ["No access to users and roles"]},
        {role: "crew", sub: "Recording and editing", can: ["Update the recorded and produced episode counts", "See studio bookings and read the scripts"], cannot: ["Can't add or delete programs", "Can't cancel bookings or see views and reports"]},
        {role: "team", sub: "View only", can: ["See studio bookings and read the scripts"], cannot: ["Can't change programs or counts, or cancel bookings"]}
      ],
      everyone: "Everyone can change their own password under My account.",
      usersHint: "Site admin: everything, including users · Program editor: programs and bookings · Production crew: updates the recording and editing counts only · Studio team: sees booking details only.",
      thProgram: "Program", thTitle: "Title", cats: {muslim: "Born Muslims", newMuslim: "New Muslims", nonMuslim: "Non-Muslims"}, xlsBtn: "Download Excel", xlsMonth: "Month to download", xlsYear: y => `Whole year ${y}`, xlsEmpty: "No bookings in this period.", xlsDone: "Excel file downloaded", xlsBusy: "Preparing…",
      xl: {sheet: "Bookings", sum: "Summary", title: p => `IIC Studio bookings · ${p}`, id: "Booking no.", date: "Date", day: "Day", time: "Time", hours: "Hours", name: "Name", email: "Email", phone: "Phone", ttl: "Title", lng: "Language", cat: "Audience", content: "Content (script)", notes: "Notes", status: "Status", ok: "Confirmed", cx: "Cancelled", reason: "Cancellation reason", by: "Cancelled by", byGuest: "Booker", byStudio: "Studio team", at: "Cancelled on", period: "Period", made: "Issued", nOk: "Confirmed bookings", nHours: "Studio hours", nCx: "Cancelled bookings", byCat: "By audience", byLang: "By language", byReason: "Cancellation reasons", count: "Count", catNote: "A booking with several audiences counts once in each.", reasons: {forgot: "Forgot", busy: "Busy", emergency: "Emergency", other: "Other", studio: "Cancelled by the studio"}}, thPresenter: "Presenter", thType: "Type", thEpisodes: "Episodes", thRecording: "Recording", thEditing: "Editing", thDue: "Due date", thStatus: "Status",
      thWhen: "When", thContact: "Contact", thPhone: "Phone", thContent: "Content (script)", thNotes: "Notes",
      changePw: "Change password", curPw: "Current password", newPw: "New password (at least 8 characters)", save: "Save", cancel: "Cancel", close: "Close", toTop: "Back to top",
      fAr: "Program name (Arabic)", fEn: "Program name (English)", fPresenter: "Presenter (Arabic)", fPresenterEn: "Presenter (English)", fType: "Program type",
      optSeries: "Series", optShorts: "Shorts", optCourse: "Course / level", optSingle: "Single episode", none: "None",
      fLang: "Language", fTotal: "Number of episodes", fRecorded: "Episodes recorded", fDone: "Episodes produced (edited)", fOrder: "Order on the page",
      fNote: "Note shown as a tag (e.g. New Muslim Academy)", fLink: "View link (the program's videos or its work folder)", openLink: "Open view link", badLink: "The link must start with https://", fEps: "Episode links (one per episode, shown as numbers in the player)", epsBulk: "Paste several links at once", epsBulkHint: "One link per line, in order from episode 1", epsApply: "Fill the episodes", epsNone: "Enter the episode count first to get the episode link fields.", epsBad: "Each episode link must start with https://", ep: "Episode", linkNotSaved: "The link was not saved: the published Apps Script code is old. Paste the new Code.gs and deploy it as a new version.", fFinished: "Program finished", saveProgram: "Save program",
      fName: "Name", fRole: "Role", roleTeam: "Studio team", roleCrewLong: "Production crew (recording and editing)", roleEditor: "Program editor", roleAdmin: "Site admin",
      role: {admin: "Site admin", editor: "Program editor", crew: "Production crew", team: "Studio team"},
      type: {series: "Series", shorts: "Shorts", course: "Course", single: "Single episode"},
      err: {auth: "Your session ended. Please sign in again.", forbidden: "You don't have permission for this.", invalid: "Please check the required fields.", password: "The password must be at least 8 characters.", self: "You can't delete your own account or lower your own role.", offline: "Couldn't reach the server.", server: "Something went wrong on the server."},
      of: "of", finished: "Finished", inProd: "In production", edit: "Edit", del: "Delete", confirmDel: "Confirm delete", updateCounts: "Update counts",
      noPrograms: "No programs yet. Add the first one.", editProgram: "Edit program", newProgram: "New program", updateFor: "Update counts: ",
      tooBig: "A count is larger than the number of episodes.", savedProgram: "Program saved", deletedProgram: "Program deleted",
      loading: "Loading…", readFull: "Read the script", tabViews: "Views", saveViews: "Save the month", viewsHint: "Enter each platform's views for this month as shown in its Insights. They show on the site straight away. Leave a box empty if the figure isn't available.", thPlatform: "Platform", thMonthViews: "Views this month", thPrevMonth: "Previous month", thLink: "Account link", addPlatform: "+ Add platform", platformName: "Platform name", viewsTotal: (n, c) => `Total: ${n} views${c == null ? "" : ` · ${c >= 0 ? "+" : ""}${c}% vs last month`}`, savedViews: "Month saved", remove: "Remove", cancelBooking: "Cancel booking", confirmCancel: "Confirm cancel", noBookings: "No upcoming bookings.", cancelled: "Booking cancelled",
      you: "you", editUser: "Edit user", newUser: "New user", pw8: "Password (at least 8 characters)", pwKeep: "New password (leave empty to keep the current one)",
      savedUser: "User saved", deletedUser: "User deleted", pwChanged: "Password changed", pwWrong: "The current password is wrong.",
      tabReports: "Reports", reportsHint: "Pick the report type, the period and the look, then download it as an image or a PDF. The figures come from the month figures on the Programs page and from the views.",
      monthTitle: "Month figures for the report", monthHint: "The center's running programs and the site's bookings count automatically. Enter only what came from outside them; it is added on top in the report.",
      msPrograms: "Outside programs (not the center's own)", msProgramsManual: "Program figures (manual): shown in the report exactly as typed", msAuto: "Automatic + extras", msManual: "Manual",
      msCentreRef: v => `For comparison only, the automatic figures from the center's running programs: ${v.programs} programs · ${v.episodes} episodes · ${v.recorded} recorded · ${v.produced} produced. They are not added to what you type.`,
      msNPrograms: "Programs", msEpisodes: "Total episodes", msRecorded: "Recorded", msProduced: "Produced",
      msStudio: "Studio: filming outside the site's bookings", msSessions: "Extra sessions", msHours: "Extra hours",
      msBooked: (s, h) => `Booked on the site this month: ${s} sessions · ${h} hours. They count automatically; anything you enter here is added on top.`, msBookedNone: "Couldn't read the site's bookings for this month. Anything you enter here is added to them in the report.", savedMonth: "Month figures saved",
      msCentre: (v, pinned) => `From the center's running programs${pinned ? " (pinned for this month)" : ""}: ${v.programs} programs · ${v.episodes} episodes · ${v.recorded} recorded · ${v.produced} produced. They count automatically; anything you enter here is added on top.`,
      repMonth: "Monthly", repQuarter: "Quarterly", repYear: "Yearly", repDay: "Day", repNight: "Night", repPeriod: "Period", repYearSel: "Year",
      dlPng: "Download PNG", dlPdf: "Download PDF", preparing: "Preparing the file…", dlFail: "Couldn't prepare the file. Please try again.", quarter: n => "Q" + n,
      demo: "Demo mode: the server isn't connected yet. Sign in with admin@demo and the password demo1234.", pm: "pm", toggle: "عربي"
    }
  };
  let lang = store.get("ics-lang") === "en" ? "en" : "ar";
  const a = () => A[lang];
  const pName = p => lang === "en" && p.en ? p.en : p.ar;
  const pAlt = p => lang === "en" ? (p.en ? p.ar : "") : p.en;
  const presenterOf = p => lang === "en" && p.presenterEn ? p.presenterEn : p.presenter;

  function applyLang(){
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.title = a().title;
    document.querySelectorAll("[data-a]").forEach(el => { const v = a()[el.dataset.a]; if (typeof v === "string") el.textContent = v; });
    document.querySelectorAll("[data-aa]").forEach(el => el.setAttribute("aria-label", a()[el.dataset.aa]));
    document.querySelectorAll("[data-lang-toggle]").forEach(el => { el.textContent = a().toggle; el.lang = lang === "ar" ? "en" : "ar"; });
    const ls = document.querySelector('select[name="lang"]'), keep = ls.value;
    ls.innerHTML = `<option value="">${esc(a().none)}</option>` + langOptions(lang).map(([c, n]) => `<option value="${esc(c)}">${esc(n)}</option>`).join("");
    ls.value = keep;
    $("demo-note").textContent = a().demo;
    $("roles-guide").innerHTML = a().roleGuide.map(g => `<li class="${g.role}"><h3><span class="dot"></span>${esc(a().role[g.role])}<small>· ${esc(g.sub)}</small></h3><ul>${g.can.map(t => `<li>${esc(t)}</li>`).join("")}${g.cannot.map(t => `<li class="no">${esc(t)}</li>`).join("")}</ul></li>`).join("");
    $("roles-all").textContent = a().everyone;
    if (!$("login-err").hidden) $("login-err").textContent = a().badLogin;
    if (user){
      $("me-role").textContent = a().role[user.role];
      $("programs-hint").textContent = session.can(user, "editor") ? a().programsHint : a().crewHint;
      renderPrograms(); renderBookings(); renderUsers(); xlsControls(); if (vdata) loadViews(); if (mstats) monthControls(); if (rdata) reportControls();
    }
  }
  let user = null, programs = [], users = [], bookings = [], armed = null;

  const toast = text => { const el = $("toast"); el.textContent = text; el.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { el.hidden = true; }, 2600); };
  const fail = r => { if (r.error === "auth"){ signOut(); } toast(a().err[r.error] || a().err.server); };
  const dateText = iso => iso ? midnight(iso).toLocaleDateString(lang === "ar" ? "ar-u-nu-latn" : "en-GB", {day: "numeric", month: "long", year: "numeric"}) : "—";
  const range = (s, d) => `${s - 12}:00 – ${s + d - 12}:00 ${a().pm}`;

  // ---------- views ----------
  function show(tab){
    const allowed = [...document.querySelectorAll("[data-tab]")].filter(b => session.can(user, b.dataset.need));
    document.querySelectorAll("[data-tab]").forEach(b => { b.hidden = !session.can(user, b.dataset.need); });
    if (!allowed.some(b => b.dataset.tab === tab)) tab = allowed[0].dataset.tab;
    document.querySelectorAll("[data-tab]").forEach(b => { if (b.dataset.tab === tab) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); });
    document.querySelectorAll("[data-panel]").forEach(p => { p.hidden = p.dataset.panel !== tab; });
    if (tab === "programs") loadPrograms();
    if (tab === "bookings"){ xlsControls(); loadBookings(); }
    if (tab === "users") loadUsers();
    if (tab === "views") loadViews();
    if (tab === "reports") loadReports();
  }
  function enter(u){
    user = u;
    $("login-view").hidden = true; $("app-view").hidden = false;
    $("me-name").textContent = u.name || u.email;
    $("me-role").textContent = a().role[u.role];
    $("add-program").hidden = !session.can(u, "editor");
    $("programs-hint").textContent = session.can(u, "editor") ? a().programsHint : a().crewHint;
    show(session.can(u, "crew") ? "programs" : "bookings");
  }
  async function signOut(){ await session.logout(); user = null; $("app-view").hidden = true; $("login-view").hidden = false; }

  // ---------- programs ----------
  async function loadPrograms(){
    const r = await call("state");
    if (!r.ok) return fail(r);
    programs = (r.programs || []).slice().sort((a, b) => (a.order || 0) - (b.order || 0));
    renderPrograms();
    $("month-stats").hidden = !session.can(user, "editor");
    if (session.can(user, "editor")) loadMonthStats();
  }

  // ---------- the report's monthly figures (entered by hand on the programs page) ----------
  let mstats = null;
  const rstudio = {}; // site bookings per period (sessions and hours), keyed by its first and last day
  async function bookedIn(from, to){
    const key = from + to;
    if (!(key in rstudio)){
      const r = await session.authed("reportStats", {from, to});
      if (r.error === "auth"){ fail(r); return null; }
      rstudio[key] = r.ok ? r : null;
    }
    return rstudio[key];
  }
  const MFIELDS = ["programs", "episodes", "recorded", "produced", "sessions", "hours"];
  async function loadMonthStats(){
    const r = await session.authed("monthStats", {});
    if (!r.ok) return fail(r);
    mstats = r.stats || {};
    await pinMonth(programs);
    monthControls();
  }
  // keeps this month's figures for the center's running programs saved, so a month's report stays the same after it ends
  async function pinMonth(list){
    const now = window.ICSReport.thisMonth(), live = window.ICSReport.centre(list), row = mstats[now] || {};
    if (JSON.stringify(row.base || {}) === JSON.stringify(live)) return;
    const values = {}; MFIELDS.forEach(k => { values[k] = row[k] == null ? null : row[k]; });
    const r = await session.authed("saveMonthStats", {month: now, values, base: live, mode: row.mode});
    if (r.ok) mstats = r.stats || mstats;
  }
  function monthControls(){
    const sel = $("ms-month"), keep = sel.value, now = ym(new Date());
    const keys = new Set(Object.keys(mstats)); for (let i = 0; i < 13; i++) keys.add(ymShift(now, -i));
    sel.innerHTML = [...keys].sort().reverse().map(k => `<option value="${k}">${esc(ymName(k))}</option>`).join("");
    sel.value = keep && keys.has(keep) ? keep : now;
    renderMonthStats();
  }
  let msMode = "auto"; // "manual": the four program figures are typed in full and the report shows them as they are
  function renderMonthStats(){
    const row = mstats[$("ms-month").value] || {};
    msMode = row.mode === "manual" ? "manual" : "auto";
    document.querySelectorAll("#month-stats [data-m]").forEach(el => { const v = row[el.dataset.m]; el.value = v == null ? "" : fmtN(v); });
    const now = $("ms-month").value >= window.ICSReport.thisMonth(), v = !now && row.base ? row.base : window.ICSReport.centre(programs);
    msCentreView = [{programs: fmtN(v.programs || 0), episodes: fmtN(v.episodes || 0), recorded: fmtN(v.recorded || 0), produced: fmtN(v.produced || 0)}, !now && !!row.base];
    showMode();
    showBooked();
  }
  let msCentreView = null;
  function showMode(){
    const manual = msMode === "manual";
    document.querySelectorAll("#ms-mode button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.msmode === msMode)));
    $("ms-gt").textContent = manual ? a().msProgramsManual : a().msPrograms;
    if (msCentreView) $("ms-centre").textContent = manual ? a().msCentreRef(msCentreView[0]) : a().msCentre(...msCentreView);
  }
  async function showBooked(){
    const k = $("ms-month").value, [y, m] = k.split("-").map(Number);
    $("ms-booked").textContent = "";
    const r = await bookedIn(`${k}-01`, `${k}-${new Date(y, m, 0).getDate()}`);
    if ($("ms-month").value !== k) return;
    $("ms-booked").textContent = r ? a().msBooked(fmtN(r.sessions), fmtN(r.hours)) : a().msBookedNone;
  }
  const readNum = v => { const n = String(v || "").replace(/[^\d.]/g, ""); return n === "" || isNaN(Number(n)) ? null : Number(n); };
  async function saveMonthStats(){
    const values = {}; document.querySelectorAll("#month-stats [data-m]").forEach(el => { values[el.dataset.m] = readNum(el.value); });
    const k = $("ms-month").value, base = k === window.ICSReport.thisMonth() ? window.ICSReport.centre(programs) : undefined;
    const r = await session.authed("saveMonthStats", {month: k, values, base, mode: msMode});
    if (!r.ok) return fail(r);
    mstats = r.stats || {}; if (rdata) rdata.monthly = mstats;
    renderMonthStats(); toast(a().savedMonth);
  }
  function renderPrograms(){
    $("presenters").innerHTML = [...new Set(programs.map(p => p.presenter))].map(x => `<option value="${esc(x)}">`).join("");
    $("programs-rows").innerHTML = programs.length ? programs.map((p, i) => `<tr>
      <td class="n">${p.order || i + 1}</td>
      <td><b>${esc(pName(p))}</b>${/^https?:\/\//i.test(p.link || "") || (p.eps || []).some(Boolean) ? ` <a class="plink" href="${esc(p.link || (p.eps || []).find(Boolean))}" target="_blank" rel="noopener" title="${esc(a().openLink)}" aria-label="${esc(a().openLink)}">▶</a>` : ""}${pAlt(p) ? `<span class="sub">${esc(pAlt(p))}</span>` : ""}</td>
      <td>${esc(presenterOf(p))}</td>
      <td>${p.type ? `<span class="tag ${p.type}">${esc(a().type[p.type])}</span>` : "—"}${p.lang ? ` <span class="tag">${esc(langName(p.lang, lang))}</span>` : ""}</td>
      <td class="n">${p.total || "—"}</td>
      <td class="n">${p.total ? `${p.recorded || 0} ${a().of} ${p.total}` : "—"}</td>
      <td class="n">${p.total ? `${p.done || 0} ${a().of} ${p.total}` : "—"}</td>
      <td>${dateText(p.due)}</td>
      <td>${p.finished ? `<span class="role team">${esc(a().finished)}</span>` : esc(a().inProd)}</td>
      <td><div class="acts">${session.can(user, "editor") ? `<button type="button" class="btn small" data-edit="${esc(p.id)}">${esc(a().edit)}</button><button type="button" class="btn small danger" data-del="${esc(p.id)}">${esc(armed === p.id ? a().confirmDel : a().del)}</button>` : `<button type="button" class="btn small" data-edit="${esc(p.id)}">${esc(a().updateCounts)}</button>`}</div></td>
    </tr>`).join("") : `<tr><td colspan="10" class="empty">${esc(a().noPrograms)}</td></tr>`;
  }
  function openProgram(p){
    const f = $("program-form");
    f.reset();
    $("program-title").textContent = p ? a().editProgram : a().newProgram;
    $("program-err").hidden = true;
    const v = p || {type: "series"};
    ["pid", "ar", "en", "presenter", "presenterEn", "type", "lang", "total", "recorded", "done", "due", "order", "note", "link"].forEach(k => { f[k].value = (k === "pid" ? v.id : v[k]) == null ? "" : (k === "pid" ? v.id : v[k]); });
    f.finished.checked = !!v.finished;
    renderEpRows((v.eps || []).slice());
    $("eps-bulk").hidden = true; $("eps-bulk-text").value = "";
    // the production crew changes only the two counts
    const crewOnly = !session.can(user, "editor");
    [...f.elements].forEach(el => { if (el.name && !["pid", "recorded", "done"].includes(el.name)) el.disabled = crewOnly; });
    document.querySelectorAll("#eps-rows input, #eps-bulk-btn").forEach(el => { el.disabled = crewOnly; });
    if (crewOnly) $("program-title").textContent = a().updateFor + pName(v);
    $("program-dlg").showModal();
  }
  // one link field per episode: as many as the episode count, or as many links as are already set
  const EP_RX = /^https?:\/\/\S+$/i;
  function readEps(){ return [...document.querySelectorAll("#eps-rows input")].map(i => i.value.trim()); }
  function renderEpRows(eps){
    const n = Math.min(Math.max(Number($("program-form").total.value) || 0, eps.length), 300);
    const dis = !session.can(user, "editor") ? " disabled" : "";
    $("eps-rows").innerHTML = n ? Array.from({length: n}, (_, i) => { const u = eps[i] || ""; return `<div class="row${u && EP_RX.test(u) ? " ok" : ""}"><b>${i + 1}</b><input dir="ltr" data-ep="${i}" value="${esc(u)}" placeholder="https://vimeo.com/..." aria-label="${esc(a().ep + " " + (i + 1))}"${dis}></div>`; }).join("")
      : `<p class="hint" style="margin:0">${esc(a().epsNone)}</p>`;
  }
  function trimEps(eps){ const out = eps.slice(); while (out.length && !out[out.length - 1]) out.pop(); return out; }
  async function saveProgram(f){
    const p = {id: f.pid.value || undefined, ar: f.ar.value.trim(), en: f.en.value.trim(), presenter: f.presenter.value.trim(), presenterEn: f.presenterEn.value.trim(),
      type: f.type.value, lang: f.lang.value, total: f.total.value === "" ? null : Number(f.total.value), recorded: f.recorded.value === "" ? null : Number(f.recorded.value), done: f.done.value === "" ? null : Number(f.done.value),
      due: f.due.value, order: f.order.value === "" ? null : Number(f.order.value), note: f.note.value.trim(), link: f.link.value.trim(), finished: f.finished.checked};
    p.eps = trimEps(readEps());
    if (p.eps.some(u => u && !EP_RX.test(u))){ $("program-err").textContent = a().epsBad; $("program-err").hidden = false; return; }
    if (p.link && !/^https?:\/\/\S+$/i.test(p.link)){ $("program-err").textContent = a().badLink; $("program-err").hidden = false; return; }
    if (p.total != null && ((p.done || 0) > p.total || (p.recorded || 0) > p.total)){ $("program-err").textContent = a().tooBig; $("program-err").hidden = false; return; }
    const r = session.can(user, "editor") ? await session.authed("saveProgram", {program: p}) : await session.authed("updateCounts", {id: p.id, recorded: p.recorded, done: p.done});
    if (!r.ok){ $("program-err").textContent = a().err[r.error] || a().err.server; $("program-err").hidden = false; if (r.error === "auth") signOut(); return; }
    programs = r.programs.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
    // an older Code.gs drops fields it does not know, so say so instead of a silent "saved"
    const back = p.link && session.can(user, "editor") ? (p.id ? programs.find(x => x.id === p.id) : programs[programs.length - 1]) : null;
    const lost = (back && back.link !== p.link && !programs.some(x => x.link === p.link)) || (p.eps.length && session.can(user, "editor") && programs.every(x => !Array.isArray(x.eps)));
    if (lost){ renderPrograms(); $("program-err").textContent = a().linkNotSaved; $("program-err").hidden = false; return; }
    $("program-dlg").close(); renderPrograms(); toast(a().savedProgram);
  }
  async function deleteProgram(id){
    if (armed !== id){ armed = id; renderPrograms(); return; }
    armed = null;
    const r = await session.authed("deleteProgram", {id});
    if (!r.ok) return fail(r);
    programs = r.programs.slice().sort((a, b) => (a.order || 0) - (b.order || 0));
    renderPrograms(); toast(a().deletedProgram);
  }

  // ---------- bookings ----------
  async function loadBookings(){
    $("bookings-rows").innerHTML = `<tr><td colspan="8" class="empty">${esc(a().loading)}</td></tr>`;
    const r = await session.authed("details");
    if (!r.ok) return fail(r);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    bookings = (r.bookings || []).filter(b => midnight(b.date) >= today);
    renderBookings();
  }
  function renderBookings(){
    const canCancel = session.can(user, "editor");
    $("bookings-rows").innerHTML = bookings.length ? bookings.map(b => `<tr>
      <td><b>${dateText(b.date)}</b><span class="sub">${range(b.start, b.dur)}</span></td>
      <td>${esc(b.name)}</td>
      <td><a class="contact" dir="ltr" href="mailto:${esc(b.email)}">${esc(b.email)}</a></td>
      <td>${b.phone ? `<a class="contact" dir="ltr" href="tel:${esc(b.phone.replace(/\s+/g, ""))}">${esc(b.phone)}</a>` : "—"}</td>
      <td>${esc(b.program || "—")}${b.blang || b.cat ? `<span class="sub">${[b.blang && langName(b.blang, lang), catList(b.cat).map(c => a().cats[c]).join("، ")].filter(Boolean).map(esc).join(" · ")}</span>` : ""}</td>
      <td class="txt content">${b.content ? `<span class="one" dir="auto" title="${esc(b.content.slice(0, 300))}">${esc(b.content.replace(/\s+/g, " "))}</span><button type="button" class="read-btn" data-read="${esc(b.id)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>${esc(a().readFull)}</button>` : "—"}</td>
      <td class="txt notes">${b.notes ? `<span class="one" dir="auto" title="${esc(b.notes)}">${esc(b.notes)}</span>` : "—"}</td>
      <td>${canCancel ? `<div class="acts"><button type="button" class="btn small danger" data-cancel="${esc(b.id)}">${esc(armed === b.id ? a().confirmCancel : a().cancelBooking)}</button></div>` : ""}</td>
    </tr>`).join("") : `<tr><td colspan="8" class="empty">${esc(a().noBookings)}</td></tr>`;
  }
  // ---------- Excel download: one month (or a whole year) of bookings and cancellations ----------
  function xlsControls(){
    const sel = $("xls-month"); if (!sel) return;
    const keep = sel.value, now = new Date(), opts = [];
    for (let i = 2; i >= -12; i--){ const d = new Date(now.getFullYear(), now.getMonth() + i, 1); opts.push([`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, d.toLocaleDateString(lang === "ar" ? "ar-u-nu-latn" : "en-GB", {month: "long", year: "numeric"})]); }
    [now.getFullYear(), now.getFullYear() - 1].forEach(y => opts.push([String(y), a().xlsYear(y)]));
    sel.innerHTML = opts.map(([v, t]) => `<option value="${v}">${esc(t)}</option>`).join("");
    sel.value = keep || opts[2][0];
    $("xls-tools").hidden = !session.can(user, "editor");
  }
  async function downloadXls(){
    const k = $("xls-month").value, btn = $("xls-btn"), X = a().xl;
    const from = k.length === 4 ? `${k}-01-01` : `${k}-01`;
    const to = k.length === 4 ? `${k}-12-31` : (() => { const [y, m] = k.split("-").map(Number); return `${k}-${String(new Date(y, m, 0).getDate()).padStart(2, "0")}`; })();
    const label = $("xls-month").selectedOptions[0].textContent;
    btn.disabled = true; btn.textContent = a().xlsBusy;
    const r = await session.authed("exportBookings", {from, to});
    btn.disabled = false; btn.textContent = a().xlsBtn;
    if (!r.ok) return fail(r);
    const rows = (r.bookings || []).map(b => Object.assign({cx: false}, b)).concat((r.cancels || []).map(b => Object.assign({cx: true}, b)))
      .sort((p, q) => (p.date + String(p.start).padStart(2, "0")).localeCompare(q.date + String(q.start).padStart(2, "0")));
    if (!rows.length){ toast(a().xlsEmpty); return; }
    const lname = b => lang === "ar" && b.blangAr ? b.blangAr : (b.blang ? langName(b.blang, lang) : "");
    const cats = b => catList(b.cat).map(c => a().cats[c]).join("، ");
    const reason = b => b.cx ? (X.reasons[b.reason] || "") + (b.reason === "other" && b.reasonText ? `: ${b.reasonText}` : "") : "";
    const day = iso => midnight(iso).toLocaleDateString(lang === "ar" ? "ar" : "en-GB", {weekday: "long"});
    const head = [X.id, X.date, X.day, X.time, X.hours, X.name, X.email, X.phone, X.ttl, X.lng, X.cat, X.content, X.notes, X.status, X.reason, X.by, X.at];
    const list = [head].concat(rows.map(b => [b.id, b.date, day(b.date), range(Number(b.start), Number(b.dur)), Number(b.dur) || 1, b.name, b.email, b.phone, b.program, lname(b), cats(b), b.content, b.notes,
      {v: b.cx ? X.cx : X.ok, s: b.cx ? 4 : 3}, reason(b), b.cx ? (b.by === "studio" ? X.byStudio : X.byGuest) : "", b.cx && b.at ? String(b.at).slice(0, 10) : ""]));
    // summary
    const ok = rows.filter(b => !b.cx), cx = rows.filter(b => b.cx), tally = (arr, keyFn) => { const m = new Map(); arr.forEach(b => [].concat(keyFn(b)).filter(Boolean).forEach(k => m.set(k, (m.get(k) || 0) + 1))); return [...m].sort((p, q) => q[1] - p[1]); };
    const sum = [[{v: X.title(label), s: 2}], [], [{v: X.period, s: 5}, label], [{v: X.made, s: 5}, new Date().toISOString().slice(0, 10)], [],
      [{v: X.nOk, s: 5}, ok.length], [{v: X.nHours, s: 5}, ok.reduce((s, b) => s + (Number(b.dur) || 1), 0)], [{v: X.nCx, s: 5}, cx.length], [],
      [{v: X.byCat, s: 1}, {v: X.count, s: 1}]].concat(CATEGORIES.map(c => [a().cats[c], ok.filter(b => catList(b.cat).includes(c)).length]), [[{v: X.catNote}], [],
      [{v: X.byLang, s: 1}, {v: X.count, s: 1}]], tally(ok, lname), [[], [{v: X.byReason, s: 1}, {v: X.count, s: 1}]], tally(cx, b => X.reasons[b.reason] || ""));
    const blob = window.makeXlsx([
      {name: X.sum, rows: sum, widths: [34, 22], rtl: lang === "ar"},
      {name: X.sheet, rows: list, header: 0, rtl: lang === "ar", widths: [16, 12, 11, 15, 8, 20, 26, 17, 28, 14, 26, 40, 28, 10, 26, 14, 13]}
    ]);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob); link.download = `IIC-Studio-bookings-${k}.xlsx`;
    document.body.appendChild(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(link.href), 4000);
    toast(a().xlsDone);
  }

  // the reading window: who, when, program, then the full script and notes
  function openRead(id){
    const b = bookings.find(x => x.id === id);
    if (!b) return;
    $("read-title").textContent = a().thContent;
    $("read-body").innerHTML = `<div class="read-meta"><span>${esc(dateText(b.date))} · ${esc(range(b.start, b.dur))}</span><span>${esc(b.name)}</span>${b.program ? `<span>${esc(b.program)}</span>` : ""}${b.blang ? `<span>${esc(langName(b.blang, lang))}</span>` : ""}${catList(b.cat).map(c => `<span>${esc(a().cats[c])}</span>`).join("")}</div>
      <div class="read-text">${esc(b.content || "—")}</div>
      ${b.notes ? `<p class="read-sec">${esc(a().thNotes)}</p><div class="read-text" style="max-height:20vh">${esc(b.notes)}</div>` : ""}`;
    $("read-dlg").showModal();
  }

  // ---------- views per platform ----------
  let vdata = null, vplats = [];
  const ym = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const ymShift = (k, n) => { const [y, m] = k.split("-").map(Number); return ym(new Date(y, m - 1 + n, 1)); };
  const ymName = k => { const [y, m] = k.split("-").map(Number); return new Date(y, m - 1, 1).toLocaleDateString(lang === "ar" ? "ar-u-nu-latn" : "en-GB", {month: "long", year: "numeric"}); };
  const fmtN = n => Number(n).toLocaleString("en-US");
  async function loadViews(){
    const r = await call("state");
    if (!r.ok) return fail(r);
    vdata = (r.views && r.views.data) || {};
    vplats = ((r.views && r.views.platforms) || PLATFORMS).map(p => Object.assign({custom: !["yt", "ig", "tt", "fb"].includes(p.id)}, p));
    const sel = $("views-month"), keep = sel.value, now = ym(new Date());
    const keys = new Set(Object.keys(vdata)); for (let i = 0; i < 13; i++) keys.add(ymShift(now, -i));
    sel.innerHTML = [...keys].sort().reverse().map(k => `<option value="${k}">${esc(ymName(k))}</option>`).join("");
    sel.value = keep && keys.has(keep) ? keep : now;
    renderViewsAdmin();
  }
  function renderViewsAdmin(){
    if (!vdata) return;
    const k = $("views-month").value, cur = vdata[k] || {}, prev = vdata[ymShift(k, -1)] || {};
    $("views-rows").innerHTML = vplats.map((p, i) => `<tr data-pi="${i}">
      <td><span class="pcell">${platformIcon(p)}${p.custom ? `<input class="vin" data-f="name" value="${esc(p.name)}" placeholder="${esc(a().platformName)}" maxlength="40">` : `<b>${esc(p.name)}</b>`}</span></td>
      <td><input class="vin" data-f="count" inputmode="numeric" dir="ltr" value="${cur[p.id] == null ? "" : fmtN(cur[p.id])}"></td>
      <td class="n">${prev[p.id] == null ? "—" : fmtN(prev[p.id])}</td>
      <td><input class="vin wide" data-f="url" dir="ltr" placeholder="https://" value="${esc(p.url || "")}"></td>
      <td>${["yt", "ig", "tt", "fb"].includes(p.id) ? "" : `<button type="button" class="btn small danger" data-premove="${i}">${esc(a().remove)}</button>`}</td></tr>`).join("");
    viewsTotal();
  }
  const readCount = v => { const n = String(v || "").replace(/[^\d]/g, ""); return n === "" ? null : Number(n); };
  function viewsTotal(){
    const k = $("views-month").value, prev = vdata[ymShift(k, -1)];
    let total = 0, any = false;
    document.querySelectorAll('#views-rows [data-f="count"]').forEach(el => { const n = readCount(el.value); if (n != null){ total += n; any = true; } });
    const pt = prev ? vplats.reduce((t, p) => t + (prev[p.id] || 0), 0) : 0;
    $("views-total").textContent = any ? a().viewsTotal(fmtN(total), pt ? Math.round((total - pt) / pt * 100) : null) : "";
  }
  function collectPlatforms(){
    document.querySelectorAll("#views-rows tr").forEach(tr => {
      const p = vplats[Number(tr.dataset.pi)], name = tr.querySelector('[data-f="name"]');
      if (name) p.name = name.value.trim();
      p.url = tr.querySelector('[data-f="url"]').value.trim();
      p._count = readCount(tr.querySelector('[data-f="count"]').value);
    });
  }
  async function saveViews(){
    collectPlatforms();
    const platforms = vplats.filter(p => p.name).map(p => ({id: p.id, name: p.name, url: p.url}));
    const counts = {}; vplats.forEach(p => { if (p._count != null) counts[p.id] = p._count; });
    const r = await session.authed("saveViews", {month: $("views-month").value, counts, platforms});
    if (!r.ok) return fail(r);
    vdata = r.views.data; vplats = r.views.platforms.map(p => Object.assign({custom: !["yt", "ig", "tt", "fb"].includes(p.id)}, p));
    renderViewsAdmin(); toast(a().savedViews);
  }

  async function cancelBooking(id){
    if (armed !== id){ armed = id; renderBookings(); return; }
    armed = null;
    const r = await session.authed("cancel", {id});
    if (!r.ok) return fail(r);
    toast(a().cancelled); loadBookings();
  }

  // ---------- users ----------
  async function loadUsers(){
    const r = await session.authed("listUsers");
    if (!r.ok) return fail(r);
    users = r.users; renderUsers();
  }
  function renderUsers(){
    if (!user) return;
    $("users-rows").innerHTML = users.map(u => `<tr>
      <td><b>${esc(u.name)}</b>${u.email === user.email ? ` <span class="sub">${esc(a().you)}</span>` : ""}</td>
      <td dir="ltr" style="text-align:start">${esc(u.email)}</td>
      <td><span class="role ${u.role}">${esc(a().role[u.role])}</span></td>
      <td><div class="acts"><button type="button" class="btn small" data-uedit="${esc(u.email)}">${esc(a().edit)}</button>${u.email === user.email ? "" : `<button type="button" class="btn small danger" data-udel="${esc(u.email)}">${esc(armed === u.email ? a().confirmDel : a().del)}</button>`}</div></td>
    </tr>`).join("");
  }
  function openUser(u){
    const f = $("user-form");
    f.reset(); $("user-err").hidden = true;
    $("user-title").textContent = u ? a().editUser : a().newUser;
    f.name.value = u ? u.name : ""; f.email.value = u ? u.email : ""; f.email.readOnly = !!u; f.role.value = u ? u.role : "team";
    f.password.required = !u;
    $("pw-label").textContent = u ? a().pwKeep : a().pw8;
    $("user-dlg").showModal();
  }
  async function saveUser(f){
    const r = await session.authed("saveUser", {user: {name: f.name.value.trim(), email: f.email.value.trim(), role: f.role.value, password: f.password.value || undefined}});
    if (!r.ok){ $("user-err").textContent = a().err[r.error] || a().err.server; $("user-err").hidden = false; if (r.error === "auth") signOut(); return; }
    users = r.users; $("user-dlg").close(); renderUsers(); toast(a().savedUser);
  }
  async function deleteUser(email){
    if (armed !== email){ armed = email; renderUsers(); return; }
    armed = null;
    const r = await session.authed("deleteUser", {email});
    if (!r.ok) return fail(r);
    users = r.users; renderUsers(); toast(a().deletedUser);
  }

  // ---------- reports (the page itself is drawn by reports.js) ----------
  let rdata = null, rkind = "month", rtheme = "day", rshown = null;
  const now0 = new Date();
  const rpick = {month: now0.getMonth() || 12, quarter: Math.max(1, Math.floor(now0.getMonth() / 3))}; // the last full month and quarter
  let ryear = now0.getMonth() ? now0.getFullYear() : now0.getFullYear() - 1;
  async function loadReports(){
    const r = await call("state");
    if (!r.ok) return fail(r);
    const m = await session.authed("monthStats", {});
    if (!m.ok) return fail(m);
    mstats = m.stats || {};
    await pinMonth(r.programs || []);
    rdata = {programs: r.programs || [], views: r.views || {}, monthly: mstats};
    reportControls();
  }
  function reportControls(){
    const y0 = new Date().getFullYear(), years = new Set([y0, y0 - 1, ryear]);
    Object.keys(rdata.views.data || {}).concat(Object.keys(rdata.monthly || {})).forEach(k => years.add(Number(k.slice(0, 4))));
    $("rep-year").innerHTML = [...years].sort((x, y) => y - x).map(y => `<option value="${y}">${y}</option>`).join("");
    $("rep-year").value = ryear;
    const n = $("rep-n");
    n.hidden = rkind === "year";
    n.innerHTML = rkind === "month"
      ? Array.from({length: 12}, (_, i) => `<option value="${i + 1}">${esc(new Date(2026, i, 1).toLocaleDateString(lang === "ar" ? "ar" : "en-GB", {month: "long"}))}</option>`).join("")
      : [1, 2, 3, 4].map(q => `<option value="${q}">${esc(a().quarter(q))}</option>`).join("");
    if (rkind !== "year") n.value = rpick[rkind];
    document.querySelectorAll("#rep-kind button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.kind === rkind)));
    document.querySelectorAll("#rep-theme button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.rtheme === rtheme)));
    renderReport();
  }
  async function renderReport(){
    if (!rdata) return;
    const P = window.ICSReport.period(rkind, ryear, rpick[rkind] || 1, lang);
    rshown = P;
    const booked = await bookedIn(P.from, P.to);
    if (rshown !== P) return;
    const F = window.ICSReport.figures(P, rdata.programs, rdata.views, rdata.monthly, booked);
    $("rep-out").innerHTML = window.ICSReport.render(P, F, rtheme, window.ICSReport.issuedText(new Date(), lang));
    fitReport();
  }
  const fitReport = () => { $("rep-out").style.transform = `scale(${$("rep-frame").clientWidth / 794})`; };
  addEventListener("resize", () => { if (rdata) fitReport(); });
  // the export libraries are only fetched the first time someone downloads a report
  const libs = {};
  const lib = src => libs[src] || (libs[src] = new Promise((ok, no) => {
    const s = document.createElement("script"); s.src = src; s.onload = ok;
    s.onerror = () => { delete libs[src]; no(new Error(src)); };
    document.head.appendChild(s);
  }));
  async function downloadReport(kind){
    const node = document.querySelector("#rep-out .rp");
    if (!node || !rshown) return;
    const btns = [$("rep-png"), $("rep-pdf")];
    btns.forEach(b => { b.disabled = true; }); toast(a().preparing);
    try {
      await lib("vendor/html-to-image-1.11.11.js");
      await document.fonts.ready;
      const opt = {width: 794, height: 1123, style: {transform: "none"}};
      await window.htmlToImage.toCanvas(node, Object.assign({pixelRatio: 1}, opt)); // first pass loads fonts and logos (Safari needs it)
      const link = document.createElement("a");
      if (kind === "png"){
        link.href = await window.htmlToImage.toPng(node, Object.assign({pixelRatio: 3}, opt));
        link.download = rshown.title + ".png";
      } else {
        await lib("vendor/jspdf-2.5.1.umd.min.js");
        const img = await window.htmlToImage.toJpeg(node, Object.assign({pixelRatio: 2.5, quality: .95}, opt));
        const pdf = new window.jspdf.jsPDF({orientation: "portrait", unit: "mm", format: "a4"});
        pdf.addImage(img, "JPEG", 0, 0, 210, 297);
        link.href = URL.createObjectURL(pdf.output("blob"));
        link.download = rshown.title + ".pdf";
        setTimeout(() => URL.revokeObjectURL(link.href), 60000);
      }
      document.body.appendChild(link); link.click(); link.remove();
      $("toast").hidden = true;
    } catch (e){ toast(a().dlFail); }
    btns.forEach(b => { b.disabled = false; });
  }

  // ---------- events ----------
  document.addEventListener("click", e => {
    const el = e.target.closest("button, [data-close]");
    if (e.target.tagName === "DIALOG"){ e.target.close(); return; }
    if (!el) return;
    if (el.matches("[data-close]")){ el.closest("dialog").close(); return; }
    if (el.dataset.tab){ armed = null; show(el.dataset.tab); return; }
    if (el.dataset.edit) return openProgram(programs.find(p => p.id === el.dataset.edit));
    if (el.dataset.del) return deleteProgram(el.dataset.del);
    if (el.id === "save-views") return saveViews();
    if (el.id === "ms-save") return saveMonthStats();
    if (el.dataset.msmode){ msMode = el.dataset.msmode; return showMode(); }
    if (el.dataset.kind){ rkind = el.dataset.kind; return reportControls(); }
    if (el.dataset.rtheme){ rtheme = el.dataset.rtheme; return reportControls(); }
    if (el.id === "rep-png") return downloadReport("png");
    if (el.id === "rep-pdf") return downloadReport("pdf");
    if (el.id === "add-platform"){ collectPlatforms(); vplats.push({id: "p" + Date.now().toString(36).slice(-6), name: "", url: "", custom: true}); renderViewsAdmin(); vplats.forEach((p, i) => { if (p._count != null){ const el2 = document.querySelector(`#views-rows tr[data-pi="${i}"] [data-f="count"]`); if (el2) el2.value = fmtN(p._count); } }); return; }
    if (el.dataset.premove){ collectPlatforms(); vplats.splice(Number(el.dataset.premove), 1); renderViewsAdmin(); return; }
    if (el.dataset.read) return openRead(el.dataset.read);
    if (el.dataset.cancel) return cancelBooking(el.dataset.cancel);
    if (el.dataset.uedit) return openUser(users.find(u => u.email === el.dataset.uedit));
    if (el.dataset.udel) return deleteUser(el.dataset.udel);
    if (el.id === "add-program") return openProgram(null);
    if (el.id === "add-user") return openUser(null);
    if (el.id === "reload-bookings") return loadBookings();
    if (el.id === "xls-btn") return downloadXls();
    if (el.id === "logout") return signOut();
    if (el.matches("[data-lang-toggle]")){ lang = lang === "ar" ? "en" : "ar"; store.set("ics-lang", lang); applyLang(); return; }
  });
  document.addEventListener("change", e => {
    if (e.target.id === "views-month"){ collectPlatforms(); renderViewsAdmin(); }
    if (e.target.id === "ms-month") renderMonthStats();
    if (e.target.id === "rep-year"){ ryear = Number(e.target.value); renderReport(); }
    if (e.target.id === "rep-n"){ rpick[rkind] = Number(e.target.value); renderReport(); }
  });
  document.addEventListener("input", e => {
    if (e.target.matches('#views-rows [data-f="count"]')) viewsTotal();
    if (e.target.matches("#program-form [name=total]")) renderEpRows(readEps());
    if (e.target.matches("#eps-rows input")){ const v = e.target.value.trim(), row = e.target.parentNode; row.classList.toggle("ok", EP_RX.test(v)); row.classList.toggle("bad", !!v && !EP_RX.test(v)); }
  });
  document.addEventListener("click", e => {
    if (e.target.id === "eps-bulk-btn"){ $("eps-bulk").hidden = !$("eps-bulk").hidden; if (!$("eps-bulk").hidden) $("eps-bulk-text").focus(); }
    if (e.target.id === "eps-bulk-apply"){
      const lines = $("eps-bulk-text").value.split(/\s*\n\s*/).map(x => x.trim()).filter(Boolean);
      if (!lines.length) return;
      const f = $("program-form"), cur = readEps();
      if ((Number(f.total.value) || 0) < lines.length) f.total.value = lines.length;
      lines.forEach((u, i) => { cur[i] = u; });
      renderEpRows(cur); $("eps-bulk").hidden = true; $("eps-bulk-text").value = "";
    }
  });
  document.addEventListener("submit", async e => {
    e.preventDefault();
    const f = e.target;
    if (f.id === "login-form"){
      $("login-err").hidden = true;
      const r = await session.login(f.email.value.trim(), f.password.value);
      if (r.ok){ f.reset(); enter(r.user); }
      else { $("login-err").textContent = r.error === "offline" ? a().err.offline : a().badLogin; $("login-err").hidden = false; }
    }
    if (f.id === "program-form") saveProgram(f);
    if (f.id === "user-form") saveUser(f);
    if (f.id === "password-form"){
      const r = await session.authed("changePassword", {current: f.current.value, next: f.next.value});
      if (r.ok){ f.reset(); toast(a().pwChanged); } else toast(r.error === "auth" ? a().pwWrong : (a().err[r.error] || a().err.server));
    }
  });

  // back-to-top arrow: appears once the page is scrolled down
  const toTop = $("to-top");
  const showTop = () => toTop.classList.toggle("show", scrollY > 500);
  addEventListener("scroll", showTop, {passive: true}); showTop();
  toTop.addEventListener("click", () => scrollTo({top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"}));

  // ---------- start ----------
  $("demo-note").hidden = !window.ICS.DEMO;
  applyLang();
  session.check().then(u => { if (u) enter(u); else { $("login-view").hidden = false; } });
})();
