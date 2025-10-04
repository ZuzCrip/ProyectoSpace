
import React, { useState, useRef } from "react";

interface UserData {
  email: string;
  userType: string;
  interests: string[];
  experience: string;
  name: string;
}

interface WelcomePageESProps {
  onSearch?: (query: string) => void;
  userData: UserData;
  onBack: () => void;
}

export default function WelcomePageES({ onSearch, userData, onBack }: WelcomePageESProps) {
  const [query, setQuery] = useState("");
  
  // Personalizar sugerencias basadas en los intereses del usuario
  const getPersonalizedSuggestions = () => {
    const baseSuggestions = [
      "microgravedad",
      "biología espacial", 
      "radiación y células",
      "cultivo de plantas",
      "microbioma en órbita",
    ];

    // Añadir sugerencias basadas en intereses del usuario
    const interestSuggestions: { [key: string]: string[] } = {
      'Microgravedad y células': ['efectos microgravedad', 'células en gravedad cero'],
      'Biología de plantas espaciales': ['agricultura espacial', 'plantas ISS'],
      'Microbioma en el espacio': ['bacterias espaciales', 'microbiota astronautas'],
      'Radiación y ADN': ['radiación cósmica', 'daño ADN espacio'],
      'Medicina espacial': ['salud astronautas', 'medicina orbital'],
      'Astrobiología': ['vida extraterrestre', 'extremófilos'],
    };

    let personalizedSuggestions = [...baseSuggestions];
    
    userData.interests.forEach(interest => {
      if (interestSuggestions[interest]) {
        personalizedSuggestions.push(...interestSuggestions[interest]);
      }
    });

    return [...new Set(personalizedSuggestions)].slice(0, 8);
  };

  const [suggestions] = useState(getPersonalizedSuggestions());
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    if (onSearch) onSearch(q);
  }

  function handleSuggestionClick(suggestion: string) {
    setQuery(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }

  const getUserTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'scientist': 'Científico/Investigador',
      'student': 'Estudiante',
      'educator': 'Educador',
      'enthusiast': 'Entusiasta',
      'journalist': 'Periodista',
      'other': 'Usuario'
    };
    return labels[type] || 'Usuario';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-green-900 flex flex-col relative">
      {/* Efectos de fondo espacial */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-green-400 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-emerald-300 rounded-full opacity-40"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-green-500 rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-lime-400 rounded-full opacity-30"></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-emerald-400 rounded-full opacity-40 animate-pulse"></div>
      </div>

      <header className="max-w-5xl mx-auto w-full p-6 relative z-10">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white font-bold shadow-lg border border-green-500/30">
              N
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">
                NASA <span className="text-green-400">BioSpace</span> — Portal de Investigación
              </h1>
              <p className="text-sm text-gray-300">
                Descubre cómo la <span className="text-green-400">vida</span> se adapta al <span className="text-gray-400">cosmos</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400 hidden md:block">
              Interfaz en español · Ciencia universal
            </div>
            <button
              onClick={onBack}
              className="text-sm text-green-400 hover:text-green-300 font-medium transition-colors duration-200"
            >
              ← Volver al inicio
            </button>
          </div>
        </nav>
      </header>

      {/* Barra de bienvenida personalizada */}
      <div className="max-w-5xl mx-auto w-full px-6 mb-6 relative z-10">
        <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-gray-700 rounded-xl p-4 text-white shadow-xl border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                ¡Hola, {userData.name}! 🌱
              </h2>
              <p className="text-green-100 text-sm">
                {getUserTypeLabel(userData.userType)} • 
                {userData.interests.length > 0 
                  ? ` Explorador de ${userData.interests.slice(0, 2).join(', ')}${userData.interests.length > 2 ? '...' : ''}`
                  : ' Pionero de la ciencia espacial'
                }
              </p>
            </div>
            <div className="text-2xl">🚀</div>
          </div>
        </div>
      </div>

      <main className="flex-1 flex items-start justify-center px-4 pb-10 relative z-10">
        <div className="w-full max-w-4xl">
          <section className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-green-500/30 backdrop-blur-sm">
            <div className="md:flex md:items-center md:gap-8">
              <div className="flex-1">
                <h2 className="text-3xl font-extrabold mb-2 text-white">
                  Investigaciones <span className="text-green-400">biológicas</span> de la NASA
                </h2>
                <p className="text-gray-300 mb-6">
                  Explora cómo la vida terrestre se comporta en el espacio. Busca por tema, 
                  investigador o misión espacial. Descubre los secretos de la biología 
                  más allá de nuestro planeta.
                </p>

                <form onSubmit={handleSubmit} className="flex gap-3 items-center mb-6">
                  <label htmlFor="search" className="sr-only">
                    Buscar artículos de biología espacial
                  </label>
                  <input
                    id="search"
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ej: microgravedad, cultivo de plantas, microbioma en órbita..."
                    className="flex-1 p-3 rounded-lg bg-gray-700 border border-green-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-400"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-lg hover:from-emerald-700 hover:to-green-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                  >
                    Explorar
                  </button>
                </form>

                <div className="mb-6">
                  <p className="text-sm text-gray-400 mb-3">
                    {userData.interests.length > 0 
                      ? "Búsquedas personalizadas para ti:" 
                      : "Búsquedas sugeridas:"
                    }
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-1 text-sm bg-green-600/20 text-green-300 rounded-full hover:bg-green-600/30 transition-colors duration-200 border border-green-500/30"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:w-80 mt-6 md:mt-0">
                <div className="bg-gradient-to-br from-emerald-700 via-green-600 to-gray-700 rounded-xl p-6 text-white shadow-xl border border-green-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-full bg-green-400/20 flex items-center justify-center border border-green-400/30">
                      🌱
                    </div>
                    <h3 className="font-semibold">Portal Científico</h3>
                  </div>
                  <p className="text-sm text-green-100 mb-4">
                    Accede a más de 10,000 publicaciones sobre cómo la vida 
                    terrestre se adapta y evoluciona en el entorno espacial.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span>Investigaciones revisadas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span>Datos de misiones activas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span>Descubrimientos recientes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-green-500/30">
              <div className="h-12 w-12 rounded-lg bg-green-600/20 flex items-center justify-center mb-4 border border-green-500/30">
                🌱
              </div>
              <h3 className="font-semibold mb-2 text-white">Agricultura Espacial</h3>
              <p className="text-sm text-gray-300">
                Cómo las plantas terrestres se adaptan y crecen en microgravedad, 
                revolucionando la exploración espacial.
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-green-500/30">
              <div className="h-12 w-12 rounded-lg bg-emerald-600/20 flex items-center justify-center mb-4 border border-emerald-500/30">
                🧬
              </div>
              <h3 className="font-semibold mb-2 text-white">Biología Celular</h3>
              <p className="text-sm text-gray-300">
                Efectos de la radiación cósmica y microgravedad en células y 
                tejidos de organismos terrestres.
              </p>
            </div>

            <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-green-500/30">
              <div className="h-12 w-12 rounded-lg bg-lime-600/20 flex items-center justify-center mb-4 border border-lime-500/30">
                🦠
              </div>
              <h3 className="font-semibold mb-2 text-white">Microbioma</h3>
              <p className="text-sm text-gray-300">
                Estudios sobre cómo los microorganismos terrestres se comportan 
                en el entorno espacial.
              </p>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-green-500/30 bg-gray-800/50 backdrop-blur-sm relative z-10">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white text-sm font-bold border border-green-500/30">
                N
              </div>
              <span className="text-gray-300">Portal NASA BioSpace - Investigación Biológica</span>
            </div>
            <div className="text-sm text-gray-400">
              © 2024 NASA BioSpace Portal. <span className="text-green-400">Ciencia abierta para la humanidad.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
