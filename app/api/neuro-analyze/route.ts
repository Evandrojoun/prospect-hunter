import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

// Extrai conteudo estruturado do HTML
function extractFromHtml(html: string, url: string) {
  const metaTitle = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim() || ''
  const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([\s\S]*?)["']/i)?.[1] || ''
  const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([\s\S]*?)["']/i)?.[1] || ''
  const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([\s\S]*?)["']/i)?.[1] || ''

  const headings = [...html.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(h => h.length > 0)

  const buttons = [...html.matchAll(/<(?:button|a)[^>]*>([\s\S]*?)<\/(?:button|a)>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(b => b.length > 2 && b.length < 100)

  const paragraphs = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(p => p.length > 10)

  const imageAlts = [...html.matchAll(/<img[^>]*alt=["']([\s\S]*?)["'][^>]*>/gi)]
    .map(m => m[1].trim())
    .filter(a => a.length > 0)

  const listItems = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(l => l.length > 3)

  const spans = [...html.matchAll(/<(?:span|strong|em|b)[^>]*>([\s\S]*?)<\/(?:span|strong|em|b)>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(s => s.length > 5 && s.length < 200)

  const cleanText = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return `
=== URL ANALISADA ===
${url}

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

=== TEXTO COMPLETO DA PAGINA ===
${cleanText.slice(0, 6000)}
`.trim()
}

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
    let pageContent = ''

    // Estrategia 1: Usa Jina Reader (renderiza JavaScript, retorna texto completo)
    try {
      const jinaRes = await fetch(`https://r.jina.ai/${url}`, {
        headers: {
          'Accept': 'text/plain',
          'X-Return-Format': 'text',
        },
      })
      if (jinaRes.ok) {
        const jinaText = await jinaRes.text()
        if (jinaText.length > 100) {
          pageContent = `=== URL ANALISADA ===\n${url}\n\n=== CONTEUDO COMPLETO DA PAGINA (renderizado) ===\n${jinaText.slice(0, 12000)}`
        }
      }
    } catch {
      // Jina falhou, tenta metodo direto
    }

    // Estrategia 2: Fallback - fetch direto + extracao estruturada
    if (!pageContent) {
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
      pageContent = extractFromHtml(html, url)
    }

    if (pageContent.length < 100) {
      return NextResponse.json({
        error: 'Nao foi possivel extrair conteudo suficiente da pagina. Verifique se o link esta correto.'
      }, { status: 400 })
    }

    // Envia pra Gemini analisar
    const prompt = `Voce e um dos maiores especialistas do mundo em neuromarketing, copywriting e otimizacao de conversao (CRO). Voce vai analisar uma landing page/pagina de vendas de um afiliado digital brasileiro.

IMPORTANTE:
- Analise TODOS os elementos com profundidade maxima
- Seja ESPECIFICO nos feedbacks - cite trechos exatos da pagina entre aspas
- NAO seja generico - cada feedback deve referenciar algo concreto da pagina
- Considere principios de Cialdini, neuromarketing, PNL e copywriting

CONTEUDO DA PAGINA:
${pageContent}

INSTRUCOES:
1. Avalie cada categoria de 0 a 100
2. Cite trechos ESPECIFICOS da pagina nos feedbacks (entre aspas)
3. Seja critico mas construtivo
4. As melhorias devem ser ACOES CONCRETAS que o afiliado pode fazer HOJE
5. Considere o publico brasileiro

Responda EXATAMENTE neste formato JSON (sem markdown, sem texto extra, APENAS o JSON puro):
{
  "score": <numero de 0 a 100>,
  "nivel": "<Excelente|Bom|Regular|Fraco|Critico>",
  "resumo": "<resumo em 2-3 frases da analise geral, citando pontos fortes e fracos principais>",
  "categorias": [
    {
      "nome": "Headline/Titulo Principal",
      "score": <0-100>,
      "feedback": "<analise do titulo: clareza, impacto emocional, especificidade, promessa. Cite o titulo.>"
    },
    {
      "nome": "Gatilhos Mentais",
      "score": <0-100>,
      "feedback": "<quais dos 7 gatilhos de Cialdini estao presentes: reciprocidade, compromisso, prova social, autoridade, afinidade, escassez, urgencia. Cite exemplos da pagina.>"
    },
    {
      "nome": "Clareza da Oferta",
      "score": <0-100>,
      "feedback": "<O visitante entende em 5 segundos: O QUE e, PRA QUEM e, QUAL o beneficio? A proposta de valor e clara?>"
    },
    {
      "nome": "Call-to-Action (CTA)",
      "score": <0-100>,
      "feedback": "<texto dos botoes, posicionamento, contraste visual, urgencia no CTA. Cite os CTAs encontrados.>"
    },
    {
      "nome": "Prova Social",
      "score": <0-100>,
      "feedback": "<depoimentos, numeros, cases, logos, avaliacoes, quantidade de clientes. Cite o que encontrou.>"
    },
    {
      "nome": "Conexao Emocional",
      "score": <0-100>,
      "feedback": "<identifica a DOR? mostra EMPATIA? cria DESEJO? usa storytelling? linguagem emocional?>"
    },
    {
      "nome": "Estrutura e Escaneabilidade",
      "score": <0-100>,
      "feedback": "<hierarquia visual, subtitulos, bullets, espacamento, fluxo logico, facilidade de leitura rapida>"
    }
  ],
  "melhorias": [
    "<melhoria concreta 1 - ACAO especifica com exemplo de como implementar>",
    "<melhoria concreta 2>",
    "<melhoria concreta 3>",
    "<melhoria concreta 4>",
    "<melhoria concreta 5>",
    "<melhoria concreta 6>",
    "<melhoria concreta 7>"
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
