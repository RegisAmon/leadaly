import { useState, useRef } from "react";

const T = {
  fr: {
    appName: "LeadFlow", tagline: "Prospection intelligente",
    nav: { dashboard: "Tableau de bord", prospects: "Prospects", campaigns: "Emails envoyés", scraping: "Scraping LinkedIn", settings: "Paramètres" },
    dashboard: "Tableau de bord", dashboardSub: "Vue d'ensemble de votre prospection.",
    totalProspects: "Total prospects", emailsSent: "Emails envoyés", pending: "En attente", sendRate: "Taux d'envoi",
    bySector: "Par secteur", recentActivity: "Activité récente",
    prospects: "Prospects", prospectsAvail: "prospects disponibles",
    send: "Envoyer", details: "Détails", delete: "Supprimer",
    compose: "Rédiger", cancel: "Annuler", sending: "Envoi...",
    subject: "Objet", message: "Message", to: "À",
    generateAI: "✨ Générer avec l'IA", generating: "⏳ Génération...",
    addCalendly: "📅 Ajouter lien Calendly",
    calendlyUrl: "Votre lien Calendly (ex: calendly.com/votre-nom)",
    noProspect: "Aucun prospect", noEmails: "Aucun email envoyé",
    emailSentOk: "Email envoyé avec succès !",
    scrapingTitle: "Scraping LinkedIn", scrapingDesc: "Extraire des profils LinkedIn B2B",
    apiChoice: "Choisir l'API de scraping",
    searchQuery: "Requête de recherche", searchQueryPh: "ex: VP Sales fintech Paris",
    location: "Localisation", locationPh: "ex: France, Paris",
    industry: "Secteur", industryPh: "ex: SaaS, Fintech, Immobilier",
    maxResults: "Nombre de résultats max",
    launchScraping: "🚀 Lancer le scraping",
    scrapingRunning: "⏳ Scraping en cours...",
    scrapingDone: "✅ {n} prospects extraits !",
    apiDocs: "Voir la doc",
    selectAll: "Tout sélectionner",
    sendSelected: "Envoyer aux sélectionnés ({n})",
    filterAll: "Tous", filterNew: "Nouveaux", filterContacted: "Contactés",
    search: "Rechercher...",
    back: "Retour",
    prospectDetail: "Détail prospect",
    experience: "Expérience", education: "Formation", skills: "Compétences",
    noActivity: "Aucune activité récente",
    viewEmail: "Voir l'email",
    sentEmails: "Emails envoyés", email: "email(s) envoyé(s)",
    filterSent: "Envoyés", filterPending: "En attente",
    newSearch: "Nouvelle recherche", newSearchSub: "Trouver des prospects",
    seeProspects: "Voir les prospects",
    aiEmailHint: "L'IA va personnaliser l'email avec les infos du prospect",
  },
  en: {
    appName: "LeadFlow", tagline: "Smart Prospecting",
    nav: { dashboard: "Dashboard", prospects: "Prospects", campaigns: "Sent Emails", scraping: "LinkedIn Scraping", settings: "Settings" },
    dashboard: "Dashboard", dashboardSub: "Overview of your prospecting.",
    totalProspects: "Total Prospects", emailsSent: "Emails Sent", pending: "Pending", sendRate: "Send Rate",
    bySector: "By Industry", recentActivity: "Recent Activity",
    prospects: "Prospects", prospectsAvail: "prospects available",
    send: "Send", details: "Details", delete: "Delete",
    compose: "Compose", cancel: "Cancel", sending: "Sending...",
    subject: "Subject", message: "Message", to: "To",
    generateAI: "✨ Generate with AI", generating: "⏳ Generating...",
    addCalendly: "📅 Add Calendly link",
    calendlyUrl: "Your Calendly link (e.g. calendly.com/your-name)",
    noProspect: "No prospects", noEmails: "No emails sent",
    emailSentOk: "Email sent successfully!",
    scrapingTitle: "LinkedIn Scraping", scrapingDesc: "Extract B2B LinkedIn profiles",
    apiChoice: "Choose scraping API",
    searchQuery: "Search query", searchQueryPh: "e.g. VP Sales fintech Paris",
    location: "Location", locationPh: "e.g. France, Paris",
    industry: "Industry", industryPh: "e.g. SaaS, Fintech, Real Estate",
    maxResults: "Max results",
    launchScraping: "🚀 Launch scraping",
    scrapingRunning: "⏳ Scraping running...",
    scrapingDone: "✅ {n} prospects extracted!",
    apiDocs: "View docs",
    selectAll: "Select all",
    sendSelected: "Send to selected ({n})",
    filterAll: "All", filterNew: "New", filterContacted: "Contacted",
    search: "Search...",
    back: "Back",
    prospectDetail: "Prospect detail",
    experience: "Experience", education: "Education", skills: "Skills",
    noActivity: "No recent activity",
    viewEmail: "View email",
    sentEmails: "Sent Emails", email: "email(s) sent",
    filterSent: "Sent", filterPending: "Pending",
    newSearch: "New Search", newSearchSub: "Find prospects",
    seeProspects: "See prospects",
    aiEmailHint: "AI will personalize the email with prospect info",
  }
};

const PROSPECTS_DATA = [
  { id:1, firstName:"Hugo", lastName:"Labrousse", title:"Global Key Account Manager", email:"h.labrousse@parisaltitude.com", company:"Paris Altitude", location:"Paris, France", industry:"Real Estate", avatar:"HL", score:82, status:"new", experience:[{role:"Global KAM",co:"Paris Altitude",years:"2021-present"},{role:"Sales Manager",co:"JLL",years:"2018-2021"}], skills:["B2B Sales","CRM","Negotiation","English"] },
  { id:2, firstName:"Anta", lastName:"Niang", title:"Real Estate Program Manager", email:"anta.niang@icade.fr", company:"Icade", location:"Paris, France", industry:"Real Estate", avatar:"AN", score:88, status:"new", experience:[{role:"Program Manager",co:"Icade",years:"2020-present"}], skills:["Project Management","Real Estate","Finance"] },
  { id:3, firstName:"Florian", lastName:"Morel", title:"Program Manager", email:"florian.morel@icade.fr", company:"Icade", location:"Marseille, France", industry:"Real Estate", avatar:"FM", score:71, status:"contacted", experience:[{role:"Program Manager",co:"Icade",years:"2019-present"}], skills:["Program Management","Agile","JIRA"] },
  { id:4, firstName:"Christel", lastName:"Zordan", title:"General Manager", email:"c.zordan@stoureiffel.com", company:"Société De La Tour Eiffel (sfff)", location:"Boulogne-Billancourt, France", industry:"Real Estate", avatar:"CZ", score:95, status:"new", experience:[{role:"GM",co:"Tour Eiffel sff",years:"2017-present"},{role:"CFO",co:"Nexity",years:"2012-2017"}], skills:["P&L Management","M&A","Leadership","Strategy"] },
  { id:5, firstName:"Clemence", lastName:"Lemagnen", title:"Management Control Manager", email:"clemagnen@cboterritoria.com", company:"Cbo Territoria", location:"France", industry:"Real Estate", avatar:"CL", score:76, status:"new", experience:[{role:"Management Controller",co:"Cbo Territoria",years:"2020-present"}], skills:["Financial Reporting","Excel","Power BI"] },
  { id:6, firstName:"Edouard", lastName:"Pavageau", title:"Asset Manager", email:"e.pavageau@stoureiffel.com", company:"Société De La Tour Eiffel (sfff)", location:"Paris, France", industry:"Real Estate", avatar:"EP", score:84, status:"contacted", experience:[{role:"Asset Manager",co:"Tour Eiffel sff",years:"2019-present"}], skills:["Portfolio Management","Valuation","Negotiation"] },
  { id:7, firstName:"Victorien", lastName:"Berthier", title:"Sales & Account Manager", email:"victorien@ubiq.space", company:"Ubiq", location:"Paris, France", industry:"PropTech", avatar:"VB", score:79, status:"new", experience:[{role:"AE",co:"Ubiq",years:"2022-present"}], skills:["SaaS Sales","PropTech","English"] },
  { id:8, firstName:"Alexandre", lastName:"Villalon", title:"Operations Manager", email:"alexandre.villalon@kataraxia.fr", company:"Kataraxia", location:"France", industry:"Real Estate", avatar:"AV", score:68, status:"new", experience:[{role:"Ops Manager",co:"Kataraxia",years:"2021-present"}], skills:["Operations","Process","Lean"] },
  { id:9, firstName:"Ayoub", lastName:"Ougrirane", title:"Building Manager / Gestionnaire Technique", email:"a.ougrirane@btcfrance.com", company:"BTC France", location:"France", industry:"Facility", avatar:"AO", score:65, status:"new", experience:[{role:"Building Manager",co:"BTC France",years:"2020-present"}], skills:["Facility Management","CMMS","Safety"] },
];

const SCRAPING_APIS = [
  { id:"linkdapi", name:"LinkdAPI", badge:"⭐ Recommandé", desc:"Successeur direct de Proxycurl. Zéro faux compte, données publiques uniquement. Réponse JSON identique à Proxycurl.", price:"$0.01/profil · 100 crédits gratuits", docs:"https://linkdapi.com", color:"#2563EB", fields:"name, title, company, email, location, experience, skills, education" },
  { id:"apify", name:"Apify", badge:"💰 Pay-per-use", desc:"Marketplace d'actors. Flexible, pay-as-you-go. Actors : linkedin-profile-scraper, linkedin-company-scraper, sales-navigator-search.", price:"~$3/1000 profils · 3 jours gratuits", docs:"https://apify.com/actors?category=LINKEDIN", color:"#7C3AED", fields:"profileUrl, name, headline, experience, education, skills, connections" },
  { id:"brightdata", name:"Bright Data", badge:"🏢 Enterprise", desc:"Scraper LinkedIn enterprise-grade avec proxies résidentiels. Haut volume uniquement. API Profiles + Company + Jobs.", price:"Sur devis · Budget conséquent requis", docs:"https://brightdata.com/products/scraping-apis/linkedin", color:"#059669", fields:"Tous les champs publics LinkedIn" },
  { id:"scrapin", name:"ScrapIn", badge:"⚡ Real-time", desc:"Scraping temps réel sans cookie ni compte LinkedIn. GDPR compliant. API simple, bonne documentation.", price:"~$49/mois · Essai gratuit", docs:"https://scrapin.io", color:"#D97706", fields:"name, title, company, location, email (via enrichissement)" },
];

const AVATAR_COLORS = ["#4F86F7","#7C3AED","#059669","#D97706","#10B981","#EF4444","#EC4899","#F59E0B","#8B5CF6"];
const scoreColor = s => s>=85?"#10B981":s>=70?"#F59E0B":"#EF4444";

const INITIAL_EMAILS = [
  { id:1, prospectId:1, to:"h.labrousse@parisaltitude.com", toName:"Hugo Labrousse", company:"Paris Altitude", title:"Global Key Account Manager", subject:"Paris Altitude × IA : 3 leviers pour scaler vos ventes", body:"Bonjour Hugo,\n\nEn tant que Global Key Account Manager chez Paris Altitude, vous gérez probablement des cycles de vente complexes et de nombreux comptes stratégiques.\n\nL'IA peut transformer votre approche :\n\n• Scoring automatique de vos leads selon leur probabilité de conversion\n• Personnalisation à grande échelle de vos propositions commerciales\n• Veille concurrentielle automatisée sur vos comptes clés\n\nJ'aimerais vous montrer comment nos clients dans l'immobilier haut de gamme ont réduit leur cycle de vente de 30%.\n\nSeriez-vous disponible 20 minutes cette semaine ?\n👉 Réserver directement : https://calendly.com/naom-ai/demo\n\nCordialement,\nNAOM AI · Prospection intelligente", sentAt:"23 avr., 23:48", status:"sent", avatar:"HL", avatarColor:"#4F86F7" },
];

