import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

function Register() {
  const navigate = useNavigate();

  // Etat du formulaire
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    mot_de_passe: '',
    role: 'PATIENT',
    specialite: '',
    tarif: ''
  });
  const [chargement, setChargement] = useState(false);

  // Mettre a jour les champs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setChargement(true);

    try {
      await api.post('/auth/inscription', formData);
      toast.success('Compte cree avec succes ! Connectez-vous.');
      navigate('/login');
    } catch (erreur) {
      toast.error(erreur.response?.data?.message || 'Erreur lors de l inscription');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* LOGO */}
        <div className="text-center mb-8">
          <span className="text-4xl">🏥</span>
          <h1 className="text-2xl font-bold text-blue-600 mt-2">SanoVita</h1>
          <p className="text-gray-600 mt-1">Creer votre compte</p>
        </div>

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* CHOIX DU ROLE */}
          <div className="flex gap-3 mb-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'PATIENT' })}
              className={`flex-1 py-2 rounded-lg font-medium border-2 transition ${
                formData.role === 'PATIENT'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300'
              }`}>
              Je suis patient
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'MEDECIN' })}
              className={`flex-1 py-2 rounded-lg font-medium border-2 transition ${
                formData.role === 'MEDECIN'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300'
              }`}>
              Je suis medecin
            </button>
          </div>

          {/* NOM ET PRENOM */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Dupont"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prenom
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                placeholder="Marie"
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre@email.com"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* TELEPHONE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telephone
            </label>
            <input
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="+22890000000"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* MOT DE PASSE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              name="mot_de_passe"
              value={formData.mot_de_passe}
              onChange={handleChange}
              placeholder="Minimum 8 caracteres"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* CHAMPS MEDECIN UNIQUEMENT */}
          {formData.role === 'MEDECIN' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialite
                </label>
                <input
                  type="text"
                  name="specialite"
                  value={formData.specialite}
                  onChange={handleChange}
                  placeholder="Medecine generale"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tarif de consultation (FCFA)
                </label>
                <input
                  type="number"
                  name="tarif"
                  value={formData.tarif}
                  onChange={handleChange}
                  placeholder="15000"
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={chargement}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {chargement ? 'Inscription en cours...' : 'Creer mon compte'}
          </button>

        </form>

        {/* LIEN CONNEXION */}
        <p className="text-center text-gray-600 mt-6">
          Deja un compte ?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Se connecter
          </Link>
        </p>

        <p className="text-center mt-4">
          <Link to="/" className="text-gray-400 text-sm hover:text-gray-600">
            Retour a l accueil
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Register;