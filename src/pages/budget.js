import { useState, useEffect, useRef } from "react";

// ── 2026 Tax constants ────────────────────────────────────────────────────────
const BKT = {
  single: [[11925,.10],[48475,.12],[103350,.22],[197300,.24],[250525,.32],[640600,.35],[Infinity,.37]],
  mfj:    [[23850,.10],[96950,.12],[206700,.22],[394600,.24],[501050,.32],[768600,.35],[Infinity,.37]],
  hoh:    [[17000,.10],[64850,.12],[103350,.22],[197300,.24],[250500,.32],[640600,.35],[Infinity,.37]],
};
const FSTD  = { single:16100, mfj:32200,  hoh:24150  };
const NSTD  = { single:12750, mfj:25500,  hoh:12750  };
const IRAPO = { single:{s:81000,e:91000}, mfj:{s:129000,e:149000}, hoh:{s:81000,e:91000} };
const SS_RATE=.062, SS_BASE=184500, MC_RATE=.0145, AMC_RATE=.009;
const AMC_THRESH = { single:200000, mfj:250000, hoh:200000 };
const LIM_401K=24500, LIM_IRA=7500, NC_RATE=.0399;

// 2024 IRS SOI data (latest available) — household income thresholds
// Top 5%: ~$252k/yr  |  Top 1%: ~$652k/yr
const PEERS = [
  { label:"Top 5%",  gross:252000, color:"#F59E0B", retire401k: LIM_401K, retireIra: LIM_IRA },
  { label:"Top 1%",  gross:652000, color:"#EC4899", retire401k: LIM_401K, retireIra: LIM_IRA },
];

const PRESET_CLR = {
  "Housing":"#6366F1","Food & Groceries":"#10B981","Transportation":"#F59E0B",
  "Utilities":"#8B5CF6","Healthcare":"#EF4444","Entertainment":"#EC4899",
  "Savings":"#14B8A6","Personal Care":"#3B82F6","Clothing":"#F97316",
  "Education":"#06B6D4","Other":"#9CA3AF",
};

const QUICK_CATS = [
  "Housing","Food & Groceries","Transportation","Utilities","Healthcare",
  "Entertainment","Savings","Personal Care","Clothing","Education",
  "Pet Care","Subscriptions","Dining Out","Gym / Fitness","Gifts",
  "Travel","Home Maintenance","Childcare","Other",
];

const num = v => parseFloat(v) || 0;
const fmt = v => num(v).toLocaleString("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0});
const pct = v => `${(v*100).toFixed(1)}%`;

function catColor(name) {
  if (PRESET_CLR[name]) return PRESET_CLR[name];
  let h = 5381;
  for (let i=0; i<name.length; i++) h = ((h<<5)+h) ^ name.charCodeAt(i);
  return `hsl(${Math.abs(h)%360},65%,60%)`;
}

function calcTax(taxable, fs) {
  let tax=0, prev=0;
  for (const [up,rate] of BKT[fs]) {
    if (taxable<=prev) break;
    tax += (Math.min(taxable,up)-prev)*rate;
    prev=up;
    if (up===Infinity) break;
  }
  return Math.max(0,tax);
}

function calcTaxes(gross, fs, trad401kA, tradIraA, dualSS=false) {
  const has401k = trad401kA>0;
  const agi1 = Math.max(0, gross-trad401kA);
  const po = IRAPO[fs];
  const iraFrac = !has401k ? 1 : agi1>=po.e ? 0 : agi1<=po.s ? 1 : (po.e-agi1)/(po.e-po.s);
  const agi = Math.max(0, agi1-tradIraA*iraFrac);
  const fedTaxable = Math.max(0, agi-FSTD[fs]);
  const ncTaxable  = Math.max(0, agi-NSTD[fs]);
  const federal = calcTax(fedTaxable, fs);
  const ss = dualSS ? SS_RATE*Math.min(gross/2,SS_BASE)*2 : SS_RATE*Math.min(gross,SS_BASE);
  const mc=MC_RATE*gross, addlMc=gross>AMC_THRESH[fs]?AMC_RATE*(gross-AMC_THRESH[fs]):0;
  const nc=NC_RATE*ncTaxable;
  const total=federal+ss+mc+addlMc+nc;
  return { federal,ss,mc:mc+addlMc,nc,total,fedTaxable,ncTaxable,agi,iraFrac };
}

const D_SETUP = {
  grossAnnual:"170000", filingStatus:"mfj",
  trad401kMo:"1000", roth401kMo:"0",
  tradIraMo:"0",     rothIraMo:"625",
  otherPreMo:"200",
};
const D_EXP = [
  {id:1,cat:"Housing",         amt:"2200"},
  {id:2,cat:"Food & Groceries",amt:"800"},
  {id:3,cat:"Transportation",  amt:"600"},
  {id:4,cat:"Utilities",       amt:"250"},
  {id:5,cat:"Healthcare",      amt:"300"},
  {id:6,cat:"Entertainment",   amt:"300"},
  {id:7,cat:"Personal Care",   amt:"150"},
];

function Panel({ title, accent, children }) {
  return (
    <div style={{background:"#111827",border:"1px solid #1F2937",borderRadius:12,overflow:"hidden",marginBottom:14}}>
      <div style={{padding:"10px 15px",borderBottom:"1px solid #1F2937",display:"flex",alignItems:"center",gap:8}}>
        {accent && <span style={{display:"block",width:3,height:12,background:accent,borderRadius:2,flexShrink:0}}/>}
        <span style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".8px",color:"#9CA3AF"}}>{title}</span>
      </div>
      <div style={{padding:"12px 15px"}}>{children}</div>
    </div>
  );
}

function FR({ label, children }) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #1F2937",gap:8}}>
      <span style={{fontSize:12,color:"#9CA3AF",flex:1}}>{label}</span>
      {children}
    </div>
  );
}

