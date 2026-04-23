const { supabaseAdmin } = require('../../config/supabase');

// Lister tous les medecins
const listerMedecins = async () => {
  const { data, error } = await supabaseAdmin
    .from('medecins')
    .select(`
      id,
      specialite,
      tarif,
      disponible,
      valide_par_admin,
      users (
        nom,
        prenom,
        email,
        telephone
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error('Erreur : ' + error.message);
  return data;
};

// Valider un medecin
const validerMedecin = async (medecinId) => {
  const { data, error } = await supabaseAdmin
    .from('medecins')
    .update({ valide_par_admin: true, disponible: true })
    .eq('id', medecinId)
    .select()
    .single();

  if (error) throw new Error('Erreur : ' + error.message);
  return data;
};

// Suspendre un medecin
const suspendreMedecin = async (medecinId) => {
  const { data, error } = await supabaseAdmin
    .from('medecins')
    .update({ valide_par_admin: false, disponible: false })
    .eq('id', medecinId)
    .select()
    .single();

  if (error) throw new Error('Erreur : ' + error.message);
  return data;
};

// Statistiques globales
const obtenirStats = async () => {
  const [patients, medecins, rdvs, consultations] = await Promise.all([
    supabaseAdmin.from('patients').select('id', { count: 'exact' }),
    supabaseAdmin.from('medecins').select('id', { count: 'exact' }),
    supabaseAdmin.from('rendez_vous').select('id', { count: 'exact' }),
    supabaseAdmin.from('consultations').select('id', { count: 'exact' })
  ]);

  return {
    totalPatients: patients.count || 0,
    totalMedecins: medecins.count || 0,
    totalRdvs: rdvs.count || 0,
    totalConsultations: consultations.count || 0
  };
};

module.exports = { listerMedecins, validerMedecin, suspendreMedecin, obtenirStats };