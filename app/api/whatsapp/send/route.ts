import { NextRequest, NextResponse } from 'next/server'
import { sendTextMessage } from '@/lib/evolution'
import { createAdminClient } from '@/lib/supabase'

// POST /api/whatsapp/send - envia mensagem WhatsApp para um lead
export async function POST(request: NextRequest) {
  const evolutionUrl = process.env.EVOLUTION_API_URL
  if (!evolutionUrl) {
    return NextResponse.json({ error: 'Evolution API nao configurada' }, { status: 400 })
  }

  const body = await request.json()
  const { leadId, phone, message } = body

  if (!phone || !message) {
    return NextResponse.json({ error: 'phone e message sao obrigatorios' }, { status: 400 })
  }

  try {
    // Envia a mensagem via Evolution API
    const result = await sendTextMessage(phone, message)

    // Salva no banco de dados
    const supabase = createAdminClient()
    await supabase.from('messages').insert({
      lead_id: leadId || null,
      channel: 'whatsapp',
      content: message,
      status: result?.key ? 'sent' : 'failed',
      sent_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (err) {
    return NextResponse.json({
      error: `Falha ao enviar: ${err}`,
    }, { status: 500 })
  }
}
