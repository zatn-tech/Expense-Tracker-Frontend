// src/components/AuthPage.js
import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div>
      {isLogin ? (
        <Login onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <Register onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </div>
  );
}

export default AuthPage;
