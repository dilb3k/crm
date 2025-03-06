// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';


import LoginImage from '../../public/assets/imgs/LoginLeftBar.png';  // Your image path
import Logo from '../../public/logo.png';  // Your logo image path

const LoginPage = () => {
  const { login, error } = useAuth();  // Get the login and error from context
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username && password) {
      // Try to log the user in using the login function from context
      login(username, password);
    }
  };

  return (
    <div className="h-[100vh] flex">
      <div className="h-full w-[55.48%]">
        <img className="h-full w-full" src={LoginImage} alt="Login Image" />
      </div>
      <div className="w-[44.52%] flex flex-col items-center">
        <div className="flex justify-center w-full mt-[65px]">
          <img className="w-[105px] h-[97px]" src={Logo} alt="Logo" />
        </div>

        <form className="w-[56%] mt-[90px]" onSubmit={handleLogin}>
          <h2 className="text-[24px] font-[700]">Tizimga kirish</h2>
          <label className="mt-[12px]" htmlFor="">Login va parolingizni kiriting</label>

          <div className="flex mt-[24px]">
            <input
              className="backdrop-blur-3xl w-full px-[15px] rounded-[12px] h-[56px] outline-none bg-[#EEEEEE] border border-white/30"
              type="text"
              name="login"
              id="login"
              placeholder="Login"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="flex mt-[8px]">
            <input
              className="backdrop-blur-3xl w-full px-[15px] rounded-[12px] h-[56px] outline-none bg-[#EEEEEE] border border-white/30"
              type="password"
              name="password"
              id="password"
              placeholder="Parol"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="text-red-500 mt-2">{error}</div>}  {/* Show error message if any */}

          <div className="flex justify-center mt-[50px]">
            <button className="w-full h-[56px] bg-black text-white rounded-[12px]" type="submit">
              Kirish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
