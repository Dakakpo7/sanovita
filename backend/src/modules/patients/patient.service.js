const { supabaseAdmin } = require('../../config/supabase');

// =============================================
// OBTENIR LE PROFIL PATIENT
// =============================================
const obtenirProfil = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('patients')
    .select(`
      id,
      date_naissance,
      groupe_sanguin,
      antecedents,
      allergies,
      created_at,
      users (
        id,
        nom,
        prenom,
        email,
        telephone,
        created_at
      )
    `)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new Error('Profil patient introuvable');
  }

  return data;
};

// =============================================
// METTRE A JOUR LE PROFIL PATIENT
// =============================================
const mettreAJourProfil = async (userId, donnees) => {
  const {
    nom,
    prenom,
    telephone,
    date_naissance,
    groupe_sanguin,
    antecedents,
    allergies
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

  // Mettre a jour la table patients
  const { error } = await supabaseAdmin
    .from('patients')
    .update({
      date_naissance,
      groupe_sanguin,
      antecedents,
      allergies
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
// HISTORIQUE MEDICAL COMPLET
// =============================================
const obtenirHistoriqueMedical = async (userId) => {

  // Recuperer l id du patient
  const { data: patient } = await supabaseAdmin
    .from('patients')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (!patient) {
    throw new Error('Patient introuvable');
  }

  // Recuperer toutes les consultations
  const { data: consultations, error } = await supabaseAdmin
    .from('rendez_vous')
    .select(`
      id,
      date_heure,
      statut,
      type,
      consultations (
        id,
        notes,
        compte_rendu,
        ordonnance_url,
        created_at,
        ordonnances (
          id,
          date_prescription,
          medicaments (
            nom,
            dosage,
            frequence,
            duree_jours,
            instructions
          )
        )
      ),
      medecins (
        specialite,
        users (
          nom,
          prenom
        )
      )
    `)
    .eq('patient_id', patient.id)
    .eq('statut', 'TERMINE')
    .order('date_heure', { ascending: false });

  if (error) {
    throw new Error('Erreur historique : ' + error.message);
  }

  return consultations;
};

module.exports = {
  obtenirProfil,
  mettreAJourProfil,
  obtenirHistoriqueMedical
};