import { create } from 'zustand';

// Store d authentification
// Gere l utilisateur connecte et le token JWT
const useAuthStore = create((set) => ({

  // Etat initial
  utilisateur: JSON.parse(localStorage.getItem('utilisateur')) || null,
  token: localStorage.getItem('token') || null,
  estConnecte: !!localStorage.getItem('token'),

  // Connecter un utilisateur
  connecter: (utilisateur, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('utilisateur', JSON.stringify(utilisateur));
    set({
      utilisateur,
      token,
      estConnecte: true
    });
  },

  // Deconnecter un utilisateur
  deconnecter: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    set({
      utilisateur: null,
      token: null,
      estConnecte: false
    });
  },

  // Mettre a jour le profil
  mettreAJourProfil: (nouvelleDonnees) => {
    const utilisateurMisAJour = {
      ...JSON.parse(localStorage.getItem('utilisateur')),
      ...nouvelleDonnees
    };
    localStorage.setItem('utilisateur', JSON.stringify(utilisateurMisAJour));
    set({ utilisateur: utilisateurMisAJour });
  }
}));

export default useAuthStore;