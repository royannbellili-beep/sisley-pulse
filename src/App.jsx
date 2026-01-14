import React, { useState, useEffect, useRef } from 'react';
import { Heart, X, Briefcase, ArrowRight, Loader2, MessageSquare, Lock, CheckCircle, AlertCircle } from 'lucide-react';

// --- 1. CONFIGURATION ---

// URL Webhook Écriture (Votre scénario Make qui fonctionne)
const NOTION_WEBHOOK_URL = "https://hook.eu2.make.com/kcv8aaztdoaapiwwhwjfovgl4tc52mvo"; 

// --- 2. LISTE COMPLETE ISSUE DU CSV (200+ Startups) ---
const STATIC_STARTUPS = [
  "Datawork", "EnHywhere", "Trivia ", "Opole Panel Wiatrowy", "IDservice", "AXOMEGA-CARE", "COACH FOR EYES", "AR[t] Studio", "Japet", "Stockly", "Gino LegalTech", "Ohz studio", "Excense", "Lucy Mobility ", "HautAI", "Duo J&J", "Lootorium", "MOLD.PARIS", "Valterio", "Rota", "DataThings SA", "KLONA", "Action Positive (marque commercialisée Linka)", "Relicta Srl", "Corecyclage", "RSE Challenge", "GIOZA", "supermonday", "ROI Media", "Woola", "Vox Illud", "Au revoir carbone (RSE Challenge)", "Z#bre", "Fairspace", "NeuralTeks", "My Smart Journey", "Holoffice", "Whoz", "B.mind", "RTCX", "Charlie", "Ava", "Contour (Deleo) ", "iStaging", "Takeoff Xp", "Freschcup", "MaquillAR Studio", "Safecube", "Novelab", "Lucibel", "Artify", "Nawa technologies", "Yxir (Groupe EDF)", "Skiils", "Controlpack", "Asteria", "Tale of Data", "Sycon", "Novecal", "Renature (ex Tannerie Végétale)", "Hapster", "Sootenir", "Circularplace", "PulpoAR", "WE NETWORK", "RHEONIS", "Curebot", "Astora", "Sindup", "Iroony", "Semana", "AdScout.io", "Echo Analytics", "Rierino", "Vaibe", "Rocketium", "Dowino", "Enso", "SenseBioTek", "Loyale", "Hypotenuse AI", "Bounce", "PeakMetrics", "OnFabric", "Marelle Studio", "Scon AI", "Bibak", "Abyssale", "xTool", "Evelab Insight", "Notify", "Agence Les Initiés", "Facelift", "Woorikidsplus", "Muzard", "Center AI", "Aiphrodite", "LOOKALIKE SRL", "My S Life", "Rewake", "Lilaea", "Arxy", "Greenspark", "Yogi", "Storyly", "Celtra", "LiveCrew", "Achille AI", "Gocertify", "Kahoona", "InnAIO", "Kiud", "Talon.One", "The Forecasting Company", "Fairpatterns", "Didask", "Social+", "Azoma", "Oraclase.ai", "Manual.to", "Ask Monk", "Hippolyte.ai", "Bryanthings", "Samplistick", "HABS", "Chitose Matsuri", "Artpoint", "Red Mimicry", "Elora", "Unitee", "Snap Discovery", "Aivar", "Chat3D", "Sharebox. Co.", "Airudi", "Visualsyn (Glinda)", "Xitst", "Mini Green Power", "Understand tech", "Heralbony", "Twinit", "Clésame", "Creatant", "Deepixel (StyleAR)", "Celestory", "Mocli", "Good on you", "Go Ava", "Intuive", "Stern Tech", "Fairly Made", "Causal Foundry", "Marketon", "Made with intent", "Frontnow", "Syncly", "Vizit", "Fero", "Attentive", "Botify", "Alhena", "1440", "Dialog AI", "Crwizard", "Hypothenuse AI", "Vanish Standard", "Dassault Systèmes", "OWI", "Konatus", "Kiosk", "Data4job", "Nectar Social", "Veesual", "Infios", "Glassix", "Tagether", "Secret View", "Aura Vision", "Bria Ai", "DinMo", "Talkable", "Nimble", "Planet Purpose", "Visionairy ", "Monstock", "Trurating", "Eagle Eye", "Axonify", "Paytweak", "Cleed.ai", "Trybu", "Advertima", "Ealyx", "Yofi", "Jukee", "Twini.ai", "Airia", "Fanfare", "Doofinder", "Metreecs", "Voicebox (VBX AI)", "Nedap", "Curated4you", "Retail Reload", "Power.XYZ", "New Black", "Urbyn", "Footprints AI", "Niftmint", "Les Martines", "Pandobac", "WizyVision", "Trajaan", "Idyllic", "Airthings", "French Touch Factory", "Ouidrop", "Edzo", "Unless", "Jeen", "WeNow", "Uneole", "Affluences", "Algo’tech vision", "Qovoltis", "MEAL CANTEEN", "Human innovate", "Digifood", "ProGlove", "Clutch Rayn Production", "SKILLEO", "Popmii", "Carbonable", "Green technologies", "Quobly", "LightStim", "Reddot", "SAMP", "Pochet", "Skilleo", "MYOTHESIS ", "Astreva", "Yaggo", "Reelevant", "CreaKnow", "Canaery", "ANGELIA", "Tim sports ", "Airudit", "XR+", "Picomto", "Bodyguard", "Naked Energy", "MOFFI", "Coxibiz", "Greez", "Zenithpaths", "Vertile", "Lixo", "Retail VR", "Find & Order", "Talentry", "Wats", "Cosmetange", "Clientela", "Fintecture ", "Cesam", "Kataba", "Lucéat", "Les bois", "Stuart", "Aprex", "Ubigreen", "Beemetrix", "Selego", "Lyyti", "5discovery", "Opscidia", "Circularise ", "4InData", "Filament’OR", "Voltyo", "Engagement & Performance (Powerteam)", "Free-visit", "Napta ", "4Gift", "Physioquanta", "Les Nouveaux Géants ", "TKM - Technology Knowledge Metrix", "Bloom media", "Corpoderm", "Flowlity", "OliKrom", "Adrenalead ", "Unaöd", "Bohémienne", "Uptale", "ShareGroop", "MarqVision", "AAMS", "Maia-Be", "Advanced Track & Trace", "CENTILOC", "Skeepers (ex : Toky Woky)", "Zeplug", "KEMIWATT", "Aquaphys", "Ctrl S", "Spinalcom", "Skopai", "Kiosk-it", "Smartback", "Use insider", "HappyTrack", "Neurochain ", "Maison Colette", "Dronotec", "Sourcemap", "Akeen", "Treeseve", "BioHive innovations", "Sweetch Energy", "Ottobock", "All virtual", "Beesk", "Recnorec", "ABTasty (ex Dotaki)", "Kalima Blockchain", "Simbel", "K-process", "Bureau Bien Vu ", "Alterrae", "Mercaux", "Bioxegy", "Yinfy ⇒ Hair analyser & autres recherches", "VIDETICS", "E-VIRTUALITY", "Eclos Production", "Love your waste ", "NextUser", "Adyen", "Pollen AM", "Ergosanté", "Neobrain", "Solvenn ", "Stendo", "ChatLabs", "La vitre ", "Thank you and welcome", "Redflow", "EXO data", "http://4.builders", "Cosmecode", "Bonanza", "IOGA", "INVAIST", "Composia", "VitrumGlass", "Opack (=Le Petit Pack)", "Omi", "Trayvisor ", "Beautigloo", "SCorp-io", "Reetags", "DIAGRAMS Technologies", "Byzance", "Technis", "SolarGaps", "Skoleom", "InnovFast (Move2.digital)", "Jobradio", "Pi électronique ", "Ecofrugal Project SAS", "Tamplo", "Algentech", "PENBOX ", "Brandaudio", "Neoplants", "Goshaba", "Vely Velo ", "Osol", "Elocance", "Sociabble", "Bloom Biorenewables", "Magma Seaweed", "Gimii", "OPEN MIND Neurotechnologies", "ABTasty", "NeoDeal", "Questel", "Brandquad", "Oppscience", "My Job Glasses", "Hydrafacial", "Cognixion", "Spega (Pollogen)", "DecisionBrain", "Tribalee", "Forinov", "Butterfly XR Studio", "COMPACK", "DRIME", "Supermood", "Equanimity", "MerciYanis", "Ubu", "Workelo", "BioPhys", "FACILITI", "Ethypik", "Wind my roof", "Lactips", "Holis", "Metrikus", "UBBY ENERGY", "Releaf Paper", "Cosfibel ⇒ Projet diffuseur de parfum", "UMI", "COEXEL", "Wonderflow", "Eyesee", "Biomemory", "Groupe Altera", "Civiliz", "Emye", "Petrel", "Daaddo", "Linaé", "Aquila Data", "Orijinal", "VizioSense", "UP&CHARGE", "The WIW", "Self Care One", "Potions (maintenant ABtasty)", "Innovorder", "WATT ", "Overlap (= SkyBoy)", "Typeface", "N2F", "Toolearn", "HBP Group", "Beink Dream", "Circul'egg", "Arenzi", "German Bionic", "Seturon", "Ecklo", "Mentalista", "Nuvei", "Bioptimus", "Dataiads", "NEODOC", "Cohort", "Innov&sea", "Vacufit (Celluma)", "Covalba", "DWS", "EKOO", "Simplicité", "Fruggr", "Hypervision Technology ", "Qevlar AI", "ibridge people", "Sweep", "Aive", "LIVSPOT", "Poolp", "Metagora.tech", "Q°EMOTION FRANCE SAS", "Yourban ai", "Show me the REX", "D.Terre", "Upsellr", "Loopipak", "Deepreach", "Getinside", "Yampa", "OOTENTIK", "Instaply", "PAARLY", "Live Vendor", "Azira", "Market Espace", "Argos Metrics", "Albatross AI", "NetUp", "Skiptax", "Crownpeak (fredhopper solution)", "Algolia", "Ircam - Amplify", "Reelast", "Planeezy", "Pulp'in"
];

