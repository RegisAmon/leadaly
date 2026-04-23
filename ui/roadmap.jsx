import { useState } from "react";

const phases = [
  {
    id: 1,
    label: "Phase 1",
    title: "Foundation",
    weeks: "Semaines 1–2",
    color: "#2563EB",
    bg: "#EFF6FF",
    tasks: [
      { id: "1-1", title: "Init Next.js 14 (App Router) + FastAPI", detail: "Structure /app, layouts, middleware. Dockerfile FastAPI.", done: false },
      { id: "1-2", title: "Auth Clerk — signup, login, workspace auto-créé", detail: "Middleware JWT côté FastAPI. Workspace créé à l'inscription.", done: false },
      { id: "1-3", title: "Schéma PostgreSQL + migrations Alembic", detail: "Tables : workspaces, workspace_members, campaigns, leads, jobs, crm_connections, credit_transactions.", done: false },
      { id: "1-4", title: "Dashboard skeleton — sidebar, nav, layout", detail: "Routes : /dashboard, /campaigns, /leads, /crm, /billing, /settings.", done: false },
      { id: "1-5", title: "Page Campaigns — liste vide + bouton créer", detail: "État vide illustré. Card campagne avec status badge.", done: false },
    ],
  },
  {
    id: 2,
    label: "Phase 2",
    title: "Scraping Core",
    weeks: "Semaines 3–4",
    color: "#7C3AED",
    bg: "#F5F3FF",
    tasks: [
      { id: "2-1", title: "FiltersBuilder UI — le cœur du produit", detail: "Champs : keywords, locations, industries, seniority (multi-select), company size, max_results. Prévisualisation du nombre de crédits estimé.", done: false },
      { id: "2-2", title: "POST /api/campaigns + /campaigns/{id}/run", detail: "Vérif crédits avant lancement. Réservation crédits en pending.", done: false },
      { id: "2-3", title: "Intégration Apify — actor + webhook retour", detail: "Actor : curious_coder/linkedin-sales-navigator-search. Webhook /api/webhooks/apify → parse résultats → stocker leads.", done: false },
      { id: "2-4", title: "Job queue Redis — traitement async", detail: "Bull/BullMQ ou Celery. Statuts : pending → running → completed/failed.", done: false },
      { id: "2-5", title: "LeadTable — pagination, tri, filtres", detail: "Colonnes : nom, titre, entreprise, location, score, email, actions. Filtres : campagne, score min, email status.", done: false },
      { id: "2-6", title: "Statuts campagne temps réel", detail: "Polling toutes les 5s ou SSE /api/campaigns/{id}/stream.", done: false },
    ],
  },
  {
    id: 3,
    label: "Phase 3",
    title: "Enrichissement + CRM",
    weeks: "Semaines 5–6",
    color: "#059669",
    bg: "#ECFDF5",
    tasks: [
      { id: "3-1", title: "Pipeline enrichissement Hunter.io", detail: "Après scraping : chercher email via nom + domaine entreprise. Stocker email + statut (valid/risky/unknown).", done: false },
      { id: "3-2", title: "Déduplication + scoring automatique", detail: "Dedup par linkedin_url + email. Score 0–100 basé sur séniorité, taille boîte, email valid, téléphone.", done: false },
      { id: "3-3", title: "Page CRM — connect HubSpot / Pipedrive / Notion", detail: "OAuth HubSpot. API key Pipedrive. Integration token Notion + sélection database. Test de connexion.", done: false },
      { id: "3-4", title: "Push leads vers CRM", detail: "Sélection manuelle via checkbox. Auto-push optionnel par campagne. Mapping de champs configurable.", done: false },
      { id: "3-5", title: "Export CSV → S3 → URL téléchargement", detail: "POST /api/leads/export → job async → upload S3 → URL signée 1h → email Resend avec lien.", done: false },
    ],
  },
  {
    id: 4,
    label: "Phase 4",
    title: "Billing + Polish",
    weeks: "Semaines 7–8",
    color: "#D97706",
    bg: "#FFFBEB",
    tasks: [
      { id: "4-1", title: "Stripe — plans crédits + checkout", detail: "3 plans : Starter 29€/500cr, Pro 79€/2000cr, Agency 199€/10000cr. Crédits supplémentaires à l'unité.", done: false },
      { id: "4-2", title: "CreditMeter dans la sidebar", detail: "Barre de progression crédits restants/total. Alerte à 20%. Lien vers /billing.", done: false },
      { id: "4-3", title: "Gestion quota — bloquer si 0 crédits", detail: "Check crédits avant run. Message d'erreur avec CTA upgrade.", done: false },
      { id: "4-4", title: "Emails Resend — transactionnels", detail: "Templates : bienvenue, run terminé (N leads trouvés), crédits bas (<10%), invitation membre.", done: false },
      { id: "4-5", title: "Onboarding flow — 3 étapes guidées", detail: "1/ Créer première campagne. 2/ Connecter un CRM. 3/ Faire le premier export. Checklist persistante.", done: false },
      { id: "4-6", title: "Page Settings — membres, RGPD, dangerzone", detail: "Invitations, rôles. Export données RGPD. Suppression leads. Suppression workspace.", done: false },
    ],
  },
];

