const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

// Algorithme de chiffrement
const ALGORITHME = 'aes-256-cbc';

// Cle de chiffrement depuis les variables d environnement
const getCle = () => {
  const cle = process.env.ENCRYPTION_KEY;
  if (!cle) {
    throw new Error('La cle de chiffrement est manquante dans .env');
  }
  // S assurer que la cle fait exactement 32 caracteres
  return Buffer.from(cle.substring(0, 32).padEnd(32, '0'));
};

// =============================================
// CHIFFRER UNE DONNEE
// =============================================
const chiffrer = (texte) => {
  try {
    if (!texte) return null;

    const cle = getCle();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHME, cle, iv);

    let textChiffre = cipher.update(texte.toString(), 'utf8', 'hex');
    textChiffre += cipher.final('hex');

    // Retourner iv + texte chiffre
    return iv.toString('hex') + ':' + textChiffre;
  } catch (erreur) {
    throw new Error('Erreur lors du chiffrement : ' + erreur.message);
  }
};

// =============================================
// DECHIFFRER UNE DONNEE
// =============================================
const dechiffrer = (textChiffre) => {
  try {
    if (!textChiffre) return null;

    const cle = getCle();
    const [ivHex, contenu] = textChiffre.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHME, cle, iv);

    let texteDechiffre = decipher.update(contenu, 'hex', 'utf8');
    texteDechiffre += decipher.final('utf8');

    return texteDechiffre;
  } catch (erreur) {
    throw new Error('Erreur lors du dechiffrement : ' + erreur.message);
  }
};

module.exports = { chiffrer, dechiffrer };