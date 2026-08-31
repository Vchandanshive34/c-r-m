import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutDashboard, UserPlus, Users, BadgeCheck, CreditCard, ClipboardCheck,
  CalendarDays, Dumbbell, Trophy, MessageCircle, BarChart3, ShieldCheck,
  Plus, Pencil, Trash2, X, Search, RefreshCw, Check, AlertTriangle,
  Phone, ChevronRight, Loader2, TrendingUp, Building2
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";

/* ---------------------------------------------------------------------- */
/* Constants                                                               */
/* ---------------------------------------------------------------------- */

const C = {
  bg: "#111216",
  panel: "#1A1C22",
  panel2: "#22242C",
  panel3: "#2A2D36",
  border: "#31343E",
  borderLight: "#3D404B",
  text: "#EDEEF2",
  textMute: "#9AA0AC",
  textFaint: "#6B7080",
  accent: "#E8402B",
  accentDark: "#B72F1E",
  amber: "#F0A93E",
  green: "#3ECF8E",
  blue: "#4FA3E3",
  purple: "#A78BFA",
};

const BRANCHES = ["Vashi", "Nerul", "Wagholi"];
const PROGRAMS = ["Conditioning", "MMA", "Personal Training"];
const GOALS = ["Weight loss", "Strength", "Self-defence", "Competition", "General fitness"];
const SOURCES = ["Website", "Instagram", "Walk-in", "Referral", "Call"];
const STAFF = ["Rohan Shetty", "Ayesha Khan", "Vikram Rao", "Priya Nair", "Karan Mehta"];
const COACH_NAMES = ["Coach Dinesh", "Coach Farhan", "Coach Meera", "Coach Aslam", "Coach Sana"];
const PAY_MODES = ["Cash", "UPI", "Card", "Bank Transfer"];
const PAY_TYPES = ["Full payment", "Part payment", "EMI"];
const PLANS = ["1-Month Conditioning", "3-Month Conditioning", "6-Month Conditioning", "12-Month Conditioning", "3-Month MMA", "6-Month MMA", "PT Pack - 12 sessions", "PT Pack - 24 sessions"];

const LEAD_STATUSES = [
  "New enquiry", "Contacted", "Trial booked", "Trial attended",
  "Interested", "Payment pending", "Member active", "Renewal due",
  "Renewed", "Lost"
];

const ROLES = ["Founder / Admin", "Branch Manager", "Receptionist", "Coach", "Accountant"];

const ROLE_ACCESS = {
  "Founder / Admin": ["dashboard","leads","members","memberships","payments","attendance","schedule","coaches","pt","comms","reports","admin"],
  "Branch Manager": ["dashboard","leads","members","memberships","payments","attendance","schedule","coaches","pt","comms","reports"],
  "Receptionist": ["dashboard","leads","members","attendance","schedule","comms"],
  "Coach": ["dashboard","members","attendance","schedule","pt"],
  "Accountant": ["dashboard","memberships","payments","reports"],
};

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "leads", label: "Leads & Trials", icon: UserPlus },
  { id: "members", label: "Members", icon: Users },
  { id: "memberships", label: "Memberships", icon: BadgeCheck },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "attendance", label: "Attendance", icon: ClipboardCheck },
  { id: "schedule", label: "Class Schedule", icon: CalendarDays },
  { id: "coaches", label: "Coaches & Staff", icon: Dumbbell },
  { id: "pt", label: "PT & Athlete Tracking", icon: Trophy },
  { id: "comms", label: "Follow-ups & Templates", icon: MessageCircle },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "admin", label: "Admin & Roles", icon: ShieldCheck },
];

const STORAGE_KEYS = {
  leads: "ffc-leads",
  members: "ffc-members",
  memberships: "ffc-memberships",
  payments: "ffc-payments",
  classes: "ffc-classes",
  attendance: "ffc-attendance",
  coaches: "ffc-coaches",
  athletes: "ffc-athletes",
};

/* ---------------------------------------------------------------------- */
/* Helpers                                                                 */
/* ---------------------------------------------------------------------- */

const uid = (p = "id") => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
const todayStr = () => new Date().toISOString().slice(0, 10);
const addDays = (d, n) => { const dt = new Date(d); dt.setDate(dt.getDate() + n); return dt.toISOString().slice(0, 10); };
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
const fmtDate = (d) => (d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const fmtMoney = (n) => `\u20B9${Number(n || 0).toLocaleString("en-IN")}`;
const initials = (name = "") => name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0]?.toUpperCase()).join("");

