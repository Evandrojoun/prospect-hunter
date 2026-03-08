import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

// POST /api/neuro-analyze - analisa pagina com IA usando principios de neuromarketing
export async function POST(request: NextRequest) {
  const { url } = await request.json()

  if (!url) {
    return NextResponse.json({ error: 'URL e obrigatoria' }, { status: 400 })
  }

  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY nao configurada' }, { status: 500 })
  }

  try {
    // 1. Busca o conteudo da pagina
    const pageRes = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ProspectHunter/1.0)' },
    })

    if (!pageRes.ok) {
      return NextResponse.json({ error: `Nao consegui acessar a pagina (status ${pageRes.status})` }, { status: 400 })
    }

    const html = await pageRes.text()

    // Remove tags de script e style pra pegar so o texto visivel
    const cleanText = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 8000) // Limita pra nao estourar o contexto da IA

    if (cleanText.length < 50) {
      return NextResponse.json({ error: 'A pagina parece estar vazia ou bloqueou o acesso' }, { status: 400 })
    }

    // 2. Envia pra Gemini analisar
    const prompt = `Voce e um especialista em neuromarketing e copywriting. Analise o conteudo desta landing page/pagina de vendas e de uma avaliacao detalhada.

CONTEUDO DA PAGINA:
${cleanText}

Responda EXATAMENTE neste formato JSON (sem markdown, sem texto extra, APENAS o JSON):
{
  "score": <numero de 0 a 100>,
  "nivel": "<Excelente|Bom|Regular|Fraco|Critico>",
  "resumo": "<resumo em 1-2 frases da analise geral>",
  "categorias": [
    {
      "nome": "Headline/Titulo",
      "score": <0-100>,
      "feedback": "<o que esta bom ou ruim no titulo>"
    },
    {
      "nome": "Gatilhos Mentais",
      "score": <0-100>,
      "feedback": "<urgencia, escassez, prova social, autoridade, reciprocidade - quais tem e quais faltam>"
    },
    {
      "nome": "Clareza da Oferta",
      "score": <0-100>,
      "feedback": "<esta claro o que a pessoa ganha? o beneficio esta explicito?>"
    },
    {
      "nome": "Call-to-Action (CTA)",
      "score": <0-100>,
      "feedback": "<os botoes/links de acao sao claros e persuasivos?>"
    },
    {
      "nome": "Prova Social",
      "score": <0-100>,
      "feedback": "<depoimentos, numeros, logos de empresas, resultados?>"
    },
    {
      "nome": "Emocao e Conexao",
      "score": <0-100>,
      "feedback": "<a pagina conecta emocionalmente com a dor/desejo do publico?>"
    },
    {
      "nome": "Escaneabilidade",
      "score": <0-100>,
      "feedback": "<facil de ler rapido? tem subtitulos, bullets, espacamento?>"
    }
  ],
  "melhorias": [
    "<melhoria especifica 1>",
    "<melhoria especifica 2>",
    "<melhoria especifica 3>",
    "<melhoria especifica 4>",
    "<melhoria especifica 5>"
  ]
}`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2000,
          },
        }),
      }
    )

    if (!geminiRes.ok) {
      const err = await geminiRes.text()
      return NextResponse.json({ error: `Erro na API Gemini: ${err}` }, { status: 500 })
    }

    const geminiData = await geminiRes.json()
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Extrai o JSON da resposta (remove possivel markdown)
    const jsonMatch = responseText.replace(/```json?\n?/g, '').replace(/```/g, '').trim()

    try {
      const analysis = JSON.parse(jsonMatch)
      return NextResponse.json(analysis)
    } catch {
      return NextResponse.json({
        error: 'A IA retornou um formato inesperado',
        raw: responseText,
      }, { status: 500 })
    }
  } catch (err) {
    return NextResponse.json({ error: `Erro: ${err}` }, { status: 500 })
  }
}
