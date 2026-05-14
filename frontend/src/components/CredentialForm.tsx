import { useMemo, useState, type FormEvent } from 'react';
import { Globe, User, Key, FileText, Sparkles } from 'lucide-react';

type CredentialPayload = {
  website: string;
  username: string;
  password: string;
  notes: string;
};

type CredentialFormProps = {
  onSave: (payload: CredentialPayload) => void;
  onCancel: () => void;
};

const getPasswordStrength = (password: string) => {
  if (!password) {
    return { label: 'Empty', color: 'text-slate-500' };
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  if (password.length >= 12 && hasUpper && hasLower && hasNumber && hasSymbol) {
    return { label: 'Strong', color: 'text-emerald-400' };
  }

  if (password.length >= 8 && ((hasUpper && hasLower && hasNumber) || (hasLower && hasNumber && hasSymbol))) {
    return { label: 'Medium', color: 'text-amber-400' };
  }

  return { label: 'Weak', color: 'text-rose-400' };
};

const generateStrongPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+[]{}|;:,.<>?';
  return Array.from({ length: 20 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export default function CredentialForm({ onSave, onCancel }: CredentialFormProps) {
  const [payload, setPayload] = useState<CredentialPayload>({ website: '', username: '', password: '', notes: '' });

  const strength = useMemo(() => getPasswordStrength(payload.password), [payload.password]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(payload);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Encrypt & Store</p>
        <h2 className="text-3xl font-semibold text-slate-100">Encrypt & Store New Credential</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="group relative block rounded-3xl border border-slate-800 bg-slate-950/80 p-4 transition hover:border-sky-500">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
              <Globe size={14} /> Website / App
            </div>
            <input
              value={payload.website}
              onChange={(event) => setPayload({ ...payload, website: event.target.value })}
              placeholder="e.g. github.com"
              className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
            />
          </label>

          <label className="group relative block rounded-3xl border border-slate-800 bg-slate-950/80 p-4 transition hover:border-sky-500">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
              <User size={14} /> Username / Email
            </div>
            <input
              value={payload.username}
              onChange={(event) => setPayload({ ...payload, username: event.target.value })}
              placeholder="your@email.com"
              className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
            />
          </label>
        </div>

        <label className="group relative block rounded-3xl border border-slate-800 bg-slate-950/80 p-4 transition hover:border-sky-500">
          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-500">
            <span className="flex items-center gap-2">
              <Key size={14} /> Password
            </span>
            <button
              type="button"
              onClick={() => setPayload({ ...payload, password: generateStrongPassword() })}
              className="text-sm font-semibold text-sky-400 transition hover:text-sky-300"
            >
              Generate Strong
            </button>
          </div>
          <input
            type="password"
            value={payload.password}
            onChange={(event) => setPayload({ ...payload, password: event.target.value })}
            placeholder="Enter or generate a password"
            className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
          />
          <div className="mt-3 flex items-center justify-between text-sm text-slate-400">
            <span className={`font-semibold ${strength.color}`}>Strength: {strength.label}</span>
            <div className="flex w-full items-center gap-2">
              <span className={`h-1 flex-1 rounded-full ${strength.label === 'Strong' ? 'bg-emerald-400' : strength.label === 'Medium' ? 'bg-amber-400' : 'bg-rose-400'}`} />
              <span className={`h-1 flex-1 rounded-full ${strength.label !== 'Weak' ? (strength.label === 'Strong' ? 'bg-emerald-400' : 'bg-slate-700') : 'bg-slate-700'}`} />
              <span className={`h-1 flex-1 rounded-full ${strength.label === 'Strong' ? 'bg-emerald-400' : 'bg-slate-700'}`} />
            </div>
          </div>
        </label>

        <label className="group relative block rounded-3xl border border-slate-800 bg-slate-950/80 p-4 transition hover:border-sky-500">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-500">
            <FileText size={14} /> Secure Notes (Optional)
          </div>
          <textarea
            value={payload.notes}
            onChange={(event) => setPayload({ ...payload, notes: event.target.value })}
            placeholder="Add reminder notes for this entry"
            rows={4}
            className="min-h-[120px] w-full resize-none bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
          />
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-3xl border border-slate-800 bg-slate-900/80 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:border-slate-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-3xl bg-sky-600 px-7 py-3 text-sm font-semibold text-white shadow-[0_18px_48px_rgba(59,130,246,0.28)] transition hover:bg-sky-500"
          >
            <Sparkles size={16} /> AES-GCM Encrypt & Save
          </button>
        </div>
      </form>
    </div>
  );
}

export type { CredentialPayload };
