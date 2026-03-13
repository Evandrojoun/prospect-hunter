import { NextResponse } from 'next/server'
import { getPages, getLeadForms, getLeadsFromForm } from '@/lib/meta-api'
import { createAdminClient } from '@/lib/supabase'

// POST /api/meta/sync — sincroniza leads do Meta (Lead Ads) para o Supabase
export async function POST() {
  try {
    const supabase = createAdminClient()

    // 1. Buscar páginas conectadas
    const pages = await getPages()

    if (pages.length === 0) {
      return NextResponse.json({
        message: 'Nenhuma página encontrada. Verifique as permissões do token.',
        synced: 0,
      })
    }

    let totalSynced = 0
    const errors: string[] = []

    // 2. Para cada página, buscar formulários de leads
    for (const page of pages) {
      try {
        const forms = await getLeadForms(page.id)

        // 3. Para cada formulário, buscar leads
        for (const form of forms) {
          try {
            const leads = await getLeadsFromForm(form.id)

            for (const lead of leads) {
              // Extrair campos do lead
              const fields: Record<string, string> = {}
              lead.field_data?.forEach((f) => {
                fields[f.name.toLowerCase()] = f.values?.[0] || ''
              })

              const name =
                fields['full_name'] ||
                fields['nome'] ||
                fields['name'] ||
                fields['nome_completo'] ||
                ''
              const email = fields['email'] || ''
              const phone =
                fields['phone_number'] ||
                fields['telefone'] ||
                fields['phone'] ||
                fields['celular'] ||
                ''

              // Verificar se lead já existe (por meta_lead_id)
              const { data: existing } = await supabase
                .from('leads')
                .select('id')
                .eq('meta_lead_id', lead.id)
                .single()

              if (!existing) {
                const { error: insertError } = await supabase.from('leads').insert({
                  name: name || 'Lead Meta',
                  email: email || null,
                  phone: phone || null,
                  source: `meta_${form.name}`,
                  status: 'novo',
                  meta_lead_id: lead.id,
                  notes: `Importado do Meta - Página: ${page.name}, Formulário: ${form.name}`,
                  created_at: lead.created_time,
                })

                if (!insertError) {
                  totalSynced++
                }
              }
            }
          } catch (formError) {
            errors.push(`Formulário ${form.name}: ${formError instanceof Error ? formError.message : 'erro'}`)
          }
        }
      } catch (pageError) {
        errors.push(`Página ${page.name}: ${pageError instanceof Error ? pageError.message : 'erro'}`)
      }
    }

    return NextResponse.json({
      message: `Sincronização concluída! ${totalSynced} novos leads importados.`,
      synced: totalSynced,
      pages: pages.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro na sincronização'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
