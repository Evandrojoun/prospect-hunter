import { NextResponse } from 'next/server'
import { getCampaigns, getCampaignInsights } from '@/lib/meta-api'

// GET /api/meta/campaigns — lista campanhas com métricas
export async function GET() {
  try {
    const [campaigns, insights] = await Promise.all([
      getCampaigns(),
      getCampaignInsights('last_30d'),
    ])

    // Juntar campanhas com seus insights
    const campaignsWithMetrics = campaigns.map((campaign) => {
      const insight = insights.find((i) => i.campaign_id === campaign.id)
      return {
        ...campaign,
        metrics: insight
          ? {
              impressions: parseInt(insight.impressions || '0'),
              clicks: parseInt(insight.clicks || '0'),
              spend: parseFloat(insight.spend || '0'),
              ctr: parseFloat(insight.ctr || '0'),
              cpc: parseFloat(insight.cpc || '0'),
            }
          : null,
      }
    })

    return NextResponse.json({ campaigns: campaignsWithMetrics })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar campanhas'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
