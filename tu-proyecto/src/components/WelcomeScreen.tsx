
import React, { useState } from 'react';

interface UserData {
  email: string;
  userType: string;
  interests: string[];
  experience: string;
  name: string;
}

interface WelcomeScreenProps {
  onComplete: (userData: UserData) => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [formData, setFormData] = useState<UserData>({
    email: '',
    userType: '',
    interests: [],
    experience: '',
    name: ''
  });

  const userTypes = [
    { value: 'scientist', label: 'Científico/Investigador', icon: '🔬' },
    { value: 'student', label: 'Estudiante', icon: '🎓' },
    { value: 'educator', label: 'Educador/Profesor', icon: '👨‍🏫' },
    { value: 'enthusiast', label: 'Entusiasta de la ciencia', icon: '🌟' },
    { value: 'journalist', label: 'Periodista/Divulgador', icon: '📰' },
    { value: 'other', label: 'Otro', icon: '👤' }
  ];

  const researchInterests = [
    'Microgravedad y células',
    'Biología de plantas espaciales',
    'Microbioma en el espacio',
    'Radiación y ADN',
    'Medicina espacial',
    'Astrobiología',
    'Sistemas de soporte vital',
    'Fisiología humana en el espacio'
  ];

  const experienceLevels = [
    { value: 'beginner', label: 'Principiante - Nuevo en el tema' },
    { value: 'intermediate', label: 'Intermedio - Conocimientos básicos' },
    { value: 'advanced', label: 'Avanzado - Experiencia significativa' },
    { value: 'expert', label: 'Experto - Investigador activo' }
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email && formData.userType && formData.name) {
      onComplete(formData);
    }
  };

  const isFormValid = formData.email && formData.userType && formData.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 flex items-center justify-center p-4">
      {/* Efectos de fondo espacial */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-green-400 rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-emerald-300 rounded-full opacity-40"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-green-500 rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-lime-400 rounded-full opacity-30"></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-emerald-400 rounded-full opacity-40 animate-pulse"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-600 via-green-700 to-gray-800 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-2xl border border-green-500/30">
            N
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Portal NASA <span className="text-green-400">BioSpace</span>
          </h1>
          <p className="text-xl text-gray-300">
            Donde la <span className="text-green-400">biología terrestre</span> encuentra el <span className="text-gray-400">cosmos</span>
          </p>
        </div>

        {/* Welcome Card */}
        <div className="bg-gray-800 rounded-3xl shadow-2xl border border-green-500/30 overflow-hidden backdrop-blur-sm">
          <div className="bg-gradient-to-r from-emerald-700 via-green-600 to-gray-700 p-6 text-white relative">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-2">🌱 Inicia tu exploración científica</h2>
              <p className="text-green-100">
                Descubre cómo la vida se adapta más allá de nuestro planeta
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Nombre */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-green-400 mb-2">
                ¿Cómo te llamas? *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Tu nombre"
                className="w-full p-3 bg-gray-700 border border-green-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-400 text-white placeholder-gray-400"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-green-400 mb-2">
                Correo electrónico *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="tu.email@ejemplo.com"
                className="w-full p-3 bg-gray-700 border border-green-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-400 text-white placeholder-gray-400"
                required
              />
            </div>

            {/* Tipo de usuario */}
            <div>
              <label className="block text-sm font-semibold text-green-400 mb-3">
                ¿Cuál describe mejor tu perfil? *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {userTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, userType: type.value }))}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                      formData.userType === type.value
                        ? 'border-green-500 bg-green-500/20 text-green-300 shadow-lg shadow-green-500/25'
                        : 'border-gray-600 bg-gray-700/50 text-gray-300 hover:border-green-500/50 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{type.icon}</span>
                      <span className="font-medium">{type.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Nivel de experiencia */}
            <div>
              <label htmlFor="experience" className="block text-sm font-semibold text-green-400 mb-2">
                Nivel de experiencia en biología espacial
              </label>
              <select
                id="experience"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                className="w-full p-3 bg-gray-700 border border-green-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-400 text-white"
              >
                <option value="" className="bg-gray-700">Selecciona tu nivel</option>
                {experienceLevels.map((level) => (
                  <option key={level.value} value={level.value} className="bg-gray-700">
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Intereses de investigación */}
            <div>
              <label className="block text-sm font-semibold text-green-400 mb-3">
                ¿Qué temas te interesan más? (Selecciona todos los que apliquen)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {researchInterests.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`p-3 rounded-lg text-sm text-left transition-all duration-300 ${
                      formData.interests.includes(interest)
                        ? 'bg-green-600/30 text-green-300 border-2 border-green-500 shadow-md shadow-green-500/25'
                        : 'bg-gray-700/50 text-gray-300 border-2 border-transparent hover:bg-gray-600/50 hover:border-green-500/30'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {formData.interests.includes(interest) && (
                        <span className="text-green-400">✓</span>
                      )}
                      {interest}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                  isFormValid
                    ? 'bg-gradient-to-r from-emerald-600 via-green-600 to-green-700 text-white hover:from-emerald-700 hover:via-green-700 hover:to-green-800 shadow-lg hover:shadow-xl shadow-green-500/25 hover:shadow-green-500/40'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isFormValid ? '🚀 Explorar el cosmos biológico' : 'Completa los campos requeridos'}
              </button>
            </div>
          </form>
        </div>

        {/* Footer note */}
        <div className="text-center mt-6 text-sm text-gray-400">
          <p>
            Al continuar, aceptas que utilizaremos esta información para personalizar tu experiencia.
            <br />
            <span className="text-green-400">Tus datos se mantienen privados y seguros.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
