/* ============================================================
   UI state
   ============================================================ */
const STATE = {
  view: "dashboard",
  branch: "all",
  role: "admin",
  navOpen: false,
  leadFilter: "all",
  leadSearch: "",
  memberSearch: "",
  reportRange: "30",
};

const ROLE_VIEWS = {
  admin:        null, // sees everything
  manager:      ["dashboard","leads","trials","members","memberships","payments","classes","attendance","comms","reports"],
  receptionist: ["dashboard","leads","trials","members","classes","attendance","comms"],
  coach:        ["dashboard","trials","classes","attendance","pt","mma"],
  accountant:   ["dashboard","memberships","payments","reports"],
};

function visibleViews(){
  const allowed = ROLE_VIEWS[STATE.role];
  return allowed;
}
function canSee(viewKey){
  const allowed = visibleViews();
  return !allowed || allowed.includes(viewKey);
}

/* ============================================================
   Small UI helpers
   ============================================================ */
function toast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(()=>t.classList.remove("show"), 2200);
}
function openModal({title, bodyHTML, footHTML, onMount}){
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalBody").innerHTML = bodyHTML;
  document.getElementById("modalFoot").innerHTML = footHTML || "";
  document.getElementById("overlay").hidden = false;
  if(onMount) onMount();
}
function closeModal(){
  document.getElementById("overlay").hidden = true;
  document.getElementById("modalBody").innerHTML = "";
  document.getElementById("modalFoot").innerHTML = "";
}
document.getElementById("modalClose").addEventListener("click", closeModal);
document.getElementById("overlay").addEventListener("click", (e)=>{ if(e.target.id==="overlay") closeModal(); });
document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") closeModal(); });

function pill(text, tone){
  return `<span class="pill ${tone||'neutral'}"><span class="dot" style="background:currentColor"></span>${esc(text)}</span>`;
}
function branchTag(key){
  const b = branch(key); if(!b) return "—";
  return `<span class="branch-tag"><span class="dot" style="background:${b.color}"></span>${b.name}</span>`;
}
function avatarSm(name){ return `<div class="avatar-sm">${esc(initials(name))}</div>`; }

function fieldHTML(f, val){
  val = val==null? "": val;
  const id = "f_"+f.key;
  if(f.type==="select"){
    const opts = f.options.map(o=>{
      const ov = typeof o==="object"? o.value : o;
      const ol = typeof o==="object"? o.label : o;
      return `<option value="${esc(ov)}" ${String(ov)===String(val)?"selected":""}>${esc(ol)}</option>`;
    }).join("");
    return `<div class="field ${f.full?'full':''}"><label for="${id}">${esc(f.label)}</label><select id="${id}" name="${f.key}" ${f.required?"required":""}>${opts}</select>${f.hint?`<div class="hint">${esc(f.hint)}</div>`:""}</div>`;
  }
  if(f.type==="textarea"){
    return `<div class="field full"><label for="${id}">${esc(f.label)}</label><textarea id="${id}" name="${f.key}" ${f.required?"required":""}>${esc(val)}</textarea>${f.hint?`<div class="hint">${esc(f.hint)}</div>`:""}</div>`;
  }
  if(f.type==="checkbox"){
    return `<div class="field ${f.full?'full':''}"><div class="checkfield"><input type="checkbox" id="${id}" name="${f.key}" ${val?"checked":""}/><label for="${id}" style="margin:0">${esc(f.label)}</label></div></div>`;
  }
  return `<div class="field ${f.full?'full':''}"><label for="${id}">${esc(f.label)}</label><input type="${f.type||'text'}" id="${id}" name="${f.key}" value="${esc(val)}" ${f.required?"required":""} ${f.step?`step="${f.step}"`:""}/>${f.hint?`<div class="hint">${esc(f.hint)}</div>`:""}</div>`;
}
function openForm({title, fields, initial, submitLabel, onSubmit}){
  initial = initial || {};
  const body = `<form id="genForm"><div class="form-grid">${fields.map(f=>fieldHTML(f, initial[f.key])).join("")}</div></form>`;
  const foot = `<button class="btn ghost" id="genCancel" type="button">Cancel</button><button class="btn primary" id="genSubmit" type="submit" form="genForm">${esc(submitLabel||"Save")}</button>`;
  openModal({ title, bodyHTML: body, footHTML: foot, onMount(){
    document.getElementById("genCancel").addEventListener("click", closeModal);
    document.getElementById("genForm").addEventListener("submit", (e)=>{
      e.preventDefault();
      const out = {};
      fields.forEach(f=>{
        const el = document.getElementById("f_"+f.key);
        if(f.type==="checkbox") out[f.key] = el.checked;
        else if(f.type==="number") out[f.key] = el.value===""? null : Number(el.value);
        else out[f.key] = el.value;
      });
      onSubmit(out);
      closeModal();
    });
  }});
}

/* ============================================================
   Navigation
   ============================================================ */
function icon(name){
  const P = {
    dashboard:'<rect x="1.5" y="1.5" width="6" height="6" rx="1.3"/><rect x="9.5" y="1.5" width="6" height="9" rx="1.3"/><rect x="1.5" y="9.5" width="6" height="6" rx="1.3"/><rect x="9.5" y="12.5" width="6" height="3" rx="1.3"/>',
    leads:'<circle cx="6" cy="5.5" r="3"/><path d="M1 15c0-3 2.2-5 5-5s5 2 5 5"/><path d="M13 3l1.6 1.6L11 8.2"/>',
    trials:'<circle cx="8" cy="8" r="6.3"/><path d="M8 4.5V8l2.6 1.6"/>',
    members:'<circle cx="8" cy="5.5" r="3"/><path d="M2 15c0-3.3 2.7-6 6-6s6 2.7 6 6"/>',
    memberships:'<rect x="1.5" y="3.5" width="13" height="9" rx="1.6"/><path d="M1.5 6.7h13"/><path d="M4 10h3"/>',
    payments:'<circle cx="8" cy="8" r="6.3"/><path d="M8 4.5v7M6 10.2c0 1 .9 1.3 2 1.3 1.4 0 2-.6 2-1.4 0-1.9-4-1-4-2.9 0-.8.7-1.4 2-1.4 1 0 1.7.3 2 1"/>',
    classes:'<rect x="1.5" y="2.5" width="13" height="12" rx="1.6"/><path d="M1.5 6h13"/><path d="M4.3 1v3M11.7 1v3"/>',
    attendance:'<rect x="1.5" y="2.5" width="13" height="12" rx="1.6"/><path d="M4.6 8.3l2 2 4-4.4"/>',
    staff:'<circle cx="5.5" cy="5" r="2.4"/><circle cx="11.5" cy="6.5" r="2"/><path d="M1.2 15c0-2.7 2-4.7 4.5-4.7 1.4 0 2.7.6 3.5 1.6M9 11.4c.6-.5 1.4-.8 2.3-.8 2.1 0 3.7 1.7 3.7 4.4"/>',
    pt:'<path d="M2 8h1.6M12.4 8H14M4 8a1.6 1.6 0 013.2 0 1.6 1.6 0 003.2 0"/><path d="M4.6 5.5v5M11.4 5.5v5"/>',
    mma:'<path d="M4 6.5V5a2 2 0 014 0v1.5M4 6.5h4M4 6.5a2 2 0 00-2 2v1a2 2 0 002 2h.3M8 6.5a2 2 0 012 2v1a2.6 2.6 0 01-2.6 2.6H6"/>',
    comms:'<path d="M2 3.5h12v8H6.5L3 14.5v-3H2z"/>',
    reports:'<path d="M2 14h12"/><rect x="3" y="8" width="2.4" height="6"/><rect x="6.8" y="4.5" width="2.4" height="9.5"/><rect x="10.6" y="6.5" width="2.4" height="7.5"/>',
    admin:'<path d="M8 1.7l5.6 2v3.7c0 3.7-2.3 6.7-5.6 7.9-3.3-1.2-5.6-4.2-5.6-7.9V3.7L8 1.7z"/>',
  };
  return `<svg class="ic" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">${P[name]||""}</svg>`;
}

const NAV = [
  { section:"navGrow",    items:[
    {key:"dashboard",   label:"Dashboard"},
    {key:"leads",        label:"Leads & Enquiries"},
    {key:"trials",       label:"Free Trials"},
  ]},
  { section:"navMembers", items:[
    {key:"members",      label:"Member Profiles"},
    {key:"memberships",  label:"Memberships"},
    {key:"payments",     label:"Payments"},
  ]},
  { section:"navOperate", items:[
    {key:"classes",      label:"Class Scheduling"},
    {key:"attendance",   label:"Attendance"},
    {key:"staff",        label:"Coaches & Staff"},
    {key:"pt",           label:"Personal Training"},
    {key:"mma",          label:"MMA Athletes"},
  ]},
  { section:"navComms",   items:[
    {key:"comms",        label:"Follow-ups & Templates"},
  ]},
  { section:"navInsight", items:[
    {key:"reports",      label:"Reports"},
    {key:"admin",        label:"Admin & Permissions"},
  ]},
];
const VIEW_TITLES = Object.fromEntries(NAV.flatMap(s=>s.items).map(i=>[i.key,i.label]));
const VIEW_DESC = {
  dashboard:"Today across your branches, at a glance.",
  leads:"New enquiries moving through the pipeline: New enquiry → Contacted → Trial booked → Trial attended → Interested → Payment pending → Member active → Renewal due → Renewed / Lost.",
  trials:"Free trial bookings, coach assignment, attendance and conversion outcome.",
  members:"Full member profiles: contact, emergency contact, medical declarations, goals and notes.",
  memberships:"Plans, cycles, freezes, upgrades, branch transfers and renewal status.",
  payments:"Invoices, part-payments, discounts, receipts, dues and refunds.",
  classes:"Weekly timetable by branch, program and coach, with capacity and waitlists.",
  attendance:"Check-ins, no-shows and late arrivals, by branch and by day.",
  staff:"Coach and staff profiles, specialties, availability and assigned members.",
  pt:"Personal training packages, session balances and progress notes.",
  mma:"Fighter profiles: skill level, weight category, medical clearance and competition record.",
  comms:"Message templates and the follow-up tasks they drive.",
  reports:"Conversion, revenue, dues, attendance, churn and utilisation.",
  admin:"Roles and what each one can see across the console.",
};

function buildNav(){
  NAV.forEach(sec=>{
    const ul = document.getElementById(sec.section);
    const items = sec.items.filter(i=>canSee(i.key));
    ul.innerHTML = items.map(i=>`
      <li><button class="nav-item ${STATE.view===i.key?'active':''}" data-nav="${i.key}">${icon(i.key)}<span>${i.label}</span></button></li>
    `).join("");
    ul.closest ; // no-op
    document.getElementById(sec.section).parentElement; // no-op guard
    ul.previousElementSibling.style.display = items.length? "" : "none";
  });
}
document.body.addEventListener("click",(e)=>{
  const b = e.target.closest("[data-nav]");
  if(b){ STATE.view = b.dataset.nav; STATE.navOpen=false; document.getElementById("navRail").classList.remove("open"); render(); window.scrollTo(0,0); }
});

/* Branch filter chips */
function buildBranchChips(){
  const row = document.getElementById("branchFilterRow");
  const opts = [{key:"all",name:"All branches",color:"var(--ink-3)"}, ...BRANCHES];
  row.innerHTML = opts.map(b=>`
    <button class="chip ${STATE.branch===b.key?'on':''}" data-branch="${b.key}">
      <span class="dot" style="background:${STATE.branch===b.key? (b.key==='all'?'currentColor':b.color) : b.color}"></span>${b.name}
    </button>`).join("");
}
document.getElementById("branchFilterRow").addEventListener("click",(e)=>{
  const b = e.target.closest("[data-branch]");
  if(b){ STATE.branch = b.dataset.branch; render(); }
});