// Local state so parent re-renders don't interrupt typing
function MoneyInField({ initialValue, onCommit, width=90 }) {
  const [val, setVal] = useState(initialValue);
  const ref = useRef(initialValue);

  // Sync if parent value changes from outside (e.g. reset)
  useEffect(() => {
    if (initialValue !== ref.current) {
      setVal(initialValue);
      ref.current = initialValue;
    }
  }, [initialValue]);

  const commit = () => {
    ref.current = val;
    onCommit(val);
  };

  return (
    <div style={{display:"flex",alignItems:"center",background:"#0B1120",border:"1px solid #374151",borderRadius:6}}>
      <span style={{padding:"0 3px 0 7px",color:"#6B7280",fontSize:12}}>$</span>
      <input
        type="text"
        inputMode="decimal"
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={commit}
        onKeyDown={e => e.key === "Enter" && e.currentTarget.blur()}
        style={{width,background:"transparent",border:"none",outline:"none",color:"#F9FAFB",
          fontSize:13,padding:"5px 7px 5px 0",textAlign:"right",fontVariantNumeric:"tabular-nums"}}
      />
    </div>
  );
}

// Paycheck-tab MoneyIn — calls onChange on every keystroke (fine there, no long list)
function MoneyIn({ value, onChange, width=90 }) {
  return (
    <div style={{display:"flex",alignItems:"center",background:"#0B1120",border:"1px solid #374151",borderRadius:6}}>
      <span style={{padding:"0 3px 0 7px",color:"#6B7280",fontSize:12}}>$</span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{width,background:"transparent",border:"none",outline:"none",color:"#F9FAFB",
          fontSize:13,padding:"5px 7px 5px 0",textAlign:"right",fontVariantNumeric:"tabular-nums"}}
      />
    </div>
  );
}

function XBtn({ onClick }) {
  return (
    <button onClick={onClick}
      onMouseEnter={e=>e.currentTarget.style.color="#EF4444"}
      onMouseLeave={e=>e.currentTarget.style.color="#374151"}
      style={{background:"none",border:"none",cursor:"pointer",color:"#374151",
        padding:"2px 4px",fontSize:13,flexShrink:0,lineHeight:1}}>✕</button>
  );
}

function ProgBar({ value, max, color, height=4 }) {
  const w = max>0 ? Math.min((value/max)*100,100) : 0;
  return (
    <div style={{height,background:"#1F2937",borderRadius:height/2,overflow:"hidden",marginTop:3}}>
      <div style={{height:"100%",width:`${w}%`,background:color,borderRadius:height/2,transition:"width .3s"}}/>
    </div>
  );
}

