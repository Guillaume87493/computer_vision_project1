import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// dit haal je uit de documentatie van supabase ssr
export async function createClient() { 
  // maak een supabase client aan die werkt in server componenten — dit connect met je supabase project
  const cookieStore = await cookies()

  const client = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // geen write access in server component
          }
        },
      },
    }
  )
  return client
}

export async function getUser() {
  const { auth } = await createClient()
  const userObject = await auth.getUser()

  if (userObject.error) {
    console.error("error getting user:", userObject.error.message)
    return null
  }

  return userObject.data.user
}