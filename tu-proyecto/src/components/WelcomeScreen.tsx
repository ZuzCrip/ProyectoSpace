import React, { useState } from "react";

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
    email: "",
    userType: "",
    interests: [],
    experience: "",
    name: "",
  });

  const userTypes = [
    { value: "scientist", label: "Científico", icon: "🔬" },
    { value: "student", label: "Estudiante", icon: "🎓" },
    { value: "educator", label: "Educador", icon: "👨‍🏫" },
    { value: "enthusiast", label: "Entusiasta", icon: "🌿" },
  ];

  const researchInterests = [
    "Microgravedad",
    "Biología vegetal",
    "Microbioma espacial",
    "Radiación y ADN",
    "Astrobiología",
  ];

  const experienceLevels = [
    { value: "beginner", label: "Principiante" },
    { value: "intermediate", label: "Intermedio" },
    { value: "advanced", label: "Avanzado" },
    { value: "expert", label: "Experto" },
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-emerald-50 to-green-200 p-4">
      <div className="w-full max-w-5xl bg-white/80 backdrop-blur-md rounded-3xl border border-black/20 shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 h-16 w-16 flex items-center justify-center bg-green-200 rounded-full text-3xl border border-black/40">
            🌿
          </div>
          <h1 className="text-4xl font-extrabold text-black tracking-tight">
            Bio<span className="text-emerald-600">Space</span> Portal
          </h1>
          <p className="text-emerald-700 mt-1 text-sm font-medium">
            Explorando la vida más allá de la Tierra
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Columna Izquierda */}
          <div className="space-y-5">
            {/* Nombre */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-black mb-1">
                Nombre *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Tu nombre"
                className="w-full p-3 rounded-xl border border-black/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none bg-white"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-black mb-1">
                Correo electrónico *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="tu.email@ejemplo.com"
                className="w-full p-3 rounded-xl border border-black/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none bg-white"
                required
              />
            </div>

            {/* Tipo de usuario */}
            <div>
              <p className="block text-sm font-semibold text-black mb-2">
                Perfil *
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {userTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, userType: type.value }))
                    }
                    className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition ${
                      formData.userType === type.value
                        ? "bg-emerald-100 border-black/50 text-black"
                        : "bg-white border-black/20 text-black hover:border-black/40"
                    }`}
                  >
                    <span>{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Columna Derecha */}
          <div className="space-y-5">
            {/* Nivel de experiencia */}
            <div>
              <label htmlFor="experience" className="block text-sm font-semibold text-black mb-1">
                Nivel de experiencia
              </label>
              <select
                id="experience"
                value={formData.experience}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    experience: e.target.value,
                  }))
                }
                className="w-full p-3 rounded-xl border border-black/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none bg-white"
              >
                <option value="">Selecciona tu nivel</option>
                {experienceLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Intereses */}
            <div>
              <p className="block text-sm font-semibold text-black mb-2">
                Temas de interés
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {researchInterests.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleInterestToggle(interest)}
                    className={`text-sm p-2 rounded-lg border transition ${
                      formData.interests.includes(interest)
                        ? "bg-emerald-100 border-black/50 text-black"
                        : "bg-white border-black/20 text-black hover:border-black/40"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Botón centrado */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full py-4 rounded-xl font-semibold text-lg transition ${
                isFormValid
                  ? "bg-black text-white hover:bg-emerald-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              🚀 Iniciar Exploración Biológica
            </button>
          </div>
        </form>

        <p className="text-xs text-center text-black/60 mt-5">
          Tus datos se usan solo para personalizar tu experiencia.
        </p>
      </div>
    </div>
  );
}
