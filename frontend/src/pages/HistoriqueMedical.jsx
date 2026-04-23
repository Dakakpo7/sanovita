import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

function HistoriqueMedical() {
  const [historique, setHistorique] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [consultationSelectionnee, setConsultationSelectionnee] = useState(null);

  useEffect(() => {
    chargerHistorique();
  }, []);

  const chargerHistorique = async () => {
    try {
      const reponse = await api.get('/patients/historique');
      setHistorique(reponse.data.historique);
    } catch (erreur) {
      toast.error('Erreur lors du chargement de l historique');
    } finally {
      setChargement(false);
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
          📋 Mon historique medical
        </h1>
        <p className="text-gray-500 mb-8">
          Toutes vos consultations passees
        </p>

        {/* CHARGEMENT */}
        {chargement && (
          <div className="text-center py-10">
            <p className="text-gray-500">Chargement...</p>
          </div>
        )}

        {/* AUCUN HISTORIQUE */}
        {!chargement && historique.length === 0 && (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Aucune consultation
            </h3>
            <p className="text-gray-500 mb-4">
              Vous n avez pas encore eu de consultation.
            </p>
            <Link to="/patient/rendez-vous"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
              Prendre un rendez-vous
            </Link>
          </div>
        )}

        {/* LISTE DES CONSULTATIONS */}
        <div className="space-y-4">
          {historique.map((rdv) => (
            <div key={rdv.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

              {/* HEADER CONSULTATION */}
              <div
                className="p-5 cursor-pointer hover:bg-gray-50 transition"
                onClick={() => setConsultationSelectionnee(
                  consultationSelectionnee?.id === rdv.id ? null : rdv
                )}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      👨‍⚕️ Dr {rdv.medecins?.users?.prenom} {rdv.medecins?.users?.nom}
                    </h3>
                    <p className="text-blue-600 text-sm font-medium">
                      {rdv.medecins?.specialite}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      🕐 {formaterDate(rdv.date_heure)}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {rdv.type === 'VIDEO' ? '🎥 Video' : '💬 Chat'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                      TERMINE
                    </span>
                    <span className="text-blue-600 text-sm">
                      {consultationSelectionnee?.id === rdv.id ? '▲ Fermer' : '▼ Voir details'}
                    </span>
                  </div>
                </div>
              </div>

              {/* DETAILS CONSULTATION */}
              {consultationSelectionnee?.id === rdv.id && rdv.consultations?.[0] && (
                <div className="border-t border-gray-100 p-5 space-y-4">

                  {/* NOTES */}
                  {rdv.consultations[0].notes && (
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h4 className="font-bold text-gray-800 mb-2">
                        📝 Notes du medecin
                      </h4>
                      <p className="text-gray-700 text-sm">
                        {rdv.consultations[0].notes}
                      </p>
                    </div>
                  )}

                  {/* COMPTE RENDU */}
                  {rdv.consultations[0].compte_rendu && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <h4 className="font-bold text-gray-800 mb-2">
                        📋 Compte rendu
                      </h4>
                      <p className="text-gray-700 text-sm">
                        {rdv.consultations[0].compte_rendu}
                      </p>
                    </div>
                  )}

                  {/* ORDONNANCES ET MEDICAMENTS */}
                  {rdv.consultations[0].ordonnances?.length > 0 && (
                    <div className="bg-yellow-50 rounded-xl p-4">
                      <h4 className="font-bold text-gray-800 mb-3">
                        💊 Ordonnance
                      </h4>
                      {rdv.consultations[0].ordonnances[0].medicaments?.map((med, index) => (
                        <div key={index}
                          className="bg-white rounded-lg p-3 mb-2 border border-yellow-100">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-gray-800">{med.nom}</p>
                              <p className="text-blue-600 text-sm">{med.dosage}</p>
                              <p className="text-gray-500 text-sm">
                                🕐 {Array.isArray(med.frequence)
                                  ? med.frequence.join(', ')
                                  : med.frequence} pendant {med.duree_jours} jours
                              </p>
                              {med.instructions && (
                                <p className="text-gray-400 text-sm">
                                  ℹ️ {med.instructions}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* AUCUN DETAIL */}
                  {!rdv.consultations[0].notes &&
                   !rdv.consultations[0].compte_rendu &&
                   !rdv.consultations[0].ordonnances?.length && (
                    <p className="text-gray-500 text-center py-4">
                      Aucun detail disponible pour cette consultation.
                    </p>
                  )}

                </div>
              )}

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default HistoriqueMedical;