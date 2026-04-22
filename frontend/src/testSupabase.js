// src/testSupabase.js
import { supabase } from './supabase.js'

async function testFrontendConnection() {
  console.log("🔄 Test de connexion Supabase depuis le Frontend...")

  try {
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(3)

    if (error) {
      console.error("❌ Erreur frontend :", error.message)
    } else {
      console.log("✅ Connexion Frontend Supabase réussie !")
      console.log("Tables trouvées :", data.length)
    }
  } catch (err) {
    console.error("❌ Erreur inattendue :", err.message)
  }
}

testFrontendConnection()