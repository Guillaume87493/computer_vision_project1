'use server'

import { createClient } from "@/supabase/server"
import { prisma } from "../../prisma/prisma"

// LOGIN
export const loginAction = async (email: string, password: string) => {
  try {
    const { auth } = await createClient()
    const { error } = await auth.signInWithPassword({ email, password })

    if (error) {
      throw error
    }

    return { errorMessage: null }
  } catch (error) {
    return console.log(error)
  }
}

// SIGN UP
export const signUpAction = async (email: string, password: string , naam: string) => {
  try {
    const { auth } = await createClient()
    const { data, error } = await auth.signUp({ email, password })

    if (error) {
      throw error
    }

    const userId = data.user?.id
    if (!userId) {
      throw new Error("No user id returned after sign up")
    }

    // Add user to local database
    await prisma.user.create({
      data: {
        id: userId,
        email: email,
        name: naam
      },
    })

    return { errorMessage: null }
  } catch (error) {
    return console.log(error)
  }
}

// LOGOUT
export const logoutAction = async () => {
  try {
    const { auth } = await createClient()
    const { error } = await auth.signOut()

    if (error) {
      throw error
    }
  } catch (error) {
    return console.log(error)
  }
}


export async function searchUsersByLetter(query: string) {
  if (!query) return []
  
  return await prisma.user.findMany({
    where: {
      OR: [
        { name: { startsWith: query, mode: 'insensitive' } },
        { email: { startsWith: query, mode: 'insensitive' } }
      ]
    },
    take: 5 // Beperk resultaten voor de HUD
  })
}
