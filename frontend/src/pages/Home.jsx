import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">

      {/* NAVBAR */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          <span className="text-xl font-bold text-blue-600">SanoVita</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login"
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition">
            Connexion
          </Link>
          <Link to="/register"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            S inscrire
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          Votre sante,
          <span className="text-blue-600"> partout </span>
          et a tout moment
        </h1>
        <p className="text-xl text-gray-600 mb-10">
          Consultez un medecin en ligne, prenez des rendez-vous et
          ne ratez plus jamais votre traitement avec SanoVita.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register"
            className="px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-medium hover:bg-blue-700 transition">
            Commencer gratuitement
          </Link>
          <Link to="/login"
            className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl text-lg font-medium hover:bg-blue-50 transition">
            Se connecter
          </Link>
        </div>
      </div>

      {/* FONCTIONNALITES */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Tout ce dont vous avez besoin
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="font-bold text-gray-800 mb-2">Rendez-vous</h3>
            <p className="text-gray-600 text-sm">
              Reservez un creneau avec un medecin en quelques clics
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-4xl mb-4">🎥</div>
            <h3 className="font-bold text-gray-800 mb-2">Consultation video</h3>
            <p className="text-gray-600 text-sm">
              Consultez votre medecin en video depuis chez vous
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-4xl mb-4">💊</div>
            <h3 className="font-bold text-gray-800 mb-2">Rappels medicaments</h3>
            <p className="text-gray-600 text-sm">
              Ne ratez plus jamais votre traitement grace aux rappels automatiques
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="font-bold text-gray-800 mb-2">Chatbot medical</h3>
            <p className="text-gray-600 text-sm">
              Obtenez des conseils medicaux 24h/24 avec notre IA
            </p>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-gray-800 text-white text-center py-8 mt-16">
        <p className="text-lg font-bold mb-2">🏥 SanoVita</p>
        <p className="text-gray-400 text-sm">
          Votre plateforme de sante numerique
        </p>
      </footer>

    </div>
  );
}

export default Home;