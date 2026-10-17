import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  const [loginID, setLoginID] = useState<string>('OP112');
  const [password, setPassword] = useState<string>('12345');
  const [error, setError] = useState<string>('');

  // Requirement A.12: Page title formula
  useEffect(() => {
    document.title = 'Login | NetraGridAI';
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(loginID, password)) {
      navigate('/dashboard');
    } else {
      setError('Invalid operator credentials. Use USERNAME: OP112 | PASSWORD: 12345');
    }
  };

  return (
    // Requirement A.17: Full screen login page layout without outer black margins/padding
    <div className="w-screen h-screen bg-white flex flex-col md:flex-row overflow-hidden font-sans select-none">
      
      {/* Left Panel: Full screen height digital grid hero with logo + Title + Subtitle (Requirement A.13 & A.5) */}
      <div className="digital-grid-hero w-full md:w-1/2 p-8 lg:p-16 flex flex-col items-center justify-center text-center text-white relative overflow-hidden">
        {/* Glowing node decorative SVG background lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
          <line x1="10%" y1="90%" x2="42%" y2="28%" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
          <line x1="60%" y1="80%" x2="84%" y2="25%" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
          <circle cx="42%" cy="28%" r="6" fill="#FFFFFF" />
          <circle cx="84%" cy="25%" r="6" fill="#FFFFFF" />
          <circle cx="76%" cy="80%" r="16" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" />
        </svg>

        <div className="relative z-10 flex flex-col items-center space-y-6 max-w-lg mx-auto">
          {/* Logo image (Requirement A.13) */}
          <div className="w-28 h-28 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/30 flex items-center justify-center shadow-2xl">
            <img src="/logo.png" alt="NetraGridAI Logo" className="w-full h-full object-contain" />
          </div>

          {/* Title text NetraGridAI with pixelated font (Item 9) */}
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white font-sans drop-shadow-md uppercase">
            NetraGridAI
          </h1>

          <div className="w-16 h-1 bg-white/60 rounded-full" />

          {/* Subtitle text AI-Powered Smart City Emergency Dispatcher (Requirement A.13) */}
          <p className="text-base lg:text-lg font-medium text-white/90 leading-relaxed">
            AI-Powered Smart City Emergency Dispatcher
          </p>
        </div>
      </div>

      {/* Right Panel: Clean white form panel (Requirements A.14, A.15, A.16) */}
      <div className="w-full md:w-1/2 p-8 lg:p-16 flex flex-col justify-between bg-white text-slate-900">
        <div className="max-w-md w-full mx-auto my-auto space-y-8">
          
          {/* Header: LOGIN in caps without logo (Item 8) */}
          <div className="space-y-2">
            <h2 className="font-sans text-4xl lg:text-5xl font-bold tracking-tight text-[#0B7FF5] uppercase">
              LOGIN
            </h2>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border-l-4 border-red-500 text-xs text-red-700 font-mono rounded-r-md">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Field 1: Login ID (Functional 2) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 font-mono uppercase">
                Operator Login ID
              </label>
              <div className="relative flex items-center bg-slate-50 rounded-lg overflow-hidden border border-slate-200 focus-within:border-[#0B7FF5] focus-within:ring-2 focus-within:ring-blue-100 transition-calm">
                <div className="w-1.5 h-11 bg-[#0B7FF5] shrink-0" />
                <input
                  type="text"
                  value={loginID}
                  onChange={(e) => setLoginID(e.target.value)}
                  placeholder="OP112"
                  required
                  className="w-full bg-transparent px-4 py-3 text-sm text-slate-900 focus:outline-none font-mono placeholder-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Field 2: Password (Functional 2) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 font-mono uppercase">
                Password
              </label>
              <div className="relative flex items-center bg-slate-50 rounded-lg overflow-hidden border border-slate-200 focus-within:border-[#0B7FF5] focus-within:ring-2 focus-within:ring-blue-100 transition-calm">
                <div className="w-1.5 h-11 bg-[#0B7FF5] shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="12345"
                  required
                  className="w-full bg-transparent px-4 py-3 text-sm text-slate-900 focus:outline-none font-mono placeholder-slate-400 font-medium"
                />
              </div>
            </div>

            {/* Options line without "Already a member?" link (Requirement A.15) */}
            <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
              <label className="flex items-center space-x-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded text-[#0B7FF5] focus:ring-0 accent-[#0B7FF5] w-4 h-4"
                />
                <span className="font-medium">Keep me signed in</span>
              </label>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-full bg-[#0B7FF5] text-white font-bold text-xs tracking-wider uppercase hover:bg-blue-600 active:scale-[0.99] transition-calm shadow-lg shadow-blue-500/25"
            >
              SIGN IN
            </button>
          </form>

          {/* Static Credentials Box: USERNAME: OP112 | PASSWORD: 12345 (Requirement A.14) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono">
            <span className="text-xs font-bold text-slate-700 tracking-wide">
              USERNAME: OP112 | PASSWORD: 12345
            </span>
          </div>

        </div>

        <div className="text-center text-xs font-mono text-slate-400 pt-4">
          NetraGridAI &bull; Smart City Emergency Command Console
        </div>
      </div>

    </div>
  );
};
