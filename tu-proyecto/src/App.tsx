// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import WelcomePageES from "src/components/WelcomePageES";
import ArticlePage from "src/components/ArticlePage";

export default function App() {
  const mockUser = {
    email: "demo@example.com",
    userType: "student",
    interests: ["Microgravedad y células", "Biología de plantas espaciales"],
    experience: "beginner",
    name: "Demo",
  };

  return (
    <Routes>
      <Route path="/" element={
        <WelcomePageES userData={mockUser} onBack={() => {}} />
      }/>
      <Route path="/article" element={<ArticlePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
