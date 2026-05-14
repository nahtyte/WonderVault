import { useState, useEffect } from 'react';
import { Shield, Lock, Trash2, LogOut, Plus } from 'lucide-react';

const API = 'http://127.0.0.1:5000';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [username, setUsername] = useState(localStorage.getItem('user'));
  const [view, setView] = useState(token ? 'vault' : 'login');
  
  // Auth Form State
  const [authData, setAuthData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  // Vault State
  const [vault, setVault] = useState([]);
  const [newCred, setNewCred] = useState({ website: '', username: '', password: '' });

  useEffect(() => {
    if (token) fetchVault();
  }, [token]);

  const authSubmit = async (e, type) => {
    e.preventDefault();
    setError('');
    const endpoint = type === 'login' ? '/auth/login' : '/auth/register';
    
    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      
      if (type === 'login') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', data.username);
        setToken(data.token);
        setUsername(data.username);
        setView('vault');
      } else {
        setView('login');
        alert("Registration Secure! Please login.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setVault([]);
    setView('login');
  };

  const fetchVault = async () => {
    const res = await fetch(`${API}/credentials`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setVault(await res.json());
    else logout(); // Token likely expired
  };

  const addCredential = async (e) => {
    e.preventDefault();
    await fetch(`${API}/credentials`, {
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
    await fetch(`${API}/credentials/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    fetchVault();
  };

  if (view === 'vault') {
    return (
      <div className="min-h-screen p-8 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
          <h1 className="text-3xl font-bold text-emerald-400 flex items-center gap-2">
            <Shield size={32}/> Secure Vault
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">Logged in as <b className="text-white">{username}</b></span>
            <button onClick={logout} className="p-2 bg-slate-800 hover:bg-red-500/20 text-red-400 rounded flex items-center gap-2 transition-colors">
              <LogOut size={16}/> Logout
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 bg-slate-800 p-6 rounded-xl border border-slate-700 h-fit">
            <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
              <Plus size={20}/> Encapsulate Data
            </h2>
            <form onSubmit={addCredential} className="flex flex-col gap-4">
              <input placeholder="Website (e.g., github.com)" required value={newCred.website} onChange={e => setNewCred({...newCred, website: e.target.value})} className="p-3 bg-slate-900 rounded border border-slate-700 focus:border-emerald-500 outline-none text-sm"/>
              <input placeholder="Username" required value={newCred.username} onChange={e => setNewCred({...newCred, username: e.target.value})} className="p-3 bg-slate-900 rounded border border-slate-700 focus:border-emerald-500 outline-none text-sm"/>
              <input type="password" placeholder="Password" required value={newCred.password} onChange={e => setNewCred({...newCred, password: e.target.value})} className="p-3 bg-slate-900 rounded border border-slate-700 focus:border-emerald-500 outline-none text-sm"/>
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
                    <th className="p-4">Decrypted Payload</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {vault.length === 0 && (
                    <tr><td colSpan="4" className="p-8 text-center text-slate-500">Vault is empty.</td></tr>
                  )}
                  {vault.map(c => (
                    <tr key={c.id} className="border-t border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                      <td className="p-4 font-semibold">{c.website}</td>
                      <td className="p-4 text-slate-300">{c.username}</td>
                      <td className="p-4 font-mono text-emerald-400 text-sm">{c.password}</td>
                      <td className="p-4 text-center">
                        <button onClick={() => deleteCred(c.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors">
                          <Trash2 size={18}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl">
        <div className="text-center mb-8">
          <Lock size={48} className="mx-auto text-emerald-400 mb-4"/>
          <h1 className="text-3xl font-bold">Secure Access</h1>
          <p className="text-slate-400 mt-2">Zero-knowledge architecture via PBKDF2</p>
        </div>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded mb-6 text-sm">{error}</div>}

        <form className="flex flex-col gap-4">
          <input placeholder="Username" value={authData.username} onChange={e => setAuthData({...authData, username: e.target.value})} className="p-3 bg-slate-900 rounded border border-slate-700 focus:border-emerald-500 outline-none"/>
          {view === 'register' && (
            <input placeholder="Email" type="email" value={authData.email} onChange={e => setAuthData({...authData, email: e.target.value})} className="p-3 bg-slate-900 rounded border border-slate-700 focus:border-emerald-500 outline-none"/>
          )}
          <input type="password" placeholder="Master Password" value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} className="p-3 bg-slate-900 rounded border border-slate-700 focus:border-emerald-500 outline-none"/>
          
          <div className="grid grid-cols-2 gap-4 mt-2">
            <button onClick={e => authSubmit(e, 'login')} className={`${view === 'login' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-700 hover:bg-slate-600'} p-3 rounded font-bold transition-colors`}>Login</button>
            <button onClick={e => authSubmit(e, 'register')} className={`${view === 'register' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-slate-700 hover:bg-slate-600'} p-3 rounded font-bold transition-colors`}>Register</button>
          </div>
        </form>
        
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Protected by AES-256-GCM and RSA-2048-OAEP</p>
        </div>
      </div>
    </div>
  );
}