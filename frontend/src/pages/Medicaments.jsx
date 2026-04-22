import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

function Medicaments() {
  const [rappels, setRappels] = useState([]);
  const [chargement, setChargement] = useState(true);

  // Charger les rappels du jour au demarrage
  useEffect(() => {
    chargerRappels();
  }, []);

  const chargerRappels = async () => {
    try {
      const reponse = await api.get('/medicaments/rappels-du-jour');
      setRappels(reponse.data.rappels);
    } catch (erreur) {
      toast.error('Erreur lors du chargement des rappels');
    } finally {
      setChargement(false);
    }
  };

  // Confirmer une prise de medicament
  const confirmerPrise = async (rappelId) => {
    try {
      await api.post('/medicaments/confirmer-prise', {
        rappel_id: rappelId
      });
      toast.success('Prise confirmee !');
      chargerRappels();
    } catch (erreur) {
      toast.error('Erreur lors de la confirmation');
    }
  };

  // Formater l heure
  const formaterHeure = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Verifier si la prise est confirmee
  const estConfirme = (rappel) => {
    return rappel.prises_medicaments &&
      rappel.prises_medicaments.length > 0 &&
      rappel.prises_medicaments[0].confirme;
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

      <div className="max-w-2xl mx-auto px-6 py-10">

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          💊 Mes medicaments
        </h1>
        <p className="text-gray-500 mb-8">
          Rappels du jour — {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>

        {/* CHARGEMENT */}
        {chargement && (
          <div className="text-center py-10">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-500">Chargement des rappels...</p>
          </div>
        )}

        {/* AUCUN RAPPEL */}
        {!chargement && rappels.length === 0 && (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Aucun medicament aujourd hui
            </h3>
            <p className="text-gray-500">
              Vous n avez pas de traitement en cours pour aujourd hui.
            </p>
          </div>
        )}

        {/* LISTE DES RAPPELS */}
        <div className="space-y-4">
          {rappels.map((rappel) => (
            <div key={rappel.id}
              className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${
                estConfirme(rappel)
                  ? 'border-green-500 opacity-75'
                  : 'border-blue-500'
              }`}>

              <div className="flex justify-between items-start">
                <div>
                  {/* NOM ET DOSAGE */}
                  <h3 className="text-lg font-bold text-gray-800">
                    💊 {rappel.medicaments?.nom}
                  </h3>
                  <p className="text-blue-600 font-medium">
                    {rappel.medicaments?.dosage}
                  </p>

                  {/* HEURE */}
                  <p className="text-gray-500 text-sm mt-1">
                    🕐 {formaterHeure(rappel.heure_rappel)}
                  </p>

                  {/* INSTRUCTIONS */}
                  {rappel.medicaments?.instructions && (
                    <p className="text-gray-400 text-sm mt-1">
                      ℹ️ {rappel.medicaments.instructions}
                    </p>
                  )}
                </div>

                {/* BOUTON CONFIRMER */}
                <div className="ml-4">
                  {estConfirme(rappel) ? (
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium">
                      ✅ Pris
                    </div>
                  ) : (
                    <button
                      onClick={() => confirmerPrise(rappel.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
                      Confirmer la prise
                    </button>
                  )}
                </div>
              </div>

              {/* HEURE DE CONFIRMATION */}
              {estConfirme(rappel) && rappel.prises_medicaments[0].heure_confirmation && (
                <p className="text-green-600 text-sm mt-3">
                  ✅ Pris a {formaterHeure(rappel.prises_medicaments[0].heure_confirmation)}
                </p>
              )}

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default Medicaments;