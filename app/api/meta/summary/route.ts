import { NextRequest, NextResponse } from 'next/server'
import { getAccountSummary } from '@/lib/meta-api'

// GET /api/meta/summary — resumo da conta de anúncios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'last_30d'

    const summary = await getAccountSummary(period)

    return NextResponse.json(summary)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao buscar resumo'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
