import React, { useState, useEffect } from "react";

interface UserData {
  email: string;
  userType: number | null; // perfil_id
  interests: string[];
  experience: number | null; // experiencia_id
  name: string;
  password: string;
}

interface Profile {
  id: number;
  tipo: string;
}

interface Experience {
  id: number;
  nivel: string;
}

interface WelcomeScreenProps {
  onComplete: (userData: UserData) => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [formData, setFormData] = useState<UserData>({
    email: "",
    userType: null,
    interests: [],
    experience: null,
    name: "",
    password: "",
  });

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);

  // Fetch perfiles y experiencias
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resProfiles = await fetch("http://127.0.0.1:8000/perfiles");
        const dataProfiles = await resProfiles.json();
        setProfiles(dataProfiles);

        const resExperiences = await fetch("http://127.0.0.1:8000/experiencias/");
        const dataExperiences = await resExperiences.json();
        setExperiences(dataExperiences);
      } catch (error) {
        console.error("Error cargando opciones:", error);
      }
    };
    fetchData();
  }, []);

  const researchInterests = [
    "Microgravedad",
    "Biología vegetal",
    "Microbioma espacial",
    "Radiación y ADN",
    "Astrobiología",
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.email && formData.userType && formData.name && formData.password) {
      try {
        const body = {
          nombre: formData.name,
          correo: formData.email,
          contrasena: formData.password,
          perfil_id: formData.userType,
          experiencia_id: formData.experience,
        };

        const res = await fetch("http://127.0.0.1:8000/usuarios", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) throw new Error("Error al registrar usuario");

        const userData = await res.json();

        // Guardar en localStorage
        localStorage.setItem("user", JSON.stringify(userData));

        // Llamar al callback
        onComplete(formData);
      } catch (error) {
        console.error("Error en el registro:", error);
      }
    }
  };

  const isFormValid =
    formData.email && formData.userType && formData.name && formData.password;

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

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-black mb-1">
                Contraseña *
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                placeholder="********"
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
                {profiles.map((profile) => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, userType: profile.id }))
                    }
                    className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition ${
                      formData.userType === profile.id
                        ? "bg-emerald-100 border-black/50 text-black"
                        : "bg-white border-black/20 text-black hover:border-black/40"
                    }`}
                  >
                    {profile.tipo}
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
                value={formData.experience ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    experience: Number(e.target.value),
                  }))
                }
                className="w-full p-3 rounded-xl border border-black/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 outline-none bg-white"
              >
                <option value="">Selecciona tu nivel</option>
                {experiences.map((exp) => (
                  <option key={exp.id} value={exp.id}>
                    {exp.nivel}
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