const SENTIMENTS = ['🔥', '🚧', '❄️'];

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
  
  // États pour le "NON" (Raison)
  const [noCollabReason, setNoCollabReason] = useState('');
  const [otherReasonText, setOtherReasonText] = useState('');

  // Utilisation directe de la liste statique
  const [startupList, setStartupList] = useState(STATIC_STARTUPS); 
  
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  const [showSentimentHint, setShowSentimentHint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-style
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
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

  // Actions
  const handleLogin = (e) => { e.preventDefault(); if (user.firstName && user.lastName) setStep('swipe'); };
  
  const handleSwipe = (direction) => {
    setSwipeDirection(direction);
    setTimeout(() => { 
        if (direction === 'left') { 
            setStep('reason'); 
        } else { 
            setStep('details'); 
        } 
        setSwipeDirection(null); 
    }, 400);
  };

  const addStartup = (nameOverride) => {
    const nameToAdd = nameOverride || currentStartupInput.trim();
    if (nameToAdd) {
      if (!selectedStartups.some(s => s.name === nameToAdd)) {
        setSelectedStartups([...selectedStartups, { name: nameToAdd, sentiment: '🔥', comment: '' }]);
        
        setShowSentimentHint(true);
        setTimeout(() => setShowSentimentHint(false), 3500); 
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
    
    if (showSentimentHint) setShowSentimentHint(false);
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

  // --- SAUVEGARDE DIRECTE VERS MAKE (NO FIREBASE) ---
  const saveEntry = async (collaborated, startupsList) => {
    setIsSubmitting(true);

    const basePayload = {
      firstName: user.firstName,
      lastName: user.lastName,
      userDisplay: `${user.firstName} ${user.lastName}`,
      collaborated: collaborated,
      reason: collaborated ? null : noCollabReason,
      reasonDetails: collaborated ? null : otherReasonText,
      timestamp: new Date().toISOString(),
      readableDate: new Date().toLocaleDateString('fr-FR')
    };

    try {
      if (NOTION_WEBHOOK_URL) {
          if (collaborated && startupsList.length > 0) {
              // Boucle d'envoi séquentiel pour garantir la création des lignes
              for (const startup of startupsList) {
                  const singlePayload = {
                      ...basePayload,
                      name: startup.name, 
                      sentiment: startup.sentiment,
                      comment: startup.comment,
                      startups: [startup] 
                  };
                  
                  await fetch(NOTION_WEBHOOK_URL, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(singlePayload)
                  });
                  
                  await new Promise(r => setTimeout(r, 150)); // Petite pause anti-spam
              }
          } else {
              // Envoi unique pour le NON - avec champs remplis pour Make
              const noCollabPayload = {
                  ...basePayload,
                  name: "Aucune collaboration", // Remplissage pour éviter les erreurs de mapping
                  sentiment: "N/A",
                  comment: noCollabReason === "Autre" ? otherReasonText : noCollabReason,
                  startups: []
              };

              await fetch(NOTION_WEBHOOK_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(noCollabPayload)
              });
          }
      }
      setStep('success');
    } catch (e) {
      console.error(e);
      alert("Erreur de connexion. Vérifiez votre réseau.");
    }
    setIsSubmitting(false);
  };

  const resetApp = () => { 
      setUser({ firstName: '', lastName: '' }); 
      setSelectedStartups([]); 
      setNoCollabReason('');
      setOtherReasonText('');
      setStep('login'); 
  };

  const filteredStartups = startupList.filter(s => 
    s.toLowerCase().includes(currentStartupInput.toLowerCase()) &&
    !selectedStartups.some(sel => sel.name === s)
  );

  // --- RENDU ---

  if (step === 'login') return (
    <ScreenWrapper>
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="mb-8 text-center"><h1 className="text-3xl font-serif font-bold text-gray-900 tracking-wider mb-2">SISLEY PULSE</h1><p className="text-gray-500 text-sm">L'innovation en un geste.</p></div>
        <form onSubmit={handleLogin} className="w-full space-y-4">
          <input type="text" required value={user.firstName} onChange={(e) => setUser({...user, firstName: e.target.value})} className="w-full border-b-2 border-gray-200 py-2 text-lg focus:outline-none focus:border-black" placeholder="Prénom (ex: Julie)" />
          <input type="text" required value={user.lastName} onChange={(e) => setUser({...user, lastName: e.target.value})} className="w-full border-b-2 border-gray-200 py-2 text-lg focus:outline-none focus:border-black" placeholder="Nom (ex: Martin)" />
          <Button onClick={handleLogin} className="w-full mt-8">Commencer</Button>
        </form>
      </div>
      <Footer />
    </ScreenWrapper>
  );

  if (step === 'swipe') return (
    <ScreenWrapper>
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <div className="absolute top-6 left-0 right-0 text-center"><span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Semestre 2 - 2025</span></div>
        <div className={`relative w-full aspect-[4/5] max-h-[400px] bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center justify-center p-6 transition-all duration-500 transform ${swipeDirection === 'left' ? '-translate-x-full -rotate-12 opacity-0' : ''} ${swipeDirection === 'right' ? 'translate-x-full rotate-12 opacity-0' : ''}`}>
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6"><Briefcase className="text-purple-600" size={32} /></div>
          <h2 className="text-xl font-serif font-bold text-gray-800 mb-3 text-center">Avez-vous collaboré avec des startups ?</h2>
          <p className="text-gray-400 text-xs px-2 text-center">Au cours des 6 derniers mois.</p>
        </div>
        <div className="flex items-center gap-8 mt-10">
          <button onClick={() => handleSwipe('left')} className="w-16 h-16 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-red-500 hover:scale-110 transition-all"><X size={32} /></button>
          <button onClick={() => handleSwipe('right')} className="w-16 h-16 rounded-full bg-black shadow-lg flex items-center justify-center text-green-400 hover:scale-110 transition-all"><Heart size={30} fill="currentColor" className="mt-1" /></button>
        </div>
      </div>
    </ScreenWrapper>
  );

  if (step === 'reason') return (
    <ScreenWrapper>
      <div className="flex-1 flex flex-col p-8">
        <div className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Dites-nous tout ! 🧐</h2>
            <p className="text-gray-500 text-sm">Pourquoi n'avez-vous pas collaboré ce semestre ?</p>
        </div>
        <div className="space-y-3 flex-1">
            {["Pas courant dans mon métier", "Je ne connais pas bien l'univers startup", "Pas de besoin", "Autre"].map((option) => (
                <button key={option} onClick={() => { setNoCollabReason(option); if (option !== "Autre") setOtherReasonText(''); }} className={`w-full p-4 rounded-xl text-left text-sm font-medium border transition-all ${noCollabReason === option ? 'bg-black text-white border-black shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>{option}</button>
            ))}
            {noCollabReason === "Autre" && (
                <div className="animate-fade-in mt-2">
                    <textarea value={otherReasonText} onChange={(e) => setOtherReasonText(e.target.value)} placeholder="Précisez votre raison..." className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black min-h-[100px]" autoFocus />
                </div>
            )}
        </div>
        <div className="mt-auto pt-6">
            <Button onClick={() => saveEntry(false, [])} className="w-full" disabled={!noCollabReason || (noCollabReason === "Autre" && !otherReasonText.trim())} loading={isSubmitting}>Valider</Button>
            <button onClick={() => setStep('swipe')} className="w-full text-center text-gray-400 text-xs mt-4 hover:text-gray-600">Retour</button>
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
              <div key={i} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm animate-fade-in relative">
                <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-gray-800 truncate">{s.name}</span>
                    <div className="flex items-center gap-2 relative">
                        <div className="relative">
                            <button onClick={() => cycleSentiment(i)} className="bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded-lg text-lg border border-gray-200 transition-colors ring-2 ring-purple-100 ring-offset-1">{s.sentiment}</button>
                            {showSentimentHint && i === selectedStartups.length - 1 && (
                                <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-20 pointer-events-none">Tapez pour changer !<div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-black"></div></div>
                            )}
                        </div>
                        <button onClick={() => removeStartup(i)} className="text-gray-300 hover:text-red-500 p-1"><X size={18} /></button>
                    </div>
                </div>
                <div className="relative"><div className="absolute top-3 left-3 text-gray-400"><MessageSquare size={14} /></div><textarea value={s.comment} onChange={(e) => updateComment(i, e.target.value)} placeholder="Commentaire..." className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2 pl-9 pr-3 text-xs text-gray-700 focus:outline-none focus:bg-white focus:border-gray-300 transition-all resize-none h-16" /></div>
              </div>
            ))}
            {selectedStartups.length === 0 && <span className="text-gray-400 italic text-sm text-center py-8 block bg-gray-50 rounded-xl border border-dashed border-gray-200">Ajoute une startup ci-dessous...</span>}
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6" ref={dropdownRef}>
            <div className="mb-2"><label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Ajouter une Startup</label></div>
            <div className="flex gap-2 relative">
              <div className="relative flex-1">
                <input type="text" value={currentStartupInput} onChange={(e) => { setCurrentStartupInput(e.target.value); setShowDropdown(true); }} onFocus={() => setShowDropdown(true)} onKeyDown={(e) => e.key === 'Enter' && addStartup()} className="w-full bg-gray-50 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all" placeholder="Rechercher..." />
                {showDropdown && (
                  <ul className="absolute z-50 w-full bg-white border border-gray-100 mt-1 rounded-lg shadow-xl max-h-48 overflow-y-auto animate-fade-in">
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
      <Footer />
    </ScreenWrapper>
  );
  return null;
}

const ScreenWrapper = ({ children }) => (
  <div className="min-h-screen w-full bg-gray-100 flex justify-center font-sans">
    <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col">
      {children}
    </div>
  </div>
);

const Footer = () => (<footer className="w-full bg-white border-t border-gray-200 p-3 flex justify-center items-center text-xs text-gray-400"><span>Sisley Innovation Lab v3.0</span></footer>);