/* Role select */
const roleSel = document.getElementById("roleSelect");
roleSel.innerHTML = Object.entries(ROLE_LABELS).map(([k,l])=>`<option value="${k}">${l}</option>`).join("");
roleSel.value = STATE.role;
roleSel.addEventListener("change",()=>{
  STATE.role = roleSel.value;
  const allowed = visibleViews();
  if(allowed && !allowed.includes(STATE.view)) STATE.view = allowed[0];
  render();
});

/* Mobile nav toggle */
function updateMobileToggle(){
  document.getElementById("navToggle").style.display = window.innerWidth<=900 ? "flex" : "none";
}
document.getElementById("navToggle").addEventListener("click",()=>{
  document.getElementById("navRail").classList.toggle("open");
});
window.addEventListener("resize", updateMobileToggle);

/* ============================================================
   Router
   ============================================================ */
function updateTopbar(){
  document.getElementById("pageTitle").textContent = VIEW_TITLES[STATE.view] || "";
  document.getElementById("pageToday").textContent = TODAY.toLocaleDateString("en-IN",{weekday:"long", day:"2-digit", month:"long", year:"numeric"}) + " · demo data anchored to this date";
  document.getElementById("whoName").textContent = ROLE_LABELS[STATE.role];
  document.getElementById("whoAvatar").textContent = STATE.role==="admin" ? "FA" : initials(ROLE_LABELS[STATE.role]);
  document.getElementById("whoRole").textContent = STATE.role==="admin" ? "All-branch access" : (branch(STATE.branch)? branch(STATE.branch).name : "Branch-scoped");
}
const RENDERERS = {}; // filled in by each module section below

function render(){
  buildNav();
  buildBranchChips();
  updateTopbar();
  const allowed = visibleViews();
  if(allowed && !allowed.includes(STATE.view)) STATE.view = allowed[0];
  const host = document.getElementById("view");
  const fn = RENDERERS[STATE.view];
  const desc = VIEW_DESC[STATE.view] || "";
  const roleNote = STATE.role!=="admin" ? `<div class="role-banner">${icon("admin")} Viewing as <strong>&nbsp;${ROLE_LABELS[STATE.role]}</strong>&nbsp;— navigation and data are scoped to this role.</div>` : "";
  host.innerHTML = `
    <div class="view-head"><div><h2>${VIEW_TITLES[STATE.view]||""}</h2><div class="desc">${desc}</div></div><div id="viewActions"></div></div>
    ${roleNote}
    <div id="viewBody"></div>
  `;
  if(fn) fn(); else document.getElementById("viewBody").innerHTML = `<div class="empty">This module isn't in the Phase 1 build yet.</div>`;
  updateMobileToggle();
}

/* ============================================================
   Branch stats (used by Dashboard + Reports)
   ============================================================ */
function inBranch(list, key, field){
  field = field || "branch";
  return key==="all" ? list : list.filter(x=>x[field]===key);
}
function memberBranch(memberId){ const m=memberById(memberId); return m? m.branch : null; }
function sameMonth(dateStr, ref){ const x=new Date(dateStr); return x.getFullYear()===ref.getFullYear() && x.getMonth()===ref.getMonth(); }

function computeBranchStats(key){
  const leads = inBranch(DB.LEADS, key);
  const trials = inBranch(DB.TRIALS, key);
  const enquiriesToday = leads.filter(l=>l.createdAt===iso(TODAY)).length;
  const trialsToday = trials.filter(t=>t.date===iso(TODAY)).length;

  const memberIdsInBranch = new Set(DB.MEMBERS.filter(m=> key==="all" || m.branch===key).map(m=>m.id));
  const membershipsInBranch = DB.MEMBERSHIPS.filter(ms=>memberIdsInBranch.has(ms.memberId));
  const conversionsThisMonth = membershipsInBranch.filter(ms=>sameMonth(ms.start, TODAY)).length;

  const activeMemberIds = new Set();
  memberIdsInBranch.forEach(id=>{ const ms=activeMembershipFor(id); if(ms && membershipComputedStatus(ms)!=="Expired") activeMemberIds.add(id); });
  const activeMembers = activeMemberIds.size;

  let expiring7=0, expiring30=0;
  memberIdsInBranch.forEach(id=>{ const ms=activeMembershipFor(id); if(!ms) return; const s=membershipComputedStatus(ms);
    if(s==="Expiring soon") expiring7++; if(s==="Renewal due") expiring30++; });

  const paymentsInBranch = DB.PAYMENTS.filter(p=>memberIdsInBranch.has(p.memberId));
  const overdue = paymentsInBranch.filter(p=> (p.status==="Overdue" || p.status==="Partial") && paymentBalance(p)>0);
  const overdueAmt = overdue.reduce((s,p)=>s+paymentBalance(p),0);

  const attendanceInBranch = DB.ATTENDANCE.filter(a=>memberIdsInBranch.has(a.memberId) && a.date===iso(TODAY));
  const present = attendanceInBranch.filter(a=>a.status==="Present"||a.status==="Late").length;
  const noshow = attendanceInBranch.filter(a=>a.status==="No-show").length;

  const revenueMonth = paymentsInBranch.filter(p=>sameMonth(p.date, TODAY)).reduce((s,p)=>s+(p.paid||0),0);
  const revenueTotal = paymentsInBranch.reduce((s,p)=>s+(p.paid||0),0);

  return { key, enquiriesToday, trialsToday, conversionsThisMonth, activeMembers, expiring7, expiring30,
    overdueCount:overdue.length, overdueAmt, present, noshow, revenueMonth, revenueTotal,
    classesToday: inBranch(CLASSES, key).filter(c=>c.dow.includes(TODAY.getDay())).length };
}

/* ============================================================
   DASHBOARD
   ============================================================ */
RENDERERS.dashboard = function(){
  const s = computeBranchStats(STATE.branch);
  const scopeLabel = STATE.branch==="all" ? "All branches" : branch(STATE.branch).name;

  const tiles = [
    { lbl:"New enquiries today", val:s.enquiriesToday, sub:`${s.trialsToday} trial${s.trialsToday===1?"":"s"} booked today`, tone:"" },
    { lbl:"Trials today", val:s.trialsToday, sub: s.trialsToday? "Scheduled across today's slots" : "None scheduled today", tone:"" },
    { lbl:"Conversions this month", val:s.conversionsThisMonth, sub:`${TODAY.toLocaleDateString("en-IN",{month:"long"})} · new memberships started`, tone:"good" },
    { lbl:"Active members", val:s.activeMembers, sub:`${scopeLabel}`, tone:"" },
    { lbl:"Expiring in 7 days", val:s.expiring7, sub: s.expiring7? "Needs a renewal call now" : "Nothing urgent", tone: s.expiring7? "critical":"good" },
    { lbl:"Expiring in 30 days", val:s.expiring30, sub:"Queue renewal reminders", tone: s.expiring30? "warning":"good" },
    { lbl:"Payment dues", val:fmtMoney(s.overdueAmt), sub:`${s.overdueCount} invoice${s.overdueCount===1?"":"s"} overdue / partial`, tone: s.overdueCount? "critical":"good" },
    { lbl:"Attendance today", val:s.present, sub:`${s.noshow} no-show${s.noshow===1?"":"s"} logged`, tone: s.noshow? "warning":"good" },
  ];
  const stripe = { "":"var(--border-strong)", good:"var(--st-good)", warning:"var(--st-warning-fill)", critical:"var(--st-critical)" };

  const branchRows = BRANCHES.map(b=>computeBranchStats(b.key));
  const totalRow = computeBranchStats("all");
  const maxRev = Math.max(...branchRows.map(r=>r.revenueMonth), 1);

  const openTasks = DB.TASKS.filter(t=>t.status==="Open" && (STATE.branch==="all"||t.branch===STATE.branch))
    .sort((a,b)=> new Date(a.due)-new Date(b.due)).slice(0,6);

  const expiringSoon = DB.MEMBERS.filter(m=> STATE.branch==="all"||m.branch===STATE.branch)
    .map(m=>({m, ms:activeMembershipFor(m.id)}))
    .filter(x=>x.ms && ["Expiring soon","Renewal due"].includes(membershipComputedStatus(x.ms)))
    .sort((a,b)=> new Date(a.ms.end)-new Date(b.ms.end)).slice(0,6);

  document.getElementById("viewBody").innerHTML = `
    <div class="grid cols-4">
      ${tiles.map(t=>`<div class="stat" style="--stripe:${stripe[t.tone]}"><div class="lbl">${t.lbl}</div><div class="val mono">${t.val}</div><div class="sub ${t.tone}">${t.sub}</div></div>`).join("")}
    </div>

    <div class="divider"></div>

    <div class="grid cols-2" style="align-items:start">
      <div class="card">
        <div class="cardhead"><div><h3>Branch performance — this month</h3><div class="desc">Revenue collected, conversions and active members per branch</div></div></div>
        <div class="cardbody">
          <div class="tablewrap"><table class="tbl">
            <thead><tr><th>Branch</th><th class="num">Enquiries</th><th class="num">Trials</th><th class="num">Conversions</th><th class="num">Active</th><th class="num">Dues</th><th class="num">Revenue MTD</th></tr></thead>
            <tbody>
              ${branchRows.map(r=>`<tr>
                <td>${branchTag(r.key)}</td>
                <td class="num">${r.enquiriesToday}</td>
                <td class="num">${r.trialsToday}</td>
                <td class="num">${r.conversionsThisMonth}</td>
                <td class="num">${r.activeMembers}</td>
                <td class="num" style="${r.overdueCount?'color:var(--st-critical)':''}">${fmtMoney(r.overdueAmt)}</td>
                <td class="num" style="font-weight:700">${fmtMoney(r.revenueMonth)}</td>
              </tr>`).join("")}
              <tr style="font-weight:700">
                <td style="white-space:nowrap">All branches</td>
                <td class="num">${totalRow.enquiriesToday}</td>
                <td class="num">${totalRow.trialsToday}</td>
                <td class="num">${totalRow.conversionsThisMonth}</td>
                <td class="num">${totalRow.activeMembers}</td>
                <td class="num" style="${totalRow.overdueCount?'color:var(--st-critical)':''}">${fmtMoney(totalRow.overdueAmt)}</td>
                <td class="num">${fmtMoney(totalRow.revenueMonth)}</td>
              </tr>
            </tbody>
          </table></div>
        </div>
      </div>

      <div class="card">
        <div class="cardhead"><div><h3>Revenue by branch — month to date</h3><div class="desc">${TODAY.toLocaleDateString("en-IN",{month:"long", year:"numeric"})}</div></div></div>
        <div class="cardbody">
          ${branchRows.map(r=>`
            <div class="barh" style="margin-bottom:10px">
              <div style="width:66px;font-size:12px;font-weight:600">${branch(r.key).name}</div>
              <div class="track"><div class="fill" style="width:${Math.max(4,r.revenueMonth/maxRev*100)}%;background:${branch(r.key).color}"></div></div>
              <div class="amt">${fmtMoney(r.revenueMonth)}</div>
            </div>`).join("")}
          <div class="divider"></div>
          <div class="kv"><span class="k">Total revenue (all-time, all branches)</span><span class="v mono">${fmtMoney(totalRow.revenueTotal)}</span></div>
          <div class="kv"><span class="k">Classes running today</span><span class="v mono">${totalRow.classesToday}</span></div>
        </div>
      </div>
    </div>

    <div class="grid cols-2" style="align-items:start;margin-top:14px">
      <div class="card">
        <div class="cardhead"><div><h3>Follow-ups due</h3><div class="desc">Open tasks, earliest due first</div></div><button class="btn sm" data-nav="comms">View all</button></div>
        <div class="cardbody flush">
          ${openTasks.length? `<ul class="hairline-list" style="padding:6px 16px">${openTasks.map(t=>`
            <li style="display:flex;justify-content:space-between;gap:10px;align-items:center">
              <div><div style="font-weight:600;font-size:12.8px">${esc(t.title)}</div><div style="font-size:11px;color:var(--ink-3)">${branch(t.branch).name} · ${esc(staffById(t.assigned).name)}</div></div>
              ${new Date(t.due)<TODAY? pill("Overdue","critical") : (t.due===iso(TODAY)? pill("Today","warning") : pill(fmtDateShort(t.due),"neutral"))}
            </li>`).join("")}</ul>` : `<div class="empty">No open follow-ups for this scope.</div>`}
        </div>
      </div>
      <div class="card">
        <div class="cardhead"><div><h3>Memberships expiring soon</h3><div class="desc">Next renewal calls to make</div></div><button class="btn sm" data-nav="memberships">View all</button></div>
        <div class="cardbody flush">
          ${expiringSoon.length? `<ul class="hairline-list" style="padding:6px 16px">${expiringSoon.map(x=>`
            <li style="display:flex;justify-content:space-between;gap:10px;align-items:center">
              <div class="name-cell">${avatarSm(x.m.name)}<div><div class="nm" style="font-size:12.8px">${esc(x.m.name)}</div><div class="sm">${branch(x.m.branch).name} · ${planById(x.ms.planId).name}</div></div></div>
              ${pill(fmtDateShort(x.ms.end), statusToneForMembership(membershipComputedStatus(x.ms)))}
            </li>`).join("")}</ul>` : `<div class="empty">Nothing expiring in the next 30 days.</div>`}
        </div>
      </div>
    </div>
  `;
};