function seedData() {
  const t = todayStr();
  const memberSeed = [
    { id: "m1", name: "Aarav Kulkarni", phone: "9820011122", email: "aarav.k@example.com", branch: "Vashi", program: "MMA", emergencyName: "Sunita Kulkarni", emergencyPhone: "9820099911", medical: "None declared", goals: "Competition", joinDate: addDays(t, -190), notes: "Prefers evening batch" },
    { id: "m2", name: "Neha Deshpande", phone: "9930022233", email: "neha.d@example.com", branch: "Nerul", program: "Conditioning", emergencyName: "Amit Deshpande", emergencyPhone: "9930088822", medical: "Mild knee strain (2023)", goals: "Weight loss", joinDate: addDays(t, -95), notes: "" },
    { id: "m3", name: "Rohit Pillai", phone: "9765033344", email: "rohit.p@example.com", branch: "Wagholi", program: "Personal Training", emergencyName: "Leela Pillai", emergencyPhone: "9765077733", medical: "None declared", goals: "Strength", joinDate: addDays(t, -40), notes: "" },
    { id: "m4", name: "Sanjana Iyer", phone: "9820044455", email: "sanjana.i@example.com", branch: "Vashi", program: "Conditioning", emergencyName: "Ravi Iyer", emergencyPhone: "9820066644", medical: "Asthma - carries inhaler", goals: "General fitness", joinDate: addDays(t, -10), notes: "" },
  ];
  const membershipSeed = [
    { id: "ms1", memberId: "m1", plan: "6-Month MMA", branch: "Vashi", startDate: addDays(t, -190), endDate: addDays(t, 5), price: 24000, status: "Active", freezeDays: 0, notes: "" },
    { id: "ms2", memberId: "m2", plan: "3-Month Conditioning", branch: "Nerul", startDate: addDays(t, -95), endDate: addDays(t, -5), price: 9000, status: "Renewal due", freezeDays: 0, notes: "" },
    { id: "ms3", memberId: "m3", plan: "PT Pack - 24 sessions", branch: "Wagholi", startDate: addDays(t, -40), endDate: addDays(t, 50), price: 28000, status: "Active", freezeDays: 0, notes: "" },
    { id: "ms4", memberId: "m4", plan: "1-Month Conditioning", branch: "Vashi", startDate: addDays(t, -10), endDate: addDays(t, 20), price: 3500, status: "Active", freezeDays: 0, notes: "" },
  ];
  const paymentSeed = [
    { id: "p1", memberId: "m1", membershipId: "ms1", amount: 24000, mode: "UPI", type: "Full payment", date: addDays(t, -190), dueDate: addDays(t, -190), status: "Paid", discount: 0, gst: true, gstAmount: 4068, receiptNo: "FFC-1001" },
    { id: "p2", memberId: "m2", membershipId: "ms2", amount: 5000, mode: "Card", type: "Part payment", date: addDays(t, -95), dueDate: addDays(t, -95), status: "Paid", discount: 0, gst: true, gstAmount: 763, receiptNo: "FFC-1002" },
    { id: "p3", memberId: "m2", membershipId: "ms2", amount: 4000, mode: "Cash", type: "Part payment", date: null, dueDate: addDays(t, 3), status: "Overdue", discount: 0, gst: false, gstAmount: 0, receiptNo: "" },
    { id: "p4", memberId: "m3", membershipId: "ms3", amount: 28000, mode: "Bank Transfer", type: "Full payment", date: addDays(t, -40), dueDate: addDays(t, -40), status: "Paid", discount: 2000, gst: true, gstAmount: 4271, receiptNo: "FFC-1003" },
    { id: "p5", memberId: "m4", membershipId: "ms4", amount: 3500, mode: "UPI", type: "Full payment", date: t, dueDate: t, status: "Paid", discount: 0, gst: false, gstAmount: 0, receiptNo: "FFC-1004" },
  ];
  const leadSeed = [
    { id: "l1", name: "Ishaan Verma", phone: "9822011010", source: "Instagram", center: "Vashi", program: "MMA", goal: "Competition", budget: "20000-25000", assignedStaff: "Rohan Shetty", followUpDate: t, followUpNotes: "Call to confirm trial slot", status: "Trial booked", createdAt: addDays(t, -2), trialDate: t, trialTime: "18:00", trialCoach: "Coach Dinesh", trialAttendance: "Pending", trialFeedback: "", conversionOutcome: "" },
    { id: "l2", name: "Meera Joshi", phone: "9822022020", source: "Website", center: "Nerul", program: "Conditioning", goal: "Weight loss", budget: "8000-10000", assignedStaff: "Ayesha Khan", followUpDate: t, followUpNotes: "Follow up after trial feedback", status: "Trial attended", createdAt: addDays(t, -5), trialDate: addDays(t, -1), trialTime: "07:00", trialCoach: "Coach Meera", trialAttendance: "Attended", trialFeedback: "Enjoyed the session, comparing prices", conversionOutcome: "" },
    { id: "l3", name: "Devika Shah", phone: "9822033030", source: "Referral", center: "Wagholi", program: "Personal Training", goal: "Strength", budget: "25000+", assignedStaff: "Vikram Rao", followUpDate: addDays(t, 1), followUpNotes: "Send PT package pricing", status: "Interested", createdAt: addDays(t, -8), trialDate: addDays(t, -6), trialTime: "17:30", trialCoach: "Coach Farhan", trialAttendance: "Attended", trialFeedback: "Very interested, wants trainer with combat background", conversionOutcome: "" },
    { id: "l4", name: "Arjun Nair", phone: "9822044040", source: "Walk-in", center: "Vashi", program: "Conditioning", goal: "General fitness", budget: "5000-8000", assignedStaff: "Priya Nair", followUpDate: t, followUpNotes: "Confirm trial time", status: "New enquiry", createdAt: t, trialDate: "", trialTime: "", trialCoach: "", trialAttendance: "Pending", trialFeedback: "", conversionOutcome: "" },
    { id: "l5", name: "Kabir Malhotra", phone: "9822055050", source: "Call", center: "Nerul", program: "MMA", goal: "Self-defence", budget: "10000-15000", assignedStaff: "Karan Mehta", followUpDate: addDays(t, -1), followUpNotes: "Not picking up, try WhatsApp", status: "Contacted", createdAt: addDays(t, -3), trialDate: "", trialTime: "", trialCoach: "", trialAttendance: "Pending", trialFeedback: "", conversionOutcome: "" },
    { id: "l6", name: "Tanvi Rao", phone: "9822066060", source: "Instagram", center: "Wagholi", program: "Conditioning", goal: "Weight loss", budget: "6000-9000", assignedStaff: "Rohan Shetty", followUpDate: addDays(t, -10), followUpNotes: "Lost - joined a closer gym", status: "Lost", createdAt: addDays(t, -20), trialDate: addDays(t, -18), trialTime: "08:00", trialCoach: "Coach Sana", trialAttendance: "Attended", trialFeedback: "Distance was an issue", conversionOutcome: "Lost - location" },
  ];
  const classSeed = [
    { id: "c1", branch: "Vashi", program: "MMA", coach: "Coach Dinesh", day: "Mon/Wed/Fri", time: "18:00", capacity: 20, bookedMemberIds: ["m1"] },
    { id: "c2", branch: "Nerul", program: "Conditioning", coach: "Coach Meera", day: "Daily", time: "07:00", capacity: 25, bookedMemberIds: ["m2"] },
    { id: "c3", branch: "Wagholi", program: "Personal Training", coach: "Coach Farhan", day: "Tue/Thu/Sat", time: "17:30", capacity: 8, bookedMemberIds: ["m3"] },
    { id: "c4", branch: "Vashi", program: "Conditioning", coach: "Coach Sana", day: "Daily", time: "06:00", capacity: 25, bookedMemberIds: ["m4"] },
  ];
  const attendanceSeed = [
    { id: "a1", memberId: "m1", classId: "c1", date: t, status: "Present" },
    { id: "a2", memberId: "m4", classId: "c4", date: t, status: "Present" },
    { id: "a3", memberId: "m2", classId: "c2", date: addDays(t, -1), status: "Present" },
    { id: "a4", memberId: "m3", classId: "c3", date: addDays(t, -1), status: "No-show" },
  ];
  const coachSeed = [
    { id: "co1", name: "Coach Dinesh", branch: "Vashi", specialties: "MMA, Muay Thai", qualifications: "Certified MMA coach, 8 yrs", availability: "Mon-Sat, 4pm-9pm", commission: "10% on PT packs" },
    { id: "co2", name: "Coach Meera", branch: "Nerul", specialties: "Conditioning, HIIT", qualifications: "ACE Certified Trainer", availability: "Daily, 6am-11am", commission: "Fixed payroll" },
    { id: "co3", name: "Coach Farhan", branch: "Wagholi", specialties: "Personal Training, Strength", qualifications: "NASM-CPT", availability: "Tue-Sun, 12pm-8pm", commission: "15% on PT packs" },
    { id: "co4", name: "Coach Sana", branch: "Vashi", specialties: "Conditioning, Boxing fitness", qualifications: "Boxing coach, 5 yrs", availability: "Daily, 5am-10am", commission: "Fixed payroll" },
  ];
  const athleteSeed = [
    { id: "pt1", memberId: "m1", type: "MMA Athlete", trainer: "Coach Dinesh", skillLevel: "Intermediate", weightCategory: "70kg", medicalClearance: "Cleared - valid till " + addDays(t, 120), fightHistory: "2 amateur bouts (1W-1L)", competitionReg: "State Championship - registered", sessionBalance: "", notes: "Sparring 3x/week, good conditioning" },
    { id: "pt2", memberId: "m3", type: "Personal Training", trainer: "Coach Farhan", skillLevel: "Beginner", weightCategory: "", medicalClearance: "Cleared", fightHistory: "", competitionReg: "", sessionBalance: "18 of 24 sessions left", notes: "Progress photo taken on " + addDays(t, -35) },
  ];
  return { leadSeed, memberSeed, membershipSeed, paymentSeed, classSeed, attendanceSeed, coachSeed, athleteSeed };
}

