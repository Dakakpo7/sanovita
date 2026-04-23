import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';
import AdminPanel from './pages/admin/AdminPanel';
// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/Dashboard/PatientDashboard';
import MedecinDashboard from './pages/Dashboard/MedecinDashboard';
import Medicaments from './pages/Medicaments';
import Chatbot from './pages/Chatbot';
import RendezVous from './pages/RendezVous';

// Composant pour proteger les routes privees
const RoutePrivee = ({ children, role }) => {
  const { estConnecte, utilisateur } = useAuthStore();

  if (!estConnecte) {
    return <Navigate to="/login" />;
  }

  if (role && utilisateur?.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Pages publiques */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Pages privees PATIENT */}
        <Route path="/patient/dashboard" element={
          <RoutePrivee role="PATIENT">
            <PatientDashboard />
          </RoutePrivee>
        } />
        <Route path="/patient/medicaments" element={
          <RoutePrivee role="PATIENT">
            <Medicaments />
          </RoutePrivee>
        } />
        <Route path="/patient/chatbot" element={
          <RoutePrivee role="PATIENT">
            <Chatbot />
          </RoutePrivee>
        } />
        <Route path="/patient/rendez-vous" element={
          <RoutePrivee role="PATIENT">
            <RendezVous />
          </RoutePrivee>
        } />

        {/* Pages privees MEDECIN */}
        <Route path="/medecin/dashboard" element={
          <RoutePrivee role="MEDECIN">
            <MedecinDashboard />
          </RoutePrivee>
        } />
        <Route path="/admin" element={
  <RoutePrivee role="ADMIN">
    <AdminPanel />
  </RoutePrivee>
} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;