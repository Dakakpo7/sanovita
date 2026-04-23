import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

function Paiement() {
  const navigate = useNavigate();
  const [rdvs, setRdvs] = useState([]);
  const [paiements, setPaiements] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [ongletActif, setOngletActif] = useState('a-payer');
  const [paiementEnCours, setPaiementEnCours] = useState(null);

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      const [rdvsReponse, paiementsReponse] = await Promise.all([
        api.get('/rdv/mes-rdv'),
        api.get('/paiements/historique')
      ]);
      setRdvs(rdvsReponse.data.rdvs);
      setPaiements(paiementsReponse.data.paiements);
    } catch (erreur) {
      toast.error('Erreur lors du chargement');
    } finally {
      setChargement(false);
    }
  };

  const effectuerPaiement = async (rdvId) => {
    setPaiementEnCours(rdvId);
    try {
      const reponse = await api.post('/paiements/payer', { rdv_id: rdvId });
      toast.success('Paiement effectue avec succes !');
      chargerDonnees();
    } catch (erreur) {
      toast.error(erreur.response?.data?.message || 'Erreur lors du paiement');
    } finally {
      setPaiementEnCours(null);
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

  // Filtrer les rdvs non payes
  const rdvsNonPaies = rdvs.filter(r =>
    r.paiement_statut === 'NON_PAYE' &&
    r.statut !== 'ANNULE'
  );

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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          💳 Mes paiements
        </h1>
        <p className="text-gray-500 mb-8">
          Gerez vos paiements de consultations
        </p>

        {/* ONGLETS */}
        <div className="flex gap-3 mb-6">
          <button onClick={() => setOngletActif('a-payer')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              ongletActif === 'a-payer'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}>
            💳 A payer
            {rdvsNonPaies.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {rdvsNonPaies.length}
              </span>
            )}
          </button>
          <button onClick={() => setOngletActif('historique')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              ongletActif === 'historique'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}>
            📜 Historique
          </button>
        </div>

        {/* CHARGEMENT */}
        {chargement && (
          <div className="text-center py-10">
            <p className="text-gray-500">Chargement...</p>
          </div>
        )}

        {/* ONGLET A PAYER */}
        {!chargement && ongletActif === 'a-payer' && (
          <div className="space-y-4">
            {rdvsNonPaies.length === 0 && (
              <div className="bg-white rounded-xl p-10 text-center shadow-sm">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Tout est a jour !
                </h3>
                <p className="text-gray-500">
                  Vous n avez aucun paiement en attente.
                </p>
              </div>
            )}

            {rdvsNonPaies.map((rdv) => (
              <div key={rdv.id}
                className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      👨‍⚕️ Dr {rdv.medecins?.users?.prenom} {rdv.medecins?.users?.nom}
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
                    <p className="text-green-600 font-bold mt-2 text-lg">
                      {rdv.medecins?.tarif} FCFA
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                      Non paye
                    </span>
                    <button
                      onClick={() => effectuerPaiement(rdv.id)}
                      disabled={paiementEnCours === rdv.id}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                      {paiementEnCours === rdv.id
                        ? 'Paiement en cours...'
                        : '💳 Payer maintenant'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ONGLET HISTORIQUE */}
        {!chargement && ongletActif === 'historique' && (
          <div className="space-y-4">
            {paiements.length === 0 && (
              <div className="bg-white rounded-xl p-10 text-center shadow-sm">
                <div className="text-5xl mb-4">📜</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  Aucun paiement
                </h3>
                <p className="text-gray-500">
                  Vous n avez pas encore effectue de paiement.
                </p>
              </div>
            )}

            {paiements.map((paiement) => (
              <div key={paiement.id}
                className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      👨‍⚕️ Dr {paiement.medecins?.users?.prenom} {paiement.medecins?.users?.nom}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      🕐 {formaterDate(paiement.date_heure)}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Ref : {paiement.stripe_payment_id}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      Paye ✅
                    </span>
                    <p className="font-bold text-gray-800 text-lg">
                      {paiement.medecins?.tarif} FCFA
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default Paiement;