/* ---------------------------------------------------------------------- */
/* Small UI atoms                                                          */
/* ---------------------------------------------------------------------- */

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
      .ffc-app { font-family: 'Inter', sans-serif; }
      .ffc-display { font-family: 'Oswald', sans-serif; letter-spacing: 0.01em; }
      .ffc-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
      .ffc-scroll::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
      .ffc-input:focus { outline: none; border-color: ${C.accent} !important; }
      .ffc-row:hover { background: ${C.panel2}; }
    `}</style>
  );
}

function Badge({ text, tone = "mute" }) {
  const map = {
    good: { bg: "rgba(62,207,142,0.14)", fg: C.green },
    warn: { bg: "rgba(240,169,62,0.15)", fg: C.amber },
    bad: { bg: "rgba(232,64,43,0.15)", fg: C.accent },
    info: { bg: "rgba(79,163,227,0.15)", fg: C.blue },
    mute: { bg: C.panel3, fg: C.textMute },
  };
  const s = map[tone] || map.mute;
  return (
    <span style={{ background: s.bg, color: s.fg, fontWeight: 600, fontSize: 12, padding: "3px 9px", borderRadius: 3, whiteSpace: "nowrap" }}>
      {text}
    </span>
  );
}

function StatCard({ label, value, sub, tone = "text", icon: Icon }) {
  const color = tone === "accent" ? C.accent : tone === "warn" ? C.amber : tone === "bad" ? C.accent : tone === "good" ? C.green : C.text;
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: "16px 18px", minWidth: 0 }}>
      <div className="flex items-center justify-between mb-2">
        <span style={{ color: C.textMute, fontSize: 12.5, fontWeight: 500 }}>{label}</span>
        {Icon && <Icon size={15} color={C.textFaint} />}
      </div>
      <div className="ffc-display" style={{ color, fontSize: 28, fontWeight: 600, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ color: C.textFaint, fontSize: 12, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

function Button({ children, onClick, variant = "primary", size = "md", icon: Icon, type = "button", style: extra }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600, borderRadius: 3,
    cursor: "pointer", border: "1px solid transparent", transition: "opacity .15s",
    fontSize: size === "sm" ? 12.5 : 13.5, padding: size === "sm" ? "6px 10px" : "8px 14px",
  };
  const variants = {
    primary: { background: C.accent, color: "#fff" },
    ghost: { background: "transparent", color: C.text, border: `1px solid ${C.border}` },
    subtle: { background: C.panel2, color: C.text, border: `1px solid ${C.border}` },
    danger: { background: "transparent", color: C.accent, border: `1px solid ${C.accentDark}` },
  };
  return (
    <button type={type} onClick={onClick} style={{ ...base, ...variants[variant], ...extra }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = 0.82)}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = 1)}>
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}

function Select({ value, onChange, options, placeholder, style: extra }) {
  return (
    <select className="ffc-input" value={value} onChange={(e) => onChange(e.target.value)}
      style={{ background: C.panel2, color: C.text, border: `1px solid ${C.border}`, borderRadius: 3, padding: "7px 8px", fontSize: 13, ...extra }}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function TextInput(props) {
  return (
    <input className="ffc-input" {...props}
      style={{ background: C.panel2, color: C.text, border: `1px solid ${C.border}`, borderRadius: 3, padding: "7px 9px", fontSize: 13, width: "100%", ...(props.style || {}) }} />
  );
}

function SectionHeader({ title, subtitle, right }) {
  return (
    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
      <div>
        <h2 className="ffc-display" style={{ color: C.text, fontSize: 21, fontWeight: 600 }}>{title}</h2>
        {subtitle && <p style={{ color: C.textMute, fontSize: 13, marginTop: 2 }}>{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}

function Modal({ title, onClose, children, width = 560 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 50, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "5vh 16px", overflowY: "auto" }} onClick={onClose}>
      <div className="ffc-scroll" style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, width: "100%", maxWidth: width, padding: 22 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="ffc-display" style={{ color: C.text, fontSize: 17, fontWeight: 600 }}>{title}</h3>
          <button onClick={onClose} style={{ color: C.textMute, cursor: "pointer" }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* Generic field-driven entity form */
function EntityForm({ fields, initial, onSubmit, onCancel, submitLabel = "Save" }) {
  const [form, setForm] = useState(() => {
    const o = {};
    fields.forEach((f) => { o[f.key] = initial?.[f.key] ?? f.default ?? ""; });
    return o;
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <div className="grid grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.key} style={{ gridColumn: f.full ? "1 / -1" : undefined }}>
            <label style={{ display: "block", color: C.textMute, fontSize: 12, marginBottom: 4, fontWeight: 500 }}>{f.label}{f.required && " *"}</label>
            {f.type === "select" ? (
              <Select value={form[f.key]} onChange={(v) => set(f.key, v)} options={f.options} placeholder={f.placeholder || "Select"} />
            ) : f.type === "textarea" ? (
              <textarea className="ffc-input" required={f.required} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} rows={3}
                style={{ background: C.panel2, color: C.text, border: `1px solid ${C.border}`, borderRadius: 3, padding: "7px 9px", fontSize: 13, width: "100%", resize: "vertical" }} />
            ) : f.type === "checkbox" ? (
              <input type="checkbox" checked={!!form[f.key]} onChange={(e) => set(f.key, e.target.checked)} style={{ width: 16, height: 16, marginTop: 6 }} />
            ) : (
              <TextInput type={f.type || "text"} required={f.required} value={form[f.key]} onChange={(e) => set(f.key, e.target.value)} placeholder={f.placeholder} />
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-2 mt-5">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" icon={Check}>{submitLabel}</Button>
      </div>
    </form>
  );
}

function Table({ columns, rows, onEdit, onDelete, emptyLabel = "No records yet." }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden" }}>
      <div className="ffc-scroll" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.panel2 }}>
              {columns.map((c) => (
                <th key={c.key} style={{ textAlign: "left", padding: "9px 12px", color: C.textMute, fontWeight: 600, fontSize: 11.5, borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{c.label}</th>
              ))}
              {(onEdit || onDelete) && <th style={{ borderBottom: `1px solid ${C.border}` }}></th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={columns.length + 1} style={{ padding: 24, textAlign: "center", color: C.textFaint }}>{emptyLabel}</td></tr>
            )}
            {rows.map((row, i) => (
              <tr key={row.id || i} className="ffc-row" style={{ borderBottom: i === rows.length - 1 ? "none" : `1px solid ${C.border}` }}>
                {columns.map((c) => (
                  <td key={c.key} style={{ padding: "9px 12px", color: C.text, whiteSpace: "nowrap" }}>
                    {c.render ? c.render(row) : (row[c.key] ?? "—")}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td style={{ padding: "9px 12px", textAlign: "right", whiteSpace: "nowrap" }}>
                    {onEdit && <button onClick={() => onEdit(row)} style={{ color: C.textMute, marginRight: 10 }}><Pencil size={14} /></button>}
                    {onDelete && <button onClick={() => onDelete(row)} style={{ color: C.accent }}><Trash2 size={14} /></button>}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Toolbar({ search, setSearch, right }) {
  return (
    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
      <div className="flex items-center gap-2" style={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 3, padding: "6px 10px", minWidth: 220 }}>
        <Search size={14} color={C.textFaint} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" style={{ background: "transparent", border: "none", outline: "none", color: C.text, fontSize: 13, width: "100%" }} />
      </div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}

const leadStatusTone = (s) => ({
  "New enquiry": "info", "Contacted": "info", "Trial booked": "warn", "Trial attended": "warn",
  "Interested": "warn", "Payment pending": "bad", "Member active": "good", "Renewal due": "warn",
  "Renewed": "good", "Lost": "mute",
}[s] || "mute");

/* ---------------------------------------------------------------------- */
/* App                                                                      */
/* ---------------------------------------------------------------------- */

export default function App() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [role, setRole] = useState("Founder / Admin");
  const [branch, setBranch] = useState("All");

  const [leads, setLeads] = useState([]);
  const [members, setMembers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [payments, setPayments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [athletes, setAthletes] = useState([]);

  useEffect(() => {
    (async () => {
      const seed = seedData();
      const pairs = [
        ["leads", setLeads, "leadSeed"], ["members", setMembers, "memberSeed"],
        ["memberships", setMemberships, "membershipSeed"], ["payments", setPayments, "paymentSeed"],
        ["classes", setClasses, "classSeed"], ["attendance", setAttendance, "attendanceSeed"],
        ["coaches", setCoaches, "coachSeed"], ["athletes", setAthletes, "athleteSeed"],
      ];
      for (const [key, setter, seedKey] of pairs) {
        try {
          const res = await window.storage.get(STORAGE_KEYS[key], true);
          setter(res ? JSON.parse(res.value) : seed[seedKey]);
        } catch {
          setter(seed[seedKey]);
        }
      }
      setLoading(false);
    })();
  }, []);

  const persist = useCallback(async (key, data) => {
    try { await window.storage.set(STORAGE_KEYS[key], JSON.stringify(data), true); } catch (e) { console.error("storage save failed", e); }
  }, []);

  const makeSetter = (key, setter) => (data) => { setter(data); persist(key, data); };
  const sLeads = makeSetter("leads", setLeads);
  const sMembers = makeSetter("members", setMembers);
  const sMemberships = makeSetter("memberships", setMemberships);
  const sPayments = makeSetter("payments", setPayments);
  const sClasses = makeSetter("classes", setClasses);
  const sAttendance = makeSetter("attendance", setAttendance);
  const sCoaches = makeSetter("coaches", setCoaches);
  const sAthletes = makeSetter("athletes", setAthletes);

  const resetAll = async () => {
    if (!confirm("Reset all CRM data back to the demo seed? This clears data for everyone using this CRM link.")) return;
    const seed = seedData();
    sLeads(seed.leadSeed); sMembers(seed.memberSeed); sMemberships(seed.membershipSeed);
    sPayments(seed.paymentSeed); sClasses(seed.classSeed); sAttendance(seed.attendanceSeed);
    sCoaches(seed.coachSeed); sAthletes(seed.athleteSeed);
  };

  const memberName = (id) => members.find((m) => m.id === id)?.name || "—";
  const memberBranch = (id) => members.find((m) => m.id === id)?.branch || "—";

  const visibleNav = NAV.filter((n) => ROLE_ACCESS[role].includes(n.id));
  useEffect(() => { if (!ROLE_ACCESS[role].includes(tab)) setTab("dashboard"); }, [role]); // eslint-disable-line

  const byBranch = (arr, key = "branch") => branch === "All" ? arr : arr.filter((x) => (x[key] || x.center) === branch);

  if (loading) {
    return (
      <div className="ffc-app flex items-center justify-center" style={{ minHeight: 480, background: C.bg }}>
        <GlobalStyle />
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin" size={26} color={C.accent} />
          <span style={{ color: C.textMute, fontSize: 13 }}>Loading FIT & FIGHT CLUB CRM…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="ffc-app" style={{ background: C.bg, minHeight: 640, display: "flex", borderRadius: 6, overflow: "hidden", border: `1px solid ${C.border}` }}>
      <GlobalStyle />

      {/* Sidebar */}
      <div style={{ width: 216, background: C.panel, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
        <div style={{ padding: "18px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-2">
            <div style={{ width: 30, height: 30, background: C.accent, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Dumbbell size={16} color="#fff" />
            </div>
            <div style={{ lineHeight: 1.1 }}>
              <div className="ffc-display" style={{ color: C.text, fontSize: 14.5, fontWeight: 700 }}>FIT & FIGHT</div>
              <div className="ffc-display" style={{ color: C.accent, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em" }}>CLUB · CRM</div>
            </div>
          </div>
        </div>
        <div className="ffc-scroll" style={{ padding: "10px 8px", flex: 1, overflowY: "auto" }}>
          {visibleNav.map((n) => {
            const Icon = n.icon;
            const active = tab === n.id;
            return (
              <button key={n.id} onClick={() => setTab(n.id)}
                className="flex items-center gap-2.5"
                style={{
                  width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 3, marginBottom: 2,
                  background: active ? "rgba(232,64,43,0.13)" : "transparent",
                  color: active ? C.accent : C.textMute, fontSize: 13, fontWeight: active ? 600 : 500, cursor: "pointer", border: "none",
                }}>
                <Icon size={15} />
                {n.label}
              </button>
            );
          })}
        </div>
        <div style={{ padding: 12, borderTop: `1px solid ${C.border}` }}>
          <a href="https://www.fitandfightclub.com" target="_blank" rel="noreferrer" style={{ color: C.textFaint, fontSize: 11 }}>fitandfightclub.com</a>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <div className="flex items-center justify-between flex-wrap gap-2" style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, background: C.panel }}>
          <div className="flex items-center gap-2">
            <Building2 size={14} color={C.textFaint} />
            <Select value={branch} onChange={setBranch} options={BRANCHES} placeholder="All branches" style={{ minWidth: 140 }} />
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: C.textFaint, fontSize: 12 }}>Viewing as</span>
            <Select value={role} onChange={setRole} options={ROLES} style={{ minWidth: 160 }} />
            <Button variant="ghost" size="sm" icon={RefreshCw} onClick={resetAll}>Reset demo data</Button>
          </div>
        </div>

        <div className="ffc-scroll" style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {tab === "dashboard" && (
            <Dashboard {...{ leads, members, memberships, payments, attendance, branch, setTab, setBranch }} />
          )}
          {tab === "leads" && (
            <LeadsTab {...{ leads: byBranch(leads, "center"), setLeads: sLeads, allLeads: leads }} />
          )}
          {tab === "members" && (
            <MembersTab {...{ members: byBranch(members), setMembers: sMembers }} />
          )}
          {tab === "memberships" && (
            <MembershipsTab {...{ memberships: byBranch(memberships), setMemberships: sMemberships, members, memberName }} />
          )}
          {tab === "payments" && (
            <PaymentsTab {...{ payments: branch === "All" ? payments : payments.filter(p => memberBranch(p.memberId) === branch), setPayments: sPayments, members, memberships, memberName }} />
          )}
          {tab === "attendance" && (
            <AttendanceTab {...{ attendance: branch === "All" ? attendance : attendance.filter(a => memberBranch(a.memberId) === branch), setAttendance: sAttendance, members, classes, memberName }} />
          )}
          {tab === "schedule" && (
            <ScheduleTab {...{ classes: byBranch(classes), setClasses: sClasses, members, coaches }} />
          )}
          {tab === "coaches" && (
            <CoachesTab {...{ coaches: byBranch(coaches), setCoaches: sCoaches }} />
          )}
          {tab === "pt" && (
            <AthleteTab {...{ athletes, setAthletes: sAthletes, members, coaches, memberName }} />
          )}
          {tab === "comms" && (
            <CommsTab {...{ leads, memberships, payments, memberName: (id) => memberName(id) }} />
          )}
          {tab === "reports" && (
            <ReportsTab {...{ leads, members, memberships, payments, attendance, coaches, classes }} />
          )}
          {tab === "admin" && <AdminTab />}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Dashboard                                                                */
/* ---------------------------------------------------------------------- */

function Dashboard({ leads, members, memberships, payments, attendance, branch, setTab, setBranch }) {
  const t = todayStr();
  const inBranch = (x, key = "branch") => branch === "All" || (x[key] || x.center) === branch;

  const newEnquiriesToday = leads.filter((l) => l.createdAt === t && inBranch(l, "center")).length;
  const trialsToday = leads.filter((l) => l.trialDate === t && inBranch(l, "center")).length;
  const thisMonth = t.slice(0, 7);
  const conversionsThisMonth = leads.filter((l) => ["Member active", "Renewed"].includes(l.status) && (l.followUpDate || "").slice(0, 7) === thisMonth && inBranch(l, "center")).length;
  const activeMembers = members.filter((m) => inBranch(m)).length;
  const memberIdsInBranch = new Set(members.filter((m) => inBranch(m)).map((m) => m.id));
  const expiring7 = memberships.filter((ms) => memberIdsInBranch.has(ms.memberId) && ms.status !== "Expired" && daysBetween(t, ms.endDate) >= 0 && daysBetween(t, ms.endDate) <= 7).length;
  const expiring30 = memberships.filter((ms) => memberIdsInBranch.has(ms.memberId) && ms.status !== "Expired" && daysBetween(t, ms.endDate) >= 0 && daysBetween(t, ms.endDate) <= 30).length;
  const duePayments = payments.filter((p) => memberIdsInBranch.has(p.memberId) && ["Pending", "Overdue"].includes(p.status));
  const dueAmount = duePayments.reduce((s, p) => s + Number(p.amount || 0), 0);
  const attendanceToday = attendance.filter((a) => a.date === t && memberIdsInBranch.has(a.memberId)).length;
  const revenueThisMonth = payments.filter((p) => p.status === "Paid" && (p.date || "").slice(0, 7) === thisMonth && memberIdsInBranch.has(p.memberId)).reduce((s, p) => s + Number(p.amount || 0), 0);

  const revenueByBranch = BRANCHES.map((b) => {
    const ids = new Set(members.filter((m) => m.branch === b).map((m) => m.id));
    const rev = payments.filter((p) => p.status === "Paid" && ids.has(p.memberId)).reduce((s, p) => s + Number(p.amount || 0), 0);
    return { branch: b, revenue: rev };
  });

  const funnel = LEAD_STATUSES.filter(s => !["Renewed", "Lost"].includes(s)).map((s) => ({ status: s, count: leads.filter((l) => l.status === s).length }));

  return (
    <div>
      <SectionHeader title="Dashboard" subtitle={branch === "All" ? "All branches · today, " + fmtDate(t) : `${branch} branch · today, ${fmtDate(t)}`} />
      <div className="grid grid-cols-4 gap-3 mb-3" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))" }}>
        <StatCard label="New enquiries today" value={newEnquiriesToday} icon={UserPlus} />
        <StatCard label="Trials today" value={trialsToday} icon={CalendarDays} tone="warn" />
        <StatCard label="Conversions this month" value={conversionsThisMonth} icon={TrendingUp} tone="good" />
        <StatCard label="Active members" value={activeMembers} icon={Users} />
        <StatCard label="Expiring in 7 days" value={expiring7} icon={AlertTriangle} tone={expiring7 ? "warn" : "text"} />
        <StatCard label="Expiring in 30 days" value={expiring30} icon={AlertTriangle} />
        <StatCard label="Payment dues" value={fmtMoney(dueAmount)} sub={`${duePayments.length} invoice(s)`} tone={dueAmount ? "bad" : "text"} icon={CreditCard} />
        <StatCard label="Attendance today" value={attendanceToday} icon={ClipboardCheck} />
      </div>
      <StatCard label="Revenue this month" value={fmtMoney(revenueThisMonth)} tone="good" icon={TrendingUp} />

      <div className="grid grid-cols-2 gap-4 mt-4" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr" }}>
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 16 }}>
          <div className="ffc-display" style={{ color: C.text, fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Branch-wise revenue (paid)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueByBranch}>
              <CartesianGrid stroke={C.border} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="branch" stroke={C.textFaint} fontSize={12} tickLine={false} axisLine={{ stroke: C.border }} />
              <YAxis stroke={C.textFaint} fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip contentStyle={{ background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 4, fontSize: 12 }} formatter={(v) => fmtMoney(v)} />
              <Bar dataKey="revenue" fill={C.accent} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 16 }}>
          <div className="ffc-display" style={{ color: C.text, fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Lead pipeline</div>
          <div className="flex flex-col gap-2">
            {funnel.map((f) => (
              <div key={f.status} className="flex items-center gap-2">
                <div style={{ width: 118, fontSize: 12, color: C.textMute, flexShrink: 0 }}>{f.status}</div>
                <div style={{ flex: 1, background: C.panel2, borderRadius: 2, height: 8, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100, f.count * 18)}%`, background: C.accent, height: "100%" }} />
                </div>
                <div style={{ width: 18, textAlign: "right", fontSize: 12, color: C.text, fontWeight: 600 }}>{f.count}</div>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="sm" onClick={() => setTab("leads")} icon={ChevronRight} style={{ marginTop: 12 }}>Open leads & trials</Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Leads & Trials                                                          */
