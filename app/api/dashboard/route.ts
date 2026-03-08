import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

// GET /api/dashboard - metricas do dashboard
export async function GET() {
  const supabase = createAdminClient()

  const today = new Date().toISOString().split('T')[0]

  const [totalRes, hojeRes, hotRes, convertidosRes] = await Promise.all([
    supabase.from('leads').select('*', { count: 'exact', head: true }),
    supabase.from('leads').select('*', { count: 'exact', head: true }).gte('created_at', today),
    supabase.from('leads').select('*', { count: 'exact', head: true }).gte('score', 80),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'convertido'),
  ])

  const total = totalRes.count ?? 0
  const convertidos = convertidosRes.count ?? 0
  const taxa = total > 0 ? ((convertidos / total) * 100).toFixed(1) : '0'

  return NextResponse.json({
    totalLeads: total,
    leadsHoje: hojeRes.count ?? 0,
    leadsHot: hotRes.count ?? 0,
    taxaConversao: `${taxa}%`,
    convertidos,
  })
}
