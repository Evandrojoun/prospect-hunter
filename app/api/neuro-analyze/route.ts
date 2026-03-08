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
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      },
    })

    if (!pageRes.ok) {
      return NextResponse.json({ error: `Nao consegui acessar a pagina (status ${pageRes.status})` }, { status: 400 })
    }

    const html = await pageRes.text()

    // Extrai informacoes estruturadas do HTML
    // Meta tags (titulo, descricao, og tags)
    const metaTitle = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || ''
    const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i)?.[1] || ''
    const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([\s\S]*?)["']/i)?.[1] || ''
    const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([\s\S]*?)["']/i)?.[1] || ''

    // Extrai textos de headings
    const headings = [...html.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)]
      .map(m => m[1].replace(/<[^>]+>/g, '').trim())
      .filter(h => h.length > 0)

    // Extrai textos de botoes e CTAs
    const buttons = [...html.matchAll(/<(?:button|a)[^>]*>([\s\S]*?)<\/(?:button|a)>/gi)]
      .map(m => m[1].replace(/<[^>]+>/g, '').trim())
      .filter(b => b.length > 2 && b.length < 100)

    // Extrai textos de paragrafos
    const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      .map(m => m[1].replace(/<[^>]+>/g, '').trim())
      .filter(p => p.length > 10)

    // Extrai alt de imagens
    const imageAlts = [...html.matchAll(/<img[^>]*alt=["']([\s\S]*?)["'][^>]*>/gi)]
      .map(m => m[1].trim())
      .filter(a => a.length > 0)

    // Extrai listas
    const listItems = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      .map(m => m[1].replace(/<[^>]+>/g, '').trim())
      .filter(l => l.length > 3)

    // Extrai textos de spans e divs com conteudo relevante
    const spans = [...html.matchAll(/<(?:span|strong|em|b)[^>]*>([\s\S]*?)<\/(?:span|strong|em|b)>/gi)]
      .map(m => m[1].replace(/<[^>]+>/g, '').trim())
      .filter(s => s.length > 5 && s.length < 200)

    // Texto limpo geral (fallback)
    const cleanText = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

    // Monta um resumo estruturado da pagina
    const pageAnalysis = `
=== META INFORMACOES ===
Titulo da pagina: ${metaTitle}
Meta descricao: ${metaDesc}
OG Title: ${ogTitle}
OG Description: ${ogDesc}

=== TITULOS E HEADLINES (${headings.length} encontrados) ===
${headings.slice(0, 20).map((h, i) => `${i + 1}. ${h}`).join('\n')}

=== BOTOES E CTAs (${buttons.length} encontrados) ===
${[...new Set(buttons)].slice(0, 15).map((b, i) => `${i + 1}. ${b}`).join('\n')}

=== PARAGRAFOS PRINCIPAIS (${paragraphs.length} encontrados) ===
${paragraphs.slice(0, 15).map((p, i) => `${i + 1}. ${p}`).join('\n')}

=== ITENS DE LISTA (${listItems.length} encontrados) ===
${listItems.slice(0, 15).map((l, i) => `${i + 1}. ${l}`).join('\n')}

=== DESTAQUES (textos em negrito/enfase) ===
${[...new Set(spans)].slice(0, 15).map((s, i) => `${i + 1}. ${s}`).join('\n')}

=== IMAGENS (${imageAlts.length} com descricao) ===
${imageAlts.slice(0, 10).map((a, i) => `${i + 1}. ${a}`).join('\n')}

=== TEXTO GERAL DA PAGINA (primeiros 5000 caracteres) ===
${cleanText.slice(0, 5000)}
`.trim()

    // Verifica se tem conteudo suficiente
    if (cleanText.length < 30 && headings.length === 0) {
      return NextResponse.json({
        error: 'A pagina parece estar vazia ou carrega o conteudo por JavaScript. Tente uma pagina que nao dependa de JavaScript para carregar (paginas estaticas, WordPress, landing pages do Elementor, etc.)'
      }, { status: 400 })
    }

    // 2. Envia pra Gemini analisar
    const prompt = `Voce e um dos maiores especialistas do mundo em neuromarketing, copywriting e otimizacao de conversao (CRO). Voce vai analisar uma landing page/pagina de vendas de um afiliado digital brasileiro.

IMPORTANTE: Analise TODOS os elementos abaixo com profundidade. Seja especifico nos feedbacks - cite trechos exatos da pagina. Nao seja generico.

CONTEUDO EXTRAIDO DA PAGINA (URL: ${url}):
${pageAnalysis}

INSTRUCOES DE ANALISE:
- Avalie cada categoria considerando as melhores praticas de neuromarketing
- Cite trechos especificos da pagina nos feedbacks (entre aspas)
- Seja critico mas construtivo - aponte o que esta BOM e o que precisa MELHORAR
- As melhorias devem ser acoes concretas e praticas que o afiliado pode implementar hoje
- Considere que o publico e brasileiro

Responda EXATAMENTE neste formato JSON (sem markdown, sem texto extra, APENAS o JSON puro):
{
  "score": <numero de 0 a 100>,
  "nivel": "<Excelente|Bom|Regular|Fraco|Critico>",
  "resumo": "<resumo em 2-3 frases da analise geral, citando pontos fortes e fracos>",
  "categorias": [
    {
      "nome": "Headline/Titulo Principal",
      "score": <0-100>,
      "feedback": "<analise do titulo principal: clareza, impacto emocional, especificidade. Cite o titulo encontrado.>"
    },
    {
      "nome": "Gatilhos Mentais",
      "score": <0-100>,
      "feedback": "<quais gatilhos estao presentes (urgencia, escassez, prova social, autoridade, reciprocidade, novidade, especificidade) e quais estao faltando. Cite exemplos encontrados na pagina.>"
    },
    {
      "nome": "Clareza da Oferta",
      "score": <0-100>,
      "feedback": "<esta claro O QUE a pessoa recebe, COMO funciona e QUAL o beneficio principal? O visitante entende em 5 segundos?>"
    },
    {
      "nome": "Call-to-Action (CTA)",
      "score": <0-100>,
      "feedback": "<analise dos botoes/links de acao: texto usado, posicionamento, quantidade, urgencia. Cite os CTAs encontrados.>"
    },
    {
      "nome": "Prova Social",
      "score": <0-100>,
      "feedback": "<depoimentos, numeros, logos, resultados, quantidade de clientes/usuarios mencionados. Cite os que encontrou.>"
    },
    {
      "nome": "Conexao Emocional",
      "score": <0-100>,
      "feedback": "<a pagina identifica a DOR do publico? Mostra EMPATIA? Cria DESEJO pela solucao? Usa storytelling?>"
    },
    {
      "nome": "Estrutura e Escaneabilidade",
      "score": <0-100>,
      "feedback": "<hierarquia visual, uso de subtitulos, bullets, espacamento, facilidade de leitura rapida, fluxo logico da pagina>"
    }
  ],
  "melhorias": [
    "<melhoria concreta e especifica 1 - o que mudar e como>",
    "<melhoria concreta e especifica 2>",
    "<melhoria concreta e especifica 3>",
    "<melhoria concreta e especifica 4>",
    "<melhoria concreta e especifica 5>",
    "<melhoria concreta e especifica 6>",
    "<melhoria concreta e especifica 7>"
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
            temperature: 0.4,
            maxOutputTokens: 4000,
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
        error: 'A IA retornou um formato inesperado. Tente novamente.',
        raw: responseText,
      }, { status: 500 })
    }
  } catch (err) {
    return NextResponse.json({ error: `Erro: ${err}` }, { status: 500 })
  }
}