/* ---------------------------------------------------------------------- */

const leadFields = [
  { key: "name", label: "Full name", required: true },
  { key: "phone", label: "Mobile / WhatsApp", required: true },
  { key: "source", label: "Lead source", type: "select", options: SOURCES, required: true },
  { key: "center", label: "Preferred center", type: "select", options: BRANCHES, required: true },
  { key: "program", label: "Interested program", type: "select", options: PROGRAMS, required: true },
  { key: "goal", label: "Goal", type: "select", options: GOALS },
  { key: "budget", label: "Budget", placeholder: "e.g. 8000-10000" },
  { key: "assignedStaff", label: "Assigned staff / branch manager", type: "select", options: STAFF },
  { key: "status", label: "Status", type: "select", options: LEAD_STATUSES, required: true },
  { key: "trialDate", label: "Trial date", type: "date" },
  { key: "trialTime", label: "Trial time", type: "time" },
  { key: "trialCoach", label: "Coach assigned", type: "select", options: COACH_NAMES },
  { key: "trialAttendance", label: "Trial attendance", type: "select", options: ["Pending", "Attended", "No-show"] },
  { key: "followUpDate", label: "Follow-up date", type: "date" },
  { key: "conversionOutcome", label: "Conversion outcome", placeholder: "e.g. Lost - price / Won" },
  { key: "trialFeedback", label: "Trial feedback", type: "textarea", full: true },
  { key: "followUpNotes", label: "Follow-up notes", type: "textarea", full: true },
];

