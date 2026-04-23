import { useState, useEffect } from "react";

const T = {
  fr: {
    appName:"Leadaly",tagline:"Prospection intelligente",
    nav:{dashboard:"Dashboard",prospects:"Prospects",campaigns:"Emails",scraping:"Scraping",settings:"Réglages"},
    dashboard:"Tableau de bord",dashboardSub:"Vue d'ensemble de votre prospection.",
    totalProspects:"Prospects",emailsSent:"Emails",pending:"En attente",sendRate:"Taux",
    bySector:"Par secteur",recentActivity:"Activité récente",
    prospectsAvail:"prospects disponibles",
    send:"Envoyer",details:"Détails",
    compose:"Nouveau mail",cancel:"Annuler",sending:"Envoi...",
    subject:"Objet",message:"Message",to:"À",
    generateAI:"✨ Générer avec l'IA",generating:"⏳ Génération...",
    addCalendly:"Ajouter lien Calendly",
    calendlyUrl:"Votre lien Calendly",
    noProspect:"Aucun prospect",noEmails:"Aucun email envoyé",
    emailSentOk:"Email envoyé !",
    scrapingTitle:"Scraping LinkedIn",scrapingDesc:"Extraire des profils B2B",
    apiChoice:"API de scraping",
    searchQuery:"Requête",searchQueryPh:"VP Sales fintech Paris",
    location:"Localisation",locationPh:"France, Paris",
    industry:"Secteur",industryPh:"SaaS, Fintech...",
    maxResults:"Résultats max",
    launchScraping:"🚀 Lancer le scraping",scrapingRunning:"⏳ En cours...",
    scrapingDone:"✅ {n} prospects extraits !",
    apiDocs:"Doc",selectAll:"Tout sélect.",
    filterAll:"Tous",filterNew:"Nouveaux",filterContacted:"Contactés",
    search:"Rechercher...",back:"Retour",
    experience:"Expérience",skills:"Compétences",
    noActivity:"Aucune activité",sentEmails:"Emails envoyés",email:"email(s)",
    filterSent:"Envoyés",filterPending:"En attente",
    aiEmailHint:"L'IA personnalise le mail avec les infos du prospect",
    selectProspect:"Choisir un prospect...",
    viewDetail:"Voir le profil",
  },
  en: {
    appName:"Leadaly",tagline:"Smart Prospecting",
    nav:{dashboard:"Dashboard",prospects:"Prospects",campaigns:"Emails",scraping:"Scraping",settings:"Settings"},
    dashboard:"Dashboard",dashboardSub:"Overview of your prospecting.",
    totalProspects:"Prospects",emailsSent:"Emails",pending:"Pending",sendRate:"Rate",
    bySector:"By Industry",recentActivity:"Recent Activity",
    prospectsAvail:"prospects available",
    send:"Send",details:"Details",
    compose:"New email",cancel:"Cancel",sending:"Sending...",
    subject:"Subject",message:"Message",to:"To",
    generateAI:"✨ Generate with AI",generating:"⏳ Generating...",
    addCalendly:"Add Calendly link",
    calendlyUrl:"Your Calendly link",
    noProspect:"No prospects",noEmails:"No emails sent",
    emailSentOk:"Email sent!",
    scrapingTitle:"LinkedIn Scraping",scrapingDesc:"Extract B2B LinkedIn profiles",
    apiChoice:"Scraping API",
    searchQuery:"Query",searchQueryPh:"VP Sales fintech Paris",
    location:"Location",locationPh:"France, Paris",
    industry:"Industry",industryPh:"SaaS, Fintech...",
    maxResults:"Max results",
    launchScraping:"🚀 Launch scraping",scrapingRunning:"⏳ Running...",
    scrapingDone:"✅ {n} prospects extracted!",
    apiDocs:"Docs",selectAll:"Select all",
    filterAll:"All",filterNew:"New",filterContacted:"Contacted",
    search:"Search...",back:"Back",
    experience:"Experience",skills:"Skills",
    noActivity:"No recent activity",sentEmails:"Sent Emails",email:"email(s)",
    filterSent:"Sent",filterPending:"Pending",
    aiEmailHint:"AI personalizes the email with prospect data",
    selectProspect:"Choose a prospect...",
    viewDetail:"View profile",
  }
};