const stack = [
  { layer: "Frontend", tech: "Next.js 14 (App Router)", note: "Vercel deploy" },
  { layer: "UI", tech: "shadcn/ui + Tailwind CSS", note: "Accessible" },
  { layer: "Backend", tech: "FastAPI Python 3.11+", note: "Ubuntu droplet" },
  { layer: "Auth", tech: "Clerk", note: "Multi-tenant natif" },
  { layer: "Base de données", tech: "PostgreSQL + JSONB", note: "Supabase ou Railway" },
  { layer: "Cache / Queue", tech: "Redis (Upstash)", note: "Jobs async" },
  { layer: "Scraping", tech: "Apify REST API", note: "Actors LinkedIn" },
  { layer: "Email enrichissement", tech: "Hunter.io API", note: "Vérif + recherche" },
  { layer: "Billing", tech: "Stripe (crédits)", note: "Webhooks" },
  { layer: "Email transac.", tech: "Resend", note: "Templates HTML" },
  { layer: "Exports", tech: "AWS S3", note: "URLs signées" },
  { layer: "CRM", tech: "HubSpot + Pipedrive + Notion", note: "Push API" },
];

const dbTables = [
  { name: "workspaces", fields: "id, name, slug, plan, credits_remaining, stripe_customer_id" },
  { name: "workspace_members", fields: "id, workspace_id, user_id (Clerk), role" },
  { name: "campaigns", fields: "id, workspace_id, name, status, filters (JSONB), leads_count, apify_run_id" },
  { name: "leads", fields: "id, campaign_id, full_name, title, company, linkedin_url, email, email_status, score, tags[]" },
  { name: "jobs", fields: "id, campaign_id, type, status, apify_run_id, input/output (JSONB)" },
  { name: "crm_connections", fields: "id, workspace_id, crm_type, credentials (JSONB chiffré), config" },
  { name: "credit_transactions", fields: "id, workspace_id, type, amount, description, stripe_payment_intent_id" },
];

const crmIntegrations = [
  { name: "HubSpot", auth: "OAuth 2.0", api: "Contacts API v3", fields: "firstname, lastname, email, jobtitle, company, linkedin_url" },
  { name: "Pipedrive", auth: "API Key", api: "Persons API", fields: "name, email[], job_title, org_id" },
  { name: "Notion", auth: "Integration Token", api: "Pages API v1", fields: "Name, Email, Company, Title, LinkedIn, Score" },
  { name: "CSV / Google Sheets", auth: "—", api: "Export S3 + URL signée", fields: "Tous les champs" },
];

