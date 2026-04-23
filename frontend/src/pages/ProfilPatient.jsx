import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

function ProfilPatient() {
  const [profil, setProfil] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [modification, setModification] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    date_naissance: '',
    groupe_sanguin: '',
    antecedents: '',
    allergies: ''
  });

  useEffect(() => {
    chargerProfil();
  }, []);

  const chargerProfil = async () => {
    try {
      const reponse = await api.get('/patients/profil');
      const p = reponse.data.profil;
      setProfil(p);
      setFormData({
        nom: p.users?.nom || '',
        prenom: p.users?.prenom || '',
        telephone: p.users?.telephone || '',
        date_naissance: p.date_naissance || '',
        groupe_sanguin: p.groupe_sanguin || '',
        antecedents: p.antecedents || '',
        allergies: p.allergies || ''
      });
    } catch (erreur) {
      toast.error('Erreur lors du chargement du profil');
    } finally {
      setChargement(false);
    }
  };

  const sauvegarder = async (e) => {
    e.preventDefault();
    try {
      await api.put('/patients/profil', formData);
      toast.success('Profil mis a jour avec succes !');
      setModification(false);
      chargerProfil();
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
        <Link to="/patient/dashboard"
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition">
          Retour au dashboard
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            👤 Mon profil
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

        {/* CARTE PROFIL */}
        <div className="bg-white rounded-2xl shadow-sm p-8">

          {/* AVATAR */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">👤</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {profil?.users?.prenom} {profil?.users?.nom}
              </h2>
              <p className="text-gray-500">{profil?.users?.email}</p>
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                PATIENT
              </span>
            </div>
          </div>

          {/* MODE LECTURE */}
          {!modification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500 text-sm mb-1">Telephone</p>
                  <p className="font-medium text-gray-800">
                    {profil?.users?.telephone || 'Non renseigne'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500 text-sm mb-1">Date de naissance</p>
                  <p className="font-medium text-gray-800">
                    {profil?.date_naissance
                      ? new Date(profil.date_naissance).toLocaleDateString('fr-FR')
                      : 'Non renseignee'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500 text-sm mb-1">Groupe sanguin</p>
                  <p className="font-medium text-gray-800">
                    {profil?.groupe_sanguin || 'Non renseigne'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-500 text-sm mb-1">Allergies</p>
                  <p className="font-medium text-gray-800">
                    {profil?.allergies || 'Aucune'}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-500 text-sm mb-1">Antecedents medicaux</p>
                <p className="font-medium text-gray-800">
                  {profil?.antecedents || 'Aucun antecedent renseigne'}
                </p>
              </div>
            </div>
          )}

          {/* MODE MODIFICATION */}
          {modification && (
            <form onSubmit={sauvegarder} className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prenom
                  </label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telephone
                </label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    value={formData.date_naissance}
                    onChange={(e) => setFormData({ ...formData, date_naissance: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Groupe sanguin
                  </label>
                  <select
                    value={formData.groupe_sanguin}
                    onChange={(e) => setFormData({ ...formData, groupe_sanguin: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Selectionnez</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allergies
                </label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="Ex: Penicilline, Aspirine..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Antecedents medicaux
                </label>
                <textarea
                  value={formData.antecedents}
                  onChange={(e) => setFormData({ ...formData, antecedents: e.target.value })}
                  placeholder="Ex: Diabete type 2, Hypertension..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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

export default ProfilPatient;