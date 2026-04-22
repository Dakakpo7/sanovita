// Middleware de vérification des rôles
// Vérifie que l'utilisateur a le bon rôle pour accéder à une page
// Exemple : seul un MEDECIN peut accéder à certaines pages

const verifierRole = (...rolesAutorises) => {
  return (req, res, next) => {

    // Vérifier que l'utilisateur est connecté
    if (!req.utilisateur) {
      return res.status(401).json({
        message: '❌ Vous devez être connecté.'
      });
    }

    // Vérifier que son rôle est autorisé
    if (!rolesAutorises.includes(req.utilisateur.role)) {
      return res.status(403).json({
        message: `❌ Accès refusé. Cette page est réservée aux : ${rolesAutorises.join(', ')}`
      });
    }

    // Rôle autorisé : on laisse passer
    next();
  };
};

module.exports = { verifierRole };