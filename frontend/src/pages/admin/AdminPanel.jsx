import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import useAuthStore from '../../store/authStore';

function AdminPanel() {
  const { utilisateur, deconnecter } = useAuthStore();
  const navigate = useNavigate();
  const [ongletActif, setOngletActif] = useState('stats');
  const [medecins, setMedecins] = useState([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalMedecins: 0,
    totalRdvs: 0,
    totalConsultations: 0
  });
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    // Verifier que l utilisateur est admin
    if (utilisateur?.role !== 'ADMIN') {
      navigate('/');
      return;
    }
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      // Charger les medecins
      const reponseMedecins = await api.get('/admin/medecins');
      setMedecins(reponseMedecins.data.medecins);

      // Charger les stats
      const reponseStats = await api.get('/admin/stats');
      setStats(reponseStats.data.stats);

    } catch (erreur) {
      toast.error('Erreur lors du chargement');
    } finally {
      setChargement(false);
    }
  };

  const validerMedecin = async (medecinId) => {
    try {
      await api.put(`/admin/medecins/${medecinId}/valider`);
      toast.success('Medecin valide avec succes !');
      chargerDonnees();
    } catch (erreur) {
      toast.error('Erreur lors de la validation');
    }
  };

  const suspendreMedecin = async (medecinId) => {
    try {
      await api.put(`/admin/medecins/${medecinId}/suspendre`);
      toast.success('Medecin suspendu');
      chargerDonnees();
    } catch (erreur) {
      toast.error('Erreur lors de la suspension');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          <span className="text-xl font-bold">SanoVita</span>
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2">
            ADMIN
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-300">{utilisateur?.prenom} {utilisateur?.nom}</span>
          <button onClick={deconnecter}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Deconnexion
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Panneau d administration
        </h1>
        <p className="text-gray-500 mb-8">
          Gestion de la plateforme SanoVita
        </p>

        {/* STATISTIQUES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">Total patients</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalPatients}</p>
            <p className="text-2xl mt-1">👤</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Total medecins</p>
            <p className="text-3xl font-bold text-green-600">{stats.totalMedecins}</p>
            <p className="text-2xl mt-1">👨‍⚕️</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm">Total RDV</p>
            <p className="text-3xl font-bold text-yellow-600">{stats.totalRdvs}</p>
            <p className="text-2xl mt-1">📅</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
            <p className="text-gray-500 text-sm">Consultations</p>
            <p className="text-3xl font-bold text-purple-600">{stats.totalConsultations}</p>
            <p className="text-2xl mt-1">🎥</p>
          </div>
        </div>

        {/* ONGLETS */}
        <div className="flex gap-3 mb-6">
          <button onClick={() => setOngletActif('stats')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              ongletActif === 'stats'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}>
            📊 Statistiques
          </button>
          <button onClick={() => setOngletActif('medecins')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              ongletActif === 'medecins'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}>
            👨‍⚕️ Gestion medecins
          </button>
        </div>

        {/* ONGLET STATISTIQUES */}
        {ongletActif === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">
                📈 Activite de la plateforme
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Patients inscrits</span>
                  <span className="font-bold text-blue-600">{stats.totalPatients}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Medecins inscrits</span>
                  <span className="font-bold text-green-600">{stats.totalMedecins}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Rendez-vous total</span>
                  <span className="font-bold text-yellow-600">{stats.totalRdvs}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Consultations total</span>
                  <span className="font-bold text-purple-600">{stats.totalConsultations}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">
                ℹ️ Informations systeme
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Version API</span>
                  <span className="font-bold">1.0.0</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Base de donnees</span>
                  <span className="font-bold text-green-600">Supabase ✅</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Scheduler rappels</span>
                  <span className="font-bold text-green-600">Actif ✅</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Chatbot IA</span>
                  <span className="font-bold text-green-600">Actif ✅</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ONGLET MEDECINS */}
        {ongletActif === 'medecins' && (
          <div className="space-y-4">
            {chargement && (
              <div className="text-center py-10">
                <p className="text-gray-500">Chargement...</p>
              </div>
            )}
            {!chargement && medecins.length === 0 && (
              <div className="bg-white rounded-xl p-10 text-center shadow-sm">
                <div className="text-5xl mb-4">👨‍⚕️</div>
                <p className="text-gray-500">Aucun medecin inscrit.</p>
              </div>
            )}
            {medecins.map((medecin) => (
              <div key={medecin.id}
                className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">
                      Dr {medecin.users?.nom} {medecin.users?.prenom}
                    </h3>
                    <p className="text-blue-600 text-sm font-medium">
                      {medecin.specialite}
                    </p>
                    <p className="text-gray-500 text-sm">
                      📧 {medecin.users?.email}
                    </p>
                    <p className="text-gray-500 text-sm">
                      💰 {medecin.tarif} FCFA
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      medecin.valide_par_admin
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {medecin.valide_par_admin ? 'Valide' : 'En attente'}
                    </span>
                    <div className="flex gap-2">
                      {!medecin.valide_par_admin && (
                        <button
                          onClick={() => validerMedecin(medecin.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition">
                          Valider
                        </button>
                      )}
                      {medecin.valide_par_admin && (
                        <button
                          onClick={() => suspendreMedecin(medecin.id)}
                          className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-sm hover:bg-red-200 transition">
                          Suspendre
                        </button>
                      )}
                    </div>
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

export default AdminPanel;