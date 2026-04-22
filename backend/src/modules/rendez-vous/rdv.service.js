const { supabaseAdmin } = require('../../config/supabase');

// =============================================
// LISTER LES MEDECINS DISPONIBLES
// =============================================
const listerMedecins = async () => {
  const { data, error } = await supabaseAdmin
    .from('medecins')
    .select(`
      id,
      specialite,
      tarif,
      disponible,
      biographie,
      photo_url,
      users (
        nom,
        prenom,
        email,
        telephone
      )
    `)
    .eq('disponible', true)
    .eq('valide_par_admin', true);

  if (error) throw new Error('Erreur lors de la recuperation des medecins : ' + error.message);
  return data;
};

// =============================================
// RESERVER UN RENDEZ-VOUS
// =============================================
const reserverRdv = async (patientUserId, donnees) => {
  const { medecin_id, date_heure, type } = donnees;

  // Verifier que le patient existe
  const { data: patient, error: erreurPatient } = await supabaseAdmin
    .from('patients')
    .select('id')
    .eq('user_id', patientUserId)
    .single();

  if (erreurPatient || !patient) {
    throw new Error('Patient introuvable');
  }

  // Verifier que le medecin existe et est disponible
  const { data: medecin, error: erreurMedecin } = await supabaseAdmin
    .from('medecins')
    .select('id, disponible, tarif')
    .eq('id', medecin_id)
    .single();

  if (erreurMedecin || !medecin) {
    throw new Error('Medecin introuvable');
  }

  if (!medecin.disponible) {
    throw new Error('Ce medecin n est pas disponible');
  }

  // Verifier qu il n y a pas deja un rdv a cette heure
  const { data: rdvExistant } = await supabaseAdmin
    .from('rendez_vous')
    .select('id')
    .eq('medecin_id', medecin_id)
    .eq('date_heure', date_heure)
    .neq('statut', 'ANNULE')
    .single();

  if (rdvExistant) {
    throw new Error('Ce creneau est deja pris. Choisissez un autre horaire.');
  }

  // Creer le rendez-vous
  const { data: nouveauRdv, error: erreurRdv } = await supabaseAdmin
    .from('rendez_vous')
    .insert([{
      patient_id: patient.id,
      medecin_id: medecin_id,
      date_heure: date_heure,
      type: type || 'VIDEO',
      statut: 'EN_ATTENTE',
      paiement_statut: 'NON_PAYE'
    }])
    .select()
    .single();

  if (erreurRdv) throw new Error('Erreur lors de la reservation : ' + erreurRdv.message);
  return nouveauRdv;
};

// =============================================
// LISTER LES RDV D UN PATIENT
// =============================================
const listerRdvPatient = async (patientUserId) => {
  // Recuperer l id du patient
  const { data: patient } = await supabaseAdmin
    .from('patients')
    .select('id')
    .eq('user_id', patientUserId)
    .single();

  if (!patient) throw new Error('Patient introuvable');

  const { data, error } = await supabaseAdmin
    .from('rendez_vous')
    .select(`
      id,
      date_heure,
      statut,
      type,
      paiement_statut,
      medecins (
        specialite,
        tarif,
        users (
          nom,
          prenom
        )
      )
    `)
    .eq('patient_id', patient.id)
    .order('date_heure', { ascending: false });

  if (error) throw new Error('Erreur : ' + error.message);
  return data;
};

// =============================================
// LISTER LES RDV D UN MEDECIN
// =============================================
const listerRdvMedecin = async (medecinUserId) => {
  // Recuperer l id du medecin
  const { data: medecin } = await supabaseAdmin
    .from('medecins')
    .select('id')
    .eq('user_id', medecinUserId)
    .single();

  if (!medecin) throw new Error('Medecin introuvable');

  const { data, error } = await supabaseAdmin
    .from('rendez_vous')
    .select(`
      id,
      date_heure,
      statut,
      type,
      paiement_statut,
      patients (
        date_naissance,
        groupe_sanguin,
        users (
          nom,
          prenom,
          telephone
        )
      )
    `)
    .eq('medecin_id', medecin.id)
    .order('date_heure', { ascending: true });

  if (error) throw new Error('Erreur : ' + error.message);
  return data;
};

// =============================================
// CHANGER LE STATUT D UN RDV
// =============================================
const changerStatutRdv = async (rdvId, nouveauStatut, userId) => {
  const statutsValides = ['CONFIRME', 'ANNULE', 'TERMINE'];

  if (!statutsValides.includes(nouveauStatut)) {
    throw new Error('Statut invalide. Choisir : CONFIRME, ANNULE ou TERMINE');
  }

  const { data, error } = await supabaseAdmin
    .from('rendez_vous')
    .update({ statut: nouveauStatut })
    .eq('id', rdvId)
    .select()
    .single();

  if (error) throw new Error('Erreur lors de la mise a jour : ' + error.message);
  return data;
};

module.exports = {
  listerMedecins,
  reserverRdv,
  listerRdvPatient,
  listerRdvMedecin,
  changerStatutRdv
};