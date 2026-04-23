const { supabaseAdmin } = require('../../config/supabase');

// =============================================
// OBTENIR LE PROFIL MEDECIN
// =============================================
const obtenirProfil = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('medecins')
    .select(`
      id,
      specialite,
      numero_ordre,
      tarif,
      disponible,
      photo_url,
      biographie,
      valide_par_admin,
      created_at,
      users (
        id,
        nom,
        prenom,
        email,
        telephone
      )
    `)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new Error('Profil medecin introuvable');
  }

  return data;
};

// =============================================
// METTRE A JOUR LE PROFIL MEDECIN
// =============================================
const mettreAJourProfil = async (userId, donnees) => {
  const {
    nom,
    prenom,
    telephone,
    specialite,
    tarif,
    biographie,
    disponible
  } = donnees;

  // Mettre a jour la table users
  if (nom || prenom || telephone) {
    const { error: erreurUser } = await supabaseAdmin
      .from('users')
      .update({
        nom,
        prenom,
        telephone,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (erreurUser) {
      throw new Error('Erreur mise a jour utilisateur : ' + erreurUser.message);
    }
  }

  // Mettre a jour la table medecins
  const { error } = await supabaseAdmin
    .from('medecins')
    .update({
      specialite,
      tarif,
      biographie,
      disponible
    })
    .eq('user_id', userId);

  if (error) {
    throw new Error('Erreur mise a jour profil : ' + error.message);
  }

  // Recuperer le profil mis a jour
  const profilMisAJour = await obtenirProfil(userId);
  return profilMisAJour;
};

// =============================================
// OBTENIR LES STATISTIQUES DU MEDECIN
// =============================================
const obtenirStatistiques = async (userId) => {

  // Recuperer l id du medecin
  const { data: medecin } = await supabaseAdmin
    .from('medecins')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!medecin) {
    throw new Error('Medecin introuvable');
  }

  // Compter les rendez-vous
  const [rdvsTotal, rdvsTermines, rdvsEnAttente, consultations] = await Promise.all([
    supabaseAdmin
      .from('rendez_vous')
      .select('id', { count: 'exact' })
      .eq('medecin_id', medecin.id),
    supabaseAdmin
      .from('rendez_vous')
      .select('id', { count: 'exact' })
      .eq('medecin_id', medecin.id)
      .eq('statut', 'TERMINE'),
    supabaseAdmin
      .from('rendez_vous')
      .select('id', { count: 'exact' })
      .eq('medecin_id', medecin.id)
      .eq('statut', 'EN_ATTENTE'),
    supabaseAdmin
      .from('consultations')
      .select('id', { count: 'exact' })
  ]);

  return {
    total_rdvs: rdvsTotal.count || 0,
    rdvs_termines: rdvsTermines.count || 0,
    rdvs_en_attente: rdvsEnAttente.count || 0,
    total_consultations: consultations.count || 0
  };
};

module.exports = {
  obtenirProfil,
  mettreAJourProfil,
  obtenirStatistiques
};