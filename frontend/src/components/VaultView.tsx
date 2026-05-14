import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Shield, Plus, Eye, EyeOff, Trash2 } from 'lucide-react';
import CredentialForm, { CredentialPayload } from './CredentialForm';
import type { Credential } from '../App';

type VaultViewProps = {
  credentials: Credential[];
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onOpenForm: () => void;
  showForm: boolean;
  onCloseForm: () => void;
  onSaveCredential: (payload: CredentialPayload) => void;
  onDeleteCredential: (id: string) => void;
};

export default function VaultView({
  credentials,
  searchTerm,
  onSearchTermChange,
  onOpenForm,
  showForm,
  onCloseForm,
  onSaveCredential,
  onDeleteCredential,
}: VaultViewProps) {
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());

  const togglePasswordVisibility = (credentialId: string) => {
    setVisiblePasswords((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(credentialId)) {
        newSet.delete(credentialId);
      } else {
        newSet.add(credentialId);
      }
      return newSet;
    });
  };
  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-[2rem] border border-slate-800 p-6 shadow-[0_32px_80px_rgba(0,0,0,0.24)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Vault</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-100">Search or add your next credential</h2>
          </div>
          <button
            type="button"
            onClick={onOpenForm}
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_48px_rgba(59,130,246,0.32)] transition hover:bg-sky-500"
          >
            <Plus size={18} />
            New Credential
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
          <label className="relative block overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 px-4 py-3 shadow-inner shadow-slate-950/20">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              placeholder="Search vault..."
              className="w-full bg-transparent pl-11 text-slate-100 outline-none placeholder:text-slate-500"
            />
          </label>
          <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 shadow-inner shadow-slate-950/20">
            <div className="flex items-center gap-3 text-slate-300">
              <Shield size={18} className="text-sky-400" />
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Vault protection</p>
                <p className="text-sm text-slate-400">AES-256-GCM encryption active</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-30 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="w-full max-w-3xl rounded-[2rem] border border-slate-800 bg-slate-950/95 p-6 shadow-[0_40px_100px_rgba(0,0,0,0.35)]"
            >
              <CredentialForm onCancel={onCloseForm} onSave={onSaveCredential} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {credentials.length === 0 ? (
        <div className="glass-panel rounded-[2rem] border border-slate-800 p-10 text-center shadow-[0_32px_80px_rgba(0,0,0,0.24)]">
          <div className="mx-auto flex max-w-lg flex-col items-center gap-4 text-center text-slate-400">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-slate-800 bg-slate-900/80 text-sky-400 shadow-[0_20px_60px_rgba(59,130,246,0.16)]">
              <Shield size={30} />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-slate-100">Vault is empty</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">Click "New Credential" to securely store your first password and protect it with high-grade encryption.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-[2rem] border border-slate-800 p-4 shadow-[0_32px_80px_rgba(0,0,0,0.24)]">
          <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950/90">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b border-slate-800 bg-slate-900/80 px-5 py-4 text-xs uppercase tracking-[0.28em] text-slate-500">
              <span>Website / App</span>
              <span>Username</span>
              <span>Password</span>
              <span>Strength</span>
              <span className="text-right">Action</span>
            </div>
            <div className="divide-y divide-slate-800">
              {credentials.map((item) => {
                const isPasswordVisible = visiblePasswords.has(item.id);
                return (
                  <div key={item.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-5 text-sm text-slate-200 sm:px-6 items-center">
                    <div>
                      <p className="font-semibold text-slate-100">{item.website}</p>
                      <p className="mt-1 text-slate-400">{item.notes || 'No notes added'}</p>
                    </div>
                    <div className="text-slate-300">{item.username}</div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400">
                        {isPasswordVisible ? item.password : '•'.repeat(Math.min(item.password.length, 16))}
                      </span>
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(item.id)}
                        className="inline-flex items-center justify-center rounded p-1 text-slate-400 hover:text-slate-200 transition"
                        title={isPasswordVisible ? 'Hide password' : 'Show password'}
                      >
                        {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div className="text-center">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${item.strength === 'strong' ? 'bg-emerald-500/15 text-emerald-300' : item.strength === 'medium' ? 'bg-amber-500/15 text-amber-300' : 'bg-rose-500/15 text-rose-300'}`}>
                        {item.strength.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => onDeleteCredential(item.id)}
                        className="inline-flex items-center justify-center rounded p-1 text-slate-400 hover:text-red-400 transition"
                        title="Delete credential"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