/* ============================================================
   Generic action dispatcher — modules register into ACTIONS
   ============================================================ */
const ACTIONS = {};
document.body.addEventListener("click",(e)=>{
  const el = e.target.closest("[data-action]");
  if(el){ const act=el.dataset.action; const fn=ACTIONS[act]; if(fn) fn(el.dataset.id, el); }
});

/* ============================================================
   LEADS & ENQUIRIES
   ============================================================ */
function leadFields(l){
  return [
    { key:"name", label:"Full name", required:true },
    { key:"phone", label:"Mobile / WhatsApp", type:"tel", required:true },
    { key:"source", label:"Lead source", type:"select", options:SOURCES, required:true },
    { key:"branch", label:"Preferred center", type:"select", options:BRANCHES.map(b=>({value:b.key,label:b.name})), required:true },
    { key:"program", label:"Interested program", type:"select", options:PROGRAMS, required:true },
    { key:"goal", label:"Goal", type:"select", options:GOALS, required:true },
    { key:"budget", label:"Budget (₹)", type:"number" },
    { key:"assigned", label:"Assigned branch manager", type:"select", options:STAFF.filter(s=>s.role==="manager"||s.role==="admin").map(s=>({value:s.id,label:s.name})), required:true },
    { key:"status", label:"Pipeline status", type:"select", options:PIPELINE, required:true },
    { key:"followUpDate", label:"Follow-up date", type:"date" },
    { key:"notes", label:"Follow-up notes", type:"textarea" },
  ];
}
ACTIONS.addLead = function(){
  openForm({ title:"Add lead / enquiry", fields:leadFields(), initial:{status:"New enquiry", followUpDate:iso(TODAY)}, submitLabel:"Add lead",
    onSubmit(v){ DB.LEADS.unshift({ id:uid("L"), createdAt:iso(TODAY), ...v }); saveDB(); toast("Lead added"); render(); } });
};
ACTIONS.editLead = function(id){
  const l = leadById(id); if(!l) return;
  openForm({ title:`Edit lead — ${l.name}`, fields:leadFields(l), initial:l, submitLabel:"Save changes",
    onSubmit(v){ Object.assign(l, v); saveDB(); toast("Lead updated"); render(); } });
};
ACTIONS.advanceLead = function(id){
  const l = leadById(id); if(!l) return;
  const i = PIPELINE.indexOf(l.status);
  if(i>=0 && i<PIPELINE.length-2){ l.status = PIPELINE[i+1]; saveDB(); toast(`${l.name} moved to “${l.status}”`); render(); }
};
ACTIONS.loseLead = function(id){
  const l = leadById(id); if(!l) return;
  l.status = "Lost"; saveDB(); toast(`${l.name} marked Lost`); render();
};

RENDERERS.leads = function(){
  document.getElementById("viewActions").innerHTML = `<button class="btn primary" data-action="addLead">+ Add lead</button>`;

  let rows = inBranch(DB.LEADS, STATE.branch);
  if(STATE.leadFilter!=="all") rows = rows.filter(l=>l.status===STATE.leadFilter);
  if(STATE.leadSearch) rows = rows.filter(l=> (l.name+l.phone).toLowerCase().includes(STATE.leadSearch.toLowerCase()));
  rows = rows.slice().sort((a,b)=> new Date(b.createdAt)-new Date(a.createdAt));

  const counts = {}; PIPELINE.forEach(p=>counts[p]=0);
  inBranch(DB.LEADS, STATE.branch).forEach(l=>counts[l.status]=(counts[l.status]||0)+1);

  const toneForStatus = s=>({
    "New enquiry":"neutral","Contacted":"neutral","Trial booked":"brand","Trial attended":"brand",
    "Interested":"warning","Payment pending":"serious","Member active":"good","Renewal due":"warning","Renewed":"good","Lost":"critical"
  }[s]||"neutral");

  document.getElementById("viewBody").innerHTML = `
    <div class="pipe" style="margin-bottom:14px">
      <button class="seg ${STATE.leadFilter==='all'?'on':''}" data-action="leadFilter" data-id="all">All (${inBranch(DB.LEADS,STATE.branch).length})</button>
      ${PIPELINE.map(p=>`<button class="seg ${STATE.leadFilter===p?'on':''}" data-action="leadFilter" data-id="${p}">${p} (${counts[p]||0})</button>`).join("")}
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px">
      <div class="searchbox">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="7" cy="7" r="5"/><path d="M11 11l3.5 3.5"/></svg>
        <input id="leadSearchInput" placeholder="Search name or phone…" value="${esc(STATE.leadSearch)}"/>
      </div>
      <div class="eyebrow">${rows.length} lead${rows.length===1?"":"s"}</div>
    </div>
    <div class="card"><div class="cardbody flush"><div class="tablewrap"><table class="tbl">
      <thead><tr><th>Lead</th><th>Center</th><th>Program / goal</th><th>Source</th><th class="num">Budget</th><th>Assigned</th><th>Follow-up</th><th>Status</th><th></th></tr></thead>
      <tbody>
        ${rows.map(l=>`<tr>
          <td class="name-cell">${avatarSm(l.name)}<div><div class="nm">${esc(l.name)}</div><div class="sm mono">${esc(l.phone)}</div></div></td>
          <td>${branchTag(l.branch)}</td>
          <td>${esc(l.program)}<div class="sm" style="color:var(--ink-3)">${esc(l.goal)}</div></td>
          <td>${pill(l.source,"neutral")}</td>
          <td class="num">${fmtMoney(l.budget)}</td>
          <td>${esc(staffById(l.assigned)?.name||"—")}</td>
          <td>${fmtDateShort(l.followUpDate)}${l.notes?`<div class="sm" style="color:var(--ink-3);max-width:160px;white-space:normal">${esc(l.notes)}</div>`:""}</td>
          <td>${pill(l.status, toneForStatus(l.status))}</td>
          <td><div class="rowactions">
            ${!["Member active","Renewed","Lost"].includes(l.status)?`<button class="btn sm" data-action="advanceLead" data-id="${l.id}" title="Move to next stage">Advance →</button>`:""}
            <button class="btn sm ghost" data-action="editLead" data-id="${l.id}">Edit</button>
          </div></td>
        </tr>`).join("") || `<tr><td colspan="9"><div class="empty">No leads match this filter.</div></td></tr>`}
      </tbody>
    </table></div></div></div>
  `;
  document.getElementById("leadSearchInput").addEventListener("input",(e)=>{ STATE.leadSearch=e.target.value; RENDERERS.leads(); });
};
ACTIONS.leadFilter = function(id){ STATE.leadFilter = id; RENDERERS.leads(); };

/* ============================================================
   FREE TRIALS
   ============================================================ */
const TRIAL_ATT = ["Pending","Attended","No-show"];
const TRIAL_OUT = ["Pending","Converting","Converted","Lost"];

function trialAddFields(){
  return [
    { key:"name", label:"Full name", required:true },
    { key:"phone", label:"Mobile / WhatsApp number", type:"tel", required:true },
    { key:"branch", label:"Preferred center", type:"select", options:BRANCHES.map(b=>({value:b.key,label:b.name})), required:true },
    { key:"program", label:"Interested program", type:"select", options:PROGRAMS, required:true },
    { key:"goal", label:"Goal", type:"select", options:GOALS, required:true },
    { key:"date", label:"Preferred trial date", type:"date", required:true },
    { key:"time", label:"Preferred trial time", type:"time", required:true },
    { key:"source", label:"Lead source", type:"select", options:SOURCES, required:true },
    { key:"assigned", label:"Assigned branch manager", type:"select", options:STAFF.filter(s=>s.role==="manager"||s.role==="admin").map(s=>({value:s.id,label:s.name})), required:true },
    { key:"followUpDate", label:"Follow-up date", type:"date" },
    { key:"notes", label:"Follow-up notes", type:"textarea", full:true },
  ];
}
function trialEditFields(t){
  return [
    { key:"branch", label:"Center", type:"select", options:BRANCHES.map(b=>({value:b.key,label:b.name})), required:true },
    { key:"program", label:"Program", type:"select", options:PROGRAMS, required:true },
    { key:"date", label:"Trial date", type:"date", required:true },
    { key:"time", label:"Trial time", type:"time", required:true },
    { key:"coach", label:"Coach assigned", type:"select", options:coaches(t.branch).map(c=>({value:c.id,label:c.name})), required:true },
    { key:"attendance", label:"Attendance", type:"select", options:TRIAL_ATT, required:true },
    { key:"outcome", label:"Conversion outcome", type:"select", options:TRIAL_OUT, required:true },
    { key:"followUpDate", label:"Follow-up reminder", type:"date" },
    { key:"feedback", label:"Coach feedback", type:"textarea", full:true },
  ];
}
ACTIONS.addTrial = function(){
  openForm({ title:"Schedule a free trial", fields:trialAddFields(), initial:{date:iso(TODAY), followUpDate:iso(TODAY)}, submitLabel:"Schedule trial",
    onSubmit(v){
      const leadId = uid("L");
      DB.LEADS.unshift({ id:leadId, name:v.name, phone:v.phone, source:v.source, branch:v.branch, program:v.program, goal:v.goal,
        budget:null, assigned:v.assigned, status:"Trial booked", createdAt:iso(TODAY), followUpDate:v.followUpDate, notes:v.notes });
      const c = coaches(v.branch)[0];
      DB.TRIALS.unshift({ id:uid("T"), leadId, name:v.name, branch:v.branch, program:v.program, coach:c?c.id:"", date:v.date, time:v.time,
        attendance:"Pending", feedback:"", outcome:"Pending", followUpDate:v.followUpDate });
      saveDB(); toast("Trial scheduled"); render();
    } });
};
ACTIONS.editTrial = function(id){
  const t = DB.TRIALS.find(x=>x.id===id); if(!t) return;
  openForm({ title:`Trial — ${t.name}`, fields:trialEditFields(t), initial:t, submitLabel:"Save",
    onSubmit(v){
      Object.assign(t, v);
      const lead = leadById(t.leadId);
      if(lead){
        if(v.attendance==="Attended" && lead.status==="Trial booked") lead.status="Trial attended";
        if(v.outcome==="Converting") lead.status="Interested";
        if(v.outcome==="Converted") lead.status="Member active";
        if(v.outcome==="Lost") lead.status="Lost";
      }
      saveDB(); toast("Trial updated"); render();
    } });
};

