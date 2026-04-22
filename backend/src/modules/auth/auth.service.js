// Service d'authentification
// Contient toute la logique d'inscription et de connexion

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../../config/supabase');
const dotenv = require('dotenv');

dotenv.config();

// =============================================
// INSCRIPTION D'UN NOUVEL UTILISATEUR
// =============================================
const inscrireUtilisateur = async (donnees) => {
  const { nom, prenom, email, telephone, mot_de_passe, role } = donnees;

  // Vérifier que tous les champs sont remplis
  if (!nom || !prenom || !email || !mot_de_passe || !role) {
    throw new Error('Tous les champs obligatoires doivent être remplis');
  }

  // Vérifier que le rôle est valide
  if (!['PATIENT', 'MEDECIN'].includes(role)) {
    throw new Error('Le rôle doit être PATIENT ou MEDECIN');
  }

  // Vérifier si l'email existe déjà
  const { data: utilisateurExistant } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (utilisateurExistant) {
    throw new Error('Cet email est déjà utilisé');
  }

  // Chiffrer le mot de passe
  // Le "10" signifie que le chiffrement est très sécurisé
  const motDePasseChiffre = await bcrypt.hash(mot_de_passe, 10);

  // Créer l'utilisateur dans la table users
  const { data: nouvelUtilisateur, error } = await supabaseAdmin
    .from('users')
    .insert([{
      nom,
      prenom,
      email,
      telephone,
      role,
      mot_de_passe_hash: motDePasseChiffre
    }])
    .select()
    .single();

  if (error) {
    throw new Error('Erreur lors de la création du compte : ' + error.message);
  }

  // Si c'est un patient, créer son profil patient
  if (role === 'PATIENT') {
    await supabaseAdmin
      .from('patients')
      .insert([{ user_id: nouvelUtilisateur.id }]);
  }

  // Si c'est un médecin, créer son profil médecin
  if (role === 'MEDECIN') {
    const { specialite, numero_ordre, tarif } = donnees;
    await supabaseAdmin
      .from('medecins')
      .insert([{
        user_id: nouvelUtilisateur.id,
        specialite: specialite || 'Non définie',
        numero_ordre,
        tarif: tarif || 0
      }]);
  }

  // Retourner l'utilisateur sans le mot de passe
  const { mot_de_passe_hash, ...utilisateurSansMotDePasse } = nouvelUtilisateur;
  return utilisateurSansMotDePasse;
};

// =============================================
// CONNEXION D'UN UTILISATEUR
// =============================================
const connecterUtilisateur = async (email, mot_de_passe) => {

  // Vérifier que email et mot de passe sont fournis
  if (!email || !mot_de_passe) {
    throw new Error('Email et mot de passe sont obligatoires');
  }

  // Chercher l'utilisateur dans la base de données
  const { data: utilisateur, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !utilisateur) {
    throw new Error('Email ou mot de passe incorrect');
  }

  // Vérifier le mot de passe
  const motDePasseCorrect = await bcrypt.compare(
    mot_de_passe,
    utilisateur.mot_de_passe_hash
  );

  if (!motDePasseCorrect) {
    throw new Error('Email ou mot de passe incorrect');
  }

  // Créer le token JWT
  // Ce token prouve que l'utilisateur est connecté
  const token = jwt.sign(
    {
      id: utilisateur.id,
      email: utilisateur.email,
      role: utilisateur.role,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  // Retourner le token et les infos (sans mot de passe)
  const { mot_de_passe_hash, ...utilisateurSansMotDePasse } = utilisateur;
  return {
    token,
    utilisateur: utilisateurSansMotDePasse
  };
};

module.exports = { inscrireUtilisateur, connecterUtilisateur };