export default function App() {
  const [lang, setLang] = useState("fr");
  const [view, setView] = useState("prospects");
  const [prospects, setProspects] = useState(PROSPECTS_DATA);
  const [emails, setEmails] = useState(INITIAL_EMAILS);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [composing, setComposing] = useState(false);
  const [composeProspect, setComposeProspect] = useState(null);
  const [composeData, setComposeData] = useState({ subject:"", body:"" });
  const [generatingAI, setGeneratingAI] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showCalendly, setShowCalendly] = useState(false);
  const [calendlyUrl, setCalendlyUrl] = useState("https://calendly.com/votre-nom/30min");
  const [toast, setToast] = useState(null);
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [detailProspect, setDetailProspect] = useState(null);
  const [scrapingConfig, setScrapingConfig] = useState({ api:"linkdapi", query:"", location:"", industry:"", maxResults:50 });
  const [scrapingRunning, setScrapingRunning] = useState(false);
  const [scrapingResult, setScrapingResult] = useState(null);
  const [emailFilter, setEmailFilter] = useState("all");
  const t = T[lang];

  const showToast = (msg, type="ok") => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  const openCompose = (prospect) => {
    setComposeProspect(prospect);
    setComposeData({ subject:"", body:"" });
    setShowCalendly(false);
    setComposing(true);
  };

  const generateWithAI = async () => {
    if (!composeProspect) return;
    setGeneratingAI(true);
    try {
      const prompt = `Tu es un expert en outreach B2B. Rédige un email de prospection personnalisé et percutant pour ce prospect LinkedIn.

Informations du prospect :
- Nom : ${composeProspect.firstName} ${composeProspect.lastName}
- Titre : ${composeProspect.title}
- Entreprise : ${composeProspect.company}
- Secteur : ${composeProspect.industry}
- Localisation : ${composeProspect.location}
- Compétences : ${composeProspect.skills?.join(", ")}
${showCalendly ? `\nInclus ce lien Calendly pour proposer un RDV : ${calendlyUrl}` : ""}

Règles :
- Objet accrocheur (15 mots max)
- Corps court (150 mots max), ultra-personnalisé sur son rôle et son secteur
- 1 pain point spécifique à son poste
- 1 bénéfice concret de l'IA pour son métier
- CTA clair (appel ou RDV)
${showCalendly ? "- Inclure le lien Calendly avec emoji 📅" : ""}
- Langue : ${lang === "fr" ? "français" : "anglais"}
- Signature : NAOM AI · Prospection intelligente

Réponds UNIQUEMENT en JSON strictement valide, sans backticks ni markdown :
{"subject":"...", "body":"..."}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          messages:[{ role:"user", content:prompt }]
        })
      });
      const data = await response.json();
      const text = data.content?.find(c=>c.type==="text")?.text || "";
      const clean = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      setComposeData({ subject: parsed.subject || "", body: parsed.body || "" });
    } catch(e) {
      showToast("Erreur génération IA", "err");
    }
    setGeneratingAI(false);
  };

  const sendEmail = () => {
    if(!composeData.subject||!composeData.body) return;
    setSendingEmail(true);
    setTimeout(()=>{
      const newEmail = {
        id: emails.length+1,
        prospectId: composeProspect?.id,
        to: composeProspect?.email,
        toName: `${composeProspect?.firstName} ${composeProspect?.lastName}`,
        company: composeProspect?.company,
        title: composeProspect?.title,
        subject: composeData.subject,
        body: composeData.body,
        sentAt: new Date().toLocaleString(lang==="fr"?"fr-FR":"en-US",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}),
        status:"sent",
        avatar: composeProspect?.avatar,
        avatarColor: AVATAR_COLORS[composeProspect?.id % AVATAR_COLORS.length],
      };
      setEmails(prev=>[newEmail,...prev]);
      setProspects(prev=>prev.map(p=>p.id===composeProspect?.id?{...p,status:"contacted"}:p));
      setSendingEmail(false);
      setComposing(false);
      showToast(t.emailSentOk);
    },1400);
  };

  const launchScraping = () => {
    if(!scrapingConfig.query) return;
    setScrapingRunning(true);
    setScrapingResult(null);
    setTimeout(()=>{
      const n = Math.floor(Math.random()*15)+8;
      setScrapingResult(n);
      setScrapingRunning(false);
      showToast(t.scrapingDone.replace("{n}",n));
    },2800);
  };

  const toggleSelect = (id) => setSelected(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  const toggleAll = () => setSelected(selected.length===prospects.length?[]:prospects.map(p=>p.id));
  const deleteProspect = (id) => { setProspects(prev=>prev.filter(p=>p.id!==id)); setSelected(prev=>prev.filter(x=>x!==id)); };

  const filtered = prospects.filter(p=>{
    const matchFilter = filter==="all"||(filter==="new"&&p.status==="new")||(filter==="contacted"&&p.status==="contacted");
    const matchSearch = !search||`${p.firstName} ${p.lastName} ${p.company} ${p.email}`.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const filteredEmails = emails.filter(e=>emailFilter==="all"||(emailFilter==="sent"&&e.status==="sent")||(emailFilter==="pending"&&e.status==="pending"));

  return (
    <div style={{fontFamily:"'Inter','Helvetica Neue',sans-serif",minHeight:"100vh",background:"linear-gradient(135deg,#dbeafe 0%,#ede9fe 50%,#dcfce7 100%)",display:"flex",fontSize:14}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .card{background:rgba(255,255,255,0.88);backdrop-filter:blur(14px);border-radius:16px;border:1px solid rgba(255,255,255,0.95);box-shadow:0 2px 20px rgba(80,80,180,0.06)}
        .card-hover{transition:transform .18s,box-shadow .18s;cursor:pointer}
        .card-hover:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(80,80,180,0.13)}
        .btn-blue{background:linear-gradient(135deg,#3B82F6,#6366F1);color:#fff;border:none;border-radius:10px;padding:8px 18px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:6px;transition:opacity .15s;white-space:nowrap}
        .btn-blue:hover{opacity:.88}
        .btn-blue:disabled{opacity:.55;cursor:not-allowed}
        .btn-outline{background:rgba(255,255,255,0.7);border:1px solid rgba(100,100,180,0.22);border-radius:10px;padding:8px 18px;font-size:13px;font-weight:500;cursor:pointer;font-family:inherit;color:#555;display:flex;align-items:center;gap:6px;transition:all .15s;white-space:nowrap}
        .btn-outline:hover{border-color:#4F86F7;color:#4F86F7;background:#EFF6FF}
        .btn-ai{background:linear-gradient(135deg,#8B5CF6,#EC4899);color:#fff;border:none;border-radius:10px;padding:10px 20px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:opacity .15s}
        .btn-ai:hover{opacity:.88}
        .btn-ai:disabled{opacity:.5;cursor:not-allowed}
        .nav-item{display:flex;align-items:center;gap:9px;padding:10px 14px;border-radius:10px;cursor:pointer;font-size:13px;font-weight:500;color:#666;transition:all .15s;border:none;background:none;font-family:inherit;width:100%;text-align:left}
        .nav-item:hover{background:rgba(79,134,247,0.1);color:#4F86F7}
        .nav-item.active{background:linear-gradient(135deg,rgba(59,130,246,.18),rgba(99,102,241,.12));color:#3B82F6;font-weight:600}
        .input{width:100%;border:1px solid rgba(100,100,180,0.2);border-radius:10px;padding:10px 14px;font-size:13px;font-family:inherit;background:rgba(255,255,255,0.8);color:#111;outline:none;transition:border-color .15s}
        .input:focus{border-color:#4F86F7;box-shadow:0 0 0 3px rgba(79,134,247,0.1)}
        .badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600}
        .badge-new{background:#EFF6FF;color:#2563EB}
        .badge-contacted{background:#F5F3FF;color:#7C3AED}
        .tab{padding:7px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:none;background:none;font-family:inherit;color:#888;transition:all .15s}
        .tab.active{background:white;color:#111;box-shadow:0 1px 6px rgba(0,0,0,.09)}
        .overlay{position:fixed;inset:0;background:rgba(60,60,120,0.2);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:100;padding:20px}
        .modal{background:white;border-radius:20px;padding:28px;width:600px;max-width:100%;max-height:90vh;overflow:auto;box-shadow:0 24px 64px rgba(60,60,120,0.2)}
        .toast{position:fixed;bottom:24px;right:24px;padding:13px 20px;border-radius:12px;font-size:13px;font-weight:600;z-index:200;animation:slide .25s;display:flex;align-items:center;gap:8px}
        @keyframes slide{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        .prospect-card{background:rgba(255,255,255,0.9);border-radius:14px;border:1px solid rgba(255,255,255,0.95);box-shadow:0 2px 14px rgba(80,80,180,0.06);padding:20px;transition:box-shadow .18s,transform .18s;position:relative}
        .prospect-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(80,80,180,0.12)}
        .prospect-card.selected{border-color:#3B82F6;box-shadow:0 0 0 2px rgba(59,130,246,0.25)}
        .checkbox{width:18px;height:18px;border-radius:5px;border:1.5px solid #ccc;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .15s}
        .checkbox.checked{background:#3B82F6;border-color:#3B82F6}
        .del-btn{background:none;border:none;cursor:pointer;color:#ccc;padding:2px;border-radius:5px;transition:color .15s;line-height:1}
        .del-btn:hover{color:#EF4444}
        .email-row{padding:14px;border-radius:12px;cursor:pointer;border:1px solid transparent;transition:all .15s}
        .email-row:hover{background:rgba(59,130,246,.05);border-color:rgba(59,130,246,.15)}
        .email-row.active{background:rgba(59,130,246,.08);border-color:rgba(59,130,246,.25)}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(100,100,180,.2);border-radius:2px}
        textarea.input{resize:vertical;line-height:1.65}
        .api-card{border:2px solid transparent;border-radius:14px;padding:16px;cursor:pointer;transition:all .2s;background:rgba(255,255,255,.7)}
        .api-card:hover{background:white;box-shadow:0 4px 16px rgba(80,80,180,.1)}
        .api-card.selected-api{background:white;box-shadow:0 4px 16px rgba(80,80,180,.12)}
      `}</style>

      {/* Sidebar */}
      <div style={{width:220,flexShrink:0,padding:"20px 14px",display:"flex",flexDirection:"column",gap:4,minHeight:"100vh"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 6px",marginBottom:18}}>
          <div style={{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg,#3B82F6,#6366F1)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="white"/></svg>
          </div>
          <span style={{fontSize:15,fontWeight:700,color:"#111"}}>LeadFlow</span>
        </div>
        {[
          {id:"dashboard",icon:"⊞",label:t.nav.dashboard},
          {id:"prospects",icon:"👥",label:t.nav.prospects},
          {id:"campaigns",icon:"✉️",label:t.nav.campaigns},
          {id:"scraping",icon:"🔍",label:t.nav.scraping},
          {id:"settings",icon:"⚙️",label:t.nav.settings},
        ].map(item=>(
          <button key={item.id} className={`nav-item${view===item.id?" active":""}`} onClick={()=>{setView(item.id);setDetailProspect(null)}}>
            <span style={{fontSize:15}}>{item.icon}</span>{item.label}
          </button>
        ))}
        <div style={{flex:1}}/>
        <div style={{display:"flex",gap:4,padding:"6px"}}>
          {["fr","en"].map(l=>(
            <button key={l} onClick={()=>setLang(l)} style={{flex:1,padding:"5px 8px",border:`1.5px solid ${lang===l?"#3B82F6":"rgba(100,100,180,.2)"}`,borderRadius:8,background:lang===l?"#3B82F6":"transparent",color:lang===l?"white":"#666",fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"inherit",transition:"all .15s"}}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
        <div style={{padding:"4px 10px 8px",fontSize:11,color:"#aaa",fontWeight:500}}>{t.tagline}</div>
      </div>

      {/* Main */}
      <div style={{flex:1,padding:"28px 32px",overflow:"auto",minHeight:"100vh"}}>

        {/* DASHBOARD */}
        {view==="dashboard"&&!detailProspect&&(
          <div>
            <h1 style={{fontSize:26,fontWeight:700,color:"#111",marginBottom:6}}>{t.dashboard}</h1>
            <p style={{color:"#888",fontSize:13,marginBottom:28}}>{t.dashboardSub}</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}}>
              <div className="card card-hover" style={{padding:"20px 24px",display:"flex",alignItems:"center",gap:16}} onClick={()=>setView("scraping")}>
                <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,#EEF2FF,#E0E7FF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🔍</div>
                <div><div style={{fontWeight:600,color:"#111"}}>{t.newSearch}</div><div style={{fontSize:12,color:"#888",marginTop:2}}>{t.newSearchSub}</div></div>
              </div>
              <div className="card card-hover" style={{padding:"20px 24px",display:"flex",alignItems:"center",gap:16}} onClick={()=>setView("prospects")}>
                <div style={{width:40,height:40,borderRadius:12,background:"linear-gradient(135deg,#F5F3FF,#EDE9FE)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>👥</div>
                <div><div style={{fontWeight:600,color:"#111"}}>{t.seeProspects}</div><div style={{fontSize:12,color:"#888",marginTop:2}}>{prospects.length} {t.prospectsAvail}</div></div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:18}}>
              {[{l:t.totalProspects,v:prospects.length,bg:"#EFF6FF",c:"#3B82F6",e:"👥"},{l:t.emailsSent,v:emails.length,bg:"#ECFDF5",c:"#059669",e:"✉️"},{l:t.pending,v:0,bg:"#FFFBEB",c:"#D97706",e:"⏳"},{l:t.sendRate,v:prospects.length?`${Math.round((emails.length/prospects.length)*100)}%`:"0%",bg:"#F5F3FF",c:"#7C3AED",e:"📈"}].map((s,i)=>(
                <div key={i} className="card" style={{padding:18}}>
                  <div style={{width:36,height:36,borderRadius:10,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,marginBottom:10}}>{s.e}</div>
                  <div style={{fontSize:24,fontWeight:700,color:"#111"}}>{s.v}</div>
                  <div style={{fontSize:12,color:"#888",marginTop:3}}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div className="card" style={{padding:22}}>
                <div style={{fontWeight:600,marginBottom:18,fontSize:13,color:"#111"}}>📊 {t.bySector}</div>
                {[...new Set(prospects.map(p=>p.industry))].map(ind=>{
                  const c=prospects.filter(p=>p.industry===ind).length;
                  return <div key={ind} style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:"#666"}}>{ind}</span><span style={{fontSize:12,fontWeight:600}}>{c}</span></div>
                    <div style={{height:5,borderRadius:3,background:"#f0f0f0"}}><div style={{width:`${(c/prospects.length)*100}%`,height:"100%",borderRadius:3,background:"#3B82F6"}}/></div>
                  </div>;
                })}
              </div>
              <div className="card" style={{padding:22}}>
                <div style={{fontWeight:600,marginBottom:18,fontSize:13,color:"#111"}}>📬 {t.recentActivity}</div>
                {emails.slice(0,4).map(e=>(
                  <div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid rgba(100,100,180,.07)"}}>
                    <div style={{width:30,height:30,borderRadius:9,background:e.avatarColor,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"white",flexShrink:0}}>{e.avatar}</div>
                    <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:500,color:"#111",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.toName}</div><div style={{fontSize:11,color:"#888",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.subject}</div></div>
                    <span style={{fontSize:10,color:"#aaa",flexShrink:0}}>{e.sentAt}</span>
                  </div>
                ))}
                {emails.length===0&&<div style={{textAlign:"center",color:"#ccc",padding:"16px 0",fontSize:13}}>{t.noActivity}</div>}
              </div>
            </div>
          </div>
        )}

        {/* PROSPECTS - CARD GRID */}
        {view==="prospects"&&!detailProspect&&(
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div>
                <h1 style={{fontSize:22,fontWeight:700,color:"#111"}}>{t.prospects}</h1>
                <p style={{fontSize:12,color:"#888",marginTop:3}}>{filtered.length} {t.prospectsAvail}</p>
              </div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <input className="input" style={{width:200}} placeholder={t.search} value={search} onChange={e=>setSearch(e.target.value)}/>
                <button className="btn-outline" onClick={toggleAll} style={{fontSize:12}}>{t.selectAll}</button>
                {selected.length>0&&<button className="btn-blue" style={{fontSize:12}} onClick={()=>{ selected.forEach(id=>{ const p=prospects.find(x=>x.id===id); if(p) openCompose(p); }); }}>{t.sendSelected.replace("{n}",selected.length)}</button>}
              </div>
            </div>
            {/* Filter tabs */}
            <div style={{display:"flex",gap:4,background:"rgba(100,100,180,.08)",borderRadius:10,padding:4,marginBottom:20,width:"fit-content"}}>
              {[["all",t.filterAll],["new",t.filterNew],["contacted",t.filterContacted]].map(([f,label])=>(
                <button key={f} className={`tab${filter===f?" active":""}`} onClick={()=>setFilter(f)}>{label}</button>
              ))}
            </div>
            {/* Card grid */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
              {filtered.map(p=>(
                <div key={p.id} className={`prospect-card${selected.includes(p.id)?" selected":""}`}>
                  {/* Top row */}
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                    <div className={`checkbox${selected.includes(p.id)?" checked":""}`} onClick={()=>toggleSelect(p.id)}>
                      {selected.includes(p.id)&&<svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
                    </div>
                    <button className="del-btn" onClick={()=>deleteProspect(p.id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M19 6l-1 14H6L5 6M9 6V4h6v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                  {/* Name */}
                  <div style={{fontWeight:700,fontSize:16,color:"#111",marginBottom:3}}>{p.firstName} {p.lastName}</div>
                  <div style={{fontSize:12,color:"#888",marginBottom:4}}>{p.title}</div>
                  <div style={{fontSize:12,color:"#3B82F6",marginBottom:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.email}</div>
                  {/* Company + location */}
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12,fontSize:12,color:"#555"}}>
                    <span style={{display:"flex",alignItems:"center",gap:4}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke="currentColor" strokeWidth="1.5"/></svg>
                      {p.company}
                    </span>
                    <span style={{display:"flex",alignItems:"center",gap:4}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5"/></svg>
                      {p.location}
                    </span>
                  </div>
                  {/* Industry badge */}
                  <div style={{marginBottom:16}}>
                    <span className="badge" style={{background:"#EFF6FF",color:"#2563EB"}}>{p.industry}</span>
                    <span className={`badge badge-${p.status}`} style={{marginLeft:6}}>{p.status==="new"?t.filterNew:t.filterContacted}</span>
                  </div>
                  {/* Actions */}
                  <div style={{display:"flex",gap:8}}>
                    <button className="btn-outline" style={{flex:1,justifyContent:"center",padding:"9px 10px",fontSize:12}} onClick={()=>setDetailProspect(p)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      {t.details}
                    </button>
                    <button className="btn-blue" style={{flex:1,justifyContent:"center",padding:"9px 10px",fontSize:12}} onClick={()=>openCompose(p)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="white" strokeWidth="1.5"/><path d="M22 6l-10 7L2 6" stroke="white" strokeWidth="1.5"/></svg>
                      {t.send}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROSPECT DETAIL */}
        {detailProspect&&(
          <div>
            <button className="btn-outline" style={{marginBottom:20,fontSize:12}} onClick={()=>setDetailProspect(null)}>← {t.back}</button>
            <div className="card" style={{padding:28,maxWidth:700}}>
              <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:24,paddingBottom:20,borderBottom:"1px solid rgba(100,100,180,.1)"}}>
                <div style={{width:56,height:56,borderRadius:16,background:AVATAR_COLORS[detailProspect.id%AVATAR_COLORS.length],display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700,color:"white"}}>{detailProspect.avatar}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:20,fontWeight:700,color:"#111"}}>{detailProspect.firstName} {detailProspect.lastName}</div>
                  <div style={{color:"#888",marginTop:2}}>{detailProspect.title}</div>
                  <div style={{color:"#3B82F6",fontSize:13,marginTop:2}}>{detailProspect.email}</div>
                  <div style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap"}}>
                    <span className="badge" style={{background:"#EFF6FF",color:"#2563EB"}}>{detailProspect.company}</span>
                    <span className="badge" style={{background:"#ECFDF5",color:"#059669"}}>{detailProspect.location}</span>
                    <span className="badge" style={{background:"#F5F3FF",color:"#7C3AED"}}>{detailProspect.industry}</span>
                    <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"3px 10px",borderRadius:20,background:scoreColor(detailProspect.score)+"20",fontSize:11,fontWeight:700,color:scoreColor(detailProspect.score)}}>★ {detailProspect.score}</span>
                  </div>
                </div>
                <button className="btn-blue" onClick={()=>openCompose(detailProspect)}>✉️ {t.send}</button>
              </div>
              <div style={{marginBottom:20}}>
                <div style={{fontWeight:600,marginBottom:12,color:"#111"}}>💼 {t.experience}</div>
                {detailProspect.experience?.map((ex,i)=>(
                  <div key={i} style={{display:"flex",gap:12,marginBottom:10}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:"#3B82F6",marginTop:5,flexShrink:0}}/>
                    <div><div style={{fontWeight:500,color:"#111"}}>{ex.role}</div><div style={{fontSize:12,color:"#888"}}>{ex.co} · {ex.years}</div></div>
                  </div>
                ))}
              </div>
              <div>
                <div style={{fontWeight:600,marginBottom:12,color:"#111"}}>🎯 {t.skills}</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {detailProspect.skills?.map(s=><span key={s} className="badge" style={{background:"#F5F5F5",color:"#444",fontWeight:500}}>{s}</span>)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CAMPAIGNS - EMAILS */}
        {view==="campaigns"&&(
          <div style={{display:"flex",gap:20,height:"calc(100vh - 56px)"}}>
            <div style={{width:340,flexShrink:0,display:"flex",flexDirection:"column"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                <div><h2 style={{fontSize:18,fontWeight:700,color:"#111"}}>{t.sentEmails}</h2><p style={{fontSize:12,color:"#888",marginTop:2}}>{emails.length} {t.email}</p></div>
                <button className="btn-blue" style={{fontSize:12,padding:"8px 14px"}} onClick={()=>{ setComposing(true); setComposeProspect(null); setComposeData({subject:"",body:""}); }}>✉️ {t.compose}</button>
              </div>
              <div style={{display:"flex",gap:4,background:"rgba(100,100,180,.08)",borderRadius:10,padding:4,marginBottom:14}}>
                {[["all",t.filterAll],["sent",t.filterSent],["pending",t.filterPending]].map(([f,label])=>(
                  <button key={f} className={`tab${emailFilter===f?" active":""}`} onClick={()=>setEmailFilter(f)} style={{flex:1}}>{label}</button>
                ))}
              </div>
              <div style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column",gap:6}}>
                {filteredEmails.map(e=>(
                  <div key={e.id} className={`email-row${selectedEmail?.id===e.id?" active":""}`} onClick={()=>setSelectedEmail(e)}>
                    <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                      <div style={{width:36,height:36,borderRadius:10,background:e.avatarColor,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"white",flexShrink:0}}>{e.avatar}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,fontWeight:600,color:"#111"}}>{e.toName}</span><span style={{fontSize:10,color:"#aaa"}}>{e.sentAt}</span></div>
                        <div style={{fontSize:11,color:"#888",marginTop:1}}>{e.to}</div>
                        <div style={{fontSize:12,fontWeight:500,color:"#333",marginTop:5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.subject}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredEmails.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:"#ccc"}}><div style={{fontSize:36,marginBottom:8}}>✉️</div><div style={{fontSize:13}}>{t.noEmails}</div></div>}
              </div>
            </div>
            <div className="card" style={{flex:1,overflow:"auto"}}>
              {selectedEmail?(
                <div style={{padding:28}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:24,paddingBottom:20,borderBottom:"1px solid rgba(100,100,180,.1)"}}>
                    <div style={{width:44,height:44,borderRadius:12,background:selectedEmail.avatarColor,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"white",flexShrink:0}}>{selectedEmail.avatar}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:16,fontWeight:700,color:"#111"}}>{selectedEmail.toName}</div>
                      <div style={{fontSize:13,color:"#3B82F6",marginTop:2}}>{selectedEmail.to}</div>
                      <div style={{display:"flex",gap:6,marginTop:6,flexWrap:"wrap"}}>
                        {selectedEmail.company&&<span className="badge" style={{background:"#EFF6FF",color:"#4F86F7"}}>{selectedEmail.company}</span>}
                        {selectedEmail.title&&<span className="badge" style={{background:"#F5F3FF",color:"#7C3AED"}}>{selectedEmail.title}</span>}
                      </div>
                    </div>
                    <span style={{fontSize:12,color:"#aaa"}}>{selectedEmail.sentAt}</span>
                  </div>
                  <h2 style={{fontSize:18,fontWeight:700,color:"#111",marginBottom:20}}>{selectedEmail.subject}</h2>
                  <div style={{fontSize:14,color:"#444",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{selectedEmail.body}</div>
                </div>
              ):(
                <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10,color:"#ccc",height:"100%"}}>
                  <div style={{fontSize:48}}>✉️</div>
                  <div style={{fontSize:14}}>{lang==="fr"?"Sélectionner un email":"Select an email"}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SCRAPING */}
        {view==="scraping"&&(
          <div>
            <h1 style={{fontSize:22,fontWeight:700,color:"#111",marginBottom:6}}>{t.scrapingTitle}</h1>
            <p style={{color:"#888",fontSize:13,marginBottom:24}}>{t.scrapingDesc}</p>

            {/* API choice */}
            <div style={{marginBottom:24}}>
              <div style={{fontSize:13,fontWeight:600,color:"#111",marginBottom:14}}>{t.apiChoice}</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
                {SCRAPING_APIS.map(api=>(
                  <div key={api.id} className={`api-card${scrapingConfig.api===api.id?" selected-api":""}`} style={{borderColor:scrapingConfig.api===api.id?api.color:"transparent"}} onClick={()=>setScrapingConfig(prev=>({...prev,api:api.id}))}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                      <span style={{fontWeight:700,color:"#111",fontSize:14}}>{api.name}</span>
                      <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:12,background:api.color+"15",color:api.color}}>{api.badge}</span>
                    </div>
                    <div style={{fontSize:12,color:"#666",marginBottom:8,lineHeight:1.5}}>{api.desc}</div>
                    <div style={{fontSize:11,color:"#888",marginBottom:8}}><strong>Champs:</strong> {api.fields}</div>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:12,fontWeight:600,color:api.color}}>{api.price}</span>
                      <a href={api.docs} target="_blank" rel="noreferrer" style={{fontSize:11,color:"#3B82F6",textDecoration:"none"}} onClick={e=>e.stopPropagation()}>↗ {t.apiDocs}</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Search params */}
            <div className="card" style={{padding:24,maxWidth:600}}>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                <div>
                  <label style={{fontSize:11,fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:".05em",display:"block",marginBottom:6}}>{t.searchQuery}</label>
                  <input className="input" placeholder={t.searchQueryPh} value={scrapingConfig.query} onChange={e=>setScrapingConfig(p=>({...p,query:e.target.value}))}/>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:".05em",display:"block",marginBottom:6}}>{t.location}</label>
                  <input className="input" placeholder={t.locationPh} value={scrapingConfig.location} onChange={e=>setScrapingConfig(p=>({...p,location:e.target.value}))}/>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:".05em",display:"block",marginBottom:6}}>{t.industry}</label>
                  <input className="input" placeholder={t.industryPh} value={scrapingConfig.industry} onChange={e=>setScrapingConfig(p=>({...p,industry:e.target.value}))}/>
                </div>
                <div>
                  <label style={{fontSize:11,fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:".05em",display:"block",marginBottom:6}}>{t.maxResults}</label>
                  <select className="input" value={scrapingConfig.maxResults} onChange={e=>setScrapingConfig(p=>({...p,maxResults:+e.target.value}))}>
                    {[25,50,100,200,500].map(n=><option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <button className="btn-blue" style={{width:"100%",justifyContent:"center",padding:"13px"}} disabled={!scrapingConfig.query||scrapingRunning} onClick={launchScraping}>
                {scrapingRunning?t.scrapingRunning:t.launchScraping}
              </button>
              {scrapingResult&&(
                <div style={{marginTop:14,padding:"14px 18px",borderRadius:12,background:"#ECFDF5",border:"1px solid #D1FAE5",color:"#059669",fontWeight:600,fontSize:13}}>
                  ✅ {t.scrapingDone.replace("{n}",scrapingResult)} {lang==="fr"?"→ rendez-vous dans l'onglet Prospects":"→ check the Prospects tab"}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {view==="settings"&&(
          <div>
            <h1 style={{fontSize:22,fontWeight:700,color:"#111",marginBottom:24}}>{t.nav.settings}</h1>
            <div className="card" style={{padding:28,maxWidth:520}}>
              <div style={{fontWeight:600,marginBottom:16,color:"#111"}}>📅 {lang==="fr"?"Lien Calendly par défaut":"Default Calendly Link"}</div>
              <input className="input" style={{marginBottom:8}} placeholder="https://calendly.com/votre-nom/30min" value={calendlyUrl} onChange={e=>setCalendlyUrl(e.target.value)}/>
              <div style={{fontSize:12,color:"#888"}}>{lang==="fr"?"Ce lien sera inséré dans vos emails personnalisés IA":"This link will be inserted in your AI-personalized emails"}</div>
            </div>
          </div>
        )}
      </div>

      {/* COMPOSE MODAL */}
      {composing&&(
        <div className="overlay" onClick={e=>{if(e.target===e.currentTarget)setComposing(false)}}>
          <div className="modal">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
              <div>
                <h2 style={{fontSize:17,fontWeight:700,color:"#111"}}>{t.compose}</h2>
                {composeProspect&&<p style={{fontSize:12,color:"#888",marginTop:3}}>→ {composeProspect.firstName} {composeProspect.lastName} · {composeProspect.company}</p>}
              </div>
              <button onClick={()=>setComposing(false)} style={{background:"none",border:"none",cursor:"pointer",fontSize:22,color:"#aaa",lineHeight:1}}>×</button>
            </div>

            {/* Recipient */}
            {!composeProspect&&(
              <div style={{marginBottom:14}}>
                <label style={{fontSize:11,fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:".05em",display:"block",marginBottom:6}}>{t.to}</label>
                <select className="input" onChange={e=>{ const p=prospects.find(x=>x.email===e.target.value); setComposeProspect(p||null); }}>
                  <option value="">{lang==="fr"?"Sélectionner un prospect":"Select a prospect"}</option>
                  {prospects.map(p=><option key={p.id} value={p.email}>{p.firstName} {p.lastName} — {p.email}</option>)}
                </select>
              </div>
            )}

            {/* AI generate */}
            {composeProspect&&(
              <div style={{background:"linear-gradient(135deg,#F5F3FF,#FDF2F8)",borderRadius:12,padding:16,marginBottom:18,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
                <div>
                  <div style={{fontWeight:600,fontSize:13,color:"#7C3AED",marginBottom:3}}>✨ IA Personnalisation</div>
                  <div style={{fontSize:12,color:"#888"}}>{t.aiEmailHint}</div>
                </div>
                <button className="btn-ai" disabled={generatingAI} onClick={generateWithAI}>
                  {generatingAI?t.generating:t.generateAI}
                </button>
              </div>
            )}

            {/* Calendly toggle */}
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,padding:"10px 14px",background:"#F0FDF4",borderRadius:10,cursor:"pointer"}} onClick={()=>setShowCalendly(!showCalendly)}>
              <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${showCalendly?"#059669":"#ccc"}`,background:showCalendly?"#059669":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {showCalendly&&<svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
              </div>
              <span style={{fontSize:13,fontWeight:500,color:"#059669"}}>📅 {t.addCalendly}</span>
            </div>
            {showCalendly&&(
              <div style={{marginBottom:14}}>
                <input className="input" placeholder={t.calendlyUrl} value={calendlyUrl} onChange={e=>setCalendlyUrl(e.target.value)}/>
              </div>
            )}

            {/* Subject */}
            <div style={{marginBottom:12}}>
              <label style={{fontSize:11,fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:".05em",display:"block",marginBottom:6}}>{t.subject}</label>
              <input className="input" placeholder={t.subject} value={composeData.subject} onChange={e=>setComposeData(p=>({...p,subject:e.target.value}))}/>
            </div>

            {/* Body */}
            <div style={{marginBottom:20}}>
              <label style={{fontSize:11,fontWeight:600,color:"#888",textTransform:"uppercase",letterSpacing:".05em",display:"block",marginBottom:6}}>{t.message}</label>
              <textarea className="input" style={{minHeight:200}} placeholder={lang==="fr"?"Rédigez ou générez votre email...":"Write or generate your email..."} value={composeData.body} onChange={e=>setComposeData(p=>({...p,body:e.target.value}))}/>
            </div>

            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button className="btn-outline" onClick={()=>setComposing(false)}>{t.cancel}</button>
              <button className="btn-blue" disabled={!composeData.subject||!composeData.body||sendingEmail} onClick={sendEmail} style={{padding:"10px 24px"}}>
                {sendingEmail?`⏳ ${t.sending}`:`✉️ ${t.send}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast&&<div className="toast" style={{background:toast.type==="err"?"#EF4444":"#111",color:"white"}}>
        {toast.type==="err"?"❌":"✅"} {toast.msg}
      </div>}
    </div>
  );
}