RENDERERS.trials = function(){
  document.getElementById("viewActions").innerHTML = `<button class="btn primary" data-action="addTrial">+ Schedule trial</button>`;
  let rows = inBranch(DB.TRIALS, STATE.branch).slice().sort((a,b)=> new Date(a.date+"T"+(a.time||"00:00")) - new Date(b.date+"T"+(b.time||"00:00")));
  const todays = rows.filter(t=>t.date===iso(TODAY));
  const upcoming = rows.filter(t=>t.date>iso(TODAY));
  const past = rows.filter(t=>t.date<iso(TODAY));

  const outTone = o=>({"Pending":"neutral","Converting":"warning","Converted":"good","Lost":"critical"}[o]);
  const attTone = a=>({"Pending":"neutral","Attended":"good","No-show":"critical"}[a]);

  function tbl(list, title, emptyMsg){
    return `<div class="card" style="margin-bottom:14px"><div class="cardhead"><div><h3>${title}</h3></div><div class="eyebrow">${list.length}</div></div>
      <div class="cardbody flush"><div class="tablewrap"><table class="tbl">
      <thead><tr><th>Lead</th><th>Center</th><th>Program</th><th>When</th><th>Coach</th><th>Attendance</th><th>Outcome</th><th></th></tr></thead>
      <tbody>${list.map(t=>`<tr>
        <td class="name-cell">${avatarSm(t.name)}<div class="nm">${esc(t.name)}</div></td>
        <td>${branchTag(t.branch)}</td>
        <td>${esc(t.program)}</td>
        <td class="mono">${fmtDateShort(t.date)} · ${fmtTime(t.time)}</td>
        <td>${esc(staffById(t.coach)?.name||"—")}</td>
        <td>${pill(t.attendance, attTone(t.attendance))}</td>
        <td>${pill(t.outcome, outTone(t.outcome))}</td>
        <td><button class="btn sm ghost" data-action="editTrial" data-id="${t.id}">Update</button></td>
      </tr>`).join("") || `<tr><td colspan="8"><div class="empty">${emptyMsg}</div></td></tr>`}</tbody>
      </table></div></div></div>`;
  }
  document.getElementById("viewBody").innerHTML = tbl(todays,"Today's trials","No trials booked today for this scope.")
    + tbl(upcoming,"Upcoming trials","Nothing booked ahead yet.")
    + tbl(past,"Past trials","No trial history for this scope.");
};

/* ============================================================
   MEMBER PROFILES
   ============================================================ */
function memberFields(){
  return [
    { key:"name", label:"Full name", required:true },
    { key:"phone", label:"Mobile / WhatsApp", type:"tel", required:true },
    { key:"email", label:"Email" },
    { key:"dob", label:"Date of birth", type:"date" },
    { key:"branch", label:"Preferred branch", type:"select", options:BRANCHES.map(b=>({value:b.key,label:b.name})), required:true },
    { key:"program", label:"Preferred program", type:"select", options:PROGRAMS, required:true },
    { key:"goal", label:"Fitness goal", type:"select", options:GOALS },
    { key:"emergencyName", label:"Emergency contact name", required:true },
    { key:"emergencyPhone", label:"Emergency contact phone", type:"tel", required:true },
    { key:"medical", label:"Medical / injury declaration", type:"textarea", full:true, hint:"Any conditions coaches should know about. Write “None declared” if not applicable." },
    { key:"notes", label:"Notes", type:"textarea", full:true },
  ];
}
ACTIONS.addMember = function(){
  openForm({ title:"Add member profile", fields:memberFields(), initial:{medical:"None declared"}, submitLabel:"Add member",
    onSubmit(v){ DB.MEMBERS.unshift({ id:uid("M"), ...v }); saveDB(); toast("Member profile created"); render(); } });
};
ACTIONS.editMember = function(id){
  const m = memberById(id); if(!m) return;
  openForm({ title:`Edit — ${m.name}`, fields:memberFields(), initial:m, submitLabel:"Save changes",
    onSubmit(v){ Object.assign(m, v); saveDB(); toast("Profile updated"); render(); } });
};
ACTIONS.viewMember = function(id){
  const m = memberById(id); if(!m) return;
  const ms = activeMembershipFor(id);
  const pays = DB.PAYMENTS.filter(p=>p.memberId===id);
  const att = DB.ATTENDANCE.filter(a=>a.memberId===id).slice(-6).reverse();
  const body = `
    <div style="display:flex;gap:14px;align-items:center;margin-bottom:14px">
      <div class="avatar-sm" style="width:52px;height:52px;font-size:16px">${esc(initials(m.name))}</div>
      <div>
        <div style="font-weight:700;font-size:16px">${esc(m.name)}</div>
        <div class="sm" style="color:var(--ink-3)">${branchTag(m.branch)} · ${esc(m.program)}${m.goal?` · ${esc(m.goal)}`:""}</div>
      </div>
    </div>
    <div class="grid cols-2">
      <div>
        <div class="eyebrow" style="margin-bottom:6px">Contact</div>
        <div class="kv"><span class="k">Mobile</span><span class="v mono">${esc(m.phone)}</span></div>
        <div class="kv"><span class="k">Email</span><span class="v">${esc(m.email||"—")}</span></div>
        <div class="kv"><span class="k">Date of birth</span><span class="v">${fmtDate(m.dob)}</span></div>
        <div class="eyebrow" style="margin:12px 0 6px">Emergency contact</div>
        <div class="kv"><span class="k">${esc(m.emergencyName||"—")}</span><span class="v mono">${esc(m.emergencyPhone||"—")}</span></div>
        <div class="eyebrow" style="margin:12px 0 6px">Medical / injury declaration</div>
        <div style="font-size:12.5px;color:var(--ink-2)">${esc(m.medical||"None declared")}</div>
      </div>
      <div>
        <div class="eyebrow" style="margin-bottom:6px">Membership</div>
        ${ms? `<div class="kv"><span class="k">Plan</span><span class="v">${esc(planById(ms.planId).name)}</span></div>
               <div class="kv"><span class="k">Status</span><span class="v">${pill(membershipComputedStatus(ms), statusToneForMembership(membershipComputedStatus(ms)))}</span></div>
               <div class="kv"><span class="k">Valid till</span><span class="v">${fmtDate(ms.end)}</span></div>`
           : `<div class="empty" style="padding:10px 0">No membership on file</div>`}
        <div class="eyebrow" style="margin:12px 0 6px">Recent attendance</div>
        ${att.length? att.map(a=>`<div class="kv"><span class="k">${fmtDateShort(a.date)} · ${esc(classById(a.classId)?.name||"")}</span><span class="v">${pill(a.status, a.status==="Present"?"good":a.status==="Late"?"warning":"critical")}</span></div>`).join("")
          : `<div class="empty" style="padding:10px 0">No attendance logged yet</div>`}
        <div class="eyebrow" style="margin:12px 0 6px">Documents on file</div>
        <div class="taglist">${pill("ID proof ✓","neutral")}${pill("Waiver signed ✓","neutral")}${pill("Medical form" + (m.medical&&m.medical!=="None declared"? " ✓":" –"),"neutral")}</div>
        ${m.notes? `<div class="eyebrow" style="margin:12px 0 6px">Notes</div><div style="font-size:12.5px;color:var(--ink-2)">${esc(m.notes)}</div>`:""}
      </div>
    </div>`;
  openModal({ title:"Member profile", bodyHTML:body, footHTML:`<button class="btn ghost" id="mvClose" type="button">Close</button><button class="btn primary" data-action="editMember" data-id="${m.id}" type="button">Edit profile</button>`,
    onMount(){ document.getElementById("mvClose").addEventListener("click", closeModal); } });
};

