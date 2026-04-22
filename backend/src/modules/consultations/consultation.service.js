const { supabaseAdmin } = require('../../config/supabase');

// =============================================
// DEMARRER UNE CONSULTATION
// =============================================
const demarrerConsultation = async (rdvId, medecinUserId) => {

  // Verifier que le rendez-vous existe et est confirme
  const { data: rdv, error: erreurRdv } = await supabaseAdmin
    .from('rendez_vous')
    .select('id, statut, patient_id, medecin_id')
    .eq('id', rdvId)
    .single();

  if (erreurRdv || !rdv) {
    throw new Error('Rendez-vous introuvable');
  }

  if (rdv.statut === 'ANNULE') {
    throw new Error('Ce rendez-vous a ete annule');
  }

  if (rdv.statut === 'TERMINE') {
    throw new Error('Ce rendez-vous est deja termine');
  }

  // Verifier qu il n y a pas deja une consultation pour ce rdv
  const { data: consultationExistante } = await supabaseAdmin
    .from('consultations')
    .select('id')
    .eq('rdv_id', rdvId)
    .single();

  if (consultationExistante) {
    throw new Error('Une consultation existe deja pour ce rendez-vous');
  }

  // Creer la consultation
  const { data: consultation, error } = await supabaseAdmin
    .from('consultations')
    .insert([{
      rdv_id: rdvId,
      notes: '',
      compte_rendu: ''
    }])
    .select()
    .single();

  if (error) {
    throw new Error('Erreur lors de la creation de la consultation : ' + error.message);
  }

  // Mettre a jour le statut du rdv
  await supabaseAdmin
    .from('rendez_vous')
    .update({ statut: 'CONFIRME' })
    .eq('id', rdvId);

  return consultation;
};

// =============================================
// TERMINER UNE CONSULTATION
// =============================================
const terminerConsultation = async (consultationId, donnees) => {
  const { notes, compte_rendu } = donnees;

  // Mettre a jour la consultation avec les notes
  const { data: consultation, error } = await supabaseAdmin
    .from('consultations')
    .update({
      notes: notes || '',
      compte_rendu: compte_rendu || ''
    })
    .eq('id', consultationId)
    .select()
    .single();

  if (error) {
    throw new Error('Erreur lors de la mise a jour : ' + error.message);
  }

  // Marquer le rendez-vous comme termine
  await supabaseAdmin
    .from('rendez_vous')
    .update({ statut: 'TERMINE' })
    .eq('id', consultation.rdv_id);

  return consultation;
};

// =============================================
// OBTENIR UNE CONSULTATION
// =============================================
const obtenirConsultation = async (consultationId) => {
  const { data: consultation, error } = await supabaseAdmin
    .from('consultations')
    .select(`
      id,
      notes,
      compte_rendu,
      ordonnance_url,
      created_at,
      rendez_vous (
        id,
        date_heure,
        type,
        patients (
          id,
          groupe_sanguin,
          antecedents,
          users (
            nom,
            prenom,
            email,
            telephone
          )
        ),
        medecins (
          id,
          specialite,
          users (
            nom,
            prenom
          )
        )
      )
    `)
    .eq('id', consultationId)
    .single();

  if (error || !consultation) {
    throw new Error('Consultation introuvable');
  }

  return consultation;
};

// =============================================
// LISTER LES CONSULTATIONS D UN PATIENT
// =============================================
const listerConsultationsPatient = async (patientUserId) => {

  // Recuperer l id du patient
  const { data: patient } = await supabaseAdmin
    .from('patients')
    .select('id')
    .eq('user_id', patientUserId)
    .single();

  if (!patient) {
    throw new Error('Patient introuvable');
  }

  const { data, error } = await supabaseAdmin
    .from('consultations')
    .select(`
      id,
      notes,
      compte_rendu,
      ordonnance_url,
      created_at,
      rendez_vous (
        date_heure,
        type,
        medecins (
          specialite,
          users (
            nom,
            prenom
          )
        )
      )
    `)
    .eq('rendez_vous.patient_id', patient.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Erreur lors de la recuperation : ' + error.message);
  }

  return data;
};

// =============================================
// SAUVEGARDER L URL DE L ORDONNANCE
// =============================================
const sauvegarderOrdonnance = async (consultationId, ordonnanceUrl) => {
  const { data, error } = await supabaseAdmin
    .from('consultations')
    .update({ ordonnance_url: ordonnanceUrl })
    .eq('id', consultationId)
    .select()
    .single();

  if (error) {
    throw new Error('Erreur lors de la sauvegarde de l ordonnance : ' + error.message);
  }

  return data;
};

module.exports = {
  demarrerConsultation,
  terminerConsultation,
  obtenirConsultation,
  listerConsultationsPatient,
  sauvegarderOrdonnance
};