const app = require('./src/app');
const dotenv = require('dotenv');
const { demarrerScheduler } = require('./src/modules/rappels/rappel.scheduler');

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('Serveur SanoVita demarre sur le port ' + PORT);
  console.log('URL locale : http://localhost:' + PORT);

  // Demarrer le scheduler de rappels
  demarrerScheduler();
});