function LeadsTab({ leads, setLeads }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = leads.filter((l) =>
    (!statusFilter || l.status === statusFilter) &&
    (l.name.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search))
  );

  const save = (data) => {
    if (editing) setLeads(leads.map((l) => (l.id === editing.id ? { ...editing, ...data } : l)));
    else setLeads([{ id: uid("lead"), createdAt: todayStr(), ...data }, ...leads]);
    setShowForm(false); setEditing(null);
  };

  const advance = (lead) => {
    const idx = LEAD_STATUSES.indexOf(lead.status);
    const next = LEAD_STATUSES[Math.min(idx + 1, LEAD_STATUSES.length - 1)];
    setLeads(leads.map((l) => (l.id === lead.id ? { ...l, status: next } : l)));
  };

  const columns = [
    { key: "name", label: "Name", render: (r) => <div><div style={{ fontWeight: 600 }}>{r.name}</div><div style={{ fontSize: 11.5, color: C.textFaint }}>{r.phone}</div></div> },
    { key: "center", label: "Center" },
    { key: "program", label: "Program" },
    { key: "goal", label: "Goal" },
    { key: "source", label: "Source" },
    { key: "assignedStaff", label: "Assigned to" },
    { key: "trialDate", label: "Trial", render: (r) => r.trialDate ? `${fmtDate(r.trialDate)} ${r.trialTime || ""}` : "—" },
    { key: "followUpDate", label: "Follow-up", render: (r) => fmtDate(r.followUpDate) },
    { key: "status", label: "Status", render: (r) => <Badge text={r.status} tone={leadStatusTone(r.status)} /> },
    { key: "advance", label: "", render: (r) => (r.status !== "Renewed" && r.status !== "Lost") ? <button onClick={() => advance(r)} title="Move to next stage" style={{ color: C.blue }}><ChevronRight size={15} /></button> : null },
  ];

  return (
    <div>
      <SectionHeader title="Leads & Trials" subtitle="New enquiry → Contacted → Trial booked → Trial attended → Interested → Payment pending → Member active → Renewal due → Renewed / Lost"
        right={<Button icon={Plus} onClick={() => { setEditing(null); setShowForm(true); }}>Add lead</Button>} />
      <Toolbar search={search} setSearch={setSearch} right={
        <Select value={statusFilter} onChange={setStatusFilter} options={LEAD_STATUSES} placeholder="All statuses" />
      } />
      <Table columns={columns} rows={filtered}
        onEdit={(r) => { setEditing(r); setShowForm(true); }}
        onDelete={(r) => { if (confirm(`Delete lead ${r.name}?`)) setLeads(leads.filter((l) => l.id !== r.id)); }} />
      {showForm && (
        <Modal title={editing ? "Edit lead" : "Add lead"} onClose={() => { setShowForm(false); setEditing(null); }} width={680}>
          <EntityForm fields={leadFields} initial={editing || { status: "New enquiry", trialAttendance: "Pending" }} onSubmit={save} onCancel={() => { setShowForm(false); setEditing(null); }} />
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Members                                                                  */
/* ---------------------------------------------------------------------- */

const memberFields = [
  { key: "name", label: "Full name", required: true },
  { key: "phone", label: "Phone", required: true },
  { key: "email", label: "Email", type: "email" },
  { key: "branch", label: "Preferred branch", type: "select", options: BRANCHES, required: true },
  { key: "program", label: "Preferred program", type: "select", options: PROGRAMS, required: true },
  { key: "goals", label: "Fitness goals", type: "select", options: GOALS },
  { key: "joinDate", label: "Join date", type: "date" },
  { key: "emergencyName", label: "Emergency contact name" },
  { key: "emergencyPhone", label: "Emergency contact phone" },
  { key: "medical", label: "Medical / injury declaration", type: "textarea", full: true },
  { key: "notes", label: "Documents & notes", type: "textarea", full: true },
];

function MembersTab({ members, setMembers }) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const filtered = members.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search));

  const save = (data) => {
    if (editing) setMembers(members.map((m) => (m.id === editing.id ? { ...editing, ...data } : m)));
    else setMembers([{ id: uid("mem"), ...data }, ...members]);
    setShowForm(false); setEditing(null);
  };

  const columns = [
    { key: "name", label: "Member", render: (r) => (
      <div className="flex items-center gap-2">
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.panel3, color: C.textMute, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{initials(r.name)}</div>
        <div><div style={{ fontWeight: 600 }}>{r.name}</div><div style={{ fontSize: 11.5, color: C.textFaint }}>{r.phone}</div></div>
      </div>
    ) },
    { key: "branch", label: "Branch" },
    { key: "program", label: "Program" },
    { key: "goals", label: "Goal" },
    { key: "joinDate", label: "Joined", render: (r) => fmtDate(r.joinDate) },
    { key: "medical", label: "Medical notes", render: (r) => <span style={{ color: r.medical && r.medical !== "None declared" ? C.amber : C.textFaint }}>{r.medical || "None declared"}</span> },
    { key: "emergencyName", label: "Emergency contact", render: (r) => r.emergencyName ? `${r.emergencyName} (${r.emergencyPhone})` : "—" },
  ];

  return (
    <div>
      <SectionHeader title="Member profiles" subtitle="Contact details, emergency contact, medical declarations, goals and documents"
        right={<Button icon={Plus} onClick={() => { setEditing(null); setShowForm(true); }}>Add member</Button>} />
      <Toolbar search={search} setSearch={setSearch} />
      <Table columns={columns} rows={filtered}
        onEdit={(r) => { setEditing(r); setShowForm(true); }}
        onDelete={(r) => { if (confirm(`Remove member ${r.name}?`)) setMembers(members.filter((m) => m.id !== r.id)); }} />
      {showForm && (
        <Modal title={editing ? "Edit member" : "Add member"} onClose={() => { setShowForm(false); setEditing(null); }} width={680}>
          <EntityForm fields={memberFields} initial={editing || { joinDate: todayStr() }} onSubmit={save} onCancel={() => { setShowForm(false); setEditing(null); }} />
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Memberships                                                             */
/* ---------------------------------------------------------------------- */

function membershipFieldsFn(members) {
  return [
    { key: "memberId", label: "Member", type: "select", options: members.map((m) => m.id), required: true },
    { key: "plan", label: "Plan", type: "select", options: PLANS, required: true },
    { key: "branch", label: "Branch", type: "select", options: BRANCHES, required: true },
    { key: "startDate", label: "Start date", type: "date", required: true },
    { key: "endDate", label: "End date", type: "date", required: true },
    { key: "price", label: "Price (₹)", type: "number" },
    { key: "status", label: "Status", type: "select", options: ["Active", "Frozen", "Upgraded", "Transferred", "Renewal due", "Expired"] },
    { key: "freezeDays", label: "Freeze days used", type: "number" },
    { key: "notes", label: "Notes", type: "textarea", full: true },
  ];
}

function MembershipsTab({ memberships, setMemberships, members, memberName }) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const t = todayStr();

  const enriched = memberships.map((m) => ({ ...m, _name: memberName(m.memberId), _daysLeft: daysBetween(t, m.endDate) }));
  const filtered = enriched.filter((m) => m._name.toLowerCase().includes(search.toLowerCase()));

  const fields = useMemo(() => membershipFieldsFn(members), [members]);
  const fieldsWithLabels = fields.map((f) => f.key === "memberId" ? { ...f, options: members.map((m) => m.name), _idMap: true } : f);

  const save = (data) => {
    const memberId = members.find((m) => m.name === data.memberId)?.id || data.memberId;
    const payload = { ...data, memberId };
    if (editing) setMemberships(memberships.map((m) => (m.id === editing.id ? { ...editing, ...payload } : m)));
    else setMemberships([{ id: uid("msh"), ...payload }, ...memberships]);
    setShowForm(false); setEditing(null);
  };

  const columns = [
    { key: "_name", label: "Member" },
    { key: "plan", label: "Plan" },
    { key: "branch", label: "Branch" },
    { key: "startDate", label: "Start", render: (r) => fmtDate(r.startDate) },
    { key: "endDate", label: "End", render: (r) => fmtDate(r.endDate) },
    { key: "price", label: "Price", render: (r) => fmtMoney(r.price) },
    { key: "status", label: "Status", render: (r) => {
      const tone = r._daysLeft < 0 ? "bad" : r._daysLeft <= 7 ? "warn" : r.status === "Active" ? "good" : "mute";
      const label = r._daysLeft < 0 && r.status !== "Renewed" ? "Expired" : r.status;
      return <Badge text={label} tone={tone} />;
    } },
    { key: "_daysLeft", label: "Renewal", render: (r) => r._daysLeft >= 0 ? `${r._daysLeft} day(s) left` : `${Math.abs(r._daysLeft)} day(s) overdue` },
  ];

  return (
    <div>
      <SectionHeader title="Memberships" subtitle="Plans, start/end dates, freezes, upgrades, transfers and renewal reminders"
        right={<Button icon={Plus} onClick={() => { setEditing(null); setShowForm(true); }}>Add membership</Button>} />
      <Toolbar search={search} setSearch={setSearch} />
      <Table columns={columns} rows={filtered}
        onEdit={(r) => { setEditing({ ...r, memberId: memberName(r.memberId) }); setShowForm(true); }}
        onDelete={(r) => { if (confirm("Delete this membership record?")) setMemberships(memberships.filter((m) => m.id !== r.id)); }} />
      {showForm && (
        <Modal title={editing ? "Edit membership" : "Add membership"} onClose={() => { setShowForm(false); setEditing(null); }}>
          <EntityForm fields={fieldsWithLabels} initial={editing || { startDate: todayStr(), endDate: addDays(todayStr(), 90), status: "Active", branch: BRANCHES[0] }} onSubmit={save} onCancel={() => { setShowForm(false); setEditing(null); }} />
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Payments                                                                 */
/* ---------------------------------------------------------------------- */

function PaymentsTab({ payments, setPayments, members, memberships, memberName }) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const enriched = payments.map((p) => ({ ...p, _name: memberName(p.memberId) }));
  const filtered = enriched.filter((p) => p._name.toLowerCase().includes(search.toLowerCase()));

  const fields = [
    { key: "memberId", label: "Member", type: "select", options: members.map((m) => m.name), required: true },
    { key: "membershipId", label: "Membership plan", type: "select", options: memberships.map((m) => `${m.plan} (${memberName(m.memberId)})`) },
    { key: "amount", label: "Amount (₹)", type: "number", required: true },
    { key: "mode", label: "Payment mode", type: "select", options: PAY_MODES },
    { key: "type", label: "Payment type", type: "select", options: PAY_TYPES },
    { key: "status", label: "Status", type: "select", options: ["Paid", "Pending", "Overdue", "Refunded"] },
    { key: "date", label: "Payment date", type: "date" },
    { key: "dueDate", label: "Due date", type: "date" },
    { key: "discount", label: "Discount (₹)", type: "number" },
    { key: "gst", label: "GST applicable", type: "checkbox" },
    { key: "gstAmount", label: "GST amount (₹)", type: "number" },
    { key: "receiptNo", label: "Receipt number" },
  ];

  const save = (data) => {
    const memberId = members.find((m) => m.name === data.memberId)?.id || data.memberId;
    const membershipMatch = memberships.find((m) => `${m.plan} (${memberName(m.memberId)})` === data.membershipId);
    const payload = { ...data, memberId, membershipId: membershipMatch ? membershipMatch.id : data.membershipId };
    if (editing) setPayments(payments.map((p) => (p.id === editing.id ? { ...editing, ...payload } : p)));
    else setPayments([{ id: uid("pay"), ...payload }, ...payments]);
    setShowForm(false); setEditing(null);
  };

  const statusTone = (s) => ({ Paid: "good", Pending: "warn", Overdue: "bad", Refunded: "mute" }[s] || "mute");

  const columns = [
    { key: "_name", label: "Member" },
    { key: "amount", label: "Amount", render: (r) => fmtMoney(r.amount) },
    { key: "type", label: "Type" },
    { key: "mode", label: "Mode" },
    { key: "discount", label: "Discount", render: (r) => fmtMoney(r.discount) },
    { key: "gst", label: "GST", render: (r) => r.gst ? fmtMoney(r.gstAmount) : "—" },
    { key: "dueDate", label: "Due date", render: (r) => fmtDate(r.dueDate) },
    { key: "status", label: "Status", render: (r) => <Badge text={r.status} tone={statusTone(r.status)} /> },
    { key: "receiptNo", label: "Receipt #" },
  ];

  const totalDue = filtered.filter(p => ["Pending", "Overdue"].includes(p.status)).reduce((s, p) => s + Number(p.amount || 0), 0);

  return (
    <div>
      <SectionHeader title="Payments" subtitle="Invoices, part payments / EMIs, discounts, receipts and due-date reminders"
        right={<Button icon={Plus} onClick={() => { setEditing(null); setShowForm(true); }}>Record payment</Button>} />
      <div className="mb-3"><Badge text={`Outstanding dues: ${fmtMoney(totalDue)}`} tone={totalDue ? "bad" : "good"} /></div>
      <Toolbar search={search} setSearch={setSearch} />
      <Table columns={columns} rows={filtered}
        onEdit={(r) => { setEditing({ ...r, memberId: memberName(r.memberId), membershipId: memberships.find(m => m.id === r.membershipId) ? `${memberships.find(m => m.id === r.membershipId).plan} (${memberName(r.memberId)})` : "" }); setShowForm(true); }}
        onDelete={(r) => { if (confirm("Delete this payment record?")) setPayments(payments.filter((p) => p.id !== r.id)); }} />
      {showForm && (
        <Modal title={editing ? "Edit payment" : "Record payment"} onClose={() => { setShowForm(false); setEditing(null); }}>
          <EntityForm fields={fields} initial={editing || { status: "Paid", mode: "UPI", type: "Full payment", date: todayStr(), dueDate: todayStr() }} onSubmit={save} onCancel={() => { setShowForm(false); setEditing(null); }} />
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Attendance                                                               */
/* ---------------------------------------------------------------------- */

function AttendanceTab({ attendance, setAttendance, members, classes, memberName }) {
  const [date, setDate] = useState(todayStr());
  const [showForm, setShowForm] = useState(false);

  const fields = [
    { key: "memberId", label: "Member", type: "select", options: members.map((m) => m.name), required: true },
    { key: "classId", label: "Class", type: "select", options: classes.map((c) => `${c.program} · ${c.branch} · ${c.time}`) },
    { key: "date", label: "Date", type: "date", required: true },
    { key: "status", label: "Status", type: "select", options: ["Present", "No-show", "Late"] },
  ];

  const save = (data) => {
    const memberId = members.find((m) => m.name === data.memberId)?.id || data.memberId;
    const classMatch = classes.find((c) => `${c.program} · ${c.branch} · ${c.time}` === data.classId);
    setAttendance([{ id: uid("att"), ...data, memberId, classId: classMatch ? classMatch.id : "" }, ...attendance]);
    setShowForm(false);
  };

  const todays = attendance.filter((a) => a.date === date);
  const present = todays.filter((a) => a.status === "Present").length;
  const noShow = todays.filter((a) => a.status === "No-show").length;
  const late = todays.filter((a) => a.status === "Late").length;

  const columns = [
    { key: "member", label: "Member", render: (r) => memberName(r.memberId) },
    { key: "classId", label: "Class", render: (r) => { const c = classes.find((c) => c.id === r.classId); return c ? `${c.program} · ${c.branch} · ${c.time}` : "Check-in"; } },
    { key: "status", label: "Status", render: (r) => <Badge text={r.status} tone={r.status === "Present" ? "good" : r.status === "Late" ? "warn" : "bad"} /> },
  ];

  return (
    <div>
      <SectionHeader title="Attendance" subtitle="Receptionist check-in (QR / PIN model), class attendance, no-shows and late arrivals"
        right={<Button icon={Plus} onClick={() => setShowForm(true)}>Check in member</Button>} />
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ width: 170 }} />
        <Badge text={`Present: ${present}`} tone="good" />
        <Badge text={`Late: ${late}`} tone="warn" />
        <Badge text={`No-show: ${noShow}`} tone="bad" />
      </div>
      <Table columns={columns} rows={todays}
        onDelete={(r) => setAttendance(attendance.filter((a) => a.id !== r.id))} />
      {showForm && (
        <Modal title="Check in member" onClose={() => setShowForm(false)}>
          <EntityForm fields={fields} initial={{ date, status: "Present" }} onSubmit={save} onCancel={() => setShowForm(false)} />
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Class schedule                                                           */
/* ---------------------------------------------------------------------- */

function ScheduleTab({ classes, setClasses, members, coaches }) {
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fields = [
    { key: "branch", label: "Branch", type: "select", options: BRANCHES, required: true },
    { key: "program", label: "Program", type: "select", options: PROGRAMS, required: true },
    { key: "coach", label: "Coach", type: "select", options: coaches.map((c) => c.name) },
    { key: "day", label: "Days", placeholder: "e.g. Mon/Wed/Fri" },
    { key: "time", label: "Time", type: "time" },
    { key: "capacity", label: "Capacity", type: "number" },
  ];

  const save = (data) => {
    if (editing) setClasses(classes.map((c) => (c.id === editing.id ? { ...editing, ...data } : c)));
    else setClasses([{ id: uid("cls"), bookedMemberIds: [], ...data }, ...classes]);
    setShowForm(false); setEditing(null);
  };

  const columns = [
    { key: "program", label: "Program" },
    { key: "branch", label: "Branch" },
    { key: "coach", label: "Coach" },
    { key: "day", label: "Days" },
    { key: "time", label: "Time" },
    { key: "capacity", label: "Capacity / Booked", render: (r) => {
      const booked = (r.bookedMemberIds || []).length;
      const full = booked >= Number(r.capacity || 0);
      return <Badge text={`${booked} / ${r.capacity}${full ? " · Waitlist" : ""}`} tone={full ? "warn" : "mute"} />;
    } },
  ];

  return (
    <div>
      <SectionHeader title="Class scheduling" subtitle="Timetable by branch, program and coach, with capacity and waitlist"
        right={<Button icon={Plus} onClick={() => { setEditing(null); setShowForm(true); }}>Add class</Button>} />
      <Table columns={columns} rows={classes}
        onEdit={(r) => { setEditing(r); setShowForm(true); }}
        onDelete={(r) => { if (confirm("Cancel this class?")) setClasses(classes.filter((c) => c.id !== r.id)); }} />
      {showForm && (
        <Modal title={editing ? "Edit class" : "Add class"} onClose={() => { setShowForm(false); setEditing(null); }}>
          <EntityForm fields={fields} initial={editing || { branch: BRANCHES[0], capacity: 20 }} onSubmit={save} onCancel={() => { setShowForm(false); setEditing(null); }} />
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Coaches & staff                                                          */
/* ---------------------------------------------------------------------- */

function CoachesTab({ coaches, setCoaches }) {
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fields = [
    { key: "name", label: "Coach name", required: true },
    { key: "branch", label: "Branch", type: "select", options: BRANCHES, required: true },
    { key: "specialties", label: "Specialties", placeholder: "e.g. MMA, Muay Thai" },
    { key: "qualifications", label: "Qualifications" },
    { key: "availability", label: "Availability", placeholder: "e.g. Mon-Sat, 4pm-9pm" },
    { key: "commission", label: "Payroll / commission notes", type: "textarea", full: true },
  ];

  const save = (data) => {
    if (editing) setCoaches(coaches.map((c) => (c.id === editing.id ? { ...editing, ...data } : c)));
    else setCoaches([{ id: uid("coach"), ...data }, ...coaches]);
    setShowForm(false); setEditing(null);
  };

  const columns = [
    { key: "name", label: "Coach" },
    { key: "branch", label: "Branch" },
    { key: "specialties", label: "Specialties" },
    { key: "qualifications", label: "Qualifications" },
    { key: "availability", label: "Availability" },
    { key: "commission", label: "Payroll / commission" },
  ];

  return (
    <div>
      <SectionHeader title="Coaches & staff" subtitle="Profiles, qualifications, specialties, availability and payroll / commission inputs"
        right={<Button icon={Plus} onClick={() => { setEditing(null); setShowForm(true); }}>Add coach</Button>} />
      <Table columns={columns} rows={coaches}
        onEdit={(r) => { setEditing(r); setShowForm(true); }}
        onDelete={(r) => { if (confirm(`Remove ${r.name}?`)) setCoaches(coaches.filter((c) => c.id !== r.id)); }} />
      {showForm && (
        <Modal title={editing ? "Edit coach" : "Add coach"} onClose={() => { setShowForm(false); setEditing(null); }}>
          <EntityForm fields={fields} initial={editing || { branch: BRANCHES[0] }} onSubmit={save} onCancel={() => { setShowForm(false); setEditing(null); }} />
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* PT & Athlete tracking (phase-2 preview)                                 */
/* ---------------------------------------------------------------------- */

function AthleteTab({ athletes, setAthletes, members, coaches, memberName }) {
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fields = [
    { key: "memberId", label: "Member", type: "select", options: members.map((m) => m.name), required: true },
    { key: "type", label: "Track", type: "select", options: ["Personal Training", "MMA Athlete"], required: true },
    { key: "trainer", label: "Trainer / coach", type: "select", options: coaches.map((c) => c.name) },
    { key: "skillLevel", label: "Skill level", type: "select", options: ["Beginner", "Intermediate", "Advanced", "Competitive"] },
    { key: "weightCategory", label: "Weight category (MMA)" },
    { key: "medicalClearance", label: "Medical clearance" },
    { key: "competitionReg", label: "Competition registration" },
    { key: "sessionBalance", label: "PT session balance", placeholder: "e.g. 18 of 24 sessions left" },
    { key: "fightHistory", label: "Fight history / sparring notes", type: "textarea", full: true },
    { key: "notes", label: "Progress notes (measurements, photos log)", type: "textarea", full: true },
  ];

  const save = (data) => {
    const memberId = members.find((m) => m.name === data.memberId)?.id || data.memberId;
    const payload = { ...data, memberId };
    if (editing) setAthletes(athletes.map((a) => (a.id === editing.id ? { ...editing, ...payload } : a)));
    else setAthletes([{ id: uid("pt"), ...payload }, ...athletes]);
    setShowForm(false); setEditing(null);
  };

  const columns = [
    { key: "member", label: "Member", render: (r) => memberName(r.memberId) },
    { key: "type", label: "Track", render: (r) => <Badge text={r.type} tone={r.type === "MMA Athlete" ? "bad" : "info"} /> },
    { key: "trainer", label: "Trainer" },
    { key: "skillLevel", label: "Level" },
    { key: "weightCategory", label: "Weight cat." },
    { key: "sessionBalance", label: "PT sessions" },
    { key: "medicalClearance", label: "Medical clearance" },
  ];

  return (
    <div>
      <SectionHeader title="Personal training & athlete tracking" subtitle="Phase 2 preview — PT packages, trainer assignment, session balance, and MMA fight history / medical clearance / weight category"
        right={<Button icon={Plus} onClick={() => { setEditing(null); setShowForm(true); }}>Add record</Button>} />
      <Table columns={columns} rows={athletes}
        onEdit={(r) => { setEditing({ ...r, memberId: memberName(r.memberId) }); setShowForm(true); }}
        onDelete={(r) => { if (confirm("Delete this record?")) setAthletes(athletes.filter((a) => a.id !== r.id)); }} />
      <div style={{ marginTop: 14, fontSize: 12, color: C.textFaint }}>
        Full phase-2 scope also includes progress photo storage and automated campaign triggers — build these once phase 1 (leads, memberships, payments, attendance, dashboard) is live and adopted by staff.
      </div>
      {showForm && (
        <Modal title={editing ? "Edit record" : "Add PT / athlete record"} onClose={() => { setShowForm(false); setEditing(null); }} width={640}>
          <EntityForm fields={fields} initial={editing || { type: "Personal Training", skillLevel: "Beginner" }} onSubmit={save} onCancel={() => { setShowForm(false); setEditing(null); }} />
        </Modal>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Communication & follow-ups                                              */
/* ---------------------------------------------------------------------- */

const DEFAULT_TEMPLATES = [
  { id: "tpl1", name: "New enquiry", channel: "WhatsApp", text: "Hi {{name}}, thanks for your interest in FIT & FIGHT CLUB {{center}}! Our team will call you shortly to schedule your free trial." },
  { id: "tpl2", name: "Trial reminder", channel: "WhatsApp", text: "Hi {{name}}, this is a reminder for your free trial at FIT & FIGHT CLUB {{center}} on {{trialDate}} at {{trialTime}}. See you on the mats!" },
  { id: "tpl3", name: "Missed class", channel: "WhatsApp", text: "Hi {{name}}, we missed you at today's {{program}} class. Let us know if you'd like to reschedule or need help with your training plan." },
  { id: "tpl4", name: "Payment due", channel: "SMS", text: "Hi {{name}}, a payment of {{amount}} for your FIT & FIGHT CLUB membership is due on {{dueDate}}. Please clear it to avoid interruption." },
  { id: "tpl5", name: "Renewal reminder", channel: "WhatsApp", text: "Hi {{name}}, your {{plan}} membership expires on {{endDate}}. Renew now to keep your streak going and lock in your current rate!" },
  { id: "tpl6", name: "Birthday", channel: "WhatsApp", text: "Happy Birthday {{name}}! 🎉 Team FIT & FIGHT CLUB wishes you strength and a great year ahead. Enjoy a free PT session on us this week." },
  { id: "tpl7", name: "Win-back", channel: "Email", text: "Hi {{name}}, we haven't seen you at FIT & FIGHT CLUB in a while. Come back this month and get 20% off your renewal — we'd love to have you back." },
];

function CommsTab({ leads, memberships, payments, memberName }) {
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const t = todayStr();

  const followUpLeads = leads.filter((l) => l.followUpDate && l.followUpDate <= t && !["Renewed", "Lost"].includes(l.status));
  const renewalsDue = memberships.filter((m) => daysBetween(t, m.endDate) <= 7 && daysBetween(t, m.endDate) >= 0);
  const paymentsDue = payments.filter((p) => ["Pending", "Overdue"].includes(p.status));

  const updateTpl = (id, text) => setTemplates(templates.map((tp) => (tp.id === id ? { ...tp, text } : tp)));

  return (
    <div>
      <SectionHeader title="Follow-ups & communication templates" subtitle="Daily task list plus WhatsApp / SMS / email templates for key moments in the member journey" />

      <div className="grid grid-cols-3 gap-3 mb-6" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))" }}>
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 14 }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Lead follow-ups due</span>
            <Badge text={followUpLeads.length} tone="warn" />
          </div>
          {followUpLeads.slice(0, 6).map((l) => (
            <div key={l.id} className="flex items-center justify-between" style={{ fontSize: 12.5, padding: "5px 0", borderTop: `1px solid ${C.border}` }}>
              <span style={{ color: C.text }}>{l.name}</span><span style={{ color: C.textFaint }}>{fmtDate(l.followUpDate)}</span>
            </div>
          ))}
          {followUpLeads.length === 0 && <div style={{ color: C.textFaint, fontSize: 12.5 }}>All caught up.</div>}
        </div>
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 14 }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Renewals due (7 days)</span>
            <Badge text={renewalsDue.length} tone="bad" />
          </div>
          {renewalsDue.slice(0, 6).map((m) => (
            <div key={m.id} className="flex items-center justify-between" style={{ fontSize: 12.5, padding: "5px 0", borderTop: `1px solid ${C.border}` }}>
              <span style={{ color: C.text }}>{memberName(m.memberId)}</span><span style={{ color: C.textFaint }}>{fmtDate(m.endDate)}</span>
            </div>
          ))}
          {renewalsDue.length === 0 && <div style={{ color: C.textFaint, fontSize: 12.5 }}>None this week.</div>}
        </div>
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 14 }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Payments pending / overdue</span>
            <Badge text={paymentsDue.length} tone="bad" />
          </div>
          {paymentsDue.slice(0, 6).map((p) => (
            <div key={p.id} className="flex items-center justify-between" style={{ fontSize: 12.5, padding: "5px 0", borderTop: `1px solid ${C.border}` }}>
              <span style={{ color: C.text }}>{memberName(p.memberId)}</span><span style={{ color: C.textFaint }}>{fmtMoney(p.amount)}</span>
            </div>
          ))}
          {paymentsDue.length === 0 && <div style={{ color: C.textFaint, fontSize: 12.5 }}>No dues.</div>}
        </div>
      </div>

      <div className="ffc-display" style={{ color: C.text, fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Message templates</div>
      <p style={{ color: C.textFaint, fontSize: 12, marginBottom: 10 }}>Editable now; connect a WhatsApp Business API / SMS gateway provider in phase 2 to send these automatically on trigger.</p>
      <div className="flex flex-col gap-2">
        {templates.map((tpl) => (
          <div key={tpl.id} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 12 }}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ fontWeight: 600, fontSize: 13, color: C.text }}>{tpl.name}</span>
              <Badge text={tpl.channel} tone="info" />
            </div>
            <textarea value={tpl.text} onChange={(e) => updateTpl(tpl.id, e.target.value)} rows={2}
              style={{ width: "100%", background: C.panel2, border: `1px solid ${C.border}`, borderRadius: 3, color: C.text, fontSize: 12.5, padding: 8, resize: "vertical" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Reports                                                                  */
/* ---------------------------------------------------------------------- */

function ReportsTab({ leads, members, memberships, payments, attendance, coaches, classes }) {
  const t = todayStr();
  const totalLeads = leads.length;
  const trialCount = leads.filter((l) => l.trialDate).length;
  const memberCount = leads.filter((l) => ["Member active", "Renewed"].includes(l.status)).length;
  const leadToTrial = totalLeads ? Math.round((trialCount / totalLeads) * 100) : 0;
  const trialToMember = trialCount ? Math.round((memberCount / trialCount) * 100) : 0;

  const revenueTotal = payments.filter((p) => p.status === "Paid").reduce((s, p) => s + Number(p.amount || 0), 0);
  const outstanding = payments.filter((p) => ["Pending", "Overdue"].includes(p.status)).reduce((s, p) => s + Number(p.amount || 0), 0);

  const expired = memberships.filter((m) => daysBetween(t, m.endDate) < 0);
  const renewed = leads.filter((l) => l.status === "Renewed").length;
  const churnRate = expired.length ? Math.round(((expired.length - renewed) / expired.length) * 100) : 0;

  const coachUtil = coaches.map((c) => ({ name: c.name, classes: classes.filter((cl) => cl.coach === c.name).length, sessions: attendance.filter((a) => { const cl = classes.find((x) => x.id === a.classId); return cl && cl.coach === c.name; }).length }));

  const programPerf = PROGRAMS.map((p) => ({ program: p, leads: leads.filter((l) => l.program === p).length, members: members.filter((m) => m.program === p).length }));

  const branchPerf = BRANCHES.map((b) => ({
    branch: b,
    leads: leads.filter((l) => l.center === b).length,
    members: members.filter((m) => m.branch === b).length,
    revenue: payments.filter((p) => p.status === "Paid" && members.find((m) => m.id === p.memberId)?.branch === b).reduce((s, p) => s + Number(p.amount || 0), 0),
  }));

  return (
    <div>
      <SectionHeader title="Reports" subtitle="Conversion, revenue, dues, attendance, churn, coach utilization and branch performance" />

      <div className="grid grid-cols-4 gap-3 mb-5" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))" }}>
        <StatCard label="Lead → Trial conversion" value={`${leadToTrial}%`} tone="info" />
        <StatCard label="Trial → Member conversion" value={`${trialToMember}%`} tone="good" />
        <StatCard label="Total revenue (paid)" value={fmtMoney(revenueTotal)} tone="good" />
        <StatCard label="Outstanding dues" value={fmtMoney(outstanding)} tone={outstanding ? "bad" : "text"} />
      </div>
      <StatCard label="Churn rate (expired & not renewed)" value={`${churnRate}%`} sub={`${expired.length} membership(s) expired`} tone={churnRate > 30 ? "bad" : "warn"} />

      <div className="grid grid-cols-2 gap-4 mt-5" style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 14 }}>
          <div className="ffc-display" style={{ color: C.text, fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Branch performance</div>
          <Table columns={[
            { key: "branch", label: "Branch" }, { key: "leads", label: "Leads" }, { key: "members", label: "Members" },
            { key: "revenue", label: "Revenue", render: (r) => fmtMoney(r.revenue) },
          ]} rows={branchPerf} />
        </div>
        <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 14 }}>
          <div className="ffc-display" style={{ color: C.text, fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Program performance</div>
          <Table columns={[
            { key: "program", label: "Program" }, { key: "leads", label: "Leads" }, { key: "members", label: "Members" },
          ]} rows={programPerf} />
        </div>
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 14, marginTop: 16 }}>
        <div className="ffc-display" style={{ color: C.text, fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Coach utilization</div>
        <Table columns={[
          { key: "name", label: "Coach" }, { key: "classes", label: "Classes assigned" }, { key: "sessions", label: "Attendance logged" },
        ]} rows={coachUtil} />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Admin & roles                                                            */
/* ---------------------------------------------------------------------- */

function AdminTab() {
  const rows = [
    { role: "Founder / Admin", access: "All branches, all modules, financial data, staff management" },
    { role: "Branch Manager", access: "Own branch leads, members, memberships, payments, attendance, schedule, reports" },
    { role: "Receptionist", access: "Leads, trials, member check-in, attendance, class schedule, follow-up tasks" },
    { role: "Coach", access: "Assigned members, attendance for own classes, PT / athlete session notes" },
    { role: "Accountant", access: "Memberships, payments, invoices, dues, financial reports — no lead or medical data" },
  ];
  return (
    <div>
      <SectionHeader title="Admin & permissions" subtitle="Role-based access — switch roles from the top bar to preview what each role sees" />
      <Table columns={[{ key: "role", label: "Role" }, { key: "access", label: "Access" }]} rows={rows} />
      <div style={{ marginTop: 16, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 4, padding: 14, fontSize: 12.5, color: C.textMute, lineHeight: 1.6 }}>
        This preview enforces role visibility on the navigation only. In production, pair this with real authentication (e.g. email/OTP login) and server-side row-level permissions per branch and role, so a receptionist's account cannot query another branch's financial data even via the API.
      </div>
    </div>
  );
}
