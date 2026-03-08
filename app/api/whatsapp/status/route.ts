import { NextResponse } from 'next/server'
import { getConnectionStatus, createInstance, getQRCode } from '@/lib/evolution'

// GET /api/whatsapp/status - verifica se WhatsApp esta conectado
export async function GET() {
  const evolutionUrl = process.env.EVOLUTION_API_URL
  if (!evolutionUrl) {
    return NextResponse.json({
      connected: false,
      configured: false,
      message: 'Evolution API nao configurada. Adicione EVOLUTION_API_URL no .env.local',
    })
  }

  try {
    const status = await getConnectionStatus()
    return NextResponse.json({
      connected: status?.instance?.state === 'open',
      configured: true,
      state: status?.instance?.state || 'unknown',
      details: status,
    })
  } catch {
    return NextResponse.json({
      connected: false,
      configured: true,
      message: 'Nao foi possivel conectar na Evolution API. Verifique se a VPS esta rodando.',
    })
  }
}

// POST /api/whatsapp/status - cria instancia e retorna QR code
export async function POST() {
  const evolutionUrl = process.env.EVOLUTION_API_URL
  if (!evolutionUrl) {
    return NextResponse.json({
      error: 'Evolution API nao configurada',
    }, { status: 400 })
  }

  try {
    // Tenta criar a instancia
    await createInstance()
    // Busca o QR code
    const qr = await getQRCode()
    return NextResponse.json(qr)
  } catch (err) {
    // Se instancia ja existe, so busca o QR
    try {
      const qr = await getQRCode()
      return NextResponse.json(qr)
    } catch {
      return NextResponse.json({
        error: `Erro ao conectar: ${err}`,
      }, { status: 500 })
    }
  }
}
