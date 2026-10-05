 "use client";

import { useEffect, useMemo, useState } from "react";
import "./styles.css";

type LinkItem = {
  id: string; url: string; title: string; description: string; domain: string;
  category: string; tags: string[]; note: string; createdAt: number;
  favorite: boolean; status: "inbox"|"saved";
};

const STARTER: LinkItem[] = [
 {id:"1",url:"https://example.com/demand-forecasting",title:"Demand Forecasting Best Practices",description:"Forecast accuracy, demand sensing, bias and planning workflows.",domain:"example.com",category:"Career",tags:["Supply Chain","Forecasting"],note:"Useful for interview preparation.",createdAt:Date.now()-86400000,favorite:true,status:"saved"},
 {id:"2",url:"https://example.com/ai-tools",title:"AI Tools for Everyday Work",description:"A collection of AI tools for research, writing, automation and productivity.",domain:"example.com",category:"AI",tags:["AI","Productivity"],note:"",createdAt:Date.now()-172800000,favorite:false,status:"saved"},
 {id:"3",url:"https://example.com/excel",title:"Advanced Excel Automation Guide",description:"Automating recurring reports with formulas and data workflows.",domain:"example.com",category:"Learning",tags:["Excel","Automation"],note:"",createdAt:Date.now()-259200000,favorite:false,status:"saved"},
];

const CATEGORIES = ["Career","AI","Learning","Tools","Travel","Shopping","Food","Entertainment","Finance","Health","News","Other"];

function classify(text:string){
  const s=text.toLowerCase();
  const rules:[string,string[]][]=[
    ["AI",["ai","artificial intelligence","chatgpt","machine learning","llm","prompt","automation"]],
    ["Career",["job","career","resume","cv","interview","recruit","supply chain","demand planning","forecasting"]],
    ["Learning",["course","tutorial","learn","guide","documentation","how to","lesson","excel"]],
    ["Travel",["travel","hotel","flight","trip","vacation","restaurant guide","places to visit"]],
    ["Shopping",["shop","buy","deal","price","product","review"]],
    ["Food",["recipe","restaurant","food","cafe","café","cooking"]],
    ["Entertainment",["movie","music","game","youtube","netflix","podcast"]],
    ["Finance",["finance","invest","stock","bank","tax","money"]],
    ["News",["news","breaking","report","journalism"]]
  ];
  return rules.find(([,words])=>words.some(w=>s.includes(w)))?.[0] || "Other";
}
function makeTags(text:string){
  const candidates=["AI","Automation","Excel","Supply Chain","Forecasting","Career","Productivity","Travel","Finance","Learning","Tools","Design","Business"];
  const s=text.toLowerCase();
  return candidates.filter(x=>s.includes(x.toLowerCase())).slice(0,4);
}
function prettyDate(ts:number){return new Intl.DateTimeFormat(undefined,{month:"short",day:"numeric"}).format(ts)}

