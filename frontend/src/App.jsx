import React, { useState, useEffect } from 'react';
import { Shield, Lock, Trash2, LogOut, Plus, Eye, EyeOff } from 'lucide-react';

const API_URL = "http://127.0.0.1:5000/api";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('user'));
  const [view, setView] = useState(token ? 'vault' : 'login');
  const [authData, setAuthData] = useState({ username: '', email: '', password: '' });
  const [passwordVerify, setPasswordVerify] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [vault, setVault] = useState([]);
  const [newCred, setNewCred] = useState({ website: '', username: '', password: '' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [pageLoaded, setPageLoaded] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password);
  };

  const getPasswordStrength = (password) => {
    if (!password) return '';
    if (validatePassword(password)) return 'strong';
    if (password.length >= 6) return 'medium';
    return 'weak';
  };

  useEffect(() => {
    if (token) fetchVault();
  }, [token]);

  useEffect(() => {
    setPageLoaded(true);
  }, []);

  const passwordStrength = getPasswordStrength(authData.password);

  const authSubmit = async (e, type) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (type === 'register') {
      if (!validateEmail(authData.email)) {
        setError('Please enter a valid email address');
        return;
      }
      if (!validatePassword(authData.password)) {
        setError('Password must be at least 8 characters with uppercase, number, and special character');
        return;
      }
      if (authData.password !== passwordVerify) {
        setError('Passwords do not match');
        return;
      }
    }

    const endpoint = type === 'login' ? '/login' : '/register';
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error);
      if (type === 'login') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', data.email);
        setToken(data.token);
        setUsername(data.email);
        setView('vault');
      } else {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          setView('login');
          setAuthData({ username: '', email: '', password: '' });
          setPasswordVerify('');
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || "Failed to connect to server");
    }
  };

  const fetchVault = async () => {
    const res = await fetch(`${API_URL}/credentials`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setVault(await res.json());
    else logout();
  };

  const addCredential = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/credentials`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newCred)
    });
    setNewCred({ website: '', username: '', password: '' });
    fetchVault();
  };

  const deleteCred = async (id) => {
    await fetch(`${API_URL}/credentials/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchVault();
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setVault([]);
    setView('login');
  };

  if (view === 'vault') {
    return (
      <div className="min-h-screen bg-[#05070A] text-white p-8">
        <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
          <h1 className="text-3xl font-bold text-emerald-400 flex items-center gap-2">
            <Shield size={32}/> Wonder Of Vault
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Logged in as <b className="text-white">{username}</b></span>
            <button onClick={logout} className="p-2 bg-slate-800 hover:bg-red-500/20 text-red-400 rounded flex items-center gap-2 transition-colors">
              <LogOut size={16}/> Lock Vault
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 bg-slate-800 p-6 rounded-xl border border-slate-700 h-fit">
            <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
              <Plus size={20}/> Encapsulate Data
            </h2>
            <form onSubmit={addCredential} className="flex flex-col gap-4">
              <input placeholder="Website" required value={newCred.website} onChange={e => setNewCred({...newCred, website: e.target.value})} className="p-3 bg-slate-900 text-white rounded border border-slate-700 focus:border-emerald-500 outline-none text-sm"/>
              <input placeholder="Username" required value={newCred.username} onChange={e => setNewCred({...newCred, username: e.target.value})} className="p-3 bg-slate-900 text-white rounded border border-slate-700 focus:border-emerald-500 outline-none text-sm"/>
              <div className="relative">
                <input type={showNewPassword ? 'text' : 'password'} placeholder="Password" required value={newCred.password} onChange={e => setNewCred({...newCred, password: e.target.value})} className="w-full p-3 bg-slate-900 text-white rounded border border-slate-700 focus:border-emerald-500 outline-none text-sm pr-10"/>
                <button type="button" onClick={() => setShowNewPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 p-3 rounded font-bold transition-colors">Securely Store</button>
            </form>
          </div>
          <div className="md:col-span-2">
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 text-slate-400 text-sm">
                    <th className="p-4">Service</th>
                    <th className="p-4">Identity</th>
                    <th className="p-4">Password</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vault.length === 0 && (
                    <tr><td colSpan="4" className="p-8 text-center text-slate-500">Vault is empty.</td></tr>
                  )}
                  {vault.map(c => {
                    const visible = visiblePasswords[c.id];
                    return (
                      <tr key={c.id} className="border-t border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                        <td className="p-4 font-semibold">{c.website}</td>
                        <td className="p-4 text-slate-300">{c.username}</td>
                        <td className="p-4 font-mono text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span className={`truncate ${visible ? 'text-emerald-300' : 'text-slate-400'}`}>{visible ? c.password : '••••••••••••••'}</span>
                            <button type="button" onClick={() => togglePasswordVisibility(c.id)} className="text-slate-400 hover:text-slate-100">
                              {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-center space-x-2">
                          <button onClick={() => togglePasswordVisibility(c.id)} className="p-2 text-slate-500 hover:text-slate-100 transition-colors" title={visible ? 'Hide password' : 'Show password'}>
                            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                          <button onClick={() => deleteCred(c.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors" title="Delete credential">
                            <Trash2 size={18}/>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070A] text-white p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.12),_transparent_20%)]" />
      <div className="relative mx-auto flex min-h-screen items-center justify-center">
        <div className={`w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900/95 p-8 shadow-[0_40px_120px_rgba(0,0,0,0.45)] transition-all duration-700 ${pageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="text-center mb-8">
          <Lock size={48} className="mx-auto text-emerald-400 mb-4"/>
          <h1 className="text-3xl font-bold text-white">Wonder Of Vault</h1>
          <p className="mx-auto mt-3 max-w-xs text-sm text-slate-400">Secure password storage with hybrid AES-GCM / RSA wrapping and a cyber-dark interface.</p>
          <p className="text-slate-400 mt-2">Zero-knowledge architecture via PBKDF2</p>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded mb-6 text-sm">{error}</div>}
        {success && <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-3 rounded mb-6 text-sm">{success}</div>}
        <form onSubmit={e => authSubmit(e, view === 'login' ? 'login' : 'register')} className="flex flex-col gap-4 transition-all duration-300">
          <input placeholder="Email" type="email" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} className="p-3 bg-slate-900 text-white rounded border border-slate-700 focus:border-emerald-500 outline-none transition-all duration-300"/>
          <div>
            <input type="password" placeholder="Password" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} className="p-3 bg-slate-900 text-white rounded border border-slate-700 focus:border-emerald-500 outline-none transition-all duration-300 w-full"/>
            {view === 'register' && authData.password && (
              <div className="mt-3">
                <div className="flex gap-2 mb-2">
                  <div className={`h-1 flex-1 rounded transition-all ${passwordStrength === 'strong' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                  <div className={`h-1 flex-1 rounded transition-all ${passwordStrength === 'strong' ? 'bg-emerald-500' : passwordStrength === 'medium' ? 'bg-yellow-500' : 'bg-slate-700'}`}></div>
                  <div className={`h-1 flex-1 rounded transition-all ${passwordStrength === 'strong' ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                </div>
                <p className={`text-xs font-semibold ${getPasswordStrength(authData.password) === 'strong' ? 'text-emerald-400' : getPasswordStrength(authData.password) === 'medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                  Password strength: {getPasswordStrength(authData.password)}
                </p>
              </div>
            )}
          </div>
          <div className={`overflow-hidden transition-all duration-300 ${view === 'register' ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
            <input type="password" placeholder="Verify Password" value={passwordVerify} onChange={e => setPasswordVerify(e.target.value)} className="p-3 bg-slate-900 text-white rounded border border-slate-700 focus:border-emerald-500 outline-none transition-all duration-300 w-full"/>
          </div>
          <div className="relative h-16 mt-2">
            <button
              type={view === 'login' ? 'submit' : 'button'}
              onClick={e => authSubmit(e, 'login')}
              className={`absolute inset-0 bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded font-bold transition-all duration-300 text-lg flex items-center justify-center ${view === 'login' ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'}`}
            >
              Login
            </button>
            <button
              type={view === 'register' ? 'submit' : 'button'}
              onClick={e => authSubmit(e, 'register')}
              className={`absolute inset-0 bg-sky-600 hover:bg-sky-500 text-white p-4 rounded font-bold transition-all duration-300 text-lg flex items-center justify-center ${view === 'register' ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}
            >
              Register
            </button>
          </div>
        </form>
        <div className="mt-6 text-center transition-all duration-300">
          {view === 'login' ? (
            <p className="text-slate-400">Don't have a vault? <button onClick={() => {setView('register'); setError(''); setSuccess('');}} className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">Create one</button></p>
          ) : (
            <p className="text-slate-400">Already have a vault? <button onClick={() => {setView('login'); setError(''); setPasswordVerify(''); setSuccess('');}} className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">Login</button></p>
          )}
        </div>
        <div className="mt-6 text-center text-xs text-slate-500 transition-all duration-300">
          <p>Protected by AES-256-GCM and RSA-2048-OAEP</p>
        </div>
      </div>
    </div>
  </div>
  );
}