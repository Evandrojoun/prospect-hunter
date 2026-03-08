// Integracao com Evolution API (WhatsApp)
// Documentacao: https://doc.evolution-api.com

const EVOLUTION_URL = process.env.EVOLUTION_API_URL || ''
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY || ''
const INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'prospect-hunter'

// Headers padrao pra todas as requisicoes
function headers() {
  return {
    'Content-Type': 'application/json',
    'apikey': EVOLUTION_KEY,
  }
}

// Cria uma instancia (conexao) do WhatsApp
export async function createInstance() {
  const res = await fetch(`${EVOLUTION_URL}/instance/create`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      instanceName: INSTANCE_NAME,
      integration: 'WHATSAPP-BAILEYS',
      qrcode: true,
    }),
  })
  return res.json()
}

// Busca o QR Code pra conectar o WhatsApp
export async function getQRCode() {
  const res = await fetch(`${EVOLUTION_URL}/instance/connect/${INSTANCE_NAME}`, {
    method: 'GET',
    headers: headers(),
  })
  return res.json()
}

// Verifica o status da conexao
export async function getConnectionStatus() {
  const res = await fetch(`${EVOLUTION_URL}/instance/connectionState/${INSTANCE_NAME}`, {
    method: 'GET',
    headers: headers(),
  })
  return res.json()
}

// Envia mensagem de texto pelo WhatsApp
export async function sendTextMessage(phone: string, message: string) {
  // Formata o numero (remove espacos, parenteses, hifens)
  const cleanPhone = phone.replace(/\D/g, '')
  // Adiciona codigo do pais se nao tiver
  const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`

  const res = await fetch(`${EVOLUTION_URL}/message/sendText/${INSTANCE_NAME}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      number: fullPhone,
      text: message,
    }),
  })
  return res.json()
}

// Lista todas as instancias
export async function listInstances() {
  const res = await fetch(`${EVOLUTION_URL}/instance/fetchInstances`, {
    method: 'GET',
    headers: headers(),
  })
  return res.json()
}

// Deleta uma instancia
export async function deleteInstance() {
  const res = await fetch(`${EVOLUTION_URL}/instance/delete/${INSTANCE_NAME}`, {
    method: 'DELETE',
    headers: headers(),
  })
  return res.json()
}

// Desconecta (logout) da instancia
export async function logoutInstance() {
  const res = await fetch(`${EVOLUTION_URL}/instance/logout/${INSTANCE_NAME}`, {
    method: 'DELETE',
    headers: headers(),
  })
  return res.json()
}
