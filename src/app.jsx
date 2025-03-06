import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ElonlarRoyxati from "./pages/ElonlarRoyxati";
import Foydalanuvchilar from "./pages/Foydalanuvchilar";
import PrivateRoute from "./components/PrivateRoute";
import MainPage from "./pages/MainPage";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Login sahifasi */}
        <Route path="/login" element={<LoginPage />} />

        {/* PrivateRoute orqali himoyalangan yo‘nalishlar */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<MainPage />}>
            <Route index element={<Dashboard />} />
            <Route path="elonlarRoyxati" element={<ElonlarRoyxati />} />
            <Route path="foydalanuvchilar" element={<Foydalanuvchilar />} />
          </Route>
        </Route>

        {/* Not Found yoki Standart yo‘nalish */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
