import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

function PatientDashboard() {
  const { utilisateur, deconnecter } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          <span className="text-xl font-bold text-blue-600">SanoVita</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Bonjour {utilisateur?.prenom}</span>
          <button onClick={deconnecter}
            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition">
            Deconnexion
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Mon espace patient
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/patient/rendez-vous"
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition text-center">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="font-bold text-gray-800">Mes rendez-vous</h3>
            <p className="text-gray-500 text-sm mt-1">Voir et gerer mes RDV</p>
          </Link>

          <Link to="/patient/medicaments"
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition text-center">
            <div className="text-4xl mb-3">💊</div>
            <h3 className="font-bold text-gray-800">Mes medicaments</h3>
            <p className="text-gray-500 text-sm mt-1">Voir mes rappels du jour</p>
          </Link>

          <Link to="/patient/chatbot"
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition text-center">
            <div className="text-4xl mb-3">🤖</div>
            <h3 className="font-bold text-gray-800">Chatbot medical</h3>
            <p className="text-gray-500 text-sm mt-1">Obtenir des conseils</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;