function LimitBar({ used, max, color }) {
  const over = used>max;
  return (
    <div style={{marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#6B7280",marginBottom:3}}>
        <span>Limit {fmt(max)}/person/yr</span>
        <span style={{color:over?"#EF4444":"#6B7280"}}>{fmt(used)}/yr{over?" ⚠ over!":""}</span>
      </div>
      <ProgBar value={used} max={max} color={over?"#EF4444":color}/>
    </div>
  );
}

function Note({ children }) {
  return <p style={{marginTop:7,fontSize:11,color:"#6B7280",lineHeight:1.5}}>{children}</p>;
}

function Warn({ children, amber }) {
  return (
    <div style={{background:amber?"#422006":"#431407",border:`1px solid ${amber?"#78350F":"#7C2D12"}`,
      borderRadius:6,padding:"7px 10px",marginTop:4,fontSize:11,
      color:amber?"#FDE68A":"#FCA5A5",lineHeight:1.5}}>
      {children}
    </div>
  );
}

// Isolated row: local state for both cat and amt — no parent re-render on keystrokes
function ExpenseRow({ expense, onUpdateAmt, onUpdateCat, onDelete }) {
  const [editingCat, setEditingCat] = useState(false);
  const [catVal, setCatVal] = useState(expense.cat);
  const catRef = useRef(expense.cat);

  // Sync cat if reset from outside
  useEffect(() => {
    if (expense.cat !== catRef.current) {
      setCatVal(expense.cat);
      catRef.current = expense.cat;
    }
  }, [expense.cat]);

  const commitCat = () => {
    const trimmed = catVal.trim() || expense.cat;
    setCatVal(trimmed);
    catRef.current = trimmed;
    setEditingCat(false);
    if (trimmed !== expense.cat) onUpdateCat(trimmed);
  };

  const color = catColor(editingCat ? catVal || expense.cat : expense.cat);

  return (
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid #1F2937"}}>
      <span style={{width:7,height:7,borderRadius:"50%",background:color,flexShrink:0}}/>
      {editingCat ? (
        <input
          autoFocus
          type="text"
          value={catVal}
          onChange={e => setCatVal(e.target.value)}
          onBlur={commitCat}
          onKeyDown={e => { if (e.key==="Enter") e.currentTarget.blur(); if (e.key==="Escape") { setCatVal(expense.cat); setEditingCat(false); } }}
          style={{flex:1,background:"#0B1120",border:"1px solid #4B5563",borderRadius:4,
            padding:"3px 6px",color:"#F9FAFB",fontSize:13,outline:"none"}}
        />
      ) : (
        <span
          onClick={() => setEditingCat(true)}
          title="Click to rename"
          style={{flex:1,fontSize:13,color:"#D1D5DB",cursor:"text",
            borderBottom:"1px dashed transparent"}}
          onMouseEnter={e => e.currentTarget.style.borderBottomColor="#374151"}
          onMouseLeave={e => e.currentTarget.style.borderBottomColor="transparent"}
        >
          {expense.cat}
        </span>
      )}
      <MoneyInField
        initialValue={expense.amt}
        onCommit={onUpdateAmt}
      />
      <XBtn onClick={onDelete}/>
    </div>
  );
}

function AddExpenseForm({ onAdd, onCancel }) {
  const [cat, setCat] = useState("");
  const [amt, setAmt] = useState("");
  const amtRef = useRef(null);

  const submit = () => {
    const finalCat = cat.trim() || "Other";
    if (!amt || num(amt) === 0) return;
    onAdd(finalCat, amt);
    setCat(""); setAmt("");
  };

  return (
    <div style={{marginTop:10,background:"#0B1120",border:"1px solid #374151",borderRadius:10,padding:"12px"}}>
      <div style={{marginBottom:8}}>
        <label style={{fontSize:11,color:"#6B7280",display:"block",marginBottom:4}}>
          CATEGORY NAME — type anything or pick below
        </label>
        <input
          type="text"
          placeholder="e.g. Dog Food, Golf, Baby Stuff…"
          value={cat}
          onChange={e=>setCat(e.target.value)}
          onKeyDown={e=>e.key==="Enter" && amtRef.current?.focus()}
          autoFocus
          style={{width:"100%",background:"#111827",border:"1px solid #4B5563",borderRadius:6,
            padding:"8px 10px",color:"#F9FAFB",fontSize:13,outline:"none"}}
        />
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:10}}>
        {QUICK_CATS.map(c=>(
          <button key={c} onClick={()=>setCat(c)}
            style={{background:cat===c?"#2563EB":"#1F2937",border:`1px solid ${cat===c?"#3B82F6":"#374151"}`,
              borderRadius:20,padding:"3px 9px",fontSize:11,color:cat===c?"#fff":"#9CA3AF",cursor:"pointer"}}>
            {c}
          </button>
        ))}
      </div>
      <div style={{display:"flex",gap:6}}>
        <div style={{display:"flex",alignItems:"center",background:"#111827",border:"1px solid #4B5563",borderRadius:6,flex:1}}>
          <span style={{padding:"0 4px 0 10px",color:"#6B7280",fontSize:13}}>$</span>
          <input
            ref={amtRef}
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={amt}
            onChange={e=>setAmt(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&submit()}
            style={{flex:1,background:"transparent",border:"none",outline:"none",
              color:"#F9FAFB",fontSize:14,padding:"8px 8px 8px 0",fontVariantNumeric:"tabular-nums"}}
          />
        </div>
        <button onClick={submit}
          style={{background:"#2563EB",border:"none",borderRadius:6,padding:"8px 16px",
            color:"#fff",fontSize:13,cursor:"pointer",fontWeight:600,whiteSpace:"nowrap"}}>
          Add
        </button>
        <button onClick={onCancel}
          style={{background:"#1F2937",border:"none",borderRadius:6,padding:"8px 12px",
            color:"#9CA3AF",fontSize:13,cursor:"pointer"}}>
          ✕
        </button>
      </div>
      {cat && (
        <div style={{marginTop:8,display:"flex",alignItems:"center",gap:6,fontSize:11,color:"#6B7280"}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:catColor(cat),display:"inline-block"}}/>
          Will add as: <strong style={{color:"#F9FAFB"}}>{cat}</strong>
        </div>
      )}
    </div>
  );
}