const tabs = [
  { id: "roadmap", label: "Roadmap" },
  { id: "stack", label: "Stack" },
  { id: "database", label: "Base de données" },
  { id: "crm", label: "CRM" },
  { id: "credits", label: "Crédits" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("roadmap");
  const [expandedPhase, setExpandedPhase] = useState(null);
  const [done, setDone] = useState({});

  const toggleDone = (id) => setDone((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalTasks = phases.reduce((a, p) => a + p.tasks.length, 0);
  const doneTasks = Object.values(done).filter(Boolean).length;
  const progress = Math.round((doneTasks / totalTasks) * 100);

  return (
    <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", background: "#FAFAFA", minHeight: "100vh", color: "#111" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .tab-btn { background: none; border: none; cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 500; padding: 8px 16px; border-radius: 8px; transition: all 0.15s; color: #666; }
        .tab-btn.active { background: #111; color: #fff; }
        .tab-btn:hover:not(.active) { background: #f0f0f0; color: #111; }
        .task-row { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
        .task-row:last-child { border-bottom: none; }
        .check { width: 18px; height: 18px; border-radius: 5px; border: 1.5px solid #ddd; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.15s; margin-top: 1px; }
        .check.done { background: #111; border-color: #111; }
        .phase-header { cursor: pointer; display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; }
        .phase-header:hover { background: rgba(0,0,0,0.02); }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { text-align: left; padding: 10px 14px; font-weight: 500; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #888; border-bottom: 1px solid #e8e8e8; background: #fafafa; }
        td { padding: 12px 14px; border-bottom: 1px solid #f2f2f2; vertical-align: top; }
        tr:last-child td { border-bottom: none; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 500; }
      `}</style>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8e8e8", padding: "24px 40px 0" }}>
        <div style={{ maxWidth: 920, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "#888", textTransform: "uppercase", marginBottom: 6 }}>SaaS B2B · Spécification complète</div>
              <h1 style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.5px", color: "#111" }}>LinkedIn Lead Generation SaaS</h1>
              <p style={{ color: "#666", fontSize: 14, marginTop: 4 }}>Roadmap · Stack · DB · CRM · Billing — Document agent IA</p>
            </div>
            {/* Progress */}
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 28, fontWeight: 600, color: "#111" }}>{progress}%</div>
              <div style={{ fontSize: 12, color: "#888" }}>{doneTasks}/{totalTasks} tâches</div>
              <div style={{ width: 120, height: 4, background: "#f0f0f0", borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
                <div style={{ width: `${progress}%`, height: "100%", background: "#111", borderRadius: 2, transition: "width 0.3s" }} />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4 }}>
            {tabs.map((t) => (
              <button key={t.id} className={`tab-btn${activeTab === t.id ? " active" : ""}`} onClick={() => setActiveTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "32px 40px" }}>

        {/* ROADMAP */}
        {activeTab === "roadmap" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {phases.map((phase) => {
              const phaseDone = phase.tasks.filter((t) => done[t.id]).length;
              const isOpen = expandedPhase === phase.id;
              return (
                <div key={phase.id} style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, overflow: "hidden" }}>
                  <div className="phase-header" onClick={() => setExpandedPhase(isOpen ? null : phase.id)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: phase.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: phase.color, flexShrink: 0 }}>
                        {phase.id}
                      </div>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>{phase.title}</span>
                          <span style={{ fontSize: 12, color: "#888" }}>{phase.weeks}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{phase.tasks.length} tâches · {phaseDone} complétées</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 80, height: 4, background: "#f0f0f0", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ width: `${(phaseDone / phase.tasks.length) * 100}%`, height: "100%", background: phase.color, borderRadius: 2 }} />
                      </div>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: isOpen ? "rotate(180deg)" : "", transition: "transform 0.2s", color: "#aaa" }}>
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>

                  {isOpen && (
                    <div style={{ padding: "0 24px 16px", borderTop: "1px solid #f0f0f0" }}>
                      {phase.tasks.map((task) => (
                        <div key={task.id} className="task-row">
                          <div className={`check${done[task.id] ? " done" : ""}`} onClick={() => toggleDone(task.id)}>
                            {done[task.id] && (
                              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                                <path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 500, color: done[task.id] ? "#aaa" : "#111", textDecoration: done[task.id] ? "line-through" : "none" }}>{task.title}</div>
                            <div style={{ fontSize: 12, color: "#999", marginTop: 3, lineHeight: 1.5 }}>{task.detail}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* STACK */}
        {activeTab === "stack" && (
          <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, overflow: "hidden" }}>
            <table>
              <thead>
                <tr>
                  <th>Couche</th>
                  <th>Technologie</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {stack.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500, color: "#555", width: 180 }}>{s.layer}</td>
                    <td style={{ fontWeight: 500, color: "#111" }}>{s.tech}</td>
                    <td><span className="badge" style={{ background: "#f5f5f5", color: "#666" }}>{s.note}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DATABASE */}
        {activeTab === "database" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, overflow: "hidden" }}>
              <table>
                <thead>
                  <tr>
                    <th>Table</th>
                    <th>Champs principaux</th>
                  </tr>
                </thead>
                <tbody>
                  {dbTables.map((t, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: "monospace", fontWeight: 500, color: "#2563EB", fontSize: 13, width: 220 }}>{t.name}</td>
                      <td style={{ color: "#666", fontSize: 12, lineHeight: 1.6 }}>{t.fields}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: "#111" }}>Détail champs lead</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  ["linkedin_url", "VARCHAR(500) UNIQUE — clé de déduplication"],
                  ["email_status", "valid | invalid | risky | unknown"],
                  ["score", "INT 0–100 — calculé automatiquement"],
                  ["raw_data", "JSONB — réponse brute Apify"],
                  ["tags", "TEXT[] — tags libres"],
                  ["crm_pushed_at", "TIMESTAMP — date dernier push CRM"],
                  ["seniority", "C-Level | VP | Director | Manager | Senior"],
                  ["company_size", "1-10 | 11-50 | 51-200 | 201-500 | >500"],
                ].map(([f, d], i) => (
                  <div key={i} style={{ padding: "10px 14px", background: "#fafafa", borderRadius: 8 }}>
                    <div style={{ fontFamily: "monospace", fontSize: 12, color: "#2563EB", fontWeight: 500 }}>{f}</div>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 3 }}>{d}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CRM */}
        {activeTab === "crm" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, overflow: "hidden" }}>
              <table>
                <thead>
                  <tr>
                    <th>CRM</th>
                    <th>Auth</th>
                    <th>API</th>
                    <th>Champs mappés</th>
                  </tr>
                </thead>
                <tbody>
                  {crmIntegrations.map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: "#111" }}>{c.name}</td>
                      <td><span className="badge" style={{ background: "#EFF6FF", color: "#2563EB" }}>{c.auth}</span></td>
                      <td style={{ fontSize: 12, color: "#555" }}>{c.api}</td>
                      <td style={{ fontSize: 11, color: "#888", fontFamily: "monospace" }}>{c.fields}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: "#111" }}>Flow push CRM</div>
              <div style={{ display: "flex", alignItems: "center", gap: 0, flexWrap: "wrap" }}>
                {["Sélection leads", "POST /api/crm/push", "Job async Redis", "API CRM", "Mise à jour crm_pushed_at"].map((step, i, arr) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 0 }}>
                    <div style={{ padding: "8px 14px", background: "#f5f5f5", borderRadius: 8, fontSize: 12, fontWeight: 500, color: "#444", whiteSpace: "nowrap" }}>{step}</div>
                    {i < arr.length - 1 && <div style={{ color: "#ccc", padding: "0 6px", fontSize: 16 }}>→</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CREDITS */}
        {activeTab === "credits" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[
                { plan: "Starter", price: "29€/mois", credits: "500 crédits", extra: "0.08€/cr supp.", color: "#2563EB", bg: "#EFF6FF" },
                { plan: "Pro", price: "79€/mois", credits: "2 000 crédits", extra: "0.05€/cr supp.", color: "#7C3AED", bg: "#F5F3FF" },
                { plan: "Agency", price: "199€/mois", credits: "10 000 crédits", extra: "0.03€/cr supp.", color: "#059669", bg: "#ECFDF5" },
              ].map((p) => (
                <div key={p.plan} style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, padding: 20 }}>
                  <div style={{ display: "inline-block", padding: "3px 10px", background: p.bg, color: p.color, borderRadius: 6, fontSize: 11, fontWeight: 600, marginBottom: 12 }}>{p.plan}</div>
                  <div style={{ fontSize: 24, fontWeight: 600, color: "#111" }}>{p.price}</div>
                  <div style={{ fontSize: 14, color: "#555", marginTop: 6, fontWeight: 500 }}>{p.credits}</div>
                  <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>{p.extra}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 12, overflow: "hidden" }}>
              <table>
                <thead>
                  <tr>
                    <th>Opération</th>
                    <th>Coût</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["1 lead scrappé (Apify)", "1 crédit", "Décompté à la fin du run réussi"],
                    ["1 enrichissement email (Hunter.io)", "0.5 crédit", "Optionnel, activable par campagne"],
                    ["1 push CRM", "0 crédit", "Gratuit — fidélisation"],
                    ["Export CSV", "0 crédit", "Gratuit — fidélisation"],
                    ["Run échoué", "0 crédit", "Crédits remboursés automatiquement"],
                  ].map(([op, cost, note], i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 500, color: "#111" }}>{op}</td>
                      <td><span className="badge" style={{ background: "#f5f5f5", color: "#111", fontWeight: 600 }}>{cost}</span></td>
                      <td style={{ fontSize: 12, color: "#888" }}>{note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#92400E", marginBottom: 8 }}>Gestion quota Stripe</div>
              <div style={{ fontSize: 13, color: "#78350F", lineHeight: 1.7 }}>
                <div>· <strong>checkout.session.completed</strong> → créditer le workspace</div>
                <div>· <strong>invoice.paid</strong> → renouvellement mensuel, reset crédits</div>
                <div>· <strong>customer.subscription.deleted</strong> → downgrade plan free</div>
                <div>· Alerte email Resend quand crédits &lt; 10%</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "20px", color: "#bbb", fontSize: 11 }}>
        LinkedIn Lead Gen SaaS · Spec v1.0 · Avril 2026
      </div>
    </div>
  );
}
