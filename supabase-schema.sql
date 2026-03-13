-- Schema do Prospect Hunter
-- Rode este SQL no Supabase Dashboard > SQL Editor

-- Tabela de leads (principal)
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  phone TEXT,
  email TEXT,
  source TEXT DEFAULT 'manual',        -- meta, google, whatsapp, manual
  status TEXT DEFAULT 'novo',           -- novo, contatado, qualificado, convertido, perdido
  score INTEGER,                        -- 0-100 (qualificacao IA)
  classification TEXT,                  -- hot, warm, cold
  meta_campaign_id TEXT,                -- ID da campanha Meta de origem
  meta_ad_id TEXT,                      -- ID do anuncio Meta
  meta_lead_id TEXT,                    -- ID do lead no Meta (evita duplicatas)
  notes TEXT,                           -- observacoes livres
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de mensagens enviadas (WhatsApp/email)
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  channel TEXT DEFAULT 'whatsapp',      -- whatsapp, email
  content TEXT,
  status TEXT DEFAULT 'pending',        -- pending, sent, delivered, read, failed
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de workflows de automacao
CREATE TABLE workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT FALSE,
  steps JSONB DEFAULT '[]',             -- array de passos [{dia, acao, template}]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de metricas da Meta (relatorios periodicos)
CREATE TABLE meta_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id TEXT,
  campaign_name TEXT,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  spend DECIMAL(10,2) DEFAULT 0,
  cpc DECIMAL(10,2) DEFAULT 0,
  ctr DECIMAL(5,2) DEFAULT 0,
  roas DECIMAL(10,2) DEFAULT 0,
  report_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indice para buscar leads por score (mais rapido)
CREATE INDEX idx_leads_score ON leads(score);
-- Indice para buscar leads por data
CREATE INDEX idx_leads_created ON leads(created_at);
-- Indice para buscar mensagens por lead
CREATE INDEX idx_messages_lead ON messages(lead_id);

-- Funcao para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: quando lead e atualizado, updated_at muda sozinho
CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
