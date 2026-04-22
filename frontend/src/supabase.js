// src/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error('VITE_SUPABASE_URL est manquante dans le fichier .env')
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY est manquante dans le fichier .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('✅ Supabase Client Frontend initialisé avec succès')