import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';
import { Heart, X, Briefcase, ArrowRight, Database, BarChart2, Loader2, AlertTriangle, Settings, Lock, MessageSquare } from 'lucide-react';

// --- 1. CONFIGURATION ---

const exportConfig = {
    apiKey: "AIzaSyBg9b3tYGtjVkKsyX4sNaEOt4R__SJ6Lug",
    authDomain: "sisley-pulse.firebaseapp.com",
    projectId: "sisley-pulse",
    storageBucket: "sisley-pulse.firebasestorage.app",
    messagingSenderId: "568190753552",
    appId: "1:568190753552:web:2473abdfb47965689be395"
  };

// URL Webhook Lecture
const STARTUPS_API_URL = "https://hook.eu2.make.com/dadbhexrl4j37yxbsa1nfvm1bq46j787"; 

// URL Webhook Écriture
const NOTION_WEBHOOK_URL = "https://hook.eu2.make.com/kcv8aaztdoaapiwwhwjfovgl4tc52mvo"; 

const ADMIN_PASSWORD = "SISLEY2025"; 

// Liste de secours
const STATIC_STARTUPS = [
  "Ecklo", "Veesual", "Metagora", "Dialog", "Getinside", "Azoma", "Albatrross.ai", "BioHive", "HABS.ai", "Aive"
];
const SENTIMENTS = ['🔥', '🚧', '❄️'];

// --- B. Logique Hybride ---
const isCanvasEnv = typeof __firebase_config !== 'undefined';
const firebaseConfig = isCanvasEnv ? JSON.parse(__firebase_config) : exportConfig;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

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

