// Middleware - roda ANTES de cada pagina
// Redireciona pra login se nao estiver logado
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Verifica se o usuario esta logado
  const { data: { user } } = await supabase.auth.getUser()

  // Paginas publicas (nao precisa estar logado)
  const publicPaths = ['/login', '/registro', '/api/']
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (!user && !isPublicPath) {
    // Nao esta logado e tentou acessar pagina protegida -> vai pro login
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/registro')) {
    // Ja esta logado e tentou acessar login -> vai pro dashboard
    const dashboardUrl = new URL('/', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return supabaseResponse
}

// Aplica o middleware em todas as rotas exceto arquivos estaticos
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
