// lib/meta-api.ts — Integração com Meta Marketing API
// Busca campanhas, adsets e leads do Facebook/Instagram Ads

const META_BASE_URL = 'https://graph.facebook.com/v21.0'

function getToken() {
  const token = process.env.META_ACCESS_TOKEN
  if (!token) throw new Error('META_ACCESS_TOKEN não configurado')
  return token
}

function getAdAccountId() {
  const id = process.env.META_AD_ACCOUNT_ID
  if (!id) throw new Error('META_AD_ACCOUNT_ID não configurado')
  return id
}

// Tipo para campanhas
export interface MetaCampaign {
  id: string
  name: string
  status: string
  objective: string
  daily_budget?: string
  lifetime_budget?: string
  created_time: string
}

// Tipo para insights (métricas)
export interface MetaInsight {
  campaign_id: string
  campaign_name: string
  impressions: string
  clicks: string
  spend: string
  cpc?: string
  cpm?: string
  ctr?: string
  reach?: string
  actions?: Array<{ action_type: string; value: string }>
  date_start: string
  date_stop: string
}

// Tipo para leads de formulários
export interface MetaLead {
  id: string
  created_time: string
  field_data: Array<{ name: string; values: string[] }>
}

// Buscar todas as campanhas da conta
export async function getCampaigns(): Promise<MetaCampaign[]> {
  const token = getToken()
  const accountId = getAdAccountId()

  const url = `${META_BASE_URL}/${accountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,created_time&limit=100&access_token=${token}`

  const res = await fetch(url)
  const data = await res.json()

  if (data.error) {
    throw new Error(`Meta API: ${data.error.message}`)
  }

  return data.data || []
}

// Buscar insights (métricas) das campanhas
export async function getCampaignInsights(
  datePreset: string = 'last_30d'
): Promise<MetaInsight[]> {
  const token = getToken()
  const accountId = getAdAccountId()

  const fields = 'campaign_id,campaign_name,impressions,clicks,spend,cpc,cpm,ctr,reach,actions'
  const url = `${META_BASE_URL}/${accountId}/insights?fields=${fields}&date_preset=${datePreset}&level=campaign&limit=100&access_token=${token}`

  const res = await fetch(url)
  const data = await res.json()

  if (data.error) {
    throw new Error(`Meta API: ${data.error.message}`)
  }

  return data.data || []
}

// Buscar formulários de leads (Lead Ads) de uma página
export async function getLeadForms(pageId: string): Promise<Array<{ id: string; name: string }>> {
  const token = getToken()

  const url = `${META_BASE_URL}/${pageId}/leadgen_forms?fields=id,name,status&access_token=${token}`

  const res = await fetch(url)
  const data = await res.json()

  if (data.error) {
    throw new Error(`Meta API: ${data.error.message}`)
  }

  return data.data || []
}

// Buscar leads de um formulário específico
export async function getLeadsFromForm(formId: string): Promise<MetaLead[]> {
  const token = getToken()

  const url = `${META_BASE_URL}/${formId}/leads?fields=id,created_time,field_data&limit=500&access_token=${token}`

  const res = await fetch(url)
  const data = await res.json()

  if (data.error) {
    throw new Error(`Meta API: ${data.error.message}`)
  }

  return data.data || []
}

// Buscar páginas conectadas à conta
export async function getPages(): Promise<Array<{ id: string; name: string }>> {
  const token = getToken()

  const url = `${META_BASE_URL}/me/accounts?fields=id,name&access_token=${token}`

  const res = await fetch(url)
  const data = await res.json()

  if (data.error) {
    throw new Error(`Meta API: ${data.error.message}`)
  }

  return data.data || []
}

// Resumo geral: gasto total, cliques, impressões
export async function getAccountSummary(datePreset: string = 'last_30d') {
  const token = getToken()
  const accountId = getAdAccountId()

  const fields = 'impressions,clicks,spend,reach,cpc,cpm,ctr,actions'
  const url = `${META_BASE_URL}/${accountId}/insights?fields=${fields}&date_preset=${datePreset}&access_token=${token}`

  const res = await fetch(url)
  const data = await res.json()

  if (data.error) {
    throw new Error(`Meta API: ${data.error.message}`)
  }

  const summary = data.data?.[0]
  if (!summary) {
    return {
      impressions: 0,
      clicks: 0,
      spend: 0,
      reach: 0,
      cpc: 0,
      cpm: 0,
      ctr: 0,
      leads: 0,
    }
  }

  // Extrair leads das actions (lead action type)
  const leadAction = summary.actions?.find(
    (a: { action_type: string }) =>
      a.action_type === 'lead' || a.action_type === 'onsite_conversion.lead_grouped'
  )

  return {
    impressions: parseInt(summary.impressions || '0'),
    clicks: parseInt(summary.clicks || '0'),
    spend: parseFloat(summary.spend || '0'),
    reach: parseInt(summary.reach || '0'),
    cpc: parseFloat(summary.cpc || '0'),
    cpm: parseFloat(summary.cpm || '0'),
    ctr: parseFloat(summary.ctr || '0'),
    leads: parseInt(leadAction?.value || '0'),
  }
}