const COLLECTION_NAME = isCanvasEnv 
  ? `artifacts/${appId}/public/data/sisley_pulse` 
  : 'sisley_pulse_feedback'; 

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
  
  const [startupList, setStartupList] = useState(STATIC_STARTUPS); 
  // const [connectionStatus, setConnectionStatus] = useState('idle'); // Retiré car plus affiché
  
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [database, setDatabase] = useState([]); 
  const [showDatabase, setShowDatabase] = useState(false);

  // Auto-style
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);

  // --- CHARGEMENT ROBUSTE ---
  const fetchStartups = async () => {
    if (!STARTUPS_API_URL) return;
    
    // setConnectionStatus('loading');
    try {
        const res = await fetch(STARTUPS_API_URL, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        const text = await res.text();
        
        let data = null;
        try { 
            data = JSON.parse(text); 
        } catch (e) {
            // Tentative de réparation si Make renvoie des simples quotes
            try { data = JSON.parse(text.replace(/'/g, '"')); } catch(e2) {}
        }

        if (data && (Array.isArray(data) || (typeof data === 'object'))) {
            let items = [];
            if (Array.isArray(data)) items = data;
            else if (data.body && Array.isArray(data.body)) items = data.body;
            else items = Object.values(data);
            
            // Extraction des noms
            const names = items.map(item => {
                if (typeof item === 'string') return item;
                return item.name || item.Name || item.title || item.Title || item.properties?.Name?.title?.[0]?.plain_text || null;
            }).filter(n => n);
            
            if (names.length > 0) {
                setStartupList(names);
                // setConnectionStatus('success');
            } else {
                // Liste vide reçue
                // setConnectionStatus('error'); 
            }
        } else {
            throw new Error("Format invalide");
        }
    } catch (err) {
        console.error("Erreur Make:", err);
        // setConnectionStatus('error'); // Restera sur la liste statique
    }
  };

  useEffect(() => {
    fetchStartups();
  }, []);

  // Dropdown close
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Auth
  const isConfigured = isCanvasEnv || (!configError && firebaseConfig.apiKey && firebaseConfig.apiKey !== "VOTRE_API_KEY_ICI");

  useEffect(() => {
    if (!isConfigured) return;
    const initAuth = async () => {
      try {
        if (isCanvasEnv && typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
           await signInWithCustomToken(auth, __initial_auth_token);
        } else {
           await signInAnonymously(auth);
        }
      } catch (error) { console.error("Erreur Auth:", error); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => setAuthUser(u));
    return () => unsubscribe();
  }, [isConfigured]);

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

  // Actions
  const handleLogin = (e) => { e.preventDefault(); if (user.firstName && user.lastName) setStep('swipe'); };
  
  const handleSwipe = (direction) => {
    setSwipeDirection(direction);
    setTimeout(() => { if (direction === 'left') { saveEntry(false, []); } else { setStep('details'); } setSwipeDirection(null); }, 400);
  };

  const addStartup = (nameOverride) => {
    const nameToAdd = nameOverride || currentStartupInput.trim();
    if (nameToAdd) {
      if (!selectedStartups.some(s => s.name === nameToAdd)) {
        setSelectedStartups([...selectedStartups, { name: nameToAdd, sentiment: '🔥', comment: '' }]);
      }
      setCurrentStartupInput('');
      setShowDropdown(false);
    }
  };

  const cycleSentiment = (index) => {
    const newStartups = [...selectedStartups];
    const nextIndex = (SENTIMENTS.indexOf(newStartups[index].sentiment) + 1) % SENTIMENTS.length;
    newStartups[index].sentiment = SENTIMENTS[nextIndex];
    setSelectedStartups(newStartups);
  };

  const updateComment = (index, text) => {
    const newStartups = [...selectedStartups];
    newStartups[index].comment = text;
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
    const payload = {
      firstName: user.firstName,
      lastName: user.lastName,
      userDisplay: `${user.firstName} ${user.lastName}`,
      collaborated: collaborated,
      startups: startupsList,
      timestamp: new Date().toISOString(),
      readableDate: new Date().toLocaleDateString('fr-FR')
    };
    try {
      await addDoc(collection(db, COLLECTION_NAME), payload);
      if (NOTION_WEBHOOK_URL) {
        fetch(NOTION_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(err => console.error("Erreur Make Ecriture:", err));
      }
      setStep('success');
    } catch (e) { alert("Erreur sauvegarde."); }
    setIsSubmitting(false);
  };

  const resetApp = () => { setUser({ firstName: '', lastName: '' }); setSelectedStartups([]); setStep('login'); };

  const filteredStartups = startupList.filter(s => 
    s.toLowerCase().includes(currentStartupInput.toLowerCase()) && !selectedStartups.some(sel => sel.name === s)
  );

  // --- RENDU ---

  if (!isConfigured) return <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6 text-center text-gray-500 font-sans">Configuration requise (Firebase).</div>;

  if (step === 'login') return (
    <ScreenWrapper>
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="mb-8 text-center"><h1 className="text-3xl font-serif font-bold text-gray-900 tracking-wider mb-2">SISLEY PULSE</h1><p className="text-gray-500 text-sm">L'innovation en un geste.</p></div>
        <form onSubmit={handleLogin} className="w-full space-y-4">
          <input type="text" required value={user.firstName} onChange={(e) => setUser({...user, firstName: e.target.value})} className="w-full border-b-2 border-gray-200 py-2 text-lg focus:outline-none focus:border-black" placeholder="Prénom (ex: Julie)" />
          <input type="text" required value={user.lastName} onChange={(e) => setUser({...user, lastName: e.target.value})} className="w-full border-b-2 border-gray-200 py-2 text-lg focus:outline-none focus:border-black" placeholder="Nom (ex: Martin)" />
          <Button onClick={handleLogin} className="w-full mt-8" loading={!authUser}>{authUser ? "Commencer" : "Connexion..."}</Button>
        </form>
      </div>
      <Footer onOpenAdmin={() => setShowDatabase(true)} />
      {showDatabase && <DatabaseView data={database} onClose={() => setShowDatabase(false)} />}
    </ScreenWrapper>
  );

  if (step === 'swipe') return (
    <ScreenWrapper>
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-6 left-0 right-0 text-center"><span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Semestre 2 - 2025</span></div>
        <div className={`relative w-full aspect-[4/5] max-h-[400px] bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center justify-center p-6 transition-all duration-500 transform ${swipeDirection === 'left' ? '-translate-x-full -rotate-12 opacity-0' : ''} ${swipeDirection === 'right' ? 'translate-x-full rotate-12 opacity-0' : ''}`}>
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6"><Briefcase className="text-purple-600" size={32} /></div>
          <h2 className="text-xl font-serif font-bold text-gray-800 mb-3 text-center">Collaboration Startup ?</h2>
          <p className="text-gray-400 text-xs px-2 text-center">Au cours des 6 derniers mois.</p>
        </div>
        <div className="flex items-center gap-8 mt-10">
          <button onClick={() => handleSwipe('left')} className="w-16 h-16 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-red-500 hover:scale-110 transition-all"><X size={32} /></button>
          <button onClick={() => handleSwipe('right')} className="w-16 h-16 rounded-full bg-black shadow-lg flex items-center justify-center text-green-400 hover:scale-110 transition-all"><Heart size={30} fill="currentColor" className="mt-1" /></button>
        </div>
      </div>
    </ScreenWrapper>
  );

  if (step === 'details') return (
    <ScreenWrapper>
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <div className="mb-6"><h2 className="text-2xl font-serif font-bold text-gray-900 mb-1">C'est un Match ! ⚡️</h2><p className="text-gray-500 text-sm">Quelles startups et quel feeling ?</p></div>
        <div className="flex-1">
          <div className="flex flex-col gap-4 mb-6">
            {selectedStartups.map((s, i) => (
              <div key={i} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm animate-fade-in">
                <div className="flex items-center justify-between mb-3"><span className="font-bold text-gray-800 truncate">{s.name}</span><div className="flex items-center gap-2"><button onClick={() => cycleSentiment(i)} className="bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded-lg text-lg border border-gray-200 transition-colors">{s.sentiment}</button><button onClick={() => removeStartup(i)} className="text-gray-300 hover:text-red-500 p-1"><X size={18} /></button></div></div>
                <div className="relative"><div className="absolute top-3 left-3 text-gray-400"><MessageSquare size={14} /></div><textarea value={s.comment} onChange={(e) => updateComment(i, e.target.value)} placeholder="Commentaire..." className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2 pl-9 pr-3 text-xs text-gray-700 focus:outline-none focus:bg-white focus:border-gray-300 transition-all resize-none h-16" /></div>
              </div>
            ))}
            {selectedStartups.length === 0 && <span className="text-gray-400 italic text-sm text-center py-8 block bg-gray-50 rounded-xl border border-dashed border-gray-200">Ajoute une startup ci-dessous...</span>}
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6" ref={dropdownRef}>
            <div className="mb-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Ajouter une Startup</label>
            </div>
            <div className="flex gap-2 relative">
              <div className="relative flex-1">
                <input type="text" value={currentStartupInput} onChange={(e) => { setCurrentStartupInput(e.target.value); setShowDropdown(true); }} onFocus={() => setShowDropdown(true)} onKeyDown={(e) => e.key === 'Enter' && addStartup()} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all" placeholder="Rechercher..." />
                {showDropdown && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-100 mt-1 rounded-lg shadow-xl max-h-48 overflow-y-auto animate-fade-in">
                    {filteredStartups.length > 0 ? filteredStartups.map((s, i) => ( <li key={i} className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-50 last:border-0 text-gray-700" onClick={() => addStartup(s)}>{s}</li> )) : ( <li className="px-4 py-2 text-xs text-gray-400 italic">Aucune correspondance. + pour créer.</li> )}
                  </ul>
                )}
              </div>
              <button onClick={() => addStartup()} className="bg-black hover:bg-gray-800 text-white rounded-lg px-4 font-bold text-xl transition-colors">+</button>
            </div>
          </div>
        </div>
        <div className="mt-auto pt-4"><Button onClick={() => saveEntry(true, selectedStartups)} className="w-full" disabled={selectedStartups.length === 0} loading={isSubmitting}>Valider</Button><button onClick={() => setStep('swipe')} className="w-full text-center text-gray-400 text-xs mt-4 hover:text-gray-600">Retour</button></div>
      </div>
    </ScreenWrapper>
  );

  if (step === 'success') return (
    <ScreenWrapper>
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce"><Heart className="text-green-600 mt-2" size={40} fill="currentColor" /></div>
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

// WRAPPER AVEC STYLE DE SECURITE POUR LE CENTRAGE FORCE
const ScreenWrapper = ({ children }) => (
  <div 
    className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4 font-sans"
    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%' }} // Style inline de secours
  >
    <div className="w-full max-w-md bg-white min-h-[600px] rounded-3xl shadow-2xl overflow-hidden relative flex flex-col mx-auto">
      {children}
    </div>
  </div>
);

const Footer = ({ onOpenAdmin }) => (<footer className="w-full bg-white border-t border-gray-200 p-3 flex justify-between items-center text-xs text-gray-400"><span className="pl-4">Sisley Innovation Lab v2.7</span><button onClick={onOpenAdmin} className="flex items-center gap-1 hover:text-black transition-colors pr-4"><BarChart2 size={14} /> Admin</button></footer>);
const DatabaseView = ({ data, onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); const [password, setPassword] = useState(''); const [error, setError] = useState(false);
  const handleAuth = (e) => { e.preventDefault(); if (password === ADMIN_PASSWORD) { setIsAuthenticated(true); setError(false); } else { setError(true); } };
  if (!isAuthenticated) return (<div className="absolute inset-0 bg-white z-50 flex flex-col animate-slide-up"><div className="bg-black text-white p-4 flex justify-between items-center shadow-md shrink-0"><div className="flex items-center gap-2"><Database size={18} /><h2 className="font-bold tracking-wider text-sm">ADMIN ACCESS</h2></div><button onClick={onClose} className="bg-gray-800 p-2 rounded-full hover:bg-gray-700"><X size={18}/></button></div><div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50"><div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-xs text-center border border-gray-100"><div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6 mx-auto"><Lock size={32} className="text-gray-600"/></div><h3 className="text-lg font-bold mb-4 text-gray-800">Accès Sécurisé</h3><form onSubmit={handleAuth} className="space-y-4"><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black transition-all" autoFocus />{error && <p className="text-red-500 text-xs font-medium">Mot de passe incorrect</p>}<button type="submit" className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">Voir les données</button></form><p className="mt-6 text-xs text-gray-400">Sisley Internal Only</p></div></div></div>);
  return (<div className="absolute inset-0 bg-white z-50 flex flex-col animate-slide-up"><div className="bg-black text-white p-4 flex justify-between items-center shadow-md shrink-0"><div className="flex items-center gap-2"><Database size={18} /><h2 className="font-bold tracking-wider text-sm">SISLEY DATA HUB</h2></div><button onClick={onClose} className="bg-gray-800 p-2 rounded-full hover:bg-gray-700"><X size={18}/></button></div><div className="flex-1 overflow-auto p-4 bg-gray-50"><div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">{data.length === 0 && <div className="p-8 text-center text-gray-400 italic">Aucune donnée...</div>}<table className="w-full text-sm text-left"><thead className="bg-gray-50 text-gray-500 uppercase text-xs"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Qui</th><th className="px-4 py-3">Startups & Avis</th></tr></thead><tbody className="divide-y divide-gray-100">{data.map((entry) => (<tr key={entry.id}><td className="px-4 py-3 text-gray-500 text-xs align-top">{entry.readableDate}</td><td className="px-4 py-3 font-medium align-top">{entry.userDisplay}</td><td className="px-4 py-3"><div className="flex flex-col gap-2">{entry.collaborated ? (entry.startups || []).map((s, i) => (<div key={i} className="bg-purple-50 text-purple-900 px-3 py-2 rounded-lg text-xs border border-purple-100"><div className="flex items-center gap-2 font-bold mb-1">{s.name} <span className="text-sm">{s.sentiment}</span></div>{s.comment && <div className="text-purple-700 italic border-t border-purple-100 pt-1 mt-1">"{s.comment}"</div>}</div>)) : <span className="text-gray-400 text-xs">NON</span>}</div></td></tr>))}</tbody></table></div></div></div>);
};
