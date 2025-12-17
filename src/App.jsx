import React, { useState, useEffect } from 'react';
// Importation des services Firebase
import { initializeApp } from 'firebase/app';
// Note: Pour une app publique simple, on utilise l'auth anonyme
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';
// Importation des icônes Lucide
import { Heart, X, Briefcase, ArrowRight, Database, BarChart2, Loader2, AlertTriangle, Settings, Lock } from 'lucide-react';

// --- 1. CONFIGURATION FIREBASE ---

// A. Configuration pour l'EXPORT (À REMPLIR avec vos clés de console.firebase.google.com)
const exportConfig = {
    apiKey: "AIzaSyBg9b3tYGtjVkKsyX4sNaEOt4R__SJ6Lug",
    authDomain: "sisley-pulse.firebaseapp.com",
    projectId: "sisley-pulse",
    storageBucket: "sisley-pulse.firebasestorage.app",
    messagingSenderId: "568190753552",
    appId: "1:568190753552:web:2473abdfb47965689be395"
  };

// B. Logique Hybride (Détection automatique de l'environnement)
// Si on est dans Canvas (ici), on utilise la config interne. Sinon, on utilise exportConfig.
const isCanvasEnv = typeof __firebase_config !== 'undefined';
const firebaseConfig = isCanvasEnv ? JSON.parse(__firebase_config) : exportConfig;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Initialisation Sécurisée
let app, auth, db;
let configError = false;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.error("Erreur Init Firebase:", e);
  configError = true;
}

// Nom de la collection
const COLLECTION_NAME = isCanvasEnv 
  ? `artifacts/${appId}/public/data/sisley_pulse` // Chemin Canvas
  : 'sisley_pulse_feedback'; // Chemin Export

// --- 2. DONNÉES STATIQUES ---
const KNOWN_STARTUPS = [
  "HapticMedia", "Woop", "Contentsquare", "Veesual", "Replika", "Midjourney", "OpenAI", "Yuka", "Algolia"
];
const SENTIMENTS = ['🔥', '🚧', '❄️'];
const ADMIN_PASSWORD = "SISLEY2025"; // MOT DE PASSE ADMIN

// --- 3. COMPOSANTS UI ---
const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, loading = false }) => {
  const baseStyle = "px-6 py-3 rounded-full font-medium transition-all duration-200 transform active:scale-95 shadow-md flex items-center justify-center gap-2";
  const disabledStyle = "opacity-50 cursor-not-allowed active:scale-100";
  const variants = {
    primary: "bg-black text-white hover:bg-gray-800",
    secondary: "bg-white text-black border border-gray-200 hover:bg-gray-50",
    ghost: "bg-transparent text-gray-500 hover:text-black shadow-none"
  };
  return (
    <button onClick={onClick} disabled={disabled || loading} className={`${baseStyle} ${variants[variant]} ${disabled || loading ? disabledStyle : ''} ${className}`}>
      {loading ? <Loader2 size={20} className="animate-spin" /> : children}
    </button>
  );
};

