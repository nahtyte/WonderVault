import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Lock, Clock3, TrendingUp, Shield } from 'lucide-react';

type SecurityDashboardProps = {
  stats: {
    total: number;
    weak: number;
    reused: number;
    strong: number;
    score: number;
  };
  activity: { id: string; title: string; description: string; variant: 'success' | 'warning' | 'info' | 'neutral' }[];
};

const statCards = [
  { key: 'total', label: 'Total Stored', accent: 'bg-slate-900/80', icon: Shield },
  { key: 'weak', label: 'Weak Passwords', accent: 'bg-rose-500/10', icon: ShieldAlert },
  { key: 'reused', label: 'Reused Passwords', accent: 'bg-amber-500/10', icon: TrendingUp },
  { key: 'strong', label: 'Strong Passwords', accent: 'bg-emerald-500/10', icon: ShieldCheck },
] as const;

const mapVariant = {
  success: 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300',
  warning: 'border-amber-400/20 bg-amber-500/10 text-amber-300',
  info: 'border-sky-400/20 bg-sky-500/10 text-sky-300',
  neutral: 'border-slate-500/20 bg-slate-800/80 text-slate-300',
};

export default function SecurityDashboard({ stats, activity }: SecurityDashboardProps) {
  const scoreColor = stats.score >= 90 ? 'from-emerald-400 via-emerald-400 to-slate-800' : stats.score >= 70 ? 'from-sky-500 via-sky-500 to-slate-800' : 'from-amber-400 via-amber-400 to-slate-800';

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="glass-panel rounded-[2rem] border border-slate-800 p-8 shadow-[0_32px_80px_rgba(0,0,0,0.24)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Security Dashboard</p>
              <h1 className="mt-3 text-3xl font-semibold text-slate-100">Real-time analysis of your vault’s security posture</h1>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">Refresh</div>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-inner shadow-slate-950/20">
              <div className="flex items-center gap-4 text-slate-300">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sky-300 shadow-[0_18px_50px_rgba(59,130,246,0.18)]">
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Vault Encryption Active</p>
                  <p className="mt-2 text-sm text-slate-400">AES-256-GCM · RSA-2048-OAEP</p>
                  <p className="mt-1 text-xs text-slate-500">KDF: PBKDF2-SHA256 (100,000 iterations)</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-inner shadow-slate-950/20">
              <div className="flex items-center gap-4 text-slate-300">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sky-300 shadow-[0_18px_50px_rgba(59,130,246,0.18)]">
                  <Clock3 size={18} />
                </span>
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Last Successful Login</p>
                  <p className="mt-2 text-sm text-slate-400">14/05/2569 21:11:11</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-[2rem] border border-slate-800 p-8 shadow-[0_32px_80px_rgba(0,0,0,0.24)]">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-8 text-center shadow-inner shadow-slate-950/20">
              <div className={`mx-auto mb-6 h-40 w-40 rounded-full bg-gradient-to-b ${scoreColor} p-1`}>
                <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950/95 text-center text-slate-50 shadow-[0_16px_48px_rgba(0,0,0,0.35)]">
                  <div>
                    <p className="text-4xl font-semibold">{stats.score}</p>
                    <p className="text-sm uppercase tracking-[0.28em] text-slate-400">/ 100</p>
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500">Excellent</p>
              <p className="mt-3 text-sm text-slate-400">Vault Security Score</p>
            </div>

            <div className="grid gap-4">
              {statCards.map((card) => {
                const Icon = card.icon;
                const value = stats[card.key];
                return (
                  <div key={card.key} className={`rounded-3xl border border-slate-800 ${card.accent} p-5 shadow-inner shadow-slate-950/20`}>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.28em] text-slate-500">{card.label}</p>
                        <p className="mt-3 text-3xl font-semibold text-slate-100">{value}</p>
                      </div>
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sky-300">
                        <Icon size={18} />
                      </span>
                    </div>
                    <p className="mt-4 text-sm text-slate-400">{card.key === 'strong' ? 'Best practices' : card.key === 'weak' ? 'Immediate risk' : card.key === 'reused' ? 'Stuffing risk' : 'Encrypted credentials'}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-[2rem] border border-slate-800 p-8 shadow-[0_32px_80px_rgba(0,0,0,0.24)]">
        <div className="mb-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Recent Vault Activity</p>
            <p className="mt-2 text-sm text-slate-400">Your most recent authenticated actions and vault events.</p>
          </div>
        </div>

        <div className="space-y-4">
          {activity.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.16 }}
              className={`rounded-3xl border ${mapVariant[item.variant]} p-5`}
            >
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold text-slate-100">{item.title}</p>
                <span className="rounded-full bg-slate-900/70 px-3 py-1 text-xs text-slate-300">{item.variant.toUpperCase()}</span>
              </div>
              <p className="mt-2 text-sm text-slate-400">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
