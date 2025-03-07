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
      navigate("/"); // 🔹 Если пользователь уже залогинен, перенаправляем на главную
    }
  }, []);

  const login = async (phone, password) => {
    try {
      console.log("🟡 Отправка запроса на вход...");

      const response = await fetch("http://167.99.245.227/api/v1/adminka/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();
      console.log("🟢 Ответ от сервера:", data); // ➜ Выведем полный ответ в консоль

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }

      if (data.access_token) { // ✅ Проверяем access_token
        console.log("✅ Успешный вход");
        localStorage.setItem("token", data.access_token); // ✅ Сохраняем access_token
        localStorage.setItem("user", JSON.stringify({ 
          id: data.user_id,
          name: data.name,
          phone: data.phone,
          isAdmin: data.is_admin
        }));
        setUser({
          id: data.user_id,
          name: data.name,
          phone: data.phone,
          isAdmin: data.is_admin
        });
        setError("");
        navigate("/");
      } else {
        console.error("❌ Сервер не вернул токен:", data);
        throw new Error("Не удалось получить токен. Неправильные данные.");
      }
    } catch (error) {
      console.error("❌ Ошибка:", error.message);
      setError("Неправильный логин или пароль.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login"); // 🔹 При выходе отправляем на страницу логина
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};
