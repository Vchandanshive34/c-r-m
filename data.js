"use strict";

/* ============================================================
   FIT & FIGHT CLUB — seed data
   Anchor date is fixed so the demo reads sensibly regardless of
   when it's actually opened.
   ============================================================ */
const TODAY = new Date(2026, 7, 31); // 31 Aug 2026 (Mon)
const DAY = 86400000;
function d(offset, h, m){ const x = new Date(TODAY.getTime()+offset*DAY); if(h!=null) x.setHours(h, m||0,0,0); return x; }
function iso(dt){ return dt.toISOString().slice(0,10); }
function isoT(dt){ return dt.toISOString().slice(0,16); }
let _uid = 1000;
function uid(pfx){ return pfx + (_uid++); }
function fmtDate(s){ if(!s) return "—"; const x=new Date(s); if(isNaN(x)) return s; return x.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}); }
function fmtDateShort(s){ if(!s) return "—"; const x=new Date(s); if(isNaN(x)) return s; return x.toLocaleDateString("en-IN",{day:"2-digit",month:"short"}); }
function fmtTime(s){ if(!s) return ""; const [h,m]=String(s).split(":").map(Number); const dt=new Date(); dt.setHours(h,m||0); return dt.toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit"}); }
function fmtMoney(n){ if(n==null||isNaN(n)) return "—"; return "₹" + Math.round(n).toLocaleString("en-IN"); }
function daysBetween(a,b){ return Math.round((new Date(b)-new Date(a))/DAY); }
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
function initials(name){ return String(name||"?").trim().split(/\s+/).slice(0,2).map(w=>w[0]).join("").toUpperCase(); }

const BRANCHES = [
  { key:"vashi",   name:"Vashi",   color:"var(--br-vashi)",   address:"Sector 17, Vashi, Navi Mumbai", phone:"+91 98200 11223" },
  { key:"nerul",   name:"Nerul",   color:"var(--br-nerul)",   address:"Seawoods Rd, Nerul, Navi Mumbai", phone:"+91 98200 33445" },
  { key:"wagholi", name:"Wagholi", color:"var(--br-wagholi)", address:"Pune-Nagar Rd, Wagholi, Pune", phone:"+91 98200 55667" },
];
function branch(key){ return BRANCHES.find(b=>b.key===key); }

const PROGRAMS = ["Conditioning","MMA","Personal Training"];

const STAFF = [
  { id:"S1", name:"Rohan Deshpande", role:"admin",       branch:null,      phone:"+91 90210 10001", email:"rohan@fitandfightclub.com" },
  { id:"S2", name:"Ananya Kulkarni", role:"manager",     branch:"vashi",   phone:"+91 90210 10002", email:"ananya.k@fitandfightclub.com" },
  { id:"S3", name:"Sameer Shaikh",   role:"manager",     branch:"nerul",   phone:"+91 90210 10003", email:"sameer.s@fitandfightclub.com" },
  { id:"S4", name:"Priya Naik",      role:"manager",     branch:"wagholi", phone:"+91 90210 10004", email:"priya.n@fitandfightclub.com" },
  { id:"S5", name:"Neha Joshi",      role:"receptionist",branch:"vashi",   phone:"+91 90210 10005", email:"neha.j@fitandfightclub.com" },
  { id:"S6", name:"Om Patil",        role:"receptionist",branch:"nerul",   phone:"+91 90210 10006", email:"om.p@fitandfightclub.com" },
  { id:"S7", name:"Kavita More",     role:"receptionist",branch:"wagholi", phone:"+91 90210 10007", email:"kavita.m@fitandfightclub.com" },
  { id:"S8", name:"Vikrant Rane",    role:"coach",       branch:"vashi",   phone:"+91 90210 10008", email:"vikrant.r@fitandfightclub.com",
    specialties:["MMA","Sparring"], qualification:"Brown belt BJJ, 9yr coaching", availability:"Mon–Sat, 6am–8pm" },
  { id:"S9", name:"Arjun Salvi",     role:"coach",       branch:"vashi",   phone:"+91 90210 10009", email:"arjun.s@fitandfightclub.com",
    specialties:["Conditioning","Strength"], qualification:"ACE-CPT, 6yr coaching", availability:"Mon–Sat, 6am–2pm" },
  { id:"S10",name:"Farhan Sheikh",   role:"coach",       branch:"nerul",  phone:"+91 90210 10010", email:"farhan.s@fitandfightclub.com",
    specialties:["MMA","Muay Thai"], qualification:"Muay Thai Kru, state-level fighter", availability:"Tue–Sun, 7am–9pm" },
  { id:"S11",name:"Ritu Ahluwalia",  role:"coach",       branch:"nerul",  phone:"+91 90210 10011", email:"ritu.a@fitandfightclub.com",
    specialties:["Personal Training","Conditioning"], qualification:"K11 certified, 7yr coaching", availability:"Mon–Sat, 8am–7pm" },
  { id:"S12",name:"Sagar Bhosale",   role:"coach",       branch:"wagholi",phone:"+91 90210 10012", email:"sagar.b@fitandfightclub.com",
    specialties:["MMA","Wrestling"], qualification:"State wrestling medallist, 5yr coaching", availability:"Mon–Sat, 6am–8pm" },
  { id:"S13",name:"Meera Iyer",      role:"coach",       branch:"wagholi",phone:"+91 90210 10013", email:"meera.i@fitandfightclub.com",
    specialties:["Conditioning","Personal Training"], qualification:"ACSM-CPT, 4yr coaching", availability:"Mon–Sat, 6am–1pm, 4–8pm" },
  { id:"S14",name:"Suresh Pillai",   role:"accountant",  branch:null,      phone:"+91 90210 10014", email:"suresh.p@fitandfightclub.com" },
];
function staffById(id){ return STAFF.find(s=>s.id===id); }
function coaches(branchKey){ return STAFF.filter(s=>s.role==="coach" && (!branchKey || s.branch===branchKey)); }

const ROLE_LABELS = {
  admin:"Founder / Admin", manager:"Branch Manager", receptionist:"Receptionist", coach:"Coach", accountant:"Accountant"
};

const PLANS = [
  { id:"P1", name:"Conditioning Monthly",   program:"Conditioning",     months:1,  price:3500 },
  { id:"P2", name:"Conditioning Quarterly", program:"Conditioning",     months:3,  price:9000 },
  { id:"P3", name:"MMA Monthly",            program:"MMA",              months:1,  price:4500 },
  { id:"P4", name:"MMA Half-Yearly",        program:"MMA",              months:6,  price:22000 },
  { id:"P5", name:"MMA Annual",             program:"MMA",              months:12, price:40000 },
  { id:"P6", name:"PT Pack – 12 sessions",  program:"Personal Training",months:2,  price:18000 },
  { id:"P7", name:"PT Pack – 24 sessions",  program:"Personal Training",months:4,  price:32000 },
  { id:"P8", name:"All-Access Annual",      program:"MMA",              months:12, price:55000 },
];
function planById(id){ return PLANS.find(p=>p.id===id); }

const SOURCES = ["Website","Instagram","Walk-in","Referral","Call"];
const GOALS = ["Weight loss","Strength","Self-defence","Competition","General fitness"];
const PIPELINE = ["New enquiry","Contacted","Trial booked","Trial attended","Interested","Payment pending","Member active","Renewal due","Renewed","Lost"];

/* ---------------- Leads & enquiries ---------------- */
const LEADS = [
  { id:"L1001", name:"Kunal Mehra",     phone:"+91 98211 40011", source:"Website",   branch:"vashi",   program:"MMA",              goal:"Competition",     budget:40000, assigned:"S2", status:"New enquiry",     createdAt:iso(d(0)),  followUpDate:iso(d(0)),  notes:"Asked about the fight team & sparring hours." },
  { id:"L1002", name:"Sneha Kulkarni",  phone:"+91 98211 40012", source:"Instagram", branch:"vashi",   program:"Conditioning",     goal:"Weight loss",     budget:9000,  assigned:"S5", status:"New enquiry",     createdAt:iso(d(0)),  followUpDate:iso(d(1)),  notes:"Saw the transformation reel, wants a callback after 6pm." },
  { id:"L1003", name:"Aditya Rao",      phone:"+91 98211 40013", source:"Referral",  branch:"nerul",   program:"Personal Training",goal:"Strength",        budget:32000, assigned:"S3", status:"Contacted",       createdAt:iso(d(-1)), followUpDate:iso(d(0)),  notes:"Referred by member Rhea Shah. Prefers evening slots." },
  { id:"L1004", name:"Isha Bhatt",      phone:"+91 98211 40014", source:"Walk-in",   branch:"wagholi", program:"MMA",              goal:"Self-defence",     budget:22000, assigned:"S4", status:"Contacted",       createdAt:iso(d(-1)), followUpDate:iso(d(0)),  notes:"Walked in after work, wants women-only slot info." },
  { id:"L1005", name:"Yash Thakur",     phone:"+91 98211 40015", source:"Call",      branch:"vashi",   program:"MMA",              goal:"General fitness", budget:4500,  assigned:"S2", status:"Trial booked",    createdAt:iso(d(-2)), followUpDate:iso(d(0)),  notes:"Booked trial with Vikrant, confirm gear needed." },
  { id:"L1006", name:"Prerna Joshi",    phone:"+91 98211 40016", source:"Instagram", branch:"nerul",   program:"Conditioning",     goal:"Weight loss",     budget:3500,  assigned:"S6", status:"Trial booked",    createdAt:iso(d(-2)), followUpDate:iso(d(0)),  notes:"Trial today evening, second time enquiry." },
  { id:"L1007", name:"Devansh Nair",    phone:"+91 98211 40017", source:"Website",   branch:"wagholi", program:"MMA",              goal:"Competition",     budget:55000, assigned:"S7", status:"Member active",  createdAt:iso(d(-4)), followUpDate:iso(d(0)),  notes:"Strong trial, signed the All-Access Annual." },
  { id:"L1019", name:"Devika Rao",      phone:"+91 98211 40029", source:"Referral",  branch:"nerul",   program:"Conditioning",     goal:"Weight loss",     budget:9000,  assigned:"S6", status:"Renewed",         createdAt:iso(d(-45)),followUpDate:iso(d(-40)), notes:"Came back after a win-back WhatsApp and renewed her Quarterly plan." },
  { id:"L1008", name:"Rhea Fernandes",  phone:"+91 98211 40018", source:"Referral",  branch:"vashi",   program:"Personal Training",goal:"Strength",        budget:18000, assigned:"S5", status:"Member active",  createdAt:iso(d(-5)), followUpDate:iso(d(0)),  notes:"Signed up for the PT pack on a 2-part EMI." },
  { id:"L1009", name:"Karan Oza",       phone:"+91 98211 40019", source:"Walk-in",   branch:"nerul",   program:"MMA",              goal:"Self-defence",     budget:22000, assigned:"S3", status:"Interested",      createdAt:iso(d(-5)), followUpDate:iso(d(1)),  notes:"Wants to bring a friend to the next trial." },
  { id:"L1010", name:"Ananya Ghosh",    phone:"+91 98211 40020", source:"Website",   branch:"wagholi", program:"Conditioning",     goal:"Weight loss",     budget:9000,  assigned:"S4", status:"Payment pending", createdAt:iso(d(-6)), followUpDate:iso(d(0)),  notes:"Verbally confirmed Quarterly plan, sending payment link." },
  { id:"L1011", name:"Manav Kapoor",    phone:"+91 98211 40021", source:"Instagram", branch:"vashi",   program:"MMA",              goal:"Competition",     budget:40000, assigned:"S2", status:"Payment pending", createdAt:iso(d(-7)), followUpDate:iso(d(0)),  notes:"Wants to split into 2 part-payments." },
  { id:"L1012", name:"Tanvi Rathod",    phone:"+91 98211 40022", source:"Call",      branch:"nerul",   program:"Personal Training",goal:"General fitness", budget:18000, assigned:"S6", status:"Lost",            createdAt:iso(d(-10)),followUpDate:iso(d(-3)), notes:"Chose a gym closer to home." },
  { id:"L1013", name:"Vivaan Shetty",   phone:"+91 98211 40023", source:"Referral",  branch:"wagholi", program:"MMA",              goal:"Self-defence",     budget:4500,  assigned:"S7", status:"Lost",            createdAt:iso(d(-11)),followUpDate:iso(d(-4)), notes:"Budget mismatch, asked to follow up next quarter." },
  { id:"L1014", name:"Riya Chavan",     phone:"+91 98211 40024", source:"Website",   branch:"vashi",   program:"Conditioning",     goal:"Weight loss",     budget:3500,  assigned:"S5", status:"New enquiry",     createdAt:iso(d(0)),  followUpDate:iso(d(0)),  notes:"Filled the site trial form 20 min ago." },
  { id:"L1015", name:"Aryan Deshmukh",  phone:"+91 98211 40025", source:"Website",   branch:"nerul",   program:"MMA",              goal:"Competition",     budget:40000, assigned:"S3", status:"New enquiry",     createdAt:iso(d(0)),  followUpDate:iso(d(0)),  notes:"Site form: wants to know about the fight team trials." },
  { id:"L1016", name:"Simran Kaur",     phone:"+91 98211 40026", source:"Instagram", branch:"wagholi", program:"Personal Training",goal:"Strength",        budget:32000, assigned:"S4", status:"Contacted",       createdAt:iso(d(-2)), followUpDate:iso(d(1)),  notes:"Wants a female trainer; pointed to Meera Iyer." },
  { id:"L1017", name:"Nikhil Bansal",   phone:"+91 98211 40027", source:"Walk-in",   branch:"vashi",   program:"MMA",              goal:"General fitness", budget:4500,  assigned:"S2", status:"Trial booked",    createdAt:iso(d(-1)), followUpDate:iso(d(0)),  notes:"Trial tomorrow morning, allergic to latex tape." },
  { id:"L1018", name:"Pooja Iyer",      phone:"+91 98211 40028", source:"Referral",  branch:"nerul",   program:"Conditioning",     goal:"Weight loss",     budget:9000,  assigned:"S6", status:"Interested",      createdAt:iso(d(-3)), followUpDate:iso(d(0)),  notes:"Needs to confirm with spouse before paying." },
];

/* ---------------- Free trials ---------------- */
const TRIALS = [
  { id:"T2001", leadId:"L1005", name:"Yash Thakur",    branch:"vashi",   program:"MMA",              coach:"S8",  date:iso(d(0)),  time:"18:00", attendance:"Pending",  feedback:"",                                              outcome:"Pending",  followUpDate:iso(d(0)) },
  { id:"T2002", leadId:"L1006", name:"Prerna Joshi",   branch:"nerul",   program:"Conditioning",     coach:"S11", date:iso(d(0)),  time:"19:00", attendance:"Pending",  feedback:"",                                              outcome:"Pending",  followUpDate:iso(d(0)) },
  { id:"T2003", leadId:"L1017", name:"Nikhil Bansal",  branch:"vashi",   program:"MMA",              coach:"S8",  date:iso(d(1)),  time:"07:00", attendance:"Pending",  feedback:"",                                              outcome:"Pending",  followUpDate:iso(d(1)) },
  { id:"T2004", leadId:"L1007", name:"Devansh Nair",   branch:"wagholi", program:"MMA",              coach:"S12", date:iso(d(-4)), time:"18:30", attendance:"Attended", feedback:"Great gas tank, strong wrestling base already.", outcome:"Converted", followUpDate:iso(d(0)) },
  { id:"T2005", leadId:"L1008", name:"Rhea Fernandes", branch:"vashi",   program:"Personal Training",coach:"S9",  date:iso(d(-5)), time:"08:00", attendance:"Attended", feedback:"Liked the coach; needs EMI before signing.",     outcome:"Converted", followUpDate:iso(d(0)) },
  { id:"T2006", leadId:"L1009", name:"Karan Oza",      branch:"nerul",   program:"MMA",              coach:"S10", date:iso(d(-5)), time:"18:00", attendance:"Attended", feedback:"Enjoyed pad work, bringing a friend next time.",  outcome:"Converting",followUpDate:iso(d(1)) },
  { id:"T2007", leadId:"L1018", name:"Pooja Iyer",     branch:"nerul",   program:"Conditioning",     coach:"S11", date:iso(d(-3)), time:"19:00", attendance:"Attended", feedback:"Good energy, wants a friend's discount check.",   outcome:"Converting",followUpDate:iso(d(0)) },
  { id:"T2008", leadId:"L1016", name:"Simran Kaur",    branch:"wagholi", program:"Personal Training",coach:"S13", date:iso(d(2)),  time:"17:00", attendance:"Pending",  feedback:"",                                              outcome:"Pending",  followUpDate:iso(d(2)) },
  { id:"T2009", leadId:"L1013", name:"Vivaan Shetty",  branch:"wagholi", program:"MMA",              coach:"S12", date:iso(d(-11)),time:"18:00", attendance:"No-show",  feedback:"Did not show, called to say budget issue.",       outcome:"Lost",      followUpDate:iso(d(-4)) },
  { id:"T2010", leadId:"L1012", name:"Tanvi Rathod",   branch:"nerul",   program:"Personal Training",coach:"S11", date:iso(d(-10)),time:"08:00", attendance:"Attended", feedback:"Liked it but a gym opened closer to her home.",   outcome:"Lost",      followUpDate:iso(d(-3)) },
];

/* ---------------- Members, memberships, payments ---------------- */
const MEMBERS = [
  { id:"M3001", name:"Rhea Shah",       phone:"+91 98212 50001", email:"rhea.shah@example.com",   dob:"1996-04-12", branch:"vashi",   program:"MMA",              goal:"Competition",     emergencyName:"Sanjay Shah",   emergencyPhone:"+91 98212 90001", medical:"None declared",                          notes:"State-level amateur fighter, trains 5x/week." },
  { id:"M3002", name:"Aman Verma",      phone:"+91 98212 50002", email:"aman.verma@example.com",  dob:"1990-11-02", branch:"vashi",   program:"Conditioning",     goal:"Weight loss",     emergencyName:"Kiran Verma",   emergencyPhone:"+91 98212 90002", medical:"Mild knee strain (2024), cleared to train", notes:"Prefers early morning batch." },
  { id:"M3003", name:"Ibrahim Sheikh",  phone:"+91 98212 50003", email:"ibrahim.s@example.com",   dob:"1998-01-22", branch:"vashi",   program:"MMA",              goal:"Self-defence",     emergencyName:"Fatima Sheikh", emergencyPhone:"+91 98212 90003", medical:"None declared",                          notes:"" },
  { id:"M3004", name:"Neel Kamath",     phone:"+91 98212 50004", email:"neel.kamath@example.com", dob:"1993-07-19", branch:"vashi",   program:"Personal Training",goal:"Strength",        emergencyName:"Asha Kamath",   emergencyPhone:"+91 98212 90004", medical:"Lower back sensitivity, avoid deadlift max", notes:"PT with Arjun, 2x/week." },
  { id:"M3005", name:"Divya Menon",     phone:"+91 98212 50005", email:"divya.menon@example.com", dob:"1995-09-08", branch:"nerul",   program:"Conditioning",     goal:"Weight loss",     emergencyName:"Ravi Menon",    emergencyPhone:"+91 98212 90005", medical:"Asthma – carries inhaler",               notes:"" },
  { id:"M3006", name:"Farah Ansari",    phone:"+91 98212 50006", email:"farah.a@example.com",     dob:"1997-03-15", branch:"nerul",   program:"MMA",              goal:"Self-defence",     emergencyName:"Iqbal Ansari",  emergencyPhone:"+91 98212 90006", medical:"None declared",                          notes:"Women-only batch, Tue/Thu/Sat." },
  { id:"M3007", name:"Harsh Vora",      phone:"+91 98212 50007", email:"harsh.vora@example.com",  dob:"1992-12-30", branch:"nerul",   program:"MMA",              goal:"Competition",     emergencyName:"Meena Vora",    emergencyPhone:"+91 98212 90007", medical:"Old shoulder dislocation, wears strap",   notes:"On the amateur fight roster." },
  { id:"M3008", name:"Zoya Khan",       phone:"+91 98212 50008", email:"zoya.khan@example.com",   dob:"1999-05-27", branch:"nerul",   program:"Personal Training",goal:"General fitness", emergencyName:"Salman Khan Sr.",emergencyPhone:"+91 98212 90008", medical:"None declared",                          notes:"PT with Ritu, progress photos on file." },
  { id:"M3009", name:"Omkar Jadhav",    phone:"+91 98212 50009", email:"omkar.j@example.com",     dob:"1994-02-14", branch:"wagholi", program:"MMA",              goal:"Competition",     emergencyName:"Sunita Jadhav", emergencyPhone:"+91 98212 90009", medical:"None declared",                          notes:"Wrestling background, sparring 3x/week." },
  { id:"M3010", name:"Anushka Pawar",   phone:"+91 98212 50010", email:"anushka.p@example.com",   dob:"2000-08-05", branch:"wagholi", program:"Conditioning",     goal:"Weight loss",     emergencyName:"Vilas Pawar",   emergencyPhone:"+91 98212 90010", medical:"None declared",                          notes:"" },
  { id:"M3011", name:"Rahul Kadam",     phone:"+91 98212 50011", email:"rahul.kadam@example.com", dob:"1991-06-21", branch:"wagholi", program:"MMA",              goal:"Self-defence",     emergencyName:"Sarita Kadam",  emergencyPhone:"+91 98212 90011", medical:"Hypertension – monitored, cleared",       notes:"" },
  { id:"M3012", name:"Ishita Deshpande",phone:"+91 98212 50012", email:"ishita.d@example.com",    dob:"1996-10-11", branch:"wagholi", program:"Personal Training",goal:"Strength",        emergencyName:"Nikhil Deshpande",emergencyPhone:"+91 98212 90012",medical:"None declared",                          notes:"PT with Meera, twice weekly." },
];

const MEMBERSHIPS = [
  { id:"MS4001", memberId:"M3001", planId:"P8", start:iso(d(-210)), end:iso(d(-2)),  status:"Overdue-renew", freezeDays:0, transferredFrom:null, upgradeFrom:null },
  { id:"MS4002", memberId:"M3002", planId:"P2", start:iso(d(-60)),  end:iso(d(30)),  status:"Active",        freezeDays:0, transferredFrom:null, upgradeFrom:null },
  { id:"MS4003", memberId:"M3003", planId:"P3", start:iso(d(-20)),  end:iso(d(10)),  status:"Active",        freezeDays:0, transferredFrom:null, upgradeFrom:null },
  { id:"MS4004", memberId:"M3004", planId:"P6", start:iso(d(-25)),  end:iso(d(35)),  status:"Active",        freezeDays:0, transferredFrom:null, upgradeFrom:null },
  { id:"MS4005", memberId:"M3005", planId:"P1", start:iso(d(-25)),  end:iso(d(5)),   status:"Active",        freezeDays:0, transferredFrom:null, upgradeFrom:null },
  { id:"MS4006", memberId:"M3006", planId:"P4", start:iso(d(-150)), end:iso(d(30)),  status:"Active",        freezeDays:7, transferredFrom:null, upgradeFrom:null },
  { id:"MS4007", memberId:"M3007", planId:"P5", start:iso(d(-300)), end:iso(d(65)),  status:"Active",        freezeDays:0, transferredFrom:null, upgradeFrom:"P4" },
  { id:"MS4008", memberId:"M3008", planId:"P7", start:iso(d(-40)),  end:iso(d(80)),  status:"Active",        freezeDays:0, transferredFrom:null, upgradeFrom:null },
  { id:"MS4009", memberId:"M3009", planId:"P5", start:iso(d(-100)), end:iso(d(265)), status:"Active",        freezeDays:0, transferredFrom:null, upgradeFrom:null },
  { id:"MS4010", memberId:"M3010", planId:"P1", start:iso(d(-27)),  end:iso(d(3)),   status:"Active",        freezeDays:0, transferredFrom:null, upgradeFrom:null },
  { id:"MS4011", memberId:"M3011", planId:"P3", start:iso(d(-15)),  end:iso(d(15)),  status:"Active",        freezeDays:0, transferredFrom:"vashi", upgradeFrom:null },
  { id:"MS4012", memberId:"M3012", planId:"P6", start:iso(d(-10)),  end:iso(d(50)),  status:"Active",        freezeDays:0, transferredFrom:null, upgradeFrom:null },
  { id:"MS4013", memberId:"M3001", planId:"P8", start:iso(d(-575)), end:iso(d(-213)),status:"Expired",       freezeDays:0, transferredFrom:null, upgradeFrom:null },
];

const PAYMENTS = [
  { id:"INV5001", memberId:"M3001", membershipId:"MS4001", amount:55000, paid:55000, mode:"UPI",         discount:0,   gstin:"", date:iso(d(-210)), dueDate:iso(d(-210)), status:"Paid",    receipt:"RCPT-VAS-1201", refund:0, notes:"Annual All-Access, paid in full." },
  { id:"INV5002", memberId:"M3002", membershipId:"MS4002", amount:9000,  paid:9000,  mode:"Card",        discount:500, gstin:"", date:iso(d(-60)),  dueDate:iso(d(-60)),  status:"Paid",    receipt:"RCPT-VAS-1202", refund:0, notes:"Quarterly, referral discount applied." },
  { id:"INV5003", memberId:"M3004", membershipId:"MS4004", amount:18000, paid:9000,  mode:"Bank transfer",discount:0,  gstin:"27ABCFF1234K1Z5", date:iso(d(-25)), dueDate:iso(d(5)), status:"Partial", receipt:"RCPT-VAS-1204", refund:0, notes:"EMI 1 of 2 received; balance due before session 7." },
  { id:"INV5004", memberId:"M3005", membershipId:"MS4005", amount:3500,  paid:0,     mode:"—",           discount:0,   gstin:"", date:iso(d(-25)),  dueDate:iso(d(-1)),  status:"Overdue", receipt:"", refund:0, notes:"Renewal invoice sent, no response yet." },
  { id:"INV5005", memberId:"M3006", membershipId:"MS4006", amount:22000, paid:22000, mode:"UPI",         discount:1000,gstin:"", date:iso(d(-150)), dueDate:iso(d(-150)), status:"Paid",   receipt:"RCPT-NER-1205", refund:0, notes:"Half-yearly, festive discount." },
  { id:"INV5006", memberId:"M3007", membershipId:"MS4007", amount:40000, paid:40000, mode:"Cash",        discount:0,   gstin:"", date:iso(d(-300)), dueDate:iso(d(-300)), status:"Paid",   receipt:"RCPT-NER-1206", refund:0, notes:"Upgraded mid-cycle from Half-Yearly." },
  { id:"INV5007", memberId:"M3008", membershipId:"MS4008", amount:32000, paid:16000, mode:"Card",        discount:0,   gstin:"27PQRSX9988L1Z2", date:iso(d(-40)), dueDate:iso(d(3)), status:"Partial", receipt:"RCPT-NER-1208", refund:0, notes:"EMI 1 of 2; second EMI due in 3 days." },
  { id:"INV5008", memberId:"M3009", membershipId:"MS4009", amount:40000, paid:40000, mode:"UPI",         discount:0,   gstin:"", date:iso(d(-100)), dueDate:iso(d(-100)), status:"Paid",   receipt:"RCPT-WAG-1209", refund:0, notes:"" },
  { id:"INV5009", memberId:"M3010", membershipId:"MS4010", amount:3500,  paid:3500,  mode:"UPI",         discount:0,   gstin:"", date:iso(d(-27)),  dueDate:iso(d(-27)),  status:"Paid",   receipt:"RCPT-WAG-1210", refund:0, notes:"" },
  { id:"INV5010", memberId:"M3011", membershipId:"MS4011", amount:4500,  paid:2000,  mode:"Cash",        discount:0,   gstin:"", date:iso(d(-15)),  dueDate:iso(d(-2)),  status:"Overdue", receipt:"RCPT-WAG-1211", refund:0, notes:"Balance ₹2,500 overdue since transfer from Vashi." },
  { id:"INV5011", memberId:"M3012", membershipId:"MS4012", amount:18000, paid:18000, mode:"Bank transfer",discount:1000,gstin:"27LMNPQ5566M1Z9", date:iso(d(-10)), dueDate:iso(d(-10)), status:"Paid", receipt:"RCPT-WAG-1212", refund:0, notes:"PT pack, sibling discount." },
  { id:"INV5012", memberId:"M3003", membershipId:"MS4003", amount:4500,  paid:4500,  mode:"UPI",         discount:0,   gstin:"", date:iso(d(-20)),  dueDate:iso(d(-20)),  status:"Paid",   receipt:"RCPT-VAS-1213", refund:0, notes:"" },
  { id:"INV5013", memberId:"M3001", membershipId:"MS4013", amount:1500,  paid:0,     mode:"—",           discount:0,   gstin:"", date:iso(d(-3)),   dueDate:iso(d(2)),   status:"Refund pending", receipt:"", refund:1500, notes:"Overpayment from last cycle to be refunded." },
];

/* ---------------- Class scheduling ---------------- */
// dow: 0=Sun..6=Sat
const CLASSES = [
  { id:"C6001", branch:"vashi",   program:"MMA",              name:"MMA Fundamentals", coach:"S8",  dow:[1,3,5], time:"07:00", duration:60, capacity:16, booked:14, waitlist:2, status:"Scheduled" },
  { id:"C6002", branch:"vashi",   program:"MMA",              name:"Sparring & Pads",  coach:"S8",  dow:[2,4,6], time:"18:00", duration:75, capacity:14, booked:14, waitlist:4, status:"Scheduled" },
  { id:"C6003", branch:"vashi",   program:"Conditioning",     name:"Metcon Circuit",   coach:"S9",  dow:[1,2,3,4,5], time:"06:00", duration:45, capacity:20, booked:16, waitlist:0, status:"Scheduled" },
  { id:"C6004", branch:"vashi",   program:"Conditioning",     name:"Evening Burn",     coach:"S9",  dow:[1,3,5], time:"19:00", duration:45, capacity:20, booked:19, waitlist:1, status:"Scheduled" },
  { id:"C6005", branch:"nerul",   program:"MMA",              name:"Muay Thai Basics", coach:"S10", dow:[1,3,5], time:"07:30", duration:60, capacity:16, booked:11, waitlist:0, status:"Scheduled" },
  { id:"C6006", branch:"nerul",   program:"MMA",              name:"Fight Prep",       coach:"S10", dow:[2,4,6], time:"18:30", duration:75, capacity:12, booked:12, waitlist:3, status:"Scheduled" },
  { id:"C6007", branch:"nerul",   program:"Conditioning",     name:"Sunrise Strength", coach:"S11", dow:[1,2,3,4,5], time:"06:30", duration:45, capacity:18, booked:9,  waitlist:0, status:"Scheduled" },
  { id:"C6008", branch:"nerul",   program:"MMA",              name:"Women-only MMA",   coach:"S10", dow:[2,4,6], time:"11:00", duration:60, capacity:12, booked:8,  waitlist:0, status:"Scheduled" },
  { id:"C6009", branch:"wagholi", program:"MMA",              name:"Wrestling & MMA",  coach:"S12", dow:[1,3,5], time:"07:00", duration:60, capacity:16, booked:15, waitlist:1, status:"Scheduled" },
  { id:"C6010", branch:"wagholi", program:"MMA",              name:"Cage Conditioning",coach:"S12", dow:[2,4,6], time:"18:00", duration:60, capacity:14, booked:10, waitlist:0, status:"Scheduled" },
  { id:"C6011", branch:"wagholi", program:"Conditioning",     name:"Fat Loss Circuit", coach:"S13", dow:[1,2,3,4,5], time:"06:00", duration:45, capacity:20, booked:14, waitlist:0, status:"Scheduled" },
  { id:"C6012", branch:"vashi",   program:"MMA",              name:"Sparring & Pads",  coach:"S9",  dow:[0], time:"10:00", duration:75, capacity:14, booked:6,  waitlist:0, status:"Substitution", note:"Arjun covering for Vikrant (travel) this Sunday." },
];
const DOW_LABEL = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

/* ---------------- Attendance ---------------- */
const ATTENDANCE = [
  { id:"A7001", memberId:"M3001", classId:"C6002", date:iso(d(0)),  time:"18:03", method:"QR",           status:"Present" },
  { id:"A7002", memberId:"M3003", classId:"C6001", date:iso(d(0)),  time:"07:02", method:"QR",           status:"Present" },
  { id:"A7003", memberId:"M3002", classId:"C6004", date:iso(d(0)),  time:"19:11", method:"PIN",          status:"Late" },
  { id:"A7004", memberId:"M3004", classId:"C6003", date:iso(d(0)),  time:"06:01", method:"Receptionist", status:"Present" },
  { id:"A7005", memberId:"M3005", classId:"C6007", date:iso(d(0)),  time:"—",     method:"—",            status:"No-show" },
  { id:"A7006", memberId:"M3006", classId:"C6008", date:iso(d(0)),  time:"11:04", method:"QR",           status:"Present" },
  { id:"A7007", memberId:"M3007", classId:"C6006", date:iso(d(0)),  time:"—",     method:"—",            status:"No-show" },
  { id:"A7008", memberId:"M3008", classId:"C6007", date:iso(d(0)),  time:"06:28", method:"PIN",          status:"Present" },
  { id:"A7009", memberId:"M3009", classId:"C6009", date:iso(d(0)),  time:"07:05", method:"QR",           status:"Present" },
  { id:"A7010", memberId:"M3010", classId:"C6011", date:iso(d(0)),  time:"06:14", method:"Receptionist", status:"Late" },
  { id:"A7011", memberId:"M3011", classId:"C6010", date:iso(d(0)),  time:"—",     method:"—",            status:"No-show" },
  { id:"A7012", memberId:"M3012", classId:"C6011", date:iso(d(0)),  time:"06:03", method:"QR",           status:"Present" },
  { id:"A7013", memberId:"M3001", classId:"C6001", date:iso(d(-1)), time:"07:00", method:"QR",           status:"Present" },
  { id:"A7014", memberId:"M3002", classId:"C6004", date:iso(d(-1)), time:"19:02", method:"QR",           status:"Present" },
  { id:"A7015", memberId:"M3006", classId:"C6008", date:iso(d(-1)), time:"11:01", method:"QR",           status:"Present" },
  { id:"A7016", memberId:"M3009", classId:"C6009", date:iso(d(-1)), time:"—",     method:"—",            status:"No-show" },
  { id:"A7017", memberId:"M3004", classId:"C6003", date:iso(d(-1)), time:"06:04", method:"PIN",          status:"Present" },
  { id:"A7018", memberId:"M3012", classId:"C6011", date:iso(d(-2)), time:"06:09", method:"QR",           status:"Present" },
];

/* ---------------- Communication templates & follow-up tasks ---------------- */
const TEMPLATES = [
  { id:"TP1", trigger:"New enquiry",   channel:"WhatsApp", name:"Welcome + trial invite",
    body:"Hi {{name}}! Thanks for your interest in FIT & FIGHT CLUB {{center}}. We'd love to have you in for a free trial — reply with a date/time that works and we'll block your slot." },
  { id:"TP2", trigger:"Trial reminder",channel:"SMS",      name:"Trial reminder – day before",
    body:"Reminder: your free trial at FIT & FIGHT CLUB {{center}} is tomorrow at {{time}} with coach {{coach}}. Wear comfortable clothes and bring a water bottle. See you there!" },
  { id:"TP3", trigger:"Missed class",  channel:"WhatsApp", name:"We missed you",
    body:"Hey {{name}}, you missed today's {{class}} session. Everything okay? Let us know if you'd like to reschedule or need anything from the team." },
  { id:"TP4", trigger:"Payment due",   channel:"WhatsApp", name:"Payment due reminder",
    body:"Hi {{name}}, a friendly reminder that ₹{{amount}} is due on {{dueDate}} for your {{plan}}. Tap here to pay or visit the {{center}} front desk." },
  { id:"TP5", trigger:"Renewal",       channel:"Email",    name:"Membership renewal",
    body:"Hi {{name}}, your {{plan}} membership ends on {{endDate}}. Renew before it lapses to keep your streak and your current rate — reply here or ask at the desk." },
  { id:"TP6", trigger:"Birthday",      channel:"WhatsApp", name:"Birthday wish",
    body:"Happy birthday, {{name}}! 🎂 From all of us at FIT & FIGHT CLUB {{center}} — here's to a strong year ahead. Come collect your birthday shaker this week!" },
  { id:"TP7", trigger:"Win-back",      channel:"WhatsApp", name:"We want you back",
    body:"Hi {{name}}, it's been a while! We've missed you at FIT & FIGHT CLUB {{center}}. Come back this month and we'll waive your re-joining fee — just reply YES." },
];

const TASKS = [
  { id:"TK8001", type:"Lead follow-up",  refId:"L1005", title:"Confirm trial gear for Yash Thakur",     branch:"vashi",   assigned:"S2", due:iso(d(0)),  status:"Open" },
  { id:"TK8002", type:"Lead follow-up",  refId:"L1010", title:"Send payment link to Ananya Ghosh",       branch:"wagholi", assigned:"S4", due:iso(d(0)),  status:"Open" },
  { id:"TK8003", type:"Lead follow-up",  refId:"L1011", title:"Confirm part-payment plan with Manav",    branch:"vashi",   assigned:"S2", due:iso(d(0)),  status:"Open" },
  { id:"TK8004", type:"Trial follow-up", refId:"T2004", title:"Welcome call – Devansh Nair (converted)",  branch:"wagholi", assigned:"S7", due:iso(d(-1)), status:"Done" },
  { id:"TK8005", type:"Trial follow-up", refId:"T2005", title:"Confirm EMI schedule – Rhea Fernandes",    branch:"vashi",   assigned:"S5", due:iso(d(-1)), status:"Done" },
  { id:"TK8006", type:"Payment due",     refId:"INV5004",title:"Chase overdue renewal – Divya Menon",      branch:"nerul",   assigned:"S6", due:iso(d(-1)), status:"Open" },
  { id:"TK8007", type:"Payment due",     refId:"INV5010",title:"Collect balance from Rahul Kadam",         branch:"wagholi", assigned:"S7", due:iso(d(-2)), status:"Open" },
  { id:"TK8008", type:"Renewal",         refId:"MS4001", title:"Renewal call – Rhea Shah (overdue)",       branch:"vashi",   assigned:"S2", due:iso(d(-2)), status:"Open" },
  { id:"TK8009", type:"Lead follow-up",  refId:"L1009", title:"Bring-a-friend trial follow-up – Karan Oza",branch:"nerul",  assigned:"S3", due:iso(d(1)),  status:"Open" },
  { id:"TK8010", type:"Lead follow-up",  refId:"L1002", title:"Callback after 6pm – Sneha Kulkarni",       branch:"vashi",   assigned:"S5", due:iso(d(1)),  status:"Open" },
  { id:"TK8011", type:"Attendance",      refId:"M3005", title:"No-show check-in – Divya Menon",            branch:"nerul",   assigned:"S6", due:iso(d(0)),  status:"Done" },
  { id:"TK8012", type:"Lead follow-up",  refId:"L1003", title:"Evening slot options – Aditya Rao",         branch:"nerul",   assigned:"S3", due:iso(d(-1)), status:"Done" },
];

/* ============================================================
   Persistence — clone seed into a mutable store, keep in
   localStorage per-viewer so edits in this browser stick.
   ============================================================ */
const SEED = { LEADS, TRIALS, MEMBERS, MEMBERSHIPS, PAYMENTS, CLASSES, ATTENDANCE, TASKS };
const LS_KEY = "ffc_crm_v1";
let DB;
function loadDB(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(raw){ return JSON.parse(raw); }
  }catch(e){ /* storage unavailable or corrupt — fall back to seed */ }
  return JSON.parse(JSON.stringify(SEED));
}
function saveDB(){
  try{ localStorage.setItem(LS_KEY, JSON.stringify(DB)); }catch(e){ /* ignore quota/availability errors */ }
}
function resetDB(){
  DB = JSON.parse(JSON.stringify(SEED));
  saveDB();
  toast("Sample data reset");
  render();
}
DB = loadDB();

function memberById(id){ return DB.MEMBERS.find(m=>m.id===id); }
function leadById(id){ return DB.LEADS.find(l=>l.id===id); }
function membershipById(id){ return DB.MEMBERSHIPS.find(m=>m.id===id); }
function classById(id){ return CLASSES.find(c=>c.id===id); }
function activeMembershipFor(memberId){
  const list = DB.MEMBERSHIPS.filter(m=>m.memberId===memberId);
  return list.sort((a,b)=> new Date(b.end)-new Date(a.end))[0];
}
function membershipComputedStatus(ms){
  if(!ms) return "—";
  const endsIn = daysBetween(TODAY, ms.end);
  if(ms.status==="Frozen") return "Frozen";
  if(endsIn < 0) return "Expired";
  if(endsIn <= 7) return "Expiring soon";
  if(endsIn <= 30) return "Renewal due";
  return "Active";
}
function statusToneForMembership(s){
  return { "Active":"good","Renewal due":"warning","Expiring soon":"serious","Expired":"critical","Frozen":"neutral" }[s] || "neutral";
}
function paymentBalance(p){ return Math.max(0, (p.amount||0) - (p.paid||0)); }
