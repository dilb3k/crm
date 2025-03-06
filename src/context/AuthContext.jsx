import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("user")) || null
  );
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/"); // 🔹 Agar user bo‘lsa, dashboard'ga o‘tkazamiz
    }
  }, []);

  const login = async (username, password) => {
    try {
      console.log("🟡 Login so‘rovi yuborilyapti...");
  
      const response = await fetch("http://localhost:5000/users");
  
      if (!response.ok) {
        throw new Error(`Server xatosi: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("🟢 Serverdan kelgan data:", data); // 🔥 Server javobini ko‘rish uchun
  
      // Agar "users" kaliti bo'lsa, ichidagi massivni olish
      const users = Array.isArray(data) ? data : data.users;
  
      if (!Array.isArray(users)) {
        throw new Error("Server noto‘g‘ri formatda javob qaytardi, users array emas");
      }
  
      const loggedInUser = users.find(
        (u) => u.login === username && u.password === password
      );
  
      if (loggedInUser) {
        console.log("✅ Foydalanuvchi topildi:", loggedInUser);
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        setError("");
        navigate("/");
      } else {
        console.log("❌ Login yoki parol noto‘g‘ri");
        setError("Login yoki parol xato");
      }
    } catch (error) {
      console.error("❌ Xatolik:", error);
      setError("Server bilan muammo bor. Keyinroq urinib ko‘ring.");
    }
  };
  


  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login"); // 🔹 Logout qilganda login sahifasiga yo‘naltiramiz
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};
