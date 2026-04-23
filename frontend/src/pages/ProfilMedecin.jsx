import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

function ProfilMedecin() {
  const [profil, setProfil] = useState(null);
  const [stats, setStats] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [modification, setModification] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    specialite: '',
    tarif: '',
    biographie: '',
    disponible: true
  });

  useEffect(() => {
    chargerDonnees();
  }, []);

  const chargerDonnees = async () => {
    try {
      const [reponseProfil, reponseStats] = await Promise.all([
        api.get('/medecins/profil'),
        api.get('/medecins/stats')
      ]);

      const p = reponseProfil.data.profil;
      setProfil(p);
      setStats(reponseStats.data.stats);
      setFormData({
        nom: p.users?.nom || '',
        prenom: p.users?.prenom || '',
        telephone: p.users?.telephone || '',
        specialite: p.specialite || '',
        tarif: p.tarif || '',
        biographie: p.biographie || '',
        disponible: p.disponible
      });
    } catch (erreur) {
      toast.error('Erreur lors du chargement');
    } finally {
      setChargement(false);
    }
  };

  const sauvegarder = async (e) => {
    e.preventDefault();
    try {
      await api.put('/medecins/profil', formData);
      toast.success('Profil mis a jour avec succes !');
      setModification(false);
      chargerDonnees();
    } catch (erreur) {
      toast.error('Erreur lors de la mise a jour');
    }
  };

  if (chargement) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          <span className="text-xl font-bold text-blue-600">SanoVita</span>
        </div>
        <Link to="/medecin/dashboard"
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition">
          Retour au dashboard
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            👨‍⚕️ Mon profil
          </h1>
          <button
            onClick={() => setModification(!modification)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              modification
                ? 'bg-gray-100 text-gray-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}>
            {modification ? 'Annuler' : 'Modifier'}
          </button>
        </div>

        {/* STATISTIQUES */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.total_rdvs}</p>
              <p className="text-gray-500 text-sm">Total RDV</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-green-600">{stats.rdvs_termines}</p>
              <p className="text-gray-500 text-sm">Termines</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm text-center">
              <p className="text-2xl font-bold text-yellow-600">{stats.rdvs_en_attente}</p>
              <p className="text-gray-500 text-sm">En attente</p>
            </div>
          </div>
        )}

        {/* CARTE PROFIL */}
        <div className="bg-white rounded-2xl shadow-sm p-8">

          {/* AVATAR */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">👨‍⚕️</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Dr {profil?.users?.prenom} {profil?.users?.nom}
              </h2>
              <p className="text-blue-600 font-medium">{profil?.specialite}</p>
              <div className="flex gap-2 mt-1">
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                  MEDECIN
                </span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  profil?.disponible
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {profil?.disponible ? 'Disponible' : 'Indisponible'}
                </span>
                {profil?.valide_par_admin && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                    Verifie ✅
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* MODE LECTURE */}
          {!modification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500 text-sm mb-1">Email</p>
                  <p className="font-medium text-gray-800">{profil?.users?.email}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500 text-sm mb-1">Telephone</p>
                  <p className="font-medium text-gray-800">
                    {profil?.users?.telephone || 'Non renseigne'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500 text-sm mb-1">Tarif consultation</p>
                  <p className="font-medium text-gray-800">{profil?.tarif} FCFA</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500 text-sm mb-1">Numero d ordre</p>
                  <p className="font-medium text-gray-800">
                    {profil?.numero_ordre || 'Non renseigne'}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500 text-sm mb-1">Biographie</p>
                <p className="font-medium text-gray-800">
                  {profil?.biographie || 'Aucune biographie renseignee'}
                </p>
              </div>
            </div>
          )}

          {/* MODE MODIFICATION */}
          {modification && (
            <form onSubmit={sauvegarder} className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prenom</label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telephone</label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialite</label>
                  <input
                    type="text"
                    value={formData.specialite}
                    onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tarif (FCFA)</label>
                  <input
                    type="number"
                    value={formData.tarif}
                    onChange={(e) => setFormData({ ...formData, tarif: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biographie</label>
                <textarea
                  value={formData.biographie}
                  onChange={(e) => setFormData({ ...formData, biographie: e.target.value })}
                  placeholder="Decrivez votre experience et vos competences..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="disponible"
                  checked={formData.disponible}
                  onChange={(e) => setFormData({ ...formData, disponible: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="disponible" className="text-sm font-medium text-gray-700">
                  Je suis disponible pour des consultations
                </label>
              </div>

              <button type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition">
                Sauvegarder les modifications
              </button>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilMedecin;