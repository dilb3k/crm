import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard"; // Statistika sahifasi
import ElonlarRoyxati from "./pages/ElonlarRoyxati";
import Foydalanuvchilar from "./pages/Foydalanuvchilar";
import PrivateRoute from "./components/PrivateRoute";
import MainPage from "./pages/MainPage";
import ApartmentDetails from "./pages/ApartmentDetailsPage";
import Maklerlar from "./pages/Foydalanuvchilar";
import MaklerDetail from "./pages/MaklerDetail";

const ProtectedDashboard = () => {
  const { user } = useAuth();
  return user?.isAdmin ? <Dashboard /> : <Navigate to="/elonlarRoyxati" />;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Login sahifasi */}
        <Route path="/login" element={<LoginPage />} />

        {/* PrivateRoute orqali himoyalangan yo'nalishlar */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<MainPage />}>
            {/* ✅ Statistika faqat adminlar uchun */}
            <Route index element={<ProtectedDashboard />} />
            <Route path="elonlarRoyxati" element={<ElonlarRoyxati />} />
            <Route path="maklerlar" element={<Maklerlar />} />
            <Route path="apartment/:id" element={<ApartmentDetails />} />
            {/* Add Makler Detail Route */}
            <Route path="makler/:id" element={<MaklerDetail />} />
          </Route>
        </Route>

        {/* Not Found yoki Standart yo'nalish */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;