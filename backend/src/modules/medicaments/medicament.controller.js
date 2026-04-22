const {
  prescrireMedicaments,
  confirmerPrise,
  calculerObservance,
  obtenirRappelsDuJour
} = require('./medicament.service');

// Prescrire des medicaments (MEDECIN)
const prescrire = async (req, res) => {
  try {
    const { consultation_id, medicaments } = req.body;

    // Verifier que les champs sont presents
    if (!consultation_id || !medicaments || medicaments.length === 0) {
      return res.status(400).json({
        message: 'La consultation et les medicaments sont obligatoires'
      });
    }

    const resultat = await prescrireMedicaments(
      consultation_id,
      medicaments,
      req.utilisateur.id
    );

    res.status(201).json({
      message: 'Medicaments prescrits et rappels generes avec succes',
      ordonnance: resultat.ordonnance,
      medicaments: resultat.medicaments,
      nombre_rappels: resultat.medicaments.length
    });

  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

// Confirmer une prise de medicament (PATIENT)
const confirmer = async (req, res) => {
  try {
    const { rappel_id } = req.body;

    if (!rappel_id) {
      return res.status(400).json({
        message: 'L identifiant du rappel est obligatoire'
      });
    }

    const prise = await confirmerPrise(rappel_id, req.utilisateur.id);

    res.status(200).json({
      message: 'Prise de medicament confirmee',
      prise
    });

  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

// Calculer le taux d observance (MEDECIN)
const observance = async (req, res) => {
  try {
    const { patient_id } = req.params;

    const resultat = await calculerObservance(patient_id);

    res.status(200).json({
      message: 'Taux d observance calcule',
      taux: resultat.taux + '%',
      total_rappels: resultat.total_rappels,
      prises_confirmees: resultat.prises_confirmees
    });

  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

// Obtenir les rappels du jour (PATIENT)
const rappelsDuJour = async (req, res) => {
  try {
    const rappels = await obtenirRappelsDuJour(req.utilisateur.id);

    res.status(200).json({
      message: 'Rappels du jour recuperes',
      rappels,
      nombre: rappels.length
    });

  } catch (erreur) {
    res.status(400).json({ message: erreur.message });
  }
};

module.exports = {
  prescrire,
  confirmer,
  observance,
  rappelsDuJour
};