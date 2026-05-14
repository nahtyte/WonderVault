import { motion } from 'framer-motion';
import { Shield, Moon, Sun, LogOut } from 'lucide-react';

type NavBarProps = {
  activeTab: 'vault' | 'security';
  onChange: (tab: 'vault' | 'security') => void;
  darkMode: boolean;
  onToggleTheme: () => void;
  user?: { username: string; email?: string } | null;
  onLogout?: () => void;
};

const tabs = [
  { id: 'vault', label: 'Vault' },
  { id: 'security', label: 'Security' },
];

export default function NavBar({ activeTab, onChange, darkMode, onToggleTheme, user, onLogout }: NavBarProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-[0_35px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900/70 px-4 py-3 shadow-inner shadow-slate-950/20">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-800 text-sky-400 shadow-[0_8px_24px_rgba(59,130,246,0.18)]">
            <Shield size={20} />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">SecureVault</p>
            <p className="text-sm text-slate-300">AES-256-GCM · PBKDF2 · RSA-2048</p>
          </div>
        </div>

        <nav className="relative inline-flex overflow-hidden rounded-full border border-slate-800 bg-slate-900/70 p-1 shadow-inner shadow-slate-950/30">
          {tabs.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id as 'vault' | 'security')}
                className="relative z-10 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-slate-700"
                    transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                  />
                )}
                <span className={`relative ${active ? 'text-slate-100' : 'text-slate-400 hover:text-slate-200'}`}>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3 self-start sm:self-auto">
        {user && (
          <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-slate-100">{user.username}</p>
              {user.email && <p className="text-xs text-slate-400">{user.email}</p>}
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={onToggleTheme}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70 text-slate-200 transition hover:border-sky-500 hover:text-white"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        {user && onLogout && (
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-200 transition hover:border-red-500 hover:text-red-400"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        )}
      </div>
    </header>
  );
}
