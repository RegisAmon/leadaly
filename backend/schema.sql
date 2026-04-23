-- Leadaly DB Schema — Turso (libSQL/SQLite)
-- Run with: sqlite3 local.db < schema.sql

CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan TEXT DEFAULT 'starter' CHECK(plan IN ('starter','pro','agency')),
    credits_remaining INTEGER DEFAULT 100,
    credits_total INTEGER DEFAULT 100,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS workspace_members (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    role TEXT DEFAULT 'member' CHECK(role IN ('owner','admin','member')),
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft','running','completed','failed','paused')),
    filters TEXT NOT NULL DEFAULT '{}',  -- JSON
    leads_count INTEGER DEFAULT 0,
    credits_used INTEGER DEFAULT 0,
    apify_run_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT
);

CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    campaign_id TEXT REFERENCES campaigns(id) ON DELETE SET NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    title TEXT,
    company_name TEXT,
    company_size TEXT,
    industry TEXT,
    location TEXT,
    linkedin_url TEXT UNIQUE,
    email TEXT,
    email_status TEXT CHECK(email_status IN ('valid','invalid','risky','unknown')),
    phone TEXT,
    seniority TEXT,
    raw_data TEXT DEFAULT '{}',  -- JSON
    score INTEGER DEFAULT 0 CHECK(score >= 0 AND score <= 100),
    tags TEXT DEFAULT '[]',  -- JSON array
    crm_pushed_at TEXT,
    crm_external_id TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    campaign_id TEXT REFERENCES campaigns(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK(type IN ('scrape','enrich','export','crm_push')),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending','running','completed','failed')),
    apify_actor_id TEXT,
    apify_run_id TEXT,
    input TEXT DEFAULT '{}',  -- JSON
    output TEXT DEFAULT '{}',  -- JSON
    error_message TEXT,
    started_at TEXT,
    completed_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS crm_connections (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    crm_type TEXT NOT NULL CHECK(crm_type IN ('hubspot','pipedrive','notion','csv')),
    credentials TEXT DEFAULT '{}',  -- JSON encrypted
    config TEXT DEFAULT '{}',  -- JSON
    is_active INTEGER DEFAULT 1,
    last_sync_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS credit_transactions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK(type IN ('purchase','usage','refund','bonus','referral_bonus')),
    amount INTEGER NOT NULL,  -- positive = add, negative = consume
    description TEXT,
    campaign_id TEXT REFERENCES campaigns(id) ON DELETE SET NULL,
    stripe_payment_intent_id TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_workspace ON leads(workspace_id);
CREATE INDEX IF NOT EXISTS idx_leads_campaign ON leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_linkedin_url ON leads(linkedin_url);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_jobs_workspace ON jobs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_jobs_campaign ON jobs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_jobs_apify_run ON jobs(apify_run_id);
CREATE INDEX IF NOT EXISTS idx_credit_tx_workspace ON credit_transactions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON workspace_members(user_id);
