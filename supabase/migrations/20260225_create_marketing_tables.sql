-- Marketing Campaign Tables
-- Created: 2026-02-25

-- 1. Marketing Campaigns
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    campaign_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_name TEXT NOT NULL,
    description TEXT,
    objective TEXT NOT NULL,
    channels TEXT[] DEFAULT ARRAY[]::TEXT[],
    total_budget NUMERIC(15, 2) DEFAULT 0,
    spent_amount NUMERIC(15, 2) DEFAULT 0,
    currency_code TEXT DEFAULT 'VND',
    status TEXT DEFAULT 'Draft',
    start_date DATE NOT NULL,
    end_date DATE,
    target_audience TEXT,
    project_id TEXT REFERENCES projects(project_id) ON DELETE SET NULL,
    created_by TEXT REFERENCES auth.users(email),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_campaigns_status ON marketing_campaigns(status);
CREATE INDEX idx_campaigns_project_id ON marketing_campaigns(project_id);
CREATE INDEX idx_campaigns_start_date ON marketing_campaigns(start_date);
CREATE INDEX idx_campaigns_created_at ON marketing_campaigns(created_at DESC);

-- 2. Campaign Metrics
CREATE TABLE IF NOT EXISTS campaign_metrics (
    metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES marketing_campaigns(campaign_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    spent NUMERIC(15, 2) DEFAULT 0,
    revenue NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(campaign_id, date)
);

CREATE INDEX idx_metrics_campaign_id ON campaign_metrics(campaign_id);
CREATE INDEX idx_metrics_date ON campaign_metrics(date);

-- 3. Email Campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
    email_campaign_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES marketing_campaigns(campaign_id) ON DELETE CASCADE,
    template_id UUID,
    recipient_count INTEGER DEFAULT 0,
    sent_count INTEGER DEFAULT 0,
    opened_count INTEGER DEFAULT 0,
    clicked_count INTEGER DEFAULT 0,
    bounced_count INTEGER DEFAULT 0,
    unsubscribed_count INTEGER DEFAULT 0,
    scheduled_time TIMESTAMP WITH TIME ZONE,
    sent_time TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'Draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_campaigns_campaign_id ON email_campaigns(campaign_id);

-- 4. Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
    template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT,
    project_id TEXT REFERENCES projects(project_id) ON DELETE SET NULL,
    created_by TEXT REFERENCES auth.users(email),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_email_templates_project_id ON email_templates(project_id);

-- 5. Social Media Posts
CREATE TABLE IF NOT EXISTS social_posts (
    post_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES marketing_campaigns(campaign_id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    content TEXT NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    posted_time TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'Draft',
    media_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_social_posts_campaign_id ON social_posts(campaign_id);
CREATE INDEX idx_social_posts_platform ON social_posts(platform);
CREATE INDEX idx_social_posts_status ON social_posts(status);

-- 6. Landing Pages
CREATE TABLE IF NOT EXISTS landing_pages (
    page_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    campaign_id UUID REFERENCES marketing_campaigns(campaign_id) ON DELETE SET NULL,
    project_id TEXT REFERENCES projects(project_id) ON DELETE SET NULL,
    content TEXT,
    status TEXT DEFAULT 'Draft',
    visitors_count INTEGER DEFAULT 0,
    conversion_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_landing_pages_slug ON landing_pages(slug);
CREATE INDEX idx_landing_pages_campaign_id ON landing_pages(campaign_id);
CREATE INDEX idx_landing_pages_project_id ON landing_pages(project_id);

-- 7. Lead Forms
CREATE TABLE IF NOT EXISTS lead_forms (
    form_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    form_type TEXT DEFAULT 'Embedded',
    campaign_id UUID REFERENCES marketing_campaigns(campaign_id) ON DELETE SET NULL,
    project_id TEXT REFERENCES projects(project_id) ON DELETE SET NULL,
    fields JSONB DEFAULT '[]'::JSONB,
    success_message TEXT,
    submissions_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lead_forms_campaign_id ON lead_forms(campaign_id);
CREATE INDEX idx_lead_forms_project_id ON lead_forms(project_id);

-- 8. Lead Form Submissions
CREATE TABLE IF NOT EXISTS form_submissions (
    submission_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES lead_forms(form_id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX idx_form_submissions_created_at ON form_submissions(created_at DESC);

-- Enable RLS (if needed)
ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (adjust based on your auth system)
CREATE POLICY "Allow all authenticated users to view campaigns" ON marketing_campaigns
    FOR SELECT TO authenticated
    USING (true);

CREATE POLICY "Allow creator to manage campaigns" ON marketing_campaigns
    FOR ALL
    USING (auth.uid()::text = created_by OR created_by IS NULL);