const PROSPECTS = [
  {id:1,firstName:"Hugo",lastName:"Labrousse",title:"Global Key Account Manager",email:"h.labrousse@parisaltitude.com",company:"Paris Altitude",location:"Paris, France",industry:"Real Estate",avatar:"HL",score:82,status:"new",experience:[{role:"Global KAM",co:"Paris Altitude",years:"2021–présent"},{role:"Sales Manager",co:"JLL",years:"2018–2021"}],skills:["B2B Sales","CRM","Négociation","English"]},
  {id:2,firstName:"Anta",lastName:"Niang",title:"Real Estate Program Manager",email:"anta.niang@icade.fr",company:"Icade",location:"Paris, France",industry:"Real Estate",avatar:"AN",score:88,status:"new",experience:[{role:"Program Manager",co:"Icade",years:"2020–présent"}],skills:["Gestion de projet","Immobilier","Finance"]},
  {id:3,firstName:"Florian",lastName:"Morel",title:"Program Manager",email:"florian.morel@icade.fr",company:"Icade",location:"Marseille, France",industry:"Real Estate",avatar:"FM",score:71,status:"contacted",experience:[{role:"PM",co:"Icade",years:"2019–présent"}],skills:["Agile","JIRA","Leadership"]},
  {id:4,firstName:"Christel",lastName:"Zordan",title:"General Manager",email:"c.zordan@stoureiffel.com",company:"Société De La Tour Eiffel",location:"Boulogne-Billancourt",industry:"Real Estate",avatar:"CZ",score:95,status:"new",experience:[{role:"GM",co:"Tour Eiffel sff",years:"2017–présent"},{role:"CFO",co:"Nexity",years:"2012–2017"}],skills:["P&L","M&A","Strategy","Leadership"]},
  {id:5,firstName:"Clemence",lastName:"Lemagnen",title:"Management Control Manager",email:"clemagnen@cboterritoria.com",company:"Cbo Territoria",location:"France",industry:"Real Estate",avatar:"CL",score:76,status:"new",experience:[{role:"Controller",co:"Cbo Territoria",years:"2020–présent"}],skills:["Reporting","Excel","Power BI"]},
  {id:6,firstName:"Edouard",lastName:"Pavageau",title:"Asset Manager",email:"e.pavageau@stoureiffel.com",company:"Société De La Tour Eiffel",location:"Paris, France",industry:"Real Estate",avatar:"EP",score:84,status:"contacted",experience:[{role:"Asset Manager",co:"Tour Eiffel sff",years:"2019–présent"}],skills:["Portfolio","Valuation","Négociation"]},
];

const APIS=[
  {id:"linkdapi",name:"LinkdAPI",badge:"⭐ Recommandé",desc:"Successeur de Proxycurl. Zéro faux compte, données publiques uniquement. JSON identique.",price:"$0.01/profil · 100 crédits gratuits",docs:"https://linkdapi.com",color:"#2563EB"},
  {id:"apify",name:"Apify",badge:"💰 Pay-per-use",desc:"Marketplace d'actors LinkedIn. Pay-as-you-go, très flexible.",price:"~$3/1000 profils · 3j gratuits",docs:"https://apify.com",color:"#7C3AED"},
  {id:"scrapin",name:"ScrapIn",badge:"⚡ Temps réel",desc:"Scraping temps réel, sans cookie ni compte LinkedIn.",price:"~$49/mois · Essai gratuit",docs:"https://scrapin.io",color:"#059669"},
  {id:"brightdata",name:"Bright Data",badge:"🏢 Enterprise",desc:"Plateforme enterprise-grade. Pour hauts volumes uniquement.",price:"Sur devis",docs:"https://brightdata.com",color:"#D97706"},
];

const INITIAL_EMAILS=[
  {id:1,to:"h.labrousse@parisaltitude.com",toName:"Hugo Labrousse",company:"Paris Altitude",title:"Global Key Account Manager",subject:"Paris Altitude × IA : 3 leviers pour scaler vos ventes",body:"Bonjour Hugo,\n\nEn tant que Global KAM chez Paris Altitude, vous gérez des cycles de vente complexes et des comptes stratégiques.\n\nL'IA peut transformer votre approche :\n\n• Scoring automatique de vos leads\n• Personnalisation à grande échelle de vos propositions\n• Veille concurrentielle automatisée\n\n👉 Réserver 20 minutes : https://calendly.com/naom-ai/demo\n\nCordialement,\nNAOM AI · Prospection intelligente",sentAt:"23 avr., 23:48",status:"sent",avatar:"HL",avatarColor:"#4F86F7"},
];

const ACOLORS=["#4F86F7","#7C3AED","#059669","#D97706","#10B981","#EF4444","#EC4899","#F59E0B"];
const scoreColor=s=>s>=85?"#10B981":s>=70?"#F59E0B":"#EF4444";

