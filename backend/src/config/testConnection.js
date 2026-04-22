// src/config/testConnection.js
import { supabase } from './supabase.js';

console.log("🔄 Test minimal - Vérification client uniquement...");

async function test() {
  try {
    // On ne fait aucune requête sur une table → juste tester que le client répond
    const { data, error } = await supabase.auth.getSession();

    console.log("✅ Client Supabase fonctionne correctement !");
    console.log("Session :", data.session ? "présente" : "aucune (normal en test serveur)");
    
    if (error) console.log("Info erreur :", error.message);
  } catch (err) {
    console.error("❌ Erreur :", err.message);
  }
}

test();
