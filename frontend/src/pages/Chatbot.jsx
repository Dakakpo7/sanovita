import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Bonjour ! Je suis l assistant medical SanoVita. Comment puis-je vous aider aujourd hui ?'
    }
  ]);
  const [input, setInput] = useState('');
  const [chargement, setChargement] = useState(false);
  const finMessages = useRef(null);

  // Faire defiler automatiquement vers le bas
  useEffect(() => {
    finMessages.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Envoyer un message
  const envoyerMessage = async () => {
    if (!input.trim()) return;

    const messageUtilisateur = input.trim();
    setInput('');

    // Ajouter le message de l utilisateur
    const nouveauxMessages = [
      ...messages,
      { role: 'user', content: messageUtilisateur }
    ];
    setMessages(nouveauxMessages);
    setChargement(true);

    try {
      const reponse = await api.post('/chatbot/message', {
        message: messageUtilisateur,
        historique: messages
      });

      // Ajouter la reponse du chatbot
      setMessages([
        ...nouveauxMessages,
        { role: 'assistant', content: reponse.data.reponse }
      ]);

    } catch (erreur) {
      toast.error('Erreur lors de l envoi du message');
    } finally {
      setChargement(false);
    }
  };

  // Envoyer avec la touche Entree
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      envoyerMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* NAVBAR */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏥</span>
          <span className="text-xl font-bold text-blue-600">SanoVita</span>
        </div>
        <Link to="/patient/dashboard"
          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition">
          Retour au dashboard
        </Link>
      </nav>

      {/* HEADER CHATBOT */}
      <div className="bg-blue-600 text-white px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="bg-white rounded-full p-2">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">Assistant medical SanoVita</h1>
            <p className="text-blue-200 text-sm">
              Disponible 24h/24 pour vos questions de sante
            </p>
          </div>
        </div>
      </div>

      {/* AVERTISSEMENT */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
        <div className="max-w-2xl mx-auto">
          <p className="text-yellow-700 text-sm">
            ⚠️ Cet assistant fournit des conseils generaux uniquement.
            En cas d urgence, appelez le 15 ou consultez un medecin.
          </p>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-4">

          {messages.map((message, index) => (
            <div key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>

              {/* AVATAR CHATBOT */}
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-white text-sm">🤖</span>
                </div>
              )}

              {/* BULLE DE MESSAGE */}
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 shadow-sm rounded-bl-none'
              }`}>
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>

              {/* AVATAR UTILISATEUR */}
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center ml-3 flex-shrink-0">
                  <span className="text-gray-600 text-sm">👤</span>
                </div>
              )}

            </div>
          ))}

          {/* INDICATEUR DE CHARGEMENT */}
          {chargement && (
            <div className="flex justify-start">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm">🤖</span>
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl shadow-sm rounded-bl-none">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={finMessages} />
        </div>
      </div>

      {/* ZONE DE SAISIE */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Posez votre question medicale..."
            disabled={chargement}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            onClick={envoyerMessage}
            disabled={chargement || !input.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
            Envoyer
          </button>
        </div>

        {/* BOUTON CONTACTER UN MEDECIN */}
        <div className="max-w-2xl mx-auto mt-3">
          <Link to="/patient/rendez-vous"
            className="w-full block text-center bg-green-50 text-green-700 border border-green-200 py-2 rounded-xl text-sm font-medium hover:bg-green-100 transition">
            👨‍⚕️ Contacter un medecin maintenant
          </Link>
        </div>
      </div>

    </div>
  );
}

export default Chatbot;