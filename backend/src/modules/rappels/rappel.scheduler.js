const cron = require('node-cron');
const { supabaseAdmin } = require('../../config/supabase');
const { envoyerRappelMedicament } = require('../../utils/notifications');
const { envoyerSMSRappelMedicament } = require('../../utils/sms');

// =============================================
// VERIFIER ET ENVOYER LES RAPPELS
// =============================================
const verifierRappels = async () => {
  try {
    const maintenant = new Date();

    // Fenetre de 2 minutes autour de l heure actuelle
    const debut = new Date(maintenant.getTime() - 60000);
    const fin = new Date(maintenant.getTime() + 60000);

    // Recuperer les rappels planifies dans cette fenetre
    const { data: rappels, error } = await supabaseAdmin
      .from('rappels')
      .select(`
        id,
        heure_rappel,
        patient_id,
        medicaments (
          nom,
          dosage
        ),
        patients (
          id,
          user_id,
          users (
            nom,
            prenom,
            telephone,
            fcm_token
          )
        )
      `)
      .eq('statut_envoi', 'PLANIFIE')
      .gte('heure_rappel', debut.toISOString())
      .lte('heure_rappel', fin.toISOString());

    if (error) {
      console.error('Erreur recuperation rappels :', error.message);
      return;
    }

    if (!rappels || rappels.length === 0) {
      return;
    }

    console.log(`${rappels.length} rappel(s) a envoyer`);

    // Envoyer chaque rappel
    for (const rappel of rappels) {
      const nomMedicament = rappel.medicaments?.nom;
      const dosage = rappel.medicaments?.dosage;
      const userId = rappel.patients?.user_id;
      const telephone = rappel.patients?.users?.telephone;
      const nomPatient = rappel.patients?.users?.prenom;

      console.log(`Envoi rappel a ${nomPatient} : ${nomMedicament} ${dosage}`);

      // Envoyer notification push
      await envoyerRappelMedicament(userId, nomMedicament, dosage);

      // Envoyer SMS
      if (telephone) {
        await envoyerSMSRappelMedicament(telephone, nomMedicament, dosage);
      }

      // Marquer le rappel comme envoye
      await supabaseAdmin
        .from('rappels')
        .update({ statut_envoi: 'ENVOYE' })
        .eq('id', rappel.id);
    }

  } catch (erreur) {
    console.error('Erreur scheduler rappels :', erreur.message);
  }
};

// =============================================
// VERIFIER LES PRISES NON CONFIRMEES
// =============================================
const verifierPrisesNonConfirmees = async () => {
  try {
    // Rappels envoyes il y a plus de 30 minutes sans confirmation
    const il_y_a_30_min = new Date(Date.now() - 30 * 60 * 1000);

    const { data: rappelsNonConfirmes } = await supabaseAdmin
      .from('rappels')
      .select(`
        id,
        heure_rappel,
        medicaments (nom, dosage),
        patients (
          user_id,
          users (
            nom,
            prenom,
            telephone
          )
        )
      `)
      .eq('statut_envoi', 'ENVOYE')
      .lte('heure_rappel', il_y_a_30_min.toISOString());

    if (!rappelsNonConfirmes || rappelsNonConfirmes.length === 0) {
      return;
    }

    for (const rappel of rappelsNonConfirmes) {

      // Verifier si la prise a ete confirmee
      const { data: prise } = await supabaseAdmin
        .from('prises_medicaments')
        .select('id, confirme')
        .eq('rappel_id', rappel.id)
        .eq('confirme', true)
        .single();

      if (!prise) {
        // Prise non confirmee - envoyer une alerte
        const nomPatient = rappel.patients?.users?.prenom;
        const nomMedicament = rappel.medicaments?.nom;

        console.log(`ALERTE : ${nomPatient} n a pas confirme la prise de ${nomMedicament}`);

        // Ici on pourrait envoyer une alerte au medecin
        // Pour l instant on log l information
      }
    }

  } catch (erreur) {
    console.error('Erreur verification prises :', erreur.message);
  }
};

// =============================================
// DEMARRER LES CRON JOBS
// =============================================
const demarrerScheduler = () => {

  // Verifier les rappels toutes les minutes
  cron.schedule('* * * * *', () => {
    verifierRappels();
  });

  // Verifier les prises non confirmees toutes les 5 minutes
  cron.schedule('*/5 * * * *', () => {
    verifierPrisesNonConfirmees();
  });

  console.log('Scheduler de rappels demarre');
};

module.exports = { demarrerScheduler };