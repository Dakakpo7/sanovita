import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

function RendezVous() {
  const [rdvs, setRdvs] = useState([]);
  const [medecins, setMedecins] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [afficherFormulaire, setAfficherFormulaire] = useState(false);
  const [formData, setFormData] = useState({
    medecin_id: '',
    date_heure: '',
    type: 'VIDEO'
  });

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      const [rdvsReponse, medecinsReponse] = await Promise.all([
        api.get('/rdv/mes-rdv'),
        api.get('/rdv/medecins')
      ]);
      setRdvs(rdvsReponse.data.rdvs);
      setMedecins(medecinsReponse.data.medecins);
    } catch (erreur) {
      toast.error('Erreur lors du chargement');
    } finally {
      setChargement(false);
    }
  };

  const creerRdv = async (e) => {
    e.preventDefault();
    try {
      await api.post('/rdv', formData);
      toast.success('Rendez-vous cree avec succes !');
      setAfficherFormulaire(false);
      chargerDonnees();
    } catch (erreur) {
      toast.error(erreur.response?.data?.message || 'Erreur lors de la creation');
    }
  };

  const annulerRdv = async (id) => {
    try {
      await api.put(`/rdv/${id}/annuler`);
      toast.success('Rendez-vous annule');
      chargerDonnees();
    } catch (erreur) {
      toast.error('Erreur lors de l annulation');
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

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          <span className="text-xl font-bold text-blue-600">SanoVita</span>
        </div>
        <Link to="/patient/dashboard"
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition">
          Retour au dashboard
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            📅 Mes rendez-vous
          </h1>
          <button
            onClick={() => setAfficherFormulaire(!afficherFormulaire)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
            + Nouveau RDV
          </button>
        </div>

        {/* FORMULAIRE NOUVEAU RDV */}
        {afficherFormulaire && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-blue-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Prendre un rendez-vous
            </h2>
            <form onSubmit={creerRdv} className="space-y-4">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Choisir un medecin
                </label>
                <select
                  value={formData.medecin_id}
                  onChange={(e) => setFormData({ ...formData, medecin_id: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Selectionnez un medecin</option>
                  {medecins.map((medecin) => (
                    <option key={medecin.id} value={medecin.id}>
                      Dr {medecin.users?.nom} {medecin.users?.prenom} — {medecin.specialite} — {medecin.tarif} FCFA
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date et heure
                </label>
                <input
                  type="datetime-local"
                  value={formData.date_heure}
                  onChange={(e) => setFormData({ ...formData, date_heure: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de consultation
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="VIDEO">Video</option>
                  <option value="CHAT">Chat</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                  Confirmer le rendez-vous
                </button>
                <button
                  type="button"
                  onClick={() => setAfficherFormulaire(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition">
                  Annuler
                </button>
              </div>

            </form>
          </div>
        )}

        {/* CHARGEMENT */}
        {chargement && (
          <div className="text-center py-10">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-500">Chargement...</p>
          </div>
        )}

        {/* AUCUN RDV */}
        {!chargement && rdvs.length === 0 && (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm">
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Aucun rendez-vous
            </h3>
            <p className="text-gray-500 mb-4">
              Vous n avez pas encore de rendez-vous.
            </p>
            <button
              onClick={() => setAfficherFormulaire(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
              Prendre un rendez-vous
            </button>
          </div>
        )}

        {/* LISTE DES RDV */}
        <div className="space-y-4">
          {rdvs.map((rdv) => (
            <div key={rdv.id}
              className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">

              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">
                    Dr {rdv.medecins?.users?.nom} {rdv.medecins?.users?.prenom}
                  </h3>
                  <p className="text-blue-600 text-sm font-medium">
                    {rdv.medecins?.specialite}
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
                    <button
                      onClick={() => annulerRdv(rdv.id)}
                      className="text-red-500 text-sm hover:underline">
                      Annuler
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default RendezVous;