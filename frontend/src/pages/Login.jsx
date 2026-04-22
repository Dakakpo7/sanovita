import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuthStore from '../store/authStore';

function Login() {
  const navigate = useNavigate();
  const { connecter } = useAuthStore();

  // Etat du formulaire
  const [formData, setFormData] = useState({
    email: '',
    mot_de_passe: ''
  });
  const [chargement, setChargement] = useState(false);

  // Mettre a jour les champs du formulaire
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
      const reponse = await api.post('/auth/connexion', formData);
      const { token, utilisateur } = reponse.data;

      // Sauvegarder dans le store
      connecter(utilisateur, token);

      toast.success('Connexion reussie ! Bienvenue ' + utilisateur.prenom);

      // Rediriger selon le role
      if (utilisateur.role === 'PATIENT') {
        navigate('/patient/dashboard');
      } else if (utilisateur.role === 'MEDECIN') {
        navigate('/medecin/dashboard');
      }

    } catch (erreur) {
      toast.error(erreur.response?.data?.message || 'Erreur de connexion');
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* LOGO */}
        <div className="text-center mb-8">
          <span className="text-4xl">🏥</span>
          <h1 className="text-2xl font-bold text-blue-600 mt-2">SanoVita</h1>
          <p className="text-gray-600 mt-1">Connectez-vous a votre compte</p>
        </div>

        {/* FORMULAIRE */}
        <form onSubmit={handleSubmit} className="space-y-4">

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              name="mot_de_passe"
              value={formData.mot_de_passe}
              onChange={handleChange}
              placeholder="Votre mot de passe"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={chargement}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {chargement ? 'Connexion en cours...' : 'Se connecter'}
          </button>

        </form>

        {/* LIEN INSCRIPTION */}
        <p className="text-center text-gray-600 mt-6">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">
            S inscrire
          </Link>
        </p>

        {/* LIEN ACCUEIL */}
        <p className="text-center mt-4">
          <Link to="/" className="text-gray-400 text-sm hover:text-gray-600">
            Retour a l accueil
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;