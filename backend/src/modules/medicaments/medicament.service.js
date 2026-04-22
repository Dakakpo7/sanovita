const { supabaseAdmin } = require('../../config/supabase');

// =============================================
// PRESCRIRE DES MEDICAMENTS (MEDECIN)
// =============================================
const prescrireMedicaments = async (consultationId, medicaments, medecinUserId) => {

  // Verifier que la consultation existe
  const { data: consultation, error: erreurConsultation } = await supabaseAdmin
    .from('consultations')
    .select('id, rdv_id')
    .eq('id', consultationId)
    .single();

  if (erreurConsultation || !consultation) {
    throw new Error('Consultation introuvable');
  }

  // Recuperer le rendez-vous pour avoir le patient
  const { data: rdv } = await supabaseAdmin
    .from('rendez_vous')
    .select('patient_id, medecin_id')
    .eq('id', consultation.rdv_id)
    .single();

  if (!rdv) {
    throw new Error('Rendez-vous introuvable');
  }

  // Recuperer le medecin
  const { data: medecin } = await supabaseAdmin
    .from('medecins')
    .select('id')
    .eq('user_id', medecinUserId)
    .single();

  if (!medecin) {
    throw new Error('Medecin introuvable');
  }

  // Creer l ordonnance
  const { data: ordonnance, error: erreurOrdonnance } = await supabaseAdmin
    .from('ordonnances')
    .insert([{
      consultation_id: consultationId,
      patient_id: rdv.patient_id,
      medecin_id: medecin.id
    }])
    .select()
    .single();

  if (erreurOrdonnance) {
    throw new Error('Erreur lors de la creation de l ordonnance');
  }

  // Ajouter chaque medicament
  const medicamentsInseres = [];

  for (const med of medicaments) {
    const { data: medicament, error: erreurMed } = await supabaseAdmin
      .from('medicaments')
      .insert([{
        ordonnance_id: ordonnance.id,
        nom: med.nom,
        dosage: med.dosage,
        frequence: med.frequence,
        duree_jours: med.duree_jours,
        instructions: med.instructions || ''
      }])
      .select()
      .single();

    if (erreurMed) {
      throw new Error('Erreur lors de l ajout du medicament : ' + med.nom);
    }

    medicamentsInseres.push(medicament);

    // Generer les rappels pour ce medicament
    await genererRappels(medicament, rdv.patient_id);
  }

  return {
    ordonnance,
    medicaments: medicamentsInseres
  };
};

// =============================================
// GENERER LES RAPPELS AUTOMATIQUEMENT
// =============================================
const genererRappels = async (medicament, patientId) => {

  // medicament.frequence est un tableau d heures
  // Exemple : ["08:00", "14:00", "20:00"]
  const heures = medicament.frequence;
  const rappelsAInserer = [];

  // Pour chaque jour de traitement
  for (let jour = 0; jour < medicament.duree_jours; jour++) {

    // Pour chaque heure de prise dans la journee
    for (const heure of heures) {

      // Calculer la date et heure du rappel
      const dateRappel = new Date();
      dateRappel.setDate(dateRappel.getDate() + jour);

      // Extraire heures et minutes
      const [heuresStr, minutesStr] = heure.split(':');
      dateRappel.setHours(parseInt(heuresStr));
      dateRappel.setMinutes(parseInt(minutesStr));
      dateRappel.setSeconds(0);

      rappelsAInserer.push({
        medicament_id: medicament.id,
        patient_id: patientId,
        heure_rappel: dateRappel.toISOString(),
        statut_envoi: 'PLANIFIE'
      });
    }
  }

  // Inserer tous les rappels en une seule fois
  const { error } = await supabaseAdmin
    .from('rappels')
    .insert(rappelsAInserer);

  if (error) {
    throw new Error('Erreur lors de la generation des rappels : ' + error.message);
  }

  return rappelsAInserer.length;
};

