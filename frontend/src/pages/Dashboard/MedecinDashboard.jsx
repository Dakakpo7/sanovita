import useAuthStore from '../../store/authStore';

function MedecinDashboard() {
  const { utilisateur, deconnecter } = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          <span className="text-xl font-bold text-blue-600">SanoVita</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Dr {utilisateur?.nom}</span>
          <button onClick={deconnecter}
            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition">
            Deconnexion
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          Mon espace medecin
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="font-bold text-gray-800">Mes consultations</h3>
            <p className="text-gray-500 text-sm mt-1">Voir mes rendez-vous</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-4xl mb-3">💊</div>
            <h3 className="font-bold text-gray-800">Prescriptions</h3>
            <p className="text-gray-500 text-sm mt-1">Gerer les ordonnances</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="font-bold text-gray-800">Observance</h3>
            <p className="text-gray-500 text-sm mt-1">Suivre les traitements</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedecinDashboard;