// Conexao com o Supabase
// createClient cria um "cliente" que permite ler/gravar dados no banco
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente publico (usado no frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Cliente admin (usado apenas no backend/API routes - tem acesso total)
export function createAdminClient() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