export default function Home(){
 const [items,setItems]=useState<LinkItem[]>([]);
 const [query,setQuery]=useState("");
 const [view,setView]=useState("all");
 const [activeCat,setActiveCat]=useState("");
 const [modal,setModal]=useState(false);
 const [url,setUrl]=useState("");
 const [note,setNote]=useState("");
 const [saving,setSaving]=useState(false);
 const [hydrated,setHydrated]=useState(false);

 useEffect(()=>{try{const raw=localStorage.getItem("linkvault:v1");setItems(raw?JSON.parse(raw):STARTER);setHydrated(true)}catch{setItems(STARTER);setHydrated(true)}},[]);
 useEffect(()=>{if(hydrated)localStorage.setItem("linkvault:v1",JSON.stringify(items))},[items,hydrated]);

 const categories=useMemo(()=>{const m:Record<string,number>={};items.forEach(i=>m[i.category]=(m[i.category]||0)+1);return Object.entries(m).sort((a,b)=>b[1]-a[1])},[items]);

 const filtered=useMemo(()=>{
   const q=query.toLowerCase().trim();
   let a=[...items];
   if(view==="favorites")a=a.filter(x=>x.favorite);
   if(view==="inbox")a=a.filter(x=>x.status==="inbox");
   if(view==="recent")a.sort((x,y)=>y.createdAt-x.createdAt);
   if(activeCat)a=a.filter(x=>x.category===activeCat);
   if(q)a=a.filter(x=>[x.title,x.description,x.domain,x.category,x.note,...x.tags].join(" ").toLowerCase().includes(q));
   return a;
 },[items,query,view,activeCat]);

 async function saveLink(){
   if(!/^https?:\/\//i.test(url))return;
   setSaving(true);
   let title="",description="",domain="";
   try{
     const r=await fetch("/api/metadata",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({url})});
     if(r.ok){const d=await r.json();title=d.title||"";description=d.description||"";domain=d.domain||""}
   }catch{}
   try{domain ||= new URL(url).hostname.replace(/^www\./,"")}catch{}
   title ||= domain || "Saved link";
   const combined=`${title} ${description} ${url} ${note}`;
   const category=classify(combined);
   const tags=makeTags(combined);
   const item:LinkItem={id:crypto.randomUUID(),url,title,description:description||"Saved to LinkVault. Add a note if you want to remember why.",domain,category,tags:tags.length?tags:["New"],note,createdAt:Date.now(),favorite:false,status:"saved"};
   setItems(x=>[item,...x]);setUrl("");setNote("");setModal(false);setSaving(false);
 }
 function toggleFav(id:string){setItems(a=>a.map(x=>x.id===id?{...x,favorite:!x.favorite}:x))}
 function remove(id:string){setItems(a=>a.filter(x=>x.id!==id))}
 function exportData(){const blob=new Blob([JSON.stringify(items,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="linkvault-export.json";a.click();URL.revokeObjectURL(a.href)}
 function importData(e:React.ChangeEvent<HTMLInputElement>){const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(String(r.result));if(Array.isArray(d))setItems(d)}catch{alert("That file is not a valid LinkVault export.")}};r.readAsText(f)}

 return <div className="shell">
  <aside className="sidebar">
    <div className="brand"><div className="brandIcon">↗</div><span>LinkVault</span></div>
    <nav>
      <button className={!view&&!activeCat?"active":""} onClick={()=>{setView("all");setActiveCat("")}}>⌂ <span>All Links</span><b>{items.length}</b></button>
      <button className={view==="inbox"?"active":""} onClick={()=>{setView("inbox");setActiveCat("")}}>▣ <span>Inbox</span><b>{items.filter(x=>x.status==="inbox").length||""}</b></button>
      <button className={view==="recent"?"active":""} onClick={()=>{setView("recent");setActiveCat("")}}>◷ <span>Recent</span></button>
      <button className={view==="favorites"?"active":""} onClick={()=>{setView("favorites");setActiveCat("")}}>★ <span>Favorites</span><b>{items.filter(x=>x.favorite).length||""}</b></button>
    </nav>
    <div className="sideTitle">Categories</div>
    <nav>{categories.map(([cat,n])=><button key={cat} className={activeCat===cat?"active":""} onClick={()=>{setActiveCat(cat);setView("all")}}>◈ <span>{cat}</span><b>{n}</b></button>)}</nav>
    <div className="sideBottom">
      <button onClick={exportData}>↓ Export library</button>
      <label>↑ Import library<input type="file" accept="application/json" onChange={importData}/></label>
    </div>
  </aside>

  <main className="main">
    <header><div><h1>{activeCat||view==="favorites"?"Favorites":view==="inbox"?"Inbox":view==="recent"?"Recent":"Your Library"}</h1><p>Save it. LinkVault handles the organizing.</p></div><button className="primary" onClick={()=>setModal(true)}>＋ Save Link</button></header>
    <div className="search"><span>⌕</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search titles, topics, notes, tags, or domains…"/>{query&&<button onClick={()=>setQuery("")}>×</button>}</div>
    <div className="toolbar"><strong>{query?`${filtered.length} result${filtered.length===1?"":"s"}`:`${filtered.length} saved link${filtered.length===1?"":"s"}`}</strong><span>Smart library · Cards</span></div>
    <section className="grid">
      {filtered.map(x=><article className="card" key={x.id}>
        <div className="cover"><div className="coverIcon">{x.category==="AI"?"✦":x.category==="Career"?"⌁":x.category==="Learning"?"▤":"◉"}</div><span>{x.domain}</span></div>
        <div className="cardBody"><div className="eyebrow">{x.category} · {x.domain}</div><h2>{x.title}</h2><p>{x.description}</p>
        <div className="tags">{x.tags.map(t=><span key={t}>#{t}</span>)}</div>
        {x.note&&<div className="note">“{x.note}”</div>}
        <footer><small>{prettyDate(x.createdAt)}</small><div><button className={x.favorite?"star on":"star"} onClick={()=>toggleFav(x.id)}>{x.favorite?"★":"☆"}</button><a href={x.url} target="_blank" rel="noreferrer">↗</a><button className="delete" onClick={()=>remove(x.id)}>⋯</button></div></footer>
        </div>
      </article>)}
      {!filtered.length&&<div className="empty"><div>⌕</div><h2>Nothing here yet</h2><p>Save a link or change your search. LinkVault will do the organizing.</p><button className="primary" onClick={()=>setModal(true)}>Save your first link</button></div>}
    </section>
  </main>

  {modal&&<div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setModal(false)}}><div className="modal">
    <div className="modalHead"><div><h2>Save a link</h2><p>Paste it. That's all you need to do.</p></div><button onClick={()=>setModal(false)}>×</button></div>
    <label>URL<input autoFocus value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://example.com/article"/></label>
    <label>Optional note<textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Why did you save this? (optional)"/></label>
    <div className="tip">✨ LinkVault will automatically identify the website, choose a category and generate useful tags.</div>
    <button className="primary wide" disabled={saving||!url} onClick={saveLink}>{saving?"Understanding link…":"Save to LinkVault"}</button>
  </div></div>}
 </div>
}