export default function BudgetApp() {
  const [setup,     setSetup]     = useState(D_SETUP);
  const [expenses,  setExp]       = useState(D_EXP);
  const [tab,       setTab]       = useState("paycheck");
  const [addingExp, setAddingExp] = useState(false);
  const [loaded,    setLoaded]    = useState(false);

  useEffect(()=>{
    (async()=>{
      try { const r=await window.storage.get("bgt6_setup"); setSetup(JSON.parse(r.value)); } catch{}
      try { const r=await window.storage.get("bgt6_exp");   setExp(JSON.parse(r.value));   } catch{}
      setLoaded(true);
    })();
  },[]);
  useEffect(()=>{
    if(!loaded) return;
    window.storage.set("bgt6_setup",JSON.stringify(setup)).catch(()=>{});
    window.storage.set("bgt6_exp",  JSON.stringify(expenses)).catch(()=>{});
  },[setup,expenses,loaded]);

  const upd = (f,v) => setSetup(s=>({...s,[f]:v}));
  const updExpAmt = (id,v) => setExp(a=>a.map(e=>e.id===id?{...e,amt:v}:e));
  const updExpCat = (id,v) => setExp(a=>a.map(e=>e.id===id?{...e,cat:v}:e));
  const delExp = (id)   => setExp(a=>a.filter(e=>e.id!==id));
  const addExp = (cat,amt) => {
    const exists = expenses.find(e=>e.cat.toLowerCase()===cat.toLowerCase());
    if (exists) {
      setExp(a=>a.map(e=>e.cat.toLowerCase()===cat.toLowerCase()
        ?{...e,amt:String(num(e.amt)+num(amt))}:e));
    } else {
      setExp(a=>[...a,{id:Date.now(),cat,amt}]);
    }
    setAddingExp(false);
  };

  const gross  = num(setup.grossAnnual);
  const fs     = setup.filingStatus;
  const t4mo   = num(setup.trad401kMo);
  const r4mo   = num(setup.roth401kMo);
  const timo   = num(setup.tradIraMo);
  const rimo   = num(setup.rothIraMo);
  const otmo   = num(setup.otherPreMo);
  const ann401k= (t4mo+r4mo)*12;
  const annIra = (timo+rimo)*12;
  const T      = calcTaxes(gross,fs,t4mo*12,timo*12,false);
  const grossMo= gross/12;
  const taxMo  = T.total/12;
  const th     = grossMo-taxMo-t4mo-r4mo-otmo;
  const iraMo  = timo+rimo;
  const etot   = expenses.reduce((s,e)=>s+num(e.amt),0);
  const rem    = th-etot-iraMo;
  const hc     = rem<0?"#EF4444":rem/th<.05?"#F59E0B":"#10B981";
  const retMo  = t4mo+r4mo+timo+rimo;
  const gr340  = gross*2;
  const T340   = calcTaxes(gr340,fs,LIM_401K*2,0,true);
  const t4m340 = LIM_401K*2/12;
  const ira340 = LIM_IRA*2/12;
  const th340  = gr340/12-T340.total/12-t4m340-otmo;
  const rem340 = th340-etot-ira340;
  const mySave = t4mo+r4mo+iraMo+rem;
  const sv340  = t4m340+ira340+rem340;
  const daily  = mySave/30;
  const day340 = sv340/30;
  const ratio  = day340>0?daily/day340:0;
  const filing = {mfj:"Married Filing Jointly",single:"Single",hoh:"Head of Household"}[fs];
  const bp     = th>0?Math.min(Math.round(((etot+iraMo)/th)*100),100):0;

  const S = {
    page:  {minHeight:"100vh",background:"#080E1A",color:"#F9FAFB",fontFamily:"system-ui,-apple-system,sans-serif",padding:"18px 14px 60px"},
    wrap:  {maxWidth:900,margin:"0 auto"},
    g2:    {display:"grid",gridTemplateColumns:"1fr 1fr",gap:14},
    sg:    {display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14},
    fprow: {display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #1F2937"},
    tabos: {display:"flex",gap:4,background:"#0F172A",borderRadius:10,padding:4},
  };

  return (
    <div style={S.page}>
      <style>{`*{box-sizing:border-box} select option{background:#1F2937;color:#F9FAFB}`}</style>
      <div style={S.wrap}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <h1 style={{margin:0,fontSize:20,fontWeight:800,letterSpacing:"-.5px"}}>NC Household Budget · 2026</h1>
            <p style={{margin:"2px 0 0",color:"#6B7280",fontSize:12}}>{filing} · NC 3.99% flat · Estimates only</p>
          </div>
          <div style={S.tabos}>
            {[["paycheck","💼 Paycheck"],["budget","📊 Budget"]].map(([t,l])=>(
              <button key={t} onClick={()=>setTab(t)} style={{cursor:"pointer",border:"none",
                padding:"7px 14px",fontSize:13,fontWeight:600,borderRadius:7,
                background:tab===t?"#1E293B":"none",color:tab===t?"#F9FAFB":"#6B7280"}}>
                {l}
              </button>
            ))}
          </div>
        </div>

        <div style={S.sg}>
          {[
            {l:"Monthly Gross",  v:fmt(grossMo), c:"#3B82F6"},
            {l:"Monthly Taxes",  v:fmt(taxMo),   c:"#F87171",s:`${pct(T.total/gross||0)} effective`},
            {l:"Take-Home",      v:fmt(th),       c:"#10B981",s:`+${fmt(retMo)}/mo retirement`},
            {l:"After Expenses", v:fmt(rem),      c:hc},
          ].map(({l,v,c,s})=>(
            <div key={l} style={{background:"#111827",border:"1px solid #1F2937",borderRadius:10,padding:"12px 14px"}}>
              <div style={{fontSize:10,color:"#6B7280",textTransform:"uppercase",letterSpacing:"1px",fontWeight:700,marginBottom:4}}>{l}</div>
              <div style={{fontSize:20,fontWeight:800,color:c,fontVariantNumeric:"tabular-nums"}}>{v}</div>
              {s&&<div style={{fontSize:11,color:"#6B7280",marginTop:2}}>{s}</div>}
            </div>
          ))}
        </div>

        {tab==="paycheck"&&(
          <div style={S.g2}>
            <div>
              <Panel title="Income" accent="#3B82F6">
                <FR label="Gross Annual Income">
                  <MoneyIn value={setup.grossAnnual} onChange={v=>upd("grossAnnual",v)} width={120}/>
                </FR>
                <FR label="Filing Status">
                  <select value={fs} onChange={e=>upd("filingStatus",e.target.value)}
                    style={{width:195,background:"#0B1120",border:"1px solid #374151",borderRadius:6,
                      padding:"6px 8px",color:"#F9FAFB",fontSize:13,outline:"none",cursor:"pointer"}}>
                    <option value="mfj">Married Filing Jointly</option>
                    <option value="single">Single</option>
                    <option value="hoh">Head of Household</option>
                  </select>
                </FR>
                <FR label="Other Pre-Tax /mo (HSA, insurance…)">
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <MoneyIn value={setup.otherPreMo} onChange={v=>upd("otherPreMo",v)}/>
                    <span style={{fontSize:11,color:"#6B7280"}}>/mo</span>
                  </div>
                </FR>
              </Panel>
              <Panel title="401(k) — deducted from paycheck" accent="#6366F1">
                <LimitBar used={ann401k} max={LIM_401K} color="#6366F1"/>
                <FR label="Traditional (pre-tax) /mo">
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <MoneyIn value={setup.trad401kMo} onChange={v=>upd("trad401kMo",v)}/>
                    <span style={{fontSize:11,color:"#6B7280"}}>/mo</span>
                  </div>
                </FR>
                <FR label="Roth (post-tax) /mo">
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <MoneyIn value={setup.roth401kMo} onChange={v=>upd("roth401kMo",v)}/>
                    <span style={{fontSize:11,color:"#6B7280"}}>/mo</span>
                  </div>
                </FR>
                <Note>Traditional ↓ taxable income now; Roth grows tax-free for retirement.</Note>
              </Panel>
              <Panel title="IRA — funded from take-home" accent="#34D399">
                <LimitBar used={annIra} max={LIM_IRA} color="#34D399"/>
                <FR label="Traditional IRA /mo">
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <MoneyIn value={setup.tradIraMo} onChange={v=>upd("tradIraMo",v)}/>
                    <span style={{fontSize:11,color:"#6B7280"}}>/mo</span>
                  </div>
                </FR>
                {T.iraFrac===0&&timo>0&&<Warn>⚠ AGI ~{fmt(T.agi)} exceeds MFJ phase-out ($149k) — Trad IRA <strong>not deductible</strong> alongside 401k. Consider Roth or backdoor Roth.</Warn>}
                {T.iraFrac>0&&T.iraFrac<1&&timo>0&&<Warn amber>⚠ Trad IRA only ~{pct(T.iraFrac)} deductible here (phase-out $129k–$149k).</Warn>}
                <FR label="Roth IRA /mo">
                  <div style={{display:"flex",alignItems:"center",gap:4}}>
                    <MoneyIn value={setup.rothIraMo} onChange={v=>upd("rothIraMo",v)}/>
                    <span style={{fontSize:11,color:"#6B7280"}}>/mo</span>
                  </div>
                </FR>
                <Note>Roth IRA fully available at this income (MFJ phase-out starts $242k). Limit: $7,500/person/yr.</Note>
              </Panel>
            </div>
            <div>
              <Panel title="2026 Tax Breakdown (Annual)" accent="#F87171">
                {[
                  {l:"Federal Income Tax",   a:T.federal,c:"#F87171",sub:`22% bracket · ${fmt(T.fedTaxable)} taxable after ${fmt(FSTD[fs])} std deduction`},
                  {l:"Social Security 6.2%", a:T.ss,     c:"#FB923C",sub:`Capped at ${fmt(SS_BASE)} wage base`},
                  {l:"Medicare 1.45%",       a:T.mc,     c:"#FBBF24",sub:"No cap · +0.9% above $250k MFJ"},
                  {l:"NC State Tax 3.99%",   a:T.nc,     c:"#A78BFA",sub:`${fmt(T.ncTaxable)} taxable after ${fmt(NSTD[fs])} NC std deduction`},
                ].map(({l,a,c,sub})=>(
                  <div key={l} style={{padding:"8px 0",borderBottom:"1px solid #1F2937"}}>
                    <div style={{display:"flex",justifyContent:"space-between"}}>
                      <span style={{fontSize:13,color:"#D1D5DB"}}>{l}</span>
                      <span style={{fontWeight:700,color:c,fontVariantNumeric:"tabular-nums"}}>{fmt(a)}/yr</span>
                    </div>
                    <div style={{fontSize:11,color:"#6B7280",marginTop:2}}>{sub}</div>
                  </div>
                ))}
                <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #374151",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:13,fontWeight:700}}>Total Taxes</span>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:22,fontWeight:800,color:"#F87171",fontVariantNumeric:"tabular-nums"}}>{fmt(T.total)}/yr</div>
                    <div style={{fontSize:11,color:"#6B7280"}}>{pct(T.total/gross||0)} effective rate</div>
                  </div>
                </div>
              </Panel>
              <Panel title="Monthly Paycheck Flow" accent="#10B981">
                {[
                  {l:"Gross Pay",         a:grossMo,       c:"#3B82F6",s:"+"},
                  t4mo?{l:"Traditional 401(k)",a:-t4mo,    c:"#818CF8",s:"−"}:null,
                  r4mo?{l:"Roth 401(k)", a:-r4mo,          c:"#A5B4FC",s:"−"}:null,
                  otmo?{l:"Other Pre-Tax",a:-otmo,          c:"#8B5CF6",s:"−"}:null,
                  {l:"Federal Tax",      a:-T.federal/12,   c:"#F87171",s:"−"},
                  {l:"Social Security",  a:-T.ss/12,        c:"#FB923C",s:"−"},
                  {l:"Medicare",         a:-T.mc/12,        c:"#FBBF24",s:"−"},
                  {l:"NC State Tax",     a:-T.nc/12,        c:"#A78BFA",s:"−"},
                ].filter(Boolean).map(({l,a,c,s})=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:"1px solid #1F2937",fontSize:13}}>
                    <span style={{color:"#9CA3AF"}}>{l}</span>
                    <span style={{fontWeight:600,color:c,fontVariantNumeric:"tabular-nums"}}>{s} {fmt(Math.abs(a))}</span>
                  </div>
                ))}
                <div style={{marginTop:10,paddingTop:10,borderTop:"2px solid #374151",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:14,fontWeight:700}}>Monthly Take-Home</span>
                  <span style={{fontSize:24,fontWeight:800,color:"#10B981",fontVariantNumeric:"tabular-nums"}}>{fmt(th)}</span>
                </div>
                {iraMo>0&&<div style={{marginTop:8,background:"#0B1120",borderRadius:8,padding:"8px 10px",fontSize:11,color:"#6B7280"}}>IRA ({fmt(iraMo)}/mo) comes from take-home — tracked in Budget tab.</div>}
              </Panel>
              <Panel title="Retirement Contributions" accent="#34D399">
                {[
                  {l:"Trad 401(k)",a:t4mo*12,max:LIM_401K,c:"#6366F1",note:"Pre-tax"},
                  {l:"Roth 401(k)",a:r4mo*12,max:LIM_401K,c:"#818CF8",note:"Post-tax"},
                  {l:"Trad IRA",   a:timo*12,max:LIM_IRA, c:"#10B981",note:"Deductibility varies"},
                  {l:"Roth IRA",   a:rimo*12,max:LIM_IRA, c:"#34D399",note:"Tax-free growth"},
                ].filter(r=>r.a>0).map(({l,a,max,c,note})=>(
                  <div key={l} style={{marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                      <span style={{color:"#D1D5DB"}}>{l} <span style={{color:"#4B5563",fontSize:10}}>({note})</span></span>
                      <span style={{color:c,fontWeight:700}}>{fmt(a)}/yr</span>
                    </div>
                    <ProgBar value={a} max={max} color={c}/>
                    <div style={{fontSize:10,color:"#6B7280",marginTop:1}}>{Math.round(a/max*100)}% of {fmt(max)} limit</div>
                  </div>
                ))}
                {retMo===0&&<span style={{color:"#6B7280",fontSize:13}}>No contributions set.</span>}
                {retMo>0&&<>
                  <div style={{paddingTop:8,borderTop:"1px solid #1F2937",display:"flex",justifyContent:"space-between",fontSize:13}}>
                    <span style={{color:"#9CA3AF"}}>Total /year</span>
                    <span style={{color:"#34D399",fontWeight:700}}>{fmt(retMo*12)}</span>
                  </div>
                  <div style={{fontSize:11,color:"#6B7280",marginTop:1}}>{gross>0?pct(retMo*12/gross):"-"} of gross income</div>
                </>}
              </Panel>
            </div>
          </div>
        )}

        {tab==="budget"&&(
          <div>
            <div style={{background:"#111827",border:"1px solid #1F2937",borderRadius:12,padding:"14px 18px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:10,color:"#6B7280",textTransform:"uppercase",letterSpacing:"1px",fontWeight:700}}>Monthly Take-Home</div>
                <div style={{fontSize:26,fontWeight:800,color:"#10B981",marginTop:2,fontVariantNumeric:"tabular-nums"}}>{fmt(th)}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:10,color:"#6B7280",textTransform:"uppercase",letterSpacing:"1px",fontWeight:700}}>Remaining</div>
                <div style={{fontSize:26,fontWeight:800,color:hc,marginTop:2,fontVariantNumeric:"tabular-nums"}}>{fmt(rem)}</div>
              </div>
            </div>
            <div style={{background:"#111827",border:"1px solid #1F2937",borderRadius:10,padding:"10px 16px",marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#6B7280",marginBottom:6}}>
                <span>Expenses vs take-home</span>
                <span style={{color:hc,fontWeight:700}}>{bp}%</span>
              </div>
              <div style={{height:6,background:"#1F2937",borderRadius:3,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${bp}%`,background:`linear-gradient(90deg,#3B82F6,${hc})`,borderRadius:3,transition:"width .4s"}}/>
              </div>
            </div>
            <div style={S.g2}>
              <Panel title="Monthly Expenses" accent="#EC4899">
                {timo>0&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid #1F2937"}}><span style={{width:7,height:7,borderRadius:"50%",background:"#10B981",flexShrink:0}}/><span style={{flex:1,fontSize:13,color:"#9CA3AF",fontStyle:"italic"}}>Traditional IRA (Paycheck tab)</span><span style={{fontSize:13,fontWeight:600,color:"#10B981",fontVariantNumeric:"tabular-nums"}}>{fmt(timo)}</span></div>}
                {rimo>0&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:"1px solid #1F2937"}}><span style={{width:7,height:7,borderRadius:"50%",background:"#34D399",flexShrink:0}}/><span style={{flex:1,fontSize:13,color:"#9CA3AF",fontStyle:"italic"}}>Roth IRA (Paycheck tab)</span><span style={{fontSize:13,fontWeight:600,color:"#34D399",fontVariantNumeric:"tabular-nums"}}>{fmt(rimo)}</span></div>}
                {expenses.map(e=>(
                  <ExpenseRow
                    key={e.id}
                    expense={e}
                    onUpdateAmt={v=>updExpAmt(e.id,v)}
                    onUpdateCat={v=>updExpCat(e.id,v)}
                    onDelete={()=>delExp(e.id)}
                  />
                ))}
                {addingExp
                  ? <AddExpenseForm onAdd={addExp} onCancel={()=>setAddingExp(false)}/>
                  : <button onClick={()=>setAddingExp(true)}
                      style={{marginTop:8,width:"100%",background:"none",border:"1px dashed #374151",
                        borderRadius:8,padding:"8px",color:"#6B7280",fontSize:13,cursor:"pointer"}}>
                      + Add expense — type any category name
                    </button>
                }
                <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #1F2937",display:"flex",justifyContent:"space-between",fontSize:13}}>
                  <span style={{color:"#9CA3AF"}}>Total expenses</span>
                  <span style={{color:"#EC4899",fontWeight:700,fontVariantNumeric:"tabular-nums"}}>{fmt(etot+iraMo)}</span>
                </div>
              </Panel>
              <div>
                <Panel title="Spending Breakdown">
                  {[
                    ...(timo>0?[{l:"Traditional IRA",a:timo,c:"#10B981"}]:[]),
                    ...(rimo>0?[{l:"Roth IRA",a:rimo,c:"#34D399"}]:[]),
                    ...expenses.filter(e=>num(e.amt)>0).map(e=>({l:e.cat,a:num(e.amt),c:catColor(e.cat)})),
                  ].sort((a,b)=>b.a-a.a).map(({l,a,c})=>(
                    <div key={l} style={{marginBottom:7}}>
                      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                        <span style={{color:"#9CA3AF"}}>{l}</span>
                        <span style={{color:c,fontWeight:600}}>{fmt(a)}</span>
                      </div>
                      <ProgBar value={a} max={th} color={c}/>
                    </div>
                  ))}
                </Panel>
                <Panel title="Monthly Full Picture">
                  {[
                    {l:"Gross Income",     a:grossMo,    c:"#3B82F6"},
                    {l:"− Taxes",          a:-taxMo,     c:"#F87171"},
                    (t4mo+r4mo)>0?{l:"− 401(k)",a:-(t4mo+r4mo),c:"#818CF8"}:null,
                    otmo>0?{l:"− Other Pre-Tax",a:-otmo, c:"#8B5CF6"}:null,
                    {l:"= Take-Home",      a:th,         c:"#10B981",bold:true},
                    iraMo>0?{l:"− IRA",    a:-iraMo,     c:"#34D399"}:null,
                    {l:"− Living Expenses",a:-etot,      c:"#EC4899"},
                    {l:"= Remaining",      a:rem,        c:hc,bold:true},
                  ].filter(r=>r&&r.a!==0).map(({l,a,c,bold})=>(
                    <div key={l} style={{...S.fprow,fontSize:bold?13:12}}>
                      <span style={{color:bold?"#F9FAFB":"#9CA3AF",fontWeight:bold?700:400}}>{l}</span>
                      <span style={{color:c,fontWeight:700,fontVariantNumeric:"tabular-nums"}}>{fmt(Math.abs(a))}</span>
                    </div>
                  ))}
                </Panel>
              </div>
            </div>

            <Panel title="💰 Daily Savings — You vs. Double-Income Household" accent="#10B981">
              <div style={{display:"grid",gridTemplateColumns:"1fr auto 1fr",gap:16,alignItems:"center",marginBottom:20}}>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:10,color:"#6B7280",textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>You ({fmt(gross)} household)</div>
                  <div style={{fontSize:40,fontWeight:800,color:"#10B981",lineHeight:1,fontVariantNumeric:"tabular-nums"}}>{fmt(daily)}</div>
                  <div style={{fontSize:12,color:"#6B7280",marginTop:4}}>per day saved</div>
                  <div style={{marginTop:10,fontSize:11,color:"#6B7280",lineHeight:1.7}}>Retirement: {fmt(retMo)}/mo<br/>Cash surplus: {fmt(rem)}/mo</div>
                </div>
                <div style={{fontSize:22,color:"#374151",fontWeight:300,textAlign:"center"}}>vs</div>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:10,color:"#6B7280",textTransform:"uppercase",letterSpacing:"1px",marginBottom:8}}>{fmt(gr340)} household (est.)</div>
                  <div style={{fontSize:40,fontWeight:800,color:"#6366F1",lineHeight:1,fontVariantNumeric:"tabular-nums"}}>{fmt(day340)}</div>
                  <div style={{fontSize:12,color:"#6B7280",marginTop:4}}>per day saved</div>
                  <div style={{marginTop:10,fontSize:11,color:"#6B7280",lineHeight:1.7}}>Retirement: {fmt(t4m340+ira340)}/mo<br/>Cash surplus: {fmt(rem340)}/mo</div>
                </div>
              </div>
              <div style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6}}>
                  <span style={{color:"#6B7280"}}>Your daily savings pace vs. {fmt(gr340)} household</span>
                  <span style={{color:"#10B981",fontWeight:700}}>{Math.round(ratio*100)}%</span>
                </div>
                <div style={{height:12,background:"#1F2937",borderRadius:6,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${Math.min(ratio*100,100)}%`,background:"linear-gradient(90deg,#10B981,#6366F1)",borderRadius:6,transition:"width .4s"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#4B5563",marginTop:3}}>
                  <span>$0</span><span>{fmt(day340)}/day</span>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1.4fr 1fr 1fr",marginBottom:14}}>
                {[
                  {l:"Monthly",      y:"You",            d:fmt(gr340),           hdr:true},
                  {l:"Retirement",   y:fmt(retMo)+"/mo", d:fmt(t4m340+ira340)+"/mo"},
                  {l:"Cash surplus", y:fmt(rem)+"/mo",   d:fmt(rem340)+"/mo"},
                  {l:"Total saved",  y:fmt(mySave)+"/mo",d:fmt(sv340)+"/mo"},
                ].flatMap(({l,y,d,hdr})=>[
                  <div key={l+"-l"} style={{fontSize:12,padding:"5px 0",borderBottom:"1px solid #1F2937",color:hdr?"#6B7280":"#9CA3AF",fontWeight:hdr?700:400}}>{l}</div>,
                  <div key={l+"-y"} style={{fontSize:12,padding:"5px 0",borderBottom:"1px solid #1F2937",color:"#10B981",fontWeight:hdr?700:600,textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{y}</div>,
                  <div key={l+"-d"} style={{fontSize:12,padding:"5px 0",borderBottom:"1px solid #1F2937",color:"#6366F1",fontWeight:hdr?700:600,textAlign:"right",fontVariantNumeric:"tabular-nums"}}>{d}</div>,
                ])}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                {[
                  {l:"Annual savings gap",  v:fmt((sv340-mySave)*12)+"/yr", s:"more the double-income household saves"},
                  {l:"Savings multiplier",  v:(sv340/mySave).toFixed(1)+"×",s:"their monthly savings vs. yours"},
                ].map(({l,v,s})=>(
                  <div key={l} style={{background:"#0B1120",borderRadius:8,padding:"10px 12px",textAlign:"center"}}>
                    <div style={{fontSize:10,color:"#6B7280",textTransform:"uppercase",letterSpacing:"1px",marginBottom:4}}>{l}</div>
                    <div style={{fontSize:18,fontWeight:800,color:"#F59E0B",fontVariantNumeric:"tabular-nums"}}>{v}</div>
                    <div style={{fontSize:11,color:"#6B7280",marginTop:2}}>{s}</div>
                  </div>
                ))}
              </div>
              <div style={{background:"#0B1120",border:"1px solid #1F2937",borderRadius:8,padding:"10px 12px",fontSize:11,color:"#6B7280",lineHeight:1.7}}>
                <strong style={{color:"#9CA3AF"}}>{fmt(gr340)} assumptions:</strong> dual earners, both 401ks maxed ({fmt(LIM_401K*2)}/yr), both Roth IRAs maxed ({fmt(LIM_IRA*2)}/yr), same living expenses, same filing status. Despite 2× income they save <strong style={{color:"#F59E0B"}}>{(sv340/mySave).toFixed(1)}×</strong> more — driven by larger retirement contributions and a higher effective tax rate ({pct(T340.total/gr340||0)} vs your {pct(T.total/gross||0)}).
              </div>
            </Panel>

            <Panel title="🏆 How You Stack Up — Top 5% & Top 1% of U.S. Households" accent="#F59E0B">
              <p style={{margin:"0 0 14px",fontSize:11,color:"#6B7280",lineHeight:1.6}}>
                Thresholds: top 5% ≈ $252k/yr · top 1% ≈ $652k/yr (2024 IRS SOI data).
                Peer columns assume same filing status, same living expenses, 401k maxed per person, Roth IRA maxed per person.
              </p>
              {(()=>{
                const cols = [
                  { label:"You", gross, color:"#10B981",
                    th, taxes: T.total, retireMo: retMo, surplus: rem },
                  ...PEERS.map(p=>{
                    const Tp = calcTaxes(p.gross, fs, p.retire401k, 0, false);
                    const thP = p.gross/12 - Tp.total/12 - p.retire401k/12 - otmo;
                    const iraMoP = p.retireIra/12;
                    const surplusP = thP - etot - iraMoP;
                    const retireMoP = p.retire401k/12 + iraMoP;
                    return { label:p.label, gross:p.gross, color:p.color,
                      th:thP, taxes:Tp.total, retireMo:retireMoP, surplus:surplusP,
                      effectiveRate: Tp.total/p.gross };
                  }),
                ];
                const myEffective = T.total/gross||0;
                const rows = [
                  { key:"Annual Income",    vals: cols.map(c=>fmt(c.gross)) },
                  { key:"Annual Taxes",     vals: cols.map(c=>fmt(c.taxes)) },
                  { key:"Effective Rate",   vals: cols.map((c,i)=>i===0?pct(myEffective):pct(c.taxes/c.gross||0)) },
                  { key:"Monthly Take-Home",vals: cols.map(c=>fmt(c.th)) },
                  { key:"Retirement /mo",   vals: cols.map(c=>fmt(c.retireMo)) },
                  { key:"Living Expenses /mo", vals: cols.map(()=>fmt(etot)) },
                  { key:"Surplus /mo",      vals: cols.map(c=>fmt(c.surplus)) },
                  { key:"Surplus /yr",      vals: cols.map(c=>fmt(c.surplus*12)) },
                ];
                return (
                  <>
                    <div style={{display:"grid",gridTemplateColumns:`2fr ${cols.map(()=>"1fr").join(" ")}`,gap:0,marginBottom:16}}>
                      <div style={{fontSize:11,color:"#4B5563",padding:"6px 0",borderBottom:"1px solid #1F2937"}}/>
                      {cols.map(c=>(
                        <div key={c.label} style={{fontSize:12,fontWeight:700,color:c.color,padding:"6px 8px",
                          borderBottom:"1px solid #1F2937",textAlign:"right"}}>{c.label}</div>
                      ))}
                      {rows.map(r=>[
                        <div key={r.key+"-l"} style={{fontSize:12,color:"#9CA3AF",padding:"6px 0",borderBottom:"1px solid #1F2937"}}>{r.key}</div>,
                        ...cols.map((c,i)=>(
                          <div key={r.key+c.label} style={{fontSize:12,fontWeight:600,color:c.color,
                            padding:"6px 8px",borderBottom:"1px solid #1F2937",textAlign:"right",
                            fontVariantNumeric:"tabular-nums"}}>{r.vals[i]}</div>
                        )),
                      ])}
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:`repeat(${cols.length-1},1fr)`,gap:10}}>
                      {PEERS.map((p,pi)=>{
                        const peer = cols[pi+1];
                        const surplusGap = (peer.surplus - rem)*12;
                        const incomeGap  = p.gross - gross;
                        return (
                          <div key={p.label} style={{background:"#0B1120",borderRadius:8,padding:"10px 12px"}}>
                            <div style={{fontSize:10,color:"#6B7280",textTransform:"uppercase",letterSpacing:"1px",marginBottom:6}}>
                              vs {p.label}
                            </div>
                            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                              <span style={{color:"#6B7280"}}>Income gap</span>
                              <span style={{color:p.color,fontWeight:700}}>{fmt(incomeGap)}/yr more</span>
                            </div>
                            <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:8}}>
                              <span style={{color:"#6B7280"}}>Annual surplus gap</span>
                              <span style={{color:surplusGap>0?p.color:"#EF4444",fontWeight:700}}>
                                {surplusGap>0?"+":""}{fmt(surplusGap)}/yr
                              </span>
                            </div>
                            <ProgBar value={rem<0?0:rem} max={peer.surplus<0?1:peer.surplus} color={p.color} height={6}/>
                            <div style={{fontSize:10,color:"#6B7280",marginTop:4}}>
                              Your surplus is {peer.surplus>0?`${Math.round((rem/peer.surplus)*100)}%`:"—"} of theirs
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p style={{margin:"12px 0 0",fontSize:10,color:"#4B5563",lineHeight:1.5}}>
                      Peer taxes use the same filing status & NC flat rate. Retirement assumes one earner maxing 401k ({fmt(LIM_401K)}/yr) + Roth IRA ({fmt(LIM_IRA)}/yr). Living expenses held constant so surplus difference is purely income/tax driven.
                    </p>
                  </>
                );
              })()}
            </Panel>

            <div style={{textAlign:"center",marginTop:4}}>
              <button onClick={()=>{setSetup(D_SETUP);setExp(D_EXP);}}
                style={{background:"none",border:"1px solid #1F2937",borderRadius:8,padding:"6px 14px",color:"#6B7280",fontSize:11,cursor:"pointer"}}>
                Reset to defaults
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