RENDERERS.members = function(){
  document.getElementById("viewActions").innerHTML = `<button class="btn primary" data-action="addMember">+ Add member</button>`;
  let rows = inBranch(DB.MEMBERS, STATE.branch);
  if(STATE.memberSearch) rows = rows.filter(m=>(m.name+m.phone).toLowerCase().includes(STATE.memberSearch.toLowerCase()));
  rows = rows.slice().sort((a,b)=>a.name.localeCompare(b.name));

  document.getElementById("viewBody").innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;flex-wrap:wrap;gap:8px">
      <div class="searchbox">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="7" cy="7" r="5"/><path d="M11 11l3.5 3.5"/></svg>
        <input id="memberSearchInput" placeholder="Search name or phone…" value="${esc(STATE.memberSearch)}"/>
      </div>
      <div class="eyebrow">${rows.length} member${rows.length===1?"":"s"}</div>
    </div>
    <div class="card"><div class="cardbody flush"><div class="tablewrap"><table class="tbl">
      <thead><tr><th>Member</th><th>Branch</th><th>Program / goal</th><th>Emergency contact</th><th>Medical flag</th><th>Membership</th><th></th></tr></thead>
      <tbody>${rows.map(m=>{
        const ms = activeMembershipFor(m.id); const st = ms? membershipComputedStatus(ms) : "—";
        return `<tr>
          <td class="name-cell">${avatarSm(m.name)}<div><div class="nm">${esc(m.name)}</div><div class="sm mono">${esc(m.phone)}</div></div></td>
          <td>${branchTag(m.branch)}</td>
          <td>${esc(m.program)}<div class="sm" style="color:var(--ink-3)">${esc(m.goal||"")}</div></td>
          <td>${esc(m.emergencyName||"—")}<div class="sm mono" style="color:var(--ink-3)">${esc(m.emergencyPhone||"")}</div></td>
          <td>${m.medical && m.medical!=="None declared" ? pill("Flagged","warning") : pill("None","neutral")}</td>
          <td>${ms? pill(st, statusToneForMembership(st)) : pill("No plan","neutral")}</td>
          <td><div class="rowactions"><button class="btn sm ghost" data-action="viewMember" data-id="${m.id}">View</button></div></td>
        </tr>`;
      }).join("") || `<tr><td colspan="7"><div class="empty">No members match this filter.</div></td></tr>`}</tbody>
    </table></div></div></div>
  `;
  document.getElementById("memberSearchInput").addEventListener("input",(e)=>{ STATE.memberSearch=e.target.value; RENDERERS.members(); });
};

/* ============================================================
   MEMBERSHIPS
   ============================================================ */
function membershipFields(ms){
  return [
    { key:"planId", label:"Plan", type:"select", options:PLANS.map(p=>({value:p.id,label:`${p.name} — ${fmtMoney(p.price)}`})), required:true },
    { key:"start", label:"Start date", type:"date", required:true },
    { key:"end", label:"End date", type:"date", required:true },
    { key:"freezeDays", label:"Freeze days used", type:"number" },
    { key:"status", label:"Status override", type:"select", options:["Active","Frozen"], hint:"Leave as Active — expiry/renewal badges are computed automatically." },
    { key:"transferredFrom", label:"Transferred from branch", type:"select", options:[{value:"",label:"— not transferred —"}, ...BRANCHES.map(b=>({value:b.key,label:b.name}))] },
  ];
}
ACTIONS.editMembership = function(id){
  const ms = membershipById(id); if(!ms) return;
  const mm = memberById(ms.memberId);
  openForm({ title:`Membership — ${mm.name}`, fields:membershipFields(ms), initial:ms, submitLabel:"Save",
    onSubmit(v){ Object.assign(ms, v); saveDB(); toast("Membership updated"); render(); } });
};
ACTIONS.freezeMembership = function(id){
  const ms = membershipById(id); if(!ms) return;
  ms.status = "Frozen"; saveDB(); toast("Membership frozen"); render();
};
ACTIONS.unfreezeMembership = function(id){
  const ms = membershipById(id); if(!ms) return;
  ms.status = "Active"; saveDB(); toast("Membership unfrozen"); render();
};
ACTIONS.renewMembership = function(id){
  const ms = membershipById(id); if(!ms) return;
  const plan = planById(ms.planId);
  const newStart = iso(TODAY);
  const newEnd = iso(new Date(TODAY.getTime()+plan.months*30*DAY));
  DB.MEMBERSHIPS.unshift({ id:uid("MS"), memberId:ms.memberId, planId:ms.planId, start:newStart, end:newEnd, status:"Active", freezeDays:0, transferredFrom:null, upgradeFrom:null });
  DB.PAYMENTS.unshift({ id:uid("INV"), memberId:ms.memberId, membershipId:ms.id, amount:plan.price, paid:0, mode:"—", discount:0, gstin:"", date:newStart, dueDate:newStart, status:"Overdue", receipt:"", refund:0, notes:"Renewal invoice — awaiting payment." });
  saveDB(); toast("Membership renewed — new invoice raised"); render();
};

RENDERERS.memberships = function(){
  let rows = DB.MEMBERSHIPS.map(ms=>({ms, mm:memberById(ms.memberId)})).filter(x=>x.mm && (STATE.branch==="all"||x.mm.branch===STATE.branch));
  rows.sort((a,b)=> new Date(a.ms.end)-new Date(b.ms.end));
  document.getElementById("viewBody").innerHTML = `
    <div class="card"><div class="cardbody flush"><div class="tablewrap"><table class="tbl">
      <thead><tr><th>Member</th><th>Branch</th><th>Plan</th><th>Start</th><th>End</th><th>Freeze / transfer</th><th>Status</th><th></th></tr></thead>
      <tbody>${rows.map(({ms,mm})=>{
        const st = membershipComputedStatus(ms); const plan = planById(ms.planId);
        return `<tr>
          <td class="name-cell">${avatarSm(mm.name)}<div class="nm">${esc(mm.name)}</div></td>
          <td>${branchTag(mm.branch)}</td>
          <td>${esc(plan.name)}${ms.upgradeFrom?`<div class="sm" style="color:var(--ink-3)">upgraded from ${esc(planById(ms.upgradeFrom).name)}</div>`:""}</td>
          <td class="mono">${fmtDateShort(ms.start)}</td>
          <td class="mono">${fmtDateShort(ms.end)}</td>
          <td>${ms.freezeDays?pill(ms.freezeDays+"d frozen","neutral"):""}${ms.transferredFrom?pill("from "+branch(ms.transferredFrom).name,"neutral"):""}${!ms.freezeDays&&!ms.transferredFrom?"—":""}</td>
          <td>${pill(st, statusToneForMembership(st))}</td>
          <td><div class="rowactions">
            ${st==="Expired"||st==="Renewal due"||st==="Expiring soon"?`<button class="btn sm" data-action="renewMembership" data-id="${ms.id}">Renew</button>`:""}
            ${ms.status==="Frozen"?`<button class="btn sm ghost" data-action="unfreezeMembership" data-id="${ms.id}">Unfreeze</button>`:`<button class="btn sm ghost" data-action="freezeMembership" data-id="${ms.id}">Freeze</button>`}
            <button class="btn sm ghost" data-action="editMembership" data-id="${ms.id}">Edit</button>
          </div></td>
        </tr>`;
      }).join("") || `<tr><td colspan="8"><div class="empty">No memberships for this scope.</div></td></tr>`}</tbody>
    </table></div></div></div>
  `;
};

/* ============================================================
   PAYMENTS
   ============================================================ */
const PAY_MODES = ["Cash","UPI","Card","Bank transfer"];
function invoiceFields(){
  return [
    { key:"memberId", label:"Member", type:"select", options:DB.MEMBERS.map(m=>({value:m.id,label:m.name})), required:true },
    { key:"amount", label:"Invoice amount (₹)", type:"number", required:true },
    { key:"discount", label:"Discount (₹)", type:"number" },
    { key:"dueDate", label:"Due date", type:"date", required:true },
    { key:"gstin", label:"GSTIN (leave blank if not applicable)" },
    { key:"notes", label:"Notes", type:"textarea", full:true },
  ];
}
ACTIONS.addInvoice = function(){
  openForm({ title:"Raise invoice", fields:invoiceFields(), initial:{dueDate:iso(TODAY), discount:0}, submitLabel:"Raise invoice",
    onSubmit(v){ DB.PAYMENTS.unshift({ id:uid("INV"), memberId:v.memberId, membershipId:null, amount:v.amount, paid:0, mode:"—",
      discount:v.discount||0, gstin:v.gstin||"", date:iso(TODAY), dueDate:v.dueDate, status:"Overdue", receipt:"", refund:0, notes:v.notes||"" });
      saveDB(); toast("Invoice raised"); render(); } });
};
ACTIONS.recordPayment = function(id){
  const p = DB.PAYMENTS.find(x=>x.id===id); if(!p) return;
  const bal = paymentBalance(p);
  openForm({ title:"Record payment", fields:[
      { key:"amount", label:`Amount received (balance ${fmtMoney(bal)})`, type:"number", required:true },
      { key:"mode", label:"Payment mode", type:"select", options:PAY_MODES, required:true },
    ], initial:{amount:bal}, submitLabel:"Record payment",
    onSubmit(v){
      p.paid = Math.min(p.amount, (p.paid||0) + Number(v.amount||0));
      p.mode = v.mode;
      p.status = p.paid>=p.amount ? "Paid" : "Partial";
      if(p.status==="Paid" && !p.receipt) p.receipt = "RCPT-" + branch(memberById(p.memberId).branch).name.slice(0,3).toUpperCase() + "-" + p.id.slice(-4);
      saveDB(); toast("Payment recorded"); render();
    } });
};
ACTIONS.refundInvoice = function(id){
  const p = DB.PAYMENTS.find(x=>x.id===id); if(!p) return;
  openForm({ title:"Issue refund", fields:[{ key:"refund", label:"Refund amount (₹)", type:"number", required:true }], initial:{refund:p.refund||0}, submitLabel:"Issue refund",
    onSubmit(v){ p.refund = Number(v.refund||0); p.status="Refund pending"; saveDB(); toast("Refund logged"); render(); } });
};
ACTIONS.viewInvoice = function(id){
  const p = DB.PAYMENTS.find(x=>x.id===id); if(!p) return;
  const mm = memberById(p.memberId);
  const gstBlock = (()=>{
    if(!p.gstin) return `<div class="kv"><span class="k">GST</span><span class="v">Not applicable</span></div>`;
    const taxable = p.amount/1.18; const tax = p.amount-taxable;
    return `
    <div class="kv"><span class="k">GSTIN</span><span class="v mono">${esc(p.gstin)}</span></div>
    <div class="kv"><span class="k">Taxable value</span><span class="v mono">${fmtMoney(taxable)}</span></div>
    <div class="kv"><span class="k">CGST (9%)</span><span class="v mono">${fmtMoney(tax/2)}</span></div>
    <div class="kv"><span class="k">SGST (9%)</span><span class="v mono">${fmtMoney(tax/2)}</span></div>`;
  })();
  const body = `
    <div class="kv"><span class="k">Member</span><span class="v">${esc(mm.name)} · ${branch(mm.branch).name}</span></div>
    <div class="kv"><span class="k">Invoice</span><span class="v mono">${esc(p.id)}</span></div>
    <div class="kv"><span class="k">Amount</span><span class="v mono">${fmtMoney(p.amount)}</span></div>
    <div class="kv"><span class="k">Discount applied</span><span class="v mono">${fmtMoney(p.discount)}</span></div>
    <div class="kv"><span class="k">Paid to date</span><span class="v mono">${fmtMoney(p.paid)}</span></div>
    <div class="kv"><span class="k">Balance</span><span class="v mono" style="${paymentBalance(p)>0?'color:var(--st-critical)':''}">${fmtMoney(paymentBalance(p))}</span></div>
    <div class="kv"><span class="k">Mode</span><span class="v">${esc(p.mode)}</span></div>
    <div class="kv"><span class="k">Due date</span><span class="v">${fmtDate(p.dueDate)}</span></div>
    <div class="kv"><span class="k">Receipt no.</span><span class="v mono">${esc(p.receipt||"— not issued —")}</span></div>
    ${p.refund?`<div class="kv"><span class="k">Refund</span><span class="v mono">${fmtMoney(p.refund)}</span></div>`:""}
    <div class="divider"></div>
    <div class="eyebrow" style="margin-bottom:6px">GST</div>
    ${gstBlock}
    ${p.notes?`<div class="divider"></div><div class="eyebrow" style="margin-bottom:6px">Notes</div><div style="font-size:12.5px;color:var(--ink-2)">${esc(p.notes)}</div>`:""}
  `;
  const foot = `<button class="btn ghost" id="ivClose" type="button">Close</button>
    ${p.status!=="Paid" && p.status!=="Refund pending" ? `<button class="btn" data-action="recordPayment" data-id="${p.id}" type="button">Record payment</button>`:""}
    <button class="btn danger" data-action="refundInvoice" data-id="${p.id}" type="button">Refund</button>`;
  openModal({ title:"Invoice detail", bodyHTML:body, footHTML:foot, onMount(){ document.getElementById("ivClose").addEventListener("click", closeModal); } });
};

RENDERERS.payments = function(){
  document.getElementById("viewActions").innerHTML = `<button class="btn primary" data-action="addInvoice">+ Raise invoice</button>`;
  let rows = DB.PAYMENTS.map(p=>({p, mm:memberById(p.memberId)})).filter(x=>x.mm && (STATE.branch==="all"||x.mm.branch===STATE.branch));
  rows.sort((a,b)=> new Date(b.p.date)-new Date(a.p.date));
  const statusTone = s=>({"Paid":"good","Partial":"warning","Overdue":"critical","Refund pending":"serious"}[s]||"neutral");
  const totalDue = rows.filter(r=>["Overdue","Partial"].includes(r.p.status)).reduce((s,r)=>s+paymentBalance(r.p),0);

  document.getElementById("viewBody").innerHTML = `
    <div class="grid cols-3" style="margin-bottom:14px">
      <div class="stat" style="--stripe:var(--st-critical)"><div class="lbl">Outstanding dues</div><div class="val mono">${fmtMoney(totalDue)}</div><div class="sub critical">${rows.filter(r=>["Overdue","Partial"].includes(r.p.status)).length} invoices need follow-up</div></div>
      <div class="stat"><div class="lbl">Collected — this month</div><div class="val mono">${fmtMoney(rows.filter(r=>sameMonth(r.p.date,TODAY)).reduce((s,r)=>s+r.p.paid,0))}</div><div class="sub">${TODAY.toLocaleDateString("en-IN",{month:"long"})}</div></div>
      <div class="stat"><div class="lbl">Refunds pending</div><div class="val mono">${fmtMoney(rows.filter(r=>r.p.status==="Refund pending").reduce((s,r)=>s+r.p.refund,0))}</div><div class="sub">${rows.filter(r=>r.p.status==="Refund pending").length} case(s)</div></div>
    </div>
    <div class="card"><div class="cardbody flush"><div class="tablewrap"><table class="tbl">
      <thead><tr><th>Member</th><th>Branch</th><th>Invoice</th><th class="num">Amount</th><th class="num">Paid</th><th class="num">Balance</th><th>Mode</th><th>Due</th><th>Status</th><th></th></tr></thead>
      <tbody>${rows.map(({p,mm})=>`<tr>
        <td class="name-cell">${avatarSm(mm.name)}<div class="nm">${esc(mm.name)}</div></td>
        <td>${branchTag(mm.branch)}</td>
        <td class="mono">${esc(p.id)}${p.gstin?` <span title="GST invoice">🧾</span>`:""}</td>
        <td class="num">${fmtMoney(p.amount)}</td>
        <td class="num">${fmtMoney(p.paid)}</td>
        <td class="num" style="${paymentBalance(p)>0?'color:var(--st-critical);font-weight:700':''}">${fmtMoney(paymentBalance(p))}</td>
        <td>${esc(p.mode)}</td>
        <td class="mono">${fmtDateShort(p.dueDate)}</td>
        <td>${pill(p.status, statusTone(p.status))}</td>
        <td><div class="rowactions"><button class="btn sm ghost" data-action="viewInvoice" data-id="${p.id}">View</button></div></td>
      </tr>`).join("") || `<tr><td colspan="10"><div class="empty">No invoices for this scope.</div></td></tr>`}</tbody>
    </table></div></div></div>
  `;
};

/* ============================================================
   CLASS SCHEDULING
   ============================================================ */
function classFields(c){
  return [
    { key:"name", label:"Class name", required:true },
    { key:"branch", label:"Branch", type:"select", options:BRANCHES.map(b=>({value:b.key,label:b.name})), required:true },
    { key:"program", label:"Program", type:"select", options:PROGRAMS, required:true },
    { key:"coach", label:"Coach", type:"select", options:coaches(c?c.branch:STATE.branch!=="all"?STATE.branch:null).map(x=>({value:x.id,label:x.name})), required:true },
    { key:"time", label:"Start time", type:"time", required:true },
    { key:"duration", label:"Duration (min)", type:"number", required:true },
    { key:"capacity", label:"Capacity", type:"number", required:true },
  ];
}
ACTIONS.editClass = function(id){
  const c = DB.CLASSES.find(x=>x.id===id) || CLASSES.find(x=>x.id===id); if(!c) return;
  openForm({ title:`Edit — ${c.name}`, fields:classFields(c), initial:c, submitLabel:"Save",
    onSubmit(v){ Object.assign(c, v); saveDB(); toast("Class updated"); render(); } });
};
ACTIONS.cancelClass = function(id){
  const c = CLASSES.find(x=>x.id===id); if(!c) return;
  c.status = c.status==="Cancelled" ? "Scheduled" : "Cancelled";
  toast(c.status==="Cancelled"?"Class cancelled":"Class reinstated"); render();
};
ACTIONS.subClass = function(id){
  const c = CLASSES.find(x=>x.id===id); if(!c) return;
  openForm({ title:"Assign a substitute coach", fields:[
    { key:"coach", label:"Substitute coach", type:"select", options:coaches(c.branch).map(x=>({value:x.id,label:x.name})), required:true },
    { key:"note", label:"Note", type:"textarea" },
  ], initial:{coach:c.coach}, submitLabel:"Confirm substitution",
    onSubmit(v){ c.coach=v.coach; c.status="Substitution"; c.note=v.note; toast("Substitute assigned"); render(); } });
};

RENDERERS.classes = function(){
  let rows = inBranch(CLASSES, STATE.branch).slice().sort((a,b)=> a.time.localeCompare(b.time));
  document.getElementById("viewBody").innerHTML = `
    <div class="card"><div class="cardbody flush"><div class="tablewrap"><table class="tbl">
      <thead><tr><th>Class</th><th>Branch</th><th>Program</th><th>Coach</th><th>Days</th><th>Time</th><th>Capacity</th><th>Status</th><th></th></tr></thead>
      <tbody>${rows.map(c=>{
        const full = c.booked>=c.capacity;
        const pct = Math.min(100, Math.round(c.booked/c.capacity*100));
        return `<tr>
          <td><div class="nm" style="font-weight:600">${esc(c.name)}</div>${c.note?`<div class="sm" style="color:var(--ink-3)">${esc(c.note)}</div>`:""}</td>
          <td>${branchTag(c.branch)}</td>
          <td>${esc(c.program)}</td>
          <td>${esc(staffById(c.coach)?.name||"—")}</td>
          <td class="mono">${c.dow.map(x=>DOW_LABEL[x]).join(" ")}</td>
          <td class="mono">${fmtTime(c.time)} · ${c.duration}m</td>
          <td style="min-width:130px">
            <div class="barh"><div class="track"><div class="fill" style="width:${pct}%;background:${full?'var(--st-warning-fill)':'var(--st-good)'}"></div></div><div class="amt">${c.booked}/${c.capacity}</div></div>
            ${c.waitlist?`<div class="sm" style="color:var(--st-serious);margin-top:3px">${c.waitlist} waitlisted</div>`:""}
          </td>
          <td>${pill(c.status, c.status==="Cancelled"?"critical":c.status==="Substitution"?"warning":"good")}</td>
          <td><div class="rowactions">
            <button class="btn sm ghost" data-action="subClass" data-id="${c.id}">Sub</button>
            <button class="btn sm ghost" data-action="editClass" data-id="${c.id}">Edit</button>
            <button class="btn sm ${c.status==='Cancelled'?'':'danger'}" data-action="cancelClass" data-id="${c.id}">${c.status==="Cancelled"?"Reinstate":"Cancel"}</button>
          </div></td>
        </tr>`;
      }).join("") || `<tr><td colspan="9"><div class="empty">No classes scheduled for this branch.</div></td></tr>`}</tbody>
    </table></div></div></div>
  `;
};

/* ============================================================
   ATTENDANCE
   ============================================================ */
ACTIONS.checkIn = function(){
  const opts = DB.MEMBERS.filter(m=>STATE.branch==="all"||m.branch===STATE.branch);
  openForm({ title:"Check in a member", fields:[
    { key:"memberId", label:"Member", type:"select", options:opts.map(m=>({value:m.id,label:m.name})), required:true },
    { key:"classId", label:"Class", type:"select", options:CLASSES.map(c=>({value:c.id,label:`${c.name} (${branch(c.branch).name})`})), required:true },
    { key:"method", label:"Check-in method", type:"select", options:["QR","PIN","Receptionist"], required:true },
    { key:"status", label:"Status", type:"select", options:["Present","Late","No-show"], required:true },
  ], initial:{status:"Present", method:"QR"}, submitLabel:"Check in",
    onSubmit(v){
      DB.ATTENDANCE.unshift({ id:uid("A"), memberId:v.memberId, classId:v.classId, date:iso(TODAY),
        time: v.status==="No-show"? "—" : TODAY.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",hour12:false}), method:v.status==="No-show"?"—":v.method, status:v.status });
      saveDB(); toast("Attendance logged"); render();
    } });
};

RENDERERS.attendance = function(){
  document.getElementById("viewActions").innerHTML = `<button class="btn primary" data-action="checkIn">+ Check in</button>`;
  const dayOpts = [0,-1,-2].map(o=>({key:iso(d(o)), label:o===0?"Today":o===-1?"Yesterday":fmtDateShort(iso(d(o)))}));
  STATE.attDay = STATE.attDay || dayOpts[0].key;

  let rows = DB.ATTENDANCE.filter(a=>a.date===STATE.attDay).map(a=>({a, mm:memberById(a.memberId)})).filter(x=>x.mm && (STATE.branch==="all"||x.mm.branch===STATE.branch));

  const present = rows.filter(r=>r.a.status==="Present").length;
  const late = rows.filter(r=>r.a.status==="Late").length;
  const noshow = rows.filter(r=>r.a.status==="No-show").length;
  const statusTone = s=>({"Present":"good","Late":"warning","No-show":"critical"}[s]);

  document.getElementById("viewBody").innerHTML = `
    <div class="tabs" id="attTabs">${dayOpts.map(o=>`<button class="${STATE.attDay===o.key?'on':''}" data-day="${o.key}">${o.label}</button>`).join("")}</div>
    <div class="grid cols-3" style="margin-bottom:14px">
      <div class="stat" style="--stripe:var(--st-good)"><div class="lbl">Present</div><div class="val mono">${present}</div><div class="sub good">on time or checked in</div></div>
      <div class="stat" style="--stripe:var(--st-warning-fill)"><div class="lbl">Late arrivals</div><div class="val mono">${late}</div><div class="sub warning">flagged by check-in time</div></div>
      <div class="stat" style="--stripe:var(--st-critical)"><div class="lbl">No-shows</div><div class="val mono">${noshow}</div><div class="sub critical">worth a follow-up ping</div></div>
    </div>
    <div class="card"><div class="cardbody flush"><div class="tablewrap"><table class="tbl">
      <thead><tr><th>Member</th><th>Branch</th><th>Class</th><th>Time</th><th>Method</th><th>Status</th></tr></thead>
      <tbody>${rows.map(({a,mm})=>`<tr>
        <td class="name-cell">${avatarSm(mm.name)}<div class="nm">${esc(mm.name)}</div></td>
        <td>${branchTag(mm.branch)}</td>
        <td>${esc(classById(a.classId)?.name||"—")}</td>
        <td class="mono">${a.time==="—"?"—":a.time}</td>
        <td>${a.method==="—"?"—":pill(a.method,"neutral")}</td>
        <td>${pill(a.status, statusTone(a.status))}</td>
      </tr>`).join("") || `<tr><td colspan="6"><div class="empty">No attendance logged for this day / branch.</div></td></tr>`}</tbody>
    </table></div></div></div>
  `;
  document.getElementById("attTabs").addEventListener("click",(e)=>{
    const b = e.target.closest("[data-day]"); if(b){ STATE.attDay=b.dataset.day; RENDERERS.attendance(); }
  });
};

/* ============================================================
   Phase-2 seed extras (still shown — lighter Phase 1 treatment)
   ============================================================ */
const PT_SESSIONS = [
  { memberId:"M3004", trainer:"S9",  planId:"P6", total:12, used:5,  lastSession:iso(d(-2)), notes:"Deadlift form improving, avoid loading past knee-height pull." },
  { memberId:"M3008", trainer:"S11", planId:"P7", total:24, used:9,  lastSession:iso(d(-1)), notes:"Progress photos on file (wk 1, wk 6). Fat-loss phase, adding conditioning finishers." },
  { memberId:"M3012", trainer:"S13", planId:"P6", total:12, used:2,  lastSession:iso(d(-6)), notes:"New joiner — building base strength before adding volume." },
];
const MMA_ATHLETES = [
  { memberId:"M3001", skill:"Competitive", fightHistory:"4–1 amateur (MMA)",     medical:"Cleared", medicalDate:iso(d(-40)), weight:"Flyweight (52kg)",  registered:true,  event:"Maharashtra State Amateur Championship — Nov 2026", sparring:"3x/week, live sparring cleared by coach." },
  { memberId:"M3003", skill:"Beginner",    fightHistory:"No bouts yet",          medical:"Cleared", medicalDate:iso(d(-15)), weight:"Lightweight (70kg)",  registered:false, event:"", sparring:"Drilling only — not yet cleared for live sparring." },
  { memberId:"M3006", skill:"Intermediate",fightHistory:"1–0 amateur (MMA)",     medical:"Cleared", medicalDate:iso(d(-60)), weight:"Strawweight (48kg)",  registered:false, event:"", sparring:"Light sparring, women's batch only." },
  { memberId:"M3007", skill:"Competitive", fightHistory:"6–2 amateur, 1 pro bout", medical:"Cleared", medicalDate:iso(d(-20)), weight:"Welterweight (77kg)", registered:true,  event:"Pune Fight Night 12 — Oct 2026", sparring:"Full contact, fight camp in progress." },
  { memberId:"M3009", skill:"Advanced",    fightHistory:"3–0 amateur (Wrestling background)", medical:"Cleared", medicalDate:iso(d(-5)), weight:"Middleweight (84kg)", registered:true, event:"Maharashtra State Amateur Championship — Nov 2026", sparring:"Live sparring 4x/week." },
  { memberId:"M3011", skill:"Beginner",    fightHistory:"No bouts yet",          medical:"Pending",  medicalDate:"",         weight:"Middleweight (81kg)", registered:false, event:"", sparring:"Not yet cleared — medical clearance pending." },
];

/* ============================================================
   COACHES & STAFF
   ============================================================ */
ACTIONS.viewStaff = function(id){
  const s = staffById(id); if(!s) return;
  const assigned = s.role==="coach" ? DB.MEMBERS.filter(m=>m.branch===s.branch && (s.specialties||[]).some(sp=>m.program===sp || (sp==="Personal Training"&&m.program==="Personal Training"))) : [];
  const body = `
    <div style="display:flex;gap:14px;align-items:center;margin-bottom:14px">
      <div class="avatar-sm" style="width:52px;height:52px;font-size:16px">${esc(initials(s.name))}</div>
      <div><div style="font-weight:700;font-size:16px">${esc(s.name)}</div><div class="sm" style="color:var(--ink-3)">${ROLE_LABELS[s.role]}${s.branch?` · ${branch(s.branch).name}`:" · All branches"}</div></div>
    </div>
    <div class="kv"><span class="k">Phone</span><span class="v mono">${esc(s.phone)}</span></div>
    <div class="kv"><span class="k">Email</span><span class="v">${esc(s.email)}</span></div>
    ${s.qualification?`<div class="kv"><span class="k">Qualification</span><span class="v">${esc(s.qualification)}</span></div>`:""}
    ${s.availability?`<div class="kv"><span class="k">Availability</span><span class="v">${esc(s.availability)}</span></div>`:""}
    ${s.specialties?`<div class="kv"><span class="k">Specialties</span><span class="v">${s.specialties.map(x=>pill(x,"brand")).join(" ")}</span></div>`:""}
    ${s.role==="coach"?`<div class="divider"></div><div class="eyebrow" style="margin-bottom:6px">Assigned members (${assigned.length})</div>
      ${assigned.length? assigned.map(m=>`<div class="kv"><span class="k">${esc(m.name)}</span><span class="v">${esc(m.program)}</span></div>`).join("") : `<div class="empty" style="padding:6px 0">No members currently mapped.</div>`}
      <div class="divider"></div><div class="eyebrow" style="margin-bottom:6px">Payroll / commission input</div>
      <div class="kv"><span class="k">Base (monthly)</span><span class="v mono">${fmtMoney(28000+assigned.length*0)}</span></div>
      <div class="kv"><span class="k">PT commission (per session)</span><span class="v mono">${fmtMoney(400)}</span></div>` : ""}
  `;
  openModal({ title:"Staff profile", bodyHTML:body, footHTML:`<button class="btn ghost" id="svClose" type="button">Close</button>`, onMount(){ document.getElementById("svClose").addEventListener("click", closeModal); } });
};

RENDERERS.staff = function(){
  let rows = STAFF.filter(s=> STATE.branch==="all" || s.branch===STATE.branch || s.branch===null);
  const order = ["admin","manager","receptionist","coach","accountant"];
  rows = rows.slice().sort((a,b)=>order.indexOf(a.role)-order.indexOf(b.role));
  document.getElementById("viewBody").innerHTML = `
    <div class="card"><div class="cardbody flush"><div class="tablewrap"><table class="tbl">
      <thead><tr><th>Staff</th><th>Role</th><th>Branch</th><th>Contact</th><th>Specialty / notes</th><th></th></tr></thead>
      <tbody>${rows.map(s=>`<tr>
        <td class="name-cell">${avatarSm(s.name)}<div class="nm">${esc(s.name)}</div></td>
        <td>${pill(ROLE_LABELS[s.role], s.role==="admin"?"brand":"neutral")}</td>
        <td>${s.branch? branchTag(s.branch) : `<span class="sm" style="color:var(--ink-3)">All branches</span>`}</td>
        <td class="mono sm">${esc(s.phone)}</td>
        <td>${s.specialties? s.specialties.map(x=>pill(x,"neutral")).join(" ") : (s.qualification||"—")}</td>
        <td><button class="btn sm ghost" data-action="viewStaff" data-id="${s.id}">View</button></td>
      </tr>`).join("")}</tbody>
    </table></div></div></div>
  `;
};

/* ============================================================
   PERSONAL TRAINING
   ============================================================ */
RENDERERS.pt = function(){
  let rows = PT_SESSIONS.map(ps=>({ps, mm:memberById(ps.memberId)})).filter(x=>x.mm && (STATE.branch==="all"||x.mm.branch===STATE.branch));
  document.getElementById("viewBody").innerHTML = `
    <div class="grid cols-3">
      ${rows.map(({ps,mm})=>{ const plan=planById(ps.planId); const left=ps.total-ps.used; const pct=Math.round(ps.used/ps.total*100);
        return `<div class="card"><div class="cardhead"><div><h3>${esc(mm.name)}</h3><div class="desc">${branch(mm.branch).name} · trainer ${esc(staffById(ps.trainer).name)}</div></div></div>
          <div class="cardbody">
            <div class="kv"><span class="k">Package</span><span class="v">${esc(plan.name)}</span></div>
            <div class="kv"><span class="k">Sessions used</span><span class="v mono">${ps.used} / ${ps.total}</span></div>
            <div class="barh" style="margin:8px 0"><div class="track"><div class="fill" style="width:${pct}%;background:${left<=3?'var(--st-warning-fill)':'var(--brass-fill)'}"></div></div><div class="amt">${left} left</div></div>
            <div class="kv"><span class="k">Last session</span><span class="v">${fmtDate(ps.lastSession)}</span></div>
            <div class="divider"></div>
            <div class="eyebrow" style="margin-bottom:6px">Session notes / progress</div>
            <div style="font-size:12.5px;color:var(--ink-2)">${esc(ps.notes)}</div>
            ${left<=3?`<div style="margin-top:10px">${pill("Renewal conversation due","warning")}</div>`:""}
          </div></div>`;
      }).join("") || `<div class="empty">No active PT packages for this scope.</div>`}
    </div>
  `;
};

/* ============================================================
   MMA ATHLETE TRACKING
   ============================================================ */
RENDERERS.mma = function(){
  let rows = MMA_ATHLETES.map(a=>({a, mm:memberById(a.memberId)})).filter(x=>x.mm && (STATE.branch==="all"||x.mm.branch===STATE.branch));
  document.getElementById("viewBody").innerHTML = `
    <div class="card"><div class="cardbody flush"><div class="tablewrap"><table class="tbl">
      <thead><tr><th>Athlete</th><th>Branch</th><th>Skill level</th><th>Weight class</th><th>Fight history</th><th>Medical clearance</th><th>Competition</th></tr></thead>
      <tbody>${rows.map(({a,mm})=>`<tr>
        <td class="name-cell">${avatarSm(mm.name)}<div class="nm">${esc(mm.name)}</div></td>
        <td>${branchTag(mm.branch)}</td>
        <td>${pill(a.skill, a.skill==="Competitive"?"brand":a.skill==="Advanced"?"good":"neutral")}</td>
        <td class="mono">${esc(a.weight)}</td>
        <td>${esc(a.fightHistory)}</td>
        <td>${pill(a.medical, a.medical==="Cleared"?"good":"warning")}${a.medicalDate?`<div class="sm" style="color:var(--ink-3)">${fmtDateShort(a.medicalDate)}</div>`:""}</td>
        <td>${a.registered? pill(a.event,"brand") : pill("Not registered","neutral")}<div class="sm" style="color:var(--ink-3);max-width:180px;white-space:normal">${esc(a.sparring)}</div></td>
      </tr>`).join("") || `<tr><td colspan="7"><div class="empty">No MMA athlete records for this scope.</div></td></tr>`}</tbody>
    </table></div></div></div>
  `;
};

/* ============================================================
   COMMUNICATION — templates + follow-up tasks
   ============================================================ */
STATE.commsTab = STATE.commsTab || "tasks";
ACTIONS.addTask = function(){
  openForm({ title:"Add follow-up task", fields:[
    { key:"title", label:"Task", required:true },
    { key:"type", label:"Type", type:"select", options:["Lead follow-up","Trial follow-up","Payment due","Renewal","Attendance","Other"], required:true },
    { key:"branch", label:"Branch", type:"select", options:BRANCHES.map(b=>({value:b.key,label:b.name})), required:true },
    { key:"assigned", label:"Assigned to", type:"select", options:STAFF.map(s=>({value:s.id,label:s.name})), required:true },
    { key:"due", label:"Due date", type:"date", required:true },
  ], initial:{due:iso(TODAY)}, submitLabel:"Add task",
    onSubmit(v){ DB.TASKS.unshift({ id:uid("TK"), refId:"", status:"Open", ...v }); saveDB(); toast("Task added"); render(); } });
};
ACTIONS.toggleTask = function(id){
  const t = DB.TASKS.find(x=>x.id===id); if(!t) return;
  t.status = t.status==="Open" ? "Done" : "Open"; saveDB(); render();
};
ACTIONS.sendTemplate = function(id){
  const tp = TEMPLATES.find(x=>x.id===id); if(!tp) return;
  toast(`${tp.channel} template “${tp.name}” queued to send`);
};
ACTIONS.setCommsTab = function(id){ STATE.commsTab = id; RENDERERS.comms(); };

RENDERERS.comms = function(){
  const tasks = inBranch(DB.TASKS, STATE.branch).slice().sort((a,b)=> (a.status==="Open"?0:1)-(b.status==="Open"?0:1) || new Date(a.due)-new Date(b.due));
  document.getElementById("viewActions").innerHTML = STATE.commsTab==="tasks" ? `<button class="btn primary" data-action="addTask">+ Add task</button>` : "";
  document.getElementById("viewBody").innerHTML = `
    <div class="tabs" id="commsTabs">
      <button class="${STATE.commsTab==='tasks'?'on':''}" data-tab="tasks">Follow-up tasks</button>
      <button class="${STATE.commsTab==='templates'?'on':''}" data-tab="templates">Message templates</button>
    </div>
    <div id="commsBody"></div>
  `;
  document.getElementById("commsTabs").addEventListener("click",(e)=>{ const b=e.target.closest("[data-tab]"); if(b) ACTIONS.setCommsTab(b.dataset.tab); });

  if(STATE.commsTab==="tasks"){
    document.getElementById("commsBody").innerHTML = `
      <div class="card"><div class="cardbody flush"><div class="tablewrap"><table class="tbl">
        <thead><tr><th></th><th>Task</th><th>Type</th><th>Branch</th><th>Assigned to</th><th>Due</th><th></th></tr></thead>
        <tbody>${tasks.map(t=>`<tr style="${t.status==='Done'?'opacity:.5':''}">
          <td><input type="checkbox" ${t.status==='Done'?'checked':''} data-action="toggleTask" data-id="${t.id}" onclick="ACTIONS.toggleTask('${t.id}')"/></td>
          <td style="${t.status==='Done'?'text-decoration:line-through':''}">${esc(t.title)}</td>
          <td>${pill(t.type,"neutral")}</td>
          <td>${branchTag(t.branch)}</td>
          <td>${esc(staffById(t.assigned)?.name||"—")}</td>
          <td>${new Date(t.due)<TODAY && t.status==='Open'? pill(fmtDateShort(t.due),"critical") : fmtDateShort(t.due)}</td>
          <td></td>
        </tr>`).join("") || `<tr><td colspan="7"><div class="empty">No follow-up tasks for this scope.</div></td></tr>`}</tbody>
      </table></div></div></div>`;
  } else {
    document.getElementById("commsBody").innerHTML = `
      <div class="grid cols-2">
        ${TEMPLATES.map(tp=>`<div class="card"><div class="cardhead"><div><h3>${esc(tp.name)}</h3><div class="desc">Trigger: ${esc(tp.trigger)}</div></div>${pill(tp.channel,"brand")}</div>
          <div class="cardbody">
            <div style="font-size:12.5px;color:var(--ink-2);background:var(--surface-2);border:1px solid var(--border);border-radius:8px;padding:10px 12px;font-family:'IBM Plex Mono';line-height:1.6">${esc(tp.body).replace(/\{\{(.*?)\}\}/g,'<span style="color:var(--brass-ink);font-weight:600">{{$1}}</span>')}</div>
            <div style="margin-top:10px;display:flex;justify-content:flex-end"><button class="btn sm" data-action="sendTemplate" data-id="${tp.id}">Send now</button></div>
          </div></div>`).join("")}
      </div>`;
  }
};

/* ============================================================
   REPORTS
   ============================================================ */
RENDERERS.reports = function(){
  const leads = inBranch(DB.LEADS, STATE.branch);
  const trials = inBranch(DB.TRIALS, STATE.branch);
  const totalLeads = leads.length;
  const trialBooked = trials.length;
  const trialAttended = trials.filter(t=>t.attendance==="Attended").length;
  const converted = leads.filter(l=>["Member active","Renewed"].includes(l.status)).length;
  const leadToTrial = totalLeads? Math.round(trialBooked/totalLeads*100) : 0;
  const trialToMember = trialAttended? Math.round(converted/trialAttended*100) : 0;

  const memberIds = new Set(DB.MEMBERS.filter(m=>STATE.branch==="all"||m.branch===STATE.branch).map(m=>m.id));
  const msInScope = DB.MEMBERSHIPS.filter(ms=>memberIds.has(ms.memberId));
  const expiredCount = msInScope.filter(ms=>membershipComputedStatus(ms)==="Expired").length;
  const churn = msInScope.length? Math.round(expiredCount/msInScope.length*100) : 0;

  const payInScope = DB.PAYMENTS.filter(p=>memberIds.has(p.memberId));
  const dues = payInScope.filter(p=>["Overdue","Partial"].includes(p.status)).reduce((s,p)=>s+paymentBalance(p),0);
  const revenueTotal = payInScope.reduce((s,p)=>s+p.paid,0);

  const attToday = DB.ATTENDANCE.filter(a=>a.date===iso(TODAY) && memberIds.has(a.memberId));
  const attRate = attToday.length? Math.round(attToday.filter(a=>a.status!=="No-show").length/attToday.length*100) : 0;

  const branchRevenue = BRANCHES.map(b=>({b, val: DB.PAYMENTS.filter(p=>{const mm=memberById(p.memberId); return mm&&mm.branch===b.key;}).reduce((s,p)=>s+p.paid,0)}));
  const maxBranchRev = Math.max(...branchRevenue.map(x=>x.val),1);

  const coachStats = coaches(STATE.branch==="all"?null:STATE.branch).map(c=>{
    const cls = CLASSES.filter(x=>x.coach===c.id);
    const cap = cls.reduce((s,x)=>s+x.capacity,0), booked = cls.reduce((s,x)=>s+x.booked,0);
    return { c, pct: cap? Math.round(booked/cap*100) : 0, classCount: cls.length };
  }).sort((a,b)=>b.pct-a.pct);

  const progStats = PROGRAMS.map(pr=>{
    const mIds = new Set(DB.MEMBERS.filter(m=>m.program===pr && (STATE.branch==="all"||m.branch===STATE.branch)).map(m=>m.id));
    const rev = DB.PAYMENTS.filter(p=>mIds.has(p.memberId)).reduce((s,p)=>s+p.paid,0);
    return { pr, members: mIds.size, rev };
  });
  const maxProgRev = Math.max(...progStats.map(x=>x.rev),1);

  document.getElementById("viewBody").innerHTML = `
    <div class="grid cols-4">
      <div class="stat"><div class="lbl">Lead → trial</div><div class="val mono">${leadToTrial}%</div><div class="sub">${trialBooked} of ${totalLeads} leads booked a trial</div></div>
      <div class="stat"><div class="lbl">Trial → membership</div><div class="val mono">${trialToMember}%</div><div class="sub">${converted} of ${trialAttended} attended trials converted</div></div>
      <div class="stat"><div class="lbl">Attendance rate — today</div><div class="val mono">${attRate}%</div><div class="sub">${attToday.length} check-ins logged</div></div>
      <div class="stat" style="--stripe:${churn>15?'var(--st-critical)':'var(--border-strong)'}"><div class="lbl">Churn (expired / total)</div><div class="val mono">${churn}%</div><div class="sub ${churn>15?'critical':''}">${expiredCount} of ${msInScope.length} memberships</div></div>
    </div>

    <div class="grid cols-2" style="margin-top:14px;align-items:start">
      <div class="card"><div class="cardhead"><div><h3>Revenue by branch — all time</h3></div></div>
        <div class="cardbody">
          ${branchRevenue.map(x=>`<div class="barh" style="margin-bottom:10px"><div style="width:66px;font-size:12px;font-weight:600">${x.b.name}</div><div class="track"><div class="fill" style="width:${Math.max(4,x.val/maxBranchRev*100)}%;background:${x.b.color}"></div></div><div class="amt">${fmtMoney(x.val)}</div></div>`).join("")}
          <div class="divider"></div>
          <div class="kv"><span class="k">Total revenue (scope)</span><span class="v mono">${fmtMoney(revenueTotal)}</span></div>
          <div class="kv"><span class="k">Outstanding dues (scope)</span><span class="v mono" style="${dues?'color:var(--st-critical)':''}">${fmtMoney(dues)}</span></div>
        </div>
      </div>
      <div class="card"><div class="cardhead"><div><h3>Program performance</h3><div class="desc">Members and revenue by program, this scope</div></div></div>
        <div class="cardbody">
          ${progStats.map(x=>`<div class="barh" style="margin-bottom:10px"><div style="width:110px;font-size:12px;font-weight:600">${x.pr}</div><div class="track"><div class="fill" style="width:${Math.max(4,x.rev/maxProgRev*100)}%;background:var(--brass-fill)"></div></div><div class="amt">${fmtMoney(x.rev)}</div></div>`).join("")}
          <div class="legend">${progStats.map(x=>`<div class="li"><span class="sw" style="background:var(--brass-fill)"></span>${x.pr}: ${x.members} members</div>`).join("")}</div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:14px"><div class="cardhead"><div><h3>Coach utilisation</h3><div class="desc">Booked seats ÷ capacity across each coach's classes</div></div></div>
      <div class="cardbody flush"><div class="tablewrap"><table class="tbl">
        <thead><tr><th>Coach</th><th>Branch</th><th>Classes</th><th>Utilisation</th></tr></thead>
        <tbody>${coachStats.map(x=>`<tr>
          <td class="name-cell">${avatarSm(x.c.name)}<div class="nm">${esc(x.c.name)}</div></td>
          <td>${branchTag(x.c.branch)}</td>
          <td class="num">${x.classCount}</td>
          <td style="min-width:160px"><div class="barh"><div class="track"><div class="fill" style="width:${x.pct}%;background:${x.pct>=90?'var(--st-warning-fill)':'var(--st-good)'}"></div></div><div class="amt">${x.pct}%</div></div></td>
        </tr>`).join("") || `<tr><td colspan="4"><div class="empty">No coaches in this scope.</div></td></tr>`}</tbody>
      </table></div></div>
    </div>
  `;
};

/* ============================================================
   ADMIN & PERMISSIONS
   ============================================================ */
RENDERERS.admin = function(){
  document.getElementById("viewActions").innerHTML = `<button class="btn danger" data-action="resetData">Reset sample data</button>`;
  const roles = Object.keys(ROLE_LABELS);
  const allModules = NAV.flatMap(s=>s.items);
  const staffCounts = {}; roles.forEach(r=>staffCounts[r]=STAFF.filter(s=>s.role===r).length);

  document.getElementById("viewBody").innerHTML = `
    <div class="grid cols-4" style="margin-bottom:14px">
      ${roles.map(r=>`<div class="stat"><div class="lbl">${ROLE_LABELS[r]}</div><div class="val mono">${staffCounts[r]}</div><div class="sub">team member${staffCounts[r]===1?"":"s"}</div></div>`).join("")}
    </div>
    <div class="card"><div class="cardhead"><div><h3>What each role can see</h3><div class="desc">Founder/Admin has full access; every other role is scoped to what its job needs. Switch “View as role” in the top bar to preview.</div></div></div>
      <div class="cardbody flush"><div class="tablewrap"><table class="tbl">
        <thead><tr><th>Module</th>${roles.map(r=>`<th style="text-align:center">${ROLE_LABELS[r]}</th>`).join("")}</tr></thead>
        <tbody>${allModules.map(m=>`<tr><td>${esc(m.label)}</td>${roles.map(r=>{
          const allowed = ROLE_VIEWS[r];
          const has = !allowed || allowed.includes(m.key);
          return `<td style="text-align:center">${has? `<span style="color:var(--st-good);font-weight:700">✓</span>` : `<span style="color:var(--ink-3)">–</span>`}</td>`;
        }).join("")}</tr>`).join("")}</tbody>
      </table></div></div>
    </div>
    <div class="card" style="margin-top:14px"><div class="cardhead"><div><h3>Data scope by branch</h3><div class="desc">Branch managers, receptionists, coaches and the accountant see figures for their assigned branch only when a branch role account is used; the founder/admin can view any branch or “All branches”.</div></div></div>
      <div class="cardbody">
        <div class="kv"><span class="k">This is a prototype</span><span class="v">Edits save to this browser only (localStorage), so they persist on reload here but aren't shared with anyone else.</span></div>
        <div class="kv"><span class="k">Data lives</span><span class="v">In this browser's local storage — nothing is sent to a server.</span></div>
      </div>
    </div>
  `;
};
ACTIONS.resetData = function(){ if(confirm("Reset all demo data back to the original sample set? Your edits in this browser will be lost.")) resetDB(); };

/* ============================================================
   Init
   ============================================================ */
render();