export default function App(){
  const [lang,setLang]=useState("fr");
  const [view,setView]=useState("prospects");
  const [prospects,setProspects]=useState(PROSPECTS);
  const [emails,setEmails]=useState(INITIAL_EMAILS);
  const [selectedEmail,setSelectedEmail]=useState(null);
  const [composing,setComposing]=useState(false);
  const [composeProspect,setComposeProspect]=useState(null);
  const [composeData,setComposeData]=useState({subject:"",body:""});
  const [generatingAI,setGeneratingAI]=useState(false);
  const [sendingEmail,setSendingEmail]=useState(false);
  const [showCalendly,setShowCalendly]=useState(false);
  const [calendlyUrl,setCalendlyUrl]=useState("https://calendly.com/votre-nom/30min");
  const [toast,setToast]=useState(null);
  const [filter,setFilter]=useState("all");
  const [search,setSearch]=useState("");
  const [detailProspect,setDetailProspect]=useState(null);
  const [scrapingConfig,setScrapingConfig]=useState({api:"linkdapi",query:"",location:"",industry:"",maxResults:50});
  const [scrapingRunning,setScrapingRunning]=useState(false);
  const [scrapingResult,setScrapingResult]=useState(null);
  const [emailFilter,setEmailFilter]=useState("all");
  const [isMobile,setIsMobile]=useState(window.innerWidth<768);

  useEffect(()=>{
    const h=()=>setIsMobile(window.innerWidth<768);
    window.addEventListener("resize",h);
    return()=>window.removeEventListener("resize",h);
  },[]);

  const t=T[lang];
  const showToast=(msg,type="ok")=>{setToast({msg,type});setTimeout(()=>setToast(null),3000)};

  const openCompose=(prospect)=>{
    setComposeProspect(prospect);
    setComposeData({subject:"",body:""});
    setShowCalendly(false);
    setComposing(true);
  };

  const generateWithAI=async()=>{
    if(!composeProspect)return;
    setGeneratingAI(true);
    try{
      const prompt=`Tu es un expert en outreach B2B. Rédige un email de prospection ultra-personnalisé.
Prospect: ${composeProspect.firstName} ${composeProspect.lastName}, ${composeProspect.title} chez ${composeProspect.company} (${composeProspect.industry}, ${composeProspect.location}).
Compétences: ${composeProspect.skills?.join(", ")}.
${showCalendly?`Inclus ce lien Calendly: ${calendlyUrl}`:""}
Règles: objet <15 mots, corps <150 mots, 1 pain point métier précis, 1 bénéfice IA concret, CTA clair${showCalendly?", inclure le lien Calendly avec 📅":""}.
Langue: ${lang==="fr"?"français":"anglais"}. Signature: NAOM AI · Prospection intelligente.
Réponds UNIQUEMENT en JSON strict sans markdown: {"subject":"...","body":"..."}`;
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
      const d=await r.json();
      const txt=d.content?.find(c=>c.type==="text")?.text||"";
      const parsed=JSON.parse(txt.replace(/```json|```/g,"").trim());
      setComposeData({subject:parsed.subject||"",body:parsed.body||""});
    }catch(e){showToast("Erreur IA","err")}
    setGeneratingAI(false);
  };

  const sendEmail=()=>{
    if(!composeData.subject||!composeData.body)return;
    setSendingEmail(true);
    setTimeout(()=>{
      setEmails(prev=>[{id:prev.length+1,to:composeProspect?.email,toName:`${composeProspect?.firstName} ${composeProspect?.lastName}`,company:composeProspect?.company,title:composeProspect?.title,subject:composeData.subject,body:composeData.body,sentAt:new Date().toLocaleString(lang==="fr"?"fr-FR":"en-US",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}),status:"sent",avatar:composeProspect?.avatar,avatarColor:ACOLORS[composeProspect?.id%ACOLORS.length]},...prev]);
      setProspects(prev=>prev.map(p=>p.id===composeProspect?.id?{...p,status:"contacted"}:p));
      setSendingEmail(false);setComposing(false);showToast(t.emailSentOk);
    },1400);
  };

  const launchScraping=()=>{
    if(!scrapingConfig.query)return;
    setScrapingRunning(true);setScrapingResult(null);
    setTimeout(()=>{const n=Math.floor(Math.random()*15)+8;setScrapingResult(n);setScrapingRunning(false);showToast(t.scrapingDone.replace("{n}",n));},2800);
  };

  const filtered=prospects.filter(p=>{
    const mf=filter==="all"||(filter==="new"&&p.status==="new")||(filter==="contacted"&&p.status==="contacted");
    const ms=!search||`${p.firstName} ${p.lastName} ${p.company}`.toLowerCase().includes(search.toLowerCase());
    return mf&&ms;
  });

  const filteredEmails=emails.filter(e=>emailFilter==="all"||(emailFilter==="sent"&&e.status==="sent")||(emailFilter==="pending"&&e.status==="pending"));

  const NAV_ITEMS=[
    {id:"dashboard",icon:"⊞",label:t.nav.dashboard},
    {id:"prospects",icon:"👥",label:t.nav.prospects},
    {id:"campaigns",icon:"✉️",label:t.nav.campaigns},
    {id:"scraping",icon:"🔍",label:t.nav.scraping},
    {id:"settings",icon:"⚙️",label:t.nav.settings},
  ];

  return(
    <div style={{fontFamily:"'Inter','Helvetica Neue',sans-serif",minHeight:"100vh",background:"linear-gradient(135deg,#dbeafe 0%,#ede9fe 50%,#dcfce7 100%)",display:"flex",flexDirection:isMobile?"column":"row",fontSize:14}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .card{background:rgba(255,255,255,.88);backdrop-filter:blur(14px);border-radius:16px;border:1px solid rgba(255,255,255,.95);box-shadow:0 2px 20px rgba(80,80,180,.06)}
        .btn-blue{background:linear-gradient(135deg,#3B82F6,#6366F1);color:#fff;border:none;border-radius:10px;padding:9px 18px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;transition:opacity .15s;white-space:nowrap}
        .btn-blue:hover{opacity:.88}
        .btn-blue:disabled{opacity:.5;cursor:not-allowed}
        .btn-outline{background:rgba(255,255,255,.7);border:1px solid rgba(100,100,180,.22);border-radius:10px;padding:9px 18px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;color:#555;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .15s;white-space:nowrap}
        .btn-outline:hover{border-color:#4F86F7;color:#4F86F7}
        .btn-ai{background:linear-gradient(135deg,#8B5CF6,#EC4899);color:#fff;border:none;border-radius:10px;padding:10px 20px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:opacity .15s;width:100%}
        .btn-ai:hover{opacity:.88}
        .btn-ai:disabled{opacity:.5;cursor:not-allowed}
        .nav-desktop{display:flex;align-items:center;gap:9px;padding:10px 14px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:500;color:#666;transition:all .15s;border:none;background:none;font-family:inherit;width:100%;text-align:left}
        .nav-desktop:hover{background:rgba(59,130,246,.1);color:#3B82F6}
        .nav-desktop.active{background:linear-gradient(135deg,rgba(59,130,246,.18),rgba(99,102,241,.12));color:#3B82F6;font-weight:600}
        .input{width:100%;border:1px solid rgba(100,100,180,.2);border-radius:10px;padding:10px 14px;font-size:14px;font-family:inherit;background:rgba(255,255,255,.8);color:#111;outline:none;transition:border-color .15s}
        .input:focus{border-color:#4F86F7;box-shadow:0 0 0 3px rgba(79,134,247,.1)}
        .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600}
        .tab{padding:8px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:none;background:none;font-family:inherit;color:#888;transition:all .15s}
        .tab.active{background:white;color:#111;box-shadow:0 1px 6px rgba(0,0,0,.09)}
        .overlay{position:fixed;inset:0;background:rgba(60,60,120,.22);backdrop-filter:blur(6px);display:flex;align-items:flex-end;justify-content:center;z-index:100;padding:0}
        @media(min-width:768px){.overlay{align-items:center;padding:20px}}
        .modal{background:white;border-radius:20px 20px 0 0;padding:24px;width:100%;max-height:92vh;overflow-y:auto;box-shadow:0 -8px 40px rgba(60,60,120,.18)}
        @media(min-width:768px){.modal{border-radius:20px;max-width:600px;max-height:90vh}}
        .modal-handle{width:36px;height:4px;background:#e0e0e0;border-radius:2px;margin:0 auto 20px}
        .prospect-card{background:rgba(255,255,255,.9);border-radius:14px;border:1px solid rgba(255,255,255,.95);box-shadow:0 2px 14px rgba(80,80,180,.06);padding:18px;transition:box-shadow .18s,transform .18s}
        .prospect-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(80,80,180,.12)}
        .prospect-card.selected-card{border-color:#3B82F6;box-shadow:0 0 0 2px rgba(59,130,246,.25)}
        .checkbox{width:20px;height:20px;border-radius:6px;border:1.5px solid #ccc;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0}
        .checkbox.checked{background:#3B82F6;border-color:#3B82F6}
        .del-btn{background:none;border:none;cursor:pointer;color:#ddd;padding:4px;border-radius:6px;transition:color .15s;line-height:1;min-width:28px;min-height:28px;display:flex;align-items:center;justify-content:center}
        .del-btn:hover{color:#EF4444}
        .email-row{padding:14px;border-radius:12px;cursor:pointer;border:1px solid transparent;transition:all .15s}
        .email-row:hover{background:rgba(59,130,246,.05);border-color:rgba(59,130,246,.15)}
        .email-row.active{background:rgba(59,130,246,.08);border-color:rgba(59,130,246,.25)}
        .toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);padding:12px 20px;border-radius:12px;font-size:13px;font-weight:600;z-index:300;white-space:nowrap;animation:slide .25s}
        @media(min-width:768px){.toast{bottom:24px;right:24px;left:auto;transform:none}}
        @keyframes slide{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @media(min-width:768px){@keyframes slide{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}}
        .bottom-nav{position:fixed;bottom:0;left:0;right:0;background:rgba(255,255,255,.95);backdrop-filter:blur(20px);border-top:1px solid rgba(100,100,180,.12);display:flex;z-index:50;padding-bottom:env(safe-area-inset-bottom)}
        .bottom-nav-item{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px 4px 8px;cursor:pointer;border:none;background:none;font-family:inherit;transition:all .15s;gap:3px}
        .bottom-nav-item span.ico{font-size:20px;line-height:1}
        .bottom-nav-item span.lbl{font-size:9px;font-weight:600;color:#aaa;transition:color .15s;letter-spacing:.02em}
        .bottom-nav-item.active span.lbl{color:#3B82F6}
        .api-card{border:2px solid transparent;border-radius:12px;padding:14px;cursor:pointer;transition:all .2s;background:rgba(255,255,255,.7)}
        .api-card.selected-api{background:white;box-shadow:0 4px 16px rgba(80,80,180,.1)}
        textarea.input{resize:vertical;line-height:1.65}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(100,100,180,.2);border-radius:2px}
      `}</style>

      {/* DESKTOP SIDEBAR */}
      {!isMobile&&(
        <div style={{width:220,flexShrink:0,padding:"20px 14px",display:"flex",flexDirection:"column",gap:4,minHeight:"100vh"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 6px",marginBottom:18}}>
            <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,#3B82F6,#6366F1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:"white"}}>L</div>
            <span style={{fontSize:16,fontWeight:800,color:"#111",letterSpacing:"-0.5px"}}>Leadaly</span>
          </div>
          {NAV_ITEMS.map(item=>(
            <button key={item.id} className={`nav-desktop${view===item.id?" active":""}`} onClick={()=>{setView(item.id);setDetailProspect(null)}}>
              <span style={{fontSize:15}}>{item.icon}</span>{item.label}
            </button>
          ))}
          <div style={{flex:1}}/>
          <div style={{display:"flex",gap:4,padding:"6px"}}>
            {["fr","en"].map(l=>(
              <button key={l} onClick={()=>setLang(l)} style={{flex:1,padding:"6px",border:`1.5px solid ${lang===l?"#3B82F6":"rgba(100,100,180,.2)"}`,borderRadius:8,background:lang===l?"#3B82F6":"transparent",color:lang===l?"white":"#666",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>{l.toUpperCase()}</button>
            ))}
          </div>
          <div style={{padding:"4px 10px 6px",fontSize:11,color:"#aaa",fontWeight:500}}>{t.tagline}</div>
        </div>
      )}

      {/* MOBILE TOP BAR */}
      {isMobile&&(
        <div style={{background:"rgba(255,255,255,.92)",backdropFilter:"blur(16px)",borderBottom:"1px solid rgba(100,100,180,.1)",padding:"12px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:40}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {detailProspect?(
              <button onClick={()=>setDetailProspect(null)} style={{background:"none",border:"none",cursor:"pointer",color:"#3B82F6",fontWeight:600,fontSize:14,fontFamily:"inherit",padding:"4px 0",display:"flex",alignItems:"center",gap:4}}>
                ← {t.back}
              </button>
            ):(
              <>
                <div style={{width:28,height:28,borderRadius:8,background:"linear-gradient(135deg,#3B82F6,#6366F1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"white"}}>L</div>
                <span style={{fontSize:15,fontWeight:800,color:"#111",letterSpacing:"-0.5px"}}>Leadaly</span>
              </>
            )}
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {["fr","en"].map(l=>(
              <button key={l} onClick={()=>setLang(l)} style={{padding:"4px 8px",border:`1.5px solid ${lang===l?"#3B82F6":"rgba(100,100,180,.2)"}`,borderRadius:7,background:lang===l?"#3B82F6":"transparent",color:lang===l?"white":"#666",fontWeight:700,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={{flex:1,padding:isMobile?"16px 16px 90px":"28px 32px",overflow:"auto",minHeight:"100vh"}}>

        {/* ── DASHBOARD ── */}
        {view==="dashboard"&&!detailProspect&&(
          <div>
            <h1 style={{fontSize:isMobile?20:24,fontWeight:700,color:"#111",marginBottom:4}}>{t.dashboard}</h1>
            <p style={{color:"#888",fontSize:12,marginBottom:20}}>{t.dashboardSub}</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:16}}>
              {[{l:t.totalProspects,v:prospects.length,bg:"#EFF6FF",e:"👥"},{l:t.emailsSent,v:emails.length,bg:"#ECFDF5",e:"✉️"},{l:t.pending,v:0,bg:"#FFFBEB",e:"⏳"},{l:t.sendRate,v:`${prospects.length?Math.round((emails.length/prospects.length)*100):0}%`,bg:"#F5F3FF",e:"📈"}].map((s,i)=>(
                <div key={i} className="card" style={{padding:16}}>
                  <div style={{fontSize:20,marginBottom:8}}>{s.e}</div>
                  <div style={{fontSize:isMobile?22:26,fontWeight:700,color:"#111"}}>{s.v}</div>
                  <div style={{fontSize:11,color:"#888",marginTop:3}}>{s.l}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{padding:18,marginBottom:14}}>
              <div style={{fontWeight:600,marginBottom:14,fontSize:13}}>📊 {t.bySector}</div>
              {[...new Set(prospects.map(p=>p.industry))].map(ind=>{
                const c=prospects.filter(p=>p.industry===ind).length;
                return <div key={ind} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:"#666"}}>{ind}</span><span style={{fontSize:12,fontWeight:600}}>{c}</span></div>
                  <div style={{height:5,borderRadius:3,background:"#f0f0f0"}}><div style={{width:`${(c/prospects.length)*100}%`,height:"100%",borderRadius:3,background:"#3B82F6"}}/></div>
                </div>;
              })}
            </div>
            <div className="card" style={{padding:18}}>
              <div style={{fontWeight:600,marginBottom:14,fontSize:13}}>📬 {t.recentActivity}</div>
              {emails.slice(0,3).map(e=>(
                <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(100,100,180,.07)"}}>
                  <div style={{width:32,height:32,borderRadius:9,background:e.avatarColor,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"white",flexShrink:0}}>{e.avatar}</div>
                  <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:500,color:"#111",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.toName}</div><div style={{fontSize:11,color:"#888",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.subject}</div></div>
                  <span style={{fontSize:10,color:"#aaa",flexShrink:0}}>{e.sentAt}</span>
                </div>
              ))}
              {emails.length===0&&<div style={{textAlign:"center",color:"#ccc",padding:"12px 0",fontSize:13}}>{t.noActivity}</div>}
            </div>
          </div>
        )}

        {/* ── PROSPECTS CARD GRID ── */}
        {view==="prospects"&&!detailProspect&&(
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,gap:10}}>
              <div>
                <h1 style={{fontSize:isMobile?18:22,fontWeight:700,color:"#111"}}>{t.nav.prospects}</h1>
                <p style={{fontSize:11,color:"#888",marginTop:2}}>{filtered.length} {t.prospectsAvail}</p>
              </div>
              <button className="btn-blue" style={{fontSize:12,padding:"9px 14px",flexShrink:0}} onClick={()=>{setComposing(true);setComposeProspect(null);setComposeData({subject:"",body:""})}}>✉️ {t.compose}</button>
            </div>
            <input className="input" style={{marginBottom:12}} placeholder={t.search} value={search} onChange={e=>setSearch(e.target.value)}/>
            <div style={{display:"flex",gap:4,background:"rgba(100,100,180,.08)",borderRadius:10,padding:4,marginBottom:16,width:"fit-content"}}>
              {[["all",t.filterAll],["new",t.filterNew],["contacted",t.filterContacted]].map(([f,label])=>(
                <button key={f} className={`tab${filter===f?" active":""}`} onClick={()=>setFilter(f)}>{label}</button>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
              {filtered.map(p=>(
                <div key={p.id} className="prospect-card">
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:40,height:40,borderRadius:12,background:ACOLORS[p.id%ACOLORS.length],display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"white",flexShrink:0}}>{p.avatar}</div>
                      <div>
                        <div style={{fontWeight:700,fontSize:14,color:"#111"}}>{p.firstName} {p.lastName}</div>
                        <div style={{fontSize:11,color:"#888",marginTop:1}}>{p.title}</div>
                      </div>
                    </div>
                    <button className="del-btn" onClick={()=>setProspects(prev=>prev.filter(x=>x.id!==p.id))}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M19 6l-1 14H6L5 6M9 6V4h6v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                  <div style={{fontSize:12,color:"#3B82F6",marginBottom:8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.email}</div>
                  <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
                    <span style={{fontSize:11,color:"#555",display:"flex",alignItems:"center",gap:3}}>🏢 {p.company}</span>
                    <span style={{fontSize:11,color:"#555",display:"flex",alignItems:"center",gap:3}}>📍 {p.location}</span>
                  </div>
                  <div style={{marginBottom:14,display:"flex",gap:6,flexWrap:"wrap"}}>
                    <span className="badge" style={{background:"#EFF6FF",color:"#2563EB"}}>{p.industry}</span>
                    <span className="badge" style={{background:p.status==="new"?"#ECFDF5":"#F5F3FF",color:p.status==="new"?"#059669":"#7C3AED"}}>{p.status==="new"?t.filterNew:t.filterContacted}</span>
                    <span style={{display:"inline-flex",alignItems:"center",padding:"3px 8px",borderRadius:20,background:scoreColor(p.score)+"18",fontSize:11,fontWeight:700,color:scoreColor(p.score)}}>★ {p.score}</span>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button className="btn-outline" style={{flex:1,fontSize:12,padding:"9px 8px"}} onClick={()=>setDetailProspect(p)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      {t.details}
                    </button>
                    <button className="btn-blue" style={{flex:1,fontSize:12,padding:"9px 8px"}} onClick={()=>openCompose(p)}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="white" strokeWidth="1.5"/><path d="M22 6l-10 7L2 6" stroke="white" strokeWidth="1.5"/></svg>
                      {t.send}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── DETAIL PROSPECT ── */}
        {detailProspect&&(
          <div>
            {!isMobile&&<button className="btn-outline" style={{marginBottom:18,fontSize:12}} onClick={()=>setDetailProspect(null)}>← {t.back}</button>}
            <div className="card" style={{padding:isMobile?18:26}}>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20,paddingBottom:18,borderBottom:"1px solid rgba(100,100,180,.1)"}}>
                <div style={{width:52,height:52,borderRadius:14,background:ACOLORS[detailProspect.id%ACOLORS.length],display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:"white",flexShrink:0}}>{detailProspect.avatar}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:isMobile?17:19,fontWeight:700,color:"#111"}}>{detailProspect.firstName} {detailProspect.lastName}</div>
                  <div style={{color:"#888",fontSize:13,marginTop:2}}>{detailProspect.title}</div>
                  <div style={{color:"#3B82F6",fontSize:12,marginTop:2}}>{detailProspect.email}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:18}}>
                <span className="badge" style={{background:"#EFF6FF",color:"#2563EB"}}>{detailProspect.company}</span>
                <span className="badge" style={{background:"#ECFDF5",color:"#059669"}}>{detailProspect.location}</span>
                <span className="badge" style={{background:"#F5F3FF",color:"#7C3AED"}}>{detailProspect.industry}</span>
              </div>
              <div style={{marginBottom:18}}>
                <div style={{fontWeight:600,marginBottom:12,fontSize:13}}>💼 {t.experience}</div>
                {detailProspect.experience?.map((ex,i)=>(
                  <div key={i} style={{display:"flex",gap:10,marginBottom:10}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:"#3B82F6",marginTop:5,flexShrink:0}}/>
                    <div><div style={{fontWeight:500,fontSize:13}}>{ex.role}</div><div style={{fontSize:12,color:"#888"}}>{ex.co} · {ex.years}</div></div>
                  </div>
                ))}
              </div>
              <div style={{marginBottom:20}}>
                <div style={{fontWeight:600,marginBottom:10,fontSize:13}}>🎯 {t.skills}</div>
                <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
                  {detailProspect.skills?.map(s=><span key={s} className="badge" style={{background:"#F5F5F5",color:"#444",fontWeight:500}}>{s}</span>)}
                </div>
              </div>
              <button className="btn-blue" style={{width:"100%",padding:"13px"}} onClick={()=>openCompose(detailProspect)}>✉️ {t.send}</button>
            </div>
          </div>
        )}

        {/* ── CAMPAIGNS / EMAILS ── */}
        {view==="campaigns"&&(
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div><h2 style={{fontSize:isMobile?18:20,fontWeight:700,color:"#111"}}>{t.sentEmails}</h2><p style={{fontSize:12,color:"#888",marginTop:2}}>{emails.length} {t.email}</p></div>
              <button className="btn-blue" style={{fontSize:12,padding:"9px 14px",flexShrink:0}} onClick={()=>{setComposing(true);setComposeProspect(null);setComposeData({subject:"",body:""})}}>✉️ {t.compose}</button>
            </div>
            <div style={{display:"flex",gap:4,background:"rgba(100,100,180,.08)",borderRadius:10,padding:4,marginBottom:14}}>
              {[["all",t.filterAll],["sent",t.filterSent],["pending",t.filterPending]].map(([f,label])=>(
                <button key={f} className={`tab${emailFilter===f?" active":""}`} onClick={()=>setEmailFilter(f)} style={{flex:1}}>{label}</button>
              ))}
            </div>
            {isMobile?(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {filteredEmails.map(e=>(
                  <div key={e.id} className="card" style={{padding:16,cursor:"pointer"}} onClick={()=>{setSelectedEmail(e);setComposing(true)}}>
                    <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                      <div style={{width:36,height:36,borderRadius:10,background:e.avatarColor,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"white",flexShrink:0}}>{e.avatar}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,fontWeight:600,color:"#111"}}>{e.toName}</span><span style={{fontSize:10,color:"#aaa"}}>{e.sentAt}</span></div>
                        <div style={{fontSize:11,color:"#888",marginTop:1}}>{e.company}</div>
                        <div style={{fontSize:12,fontWeight:500,color:"#333",marginTop:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.subject}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredEmails.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:"#ccc"}}><div style={{fontSize:36,marginBottom:8}}>✉️</div><div>{t.noEmails}</div></div>}
              </div>
            ):(
              <div style={{display:"flex",gap:16}}>
                <div style={{width:320,flexShrink:0,display:"flex",flexDirection:"column",gap:6}}>
                  {filteredEmails.map(e=>(
                    <div key={e.id} className={`email-row${selectedEmail?.id===e.id?" active":""}`} onClick={()=>setSelectedEmail(e)}>
                      <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                        <div style={{width:34,height:34,borderRadius:10,background:e.avatarColor,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"white",flexShrink:0}}>{e.avatar}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,fontWeight:600,color:"#111"}}>{e.toName}</span><span style={{fontSize:10,color:"#aaa"}}>{e.sentAt}</span></div>
                          <div style={{fontSize:12,fontWeight:500,color:"#333",marginTop:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.subject}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card" style={{flex:1,overflow:"auto",padding:selectedEmail?28:0,display:"flex",alignItems:selectedEmail?"flex-start":"center",justifyContent:selectedEmail?"flex-start":"center"}}>
                  {selectedEmail?(
                    <div style={{width:"100%"}}>
                      <div style={{marginBottom:20}}><div style={{fontSize:17,fontWeight:700,color:"#111"}}>{selectedEmail.toName}</div><div style={{fontSize:13,color:"#3B82F6",marginTop:3}}>{selectedEmail.to}</div></div>
                      <h2 style={{fontSize:16,fontWeight:700,marginBottom:18}}>{selectedEmail.subject}</h2>
                      <div style={{fontSize:14,color:"#444",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{selectedEmail.body}</div>
                    </div>
                  ):(
                    <div style={{textAlign:"center",color:"#ccc"}}><div style={{fontSize:40,marginBottom:8}}>✉️</div><div style={{fontSize:13}}>Sélectionner un email</div></div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SCRAPING ── */}
        {view==="scraping"&&(
          <div>
            <h1 style={{fontSize:isMobile?18:22,fontWeight:700,color:"#111",marginBottom:4}}>{t.scrapingTitle}</h1>
            <p style={{color:"#888",fontSize:12,marginBottom:20}}>{t.scrapingDesc}</p>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:10,marginBottom:20}}>
              {APIS.map(api=>(
                <div key={api.id} className={`api-card${scrapingConfig.api===api.id?" selected-api":""}`} style={{borderColor:scrapingConfig.api===api.id?api.color:"transparent"}} onClick={()=>setScrapingConfig(p=>({...p,api:api.id}))}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                    <span style={{fontWeight:700,fontSize:13}}>{api.name}</span>
                    <span style={{fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:10,background:api.color+"15",color:api.color}}>{api.badge}</span>
                  </div>
                  <div style={{fontSize:11,color:"#666",marginBottom:6,lineHeight:1.5}}>{api.desc}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:11,fontWeight:600,color:api.color}}>{api.price}</span>
                    <a href={api.docs} target="_blank" rel="noreferrer" style={{fontSize:11,color:"#3B82F6",textDecoration:"none"}} onClick={e=>e.stopPropagation()}>↗ {t.apiDocs}</a>
                  </div>
                </div>
              ))}
            </div>
            <div className="card" style={{padding:isMobile?16:22}}>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12,marginBottom:14}}>
                {[[t.searchQuery,t.searchQueryPh,"query"],[t.location,t.locationPh,"location"],[t.industry,t.industryPh,"industry"]].map(([label,ph,key])=>(
                  <div key={key}>
                    <label style={{fontSize:11,fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:".05em",display:"block",marginBottom:6}}>{label}</label>
                    <input className="input" placeholder={ph} value={scrapingConfig[key]} onChange={e=>setScrapingConfig(p=>({...p,[key]:e.target.value}))}/>
                  </div>
                ))}
                <div>
                  <label style={{fontSize:11,fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:".05em",display:"block",marginBottom:6}}>{t.maxResults}</label>
                  <select className="input" value={scrapingConfig.maxResults} onChange={e=>setScrapingConfig(p=>({...p,maxResults:+e.target.value}))}>
                    {[25,50,100,200,500].map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <button className="btn-blue" style={{width:"100%",padding:"13px",fontSize:14}} disabled={!scrapingConfig.query||scrapingRunning} onClick={launchScraping}>
                {scrapingRunning?t.scrapingRunning:t.launchScraping}
              </button>
              {scrapingResult&&<div style={{marginTop:12,padding:"12px 16px",borderRadius:10,background:"#ECFDF5",border:"1px solid #D1FAE5",color:"#059669",fontWeight:600,fontSize:13}}>{t.scrapingDone.replace("{n}",scrapingResult)}</div>}
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {view==="settings"&&(
          <div>
            <h1 style={{fontSize:isMobile?18:22,fontWeight:700,color:"#111",marginBottom:20}}>{t.nav.settings}</h1>
            <div className="card" style={{padding:isMobile?16:24}}>
              <div style={{fontWeight:600,marginBottom:10,fontSize:14}}>📅 Calendly</div>
              <input className="input" placeholder="https://calendly.com/votre-nom/30min" value={calendlyUrl} onChange={e=>setCalendlyUrl(e.target.value)}/>
              <div style={{fontSize:12,color:"#888",marginTop:8}}>Inséré automatiquement dans les emails générés par IA</div>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE BOTTOM NAV */}
      {isMobile&&(
        <nav className="bottom-nav">
          {NAV_ITEMS.map(item=>(
            <button key={item.id} className={`bottom-nav-item${view===item.id?" active":""}`} onClick={()=>{setView(item.id);setDetailProspect(null)}}>
              <span className="ico" style={{filter:view===item.id?"none":"grayscale(1) opacity(.5)"}}>{item.icon}</span>
              <span className="lbl">{item.label.substring(0,8)}</span>
            </button>
          ))}
        </nav>
      )}

      {/* ── COMPOSE MODAL / BOTTOM SHEET ── */}
      {composing&&(
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setComposing(false)}}>
          <div className="modal">
            {isMobile&&<div className="modal-handle"/>}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
              <div>
                <h2 style={{fontSize:16,fontWeight:700,color:"#111"}}>{t.compose}</h2>
                {composeProspect&&<p style={{fontSize:12,color:"#888",marginTop:2}}>{composeProspect.firstName} {composeProspect.lastName} · {composeProspect.company}</p>}
              </div>
              <button onClick={()=>setComposing(false)} style={{background:"none",border:"none",cursor:"pointer",fontSize:24,color:"#bbb",lineHeight:1}}>×</button>
            </div>
            {!composeProspect&&(
              <div style={{marginBottom:14}}>
                <label style={{fontSize:11,fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:".05em",display:"block",marginBottom:6}}>{t.to}</label>
                <select className="input" onChange={e=>{const p=prospects.find(x=>x.email===e.target.value);setComposeProspect(p||null);}}>
                  <option value="">{t.selectProspect}</option>
                  {prospects.map(p=><option key={p.id} value={p.email}>{p.firstName} {p.lastName} — {p.email}</option>)}
                </select>
              </div>
            )}
            {composeProspect&&(
              <div style={{background:"linear-gradient(135deg,#F5F3FF,#FDF2F8)",borderRadius:12,padding:14,marginBottom:16}}>
                <div style={{fontWeight:600,fontSize:13,color:"#7C3AED",marginBottom:6}}>✨ Génération IA</div>
                <div style={{fontSize:12,color:"#888",marginBottom:10}}>{t.aiEmailHint}</div>
                <button className="btn-ai" disabled={generatingAI} onClick={generateWithAI}>{generatingAI?t.generating:t.generateAI}</button>
              </div>
            )}
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,padding:"10px 14px",background:"#F0FDF4",borderRadius:10,cursor:"pointer"}} onClick={()=>setShowCalendly(!showCalendly)}>
              <div style={{width:18,height:18,borderRadius:5,border:`2px solid ${showCalendly?"#059669":"#ccc"}`,background:showCalendly?"#059669":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {showCalendly&&<svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
              </div>
              <span style={{fontSize:13,fontWeight:500,color:"#059669"}}>📅 {t.addCalendly}</span>
            </div>
            {showCalendly&&<div style={{marginBottom:12}}><input className="input" placeholder={t.calendlyUrl} value={calendlyUrl} onChange={e=>setCalendlyUrl(e.target.value)}/></div>}
            <div style={{marginBottom:12}}>
              <label style={{fontSize:11,fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:".05em",display:"block",marginBottom:6}}>{t.subject}</label>
              <input className="input" placeholder={t.subject} value={composeData.subject} onChange={e=>setComposeData(p=>({...p,subject:e.target.value}))}/>
            </div>
            <div style={{marginBottom:18}}>
              <label style={{fontSize:11,fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:".05em",display:"block",marginBottom:6}}>{t.message}</label>
              <textarea className="input" style={{minHeight:160}} value={composeData.body} onChange={e=>setComposeData(p=>({...p,body:e.target.value}))} placeholder={lang==="fr"?"Rédigez ou générez votre email...":"Write or generate your email..."}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:10}}>
              <button className="btn-outline" onClick={()=>setComposing(false)}>{t.cancel}</button>
              <button className="btn-blue" disabled={!composeData.subject||!composeData.body||sendingEmail} onClick={sendEmail} style={{padding:"13px"}}>
                {sendingEmail?`⏳ ${t.sending}`:`✉️ ${t.send}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast&&<div className="toast" style={{background:toast.type==="err"?"#EF4444":"#111",color:"white"}}>{toast.type==="err"?"❌":"✅"} {toast.msg}</div>}
    </div>
  );
}
