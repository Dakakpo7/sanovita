import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

function MedecinDashboard() {
  const { utilisateur, deconnecter } = useAuthStore();
  const [rdvs, setRdvs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [ongletActif, setOngletActif] = useState('rdvs');
  const [rdvSelectionne, setRdvSelectionne] = useState(null);
  const [consultationEnCours, setConsultationEnCours] = useState(null);
  const [observance, setObservance] = useState(null);
  const [patientObservance, setPatientObservance] = useState(null);

  // Formulaire de consultation
  const [notes, setNotes] = useState('');
  const [compteRendu, setCompteRendu] = useState('');

  // Formulaire de prescription
  const [medicaments, setMedicaments] = useState([{
    nom: '',
    dosage: '',
    frequence: ['08:00'],
    duree_jours: 7,
    instructions: ''
  }]);

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      const reponse = await api.get('/rdv/mes-consultations');
      setRdvs(reponse.data.rdvs);
    } catch (erreur) {
      toast.error('Erreur lors du chargement');
    } finally {
      setChargement(false);
    }
  };

  // Confirmer un RDV
  const confirmerRdv = async (id) => {
    try {
      await api.put(`/rdv/${id}/confirmer`);
      toast.success('Rendez-vous confirme !');
      chargerDonnees();
    } catch (erreur) {
      toast.error('Erreur lors de la confirmation');
    }
  };

  // Annuler un RDV
  const annulerRdv = async (id) => {
    try {
      await api.put(`/rdv/${id}/annuler`);
      toast.success('Rendez-vous annule');
      chargerDonnees();
    } catch (erreur) {
      toast.error('Erreur lors de l annulation');
    }
  };

  // Demarrer une consultation
  const demarrerConsultation = async (rdv) => {
    try {
      const reponse = await api.post('/consultations/demarrer', {
        rdv_id: rdv.id
      });
      setConsultationEnCours(reponse.data.consultation);
      setRdvSelectionne(rdv);
      toast.success('Consultation demarree !');
    } catch (erreur) {
      toast.error(erreur.response?.data?.message || 'Erreur lors du demarrage');
    }
  };

  // Terminer une consultation
  const terminerConsultation = async () => {
    try {
      await api.put(`/consultations/${consultationEnCours.id}/terminer`, {
        notes,
        compte_rendu: compteRendu
      });
      toast.success('Consultation terminee !');

      // Reinitialiser tous les etats
      setConsultationEnCours(null);
      setRdvSelectionne(null);
      setNotes('');
      setCompteRendu('');
      setMedicaments([{
        nom: '',
        dosage: '',
        frequence: ['08:00'],
        duree_jours: 7,
        instructions: ''
      }]);

      // Recharger les donnees
      await chargerDonnees();

    } catch (erreur) {
      toast.error('Erreur lors de la cloture');
    }
  };

  // Prescrire les medicaments
  const prescrire = async (e) => {
    e.preventDefault();
    try {
      await api.post('/medicaments/prescrire', {
        consultation_id: consultationEnCours.id,
        medicaments
      });
      toast.success('Medicaments prescrits ! Rappels generes automatiquement.');

      // Terminer la consultation apres prescription
      await terminerConsultation();

      // Reinitialiser
      setConsultationEnCours(null);
      setRdvSelectionne(null);
      setNotes('');
      setCompteRendu('');
      setMedicaments([{
        nom: '',
        dosage: '',
        frequence: ['08:00'],
        duree_jours: 7,
        instructions: ''
      }]);

      chargerDonnees();
    } catch (erreur) {
      toast.error(erreur.response?.data?.message || 'Erreur lors de la prescription');
    }
  };

  // Ajouter un medicament
  const ajouterMedicament = () => {
    setMedicaments([...medicaments, {
      nom: '',
      dosage: '',
      frequence: ['08:00'],
      duree_jours: 7,
      instructions: ''
    }]);
  };

  // Supprimer un medicament
  const supprimerMedicament = (index) => {
    setMedicaments(medicaments.filter((_, i) => i !== index));
  };

  // Mettre a jour un medicament
  const mettreAJourMedicament = (index, champ, valeur) => {
    const nouveauxMeds = [...medicaments];
    nouveauxMeds[index][champ] = valeur;
    setMedicaments(nouveauxMeds);
  };

  // Calculer l observance d un patient
  const calculerObservance = async (patient) => {
    try {
      const reponse = await api.get(`/medicaments/observance/${patient.id}`);
      setObservance(reponse.data);
      setPatientObservance(patient);
      setOngletActif('observance');
    } catch (erreur) {
      toast.error('Erreur lors du calcul');
    }
  };

  const formaterDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const couleurStatut = (statut) => {
    switch (statut) {
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-700';
      case 'CONFIRME': return 'bg-green-100 text-green-700';
      case 'ANNULE': return 'bg-red-100 text-red-700';
      case 'TERMINE': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const rdvsEnAttente = rdvs.filter(r => r.statut === 'EN_ATTENTE').length;
  const rdvsConfirmes = rdvs.filter(r => r.statut === 'CONFIRME').length;
  const rdvsTermines = rdvs.filter(r => r.statut === 'TERMINE').length;

  // Patients uniques
  const patients = rdvs
    .filter(r => r.statut === 'TERMINE')
    .reduce((acc, rdv) => {
      const patientId = rdv.patients?.id;
      if (patientId && !acc.find(p => p.id === patientId)) {
        acc.push({
          id: patientId,
          nom: rdv.patients?.users?.nom,
          prenom: rdv.patients?.users?.prenom,
          telephone: rdv.patients?.users?.telephone,
          groupe_sanguin: rdv.patients?.groupe_sanguin
        });
      }
      return acc;
    }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          <span className="text-xl font-bold text-blue-600">SanoVita</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 font-medium">
            Dr {utilisateur?.nom} {utilisateur?.prenom}
          </span>
          <Link to="/medecin/profil"
  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
  Mon profil
</Link>
          <button onClick={deconnecter}
            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition">
            Deconnexion
          </button>
        </div>
      </nav>

      {/* MODAL CONSULTATION EN COURS */}
      {consultationEnCours && rdvSelectionne && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-screen overflow-y-auto">

            {/* HEADER MODAL */}
            <div className="bg-blue-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">
                    🎥 Consultation en cours
                  </h2>
                  <p className="text-blue-200 mt-1">
                    Patient : {rdvSelectionne.patients?.users?.nom} {rdvSelectionne.patients?.users?.prenom}
                  </p>
                  <p className="text-blue-200 text-sm">
                    {formaterDate(rdvSelectionne.date_heure)}
                  </p>
                </div>
                <div className="bg-green-400 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
                  En direct
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">

              {/* INFOS PATIENT */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-bold text-gray-800 mb-3">👤 Informations patient</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Nom :</span>
                    <span className="font-medium ml-2">
                      {rdvSelectionne.patients?.users?.nom} {rdvSelectionne.patients?.users?.prenom}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Telephone :</span>
                    <span className="font-medium ml-2">
                      {rdvSelectionne.patients?.users?.telephone}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Groupe sanguin :</span>
                    <span className="font-medium ml-2">
                      {rdvSelectionne.patients?.groupe_sanguin || 'Non renseigne'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Antecedents :</span>
                    <span className="font-medium ml-2">
                      {rdvSelectionne.patients?.antecedents || 'Aucun'}
                    </span>
                  </div>
                </div>
              </div>

              {/* NOTES ET COMPTE RENDU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes de consultation
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Patient presente une fievre legere. Tension arterielle normale..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Compte rendu medical
                </label>
                <textarea
                  value={compteRendu}
                  onChange={(e) => setCompteRendu(e.target.value)}
                  placeholder="Ex: Consultation effectuee. Patient en bonne sante generale..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* PRESCRIPTION */}
              <div>
                <h3 className="font-bold text-gray-800 mb-4">
                  💊 Ordonnance numerique
                </h3>

                <form onSubmit={prescrire} className="space-y-4">
                  {medicaments.map((med, index) => (
                    <div key={index}
                      className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-gray-700">
                          Medicament {index + 1}
                        </span>
                        {medicaments.length > 1 && (
                          <button type="button"
                            onClick={() => supprimerMedicament(index)}
                            className="text-red-500 text-sm hover:underline">
                            Supprimer
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Nom du medicament
                          </label>
                          <input
                            type="text"
                            value={med.nom}
                            onChange={(e) => mettreAJourMedicament(index, 'nom', e.target.value)}
                            placeholder="Paracetamol"
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Dosage
                          </label>
                          <input
                            type="text"
                            value={med.dosage}
                            onChange={(e) => mettreAJourMedicament(index, 'dosage', e.target.value)}
                            placeholder="500mg"
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Heures de prise (separees par virgule)
                          </label>
                          <input
                            type="text"
                            value={med.frequence.join(', ')}
                            onChange={(e) => {
                              const heures = e.target.value.split(',').map(h => h.trim());
                              mettreAJourMedicament(index, 'frequence', heures);
                            }}
                            placeholder="08:00, 14:00, 20:00"
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Duree (jours)
                          </label>
                          <input
                            type="number"
                            value={med.duree_jours}
                            onChange={(e) => mettreAJourMedicament(index, 'duree_jours', parseInt(e.target.value))}
                            min="1"
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs text-gray-500 mb-1">
                            Instructions
                          </label>
                          <input
                            type="text"
                            value={med.instructions}
                            onChange={(e) => mettreAJourMedicament(index, 'instructions', e.target.value)}
                            placeholder="Prendre avec un grand verre d eau"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button type="button"
                    onClick={ajouterMedicament}
                    className="w-full border-2 border-dashed border-gray-300 text-gray-500 py-2 rounded-xl hover:border-blue-400 hover:text-blue-500 transition text-sm">
                    + Ajouter un medicament
                  </button>

                  <div className="flex gap-3 pt-4">
                    <button type="submit"
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition">
                      ✅ Valider et terminer la consultation
                    </button>
                    <button
                      type="button"
                      onClick={terminerConsultation}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition">
                      Terminer sans prescription
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Bonjour Dr {utilisateur?.nom} 👋
        </h1>
        <p className="text-gray-500 mb-8">
          Voici un apercu de votre activite
        </p>

        {/* STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-yellow-400">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">En attente</p>
                <p className="text-3xl font-bold text-yellow-600">{rdvsEnAttente}</p>
              </div>
              <div className="text-4xl">⏳</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-400">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Confirmes</p>
                <p className="text-3xl font-bold text-green-600">{rdvsConfirmes}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-400">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Termines</p>
                <p className="text-3xl font-bold text-blue-600">{rdvsTermines}</p>
              </div>
              <div className="text-4xl">🏁</div>
            </div>
          </div>
        </div>

        {/* ONGLETS */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <button onClick={() => setOngletActif('rdvs')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              ongletActif === 'rdvs' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}>
            📅 Rendez-vous
          </button>
          <button onClick={() => setOngletActif('observance')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              ongletActif === 'observance' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}>
            📊 Observance
          </button>
          <button onClick={() => setOngletActif('patients')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              ongletActif === 'patients' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}>
            👥 Mes patients
          </button>
        </div>

        {/* ONGLET RENDEZ-VOUS */}
        {ongletActif === 'rdvs' && (
          <div className="space-y-4">
            {chargement && (
              <div className="text-center py-10">
                <p className="text-gray-500">Chargement...</p>
              </div>
            )}
            {!chargement && rdvs.length === 0 && (
              <div className="bg-white rounded-xl p-10 text-center shadow-sm">
                <div className="text-5xl mb-4">📅</div>
                <p className="text-gray-500">Aucun rendez-vous pour le moment.</p>
              </div>
            )}
            {rdvs.map((rdv) => (
              <div key={rdv.id}
                className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      👤 {rdv.patients?.users?.nom} {rdv.patients?.users?.prenom}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      📞 {rdv.patients?.users?.telephone}
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      🕐 {formaterDate(rdv.date_heure)}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {rdv.type === 'VIDEO' ? '🎥 Video' : '💬 Chat'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${couleurStatut(rdv.statut)}`}>
                      {rdv.statut}
                    </span>
                    {rdv.statut === 'EN_ATTENTE' && (
                      <div className="flex gap-2">
                        <button onClick={() => confirmerRdv(rdv.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition">
                          Confirmer
                        </button>
                        <button onClick={() => annulerRdv(rdv.id)}
                          className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-sm hover:bg-red-200 transition">
                          Annuler
                        </button>
                      </div>
                    )}
                    {rdv.statut === 'CONFIRME' && (
                      <button onClick={() => demarrerConsultation(rdv)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition animate-pulse">
                        🎥 Demarrer la consultation
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ONGLET OBSERVANCE */}
        {ongletActif === 'observance' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              📊 Observance des patients
            </h2>

            {!observance && (
              <div className="text-center py-10">
                <div className="text-5xl mb-4">📊</div>
                <p className="text-gray-500 mb-4">
                  Selectionnez un patient dans l onglet
                  <strong> Mes patients </strong>
                  pour voir son taux d observance.
                </p>
                <button onClick={() => setOngletActif('patients')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                  Voir mes patients
                </button>
              </div>
            )}

            {observance && patientObservance && (
              <div className="space-y-6">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="font-bold text-gray-800">
                    👤 {patientObservance.nom} {patientObservance.prenom}
                  </p>
                </div>

                {/* JAUGE */}
                <div className="text-center">
                  <div className={`text-7xl font-bold mb-2 ${
                    parseInt(observance.taux) >= 80 ? 'text-green-600'
                    : parseInt(observance.taux) >= 50 ? 'text-yellow-600'
                    : 'text-red-600'
                  }`}>
                    {observance.taux}
                  </div>
                  <p className="text-gray-500 mb-4">Taux d observance</p>

                  <div className="w-full bg-gray-200 rounded-full h-6 mb-6">
                    <div
                      className={`h-6 rounded-full transition-all ${
                        parseInt(observance.taux) >= 80 ? 'bg-green-500'
                        : parseInt(observance.taux) >= 50 ? 'bg-yellow-500'
                        : 'bg-red-500'
                      }`}
                      style={{ width: observance.taux }}>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-gray-800">
                      {observance.total_rappels}
                    </p>
                    <p className="text-gray-500 text-sm">Total rappels</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">
                      {observance.prises_confirmees}
                    </p>
                    <p className="text-gray-500 text-sm">Prises confirmees</p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl text-sm font-medium ${
                  parseInt(observance.taux) >= 80
                    ? 'bg-green-50 text-green-700'
                    : parseInt(observance.taux) >= 50
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  {parseInt(observance.taux) >= 80
                    ? '✅ Excellent ! Le patient suit parfaitement son traitement.'
                    : parseInt(observance.taux) >= 50
                    ? '⚠️ Attention ! Le patient oublie certaines prises. Un rappel serait utile.'
                    : '🚨 Alerte ! Le patient ne suit pas son traitement. Contactez-le rapidement.'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ONGLET PATIENTS */}
        {ongletActif === 'patients' && (
          <div className="space-y-4">
            {patients.length === 0 && (
              <div className="bg-white rounded-xl p-10 text-center shadow-sm">
                <div className="text-5xl mb-4">👥</div>
                <p className="text-gray-500">
                  Vos patients apparaitront ici apres leurs consultations terminees.
                </p>
              </div>
            )}
            {patients.map((patient) => (
              <div key={patient.id}
                className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      👤 {patient.nom} {patient.prenom}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      📞 {patient.telephone}
                    </p>
                    {patient.groupe_sanguin && (
                      <p className="text-gray-500 text-sm">
                        🩸 Groupe sanguin : {patient.groupe_sanguin}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => calculerObservance(patient)}
                    className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition">
                    📊 Voir l observance
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default MedecinDashboard;