// --- 4. APP PRINCIPALE ---
export default function App() {
  const [step, setStep] = useState('login'); 
  const [user, setUser] = useState({ firstName: '', lastName: '' });
  const [swipeDirection, setSwipeDirection] = useState(null); 
  const [selectedStartups, setSelectedStartups] = useState([]);
  const [currentStartupInput, setCurrentStartupInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [database, setDatabase] = useState([]); 
  const [showDatabase, setShowDatabase] = useState(false);

  // --- AUTO-RÉPARATION DU STYLE ---
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);

  // Vérification de la configuration au montage
  const isConfigured = !configError && firebaseConfig.apiKey && firebaseConfig.apiKey !== "VOTRE_API_KEY_ICI";

  // Authentification
  useEffect(() => {
    if (!isConfigured) return;

    const initAuth = async () => {
      try {
        if (isCanvasEnv && typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
           await signInWithCustomToken(auth, __initial_auth_token);
        } else {
           await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Erreur Auth:", error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => setAuthUser(u));
    return () => unsubscribe();
  }, [isConfigured]);

  // Écoute temps réel des données
  useEffect(() => {
    if (!authUser || !isConfigured) return;
    try {
        const unsubscribe = onSnapshot(collection(db, COLLECTION_NAME), (snapshot) => {
          const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          setDatabase(entries);
        }, (error) => console.error("Erreur DB:", error));
        return () => unsubscribe();
    } catch(e) { console.error("Erreur Snapshot:", e); }
  }, [authUser, isConfigured]);

  // --- LOGIQUE MÉTIER ---

  const handleLogin = (e) => {
    e.preventDefault();
    if (user.firstName && user.lastName) setStep('swipe');
  };

  const handleSwipe = (direction) => {
    setSwipeDirection(direction);
    setTimeout(() => {
      if (direction === 'left') {
        saveEntry(false, []);
      } else {
        setStep('details');
      }
      setSwipeDirection(null);
    }, 400);
  };

  const addStartup = () => {
    if (currentStartupInput.trim()) {
      const name = currentStartupInput.trim();
      if (!selectedStartups.some(s => s.name === name)) {
        setSelectedStartups([...selectedStartups, { name: name, sentiment: '🔥' }]);
      }
      setCurrentStartupInput('');
    }
  };

  const cycleSentiment = (index) => {
    const newStartups = [...selectedStartups];
    const currentSent = newStartups[index].sentiment;
    const nextIndex = (SENTIMENTS.indexOf(currentSent) + 1) % SENTIMENTS.length;
    newStartups[index].sentiment = SENTIMENTS[nextIndex];
    setSelectedStartups(newStartups);
  };

  const removeStartup = (index) => {
    const newStartups = [...selectedStartups];
    newStartups.splice(index, 1);
    setSelectedStartups(newStartups);
  };

  const saveEntry = async (collaborated, startupsList) => {
    setIsSubmitting(true);
    if (!authUser) return;
    try {
      await addDoc(collection(db, COLLECTION_NAME), {
        firstName: user.firstName,
        lastName: user.lastName,
        userDisplay: `${user.firstName} ${user.lastName}`,
        collaborated: collaborated,
        startups: startupsList,
        timestamp: new Date().toISOString(),
        readableDate: new Date().toLocaleDateString('fr-FR')
      });
      setStep('success');
    } catch (e) {
      alert("Erreur de sauvegarde: " + e.message);
    }
    setIsSubmitting(false);
  };

  const resetApp = () => {
    setUser({ firstName: '', lastName: '' });
    setSelectedStartups([]);
    setStep('login');
  };

  // --- ÉCRAN DE CONFIGURATION REQUISE (Pour l'Export) ---
  if (!isConfigured) return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gray-100 p-6 font-sans text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-100">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6 mx-auto">
          <AlertTriangle className="text-red-500" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Configuration Requise</h2>
        <p className="text-gray-600 mb-6 text-sm leading-relaxed">
          Pour mettre cette app en ligne, connectez votre base de données <strong>Firebase</strong>.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg text-left mb-6 border border-gray-200">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2"><Settings size={12} /> Instructions</h3>
          <ol className="text-xs text-gray-600 space-y-2 list-decimal list-inside">
            <li>Ouvrez le fichier <code>App.js</code>.</li>
            <li>Remplacez <code>"VOTRE_API_KEY_ICI"</code> par vos clés Firebase.</li>
          </ol>
        </div>
      </div>
    </div>
  );

  // --- VUES NORMALES ---

  if (step === 'login') return (
    <ScreenWrapper>
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-serif font-bold text-gray-900 tracking-wider mb-2">SISLEY PULSE</h1>
          <p className="text-gray-500 text-sm">L'innovation en un geste.</p>
        </div>
        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Prénom</label>
            <input type="text" required value={user.firstName} onChange={(e) => setUser({...user, firstName: e.target.value})} className="w-full border-b-2 border-gray-200 py-2 text-lg focus:outline-none focus:border-black" placeholder="Ex: Julie" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Nom</label>
            <input type="text" required value={user.lastName} onChange={(e) => setUser({...user, lastName: e.target.value})} className="w-full border-b-2 border-gray-200 py-2 text-lg focus:outline-none focus:border-black" placeholder="Ex: Martin" />
          </div>
          <Button onClick={handleLogin} className="w-full mt-8" loading={!authUser}>
            {authUser ? <span className="flex items-center gap-2">Commencer <ArrowRight size={18}/></span> : "Connexion..."}
          </Button>
        </form>
      </div>
      <Footer onOpenAdmin={() => setShowDatabase(true)} />
      {showDatabase && <DatabaseView data={database} onClose={() => setShowDatabase(false)} />}
    </ScreenWrapper>
  );

  if (step === 'swipe') return (
    <ScreenWrapper>
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-6 left-0 right-0 text-center">
          <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Semestre 2 - 2025</span>
        </div>
        
        {/* Carte de Swipe */}
        <div className={`relative w-full aspect-[4/5] max-h-[400px] bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center justify-center p-6 transition-all duration-500 transform ${swipeDirection === 'left' ? '-translate-x-full -rotate-12 opacity-0' : ''} ${swipeDirection === 'right' ? 'translate-x-full rotate-12 opacity-0' : ''}`}>
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
            <Briefcase className="text-purple-600" size={32} />
          </div>
          <h2 className="text-xl font-serif font-bold text-gray-800 mb-3 leading-tight text-center">Avez-vous collaboré avec une Startup ?</h2>
          <p className="text-gray-400 text-xs px-2 text-center">Au cours des 6 derniers mois.</p>
        </div>

        <div className="flex items-center gap-8 mt-10">
          <button onClick={() => handleSwipe('left')} className="w-16 h-16 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-red-500 hover:scale-110 transition-all active:scale-95">
            <X size={32} />
          </button>
          <button onClick={() => handleSwipe('right')} className="w-16 h-16 rounded-full bg-black shadow-lg flex items-center justify-center text-green-400 hover:scale-110 transition-all active:scale-95">
            <Heart size={30} fill="currentColor" className="mt-1" />
          </button>
        </div>
      </div>
    </ScreenWrapper>
  );

  if (step === 'details') return (
    <ScreenWrapper>
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">C'est un Match ! ⚡️</h2>
          <p className="text-gray-500 text-sm">Quelles startups et quel feeling ?</p>
        </div>
        
        <div className="flex-1">
          {/* Liste des Startups */}
          <div className="flex flex-col gap-3 mb-6">
            {selectedStartups.map((s, i) => (
              <div key={i} className="bg-white border border-gray-200 p-3 rounded-xl flex items-center justify-between shadow-sm">
                <span className="font-medium text-sm ml-1 truncate max-w-[120px]">{s.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => cycleSentiment(i)} className="bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-lg border border-gray-200 transition-colors">
                    {s.sentiment}
                  </button>
                  <button onClick={() => removeStartup(i)} className="text-gray-300 hover:text-red-500 p-2"><X size={16} /></button>
                </div>
              </div>
            ))}
            {selectedStartups.length === 0 && <span className="text-gray-400 italic text-sm text-center py-8 block bg-gray-50 rounded-xl border border-dashed border-gray-200">Ajoute une startup ci-dessous...</span>}
          </div>

          {/* Input */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Ajouter une Startup</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input type="text" value={currentStartupInput} onChange={(e) => setCurrentStartupInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addStartup()} className="w-full bg-gray-50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="Rechercher..." list="startup-suggestions" />
                <datalist id="startup-suggestions">{KNOWN_STARTUPS.map(s => <option key={s} value={s} />)}</datalist>
              </div>
              <button onClick={addStartup} className="bg-gray-100 hover:bg-gray-200 text-black rounded-lg px-4 font-bold text-xl">+</button>
            </div>
          </div>

          <div className="flex justify-center items-center gap-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg mx-auto mb-4">
            <div className="flex items-center gap-1.5"><span className="text-base">🔥</span> Top</div>
            <div className="w-px h-3 bg-gray-300"></div>
            <div className="flex items-center gap-1.5"><span className="text-base">🚧</span> Moyen</div>
            <div className="w-px h-3 bg-gray-300"></div>
            <div className="flex items-center gap-1.5"><span className="text-base">❄️</span> Froid</div>
          </div>
        </div>
        
        <div className="mt-auto pt-4">
          <Button onClick={() => saveEntry(true, selectedStartups)} className="w-full" disabled={selectedStartups.length === 0} loading={isSubmitting}>Valider</Button>
          <button onClick={() => setStep('swipe')} className="w-full text-center text-gray-400 text-xs mt-4 hover:text-gray-600">Retour</button>
        </div>
      </div>
    </ScreenWrapper>
  );

  if (step === 'success') return (
    <ScreenWrapper>
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <Heart className="text-green-600 mt-2" size={40} fill="currentColor" />
        </div>
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">Merci {user.firstName} !</h2>
        <p className="text-gray-500 mb-8">Ta contribution aide Sisley à innover.</p>
        <Button onClick={resetApp} variant="secondary">Nouvelle entrée</Button>
      </div>
      <Footer onOpenAdmin={() => setShowDatabase(true)} />
      {showDatabase && <DatabaseView data={database} onClose={() => setShowDatabase(false)} />}
    </ScreenWrapper>
  );

  return null;
}

// --- SOUS-COMPOSANTS ---

// WRAPPER DE MISE EN PAGE (Fixe le centrage)
const ScreenWrapper = ({ children }) => (
  // Ajout de w-full pour garantir l'occupation de la largeur et flex pour centrer
  <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4 font-sans">
    <div className="w-full max-w-md bg-white min-h-[600px] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col">
      {children}
    </div>
  </div>
);

const Footer = ({ onOpenAdmin }) => (
  <footer className="w-full bg-white border-t border-gray-200 p-3 flex justify-between items-center text-xs text-gray-400">
    <span className="pl-4">Sisley Innovation Lab vFinal</span>
    <button onClick={onOpenAdmin} className="flex items-center gap-1 hover:text-black transition-colors pr-4"><BarChart2 size={14} /> Admin</button>
  </footer>
);

const DatabaseView = ({ data, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleAuth = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="absolute inset-0 bg-white z-50 flex flex-col animate-slide-up">
        <div className="bg-black text-white p-4 flex justify-between items-center shadow-md shrink-0">
             <div className="flex items-center gap-2"><Database size={18} /><h2 className="font-bold tracking-wider text-sm">ADMIN ACCESS</h2></div>
             <button onClick={onClose} className="bg-gray-800 p-2 rounded-full hover:bg-gray-700"><X size={18}/></button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-xs text-center border border-gray-100">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <Lock size={32} className="text-gray-600"/>
                </div>
                <h3 className="text-lg font-bold mb-4 text-gray-800">Accès Sécurisé</h3>
                <form onSubmit={handleAuth} className="space-y-4">
                    <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mot de passe"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                        autoFocus
                    />
                    {error && <p className="text-red-500 text-xs font-medium">Mot de passe incorrect</p>}
                    <button type="submit" className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                        Voir les données
                    </button>
                </form>
                <p className="mt-6 text-xs text-gray-400">Sisley Internal Only</p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col animate-slide-up">
      <div className="bg-black text-white p-4 flex justify-between items-center shadow-md shrink-0">
        <div className="flex items-center gap-2"><Database size={18} /><h2 className="font-bold tracking-wider text-sm">SISLEY DATA HUB</h2></div>
        <button onClick={onClose} className="bg-gray-800 p-2 rounded-full hover:bg-gray-700"><X size={18}/></button>
      </div>
      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {data.length === 0 && <div className="p-8 text-center text-gray-400 italic">Aucune donnée...</div>}
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Qui</th><th className="px-4 py-3">Startups</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-3 text-gray-500 text-xs">{entry.readableDate}</td>
                  <td className="px-4 py-3 font-medium">{entry.userDisplay}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {entry.collaborated ? (entry.startups || []).map((s, i) => (
                        <span key={i} className="bg-purple-50 text-purple-900 px-2 py-1 rounded text-xs border border-purple-100 flex gap-1">{s.name} {s.sentiment}</span>
                      )) : <span className="text-gray-400 text-xs">NON</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
