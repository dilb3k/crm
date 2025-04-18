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
      navigate("/"); // 🔹 Agar user bor bo'lsa, bosh sahifaga yo'naltiramiz
    }
  }, []);

  const login = async (phone, password) => {
    try {
      // 🔸 Maxsus userlar
      const customUsers = [
        {
          phone: "admin",
          password: "admin",
          id: 1,
          name: "Admin User",
          isAdmin: true,
          isDeveloper: false,
        },
        {
          phone: "dev",
          password: "dev",
          id: 2,
          name: "Developer User",
          isAdmin: false,
          isDeveloper: true,
        },
      ];

      const matchedUser = customUsers.find(
        (u) => u.phone === phone && u.password === password
      );

      if (matchedUser) {
        localStorage.setItem("token", "custom-token");
        localStorage.setItem("user", JSON.stringify(matchedUser));
        localStorage.setItem(
          "role",
          matchedUser.isAdmin ? "admin" : matchedUser.isDeveloper ? "developer" : "user"
        );
        setUser(matchedUser);
        setError("");
        navigate("/");
        return;
      }

      // 🔸 Agar maxsus user emas, backendga so'rov yuboriladi
      const response = await fetch("https://fast.uysavdo.com/api/v1/adminka/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Server xatosi: ${response.status}`);
      }

      if (data.access_token) {
        const userData = {
          id: data.user_id,
          name: data.name,
          phone: data.phone,
          isAdmin: data.is_admin,
          isDeveloper: data.is_developer,
        };

        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem(
          "role",
          data.is_admin ? "admin" : data.is_developer ? "developer" : "user"
        );
        setUser(userData);
        setError("");
        navigate("/");
      } else {
        throw new Error("Token olinmadi. Login yoki parol noto‘g‘ri.");
      }
    } catch (error) {
      console.error("❌ Xatolik:", error.message);
      setError("Noto‘g‘ri login yoki parol.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};