// =============================================
// CONFIRMER UNE PRISE DE MEDICAMENT (PATIENT)
// =============================================
const confirmerPrise = async (rappelId, patientUserId) => {

  // Verifier que le rappel existe
  const { data: rappel, error: erreurRappel } = await supabaseAdmin
    .from('rappels')
    .select('id, patient_id, medicament_id')
    .eq('id', rappelId)
    .single();

  if (erreurRappel || !rappel) {
    throw new Error('Rappel introuvable');
  }

  // Verifier que ce rappel appartient bien au patient connecte
  const { data: patient } = await supabaseAdmin
    .from('patients')
    .select('id')
    .eq('user_id', patientUserId)
    .single();

  if (!patient || rappel.patient_id !== patient.id) {
    throw new Error('Vous n etes pas autorise a confirmer ce rappel');
  }

  // Enregistrer la prise
  const { data: prise, error: erreurPrise } = await supabaseAdmin
    .from('prises_medicaments')
    .insert([{
      rappel_id: rappelId,
      confirme: true,
      heure_confirmation: new Date().toISOString()
    }])
    .select()
    .single();

  if (erreurPrise) {
    throw new Error('Erreur lors de la confirmation : ' + erreurPrise.message);
  }

  // Mettre a jour le statut du rappel
  await supabaseAdmin
    .from('rappels')
    .update({ statut_envoi: 'ENVOYE' })
    .eq('id', rappelId);

  return prise;
};

// =============================================
// CALCULER LE TAUX D OBSERVANCE (MEDECIN)
// =============================================
const calculerObservance = async (patientId) => {

  // Recuperer tous les rappels du patient
  const { data: rappels, error: erreurRappels } = await supabaseAdmin
    .from('rappels')
    .select('id, heure_rappel, statut_envoi')
    .eq('patient_id', patientId)
    .lt('heure_rappel', new Date().toISOString());

  if (erreurRappels) {
    throw new Error('Erreur lors du calcul de l observance');
  }

  if (!rappels || rappels.length === 0) {
    return {
      taux: 0,
      total_rappels: 0,
      prises_confirmees: 0
    };
  }

  // Compter les prises confirmees
  const { data: prises } = await supabaseAdmin
    .from('prises_medicaments')
    .select('rappel_id')
    .in('rappel_id', rappels.map(r => r.id))
    .eq('confirme', true);

  const totalRappels = rappels.length;
  const prisesConfirmees = prises ? prises.length : 0;
  const taux = Math.round((prisesConfirmees / totalRappels) * 100);

  return {
    taux,
    total_rappels: totalRappels,
    prises_confirmees: prisesConfirmees
  };
};

// =============================================
// LISTER LES RAPPELS DU JOUR (PATIENT)
// =============================================
const obtenirRappelsDuJour = async (patientUserId) => {

  // Recuperer le patient
  const { data: patient } = await supabaseAdmin
    .from('patients')
    .select('id')
    .eq('user_id', patientUserId)
    .single();

  if (!patient) {
    throw new Error('Patient introuvable');
  }

  // Definir le debut et la fin du jour
  const debutJour = new Date();
  debutJour.setHours(0, 0, 0, 0);

  const finJour = new Date();
  finJour.setHours(23, 59, 59, 999);

  // Recuperer les rappels du jour
  const { data: rappels, error } = await supabaseAdmin
    .from('rappels')
    .select(`
      id,
      heure_rappel,
      statut_envoi,
      medicaments (
        nom,
        dosage,
        instructions
      ),
      prises_medicaments (
        confirme,
        heure_confirmation
      )
    `)
    .eq('patient_id', patient.id)
    .gte('heure_rappel', debutJour.toISOString())
    .lte('heure_rappel', finJour.toISOString())
    .order('heure_rappel', { ascending: true });

  if (error) {
    throw new Error('Erreur lors de la recuperation des rappels');
  }

  return rappels;
};

module.exports = {
  prescrireMedicaments,
  confirmerPrise,
  calculerObservance,
  obtenirRappelsDuJour
};